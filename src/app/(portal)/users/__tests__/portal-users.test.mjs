// Run: pnpm test:portal-users:unit
// Isolated unit tests for the portal users module (`/users`): companies
// management and admin creation. No DOM/browser, network, database writes,
// dependency installs, or application build required.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL('../../../../../', import.meta.url));
const moduleDir = 'src/app/(portal)/users';

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

const realApiClient = load('src/lib/api-client.ts');

/** api-client mock: records calls; keeps the real field-error helpers. */
function mockApiClient(handler) {
  const calls = [];
  const apiClient = async (url, options = {}) => {
    const call = { url, method: options.method ?? 'GET', options };
    calls.push(call);
    return handler(call);
  };
  const withBody = (method) => (url, data, options) =>
    apiClient(url, {
      ...options,
      method,
      body: data ? JSON.stringify(data) : undefined,
    });
  apiClient.get = (url, options) =>
    apiClient(url, { ...options, method: 'GET' });
  apiClient.post = withBody('POST');
  apiClient.put = withBody('PUT');
  apiClient.patch = withBody('PATCH');
  apiClient.delete = (url, options) =>
    apiClient(url, { ...options, method: 'DELETE' });
  return { module: { ...realApiClient, apiClient }, calls };
}

const ok = (data, status = 200) => ({ ok: true, status, data });
const fail = (status, error = {}) => ({
  ok: false,
  status,
  error: { message: `Error ${status}`, status, ...error },
});

const COMPANY_ID = '7c9e6679-7425-40de-944b-e07fc1f90ae7';

const company = {
  id: COMPANY_ID,
  name: 'Acme Industrial',
  rfc: 'AIN010203AB1',
  active: 1,
  created_at: '2026-05-09T07:30:00Z',
  updated_at: null,
};

// ---------------------------------------------------------------------------
// Company schema
// ---------------------------------------------------------------------------

const schema = () => load(`${moduleDir}/lib/company-schema.ts`);

test('RFC accepts persona moral (12) and persona física (13)', () => {
  const { isValidRfc } = schema();
  assert.equal(isValidRfc('ABC123456XY9'), true);
  assert.equal(isValidRfc('ABCD123456XY9'), true);
  assert.equal(isValidRfc('Ñ&A010203AB1'), true);
  assert.equal(isValidRfc('ÑA&B010203AB1'), true);
});

test('RFC rejects invalid lengths and formats', () => {
  const { isValidRfc } = schema();
  for (const rfc of [
    '',
    'AB123456XY9', // 11
    'ABCDE123456XY9', // 14
    '1BC123456XY9', // digit in letters block
    'ABC12345XY9Z', // 5 digits
    'ABC123456XY-', // invalid homoclave char
    'abc123456xy9', // not normalized
    'ABC 123456XY9',
  ]) {
    assert.equal(isValidRfc(rfc), false, rfc);
  }
});

test('normalizeRfc trims and uppercases', () => {
  const { normalizeRfc } = schema();
  assert.equal(normalizeRfc('  abc123456xy9 '), 'ABC123456XY9');
  assert.equal(normalizeRfc('ñabc010203ab1'), 'ÑABC010203AB1');
});

test('company form schema normalizes name and RFC', () => {
  const { companyFormSchema } = schema();
  assert.deepEqual(
    companyFormSchema.parse({
      name: '  Acme  ',
      rfc: ' abcd123456xy9 ',
      active: true,
    }),
    { name: 'Acme', rfc: 'ABCD123456XY9', active: true },
  );
});

test('company form schema rejects blank names, long names and bad RFCs', () => {
  const { companyFormSchema } = schema();
  const issuesFor = (values) => {
    const result = companyFormSchema.safeParse(values);
    assert.equal(result.success, false);
    return result.error.issues.map((issue) => issue.path[0]);
  };
  assert.deepEqual(
    issuesFor({ name: '   ', rfc: 'ABC123456XY9', active: true }),
    ['name'],
  );
  assert.deepEqual(
    issuesFor({ name: 'x'.repeat(256), rfc: 'ABC123456XY9', active: true }),
    ['name'],
  );
  assert.deepEqual(issuesFor({ name: 'Acme', rfc: 'ABC12345', active: true }), [
    'rfc',
  ]);
  assert.deepEqual(issuesFor({ name: 'Acme', rfc: '  ', active: true }), [
    'rfc',
  ]);
  assert.equal(
    companyFormSchema.safeParse({
      name: 'x'.repeat(255),
      rfc: 'ABC123456XY9',
      active: false,
    }).success,
    true,
  );
});

test('create payload maps active to 1/0 with normalized values', () => {
  const { buildCompanyCreatePayload } = schema();
  assert.deepEqual(
    buildCompanyCreatePayload({
      name: ' Acme ',
      rfc: 'abc123456xy9',
      active: true,
    }),
    { name: 'Acme', rfc: 'ABC123456XY9', active: 1 },
  );
  assert.deepEqual(
    buildCompanyCreatePayload({
      name: 'Acme',
      rfc: 'ABC123456XY9',
      active: false,
    }).active,
    0,
  );
  assert.throws(() =>
    buildCompanyCreatePayload({ name: '', rfc: 'X', active: true }),
  );
});

test('new company form defaults to active', () => {
  const { EMPTY_COMPANY_FORM_VALUES } = schema();
  assert.deepEqual(EMPTY_COMPANY_FORM_VALUES, {
    name: '',
    rfc: '',
    active: true,
  });
});

test('update payload contains only changed fields', () => {
  const { buildCompanyUpdatePayload, companyToFormValues, hasCompanyChanges } =
    schema();
  const values = companyToFormValues(company);
  assert.deepEqual(values, {
    name: 'Acme Industrial',
    rfc: 'AIN010203AB1',
    active: true,
  });

  const unchanged = buildCompanyUpdatePayload(company, {
    ...values,
    name: '  Acme Industrial ',
    rfc: 'ain010203ab1',
  });
  assert.deepEqual(unchanged, {});
  assert.equal(hasCompanyChanges(unchanged), false);

  assert.deepEqual(
    buildCompanyUpdatePayload(company, { ...values, name: 'Acme MX' }),
    { name: 'Acme MX' },
  );
  assert.deepEqual(
    buildCompanyUpdatePayload(company, {
      ...values,
      rfc: 'acme010203ab1',
      active: false,
    }),
    { rfc: 'ACME010203AB1', active: 0 },
  );
  assert.equal(
    hasCompanyChanges(
      buildCompanyUpdatePayload(company, { ...values, active: false }),
    ),
    true,
  );
});

// ---------------------------------------------------------------------------
// Companies service
// ---------------------------------------------------------------------------

function loadCompaniesService(handler) {
  const { module, calls } = mockApiClient(handler);
  const service = load(`${moduleDir}/services/companies-service.ts`, {
    '@/lib/api-client': module,
  });
  return { ...service, calls };
}

test('listCompanies requests page/size from the companies endpoint', async () => {
  const page = { items: [company], total: 1, page: 2, size: 10, pages: 1 };
  const { companiesService, calls } = loadCompaniesService(() => ok(page));

  assert.deepEqual(
    await companiesService.listCompanies({ page: 2, size: 10 }),
    page,
  );
  await companiesService.getCompanies(1, 100);

  const requests = calls.map(({ url, method }) => {
    const parsed = new URL(`http://local${url}`);
    return [method, parsed.pathname, Object.fromEntries(parsed.searchParams)];
  });
  assert.deepEqual(requests, [
    ['GET', '/companies/', { page: '2', size: '10' }],
    ['GET', '/companies/', { page: '1', size: '100' }],
  ]);
});

test('getCompany requests the single company endpoint', async () => {
  const { companiesService, calls } = loadCompaniesService(() => ok(company));
  assert.deepEqual(await companiesService.getCompany(COMPANY_ID), company);
  assert.deepEqual(
    calls.map(({ url, method }) => [method, url]),
    [['GET', `/companies/${COMPANY_ID}`]],
  );
});

test('createCompany POSTs a whitelisted body', async () => {
  const { companiesService, calls } = loadCompaniesService(() =>
    ok(company, 201),
  );
  await companiesService.createCompany({
    name: 'Acme',
    rfc: 'ABC123456XY9',
    active: 1,
    id: 'forged',
  });
  assert.equal(calls[0].method, 'POST');
  assert.equal(calls[0].url, '/companies/');
  assert.deepEqual(JSON.parse(calls[0].options.body), {
    name: 'Acme',
    rfc: 'ABC123456XY9',
    active: 1,
  });
});

test('updateCompany PUTs only the provided fields', async () => {
  const { companiesService, calls } = loadCompaniesService(() => ok(company));
  await companiesService.updateCompany(COMPANY_ID, { active: 0 });
  await companiesService.updateCompany(COMPANY_ID, {
    name: 'Acme MX',
    rfc: undefined,
  });
  assert.deepEqual(
    calls.map(({ url, method, options }) => [
      method,
      url,
      JSON.parse(options.body),
    ]),
    [
      ['PUT', `/companies/${COMPANY_ID}`, { active: 0 }],
      ['PUT', `/companies/${COMPANY_ID}`, { name: 'Acme MX' }],
    ],
  );
});

test('updateCompany rejects an empty payload without a request', async () => {
  const { companiesService, CompanyApiError, calls } = loadCompaniesService(
    () => ok(company),
  );
  await assert.rejects(
    companiesService.updateCompany(COMPANY_ID, {}),
    (error) => error instanceof CompanyApiError,
  );
  assert.equal(calls.length, 0);
});

test('409 maps to a duplicate error on the RFC field', async () => {
  const { companiesService, CompanyApiError } = loadCompaniesService(() =>
    fail(409, { message: "Company with rfc 'ABC123456XY9' already exists" }),
  );
  await assert.rejects(
    companiesService.createCompany({
      name: 'Acme',
      rfc: 'ABC123456XY9',
      active: 1,
    }),
    (error) => {
      assert.ok(error instanceof CompanyApiError);
      assert.equal(error.status, 409);
      assert.match(error.message, /Ya existe una empresa/);
      assert.ok(error.fieldErrors.rfc);
      return true;
    },
  );
});

test('409 duplicate name maps to the name field', async () => {
  const { toCompanyApiError } = loadCompaniesService(() => ok(null));
  const error = toCompanyApiError(
    fail(409, { message: "Company with name 'Acme' already exists" }),
    'fallback',
  );
  assert.ok(error.fieldErrors.name);
  assert.equal(error.fieldErrors.rfc, undefined);
});

test('session-busy 409 keeps the session message and no field errors', () => {
  const { toCompanyApiError } = loadCompaniesService(() => ok(null));
  const error = toCompanyApiError(
    fail(409, {
      message: 'Tu sesión se está renovando.',
      code: 'SESSION_BUSY',
    }),
    'fallback',
  );
  assert.equal(error.message, 'Tu sesión se está renovando.');
  assert.deepEqual(error.fieldErrors, {});
});

test('403 maps to a Spanish permission error', () => {
  const { toCompanyApiError } = loadCompaniesService(() => ok(null));
  const error = toCompanyApiError(fail(403), 'fallback');
  assert.equal(error.status, 403);
  assert.match(error.message, /permiso/);
});

test('422 maps body issues onto form fields in Spanish', () => {
  const { toCompanyApiError } = loadCompaniesService(() => ok(null));
  const error = toCompanyApiError(
    fail(422, {
      message: 'invalid',
      fieldErrors: {
        rfc: ['String should have at least 12 characters'],
        name: ['Field required'],
      },
      validationErrors: [
        {
          loc: ['body', 'rfc'],
          msg: 'String should have at least 12 characters',
          type: 'string_too_short',
          ctx: { min_length: 12 },
        },
        { loc: ['body', 'name'], msg: 'Field required', type: 'missing' },
      ],
    }),
    'fallback',
  );
  assert.equal(error.status, 422);
  assert.equal(error.fieldErrors.rfc, 'Debe tener al menos 12 caracteres.');
  assert.equal(error.fieldErrors.name, 'Este campo es obligatorio.');
  assert.match(error.message, /inválidos/);
});

test('network failures and 503 map to a generic connection error', () => {
  const { toCompanyApiError } = loadCompaniesService(() => ok(null));
  for (const response of [
    fail(0, { message: 'Network error: x', code: 'NETWORK_ERROR' }),
    fail(503),
    fail(502),
  ]) {
    const error = toCompanyApiError(response, 'fallback');
    assert.match(error.message, /No se pudo conectar/);
  }
});

// ---------------------------------------------------------------------------
// User creation routing
// ---------------------------------------------------------------------------

function loadOperatorsService() {
  const { module, calls } = mockApiClient(({ options }) =>
    ok({ id: 'new', ...JSON.parse(options.body ?? '{}') }, 201),
  );
  const { operatorsService } = load(
    `${moduleDir}/services/operators-service.ts`,
    { '@/lib/api-client': module },
  );
  return { operatorsService, calls };
}

const newUser = {
  email: 'ana@acme.mx',
  password: 'Secr3t!pass',
  fullName: 'Ana López',
  companyId: COMPANY_ID,
  area: 'Mantenimiento',
  jobTitle: 'Gerente',
};

test('admin role is created through the admin endpoint with company_id', async () => {
  const { operatorsService, calls } = loadOperatorsService();
  await operatorsService.createUser({ ...newUser, role: 'admin' });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].method, 'POST');
  assert.equal(calls[0].url, '/users/admin');
  const body = JSON.parse(calls[0].options.body);
  assert.equal(body.role, 'admin');
  assert.equal(body.company_id, COMPANY_ID);
  assert.equal(body.full_name, 'Ana López');
});

test('creation without a company is rejected locally for every role', async () => {
  const { operatorsService, calls } = loadOperatorsService();
  for (const role of ['admin', 'operator', 'viewer']) {
    await assert.rejects(
      operatorsService.createUser({ ...newUser, role, companyId: '' }),
      /empresa/,
      role,
    );
  }
  assert.equal(calls.length, 0);
});

test('operator and viewer use the operator-viewer endpoint with company_id', async () => {
  const { operatorsService, calls } = loadOperatorsService();
  for (const role of ['operator', 'viewer']) {
    await operatorsService.createUser({ ...newUser, role });
  }
  assert.deepEqual(
    calls.map(({ url, method, options }) => {
      const body = JSON.parse(options.body);
      return [method, url, body.role, body.company_id];
    }),
    [
      ['POST', '/users/operator-viewer', 'operator', COMPANY_ID],
      ['POST', '/users/operator-viewer', 'viewer', COMPANY_ID],
    ],
  );
});

test('legacy and privileged roles are never sent to any endpoint', async () => {
  const { operatorsService, calls } = loadOperatorsService();
  for (const role of ['jefe', 'supervisor', 'tecnico', 'superadmin', '']) {
    await assert.rejects(
      operatorsService.createUser({ ...newUser, role }),
      undefined,
      role,
    );
  }
  await assert.rejects(
    operatorsService.createOperator({ ...newUser, role: 'admin' }),
  );
  assert.equal(calls.length, 0);
});

test('new user schema accepts exactly admin, operator and viewer', () => {
  const { newUserSchema } = load(`${moduleDir}/lib/new-user-schema.ts`);
  assert.deepEqual([...newUserSchema.shape.role.options].sort(), [
    'admin',
    'operator',
    'viewer',
  ]);
  for (const role of ['jefe', 'supervisor', 'tecnico', 'superadmin']) {
    assert.equal(newUserSchema.shape.role.safeParse(role).success, false, role);
  }
});

test('edit user schema role enum is admin, operator and viewer', () => {
  const { editUserSchema } = load(`${moduleDir}/lib/edit-user-schema.ts`);
  assert.deepEqual([...editUserSchema.shape.role.unwrap().options].sort(), [
    'admin',
    'operator',
    'viewer',
  ]);
});

// ---------------------------------------------------------------------------
// Role options and tab visibility
// ---------------------------------------------------------------------------

test('only superadmin can create users: Supervisor, Operador and Visor', () => {
  const { getCreatableRoles, canCreateRole, CREATABLE_ROLE_LABELS } = load(
    `${moduleDir}/lib/user-role-options.ts`,
  );
  assert.deepEqual(getCreatableRoles('superadmin'), [
    'admin',
    'operator',
    'viewer',
  ]);
  assert.deepEqual(CREATABLE_ROLE_LABELS, {
    admin: 'Supervisor',
    operator: 'Operador',
    viewer: 'Visor',
  });
  for (const role of [
    'admin',
    'jefe',
    'supervisor',
    'operator',
    'viewer',
    '',
    null,
  ]) {
    assert.deepEqual(getCreatableRoles(role), [], String(role));
  }
  assert.equal(canCreateRole('superadmin', 'admin'), true);
  assert.equal(canCreateRole('superadmin', 'operator'), true);
  assert.equal(canCreateRole('superadmin', 'viewer'), true);
  assert.equal(canCreateRole('superadmin', 'superadmin'), false);
  assert.equal(canCreateRole('superadmin', 'jefe'), false);
  assert.equal(canCreateRole('admin', 'operator'), false);
});

test('only operator and viewer roles are editable from the edit modal', () => {
  const { EDITABLE_ROLES, isEditableRole } = load(
    `${moduleDir}/lib/user-role-options.ts`,
  );
  assert.deepEqual([...EDITABLE_ROLES], ['operator', 'viewer']);
  assert.equal(isEditableRole('operator'), true);
  assert.equal(isEditableRole('viewer'), true);
  for (const role of ['admin', 'superadmin', 'jefe', 'tecnico', '', null]) {
    assert.equal(isEditableRole(role), false, String(role));
  }
});

test('companies tab is visible only to superadmin', () => {
  const { canManageCompanies, getUsersTabIds, resolveUsersTab } = load(
    `${moduleDir}/lib/users-tabs.ts`,
  );
  assert.equal(canManageCompanies('superadmin'), true);
  for (const role of ['admin', 'operator', 'viewer', undefined]) {
    assert.equal(canManageCompanies(role), false, String(role));
    assert.equal(getUsersTabIds(role).includes('companies'), false);
    assert.equal(resolveUsersTab(role, 'companies'), 'all-users');
  }
  assert.deepEqual(getUsersTabIds('superadmin'), [
    'all-users',
    'new-user',
    'companies',
  ]);
  assert.equal(resolveUsersTab('superadmin', 'companies'), 'companies');
  assert.equal(resolveUsersTab('superadmin', 'bogus'), 'all-users');
});

test('company query keys share the session scope prefix', () => {
  const { companiesQueryKeys } = load(
    `${moduleDir}/lib/companies-query-keys.ts`,
  );
  const scope = { userId: 'u1', companyId: null, role: 'superadmin' };
  const prefix = companiesQueryKeys.scope(scope);
  for (const key of [
    companiesQueryKeys.list(scope, 1, 10),
    companiesQueryKeys.selector(scope),
  ]) {
    assert.deepEqual(key.slice(0, prefix.length), [...prefix]);
  }
});

// ---------------------------------------------------------------------------
// Users list company filter (superadmin)
// ---------------------------------------------------------------------------

test('getOperators sends company_id only when a company is selected', async () => {
  const { module, calls } = mockApiClient(() =>
    ok({ items: [], total: 0, page: 1, size: 10, pages: 0 }),
  );
  const { operatorsService } = load(
    `${moduleDir}/services/operators-service.ts`,
    { '@/lib/api-client': module },
  );

  await operatorsService.getOperators(2, 10, { companyId: COMPANY_ID });
  await operatorsService.getOperators(1, 10, { companyId: null });
  await operatorsService.getOperators(1, 10);

  const [filtered, cleared, unfiltered] = calls.map(
    (call) => new URL(call.url, 'http://local'),
  );
  assert.equal(filtered.pathname, '/users/');
  assert.equal(filtered.searchParams.get('page'), '2');
  assert.equal(filtered.searchParams.get('size'), '10');
  assert.equal(filtered.searchParams.get('include_inactive'), 'false');
  assert.equal(filtered.searchParams.get('company_id'), COMPANY_ID);
  assert.equal(cleared.searchParams.has('company_id'), false);
  assert.equal(unfiltered.searchParams.has('company_id'), false);
});

test('users list query key includes the company filter', () => {
  const { usersQueryKeys } = load(`${moduleDir}/lib/users-query-keys.ts`);
  const scope = { userId: 'u1', companyId: null, role: 'superadmin' };
  const all = usersQueryKeys.list(scope, 1, 10, null);
  const filtered = usersQueryKeys.list(scope, 1, 10, COMPANY_ID);
  assert.notDeepEqual(all, filtered);
  assert.deepEqual(filtered.at(-1), {
    page: 1,
    size: 10,
    companyId: COMPANY_ID,
  });
  assert.deepEqual(all.at(-1), { page: 1, size: 10, companyId: null });
  const prefix = usersQueryKeys.listScope(scope);
  for (const key of [all, filtered]) {
    assert.deepEqual(key.slice(0, prefix.length), [...prefix]);
  }
});

test('company filter options include all companies and mark inactive ones', () => {
  const { ALL_COMPANIES_LABEL, getCompanyFilterOptions } = load(
    `${moduleDir}/lib/users-company-filter.ts`,
  );
  const options = getCompanyFilterOptions([
    { id: 'c1', name: 'Acme', active: 1 },
    { id: 'c2', name: 'Beta', active: 0 },
  ]);
  assert.equal(ALL_COMPANIES_LABEL, 'Todas las empresas');
  assert.deepEqual(options, [
    { value: '', label: 'Todas las empresas' },
    { value: 'c1', label: 'Acme' },
    { value: 'c2', label: 'Beta (inactiva)' },
  ]);
  assert.deepEqual(getCompanyFilterOptions(undefined), [
    { value: '', label: 'Todas las empresas' },
  ]);
});

test('company filter value maps to company_id or null', () => {
  const { toCompanyFilter } = load(`${moduleDir}/lib/users-company-filter.ts`);
  assert.equal(toCompanyFilter(''), null);
  assert.equal(toCompanyFilter(COMPANY_ID), COMPANY_ID);
});

test('company name resolves from the companies list with a dash fallback', () => {
  const { getCompanyName } = load(`${moduleDir}/lib/users-company-filter.ts`);
  const companies = [{ id: 'c1', name: 'Acme', active: 1 }];
  assert.equal(getCompanyName(companies, 'c1'), 'Acme');
  assert.equal(getCompanyName(companies, 'missing'), '—');
  assert.equal(getCompanyName(companies, null), '—');
  assert.equal(getCompanyName(undefined, 'c1'), '—');
});
