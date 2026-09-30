import {
  apiClient,
  type ApiClientOptions,
  type ApiResponse,
} from '@/lib/api-client';
import type {
  CierreAdministrativo,
  CierreTecnico,
  EstadoOT,
  Evidencia,
  HistorialCambio,
  OrdenTrabajo,
  PrioridadOT,
  TipoOT,
} from '@/app/data/types';

export interface ApiWorkOrderHistoryEntry {
  id: string;
  occurred_at: string;
  user_id: string | null;
  user_name: string;
  field: string;
  old_value: string | null;
  new_value: string | null;
}

export interface ApiWorkOrderEvidence {
  id: string;
  evidence_type: 'foto' | 'documento';
  url: string;
  name: string;
  uploaded_at: string;
}

export interface ApiWorkOrder {
  id: string;
  company_id: string;
  folio: string;
  asset_id: string;
  title: string;
  description: string;
  work_order_type: TipoOT;
  status: EstadoOT;
  priority: PrioridadOT;
  technician_id: string | null;
  technician_name?: string | null;
  created_by: string;
  due_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  closed_at: string | null;
  problem_description: string | null;
  service_description: string | null;
  observations: string | null;
  spending: boolean;
  spent_amount: number | null;
  uses_consumable: boolean;
  consumable_detail: string | null;
  root_cause: string | null;
  action_taken: string | null;
  downtime_minutes: number;
  evidences: ApiWorkOrderEvidence[];
  history: ApiWorkOrderHistoryEntry[];
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
}

export interface WorkOrderCreateInput {
  assetId: string;
  title: string;
  description: string;
  type: TipoOT;
  priority: PrioridadOT;
  technicianId: string | null;
  dueAt: string | null;
  problemDescription: string | null;
  serviceDescription: string | null;
  spending: boolean;
  spentAmount: number | null;
  usesConsumable: boolean;
  consumableDetail: string | null;
  downtimeMinutes: number;
}

export interface WorkOrderEvidenceCreateInput {
  evidenceType: 'foto' | 'documento';
  url: string;
  name: string;
}

export type WorkOrderUpdateInput = Partial<WorkOrderCreateInput>;

export interface PaginatedWorkOrdersResponse {
  items: OrdenTrabajo[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

const WORK_ORDER_PAGE_SIZE = 100;

function toDate(value: string | null | undefined, fallback: string): Date {
  const parsed = value ? new Date(value) : new Date(fallback);
  return Number.isNaN(parsed.getTime()) ? new Date(fallback) : parsed;
}

function mapEvidence(evidence: ApiWorkOrderEvidence): Evidencia {
  return {
    id: evidence.id,
    tipo: evidence.evidence_type,
    url: evidence.url,
    nombre: evidence.name,
    fechaSubida: toDate(evidence.uploaded_at, new Date().toISOString()),
  };
}

function mapHistory(entry: ApiWorkOrderHistoryEntry): HistorialCambio {
  return {
    id: entry.id,
    fecha: toDate(entry.occurred_at, new Date().toISOString()),
    usuarioId: entry.user_id ?? '',
    usuarioNombre: entry.user_name,
    campo: entry.field,
    valorAnterior: entry.old_value,
    valorNuevo: entry.new_value,
  };
}

export function mapApiWorkOrderToOrdenTrabajo(
  workOrder: ApiWorkOrder,
  currentUserName = 'Sin asignar',
): OrdenTrabajo {
  const createdAt = toDate(workOrder.created_at, new Date().toISOString());
  const descriptionProblem =
    workOrder.problem_description ?? workOrder.observations ?? '';
  const descriptionService = workOrder.service_description ?? '';
  const assignedTechnicianName = workOrder.technician_name ?? currentUserName;

  const technicalClose: CierreTecnico | undefined = workOrder.completed_at
    ? {
        tecnicoId: workOrder.technician_id ?? '',
        tecnicoNombre: assignedTechnicianName,
        fecha: toDate(workOrder.completed_at, createdAt.toISOString()),
        observaciones: descriptionService,
        firma: '',
      }
    : undefined;
  const administrativeClose: CierreAdministrativo | undefined =
    workOrder.closed_at
      ? {
          adminId: workOrder.created_by,
          adminNombre: currentUserName,
          fecha: toDate(workOrder.closed_at, createdAt.toISOString()),
          observaciones: workOrder.observations ?? '',
          firma: '',
        }
      : undefined;

  return {
    id: workOrder.id,
    empresaId: workOrder.company_id,
    folio: workOrder.folio,
    activoId: workOrder.asset_id,
    titulo: workOrder.title,
    descripcion: workOrder.description,
    tipo: workOrder.work_order_type,
    status: workOrder.status,
    prioridad: workOrder.priority,
    tecnicoId: workOrder.technician_id ?? '',
    tecnicoNombre: workOrder.technician_id
      ? assignedTechnicianName
      : 'Sin asignar',
    fechaCreacion: createdAt,
    fechaCompromiso: toDate(workOrder.due_at, createdAt.toISOString()),
    fechaInicio: workOrder.started_at
      ? toDate(workOrder.started_at, createdAt.toISOString())
      : undefined,
    fechaCierre: workOrder.closed_at
      ? toDate(workOrder.closed_at, createdAt.toISOString())
      : workOrder.completed_at
        ? toDate(workOrder.completed_at, createdAt.toISOString())
        : undefined,
    fechaCierreTecnico: technicalClose?.fecha,
    fechaCierreAdmin: administrativeClose?.fecha,
    descripcionProblema: descriptionProblem,
    descripcionServicio: descriptionService,
    observaciones: workOrder.observations ?? '',
    gastoDinero: workOrder.spending,
    montoGastado: workOrder.spent_amount ?? 0,
    usoRefaccionConsumible: workOrder.uses_consumable,
    refaccionConsumibleDetalle: workOrder.consumable_detail ?? '',
    causaRaiz: workOrder.root_cause ?? undefined,
    accionTomada: workOrder.action_taken ?? undefined,
    cierreTecnico: technicalClose,
    cierreAdministrativo: administrativeClose,
    evidencias: workOrder.evidences.map(mapEvidence),
    historial: workOrder.history.map(mapHistory),
    downtimeMinutos: workOrder.downtime_minutes,
    createdAt,
    updatedAt: toDate(workOrder.updated_at, createdAt.toISOString()),
  };
}

function mapCreateInput(input: WorkOrderCreateInput) {
  return {
    asset_id: input.assetId,
    title: input.title,
    description: input.description,
    work_order_type: input.type,
    priority: input.priority,
    technician_id: input.technicianId,
    due_at: input.dueAt,
    problem_description: input.problemDescription,
    service_description: input.serviceDescription,
    spending: input.spending,
    spent_amount: input.spentAmount,
    uses_consumable: input.usesConsumable,
    consumable_detail: input.consumableDetail,
    downtime_minutes: input.downtimeMinutes,
  };
}

function mapUpdateInput(input: WorkOrderUpdateInput) {
  const body: Record<string, unknown> = {};
  if (input.assetId !== undefined) body.asset_id = input.assetId;
  if (input.title !== undefined) body.title = input.title;
  if (input.description !== undefined) body.description = input.description;
  if (input.type !== undefined) body.work_order_type = input.type;
  if (input.priority !== undefined) body.priority = input.priority;
  if (input.technicianId !== undefined) body.technician_id = input.technicianId;
  if (input.dueAt !== undefined) body.due_at = input.dueAt;
  if (input.problemDescription !== undefined)
    body.problem_description = input.problemDescription;
  if (input.serviceDescription !== undefined)
    body.service_description = input.serviceDescription;
  if (input.spending !== undefined) body.spending = input.spending;
  if (input.spentAmount !== undefined) body.spent_amount = input.spentAmount;
  if (input.usesConsumable !== undefined)
    body.uses_consumable = input.usesConsumable;
  if (input.consumableDetail !== undefined)
    body.consumable_detail = input.consumableDetail;
  if (input.downtimeMinutes !== undefined)
    body.downtime_minutes = input.downtimeMinutes;
  return body;
}

function assertCurrent(options?: ApiClientOptions) {
  if (options?.isRequestCurrent && !options.isRequestCurrent()) {
    throw new Error('La sesión cambió. Vuelve a abrir las órdenes de trabajo.');
  }
}

function workOrderError(
  response: ApiResponse<unknown>,
  fallback: string,
): Error {
  if (response.status === 409) {
    return new Error(
      response.error?.message || 'La transición de estado no es válida.',
    );
  }
  if (response.status === 422) {
    return new Error(
      response.error?.message || 'Revisa los datos de la orden.',
    );
  }
  return new Error(response.error?.message || fallback);
}

export const workOrdersService = {
  getWorkOrders: async (
    page = 1,
    size = WORK_ORDER_PAGE_SIZE,
    options?: ApiClientOptions,
  ): Promise<PaginatedWorkOrdersResponse> => {
    const response = await apiClient<{
      items: ApiWorkOrder[];
      total: number;
      page: number;
      size: number;
      pages: number;
    }>(`/work-orders/?page=${page}&size=${size}`, options);
    assertCurrent(options);
    if (!response.ok)
      throw workOrderError(response, 'Error al obtener órdenes.');
    const data = response.data as {
      items: ApiWorkOrder[];
      total: number;
      page: number;
      size: number;
      pages: number;
    };
    return {
      ...data,
      items: data.items.map((item) => mapApiWorkOrderToOrdenTrabajo(item)),
    };
  },

  getAllWorkOrders: async (
    options?: ApiClientOptions,
  ): Promise<PaginatedWorkOrdersResponse> => {
    const firstPage = await workOrdersService.getWorkOrders(
      1,
      WORK_ORDER_PAGE_SIZE,
      options,
    );
    const items = [...firstPage.items];
    for (let page = 2; page <= firstPage.pages; page += 1) {
      const nextPage = await workOrdersService.getWorkOrders(
        page,
        WORK_ORDER_PAGE_SIZE,
        options,
      );
      items.push(...nextPage.items);
    }
    return { ...firstPage, items };
  },

  createWorkOrder: async (
    input: WorkOrderCreateInput,
    options?: ApiClientOptions,
  ): Promise<ApiWorkOrder> => {
    const response = await apiClient<ApiWorkOrder>('/work-orders/', {
      ...options,
      method: 'POST',
      body: JSON.stringify(mapCreateInput(input)),
    });
    assertCurrent(options);
    if (!response.ok)
      throw workOrderError(response, 'Error al crear la orden.');
    return response.data as ApiWorkOrder;
  },

  updateWorkOrder: async (
    id: string,
    input: WorkOrderUpdateInput,
    options?: ApiClientOptions,
  ): Promise<ApiWorkOrder> => {
    const response = await apiClient<ApiWorkOrder>(`/work-orders/${id}`, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(mapUpdateInput(input)),
    });
    assertCurrent(options);
    if (!response.ok)
      throw workOrderError(response, 'Error al actualizar la orden.');
    return response.data as ApiWorkOrder;
  },

  changeStatus: async (
    id: string,
    status: EstadoOT,
    options?: ApiClientOptions,
  ): Promise<ApiWorkOrder> => {
    const response = await apiClient<ApiWorkOrder>(
      `/work-orders/${id}/status`,
      {
        ...options,
        method: 'PATCH',
        body: JSON.stringify({ status }),
      },
    );
    assertCurrent(options);
    if (!response.ok)
      throw workOrderError(response, 'Error al cambiar el estado.');
    return response.data as ApiWorkOrder;
  },

  deleteWorkOrder: async (
    id: string,
    options?: ApiClientOptions,
  ): Promise<void> => {
    const response = await apiClient(`/work-orders/${id}`, {
      ...options,
      method: 'DELETE',
    });
    assertCurrent(options);
    if (!response.ok)
      throw workOrderError(response, 'Error al eliminar la orden.');
  },

  addEvidence: async (
    id: string,
    input: WorkOrderEvidenceCreateInput,
    options?: ApiClientOptions,
  ): Promise<ApiWorkOrder> => {
    const response = await apiClient<ApiWorkOrder>(
      `/work-orders/${id}/evidences`,
      {
        ...options,
        method: 'POST',
        body: JSON.stringify({
          evidence_type: input.evidenceType,
          url: input.url,
          name: input.name,
        }),
      },
    );
    assertCurrent(options);
    if (!response.ok)
      throw workOrderError(response, 'Error al registrar la evidencia.');
    return response.data as ApiWorkOrder;
  },

  deleteEvidence: async (
    workOrderId: string,
    evidenceId: string,
    options?: ApiClientOptions,
  ): Promise<ApiWorkOrder> => {
    const response = await apiClient<ApiWorkOrder>(
      `/work-orders/${workOrderId}/evidences/${evidenceId}`,
      {
        ...options,
        method: 'DELETE',
      },
    );
    assertCurrent(options);
    if (!response.ok)
      throw workOrderError(response, 'Error al eliminar la evidencia.');
    return response.data as ApiWorkOrder;
  },
};
