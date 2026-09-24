import { apiClient } from '@/lib/api-client';
import type { Activo, Criticidad, EstadoActivo } from '@/app/data/types';

export type ApiAssetStatus =
  | 'commissioning'
  | 'operational'
  | 'standby'
  | 'maintenance'
  | 'down'
  | 'decommissioned';

export type ApiAssetCriticality = 'low' | 'medium' | 'high' | 'critical';

export interface ApiAsset {
  id: string;
  name: string;
  area: string;
  code: string;
  serial: string | null;
  model: string | null;
  manufacturer: string | null;
  cost: number | null;
  company_id: string;
  status: ApiAssetStatus;
  criticality: ApiAssetCriticality;
  installed_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
}

export interface PaginatedAssetsResponse {
  items: Activo[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

const statusMap: Record<ApiAssetStatus, EstadoActivo> = {
  commissioning: 'activo',
  operational: 'activo',
  standby: 'detenido',
  maintenance: 'mantenimiento',
  down: 'detenido',
  decommissioned: 'descomisionado',
};

const criticalityMap: Record<ApiAssetCriticality, Criticidad> = {
  low: 'baja',
  medium: 'media',
  high: 'alta',
  critical: 'critico',
};

function toDate(value: string | null, fallback: string): Date {
  const parsed = value ? new Date(value) : new Date(fallback);
  return Number.isNaN(parsed.getTime()) ? new Date(fallback) : parsed;
}

export function mapApiAssetToActivo(asset: ApiAsset): Activo {
  const createdAt = toDate(asset.created_at, new Date().toISOString());

  return {
    id: asset.id,
    empresaId: asset.company_id,
    code: asset.code,
    name: asset.name,
    area: asset.area,
    status: statusMap[asset.status],
    criticidad: criticalityMap[asset.criticality],
    fabricante: asset.manufacturer ?? '—',
    modelo: asset.model ?? '—',
    serie: asset.serial ?? '—',
    instalacion: asset.installed_at ? asset.installed_at.slice(0, 10) : '—',
    createdAt,
    updatedAt: toDate(asset.updated_at, createdAt.toISOString()),
  };
}

export const assetsService = {
  getAssets: async (
    page: number = 1,
    size: number = 100,
  ): Promise<PaginatedAssetsResponse> => {
    const response = await apiClient.get<{
      items: ApiAsset[];
      total: number;
      page: number;
      size: number;
      pages: number;
    }>(`/assets/?page=${page}&size=${size}`);

    if (!response.ok) {
      throw new Error(response.error?.message || 'Error al obtener activos');
    }

    const data = response.data as {
      items: ApiAsset[];
      total: number;
      page: number;
      size: number;
      pages: number;
    };

    return {
      ...data,
      items: data.items.map(mapApiAssetToActivo),
    };
  },
};
