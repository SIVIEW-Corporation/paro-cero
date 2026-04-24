'use client';

import { useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
} from 'lucide-react';
import * as motion from 'motion/react-client';
import { User } from '@/store/auth-store';
import Button from '@/global-components/Button';
import ConfirmModal from './confirm-modal';

import formatDate from '@/utils/format-date';
import { useOperatorsQuery } from '../hooks/use-users-query';
import { useDeleteUserMutation } from '../hooks/use-delete-user-mutation';

const roleBadgeStyles: Record<string, { bg: string; text: string; border: string }> = {
  operator: { bg: 'bg-app-brand-soft', text: 'text-app-brand-dark', border: 'border-app-brand-soft' },
  admin: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  viewer: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
};

interface ConfirmModalState {
  isOpen: boolean;
  userId: string;
  userName: string;
}

export default function UsersTable() {
  const [page, setPage] = useState(1);
  const size = 10;
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    isOpen: false,
    userId: '',
    userName: '',
  });

  const { data, isPending, isFetching, error } = useOperatorsQuery(page, size);
  const deleteMutation = useDeleteUserMutation();

  const handleDeleteClick = (userId: string, userName: string) => {
    setConfirmModal({ isOpen: true, userId, userName });
  };

  const handleCloseModal = () => {
    setConfirmModal({ isOpen: false, userId: '', userName: '' });
  };

  const handleConfirmDelete = () => {
    if (deleteMutation.isPending) return;
    deleteMutation.mutate(confirmModal.userId);
    handleCloseModal();
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'full_name',
      header: 'Usuario',
      cell: ({ row }) => {
        const fullName = row.original.full_name;
        const displayName =
          fullName.length > 25 ? `${fullName.slice(0, 25)}…` : fullName;
        const jobTitle = row.original.job_title;
        return (
          <div
            title={fullName}
            className='truncate text-xs font-black sm:text-sm lg:text-base'
          >
            <p className='capitalize text-app-text-primary'>{displayName}</p>
            <p className='text-[10px] font-normal text-app-text-muted sm:text-xs lg:text-sm'>
              {jobTitle}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: 'area',
      header: 'Area',
      cell: ({ row }) => {
        const jobArea = row.original.area ?? 'N/A';
        return (
          <span
            title={jobArea}
            className='truncate text-xs font-normal text-app-text-secondary capitalize sm:text-sm lg:text-base'
          >
            {jobArea}
          </span>
        );
      },
    },
    {
      accessorKey: 'role',
      header: 'Rol',
      cell: ({ row }) => {
        const role = row.original.role;
        const style = roleBadgeStyles[role] ?? {
          bg: 'bg-app-surface-subtle',
          text: 'text-app-text-secondary',
          border: 'border-app-border-soft',
        };
        return (
          <span
            title={role}
            className={`-ml-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold sm:-ml-2 lg:text-sm ${style.bg} ${style.text} border ${style.border}`}
          >
            {role}
          </span>
        );
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Agregado',
      cell: ({ row }) => {
        const dateStr = row.original.created_at ?? '';
        const formatted = formatDate(dateStr);
        const dateWithoutHour = formatted.split(',')[0];
        return (
          <span
            className='text-xs text-app-text-muted sm:text-sm lg:text-base'
            title={formatted}
          >
            {dateWithoutHour}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <button
            type='button'
            aria-label='Editar usuario'
            className='hover:text-app-brand cursor-pointer rounded p-1 text-app-text-muted transition-colors hover:scale-105'
            title='Editar'
          >
            <Pencil size={16} />
          </button>
          <button
            type='button'
            aria-label='Eliminar usuario'
            className='cursor-pointer rounded p-1 text-app-text-muted transition-colors hover:scale-105 hover:text-red-500'
            title='Eliminar'
            onClick={() =>
              handleDeleteClick(row.original.id, row.original.full_name)
            }
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
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
  const from = total > 0 ? (currentPage - 1) * size + 1 : 0;
  const to = Math.min(currentPage * size, total);

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center p-12 text-center'>
        <div className='mb-4 rounded-full bg-red-100 p-3 text-red-600'>
          <AlertCircle size={32} />
        </div>
        <p className='text-lg font-bold text-app-text-primary'>
          Error al cargar usuarios
        </p>
        <p className='text-app-text-secondary'>{error.message}</p>
      </div>
    );
  }

  return (
    <div className='mt-4 flex w-full flex-col gap-6 md:mt-6'>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className='border-app-border-soft bg-app-surface overflow-hidden rounded-2xl border shadow-[0_1px_2px_rgba(15,23,42,0.04)]'
      >
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse text-left'>
            <thead className='bg-app-surface-subtle'>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className='px-2 py-3 text-xs font-bold text-app-text-secondary select-none sm:text-sm md:px-6 md:py-4 lg:text-base'
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
            <tbody className='divide-app-border-soft divide-y'>
              {isPending
                ? [...Array(5)].map((_, i) => (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 + i * 0.03 }}
                      className='animate-pulse'
                    >
                      {[...Array(4)].map((_, j) => (
                        <td key={j} className='px-6 py-5'>
                          <div className='h-4 rounded bg-app-surface-subtle' />
                        </td>
                      ))}
                    </motion.tr>
                  ))
                : table.getRowModel().rows.length === 0
                  ? null
                  : table.getRowModel().rows.map((row, index) => (
                      <motion.tr
                        key={row.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.03 }}
                        className='hover:bg-app-surface-subtle transition-colors'
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className='px-2 py-2 align-middle md:px-6 md:py-3'
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        ))}
                      </motion.tr>
                    ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {!isPending && table.getRowModel().rows.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className='bg-app-surface flex flex-col items-center justify-center py-20 text-center'
          >
            <div className='mb-4 rounded-full bg-app-surface-subtle p-4'>
              <AlertCircle size={32} className='text-app-text-muted' />
            </div>
            <p className='mb-2 text-sm font-bold text-app-text-primary md:text-base lg:text-lg'>
              No se encontraron usuarios
            </p>
          </motion.div>
        )}

        {/* Pagination Controls */}
        <div className='border-app-border-soft flex flex-col items-center justify-between gap-6 border-t px-6 py-6 sm:flex-row sm:gap-3'>
          <div className='flex-1'>
            <p className='text-xs font-medium text-app-text-muted sm:text-sm lg:text-base'>
              Mostrando <span className='font-bold text-app-text-secondary'>{from}</span>{' '}
              a <span className='font-bold text-app-text-secondary'>{to}</span> de{' '}
              <span className='text-app-brand font-bold'>{total}</span>{' '}
              usuarios
            </p>
          </div>
          <div className='flex items-center gap-1 sm:gap-2 md:gap-3'>
            <Button
              variant='secondary'
              intent='primary'
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={isFetching || currentPage <= 1}
              icon={<ChevronLeft size={20} />}
              tooltip='Página Anterior'
            />
            <Button
              variant='secondary'
              intent='primary'
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={isFetching || currentPage >= pages}
              icon={<ChevronRight size={20} />}
              tooltip='Página Siguiente'
            />
          </div>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        userName={confirmModal.userName}
        onCancel={handleCloseModal}
        onConfirm={handleConfirmDelete}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
