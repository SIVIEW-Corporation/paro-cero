'use client';
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { useState } from 'react';
import { useAuthStore } from '@/store/auth-store';

export default function Providers({ children }: { children: React.ReactNode }) {
  const logout = useAuthStore((state) => state.logout);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
        queryCache: new QueryCache({
          onError: (error, _query) => {
            // Safety net: the api-client interceptor already handles 401 →
            // refresh → retry. This handler only fires for edge cases where
            // a 401 somehow bypassed the interceptor (e.g. direct fetch,
            // third-party library, or interceptor bug).
            const errorMessage = error instanceof Error ? error.message : '';

            // "Sesión comprometida" — replay attack detected by backend
            if (errorMessage.includes('Sesión comprometida')) {
              logout();
              toast.error(
                'Sesión comprometida. Por seguridad, inicie sesión nuevamente.',
              );
              window.location.href = '/login';
              return;
            }

            // Normal 401 — token expired
            if (errorMessage.includes('401')) {
              logout();
              toast.error(
                'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
              );
              window.location.href = '/login';
            }
          },
        }),
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
