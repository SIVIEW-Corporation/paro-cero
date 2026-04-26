'use client';

import Link from 'next/link';

import { useReducedMotion } from 'motion/react';
import * as motion from 'motion/react-client';

import type { FooterPageContent } from '@/app/(footer-pages)/_content/footer-pages';
import { landingButtonVariants } from '@/components/landing/button-variants';
import { cn } from '@/lib/utils';

interface TimelineItem {
  number: string;
  title: string;
  description: string;
  bullets: string[];
}

interface TimelinePhaseProps {
  item: TimelineItem;
  index: number;
  isLast: boolean;
}

const phaseTransition = {
  duration: 0.6,
  ease: [0.22, 1, 0.36, 1],
} as const;

function cleanPhaseTitle(title: string) {
  return title.replace(/^\d{2}\s[—-]\s/, '');
}

function TimelinePhase({ item, index, isLast }: TimelinePhaseProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.article
      className='relative grid gap-5 py-10 md:grid-cols-[8rem_1fr] md:gap-10 md:py-12'
      initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.24, margin: '0px 0px -80px 0px' }}
      transition={{ ...phaseTransition, delay: index * 0.12 }}
    >
      {!isLast ? (
        <div className='bg-app-brand/35 absolute top-20 bottom-0 left-5 w-px md:left-16' />
      ) : null}

      <div className='relative flex items-start gap-4 md:block'>
        <div className='border-app-brand/45 bg-app-brand-soft/10 text-app-brand relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border text-sm font-semibold shadow-[0_0_24px_rgb(216_155_43_/_0.16)] md:mx-auto'>
          {item.number}
        </div>
        <p className='text-app-brand/20 pointer-events-none text-6xl leading-none font-semibold tracking-[-0.08em] md:mt-5 md:text-center md:text-7xl'>
          {item.number}
        </p>
      </div>

      <div className='border-app-border-soft border-t pt-5 md:pt-8'>
        <h2 className='text-app-text-primary text-2xl leading-tight font-semibold md:text-3xl'>
          {cleanPhaseTitle(item.title)}
        </h2>
        <p className='text-app-text-secondary mt-3 max-w-3xl text-base leading-relaxed'>
          {item.description}
        </p>
        <ul className='mt-6 grid gap-3 lg:grid-cols-3'>
          {item.bullets.slice(0, 4).map((bullet) => (
            <li
              key={bullet}
              className='border-app-brand/35 text-app-text-secondary border-l pl-4 text-sm leading-relaxed'
            >
              <span className='text-app-brand mr-2'>•</span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.article>
  );
}

interface GuiaImplementacionTemplateProps {
  page: FooterPageContent;
}

export default function GuiaImplementacionTemplate({
  page,
}: GuiaImplementacionTemplateProps) {
  const phases: TimelineItem[] = page.sections
    .filter(
      (s) =>
        s.title.includes('Arranque') ||
        s.title.includes('Diseño') ||
        s.title.includes('Adopción'),
    )
    .map((section, i) => ({
      number: String(i + 1).padStart(2, '0'),
      title: section.title,
      description: section.description,
      bullets: section.bullets,
    }));

  const cta = page.cta;

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

        <section className='mb-12'>
          <p className='text-app-brand mb-3 text-xs font-semibold tracking-[0.14em] uppercase'>
            {page.category}
          </p>
          <h1 className='text-app-text-primary text-3xl leading-tight font-semibold md:text-5xl'>
            {page.title}
          </h1>
          <p className='text-app-text-primary mt-4 text-lg font-medium md:text-xl'>
            {page.subtitle}
          </p>
          <p className='text-app-text-secondary mt-4 max-w-2xl text-base leading-relaxed'>
            {page.intro}
          </p>
        </section>

        <section className='relative mt-14 max-w-5xl md:mt-20'>
          {phases.map((phase, i) => (
            <TimelinePhase
              key={phase.title}
              item={phase}
              index={i}
              isLast={i === phases.length - 1}
            />
          ))}
        </section>

        <section className='border-app-border-soft bg-app-surface/70 relative mt-6 overflow-hidden rounded-[2rem] border p-8 shadow-2xl shadow-black/20 md:mt-10 md:p-10'>
          <div className='bg-app-brand/70 absolute top-0 right-8 left-8 h-px' />
          <h3 className='text-app-text-primary text-2xl font-semibold md:text-3xl'>
            {cta.title}
          </h3>
          <p className='text-app-text-secondary mt-3 max-w-2xl text-base'>
            {cta.description}
          </p>
          <div className='mt-6 flex flex-wrap gap-3'>
            <Link
              href={cta.primaryHref}
              className={cn(landingButtonVariants(), 'h-10 px-5 font-semibold')}
            >
              {cta.primaryLabel}
            </Link>
            <Link
              href={cta.secondaryHref}
              className={cn(
                landingButtonVariants({ variant: 'outline' }),
                'h-10 px-4',
              )}
            >
              {cta.secondaryLabel}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
