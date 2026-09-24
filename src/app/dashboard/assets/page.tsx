'use client';

import { AssetsScreen } from '@/app/screens/screens1';
import { ASSETS } from '@/app/data/mock-data';
import { useWorkOrdersStore } from '@/app/stores/useWorkOrdersStore';
import { useAssetsQuery } from '@/hooks/use-assets-query';
import { useAuthStore } from '@/store/auth-store';
import { useAssetSession } from '@/hooks/use-asset-session';

export default function AssetsPage() {
  const wo = useWorkOrdersStore((state) => state.ordenes);
  const accessToken = useAuthStore((state) => state.accessToken);
  const session = useAssetSession();
  const assetsQuery = useAssetsQuery();
  const useRemoteAssets = Boolean(accessToken);
  const canManageAssets = session.canManage;

  return (
    <AssetsScreen
      key={session.key}
      wo={wo}
      assets={useRemoteAssets ? (assetsQuery.data?.items ?? []) : ASSETS}
      assetsLoading={
        useRemoteAssets && session.canRead && assetsQuery.isPending
      }
      assetsError={
        useRemoteAssets && !session.canRead
          ? new Error(
              'Tu sesión no tiene una empresa válida para consultar activos.',
            )
          : useRemoteAssets && assetsQuery.error instanceof Error
            ? assetsQuery.error
            : null
      }
      canManageAssets={canManageAssets}
    />
  );
}
