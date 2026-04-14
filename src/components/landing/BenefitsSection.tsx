const benefits = [
  {
    title: 'Disponibilidad operacional sostenible',
    description:
      'Detecta desviaciones en activos criticos antes de que escalen a paro no planificado.',
  },
  {
    title: 'Disciplina de ejecucion en campo',
    description:
      'Estandariza OT, rondas e inspecciones para equipos de mantenimiento, operaciones y confiabilidad.',
  },
  {
    title: 'KPIs accionables en tiempo real',
    description:
      'Consolida backlog, cumplimiento PM, MTTR y MTBF en tableros con trazabilidad por area.',
  },
] as const;

export default function BenefitsSection() {
  return (
    <section
      id='beneficios'
      className='border-shGray-700/60 scroll-mt-24 border-b'
    >
      <div className='container py-20'>
        <div className='mb-10 max-w-2xl space-y-3'>
          <p className='text-shPrimary-300 text-xs font-semibold tracking-[0.2em] uppercase'>
            Beneficios
          </p>
          <h2 className='text-shGray-200 text-3xl font-semibold md:text-4xl'>
            Menos paradas, mas control sobre tus activos.
          </h2>
        </div>

        <div className='grid gap-8 md:grid-cols-3'>
          {benefits.map((item) => (
            <article key={item.title} className='space-y-3'>
              <h3 className='text-shGray-200 text-xl font-semibold'>
                {item.title}
              </h3>
              <p className='text-shGray-400 leading-relaxed'>
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
