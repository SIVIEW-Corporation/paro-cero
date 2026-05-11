import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { operatorsService } from '@/app/(portal)/users/services/operators-service';

export function useDeleteUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await operatorsService.deleteOperator(id);
    },
    onSuccess: () => {
      toast.success('Usuario eliminado correctamente');
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar usuario');
    },
  });
}
