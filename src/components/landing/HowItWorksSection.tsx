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
    <section id='solucion' className='bg-app-surface-muted scroll-mt-24'>
      <div className='container py-24'>
        <ScrollReveal className='mb-14 max-w-2xl space-y-3'>
          <p className='text-shAccent-500 from-shNeutral-600 to-shNeutral-800/85 w-fit bg-linear-to-b px-2 py-1 text-xs font-bold tracking-[0.2em] uppercase shadow-xs lg:text-sm'>
            Como funciona
          </p>
          <h2 className='text-app-text-primary text-3xl font-semibold md:text-4xl'>
            De los datos de campo a decisiones de mantenimiento en minutos.
          </h2>
        </ScrollReveal>

        <ol className='before:bg-app-section-border relative grid gap-10 before:absolute before:top-10 before:right-0 before:left-0 before:hidden before:h-px before:content-[""] md:grid-cols-3 md:gap-8 md:before:block'>
          {steps.map((item, index) => (
            <ScrollReveal key={item.step} delay={index * 90}>
              <li className='group relative h-full pt-1'>
                <p className='border-app-section-border bg-app-surface text-app-brand group-hover:border-app-border mb-7 inline-flex size-20 items-center justify-center rounded-full border text-xl font-semibold shadow-sm transition-[border-color,box-shadow,transform] duration-200 ease-out group-hover:-translate-y-0.5 group-hover:shadow-md'>
                  {item.step}
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
