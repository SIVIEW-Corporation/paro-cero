# Assets API

**Base URL**: `/api/v1/assets`

Módulo para gestionar activos industriales (equipos, maquinaria, instalaciones). Soporta listado paginado con filtros, consulta por ID, creación, actualización parcial y eliminación lógica (soft-delete), con control de acceso basado en roles y aislamiento por empresa.

Contrato copiado del backend (`pm0-api`, `src/modules/assets/API.md`). Ante cualquier diferencia, el backend es la fuente de verdad.

---

## Autenticación

Todos los endpoints requieren JWT válido en el header:

```text
Authorization: Bearer <token>
```

El token se obtiene mediante `POST /api/v1/auth/login`.

| Código | Causa                                       | `detail`                      |
| :----- | :------------------------------------------ | :---------------------------- |
| `401`  | Header `Authorization` ausente              | `"Not authenticated"`         |
| `401`  | Token inválido, expirado o sin `sub`/`role` | `"Token inválido o expirado"` |
| `403`  | Usuario inactivo                            | `"Usuario inactivo"`          |

---

## Roles y permisos

| Rol                                         | Listar / Ver    | Crear | Editar | Eliminar |
| :------------------------------------------ | :-------------- | :---- | :----- | :------- |
| **superadmin**                              | ✅ (su empresa) | ✅    | ✅     | ✅       |
| **admin** (Supervisor)                      | ✅ (su empresa) | ✅    | ✅     | ✅       |
| **operator** (Operador), **viewer** (Visor) | ✅ (su empresa) | ❌    | ❌     | ❌       |

- Todas las operaciones están limitadas a la empresa (`company_id`) del usuario autenticado, **incluido `superadmin`**. No existe acceso global a otras empresas desde este módulo.
- Si el usuario no pertenece a ninguna empresa (`company_id` nulo), todos los endpoints responden `403` con `detail: "El usuario no pertenece a una empresa"`, sin importar el rol.
- Un rol sin permiso de escritura recibe `403` con `detail: "No tienes permisos para realizar esta acción"`. En `POST`, `PUT` y `DELETE` el rol se verifica **antes** de validar el body y los parámetros, por lo que un rol de solo lectura recibe `403` aunque envíe datos inválidos (en lugar de `422`). La única excepción es un body que no es JSON válido, que se rechaza con `422` antes de verificar el rol.
- Un activo de otra empresa se trata como inexistente (`404`); la respuesta no revela que exista en otra empresa.

---

## Formato de errores

Los errores de dominio y de autorización devuelven:

```json
{ "detail": "Asset with id 550e8400-e29b-41d4-a716-446655440000 not found" }
```

Los errores de validación (`422`) usan el formato estándar de FastAPI/Pydantic (`detail` es una lista de errores por campo).

---

## Endpoints

### 1. Listar activos

```http
GET /api/v1/assets/
```

**Requiere**: cualquier usuario autenticado con empresa.

Devuelve solo activos **activos** (`is_active = true` y `deleted_at = null`) de la empresa del usuario, ordenados por `created_at` descendente (más recientes primero). El orden no es configurable.

#### Query params

| Param         | Tipo     | Default | Descripción                                                                                                                              |
| :------------ | :------- | :------ | :--------------------------------------------------------------------------------------------------------------------------------------- |
| `page`        | `int`    | `1`     | Número de página (mín 1)                                                                                                                 |
| `size`        | `int`    | `20`    | Elementos por página (1-100)                                                                                                             |
| `criticality` | `string` | —       | Filtro por coincidencia exacta. Valores del catálogo: `low`, `medium`, `high`, `critical`                                                |
| `status`      | `string` | —       | Filtro por coincidencia exacta. Valores del catálogo: `commissioning`, `operational`, `standby`, `maintenance`, `down`, `decommissioned` |

> Los filtros `criticality` y `status` se validan contra el catálogo (sensible a mayúsculas): un valor desconocido o vacío devuelve `422`. Un `page` o `size` fuera de rango también devuelve `422`.

#### Ejemplo

```http
GET /api/v1/assets/?criticality=high&status=operational&page=1&size=10
```

#### Respuesta — 200 OK

```json
{
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Compresor C-300",
      "area": "Planta Norte - Sector A",
      "code": "CMP-C300-001",
      "serial": "SN2024-XC8821",
      "model": "C-300 Pro",
      "manufacturer": "Atlas Copco",
      "cost": 45000,
      "criticality": "high",
      "status": "operational",
      "installed_at": "2024-03-15T16:30:00Z",
      "company_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "is_active": true,
      "created_at": "2026-05-09T07:30:00Z",
      "updated_at": null,
      "deleted_at": null
    }
  ],
  "total": 42,
  "page": 1,
  "size": 10,
  "pages": 5
}
```

`pages` = `ceil(total / size)`, o `0` cuando `total` es `0`.

#### Errores

| Código | Causa                                                                      |
| :----- | :------------------------------------------------------------------------- |
| `401`  | Token ausente, inválido o expirado                                         |
| `403`  | Usuario inactivo o sin empresa                                             |
| `422`  | `page` o `size` fuera de rango, o `criticality`/`status` fuera de catálogo |

---

### 2. Obtener activo por ID

```http
GET /api/v1/assets/{asset_id}
```

**Requiere**: cualquier usuario autenticado con empresa.

Devuelve **únicamente los datos principales del activo** (los mismos campos que un item del listado). No incluye entidades relacionadas: órdenes de trabajo, planes de mantenimiento ni inspecciones deben consultarse en sus propios módulos. Es el endpoint que alimenta la página de detalle del activo en el frontend.

#### Path params

| Param      | Tipo   | Descripción              |
| :--------- | :----- | :----------------------- |
| `asset_id` | `UUID` | Identificador del activo |

#### Respuesta — 200 OK

Misma estructura que un item del listado (ver sección 1).

#### Errores

| Código | Causa                                                                                        |
| :----- | :------------------------------------------------------------------------------------------- |
| `401`  | Token ausente, inválido o expirado                                                           |
| `403`  | Usuario inactivo o sin empresa                                                               |
| `404`  | Activo inexistente, de otra empresa, inactivo o eliminado (`"Asset with id <id> not found"`) |
| `422`  | `asset_id` no es un UUID válido                                                              |

---

### 3. Crear activo

```http
POST /api/v1/assets/
```

**Requiere rol**: `admin` o `superadmin`.

#### Request body

| Campo          | Tipo               | Requerido | Validación                                                                          | Default           |
| :------------- | :----------------- | :-------- | :---------------------------------------------------------------------------------- | :---------------- |
| `name`         | `string`           | ✅        | 1-100 caracteres; no acepta solo espacios                                           | —                 |
| `area`         | `string`           | ✅        | 1-100 caracteres; no acepta solo espacios                                           | —                 |
| `code`         | `string`           | ✅        | 1-20 caracteres; no acepta solo espacios; **único dentro de la empresa** (ver nota) | —                 |
| `criticality`  | `string`           | ✅        | Ver [Criticidad](#criticidad-criticality)                                           | —                 |
| `status`       | `string`           | ❌        | Ver [Estados](#estados-status)                                                      | `"commissioning"` |
| `serial`       | `string \| null`   | ❌        | Máx 20 caracteres                                                                   | `null`            |
| `model`        | `string \| null`   | ❌        | Máx 100 caracteres                                                                  | `null`            |
| `manufacturer` | `string \| null`   | ❌        | Máx 100 caracteres                                                                  | `null`            |
| `cost`         | `int \| null`      | ❌        | Entero de 0 a 2147483647                                                            | `null`            |
| `installed_at` | `datetime \| null` | ❌        | ISO 8601 (se recomienda incluir zona horaria)                                       | `null`            |

> **Unicidad de `code`**: un mismo `code` puede existir en empresas distintas, pero no dos veces en la misma empresa. Los activos eliminados (soft-delete) conservan su `code`, por lo que no puede reutilizarse dentro de la empresa. Los valores de texto se guardan tal como se envían (no se recortan espacios).

> ⚠️ **`company_id`, `is_active`, `deleted_at`, `id` y timestamps NO se envían en el body**. Cualquier campo no listado se ignora. `company_id` se asigna desde la empresa del usuario autenticado y el activo se crea con `is_active = true`.

#### Ejemplo mínimo

```json
{
  "name": "Compresor C-300",
  "area": "Planta Norte",
  "code": "CMP-C300-001",
  "criticality": "medium"
}
```

#### Ejemplo completo

```json
{
  "name": "Compresor Industrial C-300",
  "area": "Planta Norte - Sector A",
  "code": "CMP-C300-001",
  "serial": "SN2024-XC8821",
  "model": "C-300 Pro",
  "manufacturer": "Atlas Copco",
  "cost": 45000,
  "status": "operational",
  "criticality": "high",
  "installed_at": "2024-03-15T10:30:00-06:00"
}
```

#### Respuesta — 201 Created

Activo completo, con la misma estructura que un item del listado (ver sección 1).

#### Errores

| Código | Causa                                                                                                                                                                       |
| :----- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `401`  | Token ausente, inválido o expirado                                                                                                                                          |
| `403`  | Usuario inactivo, sin rol `admin`/`superadmin`, o sin empresa                                                                                                               |
| `409`  | El `code` ya existe en otro activo de la empresa, incluidos eliminados (`"Asset with code '<code>' already exists"`); no revela datos de otras empresas                     |
| `422`  | Datos inválidos (campos requeridos, solo espacios, longitudes, valores fuera de catálogo, `cost` fuera de rango). Solo para `admin`/`superadmin`: otros roles reciben `403` |

---

### 4. Actualizar activo (parcial)

```http
PUT /api/v1/assets/{asset_id}
```

**Requiere rol**: `admin` o `superadmin`.

Aunque el método es `PUT`, la actualización es **parcial**: solo se modifican los campos enviados; los omitidos conservan su valor actual. `updated_at` se actualiza automáticamente. Solo se pueden editar activos activos de la empresa del usuario.

#### Path params

| Param      | Tipo   | Descripción              |
| :--------- | :----- | :----------------------- |
| `asset_id` | `UUID` | Identificador del activo |

#### Request body

Todos los campos son opcionales, pero se debe enviar **al menos uno** de los campos de la tabla (un body vacío devuelve `422`).

| Campo          | Tipo               | Validación                                                                     |
| :------------- | :----------------- | :----------------------------------------------------------------------------- |
| `name`         | `string`           | 1-100 caracteres; no acepta `null` ni solo espacios                            |
| `area`         | `string`           | 1-100 caracteres; no acepta `null` ni solo espacios                            |
| `code`         | `string`           | 1-20 caracteres, único dentro de la empresa; no acepta `null` ni solo espacios |
| `criticality`  | `string`           | Ver [Criticidad](#criticidad-criticality); no acepta `null`                    |
| `status`       | `string`           | Ver [Estados](#estados-status); no acepta `null`                               |
| `serial`       | `string \| null`   | Máx 20 caracteres; `null` limpia el valor                                      |
| `model`        | `string \| null`   | Máx 100 caracteres; `null` limpia el valor                                     |
| `manufacturer` | `string \| null`   | Máx 100 caracteres; `null` limpia el valor                                     |
| `cost`         | `int \| null`      | Entero de 0 a 2147483647; `null` limpia el valor                               |
| `installed_at` | `datetime \| null` | ISO 8601; `null` limpia el valor                                               |

> `company_id`, `is_active` y `deleted_at` no se pueden modificar por este endpoint: si se envían, se ignoran. Para dar de baja un activo usa `DELETE` (sección 5) o cambia su `status` a `decommissioned`.

#### Ejemplo — cambiar área y criticidad

```json
{
  "area": "Planta Sur - Sector B",
  "criticality": "critical"
}
```

#### Ejemplo — cambiar solo el status

```json
{
  "status": "maintenance"
}
```

#### Respuesta — 200 OK

Activo completo con los campos actualizados (misma estructura que un item del listado).

#### Errores

| Código | Causa                                                                                                                          |
| :----- | :----------------------------------------------------------------------------------------------------------------------------- |
| `401`  | Token ausente, inválido o expirado                                                                                             |
| `403`  | Usuario inactivo, sin rol `admin`/`superadmin`, o sin empresa                                                                  |
| `404`  | Activo inexistente, de otra empresa, inactivo o eliminado                                                                      |
| `409`  | El `code` ya existe en otro activo de la empresa, incluidos eliminados                                                         |
| `422`  | Datos inválidos, body vacío, o `null`/vacío en un campo obligatorio. Solo para `admin`/`superadmin`: otros roles reciben `403` |

---

### 5. Eliminar activo (soft-delete)

```http
DELETE /api/v1/assets/{asset_id}
```

**Requiere rol**: `admin` o `superadmin`.

Realiza un soft-delete: el activo no se elimina físicamente; se marca con `is_active = false`, `deleted_at` y `updated_at` con la fecha actual. Los activos eliminados no aparecen en el listado, no se pueden consultar por ID ni editar, y eliminarlos de nuevo devuelve `404`.

#### Path params

| Param      | Tipo   | Descripción              |
| :--------- | :----- | :----------------------- |
| `asset_id` | `UUID` | Identificador del activo |

#### Respuesta — 204 No Content

Sin body.

#### Errores

| Código | Causa                                                         |
| :----- | :------------------------------------------------------------ |
| `401`  | Token ausente, inválido o expirado                            |
| `403`  | Usuario inactivo, sin rol `admin`/`superadmin`, o sin empresa |
| `404`  | Activo inexistente, de otra empresa, inactivo o ya eliminado  |

---

## Catálogos

### Estados (`status`)

| Valor            | Significado                  | Cuándo se usa                                                     |
| :--------------- | :--------------------------- | :---------------------------------------------------------------- |
| `commissioning`  | En instalación / calibración | Equipo nuevo, pruebas pre-producción (valor por defecto al crear) |
| `operational`    | Operando normalmente         | Funcionamiento estándar                                           |
| `standby`        | En espera / respaldo         | Disponible pero sin operar                                        |
| `maintenance`    | En mantenimiento             | Siendo intervenido (preventivo o correctivo)                      |
| `down`           | Fuera de servicio            | Falla imprevista, no operativo                                    |
| `decommissioned` | Dado de baja                 | Retirado, vendido, desguazado                                     |

### Criticidad (`criticality`)

| Valor      | Significado                                 |
| :--------- | :------------------------------------------ |
| `low`      | Baja — falla no afecta operaciones críticas |
| `medium`   | Media — falla afecta parcialmente           |
| `high`     | Alta — falla impacta significativamente     |
| `critical` | Crítica — falla detiene operaciones         |

---

## Integración en el portal (`/assets`)

Este módulo del frontend (`src/app/(portal)/assets/`) es autocontenido y no depende del flujo legado `/dashboard/assets`.

| Pieza                     | Archivo                                                                                                          | Endpoint(s)                                                 |
| :------------------------ | :--------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------- |
| Tipos y catálogos         | `types.ts`                                                                                                       | —                                                           |
| Servicio HTTP             | `services/assets-service.ts`                                                                                     | `GET /`, `GET /{id}`, `POST /`, `PUT /{id}`, `DELETE /{id}` |
| Consultas                 | `hooks/use-assets-query.ts` (`useAssetsQuery`, `useAssetQuery`)                                                  | `GET /`, `GET /{id}`                                        |
| Mutaciones                | `hooks/use-create-asset-mutation.ts`, `hooks/use-update-asset-mutation.ts`, `hooks/use-delete-asset-mutation.ts` | `POST /`, `PUT /{id}`, `DELETE /{id}`                       |
| Validación de formularios | `lib/new-asset-schema.ts`                                                                                        | —                                                           |
| Construcción de payloads  | `lib/asset-payload.ts`                                                                                           | `POST /`, `PUT /{id}`                                       |
| Listado con filtros       | `components/AssetsTable.tsx`                                                                                     | `GET /`                                                     |
| Detalle                   | `[id]/page.tsx` + `components/AssetDetail.tsx`                                                                   | `GET /{id}`                                                 |

Reglas que aplica el frontend:

- El listado envía solo `page`, `size`, `criticality` y `status`. No hay ordenamiento configurable ni filtros por área, código, serial o fabricante.
- `company_id` e `is_active` nunca se envían; el servicio descarta cualquier campo fuera del contrato.
- Los textos se recortan (`trim`) antes de enviarse y los campos opcionales vacíos se envían como `null`.
- La edición envía solo los campos modificados mediante `PUT`; si no hay cambios, no se hace la petición.
- `installed_at` se envía como medianoche UTC (`YYYY-MM-DDT00:00:00.000Z`) para que el día no cambie por la zona horaria del navegador.
- La página de detalle valida que el `id` sea un UUID antes de consultar; un `id` inválido se muestra como "no encontrado".
- Los errores se traducen por código HTTP (`401`, `403`, `404`, `409`, `422`) y el error expone `status` para que la UI distinga casos. Un `409` se muestra en el campo `code`.
- Las acciones de crear, editar y eliminar solo se muestran a `admin` y `superadmin`.
- Las claves de caché de React Query se separan por sesión (usuario, empresa, rol), para no mezclar datos entre sesiones.

### Pruebas

```bash
pnpm test:portal-assets:unit
```
