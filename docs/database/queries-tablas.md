# Plan de Queries SQL (Prisma + PostgreSQL)

## Objetivo

Documentar las queries necesarias para crear las tablas base del sistema de mantenimiento, incluyendo relaciones de llave foranea entre entidades.

> Este documento no incluye implementacion SQL final; define una estructura accionable para construir las migraciones.

## Convenciones base

- Nombres de tablas en `snake_case`.
- PK con `id` (UUID recomendado).
- FK explicitas con `ON DELETE`/`ON UPDATE` a definir en implementacion.
- Trazabilidad sugerida: `created_at`, `updated_at`.
- Soft delete/historico en TODAS las tablas con `activo`:
  - `1` = registro activo.
  - `0` = registro inactivo (no borrar fisicamente).

---

## 1) Queries de catalogos y base organizacional

### Q01 - Crear tabla `empresas`

- Nombre: `empresas`
- Descripcion breve: empresa duena de activos, usuarios y operacion.
- Campos:

| Campo | Tipo sugerido | Nulo | Default | Notas |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | No | `gen_random_uuid()` | PK |
| `nombre` | `varchar(150)` | No | - | nombre comercial |
| `activo` | `smallint` | No | `1` | soft delete/historico (`1` activo, `0` inactivo) |
| `created_at` | `timestamptz` | No | `now()` | auditoria |
| `updated_at` | `timestamptz` | No | `now()` | auditoria |

- Claves:
  - PK: `id`
  - FK: sin FK en esta tabla.

### Q02 - Crear tabla `usuarios`

- Nombre: `usuarios`
- Descripcion breve: usuarios del sistema (admin, supervisor, tecnico).
- Campos:

| Campo | Tipo sugerido | Nulo | Default | Notas |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | No | `gen_random_uuid()` | PK |
| `empresa_id` | `uuid` | No | - | empresa propietaria del usuario |
| `nombre` | `varchar(120)` | No | - | nombre visible |
| `email` | `varchar(180)` | No | - | candidato a unico |
| `rol` | `varchar(50)` | No | - | admin/supervisor/tecnico |
| `activo` | `smallint` | No | `1` | soft delete/historico (`1` activo, `0` inactivo) |
| `created_at` | `timestamptz` | No | `now()` | auditoria |
| `updated_at` | `timestamptz` | No | `now()` | auditoria |

- Claves:
  - PK: `id`
  - FK:
    - `empresa_id -> empresas.id`

## 2) Queries de activos y planes de mantenimiento

### Q03 - Crear tabla `activos`

- Nombre: `activos`
- Descripcion breve: inventario de equipos.
- Campos:

| Campo | Tipo sugerido | Nulo | Default | Notas |
| --- | --- | --- | --- | --- |
| `empresa_id` | `uuid` | No | - | propietario del activo |
| `code` | `varchar(80)` | No | - | codigo interno (candidato a unico por empresa) |
| `nombre` | `varchar(150)` | No | - | nombre del equipo |
| `descripcion` | `text` | Si | - | detalle opcional |
|`Status`| `varchar(50)` | No | - | activo/inactivo/mantenimiento |
|`criticidad`| `varchar(50)` | No | - | alta/media/baja |
|`ubicacion`| `varchar(50)` | No | - | ubicacion del activo |
|`fecha_instalacion`| `timestamptz` | No | - | fecha de instalacion del activo |
|`fecha_compra`| `timestamptz` | No | - | fecha de mantenimiento del activo |



| `activo` | `smallint` | No | `1` | soft delete/historico (`1` activo, `0` inactivo) |
| `created_at` | `timestamptz` | No | `now()` | auditoria |
| `updated_at` | `timestamptz` | No | `now()` | auditoria |
| `id` | `uuid` | No | `gen_random_uuid()` | PK |

- Claves:
  - PK: `id`
  - FK:
    - `empresa_id -> empresas.id`

### Q04 - Crear tabla `planes_mantenimiento`

- Nombre: `planes_mantenimiento`
- Descripcion breve: planes preventivos/predictivos por activo.
- Campos:

| Campo | Tipo sugerido | Nulo | Default | Notas |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | No | `gen_random_uuid()` | PK |
| `empresa_id` | `uuid` | No | - | empresa del plan |
| `activo_id` | `uuid` | No | - | activo relacionado |
| `nombre` | `varchar(150)` | No | - | nombre del plan |
| `frecuencia` | `varchar(50)` | No | - | diaria/semanal/mensual/etc. |
| `activo` | `smallint` | No | `1` | soft delete/historico (`1` activo, `0` inactivo) |
| `created_at` | `timestamptz` | No | `now()` | auditoria |
| `updated_at` | `timestamptz` | No | `now()` | auditoria |

- Claves:
  - PK: `id`
  - FK:
    - `empresa_id -> empresas.id`
    - `activo_id -> activos.id`

### Q05 - Crear tabla `plan_mantenimiento_items`

- Nombre: `plan_mantenimiento_items`
- Descripcion breve: checklist de tareas de cada plan.
- Campos:

| Campo | Tipo sugerido | Nulo | Default | Notas |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | No | `gen_random_uuid()` | PK |
| `plan_id` | `uuid` | No | - | plan padre |
| `titulo` | `varchar(180)` | No | - | tarea a ejecutar |
| `detalle` | `text` | Si | - | instrucciones opcionales |
| `orden` | `integer` | No | `0` | orden visual/ejecucion |
| `activo` | `smallint` | No | `1` | soft delete/historico (`1` activo, `0` inactivo) |
| `created_at` | `timestamptz` | No | `now()` | auditoria |
| `updated_at` | `timestamptz` | No | `now()` | auditoria |

- Claves:
  - PK: `id`
  - FK:
    - `plan_id -> planes_mantenimiento.id`

## 3) Queries de ordenes de trabajo

### Q06 - Crear tabla `ordenes_trabajo`

- Nombre: `ordenes_trabajo`
- Descripcion breve: ciclo operativo de mantenimiento (nueva, asignada, en proceso, cerrada, etc.).
- Campos:

| Campo | Tipo sugerido | Nulo | Default | Notas |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | No | `gen_random_uuid()` | PK |
| `empresa_id` | `uuid` | No | - | empresa duena |
| `activo_id` | `uuid` | No | - | activo intervenido |
| `tecnico_id` | `uuid` | Si | - | tecnico asignado (si se modela como usuario) |
| `folio` | `varchar(80)` | No | - | identificador de OT (candidato a unico) |
| `status` | `varchar(50)` | No | - | nueva/asignada/en_proceso/cerrada |
| `prioridad` | `varchar(30)` | Si | - | baja/media/alta |
| `fecha_creacion` | `timestamptz` | No | `now()` | fecha operativa |
| `activo` | `smallint` | No | `1` | soft delete/historico (`1` activo, `0` inactivo) |
| `created_at` | `timestamptz` | No | `now()` | auditoria |
| `updated_at` | `timestamptz` | No | `now()` | auditoria |

- Claves:
  - PK: `id`
  - FK:
    - `empresa_id -> empresas.id`
    - `activo_id -> activos.id`
    - `tecnico_id -> usuarios.id`

### Q07 - Crear tabla `ordenes_trabajo_evidencias`

- Nombre: `ordenes_trabajo_evidencias`
- Descripcion breve: fotos/documentos adjuntos por OT.
- Campos:

| Campo | Tipo sugerido | Nulo | Default | Notas |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | No | `gen_random_uuid()` | PK |
| `orden_trabajo_id` | `uuid` | No | - | OT relacionada |
| `tipo` | `varchar(40)` | No | - | foto/documento |
| `url` | `text` | No | - | referencia de archivo |
| `activo` | `smallint` | No | `1` | soft delete/historico (`1` activo, `0` inactivo) |
| `created_at` | `timestamptz` | No | `now()` | auditoria |
| `updated_at` | `timestamptz` | No | `now()` | auditoria |

- Claves:
  - PK: `id`
  - FK:
    - `orden_trabajo_id -> ordenes_trabajo.id`

### Q08 - Crear tabla `ordenes_trabajo_historial`

- Nombre: `ordenes_trabajo_historial`
- Descripcion breve: bitacora de cambios de estado/campos.
- Campos:

| Campo | Tipo sugerido | Nulo | Default | Notas |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | No | `gen_random_uuid()` | PK |
| `orden_trabajo_id` | `uuid` | No | - | OT relacionada |
| `usuario_id` | `uuid` | No | - | quien realiza el cambio |
| `cambio` | `text` | No | - | descripcion del cambio |
| `fecha` | `timestamptz` | No | `now()` | momento del evento |
| `activo` | `smallint` | No | `1` | soft delete/historico (`1` activo, `0` inactivo) |
| `created_at` | `timestamptz` | No | `now()` | auditoria |
| `updated_at` | `timestamptz` | No | `now()` | auditoria |

- Claves:
  - PK: `id`
  - FK:
    - `orden_trabajo_id -> ordenes_trabajo.id`
    - `usuario_id -> usuarios.id`

### Q09 - Crear tabla `ordenes_trabajo_cierre_tecnico`

- Nombre: `ordenes_trabajo_cierre_tecnico`
- Descripcion breve: firma/cierre tecnico de OT.
- Campos:

| Campo | Tipo sugerido | Nulo | Default | Notas |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | No | `gen_random_uuid()` | PK |
| `orden_trabajo_id` | `uuid` | No | - | OT cerrada |
| `tecnico_id` | `uuid` | No | - | tecnico que firma |
| `observaciones` | `text` | Si | - | comentario de cierre |
| `fecha_cierre` | `timestamptz` | No | `now()` | fecha de cierre |
| `activo` | `smallint` | No | `1` | soft delete/historico (`1` activo, `0` inactivo) |
| `created_at` | `timestamptz` | No | `now()` | auditoria |
| `updated_at` | `timestamptz` | No | `now()` | auditoria |

- Claves:
  - PK: `id`
  - FK:
    - `orden_trabajo_id -> ordenes_trabajo.id`
    - `tecnico_id -> usuarios.id`

### Q10 - Crear tabla `ordenes_trabajo_cierre_admin`

- Nombre: `ordenes_trabajo_cierre_admin`
- Descripcion breve: firma/cierre administrativo de OT.
- Campos:

| Campo | Tipo sugerido | Nulo | Default | Notas |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | No | `gen_random_uuid()` | PK |
| `orden_trabajo_id` | `uuid` | No | - | OT cerrada |
| `admin_id` | `uuid` | No | - | admin que valida cierre |
| `observaciones` | `text` | Si | - | comentario administrativo |
| `fecha_cierre` | `timestamptz` | No | `now()` | fecha de cierre |
| `activo` | `smallint` | No | `1` | soft delete/historico (`1` activo, `0` inactivo) |
| `created_at` | `timestamptz` | No | `now()` | auditoria |
| `updated_at` | `timestamptz` | No | `now()` | auditoria |

- Claves:
  - PK: `id`
  - FK:
    - `orden_trabajo_id -> ordenes_trabajo.id`
    - `admin_id -> usuarios.id`

## 4) Queries de inspecciones (checklists y hallazgos)

### Q11 - Crear tabla `plantillas_checklist`

- Nombre: `plantillas_checklist`
- Descripcion breve: plantillas reutilizables de inspeccion por activo.
- Campos:

| Campo | Tipo sugerido | Nulo | Default | Notas |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | No | `gen_random_uuid()` | PK |
| `empresa_id` | `uuid` | No | - | empresa propietaria |
| `activo_id` | `uuid` | No | - | activo asociado |
| `nombre` | `varchar(150)` | No | - | nombre plantilla |
| `version` | `integer` | No | `1` | control basico de version |
| `activo` | `smallint` | No | `1` | soft delete/historico (`1` activo, `0` inactivo) |
| `created_at` | `timestamptz` | No | `now()` | auditoria |
| `updated_at` | `timestamptz` | No | `now()` | auditoria |

- Claves:
  - PK: `id`
  - FK:
    - `empresa_id -> empresas.id`
    - `activo_id -> activos.id`

### Q12 - Crear tabla `plantillas_checklist_items`

- Nombre: `plantillas_checklist_items`
- Descripcion breve: items de cada plantilla.
- Campos:

| Campo | Tipo sugerido | Nulo | Default | Notas |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | No | `gen_random_uuid()` | PK |
| `plantilla_id` | `uuid` | No | - | plantilla padre |
| `pregunta` | `text` | No | - | item a responder |
| `orden` | `integer` | No | `0` | orden de presentacion |
| `obligatorio` | `boolean` | No | `true` | respuesta requerida |
| `activo` | `smallint` | No | `1` | soft delete/historico (`1` activo, `0` inactivo) |
| `created_at` | `timestamptz` | No | `now()` | auditoria |
| `updated_at` | `timestamptz` | No | `now()` | auditoria |

- Claves:
  - PK: `id`
  - FK:
    - `plantilla_id -> plantillas_checklist.id`

### Q13 - Crear tabla `checklists`

- Nombre: `checklists`
- Descripcion breve: ejecucion de inspecciones.
- Campos:

| Campo | Tipo sugerido | Nulo | Default | Notas |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | No | `gen_random_uuid()` | PK |
| `empresa_id` | `uuid` | No | - | empresa propietaria |
| `plantilla_id` | `uuid` | No | - | plantilla utilizada |
| `activo_id` | `uuid` | No | - | activo inspeccionado |
| `responsable_id` | `uuid` | Si | - | usuario responsable (si se normaliza) |
| `folio` | `varchar(80)` | No | - | identificador de checklist |
| `estado` | `varchar(50)` | No | - | borrador/en_revision/cerrado |
| `fecha` | `timestamptz` | No | `now()` | fecha de inspeccion |
| `activo` | `smallint` | No | `1` | soft delete/historico (`1` activo, `0` inactivo) |
| `created_at` | `timestamptz` | No | `now()` | auditoria |
| `updated_at` | `timestamptz` | No | `now()` | auditoria |

- Claves:
  - PK: `id`
  - FK:
    - `empresa_id -> empresas.id`
    - `plantilla_id -> plantillas_checklist.id`
    - `activo_id -> activos.id`
    - `responsable_id -> usuarios.id`

### Q14 - Crear tabla `checklist_respuestas`

- Nombre: `checklist_respuestas`
- Descripcion breve: respuesta por item en cada checklist.
- Campos:

| Campo | Tipo sugerido | Nulo | Default | Notas |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | No | `gen_random_uuid()` | PK |
| `checklist_id` | `uuid` | No | - | checklist ejecutado |
| `plantilla_item_id` | `uuid` | No | - | item de plantilla |
| `valor` | `text` | Si | - | respuesta capturada |
| `cumple` | `boolean` | Si | - | resultado del item |
| `activo` | `smallint` | No | `1` | soft delete/historico (`1` activo, `0` inactivo) |
| `created_at` | `timestamptz` | No | `now()` | auditoria |
| `updated_at` | `timestamptz` | No | `now()` | auditoria |

- Claves:
  - PK: `id`
  - FK:
    - `checklist_id -> checklists.id`
    - `plantilla_item_id -> plantillas_checklist_items.id`

### Q15 - Crear tabla `hallazgos`

- Nombre: `hallazgos`
- Descripcion breve: no conformidades detectadas en inspeccion.
- Campos:

| Campo | Tipo sugerido | Nulo | Default | Notas |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | No | `gen_random_uuid()` | PK |
| `empresa_id` | `uuid` | No | - | empresa propietaria |
| `checklist_id` | `uuid` | No | - | checklist origen |
| `activo_id` | `uuid` | No | - | activo relacionado |
| `ot_id` | `uuid` | Si | - | OT vinculada (nullable) |
| `status` | `varchar(50)` | No | - | abierto/en_seguimiento/cerrado |
| `severidad` | `varchar(30)` | No | - | baja/media/alta |
| `descripcion` | `text` | No | - | detalle del hallazgo |
| `activo` | `smallint` | No | `1` | soft delete/historico (`1` activo, `0` inactivo) |
| `created_at` | `timestamptz` | No | `now()` | auditoria |
| `updated_at` | `timestamptz` | No | `now()` | auditoria |

- Claves:
  - PK: `id`
  - FK:
    - `empresa_id -> empresas.id`
    - `checklist_id -> checklists.id`
    - `activo_id -> activos.id`
    - `ot_id -> ordenes_trabajo.id`

## 5) Queries de notificaciones

### Q16 - Crear tabla `notificaciones`

- Nombre: `notificaciones`
- Descripcion breve: avisos operativos (vencida, proxima, asignada).
- Campos:

| Campo | Tipo sugerido | Nulo | Default | Notas |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | No | `gen_random_uuid()` | PK |
| `empresa_id` | `uuid` | No | - | empresa propietaria |
| `usuario_id` | `uuid` | Si | - | destinatario (opcional) |
| `titulo` | `varchar(180)` | No | - | asunto de notificacion |
| `mensaje` | `text` | No | - | contenido |
| `leida` | `boolean` | No | `false` | estado de lectura |
| `fecha` | `timestamptz` | No | `now()` | fecha de emision |
| `activo` | `smallint` | No | `1` | soft delete/historico (`1` activo, `0` inactivo) |
| `created_at` | `timestamptz` | No | `now()` | auditoria |
| `updated_at` | `timestamptz` | No | `now()` | auditoria |

- Claves:
  - PK: `id`
  - FK:
    - `empresa_id -> empresas.id`
    - `usuario_id -> usuarios.id`

## 6) Queries de integridad e indices

### Q17 - Crear indices de busqueda operativa

- Ejemplos de intencion:
  - `ordenes_trabajo(status, prioridad, tecnico_id, fecha_creacion, activo)`
  - `checklists(estado, fecha, activo_id, activo)`
  - `hallazgos(status, severidad, activo_id, activo)`
  - `notificaciones(leida, fecha, activo)`

### Q18 - Crear constraints unicas

- Ejemplos de intencion:
  - `usuarios.email` unico por sistema o por empresa.
  - `activos.code` unico por empresa.
  - `ordenes_trabajo.folio` unico.
  - `checklists.folio` unico.

## Mapa de relaciones (resumen)

- `empresas` 1:N `usuarios`
- `empresas` 1:N `activos`
- `activos` 1:N `planes_mantenimiento`
- `planes_mantenimiento` 1:N `plan_mantenimiento_items`
- `activos` 1:N `ordenes_trabajo`
- `usuarios` 1:N `ordenes_trabajo` (asignacion tecnico)
- `ordenes_trabajo` 1:N `ordenes_trabajo_evidencias`
- `ordenes_trabajo` 1:N `ordenes_trabajo_historial`
- `activos` 1:N `plantillas_checklist`
- `plantillas_checklist` 1:N `plantillas_checklist_items`
- `plantillas_checklist` 1:N `checklists`
- `checklists` 1:N `checklist_respuestas`
- `checklists` 1:N `hallazgos`
- `hallazgos` N:1 `ordenes_trabajo` (opcional)
- `empresas` 1:N `notificaciones`

## Notas para implementacion futura en Prisma

- Convertir enums de dominio a `enum` de Prisma (estado OT, criticidad, severidad, etc.).
- Definir estrategia para IDs (`uuid()` recomendado).
- Evitar duplicar campos denormalizados (`activoCode`, `activoName`, etc.) salvo que se requiera snapshot historico.
- Definir reglas de cascada por entidad antes de migraciones (`Restrict`, `Cascade`, `SetNull`).
- Estandarizar filtros por `activo = 1` en consultas operativas para excluir historicos.
