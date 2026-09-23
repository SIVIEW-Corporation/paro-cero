import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

// Transpile in memory: exercise the actual store without a Next build or DOM.
function moduleUrl(file, imports = {}, salt = '') {
  const source = readFileSync(new URL(file, import.meta.url), 'utf8');
  const js = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ES2022,
    },
  }).outputText;
  const resolved = js.replace(
    /from (['"])([^'"]+)\1/g,
    (_, quote, spec) =>
      `from ${quote}${imports[spec] ?? import.meta.resolve(spec)}${quote}`,
  );
  return `data:text/javascript;base64,${Buffer.from(resolved + '\n//' + salt).toString('base64')}`;
}
const domain = moduleUrl('./domain.ts');
const schema = moduleUrl('./snapshot.ts', { './domain': domain });
const { snapshotSchema } = await import(schema);
const mockTechnicians = `data:text/javascript,export const TECNICOS = ${encodeURIComponent(
  JSON.stringify([
    { id: 'T001', nombre: 'Carlos' },
    { id: 'T002', nombre: 'Luis' },
    { id: 'T003', nombre: 'Maria' },
  ]),
)};`;
const mockOrders =
  'data:text/javascript,export const useWorkOrdersStore = { getState: () => ({ ordenes: [], setOrdenes: () => {} }) };';
let sequence = 0;
const createStore = async () =>
  (
    await import(
      moduleUrl(
        './store.ts',
        {
          './domain': domain,
          './snapshot': schema,
          '@/app/data/constants': mockTechnicians,
          '@/app/stores/useWorkOrdersStore': mockOrders,
        },
        String(sequence++),
      )
    )
  ).usePlanningStore;
let failWrites = false;
let storage;
function resetStorage() {
  storage = new Map();
  failWrites = false;
  globalThis.localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => {
      if (failWrites) throw new Error('Quota');
      storage.set(key, value);
    },
  };
}
const key = 'paro-cero-planning-demo-v1';

test('migra snapshots anteriores sin borrar IDs, horarios ni OT', async () => {
  resetStorage();
  const store = await createStore();
  store.getState().initialize();
  const legacy = JSON.parse(storage.get(key));
  legacy.assignments.forEach((a) => {
    delete a.status;
    a.workOrderId = 'OT383';
  });
  const parsed = snapshotSchema.parse(legacy);
  assert.equal(parsed.assignments[0].status, 'pendiente');
  assert.equal(parsed.assignments[0].id, legacy.assignments[0].id);
  assert.equal(parsed.assignments[0].start, legacy.assignments[0].start);
  assert.equal(parsed.assignments[0].workOrderId, 'OT383');
});
test('guarda inicio, completado, actor e historial y restaura al recargar', async () => {
  resetStorage();
  const store = await createStore();
  store.getState().initialize();
  assert.equal(
    store
      .getState()
      .changeTaskStatus('demo-clean', 'T001', 'en_proceso', 'pendiente'),
    null,
  );
  assert.equal(
    store
      .getState()
      .changeTaskStatus('demo-clean', 'T001', 'completada', 'en_proceso'),
    null,
  );
  const reloaded = await createStore();
  reloaded.getState().initialize();
  const saved = reloaded.getState().data;
  assert.equal(saved.assignments[0].status, 'completada');
  assert.ok(saved.assignments[0].startedAt);
  assert.ok(saved.assignments[0].completedAt);
  assert.equal(saved.audit.length, 2);
  assert.match(saved.audit[0].actor, /Carlos.*técnico/);
});
test('no cambia estado en memoria ni disco cuando falla localStorage', async () => {
  resetStorage();
  const store = await createStore();
  store.getState().initialize();
  const before = store.getState().data;
  const raw = storage.get(key);
  failWrites = true;
  assert.match(
    store
      .getState()
      .changeTaskStatus('demo-clean', 'T001', 'en_proceso', 'pendiente'),
    /No se pudo/,
  );
  assert.equal(store.getState().data, before);
  assert.equal(storage.get(key), raw);
});
test('rechaza identidad incorrecta, transición duplicada y segunda tarea activa', async () => {
  resetStorage();
  const store = await createStore();
  store.getState().initialize();
  assert.ok(
    store
      .getState()
      .changeTaskStatus('demo-clean', 'T002', 'en_proceso', 'pendiente'),
  );
  assert.ok(
    store
      .getState()
      .changeTaskStatus('demo-clean', 'unknown', 'en_proceso', 'pendiente'),
  );
  assert.equal(
    store
      .getState()
      .changeTaskStatus('demo-clean', 'T001', 'en_proceso', 'pendiente'),
    null,
  );
  assert.ok(
    store
      .getState()
      .changeTaskStatus('demo-clean', 'T001', 'en_proceso', 'pendiente'),
  );
  assert.ok(
    store
      .getState()
      .changeTaskStatus('demo-tools', 'T001', 'en_proceso', 'pendiente'),
  );
});
test('otra pestaña no sobrescribe un estado nuevo con una vista vieja', async () => {
  resetStorage();
  const first = await createStore();
  first.getState().initialize();
  const second = await createStore();
  second.getState().initialize();
  assert.equal(
    first
      .getState()
      .changeTaskStatus('demo-clean', 'T001', 'en_proceso', 'pendiente'),
    null,
  );
  assert.match(
    second
      .getState()
      .changeTaskStatus('demo-tools', 'T001', 'en_proceso', 'pendiente'),
    /otra pestaña/,
  );
  assert.equal(second.getState().data.assignments[0].status, 'en_proceso');
  assert.equal(
    JSON.parse(storage.get(key)).assignments.find((t) => t.id === 'demo-tools')
      .status,
    'pendiente',
  );
});
test('edición del jefe no revierte progreso ni elimina historial', async () => {
  resetStorage();
  const store = await createStore();
  store.getState().initialize();
  const stale = structuredClone(store.getState().data);
  store
    .getState()
    .changeTaskStatus('demo-clean', 'T001', 'en_proceso', 'pendiente');
  assert.ok(store.getState().commit(stale, 'Edición vieja'));
  const next = structuredClone(store.getState().data);
  next.assignments.shift();
  assert.match(store.getState().commit(next, 'Eliminar'), /historial/);
});
test('cancelación del jefe conserva tarea con estado y técnico no la inicia', async () => {
  resetStorage();
  const store = await createStore();
  store.getState().initialize();
  const next = structuredClone(store.getState().data);
  next.assignments[0].status = 'cancelada';
  assert.equal(store.getState().commit(next, 'Cancelar'), null);
  assert.ok(
    store
      .getState()
      .changeTaskStatus('demo-clean', 'T001', 'en_proceso', 'cancelada'),
  );
  assert.equal(store.getState().data.assignments.length, 5);
});
