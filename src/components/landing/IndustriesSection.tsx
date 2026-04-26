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
    <section
      id='industrias'
      className='border-app-border-soft bg-app-bg scroll-mt-24 border-b'
    >
      <div className='container py-20'>
        <ScrollReveal className='mb-10 max-w-2xl space-y-3'>
          <p className='text-app-brand text-xs font-semibold tracking-[0.2em] uppercase'>
            Industrias y casos de uso
          </p>
          <h2 className='text-app-text-primary text-3xl font-semibold md:text-4xl'>
            Diseñado para operaciones donde cada minuto cuenta.
          </h2>
        </ScrollReveal>

        <div className='grid gap-7 md:grid-cols-2'>
          {industries.map((industry, index) => (
            <ScrollReveal key={industry.name} delay={index * 70}>
              <article className='border-app-border-soft bg-app-surface hover:border-app-border h-full space-y-2 rounded-2xl border p-6 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/10'>
                <h3 className='text-app-text-primary text-xl font-semibold'>
                  {industry.name}
                </h3>
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
