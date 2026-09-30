'use client';

import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth-service';
import { useAuthStore } from '@/store/auth-store';

export function useCurrentUserQuery() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const setUser = useAuthStore((state) => state.setUser);

  return useQuery({
    queryKey: ['auth', 'profile', userId ?? 'anonymous'],
    queryFn: async () => {
      const user = await authService.getProfile();
      const currentUser = useAuthStore.getState().user;
      const sessionChanged = (currentUser?.id ?? null) !== userId;
      if (!sessionChanged) setUser(user);
      return user;
    },
    enabled: Boolean(accessToken),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
