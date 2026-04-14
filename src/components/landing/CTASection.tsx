import Link from 'next/link';

import { landingButtonVariants } from '@/components/landing/button-variants';
import { cn } from '@/lib/utils';

export default function CTASection() {
  return (
    <section id='demo' className='border-shGray-700/60 scroll-mt-24 border-b'>
      <div className='container py-20'>
        <div className='border-shGray-700 rounded-2xl border bg-[linear-gradient(130deg,rgba(53,31,9,0.92),rgba(29,27,22,0.96))] p-8 sm:p-12'>
          <p className='text-shPrimary-300 mb-3 text-xs font-semibold tracking-[0.2em] uppercase'>
            Demo ejecutiva
          </p>
          <h2 className='text-shGray-200 max-w-3xl text-3xl leading-tight font-semibold md:text-4xl'>
            Activa Paro Cero en tu operacion y toma decisiones de mantenimiento
            con visibilidad total.
          </h2>
          <p className='text-shGray-300 mt-4 max-w-2xl'>
            Revisamos tu flujo actual de OT, PM e inspecciones y te mostramos un
            plan de adopcion por etapas con impacto medible.
          </p>

          <div className='mt-8 flex flex-wrap gap-3'>
            <a
              href='#contacto'
              className={cn(
                landingButtonVariants(),
                'bg-shPrimary-400 text-shBackground hover:bg-shPrimary-300 h-11 px-6 font-semibold',
              )}
            >
              Solicitar demo
            </a>
            <Link
              href='/login'
              className={cn(
                landingButtonVariants({ variant: 'outline' }),
                'border-shGray-500 text-shGray-200 hover:bg-shGray-700/40 h-11 bg-transparent px-6',
              )}
            >
              Iniciar sesion
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
