import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';

import Footer from '@/components/landing/Footer';
import Header from '@/components/landing/Header';
import {
  getAllBlogArticleSlugs,
  getBlogArticleBySlug,
} from '@/app/blog/_content/blog-articles';

interface BlogArticleRouteProps {
  params: Promise<{
    slug: string;
  }>;
}

function renderInlineMarkdown(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const linkRegex = /\[([^\]]+)]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(text)) !== null) {
    const [fullMatch, label, href] = match;

    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    parts.push(
      <Link
        key={`${href}-${match.index}`}
        href={href}
        className='text-app-brand font-medium underline-offset-4 hover:underline'
      >
        {label}
      </Link>,
    );

    lastIndex = match.index + fullMatch.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

function renderArticleContent(content: string) {
  const nodes: ReactNode[] = [];
  let listItems: string[] = [];

  function flushList() {
    if (listItems.length === 0) {
      return;
    }

    nodes.push(
      <ul
        key={`list-${nodes.length}`}
        className='text-app-text-secondary mb-5 list-disc space-y-2 pl-6'
      >
        {listItems.map((item) => (
          <li key={item}>{renderInlineMarkdown(item)}</li>
        ))}
      </ul>,
    );
    listItems = [];
  }

  content.split('\n').forEach((line) => {
    if (line.startsWith('- ')) {
      listItems.push(line.replace('- ', ''));
      return;
    }

    flushList();

    if (line.trim() === '' || line.trim() === '---') {
      return;
    }

    if (line.startsWith('# ')) {
      return;
    }

    if (line.startsWith('### ')) {
      nodes.push(
        <h3
          key={`heading-${nodes.length}`}
          className='text-app-text-primary mt-8 mb-3 text-xl font-semibold'
        >
          {line.replace('### ', '')}
        </h3>,
      );
      return;
    }

    if (line.startsWith('## ')) {
      nodes.push(
        <h2
          key={`heading-${nodes.length}`}
          className='text-app-text-primary mt-10 mb-4 text-2xl font-bold'
        >
          {line.replace('## ', '')}
        </h2>,
      );
      return;
    }

    nodes.push(
      <p
        key={`paragraph-${nodes.length}`}
        className='text-app-text-secondary mb-4 leading-relaxed'
      >
        {renderInlineMarkdown(line)}
      </p>,
    );
  });

  flushList();

  return nodes;
}

export function generateStaticParams() {
  return getAllBlogArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: BlogArticleRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getBlogArticleBySlug(slug);

  if (!article) {
    return {
      title: 'Artículo no encontrado | PM0 Paro Cero',
    };
  }

  return {
    title: `${article.title} | PM0 Blog`,
    description: article.description,
  };
}

export default async function BlogArticlePage({
  params,
}: BlogArticleRouteProps) {
  const { slug } = await params;
  const article = getBlogArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <main className='public-shell bg-app-bg text-app-text-primary'>
      <Header />

      <article className='container py-16 md:py-24'>
        <div className='mx-auto max-w-3xl'>
          <header className='mb-10'>
            <Link
              href='/blog'
              className='text-app-brand mb-6 inline-flex items-center text-sm font-medium underline-offset-4 hover:underline'
            >
              ← Volver al blog
            </Link>

            <div className='mb-4 flex items-center gap-3'>
              <span className='text-app-brand text-xs font-medium tracking-wide uppercase'>
                {article.category}
              </span>
              <span className='text-app-border'>•</span>
              <span className='text-app-text-muted text-xs'>
                {article.readingTime} de lectura
              </span>
            </div>

            <h1 className='text-app-text-primary text-3xl leading-tight font-bold md:text-4xl'>
              {article.title}
            </h1>

            <p className='text-app-text-secondary mt-4 text-lg'>
              {article.description}
            </p>
          </header>

          <div className='border-app-border-soft bg-app-surface max-w-none rounded-2xl border p-6 shadow-sm shadow-slate-900/5 md:p-8'>
            {renderArticleContent(article.content)}
          </div>

          <footer className='border-app-border-soft mt-16 border-t pt-10'>
            <h3 className='text-app-text-primary mb-6 text-lg font-semibold'>
              ¿Estás evaluando cómo estructurar tu mantenimiento?
            </h3>
            <div className='flex flex-col gap-3 sm:flex-row'>
              <Link
                href='/recursos/como-funciona'
                className='text-app-brand text-sm font-medium underline-offset-4 hover:underline'
              >
                → Ver cómo funciona PM0
              </Link>
              <Link
                href='/recursos/guia-de-implementacion'
                className='text-app-brand text-sm font-medium underline-offset-4 hover:underline'
              >
                → Ver guía de implementación
              </Link>
              <Link
                href='/empresa/contacto'
                className='text-app-brand text-sm font-medium underline-offset-4 hover:underline'
              >
                → Solicitar evaluación operativa
              </Link>
            </div>
          </footer>
        </div>
      </article>

      <Footer />
    </main>
  );
}
