import Link from 'next/link';

import { landingButtonVariants } from '@/components/landing/button-variants';
import ScrollReveal from '@/components/landing/ScrollReveal';
import { cn } from '@/lib/utils';

export default function CTASection() {
  return (
    <section
      id='demo'
      className='border-app-border-soft bg-app-surface scroll-mt-24 border-b'
    >
      <div className='container py-20'>
        <ScrollReveal className='border-app-border-soft rounded-2xl border bg-[linear-gradient(130deg,#ffffff,#fff4db)] p-8 shadow-xl shadow-slate-900/10 sm:p-12'>
          <p className='text-app-brand mb-3 text-xs font-semibold tracking-[0.2em] uppercase'>
            Demo ejecutiva
          </p>
          <h2 className='text-app-text-primary max-w-3xl text-3xl leading-tight font-semibold md:text-4xl'>
            Activa Paro Cero en tu operacion y toma decisiones de mantenimiento
            con visibilidad total.
          </h2>
          <p className='text-app-text-secondary mt-4 max-w-2xl'>
            Revisamos tu flujo actual de OT, PM e inspecciones y te mostramos un
            plan de adopcion por etapas con impacto medible.
          </p>

          <div className='mt-8 flex flex-wrap gap-3'>
            <Link
              href='/demo'
              className={cn(landingButtonVariants(), 'h-11 px-6 font-semibold')}
            >
              Solicitar demo
            </Link>
            <Link
              href='/login'
              className={cn(
                landingButtonVariants({ variant: 'outline' }),
                'h-11 px-6',
              )}
            >
              Iniciar sesion
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
