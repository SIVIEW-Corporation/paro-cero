'use client';
import React, { useState } from 'react';
import {
  G,
  INIT_WO,
  INIT_NOTIFS,
  INIT_CHECKLISTS,
  INIT_HALLAZGOS,
  PLANTILLAS_CHECKLIST,
} from '@/app/data';
import { LoginScreen, Dashboard, AssetsScreen } from '@/app/screens1';
import {
  PlansScreen,
  WorkOrdersScreen,
  NotificationsScreen,
  ReportsScreen,
} from '@/app/screens2';
import { InspeccionesScreen } from '@/app/screens3';
import { cn } from '@/lib/cn';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Panel de Control', icon: '▦' },
  { id: 'assets', label: 'Activos', icon: '⬡' },
  { id: 'plans', label: 'Planes PM', icon: '◎' },
  { id: 'workorders', label: 'Ordenes de Trabajo', icon: '☰' },
  { id: 'inspecciones', label: 'Inspecciones', icon: '🔍' },
  { id: 'notifications', label: 'Notificaciones', icon: '◉' },
  { id: 'reports', label: 'Reportes y KPIs', icon: '↗' },
];

interface SidebarProps {
  screen: string;
  setScreen: (screen: string) => void;
  unreadCount: number;
  onLogout: () => void;
}

function Sidebar({ screen, setScreen, unreadCount, onLogout }: SidebarProps) {
  return (
    <div className='flex h-full w-60 flex-shrink-0 flex-col border-r border-slate-700 bg-slate-900'>
      <div className='border-b border-slate-700 p-5'>
        <div className='flex items-center gap-2.5'>
          <div className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-amber-500'>
            <svg width='18' height='18' viewBox='0 0 24 24' fill='none'>
              <path
                d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'
                stroke='#000'
                strokeWidth='2.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </div>
          <div>
            <div className='text-base leading-none font-black tracking-tight text-slate-100'>
              APEX
            </div>
            <div className='text-xs leading-relaxed tracking-widest text-slate-600 uppercase'>
              Maintenance
            </div>
          </div>
        </div>
      </div>

      <nav className='flex-1 overflow-y-auto p-2.5'>
        {NAV_ITEMS.map((item) => {
          const active = screen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setScreen(item.id)}
              className={cn(
                'font-inherit relative mb-0.5 flex w-full cursor-pointer items-center gap-2.5 rounded-md border-none px-3 py-2 text-left text-sm font-medium transition-all',
                active
                  ? 'bg-amber-500/15 font-bold text-amber-500'
                  : 'bg-transparent text-slate-500 hover:bg-slate-800 hover:text-slate-400',
              )}
            >
              {active && (
                <div className='absolute top-1/2 left-0 h-5.5 w-0.5 -translate-y-1/2 rounded-r-sm bg-amber-500' />
              )}
              <span className='w-4.5 flex-shrink-0 text-center text-sm leading-none'>
                {item.icon}
              </span>
              <span className='flex-1'>{item.label}</span>
              {item.id === 'notifications' && unreadCount > 0 && (
                <span className='flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white'>
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className='border-t border-slate-700 p-3.5'>
        <div className='mb-2.5 flex items-center gap-2.5'>
          <div className='flex h-8.5 w-8.5 flex-shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-slate-400'>
            SM
          </div>
          <div>
            <div className='text-sm leading-none font-bold text-slate-200'>
              Supervisor M.
            </div>
            <div className='mt-0.5 text-xs text-slate-500'>
              Supervisor · Demo
            </div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className='font-inherit w-full cursor-pointer rounded border border-slate-700 bg-transparent py-1.5 text-xs text-slate-500 transition-all hover:border-red-500 hover:text-red-500'
        >
          Cerrar sesion
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState('login');
  const [wo, setWo] = useState(INIT_WO);
  const [notifs, setNotifs] = useState(INIT_NOTIFS);
  const [mounted, setMounted] = useState(false);
  const [checklists, setChecklists] = useState(INIT_CHECKLISTS);
  const [hallazgos, setHallazgos] = useState(INIT_HALLAZGOS);
  const [plantillas, setPlantillas] = useState(PLANTILLAS_CHECKLIST);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const unreadCount = notifs.filter((n) => !n.leida).length;

  if (!mounted) {
    return null;
  }

  if (screen === 'login') {
    return (
      <>
        <style>{G}</style>
        <LoginScreen onLogin={() => setScreen('dashboard')} />
      </>
    );
  }

  return (
    <>
      <style>{G}</style>
      <div className='flex h-screen overflow-hidden bg-slate-950'>
        <Sidebar
          screen={screen}
          setScreen={setScreen}
          unreadCount={unreadCount}
          onLogout={() => setScreen('login')}
        />
        <main className='min-w-0 flex-1 overflow-auto'>
          {screen === 'dashboard' && <Dashboard wo={wo} />}
          {screen === 'assets' && <AssetsScreen wo={wo} />}
          {screen === 'plans' && <PlansScreen />}
          {screen === 'workorders' && (
            <WorkOrdersScreen wo={wo} setWo={setWo} />
          )}
          {screen === 'inspecciones' && (
            <InspeccionesScreen
              checklists={checklists}
              setChecklists={setChecklists}
              hallazgos={hallazgos}
              setHallazgos={setHallazgos}
              plantillas={plantillas}
              setPlantillas={setPlantillas}
            />
          )}
          {screen === 'notifications' && (
            <NotificationsScreen notifs={notifs} setNotifs={setNotifs} />
          )}
          {screen === 'reports' && <ReportsScreen wo={wo} />}
        </main>
      </div>
    </>
  );
}
