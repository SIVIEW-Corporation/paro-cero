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
      <main className='relative flex min-h-screen flex-col items-center justify-center'>
        <div className='bg-pattern-2 absolute inset-0 -z-10' />
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
          <p className='text-zinc-500'>Cargando sesión...</p>
        </div>
      </main>
    );
  }

  // Admin guard — redirect non-admin users
  if (!isAdmin) {
    return (
      <main className='container mx-auto max-w-7xl pt-2'>
        <div className='flex flex-col items-center justify-center py-16'>
          <h2 className='text-shGray-200 text-xl font-bold'>
            Acceso restringido
          </h2>
          <p className='text-shGray-500 mt-2 text-sm'>
            Solo los administradores pueden crear usuarios.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className='container mx-auto max-w-7xl pt-2'>
      <section className='mb-6 md:mb-8 xl:mb-12'>
        <h1 className='font-inter mb-1 text-center text-xl font-bold md:mb-1.5 md:text-2xl xl:text-3xl'>
          Gestionar usuarios
        </h1>
        <p className='text-shGray-500 font-inter text-center text-xs md:text-sm xl:text-base'>
          Aquí podrás crear, editar y eliminar perfiles. También podrás asignar
          roles y permisos.
        </p>
      </section>

      <section className='w-full overflow-x-auto'>
        <div className='border-shGray-700 flex min-w-max items-center gap-1 border-b px-4 md:min-w-0 md:gap-3'>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              title={tab.label}
              className={`relative flex shrink-0 cursor-pointer items-center gap-2 px-3 py-3 font-medium transition-colors duration-200 md:px-6 md:py-4 ${
                activeTab === tab.id
                  ? 'text-shPrimary-500'
                  : 'text-zinc-400 hover:text-zinc-300'
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
                  className='bg-shPrimary-400 absolute right-0 bottom-0 left-0 h-[2px]'
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
    </main>
  );
}
