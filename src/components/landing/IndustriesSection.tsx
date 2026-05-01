import ScrollReveal from '@/components/landing/ScrollReveal';

const industries = [
  {
    name: 'Manufactura continua',
    description:
      'Control de activos de alta rotación, cumplimiento PM y respuesta rápida ante eventos de línea.',
    chips: ['Disponibilidad', 'OT críticas', 'Preventivo'],
  },
  {
    name: 'Alimentos y bebidas',
    description:
      'Rondas de inspección trazables para asegurar inocuidad, continuidad y cumplimiento operativo.',
    chips: ['Checklists', 'Evidencia', 'Cumplimiento'],
  },
  {
    name: 'Minería y metalurgia',
    description:
      'Planeación de mantenimientos mayores y monitoreo de equipos críticos en condiciones exigentes.',
    chips: ['Activos críticos', 'Paros mayores', 'Historial técnico'],
  },
  {
    name: 'Energía y utilities',
    description:
      'Seguimiento de disponibilidad por unidad, análisis de causas y reducción de indisponibilidad no programada.',
    chips: ['Disponibilidad', 'Causa raíz', 'KPIs'],
  },
] as const;

export default function IndustriesSection() {
  return (
    <section id='industrias' className='bg-app-section-clean scroll-mt-24'>
      <div className='container py-24'>
        <ScrollReveal className='mb-12 max-w-3xl space-y-4'>
          <div className='flex items-center gap-3'>
            <span className='bg-app-brand h-1.5 w-8 rounded-full' />
            <p className='text-app-text-secondary text-xs font-semibold tracking-[0.2em] uppercase'>
              Industrias y casos de uso
            </p>
          </div>
          <h2 className='text-app-text-primary text-3xl font-semibold md:text-4xl'>
            Diseñado para operaciones donde cada minuto cuenta.
          </h2>
          <p className='text-app-text-secondary max-w-2xl text-base leading-relaxed md:text-lg'>
            PM0 ayuda a equipos industriales a sostener disponibilidad,
            controlar ejecución y convertir eventos de mantenimiento en
            trazabilidad accionable.
          </p>
        </ScrollReveal>

        <div className='border-app-border-soft bg-app-surface overflow-hidden rounded-3xl border shadow-sm'>
          {industries.map((industry, index) => (
            <ScrollReveal key={industry.name} delay={index * 70}>
              <article className='group border-app-border-soft hover:bg-app-surface-subtle grid gap-5 border-b p-6 transition-[background-color] duration-200 ease-out last:border-b-0 md:grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)_minmax(12rem,0.75fr)] md:items-center md:gap-8 md:p-8'>
                <div className='flex items-start gap-4'>
                  <span className='bg-app-brand-soft mt-1 flex size-9 shrink-0 items-center justify-center rounded-full'>
                    <span className='bg-app-brand size-2.5 rounded-full transition-transform duration-200 ease-out group-hover:scale-125' />
                  </span>
                  <h3 className='text-app-text-primary text-lg font-semibold md:text-xl'>
                    {industry.name}
                  </h3>
                </div>
                <p className='text-app-text-secondary leading-relaxed'>
                  {industry.description}
                </p>
                <div className='flex flex-wrap gap-2 md:justify-end'>
                  {industry.chips.map((chip) => (
                    <span
                      key={chip}
                      className='border-app-border-soft bg-app-surface-muted text-app-text-secondary rounded-full border px-3 py-1 text-xs font-medium'
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={320}>
          <div className='bg-app-brand-soft mt-6 rounded-2xl p-6 md:p-8'>
            <p className='text-app-text-primary max-w-3xl text-base leading-relaxed font-medium md:text-lg'>
              Cuando cada minuto de paro impacta producción, PM0 ayuda a
              convertir mantenimiento en control operativo medible.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
