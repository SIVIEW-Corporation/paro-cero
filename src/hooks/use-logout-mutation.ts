import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/auth-service';
import { clearAuthCookiesAction } from '@/app/actions/auth';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { resetTokenLock } from '@/lib/token-refresh';

export function useLogoutMutation() {
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      const { accessToken, refreshToken } = useAuthStore.getState();
      // If we have tokens, call backend to revoke refresh token
      if (accessToken && refreshToken) {
        try {
          await authService.logout(accessToken, refreshToken);
        } catch {
          // Backend might be down, still clear local state
        }
      }
      // Always clear cookies
      await clearAuthCookiesAction();
    },
    onSuccess: () => {
      // Clear Zustand store
      useAuthStore.getState().logout();
      // Reset token refresh lock
      resetTokenLock();
      // Show toast
      toast.success('Sesión cerrada correctamente');
      // Redirect to login
      router.push('/login');
    },
    onError: () => {
      // Even on error, clear local state
      useAuthStore.getState().logout();
      resetTokenLock();
      clearAuthCookiesAction();
      router.push('/login');
    },
  });
}
