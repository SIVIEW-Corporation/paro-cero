import 'use server';

import { cookies } from 'next/headers';
import type { UserType } from '@/store/auth-store';

/**
 * Protected server action wrapper with role-based access control.
 * Resolves the current session from the httpOnly access cookie through the
 * backend profile endpoint.
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

function buildBackendEndpoint(path: string): string {
  if (process.env.API_URL) {
    return new URL(`/api/v1${path}`, process.env.API_URL).toString();
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api/v1';
  return `${baseUrl.replace(/\/$/, '')}${path}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

async function getSession(): Promise<Session | null> {
  const accessToken = (await cookies()).get('access_token')?.value;

  if (!accessToken) {
    return null;
  }

  try {
    const response = await fetch(buildBackendEndpoint('/users/me'), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

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
