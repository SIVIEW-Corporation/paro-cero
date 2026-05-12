'use client';

import { useAuthStore } from '@/store/auth-store';
import { useState, useEffect } from 'react';
import { LayersPlus, Layers } from 'lucide-react';
import * as motion from 'motion/react-client';
import { AnimatePresence } from 'motion/react';
import Image from 'next/image';

import NewAssetForm from './NewAssetForm';
import AssetsTable from './components/AssetsTable';
import {
  SectionTabs,
  type tabInterface,
} from '@/global-components/SectionTabs';

export default function AssetsPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const [activeTab, setActiveTab] = useState('all-operators');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    if (!isAdmin && activeTab === 'new-operator') {
      setActiveTab('all-operators');
    }
  }, [isAdmin, activeTab]);

  const tabs: tabInterface[] = [
    {
      id: 'all-operators',
      label: 'Activos disponibles',
      icon: <Layers size={20} />,
    },
    ...(isAdmin
      ? [
          {
            id: 'new-operator' as const,
            label: 'Crear nuevo',
            icon: <LayersPlus size={20} />,
          },
        ]
      : []),
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
          <p className='text-shNeutral-400'>Cargando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <main className='z-10 container mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8'>
      <section className='mb-6 md:mb-8'>
        <h1 className='font-inter text-shNeutral-900 mb-1 text-2xl font-semibold tracking-[-0.02em] md:text-3xl'>
          Gestión de activos
        </h1>
        <p className='text-shNeutral-500 font-inter max-w-2xl text-sm leading-6 md:text-base'>
          Aquí puedes ver los assets disponibles y sus procesos relacionados.
        </p>
      </section>

      <SectionTabs
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

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
                  <AssetsTable />
                </div>
              )}
              {activeTab === 'new-operator' && (
                <div className='mx-auto max-w-7xl'>
                  <NewAssetForm company_id={user?.company_id} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}
