'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth-store';
import { assetsService } from '@/services/assets-service';

export function useAssetsQuery() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['assets', 'list'],
    queryFn: () => assetsService.getAssets(),
    enabled: Boolean(accessToken),
    staleTime: 2 * 60 * 1000,
    retry: false,
  });
}
