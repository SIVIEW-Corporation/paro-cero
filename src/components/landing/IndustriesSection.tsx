'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import ScrollReveal from '@/components/landing/ScrollReveal';

const industries = [
  {
    name: 'Manufactura continua',
    description:
      'Control de activos de alta rotación, cumplimiento PM y respuesta rápida ante eventos de línea.',
    chips: ['Disponibilidad', 'OT críticas', 'Preventivo'],
    value:
      'Reduce desviaciones operativas en líneas donde detenerse no es opción.',
  },
  {
    name: 'Alimentos y bebidas',
    description:
      'Rondas de inspección trazables para asegurar inocuidad, continuidad y cumplimiento operativo.',
    chips: ['Checklists', 'Evidencia', 'Cumplimiento'],
    value:
      'Convierte inspecciones y hallazgos en acciones claras para mantenimiento.',
  },
  {
    name: 'Minería y metalurgia',
    description:
      'Planeación de mantenimientos mayores y monitoreo de equipos críticos en condiciones exigentes.',
    chips: ['Activos críticos', 'Paros mayores', 'Historial técnico'],
    value:
      'Prioriza activos de alto impacto y conserva evidencia técnica por equipo.',
  },
  {
    name: 'Energía y utilities',
    description:
      'Seguimiento de disponibilidad por unidad, análisis de causas y reducción de indisponibilidad no programada.',
    chips: ['Disponibilidad', 'Causa raíz', 'KPIs'],
    value:
      'Da visibilidad a disponibilidad, paros y desempeño operativo por unidad.',
  },
] as const;

const CAROUSEL_DIRECTION = {
  PREVIOUS: 'previous',
  NEXT: 'next',
} as const;

type CarouselDirection =
  (typeof CAROUSEL_DIRECTION)[keyof typeof CAROUSEL_DIRECTION];

const AUTOPLAY_INTERVAL_MS = 4500;
const SCROLL_EDGE_THRESHOLD_PX = 8;

function getScrollStep(carousel: HTMLDivElement) {
  const firstCard = carousel.firstElementChild;

  if (!(firstCard instanceof HTMLElement)) {
    return carousel.clientWidth;
  }

  const carouselStyles = window.getComputedStyle(carousel);
  const gap = Number.parseFloat(carouselStyles.columnGap || '0');

  return firstCard.getBoundingClientRect().width + gap;
}

function scrollCarouselByDirection(
  carousel: HTMLDivElement,
  direction: CarouselDirection,
) {
  const scrollStep = getScrollStep(carousel);
  const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;
  const isAtStart = carousel.scrollLeft <= SCROLL_EDGE_THRESHOLD_PX;
  const isAtEnd =
    carousel.scrollLeft >= maxScrollLeft - SCROLL_EDGE_THRESHOLD_PX;

  if (direction === CAROUSEL_DIRECTION.NEXT && isAtEnd) {
    carousel.scrollTo({ left: 0, behavior: 'smooth' });
    return;
  }

  if (direction === CAROUSEL_DIRECTION.PREVIOUS && isAtStart) {
    carousel.scrollTo({ left: maxScrollLeft, behavior: 'smooth' });
    return;
  }

  carousel.scrollBy({
    left: direction === CAROUSEL_DIRECTION.NEXT ? scrollStep : -scrollStep,
    behavior: 'smooth',
  });
}

export default function IndustriesSection() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const scrollCarousel = (direction: CarouselDirection) => {
    const carousel = carouselRef.current;

    if (!carousel) {
      return;
    }

    scrollCarouselByDirection(carousel, direction);
  };

  useEffect(() => {
    if (isPaused) {
      return;
    }

    const intervalId = window.setInterval(() => {
      const carousel = carouselRef.current;

      if (!carousel) {
        return;
      }

      scrollCarouselByDirection(carousel, CAROUSEL_DIRECTION.NEXT);
    }, AUTOPLAY_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isPaused]);

  return (
    <section id='industrias' className='bg-app-section-clean scroll-mt-24'>
      <div className='container py-24'>
        <div className='mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between'>
          <ScrollReveal className='max-w-3xl space-y-4'>
            <div className='flex items-center gap-3'>
              <span className='bg-app-brand h-1.5 w-8 rounded-full' />
              <p className='text-app-text-secondary text-xs font-semibold tracking-[0.2em] uppercase'>
                Industrias y casos de uso
              </p>
            </div>
            <h2 className='text-app-text-primary text-3xl font-semibold md:text-4xl'>
              Diseñado para operaciones donde cada minuto cuenta.
            </h2>
            <p className='text-app-text-secondary max-w-2xl text-base leading-relaxed md:text-lg'>
              PM0 ayuda a equipos industriales a sostener disponibilidad,
              controlar ejecución y convertir eventos de mantenimiento en
              trazabilidad accionable.
            </p>
          </ScrollReveal>

          <div className='flex items-center gap-3'>
            <button
              type='button'
              aria-label='Industria anterior'
              onClick={() => scrollCarousel(CAROUSEL_DIRECTION.PREVIOUS)}
              className='border-app-border-soft bg-app-surface text-app-text-primary hover:bg-app-surface-subtle focus-visible:ring-app-brand/30 inline-flex size-11 items-center justify-center rounded-full border shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none'
            >
              <ChevronLeft aria-hidden='true' className='size-5' />
            </button>
            <button
              type='button'
              aria-label='Industria siguiente'
              onClick={() => scrollCarousel(CAROUSEL_DIRECTION.NEXT)}
              className='border-app-border-soft bg-app-surface text-app-text-primary hover:bg-app-surface-subtle focus-visible:ring-app-brand/30 inline-flex size-11 items-center justify-center rounded-full border shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none'
            >
              <ChevronRight aria-hidden='true' className='size-5' />
            </button>
          </div>
        </div>

        <div
          className='overflow-hidden'
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocusCapture={() => setIsPaused(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setIsPaused(false);
            }
          }}
        >
          <div
            ref={carouselRef}
            className='flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
          >
            {industries.map((industry, index) => (
              <ScrollReveal
                key={industry.name}
                delay={index * 70}
                className='shrink-0 basis-[calc(100%-0.5rem)] snap-start md:basis-[calc((100%-1.25rem)/2)] lg:basis-[calc((100%-2.5rem)/3)]'
              >
                <article className='border-app-border-soft bg-app-surface group flex h-full min-h-[22.5rem] flex-col rounded-3xl border p-5 shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-md md:min-h-[23.5rem] md:p-6'>
                  <div className='mb-5 flex items-center justify-between gap-4'>
                    <span className='bg-app-brand-soft flex size-10 shrink-0 items-center justify-center rounded-2xl'>
                      <span className='bg-app-brand size-3 rounded-full transition-transform duration-200 ease-out group-hover:scale-125' />
                    </span>
                    <span className='text-app-text-muted text-xs font-semibold tracking-[0.18em] uppercase'>
                      0{index + 1}
                    </span>
                  </div>

                  <div className='space-y-3'>
                    <h3 className='text-app-text-primary text-lg leading-tight font-semibold md:text-xl'>
                      {industry.name}
                    </h3>
                    <p className='text-app-text-secondary text-sm leading-relaxed'>
                      {industry.description}
                    </p>
                  </div>

                  <div className='mt-5 flex flex-wrap gap-2'>
                    {industry.chips.map((chip) => (
                      <span
                        key={chip}
                        className='border-app-border-soft bg-app-surface-muted text-app-text-secondary rounded-full border px-3 py-1 text-xs font-medium'
                      >
                        {chip}
                      </span>
                    ))}
                  </div>

                  <div className='bg-app-surface-subtle mt-auto rounded-2xl p-3.5 md:p-4'>
                    <p className='text-app-text-muted text-xs font-semibold tracking-[0.18em] uppercase'>
                      PM0 ayuda a
                    </p>
                    <p className='text-app-text-primary mt-2 text-sm leading-relaxed font-medium'>
                      {industry.value}
                    </p>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>

        <ScrollReveal delay={320}>
          <div className='bg-app-brand-soft mt-4 rounded-2xl px-5 py-4 md:px-6'>
            <p className='text-app-text-primary max-w-3xl text-sm leading-relaxed font-medium md:text-base'>
              Cuando cada minuto de paro impacta producción, PM0 convierte
              mantenimiento en control operativo medible.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
