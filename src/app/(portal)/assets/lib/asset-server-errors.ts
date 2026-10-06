import type { ApiValidationIssue } from '@/lib/api-client';
import {
  ASSET_WRITABLE_FIELDS,
  type AssetFieldErrors,
  type AssetWritableField,
} from '../types';
import type { AssetFormValues } from './new-asset-schema';

export type AssetFormField = keyof AssetFormValues;

export type AssetFormFieldErrors = Partial<Record<AssetFormField, string>>;

/** Spanish labels for fields that may appear in a validation `loc`. */
const FIELD_LABELS: Record<string, string> = {
  name: 'Nombre',
  area: 'Área',
  code: 'Código',
  serial: 'Serial',
  model: 'Modelo',
  manufacturer: 'Fabricante',
  cost: 'Costo',
  status: 'Estado',
  criticality: 'Criticidad',
  installed_at: 'Fecha de instalación',
  page: 'Página',
  size: 'Tamaño de página',
  asset_id: 'Activo',
};

/** Known backend `ValueError` messages (after the "Value error, " prefix). */
const VALUE_ERROR_MESSAGES: Record<string, string> = {
  'Field must not be null or blank': 'Este campo no puede estar vacío.',
  'At least one asset field must be provided':
    'Debes modificar al menos un campo del activo.',
};

const INVALID_CHOICE = 'Selecciona un valor válido.';
const INVALID_DATE = 'Ingresa una fecha válida.';
const INVALID_INTEGER = 'Debe ser un número entero.';

/** Static translations by Pydantic error `type`. */
const TYPE_MESSAGES: Record<string, string> = {
  missing: 'Este campo es obligatorio.',
  string_type: 'Debe ser texto.',
  int_parsing: INVALID_INTEGER,
  int_type: INVALID_INTEGER,
  int_from_float: INVALID_INTEGER,
  float_parsing: 'Debe ser un número.',
  float_type: 'Debe ser un número.',
  literal_error: INVALID_CHOICE,
  enum: INVALID_CHOICE,
  datetime_parsing: INVALID_DATE,
  datetime_from_date_parsing: INVALID_DATE,
  datetime_type: INVALID_DATE,
  date_parsing: INVALID_DATE,
  date_from_datetime_parsing: INVALID_DATE,
  uuid_parsing: 'El identificador no es válido.',
  uuid_type: 'El identificador no es válido.',
  json_invalid: 'La solicitud no tiene un formato JSON válido.',
};

/** Translations that interpolate one `ctx` value: [ctx key, template]. */
const CTX_MESSAGES: Record<string, [string, (value: string) => string]> = {
  string_too_short: [
    'min_length',
    (value) => `Debe tener al menos ${value} caracteres.`,
  ],
  string_too_long: [
    'max_length',
    (value) => `Admite máximo ${value} caracteres.`,
  ],
  greater_than_equal: ['ge', (value) => `Debe ser mayor o igual a ${value}.`],
  greater_than: ['gt', (value) => `Debe ser mayor que ${value}.`],
  less_than_equal: ['le', (value) => `Debe ser menor o igual a ${value}.`],
  less_than: ['lt', (value) => `Debe ser menor que ${value}.`],
};

const VALUE_ERROR_PREFIX = 'Value error, ';

/** Spanish message for a FastAPI/Pydantic issue; falls back to the raw `msg`. */
export function translateValidationIssue(issue: ApiValidationIssue): string {
  const ctxMessage = CTX_MESSAGES[issue.type];
  if (ctxMessage) {
    const [key, template] = ctxMessage;
    const value = issue.ctx?.[key];
    if (typeof value === 'number' || typeof value === 'string') {
      return template(String(value));
    }
    return issue.msg;
  }

  if (issue.type === 'value_error') {
    const message = issue.msg.startsWith(VALUE_ERROR_PREFIX)
      ? issue.msg.slice(VALUE_ERROR_PREFIX.length)
      : issue.msg;
    return VALUE_ERROR_MESSAGES[message] ?? message;
  }

  return TYPE_MESSAGES[issue.type] ?? issue.msg;
}

function isWritableField(value: string): value is AssetWritableField {
  return (ASSET_WRITABLE_FIELDS as readonly string[]).includes(value);
}

function withPeriod(message: string): string {
  return /[.!?]$/.test(message) ? message : `${message}.`;
}

export interface AssetValidationErrors {
  /** First translated message per writable asset field. */
  fieldErrors: AssetFieldErrors;
  /** Translated messages that do not belong to a writable asset field. */
  generalErrors: string[];
}

/** Splits validation issues into per-field and general Spanish messages. */
export function splitAssetValidationErrors(
  issues: readonly ApiValidationIssue[],
): AssetValidationErrors {
  const fieldErrors: AssetFieldErrors = {};
  const generalErrors: string[] = [];

  for (const issue of issues) {
    const message = translateValidationIssue(issue);
    const last = issue.loc.length > 1 ? String(issue.loc.at(-1)) : null;

    if (issue.loc[0] === 'body' && last && isWritableField(last)) {
      fieldErrors[last] ??= message;
      continue;
    }

    const label = last ? (FIELD_LABELS[last] ?? last) : null;
    generalErrors.push(withPeriod(label ? `${label}: ${message}` : message));
  }

  return { fieldErrors, generalErrors };
}

/** Maps API field names to the create/edit form field names. */
export function toAssetFormFieldErrors(
  fieldErrors: AssetFieldErrors,
): AssetFormFieldErrors {
  const formErrors: AssetFormFieldErrors = {};
  for (const field of ASSET_WRITABLE_FIELDS) {
    const message = fieldErrors[field];
    if (!message) continue;
    formErrors[field === 'installed_at' ? 'installedAt' : field] = message;
  }
  return formErrors;
}
