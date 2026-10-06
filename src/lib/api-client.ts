import {
  BFF_ACTION,
  BFF_AUTH_PREFIX,
  BFF_BACKEND_PREFIX,
  REQUESTED_WITH_HEADER,
  REQUESTED_WITH_VALUE,
  classifyBffResponse,
} from '@/lib/auth/bff-protocol';
import { notifySessionExpired } from '@/lib/auth/session-events';

/**
 * Browser HTTP client for the same-origin BFF. Requests go to
 * `/api/backend/<endpoint>`; the BFF attaches the httpOnly session, refreshes
 * it and answers with the session protocol in `bff-protocol.ts`. This client
 * never reads, stores or sends tokens.
 */

/** One FastAPI/Pydantic validation issue from a `422` `detail` list. */
export interface ApiValidationIssue {
  loc: (string | number)[];
  msg: string;
  type: string;
  ctx?: Record<string, unknown>;
}

/** Validation messages keyed by the last `loc` segment of `body` issues. */
export type ApiFieldErrors = Record<string, string[]>;

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  /** Present only when the backend returned a validation `detail` list. */
  fieldErrors?: ApiFieldErrors;
  /** Raw validation issues (any `loc`), present alongside `fieldErrors`. */
  validationErrors?: ApiValidationIssue[];
}

export interface ApiValidationError extends ApiError {
  fieldErrors: ApiFieldErrors;
  validationErrors: ApiValidationIssue[];
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: ApiError;
  ok: boolean;
  status: number;
}

interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

const DEFAULT_TIMEOUT = 30000;
const DEFAULT_RETRIES = 0;
const DEFAULT_RETRY_DELAY = 1000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function responseErrorMessage(data: unknown, status: number): string {
  if (!isRecord(data)) return `Error ${status}`;

  const detail = data.detail;
  if (typeof detail === 'string' && detail.length > 0) return detail;

  if (Array.isArray(detail)) {
    const messages = detail
      .filter(isRecord)
      .map((item) => item.msg)
      .filter((message): message is string => typeof message === 'string');
    if (messages.length > 0) return messages.join('; ');
  }

  if (typeof data.message === 'string' && data.message.length > 0) {
    return data.message;
  }

  return `Error ${status}`;
}

function toValidationIssue(item: unknown): ApiValidationIssue | null {
  if (!isRecord(item) || typeof item.msg !== 'string') return null;
  const loc = Array.isArray(item.loc)
    ? item.loc.filter(
        (segment): segment is string | number =>
          typeof segment === 'string' || typeof segment === 'number',
      )
    : [];
  return {
    loc,
    msg: item.msg,
    type: typeof item.type === 'string' ? item.type : '',
    ...(isRecord(item.ctx) ? { ctx: item.ctx } : {}),
  };
}

/** Adds structured validation errors when `detail` is a FastAPI issue list. */
function validationErrorFields(
  data: unknown,
): Pick<ApiError, 'fieldErrors' | 'validationErrors'> {
  if (!isRecord(data) || !Array.isArray(data.detail)) return {};

  const validationErrors = data.detail
    .map(toValidationIssue)
    .filter((issue): issue is ApiValidationIssue => issue !== null);
  if (validationErrors.length === 0) return {};

  const fieldErrors: ApiFieldErrors = {};
  for (const issue of validationErrors) {
    if (issue.loc[0] !== 'body' || issue.loc.length < 2) continue;
    const field = String(issue.loc[issue.loc.length - 1]);
    (fieldErrors[field] ??= []).push(issue.msg);
  }
  return { fieldErrors, validationErrors };
}

function responseError(data: unknown, status: number): ApiError {
  return {
    message: responseErrorMessage(data, status),
    code:
      isRecord(data) && typeof data.code === 'string' ? data.code : undefined,
    status,
    ...validationErrorFields(data),
  };
}

/** True when the error carries structured FastAPI validation errors. */
export function hasApiFieldErrors(
  error: ApiError | null | undefined,
): error is ApiValidationError {
  return Boolean(error?.fieldErrors && error.validationErrors);
}

/** Field errors keyed by body field name; `{}` when there are none. */
export function getApiFieldErrors(
  error: ApiError | null | undefined,
): ApiFieldErrors {
  return hasApiFieldErrors(error) ? error.fieldErrors : {};
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit & FetchOptions,
): Promise<Response> {
  const {
    timeout = DEFAULT_TIMEOUT,
    retries = DEFAULT_RETRIES,
    retryDelay = DEFAULT_RETRY_DELAY,
    ...fetchOptions
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    try {
      return await fetch(url, { ...fetchOptions, signal: controller.signal });
    } catch (error) {
      lastError = error as Error;
      if (attempt < retries) {
        await new Promise((resolve) =>
          setTimeout(resolve, retryDelay * (attempt + 1)),
        );
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw lastError;
}

export interface ApiClientOptions extends FetchOptions {
  /** Opt-in guard for identity-scoped requests, including session retries. */
  isRequestCurrent?: () => boolean;
}

function buildHeaders(options: ApiClientOptions): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
    [REQUESTED_WITH_HEADER]: REQUESTED_WITH_VALUE,
  };
  if (options.body !== undefined && options.body !== null)
    headers['Content-Type'] ??= 'application/json';
  return headers;
}

function sessionChanged<T>(): ApiResponse<T> {
  return {
    ok: false,
    status: 0,
    error: {
      message: 'La sesión cambió. Vuelve a abrir el activo.',
      code: 'SESSION_CHANGED',
    },
  };
}

const SESSION_ERROR = {
  EXPIRED: 'Tu sesión ha expirado. Inicia sesión nuevamente.',
  BUSY: 'Tu sesión se está renovando. Intenta de nuevo en un momento.',
  UNAVAILABLE:
    'No pudimos validar tu sesión en este momento. Intenta de nuevo en unos segundos.',
} as const;

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function withPrefix(prefix: string, endpoint: string): string {
  return `${prefix}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
}

interface RequestBehavior {
  /** Fire the central session-expired handler on `401 + X-Session-Expired`. */
  notifyExpired: boolean;
}

async function bffRequest<T>(
  url: string,
  options: ApiClientOptions,
  { notifyExpired }: RequestBehavior,
): Promise<ApiResponse<T>> {
  const { isRequestCurrent, ...requestOptions } = options;
  const isStale = () => Boolean(isRequestCurrent && !isRequestCurrent());

  if (isStale()) return sessionChanged<T>();
  const headers = buildHeaders(requestOptions);

  try {
    for (let attempt = 0; ; attempt++) {
      const response = await fetchWithTimeout(url, {
        ...requestOptions,
        headers,
        credentials: 'same-origin',
      });
      if (isStale()) return sessionChanged<T>();

      const action = classifyBffResponse(
        response.status,
        response.headers,
        attempt,
      );
      if (action.type === BFF_ACTION.RETRY) {
        await wait(action.delayMs);
        if (isStale()) return sessionChanged<T>();
        continue;
      }

      const data = await response.json().catch(() => null);
      if (isStale()) return sessionChanged<T>();

      if (action.type === BFF_ACTION.EXPIRED) {
        if (notifyExpired) notifySessionExpired();
        return {
          ok: false,
          status: 401,
          error: {
            message: SESSION_ERROR.EXPIRED,
            code: 'SESSION_EXPIRED',
            status: 401,
          },
        };
      }

      if (action.type === BFF_ACTION.TRANSIENT) {
        const busy = response.status === 409;
        return {
          ok: false,
          status: response.status,
          error: {
            message: busy ? SESSION_ERROR.BUSY : SESSION_ERROR.UNAVAILABLE,
            code: busy ? 'SESSION_BUSY' : 'SESSION_UNAVAILABLE',
            status: response.status,
          },
        };
      }

      if (!response.ok) {
        return {
          ok: false,
          status: response.status,
          error: responseError(data, response.status),
        };
      }

      return { ok: true, status: response.status, data: data as T };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (error instanceof Error && error.name === 'AbortError') {
      return {
        ok: false,
        status: 0,
        error: { message: 'Request timeout', code: 'TIMEOUT' },
      };
    }

    return {
      ok: false,
      status: 0,
      error: { message: `Network error: ${message}`, code: 'NETWORK_ERROR' },
    };
  }
}

/** Calls the backend through the BFF: `endpoint` is relative to `/api/v1`. */
export async function apiClient<T = unknown>(
  endpoint: string,
  options: ApiClientOptions = {},
): Promise<ApiResponse<T>> {
  return bffRequest<T>(withPrefix(BFF_BACKEND_PREFIX, endpoint), options, {
    notifyExpired: true,
  });
}

/**
 * Calls a BFF auth route (`/api/auth/<endpoint>`). Session-expired answers are
 * returned to the caller instead of triggering the global logout.
 */
export async function authRequest<T = unknown>(
  endpoint: string,
  options: ApiClientOptions = {},
): Promise<ApiResponse<T>> {
  return bffRequest<T>(withPrefix(BFF_AUTH_PREFIX, endpoint), options, {
    notifyExpired: false,
  });
}

apiClient.get = <T = unknown>(endpoint: string, options?: ApiClientOptions) =>
  apiClient<T>(endpoint, { ...options, method: 'GET' });

apiClient.post = <T = unknown>(
  endpoint: string,
  data?: unknown,
  options?: ApiClientOptions,
) =>
  apiClient<T>(endpoint, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });

apiClient.put = <T = unknown>(
  endpoint: string,
  data?: unknown,
  options?: ApiClientOptions,
) =>
  apiClient<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });

apiClient.patch = <T = unknown>(
  endpoint: string,
  data?: unknown,
  options?: ApiClientOptions,
) =>
  apiClient<T>(endpoint, {
    ...options,
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  });

apiClient.delete = <T = unknown>(
  endpoint: string,
  options?: ApiClientOptions,
) => apiClient<T>(endpoint, { ...options, method: 'DELETE' });
