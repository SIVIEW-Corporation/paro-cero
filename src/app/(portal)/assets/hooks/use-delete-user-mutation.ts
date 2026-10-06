import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { assetsService } from '../services/assets-service';

export function useDeleteAssetMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await assetsService.deleteAsset(id);
    },
    onSuccess: () => {
      toast.success('Activo eliminado correctamente');
      queryClient.invalidateQueries({ queryKey: ['assets', 'list'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar activo');
    },
  });
}
