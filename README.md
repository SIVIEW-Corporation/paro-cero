# PM0 / APEX

Aplicación web de gestión de mantenimiento industrial (activos, planes, órdenes de trabajo, inspecciones, notificaciones y reportes) implementada como frontend Next.js con estado local.

## Contexto de naming

- **Repositorio:** `paro-cero`
- **Package npm:** `apex` (ver `package.json`)
- **Producto visible en UI/dominio:** PM0 / APEX (según naming en código y datos mock)

## Estado actual del proyecto

- Arquitectura **client-first** con App Router (`src/app/**/page.tsx`).
- Estado global con **Zustand** (`src/app/stores/*.ts`).
- Datos de negocio desde **mock data** (`src/app/data/mock-data.ts`).
- No se encontraron **API routes** (`src/app/**/route.ts`) ni archivos `*action.ts` en `src/`.
- No hay suite de tests automatizados en el repo (`**/*.{test,spec}.*`, `**/tests/**`).

## Stack real

- Next.js `16.1.6`
- React `19.2.3`
- TypeScript `5`
- Zustand `5.0.9`
- Zod `4.3.4`
- TanStack Query/Form/Table
- Tailwind CSS `4`

> Fuentes: `package.json` y `next.config.ts`.

## Requisitos

- Node.js 20+
- npm 10+

> Nota: las versiones mínimas sugeridas arriba son recomendación operativa. El repositorio no incluye archivo de versionado de runtime (por ejemplo `.nvmrc` o `.node-version`).

## Setup local

```bash
npm install
npm run dev
```

Aplicación en: `http://localhost:3000`

## Scripts disponibles

Scripts tomados 1:1 de `package.json`:

| Script                 | Comando                                 | Propósito                                               |
| ---------------------- | --------------------------------------- | ------------------------------------------------------- |
| `npm run dev`          | `next dev --turbo`                      | Desarrollo local                                        |
| `npm run start`        | `next start`                            | Ejecutar app en modo producción (requiere build previo) |
| `npm run setup:skills` | `./skills/setup.sh`                     | Setup de skills del repositorio                         |
| `npm run format:fix`   | `prettier --write .`                    | Formatear código                                        |
| `npm run format:check` | `prettier --check .`                    | Validar formato                                         |
| `npm run lint`         | `eslint .`                              | Lint del proyecto                                       |
| `npm run lint:fix`     | `eslint . --fix`                        | Corregir lint automáticamente                           |
| `npm run build`        | `npm run lint && next build`            | Build con lint previo                                   |
| `npm run build:fast`   | `next build`                            | Build directo                                           |
| `npm run build:local`  | `npm run format:check && npm run build` | Validación local de formato + build                     |

## Mapa funcional actual (rutas)

Rutas verificadas desde `src/app/**/page.tsx`:

| Ruta             | Archivo                                      | Estado actual                                                   |
| ---------------- | -------------------------------------------- | --------------------------------------------------------------- |
| `/`              | `src/app/(dashboard)/page.tsx`               | Dashboard principal, consume órdenes desde `useWorkOrdersStore` |
| `/assets`        | `src/app/(dashboard)/assets/page.tsx`        | Vista de activos basada en datos de órdenes del store           |
| `/plans`         | `src/app/(dashboard)/plans/page.tsx`         | Pantalla de planes de mantenimiento (`PlansScreen`)             |
| `/workorders`    | `src/app/(dashboard)/workorders/page.tsx`    | Gestión de órdenes con sincronización al store global           |
| `/inspecciones`  | `src/app/(dashboard)/inspecciones/page.tsx`  | Checklists, hallazgos y plantillas desde `useInspeccionesStore` |
| `/notifications` | `src/app/(dashboard)/notifications/page.tsx` | Notificaciones desde `useNotificacionesStore`                   |
| `/reports`       | `src/app/(dashboard)/reports/page.tsx`       | Reportes usando órdenes del store                               |
| `/login`         | `src/app/login/page.tsx`                     | Login mock con usuario local y redirección a `/`                |
| `/rework`        | `src/app/rework/page.tsx`                    | Ruta residual mínima (renderiza un `<div>page</div>`)           |

## Arquitectura actual (resumen)

- App Router con páginas cliente (`'use client'` en la mayoría de rutas funcionales).
- Capa de pantallas desacoplada por módulos (`screens1`, `screens2`, `screens3`).
- Stores de dominio en Zustand:
  - `useWorkOrdersStore` con persistencia en `sessionStorage`.
  - `useInspeccionesStore` con persistencia en `sessionStorage`.
  - `useNotificacionesStore` y `use-auth-store` sin middleware `persist`.

## Limitaciones conocidas

1. **Datos mock:** el dominio se alimenta de `src/app/data/mock-data.ts`.
2. **Persistencia local parcial:** algunos stores persisten en `sessionStorage`, no en backend.
3. **Sin API routes / server actions verificadas en repo:** no se detectaron `route.ts` ni `*action.ts`.
4. **Sin tests automatizados:** no se encontraron archivos de prueba ni carpeta `tests`.

## Roadmap corto (sin fechas comprometidas)

1. Definir contrato de API y migrar dominio principal de mock data a backend real.
2. Introducir autenticación no-mock y manejo de sesión consistente entre stores.
3. Agregar tests automatizados mínimos (unidad + integración de rutas críticas).
4. Revisar y decidir destino de la ruta residual `/rework`.
5. Estandarizar persistencia de estado (qué va en store local vs backend).

## Mantenimiento del README

Para evitar drift entre documentación y código:

1. Si un PR modifica scripts, rutas o arquitectura de estado, actualizar este README.
2. Validar siempre contra estas fuentes de verdad:
   - Scripts/stack: `package.json`
   - Config de Next: `next.config.ts`
   - Rutas: `src/app/**/page.tsx`
   - Datos mock: `src/app/data/mock-data.ts`
   - Stores: `src/app/stores/*.ts`
3. Si una afirmación no se puede verificar en código, documentarla como limitación/TODO y no como hecho.
