import ScrollReveal from '@/components/landing/ScrollReveal';

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
      className='border-app-border-soft bg-app-bg scroll-mt-24 border-b'
    >
      <div className='container py-20'>
        <ScrollReveal className='mb-10 max-w-2xl space-y-3'>
          <p className='text-app-brand text-xs font-semibold tracking-[0.2em] uppercase'>
            Modulos
          </p>
          <h2 className='text-app-text-primary text-3xl font-semibold md:text-4xl'>
            Una plataforma, multiples frentes criticos de mantenimiento.
          </h2>
        </ScrollReveal>

        <div className='grid gap-x-10 gap-y-8 md:grid-cols-2'>
          {modules.map((module, index) => (
            <ScrollReveal key={module.name} delay={index * 60}>
              <article className='border-app-border-soft border-l-app-brand bg-app-surface hover:border-app-border h-full rounded-2xl border p-5 shadow-sm shadow-slate-900/5 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/10'>
                <h3 className='text-app-text-primary mb-2 text-xl font-semibold'>
                  {module.name}
                </h3>
                <p className='text-app-text-secondary leading-relaxed'>
                  {module.detail}
                </p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
