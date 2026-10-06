import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isProduction } from './server/auth/config';
import {
  authCookieNames,
  clearedCookieWrites,
  isRememberFlag,
  sessionCookieWrites,
  type AuthCookieWrite,
} from './server/auth/cookie-options';
import { applyCookieWrites } from './server/auth/cookies';
import {
  PROXY_ACTION,
  decideProxy,
  isPrefetchRequest,
  mergeCookieHeader,
  type ProxyDecision,
} from './server/auth/proxy-decision';
import { refreshSession } from './server/auth/refresh';
import { resolveClientIp } from './server/auth/request-guards';
import { isAccessUsable } from './server/auth/session-flow';
import type { SessionTokens } from './server/auth/types';

function cookieWritesFor(
  decision: ProxyDecision,
  tokens: SessionTokens | null,
  remember: boolean,
): AuthCookieWrite[] {
  if (decision.action === PROXY_ACTION.REFRESH) return [];
  if (decision.setSessionCookies && tokens)
    return sessionCookieWrites(isProduction(), tokens, remember);
  if (decision.clearCookies) return clearedCookieWrites(isProduction());
  return [];
}

/** Forwards cookie changes to the app (server code sees them) and the browser. */
function continueWith(request: NextRequest, writes: AuthCookieWrite[]) {
  if (writes.length === 0) return NextResponse.next();
  const headers = new Headers(request.headers);
  headers.set(
    'cookie',
    mergeCookieHeader(
      headers.get('cookie'),
      Object.fromEntries(
        writes.map((write) => [
          write.name,
          write.options.maxAge === 0 ? null : write.value,
        ]),
      ),
    ),
  );
  const response = NextResponse.next({ request: { headers } });
  applyCookieWrites(response.cookies, writes);
  return response;
}

export async function proxy(request: NextRequest) {
  const names = authCookieNames(isProduction());
  const accessToken = request.cookies.get(names.access)?.value;
  const refreshToken = request.cookies.get(names.refresh)?.value;
  const { pathname, search } = request.nextUrl;

  const input = {
    pathname,
    search,
    accessValid: isAccessUsable(accessToken, Date.now()),
    hasAccessCookie: Boolean(accessToken),
    hasRefresh: Boolean(refreshToken),
    isPrefetch: isPrefetchRequest(request.headers),
  };

  let decision = decideProxy(input);
  let tokens: SessionTokens | null = null;
  if (decision.action === PROXY_ACTION.REFRESH && refreshToken) {
    const outcome = await refreshSession(
      refreshToken,
      resolveClientIp(request.headers),
    );
    if (outcome.kind === 'ok') tokens = outcome.tokens;
    decision = decideProxy({ ...input, refreshOutcome: outcome.kind });
  }

  const remember = isRememberFlag(request.cookies.get(names.remember)?.value);
  const writes = cookieWritesFor(decision, tokens, remember);

  if (decision.action === PROXY_ACTION.REDIRECT) {
    const response = NextResponse.redirect(
      new URL(decision.location, request.url),
    );
    applyCookieWrites(response.cookies, writes);
    return response;
  }
  return continueWith(request, writes);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
