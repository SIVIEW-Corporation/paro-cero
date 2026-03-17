'use client';

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

import {
  ASSETS,
  PLANS,
  complianceData,
  downtimeData,
  tipoData,
  topFallas,
} from '@/app/data/mock-data';
import { STC, STL, PRC, PRL, CRC, TT } from '@/app/data/constants';

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

import type { Activo, PlanMantenimiento, OrdenTrabajo } from '@/app/data/types';

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
    <div className='relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950'>
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

          <div className='mt-5 rounded-lg border border-slate-700 bg-slate-900 p-3.5'>
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
  asignado: string;
  tipo: string;
  folio: string;
}

export function Dashboard({ wo }: DashboardProps) {
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

  return (
    <div className='h-full overflow-y-auto p-7'>
      <PageHeader
        title='Panel de Control'
        sub='Visibilidad operativa en tiempo real · 7 de marzo 2026'
      />

      <div className='mb-6 grid grid-cols-5 gap-3.5'>
        <KpiCard
          label='OT Abiertas'
          value={open}
          sub='ordenes activas'
          color='#f59e0b'
          icon={<span>📂</span>}
        />
        <KpiCard
          label='OT Vencidas'
          value={overdue}
          sub='requieren atencion'
          color='#ef4444'
          icon={<span>⏰</span>}
        />
        <KpiCard
          label='Completadas'
          value={completed}
          sub='este mes'
          color='#22c55e'
          icon={<span>✅</span>}
        />
        <KpiCard
          label='Cumplimiento PM'
          value='68%'
          sub='meta: 90%'
          color='#3b82f6'
          icon={<span>📊</span>}
        />
        <KpiCard
          label='Horas de Paro'
          value={`${Math.round(totalDownMin / 60)}h`}
          sub='acumuladas'
          color='#f97316'
          icon={<span>⚠</span>}
        />
      </div>

      <div className='mb-4 grid grid-cols-[2fr_1fr] gap-4'>
        <Card>
          <CardTitle>Cumplimiento PM — Ultimos 6 Meses (%)</CardTitle>
          <ResponsiveContainer width='100%' height={200}>
            <AreaChart data={complianceData}>
              <defs>
                <linearGradient id='cg' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#3b82f6' stopOpacity={0.3} />
                  <stop offset='95%' stopColor='#3b82f6' stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray='3 3' stroke='#1e3a5f' />
              <XAxis
                dataKey='mes'
                tick={{ fill: '#475569', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#475569', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                domain={[0, 100]}
              />
              <Tooltip contentStyle={TT} />
              <Area
                type='monotone'
                dataKey='val'
                stroke='#3b82f6'
                fill='url(#cg)'
                strokeWidth={2.5}
                name='Cumplimiento %'
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <CardTitle>Mix de Ordenes de Trabajo</CardTitle>
          <ResponsiveContainer width='100%' height={200}>
            <PieChart>
              <Pie
                data={tipoData}
                dataKey='value'
                nameKey='name'
                cx='50%'
                cy='45%'
                outerRadius={68}
                paddingAngle={4}
              >
                {tipoData.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={TT} />
              <Legend
                iconType='circle'
                iconSize={8}
                wrapperStyle={{ fontSize: 12, color: '#94a3b8' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <Card>
          <CardTitle>Pendientes y Proximas a Vencer</CardTitle>
          {upcoming.length === 0 ? (
            <p className='py-4 text-center text-sm text-slate-500'>
              Sin pendientes
            </p>
          ) : (
            upcoming.map((w) => (
              <div
                key={w.id}
                className='flex items-center justify-between border-b border-slate-800 py-2.5'
              >
                <div>
                  <div className='text-sm font-semibold text-slate-200'>
                    {w.titulo}
                  </div>
                  <div className='mt-0.5 text-xs text-slate-500'>
                    {w.asignado} · Vence {w.fechaVen}
                  </div>
                </div>
                <div className='ml-3 flex flex-shrink-0 gap-1.5'>
                  <Badge
                    label={PRL[w.prioridad as keyof typeof PRL] || w.prioridad}
                    color={PRC[w.prioridad as keyof typeof PRC] || '#3b82f6'}
                  />
                </div>
              </div>
            ))
          )}
        </Card>
        <Card>
          <CardTitle>Top Fallas por Activo</CardTitle>
          {topFallas.map((f, i) => (
            <div
              key={i}
              className='flex items-center justify-between border-b border-slate-800 py-2.5'
            >
              <div className='flex items-center gap-3'>
                <span
                  className='w-4.5 text-center font-mono text-xs font-extrabold'
                  style={{
                    color:
                      i === 0 ? '#ef4444' : i === 1 ? '#f97316' : '#475569',
                  }}
                >
                  {i + 1}
                </span>
                <span className='text-sm text-slate-200'>{f.asset}</span>
              </div>
              <div className='flex items-center gap-3'>
                <span className='font-mono text-xs font-bold text-red-500'>
                  {f.count} fallas
                </span>
                <span className='font-mono text-xs text-orange-500'>
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
}

export function AssetsScreen({ wo }: AssetsScreenProps) {
  const [search, setSearch] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selected, setSelected] = useState<Activo | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const areas = [...new Set(ASSETS.map((a) => a.area))];
  const filtered = ASSETS.filter((a) => {
    const q = search.toLowerCase();
    return (
      (a.name.toLowerCase().includes(q) || a.code.toLowerCase().includes(q)) &&
      (!filterArea || a.area === filterArea) &&
      (!filterStatus || a.status === filterStatus)
    );
  });

  if (selected) {
    const assetWOs = wo.filter((w) => w.activoId === selected.id);
    const assetPlans = PLANS.filter((p) => p.activoId === selected.id);
    return (
      <div className='h-full overflow-y-auto p-7'>
        <BtnBack onClick={() => setSelected(null)} />
        <div className='mb-6 flex items-start justify-between border-b border-slate-700 pb-5'>
          <div>
            <div className='mb-1.5 font-mono text-xs tracking-wider text-amber-500'>
              {selected.code}
            </div>
            <h1 className='text-2xl font-extrabold tracking-tight text-slate-100'>
              {selected.name}
            </h1>
            <p className='mt-1 text-sm text-slate-500'>{selected.area}</p>
          </div>
          <div className='flex flex-wrap justify-end gap-2'>
            <Badge
              label={STL[selected.status] || selected.status}
              color={STC[selected.status as keyof typeof STC] || '#3b82f6'}
            />
            <Badge
              label={'Criticidad ' + selected.criticidad}
              color={CRC[selected.criticidad as keyof typeof CRC] || '#3b82f6'}
            />
          </div>
        </div>

        <div className='mb-4 grid grid-cols-2 gap-4'>
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
            <div className='flex h-28 w-28 items-center justify-center rounded-2xl border border-slate-700 bg-slate-950'>
              <svg width='88' height='88' viewBox='0 0 88 88'>
                <rect
                  x='2'
                  y='2'
                  width='36'
                  height='36'
                  fill='none'
                  stroke='#f59e0b'
                  strokeWidth='3'
                />
                <rect x='12' y='12' width='16' height='16' fill='#f59e0b' />
                <rect
                  x='50'
                  y='2'
                  width='36'
                  height='36'
                  fill='none'
                  stroke='#f59e0b'
                  strokeWidth='3'
                />
                <rect x='60' y='12' width='16' height='16' fill='#f59e0b' />
                <rect
                  x='2'
                  y='50'
                  width='36'
                  height='36'
                  fill='none'
                  stroke='#f59e0b'
                  strokeWidth='3'
                />
                <rect x='12' y='60' width='16' height='16' fill='#f59e0b' />
                <rect x='50' y='50' width='10' height='10' fill='#f59e0b' />
                <rect x='68' y='50' width='10' height='10' fill='#f59e0b' />
                <rect x='50' y='68' width='10' height='10' fill='#f59e0b' />
                <rect x='68' y='68' width='10' height='10' fill='#f59e0b' />
                <rect x='59' y='59' width='10' height='10' fill='#1e3a5f' />
              </svg>
            </div>
            <div className='font-mono text-xs text-amber-500'>
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
                      color={p.activo ? '#22c55e' : '#64748b'}
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
                      color={w.tipo === 'preventivo' ? '#3b82f6' : '#ef4444'}
                    />
                  </Td>
                  <Td>
                    <Badge
                      label={STL[w.status] || w.status}
                      color={STC[w.status as keyof typeof STC] || '#3b82f6'}
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
    <div className='h-full overflow-y-auto p-7'>
      <PageHeader
        title='Activos'
        sub={'de ' + ASSETS.length + ' equipos'}
        action={
          <BtnPrimary onClick={() => setShowCreate(true)}>
            + Nuevo Activo
          </BtnPrimary>
        }
      />

      <div className='mb-4.5 flex gap-3'>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='Buscar por nombre o codigo...'
          className='max-w-[340px]'
        />
        <select
          value={filterArea}
          onChange={(e) => setFilterArea(e.target.value)}
          className='max-w-[220px]'
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
          className='max-w-[200px]'
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
              className='cursor-pointer transition-colors hover:bg-slate-800'
            >
              <Td mono>{a.code}</Td>
              <Td bold>{a.name}</Td>
              <Td>{a.area}</Td>
              <Td>
                <Badge
                  label={STL[a.status as keyof typeof STL] || a.status}
                  color={STC[a.status as keyof typeof STC] || '#3b82f6'}
                />
              </Td>
              <Td>
                <Badge
                  label={
                    a.criticidad.charAt(0).toUpperCase() + a.criticidad.slice(1)
                  }
                  color={CRC[a.criticidad as keyof typeof CRC] || '#3b82f6'}
                />
              </Td>
              <Td>
                <BtnGhost onClick={() => setSelected(a)}>Ver detalle</BtnGhost>
              </Td>
            </tr>
          ))}
        </DataTable>
      </Card>

      {showCreate && (
        <Modal
          title='Registrar Nuevo Activo'
          onClose={() => setShowCreate(false)}
        >
          <Field label='Codigo de Equipo'>
            <input defaultValue='EQP-008' />
          </Field>
          <Field label='Nombre del Equipo'>
            <input placeholder='Ej: Bomba centrifuga #3' />
          </Field>
          <div className='grid grid-cols-2 gap-3'>
            <Field label='Area'>
              <select>
                <option>Planta de Utilidades</option>
                <option>Linea de Empaque A</option>
                <option>Taller Central</option>
                <option>Almacen Principal</option>
              </select>
            </Field>
            <Field label='Criticidad'>
              <select>
                <option>baja</option>
                <option>media</option>
                <option>alta</option>
              </select>
            </Field>
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <Field label='Fabricante'>
              <input placeholder='Ej: Atlas Copco' />
            </Field>
            <Field label='Modelo'>
              <input placeholder='Ej: GA55' />
            </Field>
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <Field label='N de Serie'>
              <input placeholder='Ej: ATC-2026-001' />
            </Field>
            <Field label='Fecha de Instalacion'>
              <input type='date' />
            </Field>
          </div>
          <ModalFooter
            onCancel={() => setShowCreate(false)}
            onConfirm={() => setShowCreate(false)}
            confirmLabel='Crear Activo'
          />
        </Modal>
      )}
    </div>
  );
}
