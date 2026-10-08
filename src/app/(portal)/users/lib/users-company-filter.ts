import type { Company } from '../services/companies-service';

type CompanyRef = Pick<Company, 'id' | 'name' | 'active'>;

export interface CompanyFilterOption {
  value: string;
  label: string;
}

export const ALL_COMPANIES_LABEL = 'Todas las empresas';

const ALL_COMPANIES_VALUE = '';
const MISSING_COMPANY_LABEL = '—';

/** "Todas las empresas" first, then every company; inactive ones are marked. */
export function getCompanyFilterOptions(
  companies: readonly CompanyRef[] | undefined,
): CompanyFilterOption[] {
  return [
    { value: ALL_COMPANIES_VALUE, label: ALL_COMPANIES_LABEL },
    ...(companies ?? []).map((company) => ({
      value: company.id,
      label: company.active === 1 ? company.name : `${company.name} (inactiva)`,
    })),
  ];
}

/** Select value → `company_id` filter; the "all" option means no filter. */
export function toCompanyFilter(value: string): string | null {
  return value === ALL_COMPANIES_VALUE ? null : value;
}

export function getCompanyName(
  companies: readonly CompanyRef[] | undefined,
  companyId: string | null | undefined,
): string {
  if (!companyId) return MISSING_COMPANY_LABEL;
  return (
    companies?.find((company) => company.id === companyId)?.name ??
    MISSING_COMPANY_LABEL
  );
}
