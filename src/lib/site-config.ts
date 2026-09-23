const LOCAL_SITE_URL = 'http://localhost:3000';

const configuredSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.NODE_ENV === 'production' ? undefined : LOCAL_SITE_URL);

if (!configuredSiteUrl) {
  throw new Error(
    'NEXT_PUBLIC_SITE_URL debe estar configurada en producción para generar canonicals y sitemaps correctos.',
  );
}

export const SITE_URL = new URL(configuredSiteUrl);
