import type { Asset, AssetCreatePayload, AssetUpdatePayload } from '../types';
import {
  isValidDateInput,
  newAssetSchema,
  type AssetFormValues,
} from './new-asset-schema';

/**
 * Serializes a `YYYY-MM-DD` date input as UTC midnight so the stored day never
 * shifts with the browser time zone. Empty input clears the date (null).
 */
export function serializeInstalledAt(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!isValidDateInput(trimmed)) {
    throw new Error('Revisa la fecha de instalación.');
  }
  return `${trimmed}T00:00:00.000Z`;
}

/** `YYYY-MM-DD` (UTC day) for a date input, or '' when there is no date. */
export function installedAtToInput(value: string | null): string {
  if (!value) return '';
  const time = Date.parse(value);
  return Number.isNaN(time) ? '' : new Date(time).toISOString().slice(0, 10);
}

export function assetToFormValues(asset: Asset): AssetFormValues {
  return {
    name: asset.name,
    area: asset.area,
    code: asset.code,
    serial: asset.serial ?? '',
    model: asset.model ?? '',
    manufacturer: asset.manufacturer ?? '',
    cost: asset.cost === null ? '' : String(asset.cost),
    status: asset.status,
    criticality: asset.criticality,
    installedAt: installedAtToInput(asset.installed_at),
  };
}

/** Validates the form and builds the POST body (trimmed, nulls for empties). */
export function buildAssetCreatePayload(
  values: AssetFormValues,
): AssetCreatePayload {
  const parsed = newAssetSchema.parse(values);
  return {
    name: parsed.name,
    area: parsed.area,
    code: parsed.code,
    serial: parsed.serial,
    model: parsed.model,
    manufacturer: parsed.manufacturer,
    cost: parsed.cost,
    status: parsed.status,
    criticality: parsed.criticality,
    installed_at: serializeInstalledAt(parsed.installedAt),
  };
}

/**
 * Builds a minimal PUT body: only fields the user actually changed. Raw form
 * values are compared first so untouched values (e.g. stored with surrounding
 * spaces, or a full timestamp shown as a date) are never rewritten.
 * An empty object means "nothing changed" and the request must be skipped.
 */
export function buildAssetUpdatePayload(
  asset: Asset,
  values: AssetFormValues,
): AssetUpdatePayload {
  const parsed = newAssetSchema.parse(values);
  const original = assetToFormValues(asset);
  const payload: AssetUpdatePayload = {};

  for (const key of ['name', 'area', 'code'] as const) {
    if (values[key] !== original[key] && parsed[key] !== asset[key]) {
      payload[key] = parsed[key];
    }
  }
  for (const key of ['serial', 'model', 'manufacturer'] as const) {
    if (values[key] !== original[key] && parsed[key] !== asset[key]) {
      payload[key] = parsed[key];
    }
  }
  if (values.cost !== original.cost && parsed.cost !== asset.cost) {
    payload.cost = parsed.cost;
  }
  if (parsed.status !== asset.status) payload.status = parsed.status;
  if (parsed.criticality !== asset.criticality) {
    payload.criticality = parsed.criticality;
  }
  if (values.installedAt.trim() !== original.installedAt) {
    payload.installed_at = serializeInstalledAt(parsed.installedAt);
  }
  return payload;
}

export function hasAssetChanges(payload: AssetUpdatePayload): boolean {
  return Object.keys(payload).length > 0;
}
