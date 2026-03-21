'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/login';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className='bg-shGray-800 min-h-screen' />;
  }

  if (isLoginPage) {
    return children;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <main className='min-w-0 flex-1 overflow-auto'>
        <div className='fixed top-4 left-4 z-30 lg:hidden'>
          <SidebarTrigger className='bg-shGray-600 flex items-center justify-center rounded-lg border border-white/10 p-2 text-slate-400 hover:border-[var(--shPrimary-500)]/50 hover:text-[var(--shPrimary-400)]' />
        </div>
        <div className='pt-14 lg:pt-0'>{children}</div>
      </main>
    </SidebarProvider>
  );
}
