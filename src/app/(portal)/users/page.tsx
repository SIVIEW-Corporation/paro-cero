'use client';

import { useAuthStore } from '@/store/auth-store';
import { useState, useEffect } from 'react';
import { UserRoundPlus, UsersRound } from 'lucide-react';
import * as motion from 'motion/react-client';
import { AnimatePresence } from 'motion/react';
import Image from 'next/image';

import NewUserForm from './NewUserForm';
import UsersTable from './components/UsersTable';

export default function Users() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const [activeTab, setActiveTab] = useState('historico');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    if (isAdmin) {
      setActiveTab('all-operators');
    }
  }, [isAdmin]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const tabs = [
    {
      id: 'all-operators',
      label: 'Usuarios disponibles',
      icon: <UsersRound size={20} />,
    },
    {
      id: 'new-operator',
      label: 'Crear nuevo',
      icon: <UserRoundPlus size={20} />,
    },
  ];

  if (!isHydrated) {
    return (
      <div className='flex h-full items-center justify-center p-4'>
        <div className='flex flex-col items-center gap-4'>
          <div className='relative h-fit w-fit'>
            <Image
              src='/PM0-logo.webp'
              alt='Logo PM0 by SIVIEW corporation'
              height={240}
              width={240}
              className='h-40 w-auto animate-pulse object-contain'
              loading='eager'
            />
          </div>
          <p className='text-app-text-muted'>Cargando sesión...</p>
        </div>
      </div>
    );
  }

  // Admin guard — redirect non-admin users
  if (!isAdmin) {
    return (
      <main className='z-10 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='flex flex-col items-center justify-center py-16'>
          <h2 className='text-app-text-primary text-xl font-bold'>
            Acceso restringido
          </h2>
          <p className='text-app-text-secondary mt-2 text-sm'>
            Solo los administradores pueden crear usuarios.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className='z-10 container mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8'>
      <section className='mb-6 md:mb-8'>
        <h1 className='font-inter text-app-text-primary mb-1 text-2xl font-semibold tracking-[-0.02em] md:text-3xl'>
          Gestionar usuarios
        </h1>
        <p className='text-app-text-secondary font-inter max-w-2xl text-sm leading-6 md:text-base'>
          Aquí podrás crear, editar y eliminar perfiles. También podrás asignar
          roles y permisos.
        </p>
      </section>

      <section className='w-full overflow-x-auto'>
        <div className='border-app-border-soft flex min-w-max items-center gap-1 border-b md:min-w-0 md:gap-3'>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              title={tab.label}
              className={`focus-visible:ring-app-brand focus-visible:ring-offset-app-bg relative flex shrink-0 cursor-pointer items-center gap-2 rounded-t-lg px-3 py-3 text-sm font-semibold transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none md:px-5 md:py-4 ${
                activeTab === tab.id
                  ? 'text-app-brand-dark'
                  : 'text-app-text-secondary hover:bg-app-surface-subtle hover:text-app-text-primary'
              }`}
              onClick={() => handleTabChange(tab.id)}
            >
              <span className='size-5 shrink-0'>{tab.icon}</span>
              <span className='hidden md:inline'>{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId='underline'
                  className='bg-app-brand absolute right-0 bottom-0 left-0 h-0.5'
                />
              )}
            </button>
          ))}
        </div>
      </section>

      <section className='w-full flex-1 shrink-0 grow pt-4 md:pt-6'>
        <div className='relative h-full w-full'>
          <AnimatePresence mode='wait'>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.2 }}
              className='h-full w-full'
            >
              {activeTab === 'all-operators' && (
                <div className='mx-auto max-w-7xl'>
                  <UsersTable />
                </div>
              )}
              {activeTab === 'new-operator' && (
                <div className='mx-auto max-w-7xl'>
                  <NewUserForm company_id={user?.company_id} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}
