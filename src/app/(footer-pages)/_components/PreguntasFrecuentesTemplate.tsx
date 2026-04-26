'use client';

import { useState } from 'react';
import Link from 'next/link';

import { useReducedMotion } from 'motion/react';
import * as motion from 'motion/react-client';

import type { FooterPageContent } from '@/app/(footer-pages)/_content/footer-pages';
import { landingButtonVariants } from '@/components/landing/button-variants';
import { cn } from '@/lib/utils';

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: '¿Qué es PM0 y para qué sirve?',
    answer:
      'PM0 es una plataforma para estructurar la operación de mantenimiento industrial. Permite organizar activos, órdenes de trabajo, mantenimiento preventivo, inspecciones y KPIs en un solo sistema. Su objetivo es reducir paros no planeados y mejorar la ejecución operativa.',
  },
  {
    question: '¿Cuánto tiempo toma implementar PM0?',
    answer:
      'Depende del tamaño de la operación. Operaciones pequeñas: 2–4 semanas. Operaciones medianas: 4–8 semanas. El objetivo es lograr valor desde las primeras semanas, no esperar meses.',
  },
  {
    question: '¿Necesito tener todos mis datos listos?',
    answer:
      'No. PM0 está diseñado para comenzar con lo esencial e ir estructurando la información progresivamente. Se priorizan equipos críticos y procesos clave.',
  },
  {
    question: '¿PM0 reemplaza un ERP?',
    answer:
      'No. PM0 se enfoca exclusivamente en mantenimiento industrial. Puede convivir con ERP existentes y complementar su funcionalidad operativa.',
  },
  {
    question: '¿Qué pasa si mi equipo no está acostumbrado a usar sistemas?',
    answer:
      'La adopción es parte del proceso. Se trabaja con capacitación por perfil, acompañamiento inicial y ajustes según uso real. El sistema se adapta a la operación, no al revés.',
  },
  {
    question: '¿Se puede usar en múltiples plantas?',
    answer:
      'Sí. PM0 permite estructurar múltiples ubicaciones, activos y equipos dentro de una misma organización.',
  },
  {
    question: '¿Cómo se mide el impacto?',
    answer:
      'A través de reducción de paros no planeados, cumplimiento de mantenimiento, backlog controlado y tiempo de respuesta. Los KPIs se definen desde el inicio.',
  },
  {
    question: '¿Qué incluye la implementación?',
    answer:
      'Estructuración de activos, configuración de órdenes, planes de mantenimiento, capacitación inicial y acompañamiento operativo.',
  },
  {
    question: '¿Qué pasa después de implementar?',
    answer:
      'Se entra en fase de operación: seguimiento de KPIs, ajustes de proceso y mejora continua.',
  },
  {
    question: '¿Se puede usar PM0 sin sensores o IoT?',
    answer:
      'Sí. PM0 no depende de sensores para generar valor. Puede operar con datos capturados por técnicos, supervisores y planificadores: órdenes, inspecciones, fallas, hallazgos, tiempos y cumplimiento preventivo. IoT puede sumarse después si la operación lo justifica.',
  },
  {
    question: '¿Qué cambia para los técnicos en campo?',
    answer:
      'Cambia la forma de recibir, ejecutar y cerrar trabajo. El técnico ve qué debe hacer, en qué activo, con qué prioridad y qué evidencia debe dejar. La carga administrativa se reduce cuando el cierre está pensado para capturar datos útiles, no para llenar formularios sin impacto.',
  },
  {
    question: '¿PM0 ayuda a reducir paros no planeados?',
    answer:
      'Sí, cuando se usa para ordenar ejecución y seguimiento. PM0 ayuda a controlar preventivos vencidos, fallas recurrentes, activos sin historial, prioridades poco claras y cierres sin evidencia. Con esa trazabilidad, el equipo puede detectar patrones y ajustar rutinas antes de que la falla escale.',
  },
  {
    question: '¿Qué información se necesita para estructurar los activos?',
    answer:
      'Se parte de datos mínimos: nombre del equipo, ubicación, área, tipo de activo, criticidad, responsable y estado operativo. Luego se agregan datos técnicos, repuestos, rutinas, historial y documentación. Lo importante es construir una jerarquía clara que el equipo use todos los días.',
  },
  {
    question: '¿PM0 es solo para mantenimiento preventivo?',
    answer:
      'No. El preventivo es una parte del sistema. PM0 también organiza activos, órdenes correctivas, inspecciones, backlog, evidencia de cierre, reportes y KPIs. El valor aparece cuando todo eso queda conectado en un ciclo operativo único.',
  },
];

const contentTransition = {
  duration: 0.24,
  ease: [0.22, 1, 0.36, 1],
} as const;

function AccordionItem({
  item,
  index,
  isOpen,
  onToggle,
}: {
  item: FAQItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const shouldReduceMotion = useReducedMotion();
  const contentId = `faq-answer-${index}`;

  return (
    <div className='border-app-border-soft border-b'>
      <button
        type='button'
        onClick={onToggle}
        className={cn(
          'group flex w-full items-start justify-between gap-5 py-6 text-left',
          'hover:text-app-brand focus-visible:ring-app-brand/50 focus-visible:ring-offset-app-bg transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        )}
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <span className='text-app-text-primary group-hover:text-app-brand max-w-2xl text-base leading-snug font-medium transition-colors duration-200 md:text-lg'>
          {item.question}
        </span>
        <span
          className={cn(
            'border-app-border-soft text-app-brand grid size-7 shrink-0 place-items-center rounded-full border text-lg leading-none font-light transition-transform duration-200 motion-reduce:transition-none',
            isOpen && 'rotate-45',
          )}
          aria-hidden='true'
        >
          +
        </span>
      </button>

      <motion.div
        id={contentId}
        className='overflow-hidden'
        initial={false}
        animate={
          isOpen
            ? { height: 'auto', opacity: 1 }
            : { height: 0, opacity: shouldReduceMotion ? 1 : 0 }
        }
        transition={shouldReduceMotion ? { duration: 0 } : contentTransition}
      >
        <p className='text-app-text-secondary max-w-3xl pb-6 text-sm leading-relaxed md:text-base'>
          {item.answer}
        </p>
      </motion.div>
    </div>
  );
}

interface PreguntasFrecuentesTemplateProps {
  page: FooterPageContent;
}

export default function PreguntasFrecuentesTemplate({
  page,
}: PreguntasFrecuentesTemplateProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <main className='public-shell bg-app-bg text-app-text-primary min-h-screen'>
      <div className='container py-14 md:py-20'>
        <nav className='text-app-text-muted mb-6 text-xs tracking-[0.08em] uppercase'>
          <Link
            href='/'
            className='hover:text-app-brand-dark transition-colors duration-200'
          >
            Inicio
          </Link>
          <span className='mx-2'>/</span>
          <span>{page.category}</span>
          <span className='mx-2'>/</span>
          <span className='text-app-text-secondary'>{page.title}</span>
        </nav>

        <section className='mb-12 max-w-3xl'>
          <p className='text-app-brand mb-3 text-xs font-semibold tracking-[0.14em] uppercase'>
            {page.category}
          </p>
          <h1 className='text-app-text-primary text-3xl leading-tight font-semibold md:text-5xl'>
            {page.title}
          </h1>
          <p className='text-app-text-secondary mt-4 text-lg md:text-xl'>
            {page.subtitle}
          </p>
          <p className='text-app-text-secondary mt-4 max-w-2xl text-base leading-relaxed'>
            {page.intro}
          </p>
        </section>

        <section
          className='mx-auto w-full max-w-4xl'
          aria-label='Preguntas frecuentes'
        >
          {faqItems.map((item, index) => (
            <AccordionItem
              key={item.question}
              item={item}
              index={index}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
            />
          ))}
        </section>

        <section className='border-app-border-soft mx-auto mt-12 max-w-3xl border-t pt-10'>
          <h3 className='text-app-text-primary text-xl font-semibold'>
            {page.cta.title}
          </h3>
          <p className='text-app-text-secondary mt-2 text-sm'>
            {page.cta.description}
          </p>
          <div className='mt-6 flex flex-wrap gap-3'>
            <Link
              href={page.cta.primaryHref}
              className={cn(landingButtonVariants(), 'h-10 px-5 font-semibold')}
            >
              {page.cta.primaryLabel}
            </Link>
            <Link
              href={page.cta.secondaryHref}
              className={cn(
                landingButtonVariants({ variant: 'outline' }),
                'h-10 px-4',
              )}
            >
              {page.cta.secondaryLabel}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
