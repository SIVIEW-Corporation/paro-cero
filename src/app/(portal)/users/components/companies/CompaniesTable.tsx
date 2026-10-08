'use client';

import { useState } from 'react';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Power,
  PowerOff,
} from 'lucide-react';
import * as motion from 'motion/react-client';
import Button from '@/global-components/Button';
import { cn } from '@/lib/utils';
import formatDate from '@/utils/format-date';
import ConfirmModal from '../confirm-modal';
import CompanyFormModal from './CompanyFormModal';
import { useCompaniesListQuery } from '../../hooks/use-companies-list-query';
import { useUpdateCompanyMutation } from '../../hooks/use-companies-mutations';
import type { Company } from '../../services/companies-service';

const PAGE_SIZE = 10;

const BADGE_BASE =
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold';

function CompanyStatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        BADGE_BASE,
        active
          ? 'bg-shSuccess-50 text-shSuccess-800 border-shSuccess-200'
          : 'bg-shNeutral-100 text-shNeutral-500 border-shNeutral-200',
      )}
    >
      {active ? 'Activa' : 'Inactiva'}
    </span>
  );
}

export default function CompaniesTable() {
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Company | null>(null);
  const [toggling, setToggling] = useState<Company | null>(null);

  const { data, isPending, isFetching, error } = useCompaniesListQuery(
    page,
    PAGE_SIZE,
  );
  const updateCompany = useUpdateCompanyMutation();

  const handleConfirmToggle = () => {
    if (!toggling || updateCompany.isPending) return;
    updateCompany.mutate(
      {
        id: toggling.id,
        payload: { active: toggling.active === 1 ? 0 : 1 },
      },
      { onSettled: () => setToggling(null) },
    );
  };

  const columns: ColumnDef<Company>[] = [
    {
      accessorKey: 'name',
      header: 'Empresa',
      cell: ({ row }) => (
        <p
          title={row.original.name}
          className='text-shNeutral-900 max-w-xs truncate text-xs font-semibold sm:text-sm lg:text-base'
        >
          {row.original.name}
        </p>
      ),
    },
    {
      accessorKey: 'rfc',
      header: 'RFC',
      cell: ({ row }) => (
        <span className='text-shNeutral-500 font-mono text-xs sm:text-sm'>
          {row.original.rfc || 'N/A'}
        </span>
      ),
    },
    {
      accessorKey: 'active',
      header: 'Estado',
      cell: ({ row }) => (
        <CompanyStatusBadge active={row.original.active === 1} />
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Creada',
      cell: ({ row }) => {
        const formatted = formatDate(row.original.created_at ?? '');
        return (
          <span
            className='text-shNeutral-400 text-xs sm:text-sm lg:text-base'
            title={formatted}
          >
            {formatted.split(',')[0]}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const isActive = row.original.active === 1;
        return (
          <div className='flex items-center gap-1.5'>
            <Button
              type='button'
              aria-label='Editar empresa'
              title='Editar'
              intent='primary'
              variant='ghost'
              icon={<Pencil size={16} />}
              scale='101'
              shadowSize='none'
              className='size-8 rounded-lg p-0'
              onClick={() => setEditing(row.original)}
            />
            <Button
              type='button'
              aria-label={isActive ? 'Desactivar empresa' : 'Activar empresa'}
              title={isActive ? 'Desactivar' : 'Activar'}
              intent={isActive ? 'danger' : 'success'}
              variant='ghost'
              icon={isActive ? <PowerOff size={16} /> : <Power size={16} />}
              scale='101'
              shadowSize='none'
              className='size-8 rounded-lg p-0'
              onClick={() => setToggling(row.original)}
            />
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    pageCount: data?.pages ?? -1,
    manualPagination: true,
  });

  const total = data?.total ?? 0;
  const currentPage = data?.page ?? 1;
  const pages = data?.pages ?? 1;
  const from = total > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const to = Math.min(currentPage * PAGE_SIZE, total);
  const rows = table.getRowModel().rows;
  const isDeactivating = toggling?.active === 1;

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center p-12 text-center'>
        <div className='bg-shDanger-50 text-shDanger-600 mb-4 rounded-full p-3'>
          <AlertCircle size={32} />
        </div>
        <p className='text-shNeutral-900 text-lg font-bold'>
          Error al cargar empresas
        </p>
        <p className='text-shNeutral-500'>{error.message}</p>
      </div>
    );
  }

  return (
    <div className='relative flex w-full flex-col gap-6'>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className='border-shNeutral-200/80 overflow-hidden rounded-2xl border bg-white'
      >
        <div className='overflow-x-auto'>
          <table className='w-full min-w-[720px] border-collapse text-left'>
            <thead className='bg-shPrimary-900'>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className='border-shNeutral-200 border-b px-4 py-3 text-[11px] font-bold tracking-wider text-white uppercase select-none md:px-6'
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className='bg-white'>
              {isPending
                ? [...Array(5)].map((_, i) => (
                    <tr
                      key={i}
                      className='border-shNeutral-100 bg-shNeutral-50 animate-pulse border-b last:border-b-0'
                    >
                      {columns.map((_, j) => (
                        <td key={j} className='px-4 py-5 md:px-6'>
                          <div className='bg-shNeutral-100 h-4 rounded-md' />
                        </td>
                      ))}
                    </tr>
                  ))
                : rows.map((row) => (
                    <tr
                      key={row.id}
                      className='hover:bg-shNeutral-50 border-shNeutral-100 border-b bg-white transition-colors last:border-b-0'
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className='px-4 py-3 align-middle md:px-6 md:py-4'
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {!isPending && rows.length === 0 && (
          <div className='flex flex-col items-center justify-center bg-white py-20 text-center'>
            <div className='bg-shNeutral-50 border-shNeutral-200 mb-4 rounded-full border p-4'>
              <AlertCircle size={32} className='text-shNeutral-400' />
            </div>
            <p className='text-shNeutral-900 mb-1 text-base font-bold'>
              No hay empresas registradas
            </p>
            <p className='text-shNeutral-500 text-sm'>
              Crea una nueva empresa para comenzar.
            </p>
          </div>
        )}

        {/* Pagination Controls */}
        <div className='border-shNeutral-200 flex flex-col items-center justify-between gap-6 border-t bg-white px-4 py-4 sm:flex-row sm:gap-3 md:px-6'>
          <p className='text-shNeutral-400 flex-1 text-xs font-medium sm:text-sm lg:text-base'>
            Mostrando{' '}
            <span className='text-shNeutral-500 font-bold'>{from}</span> a{' '}
            <span className='text-shNeutral-500 font-bold'>{to}</span> de{' '}
            <span className='text-shPrimary-700 font-bold'>{total}</span>{' '}
            empresas
          </p>
          <div className='flex items-center gap-1 sm:gap-2 md:gap-3'>
            <Button
              type='button'
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={isFetching || currentPage <= 1}
              aria-label='Página anterior'
              title='Página anterior'
              intent='neutral'
              variant='ghost'
              icon={<ChevronLeft size={18} />}
              scale='101'
              shadowSize='none'
              className='size-9 rounded-lg p-0'
            />
            <Button
              type='button'
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={isFetching || currentPage >= pages}
              aria-label='Página siguiente'
              title='Página siguiente'
              intent='neutral'
              variant='ghost'
              icon={<ChevronRight size={18} />}
              scale='101'
              shadowSize='none'
              className='size-9 rounded-lg p-0'
            />
          </div>
        </div>
      </motion.div>

      <ConfirmModal
        isOpen={Boolean(toggling)}
        userName={toggling?.name ?? ''}
        onCancel={() => setToggling(null)}
        onConfirm={handleConfirmToggle}
        isPending={updateCompany.isPending}
        title={isDeactivating ? '¿Desactivar empresa?' : '¿Activar empresa?'}
        confirmLabel={isDeactivating ? 'Desactivar' : 'Activar'}
        loadingText={isDeactivating ? 'Desactivando...' : 'Activando...'}
        confirmIntent={isDeactivating ? 'danger' : 'success'}
        description={
          <p className='text-shNeutral-500'>
            {isDeactivating
              ? 'La empresa dejará de estar disponible para asignar nuevos usuarios: '
              : 'La empresa volverá a estar disponible para asignar usuarios: '}
            <span className='text-shNeutral-900 font-bold'>
              {toggling?.name}
            </span>
            . Puedes revertir este cambio en cualquier momento.
          </p>
        }
      />

      {editing && (
        <CompanyFormModal
          key={editing.id}
          company={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
