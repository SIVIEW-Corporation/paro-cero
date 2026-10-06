import { isProtectedPath } from '@/constants/protected-paths';
import { safeNextPath } from '@/lib/auth/next-path';
import { REFRESH_OUTCOME, type RefreshOutcomeKind } from './types';

/** Pure decision table for `src/proxy.ts`. */

export const PROXY_ACTION = {
  CONTINUE: 'continue',
  REFRESH: 'refresh',
  REDIRECT: 'redirect',
} as const;

export type ProxyDecision =
  | {
      action: typeof PROXY_ACTION.CONTINUE;
      setSessionCookies: boolean;
      clearCookies: boolean;
    }
  | { action: typeof PROXY_ACTION.REFRESH }
  | {
      action: typeof PROXY_ACTION.REDIRECT;
      location: string;
      setSessionCookies: boolean;
      clearCookies: boolean;
    };

export interface ProxyDecisionInput {
  pathname: string;
  search: string;
  accessValid: boolean;
  hasAccessCookie: boolean;
  hasRefresh: boolean;
  isPrefetch: boolean;
  /** Present on the second pass, after the proxy ran the refresh. */
  refreshOutcome?: RefreshOutcomeKind;
}

const LOGIN_PATH = '/login';
const HOME_PATH = '/dashboard';

function proceed(
  setSessionCookies = false,
  clearCookies = false,
): ProxyDecision {
  return { action: PROXY_ACTION.CONTINUE, setSessionCookies, clearCookies };
}

function redirect(
  location: string,
  { setSessionCookies = false, clearCookies = false } = {},
): ProxyDecision {
  return {
    action: PROXY_ACTION.REDIRECT,
    location,
    setSessionCookies,
    clearCookies,
  };
}

function loginRedirect(
  pathname: string,
  search: string,
  clearCookies: boolean,
) {
  const next = encodeURIComponent(`${pathname}${search}`);
  return redirect(`${LOGIN_PATH}?next=${next}`, { clearCookies });
}

function homeFor(search: string): string {
  return safeNextPath(new URLSearchParams(search).get('next')) ?? HOME_PATH;
}

function decideProtected(input: ProxyDecisionInput): ProxyDecision {
  const { pathname, search, accessValid, hasAccessCookie, hasRefresh } = input;
  if (accessValid) return proceed();
  if (!hasRefresh) return loginRedirect(pathname, search, hasAccessCookie);
  if (input.isPrefetch) return proceed();

  switch (input.refreshOutcome) {
    case undefined:
      return { action: PROXY_ACTION.REFRESH };
    case REFRESH_OUTCOME.OK:
      return proceed(true);
    case REFRESH_OUTCOME.UNAUTHORIZED:
      return loginRedirect(pathname, search, true);
    default:
      // conflict/transient: let the page load; its API calls retry via the BFF.
      return proceed();
  }
}

function decideLogin(input: ProxyDecisionInput): ProxyDecision {
  if (input.accessValid) return redirect(homeFor(input.search));
  if (!input.hasRefresh || input.isPrefetch) return proceed();

  switch (input.refreshOutcome) {
    case undefined:
      return { action: PROXY_ACTION.REFRESH };
    case REFRESH_OUTCOME.OK:
      return redirect(homeFor(input.search), { setSessionCookies: true });
    case REFRESH_OUTCOME.UNAUTHORIZED:
      return proceed(false, true);
    default:
      return proceed();
  }
}

export function decideProxy(input: ProxyDecisionInput): ProxyDecision {
  if (input.pathname === LOGIN_PATH) return decideLogin(input);
  if (isProtectedPath(input.pathname)) return decideProtected(input);

  const isLanding = input.pathname === '/';
  const landingBypass =
    new URLSearchParams(input.search).get('landing') === '1';
  if (isLanding && input.accessValid && !landingBypass)
    return redirect(HOME_PATH);
  return proceed();
}

/** Rewrites a `Cookie` request header; `null` values remove the cookie. */
export function mergeCookieHeader(
  header: string | null,
  updates: Record<string, string | null>,
): string {
  const pending = new Map(Object.entries(updates));
  const parts: string[] = [];
  for (const part of (header ?? '').split(';')) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const name = trimmed.split('=')[0].trim();
    if (!pending.has(name)) {
      parts.push(trimmed);
      continue;
    }
    const value = pending.get(name);
    pending.delete(name);
    if (value !== null && value !== undefined) parts.push(`${name}=${value}`);
  }
  for (const [name, value] of pending) {
    if (value !== null) parts.push(`${name}=${value}`);
  }
  return parts.join('; ');
}

/** Router prefetches must never rotate tokens. */
export function isPrefetchRequest(headers: Headers): boolean {
  return (
    headers.get('next-router-prefetch') === '1' ||
    headers.get('purpose') === 'prefetch' ||
    (headers.get('sec-purpose') ?? '').includes('prefetch')
  );
}
