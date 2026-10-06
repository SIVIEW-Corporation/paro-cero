import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { assetsService } from '../services/assets-service';
import { NewAssetSchema } from '../lib/new-asset-schema';

export function useCreateAssetMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: NewAssetSchema) => assetsService.createAsset(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets', 'list'] });
      toast.success('Activo creado correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear activo');
    },
  });
}
