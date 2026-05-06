'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import ScrollReveal from '@/components/landing/ScrollReveal';

const industries = [
  {
    name: 'Manufactura continua',
    imageSrc: '/images/carrusel/manufactura.webp',
  },
  {
    name: 'Alimentos y bebidas',
    imageSrc: '/images/carrusel/alimentos.webp',
  },
  {
    name: 'Minería y metalurgia',
    imageSrc: '/images/carrusel/mineria.webp',
  },
  {
    name: 'Energía y servicios industriales',
    imageSrc: '/images/carrusel/energia.webp',
  },
  {
    name: 'Plástico, polímeros y empaque',
    imageSrc: '/images/carrusel/plastico.webp',
  },
  {
    name: 'Logística y distribución',
    imageSrc: '/images/carrusel/logistica.webp',
  },
] as const;

const CAROUSEL_DIRECTION = {
  PREVIOUS: 'previous',
  NEXT: 'next',
} as const;

type CarouselDirection =
  (typeof CAROUSEL_DIRECTION)[keyof typeof CAROUSEL_DIRECTION];

const AUTOPLAY_INTERVAL_MS = 4500;

function clampCarouselIndex(index: number) {
  if (index < 0) {
    return industries.length - 1;
  }

  if (index >= industries.length) {
    return 0;
  }

  return index;
}

function scrollCarouselToIndex(carousel: HTMLDivElement, index: number) {
  const card = carousel.children[index];

  if (!(card instanceof HTMLElement)) {
    return;
  }

  carousel.scrollTo({
    left: card.offsetLeft - (carousel.clientWidth - card.clientWidth) / 2,
    behavior: 'smooth',
  });
}

function getCenteredCarouselIndex(carousel: HTMLDivElement) {
  const carouselCenter = carousel.scrollLeft + carousel.clientWidth / 2;
  let closestIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  Array.from(carousel.children).forEach((child, index) => {
    if (!(child instanceof HTMLElement)) {
      return;
    }

    const childCenter = child.offsetLeft + child.clientWidth / 2;
    const distance = Math.abs(carouselCenter - childCenter);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  return closestIndex;
}

export default function IndustriesSection() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplayKey, setAutoplayKey] = useState(0);

  const scrollCarousel = (direction: CarouselDirection) => {
    const carousel = carouselRef.current;

    if (!carousel) {
      return;
    }

    const nextIndex = clampCarouselIndex(
      activeIndex + (direction === CAROUSEL_DIRECTION.NEXT ? 1 : -1),
    );

    setActiveIndex(nextIndex);
    setAutoplayKey((currentKey) => currentKey + 1);
    scrollCarouselToIndex(carousel, nextIndex);
  };

  const updateActiveIndustry = () => {
    const carousel = carouselRef.current;

    if (!carousel) {
      return;
    }

    setActiveIndex(getCenteredCarouselIndex(carousel));
  };

  useEffect(() => {
    const carousel = carouselRef.current;

    if (!carousel) {
      return;
    }

    const updateCenteredIndustry = () => {
      setActiveIndex(getCenteredCarouselIndex(carousel));
    };

    const frameId = window.requestAnimationFrame(updateCenteredIndustry);

    window.addEventListener('resize', updateCenteredIndustry);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', updateCenteredIndustry);
    };
  }, []);

  useEffect(() => {
    if (isPaused) {
      return;
    }

    const intervalId = window.setInterval(() => {
      const carousel = carouselRef.current;

      if (!carousel) {
        return;
      }

      const nextIndex = clampCarouselIndex(activeIndex + 1);

      setActiveIndex(nextIndex);
      scrollCarouselToIndex(carousel, nextIndex);
    }, AUTOPLAY_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [activeIndex, autoplayKey, isPaused]);

  return (
    <section id='industrias' className='bg-app-section-clean scroll-mt-24'>
      <div className='container py-24'>
        <div className='mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between'>
          <ScrollReveal className='max-w-3xl space-y-4'>
            <div className='flex items-center gap-3'>
              <span className='bg-app-brand h-1.5 w-8 rounded-full' />
              <p className='text-shAccent-500 from-shNeutral-600 to-shNeutral-800/85 w-fit bg-linear-to-b px-2 py-1 text-xs font-bold tracking-[0.2em] uppercase shadow-xs lg:text-sm'>
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
            onScroll={updateActiveIndustry}
            className='flex snap-x snap-mandatory gap-5 overflow-x-auto overflow-y-hidden scroll-smooth py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
          >
            {industries.map((industry, index) => (
              <ScrollReveal
                key={industry.name}
                delay={index * 70}
                className='shrink-0 basis-full snap-start md:basis-[calc((100%-1.25rem)/2)] lg:basis-[calc((100%-2.5rem)/3)]'
              >
                <article
                  className={`group transition-all duration-500 ease-out ${
                    activeIndex === index
                      ? 'scale-[1.02] opacity-100'
                      : 'scale-[0.94] opacity-70'
                  }`}
                >
                  <div
                    className={`border-app-border-soft bg-app-surface relative aspect-9/16 overflow-hidden rounded-[2rem] border shadow-sm transition-all duration-500 ease-out ${
                      activeIndex === index
                        ? 'border-app-brand/60 shadow-xl'
                        : 'hover:opacity-90 hover:shadow-md'
                    }`}
                  >
                    <Image
                      src={industry.imageSrc}
                      alt={industry.name}
                      fill
                      sizes='(min-width: 1024px) 31vw, (min-width: 768px) 38vw, 82vw'
                      className='object-cover transition-transform duration-700 ease-out group-hover:scale-105'
                    />
                  </div>

                  <p className='text-app-text-primary mt-4 text-center text-sm font-semibold md:text-base'>
                    {industry.name}
                  </p>
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
