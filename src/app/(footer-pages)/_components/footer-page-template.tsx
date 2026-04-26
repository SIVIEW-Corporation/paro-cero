import Link from 'next/link';

import type { FooterPageContent } from '@/app/(footer-pages)/_content/footer-pages';
import { landingButtonVariants } from '@/components/landing/button-variants';
import { cn } from '@/lib/utils';

interface FooterPageTemplateProps {
  page: FooterPageContent;
}

export default function FooterPageTemplate({ page }: FooterPageTemplateProps) {
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

        <section className='border-app-border-soft mb-10 rounded-3xl border bg-[linear-gradient(135deg,#ffffff,#f8fafc)] p-8 shadow-xl shadow-slate-900/10 md:p-12'>
          <p className='text-app-brand mb-4 text-xs font-semibold tracking-[0.14em] uppercase'>
            {page.category}
          </p>
          <h1 className='text-3xl leading-tight font-semibold md:text-5xl'>
            {page.title}
          </h1>
          <p className='text-app-text-secondary mt-4 text-lg md:text-xl'>
            {page.subtitle}
          </p>
          <p className='text-app-text-secondary mt-5 max-w-4xl text-sm md:text-base'>
            {page.intro}
          </p>
        </section>

        {page.legalNotice ? (
          <section className='border-app-brand/30 bg-app-brand-soft mb-10 rounded-2xl border p-6'>
            <p className='text-app-brand-dark text-sm font-semibold tracking-wide uppercase'>
              Revisión legal requerida
            </p>
            <p className='text-app-text-primary mt-2 text-sm md:text-base'>
              {page.legalNotice}
            </p>
          </section>
        ) : null}

        <section className='grid gap-6 md:grid-cols-3'>
          {page.sections.map((section) => (
            <article
              key={section.title}
              className='border-app-border-soft bg-app-surface hover:border-app-border rounded-2xl border p-6 shadow-sm shadow-slate-900/5 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/10'
            >
              <h2 className='text-xl leading-tight font-semibold'>
                {section.title}
              </h2>
              <p className='text-app-text-secondary mt-3 text-sm'>
                {section.description}
              </p>
              <ul className='text-app-text-secondary mt-4 space-y-2 text-sm'>
                {section.bullets.map((bullet) => (
                  <li key={bullet} className='flex gap-2'>
                    <span className='text-app-brand mt-[2px]'>-</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
              {section.note ? (
                <p className='text-app-text-muted border-app-border-soft mt-4 border-t pt-3 text-xs italic'>
                  {section.note}
                </p>
              ) : null}
            </article>
          ))}
        </section>

        {page.placeholders?.length ? (
          <section className='border-app-border-soft bg-app-surface mt-12 rounded-2xl border p-6'>
            <h3 className='text-lg font-semibold'>Datos de contacto</h3>
            <ul className='text-app-text-secondary mt-4 space-y-2 text-sm'>
              {page.placeholders.map((placeholder) => (
                <li key={placeholder}>{placeholder}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {page.references.length ? (
          <section className='border-app-border-soft bg-app-surface mt-12 rounded-2xl border p-6'>
            <h3 className='text-lg font-semibold'>Referencias</h3>
            <ul className='mt-4 space-y-3 text-sm'>
              {page.references.map((reference) => (
                <li key={reference.href}>
                  <a
                    className='text-app-brand hover:text-app-brand-dark underline-offset-4 hover:underline'
                    href={reference.href}
                    target='_blank'
                    rel='noreferrer'
                  >
                    {reference.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className='border-app-border-soft mt-14 rounded-3xl border bg-[linear-gradient(130deg,#ffffff,#fff4db)] p-8 shadow-xl shadow-slate-900/10 md:p-10'>
          <h3 className='text-2xl font-semibold md:text-3xl'>
            {page.cta.title}
          </h3>
          <p className='text-app-text-secondary mt-3 max-w-3xl text-sm md:text-base'>
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
