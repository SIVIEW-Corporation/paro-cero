import { NextResponse, type NextRequest } from 'next/server';
import {
  SESSION_EXPIRED_HEADER,
  SESSION_RETRY_HEADER,
} from '@/lib/auth/bff-protocol';
import { siteUrl } from './config';
import {
  clearSessionCookies,
  readAuthCookies,
  setSessionCookies,
} from './cookies';
import { refreshSession } from './refresh';
import {
  allowedOriginsFor,
  checkCsrf,
  resolveClientIp,
} from './request-guards';
import {
  SESSION_FLOW,
  runWithSession,
  type SessionFlowResult,
} from './session-flow';

/** Shared helpers for the `/api/auth/*` and `/api/backend/*` route handlers. */

const NO_STORE = 'no-store';
const TRANSIENT_RETRY_AFTER_SECONDS = '2';

export const SESSION_MESSAGES = {
  EXPIRED: 'Tu sesión ha expirado. Inicia sesión nuevamente.',
  RENEWING: 'Tu sesión se está renovando. Intenta de nuevo en un momento.',
  UNAVAILABLE:
    'No pudimos validar tu sesión en este momento. Intenta de nuevo en unos segundos.',
  BACKEND_UNREACHABLE:
    'No pudimos conectar con el servidor. Intenta más tarde.',
} as const;

export function jsonError(
  status: number,
  detail: string,
  headers: HeadersInit = {},
): NextResponse {
  const response = NextResponse.json({ detail }, { status, headers });
  response.headers.set('Cache-Control', NO_STORE);
  return response;
}

/** CSRF + custom-header + content-type checks. Returns an error response or null. */
export function guardRequest(
  request: NextRequest,
  hasBody: boolean,
): NextResponse | null {
  const result = checkCsrf({
    method: request.method,
    headers: request.headers,
    allowedOrigins: allowedOriginsFor(request.url, request.headers, siteUrl()),
    hasBody,
  });
  return result.ok ? null : jsonError(result.status, result.message);
}

export function clientIpOf(request: NextRequest): string {
  return resolveClientIp(request.headers);
}

export interface RequestSession {
  result: SessionFlowResult;
  remember: boolean;
}

/** Runs `call` with a usable access token, refreshing via the cookies if needed. */
export async function runRequestWithSession(
  request: NextRequest,
  call: (accessToken: string) => Promise<Response>,
): Promise<RequestSession> {
  const { accessToken, refreshToken, remember } = readAuthCookies(
    request.cookies,
  );
  const clientIp = clientIpOf(request);
  const result = await runWithSession({
    accessToken,
    refreshToken,
    nowMs: Date.now(),
    refresh: (token) => refreshSession(token, clientIp),
    call,
  });
  return { result, remember };
}

/**
 * Converts a session flow result into the BFF response contract:
 * - response → `build(response)` plus rotated cookies when the flow refreshed;
 * - conflict → 409 + `X-Session-Retry: 1` (cookies untouched);
 * - expired → 401 + `X-Session-Expired: 1` and cleared cookies;
 * - transient → 503 + `Retry-After` (cookies untouched).
 */
export async function finalizeSession(
  { result, remember }: RequestSession,
  build: (response: Response) => NextResponse | Promise<NextResponse>,
): Promise<NextResponse> {
  switch (result.kind) {
    case SESSION_FLOW.RESPONSE: {
      const response = await build(result.response);
      if (result.tokens)
        setSessionCookies(response.cookies, result.tokens, remember);
      response.headers.set('Cache-Control', NO_STORE);
      return response;
    }
    case SESSION_FLOW.CONFLICT:
      return jsonError(409, SESSION_MESSAGES.RENEWING, {
        [SESSION_RETRY_HEADER]: '1',
      });
    case SESSION_FLOW.EXPIRED: {
      const response = jsonError(401, SESSION_MESSAGES.EXPIRED, {
        [SESSION_EXPIRED_HEADER]: '1',
      });
      clearSessionCookies(response.cookies);
      return response;
    }
    case SESSION_FLOW.TRANSIENT:
      return jsonError(503, SESSION_MESSAGES.UNAVAILABLE, {
        'Retry-After': TRANSIENT_RETRY_AFTER_SECONDS,
      });
  }
}

/** Reads a backend error `detail` (string or FastAPI list) for pass-through. */
export async function backendDetail(
  response: Response,
  fallback: string,
): Promise<unknown> {
  const body: unknown = await response.json().catch(() => null);
  if (typeof body === 'object' && body !== null && 'detail' in body)
    return (body as { detail: unknown }).detail;
  return fallback;
}
