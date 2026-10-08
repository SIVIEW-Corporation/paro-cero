export const USERS_TABS = {
  ALL_USERS: 'all-users',
  NEW_USER: 'new-user',
  COMPANIES: 'companies',
} as const;

export type UsersTabId = (typeof USERS_TABS)[keyof typeof USERS_TABS];

/** Company management is reserved to the platform superadmin. */
export function canManageCompanies(role: string | null | undefined): boolean {
  return role === 'superadmin';
}

export function getUsersTabIds(role: string | null | undefined): UsersTabId[] {
  const tabs: UsersTabId[] = [USERS_TABS.ALL_USERS, USERS_TABS.NEW_USER];
  if (canManageCompanies(role)) tabs.push(USERS_TABS.COMPANIES);
  return tabs;
}

/** Falls back to the users list when the tab is unknown or not allowed. */
export function resolveUsersTab(
  role: string | null | undefined,
  activeTab: string,
): UsersTabId {
  const allowed: string[] = getUsersTabIds(role);
  return allowed.includes(activeTab)
    ? (activeTab as UsersTabId)
    : USERS_TABS.ALL_USERS;
}
