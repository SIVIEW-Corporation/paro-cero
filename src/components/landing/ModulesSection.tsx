const modules = [
  {
    name: 'Gestion de Activos',
    detail:
      'Jerarquia tecnica, historial por equipo y criticidad para priorizar intervenciones.',
  },
  {
    name: 'Ordenes de Trabajo (OT)',
    detail:
      'Planifica, asigna y controla ejecucion con evidencias en terreno y cierres estandarizados.',
  },
  {
    name: 'Mantenimiento Preventivo (PM)',
    detail:
      'Dispara rutinas por calendario, horas o condiciones para reducir fallas repetitivas.',
  },
  {
    name: 'Inspecciones Moviles',
    detail:
      'Checklists guiados para detectar condiciones inseguras y desalineaciones operativas.',
  },
  {
    name: 'KPIs y Analitica',
    detail:
      'Seguimiento de backlog, cumplimiento, tiempos de reparacion y costo por activo.',
  },
  {
    name: 'Alertas y Escalamiento',
    detail:
      'Notificaciones por criticidad y reglas de respuesta para no perder ventanas de accion.',
  },
] as const;

export default function ModulesSection() {
  return (
    <section
      id='modulos'
      className='border-shGray-700/60 scroll-mt-24 border-b'
    >
      <div className='container py-20'>
        <div className='mb-10 max-w-2xl space-y-3'>
          <p className='text-shPrimary-300 text-xs font-semibold tracking-[0.2em] uppercase'>
            Modulos
          </p>
          <h2 className='text-shGray-200 text-3xl font-semibold md:text-4xl'>
            Una plataforma, multiples frentes criticos de mantenimiento.
          </h2>
        </div>

        <div className='grid gap-x-10 gap-y-8 md:grid-cols-2'>
          {modules.map((module) => (
            <article
              key={module.name}
              className='border-shPrimary-500/50 border-l pl-4 md:pl-5'
            >
              <h3 className='text-shGray-200 mb-2 text-xl font-semibold'>
                {module.name}
              </h3>
              <p className='text-shGray-400 leading-relaxed'>{module.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
