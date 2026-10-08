'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth-store';
import { companiesService } from '../services/companies-service';
import { companiesQueryKeys } from '../lib/companies-query-keys';
import { canManageCompanies } from '../lib/users-tabs';
import {
  getUsersSessionScope,
  usersSessionIsCurrent,
} from '../lib/users-query-keys';

/** Paginated companies (active and inactive) for the management tab. */
export function useCompaniesListQuery(page: number, size: number = 10) {
  const user = useAuthStore((state) => state.user);
  const scope = getUsersSessionScope(user);

  return useQuery({
    queryKey: companiesQueryKeys.list(scope, page, size),
    queryFn: () =>
      companiesService.listCompanies(
        { page, size },
        { isRequestCurrent: () => usersSessionIsCurrent(scope) },
      ),
    placeholderData: keepPreviousData,
    enabled: Boolean(user?.is_active && canManageCompanies(user?.role)),
  });
}
