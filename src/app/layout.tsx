//Next
import type { Metadata } from 'next';
import { Inter, Inconsolata } from 'next/font/google';
//Components
import { Toaster } from 'sonner';
import Providers from './providers';
import { SITE_URL } from '@/lib/site-config';
//Styles
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
});

const inconsolata = Inconsolata({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: {
    default: 'PM0 | Gestión de mantenimiento industrial',
    template: '%s | PM0 Paro Cero',
  },
  description:
    'Plataforma de gestión de mantenimiento industrial para reducir paros no planificados y mejorar el control operativo.',
  applicationName: 'PM0',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    siteName: 'PM0 | Paro Cero',
    title: 'PM0 | Gestión de mantenimiento industrial',
    description:
      'Plataforma de gestión de mantenimiento industrial para reducir paros no planificados y mejorar el control operativo.',
    url: '/',
    images: [
      {
        url: '/images/hero/paro-cero-hero.webp',
        width: 2752,
        height: 1536,
        alt: 'Equipo técnico inspeccionando activos industriales en planta',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PM0 | Gestión de mantenimiento industrial',
    description:
      'Plataforma de gestión de mantenimiento industrial para reducir paros no planificados y mejorar el control operativo.',
    images: ['/images/hero/paro-cero-hero.webp'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='es' suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.className} ${inconsolata.className} antialiased`}
      >
        <Providers>{children}</Providers>
        <Toaster position='top-center' richColors closeButton />
      </body>
    </html>
  );
}
