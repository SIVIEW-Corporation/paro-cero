import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { operatorsService } from '@/app/(portal)/users/services/operators-service';
import type { NewUserSchema } from '@/app/(portal)/users/lib/new-user-schema';

export function useCreateUserMutation() {
  return useMutation({
    mutationFn: async (values: NewUserSchema) => {
      const result = await operatorsService.createOperator(values);
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
