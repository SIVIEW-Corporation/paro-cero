import {
  apiClient,
  getApiFieldErrors,
  type ApiClientOptions,
  type ApiResponse,
} from '@/lib/api-client';
import { translateValidationIssue } from '@/app/(portal)/assets/lib/asset-server-errors';

type SessionRequestOptions = Pick<ApiClientOptions, 'isRequestCurrent'>;

export interface Company {
  id: string;
  name: string;
  rfc: string | null;
  /** 1 = active, 0 = inactive. */
  active: number;
  created_at: string;
  updated_at: string | null;
}

export interface PaginatedCompaniesResponse {
  items: Company[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface CompanyListParams {
  page: number;
  size: number;
}

export interface CompanyCreatePayload {
  name: string;
  rfc: string;
  active: 0 | 1;
}

export type CompanyUpdatePayload = Partial<CompanyCreatePayload>;

export const COMPANY_WRITABLE_FIELDS = ['name', 'rfc', 'active'] as const;

export type CompanyField = (typeof COMPANY_WRITABLE_FIELDS)[number];

export type CompanyFieldErrors = Partial<Record<CompanyField, string>>;

const ERROR_MESSAGES = {
  401: 'Tu sesión expiró. Inicia sesión nuevamente.',
  403: 'No tienes permiso para administrar empresas. Solo el superusuario puede hacerlo.',
  404: 'La empresa no existe o fue eliminada.',
  duplicateRfc: 'Ya existe una empresa con ese RFC.',
  duplicateName: 'Ya existe una empresa con ese nombre.',
  422: 'Hay datos inválidos. Revisa los campos de la empresa.',
  network:
    'No se pudo conectar con el servidor. Intenta de nuevo en unos momentos.',
  noChanges: 'No hay cambios para guardar.',
} as const;

/** Error thrown by the companies service. `status` 0 means network/local. */
export class CompanyApiError extends Error {
  readonly status: number;
  readonly fieldErrors: CompanyFieldErrors;
  /** Raw backend message, kept for diagnostics. */
  readonly detail?: string;

  constructor(
    message: string,
    status: number,
    fieldErrors: CompanyFieldErrors = {},
    detail?: string,
  ) {
    super(message);
    this.name = 'CompanyApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.detail = detail;
  }
}

export function isCompanyApiError(error: unknown): error is CompanyApiError {
  return error instanceof CompanyApiError;
}

function isCompanyField(value: string): value is CompanyField {
  return (COMPANY_WRITABLE_FIELDS as readonly string[]).includes(value);
}

/** 422: Spanish message per company field, from the api-client helpers. */
function toValidationError(
  response: ApiResponse<unknown>,
  detail: string | undefined,
): CompanyApiError {
  const fieldErrors: CompanyFieldErrors = {};
  const issues = response.error?.validationErrors ?? [];
  for (const [field, messages] of Object.entries(
    getApiFieldErrors(response.error),
  )) {
    if (!isCompanyField(field)) continue;
    const issue = issues.find(
      (item) => item.loc[0] === 'body' && String(item.loc.at(-1)) === field,
    );
    fieldErrors[field] = issue
      ? translateValidationIssue(issue)
      : (messages[0] ?? ERROR_MESSAGES[422]);
  }
  return new CompanyApiError(ERROR_MESSAGES[422], 422, fieldErrors, detail);
}

function toDuplicateError(detail: string | undefined): CompanyApiError {
  const isName = /\bname\b|nombre/i.test(detail ?? '');
  const message = isName
    ? ERROR_MESSAGES.duplicateName
    : ERROR_MESSAGES.duplicateRfc;
  return new CompanyApiError(
    message,
    409,
    isName ? { name: message } : { rfc: message },
    detail,
  );
}

/** Maps a failed API response to a user-facing Spanish error. */
export function toCompanyApiError(
  response: ApiResponse<unknown>,
  fallback: string,
): CompanyApiError {
  const { status } = response;
  const detail = response.error?.message;
  const code = response.error?.code;

  // Session protocol answers (busy/unavailable/changed) already carry Spanish copy.
  if (code?.startsWith('SESSION_') && detail) {
    return new CompanyApiError(detail, status, {}, detail);
  }

  switch (status) {
    case 401:
    case 403:
    case 404:
      return new CompanyApiError(ERROR_MESSAGES[status], status, {}, detail);
    case 409:
      return toDuplicateError(detail);
    case 422:
      return toValidationError(response, detail);
    case 0:
    case 502:
    case 503:
    case 504:
      return new CompanyApiError(ERROR_MESSAGES.network, status, {}, detail);
    default:
      return new CompanyApiError(detail || fallback, status, {}, detail);
  }
}

/** Keeps only fields the backend accepts. */
function pickWritable(payload: CompanyUpdatePayload): CompanyUpdatePayload {
  const body: Record<string, unknown> = {};
  for (const field of COMPANY_WRITABLE_FIELDS) {
    if (payload[field] !== undefined) body[field] = payload[field];
  }
  return body as CompanyUpdatePayload;
}

function buildListQuery({ page, size }: CompanyListParams): string {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('size', String(size));
  return params.toString();
}

export const companiesService = {
  /** Paginated companies, active and inactive (superadmin only). */
  listCompanies: async (
    params: CompanyListParams,
    options: SessionRequestOptions = {},
  ): Promise<PaginatedCompaniesResponse> => {
    const response = await apiClient<PaginatedCompaniesResponse>(
      `/companies/?${buildListQuery(params)}`,
      { ...options, method: 'GET' },
    );
    if (!response.ok)
      throw toCompanyApiError(response, 'Error al traer empresas');
    return response.data as PaginatedCompaniesResponse;
  },

  getCompanies: (
    page: number,
    size: number,
    options: SessionRequestOptions = {},
  ): Promise<PaginatedCompaniesResponse> =>
    companiesService.listCompanies({ page, size }, options),

  getCompany: async (
    id: string,
    options: SessionRequestOptions = {},
  ): Promise<Company> => {
    const response = await apiClient<Company>(
      `/companies/${encodeURIComponent(id)}`,
      { ...options, method: 'GET' },
    );
    if (!response.ok)
      throw toCompanyApiError(response, 'Error al traer la empresa');
    return response.data as Company;
  },

  createCompany: async (
    payload: CompanyCreatePayload,
    options: SessionRequestOptions = {},
  ): Promise<Company> => {
    const response = await apiClient<Company>('/companies/', {
      ...options,
      method: 'POST',
      body: JSON.stringify(pickWritable(payload)),
    });
    if (!response.ok)
      throw toCompanyApiError(response, 'Error al crear la empresa');
    return response.data as Company;
  },

  /** Partial update via PUT. Rejects locally when there is nothing to send. */
  updateCompany: async (
    id: string,
    payload: CompanyUpdatePayload,
    options: SessionRequestOptions = {},
  ): Promise<Company> => {
    const body = pickWritable(payload);
    if (Object.keys(body).length === 0) {
      throw new CompanyApiError(ERROR_MESSAGES.noChanges, 0);
    }
    const response = await apiClient<Company>(
      `/companies/${encodeURIComponent(id)}`,
      { ...options, method: 'PUT', body: JSON.stringify(body) },
    );
    if (!response.ok)
      throw toCompanyApiError(response, 'Error al actualizar la empresa');
    return response.data as Company;
  },
};
