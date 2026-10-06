/** Presentation boundaries for the LOCAL demo. Production must authorize on
 * the server and scope assignments by authenticated user + company. */

export const APP_ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  JEFE: 'jefe',
  SUPERVISOR: 'supervisor',
  OPERATOR: 'operator',
  TECNICO: 'tecnico',
  VIEWER: 'viewer',
} as const;

export type AppRole = (typeof APP_ROLES)[keyof typeof APP_ROLES];

interface AssetPermissions {
  read: boolean;
  manage: boolean;
}

interface PlanPermissions {
  read: boolean;
  manage: boolean;
  execute: boolean;
}

interface WorkOrderPermissions {
  read: boolean;
  create: boolean;
  edit: boolean;
  changeStatus: boolean;
  delete: boolean;
  manageEvidence: boolean;
}

interface PlanningPermissions {
  read: boolean;
  manage: boolean;
}

interface TaskPermissions {
  read: boolean;
  add: boolean;
}

interface InspectionPermissions {
  read: boolean;
  manage: boolean;
  execute: boolean;
  registerFinding: boolean;
  createWorkOrder: boolean;
}

interface NotificationPermissions {
  read: boolean;
  markRead: boolean;
}

export interface RolePermissions {
  users: boolean;
  assets: AssetPermissions;
  plans: PlanPermissions;
  workOrders: WorkOrderPermissions;
  planning: PlanningPermissions;
  tasks: TaskPermissions;
  inspections: InspectionPermissions;
  notifications: NotificationPermissions;
  reports: boolean;
}

export interface AgendaUser {
  id: string;
  role: string;
  is_active: boolean;
}

export interface DemoTechnician {
  id: string;
  nombre: string;
}

const managerPermissions: RolePermissions = {
  users: false,
  assets: { read: true, manage: true },
  plans: { read: true, manage: true, execute: true },
  workOrders: {
    read: true,
    create: true,
    edit: true,
    changeStatus: true,
    delete: true,
    manageEvidence: true,
  },
  planning: { read: true, manage: true },
  tasks: { read: true, add: true },
  inspections: {
    read: true,
    manage: true,
    execute: true,
    registerFinding: true,
    createWorkOrder: true,
  },
  notifications: { read: true, markRead: true },
  reports: true,
};

/** Backend only lets admin/superadmin create, update or delete assets. */
const supervisorPermissions: RolePermissions = {
  ...managerPermissions,
  assets: { read: true, manage: false },
};

const ROLE_ALIASES: Record<string, AppRole> = {
  [APP_ROLES.SUPERADMIN]: APP_ROLES.SUPERADMIN,
  [APP_ROLES.ADMIN]: APP_ROLES.ADMIN,
  [APP_ROLES.JEFE]: APP_ROLES.JEFE,
  [APP_ROLES.SUPERVISOR]: APP_ROLES.JEFE,
  [APP_ROLES.OPERATOR]: APP_ROLES.OPERATOR,
  [APP_ROLES.TECNICO]: APP_ROLES.OPERATOR,
  [APP_ROLES.VIEWER]: APP_ROLES.VIEWER,
};

const ROLE_PERMISSIONS: Record<AppRole, RolePermissions> = {
  superadmin: { ...managerPermissions, users: true },
  admin: managerPermissions,
  jefe: supervisorPermissions,
  supervisor: supervisorPermissions,
  operator: {
    users: false,
    assets: { read: true, manage: false },
    plans: { read: true, manage: false, execute: true },
    workOrders: {
      read: true,
      create: true,
      edit: false,
      changeStatus: true,
      delete: false,
      manageEvidence: false,
    },
    planning: { read: false, manage: false },
    tasks: { read: true, add: true },
    inspections: {
      read: true,
      manage: false,
      execute: true,
      registerFinding: true,
      createWorkOrder: true,
    },
    notifications: { read: true, markRead: true },
    reports: true,
  },
  tecnico: {
    users: false,
    assets: { read: true, manage: false },
    plans: { read: true, manage: false, execute: true },
    workOrders: {
      read: true,
      create: true,
      edit: false,
      changeStatus: true,
      delete: false,
      manageEvidence: false,
    },
    planning: { read: false, manage: false },
    tasks: { read: true, add: true },
    inspections: {
      read: true,
      manage: false,
      execute: true,
      registerFinding: true,
      createWorkOrder: true,
    },
    notifications: { read: true, markRead: true },
    reports: true,
  },
  viewer: {
    users: false,
    assets: { read: true, manage: false },
    plans: { read: true, manage: false, execute: false },
    workOrders: {
      read: true,
      create: false,
      edit: false,
      changeStatus: false,
      delete: false,
      manageEvidence: false,
    },
    planning: { read: true, manage: false },
    tasks: { read: false, add: false },
    inspections: {
      read: true,
      manage: false,
      execute: false,
      registerFinding: false,
      createWorkOrder: false,
    },
    notifications: { read: true, markRead: false },
    reports: true,
  },
};

export function getAppRole(role: string | null | undefined): AppRole | null {
  return role ? (ROLE_ALIASES[role] ?? null) : null;
}

export function getRolePermissions(
  role: string | null | undefined,
): RolePermissions | null {
  const appRole = getAppRole(role);
  return appRole ? ROLE_PERMISSIONS[appRole] : null;
}

export function isTechnicianRole(role: string | null | undefined): boolean {
  return role === APP_ROLES.OPERATOR || role === APP_ROLES.TECNICO;
}

export function isPlanningManager(role: string | null | undefined): boolean {
  return Boolean(getRolePermissions(role)?.planning.manage);
}

type NavigableModule =
  | 'assets'
  | 'plans'
  | 'workOrders'
  | 'planning'
  | 'tasks'
  | 'inspections'
  | 'notifications'
  | 'reports';

export function canVisitModule(
  role: string | null | undefined,
  module: NavigableModule,
): boolean {
  const permissions = getRolePermissions(role);
  if (module === 'reports') return Boolean(permissions?.reports);
  return Boolean(permissions?.[module].read);
}

export function canViewTechnicianTasks(role: string): boolean {
  return Boolean(getRolePermissions(role)?.tasks.read);
}

export function canVisitDashboard(
  user: AgendaUser | null,
  pathname: string,
): boolean {
  if (!user?.is_active) return false;
  if (pathname === '/users' || pathname.startsWith('/users/')) {
    return Boolean(getRolePermissions(user.role)?.users);
  }

  const moduleByPath = [
    { prefix: '/assets', module: 'assets' },
    { prefix: '/dashboard/assets', module: 'assets' },
    { prefix: '/dashboard/plans', module: 'plans' },
    { prefix: '/dashboard/workorders', module: 'workOrders' },
    { prefix: '/dashboard/planeacion', module: 'planning' },
    { prefix: '/dashboard/mis-tareas', module: 'tasks' },
    { prefix: '/dashboard/inspecciones', module: 'inspections' },
    { prefix: '/dashboard/notifications', module: 'notifications' },
    { prefix: '/dashboard/reports', module: 'reports' },
  ] as const;
  const matchedModule = moduleByPath.find(
    (item) =>
      pathname === item.prefix || pathname.startsWith(`${item.prefix}/`),
  );

  return matchedModule
    ? canVisitModule(user.role, matchedModule.module)
    : pathname === '/dashboard' || pathname === '/dashboard/';
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
  if (!user?.is_active || !isTechnicianRole(user.role))
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
