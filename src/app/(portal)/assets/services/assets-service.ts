import { apiClient, type ApiResponse } from '@/lib/api-client';
import {
  ASSET_WRITABLE_FIELDS,
  type Asset,
  type AssetCreatePayload,
  type AssetFieldErrors,
  type AssetListParams,
  type AssetUpdatePayload,
  type PaginatedAssets,
} from '../types';
import { splitAssetValidationErrors } from '../lib/asset-server-errors';

const ERROR_MESSAGES = {
  401: 'Tu sesión expiró. Inicia sesión nuevamente.',
  403: 'No tienes permiso para realizar esta acción. Verifica que tu usuario esté activo y asignado a una empresa.',
  404: 'El activo no existe o fue eliminado.',
  409: 'Ya existe un activo con ese código en tu empresa.',
  422: 'Hay datos inválidos. Revisa los campos del activo.',
  network: 'No se pudo conectar con el servidor. Intenta de nuevo.',
  noChanges: 'No hay cambios para guardar.',
} as const;

/** Error thrown by the portal assets service. `status` is the HTTP status (0 = network). */
export class AssetApiError extends Error {
  readonly status: number;
  readonly fieldErrors: AssetFieldErrors;
  /** Raw backend `detail` message, kept for diagnostics. */
  readonly detail?: string;

  constructor(
    message: string,
    status: number,
    fieldErrors: AssetFieldErrors = {},
    detail?: string,
  ) {
    super(message);
    this.name = 'AssetApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.detail = detail;
  }
}

export function isAssetApiError(error: unknown): error is AssetApiError {
  return error instanceof AssetApiError;
}

/** 422 error: per-field messages go to `fieldErrors`, the rest to `message`. */
function toValidationError(
  response: ApiResponse<unknown>,
  detail: string | undefined,
): AssetApiError {
  const { fieldErrors, generalErrors } = splitAssetValidationErrors(
    response.error?.validationErrors ?? [],
  );
  const message =
    generalErrors.length > 0
      ? `Hay datos inválidos: ${generalErrors.join(' ')}`
      : ERROR_MESSAGES[422];
  return new AssetApiError(message, 422, fieldErrors, detail);
}

/**
 * Maps a failed API response to a user-facing Spanish error.
 * 422 validation issues are translated and keyed by asset field; 409 always
 * maps to `code`.
 */
export function toAssetApiError(
  response: ApiResponse<unknown>,
  fallback: string,
): AssetApiError {
  const { status } = response;
  const detail = response.error?.message;

  switch (status) {
    case 401:
    case 403:
    case 404:
      return new AssetApiError(ERROR_MESSAGES[status], status, {}, detail);
    case 422:
      return toValidationError(response, detail);
    case 409:
      return new AssetApiError(
        ERROR_MESSAGES[409],
        status,
        { code: ERROR_MESSAGES[409] },
        detail,
      );
    case 0:
      return new AssetApiError(
        response.error?.code === 'SESSION_CHANGED' && detail
          ? detail
          : ERROR_MESSAGES.network,
        status,
        {},
        detail,
      );
    default:
      return new AssetApiError(detail || fallback, status, {}, detail);
  }
}

/** Keeps only fields the backend accepts; drops company_id, is_active, etc. */
function pickWritable(payload: AssetUpdatePayload): AssetUpdatePayload {
  const body: Record<string, unknown> = {};
  for (const field of ASSET_WRITABLE_FIELDS) {
    if (payload[field] !== undefined) body[field] = payload[field];
  }
  return body as AssetUpdatePayload;
}

export function buildAssetListQuery(params: AssetListParams): string {
  const searchParams = new URLSearchParams();
  searchParams.set('page', String(params.page));
  searchParams.set('size', String(params.size));
  if (params.criticality) searchParams.set('criticality', params.criticality);
  if (params.status) searchParams.set('status', params.status);
  return searchParams.toString();
}

export const assetsService = {
  listAssets: async (params: AssetListParams): Promise<PaginatedAssets> => {
    const response = await apiClient<PaginatedAssets>(
      `/assets/?${buildAssetListQuery(params)}`,
      { method: 'GET' },
    );
    if (!response.ok)
      throw toAssetApiError(response, 'Error al obtener activos');
    return response.data as PaginatedAssets;
  },

  getAssetById: async (id: string): Promise<Asset> => {
    const response = await apiClient<Asset>(
      `/assets/${encodeURIComponent(id)}`,
      { method: 'GET' },
    );
    if (!response.ok)
      throw toAssetApiError(response, 'Error al obtener activo');
    return response.data as Asset;
  },

  createAsset: async (payload: AssetCreatePayload): Promise<Asset> => {
    const response = await apiClient<Asset>('/assets/', {
      method: 'POST',
      body: JSON.stringify(pickWritable(payload)),
    });
    if (!response.ok) throw toAssetApiError(response, 'Error al crear activo');
    return response.data as Asset;
  },

  /** Partial update via PUT. Rejects locally when there is nothing to send. */
  updateAsset: async (
    id: string,
    payload: AssetUpdatePayload,
  ): Promise<Asset> => {
    const body = pickWritable(payload);
    if (Object.keys(body).length === 0) {
      throw new AssetApiError(ERROR_MESSAGES.noChanges, 0);
    }
    const response = await apiClient<Asset>(
      `/assets/${encodeURIComponent(id)}`,
      { method: 'PUT', body: JSON.stringify(body) },
    );
    if (!response.ok)
      throw toAssetApiError(response, 'Error al actualizar activo');
    return response.data as Asset;
  },

  /** Soft delete (204 No Content). */
  deleteAsset: async (id: string): Promise<void> => {
    const response = await apiClient(`/assets/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!response.ok)
      throw toAssetApiError(response, 'Error al eliminar activo');
  },
};
