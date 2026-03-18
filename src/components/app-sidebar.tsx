'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Boxes,
  Calendar,
  ClipboardList,
  Search,
  Bell,
  BarChart3,
  LogOut,
  Layers,
  LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useNotificacionesStore } from '@/app/stores/useNotificacionesStore';

const NAV_ITEMS: {
  id: string;
  label: string;
  icon: LucideIcon;
  url: string;
}[] = [
  {
    id: 'dashboard',
    label: 'Panel de Control',
    icon: LayoutDashboard,
    url: '/',
  },
  { id: 'assets', label: 'Activos', icon: Boxes, url: '/assets' },
  { id: 'plans', label: 'Planes PM', icon: Calendar, url: '/plans' },
  {
    id: 'workorders',
    label: 'Ordenes de Trabajo',
    icon: ClipboardList,
    url: '/workorders',
  },
  {
    id: 'inspecciones',
    label: 'Inspecciones',
    icon: Search,
    url: '/inspecciones',
  },
  {
    id: 'notifications',
    label: 'Notificaciones',
    icon: Bell,
    url: '/notifications',
  },
  { id: 'reports', label: 'Reportes y KPIs', icon: BarChart3, url: '/reports' },
];

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  unreadCount?: number;
}

export function AppSidebar({ ...props }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const unreadCount = useNotificacionesStore(
    (state) => state.notificaciones.filter((n) => !n.leida).length,
  );

  return (
    <Sidebar
      collapsible='none'
      className='border-r border-white/10 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-800/95'
      {...props}
    >
      <SidebarHeader className='border-b border-white/10 p-4'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/20'>
            <Layers className='text-black' size={20} />
          </div>
          <div className='overflow-hidden'>
            <div className='text-lg font-black tracking-tight whitespace-nowrap text-white'>
              APEX
            </div>
            <div className='text-xs font-medium tracking-widest whitespace-nowrap text-slate-500 uppercase'>
              Maintenance
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className='px-3 py-4'>
        <SidebarMenu>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.url;
            const Icon = item.icon;

            return (
              <SidebarMenuItem key={item.id}>
                <button
                  onClick={() => router.push(item.url)}
                  className={cn(
                    'group relative flex w-full cursor-pointer items-center gap-3 rounded-xl border-none px-3 py-2.5 text-left text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/5 text-amber-400 shadow-lg shadow-amber-500/10'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200',
                  )}
                >
                  {isActive && (
                    <div className='absolute top-1/2 left-0 h-6 w-1 -translate-y-1/2 rounded-r-full bg-amber-500' />
                  )}
                  <div className='relative flex flex-shrink-0 items-center justify-center'>
                    <Icon
                      size={20}
                      className={cn(
                        'transition-transform duration-200',
                        isActive
                          ? 'text-amber-400'
                          : 'text-slate-500 group-hover:text-slate-300',
                      )}
                    />
                  </div>
                  <span className='flex-1 overflow-hidden whitespace-nowrap'>
                    {item.label}
                  </span>
                  {item.id === 'notifications' && unreadCount > 0 && (
                    <span className='flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white shadow-lg shadow-red-500/30'>
                      {unreadCount}
                    </span>
                  )}
                </button>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className='border-t border-white/10 p-3'>
        <div className='mb-3 flex items-center gap-3'>
          <div className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-600 text-sm font-bold text-slate-300 shadow-inner'>
            SM
          </div>
          <div className='overflow-hidden'>
            <div className='text-sm font-semibold whitespace-nowrap text-slate-200'>
              Supervisor M.
            </div>
            <div className='text-xs whitespace-nowrap text-slate-500'>
              Supervisor · Demo
            </div>
          </div>
        </div>
        <button
          onClick={() => router.push('/login')}
          className={cn(
            'flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2 text-sm font-medium text-slate-400 transition-all hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400',
          )}
        >
          <LogOut size={16} />
          <span className='overflow-hidden whitespace-nowrap'>
            Cerrar sesión
          </span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
