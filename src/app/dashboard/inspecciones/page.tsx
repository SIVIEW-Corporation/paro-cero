'use client';

import { InspeccionesScreen } from '@/app/screens3';
import { getRolePermissions } from '@/features/technician/access';
import { useAssetsQuery } from '@/hooks/use-assets-query';
import { useAssetSession } from '@/hooks/use-asset-session';
import {
  useCreateInspectionFindingsMutation,
  useCreateInspectionMutation,
  useCreateInspectionTemplateMutation,
  useInspectionsQuery,
  useUpdateInspectionExecutionMutation,
  useUpdateInspectionFindingMutation,
} from '@/hooks/use-inspections-query';
import { useCreateWorkOrderMutation } from '@/hooks/use-work-order-mutations';
import { useWorkOrdersQuery } from '@/hooks/use-work-orders-query';
import { useAuthStore } from '@/store/auth-store';
import {
  mapInspection,
  mapInspectionFinding,
  mapInspectionTemplate,
} from '@/services/inspections-service';

export default function InspeccionesPage() {
  const role = useAuthStore((state) => state.user?.role);
  const permissions = getRolePermissions(role)?.inspections;
  const assetSession = useAssetSession();
  const assetsQuery = useAssetsQuery();
  const inspectionsQuery = useInspectionsQuery(permissions?.read ?? false);
  const createTemplate = useCreateInspectionTemplateMutation();
  const createInspection = useCreateInspectionMutation();
  const updateInspection = useUpdateInspectionExecutionMutation();
  const createFindings = useCreateInspectionFindingsMutation();
  const updateFinding = useUpdateInspectionFindingMutation();
  const createWorkOrder = useCreateWorkOrderMutation();
  const workOrdersQuery = useWorkOrdersQuery();

  if (!(permissions?.read ?? false) || !assetSession.canRead) {
    return (
      <InspectionsMessage
        message='Tu sesión no tiene permisos para consultar las inspecciones.'
        isError
      />
    );
  }

  if (assetsQuery.isPending || inspectionsQuery.isPending) {
    return <InspectionsMessage message='Cargando inspecciones y activos…' />;
  }

  if (assetsQuery.isError || inspectionsQuery.isError) {
    return (
      <InspectionsMessage
        message={
          assetsQuery.error?.message ||
          inspectionsQuery.error?.message ||
          'No se pudieron cargar las inspecciones.'
        }
        isError
        onRetry={() => {
          void assetsQuery.refetch();
          void inspectionsQuery.refetch();
        }}
      />
    );
  }

  const assets = assetsQuery.data.items;
  const bundle = inspectionsQuery.data;
  const isSaving = Boolean(
    createTemplate.isPending ||
    createInspection.isPending ||
    updateInspection.isPending ||
    createFindings.isPending ||
    updateFinding.isPending ||
    createWorkOrder.isPending,
  );

  return (
    <InspeccionesScreen
      checklists={bundle.inspections.map(mapInspection)}
      hallazgos={bundle.findings.map(mapInspectionFinding)}
      plantillas={bundle.templates.map((template) =>
        mapInspectionTemplate(template, assets),
      )}
      assets={assets}
      workOrders={workOrdersQuery.data?.items ?? []}
      isSaving={isSaving}
      canManage={permissions?.manage ?? false}
      canExecute={permissions?.execute ?? false}
      canRegisterFinding={permissions?.registerFinding ?? false}
      canCreateWorkOrder={permissions?.createWorkOrder ?? false}
      onCreateInspection={async (input) => {
        await createInspection.mutateAsync(input);
      }}
      onUpdateInspection={async (id, input) => {
        await updateInspection.mutateAsync({ id, input });
      }}
      onCreateTemplate={async (input) => {
        await createTemplate.mutateAsync(input);
      }}
      onCreateFindings={async (input) => {
        await createFindings.mutateAsync(input);
      }}
      onUpdateFinding={async (id, input) => {
        await updateFinding.mutateAsync({ id, input });
      }}
      onCreateWorkOrder={async (input) => {
        const workOrder = await createWorkOrder.mutateAsync(input);
        return workOrder.id;
      }}
    />
  );
}

function InspectionsMessage({
  message,
  isError = false,
  onRetry,
}: {
  message: string;
  isError?: boolean;
  onRetry?: () => void;
}) {
  return (
    <div className='flex h-full items-center justify-center p-6'>
      <div
        role={isError ? 'alert' : 'status'}
        className={`max-w-xl rounded-xl border p-5 text-sm ${isError ? 'border-shDanger-200 bg-shDanger-50 text-shDanger-800' : 'border-shNeutral-200 text-shNeutral-700 bg-white'}`}
      >
        <p>{message}</p>
        {onRetry && (
          <button
            type='button'
            onClick={onRetry}
            className='bg-shPrimary-800 hover:bg-shPrimary-900 mt-3 rounded-lg px-3 py-2 font-semibold text-white'
          >
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
}
