//Next
import type { Metadata } from 'next';
import { Inter, Inconsolata } from 'next/font/google';
//Components
import { Toaster } from 'sonner';
import QueryProvider from '@/components/providers/QueryProvider';
//Styles
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const inconsolata = Inconsolata({
  variable: '--font-inconsolata',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'PM0 - Gestión de Mantenimiento | SIVIEW',
  description: 'Sistema de gestión para procesos de mantenimiento',
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
        className={`${inter.variable} ${inconsolata.variable} antialiased`}
      >
        <QueryProvider>{children}</QueryProvider>
        <Toaster position='top-center' richColors closeButton />
      </body>
    </html>
  );
}
