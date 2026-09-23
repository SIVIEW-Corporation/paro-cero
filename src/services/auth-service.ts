import { apiClient } from '@/lib/api-client';
import type { ApiClientOptions } from '@/lib/api-client';
import type { LoginInput } from '@/lib/auth-schema';
import type { User } from '@/store/auth-store';

export type UserProfileUpdateInput = Partial<
  Pick<User, 'email' | 'full_name' | 'area' | 'job_title' | 'profile_image'>
>;

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
   * Login enviando credenciales al backend
   */
  login: async (credentials: LoginInput): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(
      '/auth/login',
      credentials,
    );

    if (!response.ok) {
      throw new Error(response.error?.message || 'Error al iniciar sesión');
    }

    return response.data as LoginResponse;
  },

  /**
   * Obtener el perfil del usuario actual
   */
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>('/users/me');

    if (!response.ok) {
      throw new Error(response.error?.message || 'Error al obtener perfil');
    }

    return response.data as User;
  },

  /**
   * Actualización de datos
   */
  updateProfile: async (data: UserProfileUpdateInput): Promise<User> => {
    const response = await apiClient.patch<User>('/users/me', data);

    if (!response.ok) {
      throw new Error(response.error?.message || 'Error al actualizar perfil');
    }

    return response.data as User;
  },

  /**
   * Refresh token — calls POST /api/v1/auth/refresh
   * Backend rotates: old refresh token is revoked, new pair returned.
   */
  refreshToken: async (refreshToken: string): Promise<RefreshResponse> => {
    const response = await apiClient.post<RefreshResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });

    if (!response.ok) {
      throw new Error(response.error?.message || 'Error al refrescar sesión');
    }

    return response.data as RefreshResponse;
  },

  /**
   * Logout — calls POST /api/v1/auth/logout with Authorization header.
   * Backend revokes the refresh token.
   */
  logout: async (
    accessToken: string,
    refreshToken: string,
  ): Promise<{ message: string }> => {
    const options: ApiClientOptions = {
      authToken: accessToken,
    };
    const response = await apiClient.post<{ message: string }>(
      '/auth/logout',
      { refresh_token: refreshToken },
      options,
    );

    if (!response.ok) {
      throw new Error(response.error?.message || 'Error al cerrar sesión');
    }

    return response.data as { message: string };
  },
};
