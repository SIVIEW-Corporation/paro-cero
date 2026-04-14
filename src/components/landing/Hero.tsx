import Image from 'next/image';

import { landingButtonVariants } from '@/components/landing/button-variants';
import { cn } from '@/lib/utils';

export default function Hero() {
  return (
    <section className='relative min-h-[calc(100svh-4rem)] overflow-hidden'>
      {/* Place the local hero image at: public/images/hero/paro-cero-hero.jpg */}
      <Image
        src='/images/hero/paro-cero-hero.jpg'
        alt='Equipo tecnico inspeccionando activos industriales en planta'
        fill
        priority
        className='object-cover'
      />

      <div className='absolute inset-0 bg-[linear-gradient(100deg,rgba(18,17,15,0.92),rgba(18,17,15,0.72)_45%,rgba(18,17,15,0.92))]' />
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(238,156,74,0.16),transparent_45%)]' />

      <div className='relative container flex min-h-[calc(100svh-4rem)] items-end py-16 md:items-center'>
        <div className='max-w-2xl space-y-7'>
          <p className='text-shPrimary-300 text-xs font-semibold tracking-[0.26em] uppercase'>
            Plataforma de excelencia operacional
          </p>
          <h1 className='text-shGray-200 text-4xl leading-tight font-bold sm:text-5xl lg:text-6xl'>
            Paro Cero para plantas industriales que no pueden detenerse.
          </h1>
          <p className='text-shGray-300 max-w-xl text-base leading-relaxed sm:text-lg'>
            Conecta activos, OT, PM, inspecciones y KPIs en una sola capa de
            operacion para anticipar fallas, bajar costos y sostener la
            disponibilidad de linea.
          </p>
          <div className='flex flex-wrap items-center gap-3'>
            <a
              href='#demo'
              className={cn(
                landingButtonVariants(),
                'bg-shPrimary-400 text-shBackground hover:bg-shPrimary-300 h-11 px-6 text-sm font-semibold',
              )}
            >
              Solicitar demo
            </a>
            <a
              href='#solucion'
              className={cn(
                landingButtonVariants({ variant: 'outline' }),
                'border-shGray-500 bg-shBackground/20 text-shGray-200 hover:bg-shGray-700/40 h-11 px-6 text-sm',
              )}
            >
              Conocer la solucion
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
