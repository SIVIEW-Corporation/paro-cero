'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';

import { useReducedMotion } from 'motion/react';
import * as motion from 'motion/react-client';

import type {
  FooterPageContent,
  FooterPageSection,
} from '@/app/(footer-pages)/_content/footer-pages';
import { landingButtonVariants } from '@/components/landing/button-variants';
import { cn } from '@/lib/utils';

interface SobreParoCeroTemplateProps {
  page: FooterPageContent;
}

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

interface NarrativeSectionProps {
  section: FooterPageSection;
  index: number;
}

const revealTransition = {
  duration: 0.7,
  ease: [0.22, 1, 0.36, 1],
} as const;

const sectionLabels = [
  'Problema',
  'Insight',
  'Solución',
  'Filosofía',
  'Visión',
] as const;

function Reveal({ children, className, delay = 0 }: RevealProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.22, margin: '0px 0px -90px 0px' }}
      transition={{ ...revealTransition, delay: delay / 1000 }}
    >
      {children}
    </motion.div>
  );
}

function Breadcrumb({ page }: SobreParoCeroTemplateProps) {
  return (
    <nav className='text-app-text-muted mb-8 text-xs tracking-[0.08em] uppercase md:mb-10'>
      <Link
        href='/'
        className='hover:text-app-brand transition-colors duration-200'
      >
        Inicio
      </Link>
      <span className='mx-2'>/</span>
      <span>{page.category}</span>
      <span className='mx-2'>/</span>
      <span className='text-app-text-secondary'>{page.title}</span>
    </nav>
  );
}

function Hero({ page }: SobreParoCeroTemplateProps) {
  return (
    <Reveal>
      <header className='border-app-border-soft border-b pb-14 md:pb-20'>
        <div className='max-w-5xl'>
          <p className='text-app-brand mb-5 text-xs font-semibold tracking-[0.22em] uppercase'>
            Empresa / PM0
          </p>
          <h1 className='text-app-text-primary max-w-5xl text-4xl leading-[0.98] font-semibold tracking-[-0.045em] md:text-7xl lg:text-8xl'>
            Mantenimiento industrial bajo control operativo.
          </h1>
          <p className='text-app-text-primary mt-8 max-w-3xl text-xl leading-tight font-medium md:text-3xl'>
            {page.subtitle}
          </p>
          <p className='text-app-text-secondary mt-6 max-w-3xl text-base leading-relaxed md:text-lg'>
            {page.intro}
          </p>
        </div>
      </header>
    </Reveal>
  );
}

function NarrativeSection({ section, index }: NarrativeSectionProps) {
  const sectionNumber = String(index + 1).padStart(2, '0');
  const label = sectionLabels[index] ?? 'Narrativa';

  return (
    <Reveal delay={index * 90}>
      <section className='border-app-border-soft relative border-b py-14 md:py-20'>
        <div className='md:flex md:gap-12 lg:gap-20'>
          <div className='mb-8 flex shrink-0 items-center gap-4 md:mb-0 md:w-44 md:flex-col md:items-start'>
            <span className='text-app-brand text-sm font-semibold tracking-[0.18em] uppercase'>
              {sectionNumber}
            </span>
            <span className='bg-app-brand h-px w-14 opacity-70 md:w-20' />
            <span className='text-app-text-muted text-xs font-semibold tracking-[0.18em] uppercase'>
              {label}
            </span>
          </div>

          <div className='max-w-4xl'>
            <h2 className='text-app-text-primary text-3xl leading-tight font-semibold tracking-[-0.025em] md:text-5xl'>
              {section.title}
            </h2>
            <p className='text-app-text-secondary mt-5 max-w-3xl text-base leading-relaxed md:text-lg'>
              {section.description}
            </p>

            <div className='border-app-border-soft mt-9 border-t'>
              {section.bullets.map((bullet) => (
                <p
                  key={bullet}
                  className='border-app-border-soft text-app-text-primary border-b py-4 text-base leading-relaxed md:text-lg'
                >
                  <span className='text-app-brand mr-3'>•</span>
                  {bullet}
                </p>
              ))}
            </div>

            {section.note ? (
              <p className='border-app-brand/50 text-app-text-primary mt-8 border-l-2 pl-5 text-lg leading-relaxed font-medium md:text-xl'>
                {section.note}
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </Reveal>
  );
}

function OperatingSignals({ page }: SobreParoCeroTemplateProps) {
  return (
    <Reveal>
      <section className='border-app-border-soft border-b py-14 md:py-20'>
        <div className='max-w-4xl'>
          <p className='text-app-brand mb-4 text-xs font-semibold tracking-[0.22em] uppercase'>
            Dónde aplica
          </p>
          <h2 className='text-app-text-primary text-3xl leading-tight font-semibold tracking-[-0.025em] md:text-5xl'>
            PM0 tiene sentido cuando la planta necesita pasar de actividad a
            control.
          </h2>
        </div>

        <div className='divide-app-border-soft border-app-border-soft mt-10 max-w-4xl divide-y border-y'>
          {page.industrialUseCases.map((useCase) => (
            <p
              key={useCase}
              className='text-app-text-secondary py-5 text-base leading-relaxed md:text-lg'
            >
              {useCase}
            </p>
          ))}
        </div>
      </section>
    </Reveal>
  );
}

function CtaSection({ page }: SobreParoCeroTemplateProps) {
  return (
    <Reveal>
      <section className='py-14 md:py-20'>
        <div className='border-app-brand/45 border-l-2 pl-6 md:pl-10'>
          <p className='text-app-brand mb-4 text-xs font-semibold tracking-[0.22em] uppercase'>
            Siguiente paso
          </p>
          <h2 className='text-app-text-primary max-w-4xl text-3xl leading-tight font-semibold tracking-[-0.025em] md:text-5xl'>
            {page.cta.title}
          </h2>
          <p className='text-app-text-secondary mt-5 max-w-3xl text-base leading-relaxed md:text-lg'>
            {page.cta.description}
          </p>

          <div className='mt-8 flex flex-col gap-3 sm:flex-row'>
            <Link
              href={page.cta.primaryHref}
              className={cn(landingButtonVariants(), 'h-11 px-5 font-semibold')}
            >
              {page.cta.primaryLabel}
            </Link>
            <Link
              href={page.cta.secondaryHref}
              className={cn(
                landingButtonVariants({ variant: 'outline' }),
                'h-11 px-5',
              )}
            >
              {page.cta.secondaryLabel}
            </Link>
          </div>
        </div>
      </section>
    </Reveal>
  );
}

export default function SobreParoCeroTemplate({
  page,
}: SobreParoCeroTemplateProps) {
  return (
    <main className='public-shell bg-app-bg text-app-text-primary min-h-screen'>
      <div className='container max-w-[76rem] py-14 md:py-20'>
        <Breadcrumb page={page} />
        <Hero page={page} />

        <div>
          {page.sections.map((section, index) => (
            <NarrativeSection
              key={section.title}
              section={section}
              index={index}
            />
          ))}
        </div>

        <OperatingSignals page={page} />
        <CtaSection page={page} />
      </div>
    </main>
  );
}
