import { useAuthStore } from '@/store/auth-store';
import { clearAuthCookiesAction, refreshTokenAction } from '@/app/actions/auth';

// Module-level state for promise-based race condition lock
let refreshPromise: Promise<string> | null = null;
let pendingRequests: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

/**
 * Ensures a valid access token. If token is expired (401), refreshes it.
 * Uses a promise-based lock to prevent race conditions — only one refresh
 * call is in flight at a time; concurrent 401s are queued.
 *
 * @returns The new access token if refresh succeeded, or throws if refresh failed
 */
export async function ensureValidToken(): Promise<string> {
  // If a refresh is already in progress, wait for it
  if (refreshPromise) {
    return new Promise((resolve, reject) => {
      pendingRequests.push({ resolve, reject });
    });
  }

  // Start a new refresh — this is the lock
  refreshPromise = doRefresh();

  try {
    const newToken = await refreshPromise;

    // Resolve all pending requests with the new token
    pendingRequests.forEach((req) => req.resolve(newToken));

    return newToken;
  } catch (error) {
    // Reject all pending requests
    pendingRequests.forEach((req) =>
      req.reject(
        error instanceof Error ? error : new Error('Token refresh failed'),
      ),
    );
    throw error;
  } finally {
    // Clear the lock and queue
    refreshPromise = null;
    pendingRequests = [];
  }
}

/**
 * Internal — performs the actual token refresh via server action.
 * The server action reads the httpOnly refresh_token cookie and calls the backend.
 */
async function doRefresh(): Promise<string> {
  try {
    // Call the server action which reads the httpOnly refresh_token cookie
    // and calls the backend refresh endpoint
    const result = await refreshTokenAction();

    if (!result.success || !result.accessToken) {
      const errorMessage =
        result.error || 'Token refresh failed — no valid token returned';
      throw new Error(errorMessage);
    }

    // Update the Zustand store with the new access token
    useAuthStore.getState().setAccessToken(result.accessToken);

    return result.accessToken;
  } catch (error) {
    // Check if this is a "Sesión comprometida" (replay attack detection) error
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isCompromisedSession = errorMessage.includes('Sesión comprometida');

    if (isCompromisedSession && typeof window !== 'undefined') {
      // Show toast before redirect — user needs to re-login
      // Dynamic import to avoid SSR issues with toast
      import('sonner').then(({ toast }) => {
        toast.error(
          'Sesión comprometida. Por seguridad, inicie sesión nuevamente.',
        );
      });

      // Clear cookies and store immediately
      try {
        await clearAuthCookiesAction();
      } catch {
        // Ignore cleanup errors
      }
      useAuthStore.getState().logout();

      // Redirect to login — do NOT retry the original request
      window.location.href = '/login';

      // Throw a non-retryable error
      throw new Error('Sesión comprometida');
    }

    // Normal refresh failure (e.g., token expired) — clear cookies and store
    try {
      await clearAuthCookiesAction();
    } catch {
      // Ignore cleanup errors — the redirect will handle it
    }

    useAuthStore.getState().logout();

    // Client-side redirect
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }

    throw error instanceof Error ? error : new Error('Token refresh failed');
  }
}

/**
 * Reset the lock — call this after explicit logout or unrecoverable error
 * to prevent stale state from blocking future refreshes.
 */
export function resetTokenLock(): void {
  refreshPromise = null;
  pendingRequests = [];
}
