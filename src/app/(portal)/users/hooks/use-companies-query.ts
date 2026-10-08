'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth-store';
import { companiesService } from '../services/companies-service';
import { companiesQueryKeys } from '../lib/companies-query-keys';
import {
  getUsersSessionScope,
  usersSessionIsCurrent,
} from '../lib/users-query-keys';

interface CompaniesQueryOptions {
  /** Keep inactive companies (users-list filter); forms keep active only. */
  includeInactive?: boolean;
}

/** Companies for the company selectors (superadmin only); active by default. */
export function useCompaniesQuery(
  enabled = true,
  { includeInactive = false }: CompaniesQueryOptions = {},
) {
  const user = useAuthStore((state) => state.user);
  const isSuperadmin = user?.role === 'superadmin';
  const scope = getUsersSessionScope(user);

  return useQuery({
    queryKey: companiesQueryKeys.selector(scope),
    queryFn: () =>
      companiesService.getCompanies(1, 100, {
        isRequestCurrent: () => usersSessionIsCurrent(scope),
      }),
    select: (data) => ({
      ...data,
      items: includeInactive
        ? data.items
        : data.items.filter((company) => company.active === 1),
    }),
    enabled: Boolean(enabled && user?.is_active && isSuperadmin),
    staleTime: 5 * 60 * 1000,
  });
}
