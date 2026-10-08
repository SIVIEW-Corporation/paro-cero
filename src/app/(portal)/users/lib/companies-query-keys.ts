import type { UsersSessionScope } from './users-query-keys';

/**
 * Query keys for companies. Every key is scoped by the auth session so cached
 * data never leaks across sessions; invalidating `scope(...)` refreshes both
 * the management list and the company selector used by the user forms.
 */
export const companiesQueryKeys = {
  all: ['companies'] as const,
  scope: (scope: UsersSessionScope) =>
    [...companiesQueryKeys.all, scope] as const,
  lists: (scope: UsersSessionScope) =>
    [...companiesQueryKeys.scope(scope), 'list'] as const,
  list: (scope: UsersSessionScope, page: number, size: number) =>
    [...companiesQueryKeys.lists(scope), { page, size }] as const,
  selector: (scope: UsersSessionScope) =>
    [...companiesQueryKeys.scope(scope), 'selector'] as const,
};
