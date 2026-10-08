'use client';

import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  AlertCircle,
  Building2,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
} from 'lucide-react';
import * as motion from 'motion/react-client';
import { useAuthStore, User } from '@/store/auth-store';
import {
  getAppRole,
  getRoleLabel,
  type AppRole,
} from '@/features/technician/access';
import ConfirmModal from './confirm-modal';
import EditUserModal from './EditUserModal';

import formatDate from '@/utils/format-date';
import { useOperatorsQuery } from '../hooks/use-users-query';
import { useCompaniesQuery } from '../hooks/use-companies-query';
import {
  getCompanyFilterOptions,
  getCompanyName,
  toCompanyFilter,
} from '../lib/users-company-filter';
import { useDeleteUserMutation } from '../hooks/use-delete-user-mutation';
import Button from '@/global-components/Button';

interface RoleBadgeStyle {
  bg: string;
  text: string;
  border: string;
}

const neutralBadge: RoleBadgeStyle = {
  bg: 'bg-shNeutral-50',
  text: 'text-shNeutral-700',
  border: 'border-shNeutral-200',
};

const managerBadge: RoleBadgeStyle = {
  bg: 'bg-shPrimary-50',
  text: 'text-shPrimary-700',
  border: 'border-shPrimary-200',
};

const roleBadgeStyles: Record<AppRole, RoleBadgeStyle> = {
  superadmin: managerBadge,
  admin: managerBadge,
  operator: neutralBadge,
  viewer: {
    bg: 'bg-shSuccess-50',
    text: 'text-shSuccess-700',
    border: 'border-shSuccess-200',
  },
};

interface ConfirmModalState {
  isOpen: boolean;
  userId: string;
  userName: string;
}

export default function UsersTable() {
  const [page, setPage] = useState(1);
  const [companyFilter, setCompanyFilter] = useState<string | null>(null);
  const size = 10;
  const sessionKey = useAuthStore(
    (state) =>
      `${state.user?.id ?? 'anonymous'}:${state.user?.company_id ?? 'none'}:${state.user?.role ?? 'anonymous'}`,
  );
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    isOpen: false,
    userId: '',
    userName: '',
  });
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    user: User | null;
  }>({ isOpen: false, user: null });

  const { data, isPending, isFetching, error } = useOperatorsQuery(
    page,
    size,
    companyFilter,
  );
  const companiesQuery = useCompaniesQuery(true, { includeInactive: true });
  const companies = companiesQuery.data?.items;
  const companyOptions = getCompanyFilterOptions(companies);
  const deleteMutation = useDeleteUserMutation();

  useEffect(() => {
    setPage(1);
    setCompanyFilter(null);
  }, [sessionKey]);

  const handleCompanyFilterChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setCompanyFilter(toCompanyFilter(event.target.value));
    setPage(1);
  };

  const handleDeleteClick = (userId: string, userName: string) => {
    setConfirmModal({ isOpen: true, userId, userName });
  };

  const handleCloseModal = () => {
    setConfirmModal({ isOpen: false, userId: '', userName: '' });
  };

  const handleCloseEditModal = () => {
    setEditModal({ isOpen: false, user: null });
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
            <p className='text-shNeutral-900 font-semibold capitalize'>
              {displayName}
            </p>
            <p className='text-shNeutral-500 text-[10px] font-normal sm:text-xs lg:text-sm'>
              {jobTitle}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: 'company_id',
      header: 'Empresa',
      cell: ({ row }) => {
        const companyName = getCompanyName(companies, row.original.company_id);
        return (
          <span
            title={companyName}
            className='text-shNeutral-700 block max-w-[180px] truncate text-xs font-medium sm:text-sm lg:text-base'
          >
            {companyName}
          </span>
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
            className='text-shNeutral-500 truncate text-xs font-normal capitalize sm:text-sm lg:text-base'
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
        const appRole = getAppRole(role);
        const style = appRole ? roleBadgeStyles[appRole] : neutralBadge;
        const label = getRoleLabel(role);
        return (
          <span
            title={label}
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${style.bg} ${style.text} ${style.border}`}
          >
            {label}
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
            className='text-shNeutral-400 text-xs sm:text-sm lg:text-base'
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
          <Button
            type='button'
            aria-label='Editar usuario'
            title='Editar'
            intent='primary'
            variant='ghost'
            icon={<Pencil size={16} />}
            scale='101'
            shadowSize='none'
            className='size-8 rounded-lg p-0'
            onClick={() => setEditModal({ isOpen: true, user: row.original })}
          />
          <Button
            type='button'
            aria-label='Eliminar usuario'
            title='Eliminar'
            intent='danger'
            variant='ghost'
            icon={<Trash2 size={16} />}
            scale='101'
            shadowSize='none'
            className='size-8 rounded-lg p-0'
            onClick={() =>
              handleDeleteClick(row.original.id, row.original.full_name)
            }
          />
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
        <div className='bg-shDanger-50 text-shDanger-600 mb-4 rounded-full p-3'>
          <AlertCircle size={32} />
        </div>
        <p className='text-shNeutral-900 text-lg font-bold'>
          Error al cargar usuarios
        </p>
        <p className='text-shNeutral-500'>{error.message}</p>
      </div>
    );
  }

  return (
    <div className='relative flex w-full flex-col gap-6'>
      {/* Decorative orb */}
      <div className='bg-shAccent-500/5 pointer-events-none absolute -top-12 -right-12 h-64 w-64 rounded-full blur-3xl' />

      <div className='group relative z-10 flex flex-col gap-1.5 sm:max-w-xs'>
        <label
          htmlFor='users-company-filter'
          className='text-shNeutral-700 group-focus-within:text-shPrimary-700 text-xs font-medium transition-colors duration-300'
        >
          Filtrar por empresa
        </label>
        <div className='border-shNeutral-200 focus-within:border-shPrimary-500 focus-within:ring-shPrimary-500/15 flex items-center overflow-hidden rounded-lg border bg-white transition-all focus-within:ring-2'>
          <div className='text-shNeutral-600 group-focus-within:text-shPrimary-700 flex w-11 shrink-0 items-center justify-center transition-colors'>
            <Building2 size={16} />
          </div>
          <select
            id='users-company-filter'
            value={companyFilter ?? ''}
            onChange={handleCompanyFilterChange}
            disabled={companiesQuery.isPending || companiesQuery.isError}
            className='text-shNeutral-900 flex-1 cursor-pointer appearance-none border-0! bg-transparent! py-2.5 pr-4 text-sm ring-0! outline-none! disabled:cursor-not-allowed disabled:opacity-60'
          >
            {companyOptions.map((option) => (
              <option key={option.value || 'all'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className='border-shNeutral-200/80 somecard overflow-hidden rounded-2xl border bg-white'
      >
        <div className='overflow-x-auto'>
          <table className='w-full min-w-[900px] border-collapse text-left'>
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
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 + i * 0.03 }}
                      className='border-shNeutral-100 bg-shNeutral-50 animate-pulse border-b last:border-b-0'
                    >
                      {columns.map((_, j) => (
                        <td key={j} className='px-4 py-5 md:px-6'>
                          <div className='bg-shNeutral-100 h-4 rounded-md' />
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
            className='flex flex-col items-center justify-center bg-white py-20 text-center'
          >
            <div className='bg-shNeutral-50 border-shNeutral-200 mb-4 rounded-full border p-4'>
              <AlertCircle size={32} className='text-shNeutral-400' />
            </div>
            <p className='text-shNeutral-900 mb-1 text-base font-bold'>
              No se encontraron usuarios
            </p>
            <p className='text-shNeutral-500 text-sm'>
              Crea un nuevo usuario para comenzar.
            </p>
          </motion.div>
        )}

        {/* Pagination Controls */}
        <div className='border-shNeutral-200 flex flex-col items-center justify-between gap-6 border-t bg-white px-4 py-4 sm:flex-row sm:gap-3 md:px-6'>
          <div className='flex-1'>
            <p className='text-shNeutral-400 text-xs font-medium sm:text-sm lg:text-base'>
              Mostrando{' '}
              <span className='text-shNeutral-500 font-bold'>{from}</span> a{' '}
              <span className='text-shNeutral-500 font-bold'>{to}</span> de{' '}
              <span className='text-shPrimary-700 font-bold'>{total}</span>{' '}
              usuarios
            </p>
          </div>
          <div className='flex items-center gap-1 sm:gap-2 md:gap-3'>
            <Button
              type='button'
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={isFetching || currentPage <= 1}
              aria-label='Página anterior'
              title='Página Anterior'
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
              title='Página Siguiente'
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        userName={confirmModal.userName}
        onCancel={handleCloseModal}
        onConfirm={handleConfirmDelete}
        isPending={deleteMutation.isPending}
      />

      {/* Edit User Modal */}
      {editModal.user && (
        <EditUserModal
          key={editModal.user.id}
          isOpen={editModal.isOpen}
          user={editModal.user}
          onClose={handleCloseEditModal}
        />
      )}
    </div>
  );
}
