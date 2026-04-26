export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  readTime: string;
  body: string[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'como-reducir-backlog-mantenimiento',
    title: 'Cómo reducir backlog de mantenimiento sin apagar la operación',
    excerpt:
      'Estrategia práctica para priorizar trabajo pendiente con foco en riesgo, criticidad y cumplimiento real.',
    publishedAt: '2026-03-18',
    readTime: '6 min',
    body: [
      'Cuando el backlog crece, la primera reacción suele ser correr más rápido. El problema es que acelerar sin priorización aumenta la deuda operativa y crea más urgencias.',
      'La salida sostenible es clasificar trabajo por impacto en continuidad, seguridad y costo. Eso permite separar tareas críticas de tareas importantes pero postergables.',
      'Con PM0, los equipos conectan criticidad de activos, estado de órdenes y cumplimiento preventivo para decidir semanalmente con datos, no con presión del momento.',
    ],
  },
  {
    slug: 'kpis-clave-mantenimiento-industrial',
    title: '5 KPIs clave para mantenimiento industrial en 2026',
    excerpt:
      'Una guía concreta para leer desempeño operativo y evitar decisiones basadas en percepción.',
    publishedAt: '2026-02-07',
    readTime: '5 min',
    body: [
      'Los KPIs más útiles son los que habilitan decisiones. Cumplimiento PM, tamaño de backlog, tiempo medio de reparación y recurrencia de fallas forman una base robusta.',
      'No alcanza con mirar el valor final. La tendencia por área y por turno revela dónde se rompe la ejecución diaria.',
      'Un tablero efectivo muestra contexto y permite pasar de reporte a acción: qué se corrige, quién lo toma y cuándo se revisa el impacto.',
    ],
  },
  {
    slug: 'adopcion-digital-planta-en-90-dias',
    title: 'Adopción digital en planta: hoja de ruta de 90 días',
    excerpt:
      'Pasos para implementar una plataforma de mantenimiento sin frenar el ritmo productivo.',
    publishedAt: '2026-01-22',
    readTime: '7 min',
    body: [
      'Una implementación exitosa no depende de cargar todo el sistema en una semana. Depende de definir un alcance inicial pequeño, medible y operativo.',
      'En 90 días, el foco está en tres hitos: activos críticos bien definidos, flujo OT trazable y rutina de revisión de indicadores.',
      'Ese enfoque por etapas reduce resistencia, genera resultados tempranos y crea confianza para ampliar cobertura en siguientes ciclos.',
    ],
  },
];

export function getPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
