import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { operatorsService } from '@/app/(portal)/users/services/operators-service';
import type { EditUserSchema } from '@/app/(portal)/users/lib/edit-user-schema';

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: string;
      values: EditUserSchema;
    }) => {
      return await operatorsService.updateOperator(id, values);
    },
    onSuccess: () => {
      toast.success('Usuario actualizado correctamente');
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar usuario');
    },
  });
}
