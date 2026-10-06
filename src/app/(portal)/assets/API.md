# Assets API

**Base URL**: `/api/v1/assets`

Módulo para gestionar activos industriales (equipos, maquinaria, instalaciones). Soporta CRUD completo, filtros por múltiples criterios, ordenamiento dinámico y control de acceso basado en roles.

---

## Autenticación

Todos los endpoints requieren JWT válido en el header:

```text
Authorization: Bearer <token>
```

El token se obtiene mediante `POST /api/v1/auth/login`.

---

## Roles y permisos

| Rol            | Crear | Editar | Cambiar status     | Eliminar | Listar / Ver            |
| :------------- | :---- | :----- | :----------------- | :------- | :---------------------- |
| **viewer**     | ❌    | ❌     | ✅ (misma empresa) | ❌       | ✅ (misma empresa)      |
| **operator**   | ❌    | ❌     | ✅ (misma empresa) | ❌       | ✅ (misma empresa)      |
| **admin**      | ✅    | ✅     | ✅                 | ✅       | ✅ (misma empresa)      |
| **superadmin** | ✅    | ✅     | ✅                 | ✅       | ✅ (todas las empresas) |

- Usuarios regulares solo ven y operan sobre activos de su propia empresa.
- `superadmin` tiene acceso global a todas las empresas.

---

## Endpoints

### 1. Listar activos

```http
GET /api/v1/assets/
```

#### Query params

| Param          | Tipo     | Default      | Descripción                                                                                            |
| :------------- | :------- | :----------- | :----------------------------------------------------------------------------------------------------- |
| `offset`       | `int`    | `0`          | Registros a saltar (mín 0)                                                                             |
| `limit`        | `int`    | `20`         | Máximo de registros (1-100)                                                                            |
| `sort_by`      | `string` | `created_at` | Campo de orden: `name`, `code`, `area`, `criticality`, `status`, `created_at`                          |
| `sort_order`   | `string` | `desc`       | Dirección: `asc`, `desc`                                                                               |
| `criticality`  | `string` | —            | Filtrar por criticidad: `low`, `medium`, `high`, `critical`                                            |
| `status`       | `string` | —            | Filtrar por estado: `commissioning`, `operational`, `standby`, `maintenance`, `down`, `decommissioned` |
| `area`         | `string` | —            | Filtrar por área (búsqueda parcial, case-insensitive)                                                  |
| `code`         | `string` | —            | Filtrar por código (búsqueda parcial, case-insensitive)                                                |
| `serial`       | `string` | —            | Filtrar por número de serie (búsqueda parcial, case-insensitive)                                       |
| `manufacturer` | `string` | —            | Filtrar por fabricante (búsqueda parcial, case-insensitive)                                            |

#### Ordenamiento por campos de dominio

`criticality` y `status` se ordenan según la semántica del negocio, no alfabéticamente:

| Campo         | `asc`                                                                       | `desc`                                                                      |
| :------------ | :-------------------------------------------------------------------------- | :-------------------------------------------------------------------------- |
| `criticality` | low → medium → high → critical                                              | critical → high → medium → low                                              |
| `status`      | commissioning → operational → standby → maintenance → down → decommissioned | decommissioned → down → maintenance → standby → operational → commissioning |

`name`, `code`, `area`: orden alfabético estándar.

#### Ejemplo

```http
GET /api/v1/assets/?criticality=high&status=operational&sort_by=name&sort_order=asc&limit=10
```

#### Respuesta — 200 OK

```json
{
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Compresor C-300",
      "code": "CMP-C300-001",
      "area": "Planta Norte - Sector A",
      "serial": "SN2024-XC8821",
      "model": "C-300 Pro",
      "manufacturer": "Atlas Copco",
      "cost": 45000,
      "status": "operational",
      "criticality": "high",
      "installed_at": "2024-03-15T10:30:00-06:00",
      "is_active": true,
      "company_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "created_at": "2026-05-09T07:30:00Z",
      "updated_at": null
    }
  ],
  "total": 42,
  "page": 1,
  "size": 10,
  "pages": 5
}
```

#### Errores

| Código | Causa                              |
| :----- | :--------------------------------- |
| `401`  | Token ausente, inválido o expirado |

---

### 2. Obtener activo por ID

```http
GET /api/v1/assets/{asset_id}
```

#### Path params

| Param      | Tipo   | Descripción              |
| :--------- | :----- | :----------------------- |
| `asset_id` | `UUID` | Identificador del activo |

#### Respuesta — 200 OK

Misma estructura que un item del listado (ver sección 1).

#### Errores

| Código | Causa                                                        |
| :----- | :----------------------------------------------------------- |
| `401`  | Token ausente, inválido o expirado                           |
| `404`  | Activo no encontrado o usuario sin acceso (empresa distinta) |

---

### 3. Crear activo

```http
POST /api/v1/assets/
```

**Requiere rol**: `admin` o `superadmin`.

#### Request body

| Campo          | Tipo       | Requerido | Validación                                | Default         |
| :------------- | :--------- | :-------- | :---------------------------------------- | :-------------- |
| `name`         | `string`   | ✅        | 4-100 caracteres                          | —               |
| `area`         | `string`   | ✅        | 1-100 caracteres                          | —               |
| `code`         | `string`   | ✅        | 3-20 caracteres, **único**                | —               |
| `serial`       | `string`   | ❌        | 3-20 caracteres                           | `null`          |
| `model`        | `string`   | ❌        | 3-100 caracteres                          | `null`          |
| `manufacturer` | `string`   | ❌        | 2-100 caracteres                          | `null`          |
| `cost`         | `int`      | ❌        | —                                         | `null`          |
| `status`       | `string`   | ❌        | Ver [Estados](#estados-status)            | `"operational"` |
| `criticality`  | `string`   | ❌        | Ver [Criticidad](#criticidad-criticality) | `"medium"`      |
| `installed_at` | `datetime` | ❌        | ISO 8601 con timezone                     | `null`          |
| `is_active`    | `bool`     | ❌        | —                                         | `true`          |

> ⚠️ **`company_id` NO se envía en el body**. Se asigna automáticamente desde la empresa del usuario autenticado. Cualquier valor enviado es ignorado.

#### Ejemplo mínimo

```json
{
  "name": "Compresor C-300",
  "area": "Planta Norte",
  "code": "CMP-C300-001"
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
  "installed_at": "2024-03-15T10:30:00-06:00",
  "is_active": true
}
```

#### Respuesta — 201 Created

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Compresor Industrial C-300",
  "code": "CMP-C300-001",
  "area": "Planta Norte - Sector A",
  "serial": "SN2024-XC8821",
  "model": "C-300 Pro",
  "manufacturer": "Atlas Copco",
  "cost": 45000,
  "status": "operational",
  "criticality": "high",
  "installed_at": "2024-03-15T10:30:00-06:00",
  "is_active": true,
  "company_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "created_at": "2026-05-09T07:30:00Z",
  "updated_at": null
}
```

#### Errores

| Código | Causa                                                                  |
| :----- | :--------------------------------------------------------------------- |
| `401`  | Token ausente, inválido o expirado                                     |
| `403`  | Usuario sin rol `admin` o `superadmin`                                 |
| `409`  | El `code` ya existe                                                    |
| `422`  | Datos inválidos (campos requeridos, longitudes, valores no permitidos) |

---

### 4. Actualizar activo (completo/parcial)

```http
PATCH /api/v1/assets/{asset_id}
```

**Requiere rol**: `admin` o `superadmin`.

Actualización parcial — solo los campos enviados se modifican. Los campos omitidos conservan su valor actual.

#### Path params

| Param      | Tipo   | Descripción              |
| :--------- | :----- | :----------------------- |
| `asset_id` | `UUID` | Identificador del activo |

#### Request body

Todos los campos son opcionales. Envía solo los que quieras modificar.

| Campo          | Tipo       | Validación                                |
| :------------- | :--------- | :---------------------------------------- |
| `name`         | `string`   | 4-100 caracteres                          |
| `area`         | `string`   | 1-100 caracteres                          |
| `code`         | `string`   | 3-20 caracteres, único                    |
| `serial`       | `string`   | 3-20 caracteres                           |
| `model`        | `string`   | 3-100 caracteres                          |
| `manufacturer` | `string`   | 2-100 caracteres                          |
| `cost`         | `int`      | —                                         |
| `status`       | `string`   | Ver [Estados](#estados-status)            |
| `criticality`  | `string`   | Ver [Criticidad](#criticidad-criticality) |
| `installed_at` | `datetime` | ISO 8601 con timezone                     |
| `is_active`    | `bool`     | —                                         |

#### Ejemplo — cambiar área y criticidad

```json
{
  "area": "Planta Sur - Sector B",
  "criticality": "critical"
}
```

#### Respuesta — 200 OK

Activo completo con los campos actualizados.

#### Errores

| Código | Causa                                                                               |
| :----- | :---------------------------------------------------------------------------------- |
| `401`  | Token ausente, inválido o expirado                                                  |
| `403`  | Usuario sin rol `admin` o `superadmin`                                              |
| `404`  | Activo no encontrado o admin de otra empresa (superadmin no tiene esta restricción) |
| `409`  | El `code` ya existe en otro activo                                                  |
| `422`  | Datos inválidos                                                                     |

---

### 5. Cambiar solo el status

```http
PATCH /api/v1/assets/{asset_id}/status
```

**Requiere**: cualquier usuario autenticado (misma empresa).

Endpoint específico para que operadores y viewers puedan reportar cambios de estado sin poder modificar otros campos del activo.

#### Path params

| Param      | Tipo   | Descripción              |
| :--------- | :----- | :----------------------- |
| `asset_id` | `UUID` | Identificador del activo |

#### Request body

| Campo    | Tipo     | Requerido | Validación                     |
| :------- | :------- | :-------- | :----------------------------- |
| `status` | `string` | ✅        | Ver [Estados](#estados-status) |

#### Ejemplo

```json
{
  "status": "maintenance"
}
```

#### Respuesta — 200 OK

Activo completo con el status actualizado.

#### Errores

| Código | Causa                                          |
| :----- | :--------------------------------------------- |
| `401`  | Token ausente, inválido o expirado             |
| `404`  | Activo no encontrado o usuario de otra empresa |
| `422`  | Status inválido                                |

---

### 6. Eliminar activo (soft-delete)

```http
DELETE /api/v1/assets/{asset_id}
```

**Requiere rol**: `admin` o `superadmin`.

Realiza un soft-delete: el activo no se elimina físicamente, se marca con `deleted_at`. Los activos eliminados no aparecen en listados ni búsquedas.

#### Path params

| Param      | Tipo   | Descripción              |
| :--------- | :----- | :----------------------- |
| `asset_id` | `UUID` | Identificador del activo |

#### Respuesta — 204 No Content

Sin body.

#### Errores

| Código | Causa                                                       |
| :----- | :---------------------------------------------------------- |
| `401`  | Token ausente, inválido o expirado                          |
| `403`  | Usuario sin rol `admin` o `superadmin`                      |
| `404`  | Activo no encontrado, ya eliminado, o admin de otra empresa |

---

## Catálogos

### Estados (`status`)

| Valor            | Significado                  | Cuándo se usa                                |
| :--------------- | :--------------------------- | :------------------------------------------- |
| `commissioning`  | En instalación / calibración | Equipo nuevo, pruebas pre-producción         |
| `operational`    | Operando normalmente         | Funcionamiento estándar                      |
| `standby`        | En espera / respaldo         | Disponible pero sin operar                   |
| `maintenance`    | En mantenimiento             | Siendo intervenido (preventivo o correctivo) |
| `down`           | Fuera de servicio            | Falla imprevista, no operativo               |
| `decommissioned` | Dado de baja                 | Retirado, vendido, desguazado                |

### Criticidad (`criticality`)

| Valor      | Significado                                 |
| :--------- | :------------------------------------------ |
| `low`      | Baja — falla no afecta operaciones críticas |
| `medium`   | Media — falla afecta parcialmente           |
| `high`     | Alta — falla impacta significativamente     |
| `critical` | Crítica — falla detiene operaciones         |

---

## Componentes frontend sugeridos

| Componente                  | Endpoint(s)          | Funcionalidad                                       |
| :-------------------------- | :------------------- | :-------------------------------------------------- |
| `AssetList` / `AssetTable`  | `GET /`              | Tabla paginada con filtros y ordenamiento           |
| `AssetFilters`              | `GET /`              | Filtros por status, criticality, área, código, etc. |
| `AssetDetail` / `AssetView` | `GET /{id}`          | Vista detallada de un activo                        |
| `AssetForm` / `AssetCreate` | `POST /`             | Formulario de creación (admin/superadmin)           |
| `AssetEdit`                 | `PATCH /{id}`        | Formulario de edición (admin/superadmin)            |
| `AssetStatusBadge`          | —                    | Badge visual con color por status                   |
| `AssetCriticalityBadge`     | —                    | Badge visual con color por criticidad               |
| `AssetStatusSelect`         | `PATCH /{id}/status` | Dropdown para cambiar status (todos los roles)      |
| `AssetDeleteConfirm`        | `DELETE /{id}`       | Confirmación antes de eliminar (admin/superadmin)   |
