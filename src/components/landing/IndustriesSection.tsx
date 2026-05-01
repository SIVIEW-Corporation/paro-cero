import ScrollReveal from '@/components/landing/ScrollReveal';

const industries = [
  {
    name: 'Manufactura continua',
    useCase:
      'Control de activos de alta rotacion, cumplimiento PM y respuesta rapida ante eventos de linea.',
  },
  {
    name: 'Alimentos y bebidas',
    useCase:
      'Rondas de inspeccion trazables para asegurar inocuidad, continuidad y cumplimiento normativo.',
  },
  {
    name: 'Mineria y metalurgia',
    useCase:
      'Planificacion de mantenimientos mayores y monitoreo de equipos criticos en condiciones exigentes.',
  },
  {
    name: 'Energia y utilities',
    useCase:
      'Seguimiento de disponibilidad por unidad, analisis de causas y reduccion de indisponibilidad no programada.',
  },
] as const;

export default function IndustriesSection() {
  return (
    <section id='industrias' className='bg-app-section-alternate scroll-mt-24'>
      <div className='container py-24'>
        <ScrollReveal className='mb-12 max-w-2xl space-y-3'>
          <p className='text-app-brand text-xs font-semibold tracking-[0.2em] uppercase'>
            Industrias y casos de uso
          </p>
          <h2 className='text-app-text-primary text-3xl font-semibold md:text-4xl'>
            Diseñado para operaciones donde cada minuto cuenta.
          </h2>
        </ScrollReveal>

        <div className='border-app-section-border bg-app-surface overflow-hidden rounded-3xl border shadow-sm'>
          {industries.map((industry, index) => (
            <ScrollReveal key={industry.name} delay={index * 70}>
              <article className='group border-app-section-border hover:bg-app-surface-subtle grid gap-4 border-b p-6 transition-[background-color] duration-200 ease-out last:border-b-0 md:grid-cols-[0.6fr_1fr] md:p-8'>
                <div className='flex items-start gap-4'>
                  <span className='bg-app-brand mt-2 size-2.5 rounded-full transition-transform duration-200 ease-out group-hover:scale-110' />
                  <h3 className='text-app-text-primary text-xl font-semibold'>
                    {industry.name}
                  </h3>
                </div>
                <p className='text-app-text-secondary leading-relaxed'>
                  {industry.useCase}
                </p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
