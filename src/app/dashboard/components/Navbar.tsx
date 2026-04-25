'use client';
// React Hooks
import { useState, useRef, useEffect } from 'react';
// Next.js
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/cn';
// Store & Hooks
import { useAuthStore } from '@/store/auth-store';
import { useLogoutMutation } from '@/hooks/use-logout-mutation';
// Constants
import { tabs, iconSize } from '@/constants/index';

/**
 * Generate user initials from a User object
 * Returns uppercase initials of first and last word of the name field
 */
function getUserInitials(user: { full_name: string }): string {
  const words = user.full_name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  const lastWord = words[words.length - 1];
  return (words[0][0] + lastWord[0]).toUpperCase();
}

/**
 * Get role display label in Spanish
 */
function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    admin: 'Administrador',
    supervisor: 'Supervisor',
    tecnico: 'Técnico',
    operator: 'Operador',
    viewer: 'Visor',
    superadmin: 'Super Administrador',
  };
  return labels[role] || role;
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const normalizedPathname = pathname.replace(/\/$/, '') || '/';

  const { user } = useAuthStore();
  const logoutMutation = useLogoutMutation();

  const handleLogout = () => {
    logoutMutation.mutate();
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
    <header className='app-topbar bg-shBackground/15 fixed top-0 z-50 grid w-screen place-items-center p-2 backdrop-blur-lg sm:p-3 lg:px-4 xl:px-5'>
      <nav className='flex w-full max-w-[1540px] items-center justify-between'>
        <Link href='/dashboard' scroll={false}>
          <Image
            src='/PM0-logo.webp'
            alt='PM0 logo'
            title='PM0 logo'
            width={40}
            height={40}
            loading='eager'
          />
        </Link>

        {/* Menu --- Desktop */}
        <div className='hidden items-center gap-6 lg:gap-8 xl:flex xl:gap-10'>
          {tabs.map((tab) => {
            const isActive =
              tab.path === '/dashboard'
                ? normalizedPathname === '/dashboard'
                : normalizedPathname === tab.path ||
                  normalizedPathname.startsWith(`${tab.path}/`);

            return (
              <Link
                href={tab.path}
                title={tab.tooltip}
                key={tab.id}
                className={cn(
                  'flex items-center gap-1 rounded-lg px-2.5 py-2 text-sm font-medium transition duration-200',
                  isActive &&
                    'bg-app-brand-soft text-app-brand-dark cursor-default',
                  !isActive &&
                    'text-app-text-secondary hover:bg-app-surface-subtle hover:text-app-text-primary cursor-pointer',
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
                className='border-app-border-soft bg-app-surface-subtle hover:border-app-border hover:bg-app-brand-soft hover:ring-app-brand/15 focus:ring-app-brand/30 hidden h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200 hover:ring-2 focus:ring-2 focus:outline-none xl:flex'
                aria-label='User menu'
                aria-expanded={isUserMenuOpen}
              >
                <span className='text-app-brand-dark text-sm font-bold'>
                  {getUserInitials(user)}
                </span>
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className='border-app-border-soft bg-app-surface absolute top-full right-0 z-50 mt-2 w-56 rounded-xl border shadow-lg shadow-slate-900/8'>
                  {/* User Info */}
                  <div className='border-app-border-soft border-b px-3 py-3'>
                    <p className='text-app-text-primary truncate text-sm font-semibold'>
                      {user.full_name}
                    </p>
                    <p className='text-app-text-secondary truncate text-xs'>
                      {user.email}
                    </p>
                    <p className='text-app-brand-dark mt-0.5 text-xs font-medium'>
                      {getRoleLabel(user.role)}
                    </p>
                  </div>
                  {/* Logout Option */}
                  <button
                    onClick={handleLogout}
                    className='text-app-text-secondary hover:bg-app-surface-subtle hover:text-app-text-primary flex w-full items-center gap-2 px-3 py-2.5 text-sm transition-colors'
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
            className='border-app-border-soft bg-app-surface h-12 rounded-xl border p-3 transition-all duration-300 ease-in-out xl:hidden'
            onClick={() => setIsOpen(!isOpen)}
            aria-label='Toggle menu'
          >
            {isOpen ? (
              <span className='relative block w-5 transition-all duration-300 ease-in-out'>
                <span className='bg-app-text-primary absolute top-1/2 left-0 h-0.5 w-full rotate-45 transform' />
                <span className='bg-app-text-primary absolute top-1/2 left-0 h-0.5 w-full -rotate-45 transform' />
              </span>
            ) : (
              <span className='block w-5 space-y-1.5 transition-all duration-300 ease-in-out'>
                <span className='bg-app-text-primary block h-0.5 w-full'></span>
                <span className='bg-app-text-primary block h-0.5 w-full'></span>
                <span className='bg-app-text-primary block h-0.5 w-full'></span>
              </span>
            )}
          </button>
        </div>

        {/* Expandible Menu --- Mobile (xl:hidden = visible from lg to xl) */}
        <div
          className={`bg-app-surface text-app-text-secondary absolute top-full left-0 z-50 flex w-full flex-col items-center overflow-y-scroll pt-10 pb-40 transition duration-300 ease-in-out xl:hidden ${isOpen ? 'h-dvh opacity-100' : 'pointer-events-none h-0 opacity-0'}`}
        >
          {tabs.map((tab) => {
            const isActive =
              tab.path === '/dashboard'
                ? normalizedPathname === '/dashboard'
                : normalizedPathname === tab.path ||
                  normalizedPathname.startsWith(`${tab.path}/`);

            return (
              <Link
                href={tab.path}
                title={tab.tooltip}
                key={tab.id}
                className={cn(
                  'duration:200 my-2 flex items-center gap-2 rounded-lg px-4 py-3 text-base font-medium transition-all',
                  isActive &&
                    'bg-app-brand-soft text-app-brand-dark cursor-default',
                  !isActive &&
                    'text-app-text-secondary hover:bg-app-surface-subtle hover:text-app-text-primary cursor-pointer',
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
            <div className='border-app-border-soft mt-6 flex flex-col items-center gap-4 border-t pt-6'>
              <div className='border-app-border-soft bg-app-surface-subtle flex h-14 w-14 items-center justify-center rounded-full border'>
                <span className='text-app-brand-dark text-lg font-bold'>
                  {getUserInitials(user)}
                </span>
              </div>
              <div className='text-center'>
                <p className='text-app-text-primary text-sm font-semibold'>
                  {user.full_name}
                </p>
                <p className='text-app-brand-dark text-xs font-medium'>
                  {getRoleLabel(user.role)}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className='border-app-border-soft text-app-text-secondary hover:bg-app-surface-subtle hover:text-app-text-primary flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors'
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
