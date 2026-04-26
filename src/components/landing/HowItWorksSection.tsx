import ScrollReveal from '@/components/landing/ScrollReveal';

const steps = [
  {
    step: '01',
    title: 'Levantamiento operativo',
    description:
      'Configuramos activos, jerarquias, rutinas PM e indicadores alineados a tu realidad de planta.',
  },
  {
    step: '02',
    title: 'Ejecucion conectada',
    description:
      'Tu equipo gestiona OT e inspecciones desde terreno mientras supervision visualiza desvios al instante.',
  },
  {
    step: '03',
    title: 'Mejora continua',
    description:
      'Consolidamos KPIs y hallazgos para optimizar planes y sostener disponibilidad en cada ciclo.',
  },
] as const;

export default function HowItWorksSection() {
  return (
    <section
      id='solucion'
      className='border-app-border-soft bg-app-surface scroll-mt-24 border-b'
    >
      <div className='container py-20'>
        <ScrollReveal className='mb-10 max-w-2xl space-y-3'>
          <p className='text-app-brand text-xs font-semibold tracking-[0.2em] uppercase'>
            Como funciona
          </p>
          <h2 className='text-app-text-primary text-3xl font-semibold md:text-4xl'>
            De los datos de campo a decisiones de mantenimiento en minutos.
          </h2>
        </ScrollReveal>

        <ol className='grid gap-8 md:grid-cols-3'>
          {steps.map((item, index) => (
            <ScrollReveal key={item.step} delay={index * 90}>
              <li className='border-app-border-soft bg-app-surface-subtle hover:border-app-border h-full rounded-xl border p-6 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/10'>
                <p className='text-app-brand mb-4 text-sm font-semibold tracking-[0.16em]'>
                  PASO {item.step}
                </p>
                <h3 className='text-app-text-primary mb-2 text-xl font-semibold'>
                  {item.title}
                </h3>
                <p className='text-app-text-secondary leading-relaxed'>
                  {item.description}
                </p>
              </li>
            </ScrollReveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
