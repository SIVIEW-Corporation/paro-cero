'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth-store';
import { companiesService } from '../services/companies-service';

export function useCompaniesQuery(enabled = true) {
  const user = useAuthStore((state) => state.user);
  const isSuperadmin = user?.role === 'superadmin';
  const scope = {
    userId: user?.id ?? 'anonymous',
    role: user?.role ?? 'anonymous',
  };

  return useQuery({
    queryKey: ['companies', 'list', scope],
    queryFn: () =>
      companiesService.getCompanies(1, 100, {
        isRequestCurrent: () => {
          const current = useAuthStore.getState();
          return Boolean(
            current.user?.is_active &&
            current.user.id === scope.userId &&
            current.user.role === scope.role,
          );
        },
      }),
    select: (data) => ({
      ...data,
      items: data.items.filter((company) => company.active === 1),
    }),
    enabled: Boolean(enabled && user?.is_active && isSuperadmin),
    staleTime: 5 * 60 * 1000,
  });
}
