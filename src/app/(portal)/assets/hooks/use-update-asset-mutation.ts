import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { assetsService, UpdateAssetParams } from '../services/assets-service';

export function useUpdateAssetMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: UpdateAssetParams }) =>
      assetsService.updateAsset(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets', 'list'] });
      toast.success('Activo actualizado correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar activo');
    },
  });
}
