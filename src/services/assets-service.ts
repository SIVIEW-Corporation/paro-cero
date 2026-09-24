import {
  apiClient,
  type ApiClientOptions,
  type ApiResponse,
} from '@/lib/api-client';
import type { Activo, Criticidad, EstadoActivo } from '@/app/data/types';

export const API_ASSET_STATUS = {
  COMMISSIONING: 'commissioning',
  OPERATIONAL: 'operational',
  STANDBY: 'standby',
  MAINTENANCE: 'maintenance',
  DOWN: 'down',
  DECOMMISSIONED: 'decommissioned',
} as const;

export type ApiAssetStatus =
  (typeof API_ASSET_STATUS)[keyof typeof API_ASSET_STATUS];

export const API_ASSET_CRITICALITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export type ApiAssetCriticality =
  (typeof API_ASSET_CRITICALITY)[keyof typeof API_ASSET_CRITICALITY];

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

export interface AssetCreateInput {
  name: string;
  area: string;
  code: string;
  serial: string | null;
  model: string | null;
  manufacturer: string | null;
  cost: number | null;
  status: ApiAssetStatus;
  criticality: ApiAssetCriticality;
  installed_at: string | null;
}

export type AssetUpdateInput = Partial<AssetCreateInput>;

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

const ASSET_PAGE_SIZE = 100;

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

function assetError(response: ApiResponse<unknown>, fallback: string): Error {
  if (response.status === 409)
    return new Error('Ya existe un activo con ese código. Usa otro código.');
  if (response.status === 422)
    return new Error('Revisa los campos del activo. Hay datos inválidos.');
  return new Error(response.error?.message || fallback);
}

function assertCurrent(options?: ApiClientOptions) {
  if (options?.isRequestCurrent && !options.isRequestCurrent()) {
    throw new Error('La sesión cambió. Vuelve a abrir el activo.');
  }
}

export const assetsService = {
  getAssets: async (
    page: number = 1,
    size: number = 100,
    options?: ApiClientOptions,
  ): Promise<PaginatedAssetsResponse> => {
    const response = await apiClient<{
      items: ApiAsset[];
      total: number;
      page: number;
      size: number;
      pages: number;
    }>(`/assets/?page=${page}&size=${size}`, options);
    assertCurrent(options);

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

  getAllAssets: async (
    options?: ApiClientOptions,
  ): Promise<PaginatedAssetsResponse> => {
    const firstPage = await assetsService.getAssets(
      1,
      ASSET_PAGE_SIZE,
      options,
    );
    const items = [...firstPage.items];

    for (let page = 2; page <= firstPage.pages; page += 1) {
      const nextPage = await assetsService.getAssets(
        page,
        ASSET_PAGE_SIZE,
        options,
      );
      items.push(...nextPage.items);
    }

    return { ...firstPage, items };
  },

  getAsset: async (
    assetId: string,
    options?: ApiClientOptions,
  ): Promise<ApiAsset> => {
    const response = await apiClient<ApiAsset>(`/assets/${assetId}`, options);
    assertCurrent(options);
    if (!response.ok) throw assetError(response, 'Error al obtener activo');
    return response.data as ApiAsset;
  },

  createAsset: async (
    data: AssetCreateInput,
    options?: ApiClientOptions,
  ): Promise<Activo> => {
    const response = await apiClient<ApiAsset>('/assets/', {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
    assertCurrent(options);

    if (!response.ok) {
      throw assetError(response, 'Error al crear activo');
    }

    return mapApiAssetToActivo(response.data as ApiAsset);
  },

  updateAsset: async (
    assetId: string,
    data: AssetUpdateInput,
    options?: ApiClientOptions,
  ): Promise<Activo> => {
    const response = await apiClient<ApiAsset>(`/assets/${assetId}`, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
    assertCurrent(options);

    if (!response.ok) {
      throw assetError(response, 'Error al actualizar activo');
    }

    return mapApiAssetToActivo(response.data as ApiAsset);
  },

  deleteAsset: async (
    assetId: string,
    options?: ApiClientOptions,
  ): Promise<void> => {
    const response = await apiClient(`/assets/${assetId}`, {
      ...options,
      method: 'DELETE',
    });
    assertCurrent(options);

    if (!response.ok) {
      throw assetError(response, 'Error al eliminar activo');
    }
  },
};
