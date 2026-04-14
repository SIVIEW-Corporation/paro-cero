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
      className='border-shGray-700/60 scroll-mt-24 border-b'
    >
      <div className='container py-20'>
        <div className='mb-10 max-w-2xl space-y-3'>
          <p className='text-shPrimary-300 text-xs font-semibold tracking-[0.2em] uppercase'>
            Industrias y casos de uso
          </p>
          <h2 className='text-shGray-200 text-3xl font-semibold md:text-4xl'>
            Diseñado para operaciones donde cada minuto cuenta.
          </h2>
        </div>

        <div className='grid gap-7 md:grid-cols-2'>
          {industries.map((industry) => (
            <article
              key={industry.name}
              className='border-shGray-700 space-y-2 border-t pt-5'
            >
              <h3 className='text-shGray-200 text-xl font-semibold'>
                {industry.name}
              </h3>
              <p className='text-shGray-400 leading-relaxed'>
                {industry.useCase}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
