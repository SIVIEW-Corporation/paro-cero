import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authService } from '@/services/auth-service';
import { useAuthStore } from '@/store/auth-store';
import { AUTH_EVENT, publishAuthEvent } from '@/lib/auth/session-events';

export function useLogoutMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const clearLocalSession = () => {
    useAuthStore.getState().logout();
    queryClient.clear();
    publishAuthEvent(AUTH_EVENT.LOGOUT);
  };

  return useMutation({
    // The BFF clears the cookies even when the backend revocation fails.
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      clearLocalSession();
      toast.success('Sesión cerrada correctamente');
      router.push('/login');
    },
    onError: () => {
      clearLocalSession();
      router.push('/login');
    },
  });
}
