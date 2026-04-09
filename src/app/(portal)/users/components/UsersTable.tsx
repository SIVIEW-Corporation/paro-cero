'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState,
} from '@tanstack/react-table';
import {
  FileText,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowDownZA,
  ArrowUpAZ,
  AlertCircle,
  RefreshCw,
  Download,
} from 'lucide-react';
import * as motion from 'motion/react-client';
import { User } from '@/store/auth-store';
import Button from '@/global-components/Button';

import formatDate from '@/utils/format-date';
// import { useGetMockDocuments } from '@/hooks/useDocuments';

const filterVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0 },
};

export default function HistoricalDataTable({
  isDiotUser = false,
}: {
  isDiotUser?: boolean;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(globalFilter);
    }, 900);
    return () => clearTimeout(timer);
  }, [globalFilter]);

  // Always call both hooks (rules of hooks), but use data based on user type
  const anexo30Data = useGetDocuments();
  const diotData = useGetDiotDocuments();

  // Use the appropriate data based on user type
  const {
    data: serverData = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = isDiotUser ? diotData : anexo30Data;

  // const {
  //   data: serverData = [],
  //   isLoading,
  //   isFetching,
  //   error,
  //   refetch,
  // } = useGetMockDocuments(2000);

  // Perform filtering on the client for instant feedback and zero network load
  const clientFilteredData = useMemo(() => {
    let result = [...serverData];

    // Sort by fechaCreacion descending (newest first) as default
    result.sort(
      (a, b) =>
        new Date(b.fechaCreacion).getTime() -
        new Date(a.fechaCreacion).getTime(),
    );

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter((d) => d.status === statusFilter);
    }

    // Filter by search term
    if (debouncedSearch) {
      const term = debouncedSearch.toLowerCase();
      result = result.filter((d) => d.path.toLowerCase().includes(term));
    }

    return result;
  }, [serverData, statusFilter, debouncedSearch]);

  // Summary counts always reflect the FULL dataset for statistical context
  const counts = useMemo(() => {
    if (!serverData)
      return { cargado: 0, procesando: 0, completado: 0, error: 0 };
    return {
      cargado: serverData.filter((d) => d.status === 'cargado').length,
      procesando: serverData.filter((d) => d.status === 'procesando').length,
      completado: serverData.filter((d) => d.status === 'completado').length,
      error: serverData.filter((d) => d.status === 'error').length,
    };
  }, [serverData]);

  const columns = useMemo<ColumnDef<UploadDocument>[]>(
    () => [
      {
        accessorKey: 'path',
        header: 'Documento',
        cell: ({ row }) => {
          return (
            <div className='flex items-start gap-3'>
              <div className='mt-1 hidden h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 md:flex'>
                <FileText size={20} />
              </div>
              <div className='flex flex-col'>
                <span
                  className='xs:text-xs max-w-[200px] truncate text-[10px] font-semibold text-zinc-700 sm:text-xs md:text-sm xl:max-w-[320px] xl:text-base'
                  title={row.original.fileName}
                >
                  {row.original.fileName}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        id: 'periodo',
        header: 'Período',
        accessorFn: (row) => row.anio * 100 + row.mes,
        cell: ({ row }) => (
          <span className='xs:text-xs text-[10px] font-medium text-zinc-500 sm:text-xs md:text-sm xl:text-base'>
            {formatPeriodo(row.original.mes, row.original.anio)}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Estado',
        enableSorting: false,
        cell: ({ getValue }) => {
          const status = getValue<DocumentStatus>();
          const config = statusConfig[status];
          if (!config) return null;

          const icons: Record<DocumentStatus, React.ReactNode> = {
            pendiente: <Clock size={14} />,
            cargado: <FileText size={14} />,
            procesando: <Clock size={14} />,
            completado: <CheckCircle2 size={14} />,
            error: <XCircle size={14} />,
          };

          return (
            <div
              className={`xs:text-[10px] inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] font-bold sm:text-xs md:px-2 md:py-0.5 ${config.bgColor} ${config.color}`}
            >
              <span className='hidden sm:inline'>{icons[status]}</span>
              {config.label}
            </div>
          );
        },
      },
      {
        accessorKey: 'fechaCreacion',
        header: 'Fecha de carga',
        cell: ({ getValue }) => (
          <span className='xs:text-xs text-[10px] font-medium text-zinc-500 sm:text-xs md:text-sm xl:text-base'>
            {formatDate(getValue<string>())}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => {
          const status = row.original.status;
          const reportesDiot = row.original.reportesDiot ?? [];
          const hasReportes = reportesDiot.length > 0;

          return (
            <div className='flex w-fit items-center justify-start pl-4'>
              {status === 'completado' && hasReportes && (
                <button
                  className='text-primary-500 hover:bg-primary-50 cursor-pointer rounded-lg p-2 transition-colors'
                  title='Descargar'
                  onClick={() => {
                    console.log('Download document:', {
                      id: row.original.id,
                      fileName: row.original.fileName,
                      path: row.original.path,
                      storagePaths: reportesDiot.map((r) => r.STORAGE_PATH),
                    });
                  }}
                >
                  <Download size={18} />
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: clientFilteredData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      sorting: [
        {
          id: 'fechaCreacion',
          desc: true,
        },
      ],
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center p-12 text-center'>
        <div className='mb-4 rounded-full bg-red-100 p-3 text-red-600'>
          <AlertCircle size={32} />
        </div>
        <p className='text-lg font-bold text-zinc-800'>Error al cargar datos</p>
        <p className='text-zinc-500'>{error.message}</p>
      </div>
    );
  }

  return (
    <div className='flex w-full flex-col gap-6'>
      {/* Search and Filters */}
      <motion.div
        initial='hidden'
        animate='visible'
        variants={filterVariants}
        transition={{ duration: 0.4, delay: 0.2 }}
        className='shadow-primary-200/5 border-primary-50 flex flex-col items-center justify-between gap-4 rounded-2xl border bg-white p-4 shadow-sm md:flex-row'
      >
        <div className='relative w-full max-w-2xl'>
          <Search
            className='text-primary-300 absolute top-1/2 left-4 -translate-y-1/2'
            size={18}
          />
          <input
            type='text'
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder='Buscar documentos...'
            className='focus:ring-primary-300 shadow-primary-100/15 w-full rounded-xl bg-zinc-50 py-3 pr-4 pl-12 text-xs text-zinc-700 shadow-md outline outline-zinc-200 transition-all placeholder:text-zinc-400 focus:ring focus:outline-none md:text-sm lg:text-base'
          />
        </div>
        <section className='flex shrink-0 flex-wrap gap-2'>
          <div className='custom-select-container w-fit shrink-0'>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className='focus:ring-primary-300 custom-select shadow-primary-100/10 w-full rounded-xl border border-zinc-200/80 p-4 font-medium text-zinc-600 shadow-md transition-all outline-none focus:ring md:w-auto'
            >
              <option value='all'>Todos los estados</option>
              <option value='pendiente'>Pendiente</option>
              <option value='cargado'>Cargado</option>
              <option value='procesando'>Procesando</option>
              <option value='completado'>Completado</option>
              <option value='error'>Error</option>
            </select>
          </div>
          <Button
            variant='ghost'
            intent='primary'
            onClick={() => refetch()}
            disabled={isFetching}
            icon={
              <RefreshCw
                size={18}
                className={isFetching ? 'animate-spin' : ''}
              />
            }
            tooltip='Refrescar datos de la tabla'
          >
            Refrescar
          </Button>
        </section>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial='hidden'
        animate='visible'
        variants={filterVariants}
        transition={{ duration: 0.6, delay: 0.2 }}
        className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'
      >
        <div className='flex items-center gap-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4'>
          <div className='flex h-10 w-10 items-center justify-center rounded-lg border border-blue-100 bg-white text-blue-500'>
            <FileText size={20} />
          </div>
          <div className='flex items-center gap-2 sm:flex-col sm:items-start sm:gap-0'>
            <p className='text-base leading-tight font-bold text-blue-600 sm:text-lg xl:text-xl'>
              {counts.cargado}
            </p>
            <p className='text-xs font-semibold text-blue-500/80 md:text-sm'>
              Cargado
            </p>
          </div>
        </div>
        <div className='flex items-center gap-4 rounded-xl border border-yellow-200 bg-yellow-50/50 p-4'>
          <div className='flex h-10 w-10 items-center justify-center rounded-lg border border-yellow-100 bg-white text-yellow-500'>
            <Clock size={20} />
          </div>
          <div className='flex items-center gap-2 sm:flex-col sm:items-start sm:gap-0'>
            <p className='text-base leading-tight font-bold text-yellow-600 sm:text-lg xl:text-xl'>
              {counts.procesando}
            </p>
            <p className='text-xs font-semibold text-yellow-500/80 md:text-sm'>
              Procesando
            </p>
          </div>
        </div>
        <div className='flex items-center gap-4 rounded-xl border border-green-100 bg-green-50/50 p-4'>
          <div className='flex h-10 w-10 items-center justify-center rounded-lg border border-green-100 bg-white text-green-500'>
            <CheckCircle2 size={20} />
          </div>
          <div className='flex items-center gap-2 sm:flex-col sm:items-start sm:gap-0'>
            <p className='text-base leading-tight font-bold text-green-600 sm:text-lg xl:text-xl'>
              {counts.completado}
            </p>
            <p className='text-xs font-semibold text-green-500/80 md:text-sm'>
              Completado
            </p>
          </div>
        </div>
        <div className='flex items-center gap-4 rounded-xl border border-red-100 bg-red-50/50 p-4'>
          <div className='flex h-10 w-10 items-center justify-center rounded-lg border border-red-100 bg-white text-red-500'>
            <XCircle size={20} />
          </div>
          <div className='flex items-center gap-2 sm:flex-col sm:items-start sm:gap-0'>
            <p className='text-base leading-tight font-bold text-red-600 sm:text-lg xl:text-xl'>
              {counts.error}
            </p>
            <p className='text-xs font-semibold text-red-500/80 md:text-sm'>
              Error
            </p>
          </div>
        </div>
      </motion.div>

      {/* Table Section */}
      <motion.div
        initial='hidden'
        animate='visible'
        variants={filterVariants}
        transition={{ duration: 0.7, delay: 0.3 }}
        className='shadow-primary-400/20 overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-inner'
      >
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse text-left'>
            <thead className='bg-primary-400/15'>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={`xs:text-xs px-2 py-3 text-[10px] font-bold text-zinc-600 select-none sm:text-xs md:px-6 md:py-4 md:text-sm ${header.column.getCanSort() ? 'hover:bg-primary-300/20 hover:text-primary-500 cursor-pointer transition-colors duration-300' : ''}`}
                    >
                      <div
                        className='flex items-center gap-2'
                        onClick={header.column.getToggleSortingHandler()}
                        title={
                          header.column.getCanSort()
                            ? header.column.getNextSortingOrder() === 'asc'
                              ? 'Ordenar ascendente'
                              : header.column.getNextSortingOrder() === 'desc'
                                ? 'Ordenar descendente'
                                : 'Limpiar orden'
                            : undefined
                        }
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {header.column.getCanSort() &&
                          !header.column.getIsSorted() && (
                            <ArrowUpDown className='h-2.5 w-2.5 transition-all duration-150 hover:scale-[120%] hover:text-blue-400 md:h-3.5 md:w-3.5' />
                          )}
                        {{
                          asc: (
                            <ArrowUpAZ className='h-3 w-3 transition-all duration-150 hover:scale-[120%] hover:text-blue-400 md:h-4 md:w-4' />
                          ),
                          desc: (
                            <ArrowDownZA className='h-3 w-3 transition-all duration-150 hover:scale-[120%] hover:text-blue-400 md:h-4 md:w-4' />
                          ),
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className='divide-y divide-zinc-50'>
              {isLoading
                ? [...Array(5)].map((_, i) => (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 + i * 0.03 }}
                      className='animate-pulse'
                    >
                      {[...Array(5)].map((_, j) => (
                        <td key={j} className='px-6 py-5'>
                          <div className='h-4 rounded bg-zinc-100' />
                        </td>
                      ))}
                    </motion.tr>
                  ))
                : table.getRowModel().rows.map((row, index) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + index * 0.03 }}
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
        {!isLoading && table.getRowModel().rows.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className='flex flex-col items-center justify-center bg-white py-20 text-center'
          >
            <div className='mb-4 rounded-full bg-zinc-100 p-4'>
              <Search size={32} className='text-zinc-400' />
            </div>
            <p className='mb-2 text-sm font-bold text-zinc-700 md:text-base lg:text-lg'>
              No se encontraron documentos
            </p>
            <p className='text-xs text-zinc-400 md:text-sm lg:text-base'>
              Prueba con otros términos de búsqueda o filtros
            </p>
          </motion.div>
        )}

        {/* Pagination Controls */}
        <div className='bg-primary-400/15 flex flex-col items-center justify-between gap-6 border-t border-zinc-100 px-6 py-6 sm:flex-row sm:gap-3'>
          <div className='flex-1'>
            <p className='text-[10px] font-medium text-zinc-500 sm:text-xs lg:text-sm'>
              Mostrando{' '}
              <span className='font-bold text-zinc-800'>
                {table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                  1}
              </span>{' '}
              a{' '}
              <span className='font-bold text-zinc-800'>
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) *
                    table.getState().pagination.pageSize,
                  clientFilteredData.length,
                )}
              </span>{' '}
              de{' '}
              <span className='font-bold text-zinc-800'>
                {clientFilteredData.length}
              </span>{' '}
              documentos
            </p>
          </div>
          <div className='flex items-center gap-1 sm:gap-2 md:gap-3'>
            <div className='sm:hidden'>
              <Button
                variant='secondary'
                intent='primary'
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                icon={<ChevronLeft size={12} />}
                tooltip='Página Anterior'
              />
            </div>

            <div className='hidden sm:block'>
              <Button
                variant='secondary'
                intent='primary'
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                icon={<ChevronLeft size={20} />}
                tooltip='Página Anterior'
              />
            </div>
            <div className='flex items-center gap-1'>
              {(() => {
                const currentPage = table.getState().pagination.pageIndex;
                const totalPages = table.getPageCount();
                const pages: (number | string)[] = [];

                if (totalPages <= 7) {
                  for (let i = 0; i < totalPages; i++) pages.push(i);
                } else {
                  pages.push(0);
                  if (currentPage > 3) {
                    pages.push('...');
                  }

                  let start = Math.max(1, currentPage - 1);
                  let end = Math.min(totalPages - 2, currentPage + 1);

                  if (currentPage <= 3) {
                    end = 4;
                  } else if (currentPage >= totalPages - 4) {
                    start = totalPages - 5;
                  }

                  for (let i = start; i <= end; i++) {
                    pages.push(i);
                  }

                  if (currentPage < totalPages - 4) {
                    pages.push('...');
                  }
                  pages.push(totalPages - 1);
                }

                return pages.map((page, i) => {
                  if (page === '...') {
                    return (
                      <span
                        key={`ellipsis-${i}`}
                        className='px-2 text-[10px] font-bold text-zinc-400 sm:text-sm'
                      >
                        ...
                      </span>
                    );
                  }
                  const pageNum = (page as number) + 1;
                  const isActive = currentPage === page;
                  return (
                    <button
                      key={i}
                      onClick={() => table.setPageIndex(page as number)}
                      className={`h-8 w-8 rounded-lg text-[10px] font-bold transition-all sm:h-10 sm:w-10 sm:text-sm ${
                        isActive
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                });
              })()}
            </div>

            <div className='sm:hidden'>
              <Button
                variant='secondary'
                intent='primary'
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                icon={<ChevronRight size={12} />}
                tooltip='Página Siguiente'
              />
            </div>

            <div className='hidden sm:block'>
              <Button
                variant='secondary'
                intent='primary'
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                icon={<ChevronRight size={20} />}
                tooltip='Página Siguiente'
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
