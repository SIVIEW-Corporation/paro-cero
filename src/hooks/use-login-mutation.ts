import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/auth-service';
import { useAuthStore } from '@/store/auth-store';
import { setAuthCookiesAction } from '@/app/actions/auth';
import type { LoginInput } from '@/lib/auth-schema';

export function useLoginMutation() {
  const setUser = useAuthStore((state) => state.setUser);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setRefreshToken = useAuthStore((state) => state.setRefreshToken);

  return useMutation({
    mutationFn: async (credentials: LoginInput) => {
      const data = await authService.login(credentials);

      setUser(data.user);
      setAccessToken(data.access_token);
      setRefreshToken(data.refresh_token);

      await setAuthCookiesAction(data.access_token, data.refresh_token);

      return data;
    },
  });
}
