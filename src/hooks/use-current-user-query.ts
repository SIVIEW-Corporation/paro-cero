'use client';

import { useQuery } from '@tanstack/react-query';
import { isProtectedPath } from '@/constants/protected-paths';
import { notifySessionExpired } from '@/lib/auth/session-events';
import { SESSION_STATE, authService } from '@/services/auth-service';
import { useAuthStore } from '@/store/auth-store';

export const SESSION_QUERY_KEY = ['auth', 'session'] as const;

/**
 * Hydrates the auth store from `GET /api/auth/session` on app start. The query
 * key carries no identity or token; login/logout clear the whole cache.
 */
export function useCurrentUserQuery() {
  return useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: async () => {
      const before = useAuthStore.getState().user?.id ?? null;
      const session = await authService.getSession();
      const { user: current, setUser, logout } = useAuthStore.getState();
      // A login/logout happened while the request was in flight: keep it.
      if ((current?.id ?? null) !== before) return session;

      if (session.state === SESSION_STATE.AUTHENTICATED) {
        setUser(session.user);
      } else {
        logout();
        if (isProtectedPath(window.location.pathname)) notifySessionExpired();
      }
      return session;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
