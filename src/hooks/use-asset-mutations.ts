'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  assetsService,
  type AssetCreateInput,
  type AssetUpdateInput,
} from '@/services/assets-service';
import type { ApiClientOptions } from '@/lib/api-client';
import {
  assetListKey,
  isAssetSessionCurrent,
  useAssetSession,
} from '@/hooks/use-asset-session';

function useAssetMutation<TInput, TResult>(
  write: (input: TInput, options: ApiClientOptions) => Promise<TResult>,
) {
  const queryClient = useQueryClient();
  const session = useAssetSession();
  const isCurrent = () => session.canManage && isAssetSessionCurrent(session);

  return useMutation({
    mutationFn: (input: TInput) => {
      if (!isCurrent())
        throw new Error(
          'No tienes permiso para administrar activos en esta sesión.',
        );
      return write(input, { isRequestCurrent: isCurrent });
    },
    retry: false,
    onSuccess: async () => {
      if (isCurrent()) {
        await queryClient.invalidateQueries({
          queryKey: assetListKey(session),
        });
      }
    },
  });
}

export function useCreateAssetMutation() {
  return useAssetMutation((data: AssetCreateInput, options) =>
    assetsService.createAsset(data, options),
  );
}

interface UpdateAssetVariables {
  assetId: string;
  data: AssetUpdateInput;
}

export function useUpdateAssetMutation() {
  return useAssetMutation(({ assetId, data }: UpdateAssetVariables, options) =>
    assetsService.updateAsset(assetId, data, options),
  );
}

export function useDeleteAssetMutation() {
  return useAssetMutation((assetId: string, options) =>
    assetsService.deleteAsset(assetId, options),
  );
}
