import { format, startOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';

import type { EstadoOT, OrdenTrabajo, TipoOT } from '@/app/data/types';

const FINANCIAL_EXECUTED_STATUSES = [
  'completada',
  'cerrada',
] as const satisfies readonly EstadoOT[];

export interface MonthlyMaintenanceFinancialData {
  monthKey: string;
  monthLabel: string;
  preventiveCost: number;
  correctiveCost: number;
  otherCost: number;
  totalCost: number;
  workOrderCount: number;
  sparePartWorkOrderCount: number;
}

export interface MaintenanceFinancialSummary {
  totalMaintenanceCost: number;
  averageCostPerWorkOrder: number;
  preventiveMaintenanceCost: number;
  correctiveMaintenanceCost: number;
  workOrdersWithSparePartsCount: number;
  mostExpensiveWorkOrder: OrdenTrabajo | null;
  mostExpensiveWorkOrderCost: number;
  monthlyData: MonthlyMaintenanceFinancialData[];
  includedWorkOrderCount: number;
  hasRegisteredCosts: boolean;
}

function isExecutedStatus(status: EstadoOT) {
  return FINANCIAL_EXECUTED_STATUSES.includes(
    status as (typeof FINANCIAL_EXECUTED_STATUSES)[number],
  );
}

export function getSafeMaintenanceCost(workOrder: OrdenTrabajo) {
  if (!workOrder.gastoDinero) return 0;

  const numericCost = Number(workOrder.montoGastado);

  if (!Number.isFinite(numericCost) || numericCost <= 0) return 0;

  return numericCost;
}

export function getFinancialWorkOrderDate(workOrder: OrdenTrabajo) {
  return (
    workOrder.fechaCierre || workOrder.updatedAt || workOrder.fechaCreacion
  );
}

function getMonthBucket(dateValue: Date | string) {
  const date = startOfMonth(new Date(dateValue));

  return {
    monthKey: format(date, 'yyyy-MM'),
    monthLabel: format(date, 'MMM yyyy', { locale: es }),
  };
}

function getCostBucketByType(type: TipoOT) {
  if (type === 'preventivo') return 'preventiveCost';
  if (type === 'correctivo') return 'correctiveCost';
  return 'otherCost';
}

export function calculateMonthlyMaintenanceFinancials({
  workOrders,
  respectActiveStatusFilter,
}: {
  workOrders: OrdenTrabajo[];
  respectActiveStatusFilter: boolean;
}): MaintenanceFinancialSummary {
  const candidateWorkOrders = respectActiveStatusFilter
    ? workOrders
    : workOrders.filter((workOrder) => isExecutedStatus(workOrder.status));
  const monthlyMap = new Map<string, MonthlyMaintenanceFinancialData>();
  let totalMaintenanceCost = 0;
  let preventiveMaintenanceCost = 0;
  let correctiveMaintenanceCost = 0;
  let workOrdersWithSparePartsCount = 0;
  let mostExpensiveWorkOrder: OrdenTrabajo | null = null;
  let mostExpensiveWorkOrderCost = 0;
  let costBearingWorkOrderCount = 0;

  candidateWorkOrders.forEach((workOrder) => {
    const cost = getSafeMaintenanceCost(workOrder);

    if (cost <= 0) return;

    const bucketDate = getFinancialWorkOrderDate(workOrder);
    const monthBucket = getMonthBucket(bucketDate);
    const existingMonth = monthlyMap.get(monthBucket.monthKey) ?? {
      ...monthBucket,
      preventiveCost: 0,
      correctiveCost: 0,
      otherCost: 0,
      totalCost: 0,
      workOrderCount: 0,
      sparePartWorkOrderCount: 0,
    };
    const typeBucket = getCostBucketByType(workOrder.tipo);

    existingMonth[typeBucket] += cost;
    existingMonth.totalCost += cost;
    existingMonth.workOrderCount += 1;

    if (workOrder.usoRefaccionConsumible) {
      existingMonth.sparePartWorkOrderCount += 1;
      workOrdersWithSparePartsCount += 1;
    }

    monthlyMap.set(monthBucket.monthKey, existingMonth);

    totalMaintenanceCost += cost;
    costBearingWorkOrderCount += 1;

    if (workOrder.tipo === 'preventivo') {
      preventiveMaintenanceCost += cost;
    } else if (workOrder.tipo === 'correctivo') {
      correctiveMaintenanceCost += cost;
    }

    if (cost > mostExpensiveWorkOrderCost) {
      mostExpensiveWorkOrder = workOrder;
      mostExpensiveWorkOrderCost = cost;
    }
  });

  return {
    totalMaintenanceCost,
    averageCostPerWorkOrder:
      costBearingWorkOrderCount > 0
        ? totalMaintenanceCost / costBearingWorkOrderCount
        : 0,
    preventiveMaintenanceCost,
    correctiveMaintenanceCost,
    workOrdersWithSparePartsCount,
    mostExpensiveWorkOrder,
    mostExpensiveWorkOrderCost,
    monthlyData: Array.from(monthlyMap.values()).sort((first, second) =>
      first.monthKey.localeCompare(second.monthKey),
    ),
    includedWorkOrderCount: costBearingWorkOrderCount,
    hasRegisteredCosts: totalMaintenanceCost > 0,
  };
}

export function formatMxnCurrency(value: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(value);
}
