import { APP_ROLES, ROLE_LABELS } from '@/features/technician/access';

/** Roles the "Crear nuevo" form can create. `superadmin` is never offered. */
export const CREATABLE_ROLES = [
  APP_ROLES.ADMIN,
  APP_ROLES.OPERATOR,
  APP_ROLES.VIEWER,
] as const;

export type CreatableRole = (typeof CREATABLE_ROLES)[number];

export const CREATABLE_ROLE_LABELS: Record<CreatableRole, string> = {
  admin: ROLE_LABELS.admin,
  operator: ROLE_LABELS.operator,
  viewer: ROLE_LABELS.viewer,
};

/**
 * Roles the superadmin can reassign from the edit modal, in any direction.
 * `superadmin` is never offered; unrecognized roles stay read-only.
 */
export const EDITABLE_ROLES = [
  APP_ROLES.ADMIN,
  APP_ROLES.OPERATOR,
  APP_ROLES.VIEWER,
] as const;

export type EditableRole = (typeof EDITABLE_ROLES)[number];

export function isEditableRole(
  role: string | null | undefined,
): role is EditableRole {
  return (EDITABLE_ROLES as readonly string[]).includes(role ?? '');
}

/**
 * Roles the current user may create. User management belongs to the
 * platform superadmin, who creates users for any company.
 */
export function getCreatableRoles(
  currentRole: string | null | undefined,
): CreatableRole[] {
  return currentRole === APP_ROLES.SUPERADMIN ? [...CREATABLE_ROLES] : [];
}

export function canCreateRole(
  currentRole: string | null | undefined,
  role: string,
): boolean {
  return (getCreatableRoles(currentRole) as string[]).includes(role);
}
