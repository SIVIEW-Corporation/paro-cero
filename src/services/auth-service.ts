import { apiClient, authRequest } from '@/lib/api-client';
import type { LoginInput } from '@/lib/auth-schema';
import type { User } from '@/store/auth-store';

export type UserProfileUpdateInput = Partial<
  Pick<User, 'email' | 'full_name' | 'area' | 'job_title' | 'profile_image'>
>;

/** BFF login answer: tokens stay in httpOnly cookies, only the user is returned. */
export interface LoginResponse {
  user: User;
}

export const SESSION_STATE = {
  AUTHENTICATED: 'authenticated',
  ANONYMOUS: 'anonymous',
} as const;

export type SessionResult =
  | { state: typeof SESSION_STATE.AUTHENTICATED; user: User }
  | { state: typeof SESSION_STATE.ANONYMOUS };

export const authService = {
  /** Login through the BFF (`POST /api/auth/login`), which sets the cookies. */
  login: async (credentials: LoginInput): Promise<LoginResponse> => {
    const response = await authRequest<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (!response.ok || !response.data?.user) {
      throw new Error(response.error?.message || 'Error al iniciar sesión');
    }

    return response.data;
  },

  /**
   * Current session (`GET /api/auth/session`). 401 means anonymous; transient
   * failures throw so callers keep the local state.
   */
  getSession: async (): Promise<SessionResult> => {
    const response = await authRequest<{ user: User }>('/session', {
      method: 'GET',
    });

    if (response.ok && response.data?.user)
      return { state: SESSION_STATE.AUTHENTICATED, user: response.data.user };
    if (response.status === 401) return { state: SESSION_STATE.ANONYMOUS };

    throw new Error(response.error?.message || 'Error al validar la sesión');
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

  /** Logout through the BFF; it revokes the refresh token and clears cookies. */
  logout: async (): Promise<void> => {
    const response = await authRequest<null>('/logout', { method: 'POST' });
    if (!response.ok && response.status !== 401) {
      throw new Error(response.error?.message || 'Error al cerrar sesión');
    }
  },

  /** Revokes every session of the user (`POST /api/auth/logout-all`). */
  logoutAll: async (): Promise<void> => {
    const response = await authRequest<null>('/logout-all', { method: 'POST' });
    if (!response.ok && response.status !== 401) {
      throw new Error(
        response.error?.message || 'Error al cerrar todas las sesiones',
      );
    }
  },
};
