import type { Metadata } from 'next';
import Link from 'next/link';

import Footer from '@/components/landing/Footer';
import Header from '@/components/landing/Header';
import ScrollReveal from '@/components/landing/ScrollReveal';
import { blogArticles } from '@/app/blog/_content/blog-articles';

export const metadata: Metadata = {
  title: 'Blog de mantenimiento industrial | PM0 Paro Cero',
  description:
    'Guías prácticas para reducir paros, estructurar mantenimiento y mejorar el control operativo en planta.',
};

export default function BlogIndexPage() {
  return (
    <main className='public-shell bg-app-bg text-app-text-primary'>
      <Header />

      <div className='container py-16 md:py-24'>
        <ScrollReveal className='mb-12 md:mb-16'>
          <h1 className='text-app-text-primary mb-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl'>
            Blog de mantenimiento industrial
          </h1>
          <p className='text-app-text-secondary text-lg md:text-xl'>
            Guías prácticas para reducir paros, estructurar mantenimiento y
            mejorar el control operativo en planta.
          </p>
        </ScrollReveal>

        <section className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {blogArticles.map((article, index) => (
            <ScrollReveal key={article.slug} delay={index * 70}>
              <article className='border-app-border-soft bg-app-surface hover:border-app-border flex h-full flex-col rounded-xl border p-6 shadow-sm shadow-slate-900/5 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/10'>
                <div className='mb-3'>
                  <span className='text-app-brand text-xs font-medium tracking-wide uppercase'>
                    {article.category}
                  </span>
                </div>

                <h2 className='text-app-text-primary mb-2 text-lg leading-tight font-semibold'>
                  <Link
                    href={`/blog/${article.slug}`}
                    className='hover:text-app-brand-dark transition-colors duration-200'
                  >
                    {article.title}
                  </Link>
                </h2>

                <p className='text-app-text-secondary mb-4 flex-1 text-sm leading-relaxed'>
                  {article.description}
                </p>

                <div className='mt-auto flex items-center justify-between'>
                  <span className='text-app-text-muted text-xs'>
                    {article.readingTime} de lectura
                  </span>

                  <Link
                    href={`/blog/${article.slug}`}
                    className='text-app-brand text-sm font-medium underline-offset-4 hover:underline'
                  >
                    Leer artículo
                  </Link>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </section>
      </div>

      <Footer />
    </main>
  );
}
