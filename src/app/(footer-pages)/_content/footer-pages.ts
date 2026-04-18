export interface FooterPageReference {
  label: string;
  href: string;
}

export interface FooterPageSection {
  title: string;
  description: string;
  bullets: string[];
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
}

const commonCta: FooterPageCta = {
  title: 'Llevemos PM0 a tu operación real',
  description:
    'Te ayudamos a priorizar activos críticos, ordenar la ejecución diaria y definir una adopción por etapas medible.',
  primaryLabel: 'Solicitar demo',
  primaryHref: '/#demo',
  secondaryLabel: 'Contactar a Paro Cero',
  secondaryHref: '/empresa/contacto',
};

const implementationCta: FooterPageCta = {
  title: 'Implementá PM0 con foco en resultados',
  description:
    'Planificamos juntos el arranque operativo para que el equipo use la plataforma desde la primera semana.',
  primaryLabel: 'Solicitar acompañamiento',
  primaryHref: '/#demo',
  secondaryLabel: 'Hablar con el equipo',
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
      'Flujo operativo completo de PM0 para pasar de datos dispersos a ejecución controlada',
    intro:
      'PM0 ordena el proceso de mantenimiento industrial en un circuito claro: activos, órdenes, preventivo, inspecciones cuando aplica y KPIs para cerrar el aprendizaje.',
    sections: [
      {
        title: 'Paso 1: activos y contexto técnico',
        description:
          'Todo comienza con una base sólida de activos para evitar ejecución sin contexto.',
        bullets: [
          'Alta de equipos con criticidad, ubicación y jerarquía funcional.',
          'Registro de historial técnico como insumo para decisiones.',
          'Estandarización de datos para trabajo entre áreas.',
        ],
      },
      {
        title: 'Paso 2: órdenes y preventivo',
        description:
          'Las necesidades de mantenimiento se convierten en trabajo ejecutable y medible.',
        bullets: [
          'Creación y seguimiento de órdenes con responsables y prioridad.',
          'Planificación preventiva por frecuencia y criticidad.',
          'Coordinación con operación para minimizar impacto productivo.',
        ],
      },
      {
        title: 'Paso 3: inspecciones y KPIs/reportes',
        description:
          'El cierre del ciclo usa evidencia de campo para medir y ajustar el sistema.',
        bullets: [
          'Inspecciones aplicadas cuando la estrategia lo requiere.',
          'Consolidación de cumplimiento, backlog y tendencias.',
          'Reportes accionables para reuniones operativas y decisiones.',
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
    cta: implementationCta,
    references: resourcesReferences,
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
        title: 'Arranque y modelado operativo',
        description:
          'El levantamiento inicial define calidad de datos y velocidad de adopción posterior.',
        bullets: [
          'Levantamiento de activos y carga inicial priorizando equipos críticos.',
          'Clasificación por criticidad, ubicación y tipo de activo.',
          'Definición de taxonomía común para evitar duplicidad de criterios.',
        ],
      },
      {
        title: 'Diseño de ejecución diaria',
        description:
          'Se construye una estructura de trabajo compatible con la realidad de campo.',
        bullets: [
          'Estructura de órdenes con estados, prioridades y reglas de cierre.',
          'Configuración de planes preventivos por frecuencias y criticidad.',
          'Definición de usuarios y roles según responsabilidades operativas.',
        ],
      },
      {
        title: 'Adopción e indicadores iniciales',
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
    cta: implementationCta,
    references: resourcesReferences,
  },
  {
    slug: ['recursos', 'preguntas-frecuentes'],
    category: 'Recursos',
    title: 'Preguntas frecuentes',
    subtitle:
      'Respuestas concretas para adopción de PM0 en equipos industriales',
    intro:
      'Agrupamos las consultas más comunes por categoría para facilitar evaluación, implementación y uso diario de PM0.',
    sections: [
      {
        title: 'Acceso y activos',
        description:
          'Dudas frecuentes durante onboarding de usuarios y carga de información técnica.',
        bullets: [
          'Acceso: alta de usuarios por rol y permisos acordes a responsabilidades.',
          'Activos: importación inicial y mantenimiento de inventario técnico.',
          'Activos: manejo de criticidad para priorización de mantenimiento.',
        ],
      },
      {
        title: 'Órdenes y mantenimiento preventivo',
        description:
          'Consultas vinculadas a la ejecución cotidiana de mantenimiento.',
        bullets: [
          'Órdenes de trabajo: creación, asignación, prioridades y cierre técnico.',
          'Mantenimiento preventivo: configuración de frecuencias y cumplimiento PM.',
          'Mantenimiento preventivo: ajuste de planes según resultados de campo.',
        ],
      },
      {
        title: 'Reportes y soporte',
        description:
          'Cómo usar datos de PM0 para seguimiento y mejora de operación.',
        bullets: [
          'Reportes: lectura de cumplimiento, backlog y tendencias operativas.',
          'Reportes: definición de indicadores iniciales para seguimiento semanal.',
          'Soporte: canales de contacto para consultas funcionales y operativas.',
        ],
      },
    ],
    industrialUseCases: [
      'Equipos nuevos en PM0 que necesitan una base común para resolver dudas rápidas.',
      'Responsables de implementación que preparan capacitaciones por perfil.',
      'Líderes de mantenimiento que buscan estandarizar criterios de uso.',
    ],
    pm0Connection: [
      'La página de preguntas frecuentes está organizada por acceso, activos, órdenes, preventivo, reportes y soporte para resolver lo crítico primero.',
      'El contenido se puede ampliar conforme aparezcan nuevas preguntas reales de operación.',
    ],
    cta: implementationCta,
    references: resourcesReferences,
  },
  {
    slug: ['empresa', 'sobre-paro-cero'],
    category: 'Empresa',
    title: 'Sobre Paro Cero',
    subtitle: 'Por qué existe PM0 y qué problema industrial buscamos resolver',
    intro:
      'Paro Cero nace para ayudar a equipos industriales a reducir paros no planificados mediante ejecución disciplinada, trazabilidad y decisiones operativas con datos.',
    sections: [
      {
        title: 'El problema que vemos en planta',
        description:
          'Muchas operaciones conviven con datos dispersos, baja trazabilidad y priorización reactiva de mantenimiento.',
        bullets: [
          'Información crítica repartida en planillas, chats y memoria de personas clave.',
          'Dificultad para sostener cumplimiento preventivo bajo presión operativa.',
          'Poca visibilidad para decidir en base a tendencias y no urgencias.',
        ],
      },
      {
        title: 'Por qué existe PM0',
        description:
          'Construimos PM0 para transformar mantenimiento en un sistema operativo consistente y medible.',
        bullets: [
          'Unificar activos, órdenes, preventivo e indicadores en un flujo único.',
          'Reducir fricción entre mantenimiento, operación y supervisión.',
          'Generar evidencia útil para decisiones técnicas y de gestión.',
        ],
      },
      {
        title: 'Visión y enfoque',
        description:
          'Nuestro foco está en industria y operación real, con diseño pragmático orientado a adopción.',
        bullets: [
          'Resolver necesidades concretas de campo antes que features cosméticas.',
          'Escalar desde quick wins hasta una gestión robusta de mantenimiento.',
          'Trabajar junto al cliente para iterar con impacto operativo medible.',
        ],
      },
    ],
    industrialUseCases: [
      'Empresas que quieren profesionalizar mantenimiento sin frenar la operación diaria.',
      'Equipos que necesitan trazar decisiones técnicas frente a auditoría interna.',
      'Operaciones que buscan un partner enfocado en industria, no en software genérico.',
    ],
    pm0Connection: [
      'PM0 refleja la visión de Paro Cero: menos improvisación y más decisiones trazables.',
      'El producto evoluciona con feedback operativo para sostener valor en planta.',
    ],
    cta: commonCta,
    references: [],
  },
  {
    slug: ['empresa', 'contacto'],
    category: 'Empresa',
    title: 'Contacto',
    subtitle:
      'Canales para consultas comerciales, implementación y acompañamiento operativo',
    intro:
      'Si querés evaluar PM0 o necesitás coordinar una conversación técnica, este es el punto de contacto para el equipo de Paro Cero.',
    sections: [
      {
        title: 'Cómo contactar',
        description:
          'Priorizamos una respuesta ordenada según tipo de consulta para agilizar el siguiente paso.',
        bullets: [
          'Formulario de contacto desde la landing para solicitud de demo.',
          'Canal de correo para consultas comerciales y de implementación.',
          'Espacios de reunión para revisión de contexto operativo.',
        ],
      },
      {
        title: 'Tipos de consulta',
        description:
          'Podés escribirnos según el objetivo de tu equipo y etapa del proyecto.',
        bullets: [
          'Evaluación de PM0 para una planta o múltiples sitios.',
          'Plan de implementación y adopción por etapas.',
          'Alineación inicial de indicadores y enfoque de mejora.',
        ],
      },
      {
        title: 'Disponibilidad y respuesta',
        description:
          'Mantenemos un esquema de atención transparente y ajustable a cada proyecto.',
        bullets: [
          'Respuesta inicial en días hábiles para nuevos contactos.',
          'Coordinación de reuniones según disponibilidad de ambas partes.',
          'Escalamiento de temas críticos durante implementación acordada.',
        ],
      },
    ],
    industrialUseCases: [
      'Empresas que quieren validar fit funcional antes de iniciar un piloto.',
      'Responsables de mantenimiento que necesitan una hoja de ruta de adopción.',
      'Equipos directivos que evalúan impacto operativo y alcance de implementación.',
    ],
    pm0Connection: [
      'El contacto inicial busca entender contexto operativo antes de proponer alcance.',
      'La conversación se orienta a resultados medibles y plan de ejecución realista.',
    ],
    cta: {
      title: 'Contanos tu contexto operativo',
      description:
        'Podemos ayudarte a identificar prioridades y armar un plan inicial de implementación en PM0.',
      primaryLabel: 'Ir al formulario de demo',
      primaryHref: '/#demo',
      secondaryLabel: 'Ver guía de implementación',
      secondaryHref: '/recursos/guia-de-implementacion',
    },
    references: [],
    placeholders: [
      '[PENDIENTE] Correo oficial de contacto público.',
      '[PENDIENTE] Horario formal de atención por zona horaria.',
      '[PENDIENTE] Teléfono o canal directo (si aplica).',
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
      '[PENDIENTE] Correo legal oficial para notificaciones contractuales.',
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
