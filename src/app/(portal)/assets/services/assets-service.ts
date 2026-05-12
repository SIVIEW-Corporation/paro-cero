import { apiClient } from '@/lib/api-client';
import { NewAssetSchema } from '../lib/new-asset-schema';
import { Asset } from '@/store/auth-store';

export interface PaginatedAssetsResponse {
  items: Asset[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface GetAssetsParams {
  offset: number;
  limit: number;
  sortBy?: string;
  sortOrder?: string;
  criticality?: string | null;
  status?: string | null;
  area?: string | null;
  code?: string | null;
  serial?: string | null;
  manufacturer?: string | null;
}

export interface UpdateAssetParams {
  name?: string;
  area?: string;
  code?: string;
  serial?: string | null;
  model?: string | null;
  manufacturer?: string | null;
  cost?: number | null;
  status?: string;
  criticality?: string;
  installedAt?: string | null;
  isActive?: boolean;
}

export const assetsService = {
  /**
   * Create a new asset sending data to the backend.
   * Transforms camelCase fields to snake_case for API compatibility.
   */
  createAsset: async (values: NewAssetSchema): Promise<Asset> => {
    // Transform camelCase to snake_case for API
    const body = {
      name: values.name,
      area: values.area,
      code: values.code,
      serial: values.serial,
      model: values.model,
      manufacturer: values.manufacturer,
      cost: values.cost,
      company_id: values.companyId,
      status: values.status,
      criticality: values.criticality,
      installed_at: values.installedAt,
    };

    const response = await apiClient.post<Asset>('/assets', body);

    if (!response.ok) {
      throw new Error(response.error?.message || 'Error al crear activo');
    }

    return response.data as Asset;
  },

  /**
   * Fetch paginated assets with optional filters and sorting.
   * Uses URLSearchParams to only include non-null params.
   */
  getAssets: async (
    params: GetAssetsParams,
  ): Promise<PaginatedAssetsResponse> => {
    const {
      offset,
      limit,
      sortBy,
      sortOrder,
      criticality,
      status,
      area,
      code,
      serial,
      manufacturer,
    } = params;

    const searchParams = new URLSearchParams();
    searchParams.set('offset', String(offset));
    searchParams.set('limit', String(limit));
    searchParams.set('include_inactive', 'false');

    if (sortBy) searchParams.set('sort_by', sortBy);
    if (sortOrder) searchParams.set('sort_order', sortOrder);
    if (criticality) searchParams.set('criticality', criticality);
    if (status) searchParams.set('status', status);
    if (area) searchParams.set('area', area);
    if (code) searchParams.set('code', code);
    if (serial) searchParams.set('serial', serial);
    if (manufacturer) searchParams.set('manufacturer', manufacturer);

    const response = await apiClient.get<PaginatedAssetsResponse>(
      `/assets/?${searchParams.toString()}`,
    );

    if (!response.ok) {
      throw new Error(response.error?.message || 'Error al traer activos');
    }

    return response.data as PaginatedAssetsResponse;
  },

  /**
   * Partially update an existing asset by ID via PATCH.
   * Transforms camelCase fields to snake_case for API compatibility.
   * Only includes fields that have values (not undefined).
   */
  updateAsset: async (
    id: string,
    values: UpdateAssetParams,
  ): Promise<Asset> => {
    const body: Record<string, unknown> = {};

    if (values.name !== undefined) body.name = values.name;
    if (values.area !== undefined) body.area = values.area;
    if (values.code !== undefined) body.code = values.code;
    if (values.serial !== undefined) body.serial = values.serial;
    if (values.model !== undefined) body.model = values.model;
    if (values.manufacturer !== undefined)
      body.manufacturer = values.manufacturer;
    if (values.cost !== undefined) body.cost = values.cost;
    if (values.status !== undefined) body.status = values.status;
    if (values.criticality !== undefined) body.criticality = values.criticality;
    if (values.installedAt !== undefined)
      body.installed_at = values.installedAt;
    if (values.isActive !== undefined) body.is_active = values.isActive;

    const response = await apiClient.patch<Asset>(`/assets/${id}`, body);

    if (!response.ok) {
      throw new Error(response.error?.message || 'Error al actualizar activo');
    }

    return response.data as Asset;
  },

  /**
   * Delete an asset by ID.
   */
  deleteAsset: async (id: string): Promise<void> => {
    const response = await apiClient.delete(`/assets/${id}`);

    if (!response.ok) {
      throw new Error(response.error?.message || 'Error al eliminar activo');
    }
  },
};
