import Image from 'next/image';
import Link from 'next/link';

import { landingButtonVariants } from '@/components/landing/button-variants';
import ScrollReveal from '@/components/landing/ScrollReveal';
import { cn } from '@/lib/utils';

export default function Hero() {
  return (
    <section className='bg-app-bg relative min-h-[calc(100svh-4rem)] overflow-hidden'>
      {/* Place the local hero image at: public/images/hero/paro-cero-hero.jpg */}
      <Image
        src='/images/hero/paro-cero-hero.webp'
        alt='Equipo tecnico inspeccionando activos industriales en planta'
        fill
        priority
        className='object-cover object-[68%_center] opacity-90 saturate-100 md:object-right'
      />

      <div className='absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0.9)_42%,rgba(255,255,255,0.28)_68%,transparent_100%)] md:bg-[linear-gradient(100deg,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0.84)_42%,rgba(255,255,255,0.18)_62%,transparent_82%)]' />
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,rgba(216,155,43,0.12),transparent_34%),radial-gradient(circle_at_8%_82%,rgba(255,255,255,0.28),transparent_30%)]' />

      <div className='relative container flex min-h-[calc(100svh-4rem)] items-end py-16 md:items-center'>
        <ScrollReveal className='max-w-3xl space-y-7'>
          <p className='text-shAccent-600/80 text-xs font-semibold tracking-[0.26em] uppercase'>
            Plataforma de excelencia operacional
          </p>
          <h1 className='font-inter from-shNeutral-700 to-shAccent-600 via-shNeutral-600 bg-linear-to-tl bg-clip-text text-3xl leading-snug font-bold text-transparent sm:text-4xl lg:text-5xl'>
            <span className='text-shAccent-600 text-4xl font-black sm:text-5xl lg:text-6xl'>
              Paro Cero
            </span>{' '}
            <br />
            para plantas industriales
            <br />
            que no pueden detenerse.
          </h1>
          <p className='text-shNeutral-600 max-w-2/3 text-base sm:text-lg'>
            Conecta activos, OT, PM, inspecciones y KPIs en una sola capa de
            operacion para anticipar fallas, bajar costos y sostener la
            disponibilidad de linea.
          </p>
          <div className='flex flex-wrap items-center gap-3'>
            <Link
              href='/demo'
              className={cn(
                landingButtonVariants(),
                'h-11 px-6 text-sm font-semibold',
              )}
            >
              Solicitar demo
            </Link>
            <a
              href='#solucion'
              className={cn(
                landingButtonVariants({ variant: 'outline' }),
                'h-11 px-6 text-sm',
              )}
            >
              Conocer la solucion
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
