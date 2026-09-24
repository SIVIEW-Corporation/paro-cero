'use client';

import { useQuery } from '@tanstack/react-query';
import { assetsService } from '@/services/assets-service';
import {
  assetListKey,
  isAssetSessionCurrent,
  useAssetSession,
} from '@/hooks/use-asset-session';

export function useAssetsQuery() {
  const session = useAssetSession();

  return useQuery({
    queryKey: assetListKey(session),
    queryFn: () =>
      assetsService.getAllAssets({
        isRequestCurrent: () => isAssetSessionCurrent(session),
      }),
    enabled: session.canRead,
    staleTime: 2 * 60 * 1000,
    retry: false,
  });
}
