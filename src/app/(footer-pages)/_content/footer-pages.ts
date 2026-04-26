export interface FooterPageReference {
  label: string;
  href: string;
}

export interface FooterPageSection {
  title: string;
  description: string;
  bullets: string[];
  note?: string;
}

export interface FooterPageCta {
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
}

export interface FooterPageContent {
  slug: [string, string];
  category: 'Producto' | 'Recursos' | 'Empresa' | 'Legal';
  title: string;
  subtitle: string;
  intro: string;
  sections: FooterPageSection[];
  industrialUseCases: string[];
  pm0Connection: string[];
  cta: FooterPageCta;
  references: FooterPageReference[];
  placeholders?: string[];
  legalNotice?: string;
  customTemplate?:
    | 'como-funciona'
    | 'guia-de-implementacion'
    | 'preguntas-frecuentes'
    | 'sobre-paro-cero';
}

const commonCta: FooterPageCta = {
  title: 'Llevemos PM0 a tu operación real',
  description:
    'Te ayudamos a priorizar activos críticos, ordenar la ejecución diaria y definir una adopción por etapas medible.',
  primaryLabel: 'Solicitar demo',
  primaryHref: '/demo',
  secondaryLabel: 'Contactar a Paro Cero',
  secondaryHref: '/empresa/contacto',
};

const legalCta: FooterPageCta = {
  title: 'Necesitás revisar condiciones legales con tu equipo?',
  description:
    'Compartimos estos textos como base editable para acelerar revisiones internas antes de una publicación formal.',
  primaryLabel: 'Contactar a Paro Cero',
  primaryHref: '/empresa/contacto',
  secondaryLabel: 'Ver guía de implementación',
  secondaryHref: '/recursos/guia-de-implementacion',
};

const productReferences: FooterPageReference[] = [
  {
    label: 'ISO 55000: Asset management principles and vocabulary',
    href: 'https://www.iso.org/standard/55088.html',
  },
  {
    label: 'ISO 14224: Reliability and maintenance data collection',
    href: 'https://www.iso.org/standard/68545.html',
  },
  {
    label: 'SMRP: Maintenance and reliability metrics',
    href: 'https://smrp.org/',
  },
];

const resourcesReferences: FooterPageReference[] = [
  {
    label: 'SMRP Body of Knowledge',
    href: 'https://smrp.org/page/BOK',
  },
  {
    label: 'FHWA Asset Management Overview',
    href: 'https://www.fhwa.dot.gov/asset/assetmgmt.cfm',
  },
  {
    label: 'OSHA 29 CFR 1910 (General Industry)',
    href: 'https://www.osha.gov/laws-regs/regulations/standardnumber/1910',
  },
];

const legalReferences: FooterPageReference[] = [
  {
    label: 'AAIP Argentina - Ley 25.326 (datos personales)',
    href: 'https://www.argentina.gob.ar/aaip/datospersonales',
  },
  {
    label: 'Reglamento (UE) 2016/679 - GDPR',
    href: 'https://eur-lex.europa.eu/eli/reg/2016/679/oj',
  },
  {
    label: 'Directive 2002/58/EC (ePrivacy)',
    href: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=celex%3A32002L0058',
  },
];

export const footerPages: FooterPageContent[] = [
  {
    slug: ['producto', 'gestion-de-activos'],
    category: 'Producto',
    title: 'Gestión de activos',
    subtitle:
      'Inventario técnico y trazabilidad completa para decidir mantenimiento con evidencia',
    intro:
      'PM0 centraliza información técnica, criticidad e historial por activo para que mantenimiento y operación trabajen sobre una sola fuente confiable.',
    sections: [
      {
        title: 'Qué resuelve y por qué importa',
        description:
          'Evita decisiones reactivas basadas en memoria o planillas dispersas, especialmente en plantas con equipos críticos y alto costo de paro.',
        bullets: [
          'Inventario técnico estructurado por planta, línea, área y jerarquía funcional.',
          'Trazabilidad de intervenciones, fallas e inspecciones por activo.',
          'Contexto operativo visible para reducir diagnósticos incompletos.',
        ],
      },
      {
        title: 'Valor operativo y beneficios',
        description:
          'Mejora la planificación al conectar criticidad, condición real e historial de trabajo sobre cada equipo.',
        bullets: [
          'Priorización por riesgo e impacto operativo en continuidad productiva.',
          'Soporte para decidir reparación, reemplazo u overhaul con datos.',
          'Menos retrabajo por pérdida de información entre turnos y áreas.',
        ],
      },
      {
        title: 'Enfoque específico PM0',
        description:
          'La gestión de activos es la base para decisiones de mantenimiento industrial sostenibles.',
        bullets: [
          'Clasificación de criticidad para alinear recursos con riesgo real.',
          'Historial técnico auditable para aprendizaje y mejora continua.',
          'Datos consistentes para alimentar preventivo, órdenes y reportes.',
        ],
      },
    ],
    industrialUseCases: [
      'Plantas con equipos compartidos entre líneas donde se pierde trazabilidad por cambios de contexto operativo.',
      'Operaciones que necesitan justificar inversiones en activos de alta criticidad.',
      'Sitios con rotación de personal que requieren estandarización del conocimiento técnico.',
    ],
    pm0Connection: [
      'En PM0, cada activo conecta órdenes de trabajo, planes preventivos e indicadores en un mismo hilo operativo.',
      'La criticidad visible ayuda a asignar prioridades sin depender de urgencias del día a día.',
    ],
    cta: commonCta,
    references: productReferences,
  },
  {
    slug: ['producto', 'ordenes-de-trabajo'],
    category: 'Producto',
    title: 'Órdenes de trabajo',
    subtitle:
      'Ejecución y cierre disciplinado de tareas con responsables, prioridades y evidencia',
    intro:
      'PM0 ordena el ciclo completo de una OT para transformar solicitudes en ejecución trazable, medible y útil para la mejora operativa.',
    sections: [
      {
        title: 'Qué resuelve y por qué importa',
        description:
          'Estandariza el trabajo de mantenimiento para evitar demoras, ambigüedad de responsabilidades y cierres sin información técnica suficiente.',
        bullets: [
          'Flujo definido desde creación, asignación, ejecución y cierre.',
          'Responsables claros por rol, especialidad y turno operativo.',
          'Priorización por criticidad, seguridad e impacto en producción.',
        ],
      },
      {
        title: 'Valor operativo y beneficios',
        description:
          'Reduce el retrabajo y mejora la coordinación entre mantenimiento, supervisión y operación de planta.',
        bullets: [
          'Seguimiento en tiempo real del estado de cada tarea.',
          'Registro de mano de obra, materiales y hallazgos de campo.',
          'Trazabilidad operativa para auditoría y mejora de planificación.',
        ],
      },
      {
        title: 'Enfoque específico PM0',
        description:
          'Las OTs son el puente entre planificación y ejecución confiable en mantenimiento industrial.',
        bullets: [
          'Criterios de cierre técnico para asegurar calidad de ejecución.',
          'Histórico de decisiones y desvíos para aprendizaje del equipo.',
          'Conexión con activos, preventivos e inspecciones cuando aplica.',
        ],
      },
    ],
    industrialUseCases: [
      'Equipos de mantenimiento que coordinan mecánica, eléctrica e instrumentación con prioridades variables.',
      'Operaciones con alto volumen de solicitudes y necesidad de trazabilidad diaria.',
      'Plantas que buscan reducir backlog y mejorar cumplimiento semanal.',
    ],
    pm0Connection: [
      'PM0 convierte cada OT en evidencia operativa para decisiones futuras de preventivo y asignación de recursos.',
      'El cierre estructurado alimenta reportes de cumplimiento y tendencias de ejecución.',
    ],
    cta: commonCta,
    references: productReferences,
  },
  {
    slug: ['producto', 'mantenimiento-preventivo'],
    category: 'Producto',
    title: 'Mantenimiento preventivo',
    subtitle:
      'Planificación preventiva por frecuencias y criticidad para reducir fallas no planificadas',
    intro:
      'PM0 permite diseñar y ejecutar preventivos de forma consistente para sostener disponibilidad operativa sin sobremanentener activos.',
    sections: [
      {
        title: 'Qué resuelve y por qué importa',
        description:
          'Evita que el preventivo dependa de recordatorios manuales o de urgencias del día a día, una causa frecuente de paros no planeados.',
        bullets: [
          'Planificación por frecuencias temporales y criterios de uso.',
          'Programación anticipada para balancear carga por semana y turno.',
          'Visibilidad de tareas vencidas y próximas a vencer.',
        ],
      },
      {
        title: 'Valor operativo y beneficios',
        description:
          'Mejora cumplimiento PM y reduce fallas repetitivas al convertir el plan preventivo en rutina ejecutable.',
        bullets: [
          'Estandarización de rutinas y checklists por tipo de equipo.',
          'Menos correctivos urgentes por mejor disciplina preventiva.',
          'Disminución de paros no planificados y desvíos de producción.',
        ],
      },
      {
        title: 'Enfoque específico PM0',
        description:
          'El preventivo se integra con activos, órdenes e inspecciones para cerrar el ciclo de mejora.',
        bullets: [
          'Reglas de cumplimiento PM por criticidad y ventana operativa.',
          'Conversión automática de tareas preventivas en órdenes ejecutables.',
          'Revisión periódica de frecuencias según comportamiento real.',
        ],
      },
    ],
    industrialUseCases: [
      'Plantas con historial de fallas recurrentes por cumplimiento preventivo inestable.',
      'Operaciones continuas que necesitan coordinar mantenimiento con ventanas de producción.',
      'Equipos que buscan estandarizar rutinas entre múltiples sitios o turnos.',
    ],
    pm0Connection: [
      'En PM0, el preventivo deja de ser un calendario aislado y pasa a ser ejecución trazable con resultados medibles.',
      'La combinación de cumplimiento, backlog y fallas permite ajustar frecuencias con criterio operativo.',
    ],
    cta: commonCta,
    references: productReferences,
  },
  {
    slug: ['producto', 'kpis-y-reportes'],
    category: 'Producto',
    title: 'KPIs y reportes',
    subtitle:
      'Visibilidad operativa para monitorear cumplimiento, backlog y tendencias de mantenimiento',
    intro:
      'PM0 concentra métricas clave para que jefatura, supervisión y operación tomen decisiones con contexto actualizado y comparable.',
    sections: [
      {
        title: 'Qué resuelve y por qué importa',
        description:
          'Evita discusiones basadas en percepciones al mostrar desempeño real de mantenimiento en tableros claros.',
        bullets: [
          'Indicadores de cumplimiento preventivo y ejecución de OTs.',
          'Backlog segmentado por criticidad, tipo de trabajo o área.',
          'Tendencias para anticipar desvíos antes de que escalen.',
        ],
      },
      {
        title: 'Valor operativo y beneficios',
        description:
          'Permite priorizar acciones con foco en continuidad productiva, uso de recursos y calidad de ejecución.',
        bullets: [
          'Comparación entre plan semanal y ejecución real.',
          'Seguimiento de tiempos de ciclo y cuellos de botella.',
          'Soporte para reuniones operativas con información confiable.',
        ],
      },
      {
        title: 'Enfoque específico PM0',
        description:
          'Los reportes conectan activos, órdenes y preventivo para decisiones de corto y mediano plazo.',
        bullets: [
          'Métricas accionables para ajustar carga y prioridades.',
          'Lectura de cumplimiento por turno, planta o especialidad.',
          'Base de datos histórica para mejora continua y auditoría interna.',
        ],
      },
    ],
    industrialUseCases: [
      'Jefaturas que necesitan visibilidad consolidada de cumplimiento y backlog en múltiples áreas.',
      'Supervisores que priorizan recursos en base a tendencia de desvíos.',
      'Equipos que preparan revisiones mensuales con operación y gerencia.',
    ],
    pm0Connection: [
      'PM0 convierte datos operativos diarios en información de gestión para decisiones más rápidas y consistentes.',
      'La trazabilidad histórica facilita justificar cambios de estrategia de mantenimiento.',
    ],
    cta: commonCta,
    references: productReferences,
  },
  {
    slug: ['recursos', 'como-funciona'],
    category: 'Recursos',
    title: 'Cómo funciona',
    subtitle:
      'De mantenimiento reactivo a una operación controlada, trazable y medible',
    intro:
      'PM0 transforma mantenimiento industrial ordenando el trabajo alrededor de activos, ejecución en campo, evidencia técnica y seguimiento operativo. No agrega otra pantalla: instala una forma más disciplinada de controlar la operación.',
    sections: [
      {
        title: 'Antes de PM0',
        description:
          'El mantenimiento funciona, pero depende demasiado de memoria, urgencia y criterio aislado.',
        bullets: [
          'Paros no planeados que se atienden sin causa raíz documentada.',
          'Órdenes, reportes y pendientes repartidos entre Excel, papel y mensajes.',
          'Activos críticos sin historial técnico confiable ni trazabilidad de intervención.',
          'Tareas reactivas que desplazan rutinas preventivas y saturan al equipo.',
          'Decisiones tomadas con percepción operativa, no con datos comparables.',
        ],
      },
      {
        title: 'Qué cambia con PM0',
        description:
          'El equipo pasa de apagar urgencias a controlar un flujo operativo con evidencia.',
        bullets: [
          'Los activos quedan ordenados por ubicación, criticidad e historial.',
          'El mantenimiento se ejecuta con responsables, prioridades y seguimiento.',
          'Cada intervención deja evidencia útil para auditoría, análisis y mejora.',
          'El preventivo deja de ser un calendario aislado y se conecta con ejecución real.',
          'La operación gana visibilidad para priorizar recursos donde más impactan.',
        ],
      },
      {
        title: 'Flujo operativo PM0',
        description:
          'La transformación se sostiene en tres movimientos operativos simples.',
        bullets: [
          '1. Estructurar activos para que el trabajo tenga contexto técnico.',
          '2. Ejecutar mantenimiento con trazabilidad de tareas, responsables y evidencia.',
          '3. Medir resultados para ajustar prioridades, rutinas y decisiones.',
        ],
      },
      {
        title: 'Paso 1: Estructuración de activos',
        description:
          'PM0 construye una base operativa donde cada equipo tiene contexto técnico y prioridad clara.',
        bullets: [
          'Activos organizados por planta, área, sistema, criticidad y condición operativa.',
          'Historial técnico concentrado para dejar de depender de memoria individual.',
          'Criterios comunes para que mantenimiento, supervisión y operación hablen el mismo idioma.',
        ],
      },
      {
        title: 'Paso 2: Ejecución de mantenimiento',
        description:
          'Las necesidades se convierten en trabajo planificado, asignado y verificable en campo.',
        bullets: [
          'Órdenes con prioridad, responsable, estado y evidencia de cierre.',
          'Rutinas preventivas sostenibles según criticidad, frecuencia y capacidad del equipo.',
          'Seguimiento del backlog para separar lo urgente, lo crítico y lo postergable.',
        ],
      },
      {
        title: 'Paso 3: Medición y mejora',
        description:
          'Lo ejecutado se convierte en información de gestión para corregir desvíos y mejorar el plan.',
        bullets: [
          'Lectura de cumplimiento preventivo, correctivos, atrasos y reincidencias.',
          'Indicadores conectados con activos reales, no reportes manuales armados tarde.',
          'Base objetiva para reuniones de producción, mantenimiento y gerencia.',
        ],
      },
      {
        title: 'Impacto operativo',
        description:
          'Cuando el proceso se sostiene, el impacto aparece en continuidad, control y calidad de decisión.',
        bullets: [
          'Menos paros sin causa identificada.',
          'Mayor trazabilidad de intervención, responsables y evidencia.',
          'Mejor priorización por criticidad, recurrencia e impacto productivo.',
          'Decisiones con evidencia para mantenimiento, producción y gerencia.',
        ],
      },
      {
        title: 'Qué no es PM0',
        description:
          'PM0 no intenta maquillar una operación desordenada. Está diseñado para ordenar cómo se trabaja.',
        bullets: [
          'PM0 no es solo checklist.',
          'No es solo registro de órdenes.',
          'No es un dashboard bonito para mirar indicadores sin cambiar la ejecución.',
          'No reemplaza el criterio técnico del equipo; lo vuelve visible, trazable y comparable.',
          'PM0 es una capa de control operativo para mantenimiento industrial.',
        ],
      },
    ],
    industrialUseCases: [
      'Plantas que migran desde planillas y comunicación informal a un flujo digital único.',
      'Equipos que necesitan alinear mantenimiento, supervisión y operación en un mismo proceso.',
      'Organizaciones que buscan crecer sin perder control de ejecución.',
    ],
    pm0Connection: [
      'El flujo PM0 está diseñado para reducir fricción entre planificación y campo.',
      'Cada etapa deja trazabilidad para mejorar decisiones semana a semana.',
    ],
    cta: {
      title: 'Convierte mantenimiento en control operativo',
      description:
        'Revisamos tu flujo actual de activos, órdenes, preventivo y trazabilidad para identificar si PM0 puede generar impacto operativo real.',
      primaryLabel: 'Solicitar evaluación operativa',
      primaryHref: '/demo',
      secondaryLabel: 'Ver planes',
      secondaryHref: '/precios',
    },
    references: resourcesReferences,
    customTemplate: 'como-funciona',
  },
  {
    slug: ['recursos', 'guia-de-implementacion'],
    category: 'Recursos',
    title: 'Guía de implementación',
    subtitle:
      'Plan práctico para implementar PM0 con orden, adopción y foco operativo',
    intro:
      'Esta guía resume una secuencia recomendada para implementar PM0 en mantenimiento industrial minimizando fricción y acelerando valor temprano.',
    sections: [
      {
        title: '01 — Arranque y modelado operativo',
        description:
          'El levantamiento inicial define calidad de datos y velocidad de adopción posterior.',
        bullets: [
          'Levantamiento de activos y carga inicial priorizando equipos críticos.',
          'Clasificación por criticidad, ubicación y tipo de activo.',
          'Definición de taxonomía común para evitar duplicidad de criterios.',
        ],
      },
      {
        title: '02 — Diseño de ejecución diaria',
        description:
          'Se construye una estructura de trabajo compatible con la realidad de campo.',
        bullets: [
          'Estructura de órdenes con estados, prioridades y reglas de cierre.',
          'Configuración de planes preventivos por frecuencias y criticidad.',
          'Definición de usuarios y roles según responsabilidades operativas.',
        ],
      },
      {
        title: '03 — Adopción e indicadores iniciales',
        description:
          'El éxito depende de uso sostenido y seguimiento de métricas desde el inicio.',
        bullets: [
          'Capacitación por perfil y acompañamiento en primeras semanas.',
          'Rutina de revisión de cumplimiento, backlog y tiempos de ciclo.',
          'Ajustes tempranos para consolidar hábito operativo con PM0.',
        ],
      },
    ],
    industrialUseCases: [
      'Implementaciones en plantas con alta presión operativa y poco margen de error.',
      'Equipos que necesitan pasar de piloto a despliegue controlado por etapas.',
      'Organizaciones multi-sitio que buscan un estándar común de mantenimiento.',
    ],
    pm0Connection: [
      'La implementación recomendada prioriza primero orden operativo, luego profundidad analítica.',
      'El objetivo es generar resultados visibles temprano para sostener adopción.',
    ],
    cta: {
      title: 'Implementa PM0 con orden desde el inicio',
      description:
        'Podemos ayudarte a estructurar el arranque operativo para tu planta.',
      primaryLabel: 'Solicitar evaluación operativa',
      primaryHref: '/demo',
      secondaryLabel: 'Ver precios',
      secondaryHref: '/precios',
    },
    references: resourcesReferences,
    customTemplate: 'guia-de-implementacion',
  },
  {
    slug: ['recursos', 'preguntas-frecuentes'],
    category: 'Recursos',
    title: 'Preguntas frecuentes',
    subtitle: 'Respuestas concretas para evaluación e implementación de PM0',
    intro:
      'Agrupamos las consultas más comunes para facilitar la evaluación y toma de decisiones.',
    customTemplate: 'preguntas-frecuentes',
    sections: [],
    industrialUseCases: [],
    pm0Connection: [],
    cta: {
      title: '¿Tienes más preguntas?',
      description: 'Podemos ayudarte a evaluar si PM0 aplica a tu operación.',
      primaryLabel: 'Contactar a Paro Cero',
      primaryHref: '/empresa/contacto',
      secondaryLabel: 'Ver demo primero',
      secondaryHref: '/demo',
    },
    references: [],
  },
  {
    slug: ['empresa', 'sobre-paro-cero'],
    category: 'Empresa',
    title: 'Paro Cero',
    subtitle:
      'Control operativo para mantenimiento industrial, construido desde la realidad de planta',
    intro:
      'Paro Cero nace para ordenar mantenimiento industrial, reducir paros no planeados y convertir actividad dispersa en control operativo. PM0 no intenta decorar una operación desordenada: estructura activos, rutinas, órdenes, evidencias e indicadores para que mantenimiento pueda decidir con trazabilidad.',
    sections: [
      {
        title: 'El problema real en planta',
        description:
          'En muchas plantas el mantenimiento funciona por esfuerzo humano, no por sistema. La operación responde, resuelve y sigue produciendo, pero cada paro no planeado vuelve a exponer la misma fragilidad: información incompleta, decisiones urgentes y poca memoria técnica acumulada.',
        bullets: [
          'Paros no planeados atendidos con velocidad, pero sin evidencia suficiente para evitar repetición.',
          'Excel, papel, chats y conversaciones de turno conviviendo como fuentes paralelas de verdad.',
          'Activos críticos sin historial confiable de fallas, intervenciones, repuestos y decisiones.',
          'Preventivos desplazados por urgencias porque la carga real y el backlog no están visibles.',
          'Dependencia de memoria individual para saber qué pasó, qué se hizo y qué quedó pendiente.',
        ],
        note: 'El costo no aparece solo cuando la línea se detiene. También aparece cuando la planta pierde trazabilidad sobre cómo llegó a ese punto.',
      },
      {
        title: 'El insight: por qué falla mantenimiento',
        description:
          'El problema no es solamente falta de software. Una herramienta nueva no corrige por sí sola una operación sin estructura. Lo que suele faltar es disciplina de ejecución, criterios comunes de prioridad y visibilidad suficiente para conectar el trabajo diario con decisiones de gestión.',
        bullets: [
          'Si la criticidad no está definida, todo compite contra todo y gana la urgencia más ruidosa.',
          'Si la orden se cierra sin evidencia, el historial no aprende y el próximo diagnóstico arranca de cero.',
          'Si el preventivo vive separado de la ejecución real, se convierte en calendario, no en control.',
          'Si los indicadores se arman tarde o a mano, llegan cuando el desvío ya impactó producción.',
        ],
        note: 'Mantenimiento mejora cuando la operación deja registro útil mientras trabaja, no cuando alguien reconstruye la historia al final del mes.',
      },
      {
        title: 'Qué es PM0 realmente',
        description:
          'PM0 es una capa de control operativo para mantenimiento industrial. Ordena la base técnica, convierte necesidades en trabajo ejecutable y transforma cada intervención en evidencia para decidir mejor.',
        bullets: [
          'Estructura activos por ubicación, criticidad, contexto técnico e historial operativo.',
          'Organiza rutinas preventivas para que tengan frecuencia, responsable, seguimiento y cierre.',
          'Gestiona órdenes de trabajo con prioridad, estado, evidencias y trazabilidad de ejecución.',
          'Conecta actividad de campo con indicadores de cumplimiento, backlog, reincidencia y control.',
          'Reduce la distancia entre planificación, técnicos, supervisión y decisiones de gerencia.',
        ],
        note: 'PM0 no reemplaza el criterio técnico del equipo. Lo hace visible, comparable y reutilizable.',
      },
      {
        title: 'Filosofía de producto',
        description:
          'Construimos PM0 con una convicción concreta: una plataforma industrial debe empezar por lo esencial y sostener adopción en campo. Si el sistema no ayuda al técnico, al planificador y al supervisor en el trabajo diario, no sirve como sistema de control.',
        bullets: [
          'Empezar con activos críticos, no con inventarios perfectos que nunca llegan a operación.',
          'Priorizar flujos simples que el equipo pueda sostener durante presión productiva real.',
          'Acompañar adopción por etapas, con foco en hábitos de carga, cierre y revisión.',
          'Medir desde el inicio para detectar cumplimiento, atrasos y puntos de fricción.',
          'Agregar profundidad solo cuando la base operativa ya está funcionando.',
        ],
        note: 'La madurez no se impone con complejidad. Se construye con una secuencia que la planta pueda ejecutar.',
      },
      {
        title: 'La visión',
        description:
          'Queremos plantas con mantenimiento trazable, preventivo y controlado. Operaciones donde el conocimiento no dependa de recordar quién atendió una falla, sino de evidencia disponible para aprender, priorizar y prevenir.',
        bullets: [
          'Menos dependencia de memoria individual y más conocimiento institucional accesible.',
          'Menos mantenimiento reactivo como modo normal de trabajo y más prevención verificable.',
          'Menos discusiones por percepción y más decisiones respaldadas por historial operativo.',
          'Menos datos dispersos y más continuidad entre turnos, áreas y sitios.',
          'Más control sobre lo que se planifica, se ejecuta, se cierra y se mejora.',
        ],
        note: 'Paro Cero busca ser una herramienta diaria de control operativo, no una carga administrativa más.',
      },
    ],
    industrialUseCases: [
      'Plantas con paros recurrentes que necesitan identificar patrones con evidencia.',
      'Equipos que todavía dependen de Excel, papel o comunicación informal para coordinar mantenimiento.',
      'Operaciones con activos críticos sin historial técnico confiable.',
      'Organizaciones que quieren estandarizar ejecución entre turnos, áreas o sitios.',
    ],
    pm0Connection: [
      'PM0 cierra el ciclo operativo: activos, rutinas, órdenes, evidencias e indicadores conectados.',
      'La trazabilidad no es un módulo adicional. Es la base para reducir reacción y sostener mejora real.',
    ],
    cta: {
      title: 'Evaluemos el control operativo de tu mantenimiento',
      description:
        'Revisamos cómo hoy gestionás activos, preventivos, órdenes, evidencias e indicadores para detectar si PM0 puede ordenar tu operación y reducir paros no planeados.',
      primaryLabel: 'Solicitar evaluación operativa',
      primaryHref: '/demo',
      secondaryLabel: 'Ver guía de implementación',
      secondaryHref: '/recursos/guia-de-implementacion',
    },
    references: [],
    customTemplate: 'sobre-paro-cero',
  },
  {
    slug: ['empresa', 'contacto'],
    category: 'Empresa',
    title: 'Contacto operativo',
    subtitle: 'Evaluación de Paro Cero en tu operación industrial',
    intro:
      'Si estás evaluando PM0 para tu planta, este es el punto de entrada para entender tu operación y determinar si tiene sentido implementarlo.',
    sections: [
      {
        title: '¿Tiene sentido implementar PM0 en tu operación?',
        description:
          'Este punto de entrada está pensado para operaciones industriales donde todavía existen brechas claras de control, trazabilidad o mantenimiento preventivo.',
        bullets: [
          'Tienes paros no planeados sin trazabilidad clara.',
          'El mantenimiento se gestiona en Excel, papel o sistemas dispersos.',
          'No tienes visibilidad real del desempeño de tus activos.',
          'Tu equipo de mantenimiento opera de forma reactiva.',
          'Buscas estructurar mantenimiento preventivo.',
        ],
        note: 'Si tu operación ya tiene control total y trazabilidad consolidada, probablemente PM0 no es necesario.',
      },
      {
        title: 'Qué obtienes en la primera conversación',
        description:
          'La primera conversación busca entender el estado real de tu operación, no vender una solución genérica.',
        bullets: [
          'Diagnóstico inicial de tu operación.',
          'Identificación de puntos críticos en mantenimiento.',
          'Evaluación de si PM0 aplica para tu caso.',
          'Recomendación del siguiente paso (demo o implementación).',
        ],
      },
      {
        title: 'Cómo funciona el proceso',
        description:
          'El proceso está diseñado para validar fit operativo antes de avanzar a una demo o implementación.',
        bullets: [
          '1. Envío del formulario con contexto básico.',
          '2. Revisión interna del equipo PM0.',
          '3. Primera conversación (30–45 min).',
          '4. Definición de siguiente paso.',
        ],
      },
      {
        title: 'Canal de contacto',
        description:
          'La comunicación inicia desde el formulario de evaluación.',
        bullets: [
          'entender tu operación antes de responder',
          'priorizar correctamente el seguimiento',
          'asignar un enfoque técnico desde el inicio',
        ],
      },
    ],
    industrialUseCases: [],
    pm0Connection: [],
    cta: {
      title: 'Inicia evaluación de tu operación',
      description:
        'Podemos ayudarte a identificar dónde estás perdiendo eficiencia y si PM0 realmente tiene sentido para tu planta.',
      primaryLabel: 'Solicitar evaluación',
      primaryHref: '/demo',
      secondaryLabel: 'Ver demo primero',
      secondaryHref: '/demo',
    },
    references: [],
    placeholders: [
      'siview.corp@gmail.com Correo oficial de contacto público.',
      '5537828350 Teléfono de contacto.',
    ],
  },
  {
    slug: ['legal', 'terminos-y-condiciones'],
    category: 'Legal',
    title: 'Términos y condiciones',
    subtitle: 'Base contractual prudente para uso de PM0 como servicio SaaS',
    intro:
      'Este documento presenta una estructura inicial de términos para uso de PM0. Es una base editable y no reemplaza asesoramiento legal profesional.',
    sections: [
      {
        title: 'Alcance del servicio',
        description:
          'Define condiciones generales de acceso, uso permitido y responsabilidades básicas de las partes.',
        bullets: [
          'Uso de la plataforma sujeto a contrato comercial vigente.',
          'Credenciales personales y responsabilidad sobre su resguardo.',
          'Uso conforme a fines operativos legítimos de mantenimiento.',
        ],
      },
      {
        title: 'Obligaciones y límites razonables',
        description:
          'Establece criterios prudentes para operación del servicio y tratamiento de incidencias.',
        bullets: [
          'Compromiso de uso diligente por parte del cliente y sus usuarios.',
          'Mantenimiento y mejoras del servicio bajo esquema informado.',
          'Límites de responsabilidad sujetos a contrato y normativa aplicable.',
        ],
      },
      {
        title: 'Actualizaciones del documento',
        description:
          'Los términos deben mantenerse alineados con realidad contractual y operativa.',
        bullets: [
          'Versionado y fecha de vigencia de cada actualización.',
          'Comunicación de cambios relevantes a clientes activos.',
          'Revisión legal periódica antes de publicar nuevas versiones.',
        ],
      },
    ],
    industrialUseCases: [
      'Equipos de compras y legales que necesitan una base de revisión inicial.',
      'Clientes que requieren claridad sobre alcance y uso del servicio.',
      'Procesos de contratación donde se solicita documentación legal pública.',
    ],
    pm0Connection: [
      'Los términos acompañan el uso de PM0 como plataforma SaaS y deben ajustarse a cada contrato.',
      'No se declaran garantías, certificaciones o marcos regulatorios no formalizados.',
    ],
    cta: legalCta,
    references: legalReferences,
    legalNotice:
      'Nota: este contenido requiere revisión legal formal antes de publicarse como versión definitiva.',
    placeholders: [
      '[PENDIENTE] Razón social, domicilio legal y jurisdicción aplicable.',
      'siview.corp@gmail.com Correo legal oficial para notificaciones contractuales.',
      '[PENDIENTE] Fecha de vigencia y versión aprobada por asesoría legal.',
    ],
  },
  {
    slug: ['legal', 'privacidad'],
    category: 'Legal',
    title: 'Privacidad',
    subtitle:
      'Base de política de privacidad para tratamiento responsable de datos',
    intro:
      'Este texto describe lineamientos generales de privacidad para PM0. Debe adaptarse según contratos, jurisdicción y arquitectura real del servicio.',
    sections: [
      {
        title: 'Datos y finalidades',
        description:
          'Se documentan categorías generales de datos y fines legítimos de tratamiento en un servicio SaaS.',
        bullets: [
          'Datos de cuenta y uso necesarios para operar la plataforma.',
          'Finalidades de prestación del servicio, seguridad y soporte.',
          'Principio de minimización según necesidad operativa.',
        ],
      },
      {
        title: 'Responsabilidades y derechos',
        description:
          'Define una base prudente para roles de tratamiento y mecanismos de consulta.',
        bullets: [
          'Roles y responsabilidades sujetos a acuerdo entre las partes.',
          'Canal para solicitudes vinculadas a datos personales.',
          'Retención y eliminación de datos según criterios contractuales.',
        ],
      },
      {
        title: 'Seguridad y actualización',
        description:
          'La política debe mantenerse coherente con controles reales y evolución del servicio.',
        bullets: [
          'Prácticas de protección alineadas con operación efectiva.',
          'Revisión periódica de texto legal y procesos internos.',
          'Publicación de cambios con fecha y versión identificable.',
        ],
      },
    ],
    industrialUseCases: [
      'Clientes que solicitan documentación de privacidad durante evaluación de proveedor.',
      'Equipos internos que necesitan una base para revisión jurídica y contractual.',
      'Procesos de onboarding donde se requiere claridad sobre tratamiento de datos.',
    ],
    pm0Connection: [
      'La política de privacidad de PM0 debe reflejar con precisión lo que se implementa en la práctica.',
      'No se afirman marcos regulatorios específicos sin validación legal previa.',
    ],
    cta: legalCta,
    references: legalReferences,
    legalNotice:
      'Nota: contenido preliminar. Requiere revisión legal y adecuación normativa antes de su publicación final.',
    placeholders: [
      '[PENDIENTE] Correo o canal formal para solicitudes de privacidad.',
      '[PENDIENTE] Plazos internos de respuesta y procedimiento validado.',
      '[PENDIENTE] Detalle definitivo de retención y eliminación por tipo de dato.',
    ],
  },
  {
    slug: ['legal', 'cookies'],
    category: 'Legal',
    title: 'Cookies',
    subtitle:
      'Política base de cookies para informar uso tecnológico de forma transparente',
    intro:
      'Este contenido define una estructura inicial para política de cookies en PM0. Debe revisarse junto con implementación técnica real y marco legal aplicable.',
    sections: [
      {
        title: 'Qué son y para qué se usan',
        description:
          'Explica en lenguaje claro el uso de cookies y tecnologías similares dentro del servicio.',
        bullets: [
          'Cookies técnicas necesarias para funcionamiento esencial.',
          'Cookies de análisis o mejora, si se encuentran activas.',
          'Distinción entre cookies propias y de terceros, cuando aplique.',
        ],
      },
      {
        title: 'Gestión de preferencias',
        description:
          'La política debe incluir mecanismos concretos para configurar consentimiento.',
        bullets: [
          'Información sobre panel o banner de preferencias, si está disponible.',
          'Instrucciones para revisar o cambiar consentimiento otorgado.',
          'Referencia a configuración del navegador como alternativa complementaria.',
        ],
      },
      {
        title: 'Transparencia y mantenimiento',
        description:
          'La validez de la política depende de que el inventario publicado coincida con lo desplegado.',
        bullets: [
          'Listado de cookies y finalidades actualizado por versión.',
          'Revisión conjunta entre producto, técnica y legal.',
          'Publicación de cambios con fecha de última actualización.',
        ],
      },
    ],
    industrialUseCases: [
      'Equipos de TI y legal que validan transparencia digital antes de publicar.',
      'Clientes corporativos que solicitan claridad sobre tecnologías de seguimiento.',
      'Procesos de cumplimiento interno que requieren trazabilidad documental.',
    ],
    pm0Connection: [
      'La política de cookies de PM0 debe describir solo tecnologías efectivamente implementadas.',
      'No se deben declarar categorías o proveedores no verificados técnicamente.',
    ],
    cta: legalCta,
    references: legalReferences,
    legalNotice:
      'Nota: borrador sujeto a revisión legal y técnica antes de publicación definitiva.',
    placeholders: [
      '[PENDIENTE] Inventario real de cookies por dominio y entorno.',
      '[PENDIENTE] Herramienta de consentimiento efectivamente utilizada (si aplica).',
      '[PENDIENTE] Fecha de última revisión legal aprobada.',
    ],
  },
];

const footerPagesMap = new Map(
  footerPages.map((page) => [page.slug.join('/'), page]),
);

export function getFooterPageBySlug(slug?: string[]) {
  if (!Array.isArray(slug) || slug.length === 0) {
    return undefined;
  }

  return footerPagesMap.get(slug.join('/'));
}

export function getAllFooterPageSlugs() {
  return footerPages.map((page) => page.slug);
}

export const footerNavColumns = [
  {
    title: 'Producto',
    links: [
      { label: 'Gestión de activos', href: '/producto/gestion-de-activos' },
      { label: 'Órdenes de trabajo', href: '/producto/ordenes-de-trabajo' },
      {
        label: 'Mantenimiento preventivo',
        href: '/producto/mantenimiento-preventivo',
      },
      { label: 'KPIs y reportes', href: '/producto/kpis-y-reportes' },
    ],
  },
  {
    title: 'Recursos',
    links: [
      { label: 'Cómo funciona', href: '/recursos/como-funciona' },
      {
        label: 'Guía de implementación',
        href: '/recursos/guia-de-implementacion',
      },
      {
        label: 'Preguntas frecuentes',
        href: '/recursos/preguntas-frecuentes',
      },
      { label: 'Blog', href: '/blog' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { label: 'Sobre Paro Cero', href: '/empresa/sobre-paro-cero' },
      { label: 'Contacto', href: '/empresa/contacto' },
    ],
  },
  {
    title: 'Legal',
    links: [
      {
        label: 'Términos y condiciones',
        href: '/legal/terminos-y-condiciones',
      },
      { label: 'Privacidad', href: '/legal/privacidad' },
      { label: 'Cookies', href: '/legal/cookies' },
    ],
  },
] as const;
