/** Server-side configuration for the BFF. Never import from client code. */

const DEV_API_URL = 'http://127.0.0.1:8000';

export class BffConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BffConfigError';
  }
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/** Backend root (`API_URL`); falls back to localhost outside production. */
export function apiBaseUrl(): string {
  const configured = process.env.API_URL?.trim();
  if (configured) return configured;
  if (!isProduction()) return DEV_API_URL;
  throw new BffConfigError('API_URL is not configured');
}

let warnedMissingSecret = false;

/** Shared secret the backend uses to recognise BFF calls. */
export function bffSharedSecret(): string | undefined {
  const secret = process.env.BFF_SHARED_SECRET?.trim();
  if (!secret && isProduction() && !warnedMissingSecret) {
    warnedMissingSecret = true;
    console.error('[bff] BFF_SHARED_SECRET is not configured');
  }
  return secret || undefined;
}

/** Public site URL, used as an extra allowed Origin for CSRF checks. */
export function siteUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SITE_URL?.trim() || undefined;
}
