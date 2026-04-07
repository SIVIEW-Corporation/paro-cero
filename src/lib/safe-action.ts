import 'use server';

import { useAuthStore } from '@/store/auth-store';
import type { UserType } from '@/store/auth-store';

/**
 * Protected server action wrapper with role-based access control.
 * Uses the auth store to get the current session information.
 *
 * @param schema - Zod schema for input validation
 * @param handler - Async handler function receiving (input, session)
 * @param allowedRoles - Array of roles permitted to execute this action
 */
export function protectedAction<
  Input,
  _Schema extends { parse: (input: unknown) => Input },
>(
  schema: { parse: (input: unknown) => Input },
  handler: (
    input: Input,
    session: { userId: string; email: string; role: UserType } | null,
  ) => Promise<unknown>,
  ...allowedRoles: UserType[]
) {
  return async (input: unknown) => {
    const parsed = schema.parse(input);
    const session = getSession();

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

function getSession(): Session | null {
  const user = useAuthStore.getState().user;

  if (!user) {
    return null;
  }

  return {
    userId: user.id,
    email: user.email,
    role: user.role as UserType,
  };
}
