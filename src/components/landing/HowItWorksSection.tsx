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
      className='border-shGray-700/60 scroll-mt-24 border-b'
    >
      <div className='container py-20'>
        <div className='mb-10 max-w-2xl space-y-3'>
          <p className='text-shPrimary-300 text-xs font-semibold tracking-[0.2em] uppercase'>
            Como funciona
          </p>
          <h2 className='text-shGray-200 text-3xl font-semibold md:text-4xl'>
            De los datos de campo a decisiones de mantenimiento en minutos.
          </h2>
        </div>

        <ol className='grid gap-8 md:grid-cols-3'>
          {steps.map((item) => (
            <li
              key={item.step}
              className='border-shGray-700/80 bg-shGray-800/20 rounded-xl border p-6'
            >
              <p className='text-shPrimary-300 mb-4 text-sm font-semibold tracking-[0.16em]'>
                PASO {item.step}
              </p>
              <h3 className='text-shGray-200 mb-2 text-xl font-semibold'>
                {item.title}
              </h3>
              <p className='text-shGray-400 leading-relaxed'>
                {item.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
