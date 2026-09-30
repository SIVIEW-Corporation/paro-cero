import { apiClient } from '@/lib/api-client';
import type { ApiClientOptions } from '@/lib/api-client';

type SessionRequestOptions = Pick<ApiClientOptions, 'isRequestCurrent'>;

export interface Company {
  id: string;
  name: string;
  rfc: string;
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

export const companiesService = {
  getCompanies: async (
    page: number,
    size: number,
    options: SessionRequestOptions = {},
  ): Promise<PaginatedCompaniesResponse> => {
    const response = await apiClient<PaginatedCompaniesResponse>(
      `/companies/?page=${page}&size=${size}`,
      options,
    );

    if (!response.ok) {
      throw new Error(response.error?.message || 'Error al traer empresas');
    }

    return response.data as PaginatedCompaniesResponse;
  },
};
