import type { SessionTokens } from './types';

/**
 * Pure cookie policy for the BFF session. Production uses `__Host-` names,
 * which browsers only accept with Secure, Path=/ and no Domain.
 */

const BASE_NAMES = {
  ACCESS: 'access_token',
  REFRESH: 'refresh_token',
  REMEMBER: 'remember_session',
} as const;

const HOST_PREFIX = '__Host-';
const DEFAULT_ACCESS_MAX_AGE = 15 * 60;
const DEFAULT_REFRESH_MAX_AGE = 7 * 24 * 60 * 60;
const REMEMBER_FLAG_VALUE = '1';

export interface AuthCookieNames {
  access: string;
  refresh: string;
  remember: string;
}

export interface AuthCookieOptions {
  httpOnly: true;
  secure: boolean;
  sameSite: 'lax';
  path: '/';
  maxAge?: number;
}

export interface AuthCookieWrite {
  name: string;
  value: string;
  options: AuthCookieOptions;
}

export function authCookieNames(isProduction: boolean): AuthCookieNames {
  const prefix = isProduction ? HOST_PREFIX : '';
  return {
    access: `${prefix}${BASE_NAMES.ACCESS}`,
    refresh: `${prefix}${BASE_NAMES.REFRESH}`,
    remember: `${prefix}${BASE_NAMES.REMEMBER}`,
  };
}

function positiveSeconds(value: number | null | undefined, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? Math.floor(value)
    : fallback;
}

function baseOptions(isProduction: boolean): AuthCookieOptions {
  return { httpOnly: true, secure: isProduction, sameSite: 'lax', path: '/' };
}

export function accessCookieOptions(
  isProduction: boolean,
  expiresIn: number | null | undefined,
): AuthCookieOptions {
  return {
    ...baseOptions(isProduction),
    maxAge: positiveSeconds(expiresIn, DEFAULT_ACCESS_MAX_AGE),
  };
}

/** Persistent only with remember-me; otherwise a browser-session cookie. */
export function refreshCookieOptions(
  isProduction: boolean,
  remember: boolean,
  refreshExpiresIn: number | null | undefined,
): AuthCookieOptions {
  if (!remember) return baseOptions(isProduction);
  return {
    ...baseOptions(isProduction),
    maxAge: positiveSeconds(refreshExpiresIn, DEFAULT_REFRESH_MAX_AGE),
  };
}

export function expiredCookieOptions(isProduction: boolean): AuthCookieOptions {
  return { ...baseOptions(isProduction), maxAge: 0 };
}

export function isRememberFlag(value: string | undefined): boolean {
  return value === REMEMBER_FLAG_VALUE;
}

/** Cookie writes for a new or rotated session. */
export function sessionCookieWrites(
  isProduction: boolean,
  tokens: SessionTokens,
  remember: boolean,
): AuthCookieWrite[] {
  const names = authCookieNames(isProduction);
  return [
    {
      name: names.access,
      value: tokens.accessToken,
      options: accessCookieOptions(isProduction, tokens.expiresIn),
    },
    {
      name: names.refresh,
      value: tokens.refreshToken,
      options: refreshCookieOptions(
        isProduction,
        remember,
        tokens.refreshExpiresIn,
      ),
    },
    remember
      ? {
          name: names.remember,
          value: REMEMBER_FLAG_VALUE,
          options: refreshCookieOptions(
            isProduction,
            true,
            tokens.refreshExpiresIn,
          ),
        }
      : {
          name: names.remember,
          value: '',
          options: expiredCookieOptions(isProduction),
        },
  ];
}

/**
 * Cookie writes that remove every auth cookie. In production this also expires
 * the legacy un-prefixed cookies written before the BFF migration.
 */
export function clearedCookieWrites(isProduction: boolean): AuthCookieWrite[] {
  const names = authCookieNames(isProduction);
  const legacy = isProduction ? Object.values(authCookieNames(false)) : [];
  return [names.access, names.refresh, names.remember, ...legacy].map(
    (name) => ({
      name,
      value: '',
      options: expiredCookieOptions(isProduction),
    }),
  );
}
