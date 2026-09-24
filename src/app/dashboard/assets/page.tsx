'use client';

import { AssetsScreen } from '@/app/screens/screens1';
import { ASSETS } from '@/app/data/mock-data';
import { useWorkOrdersStore } from '@/app/stores/useWorkOrdersStore';
import { useAssetsQuery } from '@/hooks/use-assets-query';
import { useAuthStore } from '@/store/auth-store';

export default function AssetsPage() {
  const wo = useWorkOrdersStore((state) => state.ordenes);
  const accessToken = useAuthStore((state) => state.accessToken);
  const assetsQuery = useAssetsQuery();
  const useRemoteAssets = Boolean(accessToken);

  return (
    <AssetsScreen
      wo={wo}
      assets={useRemoteAssets ? (assetsQuery.data?.items ?? []) : ASSETS}
      assetsLoading={useRemoteAssets && assetsQuery.isPending}
      assetsError={
        useRemoteAssets && assetsQuery.error instanceof Error
          ? assetsQuery.error
          : null
      }
    />
  );
}
