import 'use server';

import { cookies, headers } from 'next/headers';
import type { UserType } from '@/store/auth-store';
import { backendFetch, backendUrl } from '@/server/auth/backend';
import {
  clearSessionCookies,
  readAuthCookies,
  setSessionCookies,
} from '@/server/auth/cookies';
import { refreshSession } from '@/server/auth/refresh';
import { resolveClientIp } from '@/server/auth/request-guards';
import { SESSION_FLOW, runWithSession } from '@/server/auth/session-flow';

/**
 * Protected server action wrapper with role-based access control.
 * Resolves the current session from the httpOnly cookies through the backend
 * profile endpoint, refreshing the access token when needed.
 *
 * @param schema - Zod schema for input validation
 * @param handler - Async handler function receiving (input, session)
 * @param allowedRoles - Array of roles permitted to execute this action
 */
export function protectedAction<Input>(
  schema: { parse: (input: unknown) => Input },
  handler: (input: Input, session: Session) => Promise<unknown>,
  ...allowedRoles: UserType[]
) {
  return async (input: unknown) => {
    const parsed = schema.parse(input);
    const session = await getSession();

    if (!session) {
      throw new Error('Unauthorized — no active session');
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
      throw new Error(
        `Forbidden — role '${session.role}' is not authorized for this action`,
      );
    }

    return handler(parsed, session);
  };
}

interface Session {
  userId: string;
  email: string;
  role: UserType;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** Cookie writes are only allowed in actions/route handlers; ignore elsewhere. */
function tryWriteCookies(write: () => void) {
  try {
    write();
  } catch {
    // Called during render: the proxy rotates cookies on the next navigation.
  }
}

async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const { accessToken, refreshToken, remember } = readAuthCookies(cookieStore);
  if (!accessToken && !refreshToken) return null;

  const clientIp = resolveClientIp(await headers());
  try {
    const result = await runWithSession({
      accessToken,
      refreshToken,
      nowMs: Date.now(),
      refresh: (token) => refreshSession(token, clientIp),
      call: (token) =>
        backendFetch(backendUrl(['users', 'me']), {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
          clientIp,
        }),
    });

    if (result.kind === SESSION_FLOW.EXPIRED) {
      tryWriteCookies(() => clearSessionCookies(cookieStore));
      return null;
    }
    if (result.kind !== SESSION_FLOW.RESPONSE) return null;

    const { response, tokens } = result;
    if (tokens)
      tryWriteCookies(() => setSessionCookies(cookieStore, tokens, remember));
    if (!response.ok) return null;

    const payload: unknown = await response.json();
    if (
      !isRecord(payload) ||
      typeof payload.id !== 'string' ||
      typeof payload.email !== 'string' ||
      typeof payload.role !== 'string'
    ) {
      return null;
    }

    return {
      userId: payload.id,
      email: payload.email,
      role: payload.role as UserType,
    };
  } catch {
    return null;
  }
}
