import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Demo de técnico',
  robots: {
    index: false,
    follow: false,
  },
};

export default function TechnicianDemoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
