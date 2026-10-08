'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth-store';
import {
  getUsersSessionScope,
  usersQueryKeys,
  usersSessionIsCurrent,
} from '../lib/users-query-keys';
import { operatorsService } from '../services/operators-service';

export function useOperatorsQuery(
  page: number,
  size: number = 10,
  companyId: string | null = null,
) {
  const user = useAuthStore((state) => state.user);
  const scope = getUsersSessionScope(user);
  const canListUsers = user?.role === 'superadmin';

  return useQuery({
    queryKey: usersQueryKeys.list(scope, page, size, companyId),
    queryFn: () =>
      operatorsService.getOperators(
        page,
        size,
        { companyId },
        { isRequestCurrent: () => usersSessionIsCurrent(scope) },
      ),
    enabled: Boolean(user?.id && user.is_active && canListUsers),
  });
}
