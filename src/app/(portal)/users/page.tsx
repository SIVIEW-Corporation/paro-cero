'use client';

import { useAuthStore } from '@/store/auth-store';
import { useState, useEffect } from 'react';
import { UserRoundPlus, UsersRound } from 'lucide-react';
import * as motion from 'motion/react-client';
import { AnimatePresence } from 'motion/react';
import Image from 'next/image';

import { PageHeader } from '@/components/ui';
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
      <div className='flex h-full items-center justify-center p-4'>
        <div className='text-center'>
          <h2 className='text-app-text-primary text-xl font-bold'>
            Acceso restringido
          </h2>
          <p className='text-app-text-secondary mt-2 text-sm'>
            Solo los administradores pueden crear usuarios.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='h-full overflow-y-auto p-4 sm:p-6 lg:p-7'>
      <PageHeader
        title='Gestionar usuarios'
        sub='Crear, editar y eliminar perfiles · Asignar roles y permisos'
      />

      <section className='w-full overflow-x-auto'>
        <div className='border-app-border-soft flex min-w-max items-center gap-1 border-b px-4 md:min-w-0 md:gap-3'>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              title={tab.label}
              className={`relative flex shrink-0 cursor-pointer items-center gap-2 px-3 py-3 font-medium transition-colors duration-200 md:px-6 md:py-4 ${
                activeTab === tab.id
                  ? 'text-app-brand'
                  : 'text-app-text-muted hover:text-app-text-secondary'
              }`}
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.icon}
              <span className='hidden md:inline'>
                <h2>{tab.label}</h2>
              </span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId='underline'
                  className='bg-app-brand absolute right-0 bottom-0 left-0 h-[2px]'
                />
              )}
            </button>
          ))}
        </div>
      </section>

      <section className='w-full flex-1 shrink-0 grow p-4 md:px-6'>
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
    </div>
  );
}
