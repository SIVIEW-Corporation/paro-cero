'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth-store';
import {
  inspectionsService,
  type InspectionCreateInput,
  type InspectionExecutionInput,
  type InspectionFindingCreateInput,
  type InspectionTemplateCreateInput,
} from '@/services/inspections-service';

const inspectionsKey = ['inspections'] as const;

function currentIdentity() {
  const { user, accessToken } = useAuthStore.getState();
  return {
    userId: user?.id ?? '',
    companyId: user?.company_id ?? '',
    role: user?.role ?? '',
    active: Boolean(
      accessToken && user?.id && user.company_id && user.is_active,
    ),
  };
}

function isCurrent(identity: ReturnType<typeof currentIdentity>) {
  const current = currentIdentity();
  return (
    identity.active &&
    current.active &&
    identity.userId === current.userId &&
    identity.companyId === current.companyId &&
    identity.role === current.role
  );
}

function useInspectionMutation<TInput, TOutput>(
  mutationFn: (
    input: TInput,
    options: { isRequestCurrent: () => boolean },
  ) => Promise<TOutput>,
) {
  const queryClient = useQueryClient();
  const identity = currentIdentity();
  const options = { isRequestCurrent: () => isCurrent(identity) };
  return useMutation({
    mutationFn: (input: TInput) => mutationFn(input, options),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: inspectionsKey }),
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useInspectionsQuery(canRead: boolean) {
  const { user, accessToken } = useAuthStore();
  const identity = {
    userId: user?.id ?? '',
    companyId: user?.company_id ?? '',
    role: user?.role ?? '',
    active: Boolean(
      accessToken && user?.id && user.company_id && user.is_active,
    ),
  };
  return useQuery({
    queryKey: [
      ...inspectionsKey,
      identity.userId,
      identity.companyId,
      identity.role,
    ],
    queryFn: () =>
      inspectionsService.getBundle({
        isRequestCurrent: () => isCurrent(identity),
      }),
    enabled: identity.active && canRead,
    staleTime: 60_000,
    retry: false,
  });
}

export function useCreateInspectionTemplateMutation() {
  return useInspectionMutation<
    InspectionTemplateCreateInput,
    Awaited<ReturnType<typeof inspectionsService.createTemplate>>
  >((input, options) => inspectionsService.createTemplate(input, options));
}

export function useCreateInspectionMutation() {
  return useInspectionMutation<
    InspectionCreateInput,
    Awaited<ReturnType<typeof inspectionsService.createInspection>>
  >((input, options) => inspectionsService.createInspection(input, options));
}

export function useUpdateInspectionExecutionMutation() {
  return useInspectionMutation<
    { id: string; input: InspectionExecutionInput },
    Awaited<ReturnType<typeof inspectionsService.updateExecution>>
  >(({ id, input }, options) =>
    inspectionsService.updateExecution(id, input, options),
  );
}

export function useCreateInspectionFindingsMutation() {
  return useInspectionMutation<
    InspectionFindingCreateInput[],
    Awaited<ReturnType<typeof inspectionsService.createFindings>>
  >((input, options) => inspectionsService.createFindings(input, options));
}

export function useUpdateInspectionFindingMutation() {
  return useInspectionMutation<
    {
      id: string;
      input: {
        status?: 'abierto' | 'en_proceso' | 'resuelto';
        workOrderId?: string | null;
        resolvedAt?: string | null;
      };
    },
    Awaited<ReturnType<typeof inspectionsService.updateFinding>>
  >(({ id, input }, options) =>
    inspectionsService.updateFinding(id, input, options),
  );
}
