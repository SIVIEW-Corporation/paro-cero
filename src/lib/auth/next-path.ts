const MAX_NEXT_LENGTH = 2048;
const PROBE_ORIGIN = 'https://next-path.invalid';

/**
 * Returns `value` only when it is a same-site relative path that is safe to
 * redirect to after login (starts with `/`, not `//` or `/\`, no backslashes or
 * control characters, never `/login` itself). Anything else yields `null`.
 */
export function safeNextPath(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null;
  if (value.length === 0 || value.length > MAX_NEXT_LENGTH) return null;
  if (!value.startsWith('/') || value.startsWith('//')) return null;
  if (value.includes('\\')) return null;
  // URL parsers strip tabs/newlines, which could turn `/\t/x` into `//x`.
  if (/[\u0000-\u001f\u007f]/.test(value)) return null;

  let parsed: URL;
  try {
    parsed = new URL(value, PROBE_ORIGIN);
  } catch {
    return null;
  }
  if (parsed.origin !== PROBE_ORIGIN) return null;
  if (parsed.pathname === '/login' || parsed.pathname.startsWith('/login/'))
    return null;

  return value;
}
