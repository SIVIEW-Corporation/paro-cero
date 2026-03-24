# Plan de Queries SQL (Prisma + PostgreSQL)

## Objetivo

Documentar las queries necesarias para crear las tablas base del sistema de mantenimiento, incluyendo relaciones de llave foranea entre entidades.

> Este documento no incluye implementacion SQL; solo el inventario y proposito de cada query.

## Convenciones sugeridas

- Nombres de tablas en `snake_case`.
- PK con `id` (UUID o string, segun estrategia final).
- FK explicitas con `ON DELETE`/`ON UPDATE` a definir en implementacion.
- Campos de trazabilidad en tablas principales: `created_at`, `updated_at`.

---

## 1) Queries de catalogos y base organizacional

### Q01 - Crear tabla `empresas`

- Proposito: empresa duena de activos, usuarios y operacion.

### Q02 - Crear tabla `usuarios`

- Proposito: usuarios del sistema (admin, supervisor, tecnico).
- FK:
  - `empresa_id -> empresas.id`

## 2) Queries de activos y planes de mantenimiento

### Q03 - Crear tabla `activos`

- Proposito: inventario de equipos.
- FK:
  - `empresa_id -> empresas.id`

### Q04 - Crear tabla `planes_mantenimiento`

- Proposito: planes preventivos/predictivos por activo.
- FK:
  - `empresa_id -> empresas.id`
  - `activo_id -> activos.id`

### Q05 - Crear tabla `plan_mantenimiento_items`

- Proposito: checklist de tareas de cada plan.
- FK:
  - `plan_id -> planes_mantenimiento.id`

## 3) Queries de ordenes de trabajo

### Q06 - Crear tabla `ordenes_trabajo`

- Proposito: ciclo operativo de mantenimiento (nueva, asignada, en proceso, cerrada, etc.).
- FK:
  - `empresa_id -> empresas.id`
  - `activo_id -> activos.id`
  - `tecnico_id -> usuarios.id` (si se modela tecnico como usuario)

### Q07 - Crear tabla `ordenes_trabajo_evidencias`

- Proposito: fotos/documentos adjuntos por OT.
- FK:
  - `orden_trabajo_id -> ordenes_trabajo.id`

### Q08 - Crear tabla `ordenes_trabajo_historial`

- Proposito: bitacora de cambios de estado/campos.
- FK:
  - `orden_trabajo_id -> ordenes_trabajo.id`
  - `usuario_id -> usuarios.id`

### Q09 - Crear tabla `ordenes_trabajo_cierre_tecnico`

- Proposito: firma/cierre tecnico de OT.
- FK:
  - `orden_trabajo_id -> ordenes_trabajo.id`
  - `tecnico_id -> usuarios.id`

### Q10 - Crear tabla `ordenes_trabajo_cierre_admin`

- Proposito: firma/cierre administrativo de OT.
- FK:
  - `orden_trabajo_id -> ordenes_trabajo.id`
  - `admin_id -> usuarios.id`

## 4) Queries de inspecciones (checklists y hallazgos)

### Q11 - Crear tabla `plantillas_checklist`

- Proposito: plantillas reutilizables de inspeccion por activo.
- FK:
  - `empresa_id -> empresas.id`
  - `activo_id -> activos.id`

### Q12 - Crear tabla `plantillas_checklist_items`

- Proposito: items de cada plantilla.
- FK:
  - `plantilla_id -> plantillas_checklist.id`

### Q13 - Crear tabla `checklists`

- Proposito: ejecucion de inspecciones.
- FK:
  - `empresa_id -> empresas.id`
  - `plantilla_id -> plantillas_checklist.id`
  - `activo_id -> activos.id`
  - `responsable_id -> usuarios.id` (si se normaliza el responsable)

### Q14 - Crear tabla `checklist_respuestas`

- Proposito: respuesta por item en cada checklist.
- FK:
  - `checklist_id -> checklists.id`
  - `plantilla_item_id -> plantillas_checklist_items.id`

### Q15 - Crear tabla `hallazgos`

- Proposito: no conformidades detectadas en inspeccion.
- FK:
  - `empresa_id -> empresas.id`
  - `checklist_id -> checklists.id`
  - `activo_id -> activos.id`
  - `ot_id -> ordenes_trabajo.id` (nullable)

## 5) Queries de notificaciones

### Q16 - Crear tabla `notificaciones`

- Proposito: avisos operativos (vencida, proxima, asignada).
- FK:
  - `empresa_id -> empresas.id`
  - `usuario_id -> usuarios.id` (opcional, si seran notificaciones por usuario)

## 6) Queries de integridad e indices

### Q17 - Crear indices de busqueda operativa

- Ejemplos de intencion:
  - `ordenes_trabajo(status, prioridad, tecnico_id, fecha_creacion)`
  - `checklists(estado, fecha, activo_id)`
  - `hallazgos(status, severidad, activo_id)`
  - `notificaciones(leida, fecha)`

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
