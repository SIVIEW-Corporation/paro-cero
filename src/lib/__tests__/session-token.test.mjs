// Run: pnpm test:proxy:unit
// Unit tests for the unverified JWT expiry check used by `src/proxy.ts`.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import ts from 'typescript';

const root = fileURLToPath(new URL('../../../', import.meta.url));

function load(relative) {
  const filename = path.join(root, relative);
  const source = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: filename,
  }).outputText;
  const compiled = { exports: {} };
  new Function('require', 'module', 'exports', source)(
    () => {
      throw new Error('session-token must not import other modules');
    },
    compiled,
    compiled.exports,
  );
  return compiled.exports;
}

const { isAccessTokenValid } = load('src/lib/session-token.ts');

const NOW_MS = 1_760_000_000_000;
const NOW_S = NOW_MS / 1000;

function base64url(value) {
  return Buffer.from(value).toString('base64url');
}

function jwt(payload) {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body =
    typeof payload === 'string' ? payload : base64url(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

test('a token whose exp is in the future is valid', () => {
  assert.equal(isAccessTokenValid(jwt({ exp: NOW_S + 60 }), NOW_MS), true);
});

test('a token whose exp is in the past is invalid', () => {
  assert.equal(isAccessTokenValid(jwt({ exp: NOW_S - 60 }), NOW_MS), false);
});

test('a token expiring exactly now is invalid', () => {
  assert.equal(isAccessTokenValid(jwt({ exp: NOW_S }), NOW_MS), false);
});

test('a token without exp is invalid', () => {
  assert.equal(isAccessTokenValid(jwt({ sub: 'user-1' }), NOW_MS), false);
});

test('a token with a non-numeric exp is invalid', () => {
  for (const exp of [String(NOW_S + 60), null, true, Number.NaN]) {
    assert.equal(isAccessTokenValid(jwt({ exp }), NOW_MS), false, String(exp));
  }
});

test('a payload that is not a JSON object is invalid', () => {
  for (const payload of ['null', '42', '"text"', '[1]']) {
    assert.equal(
      isAccessTokenValid(jwt(base64url(payload)), NOW_MS),
      false,
      payload,
    );
  }
});

test('malformed tokens are invalid', () => {
  for (const token of [
    'not-a-jwt',
    'only.two',
    'a.b.c.d',
    jwt(base64url('{not json')),
  ]) {
    assert.equal(isAccessTokenValid(token, NOW_MS), false, token);
  }
});

test('a payload with invalid base64 is invalid', () => {
  assert.equal(isAccessTokenValid(jwt('%%%***'), NOW_MS), false);
});

test('an empty or missing token is invalid', () => {
  assert.equal(isAccessTokenValid('', NOW_MS), false);
  assert.equal(isAccessTokenValid(undefined, NOW_MS), false);
});
