import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import {
  getAllFooterPageSlugs,
  getFooterPageBySlug,
} from '@/app/(footer-pages)/_content/footer-pages';
import FooterPageTemplate from '@/app/(footer-pages)/_components/footer-page-template';

interface FooterPageRouteProps {
  params: Promise<{
    slug?: string[];
  }>;
}

export function generateStaticParams() {
  return getAllFooterPageSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: FooterPageRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getFooterPageBySlug(slug);

  if (!page) {
    return {
      title: 'PM0 | Paro Cero',
      description: 'Plataforma para mantenimiento y operacion industrial.',
    };
  }

  return {
    title: `${page.title} | PM0`,
    description: page.subtitle,
  };
}

export default async function FooterPageRoute({
  params,
}: FooterPageRouteProps) {
  const { slug } = await params;
  const page = getFooterPageBySlug(slug);

  if (!page) {
    notFound();
  }

  return <FooterPageTemplate page={page} />;
}
