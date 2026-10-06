/**
 * Portal assets module types. Source of truth: backend `src/modules/assets`
 * contract (see ./API.md). Kept local so the portal never depends on the
 * legacy `/dashboard/assets` flow.
 */

export const ASSET_STATUSES = [
  'commissioning',
  'operational',
  'standby',
  'maintenance',
  'down',
  'decommissioned',
] as const;

export type AssetStatus = (typeof ASSET_STATUSES)[number];

export const ASSET_STATUS_LABELS: Record<AssetStatus, string> = {
  commissioning: 'En instalación',
  operational: 'Operando',
  standby: 'En espera',
  maintenance: 'En mantenimiento',
  down: 'Fuera de servicio',
  decommissioned: 'Dado de baja',
};

export const ASSET_CRITICALITIES = [
  'low',
  'medium',
  'high',
  'critical',
] as const;

export type AssetCriticality = (typeof ASSET_CRITICALITIES)[number];

export const ASSET_CRITICALITY_LABELS: Record<AssetCriticality, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  critical: 'Crítica',
};

export const ASSET_DEFAULT_STATUS: AssetStatus = 'commissioning';
export const ASSET_DEFAULT_CRITICALITY: AssetCriticality = 'medium';

/** PostgreSQL INTEGER upper bound accepted by the backend for `cost`. */
export const ASSET_COST_MAX = 2147483647;

export const ASSET_TEXT_LIMITS = {
  name: 100,
  area: 100,
  code: 20,
  serial: 20,
  model: 100,
  manufacturer: 100,
} as const;

export const ASSET_PAGE_SIZE = 10;

export interface Asset {
  id: string;
  company_id: string;
  name: string;
  area: string;
  code: string;
  serial: string | null;
  model: string | null;
  manufacturer: string | null;
  cost: number | null;
  criticality: AssetCriticality;
  status: AssetStatus;
  installed_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
}

export interface PaginatedAssets {
  items: Asset[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

/** Body accepted by `POST /assets/`. `company_id`/`is_active` are never sent. */
export interface AssetCreatePayload {
  name: string;
  area: string;
  code: string;
  criticality: AssetCriticality;
  status?: AssetStatus;
  serial?: string | null;
  model?: string | null;
  manufacturer?: string | null;
  cost?: number | null;
  installed_at?: string | null;
}

/** Partial body accepted by `PUT /assets/{id}`; `null` clears nullable fields. */
export type AssetUpdatePayload = Partial<AssetCreatePayload>;

export type AssetWritableField = keyof AssetCreatePayload;

export const ASSET_WRITABLE_FIELDS: readonly AssetWritableField[] = [
  'name',
  'area',
  'code',
  'serial',
  'model',
  'manufacturer',
  'cost',
  'status',
  'criticality',
  'installed_at',
];

/** Query params supported by `GET /assets/`. Sorting is fixed server-side. */
export interface AssetListParams {
  page: number;
  size: number;
  criticality?: AssetCriticality | null;
  status?: AssetStatus | null;
}

export type AssetFieldErrors = Partial<Record<AssetWritableField, string>>;
