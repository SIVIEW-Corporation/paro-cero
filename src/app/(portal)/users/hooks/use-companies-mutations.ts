'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth-store';
import {
  companiesService,
  type CompanyCreatePayload,
  type CompanyUpdatePayload,
} from '../services/companies-service';
import { companiesQueryKeys } from '../lib/companies-query-keys';
import {
  getUsersSessionScope,
  usersSessionIsCurrent,
} from '../lib/users-query-keys';

interface UpdateCompanyVariables {
  id: string;
  payload: CompanyUpdatePayload;
}

function updateSuccessMessage(payload: CompanyUpdatePayload): string {
  const fields = Object.keys(payload);
  if (fields.length === 1 && payload.active !== undefined) {
    return payload.active === 1
      ? 'Empresa activada correctamente'
      : 'Empresa desactivada correctamente';
  }
  return 'Empresa actualizada correctamente';
}

/** Session-scoped invalidation of the companies list and selector. */
function useCompaniesSession() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const scope = getUsersSessionScope(user);

  return {
    options: { isRequestCurrent: () => usersSessionIsCurrent(scope) },
    invalidate: () =>
      queryClient.invalidateQueries({
        queryKey: companiesQueryKeys.scope(scope),
      }),
  };
}

export function useCreateCompanyMutation() {
  const session = useCompaniesSession();

  return useMutation({
    mutationFn: (payload: CompanyCreatePayload) =>
      companiesService.createCompany(payload, session.options),
    onSuccess: () => {
      toast.success('Empresa creada correctamente');
      session.invalidate();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear la empresa');
    },
  });
}

export function useUpdateCompanyMutation() {
  const session = useCompaniesSession();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateCompanyVariables) =>
      companiesService.updateCompany(id, payload, session.options),
    onSuccess: (_company, { payload }) => {
      toast.success(updateSuccessMessage(payload));
      session.invalidate();
    },
    onError: (error: Error) => {
      // A 404 means the list is stale; refresh it either way.
      session.invalidate();
      toast.error(error.message || 'Error al actualizar la empresa');
    },
  });
}
