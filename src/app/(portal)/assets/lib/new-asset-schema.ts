import { z } from 'zod';
import {
  ASSET_COST_MAX,
  ASSET_CRITICALITIES,
  ASSET_DEFAULT_CRITICALITY,
  ASSET_DEFAULT_STATUS,
  ASSET_STATUSES,
  ASSET_TEXT_LIMITS,
  type AssetCriticality,
  type AssetStatus,
} from '../types';

/** Raw values held by the create/edit forms (inputs always yield strings). */
export interface AssetFormValues {
  name: string;
  area: string;
  code: string;
  serial: string;
  model: string;
  manufacturer: string;
  /** Integer as typed by the user; '' means "no cost". */
  cost: string;
  status: AssetStatus;
  criticality: AssetCriticality;
  /** `YYYY-MM-DD` from a date input; '' means "no date". */
  installedAt: string;
}

export const EMPTY_ASSET_FORM_VALUES: AssetFormValues = {
  name: '',
  area: '',
  code: '',
  serial: '',
  model: '',
  manufacturer: '',
  cost: '',
  status: ASSET_DEFAULT_STATUS,
  criticality: ASSET_DEFAULT_CRITICALITY,
  installedAt: '',
};

const DATE_INPUT_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** True for a real calendar date in `YYYY-MM-DD` form (rejects 2024-02-30). */
export function isValidDateInput(value: string): boolean {
  if (!DATE_INPUT_PATTERN.test(value)) return false;
  const time = Date.parse(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(time) && new Date(time).toISOString().slice(0, 10) === value
  );
}

/** Required text: trimmed, not whitespace-only, bounded length. */
const requiredText = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} es obligatorio.`)
    .max(max, `${label} admite máximo ${max} caracteres.`);

/** Optional text: no minimum, bounded length, empty → null. */
const optionalText = (label: string, max: number) =>
  z
    .string()
    .trim()
    .max(max, `${label} admite máximo ${max} caracteres.`)
    .transform((value) => (value === '' ? null : value));

export const costSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === '' || /^\d+$/.test(value),
    'El costo debe ser un número entero mayor o igual a cero.',
  )
  .refine(
    (value) => value === '' || Number(value) <= ASSET_COST_MAX,
    `El costo no puede superar ${ASSET_COST_MAX}.`,
  )
  .transform((value) => (value === '' ? null : Number(value)));

export const installedAtSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === '' || isValidDateInput(value),
    'Ingresa una fecha de instalación válida.',
  );

export const newAssetSchema = z.object({
  name: requiredText('El nombre', ASSET_TEXT_LIMITS.name),
  area: requiredText('El área', ASSET_TEXT_LIMITS.area),
  code: requiredText('El código', ASSET_TEXT_LIMITS.code),
  serial: optionalText('El serial', ASSET_TEXT_LIMITS.serial),
  model: optionalText('El modelo', ASSET_TEXT_LIMITS.model),
  manufacturer: optionalText('El fabricante', ASSET_TEXT_LIMITS.manufacturer),
  cost: costSchema,
  status: z.enum(ASSET_STATUSES).default(ASSET_DEFAULT_STATUS),
  criticality: z.enum(ASSET_CRITICALITIES).default(ASSET_DEFAULT_CRITICALITY),
  installedAt: installedAtSchema,
});

export type NewAssetSchema = z.output<typeof newAssetSchema>;
