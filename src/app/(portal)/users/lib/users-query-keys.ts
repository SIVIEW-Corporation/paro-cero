import type { User } from '@/store/auth-store';
import { useAuthStore } from '@/store/auth-store';

export interface UsersSessionScope {
  userId: string;
  companyId: string | null;
  role: string;
}

export function getUsersSessionScope(user: User | null): UsersSessionScope {
  return {
    userId: user?.id ?? 'anonymous',
    companyId: user?.company_id ?? null,
    role: user?.role ?? 'anonymous',
  };
}

export function usersSessionIsCurrent(scope: UsersSessionScope): boolean {
  if (typeof window === 'undefined') return false;

  const { accessToken, user } = useAuthStore.getState();
  return Boolean(
    accessToken &&
    user?.is_active &&
    user.id === scope.userId &&
    (user.company_id ?? null) === scope.companyId &&
    user.role === scope.role,
  );
}

export const usersQueryKeys = {
  all: ['users'] as const,
  list: (scope: UsersSessionScope, page: number, size: number) =>
    [...usersQueryKeys.all, 'list', scope, { page, size }] as const,
  listScope: (scope: UsersSessionScope) =>
    [...usersQueryKeys.all, 'list', scope] as const,
};
