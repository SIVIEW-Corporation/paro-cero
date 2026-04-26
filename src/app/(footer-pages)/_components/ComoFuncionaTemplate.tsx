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

interface ComoFuncionaTemplateProps {
  page: FooterPageContent;
}

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

interface ComparisonSectionProps {
  before: FooterPageSection;
  after: FooterPageSection;
}

interface TimelineStepProps {
  step: FooterPageSection;
  index: number;
  isLast: boolean;
}

interface SingleSectionProps {
  section: FooterPageSection;
}

const revealTransition = {
  duration: 0.68,
  ease: [0.22, 1, 0.36, 1],
} as const;

function Reveal({ children, className, delay = 0 }: RevealProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18, margin: '0px 0px -80px 0px' }}
      transition={{ ...revealTransition, delay: delay / 1000 }}
    >
      {children}
    </motion.div>
  );
}

function ComparisonSection({ before, after }: ComparisonSectionProps) {
  return (
    <Reveal>
      <section className='border-app-border-soft bg-app-surface/70 relative overflow-hidden rounded-[2rem] border p-6 shadow-2xl shadow-black/20 md:p-10'>
        <div className='bg-app-brand/70 absolute top-0 bottom-0 left-1/2 hidden w-px opacity-60 md:block' />
        <div className='bg-app-brand absolute top-0 right-8 left-8 h-px opacity-70' />
        <div className='mb-8 max-w-3xl'>
          <p className='text-app-brand mb-3 text-xs font-semibold tracking-[0.22em] uppercase'>
            De operación reactiva a operación controlada
          </p>
          <h2 className='text-app-text-primary text-2xl leading-tight font-semibold md:text-4xl'>
            El cambio no es sumar pantallas: es ordenar el flujo de trabajo.
          </h2>
        </div>

        <div className='grid gap-8 md:grid-cols-2 md:gap-14'>
          <div className='md:pr-2'>
            <p className='text-app-text-muted mb-2 text-xs font-semibold tracking-[0.18em] uppercase'>
              {before.title}
            </p>
            <p className='text-app-text-primary text-base leading-relaxed font-medium'>
              {before.description}
            </p>
            <ul className='mt-6 space-y-3'>
              {before.bullets.map((bullet) => (
                <li
                  key={bullet}
                  className='text-app-text-secondary flex items-start gap-3 text-sm leading-relaxed'
                >
                  <span className='mt-2 block size-1.5 shrink-0 rounded-full bg-red-400/70' />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className='border-app-border-soft border-t pt-8 md:border-t-0 md:pt-0 md:pl-2'>
            <p className='text-app-brand mb-2 text-xs font-semibold tracking-[0.18em] uppercase'>
              {after.title}
            </p>
            <p className='text-app-text-primary text-base leading-relaxed font-medium'>
              {after.description}
            </p>
            <ul className='mt-6 space-y-3'>
              {after.bullets.map((bullet) => (
                <li
                  key={bullet}
                  className='text-app-text-secondary flex items-start gap-3 text-sm leading-relaxed'
                >
                  <span className='bg-app-brand mt-2 block size-1.5 shrink-0 rounded-full' />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </Reveal>
  );
}

function TimelineStep({ step, index, isLast }: TimelineStepProps) {
  const stage = String(index).padStart(2, '0');

  return (
    <Reveal delay={index * 120}>
      <article className='relative grid gap-5 py-8 md:grid-cols-[10rem_1fr] md:gap-10 md:py-10'>
        {!isLast ? (
          <div className='bg-app-brand/50 absolute top-20 bottom-0 left-5 w-px transition-opacity duration-700 md:left-[5rem]' />
        ) : null}

        <div className='relative flex items-start gap-4 md:block'>
          <div className='border-app-brand/40 bg-app-brand-soft/10 text-app-brand relative z-10 flex size-10 items-center justify-center rounded-full border text-sm font-semibold shadow-[0_0_24px_rgb(216_155_43_/_0.16)] md:mx-auto'>
            {stage}
          </div>
          <p className='text-app-text-muted pointer-events-none text-6xl leading-none font-semibold tracking-[-0.08em] md:mt-5 md:text-center md:text-7xl'>
            {stage}
          </p>
        </div>

        <div className='border-app-border-soft border-t pt-5 md:pt-8'>
          <h3 className='text-app-text-primary text-2xl leading-tight font-semibold md:text-3xl'>
            {step.title.replace(/^Paso \d: /, '')}
          </h3>
          <p className='text-app-text-secondary mt-3 max-w-3xl text-base leading-relaxed'>
            {step.description}
          </p>
          <ul className='mt-6 grid gap-3 lg:grid-cols-3'>
            {step.bullets.slice(0, 3).map((bullet) => (
              <li
                key={bullet}
                className='text-app-text-secondary border-app-border-soft border-l pl-4 text-sm leading-relaxed'
              >
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      </article>
    </Reveal>
  );
}

function TimelineSection({ steps }: { steps: FooterPageSection[] }) {
  return (
    <section className='mt-16 md:mt-24'>
      <Reveal>
        <div className='max-w-3xl'>
          <p className='text-app-brand mb-3 text-xs font-semibold tracking-[0.22em] uppercase'>
            Flujo operativo PM0
          </p>
          <h2 className='text-app-text-primary text-3xl leading-tight font-semibold md:text-5xl'>
            Tres etapas conectadas para pasar de reacción a control.
          </h2>
        </div>
      </Reveal>

      <div className='mt-6 md:mt-10'>
        {steps.map((step, index) => (
          <TimelineStep
            key={step.title}
            step={step}
            index={index + 1}
            isLast={index === steps.length - 1}
          />
        ))}
      </div>
    </section>
  );
}

function ImpactSection({ section }: SingleSectionProps) {
  return (
    <Reveal>
      <section className='border-app-border-soft bg-app-surface/80 mt-16 overflow-hidden rounded-[2rem] border md:mt-24'>
        <div className='grid gap-8 p-6 md:grid-cols-[0.85fr_1.15fr] md:p-10'>
          <div>
            <p className='text-app-brand mb-3 text-xs font-semibold tracking-[0.22em] uppercase'>
              {section.title}
            </p>
            <h2 className='text-app-text-primary text-3xl leading-tight font-semibold md:text-4xl'>
              Control visible en el trabajo diario, no solo en el reporte
              mensual.
            </h2>
            <p className='text-app-text-secondary mt-4 text-base leading-relaxed'>
              {section.description}
            </p>
          </div>

          <div className='border-app-border-soft grid border-t pt-6 sm:grid-cols-2 md:border-t-0 md:border-l md:pt-0 md:pl-8'>
            {section.bullets.map((bullet) => (
              <div
                key={bullet}
                className='border-app-border-soft border-b py-5 sm:pl-6'
              >
                <p className='text-app-brand mb-3 text-xs font-semibold tracking-[0.16em] uppercase'>
                  Impacto
                </p>
                <p className='text-app-text-primary text-base leading-relaxed font-semibold'>
                  {bullet}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Reveal>
  );
}

function NotPm0Section({ section }: SingleSectionProps) {
  return (
    <Reveal>
      <section className='mt-16 md:mt-24'>
        <div className='border-app-brand/40 bg-app-brand-soft/10 rounded-[2rem] border-l-2 px-6 py-8 md:px-10 md:py-12'>
          <p className='text-app-brand mb-3 text-xs font-semibold tracking-[0.22em] uppercase'>
            {section.title}
          </p>
          <h2 className='text-app-text-primary max-w-4xl text-3xl leading-tight font-semibold md:text-5xl'>
            PM0 no maquilla desorden operativo. Lo convierte en proceso
            gobernable.
          </h2>
          <p className='text-app-text-secondary mt-5 max-w-3xl text-base leading-relaxed'>
            {section.description}
          </p>
          <div className='border-app-border-soft mt-8 divide-y border-y'>
            {section.bullets.map((bullet) => (
              <p
                key={bullet}
                className='text-app-text-primary py-4 text-lg leading-relaxed font-medium'
              >
                {bullet}
              </p>
            ))}
          </div>
        </div>
      </section>
    </Reveal>
  );
}

function CtaSection({ page }: ComoFuncionaTemplateProps) {
  return (
    <Reveal>
      <section className='border-app-border-soft bg-app-surface/80 relative mt-16 overflow-hidden rounded-[2rem] border p-6 shadow-2xl shadow-black/20 md:mt-24 md:p-10'>
        <div className='bg-app-brand absolute top-0 right-10 left-10 h-px opacity-80' />
        <div className='max-w-3xl'>
          <p className='text-app-brand mb-3 text-xs font-semibold tracking-[0.22em] uppercase'>
            Siguiente paso
          </p>
          <h2 className='text-app-text-primary text-3xl leading-tight font-semibold md:text-5xl'>
            {page.cta.title}
          </h2>
          <p className='text-app-text-secondary mt-4 text-base leading-relaxed md:text-lg'>
            {page.cta.description}
          </p>
        </div>

        <div className='mt-8 flex flex-col gap-3 sm:flex-row'>
          <Link
            href={page.cta.primaryHref}
            className={cn(
              landingButtonVariants(),
              'h-11 px-5 font-semibold hover:-translate-y-0.5',
            )}
          >
            {page.cta.primaryLabel}
          </Link>
          <Link
            href={page.cta.secondaryHref}
            className={cn(
              landingButtonVariants({ variant: 'outline' }),
              'h-11 px-5 hover:-translate-y-0.5',
            )}
          >
            {page.cta.secondaryLabel}
          </Link>
        </div>
      </section>
    </Reveal>
  );
}

export default function ComoFuncionaTemplate({
  page,
}: ComoFuncionaTemplateProps) {
  const before = page.sections.find(
    (section) => section.title === 'Antes de PM0',
  );
  const after = page.sections.find(
    (section) => section.title === 'Qué cambia con PM0',
  );
  const steps = page.sections.filter((section) =>
    section.title.startsWith('Paso '),
  );
  const impact = page.sections.find(
    (section) => section.title === 'Impacto operativo',
  );
  const notPm0 = page.sections.find(
    (section) => section.title === 'Qué no es PM0',
  );

  return (
    <main className='como-funciona-shell public-shell bg-app-bg text-app-text-primary min-h-screen'>
      <div className='container py-14 md:py-20'>
        <nav className='text-app-text-muted mb-8 text-xs tracking-[0.08em] uppercase'>
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

        <Reveal>
          <section className='border-app-border-soft bg-app-surface/70 relative mb-14 overflow-hidden rounded-[2rem] border p-6 shadow-2xl shadow-black/20 md:mb-20 md:p-12'>
            <div className='bg-app-brand absolute top-0 right-10 left-10 h-px opacity-80' />
            <div className='max-w-5xl'>
              <p className='text-app-brand mb-4 text-xs font-semibold tracking-[0.22em] uppercase'>
                {page.category}
              </p>
              <h1 className='text-app-text-primary max-w-4xl text-4xl leading-[0.95] font-semibold tracking-[-0.04em] md:text-7xl'>
                {page.title}
              </h1>
              <p className='text-app-text-primary mt-6 max-w-4xl text-xl leading-tight font-medium md:text-3xl'>
                {page.subtitle}
              </p>
              <p className='text-app-text-secondary mt-6 max-w-3xl text-base leading-relaxed md:text-lg'>
                {page.intro}
              </p>
            </div>
          </section>
        </Reveal>

        {before && after ? (
          <ComparisonSection before={before} after={after} />
        ) : null}

        {steps.length ? <TimelineSection steps={steps} /> : null}

        {impact ? <ImpactSection section={impact} /> : null}

        {notPm0 ? <NotPm0Section section={notPm0} /> : null}

        <CtaSection page={page} />
      </div>
    </main>
  );
}
