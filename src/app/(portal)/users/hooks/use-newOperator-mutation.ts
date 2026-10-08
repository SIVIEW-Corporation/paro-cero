import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { operatorsService } from '@/app/(portal)/users/services/operators-service';
import type { NewUserSchema } from '@/app/(portal)/users/lib/new-user-schema';
import { useAuthStore } from '@/store/auth-store';
import {
  getUsersSessionScope,
  usersQueryKeys,
  usersSessionIsCurrent,
} from '../lib/users-query-keys';

export function useCreateUserMutation() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const scope = getUsersSessionScope(user);

  return useMutation({
    mutationFn: async (values: NewUserSchema) => {
      const result = await operatorsService.createUser(values, {
        isRequestCurrent: () => usersSessionIsCurrent(scope),
      });
      return result;
    },
    onSuccess: () => {
      toast.success('Usuario creado correctamente');
      queryClient.invalidateQueries({
        queryKey: usersQueryKeys.listScope(scope),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear usuario');
    },
  });
}
