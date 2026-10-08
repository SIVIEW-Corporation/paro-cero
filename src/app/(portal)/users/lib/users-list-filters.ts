import {
  CREATABLE_ROLE_LABELS,
  CREATABLE_ROLES,
  type CreatableRole,
} from './user-role-options';

/** Roles the users list can be filtered by (never `superadmin`). */
export type UserRoleFilter = CreatableRole;

export interface UsersListFilters {
  companyId: string | null;
  role: UserRoleFilter | null;
  search: string | null;
}

export interface UsersListState extends UsersListFilters {
  page: number;
}

export interface RoleFilterOption {
  value: UserRoleFilter | '';
  label: string;
}

export interface UsersEmptyState {
  title: string;
  description: string;
}

export const USERS_SEARCH_MAX_LENGTH = 100;
export const USERS_SEARCH_DEBOUNCE_MS = 300;

export const EMPTY_USERS_LIST_FILTERS: UsersListFilters = {
  companyId: null,
  role: null,
  search: null,
};

export const INITIAL_USERS_LIST_STATE: UsersListState = {
  page: 1,
  ...EMPTY_USERS_LIST_FILTERS,
};

const ALL_ROLES_VALUE = '';

/** "Todos los roles" first, then Supervisor, Operador and Visor. */
export const ROLE_FILTER_OPTIONS: RoleFilterOption[] = [
  { value: ALL_ROLES_VALUE, label: 'Todos los roles' },
  ...CREATABLE_ROLES.map((role) => ({
    value: role,
    label: CREATABLE_ROLE_LABELS[role],
  })),
];

/** Select value → `role` filter; "all" or any unknown value means no filter. */
export function toRoleFilter(value: string): UserRoleFilter | null {
  return (CREATABLE_ROLES as readonly string[]).includes(value)
    ? (value as UserRoleFilter)
    : null;
}

/** Trimmed search capped at 100 chars; blank input means no search. */
export function normalizeUsersSearch(
  value: string | null | undefined,
): string | null {
  const trimmed = (value ?? '').trim().slice(0, USERS_SEARCH_MAX_LENGTH);
  return trimmed === '' ? null : trimmed;
}

/**
 * Apply a filter change. Any effective change resets to page 1; a no-op patch
 * returns the same state so React can skip the update.
 */
export function applyUsersListFilter(
  state: UsersListState,
  patch: Partial<UsersListFilters>,
): UsersListState {
  const changed = (Object.keys(patch) as (keyof UsersListFilters)[]).some(
    (key) => patch[key] !== state[key],
  );
  return changed ? { ...state, ...patch, page: 1 } : state;
}

export function hasActiveUsersListFilters({
  companyId,
  role,
  search,
}: UsersListFilters): boolean {
  return Boolean(companyId || role || search);
}

export function getUsersEmptyState(hasFilters: boolean): UsersEmptyState {
  return hasFilters
    ? {
        title: 'No hay usuarios que coincidan con los filtros',
        description: 'Prueba con otros filtros o limpia la búsqueda.',
      }
    : {
        title: 'No se encontraron usuarios',
        description: 'Crea un nuevo usuario para comenzar.',
      };
}
