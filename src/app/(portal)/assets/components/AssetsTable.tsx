'use client';

import { useState, useEffect } from 'react';
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
  Filter,
  Search,
  ArrowUpDown,
} from 'lucide-react';
import * as motion from 'motion/react-client';
import { Asset, useAuthStore } from '@/store/auth-store';
import ConfirmModal from './confirm-modal';
import EditAssetModal from './EditAssetModal';

import formatDate from '@/utils/format-date';
import { useAssetsQuery } from '../hooks/use-users-query';
import { useDeleteAssetMutation } from '../hooks/use-delete-user-mutation';
import Button from '@/global-components/Button';

const criticalityBadgeStyles: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  low: {
    bg: 'bg-shSuccess-50',
    text: 'text-shSuccess-800',
    border: 'border-shSuccess-200',
  },
  medium: {
    bg: 'bg-shPrimary-50',
    text: 'text-shPrimary-800',
    border: 'border-shPrimary-200',
  },
  high: {
    bg: 'bg-shAccent-50',
    text: 'text-shAccent-800',
    border: 'border-shAccent-200',
  },
  critical: {
    bg: 'bg-shDanger-50',
    text: 'text-shDanger-800',
    border: 'border-shDanger-200',
  },
};

const statusBadgeStyles: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  commissioning: {
    bg: 'bg-shPrimary-50',
    text: 'text-shPrimary-800',
    border: 'border-shPrimary-200',
  },
  operational: {
    bg: 'bg-shSuccess-50',
    text: 'text-shSuccess-800',
    border: 'border-shSuccess-200',
  },
  standby: {
    bg: 'bg-shAccent-50',
    text: 'text-shAccent-800',
    border: 'border-shAccent-200',
  },
  maintenance: {
    bg: 'bg-shNeutral-50',
    text: 'text-shNeutral-800',
    border: 'border-shNeutral-200',
  },
  down: {
    bg: 'bg-shDanger-50',
    text: 'text-shDanger-800',
    border: 'border-shDanger-200',
  },
  decommissioned: {
    bg: 'bg-shNeutral-100',
    text: 'text-shNeutral-500',
    border: 'border-shNeutral-200',
  },
};

const statusLabels: Record<string, string> = {
  commissioning: 'En instalación',
  operational: 'Operando',
  standby: 'En espera',
  maintenance: 'En mantenimiento',
  down: 'Fuera de servicio',
  decommissioned: 'Dado de baja',
};

const criticalityLabels: Record<string, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  critical: 'Crítica',
};

interface ConfirmModalState {
  isOpen: boolean;
  assetId: string;
  assetName: string;
}

export default function AssetsTable() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  const [page, setPage] = useState(1);
  const size = 10;

  const [criticalityFilter, setCriticalityFilter] = useState<string | null>(
    null,
  );
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [areaFilter, setAreaFilter] = useState('');
  const [codeFilter, setCodeFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    setPage(1);
  }, [
    criticalityFilter,
    statusFilter,
    areaFilter,
    codeFilter,
    sortBy,
    sortOrder,
  ]);

  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    isOpen: false,
    assetId: '',
    assetName: '',
  });
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    asset: Asset | null;
  }>({ isOpen: false, asset: null });

  const { data, isPending, isFetching, error } = useAssetsQuery({
    page,
    size,
    sortBy: sortBy || undefined,
    sortOrder: sortOrder || undefined,
    criticality: criticalityFilter,
    status: statusFilter,
    area: areaFilter || undefined,
    code: codeFilter || undefined,
  });
  const deleteMutation = useDeleteAssetMutation();

  const handleDeleteClick = (assetId: string, assetName: string) => {
    setConfirmModal({ isOpen: true, assetId, assetName });
  };

  const handleCloseModal = () => {
    setConfirmModal({ isOpen: false, assetId: '', assetName: '' });
  };

  const handleCloseEditModal = () => {
    setEditModal({ isOpen: false, asset: null });
  };

  const handleConfirmDelete = () => {
    if (deleteMutation.isPending) return;
    deleteMutation.mutate(confirmModal.assetId);
    handleCloseModal();
  };

  const columns: ColumnDef<Asset>[] = [
    {
      accessorKey: 'name',
      header: 'Asset',
      cell: ({ row }) => {
        const fullName = row.original.name;
        const displayName =
          fullName.length > 25 ? `${fullName.slice(0, 25)}…` : fullName;
        const code = row.original.code;
        return (
          <div
            title={fullName}
            className='truncate text-xs sm:text-sm lg:text-base'
          >
            <p className='text-shNeutral-900 font-semibold capitalize'>
              {displayName}
            </p>
            <p className='text-shNeutral-500 text-[10px] font-normal sm:text-xs lg:text-sm'>
              {code}
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
            className='text-shNeutral-500 truncate text-xs font-normal capitalize sm:text-sm lg:text-base'
          >
            {jobArea}
          </span>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ row }) => {
        const status = row.original.status;
        const style = statusBadgeStyles[status] ?? {
          bg: 'bg-shNeutral-50',
          text: 'text-shNeutral-700',
          border: 'border-shNeutral-200',
        };
        return (
          <span
            title={statusLabels[status] ?? status}
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${style.bg} ${style.text} ${style.border}`}
          >
            {statusLabels[status] ?? status}
          </span>
        );
      },
    },
    {
      accessorKey: 'criticality',
      header: 'Criticidad',
      cell: ({ row }) => {
        const criticality = row.original.criticality;
        const style = criticalityBadgeStyles[criticality] ?? {
          bg: 'bg-shNeutral-50',
          text: 'text-shNeutral-700',
          border: 'border-shNeutral-200',
        };
        return (
          <span
            title={criticalityLabels[criticality] ?? criticality}
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${style.bg} ${style.text} ${style.border}`}
          >
            {criticalityLabels[criticality] ?? criticality}
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
    ...(isAdmin
      ? [
          {
            id: 'actions',
            header: 'Acciones',
            cell: ({ row }: { row: { original: Asset } }) => (
              <div className='flex items-center gap-1.5'>
                <Button
                  type='button'
                  aria-label='Editar activo'
                  title='Editar'
                  intent='primary'
                  variant='ghost'
                  icon={<Pencil size={16} />}
                  scale='101'
                  shadowSize='none'
                  className='size-8 rounded-lg p-0'
                  onClick={() =>
                    setEditModal({ isOpen: true, asset: row.original })
                  }
                />
                <Button
                  type='button'
                  aria-label='Eliminar activo'
                  title='Eliminar'
                  intent='danger'
                  variant='ghost'
                  icon={<Trash2 size={16} />}
                  scale='101'
                  shadowSize='none'
                  className='size-8 rounded-lg p-0'
                  onClick={() =>
                    handleDeleteClick(row.original.id, row.original.name)
                  }
                />
              </div>
            ),
          } satisfies ColumnDef<Asset>,
        ]
      : []),
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
          Error al cargar activos
        </p>
        <p className='text-shNeutral-500'>{error.message}</p>
      </div>
    );
  }

  return (
    <div className='relative flex w-full flex-col gap-6 xl:gap-8'>
      {/* Decorative orb */}
      <div className='bg-shAccent-500/5 pointer-events-none absolute -top-12 -right-12 h-64 w-64 rounded-full blur-3xl' />

      {/* Filter & Sort Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className='flex flex-col gap-4 xl:flex-row xl:items-center'>
          {/* Left: Filters */}
          <section className='from-shNeutral-50 w-fit shrink-0 rounded-xl border-0 bg-linear-to-t to-white px-6 pt-4 pb-1 shadow-xs xl:w-full xl:flex-1 xl:grow'>
            <div className='text-shNeutral-500 flex items-center gap-2'>
              <Filter size={14} />
              <span className='text-xs font-medium'>Filtrar por:</span>
            </div>

            <div className='flex flex-1 flex-wrap items-center gap-3 py-4'>
              {/* Criticality Dropdown */}
              <div className='custom-select-container text-xs'>
                <select
                  value={criticalityFilter ?? ''}
                  onChange={(e) => setCriticalityFilter(e.target.value || null)}
                  className='custom-select rounded-lg px-3 py-2 text-xs shadow-inner'
                >
                  <option value=''>Todas las criticidades</option>
                  <option value='low'>Baja</option>
                  <option value='medium'>Media</option>
                  <option value='high'>Alta</option>
                  <option value='critical'>Crítica</option>
                </select>
              </div>

              {/* Status Dropdown */}
              <div className='custom-select-container text-xs'>
                <select
                  value={statusFilter ?? ''}
                  onChange={(e) => setStatusFilter(e.target.value || null)}
                  className='custom-select rounded-lg px-3 py-2 text-xs shadow-inner'
                >
                  <option value=''>Todos los estados</option>
                  <option value='commissioning'>En instalación</option>
                  <option value='operational'>Operando</option>
                  <option value='standby'>En espera</option>
                  <option value='maintenance'>En mantenimiento</option>
                  <option value='down'>Fuera de servicio</option>
                  <option value='decommissioned'>Dado de baja</option>
                </select>
              </div>

              {/* Area Input */}
              <div className='group'>
                <div className='border-shPrimary-100 focus-within:border-shAccent-500 flex items-center overflow-hidden rounded-lg border bg-white transition-all'>
                  <div className='text-shNeutral-500 group-focus-within:text-shAccent-600 flex w-10 shrink-0 items-center justify-center transition-colors'>
                    <Search size={14} />
                  </div>
                  <input
                    type='text'
                    placeholder='Área...'
                    value={areaFilter}
                    onChange={(e) => setAreaFilter(e.target.value)}
                    className='bg-shNeutral-50 text-shNeutral-900 placeholder:text-shNeutral-600 border-shNeutral-200 flex-1 border-l px-3 py-2 pr-4 pl-2 text-xs shadow-inner ring-0! outline-none'
                  />
                </div>
              </div>

              {/* Code Input */}
              <div className='group'>
                <div className='border-shPrimary-100 focus-within:border-shAccent-500 flex items-center overflow-hidden rounded-lg border bg-white transition-all'>
                  <div className='text-shNeutral-500 group-focus-within:text-shAccent-600 flex w-10 shrink-0 items-center justify-center transition-colors'>
                    <Search size={14} />
                  </div>
                  <input
                    type='text'
                    placeholder='Código...'
                    value={codeFilter}
                    onChange={(e) => setCodeFilter(e.target.value)}
                    className='bg-shNeutral-50 text-shNeutral-900 placeholder:text-shNeutral-600 border-shNeutral-200 flex-1 border-l px-3 py-2 pr-4 pl-2 text-xs shadow-inner ring-0! outline-none'
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Right: Sort Controls */}
          <section className='from-shNeutral-50 w-fit flex-none shrink-0 grow-0 rounded-xl bg-linear-to-tl to-white px-6 pt-4 pb-1 shadow-xs'>
            <div className='text-shNeutral-500 flex items-center gap-2'>
              <ArrowUpDown size={14} />
              <span className='text-xs font-medium'>Ordenar por:</span>
            </div>

            <div className='flex flex-1 flex-wrap items-center gap-3 py-4'>
              <div className='custom-select-container text-xs'>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className='custom-select rounded-lg px-3 py-2 text-xs shadow-inner'
                >
                  <option value='created_at'>Fecha creación</option>
                  <option value='name'>Nombre</option>
                  <option value='code'>Código</option>
                  <option value='area'>Área</option>
                  <option value='criticality'>Criticidad</option>
                  <option value='status'>Estado</option>
                </select>
              </div>
              <div className='custom-select-container text-xs'>
                <select
                  value={sortOrder}
                  onChange={(e) =>
                    setSortOrder(e.target.value as 'asc' | 'desc')
                  }
                  className='custom-select rounded-lg px-3 py-2 text-xs shadow-inner'
                >
                  <option value='asc'>Ascendente</option>
                  <option value='desc'>Descendente</option>
                </select>
              </div>
              {/* <button
                type='button'
                onClick={() =>
                  setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
                }
                className='bg-shNeutral-50 border-shNeutral-200 hover:bg-shNeutral-100 flex size-9 shrink-0 items-center justify-center rounded-lg border transition-colors'
                title={sortOrder === 'asc' ? 'Ascendente' : 'Descendente'}
              >
                {sortOrder === 'asc' ? (
                  <ArrowUp size={14} className='text-shNeutral-600' />
                ) : (
                  <ArrowDown size={14} className='text-shNeutral-600' />
                )}
              </button> */}
            </div>
          </section>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className='somecard overflow-hidden rounded-2xl bg-white'
      >
        <div className='overflow-x-auto'>
          <table className='w-full min-w-[760px] border-collapse text-left'>
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
                      {[...Array(columns.length)].map((_, j) => (
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
              No se encontraron activos
            </p>
            <p className='text-shNeutral-500 text-sm'>
              Crea un nuevo activo para comenzar.
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
              activos
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
        assetName={confirmModal.assetName}
        onCancel={handleCloseModal}
        onConfirm={handleConfirmDelete}
        isPending={deleteMutation.isPending}
      />

      {/* Edit Asset Modal */}
      {editModal.asset && (
        <EditAssetModal
          key={editModal.asset.id}
          isOpen={editModal.isOpen}
          asset={editModal.asset}
          onClose={handleCloseEditModal}
        />
      )}
    </div>
  );
}
