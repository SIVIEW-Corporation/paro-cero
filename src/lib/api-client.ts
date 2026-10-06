import { useAuthStore } from '@/store/auth-store';
import { ensureValidToken } from '@/lib/token-refresh';

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

/**
 * Auth endpoints that should NOT trigger token refresh on 401.
 * Prevents infinite loops when login/refresh/logout themselves fail.
 */
const AUTH_ENDPOINTS = ['/auth/login', '/auth/refresh', '/auth/logout'];

function isAuthEndpoint(endpoint: string): boolean {
  return AUTH_ENDPOINTS.some((authEndpoint) => endpoint.includes(authEndpoint));
}

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
  options: ApiClientOptions,
): Promise<Response> {
  const {
    timeout = DEFAULT_TIMEOUT,
    retries = DEFAULT_RETRIES,
    retryDelay = DEFAULT_RETRY_DELAY,
    ...fetchOptions
  } = options;

  // These are client-only controls, not native RequestInit options.
  delete fetchOptions.authToken;
  delete fetchOptions.isRequestCurrent;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      lastError = error as Error;

      if (attempt < retries) {
        await new Promise((resolve) =>
          setTimeout(resolve, retryDelay * (attempt + 1)),
        );
      }
    }
  }

  clearTimeout(timeoutId);
  throw lastError;
}

export interface ApiClientOptions extends FetchOptions {
  authToken?: string;
  /** Opt-in guard for identity-scoped requests, including auth retries. */
  isRequestCurrent?: () => boolean;
}

/**
 * Builds headers with Authorization header from Zustand store.
 * Since httpOnly cookies can't be read client-side, we inject the
 * token from the persisted Zustand store.
 */
function buildHeaders(options: ApiClientOptions): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Priority 1: Explicitly provided token
  if (options.authToken) {
    headers['Authorization'] = `Bearer ${options.authToken}`;
  } else {
    // Priority 2: Read from Zustand store (persisted to localStorage)
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
  }

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

/**
 * Retries the original request with the new access token.
 */
async function retryRequest<T = unknown>(
  endpoint: string,
  originalOptions: ApiClientOptions,
  newToken: string,
): Promise<ApiResponse<T>> {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

  if (originalOptions.isRequestCurrent && !originalOptions.isRequestCurrent())
    return sessionChanged<T>();

  const headers = buildHeaders({
    ...originalOptions,
    authToken: newToken, // Override with fresh token
  });

  const response = await fetchWithTimeout(`${baseUrl}${endpoint}`, {
    ...originalOptions,
    headers,
  });

  if (originalOptions.isRequestCurrent && !originalOptions.isRequestCurrent())
    return sessionChanged<T>();
  const data = await response.json().catch(() => null);
  if (originalOptions.isRequestCurrent && !originalOptions.isRequestCurrent())
    return sessionChanged<T>();

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: responseError(data, response.status),
    };
  }

  return {
    ok: true,
    status: response.status,
    data: data as T,
  };
}

export async function apiClient<T = unknown>(
  endpoint: string,
  options: ApiClientOptions = {},
): Promise<ApiResponse<T>> {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

  if (options.isRequestCurrent && !options.isRequestCurrent())
    return sessionChanged<T>();
  const headers = buildHeaders(options);

  try {
    const response = await fetchWithTimeout(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (options.isRequestCurrent && !options.isRequestCurrent())
      return sessionChanged<T>();

    // 401 interceptor with token refresh
    if (response.status === 401) {
      // Skip auth endpoints to prevent infinite loops
      if (isAuthEndpoint(endpoint)) {
        return {
          ok: false,
          status: 401,
          error: { message: 'Unauthorized', status: 401 },
        };
      }

      // Attempt token refresh
      try {
        const newToken = await ensureValidToken();

        if (options.isRequestCurrent && !options.isRequestCurrent())
          return sessionChanged<T>();

        // Retry the original request with the new token
        return await retryRequest<T>(endpoint, options, newToken);
      } catch {
        // Refresh failed — redirect handled in token-refresh module
        return {
          ok: false,
          status: 401,
          error: { message: 'Unauthorized — session expired', status: 401 },
        };
      }
    }

    const data = await response.json().catch(() => null);
    if (options.isRequestCurrent && !options.isRequestCurrent())
      return sessionChanged<T>();

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: responseError(data, response.status),
      };
    }

    return {
      ok: true,
      status: response.status,
      data: data as T,
    };
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
