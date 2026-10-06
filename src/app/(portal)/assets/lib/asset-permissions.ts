/** Only admin/superadmin can create, edit or delete assets (backend rule). */
export function canManageAssets(role: string | null | undefined): boolean {
  return role === 'admin' || role === 'superadmin';
}
