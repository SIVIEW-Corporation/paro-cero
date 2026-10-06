import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth-service';
import { useAuthStore } from '@/store/auth-store';
import {
  AUTH_EVENT,
  publishAuthEvent,
  resetSessionExpired,
} from '@/lib/auth/session-events';
import type { LoginInput } from '@/lib/auth-schema';

export function useLoginMutation() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (credentials: LoginInput) => authService.login(credentials),
    onSuccess: ({ user }) => {
      // Drop anything cached for a previous identity before exposing the user.
      queryClient.clear();
      setUser(user);
      resetSessionExpired();
      publishAuthEvent(AUTH_EVENT.LOGIN);
    },
  });
}
