import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const source = readFileSync(new URL('./access.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(source, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ES2022,
  },
}).outputText;
const {
  APP_ROLES,
  ROLE_LABELS,
  technicianContext,
  canVisitDashboard,
  getAppRole,
  getRoleLabel,
  getRolePermissions,
  isTechnicianRole,
  isAssignableRole,
} = await import(
  `data:text/javascript;base64,${Buffer.from(js).toString('base64')}`
);
const technicians = [
  { id: 'T001', nombre: 'Carlos' },
  { id: 'T003', nombre: 'María' },
];
const user = (patch = {}) => ({
  id: 'T003',
  role: 'operator',
  is_active: true,
  ...patch,
});
test('usuario técnico solo ve su identidad aunque se pida otro ID', () => {
  const context = technicianContext(user(), false, 'T001', technicians);
  assert.equal(context.technician.id, 'T003');
  assert.equal(context.canSimulate, false);
});
test('usuario sin mapping nunca cae por defecto a Carlos', () => {
  assert.equal(
    technicianContext(
      user({ id: 'uuid-no-vinculado' }),
      false,
      'T001',
      technicians,
    ).technician,
    null,
  );
});
test('simulación explícita de demo o supervisor permite cambiar técnicos', () => {
  assert.equal(
    technicianContext(null, true, 'T001', technicians).technician.id,
    'T001',
  );
  assert.equal(
    technicianContext(user({ role: 'admin' }), false, 'T001', technicians)
      .technician.id,
    'T001',
  );
});
test('perfil inactivo, visor y sesión ausente no acceden a agenda interna', () => {
  for (const profile of [
    null,
    user({ is_active: false }),
    user({ role: 'viewer' }),
  ])
    assert.equal(
      technicianContext(profile, false, 'T001', technicians).technician,
      null,
    );
});
test('guard de interfaz restringe operador a Mis tareas y supervisor accede a Planeación', () => {
  assert.equal(canVisitDashboard(user(), '/dashboard/mis-tareas'), true);
  assert.equal(canVisitDashboard(user(), '/dashboard/planeacion'), false);
  assert.equal(canVisitDashboard(user(), '/dashboard/workorders'), true);
  assert.equal(canVisitDashboard(user(), '/dashboard/assets'), true);
  assert.equal(canVisitDashboard(user(), '/dashboard/plans'), true);
  assert.equal(canVisitDashboard(user(), '/dashboard/reports'), true);
  assert.equal(canVisitDashboard(user(), '/dashboard/mis-tareas-otro'), false);
  assert.equal(
    canVisitDashboard(user({ role: 'admin' }), '/dashboard/planeacion'),
    true,
  );
  assert.equal(
    canVisitDashboard(user({ role: 'operator' }), '/dashboard/planeacion'),
    false,
  );
  for (const role of ['superadmin', 'admin', 'operator', 'viewer']) {
    assert.equal(canVisitDashboard(user({ role }), '/dashboard/reports'), true);
  }
});

test('solo existen los cuatro roles del producto', () => {
  assert.deepEqual(Object.values(APP_ROLES).sort(), [
    'admin',
    'operator',
    'superadmin',
    'viewer',
  ]);
});

test('superadmin gestiona usuarios, empresas y todos los módulos', () => {
  const superadmin = getRolePermissions('superadmin');
  assert.equal(superadmin.users, true);
  assert.equal(superadmin.technicians, true);
  assert.deepEqual(superadmin.assets, { read: true, manage: true });
  assert.deepEqual(superadmin.plans, {
    read: true,
    manage: true,
    execute: true,
  });
  assert.deepEqual(superadmin.workOrders, {
    read: true,
    create: true,
    edit: true,
    changeStatus: true,
    delete: true,
    manageEvidence: true,
  });
  assert.deepEqual(superadmin.inspections, {
    read: true,
    manage: true,
    execute: true,
    registerFinding: true,
    createWorkOrder: true,
  });
});

test('admin (Supervisor) gestiona operación pero no usuarios', () => {
  const admin = getRolePermissions('admin');
  assert.equal(admin.users, false);
  assert.equal(admin.technicians, true);
  assert.deepEqual(admin.assets, { read: true, manage: true });
  assert.deepEqual(admin.plans, { read: true, manage: true, execute: true });
  assert.equal(admin.workOrders.delete, true);
  assert.equal(admin.workOrders.edit, true);
  assert.equal(admin.workOrders.manageEvidence, true);
  assert.equal(admin.inspections.manage, true);
  assert.equal(admin.planning.manage, true);
  const { users: _u, ...adminRest } = admin;
  const { users: _s, ...superRest } = getRolePermissions('superadmin');
  void _u;
  void _s;
  assert.deepEqual(adminRest, superRest);
});

test('operator (Operador) ejecuta y edita OT pero no borra ni administra', () => {
  const operator = getRolePermissions('operator');
  assert.equal(operator.users, false);
  assert.equal(operator.technicians, false);
  assert.deepEqual(operator.assets, { read: true, manage: false });
  assert.deepEqual(operator.plans, {
    read: true,
    manage: false,
    execute: true,
  });
  assert.deepEqual(operator.workOrders, {
    read: true,
    create: true,
    edit: true,
    changeStatus: true,
    delete: false,
    manageEvidence: true,
  });
  assert.deepEqual(operator.inspections, {
    read: true,
    manage: false,
    execute: true,
    registerFinding: true,
    createWorkOrder: true,
  });
  assert.deepEqual(operator.planning, { read: false, manage: false });
  assert.deepEqual(operator.tasks, { read: true, add: true });
});

test('viewer (Visor) es de solo lectura', () => {
  const viewer = getRolePermissions('viewer');
  assert.equal(viewer.users, false);
  assert.equal(viewer.technicians, false);
  assert.deepEqual(viewer.assets, { read: true, manage: false });
  assert.deepEqual(viewer.plans, { read: true, manage: false, execute: false });
  assert.deepEqual(viewer.workOrders, {
    read: true,
    create: false,
    edit: false,
    changeStatus: false,
    delete: false,
    manageEvidence: false,
  });
  assert.deepEqual(viewer.inspections, {
    read: true,
    manage: false,
    execute: false,
    registerFinding: false,
    createWorkOrder: false,
  });
  assert.equal(viewer.planning.manage, false);
  assert.equal(viewer.tasks.read, false);
  assert.equal(viewer.notifications.markRead, false);
});

test('solo admin y superadmin pueden eliminar OT', () => {
  const deleters = Object.values(APP_ROLES).filter(
    (role) => getRolePermissions(role).workOrders.delete,
  );
  assert.deepEqual(deleters.sort(), ['admin', 'superadmin']);
});

test('roles legados o desconocidos no reciben ningún permiso', () => {
  for (const role of [
    'jefe',
    'supervisor',
    'tecnico',
    'desconocido',
    'Admin',
    ' admin',
    'constructor',
    '__proto__',
    'toString',
    '',
    null,
    undefined,
  ]) {
    assert.equal(getAppRole(role), null, String(role));
    assert.equal(getRolePermissions(role), null, String(role));
    assert.equal(isTechnicianRole(role), false, String(role));
    assert.equal(
      canVisitDashboard(user({ role }), '/dashboard/workorders'),
      false,
      String(role),
    );
    assert.equal(canVisitDashboard(user({ role }), '/users'), false);
  }
});

test('solo el operador es rol técnico (agenda propia)', () => {
  assert.equal(isTechnicianRole('operator'), true);
  for (const role of ['superadmin', 'admin', 'viewer'])
    assert.equal(isTechnicianRole(role), false, role);
});

test('la gestión de usuarios /users es exclusiva del superadmin', () => {
  assert.equal(canVisitDashboard(user({ role: 'superadmin' }), '/users'), true);
  for (const role of ['admin', 'operator', 'viewer'])
    assert.equal(canVisitDashboard(user({ role }), '/users'), false, role);
});

test('etiquetas de rol en español', () => {
  assert.deepEqual(ROLE_LABELS, {
    superadmin: 'Superadmin',
    admin: 'Supervisor',
    operator: 'Operador',
    viewer: 'Visor',
  });
  assert.equal(getRoleLabel('admin'), 'Supervisor');
  assert.equal(getRoleLabel('operator'), 'Operador');
  assert.equal(getRoleLabel('viewer'), 'Visor');
  assert.equal(getRoleLabel('superadmin'), 'Superadmin');
  for (const role of ['jefe', 'tecnico', 'supervisor', 'x', '', null])
    assert.equal(getRoleLabel(role), 'Rol no reconocido', String(role));
});

test('el portal de activos /assets es visible para perfiles activos con lectura de activos', () => {
  const assetId = '550e8400-e29b-41d4-a716-446655440000';
  for (const role of ['superadmin', 'admin', 'operator', 'viewer']) {
    assert.equal(canVisitDashboard(user({ role }), '/assets'), true, role);
    assert.equal(
      canVisitDashboard(user({ role }), `/assets/${assetId}`),
      true,
      role,
    );
  }
  assert.equal(canVisitDashboard(user({ is_active: false }), '/assets'), false);
  assert.equal(canVisitDashboard(null, '/assets'), false);
  assert.equal(
    canVisitDashboard(user({ role: 'desconocido' }), '/assets'),
    false,
  );
  assert.equal(canVisitDashboard(user(), '/assets-otro'), false);
});

test('supervisores y operadores son asignables a órdenes de trabajo', () => {
  assert.equal(isAssignableRole('admin'), true);
  assert.equal(isAssignableRole('operator'), true);
  for (const role of ['superadmin', 'viewer', 'jefe', 'tecnico', '', null])
    assert.equal(isAssignableRole(role), false, String(role));
});
