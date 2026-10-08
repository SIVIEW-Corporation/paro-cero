import { z } from 'zod';
import type {
  Company,
  CompanyCreatePayload,
  CompanyUpdatePayload,
} from '../services/companies-service';

/** Persona moral: 3 letters + 6 digits (YYMMDD) + 3-char homoclave. */
export const RFC_MORAL_REGEX = /^[A-ZÑ&]{3}\d{6}[A-Z0-9]{3}$/;
/** Persona física: 4 letters + 6 digits (YYMMDD) + 3-char homoclave. */
export const RFC_FISICA_REGEX = /^[A-ZÑ&]{4}\d{6}[A-Z0-9]{3}$/;

export const COMPANY_NAME_MAX_LENGTH = 255;

/** Mirrors the backend normalization: strip surrounding spaces, uppercase. */
export function normalizeRfc(value: string): string {
  return value.trim().toUpperCase();
}

/** True for an already-normalized RFC of a persona moral (12) or física (13). */
export function isValidRfc(value: string): boolean {
  return RFC_MORAL_REGEX.test(value) || RFC_FISICA_REGEX.test(value);
}

export const companyFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'El nombre de la empresa es obligatorio.')
    .max(
      COMPANY_NAME_MAX_LENGTH,
      `Admite máximo ${COMPANY_NAME_MAX_LENGTH} caracteres.`,
    ),
  rfc: z
    .string()
    .trim()
    .toUpperCase()
    .min(1, { error: 'El RFC es obligatorio.', abort: true })
    .refine(isValidRfc, {
      error:
        'RFC inválido. Usa 12 caracteres (persona moral) o 13 (persona física).',
    }),
  active: z.boolean(),
});

/** Raw values held by the company create/edit form. */
export interface CompanyFormValues {
  name: string;
  rfc: string;
  active: boolean;
}

export const EMPTY_COMPANY_FORM_VALUES: CompanyFormValues = {
  name: '',
  rfc: '',
  active: true,
};

export function companyToFormValues(company: Company): CompanyFormValues {
  return {
    name: company.name,
    rfc: company.rfc ?? '',
    active: company.active === 1,
  };
}

const toActiveFlag = (active: boolean): 0 | 1 => (active ? 1 : 0);

/** Validates and normalizes the form values. Throws a ZodError when invalid. */
export function buildCompanyCreatePayload(
  values: CompanyFormValues,
): CompanyCreatePayload {
  const parsed = companyFormSchema.parse(values);
  return {
    name: parsed.name,
    rfc: parsed.rfc,
    active: toActiveFlag(parsed.active),
  };
}

/**
 * Partial update with only the fields that differ from `company`, after
 * normalization. An empty object means there is nothing to send.
 */
export function buildCompanyUpdatePayload(
  company: Company,
  values: CompanyFormValues,
): CompanyUpdatePayload {
  const parsed = companyFormSchema.parse(values);
  const payload: CompanyUpdatePayload = {};
  if (parsed.name !== company.name) payload.name = parsed.name;
  if (parsed.rfc !== (company.rfc ?? '')) payload.rfc = parsed.rfc;
  const active = toActiveFlag(parsed.active);
  if (active !== company.active) payload.active = active;
  return payload;
}

export function hasCompanyChanges(payload: CompanyUpdatePayload): boolean {
  return Object.values(payload).some((value) => value !== undefined);
}
