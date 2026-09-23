import type { Metadata } from 'next';
import Navbar from './components/Navbar';

export const metadata: Metadata = {
  title: 'Panel operativo',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='auth-shell bg-app-bg text-app-text-primary w-full overflow-x-hidden'>
      <Navbar />
      <main className='container max-w-7xl pt-20 pb-8'>{children}</main>
    </div>
  );
}
