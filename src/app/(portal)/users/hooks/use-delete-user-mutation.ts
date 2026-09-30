import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { operatorsService } from '@/app/(portal)/users/services/operators-service';
import { useAuthStore } from '@/store/auth-store';
import {
  getUsersSessionScope,
  usersQueryKeys,
  usersSessionIsCurrent,
} from '../lib/users-query-keys';

export function useDeleteUserMutation() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const scope = getUsersSessionScope(user);

  return useMutation({
    mutationFn: async (id: string) => {
      await operatorsService.deleteOperator(id, {
        isRequestCurrent: () => usersSessionIsCurrent(scope),
      });
    },
    onSuccess: () => {
      toast.success('Usuario eliminado correctamente');
      queryClient.invalidateQueries({
        queryKey: usersQueryKeys.listScope(scope),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar usuario');
    },
  });
}
