'use client';

import { useState } from 'react';
import Link from 'next/link';
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
  RotateCw,
} from 'lucide-react';
import * as motion from 'motion/react-client';
import { useAuthStore } from '@/store/auth-store';
import Button from '@/global-components/Button';
import ConfirmModal from './confirm-modal';
import EditAssetModal from './EditAssetModal';
import { AssetCriticalityBadge, AssetStatusBadge } from './asset-badges';
import { useAssetsQuery } from '../hooks/use-assets-query';
import { useDeleteAssetMutation } from '../hooks/use-delete-asset-mutation';
import { canManageAssets } from '../lib/asset-permissions';
import { formatAssetDateTime, formatAssetShortDate } from '../lib/asset-format';
import {
  ASSET_CRITICALITIES,
  ASSET_CRITICALITY_LABELS,
  ASSET_PAGE_SIZE,
  ASSET_STATUSES,
  ASSET_STATUS_LABELS,
  type Asset,
  type AssetCriticality,
  type AssetStatus,
} from '../types';

interface ConfirmModalState {
  isOpen: boolean;
  assetId: string;
  assetName: string;
}

export default function AssetsTable() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = canManageAssets(user?.role);

  const [page, setPage] = useState(1);
  const size = ASSET_PAGE_SIZE;

  const [criticalityFilter, setCriticalityFilter] =
    useState<AssetCriticality | null>(null);
  const [statusFilter, setStatusFilter] = useState<AssetStatus | null>(null);

  const handleCriticalityChange = (value: string) => {
    setCriticalityFilter(
      ASSET_CRITICALITIES.find((item) => item === value) ?? null,
    );
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(ASSET_STATUSES.find((item) => item === value) ?? null);
    setPage(1);
  };

  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    isOpen: false,
    assetId: '',
    assetName: '',
  });
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    asset: Asset | null;
  }>({ isOpen: false, asset: null });

  const { data, isPending, isFetching, error, refetch } = useAssetsQuery({
    page,
    size,
    criticality: criticalityFilter,
    status: statusFilter,
  });
  const deleteMutation = useDeleteAssetMutation();

  // Deleting the last row of the last page leaves `page` out of range.
  if (data && data.pages > 0 && page > data.pages) {
    setPage(data.pages);
  }

  const handleDeleteClick = (assetId: string, assetName: string) => {
    setConfirmModal({ isOpen: true, assetId, assetName });
  };

  const handleCloseModal = () => {
    if (deleteMutation.isPending) return;
    setConfirmModal({ isOpen: false, assetId: '', assetName: '' });
  };

  const handleCloseEditModal = () => {
    setEditModal({ isOpen: false, asset: null });
  };

  const handleConfirmDelete = () => {
    if (deleteMutation.isPending) return;
    // Keep the modal open while pending; close once the result is known.
    // Success, 404 (already gone) and other errors are toasted by the hook.
    deleteMutation.mutate(confirmModal.assetId, {
      onSettled: () =>
        setConfirmModal({ isOpen: false, assetId: '', assetName: '' }),
    });
  };

  const columns: ColumnDef<Asset>[] = [
    {
      accessorKey: 'name',
      header: 'Activo',
      cell: ({ row }) => {
        const fullName = row.original.name;
        const displayName =
          fullName.length > 25 ? `${fullName.slice(0, 25)}…` : fullName;
        const code = row.original.code;
        return (
          <Link
            href={`/assets/${row.original.id}`}
            title={`Ver detalle de ${fullName}`}
            className='group/link focus-visible:ring-shPrimary-500/40 block truncate rounded-md text-xs outline-none focus-visible:ring-2 sm:text-sm lg:text-base'
          >
            <p className='text-shNeutral-900 group-hover/link:text-shPrimary-700 font-semibold capitalize underline-offset-2 group-hover/link:underline'>
              {displayName}
            </p>
            <p className='text-shNeutral-500 text-[10px] font-normal sm:text-xs lg:text-sm'>
              {code}
            </p>
          </Link>
        );
      },
    },
    {
      accessorKey: 'area',
      header: 'Área',
      cell: ({ row }) => {
        const jobArea = row.original.area;
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
      cell: ({ row }) => <AssetStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'criticality',
      header: 'Criticidad',
      cell: ({ row }) => (
        <AssetCriticalityBadge criticality={row.original.criticality} />
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Agregado',
      cell: ({ row }) => (
        <span
          className='text-shNeutral-400 text-xs sm:text-sm lg:text-base'
          title={formatAssetDateTime(row.original.created_at)}
        >
          {formatAssetShortDate(row.original.created_at)}
        </span>
      ),
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
        <p className='text-shNeutral-500 mb-4'>{error.message}</p>
        <Button
          type='button'
          onClick={() => refetch()}
          loading={isFetching}
          loadingText='Reintentando...'
          icon={<RotateCw size={16} />}
          intent='primary'
          variant='secondary'
        >
          Reintentar
        </Button>
      </div>
    );
  }

  const hasFilters = Boolean(criticalityFilter || statusFilter);

  return (
    <div className='relative flex w-full flex-col gap-6 xl:gap-8'>
      {/* Decorative orb */}
      <div className='bg-shAccent-500/5 pointer-events-none absolute -top-12 -right-12 h-64 w-64 rounded-full blur-3xl' />

      {/* Filter Bar (the API only filters by criticality and status; order is fixed: newest first) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <section className='from-shNeutral-50 w-full rounded-xl border-0 bg-linear-to-t to-white px-6 pt-4 pb-1 shadow-xs'>
          <div className='text-shNeutral-500 flex items-center gap-2'>
            <Filter size={14} />
            <span className='text-xs font-medium'>Filtrar por:</span>
          </div>

          <div className='flex flex-1 flex-wrap items-center gap-3 py-4'>
            {/* Criticality Dropdown */}
            <div className='custom-select-container text-xs'>
              <select
                aria-label='Filtrar por criticidad'
                value={criticalityFilter ?? ''}
                onChange={(e) => handleCriticalityChange(e.target.value)}
                className='custom-select rounded-lg px-3 py-2 text-xs shadow-inner'
              >
                <option value=''>Todas las criticidades</option>
                {ASSET_CRITICALITIES.map((criticality) => (
                  <option key={criticality} value={criticality}>
                    {ASSET_CRITICALITY_LABELS[criticality]}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Dropdown */}
            <div className='custom-select-container text-xs'>
              <select
                aria-label='Filtrar por estado'
                value={statusFilter ?? ''}
                onChange={(e) => handleStatusChange(e.target.value)}
                className='custom-select rounded-lg px-3 py-2 text-xs shadow-inner'
              >
                <option value=''>Todos los estados</option>
                {ASSET_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {ASSET_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>

            <span className='text-shNeutral-400 text-xs'>
              Ordenados del más reciente al más antiguo
            </span>
          </div>
        </section>
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
              {hasFilters
                ? 'Prueba con otros filtros de criticidad o estado.'
                : 'Crea un nuevo activo para comenzar.'}
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
