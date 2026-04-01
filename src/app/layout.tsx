//Next
import type { Metadata } from 'next';
import { Inter, Inconsolata } from 'next/font/google';
//Components
import { Toaster } from 'sonner';
import Providers from './providers';
//Styles
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
});

const inconsolata = Inconsolata({
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
        className={`${inter.className} ${inconsolata.className} antialiased`}
      >
        <Providers>{children}</Providers>
        <Toaster position='top-center' richColors closeButton />
      </body>
    </html>
  );
}
