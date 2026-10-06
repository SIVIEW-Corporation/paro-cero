/**
 * Unverified JWT helpers for the request proxy.
 *
 * The proxy only needs to know whether the `access_token` cookie is still
 * usable; signature verification stays with the backend. Everything here is
 * Edge-runtime safe (`atob` + `TextDecoder`, no Node `Buffer`).
 */

function decodeBase64Url(segment: string): string {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    '=',
  );
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** Reads the numeric `exp` claim (seconds) without verifying the signature. */
export function getAccessTokenExpiry(token: string): number | null {
  const segments = token.split('.');
  if (segments.length !== 3 || !segments[1]) return null;

  try {
    const payload: unknown = JSON.parse(decodeBase64Url(segments[1]));
    if (
      typeof payload !== 'object' ||
      payload === null ||
      Array.isArray(payload)
    )
      return null;
    const exp: unknown = (payload as Record<string, unknown>).exp;
    return typeof exp === 'number' && Number.isFinite(exp) ? exp : null;
  } catch {
    return null;
  }
}

/**
 * True when `token` is a well-formed JWT whose `exp` is strictly after `nowMs`.
 * Missing, malformed, or expired tokens count as no session.
 */
export function isAccessTokenValid(
  token: string | undefined,
  nowMs: number,
): boolean {
  if (!token) return false;
  const exp = getAccessTokenExpiry(token);
  return exp !== null && exp * 1000 > nowMs;
}
