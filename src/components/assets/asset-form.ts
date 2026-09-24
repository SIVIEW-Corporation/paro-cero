import type {
  ApiAsset,
  ApiAssetCriticality,
  ApiAssetStatus,
  AssetCreateInput,
  AssetUpdateInput,
} from '@/services/assets-service';

export interface AssetFormState {
  code: string;
  name: string;
  area: string;
  criticality: ApiAssetCriticality;
  manufacturer: string;
  model: string;
  serial: string;
  installedAt: string;
  status: ApiAssetStatus;
  cost: string;
}

export const initialAssetForm: AssetFormState = {
  code: '',
  name: '',
  area: '',
  criticality: 'low',
  manufacturer: '',
  model: '',
  serial: '',
  installedAt: '',
  status: 'commissioning',
  cost: '',
};

export function assetToForm(asset: ApiAsset): AssetFormState {
  return {
    code: asset.code,
    name: asset.name,
    area: asset.area,
    criticality: asset.criticality,
    manufacturer: asset.manufacturer ?? '',
    model: asset.model ?? '',
    serial: asset.serial ?? '',
    installedAt: asset.installed_at?.slice(0, 10) ?? '',
    status: asset.status,
    cost: asset.cost === null ? '' : String(asset.cost),
  };
}

function serializeInstalledAt(value: string): string | null {
  if (!value) return null;
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    Number.isNaN(Date.parse(value)) ||
    new Date(value).toISOString().slice(0, 10) !== value
  ) {
    throw new Error('Revisa la fecha de instalación.');
  }
  return `${value}T00:00:00.000Z`;
}

export function buildAssetCreate(form: AssetFormState): AssetCreateInput {
  if ([form.code, form.name, form.area].some((value) => !value.trim())) {
    throw new Error('Completa código, nombre y área del activo.');
  }

  return {
    name: form.name.trim(),
    area: form.area.trim(),
    code: form.code.trim(),
    serial: form.serial.trim() || null,
    model: form.model.trim() || null,
    manufacturer: form.manufacturer.trim() || null,
    cost: null,
    status: 'commissioning',
    criticality: form.criticality,
    installed_at: serializeInstalledAt(form.installedAt),
  };
}

// Compare with raw API detail, never the lossy Activo display model. In
// particular, a date input cannot represent an installed_at time/offset.
export function buildAssetUpdate(
  asset: ApiAsset,
  form: AssetFormState,
): AssetUpdateInput {
  if ([form.code, form.name, form.area].some((value) => !value.trim())) {
    throw new Error('Completa código, nombre y área del activo.');
  }
  const original = assetToForm(asset);
  const payload: AssetUpdateInput = {};
  for (const key of ['code', 'name', 'area'] as const) {
    if (form[key] !== original[key] && form[key].trim() !== asset[key]) {
      payload[key] = form[key].trim();
    }
  }
  for (const key of ['serial', 'model', 'manufacturer'] as const) {
    const value = form[key].trim() || null;
    if (form[key] !== original[key] && value !== asset[key])
      payload[key] = value;
  }
  if (form.criticality !== asset.criticality)
    payload.criticality = form.criticality;
  if (form.status !== asset.status) payload.status = form.status;
  if (form.cost !== original.cost) {
    const cost = form.cost.trim() === '' ? null : Number(form.cost);
    if (
      cost !== null &&
      (!Number.isSafeInteger(cost) || cost < 0 || cost > 2147483647)
    ) {
      throw new Error(
        'El costo debe ser un entero mayor o igual a cero y no superar 2147483647.',
      );
    }
    if (cost !== asset.cost) payload.cost = cost;
  }
  if (form.installedAt !== original.installedAt) {
    payload.installed_at = serializeInstalledAt(form.installedAt);
  }
  return payload;
}
