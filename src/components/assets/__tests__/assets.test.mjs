// Run: node --test src/components/assets/__tests__/assets.test.mjs
// Isolated payload, service, hook and component-handler tests. No DOM/browser,
// network, database writes, dependency installs, or application build required.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL('../../../../', import.meta.url));

function load(relative, mocks = {}, globals = {}) {
  const filename = path.join(root, relative);
  const source = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: filename,
  }).outputText;
  const compiled = { exports: {} };
  const resolver = (id) => {
    if (Object.hasOwn(mocks, id)) return mocks[id];
    if (id.startsWith('@/') || id.startsWith('.')) {
      const resolved = id.startsWith('@/')
        ? `src/${id.slice(2)}`
        : path.relative(root, path.resolve(path.dirname(filename), id));
      return load(`${resolved}.ts`, mocks, globals);
    }
    return require(id);
  };
  new Function('require', 'module', 'exports', ...Object.keys(globals), source)(
    resolver,
    compiled,
    compiled.exports,
    ...Object.values(globals),
  );
  return compiled.exports;
}

const fixture = {
  id: 'asset-1',
  company_id: 'company-1',
  code: 'EQ-001',
  name: 'Pump',
  area: 'Plant',
  serial: null,
  model: null,
  manufacturer: null,
  cost: 1234,
  status: 'standby',
  criticality: 'high',
  installed_at: '2024-04-01T18:42:19.123-06:00',
  is_active: true,
  created_at: '2024-04-01T00:00:00Z',
  updated_at: null,
  deleted_at: null,
};
const { assetToForm, buildAssetCreate, buildAssetUpdate } = load(
  'src/components/assets/asset-form.ts',
);

for (const status of [
  'commissioning',
  'operational',
  'standby',
  'maintenance',
  'down',
  'decommissioned',
]) {
  test(`unchanged ${status} preserves cost, nulls and full timestamp`, () => {
    const asset = { ...fixture, status };
    assert.deepEqual(buildAssetUpdate(asset, assetToForm(asset)), {});
    assert.deepEqual(
      buildAssetUpdate(asset, { ...assetToForm(asset), name: ' New name ' }),
      { name: 'New name' },
    );
  });
}

test('nullable fields never use presentation em dashes; explicit clearing emits null', () => {
  assert.equal(assetToForm(fixture).serial, '');
  const asset = {
    ...fixture,
    serial: 'SER-1',
    model: 'M1',
    manufacturer: 'Maker',
  };
  assert.deepEqual(
    buildAssetUpdate(asset, {
      ...assetToForm(asset),
      serial: '',
      model: ' ',
      manufacturer: '',
    }),
    { serial: null, model: null, manufacturer: null },
  );
  assert.deepEqual(
    buildAssetUpdate(fixture, { ...assetToForm(fixture), serial: ' SER-2 ' }),
    { serial: 'SER-2' },
  );
});

test('explicit date, cost and status edits are minimal; numeric equivalence is no-op', () => {
  assert.deepEqual(
    buildAssetUpdate(fixture, {
      ...assetToForm(fixture),
      installedAt: '',
      cost: '',
      status: 'down',
    }),
    { installed_at: null, cost: null, status: 'down' },
  );
  assert.deepEqual(
    buildAssetUpdate(fixture, { ...assetToForm(fixture), cost: '1234.0' }),
    {},
  );
  assert.deepEqual(
    buildAssetUpdate(fixture, {
      ...assetToForm(fixture),
      installedAt: '2026-09-23',
    }),
    { installed_at: '2026-09-23T00:00:00.000Z' },
  );
  const asset = { ...fixture, cost: null, installed_at: null };
  assert.deepEqual(buildAssetUpdate(asset, assetToForm(asset)), {});
  assert.deepEqual(
    buildAssetUpdate(asset, { ...assetToForm(asset), cost: '0' }),
    { cost: 0 },
  );
});

test('invalid required fields, dates and costs are rejected before mutation', () => {
  for (const code of ['', '  '])
    assert.throws(
      () => buildAssetUpdate(fixture, { ...assetToForm(fixture), code }),
      /Completa/,
    );
  for (const cost of ['-1', 'Infinity', 'not a number'])
    assert.throws(
      () => buildAssetUpdate(fixture, { ...assetToForm(fixture), cost }),
      /costo/,
    );
  for (const installedAt of ['2026-02-30', 'invalid'])
    assert.throws(
      () => buildAssetUpdate(fixture, { ...assetToForm(fixture), installedAt }),
      /fecha/,
    );
});

test('create payload trims values and serializes installation date as UTC', () => {
  assert.deepEqual(
    buildAssetCreate({
      ...initialAssetFormForTest(),
      code: ' EQ-2 ',
      name: ' Pump ',
      area: ' Plant ',
      installedAt: '2026-09-24',
    }),
    {
      name: 'Pump',
      area: 'Plant',
      code: 'EQ-2',
      serial: null,
      model: null,
      manufacturer: null,
      cost: null,
      status: 'commissioning',
      criticality: 'low',
      installed_at: '2026-09-24T00:00:00.000Z',
    },
  );
});

function initialAssetFormForTest() {
  return {
    code: '',
    name: '',
    area: '',
    criticality: 'low',
    manufacturer: '',
    model: '',
    serial: '',
    installedAt: '',
    status: 'commissioning',
    cost: '',
  };
}

function sessionHarness() {
  let state = {
    accessToken: 'token-a',
    user: {
      id: 'user-1',
      company_id: 'company-1',
      role: 'admin',
      is_active: true,
    },
  };
  const listeners = [];
  let server = false;
  const mod = load('src/hooks/use-asset-session.ts', {
    react: {
      useSyncExternalStore: (_subscribe, client, ssr) =>
        server ? ssr() : client(),
    },
    '@/store/auth-store': {
      useAuthStore: {
        getState: () => state,
        subscribe: (fn) => {
          listeners.push(fn);
          return () => {};
        },
      },
    },
  });
  return {
    ...mod,
    set(change) {
      const previous = state;
      state = { ...state, ...change };
      for (const listener of listeners) listener(state, previous);
    },
    get: () => state,
    server: (value) => {
      server = value;
    },
  };
}

test('session keys isolate company/user/role and same-user relogin, not token refresh', () => {
  const h = sessionHarness();
  const first = h.useAssetSession();
  assert.equal(first.canManage, true);
  h.set({ accessToken: 'renewed-token' });
  assert.equal(h.useAssetSession().key, first.key);
  for (const change of [
    { company_id: 'company-2' },
    { id: 'user-2' },
    { role: 'viewer' },
  ]) {
    const old = h.useAssetSession();
    h.set({ user: { ...h.get().user, ...change } });
    assert.notDeepEqual(
      h.assetListKey(old),
      h.assetListKey(h.useAssetSession()),
    );
    assert.equal(h.isAssetSessionCurrent(old), false);
  }
  assert.equal(h.useAssetSession().canManage, false);
  const before = h.useAssetSession();
  h.set({ accessToken: null });
  h.set({ accessToken: 'new-login' });
  assert.notEqual(before.key, h.useAssetSession().key);
  assert.equal(h.useAssetSession().key.includes('new-login'), false);
});

test('permissions require token, active user/company and admin role; SSR is stable anonymous', () => {
  const h = sessionHarness();
  for (const change of [
    { accessToken: null },
    { user: null },
    { user: { id: 'u', role: 'admin', company_id: ' ', is_active: true } },
  ]) {
    h.set(change);
    assert.equal(h.useAssetSession().canManage, false);
  }
  h.server(true);
  const server = h.useAssetSession();
  h.set({
    accessToken: 'token',
    user: {
      id: 'u',
      company_id: 'company',
      role: 'superadmin',
      is_active: true,
    },
  });
  assert.deepEqual(h.useAssetSession(), server);
  assert.equal(server.canManage, false);
  h.server(false);
  assert.equal(h.useAssetSession().canManage, true);
});

async function clientScenario({ switchAt, status = 401 } = {}) {
  let current = switchAt !== 'before';
  let refreshes = 0;
  const calls = [];
  const { apiClient } = load(
    'src/lib/api-client.ts',
    {
      '@/store/auth-store': {
        useAuthStore: { getState: () => ({ accessToken: 'token-a' }) },
      },
      '@/lib/token-refresh': {
        ensureValidToken: async () => {
          refreshes++;
          if (switchAt === 'refresh') current = false;
          return 'token-b';
        },
      },
    },
    {
      fetch: async (_url, options) => {
        calls.push(options);
        assert.equal('isRequestCurrent' in options, false);
        assert.equal('authToken' in options, false);
        const attempt = calls.length;
        if (switchAt === (attempt === 1 ? 'first-fetch' : 'retry-fetch'))
          current = false;
        return {
          status: attempt === 1 ? status : 200,
          ok: attempt > 1 || status === 200,
          json: async () => {
            if (switchAt === (attempt === 1 ? 'first-json' : 'retry-json'))
              current = false;
            return { id: 'ok' };
          },
        };
      },
    },
  );
  const result = await apiClient('/assets/asset-1', {
    method: 'PUT',
    body: '{}',
    authToken: 'explicit-token',
    isRequestCurrent: () => current,
  });
  return { result, calls, refreshes };
}

for (const switchAt of [
  'before',
  'first-fetch',
  'refresh',
  'retry-fetch',
  'retry-json',
]) {
  test(`session guard blocks asset result/replay when identity changes at ${switchAt}`, async () => {
    const { result, calls, refreshes } = await clientScenario({ switchAt });
    assert.equal(result.error.code, 'SESSION_CHANGED');
    assert.equal(
      calls.length,
      switchAt === 'before' ? 0 : switchAt.startsWith('retry') ? 2 : 1,
    );
    if (['before', 'first-fetch'].includes(switchAt))
      assert.equal(refreshes, 0);
  });
}

test('guard checks initial JSON and permits same-session token refresh', async () => {
  assert.equal(
    (await clientScenario({ status: 200, switchAt: 'first-json' })).result.error
      .code,
    'SESSION_CHANGED',
  );
  const { result, calls, refreshes } = await clientScenario();
  assert.equal(result.ok, true);
  assert.equal(refreshes, 1);
  assert.equal(calls[0].headers.Authorization, 'Bearer explicit-token');
  assert.equal(calls[1].headers.Authorization, 'Bearer token-b');
});

test('asset service uses GET/POST/PUT/DELETE, preserves raw GET and maps 409/422', async () => {
  const calls = [];
  let response = { ok: true, status: 200, data: fixture };
  const { assetsService } = load('src/services/assets-service.ts', {
    '@/lib/api-client': {
      apiClient: async (...args) => {
        calls.push(args);
        return response;
      },
    },
  });
  assert.deepEqual(await assetsService.getAsset(fixture.id), fixture);
  await assetsService.createAsset({ name: 'New' });
  const updated = await assetsService.updateAsset(fixture.id, {
    name: 'Updated',
  });
  assert.equal(updated.status, 'detenido');
  await assetsService.deleteAsset(fixture.id);
  assert.deepEqual(
    calls.map(([url, options]) => [url, options?.method ?? 'GET']),
    [
      ['/assets/asset-1', 'GET'],
      ['/assets/', 'POST'],
      ['/assets/asset-1', 'PUT'],
      ['/assets/asset-1', 'DELETE'],
    ],
  );
  assert.equal(calls[2][1].body, '{"name":"Updated"}');
  for (const [status, message] of [
    [409, /código/],
    [422, /inválidos/],
  ]) {
    response = { ok: false, status, error: { message: `Error ${status}` } };
    await assert.rejects(assetsService.updateAsset(fixture.id, {}), message);
  }
  await assert.rejects(
    assetsService.deleteAsset(fixture.id, { isRequestCurrent: () => false }),
    /sesión/,
  );
});

test('asset service loads every API page without truncating inventories over 100', async () => {
  const requestedPages = [];
  const { assetsService } = load('src/services/assets-service.ts', {
    '@/lib/api-client': {
      apiClient: async (url) => {
        const page = Number(
          new URL(`http://local${url}`).searchParams.get('page'),
        );
        requestedPages.push(page);
        return {
          ok: true,
          status: 200,
          data: {
            items: [{ ...fixture, id: `asset-${page}` }],
            total: 3,
            page,
            size: 100,
            pages: 3,
          },
        };
      },
    },
  });
  const result = await assetsService.getAllAssets();
  assert.deepEqual(requestedPages, [1, 2, 3]);
  assert.deepEqual(
    result.items.map((asset) => asset.id),
    ['asset-1', 'asset-2', 'asset-3'],
  );
});

test('mutation hooks invalidate only captured session and reject stale/unauthorized writes', async () => {
  let current = true;
  const session = { key: 'company-user-session', canManage: true };
  const invalidations = [];
  const calls = [];
  const hooks = load('src/hooks/use-asset-mutations.ts', {
    '@tanstack/react-query': {
      useMutation: (config) => config,
      useQueryClient: () => ({
        invalidateQueries: async (config) => invalidations.push(config),
      }),
    },
    '@/hooks/use-asset-session': {
      useAssetSession: () => session,
      isAssetSessionCurrent: () => current,
      assetListKey: (value) => ['assets', value.key, 'list'],
    },
    '@/services/assets-service': {
      assetsService: Object.fromEntries(
        ['createAsset', 'updateAsset', 'deleteAsset'].map((name) => [
          name,
          async (...args) => {
            calls.push([name, ...args]);
            return fixture;
          },
        ]),
      ),
    },
  });
  const update = hooks.useUpdateAssetMutation();
  await update.mutationFn({ assetId: fixture.id, data: { name: 'Updated' } });
  await update.onSuccess();
  assert.deepEqual(invalidations, [
    { queryKey: ['assets', session.key, 'list'] },
  ]);
  assert.equal(update.retry, false);
  const options = calls[0].at(-1);
  current = false;
  assert.equal(options.isRequestCurrent(), false);
  await update.onSuccess();
  assert.equal(invalidations.length, 1);
  assert.throws(
    () => update.mutationFn({ assetId: fixture.id, data: {} }),
    /permiso/,
  );
  current = true;
  session.canManage = false;
  assert.throws(
    () => hooks.useDeleteAssetMutation().mutationFn(fixture.id),
    /permiso/,
  );
  assert.throws(() => hooks.useCreateAssetMutation().mutationFn({}), /permiso/);
});

// Lightweight hook harness exercises real component handlers/JSX contracts;
// it intentionally does not claim React DOM or browser integration coverage.
function hookHarness() {
  let cells = [];
  let cursor = 0;
  return {
    react: {
      useState(initial) {
        const index = cursor++;
        if (!(index in cells))
          cells[index] = typeof initial === 'function' ? initial() : initial;
        return [
          cells[index],
          (next) => {
            cells[index] =
              typeof next === 'function' ? next(cells[index]) : next;
          },
        ];
      },
      useRef(initial) {
        const index = cursor++;
        if (!(index in cells)) cells[index] = { current: initial };
        return cells[index];
      },
    },
    render(component, props) {
      cursor = 0;
      return component(props);
    },
    reset() {
      cells = [];
    },
  };
}
function find(tree, predicate) {
  if (!tree || typeof tree !== 'object') return undefined;
  if (Array.isArray(tree))
    return tree.map((child) => find(child, predicate)).find(Boolean);
  if (predicate(tree)) return tree;
  return find(tree.props?.children, predicate);
}
const byType = (type) => (node) => node.type === type;
const button = (label) => (node) =>
  node.props?.children === label && node.props?.onClick;

function flowHarness() {
  const h = hookHarness();
  const session = { key: 'session', companyId: 'company-1', canManage: true };
  let current = true;
  const calls = [];
  const mutations = {
    isPending: false,
    mutate(data, callbacks) {
      calls.push({ data, callbacks });
      mutations.isPending = true;
    },
  };
  const ui = Object.fromEntries(
    ['BtnGhost', 'Modal', 'ModalFooter'].map((name) => [name, name]),
  );
  const mocks = {
    react: h.react,
    sonner: { toast: { success() {} } },
    '@tanstack/react-query': {
      useQuery: () => ({ data: fixture, isFetching: false, isPending: false }),
    },
    '@/components/ui': ui,
    '@/hooks/use-asset-session': {
      useAssetSession: () => session,
      isAssetSessionCurrent: () => current,
    },
    '@/hooks/use-asset-mutations': {
      useDeleteAssetMutation: () => mutations,
      useUpdateAssetMutation: () => mutations,
    },
    '@/services/assets-service': { assetsService: {} },
    './asset-form-fields': { default: 'AssetFormFields', __esModule: true },
  };
  const Component = load(
    'src/components/assets/asset-detail-actions.tsx',
    mocks,
  ).default;
  let deleted = 0;
  const updated = [];
  const props = {
    asset: fixture,
    onDeleted: () => deleted++,
    onUpdated: (value) => updated.push(value),
  };
  return {
    ...h,
    Component,
    props,
    calls,
    mutations,
    session,
    updated,
    deleted: () => deleted,
    stale: () => {
      current = false;
    },
  };
}

test('delete cancel sends nothing; confirm locks controls/duplicates, error retains dialog, success exits detail', () => {
  const h = flowHarness();
  let tree = h.render(h.Component, h.props);
  find(tree, button('Dar de baja')).props.onClick();
  tree = h.render(h.Component, h.props);
  find(tree, button('Cancelar')).props.onClick();
  assert.equal(h.calls.length, 0);
  tree = h.render(h.Component, h.props);
  find(tree, button('Dar de baja')).props.onClick();
  tree = h.render(h.Component, h.props);
  const confirm = find(tree, button('Confirmar baja')).props.onClick;
  confirm();
  confirm();
  assert.equal(h.calls.length, 1);
  tree = h.render(h.Component, h.props);
  assert.equal(find(tree, byType('fieldset')).props.disabled, true);
  find(tree, byType('Modal')).props.onClose();
  assert.ok(find(h.render(h.Component, h.props), byType('Modal')));
  h.calls[0].callbacks.onError(new Error('Failure'));
  h.calls[0].callbacks.onSettled();
  h.mutations.isPending = false;
  tree = h.render(h.Component, h.props);
  assert.equal(
    find(tree, (node) => node.props?.role === 'alert').props.children,
    'Failure',
  );
  find(tree, button('Confirmar baja')).props.onClick();
  h.calls[1].callbacks.onSuccess();
  h.calls[1].callbacks.onSettled();
  assert.equal(h.deleted(), 1);
  assert.equal(
    find(h.render(h.Component, h.props), byType('Modal')),
    undefined,
  );
});

function editor(h) {
  let tree = h.render(h.Component, h.props);
  find(tree, button('Editar activo')).props.onClick();
  tree = h.render(h.Component, h.props);
  const dialog = find(tree, (node) => node.type?.name === 'AssetEditDialog');
  const content = h.render(dialog.type, dialog.props);
  h.reset();
  return { type: content.type, props: content.props };
}

test('edit no-op sends nothing; dirty save retains form on failure and displays updated detail on success', () => {
  const h = flowHarness();
  const e = editor(h);
  let closed = 0;
  e.props = { ...e.props, onClose: () => closed++ };
  let tree = h.render(e.type, e.props);
  find(tree, byType('ModalFooter')).props.onConfirm();
  assert.equal(h.calls.length, 0);
  assert.equal(closed, 1);
  find(tree, byType('AssetFormFields')).props.onChange('name', 'Updated pump');
  tree = h.render(e.type, e.props);
  const save = find(tree, byType('ModalFooter')).props.onConfirm;
  save();
  save();
  assert.equal(h.calls.length, 1);
  assert.deepEqual(h.calls[0].data, {
    assetId: fixture.id,
    data: { name: 'Updated pump' },
  });
  tree = h.render(e.type, e.props);
  assert.equal(find(tree, byType('fieldset')).props.disabled, true);
  find(tree, byType('Modal')).props.onClose();
  assert.equal(closed, 1);
  h.calls[0].callbacks.onError(new Error('Duplicate code'));
  h.calls[0].callbacks.onSettled();
  h.mutations.isPending = false;
  tree = h.render(e.type, e.props);
  assert.equal(
    find(tree, byType('AssetFormFields')).props.value.name,
    'Updated pump',
  );
  assert.equal(
    find(tree, (node) => node.props?.role === 'alert').props.children,
    'Duplicate code',
  );
  find(tree, byType('ModalFooter')).props.onConfirm();
  const updated = { ...fixture, name: 'Updated pump' };
  h.calls[1].callbacks.onSuccess(updated);
  h.calls[1].callbacks.onSettled();
  assert.deepEqual(h.updated, [updated]);
  assert.equal(closed, 2);
});

test('late delete and edit success cannot change detail after identity switch', () => {
  const h = flowHarness();
  let tree = h.render(h.Component, h.props);
  find(tree, button('Dar de baja')).props.onClick();
  tree = h.render(h.Component, h.props);
  find(tree, button('Confirmar baja')).props.onClick();
  h.stale();
  h.calls[0].callbacks.onSuccess();
  assert.equal(h.deleted(), 0);
  const edit = flowHarness();
  const e = editor(edit);
  tree = edit.render(e.type, e.props);
  find(tree, byType('AssetFormFields')).props.onChange('name', 'Changed');
  tree = edit.render(e.type, e.props);
  find(tree, byType('ModalFooter')).props.onConfirm();
  edit.stale();
  edit.calls[0].callbacks.onSuccess(fixture);
  assert.deepEqual(edit.updated, []);
});

test('existing create flow keeps payload/defaults and disables duplicate submissions', () => {
  const h = hookHarness();
  const calls = [];
  const errors = [];
  const mutation = {
    isPending: false,
    mutate(data, callbacks) {
      calls.push({ data, callbacks });
      mutation.isPending = true;
    },
  };
  const { AssetsScreen } = load('src/app/screens/screens1.tsx', {
    react: h.react,
    '@/components/charts': {},
    sonner: {
      toast: { success() {}, error: (message) => errors.push(message) },
    },
    '@/app/data/mock-data': { PLANS: [] },
    '@/app/data/constants': { STC: {}, STL: {}, PRC: {}, PRL: {}, CRC: {} },
    '@/components/ui': Object.fromEntries(
      [
        'Badge',
        'KpiCard',
        'Td',
        'PageHeader',
        'Card',
        'CardTitle',
        'RowData',
        'BtnPrimary',
        'BtnGhost',
        'BtnBack',
        'DataTable',
        'Modal',
        'Field',
        'ModalFooter',
      ].map((key) => [key, key]),
    ),
    '@/components/assets/asset-form-fields': {
      default: 'AssetFormFields',
      __esModule: true,
    },
    '@/components/assets/asset-detail-actions': {
      default: 'AssetDetailActions',
      __esModule: true,
    },
    '@/hooks/use-asset-session': {
      useAssetSession: () => ({ canManage: true }),
      isAssetSessionCurrent: () => true,
    },
    '@/hooks/use-asset-mutations': { useCreateAssetMutation: () => mutation },
  });
  const props = { wo: [], assets: [], canManageAssets: true };
  let tree = h.render(AssetsScreen, props);
  find(tree, byType('PageHeader')).props.action.props.onClick();
  tree = h.render(AssetsScreen, props);
  find(tree, byType('ModalFooter')).props.onConfirm();
  assert.equal(calls.length, 0);
  assert.equal(errors.length, 1);
  const change = find(tree, byType('AssetFormFields')).props.onChange;
  change('name', ' New pump ');
  change('code', ' P-1 ');
  change('area', ' Plant ');
  tree = h.render(AssetsScreen, props);
  const confirm = find(tree, byType('ModalFooter')).props.onConfirm;
  confirm();
  confirm();
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0].data, {
    name: 'New pump',
    code: 'P-1',
    area: 'Plant',
    serial: null,
    model: null,
    manufacturer: null,
    cost: null,
    status: 'commissioning',
    criticality: 'low',
    installed_at: null,
  });
  tree = h.render(AssetsScreen, props);
  assert.equal(find(tree, byType('fieldset')).props.disabled, true);
  calls[0].callbacks.onError(new Error('Conflict'));
  calls[0].callbacks.onSettled();
  mutation.isPending = false;
  tree = h.render(AssetsScreen, props);
  assert.equal(
    find(tree, byType('AssetFormFields')).props.value.name,
    ' New pump ',
  );
  find(tree, byType('ModalFooter')).props.onConfirm();
  calls[1].callbacks.onSuccess();
  calls[1].callbacks.onSettled();
  assert.equal(find(h.render(AssetsScreen, props), byType('Modal')), undefined);
});

test('list query and page use identity scope; changing identity remounts screen', async () => {
  const session = { key: 'company-user-1', canRead: true, canManage: true };
  const calls = [];
  const { useAssetsQuery } = load('src/hooks/use-assets-query.ts', {
    '@tanstack/react-query': { useQuery: (options) => options },
    '@/hooks/use-asset-session': {
      useAssetSession: () => session,
      assetListKey: (value) => ['assets', value.key, 'list'],
      isAssetSessionCurrent: () => true,
    },
    '@/services/assets-service': {
      assetsService: { getAllAssets: async (...args) => calls.push(args) },
    },
  });
  const query = useAssetsQuery();
  assert.deepEqual(query.queryKey, ['assets', session.key, 'list']);
  await query.queryFn();
  assert.equal(typeof calls[0][0].isRequestCurrent, 'function');
  session.canRead = false;
  assert.equal(useAssetsQuery().enabled, false);
  const Page = load('src/app/dashboard/assets/page.tsx', {
    '@/app/screens/screens1': { AssetsScreen: 'AssetsScreen' },
    '@/app/data/mock-data': { ASSETS: [] },
    '@/app/stores/useWorkOrdersStore': { useWorkOrdersStore: () => [] },
    '@/store/auth-store': { useAuthStore: () => 'token' },
    '@/hooks/use-asset-session': { useAssetSession: () => session },
    '@/hooks/use-assets-query': {
      useAssetsQuery: () => ({ data: { items: [] } }),
    },
  }).default;
  const before = Page();
  session.key = 'company-user-2';
  assert.notEqual(Page().key, before.key);
});

test('changed cost rejects fractions, unsafe integers and PostgreSQL integer overflow', () => {
  for (const cost of ['0.5', '1234.567', '2147483648', '9007199254740992']) {
    assert.throws(
      () => buildAssetUpdate(fixture, { ...assetToForm(fixture), cost }),
      /entero mayor o igual a cero.*2147483647/,
    );
  }
});

test('cost boundaries are accepted while equivalent integers and unchanged fields stay omitted', () => {
  for (const cost of ['0', '2147483647']) {
    assert.deepEqual(
      buildAssetUpdate(fixture, { ...assetToForm(fixture), cost }),
      { cost: Number(cost) },
    );
  }
  assert.deepEqual(
    buildAssetUpdate(fixture, { ...assetToForm(fixture), cost: '1234.0' }),
    {},
  );
  assert.deepEqual(
    buildAssetUpdate(fixture, { ...assetToForm(fixture), name: 'Updated' }),
    { name: 'Updated' },
  );
});

test('form inputs expose backend text limits and integer cost bounds', () => {
  const Fields = load('src/components/assets/asset-form-fields.tsx', {
    '@/components/ui': { Field: 'Field' },
  }).default;
  const tree = Fields({
    value: assetToForm(fixture),
    onChange() {},
    editing: true,
  });
  for (const [label, limit] of [
    ['Codigo de Equipo', 20],
    ['N de Serie', 20],
    ['Nombre del Equipo', 100],
    ['Area', 100],
    ['Modelo', 100],
    ['Fabricante', 100],
  ]) {
    assert.equal(
      find(tree, (node) => node.props?.['aria-label'] === label).props
        .maxLength,
      limit,
    );
  }
  const cost = find(tree, (node) => node.props?.['aria-label'] === 'Costo');
  assert.equal(Number(cost.props.step), 1);
  assert.equal(Number(cost.props.min), 0);
  assert.equal(Number(cost.props.max), 2147483647);
});
