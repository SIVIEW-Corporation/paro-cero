'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';

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
    return (
      <TooltipProvider>
        <div className='min-h-screen bg-slate-950' />
      </TooltipProvider>
    );
  }

  if (isLoginPage) {
    return <TooltipProvider>{children}</TooltipProvider>;
  }

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <main className='min-w-0 flex-1 overflow-auto'>
          <div className='fixed top-4 left-4 z-30 lg:hidden'>
            <SidebarTrigger className='flex items-center justify-center rounded-lg border border-white/10 bg-slate-800 p-2 text-slate-400 hover:border-amber-500/50 hover:text-amber-400' />
          </div>
          <div className='pt-14 lg:pt-0'>{children}</div>
        </main>
      </SidebarProvider>
    </TooltipProvider>
  );
}
