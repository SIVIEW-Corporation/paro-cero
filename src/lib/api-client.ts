import { useAuthStore } from '@/store/auth-store';
import { ensureValidToken } from '@/lib/token-refresh';

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: ApiError;
  ok: boolean;
  status: number;
}

interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

const DEFAULT_TIMEOUT = 30000;
const DEFAULT_RETRIES = 0;
const DEFAULT_RETRY_DELAY = 1000;

/**
 * Auth endpoints that should NOT trigger token refresh on 401.
 * Prevents infinite loops when login/refresh/logout themselves fail.
 */
const AUTH_ENDPOINTS = ['/auth/login', '/auth/refresh', '/auth/logout'];

function isAuthEndpoint(endpoint: string): boolean {
  return AUTH_ENDPOINTS.some((authEndpoint) => endpoint.includes(authEndpoint));
}

async function fetchWithTimeout(
  url: string,
  options: FetchOptions,
): Promise<Response> {
  const {
    timeout = DEFAULT_TIMEOUT,
    retries = DEFAULT_RETRIES,
    retryDelay = DEFAULT_RETRY_DELAY,
    ...fetchOptions
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      lastError = error as Error;

      if (attempt < retries) {
        await new Promise((resolve) =>
          setTimeout(resolve, retryDelay * (attempt + 1)),
        );
      }
    }
  }

  clearTimeout(timeoutId);
  throw lastError;
}

export interface ApiClientOptions extends FetchOptions {
  authToken?: string;
}

/**
 * Builds headers with Authorization header from Zustand store.
 * Since httpOnly cookies can't be read client-side, we inject the
 * token from the persisted Zustand store.
 */
function buildHeaders(options: ApiClientOptions): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Priority 1: Explicitly provided token
  if (options.authToken) {
    headers['Authorization'] = `Bearer ${options.authToken}`;
  } else {
    // Priority 2: Read from Zustand store (persisted to localStorage)
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
  }

  return headers;
}

/**
 * Retries the original request with the new access token.
 */
async function retryRequest<T = unknown>(
  endpoint: string,
  originalOptions: ApiClientOptions,
  newToken: string,
): Promise<ApiResponse<T>> {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

  const headers = buildHeaders({
    ...originalOptions,
    authToken: newToken, // Override with fresh token
  });

  const response = await fetchWithTimeout(`${baseUrl}${endpoint}`, {
    ...originalOptions,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: {
        message: data?.message || `Error ${response.status}`,
        code: data?.code,
        status: response.status,
      },
    };
  }

  return {
    ok: true,
    status: response.status,
    data: data as T,
  };
}

export async function apiClient<T = unknown>(
  endpoint: string,
  options: ApiClientOptions = {},
): Promise<ApiResponse<T>> {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

  const headers = buildHeaders(options);

  try {
    const response = await fetchWithTimeout(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    // 401 interceptor with token refresh
    if (response.status === 401) {
      // Skip auth endpoints to prevent infinite loops
      if (isAuthEndpoint(endpoint)) {
        return {
          ok: false,
          status: 401,
          error: { message: 'Unauthorized', status: 401 },
        };
      }

      // Attempt token refresh
      try {
        const newToken = await ensureValidToken();

        // Retry the original request with the new token
        return await retryRequest<T>(endpoint, options, newToken);
      } catch {
        // Refresh failed — redirect handled in token-refresh module
        return {
          ok: false,
          status: 401,
          error: { message: 'Unauthorized — session expired', status: 401 },
        };
      }
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: {
          message: data?.message || `Error ${response.status}`,
          code: data?.code,
          status: response.status,
        },
      };
    }

    return {
      ok: true,
      status: response.status,
      data: data as T,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (error instanceof Error && error.name === 'AbortError') {
      return {
        ok: false,
        status: 0,
        error: { message: 'Request timeout', code: 'TIMEOUT' },
      };
    }

    return {
      ok: false,
      status: 0,
      error: { message: `Network error: ${message}`, code: 'NETWORK_ERROR' },
    };
  }
}

apiClient.get = <T = unknown>(endpoint: string, options?: FetchOptions) =>
  apiClient<T>(endpoint, { ...options, method: 'GET' });

apiClient.post = <T = unknown>(
  endpoint: string,
  data?: unknown,
  options?: FetchOptions,
) =>
  apiClient<T>(endpoint, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });

apiClient.put = <T = unknown>(
  endpoint: string,
  data?: unknown,
  options?: FetchOptions,
) =>
  apiClient<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });

apiClient.delete = <T = unknown>(endpoint: string, options?: FetchOptions) =>
  apiClient<T>(endpoint, { ...options, method: 'DELETE' });
