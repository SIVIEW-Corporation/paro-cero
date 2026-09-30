# Auditoría integral de PM0 — 30 de septiembre de 2026

## Veredicto ejecutivo

PM0 tiene una propuesta reconocible, una presentación pública cuidada y una base técnica mejor que un simple prototipo visual. Pero hoy existe una brecha importante entre lo que un comprador podría entender como un SaaS operativo y lo que persiste realmente. **La recomendaría como demo comercial controlada, no todavía como producto listo para vender y operar con datos reales de clientes.** Los riesgos prioritarios no son cosméticos: hay un endpoint con exposición entre empresas, la renovación de sesión parece romperse, el límite de intentos de login no se aplica como se espera y el fallback del frontend permite seguir modificando datos de muestra/locales como si fueran operaciones reales.

No hice cambios a la aplicación, backend ni base de datos. Este archivo es el único entregable nuevo.

## Perspectiva de comprador

### Lo que funciona bien

- El sitio explica el contexto de mantenimiento industrial con una identidad visual coherente y CTA visibles.
- Las rutas públicas del sitemap revisadas respondieron HTTP 200. En móvil (390 px) no observé desbordamiento horizontal en precios ni en la demo del técnico.
- La página de precios comunica dos puntos de entrada en MXN y enlaza a una demo. Para quien vende con asesoría, puede servir como captación de prospectos.
- La ruta pública de demo muestra una buena intención de conversión y la vista del técnico indica claramente que es de prueba y no usa datos reales.

### Lo que hoy frenaría una compra

1. **La demo no entrega lo que promete.** La imagen de vista previa apunta a `/images/hero/paro-cero-hero.jpg`, archivo inexistente; el repositorio tiene la variante `.webp`. El video configurado está vacío y, tras el formulario, se muestra el texto de placeholder “Aquí se mostrará el video final”. No envié el formulario. Corregir el recurso y publicar el video antes de llevar tráfico a esa página.
2. **No queda claro qué es real.** La portada enseña KPIs y resultados operativos específicos sin marcarlos como datos ilustrativos. Etiquetarlos como “datos de ejemplo” o sustituirlos por resultados verificables y contextualizados.
3. **Los planes no son autoservicio.** Ambos CTA llevan a un formulario; no hay alta, pago ni contratación en línea. Aclarar “solicitar cotización/demo” en vez de dar a entender que el usuario ya puede empezar.
4. **Faltan condiciones de compra.** Definir usuarios/sedes incluidos, límites de activos/OT, integraciones, soporte y tiempos de atención, impuestos, periodicidad, cancelación, exportación y propiedad/retención de datos. El paquete de implementación necesita delimitar qué integración y adopción incluye.
5. **Hay borradores legales visibles.** Términos, privacidad y cookies conservan marcadores `[PENDIENTE]` y se describen como borrador. No son confianza suficiente para una compra empresarial ni para cargar datos operativos. Revisarlos con asesoría legal y de privacidad antes de publicarlos como definitivos.
6. **Legibilidad y confianza de marca.** El layout aplica Inter e Inconsolata al mismo `body`, y en la vista inspeccionada prevalece la fuente monoespaciada también en textos corridos. Además, el texto blanco sobre el CTA ámbar medido tiene contraste aproximado de 2.43:1; el texto normal debe alcanzar 4.5:1 bajo WCAG. El sistema de diseño del proyecto ya pide texto oscuro sobre ámbar: conviene alinearlo.
7. **Lenguaje demasiado técnico al inicio.** OT, PM, MTTR y MTBF requieren una explicación sencilla para una persona que recién evalúa el producto.

## Hallazgos técnicos priorizados

### P1 — Resolver antes de usar con clientes y datos reales

| Hallazgo | Evidencia y efecto | Siguiente paso |
|---|---|---|
| **Acceso entre empresas en `GET /api/v1/companies/{company_id}`** | El router exige usuario autenticado, pero no comprueba que el `company_id` solicitado corresponda a su empresa ni que tenga rol superadmin. Una prueba aislada con un usuario de la empresa A y respuesta simulada de B produjo HTTP 200 con el perfil de B: patrón BOLA/IDOR reproducible en la ruta. | Autorizar explícitamente por tenant/rol y devolver 404/403 según convención. Añadir prueba de regresión negativa y positiva por rol. No cargar datos reales hasta corregirlo. |
| **Refresh token probablemente falla por transacción ya iniciada** | `AuthService.refresh()` hace lecturas primero y luego el repositorio llama `AsyncSession.begin()`. SQLAlchemy inicia transacción automáticamente al consultar; reproduje que `begin()` en una sesión con transacción activa falla con `InvalidRequestError`. Los tests existentes no ejercitan este ciclo con una sesión Postgres real. | Definir una sola frontera transaccional de servicio/repositorio y probar refresh y rotación concurrente contra Postgres de prueba; verificar expiración, revocación y que solo una rotación concurrente gane. |
| **Rate limit del login no se aplica correctamente** | El orden de `@limiter.limit` y `@router.post` no coincide con el patrón requerido por SlowAPI. Una prueba local aislada de 10 llamadas al endpoint no recibió 429; el test actual acepta errores 400 y no verifica el límite. | Corregir orden/decoración y probar que la petición excedente responde 429. Configurar un backend compartido de rate-limit en despliegue, no solo memoria por proceso. |
| **Fallback del dashboard confunde demo con operación** | Si falla la API de OT, la pantalla cambia a datos Zustand de muestra; crear/editar/borrar entonces opera localmente, no en el servidor. Hay un aviso, pero el flujo permite seguir y aparenta éxito que no persiste al recargar. Otros módulos (planes, inspecciones, reportes y planificación) también consumen datos locales/mock y no hay APIs equivalentes implementadas. | En modo autenticado, fallar cerrado: error/reintento visible y ninguna mutación local presentada como persistida. Aislar demo en un modo explícito. Decidir y documentar el alcance MVP antes de vender estos módulos como operativos. |
| **Dependencias requieren actualización/triage de seguridad** | La app declara Next.js 16.2.1; el advisory upstream citado afecta versiones 16.0.0–16.2.5 en escenarios de bypass de middleware/proxy por prefetch, con corrección en 16.2.6. El audit de dependencias de producción también reportó 3 críticas, 39 altas y 45 moderadas entre 491 paquetes; el conteo del scanner no equivale a explotabilidad confirmada. | Actualizar Next.js y dependencias afectadas a versiones corregidas, revisar cada advisory/ruta de ejecución y repetir lint, tipos y pruebas en CI antes de desplegar. La severidad reportada exige priorizarlo, no afirmar que cada CVE sea explotable en esta app. |
| **Formulario de demo sin el contenido prometido** | Recurso de imagen roto y video vacío, ver perspectiva de comprador. | Publicar recursos reales, corregir el path y validar el recorrido completo en móvil y desktop. |

La guía de [SlowAPI](https://slowapi.readthedocs.io/en/latest/) especifica el orden del decorador y el registro del limitador en la ruta. El advisory de [Next.js GHSA-26hh-7cqf-hhc6](https://github.com/vercel/next.js/security/advisories/GHSA-26hh-7cqf-hhc6) documenta la corrección de seguridad señalada. El hallazgo de refresh se basa en el flujo inspeccionado y el comportamiento de transacciones descrito en la [documentación de SQLAlchemy](https://docs.sqlalchemy.org/en/20/orm/session_basics.html).

### P2 — Completar antes del lanzamiento comercial

- **Evidencias:** hoy se guarda metadata/URL, no se ofrece una carga real de archivo. Si la promesa incluye evidencia en campo, implementar almacenamiento privado con permisos, límites de tipo/tamaño y URLs firmadas; si no, ajustar el copy.
- **CSV injection:** los exportadores escapan comillas y separadores, pero no neutralizan valores que empiezan con caracteres de fórmula (`=`, `+`, `-`, `@`). Un texto de OT controlado por usuario puede ejecutarse como fórmula al abrir el CSV en una hoja de cálculo. Neutralizarlo y cubrirlo con pruebas; ver [guía OWASP sobre CSV Injection](https://owasp.org/www-community/attacks/CSV_Injection).
- **Datos locales de sesión:** el frontend conserva credenciales/datos de sesión en `localStorage`. Evaluar reducir exposición a XSS y preferir cookies `HttpOnly`, `Secure`, `SameSite` si el diseño de autenticación lo permite.
- **Health check:** `/healthz/db` devuelve `str(e)` en un 503 público. Registrar el detalle internamente y dar una respuesta externa genérica.
- **Permisos de módulos:** el guard del técnico es explícitamente client-only. No reemplaza autorización en servidor. Extender permisos server-side cuando se implementen sus endpoints.
- **Esquema de planes/inspecciones:** existen tablas sin filas y con contratos mínimos, sin `company_id`; no bastan para persistencia multiempresa. Diseñar tenant, relaciones, constraints y políticas antes de conectar UI. No desplegar políticas RLS genéricas sin definir modelo de acceso.
- **Condiciones de privacidad y soporte:** contacto público genérico y marcadores legales restan confianza. Definir canal corporativo real, responsable, tiempos, retención, borrado y exportación.
- **Pruebas end-to-end:** la aceptación autenticada contra stack real está opt-in y no se ejecutó. Crear CI y pruebas de tenant/roles, refresh, errores de API, carga de evidencia y persistencia tras recarga en un staging con fixtures.

### P3 — Rendimiento y endurecimiento

El asesor de base de datos reporta índices de FK pendientes en `assets.company_id`, `users.company_id` y `refresh_tokens.user_id`. Con el volumen observado el impacto inmediato parece limitado; medir consultas y añadir índices de forma planificada. Los índices marcados como “unused” en tablas pequeñas no se deben quitar solo por esa etiqueta. Hay RLS habilitado en las tablas revisadas; en `workorders` la política encontrada deniega acceso a `anon`/`authenticated`, y ausencia de políticas implica denegación por defecto, no exposición automática. Verificar qué rol usa realmente la conexión backend y si puede omitir RLS antes de considerar segura la frontera; si se accede desde navegador, hacen falta políticas tenant específicas. [Documentación de PostgreSQL sobre políticas RLS](https://www.postgresql.org/docs/current/sql-createpolicy.html).

## Backend y base de datos: lo rescatable

- La arquitectura separa Next.js y FastAPI: el navegador llama a la API y no se observó acceso directo del frontend a Supabase. Es una buena frontera para centralizar autorización.
- El backend tiene slices por módulo, validación de payload, paginación, transiciones de estado y alcance por empresa para órdenes. En los registros consultados no aparecieron OT con relaciones de activo/técnico cruzadas entre empresas.
- La base activa y `/healthz/db` respondía 200 durante la revisión. El esquema consultado tenía 1 empresa, 3 usuarios, 7 activos y 226 órdenes; esto es solo un conteo, no una validación de integridad de cada flujo.
- RLS habilitado más no-policy es default-deny para clientes sujetos a RLS, no una prueba de exposición. Confirmar privilegios del usuario SQL de FastAPI y evitar llaves privilegiadas en el cliente.

## Verificaciones realizadas y límites

- Sitemap: 17 rutas públicas inspeccionadas por respuesta HTTP; revisión visual de home y pricing/demo en viewport móvil.
- Calidad local: backend `pytest` 210/210; pruebas unitarias seleccionadas frontend 70/70; TypeScript sin errores; lint sin errores y 25 warnings.
- Seguridad: consultas de base de datos solo lectura; prueba del refresh con token UUID ficticio/sesión read-only y prueba de endpoint de empresa con servicio simulado. No hice escrituras en producción ni envié el formulario.
- **No ejecuté un recorrido autenticado completo:** no se proporcionaron credenciales de prueba. Tampoco hice pentest de infraestructura, revisión de backups/restore, análisis automatizado de accesibilidad en todas las rutas ni prueba de carga.
- No ejecuté build, conforme a las instrucciones del proyecto.

## Orden recomendado para seguir desarrollando

1. Cerrar exposición entre empresas, refresh y rate-limit; actualizar Next y dependencias con pruebas.
2. Decidir qué módulos son parte del MVP real y diseñar su persistencia/RBAC por tenant. Evitar que errores de API conviertan un flujo autenticado en una falsa operación local.
3. Terminar demo, marcar datos ficticios y definir oferta/precios/condiciones con lenguaje de comprador.
4. Cerrar almacenamiento seguro de evidencias, CSV y política de sesión.
5. Publicar legales revisados, soporte y pruebas de aceptación autenticadas en staging antes de abrir a clientes.

## Archivos clave revisados

- `src/components/demo/demo-config.ts` — assets y video de demo.
- `src/app/layout.tsx` y `src/components/landing/button-variants.ts` — tipografía y CTA.
- `src/components/landing/OperationalInsightsSection.tsx` — métricas ilustrativas.
- `src/app/dashboard/workorders/page.tsx` — API real y fallback local.
- `src/app/(footer-pages)/_content/footer-pages.ts` — textos legales.
- `src/utils/exportCsv.ts` y `src/app/screens2.tsx` — exportación CSV.
- Backend `pm0-api/src/modules/company/router.py`, `pm0-api/src/modules/auth/{router.py,service.py,repository.py}` — autorización, rate limit y refresh.
- Base Supabase revisada en modo lectura; evitar guardar aquí secretos o datos de clientes.
