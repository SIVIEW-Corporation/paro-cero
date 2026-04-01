'use server';
import { cookies } from 'next/headers';

export async function setAuthTokenAction(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('access_token', token, {
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 900, // 15 minutes — slightly longer than JWT expiry
  });
  return { success: true };
}

export async function setRefreshTokenAction(refreshToken: string) {
  const cookieStore = await cookies();
  cookieStore.set('refresh_token', refreshToken, {
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 86400, // 1 day
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
) {
  const cookieStore = await cookies();

  cookieStore.set('access_token', accessToken, {
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 900, // 15 minutes — slightly longer than JWT expiry
  });

  cookieStore.set('refresh_token', refreshToken, {
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 86400, // 1 day
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
  error?: string;
}> {
  const cookieStore = await cookies();

  try {
    const refreshToken = cookieStore.get('refresh_token')?.value;
    if (!refreshToken) {
      return { success: false };
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      },
    );

    if (!response.ok) {
      // Try to extract error message from response body
      let errorMessage: string | undefined;
      try {
        const errorData = (await response.json()) as { message?: string };
        errorMessage = errorData.message;
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
    };

    cookieStore.set('access_token', data.access_token, {
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 900,
    });
    cookieStore.set('refresh_token', data.refresh_token, {
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400,
    });

    return { success: true, accessToken: data.access_token };
  } catch {
    cookieStore.delete('access_token');
    cookieStore.delete('refresh_token');
    return { success: false };
  }
}
