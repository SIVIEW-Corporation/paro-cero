import { apiClient } from '@/lib/api-client';
import { NewUserSchema } from '../lib/new-user-schema';
import { User } from '@/store/auth-store';

export interface PaginatedUsersResponse {
  items: User[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export const operatorsService = {
  /**
   * Create operator/viewer user sending data to the backend.
   * Transforms camelCase fields to snake_case for API compatibility.
   */
  createOperator: async (values: NewUserSchema): Promise<User> => {
    // Transform camelCase to snake_case for API
    const body = {
      email: values.email,
      password: values.password,
      full_name: values.fullName,
      role: values.role,
      company_id: values.companyId,
      area: values.area,
      job_title: values.jobTitle,
    };

    const response = await apiClient.post<User>('/users/operator-viewer', body);

    if (!response.ok) {
      throw new Error(response.error?.message || 'Error al crear usuario');
    }

    return response.data as User;
  },

  getOperators: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/users');

    if (!response.ok) {
      throw new Error(response.error?.message || 'Error al traer usuarios');
    }

    return response.data as User[];
  },

  getUsers: async (
    page: number,
    size: number,
  ): Promise<PaginatedUsersResponse> => {
    const response = await apiClient.get<PaginatedUsersResponse>(
      `/users/?page=${page}&size=${size}`,
    );

    if (!response.ok) {
      throw new Error(response.error?.message || 'Error al traer usuarios');
    }

    return response.data as PaginatedUsersResponse;
  },
};
