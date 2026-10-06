import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { operatorsService } from '@/app/(portal)/users/services/operators-service';
import type { EditUserSchema } from '@/app/(portal)/users/lib/edit-user-schema';
import { useAuthStore } from '@/store/auth-store';
import {
  getUsersSessionScope,
  usersQueryKeys,
  usersSessionIsCurrent,
} from '../lib/users-query-keys';

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const scope = getUsersSessionScope(user);

  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: string;
      values: EditUserSchema;
    }) => {
      return await operatorsService.updateOperator(id, values, {
        isRequestCurrent: () => usersSessionIsCurrent(scope),
      });
    },
    onSuccess: () => {
      toast.success('Usuario actualizado correctamente');
      queryClient.invalidateQueries({
        queryKey: usersQueryKeys.listScope(scope),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar usuario');
    },
  });
}
