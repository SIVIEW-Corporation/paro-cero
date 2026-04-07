import { apiClient } from '@/lib/api-client';
import { NewUserSchema } from '../lib/new-user-schema';
import { User } from '@/store/auth-store';

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface RefreshResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export const authService = {
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
};
