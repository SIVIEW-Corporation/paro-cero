import { NextResponse, type NextRequest } from 'next/server';
import { BACKEND_AUTH_ENDPOINT, backendAuthPost } from '@/server/auth/backend';
import { clearSessionCookies } from '@/server/auth/cookies';
import {
  SESSION_MESSAGES,
  backendDetail,
  clientIpOf,
  finalizeSession,
  guardRequest,
  jsonError,
  runRequestWithSession,
} from '@/server/auth/http';

/** Revokes every session of the user (needs a valid access token). */
export async function POST(request: NextRequest) {
  const raw = await request.text();
  const blocked = guardRequest(request, raw.length > 0);
  if (blocked) return blocked;

  const clientIp = clientIpOf(request);
  try {
    const session = await runRequestWithSession(request, (accessToken) =>
      backendAuthPost(BACKEND_AUTH_ENDPOINT.LOGOUT_ALL, undefined, clientIp, {
        Authorization: `Bearer ${accessToken}`,
      }),
    );
    return await finalizeSession(session, async (backend) => {
      if (!backend.ok) {
        const detail = await backendDetail(
          backend,
          SESSION_MESSAGES.UNAVAILABLE,
        );
        return NextResponse.json({ detail }, { status: backend.status });
      }
      await backend.body?.cancel();
      return new NextResponse(null, { status: 204 });
    }).then((response) => {
      // Cleared after finalizeSession so rotated cookies are never re-set.
      if (response.status === 204) clearSessionCookies(response.cookies);
      return response;
    });
  } catch {
    return jsonError(502, SESSION_MESSAGES.BACKEND_UNREACHABLE);
  }
}
