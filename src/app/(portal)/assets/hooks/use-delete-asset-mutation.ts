import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AssetApiError, assetsService } from '../services/assets-service';
import { assetKeys } from './asset-query-keys';
import { useAssetSessionKey } from './use-asset-session-key';

export function useDeleteAssetMutation() {
  const queryClient = useQueryClient();
  const session = useAssetSessionKey();

  const forgetAsset = (id: string) => {
    queryClient.removeQueries({ queryKey: assetKeys.detail(session, id) });
    queryClient.invalidateQueries({ queryKey: assetKeys.lists(session) });
  };

  return useMutation({
    mutationFn: (id: string) => assetsService.deleteAsset(id),
    onSuccess: (_, id) => {
      forgetAsset(id);
      toast.success('Activo eliminado correctamente');
    },
    onError: (error: Error, id) => {
      // 404: already deleted or not visible; drop it from the cache anyway.
      if (error instanceof AssetApiError && error.status === 404) {
        forgetAsset(id);
      }
      toast.error(error.message || 'Error al eliminar activo');
    },
  });
}
