import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AssetApiError, assetsService } from '../services/assets-service';
import type { AssetUpdatePayload } from '../types';
import { assetKeys } from './asset-query-keys';
import { useAssetSessionKey } from './use-asset-session-key';

interface UpdateAssetVariables {
  id: string;
  payload: AssetUpdatePayload;
}

export function useUpdateAssetMutation() {
  const queryClient = useQueryClient();
  const session = useAssetSessionKey();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateAssetVariables) =>
      assetsService.updateAsset(id, payload),
    onSuccess: (asset) => {
      queryClient.setQueryData(assetKeys.detail(session, asset.id), asset);
      queryClient.invalidateQueries({ queryKey: assetKeys.lists(session) });
      toast.success('Activo actualizado correctamente');
    },
    onError: (error: Error, { id }) => {
      if (error instanceof AssetApiError && error.status === 404) {
        // The asset is gone: refresh detail and lists so the UI reflects it.
        queryClient.invalidateQueries({
          queryKey: assetKeys.detail(session, id),
        });
        queryClient.invalidateQueries({ queryKey: assetKeys.lists(session) });
      }
      toast.error(error.message || 'Error al actualizar activo');
    },
  });
}
