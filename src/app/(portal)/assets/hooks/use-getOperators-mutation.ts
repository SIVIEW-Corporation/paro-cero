import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { operatorsService } from '@/app/(portal)/users/services/operators-service';

export function useGetOperatorsMutation() {
  return useMutation({
    mutationFn: async () => {
      const result = await operatorsService.getOperators();
      return result;
    },
    onSuccess: () => {
      console.log('Usuarios obtenidos correctamente');
    },
    onError: (error: Error) => {
      toast.error(
        error.message || 'No se pudo obtener información de los usuarios',
      );
    },
  });
}
