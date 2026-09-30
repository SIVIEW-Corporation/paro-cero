'use client';

import { useState, useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { WorkOrdersScreen } from '@/app/screens2';
import { ASSETS } from '@/app/data/index';
import { TECNICOS } from '@/app/data/constants';
import { useWorkOrdersStore } from '@/app/stores/useWorkOrdersStore';
import type { OrdenTrabajo } from '@/app/data/types';
import { useAuthStore } from '@/store/auth-store';
import { useAssetsQuery } from '@/hooks/use-assets-query';
import { useWorkOrderSession } from '@/hooks/use-work-order-session';
import { useWorkOrdersQuery } from '@/hooks/use-work-orders-query';
import { useTechniciansQuery } from '@/hooks/use-technicians-query';
import { getRolePermissions } from '@/features/technician/access';
import {
  useAddWorkOrderEvidenceMutation,
  useChangeWorkOrderStatusMutation,
  useCreateWorkOrderMutation,
  useDeleteWorkOrderEvidenceMutation,
  useDeleteWorkOrderMutation,
  useUpdateWorkOrderMutation,
} from '@/hooks/use-work-order-mutations';

export default function WorkOrdersPage() {
  const ordenesStore = useWorkOrdersStore((state) => state.ordenes);
  const setOrdenesStore = useWorkOrdersStore((state) => state.setOrdenes);
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const session = useWorkOrderSession();
  const workOrdersQuery = useWorkOrdersQuery();
  const assetsQuery = useAssetsQuery();
  const techniciansQuery = useTechniciansQuery();
  const createMutation = useCreateWorkOrderMutation();
  const statusMutation = useChangeWorkOrderStatusMutation();
  const updateMutation = useUpdateWorkOrderMutation();
  const deleteMutation = useDeleteWorkOrderMutation();
  const addEvidenceMutation = useAddWorkOrderEvidenceMutation();
  const deleteEvidenceMutation = useDeleteWorkOrderEvidenceMutation();

  const [wo, setWo] = useState<OrdenTrabajo[]>(ordenesStore);

  useEffect(() => {
    setWo(ordenesStore);
  }, [ordenesStore]);

  const handleSetWo: Dispatch<SetStateAction<OrdenTrabajo[]>> = (value) => {
    const nuevasOrdenes = typeof value === 'function' ? value(wo) : value;
    setWo(nuevasOrdenes);
    setOrdenesStore(nuevasOrdenes);
  };

  const hasRemoteWorkOrderSession = Boolean(accessToken && session.canRead);
  const usingMockFallback =
    hasRemoteWorkOrderSession && workOrdersQuery.isError;
  const useRemoteWorkOrders = hasRemoteWorkOrderSession && !usingMockFallback;
  const authenticatedWithoutCompany = Boolean(accessToken && !session.canRead);
  const displayedOrders = useRemoteWorkOrders
    ? (workOrdersQuery.data?.items ?? [])
    : authenticatedWithoutCompany
      ? []
      : wo;
  const availableAssets = useRemoteWorkOrders
    ? (assetsQuery.data?.items ?? [])
    : ASSETS;
  const availableTechnicians = useRemoteWorkOrders
    ? (techniciansQuery.data ??
      (user && user.role && ['operator', 'tecnico'].includes(user.role)
        ? [{ id: user.id, nombre: user.full_name }]
        : []))
    : TECNICOS;
  const permissions = getRolePermissions(user?.role);
  const localOrRemoteSession = accessToken
    ? session.canRead
    : !user || Boolean(permissions?.workOrders.read);
  const canCreate = localOrRemoteSession
    ? !accessToken || Boolean(permissions?.workOrders.create)
    : false;
  const canEdit = localOrRemoteSession
    ? !accessToken || Boolean(permissions?.workOrders.edit)
    : false;
  const canChangeStatus = localOrRemoteSession
    ? !accessToken || Boolean(permissions?.workOrders.changeStatus)
    : false;
  const canManageEvidence = localOrRemoteSession
    ? !accessToken || Boolean(permissions?.workOrders.manageEvidence)
    : false;
  const canDelete = localOrRemoteSession
    ? !accessToken || Boolean(permissions?.workOrders.delete)
    : false;

  return (
    <WorkOrdersScreen
      key={session.key}
      wo={displayedOrders}
      setWo={handleSetWo}
      assets={availableAssets}
      technicians={availableTechnicians}
      canWrite={canEdit}
      canCreate={canCreate}
      canChangeStatus={canChangeStatus}
      canManageEvidence={canManageEvidence}
      canDelete={canDelete}
      isLoading={useRemoteWorkOrders && workOrdersQuery.isPending}
      error={
        authenticatedWithoutCompany
          ? new Error(
              'Tu sesión no tiene una empresa válida para consultar órdenes de trabajo.',
            )
          : null
      }
      fallbackNotice={
        usingMockFallback
          ? 'La API de órdenes no está disponible todavía. Se muestra el mock y las acciones quedan locales hasta validar la migración de PostgreSQL.'
          : null
      }
      onCreateWorkOrder={
        useRemoteWorkOrders
          ? async (input) => {
              await createMutation.mutateAsync(input);
            }
          : undefined
      }
      onChangeStatus={
        useRemoteWorkOrders
          ? async (id, status) => {
              await statusMutation.mutateAsync({ id, status });
            }
          : undefined
      }
      onUpdateWorkOrder={
        useRemoteWorkOrders
          ? async (id, input) => {
              await updateMutation.mutateAsync({ id, input });
            }
          : undefined
      }
      onDeleteWorkOrder={
        useRemoteWorkOrders
          ? async (id) => {
              await deleteMutation.mutateAsync(id);
            }
          : undefined
      }
      onAddEvidence={
        useRemoteWorkOrders
          ? async (id, input) => {
              await addEvidenceMutation.mutateAsync({ id, input });
            }
          : undefined
      }
      onDeleteEvidence={
        useRemoteWorkOrders
          ? async (workOrderId, evidenceId) => {
              await deleteEvidenceMutation.mutateAsync({
                workOrderId,
                evidenceId,
              });
            }
          : undefined
      }
    />
  );
}
