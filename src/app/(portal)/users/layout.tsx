import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gestión de usuarios',
  robots: {
    index: false,
    follow: false,
  },
};

export default function UsersLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
