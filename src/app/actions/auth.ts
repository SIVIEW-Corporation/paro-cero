'use server';
import { cookies } from 'next/headers';

const ACCESS_TOKEN_MAX_AGE = 2 * 60 * 60;
const DEFAULT_REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60;

function normalizeMaxAge(value: number | undefined): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return DEFAULT_REFRESH_TOKEN_MAX_AGE;
  }
  return Math.floor(value);
}

function buildBackendEndpoint(path: string): string {
  if (process.env.API_URL) {
    return new URL(`/api/v1${path}`, process.env.API_URL).toString();
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api/v1';
  return `${baseUrl.replace(/\/$/, '')}${path}`;
}

export async function setAuthTokenAction(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('access_token', token, {
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: ACCESS_TOKEN_MAX_AGE, // 2 hours — aligned with JWT expiry
  });
  return { success: true };
}

export async function setRefreshTokenAction(
  refreshToken: string,
  refreshMaxAge?: number,
) {
  const cookieStore = await cookies();
  cookieStore.set('refresh_token', refreshToken, {
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: normalizeMaxAge(refreshMaxAge),
  });
  return { success: true };
}

/**
 * Sets both auth cookies in a single server action call.
 * Avoids the "unexpected response" error from sequential server action calls.
 */
export async function setAuthCookiesAction(
  accessToken: string,
  refreshToken: string,
  refreshMaxAge?: number,
) {
  const cookieStore = await cookies();

  cookieStore.set('access_token', accessToken, {
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: ACCESS_TOKEN_MAX_AGE, // 2 hours — aligned with JWT expiry
  });

  cookieStore.set('refresh_token', refreshToken, {
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: normalizeMaxAge(refreshMaxAge),
  });

  return { success: true };
}

export async function clearAuthCookiesAction() {
  const cookieStore = await cookies();
  cookieStore.delete('access_token');
  cookieStore.delete('refresh_token');
  return { success: true };
}

export async function logoutAction() {
  await clearAuthCookiesAction();
  return { success: true };
}

/**
 * Refreshes the access token using the httpOnly refresh_token cookie.
 * Reads the refresh token server-side (can't be read client-side),
 * calls the backend refresh endpoint, and rotates both cookies.
 */
export async function refreshTokenAction(): Promise<{
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  error?: string;
}> {
  const cookieStore = await cookies();

  try {
    const refreshToken = cookieStore.get('refresh_token')?.value;
    if (!refreshToken) {
      return { success: false };
    }

    const response = await fetch(buildBackendEndpoint('/auth/refresh'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      // Try to extract error message from response body
      let errorMessage: string | undefined;
      try {
        const errorData = (await response.json()) as {
          message?: string;
          detail?: string;
        };
        errorMessage = errorData.message ?? errorData.detail;
      } catch {
        // Response wasn't JSON, ignore
      }

      cookieStore.delete('access_token');
      cookieStore.delete('refresh_token');
      return { success: false, error: errorMessage };
    }

    const data = (await response.json()) as {
      access_token: string;
      refresh_token: string;
      refresh_expires_in?: number;
    };

    cookieStore.set('access_token', data.access_token, {
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });
    cookieStore.set('refresh_token', data.refresh_token, {
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: normalizeMaxAge(data.refresh_expires_in),
    });

    return {
      success: true,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    };
  } catch {
    cookieStore.delete('access_token');
    cookieStore.delete('refresh_token');
    return { success: false };
  }
}
