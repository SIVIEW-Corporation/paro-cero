import type { AssetListParams } from '../types';

/**
 * Query keys for the portal assets module. Every key is scoped by the auth
 * session (user/company/role) so cached data never leaks across sessions, and
 * uses its own root to avoid sharing cache shapes with the legacy flow.
 */
export const assetKeys = {
  all: (session: string) => ['portal-assets', session] as const,
  lists: (session: string) => [...assetKeys.all(session), 'list'] as const,
  list: (session: string, params: AssetListParams) =>
    [...assetKeys.lists(session), params] as const,
  detail: (session: string, id: string) =>
    [...assetKeys.all(session), 'detail', id] as const,
};
