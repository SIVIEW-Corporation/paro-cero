'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import Button from '@/global-components/Button';
import CompaniesTable from './CompaniesTable';
import CompanyFormModal from './CompanyFormModal';

/** Company management for the platform superadmin. */
export default function CompaniesTab() {
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className='flex w-full flex-col gap-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <h2 className='font-inter text-shNeutral-900 text-lg font-bold md:text-xl xl:text-2xl'>
            Empresas
          </h2>
          <p className='text-shNeutral-500 font-inter text-sm'>
            Registra empresas, actualiza sus datos y controla si están activas.
          </p>
        </div>
        <Button
          type='button'
          onClick={() => setIsCreating(true)}
          icon={<Plus size={18} />}
          intent='accent'
          variant='primary'
          scale='101'
        >
          Nueva empresa
        </Button>
      </div>

      <CompaniesTable />

      {isCreating && <CompanyFormModal onClose={() => setIsCreating(false)} />}
    </div>
  );
}
