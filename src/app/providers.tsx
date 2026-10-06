'use client';
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { isProtectedPath } from '@/constants/protected-paths';
import { useCurrentUserQuery } from '@/hooks/use-current-user-query';
import {
  AUTH_EVENT,
  loginUrlForCurrentLocation,
  publishAuthEvent,
  registerSessionExpiredHandler,
  subscribeAuthEvents,
} from '@/lib/auth/session-events';
import { useAuthStore } from '@/store/auth-store';

/**
 * Hydrates the session, owns the single session-expired handler and keeps
 * tabs in sync (logout/expired in one tab logs out the others; a login in one
 * tab reloads the others so they pick up the new identity).
 */
function AuthSessionSync() {
  const queryClient = useQueryClient();
  useCurrentUserQuery();

  useEffect(() => {
    const clearLocalSession = () => {
      useAuthStore.getState().logout();
      queryClient.clear();
    };

    const unregister = registerSessionExpiredHandler(() => {
      clearLocalSession();
      publishAuthEvent(AUTH_EVENT.EXPIRED);
      toast.error(
        'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
      );
      window.location.assign(loginUrlForCurrentLocation());
    });

    const unsubscribe = subscribeAuthEvents((type) => {
      if (type === AUTH_EVENT.LOGIN) {
        queryClient.clear();
        window.location.reload();
        return;
      }
      clearLocalSession();
      if (isProtectedPath(window.location.pathname))
        window.location.assign(loginUrlForCurrentLocation());
    });

    return () => {
      unregister();
      unsubscribe();
    };
  }, [queryClient]);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthSessionSync />
      {children}
    </QueryClientProvider>
  );
}
