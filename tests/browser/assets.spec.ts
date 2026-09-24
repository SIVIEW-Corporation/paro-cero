import { expect, login, logout, test } from './assets.fixture';

test('admin creates, edits and soft-deletes an asset without real API traffic', async ({
  api,
  page,
}) => {
  await login(page);

  await expect(
    page.getByText('Synthetic pump A', { exact: true }),
  ).toBeVisible();
  await expect(page.getByText('Synthetic pump B', { exact: true })).toHaveCount(
    0,
  );

  await page.getByRole('button', { name: '+ Nuevo Activo' }).click();
  await page.getByLabel('Codigo de Equipo').fill('A-NEW');
  await page.getByLabel('Nombre del Equipo').fill('Synthetic compressor');
  await page.getByLabel('Area').fill('Utilities');
  await page.getByLabel('Fecha de Instalacion').fill('2026-09-24');
  await page.getByRole('button', { name: 'Crear Activo' }).click();

  const createdRow = page
    .getByRole('row')
    .filter({ hasText: 'Synthetic compressor' });
  await expect(createdRow).toBeVisible();
  expect(api.writes()[0]).toMatchObject({
    method: 'POST',
    path: '/assets/',
    company: 'company-a',
    body: {
      code: 'A-NEW',
      installed_at: '2026-09-24T00:00:00.000Z',
    },
  });

  await createdRow.getByRole('button', { name: 'Ver detalle' }).click();
  await page.getByRole('button', { name: 'Editar activo' }).click();
  await expect(
    page.getByRole('heading', { name: 'Editar activo' }),
  ).toBeVisible();
  await page
    .getByLabel('Nombre del Equipo')
    .fill('Synthetic compressor updated');
  await page.getByLabel('Estado').selectOption('operational');
  await page.getByLabel('Costo').fill('2147483647');
  await page.getByRole('button', { name: 'Guardar cambios' }).click();

  await expect(
    page.getByRole('heading', { name: 'Synthetic compressor updated' }),
  ).toBeVisible();
  expect(api.writes()[1]).toMatchObject({
    method: 'PUT',
    company: 'company-a',
    body: {
      name: 'Synthetic compressor updated',
      status: 'operational',
      cost: 2147483647,
    },
  });

  await page.getByRole('button', { name: 'Dar de baja' }).click();
  await page.getByRole('button', { name: 'Confirmar baja' }).click();
  await expect(
    page.getByText('Synthetic compressor updated', { exact: true }),
  ).toHaveCount(0);
  expect(api.writes()[2]).toMatchObject({
    method: 'DELETE',
    company: 'company-a',
  });
});

test('session changes isolate companies and viewer role remains read-only', async ({
  page,
}) => {
  await login(page);
  await expect(
    page.getByText('Synthetic pump A', { exact: true }),
  ).toBeVisible();
  await expect(page.getByText('Synthetic pump B', { exact: true })).toHaveCount(
    0,
  );

  await logout(page);
  await login(page, 'admin-b');
  await expect(
    page.getByText('Synthetic pump B', { exact: true }),
  ).toBeVisible();
  await expect(page.getByText('Synthetic pump A', { exact: true })).toHaveCount(
    0,
  );

  await logout(page);
  await login(page, 'viewer-a');
  await expect(
    page.getByRole('button', { name: '+ Nuevo Activo' }),
  ).toHaveCount(0);
  await page.getByRole('button', { name: 'Ver detalle' }).click();
  await expect(page.getByRole('button', { name: 'Editar activo' })).toHaveCount(
    0,
  );
  await expect(page.getByRole('button', { name: 'Dar de baja' })).toHaveCount(
    0,
  );
});
