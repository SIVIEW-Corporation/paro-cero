'use client';

import { useAuthStore } from '@/store/auth-store';
import { useState, useEffect } from 'react';
import { Building2, UserRoundPlus, UsersRound } from 'lucide-react';
import * as motion from 'motion/react-client';
import { AnimatePresence } from 'motion/react';
import Image from 'next/image';

import NewUserForm from './NewUserForm';
import UsersTable from './components/UsersTable';
import CompaniesTab from './components/companies/CompaniesTab';
import {
  canManageCompanies,
  getUsersTabIds,
  resolveUsersTab,
  USERS_TABS,
  type UsersTabId,
} from './lib/users-tabs';
import {
  SectionTabs,
  type tabInterface,
} from '@/global-components/SectionTabs';

export default function UsersPage() {
  const user = useAuthStore((s) => s.user);
  const isSuperadmin = user?.role === 'superadmin';
  const [activeTab, setActiveTab] = useState('historico');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    if (isSuperadmin) {
      setActiveTab('all-users');
    }
  }, [isSuperadmin]);

  const tabDefinitions: Record<UsersTabId, tabInterface> = {
    [USERS_TABS.ALL_USERS]: {
      id: USERS_TABS.ALL_USERS,
      label: 'Usuarios disponibles',
      icon: <UsersRound size={20} />,
    },
    [USERS_TABS.NEW_USER]: {
      id: USERS_TABS.NEW_USER,
      label: 'Crear nuevo',
      icon: <UserRoundPlus size={20} />,
    },
    [USERS_TABS.COMPANIES]: {
      id: USERS_TABS.COMPANIES,
      label: 'Empresas',
      icon: <Building2 size={20} />,
    },
  };
  const tabs = getUsersTabIds(user?.role).map((id) => tabDefinitions[id]);
  // Never render a tab the current role cannot see, even if it was forced.
  const currentTab = resolveUsersTab(user?.role, activeTab);
  const showCompanies =
    currentTab === USERS_TABS.COMPANIES && canManageCompanies(user?.role);

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
          <p className='text-shNeutral-400'>Cargando sesión...</p>
        </div>
      </div>
    );
  }

  // User management is intentionally restricted to the platform superuser.
  if (!isSuperadmin) {
    return (
      <main className='z-10 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='flex flex-col items-center justify-center py-16'>
          <h2 className='text-shNeutral-900 text-xl font-bold'>
            Acceso restringido
          </h2>
          <p className='text-shNeutral-500 mt-2 text-sm'>
            Solo el superusuario puede gestionar usuarios.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className='z-10 container mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8'>
      <section className='mb-6 md:mb-8'>
        <h1 className='font-inter text-shNeutral-900 mb-1 text-2xl font-semibold tracking-[-0.02em] md:text-3xl'>
          Gestionar usuarios
        </h1>
        <p className='text-shNeutral-500 font-inter max-w-2xl text-sm leading-6 md:text-base'>
          Aquí podrás crear, editar y eliminar perfiles. También podrás asignar
          roles y permisos.
        </p>
      </section>

      <SectionTabs
        tabs={tabs}
        activeTab={currentTab}
        setActiveTab={setActiveTab}
      />

      <section className='w-full flex-1 shrink-0 grow pt-4 md:pt-6'>
        <div className='relative h-full w-full'>
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.2 }}
              className='h-full w-full'
            >
              {currentTab === USERS_TABS.ALL_USERS && (
                <div className='mx-auto max-w-7xl'>
                  <UsersTable />
                </div>
              )}
              {currentTab === USERS_TABS.NEW_USER && (
                <div className='mx-auto max-w-7xl'>
                  <NewUserForm currentRole={user?.role} />
                </div>
              )}
              {showCompanies && (
                <div className='mx-auto max-w-7xl'>
                  <CompaniesTab />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}
