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
        src='/images/hero/paro-cero-hero.jpg'
        alt='Equipo tecnico inspeccionando activos industriales en planta'
        fill
        priority
        className='object-cover opacity-20 saturate-75'
      />

      <div className='absolute inset-0 bg-[linear-gradient(100deg,rgba(245,247,250,0.98),rgba(245,247,250,0.88)_48%,rgba(245,247,250,0.98))]' />
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,rgba(216,155,43,0.18),transparent_38%),radial-gradient(circle_at_8%_82%,rgba(203,213,225,0.45),transparent_34%)]' />

      <div className='relative container flex min-h-[calc(100svh-4rem)] items-end py-16 md:items-center'>
        <ScrollReveal className='max-w-3xl space-y-7'>
          <p className='text-app-brand text-xs font-semibold tracking-[0.26em] uppercase'>
            Plataforma de excelencia operacional
          </p>
          <h1 className='text-app-text-primary text-4xl leading-tight font-bold tracking-tight sm:text-5xl lg:text-6xl'>
            Paro Cero para plantas industriales que no pueden detenerse.
          </h1>
          <p className='text-app-text-secondary max-w-xl text-base leading-relaxed sm:text-lg'>
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
