export interface BlogArticle {
  slug: string;
  title: string;
  description: string;
  category: string;
  readingTime: string;
  publishedAt: string;
  content: string;
}

export const blogArticles: BlogArticle[] = [
  {
    slug: 'reducir-paros-no-planeados-mantenimiento-industrial',
    title: 'Cómo reducir paros no planeados en mantenimiento industrial',
    description:
      'Una guía práctica para entender por qué ocurren los paros no planeados y cómo reducirlos con trazabilidad, mantenimiento preventivo y control operativo.',
    category: 'Mantenimiento industrial',
    readingTime: '8 min',
    publishedAt: '2026-04-25',
    content: `# Cómo reducir paros no planeados en mantenimiento industrial

Los paros no planeados son uno de los problemas más costosos en una operación industrial.

No solo detienen la producción. También generan:
- pérdidas económicas directas
- retrasos en entregas
- sobrecarga en mantenimiento
- decisiones reactivas

En muchas plantas, estos paros se consideran "normales". Pero en realidad, son el resultado de una operación sin estructura.

## El problema no es la falla, es la falta de control

Un error común es pensar que los paros ocurren únicamente por fallas técnicas.

En la práctica, la mayoría de los paros no planeados se deben a:
- falta de mantenimiento preventivo real
- información dispersa o incompleta
- ausencia de historial técnico
- ejecución inconsistente del mantenimiento
- decisiones sin datos confiables

El problema no es solo que algo falle. Es que no existe un sistema que controle cómo se mantiene.

## Por qué el mantenimiento sigue siendo reactivo

Muchas empresas dicen tener mantenimiento preventivo.

Pero en realidad operan así:
- Se define un plan, pero no se cumple.
- Se generan órdenes, pero no se cierran correctamente.
- Se registran datos, pero no se usan.
- Se repite el mismo problema sin aprendizaje.

Esto convierte el mantenimiento en algo reactivo: se rompe, se repara y se repite.

## Las causas reales de los paros no planeados

### 1. Falta de trazabilidad

No hay claridad sobre:
- qué falló
- cuándo falló
- por qué falló
- qué se hizo

Sin trazabilidad, no hay mejora.

### 2. Activos sin estructura

Los equipos no están organizados correctamente:
- sin criticidad definida
- sin jerarquía
- sin contexto técnico

Esto impide priorizar correctamente.

### 3. Mantenimiento preventivo mal ejecutado

No es que no exista. Es que:
- no se calendariza correctamente
- no se ejecuta a tiempo
- no se ajusta con datos

### 4. Información dispersa

Datos en:
- Excel
- papel
- chats
- memoria de técnicos

No hay una fuente única de verdad.

### 5. Falta de indicadores claros

No se mide:
- cumplimiento de mantenimiento
- backlog
- tiempos de reparación
- frecuencia de fallas

Sin medición, todo es intuición.

## Cómo reducir paros no planeados en la práctica

Reducir paros no es cuestión de "trabajar más". Es cuestión de estructurar la operación.

### 1. Organizar los activos correctamente

Antes de ejecutar mantenimiento, necesitas una base clara:
- inventario completo de equipos
- clasificación por criticidad
- ubicación y jerarquía
- historial técnico

Sin esto, todo lo demás falla.

### 2. Estructurar las órdenes de trabajo

Las órdenes deben tener:
- responsable
- prioridad
- contexto del problema
- evidencia de ejecución

No basta con crear órdenes. Hay que controlar su ciclo completo.

### 3. Implementar mantenimiento preventivo real

No te enfoques solo en "tener planes".

Enfócate en:
- cumplimiento real
- ajuste basado en resultados
- frecuencia adecuada
- equipos críticos primero

### 4. Centralizar la información

Todo debe vivir en un solo sistema:
- activos
- órdenes
- mantenimiento
- historial
- indicadores

Esto elimina la dependencia de personas clave.

### 5. Medir lo que importa

Empieza con pocos KPIs, pero claros:
- cumplimiento de mantenimiento
- backlog
- MTTR
- frecuencia de fallas

Lo importante no es tener muchos datos. Es usar los correctos.

## El cambio real: de reactivo a controlado

Cuando estos elementos se integran, ocurre algo clave:
- el mantenimiento deja de reaccionar
- y empieza a controlar la operación

Esto permite:
- anticipar fallas
- reducir urgencias
- priorizar correctamente
- tomar decisiones con evidencia

## Reducir paros no es un proyecto, es un sistema

Muchas empresas intentan resolver el problema con:
- más personal
- más supervisión
- más reportes

Pero eso no resuelve el problema de fondo.

Reducir paros requiere un sistema que conecte:
- activos
- ejecución
- datos
- decisiones

## Cómo lo aborda PM0

PM0 está diseñado precisamente para estructurar este flujo.

Permite:
- organizar activos con contexto técnico
- estructurar órdenes de trabajo
- ejecutar mantenimiento con control
- generar datos útiles
- medir desempeño operativo

No se trata de registrar lo que pasa. Se trata de controlar cómo pasa.

## Conclusión

Los paros no planeados no son inevitables.

Son el resultado de:
- falta de estructura
- falta de trazabilidad
- falta de control operativo

Cuando el mantenimiento se organiza como un sistema, los paros dejan de ser sorpresa y se convierten en algo gestionable.

---

¿Estás evaluando cómo estructurar tu mantenimiento y reducir paros en tu operación?

- [Ver cómo funciona PM0](/recursos/como-funciona)
- [Solicitar evaluación operativa](/empresa/contacto)`,
  },
];

const blogArticlesMap = new Map(
  blogArticles.map((article) => [article.slug, article]),
);

export function getAllBlogArticleSlugs() {
  return blogArticles.map((article) => article.slug);
}

export function getBlogArticleBySlug(slug: string) {
  return blogArticlesMap.get(slug);
}
