'use client';

import { ReportsScreen } from '@/app/screens2';
import { useAssetsQuery } from '@/hooks/use-assets-query';
import { useAssetSession } from '@/hooks/use-asset-session';
import { useWorkOrderSession } from '@/hooks/use-work-order-session';
import { useWorkOrdersQuery } from '@/hooks/use-work-orders-query';

export default function ReportsPage() {
  const workOrderSession = useWorkOrderSession();
  const assetSession = useAssetSession();
  const workOrdersQuery = useWorkOrdersQuery();
  const assetsQuery = useAssetsQuery();

  if (!workOrderSession.canRead || !assetSession.canRead) {
    return (
      <ReportMessage message='Tu sesión no tiene permisos para consultar reportes.' />
    );
  }

  if (workOrdersQuery.isPending || assetsQuery.isPending) {
    return <ReportMessage message='Cargando órdenes y activos…' />;
  }

  if (workOrdersQuery.isError || assetsQuery.isError) {
    return (
      <ReportMessage
        isError
        message={
          workOrdersQuery.error?.message ||
          assetsQuery.error?.message ||
          'No se pudieron cargar los datos del reporte.'
        }
      />
    );
  }

  return (
    <ReportsScreen
      wo={workOrdersQuery.data.items}
      assets={assetsQuery.data.items}
    />
  );
}

function ReportMessage({
  message,
  isError = false,
}: {
  message: string;
  isError?: boolean;
}) {
  return (
    <div className='flex h-full items-center justify-center p-6'>
      <div
        role={isError ? 'alert' : 'status'}
        className={`max-w-xl rounded-xl border p-5 text-sm ${isError ? 'border-shDanger-200 bg-shDanger-50 text-shDanger-800' : 'border-shNeutral-200 text-shNeutral-700 bg-white'}`}
      >
        {message}
      </div>
    </div>
  );
}
