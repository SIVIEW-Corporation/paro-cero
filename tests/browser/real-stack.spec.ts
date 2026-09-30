import { expect, test } from '@playwright/test';

const realStackEnabled =
  process.env.PLAYWRIGHT_REAL === '1' &&
  Boolean(process.env.E2E_ADMIN_EMAIL) &&
  Boolean(process.env.E2E_ADMIN_PASSWORD);

test.describe('real frontend-backend acceptance', () => {
  test.skip(
    !realStackEnabled,
    'Set PLAYWRIGHT_REAL=1, E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run against a real stack.',
  );

  test('login can read users and assets through the API gateway', async ({
    page,
  }) => {
    await page.goto('/login');
    await page
      .getByLabel('Correo electrónico')
      .fill(process.env.E2E_ADMIN_EMAIL!);
    await page.getByLabel('Contraseña').fill(process.env.E2E_ADMIN_PASSWORD!);
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto('/dashboard/assets');
    await expect(
      page.getByText('Activos', { exact: true }).first(),
    ).toBeVisible();

    await page.goto('/users');
    await expect(
      page.getByText('Gestionar usuarios', { exact: true }),
    ).toBeVisible();

    await page.goto('/dashboard/workorders');
    await expect(
      page.getByText('Ordenes de Trabajo', { exact: true }),
    ).toBeVisible();
  });
});
