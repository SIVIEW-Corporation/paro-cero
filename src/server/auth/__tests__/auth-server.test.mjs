// Run: pnpm test:auth:unit
// Unit tests for the server-only BFF auth core: cookie options, request guards
// (CSRF, path sanitizer, header filtering), refresh classification and
// single-flight, the session flow and the proxy decision table. No network,
// Next.js runtime or build required.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL('../../../../', import.meta.url));

function load(relative, mocks = {}) {
  const filename = path.join(root, relative);
  const source = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
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

const cookies = load('src/server/auth/cookie-options.ts');
const guards = load('src/server/auth/request-guards.ts');
const refresh = load('src/server/auth/refresh-core.ts');
const flow = load('src/server/auth/session-flow.ts');
const proxy = load('src/server/auth/proxy-decision.ts');

const NOW_MS = 1_760_000_000_000;
const NOW_S = NOW_MS / 1000;

function jwt(exp) {
  const part = (value) =>
    Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${part({ alg: 'HS256' })}.${part({ exp })}.sig`;
}

const tokens = (suffix = 'new') => ({
  accessToken: jwt(NOW_S + 900),
  refreshToken: `refresh-${suffix}`,
  expiresIn: 900,
  refreshExpiresIn: 604800,
});

// ─── Cookie options ──────────────────────────────────────────────────────────

test('production cookie names use the __Host- prefix; dev uses plain names', () => {
  assert.deepEqual(cookies.authCookieNames(true), {
    access: '__Host-access_token',
    refresh: '__Host-refresh_token',
    remember: '__Host-remember_session',
  });
  assert.deepEqual(cookies.authCookieNames(false), {
    access: 'access_token',
    refresh: 'refresh_token',
    remember: 'remember_session',
  });
});

test('access cookie is httpOnly/Lax/Path=/ and lives expires_in seconds', () => {
  for (const isProduction of [true, false]) {
    const options = cookies.accessCookieOptions(isProduction, 900);
    assert.deepEqual(options, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 900,
    });
    assert.equal('domain' in options, false);
  }
  assert.equal(cookies.accessCookieOptions(true, null).maxAge, 900);
  assert.equal(cookies.accessCookieOptions(true, -5).maxAge, 900);
});

test('refresh cookie persists only with remember_me; otherwise it is a session cookie', () => {
  const remembered = cookies.refreshCookieOptions(true, true, 604800);
  assert.equal(remembered.maxAge, 604800);
  assert.equal(remembered.secure, true);
  const session = cookies.refreshCookieOptions(false, false, 604800);
  assert.equal('maxAge' in session, false);
  assert.equal(session.httpOnly, true);
  assert.equal(session.secure, false);
});

test('session writes keep the remember flag and clearing expires all three cookies', () => {
  const remembered = cookies.sessionCookieWrites(true, tokens(), true);
  assert.deepEqual(
    remembered.map((write) => write.name),
    ['__Host-access_token', '__Host-refresh_token', '__Host-remember_session'],
  );
  assert.equal(remembered[2].value, '1');
  assert.equal(remembered[2].options.maxAge, 604800);

  const session = cookies.sessionCookieWrites(false, tokens(), false);
  const flag = session.find((write) => write.name === 'remember_session');
  assert.equal(flag.options.maxAge, 0, 'non-remembered sessions drop the flag');
  assert.equal('maxAge' in session[1].options, false);

  for (const write of cookies.clearedCookieWrites(true)) {
    assert.equal(write.value, '');
    assert.equal(write.options.maxAge, 0);
    assert.equal(write.options.secure, true);
    assert.equal(write.options.path, '/');
  }
});

// ─── CSRF ────────────────────────────────────────────────────────────────────

const ORIGIN = 'https://app.example.com';

function csrf({ method = 'POST', headers = {}, hasBody = false } = {}) {
  return guards.checkCsrf({
    method,
    headers: new Headers({ 'x-requested-with': 'paro-cero', ...headers }),
    allowedOrigins: [ORIGIN],
    hasBody,
  });
}

test('CSRF: same-origin unsafe requests with the custom header pass', () => {
  assert.deepEqual(csrf({ headers: { origin: ORIGIN } }), { ok: true });
  assert.deepEqual(csrf({ headers: { 'sec-fetch-site': 'same-origin' } }), {
    ok: true,
  });
  assert.deepEqual(csrf({ method: 'GET' }), { ok: true });
});

test('CSRF: cross-site or origin-less unsafe requests are rejected with 403', () => {
  for (const headers of [
    { origin: 'https://evil.example' },
    { origin: 'null' },
    {},
    { 'sec-fetch-site': 'cross-site' },
    { origin: 'https://evil.example', 'sec-fetch-site': 'same-origin' },
  ]) {
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
      const result = csrf({ method, headers });
      assert.equal(result.ok, false, `${method} ${JSON.stringify(headers)}`);
      assert.equal(result.status, 403);
    }
  }
});

test('CSRF: the X-Requested-With header is required on every method', () => {
  for (const method of ['GET', 'POST']) {
    const result = guards.checkCsrf({
      method,
      headers: new Headers({ origin: ORIGIN }),
      allowedOrigins: [ORIGIN],
      hasBody: false,
    });
    assert.equal(result.ok, false);
    assert.equal(result.status, 403);
  }
  const wrong = guards.checkCsrf({
    method: 'GET',
    headers: new Headers({ 'x-requested-with': 'XMLHttpRequest' }),
    allowedOrigins: [ORIGIN],
    hasBody: false,
  });
  assert.equal(wrong.ok, false);
});

test('CSRF: a JSON body requires application/json', () => {
  assert.deepEqual(
    csrf({
      hasBody: true,
      headers: {
        origin: ORIGIN,
        'content-type': 'application/json; charset=utf-8',
      },
    }),
    { ok: true },
  );
  for (const type of [
    'text/plain',
    'application/x-www-form-urlencoded',
    'multipart/form-data; boundary=x',
    undefined,
  ]) {
    const headers = { origin: ORIGIN };
    if (type) headers['content-type'] = type;
    const result = csrf({ hasBody: true, headers });
    assert.equal(result.ok, false, String(type));
    assert.equal(result.status, 415);
  }
});

test('allowed origins include the request origin, forwarded host and site URL', () => {
  const origins = guards.allowedOriginsFor(
    'http://localhost:3000/api/backend/assets',
    new Headers({
      'x-forwarded-host': 'app.example.com',
      'x-forwarded-proto': 'https',
    }),
    'https://www.example.com/some/path',
  );
  assert.ok(origins.includes('http://localhost:3000'));
  assert.ok(origins.includes('https://app.example.com'));
  assert.ok(origins.includes('https://www.example.com'));
});

// ─── Path sanitizer / SSRF ───────────────────────────────────────────────────

test('sanitizer accepts normal resource paths and keeps a trailing slash', () => {
  assert.deepEqual(guards.sanitizeBackendPath('assets/'), {
    ok: true,
    segments: ['assets', ''],
  });
  assert.deepEqual(
    guards.sanitizeBackendPath('assets/550e8400-e29b-41d4-a716-446655440000'),
    { ok: true, segments: ['assets', '550e8400-e29b-41d4-a716-446655440000'] },
  );
  assert.equal(guards.sanitizeBackendPath('users/me').ok, true);
  assert.equal(guards.sanitizeBackendPath('work-orders/a_b~c.d').ok, true);
});

test('sanitizer rejects traversal, encoded separators, backslashes and empty segments', () => {
  for (const raw of [
    '',
    '/',
    '/assets',
    '../auth/login',
    'assets/../auth/refresh',
    'assets/./x',
    'assets/%2e%2e/auth',
    'assets/%2E%2E',
    'assets/%2fetc',
    'assets/%2F',
    'assets/%5c..',
    'assets\\..\\auth',
    'assets//x',
    'assets/%252e%252e',
    'assets/%00',
    'assets/%0a',
    'http:/evil.example',
    'assets/x?y',
    'assets/...',
    'assets/%zz',
  ]) {
    const result = guards.sanitizeBackendPath(raw);
    assert.equal(result.ok, false, raw);
    assert.ok([400, 404].includes(result.status), raw);
  }
});

test('sanitizer blocks auth/* so tokens never transit the generic forwarder', () => {
  for (const raw of [
    'auth/login',
    'auth/refresh',
    'AUTH/logout',
    'auth',
    'auth/',
  ]) {
    const result = guards.sanitizeBackendPath(raw);
    assert.equal(result.ok, false, raw);
    assert.equal(result.status, 404, raw);
  }
  assert.equal(guards.sanitizeBackendPath('authors/1').ok, true);
});

test('backend URL is API_URL + /api/v1/ + segments + query, pinned to the API origin', () => {
  assert.equal(
    guards.buildBackendUrl(
      'http://127.0.0.1:8000',
      ['assets', ''],
      '?page=2&size=10',
    ),
    'http://127.0.0.1:8000/api/v1/assets/?page=2&size=10',
  );
  assert.equal(
    guards.buildBackendUrl(
      'http://127.0.0.1:8000/api/v1/',
      ['users', 'me'],
      '',
    ),
    'http://127.0.0.1:8000/api/v1/users/me',
  );
  assert.equal(
    guards.buildBackendUrl('https://api.example.com/base/', ['assets'], ''),
    'https://api.example.com/base/api/v1/assets',
  );
});

test('forwarded request headers drop credentials, host, BFF secrets and hop-by-hop', () => {
  const filtered = guards.filterRequestHeaders(
    new Headers({
      accept: 'application/json',
      'content-type': 'application/json',
      'accept-language': 'es-MX',
      'if-none-match': '"abc"',
      cookie: 'access_token=x',
      authorization: 'Bearer stolen',
      host: 'evil.example',
      'x-bff-secret': 'guess',
      'x-client-ip': '1.2.3.4',
      connection: 'keep-alive',
      'keep-alive': 'timeout=5',
      'transfer-encoding': 'chunked',
      upgrade: 'websocket',
      'proxy-authorization': 'Basic x',
      te: 'trailers',
      'x-forwarded-for': '9.9.9.9',
      'x-requested-with': 'paro-cero',
      origin: ORIGIN,
    }),
  );
  assert.deepEqual([...filtered.keys()].sort(), [
    'accept',
    'accept-language',
    'content-type',
    'if-none-match',
  ]);
});

test('response headers never pass backend set-cookie or session control headers', () => {
  const filtered = guards.filterResponseHeaders(
    new Headers({
      'content-type': 'application/json',
      'set-cookie': 'backend=1',
      'x-session-retry': '1',
      'x-session-expired': '1',
      'content-encoding': 'gzip',
      'content-length': '10',
      'transfer-encoding': 'chunked',
      etag: '"v1"',
      'content-disposition': 'attachment; filename="a.csv"',
    }),
  );
  assert.deepEqual([...filtered.keys()].sort(), [
    'content-disposition',
    'content-type',
    'etag',
  ]);
});

test('client IP prefers Netlify header, then first X-Forwarded-For, else unknown', () => {
  assert.equal(
    guards.resolveClientIp(
      new Headers({
        'x-nf-client-connection-ip': '203.0.113.7',
        'x-forwarded-for': '198.51.100.1',
      }),
    ),
    '203.0.113.7',
  );
  assert.equal(
    guards.resolveClientIp(
      new Headers({ 'x-forwarded-for': ' 2001:db8::1 , 10.0.0.1' }),
    ),
    '2001:db8::1',
  );
  assert.equal(guards.resolveClientIp(new Headers()), 'unknown');
  assert.equal(
    guards.resolveClientIp(
      new Headers({ 'x-forwarded-for': 'evil<script>, 10.0.0.1' }),
    ),
    'unknown',
  );
});

// ─── Refresh classification & single-flight ──────────────────────────────────

const pair = {
  access_token: 'a2',
  refresh_token: 'r2',
  token_type: 'bearer',
  expires_in: 900,
  refresh_expires_in: 604800,
};

test('refresh outcomes: 200 ok, 401 unauthorized, 409 conflict, 429/5xx transient', () => {
  assert.deepEqual(refresh.classifyRefreshResponse(200, pair), {
    kind: 'ok',
    tokens: {
      accessToken: 'a2',
      refreshToken: 'r2',
      expiresIn: 900,
      refreshExpiresIn: 604800,
    },
  });
  assert.deepEqual(refresh.classifyRefreshResponse(401, { detail: 'x' }), {
    kind: 'unauthorized',
  });
  assert.deepEqual(refresh.classifyRefreshResponse(409, null), {
    kind: 'conflict',
  });
  for (const status of [429, 500, 502, 503, 504]) {
    assert.deepEqual(refresh.classifyRefreshResponse(status, null), {
      kind: 'transient',
    });
  }
  assert.deepEqual(
    refresh.classifyRefreshResponse(200, { access_token: 'a' }),
    {
      kind: 'transient',
    },
  );
});

test('performRefresh maps network errors to transient and sends only the token', async () => {
  const calls = [];
  const ok = await refresh.performRefreshRequest('r1', async (body) => {
    calls.push(body);
    return { status: 200, json: async () => pair };
  });
  assert.equal(ok.kind, 'ok');
  assert.deepEqual(calls, [{ refresh_token: 'r1' }]);
  const network = await refresh.performRefreshRequest('r1', async () => {
    throw new TypeError('fetch failed');
  });
  assert.deepEqual(network, { kind: 'transient' });
  const badJson = await refresh.performRefreshRequest('r1', async () => ({
    status: 401,
    json: async () => {
      throw new SyntaxError('no json');
    },
  }));
  assert.deepEqual(badJson, { kind: 'unauthorized' });
});

test('sha256Hex hashes with Web Crypto', async () => {
  assert.equal(
    await refresh.sha256Hex('abc'),
    'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
  );
});

function coordinator(results, { now = () => NOW_MS } = {}) {
  const calls = [];
  const run = refresh.createRefreshCoordinator({
    performRefresh: async (token) => {
      calls.push(token);
      await new Promise((resolve) => setTimeout(resolve, 5));
      return results.shift() ?? { kind: 'transient' };
    },
    hashToken: refresh.sha256Hex,
    now,
    cacheTtlMs: 10_000,
  });
  return { run, calls };
}

test('single-flight: concurrent refreshes of one token share one backend call', async () => {
  const { run, calls } = coordinator([{ kind: 'ok', tokens: tokens() }]);
  const results = await Promise.all([run('r1'), run('r1'), run('r1')]);
  assert.equal(calls.length, 1);
  for (const result of results) assert.equal(result.kind, 'ok');
  assert.equal(results[0], results[1]);
});

test('single-flight: ok results are cached ~10s, then a new call is made', async () => {
  let now = NOW_MS;
  const { run, calls } = coordinator(
    [{ kind: 'ok', tokens: tokens('a') }, { kind: 'unauthorized' }],
    { now: () => now },
  );
  await run('r1');
  now += 9_000;
  assert.equal((await run('r1')).kind, 'ok');
  assert.equal(calls.length, 1);
  now += 2_000;
  assert.equal((await run('r1')).kind, 'unauthorized');
  assert.equal(calls.length, 2);
});

test('single-flight: transient and conflict results are not cached; tokens are independent', async () => {
  const { run, calls } = coordinator([
    { kind: 'transient' },
    { kind: 'conflict' },
    { kind: 'ok', tokens: tokens() },
    { kind: 'ok', tokens: tokens('other') },
  ]);
  assert.equal((await run('r1')).kind, 'transient');
  assert.equal((await run('r1')).kind, 'conflict');
  assert.equal((await run('r1')).kind, 'ok');
  assert.equal((await run('r2')).kind, 'ok');
  assert.deepEqual(calls, ['r1', 'r1', 'r1', 'r2']);
});

test('single-flight: a throwing refresh resolves as transient and is not cached', async () => {
  let attempts = 0;
  const run = refresh.createRefreshCoordinator({
    performRefresh: async () => {
      attempts++;
      if (attempts === 1) throw new Error('boom');
      return { kind: 'unauthorized' };
    },
    hashToken: refresh.sha256Hex,
    now: () => NOW_MS,
  });
  assert.deepEqual(await run('r1'), { kind: 'transient' });
  assert.deepEqual(await run('r1'), { kind: 'unauthorized' });
});

// ─── Session flow (forwarder / session / logout-all) ─────────────────────────

function response(status) {
  return new Response(status === 204 ? null : JSON.stringify({ status }), {
    status,
  });
}

async function runFlow({ access, refreshToken, outcome, statuses }) {
  const calls = [];
  const refreshes = [];
  const result = await flow.runWithSession({
    accessToken: access,
    refreshToken,
    nowMs: NOW_MS,
    refresh: async (token) => {
      refreshes.push(token);
      return outcome;
    },
    call: async (token) => {
      calls.push(token);
      return response(statuses.shift() ?? 200);
    },
  });
  return { result, calls, refreshes };
}

test('flow: valid access is used directly without refreshing', async () => {
  const valid = jwt(NOW_S + 600);
  const { result, calls, refreshes } = await runFlow({
    access: valid,
    refreshToken: 'r1',
    statuses: [200],
  });
  assert.equal(result.kind, 'response');
  assert.equal(result.tokens, null);
  assert.deepEqual(calls, [valid]);
  assert.equal(refreshes.length, 0);
});

test('flow: missing/expired access refreshes first and returns the new tokens', async () => {
  for (const access of [undefined, jwt(NOW_S - 1), jwt(NOW_S + 5)]) {
    const fresh = tokens();
    const { result, calls, refreshes } = await runFlow({
      access,
      refreshToken: 'r1',
      outcome: { kind: 'ok', tokens: fresh },
      statuses: [200],
    });
    assert.equal(result.kind, 'response');
    assert.equal(result.tokens, fresh);
    assert.deepEqual(calls, [fresh.accessToken]);
    assert.deepEqual(refreshes, ['r1']);
  }
});

test('flow: a backend 401 refreshes and retries exactly once', async () => {
  const fresh = tokens();
  const { result, calls } = await runFlow({
    access: jwt(NOW_S + 600),
    refreshToken: 'r1',
    outcome: { kind: 'ok', tokens: fresh },
    statuses: [401, 200],
  });
  assert.equal(result.kind, 'response');
  assert.equal(result.response.status, 200);
  assert.equal(calls.length, 2);
  assert.equal(calls[1], fresh.accessToken);

  const twice = await runFlow({
    access: jwt(NOW_S + 600),
    refreshToken: 'r1',
    outcome: { kind: 'ok', tokens: tokens() },
    statuses: [401, 401],
  });
  assert.equal(twice.result.kind, 'expired');
  assert.equal(twice.calls.length, 2);
});

test('flow: conflict, unauthorized and transient refresh outcomes are surfaced', async () => {
  for (const [outcome, kind] of [
    [{ kind: 'conflict' }, 'conflict'],
    [{ kind: 'unauthorized' }, 'expired'],
    [{ kind: 'transient' }, 'transient'],
  ]) {
    const { result, calls } = await runFlow({
      refreshToken: 'r1',
      outcome,
      statuses: [],
    });
    assert.equal(result.kind, kind);
    assert.equal(calls.length, 0);
  }
});

test('flow: no refresh cookie means expired (never calls the backend unauthenticated)', async () => {
  const { result, calls } = await runFlow({ statuses: [] });
  assert.equal(result.kind, 'expired');
  assert.equal(calls.length, 0);
  const after401 = await runFlow({
    access: jwt(NOW_S + 600),
    statuses: [401],
  });
  assert.equal(after401.result.kind, 'expired');
});

// ─── Proxy decision table ────────────────────────────────────────────────────

function decide(overrides) {
  return proxy.decideProxy({
    pathname: '/dashboard/assets',
    search: '',
    accessValid: false,
    hasAccessCookie: false,
    hasRefresh: false,
    isPrefetch: false,
    ...overrides,
  });
}

test('proxy: protected path with valid access continues untouched', () => {
  assert.deepEqual(decide({ accessValid: true, hasAccessCookie: true }), {
    action: 'continue',
    setSessionCookies: false,
    clearCookies: false,
  });
});

test('proxy: protected path without any session redirects to /login?next=', () => {
  const decision = decide({ search: '?tab=2', hasAccessCookie: true });
  assert.equal(decision.action, 'redirect');
  assert.equal(
    decision.location,
    `/login?next=${encodeURIComponent('/dashboard/assets?tab=2')}`,
  );
  assert.equal(decision.clearCookies, true);
});

test('proxy: protected path with refresh cookie asks to refresh, then follows the outcome', () => {
  assert.equal(decide({ hasRefresh: true }).action, 'refresh');
  assert.deepEqual(decide({ hasRefresh: true, refreshOutcome: 'ok' }), {
    action: 'continue',
    setSessionCookies: true,
    clearCookies: false,
  });
  for (const outcome of ['conflict', 'transient']) {
    assert.deepEqual(decide({ hasRefresh: true, refreshOutcome: outcome }), {
      action: 'continue',
      setSessionCookies: false,
      clearCookies: false,
    });
  }
  const expired = decide({ hasRefresh: true, refreshOutcome: 'unauthorized' });
  assert.equal(expired.action, 'redirect');
  assert.equal(expired.clearCookies, true);
  assert.match(expired.location, /^\/login\?next=/);
});

test('proxy: prefetch requests never refresh', () => {
  assert.deepEqual(decide({ hasRefresh: true, isPrefetch: true }), {
    action: 'continue',
    setSessionCookies: false,
    clearCookies: false,
  });
});

test('proxy: /login redirects authenticated users (or after a successful refresh)', () => {
  const login = { pathname: '/login' };
  assert.equal(decide({ ...login }).action, 'continue');
  const valid = decide({ ...login, accessValid: true, hasAccessCookie: true });
  assert.equal(valid.action, 'redirect');
  assert.equal(valid.location, '/dashboard');
  assert.equal(
    decide({
      ...login,
      search: '?next=%2Fusers%3Fpage%3D2',
      accessValid: true,
      hasAccessCookie: true,
    }).location,
    '/users?page=2',
  );
  assert.equal(
    decide({
      ...login,
      search: '?next=%2F%2Fevil.example',
      accessValid: true,
      hasAccessCookie: true,
    }).location,
    '/dashboard',
  );
  assert.equal(decide({ ...login, hasRefresh: true }).action, 'refresh');
  const refreshed = decide({
    ...login,
    hasRefresh: true,
    refreshOutcome: 'ok',
  });
  assert.equal(refreshed.action, 'redirect');
  assert.equal(refreshed.setSessionCookies, true);
  const rejected = decide({
    ...login,
    hasRefresh: true,
    refreshOutcome: 'unauthorized',
  });
  assert.equal(rejected.action, 'continue');
  assert.equal(rejected.clearCookies, true);
});

test('proxy: landing redirects valid sessions unless ?landing=1; public paths continue', () => {
  assert.equal(
    decide({ pathname: '/', accessValid: true, hasAccessCookie: true })
      .location,
    '/dashboard',
  );
  assert.equal(
    decide({
      pathname: '/',
      search: '?landing=1',
      accessValid: true,
      hasAccessCookie: true,
    }).action,
    'continue',
  );
  assert.equal(decide({ pathname: '/', hasRefresh: true }).action, 'continue');
  assert.equal(
    decide({ pathname: '/precios', hasRefresh: true }).action,
    'continue',
  );
});

test('proxy: refreshed cookies are merged into the forwarded Cookie header', () => {
  assert.equal(
    proxy.mergeCookieHeader('theme=dark; access_token=old; refresh_token=r1', {
      access_token: 'new-a',
      refresh_token: 'new-r',
    }),
    'theme=dark; access_token=new-a; refresh_token=new-r',
  );
  assert.equal(
    proxy.mergeCookieHeader('theme=dark; access_token=old', {
      access_token: null,
      refresh_token: 'r2',
    }),
    'theme=dark; refresh_token=r2',
  );
  assert.equal(proxy.mergeCookieHeader(null, { a: '1' }), 'a=1');
});

test('proxy: prefetch detection covers router, purpose and sec-purpose headers', () => {
  assert.equal(
    proxy.isPrefetchRequest(new Headers({ 'next-router-prefetch': '1' })),
    true,
  );
  assert.equal(
    proxy.isPrefetchRequest(new Headers({ purpose: 'prefetch' })),
    true,
  );
  assert.equal(
    proxy.isPrefetchRequest(
      new Headers({ 'sec-purpose': 'prefetch;prerender' }),
    ),
    true,
  );
  assert.equal(proxy.isPrefetchRequest(new Headers()), false);
});
