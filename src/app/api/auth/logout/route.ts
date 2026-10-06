import { NextResponse, type NextRequest } from 'next/server';
import { BACKEND_AUTH_ENDPOINT, backendAuthPost } from '@/server/auth/backend';
import { clearSessionCookies, readAuthCookies } from '@/server/auth/cookies';
import { clientIpOf, guardRequest } from '@/server/auth/http';

/** Revokes the refresh token (best effort) and always clears the cookies. */
export async function POST(request: NextRequest) {
  const raw = await request.text();
  const blocked = guardRequest(request, raw.length > 0);
  if (blocked) return blocked;

  const { refreshToken } = readAuthCookies(request.cookies);
  if (refreshToken) {
    try {
      const backend = await backendAuthPost(
        BACKEND_AUTH_ENDPOINT.LOGOUT,
        { refresh_token: refreshToken },
        clientIpOf(request),
      );
      await backend.body?.cancel();
    } catch {
      // Logout is idempotent and local cookies are cleared regardless.
    }
  }

  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Cache-Control', 'no-store');
  clearSessionCookies(response.cookies);
  return response;
}
