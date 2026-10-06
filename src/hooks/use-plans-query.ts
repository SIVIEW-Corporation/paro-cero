'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  plansService,
  type PlanCreateInput,
  type PlanExecutionInput,
} from '@/services/plans-service';
import { useAuthStore } from '@/store/auth-store';

function currentPlanSession() {
  const { user } = useAuthStore.getState();
  return {
    userId: user?.id ?? '',
    companyId: user?.company_id ?? '',
    role: user?.role ?? '',
    active: Boolean(user?.id && user.company_id && user.is_active),
  };
}

function samePlanSession(identity: ReturnType<typeof currentPlanSession>) {
  const current = currentPlanSession();
  return (
    identity.active &&
    current.active &&
    current.userId === identity.userId &&
    current.companyId === identity.companyId &&
    current.role === identity.role
  );
}

export function usePlansQuery(canRead: boolean) {
  const user = useAuthStore((state) => state.user);
  const identity = {
    userId: user?.id ?? '',
    companyId: user?.company_id ?? '',
    role: user?.role ?? '',
    active: Boolean(user?.id && user.company_id && user.is_active),
  };

  return useQuery({
    queryKey: ['plans', identity.userId, identity.companyId, identity.role],
    queryFn: async () =>
      plansService.getPlans({
        isRequestCurrent: () => samePlanSession(identity),
      }),
    enabled: identity.active && canRead,
    staleTime: 60_000,
    retry: false,
  });
}

export function useCreatePlanMutation() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const identity = {
    userId: user?.id ?? '',
    companyId: user?.company_id ?? '',
    role: user?.role ?? '',
    active: Boolean(user?.id && user.company_id && user.is_active),
  };
  const options = { isRequestCurrent: () => samePlanSession(identity) };
  return useMutation({
    mutationFn: (input: PlanCreateInput) =>
      plansService.createPlan(input, options),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plans'] }),
  });
}

export function useUpdatePlanExecutionMutation() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const identity = {
    userId: user?.id ?? '',
    companyId: user?.company_id ?? '',
    role: user?.role ?? '',
    active: Boolean(user?.id && user.company_id && user.is_active),
  };
  const options = { isRequestCurrent: () => samePlanSession(identity) };
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: PlanExecutionInput }) =>
      plansService.updateExecution(id, input, options),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plans'] }),
  });
}
