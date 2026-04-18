import Link from 'next/link';

import type { FooterPageContent } from '@/app/(footer-pages)/_content/footer-pages';
import { landingButtonVariants } from '@/components/landing/button-variants';
import { cn } from '@/lib/utils';

interface FooterPageTemplateProps {
  page: FooterPageContent;
}

export default function FooterPageTemplate({ page }: FooterPageTemplateProps) {
  return (
    <main className='bg-shBackground text-shGray-200 min-h-screen overflow-x-hidden'>
      <div className='container py-14 md:py-20'>
        <nav className='text-shGray-400 mb-6 text-xs tracking-[0.08em] uppercase'>
          <Link href='/' className='hover:text-shPrimary-300 transition-colors'>
            Inicio
          </Link>
          <span className='mx-2'>/</span>
          <span>{page.category}</span>
          <span className='mx-2'>/</span>
          <span className='text-shGray-300'>{page.title}</span>
        </nav>

        <section className='border-shGray-700/70 from-shBackground via-shGray-800/40 to-shBackground mb-10 rounded-3xl border bg-gradient-to-br p-8 md:p-12'>
          <p className='text-shPrimary-300 mb-4 text-xs font-semibold tracking-[0.14em] uppercase'>
            {page.category}
          </p>
          <h1 className='text-3xl leading-tight font-semibold md:text-5xl'>
            {page.title}
          </h1>
          <p className='text-shGray-300 mt-4 text-lg md:text-xl'>
            {page.subtitle}
          </p>
          <p className='text-shGray-400 mt-5 max-w-4xl text-sm md:text-base'>
            {page.intro}
          </p>
        </section>

        {page.legalNotice ? (
          <section className='border-shPrimary-300/40 bg-shPrimary-300/8 mb-10 rounded-2xl border p-6'>
            <p className='text-shPrimary-300 text-sm font-semibold tracking-wide uppercase'>
              Revisión legal requerida
            </p>
            <p className='text-shGray-200 mt-2 text-sm md:text-base'>
              {page.legalNotice}
            </p>
          </section>
        ) : null}

        <section className='grid gap-6 md:grid-cols-3'>
          {page.sections.map((section) => (
            <article
              key={section.title}
              className='border-shGray-700/70 bg-shGray-900/35 rounded-2xl border p-6'
            >
              <h2 className='text-xl leading-tight font-semibold'>
                {section.title}
              </h2>
              <p className='text-shGray-400 mt-3 text-sm'>
                {section.description}
              </p>
              <ul className='text-shGray-300 mt-4 space-y-2 text-sm'>
                {section.bullets.map((bullet) => (
                  <li key={bullet} className='flex gap-2'>
                    <span className='text-shPrimary-300 mt-[2px]'>-</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className='mt-12 grid gap-6 lg:grid-cols-2'>
          <article className='border-shGray-700/70 bg-shGray-900/35 rounded-2xl border p-6'>
            <h3 className='text-lg font-semibold'>Casos de uso industriales</h3>
            <ul className='text-shGray-300 mt-4 space-y-3 text-sm'>
              {page.industrialUseCases.map((item) => (
                <li key={item} className='border-shGray-700/60 border-l-2 pl-4'>
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <article className='border-shGray-700/70 bg-shGray-900/35 rounded-2xl border p-6'>
            <h3 className='text-lg font-semibold'>Relación con PM0</h3>
            <ul className='text-shGray-300 mt-4 space-y-3 text-sm'>
              {page.pm0Connection.map((item) => (
                <li key={item} className='flex gap-2'>
                  <span className='text-shPrimary-300 mt-[2px]'>*</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </section>

        {page.placeholders?.length ? (
          <section className='border-shGray-700/70 bg-shGray-900/35 mt-12 rounded-2xl border p-6'>
            <h3 className='text-lg font-semibold'>
              Datos pendientes para publicar
            </h3>
            <ul className='text-shGray-300 mt-4 space-y-2 text-sm'>
              {page.placeholders.map((placeholder) => (
                <li key={placeholder}>{placeholder}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {page.references.length ? (
          <section className='border-shGray-700/70 bg-shGray-900/35 mt-12 rounded-2xl border p-6'>
            <h3 className='text-lg font-semibold'>Referencias</h3>
            <ul className='mt-4 space-y-3 text-sm'>
              {page.references.map((reference) => (
                <li key={reference.href}>
                  <a
                    className='text-shPrimary-300 hover:text-shPrimary-200 underline-offset-4 hover:underline'
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

        <section className='border-shGray-700/70 from-shGray-900/55 to-shGray-900/15 mt-14 rounded-3xl border bg-gradient-to-r p-8 md:p-10'>
          <h3 className='text-2xl font-semibold md:text-3xl'>
            {page.cta.title}
          </h3>
          <p className='text-shGray-300 mt-3 max-w-3xl text-sm md:text-base'>
            {page.cta.description}
          </p>
          <div className='mt-6 flex flex-wrap gap-3'>
            <Link
              href={page.cta.primaryHref}
              className={cn(
                landingButtonVariants(),
                'bg-shPrimary-400 text-shBackground hover:bg-shPrimary-300 h-10 px-5 font-semibold',
              )}
            >
              {page.cta.primaryLabel}
            </Link>
            <Link
              href={page.cta.secondaryHref}
              className={cn(
                landingButtonVariants({ variant: 'outline' }),
                'border-shGray-600 text-shGray-200 hover:bg-shGray-700/40 h-10 bg-transparent px-4',
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
