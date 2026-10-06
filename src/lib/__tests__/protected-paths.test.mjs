// Run: pnpm test:proxy:unit
// Unit tests for the session-protected route matcher used by `src/proxy.ts`.
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
  const resolver = (id) =>
    load(`${path.relative(root, path.resolve(path.dirname(filename), id))}.ts`);
  new Function('require', 'module', 'exports', source)(
    resolver,
    compiled,
    compiled.exports,
  );
  return compiled.exports;
}

const { isProtectedPath, protectedPaths } = load(
  'src/constants/protected-paths.ts',
);
const { tabPaths } = load('src/constants/tab-paths.ts');

test('protected paths include every tab path plus the portal roots', () => {
  for (const tabPath of tabPaths) assert.ok(protectedPaths.includes(tabPath));
  assert.ok(protectedPaths.includes('/assets'));
  assert.ok(protectedPaths.includes('/users'));
});

test('assets portal and its subpaths require a session', () => {
  for (const pathname of [
    '/assets',
    '/assets/',
    '/assets/550e8400-e29b-41d4-a716-446655440000',
    '/assets/new/nested',
  ]) {
    assert.equal(isProtectedPath(pathname), true, pathname);
  }
});

test('users portal and its subpaths require a session', () => {
  for (const pathname of [
    '/users',
    '/users/',
    '/users/550e8400-e29b-41d4-a716-446655440000',
    '/users/new/nested',
  ]) {
    assert.equal(isProtectedPath(pathname), true, pathname);
  }
});

test('dashboard paths stay protected', () => {
  for (const pathname of ['/dashboard', '/dashboard/assets', '/dashboard/x/y'])
    assert.equal(isProtectedPath(pathname), true, pathname);
});

test('matching is by path segment, not by string prefix', () => {
  for (const pathname of [
    '/',
    '/login',
    '/assets-foo',
    '/assetsx',
    '/users-foo',
    '/usersx',
    '/dashboard-foo',
    '/blog/assets',
    '/precios',
  ]) {
    assert.equal(isProtectedPath(pathname), false, pathname);
  }
});
