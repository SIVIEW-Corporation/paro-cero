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
const { technicianContext, canVisitDashboard, getRolePermissions } =
  await import(
    `data:text/javascript;base64,${Buffer.from(js).toString('base64')}`
  );
const technicians = [
  { id: 'T001', nombre: 'Carlos' },
  { id: 'T003', nombre: 'María' },
];
const user = (patch = {}) => ({
  id: 'T003',
  role: 'tecnico',
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
test('simulación explícita de demo o jefe permite cambiar técnicos', () => {
  assert.equal(
    technicianContext(null, true, 'T001', technicians).technician.id,
    'T001',
  );
  assert.equal(
    technicianContext(user({ role: 'supervisor' }), false, 'T001', technicians)
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
test('guard de interfaz restringe técnico a Mis tareas y jefe accede a Planeación', () => {
  assert.equal(canVisitDashboard(user(), '/dashboard/mis-tareas'), true);
  assert.equal(canVisitDashboard(user(), '/dashboard/planeacion'), false);
  assert.equal(canVisitDashboard(user(), '/dashboard/workorders'), true);
  assert.equal(canVisitDashboard(user(), '/dashboard/assets'), true);
  assert.equal(canVisitDashboard(user(), '/dashboard/plans'), true);
  assert.equal(canVisitDashboard(user(), '/dashboard/reports'), true);
  assert.equal(canVisitDashboard(user(), '/dashboard/mis-tareas-otro'), false);
  assert.equal(
    canVisitDashboard(user({ role: 'supervisor' }), '/dashboard/planeacion'),
    true,
  );
  assert.equal(
    canVisitDashboard(user({ role: 'operator' }), '/dashboard/planeacion'),
    false,
  );
  for (const role of [
    'superadmin',
    'admin',
    'jefe',
    'supervisor',
    'operator',
    'tecnico',
    'viewer',
  ]) {
    assert.equal(canVisitDashboard(user({ role }), '/dashboard/reports'), true);
  }
});

test('la matriz separa jefe, técnico, visor y superusuario', () => {
  const jefe = getRolePermissions('jefe');
  assert.equal(jefe.assets.read, true);
  assert.equal(jefe.assets.manage, false);
  assert.equal(jefe.plans.manage, true);
  assert.equal(jefe.planning.manage, true);
  assert.equal(jefe.users, false);

  const tecnico = getRolePermissions('operator');
  assert.equal(tecnico.assets.manage, false);
  assert.equal(tecnico.plans.read, true);
  assert.equal(tecnico.plans.manage, false);
  assert.equal(tecnico.plans.execute, true);
  assert.equal(tecnico.workOrders.create, true);
  assert.equal(tecnico.workOrders.changeStatus, true);
  assert.equal(tecnico.workOrders.edit, false);
  assert.equal(tecnico.tasks.add, true);

  const visor = getRolePermissions('viewer');
  assert.equal(visor.planning.read, true);
  assert.equal(visor.plans.execute, false);
  assert.equal(visor.tasks.read, false);
  assert.equal(visor.workOrders.changeStatus, false);
  assert.equal(visor.notifications.markRead, false);

  assert.equal(getRolePermissions('superadmin').users, true);
  assert.equal(getRolePermissions('admin').users, false);
});

test('jefe y supervisor solo leen activos y conservan el resto de permisos de gestión', () => {
  const admin = getRolePermissions('admin');
  for (const role of ['jefe', 'supervisor']) {
    const permissions = getRolePermissions(role);
    assert.deepEqual(permissions.assets, { read: true, manage: false }, role);
    const { assets: _assets, ...rest } = permissions;
    const { assets: adminAssets, ...adminRest } = admin;
    void _assets;
    assert.deepEqual(rest, adminRest, role);
    assert.deepEqual(adminAssets, { read: true, manage: true });
  }
  assert.equal(getRolePermissions('superadmin').assets.manage, true);
});

test('el portal de activos /assets es visible para perfiles activos con lectura de activos', () => {
  const assetId = '550e8400-e29b-41d4-a716-446655440000';
  for (const role of [
    'superadmin',
    'admin',
    'jefe',
    'supervisor',
    'operator',
    'tecnico',
    'viewer',
  ]) {
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
