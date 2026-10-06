// Run: pnpm test:portal-assets:unit
// Isolated unit tests for the portal assets module (`/assets`). No DOM/browser,
// network, database writes, dependency installs, or application build required.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL('../../../../../', import.meta.url));
const moduleDir = 'src/app/(portal)/assets';

function load(relative, mocks = {}) {
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
      return load(`${resolved}.ts`, mocks);
    }
    return require(id);
  };
  new Function('require', 'module', 'exports', source)(
    resolver,
    compiled,
    compiled.exports,
  );
  return compiled.exports;
}

const ASSET_ID = '550e8400-e29b-41d4-a716-446655440000';

const fixture = {
  id: ASSET_ID,
  company_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  name: 'Compresor C-300',
  area: 'Planta Norte',
  code: 'CMP-001',
  serial: null,
  model: null,
  manufacturer: null,
  cost: 45000,
  criticality: 'high',
  status: 'operational',
  installed_at: '2024-03-15T16:30:00Z',
  is_active: true,
  created_at: '2026-05-09T07:30:00Z',
  updated_at: null,
  deleted_at: null,
};

function loadService(handler) {
  const calls = [];
  const apiClient = async (url, options = {}) => {
    calls.push({ url, method: options.method ?? 'GET', options });
    return handler({ url, method: options.method ?? 'GET', options });
  };
  const { assetsService, AssetApiError, toAssetApiError } = load(
    `${moduleDir}/services/assets-service.ts`,
    { '@/lib/api-client': { apiClient } },
  );
  return { assetsService, AssetApiError, toAssetApiError, calls };
}

const ok = (data, status = 200) => ({ ok: true, status, data });
const fail = (status, message = `Error ${status}`) => ({
  ok: false,
  status,
  error: { message, status },
});

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

test('listAssets sends only page/size and catalog filters', async () => {
  const page = { items: [fixture], total: 1, page: 2, size: 10, pages: 1 };
  const { assetsService, calls } = loadService(() => ok(page));

  assert.deepEqual(await assetsService.listAssets({ page: 2, size: 10 }), page);
  await assetsService.listAssets({
    page: 1,
    size: 25,
    criticality: 'high',
    status: 'down',
  });
  await assetsService.listAssets({
    page: 1,
    size: 10,
    criticality: null,
    status: '',
  });

  const params = calls.map(({ url, method }) => {
    assert.equal(method, 'GET');
    const parsed = new URL(`http://local${url}`);
    assert.equal(parsed.pathname, '/assets/');
    return Object.fromEntries(parsed.searchParams);
  });
  assert.deepEqual(params, [
    { page: '2', size: '10' },
    { page: '1', size: '25', criticality: 'high', status: 'down' },
    { page: '1', size: '10' },
  ]);
});

test('getAssetById requests the single asset endpoint', async () => {
  const { assetsService, calls } = loadService(() => ok(fixture));
  assert.deepEqual(await assetsService.getAssetById(ASSET_ID), fixture);
  assert.deepEqual(
    calls.map(({ url, method }) => [url, method]),
    [[`/assets/${ASSET_ID}`, 'GET']],
  );
});

test('createAsset POSTs a whitelisted body without company_id/is_active', async () => {
  const { assetsService, calls } = loadService(() => ok(fixture, 201));
  await assetsService.createAsset({
    name: 'Bomba',
    area: 'Planta',
    code: 'BMB-1',
    serial: null,
    model: null,
    manufacturer: null,
    cost: null,
    status: 'commissioning',
    criticality: 'medium',
    installed_at: null,
    company_id: 'other-company',
    is_active: false,
  });
  assert.equal(calls[0].url, '/assets/');
  assert.equal(calls[0].method, 'POST');
  const body = JSON.parse(calls[0].options.body);
  assert.equal('company_id' in body, false);
  assert.equal('is_active' in body, false);
  assert.deepEqual(body, {
    name: 'Bomba',
    area: 'Planta',
    code: 'BMB-1',
    serial: null,
    model: null,
    manufacturer: null,
    cost: null,
    status: 'commissioning',
    criticality: 'medium',
    installed_at: null,
  });
});

test('updateAsset uses PUT with only provided fields and keeps null clears', async () => {
  const { assetsService, calls } = loadService(() => ok(fixture));
  await assetsService.updateAsset(ASSET_ID, {
    serial: null,
    criticality: 'critical',
    is_active: false,
    company_id: 'x',
  });
  assert.equal(calls[0].url, `/assets/${ASSET_ID}`);
  assert.equal(calls[0].method, 'PUT');
  assert.deepEqual(JSON.parse(calls[0].options.body), {
    serial: null,
    criticality: 'critical',
  });
});

test('updateAsset never sends an empty body', async () => {
  const { assetsService, calls } = loadService(() => ok(fixture));
  await assert.rejects(assetsService.updateAsset(ASSET_ID, {}), /cambios/);
  await assert.rejects(
    assetsService.updateAsset(ASSET_ID, { is_active: true }),
    /cambios/,
  );
  assert.equal(calls.length, 0);
});

test('deleteAsset uses DELETE and resolves on 204', async () => {
  const { assetsService, calls } = loadService(() => ({
    ok: true,
    status: 204,
    data: null,
  }));
  assert.equal(await assetsService.deleteAsset(ASSET_ID), undefined);
  assert.deepEqual(
    calls.map(({ url, method }) => [url, method]),
    [[`/assets/${ASSET_ID}`, 'DELETE']],
  );
});

test('errors are mapped by status to Spanish messages and expose the status', async () => {
  const cases = [
    [401, /sesión/i],
    [403, /permiso/i],
    [404, /no existe o fue eliminado/i],
    [409, /código/i],
    [422, /inválid/i],
    [0, /conectar/i],
    [500, /Error 500/],
  ];
  for (const [status, message] of cases) {
    const { assetsService, AssetApiError } = loadService(() => fail(status));
    const error = await assetsService.getAssetById(ASSET_ID).then(
      () => assert.fail('expected rejection'),
      (err) => err,
    );
    assert.ok(error instanceof AssetApiError, `status ${status}`);
    assert.equal(error.status, status);
    assert.match(error.message, message);
  }
});

test('409 exposes a code field error and 422 keeps the backend detail', async () => {
  const { assetsService } = loadService(({ method }) =>
    method === 'POST'
      ? fail(409, "Asset with code 'X' already exists")
      : fail(422, 'String should have at most 20 characters'),
  );
  const conflict = await assetsService
    .createAsset({ name: 'a', area: 'b', code: 'X', criticality: 'low' })
    .catch((err) => err);
  assert.match(conflict.fieldErrors.code, /código/i);

  const invalid = await assetsService
    .updateAsset(ASSET_ID, { code: 'X' })
    .catch((err) => err);
  assert.equal(invalid.status, 422);
  assert.equal(invalid.detail, 'String should have at most 20 characters');
});

// ---------------------------------------------------------------------------
// API client: structured 422 field errors (additive, backward compatible)
// ---------------------------------------------------------------------------

async function callApiClient(status, body) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
  try {
    const client = load('src/lib/api-client.ts', {
      '@/store/auth-store': {
        useAuthStore: { getState: () => ({ accessToken: null }) },
      },
      '@/lib/token-refresh': { ensureValidToken: async () => 'token' },
    });
    return { client, response: await client.apiClient('/assets/') };
  } finally {
    globalThis.fetch = originalFetch;
  }
}

const validationDetail = [
  {
    loc: ['body', 'code'],
    msg: 'String should have at most 20 characters',
    type: 'string_too_long',
    ctx: { max_length: 20 },
  },
  { loc: ['body', 'name'], msg: 'Field required', type: 'missing' },
  {
    loc: ['query', 'page'],
    msg: 'Input should be a valid integer',
    type: 'int_parsing',
  },
  {
    loc: ['body'],
    msg: 'Value error, At least one asset field must be provided',
    type: 'value_error',
  },
];

test('apiClient keeps the joined 422 message and adds structured field errors', async () => {
  const { client, response } = await callApiClient(422, {
    detail: validationDetail,
  });
  assert.equal(response.ok, false);
  assert.equal(response.status, 422);
  assert.equal(response.error.status, 422);
  assert.equal(
    response.error.message,
    validationDetail.map((item) => item.msg).join('; '),
  );
  assert.deepEqual(response.error.fieldErrors, {
    code: ['String should have at most 20 characters'],
    name: ['Field required'],
  });
  assert.deepEqual(
    response.error.validationErrors.map(({ loc, type }) => [loc, type]),
    validationDetail.map(({ loc, type }) => [loc, type]),
  );
  assert.deepEqual(response.error.validationErrors[0].ctx, { max_length: 20 });
  assert.equal(client.hasApiFieldErrors(response.error), true);
  assert.deepEqual(client.getApiFieldErrors(response.error).code, [
    'String should have at most 20 characters',
  ]);
});

test('apiClient leaves string-detail errors unchanged (no field errors)', async () => {
  const { client, response } = await callApiClient(404, {
    detail: 'Asset not found',
  });
  assert.equal(response.error.message, 'Asset not found');
  assert.equal(response.error.status, 404);
  assert.equal('fieldErrors' in response.error, false);
  assert.equal('validationErrors' in response.error, false);
  assert.equal(client.hasApiFieldErrors(response.error), false);
  assert.deepEqual(client.getApiFieldErrors(response.error), {});
  assert.equal(client.hasApiFieldErrors(undefined), false);
});

const failValidation = (detail) => ({
  ok: false,
  status: 422,
  error: {
    message: detail.map((item) => item.msg).join('; '),
    status: 422,
    validationErrors: detail,
  },
});

test('422 field errors are translated to Spanish and keyed by asset field', async () => {
  const detail = [
    validationDetail[0],
    {
      loc: ['body', 'installed_at'],
      msg: 'Input should be a valid datetime',
      type: 'datetime_parsing',
    },
    {
      loc: ['body', 'cost'],
      msg: 'Input should be less than or equal to 2147483647',
      type: 'less_than_equal',
      ctx: { le: 2147483647 },
    },
    {
      loc: ['body', 'name'],
      msg: 'Value error, Field must not be null or blank',
      type: 'value_error',
    },
    {
      loc: ['body', 'status'],
      msg: "Input should be 'commissioning' or 'operational'",
      type: 'literal_error',
    },
  ];
  const { assetsService } = loadService(() => failValidation(detail));
  const error = await assetsService
    .createAsset({ name: ' ', area: 'b', code: 'X', criticality: 'low' })
    .catch((err) => err);
  assert.equal(error.status, 422);
  assert.deepEqual(error.fieldErrors, {
    code: 'Admite máximo 20 caracteres.',
    installed_at: 'Ingresa una fecha válida.',
    cost: 'Debe ser menor o igual a 2147483647.',
    name: 'Este campo no puede estar vacío.',
    status: 'Selecciona un valor válido.',
  });
  // Every error matched a field: no general error details in the message.
  assert.match(error.message, /revisa los campos/i);
  assert.doesNotMatch(error.message, /caracteres|fecha/);
});

test('422 errors without a matching form field go to the general message', async () => {
  const detail = [
    validationDetail[0],
    validationDetail[3],
    { loc: ['body', 'company_id'], msg: 'Extra inputs', type: 'extra' },
  ];
  const { assetsService } = loadService(() => failValidation(detail));
  const error = await assetsService
    .updateAsset(ASSET_ID, { code: 'X'.repeat(30) })
    .catch((err) => err);
  assert.deepEqual(error.fieldErrors, {
    code: 'Admite máximo 20 caracteres.',
  });
  assert.match(error.message, /inválid/i);
  assert.match(error.message, /al menos un campo/i);
  assert.match(error.message, /company_id: Extra inputs/);
  assert.doesNotMatch(error.message, /caracteres/);
});

test('validation messages translate common FastAPI types with raw fallback', () => {
  const { translateValidationIssue } = load(
    `${moduleDir}/lib/asset-server-errors.ts`,
  );
  const t = (type, ctx, msg = 'raw message') =>
    translateValidationIssue({ loc: ['body', 'x'], msg, type, ctx });
  assert.equal(t('missing'), 'Este campo es obligatorio.');
  assert.equal(
    t('string_too_short', { min_length: 1 }),
    'Debe tener al menos 1 caracteres.',
  );
  assert.equal(
    t('string_too_long', { max_length: 100 }),
    'Admite máximo 100 caracteres.',
  );
  assert.equal(t('int_parsing'), 'Debe ser un número entero.');
  assert.equal(
    t('greater_than_equal', { ge: 0 }),
    'Debe ser mayor o igual a 0.',
  );
  assert.equal(t('less_than_equal', { le: 5 }), 'Debe ser menor o igual a 5.');
  assert.equal(t('literal_error'), 'Selecciona un valor válido.');
  assert.equal(t('enum'), 'Selecciona un valor válido.');
  assert.equal(
    t('value_error', undefined, 'Value error, Something custom'),
    'Something custom',
  );
  assert.equal(t('some_unknown_type'), 'raw message');
  // Missing ctx falls back to the raw message instead of "undefined".
  assert.equal(t('string_too_long', undefined), 'raw message');
});

test('server field errors map to form field names', () => {
  const { toAssetFormFieldErrors } = load(
    `${moduleDir}/lib/asset-server-errors.ts`,
  );
  assert.deepEqual(
    toAssetFormFieldErrors({
      installed_at: 'fecha',
      code: 'código',
      cost: 'c',
    }),
    { installedAt: 'fecha', code: 'código', cost: 'c' },
  );
  assert.deepEqual(toAssetFormFieldErrors({}), {});
});

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------

const { newAssetSchema, EMPTY_ASSET_FORM_VALUES } = load(
  `${moduleDir}/lib/new-asset-schema.ts`,
);

const validForm = {
  ...EMPTY_ASSET_FORM_VALUES,
  name: 'Bomba',
  area: 'Planta',
  code: 'B-1',
};

test('schema rejects whitespace-only required text and enforces limits', () => {
  for (const field of ['name', 'area', 'code']) {
    assert.equal(
      newAssetSchema.safeParse({ ...validForm, [field]: '   ' }).success,
      false,
      `${field} whitespace`,
    );
  }
  assert.equal(
    newAssetSchema.safeParse({ ...validForm, name: 'a' }).success,
    true,
  );
  assert.equal(
    newAssetSchema.safeParse({ ...validForm, name: 'x'.repeat(101) }).success,
    false,
  );
  assert.equal(
    newAssetSchema.safeParse({ ...validForm, area: 'x'.repeat(101) }).success,
    false,
  );
  assert.equal(
    newAssetSchema.safeParse({ ...validForm, code: 'x'.repeat(21) }).success,
    false,
  );
  assert.equal(
    newAssetSchema.safeParse({ ...validForm, code: 'x'.repeat(20) }).success,
    true,
  );
});

test('schema optional text has no minimum, has maximums and maps empty to null', () => {
  const parsed = newAssetSchema.parse({
    ...validForm,
    serial: 'S',
    model: '  ',
    manufacturer: '',
  });
  assert.equal(parsed.serial, 'S');
  assert.equal(parsed.model, null);
  assert.equal(parsed.manufacturer, null);
  for (const [field, max] of [
    ['serial', 20],
    ['model', 100],
    ['manufacturer', 100],
  ]) {
    assert.equal(
      newAssetSchema.safeParse({ ...validForm, [field]: 'x'.repeat(max) })
        .success,
      true,
    );
    assert.equal(
      newAssetSchema.safeParse({ ...validForm, [field]: 'x'.repeat(max + 1) })
        .success,
      false,
    );
  }
});

test('schema cost is an optional integer between 0 and 2147483647', () => {
  const cost = (value) =>
    newAssetSchema.safeParse({ ...validForm, cost: value });
  assert.equal(cost('').data.cost, null);
  assert.equal(cost('0').data.cost, 0);
  assert.equal(cost('2147483647').data.cost, 2147483647);
  assert.equal(cost('2147483648').success, false);
  assert.equal(cost('-1').success, false);
  assert.equal(cost('12.5').success, false);
  assert.equal(cost('abc').success, false);
});

test('schema defaults status to commissioning and has no companyId', () => {
  assert.equal(EMPTY_ASSET_FORM_VALUES.status, 'commissioning');
  assert.equal('companyId' in newAssetSchema.shape, false);
  const { status, ...withoutStatus } = validForm;
  void status;
  assert.equal(newAssetSchema.parse(withoutStatus).status, 'commissioning');
  assert.equal(
    newAssetSchema.safeParse({ ...validForm, status: 'broken' }).success,
    false,
  );
});

// ---------------------------------------------------------------------------
// Payload builders
// ---------------------------------------------------------------------------

const {
  assetToFormValues,
  buildAssetCreatePayload,
  buildAssetUpdatePayload,
  serializeInstalledAt,
} = load(`${moduleDir}/lib/asset-payload.ts`);

test('installed date is serialized as UTC midnight and validated', () => {
  assert.equal(serializeInstalledAt(''), null);
  assert.equal(serializeInstalledAt('2024-03-15'), '2024-03-15T00:00:00.000Z');
  assert.throws(() => serializeInstalledAt('2024-02-30'));
  assert.throws(() => serializeInstalledAt('15/03/2024'));
});

test('create payload trims text, sends null for empty optionals and no company', () => {
  assert.deepEqual(
    buildAssetCreatePayload({
      ...validForm,
      name: '  Bomba  ',
      cost: '',
      installedAt: '2024-03-15',
    }),
    {
      name: 'Bomba',
      area: 'Planta',
      code: 'B-1',
      serial: null,
      model: null,
      manufacturer: null,
      cost: null,
      status: 'commissioning',
      criticality: 'medium',
      installed_at: '2024-03-15T00:00:00.000Z',
    },
  );
});

test('update payload is empty when nothing changed (request must be skipped)', () => {
  for (const status of ['commissioning', 'down', 'decommissioned']) {
    const asset = { ...fixture, status };
    assert.deepEqual(
      buildAssetUpdatePayload(asset, assetToFormValues(asset)),
      {},
    );
  }
  // A stored value with surrounding spaces is not rewritten unless edited.
  const spaced = { ...fixture, name: ' Spaced ' };
  assert.deepEqual(
    buildAssetUpdatePayload(spaced, assetToFormValues(spaced)),
    {},
  );
  // Numerically equivalent cost is a no-op.
  assert.deepEqual(
    buildAssetUpdatePayload(fixture, {
      ...assetToFormValues(fixture),
      cost: '45000',
    }),
    {},
  );
});

test('update payload sends only changed fields and null clears optionals', () => {
  const asset = {
    ...fixture,
    serial: 'SER-1',
    model: 'M1',
    manufacturer: 'Maker',
  };
  assert.deepEqual(
    buildAssetUpdatePayload(asset, {
      ...assetToFormValues(asset),
      name: ' Nuevo ',
      serial: '',
      model: '  ',
      manufacturer: '',
      cost: '',
      installedAt: '',
      status: 'maintenance',
    }),
    {
      name: 'Nuevo',
      serial: null,
      model: null,
      manufacturer: null,
      cost: null,
      installed_at: null,
      status: 'maintenance',
    },
  );
  assert.deepEqual(
    buildAssetUpdatePayload(fixture, {
      ...assetToFormValues(fixture),
      installedAt: '2025-01-02',
      criticality: 'low',
    }),
    { installed_at: '2025-01-02T00:00:00.000Z', criticality: 'low' },
  );
});

test('update payload rejects invalid values instead of sending them', () => {
  assert.throws(() =>
    buildAssetUpdatePayload(fixture, {
      ...assetToFormValues(fixture),
      code: '   ',
    }),
  );
  assert.throws(() =>
    buildAssetUpdatePayload(fixture, {
      ...assetToFormValues(fixture),
      cost: '-3',
    }),
  );
});

// ---------------------------------------------------------------------------
// UUID guard and query keys
// ---------------------------------------------------------------------------

test('isUuid accepts canonical UUIDs only', () => {
  const { isUuid } = load(`${moduleDir}/lib/is-uuid.ts`);
  assert.equal(isUuid(ASSET_ID), true);
  assert.equal(isUuid(ASSET_ID.toUpperCase()), true);
  for (const value of [
    '',
    'asset-1',
    '123',
    `${ASSET_ID}x`,
    ASSET_ID.replaceAll('-', ''),
    null,
    undefined,
    42,
  ]) {
    assert.equal(isUuid(value), false, String(value));
  }
});

test('query keys are scoped by session and list params', () => {
  const { assetKeys } = load(`${moduleDir}/hooks/asset-query-keys.ts`);
  const params = { page: 1, size: 10, criticality: null, status: null };
  assert.notDeepEqual(
    assetKeys.list('session-a', params),
    assetKeys.list('session-b', params),
  );
  assert.deepEqual(assetKeys.lists('session-a'), [
    'portal-assets',
    'session-a',
    'list',
  ]);
  assert.deepEqual(
    assetKeys.list('session-a', params).slice(0, 3),
    assetKeys.lists('session-a'),
  );
  assert.deepEqual(assetKeys.detail('session-a', ASSET_ID), [
    'portal-assets',
    'session-a',
    'detail',
    ASSET_ID,
  ]);
});

test('session key changes with user, company, role, active flag and token', () => {
  const { assetSessionKey } = load(
    `${moduleDir}/hooks/use-asset-session-key.ts`,
    {
      react: { useSyncExternalStore: () => '' },
      '@/store/auth-store': {
        useAuthStore: { getState: () => ({}), subscribe: () => () => {} },
      },
    },
  );
  const base = {
    user: { id: 'u1', company_id: 'c1', role: 'admin', is_active: true },
    accessToken: 'token-a',
  };
  const key = assetSessionKey(base);
  assert.equal(assetSessionKey({ ...base, accessToken: 'token-b' }), key);
  for (const patch of [
    { id: 'u2' },
    { company_id: 'c2' },
    { role: 'viewer' },
    { is_active: false },
  ]) {
    assert.notEqual(
      assetSessionKey({ ...base, user: { ...base.user, ...patch } }),
      key,
    );
  }
  assert.notEqual(assetSessionKey({ ...base, accessToken: null }), key);
});

test('asset queries use page/size, session-scoped keys and skip invalid ids', async () => {
  const serviceCalls = [];
  const hooks = load(`${moduleDir}/hooks/use-assets-query.ts`, {
    '@tanstack/react-query': { useQuery: (options) => options },
    './use-asset-session-key': {
      useAssetSessionKey: () => 'session-a',
      SERVER_SESSION_KEY: 'server',
    },
    '../services/assets-service': {
      assetsService: {
        listAssets: async (params) => serviceCalls.push(['list', params]),
        getAssetById: async (id) => serviceCalls.push(['get', id]),
      },
      AssetApiError: class AssetApiError extends Error {},
    },
  });
  const list = hooks.useAssetsQuery({
    page: 3,
    size: 10,
    criticality: 'low',
    status: null,
  });
  assert.equal(list.queryKey[1], 'session-a');
  await list.queryFn();
  assert.deepEqual(serviceCalls[0], [
    'list',
    { page: 3, size: 10, criticality: 'low', status: null },
  ]);

  const detail = hooks.useAssetQuery(ASSET_ID);
  assert.equal(detail.enabled, true);
  assert.deepEqual(detail.queryKey, [
    'portal-assets',
    'session-a',
    'detail',
    ASSET_ID,
  ]);
  await detail.queryFn();
  assert.deepEqual(serviceCalls[1], ['get', ASSET_ID]);
  assert.equal(hooks.useAssetQuery('not-a-uuid').enabled, false);
});
