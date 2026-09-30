'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth-store';
import { isTechnicianRole } from '@/features/technician/access';
import { techniciansService } from '@/services/technicians-service';

export interface TechnicianOption {
  id: string;
  nombre: string;
}

export function useTechniciansQuery() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const scope = {
    userId: user?.id ?? 'anonymous',
    companyId: user?.company_id ?? null,
    role: user?.role ?? 'anonymous',
  };

  return useQuery({
    queryKey: ['technicians', scope],
    queryFn: () =>
      techniciansService.getAll({
        isRequestCurrent: () => {
          const current = useAuthStore.getState();
          return Boolean(
            current.accessToken &&
            current.user?.is_active &&
            current.user.id === scope.userId &&
            (current.user.company_id ?? null) === scope.companyId &&
            current.user.role === scope.role,
          );
        },
      }),
    select: (data): TechnicianOption[] =>
      data.items
        .filter((item) => item.is_active && isTechnicianRole(item.role))
        .map((item) => ({ id: item.id, nombre: item.full_name })),
    enabled: Boolean(
      accessToken && user?.id && user.company_id && user.is_active,
    ),
    staleTime: 5 * 60 * 1000,
  });
}
