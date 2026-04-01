import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// User role: admin, supervisor, operator, or viewer

export const USER_TYPES = {
  SA: 'superadmin',
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor',
  OPERATOR: 'operator',
  VIEWER: 'viewer',
} as const;

export type UserType = (typeof USER_TYPES)[keyof typeof USER_TYPES];

export interface User {
  id: string;
  email: string;
  name: string;
  company: string;
  role: UserType;
  area?: string;
  job_title?: string;
  image?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist<AuthState>(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setUser: (user) => set({ user }),
      setAccessToken: (token) => set({ accessToken: token }),
      setRefreshToken: (token) => set({ refreshToken: token }),
      logout: () => set({ user: null, accessToken: null, refreshToken: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
