import { isProduction } from './config';
import {
  authCookieNames,
  clearedCookieWrites,
  isRememberFlag,
  sessionCookieWrites,
  type AuthCookieOptions,
  type AuthCookieWrite,
} from './cookie-options';
import type { SessionTokens } from './types';

/** Minimal views over Next's RequestCookies / ResponseCookies / cookies(). */
export interface CookieReader {
  get(name: string): { value: string } | undefined;
}

export interface CookieWriter {
  set(name: string, value: string, options: AuthCookieOptions): unknown;
}

export interface AuthCookieValues {
  accessToken?: string;
  refreshToken?: string;
  remember: boolean;
}

export function readAuthCookies(store: CookieReader): AuthCookieValues {
  const names = authCookieNames(isProduction());
  return {
    accessToken: store.get(names.access)?.value || undefined,
    refreshToken: store.get(names.refresh)?.value || undefined,
    remember: isRememberFlag(store.get(names.remember)?.value),
  };
}

export function applyCookieWrites(
  target: CookieWriter,
  writes: readonly AuthCookieWrite[],
) {
  for (const write of writes)
    target.set(write.name, write.value, write.options);
}

export function setSessionCookies(
  target: CookieWriter,
  tokens: SessionTokens,
  remember: boolean,
) {
  applyCookieWrites(
    target,
    sessionCookieWrites(isProduction(), tokens, remember),
  );
}

export function clearSessionCookies(target: CookieWriter) {
  applyCookieWrites(target, clearedCookieWrites(isProduction()));
}
