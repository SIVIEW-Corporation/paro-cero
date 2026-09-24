'use client';

import { useRef, useState } from 'react';
import { EChartsArea, EChartsPie } from '@/components/charts';
import { toast } from 'sonner';

import {
  PLANS,
  complianceData,
  tipoData,
  topFallas,
} from '@/app/data/mock-data';
import { STC, STL, PRC, PRL, CRC } from '@/app/data/constants';

import {
  Badge,
  KpiCard,
  Td,
  PageHeader,
  Card,
  CardTitle,
  RowData,
  BtnPrimary,
  BtnGhost,
  BtnBack,
  DataTable,
  Modal,
  Field,
  ModalFooter,
} from '@/components/ui';

import type { Activo, OrdenTrabajo } from '@/app/data/types';
import { useCreateAssetMutation } from '@/hooks/use-asset-mutations';
import AssetFormFields from '@/components/assets/asset-form-fields';
import AssetDetailActions from '@/components/assets/asset-detail-actions';
import {
  buildAssetCreate,
  initialAssetForm,
  type AssetFormState,
} from '@/components/assets/asset-form';
import {
  isAssetSessionCurrent,
  useAssetSession,
} from '@/hooks/use-asset-session';

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('supervisor@apex.com');
  const [pass, setPass] = useState('demo1234');
  const [error, setError] = useState('');

  function handleLogin() {
    if (!email.trim()) {
      setError('Ingresa un correo electronico.');
      return;
    }
    if (!pass.trim()) {
      setError('Ingresa una contrasena.');
      return;
    }
    setError('');
    onLogin();
  }

  return (
    <div className='bg-shGray-800 relative flex min-h-screen items-center justify-center overflow-hidden'>
      <div
        className='pointer-events-none absolute inset-0'
        style={{
          backgroundImage:
            'linear-gradient(rgba(30,58,95,0.15) 1px,transparent 1px),linear-gradient(90deg,rgba(30,58,95,0.15) 1px,transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      />
      <div
        className='pointer-events-none absolute top-[30%] left-[50%] h-[600px] w-[600px] -translate-x-[50%] -translate-y-[50%]'
        style={{
          background:
            'radial-gradient(circle,rgba(245,158,11,0.06) 0%,transparent 65%)',
        }}
      />

      <div className='relative z-10 w-[440px]'>
        <div className='mb-9 text-center'>
          <div className='mb-2.5 inline-flex items-center gap-3.5'>
            <div className='flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500'>
              <svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
                <path
                  d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'
                  stroke='#000'
                  strokeWidth='2.2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </div>
            <div className='text-left'>
              <div className='text-[26px] leading-none font-black tracking-tight text-slate-100'>
                APEX <span className='text-amber-500'>Maintenance</span>
              </div>
              <div className='mt-0.5 text-xs tracking-widest text-slate-600 uppercase'>
                Sistema de Gestion de Mantenimiento
              </div>
            </div>
          </div>
        </div>

        <Card className='p-9'>
          <Field label='Correo electronico'>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='usuario@empresa.com'
            />
          </Field>
          <Field label='Contrasena'>
            <input
              type='password'
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder='Contrasena'
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleLogin();
              }}
            />
          </Field>

          {error && (
            <div className='mb-4 rounded-md border border-red-500/30 bg-red-500/15 px-3.5 py-2.5 text-sm text-red-500'>
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            className='font-inherit w-full cursor-pointer rounded-lg border-none bg-amber-500 py-3.5 text-base font-extrabold tracking-wide text-black'
          >
            Iniciar Sesion →
          </button>

          <div className='border-shGray-600 bg-shGray-700 mt-5 rounded-lg border p-3.5'>
            <div className='mb-1.5 text-xs font-bold tracking-wider text-slate-500 uppercase'>
              Credenciales de Demo
            </div>
            <div className='font-mono text-xs text-slate-600'>
              supervisor@apex.com / demo1234
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

interface DashboardProps {
  wo: OrdenTrabajo[];
}

interface WorkOrder {
  id: string;
  assetId: string;
  titulo: string;
  status: string;
  prioridad: string;
  downtime?: number;
  fechaVen: string;
  fechaCompromiso?: string | Date;
  asignado: string;
  tipo: string;
  folio: string;
}

const chartColors = {
  info: '#2563eb',
  success: '#16a34a',
  warning: '#d89b2b',
  danger: '#dc2626',
  muted: '#94a3b8',
};

export function Dashboard({ wo }: DashboardProps) {
  const [pendingLimit, setPendingLimit] = useState<'5' | '10' | '15' | 'all'>(
    '5',
  );
  const workOrders = wo as unknown as WorkOrder[];

  const open = workOrders.filter(
    (w) => !['completada', 'cerrada', 'cancelada'].includes(w.status),
  ).length;
  const overdue = workOrders.filter((w) => w.status === 'vencido').length;
  const completed = workOrders.filter((w) => w.status === 'completada').length;
  const totalDownMin = workOrders.reduce((s, w) => s + (w.downtime || 0), 0);
  const upcoming = workOrders.filter((w) =>
    ['pendiente', 'asignada', 'nueva'].includes(w.status),
  );

  const getDueDateTimestamp = (value: string | Date | undefined) => {
    if (!value) return Number.POSITIVE_INFINITY;
    if (value instanceof Date) return value.getTime();

    const directTimestamp = Date.parse(value);
    if (!Number.isNaN(directTimestamp)) return directTimestamp;

    const slashDate = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!slashDate) return Number.POSITIVE_INFINITY;

    const [, day, month, year] = slashDate;
    return new Date(Number(year), Number(month) - 1, Number(day)).getTime();
  };

  const upcomingSorted = [...upcoming].sort((a, b) => {
    const dueA = getDueDateTimestamp(a.fechaVen ?? a.fechaCompromiso);
    const dueB = getDueDateTimestamp(b.fechaVen ?? b.fechaCompromiso);
    return dueA - dueB;
  });

  const visibleCount =
    pendingLimit === 'all' ? upcomingSorted.length : Number(pendingLimit);
  const visibleUpcoming = upcomingSorted.slice(0, visibleCount);

  return (
    <div className='h-full overflow-y-auto p-4 sm:p-6 lg:p-7'>
      <PageHeader
        title='Panel de Control'
        sub='Visibilidad operativa en tiempo real · 7 de marzo 2026'
      />

      <div className='mb-6 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5'>
        <KpiCard
          label='OT Abiertas'
          value={open}
          sub='ordenes activas'
          color={chartColors.warning}
          icon={<span>📂</span>}
        />
        <KpiCard
          label='OT Vencidas'
          value={overdue}
          sub='requieren atencion'
          color={chartColors.danger}
          icon={<span>⏰</span>}
        />
        <KpiCard
          label='Completadas'
          value={completed}
          sub='este mes'
          color={chartColors.success}
          icon={<span>✅</span>}
        />
        <KpiCard
          label='Cumplimiento PM'
          value='68%'
          sub='meta: 90%'
          color={chartColors.info}
          icon={<span>📊</span>}
        />
        <KpiCard
          label='Horas de Paro'
          value={`${Math.round(totalDownMin / 60)}h`}
          sub='acumuladas'
          color={chartColors.warning}
          icon={<span>⚠</span>}
        />
      </div>

      <div className='mb-4 grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]'>
        <Card>
          <CardTitle>Cumplimiento PM — Ultimos 6 Meses (%)</CardTitle>
          <EChartsArea
            data={complianceData}
            dataKey='val'
            color={chartColors.info}
            name='Cumplimiento %'
            height={200}
            yDomain={[0, 100]}
          />
        </Card>
        <Card>
          <CardTitle>Mix de Ordenes de Trabajo</CardTitle>
          <EChartsPie data={tipoData} height={200} />
        </Card>
      </div>

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        <Card>
          <CardTitle>Pendientes y Proximas a Vencer</CardTitle>
          {upcoming.length === 0 ? (
            <p className='py-4 text-center text-sm text-slate-500'>
              Sin pendientes
            </p>
          ) : (
            <>
              {visibleUpcoming.map((w) => (
                <div
                  key={w.id}
                  className='border-app-border-soft flex items-center justify-between border-b py-3 last:border-b-0'
                >
                  <div>
                    <div className='text-app-text-primary text-sm font-semibold'>
                      {w.titulo}
                    </div>
                    <div className='text-app-text-secondary mt-0.5 text-xs'>
                      {w.asignado} · Vence {w.fechaVen}
                    </div>
                  </div>
                  <div className='ml-3 flex flex-shrink-0 gap-1.5'>
                    <Badge
                      label={
                        PRL[w.prioridad as keyof typeof PRL] || w.prioridad
                      }
                      color={
                        PRC[w.prioridad as keyof typeof PRC] || chartColors.info
                      }
                    />
                  </div>
                </div>
              ))}
              <div className='pt-3'>
                <label className='text-app-text-secondary mb-1 block text-xs font-medium'>
                  Mostrar
                </label>
                <select
                  value={pendingLimit}
                  onChange={(e) =>
                    setPendingLimit(e.target.value as '5' | '10' | '15' | 'all')
                  }
                  className='border-app-border-soft bg-app-surface text-app-text-primary focus:border-app-brand w-full rounded-md border px-2.5 py-1.5 text-sm focus:outline-none'
                >
                  <option value='5'>5</option>
                  <option value='10'>10</option>
                  <option value='15'>15</option>
                  <option value='all'>Todos</option>
                </select>
              </div>
            </>
          )}
        </Card>
        <Card>
          <CardTitle>Top Fallas por Activo</CardTitle>
          {topFallas.map((f, i) => (
            <div
              key={i}
              className='border-app-border-soft flex items-center justify-between border-b py-3 last:border-b-0'
            >
              <div className='flex items-center gap-3'>
                <span
                  className='w-4.5 text-center font-mono text-xs font-extrabold'
                  style={{
                    color:
                      i === 0
                        ? chartColors.danger
                        : i === 1
                          ? chartColors.warning
                          : chartColors.muted,
                  }}
                >
                  {i + 1}
                </span>
                <span className='text-app-text-primary text-sm'>{f.asset}</span>
              </div>
              <div className='flex items-center gap-3'>
                <span className='text-app-danger font-mono text-xs font-bold'>
                  {f.count} fallas
                </span>
                <span className='text-app-text-secondary font-mono text-xs'>
                  {f.down}h
                </span>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

interface AssetsScreenProps {
  wo: OrdenTrabajo[];
  assets?: Activo[];
  assetsLoading?: boolean;
  assetsError?: Error | null;
  canManageAssets?: boolean;
}

export function AssetsScreen({
  wo,
  assets,
  assetsLoading = false,
  assetsError = null,
  canManageAssets = false,
}: AssetsScreenProps) {
  const [search, setSearch] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selected, setSelected] = useState<Activo | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [assetForm, setAssetForm] = useState<AssetFormState>(initialAssetForm);
  const createAssetMutation = useCreateAssetMutation();
  const createSubmitting = useRef(false);
  const session = useAssetSession();
  const canWrite = canManageAssets && session.canManage;

  const sourceAssets = assets ?? [];
  const areas = [...new Set(sourceAssets.map((a) => a.area))];
  const filtered = sourceAssets.filter((a) => {
    const q = search.toLowerCase();
    return (
      (a.name.toLowerCase().includes(q) || a.code.toLowerCase().includes(q)) &&
      (!filterArea || a.area === filterArea) &&
      (!filterStatus || a.status === filterStatus)
    );
  });

  function updateAssetForm<K extends keyof AssetFormState>(
    field: K,
    value: AssetFormState[K],
  ) {
    setAssetForm((current) => ({ ...current, [field]: value }));
  }

  function openCreateModal() {
    if (!canWrite || !isAssetSessionCurrent(session)) return;
    setAssetForm(initialAssetForm);
    setShowCreate(true);
  }

  function closeCreateModal() {
    if (createSubmitting.current) return;
    setShowCreate(false);
  }

  function handleCreateAsset() {
    if (
      createSubmitting.current ||
      !canWrite ||
      !isAssetSessionCurrent(session)
    )
      return;

    let payload;
    try {
      payload = buildAssetCreate(assetForm);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Revisa los datos del activo.',
      );
      return;
    }

    createSubmitting.current = true;
    createAssetMutation.mutate(payload, {
      onSuccess: () => {
        if (!isAssetSessionCurrent(session)) return;
        toast.success('Activo creado correctamente.');
        setShowCreate(false);
        setAssetForm(initialAssetForm);
      },
      onError: (error) => {
        if (isAssetSessionCurrent(session))
          toast.error(error.message || 'No se pudo crear el activo.');
      },
      onSettled: () => {
        createSubmitting.current = false;
      },
    });
  }

  if (assetsLoading && !selected && !showCreate) {
    return (
      <div className='h-full overflow-y-auto p-4 sm:p-6 lg:p-7'>
        <PageHeader title='Activos' sub='Cargando activos...' />
        <Card>
          <p className='text-app-text-secondary text-sm'>
            Consultando los activos de tu empresa.
          </p>
        </Card>
      </div>
    );
  }

  if (assetsError && !selected && !showCreate) {
    return (
      <div className='h-full overflow-y-auto p-4 sm:p-6 lg:p-7'>
        <PageHeader title='Activos' sub='No se pudieron cargar los activos' />
        <Card>
          <p className='text-app-danger text-sm'>
            {assetsError.message || 'Error al obtener los activos.'}
          </p>
        </Card>
      </div>
    );
  }

  if (selected) {
    const assetWOs = wo.filter((w) => w.activoId === selected.id);
    const assetPlans = PLANS.filter((p) => p.activoId === selected.id);
    return (
      <div className='h-full overflow-y-auto p-4 sm:p-6 lg:p-7'>
        <BtnBack onClick={() => setSelected(null)} />
        <div className='border-app-border-soft mb-6 flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-start sm:justify-between'>
          <div>
            <div className='text-app-brand-dark mb-1.5 font-mono text-xs tracking-wider'>
              {selected.code}
            </div>
            <h1 className='text-app-text-primary text-2xl font-extrabold tracking-tight'>
              {selected.name}
            </h1>
            <p className='text-app-text-secondary mt-1 text-sm'>
              {selected.area}
            </p>
          </div>
          <div className='flex flex-wrap justify-end gap-2'>
            {canWrite && (
              <AssetDetailActions
                key={selected.id}
                asset={selected}
                onUpdated={setSelected}
                onDeleted={() => setSelected(null)}
              />
            )}
            <Badge
              label={STL[selected.status] || selected.status}
              color={
                STC[selected.status as keyof typeof STC] || chartColors.info
              }
            />
            <Badge
              label={'Criticidad ' + selected.criticidad}
              color={
                CRC[selected.criticidad as keyof typeof CRC] || chartColors.info
              }
            />
          </div>
        </div>

        <div className='mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2'>
          <Card>
            <CardTitle>Ficha Tecnica</CardTitle>
            <RowData label='Fabricante' value={selected.fabricante} />
            <RowData label='Modelo' value={selected.modelo} />
            <RowData
              label='N de Serie'
              value={
                <span className='font-mono text-xs'>{selected.serie}</span>
              }
            />
            <RowData label='Fecha instalacion' value={selected.instalacion} />
            <RowData label='Area' value={selected.area} />
          </Card>
          <Card className='flex flex-col items-center justify-center gap-3.5'>
            <CardTitle>Acceso Rapido QR</CardTitle>
            <div className='border-app-border-soft bg-app-surface-subtle flex h-28 w-28 items-center justify-center rounded-2xl border'>
              <svg width='88' height='88' viewBox='0 0 88 88'>
                <rect
                  x='2'
                  y='2'
                  width='36'
                  height='36'
                  fill='none'
                  stroke='#d89b2b'
                  strokeWidth='3'
                />
                <rect x='12' y='12' width='16' height='16' fill='#d89b2b' />
                <rect
                  x='50'
                  y='2'
                  width='36'
                  height='36'
                  fill='none'
                  stroke='#d89b2b'
                  strokeWidth='3'
                />
                <rect x='60' y='12' width='16' height='16' fill='#d89b2b' />
                <rect
                  x='2'
                  y='50'
                  width='36'
                  height='36'
                  fill='none'
                  stroke='#d89b2b'
                  strokeWidth='3'
                />
                <rect x='12' y='60' width='16' height='16' fill='#d89b2b' />
                <rect x='50' y='50' width='10' height='10' fill='#d89b2b' />
                <rect x='68' y='50' width='10' height='10' fill='#d89b2b' />
                <rect x='50' y='68' width='10' height='10' fill='#d89b2b' />
                <rect x='68' y='68' width='10' height='10' fill='#d89b2b' />
                <rect x='59' y='59' width='10' height='10' fill='#cbd5e1' />
              </svg>
            </div>
            <div className='text-app-text-secondary font-mono text-xs'>
              apex.app/{selected.code}
            </div>
            <BtnGhost onClick={() => {}}>Descargar QR</BtnGhost>
          </Card>
        </div>

        <Card className='mb-4'>
          <CardTitle>Planes de Mantenimiento Asociados</CardTitle>
          {assetPlans.length === 0 ? (
            <p className='text-sm text-slate-500'>Sin planes asignados.</p>
          ) : (
            <DataTable
              head={[
                'Plan',
                'Frecuencia',
                'Actividades',
                'Duracion',
                'Prioridad',
                'Estado',
              ]}
            >
              {assetPlans.map((p) => (
                <tr key={p.id}>
                  <Td bold>{p.name}</Td>
                  <Td mono>
                    Cada {p.freq} {p.unit}
                  </Td>
                  <Td mono>{p.items.length} items</Td>
                  <Td mono>{p.duracion}h</Td>
                  <Td>
                    <Badge label={PRL[p.prioridad]} color={PRC[p.prioridad]} />
                  </Td>
                  <Td>
                    <Badge
                      label={p.activo ? 'Activo' : 'Inactivo'}
                      color={p.activo ? chartColors.success : chartColors.muted}
                    />
                  </Td>
                </tr>
              ))}
            </DataTable>
          )}
        </Card>

        <Card>
          <CardTitle>Historial de Ordenes de Trabajo</CardTitle>
          {assetWOs.length === 0 ? (
            <p className='text-sm text-slate-500'>Sin historial de ordenes.</p>
          ) : (
            <DataTable
              head={[
                'Folio',
                'Titulo',
                'Tipo',
                'Status',
                'Vencimiento',
                'Paro',
              ]}
            >
              {assetWOs.map((w) => (
                <tr key={w.id}>
                  <Td mono>{w.folio}</Td>
                  <Td>{w.titulo}</Td>
                  <Td>
                    <Badge
                      label={
                        w.tipo === 'preventivo' ? 'Preventivo' : 'Correctivo'
                      }
                      color={
                        w.tipo === 'preventivo'
                          ? chartColors.info
                          : chartColors.danger
                      }
                    />
                  </Td>
                  <Td>
                    <Badge
                      label={STL[w.status] || w.status}
                      color={
                        STC[w.status as keyof typeof STC] || chartColors.info
                      }
                    />
                  </Td>
                  <Td mono>
                    {w.fechaCompromiso instanceof Date
                      ? w.fechaCompromiso.toISOString().split('T')[0]
                      : String(w.fechaCompromiso)}
                  </Td>
                  <Td mono>
                    {w.downtimeMinutos ? w.downtimeMinutos + ' min' : '—'}
                  </Td>
                </tr>
              ))}
            </DataTable>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className='h-full overflow-y-auto p-4 sm:p-6 lg:p-7'>
      <PageHeader
        title='Activos'
        sub={'de ' + sourceAssets.length + ' equipos'}
        action={
          canWrite ? (
            <BtnPrimary onClick={openCreateModal}>+ Nuevo Activo</BtnPrimary>
          ) : undefined
        }
      />

      <div className='mb-4 flex flex-col gap-3 sm:flex-row'>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='Buscar por nombre o codigo...'
          className='min-w-[200px] flex-1'
        />
        <select
          value={filterArea}
          onChange={(e) => setFilterArea(e.target.value)}
          className='w-full sm:w-auto sm:max-w-[220px]'
        >
          <option value=''>Todas las areas</option>
          {areas.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className='w-full sm:w-auto sm:max-w-[200px]'
        >
          <option value=''>Todos los estados</option>
          {['activo', 'detenido', 'mantenimiento', 'descomisionado'].map(
            (s) => (
              <option key={s} value={s}>
                {STL[s as keyof typeof STL]}
              </option>
            ),
          )}
        </select>
      </div>

      <Card className='overflow-hidden p-0'>
        <DataTable
          head={['Codigo', 'Nombre', 'Area', 'Estado', 'Criticidad', '']}
        >
          {filtered.map((a) => (
            <tr
              key={a.id}
              className='hover:bg-app-surface-subtle cursor-pointer transition-colors'
            >
              <Td mono>{a.code}</Td>
              <Td bold>{a.name}</Td>
              <Td>{a.area}</Td>
              <Td>
                <Badge
                  label={STL[a.status as keyof typeof STL] || a.status}
                  color={STC[a.status as keyof typeof STC] || chartColors.info}
                />
              </Td>
              <Td>
                <Badge
                  label={
                    a.criticidad.charAt(0).toUpperCase() + a.criticidad.slice(1)
                  }
                  color={
                    CRC[a.criticidad as keyof typeof CRC] || chartColors.info
                  }
                />
              </Td>
              <Td>
                <BtnGhost onClick={() => setSelected(a)}>Ver detalle</BtnGhost>
              </Td>
            </tr>
          ))}
        </DataTable>
      </Card>

      {showCreate && canWrite && (
        <Modal title='Registrar Nuevo Activo' onClose={closeCreateModal}>
          <fieldset
            disabled={createAssetMutation.isPending}
            className='min-w-0 disabled:opacity-60'
          >
            <AssetFormFields value={assetForm} onChange={updateAssetForm} />
            <ModalFooter
              onCancel={closeCreateModal}
              onConfirm={handleCreateAsset}
              confirmLabel={
                createAssetMutation.isPending ? 'Guardando...' : 'Crear Activo'
              }
            />
          </fieldset>
        </Modal>
      )}
    </div>
  );
}
