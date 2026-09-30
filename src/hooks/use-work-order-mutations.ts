'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  type WorkOrderCreateInput,
  type WorkOrderEvidenceCreateInput,
  type WorkOrderUpdateInput,
  workOrdersService,
} from '@/services/work-orders-service';
import {
  useWorkOrderSession,
  isWorkOrderSessionCurrent,
  workOrderListKey,
} from '@/hooks/use-work-order-session';
import type { EstadoOT } from '@/app/data/types';

function useScopedWorkOrderMutation() {
  const queryClient = useQueryClient();
  const session = useWorkOrderSession();
  const options = {
    isRequestCurrent: () => isWorkOrderSessionCurrent(session),
  };

  return { queryClient, session, options };
}

export function useCreateWorkOrderMutation() {
  const { queryClient, session, options } = useScopedWorkOrderMutation();
  return useMutation({
    mutationFn: (input: WorkOrderCreateInput) =>
      workOrdersService.createWorkOrder(input, options),
    onSuccess: () => {
      toast.success('Orden de trabajo creada correctamente');
      queryClient.invalidateQueries({ queryKey: workOrderListKey(session) });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useChangeWorkOrderStatusMutation() {
  const { queryClient, session, options } = useScopedWorkOrderMutation();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: EstadoOT }) =>
      workOrdersService.changeStatus(id, status, options),
    onSuccess: () => {
      toast.success('Estado de la orden actualizado');
      queryClient.invalidateQueries({ queryKey: workOrderListKey(session) });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateWorkOrderMutation() {
  const { queryClient, session, options } = useScopedWorkOrderMutation();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: WorkOrderUpdateInput }) =>
      workOrdersService.updateWorkOrder(id, input, options),
    onSuccess: () => {
      toast.success('Orden de trabajo actualizada correctamente');
      queryClient.invalidateQueries({ queryKey: workOrderListKey(session) });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useAddWorkOrderEvidenceMutation() {
  const { queryClient, session, options } = useScopedWorkOrderMutation();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: WorkOrderEvidenceCreateInput;
    }) => workOrdersService.addEvidence(id, input, options),
    onSuccess: () => {
      toast.success('Evidencia registrada correctamente');
      queryClient.invalidateQueries({ queryKey: workOrderListKey(session) });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteWorkOrderEvidenceMutation() {
  const { queryClient, session, options } = useScopedWorkOrderMutation();
  return useMutation({
    mutationFn: ({
      workOrderId,
      evidenceId,
    }: {
      workOrderId: string;
      evidenceId: string;
    }) => workOrdersService.deleteEvidence(workOrderId, evidenceId, options),
    onSuccess: () => {
      toast.success('Evidencia eliminada correctamente');
      queryClient.invalidateQueries({ queryKey: workOrderListKey(session) });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteWorkOrderMutation() {
  const { queryClient, session, options } = useScopedWorkOrderMutation();
  return useMutation({
    mutationFn: (id: string) => workOrdersService.deleteWorkOrder(id, options),
    onSuccess: () => {
      toast.success('Orden de trabajo eliminada');
      queryClient.invalidateQueries({ queryKey: workOrderListKey(session) });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
