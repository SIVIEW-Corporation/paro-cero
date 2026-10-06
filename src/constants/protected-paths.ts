import { tabPaths } from './tab-paths';

/** Route roots that require a valid (unexpired) `access_token` cookie (enforced by the proxy). */
export const protectedPaths = [...tabPaths, '/assets', '/users'] as const;

export type ProtectedPath = (typeof protectedPaths)[number];

/** True when `pathname` is a protected root or one of its subpaths (segment match). */
export function isProtectedPath(pathname: string): boolean {
  return protectedPaths.some(
    (root) => pathname === root || pathname.startsWith(`${root}/`),
  );
}
