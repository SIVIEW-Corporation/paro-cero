/** Presentation boundaries for the LOCAL demo. Production must authorize on
 * the server and scope assignments by authenticated user + company. */
export interface AgendaUser {
  id: string;
  role: string;
  is_active: boolean;
}
export interface DemoTechnician {
  id: string;
  nombre: string;
}
export function isPlanningManager(role: string): boolean {
  return ['admin', 'superadmin', 'supervisor'].includes(role);
}
export function canViewTechnicianTasks(role: string): boolean {
  return role === 'tecnico' || isPlanningManager(role);
}
export function canVisitDashboard(
  user: AgendaUser | null,
  pathname: string,
): boolean {
  if (!user?.is_active) return false;
  const tasks =
    pathname === '/dashboard/mis-tareas' ||
    pathname.startsWith('/dashboard/mis-tareas/');
  const planning =
    pathname === '/dashboard/planeacion' ||
    pathname.startsWith('/dashboard/planeacion/');
  if (user.role === 'tecnico') return tasks;
  if (planning) return isPlanningManager(user.role);
  if (tasks) return canViewTechnicianTasks(user.role);
  return true;
}
export function technicianContext(
  user: AgendaUser | null,
  demoMode: boolean,
  selectedId: string,
  technicians: DemoTechnician[],
) {
  const canSimulate =
    demoMode || Boolean(user?.is_active && isPlanningManager(user.role));
  if (canSimulate) {
    const technician = technicians.find((t) => t.id === selectedId);
    return {
      technician: technician ?? null,
      canSimulate: true,
      error: technician ? '' : 'Seleccioná un técnico de prueba.',
    };
  }
  if (!user?.is_active || user.role !== 'tecnico')
    return {
      technician: null,
      canSimulate: false,
      error: 'Tu perfil no tiene acceso a esta agenda técnica.',
    };
  const technician = technicians.find((t) => t.id === user.id);
  return {
    technician: technician ?? null,
    canSimulate: false,
    error: technician
      ? ''
      : 'Tu usuario no tiene una agenda vinculada en los datos de prueba. No se muestran tareas de otros técnicos.',
  };
}
