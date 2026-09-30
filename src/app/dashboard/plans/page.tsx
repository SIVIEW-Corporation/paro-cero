'use client';

import { PlansScreen } from '@/app/screens2';
import { useAuthStore } from '@/store/auth-store';
import { getRolePermissions } from '@/features/technician/access';
import { useAssetsQuery } from '@/hooks/use-assets-query';
import { useAssetSession } from '@/hooks/use-asset-session';
import {
  useCreatePlanMutation,
  usePlansQuery,
  useUpdatePlanExecutionMutation,
} from '@/hooks/use-plans-query';
import { mapApiPlan } from '@/services/plans-service';

export default function PlansPage() {
  const role = useAuthStore((state) => state.user?.role);
  const planPermissions = getRolePermissions(role)?.plans;
  const assetsSession = useAssetSession();
  const assetsQuery = useAssetsQuery();
  const plansQuery = usePlansQuery(planPermissions?.read ?? false);
  const createPlan = useCreatePlanMutation();
  const updateExecution = useUpdatePlanExecutionMutation();

  if (!(planPermissions?.read ?? false) || !assetsSession.canRead) {
    return (
      <PlansMessage
        message='Tu sesión no tiene permisos para consultar los planes.'
        isError
      />
    );
  }

  if (plansQuery.isPending || assetsQuery.isPending) {
    return <PlansMessage message='Cargando planes y activos…' />;
  }

  if (plansQuery.isError || assetsQuery.isError) {
    return (
      <PlansMessage
        message={
          plansQuery.error?.message ||
          assetsQuery.error?.message ||
          'No se pudieron cargar los planes.'
        }
        isError
        onRetry={() => {
          void plansQuery.refetch();
          void assetsQuery.refetch();
        }}
      />
    );
  }

  return (
    <PlansScreen
      plans={(plansQuery.data ?? []).map(mapApiPlan)}
      assets={assetsQuery.data.items}
      canManagePlans={planPermissions?.manage ?? false}
      canExecutePlans={planPermissions?.execute ?? false}
      isCreating={createPlan.isPending}
      isUpdatingExecution={updateExecution.isPending}
      onCreatePlan={async (input) => {
        await createPlan.mutateAsync(input);
      }}
      onUpdateExecution={async (id, input) => {
        await updateExecution.mutateAsync({ id, input });
      }}
    />
  );
}

function PlansMessage({
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
