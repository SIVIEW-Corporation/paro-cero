import { apiClient, type ApiClientOptions } from '@/lib/api-client';
import type { PlanMantenimiento } from '@/app/data/types';

export interface ApiPlan {
  id: string;
  name: string;
  company_id: string;
  asset_id: string;
  frequency: number;
  frequency_unit: PlanMantenimiento['unit'];
  priority: PlanMantenimiento['prioridad'];
  duration_hours: number;
  is_active: boolean;
  items: string[];
  checked_items: boolean[];
  last_completed_at: string | null;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
}

export interface PlanCreateInput {
  name: string;
  assetId: string;
  frequency: number;
  frequencyUnit: PlanMantenimiento['unit'];
  priority: PlanMantenimiento['prioridad'];
  durationHours: number;
  isActive: boolean;
  items: string[];
}

export interface PlanExecutionInput {
  checkedItems: boolean[];
  lastCompletedAt: string | null;
}

export function mapApiPlan(plan: ApiPlan): PlanMantenimiento {
  return {
    id: plan.id,
    name: plan.name,
    empresaId: plan.company_id,
    activoId: plan.asset_id,
    freq: plan.frequency,
    unit: plan.frequency_unit,
    prioridad: plan.priority,
    duracion: plan.duration_hours,
    activo: plan.is_active,
    items: plan.items,
    checkedItems: plan.checked_items,
    lastCompletedAt: plan.last_completed_at
      ? new Date(plan.last_completed_at)
      : null,
    createdAt: new Date(plan.created_at),
    updatedAt: new Date(plan.updated_at ?? plan.created_at),
  };
}

function assertCurrent(options?: ApiClientOptions) {
  if (options?.isRequestCurrent && !options.isRequestCurrent()) {
    throw new Error('La sesión cambió. Vuelve a abrir los planes.');
  }
}

export const plansService = {
  async getPlans(options?: ApiClientOptions): Promise<ApiPlan[]> {
    const response = await apiClient<ApiPlan[]>('/plans/', options);
    assertCurrent(options);
    if (!response.ok)
      throw new Error(
        response.error?.message || 'No se pudieron cargar los planes.',
      );
    return response.data ?? [];
  },

  async createPlan(
    input: PlanCreateInput,
    options?: ApiClientOptions,
  ): Promise<ApiPlan> {
    const response = await apiClient<ApiPlan>('/plans/', {
      ...options,
      method: 'POST',
      body: JSON.stringify({
        name: input.name,
        asset_id: input.assetId,
        frequency: input.frequency,
        frequency_unit: input.frequencyUnit,
        priority: input.priority,
        duration_hours: input.durationHours,
        is_active: input.isActive,
        items: input.items,
      }),
    });
    assertCurrent(options);
    if (!response.ok)
      throw new Error(response.error?.message || 'No se pudo crear el plan.');
    return response.data as ApiPlan;
  },

  async updateExecution(
    planId: string,
    input: PlanExecutionInput,
    options?: ApiClientOptions,
  ): Promise<ApiPlan> {
    const response = await apiClient<ApiPlan>(`/plans/${planId}/execution`, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify({
        checked_items: input.checkedItems,
        last_completed_at: input.lastCompletedAt,
      }),
    });
    assertCurrent(options);
    if (!response.ok)
      throw new Error(
        response.error?.message || 'No se pudo actualizar el checklist.',
      );
    return response.data as ApiPlan;
  },
};
