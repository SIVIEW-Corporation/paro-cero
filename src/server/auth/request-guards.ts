import {
  REQUESTED_WITH_HEADER,
  REQUESTED_WITH_VALUE,
} from '@/lib/auth/bff-protocol';

/**
 * Pure request guards for the BFF route handlers: CSRF checks, the backend
 * path sanitizer (SSRF / open-proxy defence) and header filtering.
 */

export type GuardResult =
  | { ok: true }
  | { ok: false; status: number; message: string };

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export const FORWARD_METHODS = [
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
] as const;

export type ForwardMethod = (typeof FORWARD_METHODS)[number];

export function isForwardMethod(method: string): method is ForwardMethod {
  return (FORWARD_METHODS as readonly string[]).includes(method);
}

export interface CsrfInput {
  method: string;
  headers: Headers;
  allowedOrigins: readonly string[];
  hasBody: boolean;
}

function reject(status: number, message: string): GuardResult {
  return { ok: false, status, message };
}

function mediaType(contentType: string | null): string {
  return (contentType ?? '').split(';')[0].trim().toLowerCase();
}

/**
 * - Every request must carry `X-Requested-With: paro-cero` (cannot be sent
 *   cross-site without a CORS preflight, which the BFF never grants).
 * - Unsafe methods must come from an allowed Origin, or — when the browser
 *   omits Origin — from `Sec-Fetch-Site: same-origin`.
 * - A request body must be `application/json`.
 */
export function checkCsrf({
  method,
  headers,
  allowedOrigins,
  hasBody,
}: CsrfInput): GuardResult {
  if (headers.get(REQUESTED_WITH_HEADER) !== REQUESTED_WITH_VALUE)
    return reject(403, 'Solicitud no permitida.');

  if (!SAFE_METHODS.has(method.toUpperCase())) {
    const origin = headers.get('origin');
    const sameOrigin = origin
      ? allowedOrigins.includes(origin)
      : headers.get('sec-fetch-site') === 'same-origin';
    if (!sameOrigin) return reject(403, 'Solicitud no permitida.');
  }

  if (hasBody && mediaType(headers.get('content-type')) !== 'application/json')
    return reject(415, 'El cuerpo de la solicitud debe ser JSON.');

  return { ok: true };
}

function originOf(value: string | undefined | null): string | null {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

/** Origins considered "this app": request URL, forwarded host and site URL. */
export function allowedOriginsFor(
  requestUrl: string,
  headers: Headers,
  siteUrl?: string,
): string[] {
  const origins = new Set<string>();
  const fromRequest = originOf(requestUrl);
  if (fromRequest) origins.add(fromRequest);

  const host =
    headers.get('x-forwarded-host')?.split(',')[0].trim() ||
    headers.get('host')?.trim();
  if (host) {
    const proto =
      headers.get('x-forwarded-proto')?.split(',')[0].trim() ||
      (fromRequest ? new URL(fromRequest).protocol.replace(':', '') : 'https');
    const forwarded = originOf(`${proto}://${host}`);
    if (forwarded) origins.add(forwarded);
  }

  const site = originOf(siteUrl);
  if (site) origins.add(site);
  return [...origins];
}

// ─── Backend path sanitizer ─────────────────────────────────────────────────

const MAX_PATH_LENGTH = 512;
const MAX_SEGMENTS = 16;
const SEGMENT_PATTERN = /^(?:[A-Za-z0-9_~.-]|%[0-9A-Fa-f]{2})+$/;
// Encoded dot, slash, backslash, percent (double encoding) and NUL.
const FORBIDDEN_ENCODINGS = /%(?:2e|2f|5c|25|00)/i;
const BLOCKED_ROOTS = new Set(['auth']);

export type SanitizedPath =
  | { ok: true; segments: string[] }
  | { ok: false; status: number; message: string };

function invalidPath(): SanitizedPath {
  return { ok: false, status: 400, message: 'Ruta inválida.' };
}

function validSegment(raw: string): boolean {
  if (!SEGMENT_PATTERN.test(raw) || FORBIDDEN_ENCODINGS.test(raw)) return false;
  if (/^\.+$/.test(raw)) return false;
  let decoded: string;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return false;
  }
  return !/[\u0000-\u001f\u007f/\\]/.test(decoded) && !/^\.+$/.test(decoded);
}

/**
 * Validates the still-encoded path that follows `/api/backend/`. Only a
 * trailing empty segment (trailing slash) is allowed; `auth/*` is blocked so
 * tokens can only move through `/api/auth/*`.
 */
export function sanitizeBackendPath(rawPath: string): SanitizedPath {
  if (!rawPath || rawPath.length > MAX_PATH_LENGTH) return invalidPath();
  const segments = rawPath.split('/');
  if (segments.length > MAX_SEGMENTS) return invalidPath();

  for (const [index, segment] of segments.entries()) {
    const isTrailing = index === segments.length - 1 && index > 0;
    if (segment === '' && isTrailing) continue;
    if (!validSegment(segment)) return invalidPath();
  }

  if (BLOCKED_ROOTS.has(decodeURIComponent(segments[0]).toLowerCase()))
    return { ok: false, status: 404, message: 'Recurso no encontrado.' };

  return { ok: true, segments };
}

/** Normalizes API_URL: no trailing slash, no trailing `/api/v1`. */
export function normalizeApiBase(apiUrl: string): string {
  const url = new URL(apiUrl);
  const pathname = url.pathname.replace(/\/+$/, '').replace(/\/api\/v1$/, '');
  return `${url.origin}${pathname}`;
}

/** `${API_URL}/api/v1/` + sanitized segments + query, pinned to the API origin. */
export function buildBackendUrl(
  apiUrl: string,
  segments: readonly string[],
  search: string,
): string {
  const base = normalizeApiBase(apiUrl);
  const prefix = `${base}/api/v1/`;
  const query = search && search.startsWith('?') ? search : '';
  const target = `${prefix}${segments.join('/')}${query}`;

  const parsed = new URL(target);
  const expected = new URL(prefix);
  if (
    parsed.origin !== expected.origin ||
    !parsed.pathname.startsWith(expected.pathname)
  )
    throw new Error('Backend URL escaped the API base');
  return target;
}

// ─── Header filtering ───────────────────────────────────────────────────────

// Allowlists: anything else (cookie, authorization, host, x-bff-secret,
// x-client-ip, hop-by-hop, forwarding and Next.js internals) is dropped.
const FORWARD_REQUEST_HEADERS = [
  'accept',
  'accept-language',
  'content-type',
  'if-match',
  'if-none-match',
  'if-modified-since',
  'if-unmodified-since',
] as const;

const FORWARD_RESPONSE_HEADERS = [
  'cache-control',
  'content-disposition',
  'content-language',
  'content-type',
  'etag',
  'last-modified',
  'link',
  'retry-after',
  'x-total-count',
] as const;

function pick(source: Headers, names: readonly string[]): Headers {
  const result = new Headers();
  for (const name of names) {
    const value = source.get(name);
    if (value !== null) result.set(name, value);
  }
  return result;
}

export function filterRequestHeaders(incoming: Headers): Headers {
  return pick(incoming, FORWARD_REQUEST_HEADERS);
}

export function filterResponseHeaders(incoming: Headers): Headers {
  return pick(incoming, FORWARD_RESPONSE_HEADERS);
}

// ─── Client IP ──────────────────────────────────────────────────────────────

const IP_PATTERN = /^[0-9A-Fa-f:.]{2,45}$/;

function cleanIp(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed && IP_PATTERN.test(trimmed) ? trimmed : null;
}

/** Real client IP: Netlify header, else first X-Forwarded-For hop, else unknown. */
export function resolveClientIp(headers: Headers): string {
  return (
    cleanIp(headers.get('x-nf-client-connection-ip')) ??
    cleanIp(headers.get('x-forwarded-for')?.split(',')[0]) ??
    'unknown'
  );
}
