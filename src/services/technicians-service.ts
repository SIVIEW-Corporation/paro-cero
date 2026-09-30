import { apiClient } from '@/lib/api-client';
import type { ApiClientOptions } from '@/lib/api-client';
import type { User } from '@/store/auth-store';

interface PaginatedUsersResponse {
  items: User[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

type SessionRequestOptions = Pick<ApiClientOptions, 'isRequestCurrent'>;

export const techniciansService = {
  async getAll(
    options: SessionRequestOptions = {},
  ): Promise<PaginatedUsersResponse> {
    const items: User[] = [];
    let page = 1;
    let pages = 1;
    let lastResponse: PaginatedUsersResponse | null = null;

    while (page <= pages) {
      const response = await apiClient.get<PaginatedUsersResponse>(
        `/users/technicians?page=${page}&size=100&include_inactive=false`,
        options,
      );

      if (!response.ok) {
        throw new Error(
          response.error?.message ||
            'Error al traer los técnicos de la empresa',
        );
      }

      const data = response.data as PaginatedUsersResponse;
      items.push(...data.items);
      pages = data.pages;
      lastResponse = data;
      page += 1;
    }

    return {
      ...(lastResponse ?? {
        total: 0,
        page: 1,
        size: 100,
        pages: 0,
      }),
      items,
    };
  },
};
