import type { User } from '@/store/auth-store';
import { useAuthStore } from '@/store/auth-store';
import {
  EMPTY_USERS_LIST_FILTERS,
  type UsersListFilters,
} from './users-list-filters';

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

  const { user } = useAuthStore.getState();
  return Boolean(
    user?.is_active &&
    user.id === scope.userId &&
    (user.company_id ?? null) === scope.companyId &&
    user.role === scope.role,
  );
}

export const usersQueryKeys = {
  all: ['users'] as const,
  list: (
    scope: UsersSessionScope,
    page: number,
    size: number,
    { companyId, role, search }: UsersListFilters = EMPTY_USERS_LIST_FILTERS,
  ) =>
    [
      ...usersQueryKeys.all,
      'list',
      scope,
      { page, size, companyId, role, search },
    ] as const,
  listScope: (scope: UsersSessionScope) =>
    [...usersQueryKeys.all, 'list', scope] as const,
};

interface PreviousUsersQuery {
  queryKey: readonly unknown[];
}

function isSameScope(value: unknown, scope: UsersSessionScope): boolean {
  if (typeof value !== 'object' || value === null) return false;
  const previous = value as Partial<UsersSessionScope>;
  return (
    previous.userId === scope.userId &&
    previous.companyId === scope.companyId &&
    previous.role === scope.role
  );
}

/**
 * `placeholderData` that keeps the previous page while filters or pagination
 * change, but never across sessions (another user's list is never shown).
 */
export function keepPreviousUsersPage(scope: UsersSessionScope) {
  return <TData>(
    previous: TData | undefined,
    previousQuery: PreviousUsersQuery | undefined,
  ): TData | undefined =>
    isSameScope(previousQuery?.queryKey[2], scope) ? previous : undefined;
}
