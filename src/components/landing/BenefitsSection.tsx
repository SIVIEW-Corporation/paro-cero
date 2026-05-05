import Image from 'next/image';

import ScrollReveal from '@/components/landing/ScrollReveal';

const benefits = [
  {
    title: 'Disponibilidad operacional sostenible',
    description:
      'Detecta desviaciones en activos criticos antes de que escalen a paro no planificado.',
    icon: '/images/icons/disponibilidad.png',
    iconAlt: 'Icono de disponibilidad operacional',
  },
  {
    title: 'Disciplina de ejecucion en campo',
    description:
      'Estandariza OT, rondas e inspecciones para equipos de mantenimiento, operaciones y confiabilidad.',
    icon: '/images/icons/tablet.png',
    iconAlt: 'Icono de ejecución en campo con tablet',
  },
  {
    title: 'KPIs accionables en tiempo real',
    description:
      'Consolida backlog, cumplimiento PM, MTTR y MTBF en tableros con trazabilidad por area.',
    icon: '/images/icons/grafica.png',
    iconAlt: 'Icono de KPIs y reportes',
  },
] as const;

export default function BenefitsSection() {
  return (
    <section
      id='beneficios'
      className='to-shNeutral-50 scroll-mt-24 bg-linear-to-br from-white'
    >
      <div className='container py-24 lg:py-48'>
        <ScrollReveal className='mb-12 max-w-2xl space-y-3'>
          <p className='text-app-brand text-xs font-semibold tracking-[0.2em] uppercase'>
            Beneficios
          </p>
          <h2 className='text-app-text-primary text-3xl font-semibold md:text-4xl'>
            Menos paradas, mas control sobre tus activos.
          </h2>
        </ScrollReveal>

        <div className='grid gap-5 md:grid-cols-3'>
          {benefits.map((item, index) => (
            <ScrollReveal key={item.title} delay={index * 80}>
              <article className='group border-app-border-soft bg-app-surface-subtle hover:border-app-border hover:bg-app-surface flex h-full flex-col rounded-2xl border p-5 shadow-sm transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md md:p-6 md:pb-5'>
                <div>
                  <div className='bg-app-brand mb-5 h-1 w-12 rounded-full transition-transform duration-200 ease-out group-hover:scale-x-110' />
                  <h3 className='text-app-text-primary text-xl leading-snug font-semibold'>
                    {item.title}
                  </h3>
                  <p className='text-app-text-secondary mt-3 leading-relaxed'>
                    {item.description}
                  </p>
                </div>
                <div className='mt-auto flex justify-end pt-4 md:pt-5'>
                  <div className='flex h-14 w-14 shrink-0 items-center justify-center md:h-16 md:w-16'>
                    <Image
                      src={item.icon}
                      alt={item.iconAlt}
                      width={80}
                      height={80}
                      loading='lazy'
                      className='pointer-events-none h-full w-full object-contain opacity-70 mix-blend-multiply transition-opacity duration-200 ease-out select-none group-hover:opacity-90'
                    />
                  </div>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
