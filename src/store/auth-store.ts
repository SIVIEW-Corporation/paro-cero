import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// User role: superadmin, admin ("Supervisor"), operator or viewer.

export const USER_TYPES = {
  SA: 'superadmin',
  ADMIN: 'admin',
  OPERATOR: 'operator',
  VIEWER: 'viewer',
} as const;

export type UserType = (typeof USER_TYPES)[keyof typeof USER_TYPES];

export interface User {
  id: string;
  email: string;
  full_name: string;
  company_id: string | null;
  role: UserType | string;
  area?: string | null;
  job_title?: string | null;
  profile_image?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string | null;
}

export interface Asset {
  id: string;
  name: string;
  code: string;
  area: string;
  serial: string | null;
  model: string | null;
  manufacturer: string | null;
  cost: number | null;
  company_id: string;
  status:
    | 'commissioning'
    | 'operational'
    | 'standby'
    | 'maintenance'
    | 'down'
    | 'decommissioned';
  criticality: 'low' | 'medium' | 'high' | 'critical';
  installed_at: string | null;
  isActive: boolean;
  created_at: string;
  updated_at: string | null;
}

export const AUTH_STATUS = {
  /** Before `/api/auth/session` answered (a persisted user may be shown). */
  CHECKING: 'checking',
  AUTHENTICATED: 'authenticated',
  ANONYMOUS: 'anonymous',
} as const;

export type AuthStatus = (typeof AUTH_STATUS)[keyof typeof AUTH_STATUS];

/**
 * Client auth state. Tokens never live here: they stay in httpOnly cookies
 * owned by the BFF (`/api/auth/*`).
 */
interface AuthState {
  user: User | null;
  status: AuthStatus;
  setUser: (user: User | null) => void;
  logout: () => void;
}

interface PersistedAuthState {
  user: User | null;
}

/** v2 dropped `accessToken`/`refreshToken` from `auth-storage`. */
const AUTH_STORAGE_VERSION = 2;

/** Keeps only the user from any older persisted shape (drops tokens). */
export function migrateAuthStorage(
  persisted: unknown,
  _version: number,
): PersistedAuthState {
  const user =
    typeof persisted === 'object' && persisted !== null && 'user' in persisted
      ? ((persisted as { user: unknown }).user as User | null)
      : null;
  return { user: user ?? null };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      status: AUTH_STATUS.CHECKING,
      setUser: (user) =>
        set({
          user,
          status: user ? AUTH_STATUS.AUTHENTICATED : AUTH_STATUS.ANONYMOUS,
        }),
      logout: () => set({ user: null, status: AUTH_STATUS.ANONYMOUS }),
    }),
    {
      name: 'auth-storage',
      version: AUTH_STORAGE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (state): PersistedAuthState => ({ user: state.user }),
      migrate: migrateAuthStorage,
    },
  ),
);
