# Work orders: fase 2

## Auditoría del mock actual

- El flujo visible vive en `src/app/dashboard/workorders/page.tsx` y
  `src/app/screens2.tsx`.
- `useWorkOrdersStore` persiste órdenes en `sessionStorage`; la pantalla crea
  órdenes localmente y cambia estado localmente.
- El mock usa identificadores incompatibles con el backend real (`EMP001`,
  `A001`, `T001`). El contrato real usa UUID de `companies`, `assets` y
  `users`; no se deben enviar IDs mock a FastAPI.
- La interfaz ya contempla estados, prioridad, tipo, fechas, costo,
  consumibles, historial y evidencias. El primer slice persiste esos datos en
  `work_orders`; la carga de archivos/evidencias queda preparada para una fase
  posterior.

## Contrato backend

Base: `/api/v1/work-orders`.

| Método | Ruta | Permiso | Uso |
| --- | --- | --- | --- |
| GET | `/` | Todos los roles operativos | Listado paginado y filtros |
| GET | `/{id}` | Todos los roles operativos | Detalle tenant-scoped |
| POST | `/` | Admin, superadmin, supervisor, operator, tecnico | Alta |
| PATCH | `/{id}` | Roles de escritura | Edición de campos |
| PATCH | `/{id}/status` | Roles de escritura | Transición validada |
| DELETE | `/{id}` | Admin, superadmin | Baja lógica |
| POST | `/{id}/evidences` | Roles de escritura | Registrar metadata de evidencia |
| DELETE | `/{id}/evidences/{evidence_id}` | Roles de escritura | Quitar metadata de evidencia |

Filtros de listado: `page`, `size`, `status`, `priority`, `asset_id`,
`technician_id`, `created_from`, `created_to` y `search`.

Estados: `nueva`, `asignada`, `en_proceso`, `en_espera`, `completada`,
`cerrada`, `cancelada`. Las transiciones se validan en el service; no se
permite saltar directamente entre estados terminales.

La edición agrega cada campo realmente modificado al historial. Las evidencias
se almacenan como metadata en el JSONB de la orden; la carga binaria al
proveedor de almacenamiento queda separada para no inventar un upload contra
Supabase sin un bucket/staging validado.

## Compatibilidad y fallback

- Sin token, la UI mantiene el store mock actual para no bloquear la navegación
  local existente.
- Con sesión válida y empresa, la página usa TanStack Query y mutaciones contra
  FastAPI.
- Si existe token pero falta una empresa válida, la UI muestra un error y no
  reutiliza el mock; así se evita presentar órdenes de otra sesión o empresa.
- La UI permite editar, eliminar (solo admin/superadmin) y registrar/quitar
  metadata de evidencias; la URL debe provenir del proveedor de almacenamiento.
- Aunque `superadmin` aparece en los permisos, estos endpoints siguen
  requiriendo un `company_id` activo en la sesión; la operación global de
  superadmin queda fuera de este slice.
- No se reemplaza ni se limpia `useWorkOrdersStore` hasta completar aceptación
  real del slice.
