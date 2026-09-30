import type { Metadata } from 'next';
import Navbar from '@/app/dashboard/components/Navbar';

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
  return (
    <div className='auth-shell bg-app-bg text-app-text-primary min-h-screen w-full overflow-x-hidden'>
      <Navbar />
      <main className='container max-w-7xl pt-20 pb-8'>{children}</main>
    </div>
  );
}
