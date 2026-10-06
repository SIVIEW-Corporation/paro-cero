// Run: pnpm test:auth:unit
// Unit tests for the browser side of the BFF session: `next` validation, the
// BFF retry policy, the api-client wiring and the token-free auth store.
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

const { safeNextPath } = load('src/lib/auth/next-path.ts');
const protocol = load('src/lib/auth/bff-protocol.ts');

// ─── next param ──────────────────────────────────────────────────────────────

test('next accepts same-site relative paths with query and hash', () => {
  for (const value of ['/dashboard', '/users?page=2', '/assets/abc#top', '/']) {
    assert.equal(safeNextPath(value), value);
  }
});

test('next rejects absolute, protocol-relative, backslash and control-char paths', () => {
  for (const value of [
    null,
    undefined,
    '',
    'dashboard',
    'https://evil.example',
    '//evil.example',
    '/\\evil.example',
    '/\\/evil.example',
    '\\\\evil.example',
    '/\t/evil.example',
    '/\n/evil.example',
    'javascript:alert(1)',
    '/login',
    '/login?next=%2Fdashboard',
    `/${'a'.repeat(2100)}`,
  ]) {
    assert.equal(safeNextPath(value), null, String(value));
  }
});

// ─── BFF retry policy ────────────────────────────────────────────────────────

const headers = (entries = {}) => new Headers(entries);

test('409 with X-Session-Retry retries after 300–600ms, at most twice', () => {
  const retry = headers({ 'x-session-retry': '1' });
  assert.deepEqual(
    protocol.classifyBffResponse(409, retry, 0, () => 0),
    {
      type: 'retry',
      delayMs: 300,
    },
  );
  assert.deepEqual(
    protocol.classifyBffResponse(409, retry, 1, () => 0.9999),
    {
      type: 'retry',
      delayMs: 600,
    },
  );
  assert.deepEqual(
    protocol.classifyBffResponse(409, retry, 2, () => 0),
    {
      type: 'transient',
    },
  );
  assert.deepEqual(protocol.classifyBffResponse(409, headers(), 0), {
    type: 'done',
  });
});

test('401 with X-Session-Expired is expired; a plain 401 is a normal error', () => {
  assert.deepEqual(
    protocol.classifyBffResponse(401, headers({ 'x-session-expired': '1' }), 0),
    { type: 'expired' },
  );
  assert.deepEqual(protocol.classifyBffResponse(401, headers(), 0), {
    type: 'done',
  });
});

test('503 is transient and other statuses are done', () => {
  assert.deepEqual(protocol.classifyBffResponse(503, headers(), 0), {
    type: 'transient',
  });
  for (const status of [200, 204, 400, 403, 404, 422, 500]) {
    assert.deepEqual(protocol.classifyBffResponse(status, headers(), 0), {
      type: 'done',
    });
  }
});

// ─── api-client wiring ───────────────────────────────────────────────────────

function fakeResponse(status, body, extraHeaders = {}) {
  return {
    status,
    ok: status >= 200 && status < 300,
    headers: new Headers(extraHeaders),
    json: async () => body,
  };
}

function loadClient(responses) {
  const calls = [];
  const expired = [];
  const delays = [];
  const client = load(
    'src/lib/api-client.ts',
    {
      '@/lib/auth/session-events': {
        notifySessionExpired: () => expired.push(true),
      },
    },
    {
      fetch: async (url, options) => {
        calls.push({ url, options });
        const next = responses.shift();
        if (next instanceof Error) throw next;
        return next;
      },
      // Session-retry delays run immediately; the 30s abort timer never fires.
      setTimeout: (fn, ms) => {
        if (ms <= 600) {
          delays.push(ms);
          fn();
        }
        return 0;
      },
      clearTimeout: () => {},
    },
  );
  return { client, calls, expired, delays };
}

test('apiClient calls the same-origin BFF without ever attaching a token', async () => {
  const { client, calls } = loadClient([fakeResponse(200, { id: 'a' })]);
  const result = await client.apiClient('/assets/?page=1', {
    method: 'POST',
    body: '{}',
  });
  assert.equal(result.ok, true);
  assert.deepEqual(result.data, { id: 'a' });
  assert.equal(calls[0].url, '/api/backend/assets/?page=1');
  assert.equal(calls[0].options.credentials, 'same-origin');
  assert.equal(calls[0].options.headers['X-Requested-With'], 'paro-cero');
  assert.equal('Authorization' in calls[0].options.headers, false);
  assert.equal('isRequestCurrent' in calls[0].options, false);
});

test('apiClient retries a 409 session conflict and then succeeds', async () => {
  const conflict = () => fakeResponse(409, null, { 'x-session-retry': '1' });
  const { client, calls, delays, expired } = loadClient([
    conflict(),
    conflict(),
    fakeResponse(200, { id: 'ok' }),
  ]);
  const result = await client.apiClient('/users/me');
  assert.equal(result.ok, true);
  assert.equal(calls.length, 3);
  assert.equal(delays.length, 2);
  for (const delay of delays) assert.ok(delay >= 300 && delay <= 600);
  assert.equal(expired.length, 0);
});

test('apiClient gives up after two conflict retries without logging out', async () => {
  const conflict = () => fakeResponse(409, null, { 'x-session-retry': '1' });
  const { client, calls, expired } = loadClient([
    conflict(),
    conflict(),
    conflict(),
  ]);
  const result = await client.apiClient('/users/me');
  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'SESSION_BUSY');
  assert.equal(calls.length, 3);
  assert.equal(expired.length, 0);
});

test('apiClient triggers the central handler on an expired session', async () => {
  const { client, expired } = loadClient([
    fakeResponse(401, { detail: 'expired' }, { 'x-session-expired': '1' }),
  ]);
  const result = await client.apiClient('/assets/');
  assert.equal(result.ok, false);
  assert.equal(result.status, 401);
  assert.equal(result.error.code, 'SESSION_EXPIRED');
  assert.equal(expired.length, 1);
});

test('apiClient does not log out on a plain 401/403 or a transient 503', async () => {
  const { client, expired } = loadClient([
    fakeResponse(401, { detail: 'Invalid credentials' }),
    fakeResponse(503, { detail: 'down' }, { 'retry-after': '2' }),
  ]);
  const plain = await client.apiClient('/assets/');
  assert.equal(plain.status, 401);
  assert.equal(plain.error.message, 'Invalid credentials');
  const transient = await client.apiClient('/assets/');
  assert.equal(transient.status, 503);
  assert.equal(transient.error.code, 'SESSION_UNAVAILABLE');
  assert.equal(expired.length, 0);
});

test('apiClient keeps structured validation errors for 422 responses', async () => {
  const { client } = loadClient([
    fakeResponse(422, {
      detail: [
        { loc: ['body', 'code'], msg: 'Too long', type: 'string_too_long' },
      ],
    }),
  ]);
  const result = await client.apiClient('/assets/', {
    method: 'POST',
    body: '{}',
  });
  assert.deepEqual(result.error.fieldErrors, { code: ['Too long'] });
  assert.equal(result.error.validationErrors.length, 1);
});

test('apiClient never refreshes or replays when the session changed', async () => {
  let current = true;
  const { client, calls } = loadClient([
    fakeResponse(409, null, { 'x-session-retry': '1' }),
    fakeResponse(200, {}),
  ]);
  const promise = client.apiClient('/assets/a', {
    method: 'PUT',
    body: '{}',
    isRequestCurrent: () => {
      const value = current;
      current = false;
      return value;
    },
  });
  const result = await promise;
  assert.equal(result.error.code, 'SESSION_CHANGED');
  assert.equal(calls.length, 1);
});

test('authRequest targets /api/auth and never fires the expired handler', async () => {
  const { client, calls, expired } = loadClient([
    fakeResponse(401, { detail: 'no' }, { 'x-session-expired': '1' }),
  ]);
  const result = await client.authRequest('/session');
  assert.equal(calls[0].url, '/api/auth/session');
  assert.equal(result.status, 401);
  assert.equal(expired.length, 0);
});

// ─── auth store ──────────────────────────────────────────────────────────────

test('auth store holds only user/status and its migration drops persisted tokens', () => {
  let options;
  const { useAuthStore, AUTH_STATUS, migrateAuthStorage } = load(
    'src/store/auth-store.ts',
    {
      zustand: {
        create: () => (initializer) => {
          let state;
          const set = (patch) => {
            state = {
              ...state,
              ...(typeof patch === 'function' ? patch(state) : patch),
            };
          };
          state = initializer(set, () => state);
          return { getState: () => state };
        },
      },
      'zustand/middleware': {
        persist: (initializer, persistOptions) => {
          options = persistOptions;
          return initializer;
        },
        createJSONStorage: () => undefined,
      },
    },
  );
  const state = useAuthStore.getState();
  assert.equal('accessToken' in state, false);
  assert.equal('refreshToken' in state, false);
  assert.equal(state.status, AUTH_STATUS.CHECKING);
  state.setUser({ id: 'u1' });
  assert.equal(useAuthStore.getState().status, AUTH_STATUS.AUTHENTICATED);
  useAuthStore.getState().logout();
  assert.equal(useAuthStore.getState().user, null);
  assert.equal(useAuthStore.getState().status, AUTH_STATUS.ANONYMOUS);

  assert.ok(options.version >= 1);
  assert.deepEqual(
    migrateAuthStorage(
      { user: { id: 'u1' }, accessToken: 'secret-a', refreshToken: 'secret-r' },
      0,
    ),
    { user: { id: 'u1' } },
  );
  assert.deepEqual(migrateAuthStorage(null, 0), { user: null });
  assert.deepEqual(
    options.partialize({ user: { id: 'u' }, status: 'authenticated' }),
    { user: { id: 'u' } },
  );
});
