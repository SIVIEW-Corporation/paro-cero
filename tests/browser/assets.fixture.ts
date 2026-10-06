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
// Session cookie as the dev proxy reads it (production uses `__Host-` names).
const ACCESS_COOKIE = 'access_token';
const SESSION_EXPIRED = { 'x-session-expired': '1' };

/** Unsigned JWT whose `exp` satisfies the proxy's expiry check. */
function syntheticJwt(sequence: number): string {
  const part = (value: unknown) =>
    Buffer.from(JSON.stringify(value)).toString('base64url');
  const exp = Math.floor(Date.now() / 1000) + 60 * 60;
  return `${part({ alg: 'none' })}.${part({ exp, sid: sequence })}.synthetic`;
}

function cookieValue(header: string | undefined, name: string) {
  for (const part of (header ?? '').split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return '';
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

type SyntheticUser = Omit<User, 'company_id'> & { company_id: string };

export class MockAssetsApi {
  readonly companies = new Map<string, ApiAsset[]>([
    ['company-a', [seedAsset()]],
    ['company-b', [seedAsset('company-b')]],
  ]);
  readonly calls: Call[] = [];
  readonly blocked: string[] = [];
  private context: BrowserContext | null = null;
  private readonly sessions = new Map<string, SyntheticUser>();
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
    this.context = context;
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
      // The browser only talks to the same-origin BFF; both prefixes are
      // fulfilled here so no request reaches the Next server or a backend.
      if (url.origin === ORIGIN && url.pathname.startsWith('/api/auth/'))
        return this.auth(route, url.pathname.slice('/api/auth'.length), method);
      if (url.origin === ORIGIN && url.pathname.startsWith('/api/backend/'))
        return this.api(
          route,
          url.pathname.slice('/api/backend'.length),
          method,
        );
      if (
        url.origin === ORIGIN &&
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
      // Unknown external requests, other API routes and server actions never
      // reach a server. Teardown makes unexpected requests fail the test.
      this.blocked.push(`${method} ${url.origin}${url.pathname}`);
      await route.abort('blockedbyclient');
    });
  }

  private json(route: Route, data: unknown, status = 200, headers = {}) {
    return route.fulfill({
      status,
      contentType: 'application/json',
      headers,
      body: JSON.stringify(data),
    });
  }

  private async sessionUser(route: Route) {
    const headers = await route.request().allHeaders();
    const token = cookieValue(headers.cookie, ACCESS_COOKIE);
    return { token, user: this.sessions.get(token) };
  }

  private async auth(route: Route, path: string, method: string) {
    const request = route.request();
    if (request.headers()['x-requested-with'] !== 'paro-cero') {
      this.blocked.push(`${method} /api/auth${path} without X-Requested-With`);
      return route.abort('blockedbyclient');
    }
    if (path === '/login' && method === 'POST') {
      const credentials = request.postDataJSON() as {
        email?: string;
        password?: string;
      };
      const accounts: Record<string, { company: string; role: string }> = {
        'admin-a@example.invalid': { company: 'company-a', role: 'admin' },
        'admin-b@example.invalid': { company: 'company-b', role: 'admin' },
        'viewer-a@example.invalid': { company: 'company-a', role: 'viewer' },
      };
      const account = accounts[credentials.email ?? ''];
      if (!account || credentials.password !== PASSWORD)
        return this.json(route, { detail: 'Synthetic accounts only' }, 401);
      const token = syntheticJwt(++this.sequence);
      const user: SyntheticUser = {
        id: `user-${account.company}-${account.role}`,
        email: credentials.email!,
        full_name: 'Synthetic Tester',
        company_id: account.company,
        role: account.role,
        is_active: true,
      };
      this.sessions.set(token, user);
      // Mirrors the BFF: tokens only in httpOnly cookies, body is `{ user }`.
      await this.context!.addCookies([
        {
          name: ACCESS_COOKIE,
          value: token,
          url: ORIGIN,
          httpOnly: true,
          sameSite: 'Lax',
        },
      ]);
      return this.json(route, { user });
    }
    const { token, user } = await this.sessionUser(route);
    if (path === '/session' && method === 'GET')
      return user
        ? this.json(route, { user })
        : this.json(route, { detail: 'No session' }, 401, SESSION_EXPIRED);
    if (path === '/logout' && method === 'POST') {
      this.sessions.delete(token);
      await this.context!.clearCookies();
      return route.fulfill({ status: 204 });
    }
    this.blocked.push(`${method} unsupported auth route ${path}`);
    return route.abort('blockedbyclient');
  }

  private async api(route: Route, path: string, method: string) {
    const request = route.request();
    const body: unknown = request.postDataJSON();
    const json = (data: unknown, status = 200) =>
      this.json(route, data, status);
    if (request.headers()['x-requested-with'] !== 'paro-cero') {
      this.blocked.push(
        `${method} /api/backend${path} without X-Requested-With`,
      );
      return route.abort('blockedbyclient');
    }
    const { user } = await this.sessionUser(route);
    if (!user)
      return this.json(route, { detail: 'No session' }, 401, SESSION_EXPIRED);
    if (path === '/users/me' && method === 'GET') return json(user);
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
        : json({ detail: 'Synthetic request failed' }, failure.status);
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
      return asset ? json(asset) : json({ detail: 'Not found' }, 404);
    if (user.role !== 'admin') return json({ detail: 'Forbidden' }, 403);
    const input = body as AssetCreateInput | AssetUpdateInput | null;
    if (
      input?.code &&
      assets.some((item) => item.code === input.code && item.id !== id)
    )
      return json({ detail: 'Duplicate code' }, 409);
    if (method === 'POST' && collection) {
      const created = seedAsset(user.company_id, {
        ...input,
        id: `created-${++this.sequence}`,
      });
      assets.push(created);
      return json(created, 201);
    }
    if (!asset) return json({ detail: 'Not found' }, 404);
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
