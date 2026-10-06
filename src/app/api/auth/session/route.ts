import { NextResponse, type NextRequest } from 'next/server';
import { backendFetch, backendUrl } from '@/server/auth/backend';
import {
  SESSION_MESSAGES,
  backendDetail,
  clientIpOf,
  finalizeSession,
  guardRequest,
  jsonError,
  runRequestWithSession,
} from '@/server/auth/http';

/** Current user (`GET /users/me`), refreshing the session when needed. */
export async function GET(request: NextRequest) {
  const blocked = guardRequest(request, false);
  if (blocked) return blocked;

  const clientIp = clientIpOf(request);
  try {
    const session = await runRequestWithSession(request, (accessToken) =>
      backendFetch(backendUrl(['users', 'me']), {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        clientIp,
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
      const user: unknown = await backend.json().catch(() => null);
      if (typeof user !== 'object' || user === null)
        return jsonError(502, SESSION_MESSAGES.UNAVAILABLE);
      return NextResponse.json({ user });
    });
  } catch {
    return jsonError(502, SESSION_MESSAGES.BACKEND_UNREACHABLE);
  }
}
