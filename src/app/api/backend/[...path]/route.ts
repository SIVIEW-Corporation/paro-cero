import { NextResponse, type NextRequest } from 'next/server';
import { BFF_BACKEND_PREFIX } from '@/lib/auth/bff-protocol';
import { backendFetch, backendUrl } from '@/server/auth/backend';
import {
  SESSION_MESSAGES,
  clientIpOf,
  finalizeSession,
  guardRequest,
  jsonError,
  runRequestWithSession,
} from '@/server/auth/http';
import {
  filterRequestHeaders,
  filterResponseHeaders,
  isForwardMethod,
  sanitizeBackendPath,
} from '@/server/auth/request-guards';

/**
 * Generic authenticated forwarder: `/api/backend/<path>?<query>` →
 * `${API_URL}/api/v1/<path>?<query>` with the access cookie as Bearer token.
 * `auth/*` is blocked here; tokens only move through `/api/auth/*`.
 */

const BODYLESS_STATUSES = new Set([101, 204, 205, 304]);
// JSON payloads only (no uploads go through the backend today).
const MAX_BODY_BYTES = 1024 * 1024;

async function handle(request: NextRequest): Promise<NextResponse> {
  const method = request.method.toUpperCase();
  if (!isForwardMethod(method))
    return jsonError(405, 'Método no permitido.', {
      Allow: 'GET, POST, PUT, PATCH, DELETE',
    });

  const prefix = `${BFF_BACKEND_PREFIX}/`;
  const { pathname, search } = request.nextUrl;
  if (!pathname.startsWith(prefix))
    return jsonError(404, 'Recurso no encontrado.');
  const path = sanitizeBackendPath(pathname.slice(prefix.length));
  if (!path.ok) return jsonError(path.status, path.message);

  const declaredLength = Number(request.headers.get('content-length') ?? 0);
  if (declaredLength > MAX_BODY_BYTES)
    return jsonError(413, 'La solicitud es demasiado grande.');
  const body =
    method === 'GET' ? null : new Uint8Array(await request.arrayBuffer());
  if (body && body.byteLength > MAX_BODY_BYTES)
    return jsonError(413, 'La solicitud es demasiado grande.');
  const hasBody = Boolean(body && body.byteLength > 0);
  const blocked = guardRequest(request, hasBody);
  if (blocked) return blocked;

  const forwardHeaders = filterRequestHeaders(request.headers);
  const clientIp = clientIpOf(request);

  try {
    const target = backendUrl(path.segments, search);
    const session = await runRequestWithSession(request, (accessToken) => {
      const headers = new Headers(forwardHeaders);
      headers.set('Authorization', `Bearer ${accessToken}`);
      return backendFetch(target, {
        method,
        headers,
        body: hasBody ? body : undefined,
        clientIp,
      });
    });
    return await finalizeSession(session, (backend) => {
      const bodyless = BODYLESS_STATUSES.has(backend.status);
      return new NextResponse(bodyless ? null : backend.body, {
        status: backend.status,
        headers: filterResponseHeaders(backend.headers),
      });
    });
  } catch {
    return jsonError(502, SESSION_MESSAGES.BACKEND_UNREACHABLE);
  }
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
