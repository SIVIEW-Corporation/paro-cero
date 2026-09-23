import type { MetadataRoute } from 'next';

import { getAllFooterPageSlugs } from '@/app/(footer-pages)/_content/footer-pages';
import { getAllBlogArticleSlugs } from '@/app/blog/_content/blog-articles';
import { SITE_URL } from '@/lib/site-config';

const publicRoutes: MetadataRoute.Sitemap = [
  {
    url: new URL('/', SITE_URL).toString(),
    changeFrequency: 'monthly',
    priority: 1,
  },
  {
    url: new URL('/precios', SITE_URL).toString(),
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  {
    url: new URL('/demo', SITE_URL).toString(),
    changeFrequency: 'monthly',
    priority: 0.9,
  },
  {
    url: new URL('/blog', SITE_URL).toString(),
    changeFrequency: 'weekly',
    priority: 0.8,
  },
];

const footerRoutes: MetadataRoute.Sitemap = getAllFooterPageSlugs().map(
  ([section, slug]) => ({
    url: new URL(`/${section}/${slug}`, SITE_URL).toString(),
    changeFrequency: 'monthly',
    priority: section === 'legal' ? 0.2 : 0.7,
  }),
);

const blogRoutes: MetadataRoute.Sitemap = getAllBlogArticleSlugs().map(
  (slug) => ({
    url: new URL(`/blog/${slug}`, SITE_URL).toString(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }),
);

export default function sitemap(): MetadataRoute.Sitemap {
  return [...publicRoutes, ...footerRoutes, ...blogRoutes];
}
