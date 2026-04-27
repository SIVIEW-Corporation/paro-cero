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
import ConfirmModal from './confirm-modal';

import formatDate from '@/utils/format-date';
import { useOperatorsQuery } from '../hooks/use-users-query';
import { useDeleteUserMutation } from '../hooks/use-delete-user-mutation';

const roleBadgeStyles: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  operator: {
    bg: 'bg-app-warning-soft',
    text: 'text-app-brand-dark',
    border: 'border-app-brand/20',
  },
  admin: {
    bg: 'bg-app-info-soft',
    text: 'text-app-info',
    border: 'border-app-info/20',
  },
  viewer: {
    bg: 'bg-app-success-soft',
    text: 'text-app-success',
    border: 'border-app-success/20',
  },
};

const paginationButtonClasses =
  'inline-flex size-9 items-center justify-center rounded-lg border border-app-border-soft bg-app-surface text-app-text-secondary transition-colors hover:border-app-border hover:bg-app-surface-subtle hover:text-app-text-primary disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:border-app-border-soft disabled:hover:bg-app-surface disabled:hover:text-app-text-secondary focus-visible:ring-2 focus-visible:ring-app-brand focus-visible:ring-offset-2 focus-visible:ring-offset-app-surface focus-visible:outline-none';

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
            className='truncate text-xs sm:text-sm lg:text-base'
          >
            <p className='text-app-text-primary font-semibold capitalize'>
              {displayName}
            </p>
            <p className='text-app-text-secondary text-[10px] font-normal sm:text-xs lg:text-sm'>
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
            className='text-app-text-secondary truncate text-xs font-normal capitalize sm:text-sm lg:text-base'
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
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${style.bg} ${style.text} ${style.border}`}
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
            className='text-app-text-muted text-xs sm:text-sm lg:text-base'
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
        <div className='flex items-center gap-1.5'>
          <button
            type='button'
            aria-label='Editar usuario'
            className='text-app-text-muted hover:bg-app-info-soft hover:text-app-info focus-visible:ring-app-brand focus-visible:ring-offset-app-surface inline-flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
            title='Editar'
          >
            <Pencil size={16} />
          </button>
          <button
            type='button'
            aria-label='Eliminar usuario'
            className='text-app-text-muted hover:bg-app-danger-soft hover:text-app-danger focus-visible:ring-app-brand focus-visible:ring-offset-app-surface inline-flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
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
        <p className='text-app-text-primary text-lg font-bold'>
          Error al cargar usuarios
        </p>
        <p className='text-app-text-secondary'>{error.message}</p>
      </div>
    );
  }

  return (
    <div className='flex w-full flex-col gap-6'>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className='border-app-border-soft bg-app-surface overflow-hidden rounded-2xl border shadow-sm shadow-slate-900/5'
      >
        <div className='overflow-x-auto'>
          <table className='w-full min-w-[760px] border-collapse text-left'>
            <thead className='bg-app-surface-subtle'>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className='text-app-text-secondary px-4 py-3 text-xs font-semibold tracking-wide select-none md:px-6'
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
            <tbody className='divide-app-border-soft bg-app-surface divide-y'>
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
                        <td key={j} className='px-4 py-5 md:px-6'>
                          <div className='bg-app-surface-muted h-4 rounded' />
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
                        className='bg-app-surface hover:bg-app-surface-subtle transition-colors'
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
            <div className='bg-app-surface-subtle mb-4 rounded-full p-4'>
              <AlertCircle size={32} className='text-app-text-muted' />
            </div>
            <p className='text-app-text-primary mb-2 text-sm font-bold md:text-base lg:text-lg'>
              No se encontraron usuarios
            </p>
          </motion.div>
        )}

        {/* Pagination Controls */}
        <div className='border-app-border-soft bg-app-surface flex flex-col items-center justify-between gap-6 border-t px-4 py-4 sm:flex-row sm:gap-3 md:px-6'>
          <div className='flex-1'>
            <p className='text-app-text-muted text-xs font-medium sm:text-sm lg:text-base'>
              Mostrando{' '}
              <span className='text-app-text-secondary font-bold'>{from}</span>{' '}
              a <span className='text-app-text-secondary font-bold'>{to}</span>{' '}
              de <span className='text-app-brand font-bold'>{total}</span>{' '}
              usuarios
            </p>
          </div>
          <div className='flex items-center gap-1 sm:gap-2 md:gap-3'>
            <button
              type='button'
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={isFetching || currentPage <= 1}
              aria-label='Página anterior'
              title='Página Anterior'
              className={paginationButtonClasses}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type='button'
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={isFetching || currentPage >= pages}
              aria-label='Página siguiente'
              title='Página Siguiente'
              className={paginationButtonClasses}
            >
              <ChevronRight size={18} />
            </button>
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
