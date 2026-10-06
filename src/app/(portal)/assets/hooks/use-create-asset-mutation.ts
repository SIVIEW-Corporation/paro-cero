import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { assetsService } from '../services/assets-service';
import type { AssetCreatePayload } from '../types';
import { assetKeys } from './asset-query-keys';
import { useAssetSessionKey } from './use-asset-session-key';

export function useCreateAssetMutation() {
  const queryClient = useQueryClient();
  const session = useAssetSessionKey();

  return useMutation({
    mutationFn: (payload: AssetCreatePayload) =>
      assetsService.createAsset(payload),
    onSuccess: (asset) => {
      queryClient.setQueryData(assetKeys.detail(session, asset.id), asset);
      queryClient.invalidateQueries({ queryKey: assetKeys.lists(session) });
      toast.success('Activo creado correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear activo');
    },
  });
}
