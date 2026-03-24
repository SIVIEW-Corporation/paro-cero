'use client';
// React Hooks
import { useState, useRef, useEffect } from 'react';
// Next.js
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
//Icons
import {
  LayoutGrid,
  Boxes,
  Calendar,
  ClipboardList,
  Search,
  Bell,
  BarChart3,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/cn';
// Store
import { useAuthStore } from '@/app/stores/use-auth-store';
// Types
import type { Usuario } from '@/app/data/types';

const iconSize = 16;

const tabs = [
  {
    id: 0,
    label: 'Inicio',
    tooltip: 'Panel de Control',
    path: '/',
    icon: <LayoutGrid size={iconSize} />,
  },
  {
    id: 1,
    label: 'Activos',
    tooltip: 'Gestión de Activos',
    path: '/assets',
    icon: <Boxes size={iconSize} />,
  },
  {
    id: 'plans',
    label: 'Planes-PM',
    tooltip: 'Ver Planes',
    path: '/plans',
    icon: <Calendar size={iconSize} />,
  },
  {
    id: 'workorders',
    label: 'Ordenes de Trabajo',
    tooltip: 'Ver Ordenes de Trabajo',
    path: '/workorders',
    icon: <ClipboardList size={iconSize} />,
  },
  {
    id: 'inspecciones',
    label: 'Inspecciones',
    tooltip: 'Ver Inspecciones',
    path: '/inspecciones',
    icon: <Search size={iconSize} />,
  },
  {
    id: 'notifications',
    label: 'Notificaciones',
    tooltip: 'Revisar Notificaciones',
    path: '/notifications',
    icon: <Bell size={iconSize} />,
  },
  {
    id: 'reports',
    label: 'Reportes y KPIs',
    tooltip: 'Ver KPIs e información útil',
    path: '/reports',
    icon: <BarChart3 size={iconSize} />,
  },
];

/**
 * Generate user initials from a Usuario object
 * Returns uppercase initials of first and last word of the nombre field
 */
function getUserInitials(user: Usuario): string {
  const words = user.nombre.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  const lastWord = words[words.length - 1];
  return (words[0][0] + lastWord[0]).toUpperCase();
}

/**
 * Get role display label in Spanish
 */
function getRoleLabel(rol: Usuario['rol']): string {
  const labels: Record<Usuario['rol'], string> = {
    admin: 'Administrador',
    supervisor: 'Supervisor',
    tecnico: 'Técnico',
  };
  return labels[rol];
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const router = useRouter();

  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  return (
    <header className='app-topbar bg-shBackground/80 fixed top-0 z-50 grid w-screen place-items-center p-2 backdrop-blur-md sm:p-3 lg:px-4 xl:px-5'>
      <nav className='flex w-full max-w-[1540px] items-center justify-between'>
        <Link href='/' scroll={false}>
          <Image
            src='/PM0-512.png'
            alt='PM0 logo'
            title='PM0 logo'
            width={40}
            height={40}
          />
        </Link>

        {/* Menu --- Desktop */}
        <div className='hidden items-center gap-6 lg:gap-8 xl:flex xl:gap-10'>
          {tabs.map((tab) => {
            const isActive = pathname === tab.path;

            return (
              <Link
                href={tab.path}
                title={tab.tooltip}
                key={tab.id}
                className={cn(
                  'flex items-center gap-1 text-sm font-normal transition duration-200',
                  isActive && 'text-shPrimary-500 cursor-default',
                  !isActive &&
                    'text-shGray-400 active:text-shPrimary-400 cursor-pointer hover:text-white hover:underline',
                )}
                scroll={false}
              >
                {tab.icon}
                <h2>{tab.label}</h2>
              </Link>
            );
          })}
        </div>

        <div className='flex items-center gap-4'>
          {user && (
            <div className='relative' ref={userMenuRef}>
              {/* User Avatar Button */}
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className='bg-shGray-800 hover:bg-shGray-700 hover:ring-shPrimary-500/50 focus:ring-shPrimary-500 hidden h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 hover:ring-2 focus:ring-2 focus:outline-none xl:flex'
                aria-label='User menu'
                aria-expanded={isUserMenuOpen}
              >
                <span className='text-shPrimary-500 text-sm font-bold'>
                  {getUserInitials(user)}
                </span>
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className='bg-shGray-800 border-shGray-600 absolute top-full right-0 z-50 mt-2 w-56 rounded-xl border'>
                  {/* User Info */}
                  <div className='border-shGray-600 border-b px-3 py-3'>
                    <p className='text-shGray-100 truncate text-sm font-semibold'>
                      {user.nombre}
                    </p>
                    <p className='text-shGray-400 truncate text-xs'>
                      {user.email}
                    </p>
                    <p className='text-shPrimary-500 mt-0.5 text-xs font-medium'>
                      {getRoleLabel(user.rol)}
                    </p>
                  </div>
                  {/* Logout Option */}
                  <button
                    onClick={handleLogout}
                    className='text-shGray-300 hover:bg-shGray-700 flex w-full items-center gap-2 px-3 py-2.5 text-sm transition-colors hover:text-white'
                  >
                    <LogOut size={iconSize} />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Hamburger Button --- Mobile (hidden on xl+) */}
          <button
            className='border-shGray-800 h-12 rounded-xl border p-3 transition-all duration-300 ease-in-out xl:hidden'
            onClick={() => setIsOpen(!isOpen)}
            aria-label='Toggle menu'
          >
            {isOpen ? (
              <span className='relative block w-5 transition-all duration-300 ease-in-out'>
                <span className='bg-shGray-300 absolute top-1/2 left-0 h-0.5 w-full rotate-45 transform' />
                <span className='bg-shGray-300 absolute top-1/2 left-0 h-0.5 w-full -rotate-45 transform' />
              </span>
            ) : (
              <span className='block w-5 space-y-1.5 transition-all duration-300 ease-in-out'>
                <span className='bg-shGray-300 block h-0.5 w-full'></span>
                <span className='bg-shGray-300 block h-0.5 w-full'></span>
                <span className='bg-shGray-300 block h-0.5 w-full'></span>
              </span>
            )}
          </button>
        </div>

        {/* Expandible Menu --- Mobile (xl:hidden = visible from lg to xl) */}
        <div
          className={`text-shGray-300 bg-shBackground absolute top-full left-0 z-50 flex w-full flex-col items-center overflow-y-scroll pt-10 pb-40 transition duration-300 ease-in-out xl:hidden ${isOpen ? 'h-dvh opacity-100' : 'h-0 opacity-0'}`}
        >
          {tabs.map((tab) => {
            const isActive = pathname === tab.path;

            return (
              <Link
                href={tab.path}
                title={tab.tooltip}
                key={tab.id}
                className={cn(
                  'duration:200 my-5 flex items-center gap-2 text-base font-normal transition-all',
                  isActive && 'text-shPrimary-500 cursor-default',
                  !isActive &&
                    'text-shGray-400 active:text-shPrimary-400 cursor-pointer hover:text-white hover:underline',
                )}
                scroll={false}
                onClick={() => setIsOpen(false)}
              >
                {tab.icon}
                <h2>{tab.label}</h2>
              </Link>
            );
          })}

          {/* User section in mobile menu */}
          {user && (
            <div className='border-shGray-700 mt-6 flex flex-col items-center gap-4 border-t pt-6'>
              <div className='bg-shGray-800 flex h-14 w-14 items-center justify-center rounded-full'>
                <span className='text-shPrimary-500 text-lg font-bold'>
                  {getUserInitials(user)}
                </span>
              </div>
              <div className='text-center'>
                <p className='text-shGray-100 text-sm font-semibold'>
                  {user.nombre}
                </p>
                <p className='text-shPrimary-500 text-xs font-medium'>
                  {getRoleLabel(user.rol)}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className='border-shGray-600 text-shGray-300 hover:bg-shGray-800 flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors hover:text-white'
              >
                <LogOut size={iconSize} />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
