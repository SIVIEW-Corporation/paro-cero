import ScrollReveal from '@/components/landing/ScrollReveal';

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
      className='border-app-border-soft bg-app-surface scroll-mt-24 border-b'
    >
      <div className='container py-20'>
        <ScrollReveal className='mb-10 max-w-2xl space-y-3'>
          <p className='text-app-brand text-xs font-semibold tracking-[0.2em] uppercase'>
            Beneficios
          </p>
          <h2 className='text-app-text-primary text-3xl font-semibold md:text-4xl'>
            Menos paradas, mas control sobre tus activos.
          </h2>
        </ScrollReveal>

        <div className='grid gap-8 md:grid-cols-3'>
          {benefits.map((item, index) => (
            <ScrollReveal key={item.title} delay={index * 80}>
              <article className='border-app-border-soft bg-app-surface-subtle hover:border-app-border h-full rounded-2xl border p-6 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/10'>
                <h3 className='text-app-text-primary text-xl font-semibold'>
                  {item.title}
                </h3>
                <p className='text-app-text-secondary mt-3 leading-relaxed'>
                  {item.description}
                </p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
