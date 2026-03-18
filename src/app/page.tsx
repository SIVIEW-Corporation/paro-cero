'use client';
import React, { useState } from 'react';
import {
  LayoutDashboard,
  Boxes,
  Calendar,
  ClipboardList,
  Search,
  Bell,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogOut,
  LucideIcon,
  Menu,
  X,
} from 'lucide-react';
import * as motion from 'motion/react-client';
import {
  INIT_NOTIFS,
  INIT_CHECKLISTS,
  INIT_HALLAZGOS,
  PLANTILLAS_CHECKLIST,
} from '@/app/data';
import { INIT_WO } from '@/app/data/mock-data';
import { LoginScreen, Dashboard, AssetsScreen } from '@/app/screens/screens1';
import {
  PlansScreen,
  WorkOrdersScreen,
  NotificationsScreen,
  ReportsScreen,
} from '@/app/screens2';
import { InspeccionesScreen } from '@/app/screens3';
import { cn } from '@/lib/cn';

const G = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: #07101f; }
  ::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: #2d5a8e; }
  input, select, textarea {
    font-family: inherit;
    background: #060e20;
    border: 1.5px solid #1e3a5f;
    border-radius: 6px;
    padding: 9px 12px;
    color: #e2e8f0;
    font-size: 13px;
    outline: none;
    width: 100%;
    transition: border-color 0.15s;
  }
  input:focus, select:focus, textarea:focus { border-color: #f59e0b; }
  select option { background: #0d1627; }
  textarea { resize: vertical; min-height: 80px; }
`;

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Panel de Control', icon: LayoutDashboard },
  { id: 'assets', label: 'Activos', icon: Boxes },
  { id: 'plans', label: 'Planes PM', icon: Calendar },
  { id: 'workorders', label: 'Ordenes de Trabajo', icon: ClipboardList },
  { id: 'inspecciones', label: 'Inspecciones', icon: Search },
  { id: 'notifications', label: 'Notificaciones', icon: Bell },
  { id: 'reports', label: 'Reportes y KPIs', icon: BarChart3 },
];

interface SidebarProps {
  screen: string;
  setScreen: (screen: string) => void;
  unreadCount: number;
  onLogout: () => void;
}

type NavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
};

function Sidebar({
  screen,
  setScreen,
  unreadCount,
  onLogout,
  isOpen,
  onClose,
}: SidebarProps & { isOpen?: boolean; onClose?: () => void }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {isOpen === true && (
        <div
          className='fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden'
          onClick={onClose}
        />
      )}
      <motion.div
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          'relative flex h-full flex-shrink-0 flex-col border-r border-white/10 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-800/95 backdrop-blur-xl',
          isOpen === false ? 'hidden lg:flex' : 'flex',
        )}
      >
        {isOpen === true && (
          <button
            onClick={onClose}
            className='absolute top-4 right-4 rounded-lg bg-white/10 p-1 text-slate-400 hover:text-white lg:hidden'
          >
            <X size={20} />
          </button>
        )}
        <div className='border-b border-white/10 p-4'>
          <div className='flex items-center gap-3'>
            <motion.div
              animate={{ scale: collapsed ? 1.1 : 1 }}
              transition={{ duration: 0.2 }}
              className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/20'
            >
              <svg width='20' height='20' viewBox='0 0 24 24' fill='none'>
                <path
                  d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'
                  stroke='#000'
                  strokeWidth='2.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </motion.div>
            <motion.div
              animate={{
                opacity: collapsed ? 0 : 1,
                width: collapsed ? 0 : 'auto',
              }}
              transition={{ duration: 0.2 }}
              className='overflow-hidden'
            >
              <div className='text-lg font-black tracking-tight whitespace-nowrap text-white'>
                APEX
              </div>
              <div className='text-xs font-medium tracking-widest whitespace-nowrap text-slate-500 uppercase'>
                Maintenance
              </div>
            </motion.div>
          </div>
        </div>

        <nav className='flex-1 overflow-y-auto px-3 py-4'>
          {NAV_ITEMS.map((item: NavItem, index: number) => {
            const active = screen === item.id;
            const Icon = item.icon;

            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setScreen(item.id)}
                className={cn(
                  'group relative mb-1 flex w-full cursor-pointer items-center gap-3 rounded-xl border-none px-3 py-2.5 text-left text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/5 text-amber-400 shadow-lg shadow-amber-500/10'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200',
                )}
              >
                {active && (
                  <motion.div
                    layoutId='activeIndicator'
                    className='absolute top-1/2 left-0 h-6 w-1 -translate-y-1/2 rounded-r-full bg-amber-500'
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <div className='relative flex flex-shrink-0 items-center justify-center'>
                  <Icon
                    size={20}
                    className={cn(
                      'transition-transform duration-200',
                      active
                        ? 'text-amber-400'
                        : 'text-slate-500 group-hover:text-slate-300',
                    )}
                  />
                </div>
                <motion.span
                  animate={{
                    opacity: collapsed ? 0 : 1,
                    width: collapsed ? 0 : 'auto',
                  }}
                  transition={{ duration: 0.2 }}
                  className='flex-1 overflow-hidden whitespace-nowrap'
                >
                  {item.label}
                </motion.span>
                {item.id === 'notifications' && unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={cn(
                      'flex items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white shadow-lg shadow-red-500/30',
                      collapsed
                        ? 'absolute -top-1 -right-1 h-4 w-4 p-0'
                        : 'min-w-5 px-1.5 py-0.5',
                    )}
                  >
                    {unreadCount}
                  </motion.span>
                )}
                {collapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    className='absolute left-full ml-2 hidden rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium whitespace-nowrap text-white shadow-xl group-hover:block'
                  >
                    {item.label}
                    <div className='absolute top-1/2 -left-1 h-2 w-2 -translate-y-1/2 rotate-45 bg-slate-800' />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </nav>

        <div className='border-t border-white/10 p-3'>
          <div className='mb-3 flex items-center gap-3'>
            <div className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-600 text-sm font-bold text-slate-300 shadow-inner'>
              SM
            </div>
            <motion.div
              animate={{
                opacity: collapsed ? 0 : 1,
                width: collapsed ? 0 : 'auto',
              }}
              transition={{ duration: 0.2 }}
              className='overflow-hidden'
            >
              <div className='text-sm font-semibold whitespace-nowrap text-slate-200'>
                Supervisor M.
              </div>
              <div className='text-xs whitespace-nowrap text-slate-500'>
                Supervisor · Demo
              </div>
            </motion.div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onLogout}
            className={cn(
              'flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2 text-sm font-medium text-slate-400 transition-all hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400',
              collapsed && 'px-0',
            )}
          >
            <LogOut size={16} />
            <motion.span
              animate={{
                opacity: collapsed ? 0 : 1,
                width: collapsed ? 0 : 'auto',
              }}
              transition={{ duration: 0.2 }}
              className='overflow-hidden whitespace-nowrap'
            >
              Cerrar sesión
            </motion.span>
          </motion.button>
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className='absolute top-20 -right-3 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-slate-800 text-slate-400 shadow-lg transition-all hover:border-amber-500/50 hover:bg-slate-700 hover:text-amber-400'
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </motion.div>
    </>
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
  const [sidebarOpen, setSidebarOpen] = useState<boolean | undefined>(
    undefined,
  );
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    setMounted(true);

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(undefined);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const unreadCount = notifs.filter((n) => !n.leida).length;

  const handleNavClick = (id: string) => {
    setScreen(id);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen((prev) => (prev === true ? false : true));
    }
  };

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
      <div className='relative flex h-screen overflow-hidden bg-slate-950'>
        <Sidebar
          screen={screen}
          setScreen={handleNavClick}
          unreadCount={unreadCount}
          onLogout={() => {
            setScreen('login');
            setSidebarOpen(isMobile ? false : undefined);
          }}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <button
          onClick={toggleSidebar}
          className='fixed top-4 left-4 z-30 flex items-center justify-center rounded-lg border border-white/10 bg-slate-800 p-2 text-slate-400 hover:border-amber-500/50 hover:text-amber-400 lg:hidden'
        >
          <Menu size={24} />
        </button>

        <main className='min-w-0 flex-1 overflow-auto pt-14 lg:pt-0'>
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
