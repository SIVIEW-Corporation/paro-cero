import { readFileSync } from 'node:fs';
import { test as base, expect } from '@playwright/test';
import type { BrowserContext, Page, Route } from '@playwright/test';
import type {
  ApiAsset,
  AssetCreateInput,
  AssetUpdateInput,
} from '../../src/services/assets-service';
import type { User } from '../../src/store/auth-store';

const ORIGIN = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';
const PASSWORD = 'Synthetic-only-123!';
const SAFE_PAGES = new Set(['/login', '/dashboard', '/dashboard/assets']);
const SAFE_ACTIONS = new Set([
  'setAuthCookiesAction',
  'clearAuthCookiesAction',
]);

interface ActionEntry {
  exportedName?: string;
  workers: Record<string, { filename?: string; exportedName?: string }>;
}

// Read only the dev manifest; never print its encryption key or read .env files.
// Unknown/missing action IDs fail CLOSED. In particular refreshTokenAction is
// forbidden because browser routing cannot intercept a server-side fetch.
function safeActionName(id: string): string | undefined {
  try {
    const manifest = JSON.parse(
      readFileSync('.next/dev/server/server-reference-manifest.json', 'utf8'),
    ) as { node: Record<string, ActionEntry> };
    const action = manifest.node[id];
    if (!action?.exportedName || !SAFE_ACTIONS.has(action.exportedName)) return;
    if (
      !Object.values(action.workers).every(
        (worker) =>
          worker.filename === 'src/app/actions/auth.ts' &&
          worker.exportedName === action.exportedName,
      )
    )
      return;
    return action.exportedName;
  } catch {
    return;
  }
}

export function seedAsset(
  company = 'company-a',
  overrides: Partial<ApiAsset> = {},
): ApiAsset {
  return {
    id: 'shared-asset-id',
    company_id: company,
    code: company === 'company-a' ? 'A-001' : 'B-001',
    name: company === 'company-a' ? 'Synthetic pump A' : 'Synthetic pump B',
    area: 'Test plant',
    serial: null,
    model: null,
    manufacturer: null,
    cost: 123456,
    status: 'standby',
    criticality: 'high',
    installed_at: '2024-04-01T18:42:19.123-06:00',
    is_active: true,
    created_at: '2024-04-01T00:00:00Z',
    updated_at: null,
    deleted_at: null,
    ...overrides,
  };
}

interface Call {
  method: string;
  path: string;
  company: string;
  body: unknown;
}

interface Failure {
  method: string;
  path: string;
  status: number | 'network';
}

export class MockAssetsApi {
  readonly companies = new Map<string, ApiAsset[]>([
    ['company-a', [seedAsset()]],
    ['company-b', [seedAsset('company-b')]],
  ]);
  readonly calls: Call[] = [];
  readonly blocked: string[] = [];
  readonly cookieActions: string[] = [];
  private readonly sessions = new Map<string, User>();
  private failures: Failure[] = [];
  private sequence = 0;

  failNext(method: string, path: string, status: Failure['status']) {
    this.failures.push({ method, path, status });
  }

  assets(company = 'company-a') {
    return this.companies.get(company)!;
  }

  writes() {
    return this.calls.filter(
      (call) => call.path.startsWith('/assets') && call.method !== 'GET',
    );
  }

  async install(context: BrowserContext) {
    // Registered before the first navigation; no external socket is connected.
    await context.routeWebSocket('**/*', (socket) => {
      if (new URL(socket.url()).host === new URL(ORIGIN).host) {
        socket.connectToServer();
        return;
      }
      this.blocked.push(`WEBSOCKET ${socket.url()}`);
      socket.close();
    });
    await context.route('**/*', async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      const method = request.method();
      const match = url.pathname.match(
        /(?:\/api\/v1)?(\/(?:auth|users|assets)(?:\/.*)?)$/,
      );
      // API handlers run before the local-page allowlist, regardless of origin.
      if (
        match &&
        (url.origin !== ORIGIN || url.pathname.startsWith('/api/'))
      ) {
        return this.api(route, match[1], method);
      }
      if (url.origin === ORIGIN) {
        if (
          method === 'GET' &&
          (SAFE_PAGES.has(url.pathname) ||
            url.pathname.startsWith('/_next/static/') ||
            url.pathname.startsWith('/__nextjs_font/') ||
            url.pathname === '/PM0-logo.webp' ||
            url.pathname === '/favicon.ico' ||
            url.pathname.startsWith('/images/'))
        ) {
          return route.continue();
        }
        const action = request.headers()['next-action'];
        const name = action && safeActionName(action);
        const body: unknown = request.postDataJSON();
        const safeArgs =
          name === 'setAuthCookiesAction'
            ? Array.isArray(body) &&
              body.length === 2 &&
              body.every(
                (value: unknown) =>
                  typeof value === 'string' && value.startsWith('synthetic-'),
              )
            : name === 'clearAuthCookiesAction' &&
              Array.isArray(body) &&
              body.length === 0;
        if (
          method === 'POST' &&
          SAFE_PAGES.has(url.pathname) &&
          name &&
          safeArgs
        ) {
          this.cookieActions.push(name);
          return route.continue();
        }
      }
      // Unknown external requests, same-origin API routes and unsafe actions
      // never reach a server. Teardown makes unexpected requests fail the test.
      this.blocked.push(`${method} ${url.origin}${url.pathname}`);
      await route.abort('blockedbyclient');
    });
  }

  private async api(route: Route, path: string, method: string) {
    const body: unknown = route.request().postDataJSON();
    const json = (data: unknown, status = 200) =>
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(data),
      });
    if (path === '/auth/login' && method === 'POST') {
      const credentials = body as { email?: string; password?: string };
      const accounts: Record<string, { company: string; role: string }> = {
        'admin-a@example.invalid': { company: 'company-a', role: 'admin' },
        'admin-b@example.invalid': { company: 'company-b', role: 'admin' },
        'viewer-a@example.invalid': { company: 'company-a', role: 'viewer' },
      };
      const account = accounts[credentials.email ?? ''];
      if (!account || credentials.password !== PASSWORD)
        return json({ message: 'Synthetic accounts only' }, 403);
      const token = `synthetic-access-${++this.sequence}`;
      const user: User = {
        id: `user-${account.company}-${account.role}`,
        email: credentials.email!,
        full_name: 'Synthetic Tester',
        company_id: account.company,
        role: account.role,
        is_active: true,
      };
      this.sessions.set(token, user);
      return json({
        access_token: token,
        refresh_token: `synthetic-refresh-${this.sequence}`,
        token_type: 'bearer',
        expires_in: 7200,
        user,
      });
    }
    const token =
      route
        .request()
        .headers()
        .authorization?.replace(/^Bearer /, '') ?? '';
    const user = this.sessions.get(token);
    if (!user) return json({ message: 'No synthetic session' }, 403);
    if (path === '/users/me' && method === 'GET') return json(user);
    if (path === '/auth/logout' && method === 'POST') {
      this.sessions.delete(token);
      return json({ message: 'Synthetic logout' });
    }
    const collection = path === '/assets/';
    const id = path.match(/^\/assets\/([^/]+)$/)?.[1];
    if (
      (!collection && !id) ||
      !['GET', 'POST', 'PUT', 'DELETE'].includes(method)
    ) {
      this.blocked.push(`${method} mocked API ${path}`);
      return route.abort('blockedbyclient');
    }
    this.calls.push({ method, path, company: user.company_id, body });
    const failureIndex = this.failures.findIndex(
      (failure) => failure.method === method && failure.path === path,
    );
    if (failureIndex >= 0) {
      const [failure] = this.failures.splice(failureIndex, 1);
      return failure.status === 'network'
        ? route.abort('failed')
        : json({ message: 'Synthetic request failed' }, failure.status);
    }
    const assets = this.assets(user.company_id);
    if (method === 'GET' && collection)
      return json({
        items: assets,
        total: assets.length,
        page: 1,
        size: 100,
        pages: 1,
      });
    const asset = assets.find((item) => item.id === id);
    if (method === 'GET')
      return asset ? json(asset) : json({ message: 'Not found' }, 404);
    if (user.role !== 'admin') return json({ message: 'Forbidden' }, 403);
    const input = body as AssetCreateInput | AssetUpdateInput | null;
    if (
      input?.code &&
      assets.some((item) => item.code === input.code && item.id !== id)
    )
      return json({ message: 'Duplicate code' }, 409);
    if (method === 'POST' && collection) {
      const created = seedAsset(user.company_id, {
        ...input,
        id: `created-${++this.sequence}`,
      });
      assets.push(created);
      return json(created, 201);
    }
    if (!asset) return json({ message: 'Not found' }, 404);
    if (method === 'PUT') {
      Object.assign(asset, input);
      return json(asset);
    }
    if (method === 'DELETE') {
      assets.splice(assets.indexOf(asset), 1);
      return route.fulfill({ status: 204 });
    }
    this.blocked.push(`${method} unsupported API ${path}`);
    return route.abort('blockedbyclient');
  }
}

export async function login(page: Page, account = 'admin-a') {
  await page.goto('/login');
  const password = page.locator('input[name="password"]');
  const passwordToggle = page.getByRole('button', {
    name: 'Mostrar contraseña',
  });
  await passwordToggle.evaluate(
    (button) =>
      new Promise<void>((resolve) => {
        const hydrated = () =>
          Object.keys(button).some((key) => key.startsWith('__reactProps$'));
        if (hydrated()) return resolve();
        const interval = window.setInterval(() => {
          if (!hydrated()) return;
          window.clearInterval(interval);
          resolve();
        }, 25);
      }),
  );
  await passwordToggle.click();
  await expect(password).toHaveAttribute('type', 'text');
  await page.getByRole('button', { name: 'Ocultar contraseña' }).click();
  await expect(password).toHaveAttribute('type', 'password');
  await page
    .getByRole('textbox', { name: 'Correo electrónico' })
    .fill(`${account}@example.invalid`);
  await password.fill(PASSWORD);
  await page
    .getByRole('button', { name: 'Iniciar sesión', exact: true })
    .click();
  await expect(page).toHaveURL(`${ORIGIN}/dashboard`);
  await page.getByRole('link', { name: 'Activos', exact: true }).click();
  await expect(page).toHaveURL(`${ORIGIN}/dashboard/assets`);
  await expect(
    page.getByRole('button', { name: 'Ver detalle' }).first(),
  ).toBeVisible();
}

export async function logout(page: Page) {
  await page.getByRole('button', { name: 'User menu' }).click();
  await page
    .getByRole('button', { name: 'Cerrar Sesión', exact: true })
    .click();
  await expect(page).toHaveURL(`${ORIGIN}/login`);
}

export const test = base.extend<{ api: MockAssetsApi }>({
  api: [
    async ({ context }, use) => {
      const api = new MockAssetsApi();
      await api.install(context);
      await use(api);
      expect(
        api.blocked,
        'Unexpected requests were blocked; add an explicit mock, never a network fallback',
      ).toEqual([]);
    },
    { auto: true },
  ],
});
export { expect };
