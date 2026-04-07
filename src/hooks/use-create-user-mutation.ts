import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authService } from '@/app/(portal)/users/services/new-user-service';
import type { NewUserSchema } from '@/app/(portal)/users/lib/new-user-schema';

export function useCreateUserMutation() {
  return useMutation({
    mutationFn: async (values: NewUserSchema) => {
      const result = await authService.createOperator(values);
      return result;
    },
    onSuccess: () => {
      toast.success('Usuario creado correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear usuario');
    },
  });
}
