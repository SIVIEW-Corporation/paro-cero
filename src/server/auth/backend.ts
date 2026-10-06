import { apiBaseUrl, bffSharedSecret } from './config';
import { buildBackendUrl, normalizeApiBase } from './request-guards';

/** Server → backend transport. Adds the BFF headers to every call. */

const DEFAULT_TIMEOUT_MS = 30_000;
export const AUTH_TIMEOUT_MS = 10_000;

export const BFF_SECRET_HEADER = 'X-BFF-Secret';
export const CLIENT_IP_HEADER = 'X-Client-IP';

export const BACKEND_AUTH_ENDPOINT = {
  LOGIN: 'login',
  REFRESH: 'refresh',
  LOGOUT: 'logout',
  LOGOUT_ALL: 'logout-all',
} as const;

export type BackendAuthEndpoint =
  (typeof BACKEND_AUTH_ENDPOINT)[keyof typeof BACKEND_AUTH_ENDPOINT];

/** `${API_URL}/api/v1/<segments>` with an optional `?query`. */
export function backendUrl(segments: readonly string[], search = ''): string {
  return buildBackendUrl(apiBaseUrl(), segments, search);
}

export function backendAuthUrl(endpoint: BackendAuthEndpoint): string {
  return backendUrl(['auth', endpoint]);
}

export interface BackendFetchInit extends Omit<RequestInit, 'headers'> {
  headers?: HeadersInit;
  clientIp: string;
  timeoutMs?: number;
}

/**
 * Fetches the backend with `X-BFF-Secret` and `X-Client-IP`. Redirects are
 * followed only while they stay on the API origin.
 */
export async function backendFetch(
  url: string,
  {
    clientIp,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    headers,
    ...init
  }: BackendFetchInit,
): Promise<Response> {
  const outgoing = new Headers(headers);
  const secret = bffSharedSecret();
  if (secret) outgoing.set(BFF_SECRET_HEADER, secret);
  outgoing.set(CLIENT_IP_HEADER, clientIp);

  const response = await fetch(url, {
    ...init,
    headers: outgoing,
    cache: 'no-store',
    redirect: 'follow',
    signal: AbortSignal.timeout(timeoutMs),
  });

  const apiOrigin = new URL(normalizeApiBase(apiBaseUrl())).origin;
  if (response.url && new URL(response.url).origin !== apiOrigin) {
    await response.body?.cancel();
    throw new Error('Backend redirected outside the API origin');
  }
  return response;
}

/** JSON POST to a backend auth endpoint. */
export function backendAuthPost(
  endpoint: BackendAuthEndpoint,
  body: unknown,
  clientIp: string,
  extraHeaders: HeadersInit = {},
): Promise<Response> {
  const headers = new Headers(extraHeaders);
  headers.set('Content-Type', 'application/json');
  headers.set('Accept', 'application/json');
  return backendFetch(backendAuthUrl(endpoint), {
    method: 'POST',
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    clientIp,
    timeoutMs: AUTH_TIMEOUT_MS,
  });
}
