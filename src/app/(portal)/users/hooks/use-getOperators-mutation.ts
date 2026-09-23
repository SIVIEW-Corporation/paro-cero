import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { operatorsService } from '@/app/(portal)/users/services/operators-service';

interface GetOperatorsInput {
  page?: number;
  size?: number;
}

export function useGetOperatorsMutation() {
  return useMutation({
    mutationFn: async ({ page = 1, size = 10 }: GetOperatorsInput = {}) => {
      const result = await operatorsService.getOperators(page, size);
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
