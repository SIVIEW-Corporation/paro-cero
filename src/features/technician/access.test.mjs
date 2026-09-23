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
const { technicianContext, canVisitDashboard } = await import(
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
  assert.equal(canVisitDashboard(user(), '/dashboard/workorders'), false);
  assert.equal(canVisitDashboard(user(), '/dashboard/mis-tareas-otro'), false);
  assert.equal(
    canVisitDashboard(user({ role: 'supervisor' }), '/dashboard/planeacion'),
    true,
  );
  assert.equal(
    canVisitDashboard(user({ role: 'operator' }), '/dashboard/planeacion'),
    false,
  );
});
