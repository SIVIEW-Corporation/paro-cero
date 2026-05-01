'use client';

import Image from 'next/image';
import { useState, type CSSProperties } from 'react';

import ScrollReveal from '@/components/landing/ScrollReveal';
import { cn } from '@/lib/utils';

const modules = [
  {
    name: 'Gestion de Activos',
    detail:
      'Jerarquia tecnica, historial por equipo y criticidad para priorizar intervenciones.',
    icon: {
      src: '/images/icons/planta.png',
      alt: 'Icono de activos industriales',
    },
    mapPosition: 'top-3 left-1/2 -translate-x-1/2',
    connector: 'left-1/2 top-[28%] h-[18%] w-px -translate-x-1/2',
  },
  {
    name: 'Ordenes de Trabajo (OT)',
    detail:
      'Planifica, asigna y controla ejecucion con evidencias en terreno y cierres estandarizados.',
    icon: {
      src: '/images/icons/hoja.png',
      alt: 'Icono de órdenes de trabajo',
    },
    mapPosition: 'top-[22%] right-4',
    connector:
      'right-[29%] top-[37%] h-px w-[18%] rotate-[-24deg] origin-right',
  },
  {
    name: 'Mantenimiento Preventivo (PM)',
    detail:
      'Dispara rutinas por calendario, horas o condiciones para reducir fallas repetitivas.',
    icon: {
      src: '/images/icons/llaves.png',
      alt: 'Icono de mantenimiento preventivo',
    },
    mapPosition: 'right-8 bottom-[18%]',
    connector:
      'right-[31%] bottom-[37%] h-px w-[17%] rotate-[25deg] origin-right',
  },
  {
    name: 'Inspecciones Moviles',
    detail:
      'Checklists guiados para detectar condiciones inseguras y desalineaciones operativas.',
    icon: {
      src: '/images/icons/inspecciones.png',
      alt: 'Icono de inspecciones móviles',
    },
    mapPosition: 'bottom-4 left-1/2 -translate-x-1/2',
    connector: 'left-1/2 bottom-[28%] h-[18%] w-px -translate-x-1/2',
  },
  {
    name: 'KPIs y Analitica',
    detail:
      'Seguimiento de backlog, cumplimiento, tiempos de reparacion y costo por activo.',
    icon: {
      src: '/images/icons/grafica.png',
      alt: 'Icono de KPIs y analítica',
    },
    mapPosition: 'bottom-[20%] left-6',
    connector:
      'left-[30%] bottom-[38%] h-px w-[18%] rotate-[-25deg] origin-left',
  },
  {
    name: 'Alertas y Escalamiento',
    detail:
      'Notificaciones por criticidad y reglas de respuesta para no perder ventanas de accion.',
    icon: {
      src: '/images/icons/campana.png',
      alt: 'Icono de alertas y escalamiento',
    },
    mapPosition: 'top-[24%] left-3',
    connector: 'left-[28%] top-[38%] h-px w-[19%] rotate-[25deg] origin-left',
  },
] as const;

export default function ModulesSection() {
  const [activeModule, setActiveModule] = useState<number | null>(null);

  return (
    <section id='modulos' className='bg-app-section-muted scroll-mt-24'>
      <div className='container py-24'>
        <ScrollReveal className='mb-12 max-w-2xl space-y-3'>
          <p className='text-app-brand text-xs font-semibold tracking-[0.2em] uppercase'>
            Modulos
          </p>
          <h2 className='text-app-text-primary text-3xl font-semibold md:text-4xl'>
            Una plataforma, multiples frentes criticos de mantenimiento.
          </h2>
        </ScrollReveal>

        <div className='border-app-section-border bg-app-surface grid overflow-hidden rounded-3xl border shadow-sm lg:grid-cols-[0.9fr_1.4fr]'>
          <ScrollReveal className='border-app-section-border bg-app-section-soft border-b p-6 lg:border-r lg:border-b-0 lg:p-10'>
            <div className='grid grid-cols-2 gap-3 md:hidden'>
              {modules.map((module, index) => (
                <div
                  key={module.name}
                  className='public-reveal-child border-app-border-soft bg-app-surface flex flex-col items-center gap-2 rounded-2xl border p-4 text-center shadow-sm'
                  style={
                    {
                      '--public-reveal-child-delay': `${index * 50}ms`,
                    } as CSSProperties
                  }
                >
                  <Image
                    src={module.icon.src}
                    alt={module.icon.alt}
                    width={40}
                    height={40}
                    loading='lazy'
                    className='size-10 object-contain'
                  />
                  <span className='text-app-text-primary text-xs leading-snug font-semibold'>
                    {module.name}
                  </span>
                </div>
              ))}
            </div>

            <div className='border-app-border-soft bg-app-surface relative mx-auto hidden aspect-square max-w-sm rounded-full border p-8 shadow-sm md:block'>
              <div className='public-reveal-child border-app-border-soft absolute inset-7 rounded-full border' />
              <div
                className='public-reveal-child border-app-border-soft absolute inset-16 rounded-full border'
                style={
                  {
                    '--public-reveal-child-delay': '80ms',
                  } as CSSProperties
                }
              />
              <div
                className='public-reveal-child border-app-brand/30 bg-app-brand-soft shadow-app-brand/20 absolute top-1/2 left-1/2 z-10 flex size-22 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-3xl border shadow-lg'
                style={
                  {
                    '--public-reveal-child-delay': '140ms',
                  } as CSSProperties
                }
              >
                <span className='text-app-brand-dark text-sm font-semibold tracking-[0.18em]'>
                  PM0
                </span>
                <span className='text-app-text-secondary text-[10px] font-medium tracking-[0.12em] uppercase'>
                  Plataforma
                </span>
              </div>

              {modules.map((module, index) => {
                const isActive = activeModule === index;

                return (
                  <div key={module.name}>
                    <div
                      className={cn(
                        'public-reveal-child bg-app-border-soft absolute opacity-70 transition-opacity duration-200 ease-out',
                        module.connector,
                        isActive && 'opacity-100',
                      )}
                      style={
                        {
                          '--public-reveal-child-delay': `${200 + index * 50}ms`,
                        } as CSSProperties
                      }
                    />
                    <div
                      className={cn(
                        'public-reveal-child bg-app-surface border-app-border-soft absolute z-20 flex size-18 items-center justify-center rounded-2xl border shadow-sm transition-[border-color,box-shadow,transform,opacity] duration-200 ease-out',
                        module.mapPosition,
                        activeModule !== null && !isActive && 'opacity-65',
                        isActive &&
                          'border-app-border scale-105 opacity-100 shadow-md',
                      )}
                      style={
                        {
                          '--public-reveal-child-delay': `${240 + index * 50}ms`,
                        } as CSSProperties
                      }
                    >
                      <Image
                        src={module.icon.src}
                        alt={module.icon.alt}
                        width={44}
                        height={44}
                        loading='lazy'
                        className='size-11 object-contain'
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollReveal>

          <div className='divide-app-section-border divide-y'>
            {modules.map((module, index) => (
              <ScrollReveal key={module.name} delay={index * 60}>
                <article
                  className='hover:bg-app-surface-subtle grid gap-4 p-6 transition-[background-color] duration-200 ease-out sm:grid-cols-[4rem_1fr] lg:p-7'
                  onMouseEnter={() => setActiveModule(index)}
                  onMouseLeave={() => setActiveModule(null)}
                >
                  <div className='flex items-center gap-3 sm:block'>
                    <span className='text-app-brand text-sm font-semibold tracking-[0.2em]'>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <Image
                      src={module.icon.src}
                      alt=''
                      width={28}
                      height={28}
                      loading='lazy'
                      aria-hidden='true'
                      className='size-7 object-contain sm:mt-4'
                    />
                  </div>
                  <div>
                    <h3 className='text-app-text-primary text-xl font-semibold'>
                      {module.name}
                    </h3>
                    <p className='text-app-text-secondary mt-2 leading-relaxed'>
                      {module.detail}
                    </p>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
