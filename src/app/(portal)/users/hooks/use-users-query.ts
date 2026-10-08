'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth-store';
import {
  getUsersSessionScope,
  keepPreviousUsersPage,
  usersQueryKeys,
  usersSessionIsCurrent,
} from '../lib/users-query-keys';
import {
  EMPTY_USERS_LIST_FILTERS,
  type UsersListFilters,
} from '../lib/users-list-filters';
import { operatorsService } from '../services/operators-service';

export function useOperatorsQuery(
  page: number,
  size: number = 10,
  filters: UsersListFilters = EMPTY_USERS_LIST_FILTERS,
) {
  const user = useAuthStore((state) => state.user);
  const scope = getUsersSessionScope(user);
  const canListUsers = user?.role === 'superadmin';

  return useQuery({
    queryKey: usersQueryKeys.list(scope, page, size, filters),
    queryFn: () =>
      operatorsService.getOperators(page, size, filters, {
        isRequestCurrent: () => usersSessionIsCurrent(scope),
      }),
    placeholderData: keepPreviousUsersPage(scope),
    enabled: Boolean(user?.id && user.is_active && canListUsers),
  });
}
