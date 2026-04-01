import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/auth-service';
import { useAuthStore } from '@/store/auth-store';
import { setAuthTokenAction, setRefreshTokenAction } from '@/app/actions/auth';
import type { LoginInput } from '@/lib/auth-schema';

export function useLoginMutation() {
  const setUser = useAuthStore((state) => state.setUser);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setRefreshToken = useAuthStore((state) => state.setRefreshToken);

  return useMutation({
    mutationFn: (credentials: LoginInput) => authService.login(credentials),
    onSuccess: async (data) => {
      // Store user and tokens in Zustand
      setUser(data.user);
      setAccessToken(data.access_token);
      setRefreshToken(data.refresh_token);

      // Set both httpOnly cookies via server actions
      await setAuthTokenAction(data.access_token);
      await setRefreshTokenAction(data.refresh_token);
    },
  });
}
