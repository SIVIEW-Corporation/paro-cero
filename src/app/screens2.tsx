'use client';

import {
  useState,
  type CSSProperties,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import {
  format,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
} from 'date-fns';
import * as echarts from 'echarts';
import { es } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';

import { EChartsArea, EChartsBar, EChartsPie } from '@/components/charts';

import { ASSETS, PLANS, STC, STL, PRC, PRL, NTL, NTI } from '@/app/data';
import { TECNICOS } from '@/app/data/constants';
import { generarDatosSeisMeses } from '@/app/data/mock-data';
import { useWorkOrdersStore } from '@/app/stores/useWorkOrdersStore';
import { cn } from '@/lib/cn';
import { exportToCsv, type CsvColumn } from '@/utils/exportCsv';

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

import type { EstadoOT, OrdenTrabajo, PrioridadOT } from '@/app/data/types';

const workOrderFilterPillBase =
  'inline-flex h-9 items-center justify-center whitespace-nowrap rounded-lg border px-3.5 text-xs font-bold transition-[background-color,border-color,color,box-shadow] duration-150 focus-visible:ring-2 focus-visible:ring-app-brand focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg focus-visible:outline-none';
const workOrderFilterPillActive =
  'border-app-brand bg-app-brand-soft text-app-brand-dark hover:bg-app-brand-soft';
const workOrderFilterPillInactive =
  'border-app-border-soft bg-app-surface text-app-text-secondary hover:border-app-border hover:bg-app-surface-subtle hover:text-app-text-primary';
const workOrderSelectClassName =
  'h-9 w-full min-w-0 rounded-lg border border-app-border-soft bg-app-surface px-3 text-xs font-bold text-app-text-primary transition-[background-color,border-color,box-shadow] duration-150 outline-none focus:border-app-brand focus:shadow-[0_0_0_3px_rgb(216_155_43_/_0.14)] sm:w-auto sm:min-w-[210px]';

export function PlansScreen() {
  const [plans, setPlans] = useState(PLANS);
  const [selected, setSelected] = useState<(typeof PLANS)[number] | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [showCreate, setShowCreate] = useState(false);
  const [planName, setPlanName] = useState('');
  const [planActivoId, setPlanActivoId] = useState(ASSETS[0]?.id || '');
  const [planFreq, setPlanFreq] = useState(1);
  const [planUnit, setPlanUnit] = useState<
    'dias' | 'semanas' | 'meses' | 'anios'
  >('semanas');
  const [planDuracion, setPlanDuracion] = useState(2);
  const [planPrioridad, setPlanPrioridad] = useState<
    'baja' | 'media' | 'alta' | 'critico'
  >('alta');
  const [planActivo, setPlanActivo] = useState(true);
  const [planItems, setPlanItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState('');
  const [createError, setCreateError] = useState('');

  const inputStyle: CSSProperties = {
    width: '100%',
    background: '#0a1628',
    border: '1px solid #1e3a5f',
    borderRadius: 6,
    color: '#e2e8f0',
    padding: '9px 10px',
    fontSize: 13,
    fontFamily: 'inherit',
  };

  const toggle = (key: string) => setChecked((c) => ({ ...c, [key]: !c[key] }));

  const resetCreateForm = () => {
    setPlanName('');
    setPlanActivoId(ASSETS[0]?.id || '');
    setPlanFreq(1);
    setPlanUnit('semanas');
    setPlanDuracion(2);
    setPlanPrioridad('alta');
    setPlanActivo(true);
    setPlanItems([]);
    setNewItem('');
    setCreateError('');
  };

  const openCreateModal = () => {
    resetCreateForm();
    setShowCreate(true);
  };

  const closeCreateModal = () => {
    setShowCreate(false);
    setCreateError('');
  };

  const addPlanItem = () => {
    const item = newItem.trim();
    if (!item) {
      return;
    }

    setPlanItems((prev) => [...prev, item]);
    setNewItem('');
    setCreateError('');
  };

  const removePlanItem = (index: number) => {
    setPlanItems((prev) => prev.filter((_, i) => i !== index));
  };

  const getNextPlanId = () => {
    const highest = plans.reduce((max, plan) => {
      const num = Number.parseInt(plan.id.replace(/\D/g, ''), 10);
      return Number.isNaN(num) ? max : Math.max(max, num);
    }, 0);

    return `P${String(highest + 1).padStart(3, '0')}`;
  };

  const createPlan = () => {
    const name = planName.trim();

    if (!name) {
      setCreateError('Ingresa el nombre del plan.');
      return;
    }

    if (!planActivoId) {
      setCreateError('Selecciona un activo asociado.');
      return;
    }

    if (planFreq <= 0) {
      setCreateError('La frecuencia debe ser mayor a 0.');
      return;
    }

    if (planDuracion <= 0) {
      setCreateError('La duración estimada debe ser mayor a 0.');
      return;
    }

    if (planItems.length === 0) {
      setCreateError('Agrega al menos una actividad al checklist.');
      return;
    }

    const now = new Date();
    const newPlan = {
      id: getNextPlanId(),
      empresaId: 'EMP001',
      activoId: planActivoId,
      assetId: planActivoId,
      name,
      freq: planFreq,
      unit: planUnit,
      prioridad: planPrioridad,
      duracion: planDuracion,
      activo: planActivo,
      items: planItems,
      createdAt: now,
      updatedAt: now,
    };

    setPlans((prev) => [newPlan, ...prev]);
    closeCreateModal();
    resetCreateForm();
  };

  if (selected) {
    const currentPlan =
      plans.find((plan) => plan.id === selected.id) || selected;
    const currentPlanAssetId =
      (currentPlan as { activoId?: string }).activoId ||
      (currentPlan as { assetId?: string }).assetId;
    const asset = ASSETS.find((a) => a.id === currentPlanAssetId);
    const done = currentPlan.items.filter(
      (_, i) => checked[currentPlan.id + '-' + i],
    ).length;
    const pct =
      currentPlan.items.length > 0
        ? Math.round((done / currentPlan.items.length) * 100)
        : 0;

    return (
      <div style={{ padding: '28px', overflowY: 'auto', height: '100%' }}>
        <BtnBack onClick={() => setSelected(null)} />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 24,
            paddingBottom: 20,
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            background:
              'linear-gradient(90deg, rgba(251,191,36,0.03) 0%, transparent 100%)',
            padding: '16px 20px',
            margin: '0 -20px 24px -20px',
            borderRadius: '8px 8px 0 0',
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                fontFamily: 'monospace',
                color: '#f59e0b',
                marginBottom: 5,
              }}
            >
              {currentPlan.id}
            </div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: '#f8fafc',
                letterSpacing: '-0.02em',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: 4,
                  height: 22,
                  background:
                    'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)',
                  borderRadius: 2,
                }}
              />
              {currentPlan.name}
            </h1>
            {asset && (
              <p
                style={{
                  fontSize: 13,
                  color: '#64748b',
                  marginTop: 6,
                  marginLeft: 16,
                }}
              >
                Activo: {asset.name} ·{' '}
                <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
                  {asset.code}
                </span>
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Badge
              label={currentPlan.activo ? 'Activo' : 'Inactivo'}
              color={currentPlan.activo ? '#22c55e' : '#64748b'}
            />
            <Badge
              label={PRL[currentPlan.prioridad as keyof typeof PRL]}
              color={PRC[currentPlan.prioridad as keyof typeof PRC]}
            />
          </div>
        </div>

        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}
        >
          <Card>
            <CardTitle>Parametros del Plan</CardTitle>
            <RowData
              label='Frecuencia'
              value={'Cada ' + currentPlan.freq + ' ' + currentPlan.unit}
            />
            <RowData
              label='Prioridad'
              value={
                <Badge
                  label={PRL[currentPlan.prioridad as keyof typeof PRL]}
                  color={PRC[currentPlan.prioridad as keyof typeof PRC]}
                />
              }
            />
            <RowData
              label='Duracion estimada'
              value={currentPlan.duracion + ' horas'}
            />
            <RowData
              label='Total actividades'
              value={currentPlan.items.length + ' items'}
            />
            <RowData
              label='Estado'
              value={
                <Badge
                  label={currentPlan.activo ? 'Activo' : 'Inactivo'}
                  color={currentPlan.activo ? '#22c55e' : '#64748b'}
                />
              }
            />
          </Card>
          <Card>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <CardTitle>Checklist de Actividades</CardTitle>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div
                  style={{
                    width: 80,
                    height: 6,
                    background: '#1e3a5f',
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: pct + '%',
                      background: pct === 100 ? '#22c55e' : '#f59e0b',
                      borderRadius: 3,
                      transition: 'width 0.3s',
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: 'monospace',
                    color: pct === 100 ? '#22c55e' : '#f59e0b',
                    fontWeight: 700,
                  }}
                >
                  {pct}%
                </span>
              </div>
            </div>
            {currentPlan.items.map((item, i) => {
              const k = currentPlan.id + '-' + i;
              return (
                <div
                  key={i}
                  onClick={() => toggle(k)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '9px 0',
                    borderBottom: '1px solid #0d1f38',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      border: `2px solid ${checked[k] ? '#22c55e' : '#1e3a5f'}`,
                      borderRadius: 4,
                      flexShrink: 0,
                      background: checked[k] ? '#22c55e22' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}
                  >
                    {checked[k] && (
                      <span
                        style={{
                          fontSize: 11,
                          color: '#22c55e',
                          fontWeight: 700,
                        }}
                      >
                        v
                      </span>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: 13,
                      color: checked[k] ? '#475569' : '#cbd5e1',
                      textDecoration: checked[k] ? 'line-through' : 'none',
                      transition: 'all 0.15s',
                    }}
                  >
                    {item}
                  </span>
                </div>
              );
            })}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '28px', overflowY: 'auto', height: '100%' }}>
      <PageHeader
        title='Planes de Mantenimiento'
        sub={plans.length + ' planes configurados'}
        action={<BtnPrimary onClick={openCreateModal}>+ Nuevo Plan</BtnPrimary>}
      />
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <DataTable
          head={[
            'ID',
            'Plan',
            'Activo',
            'Frecuencia',
            'Duracion',
            'Prioridad',
            'Estado',
            '',
          ]}
        >
          {plans.map((p) => {
            const planAssetId =
              (p as { activoId?: string }).activoId ||
              (p as { assetId?: string }).assetId;
            const asset = ASSETS.find((a) => a.id === planAssetId);
            return (
              <tr
                key={p.id}
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = '#0f2040')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = 'transparent')
                }
              >
                <Td mono>{p.id}</Td>
                <Td bold>{p.name}</Td>
                <Td>{asset ? asset.name : '-'}</Td>
                <Td mono>
                  Cada {p.freq} {p.unit}
                </Td>
                <Td mono>{p.duracion}h</Td>
                <Td>
                  <Badge
                    label={PRL[p.prioridad as keyof typeof PRL]}
                    color={PRC[p.prioridad as keyof typeof PRC]}
                  />
                </Td>
                <Td>
                  <Badge
                    label={p.activo ? 'Activo' : 'Inactivo'}
                    color={p.activo ? '#22c55e' : '#64748b'}
                  />
                </Td>
                <Td>
                  <BtnGhost onClick={() => setSelected(p)}>
                    Ver detalle
                  </BtnGhost>
                </Td>
              </tr>
            );
          })}
        </DataTable>
      </Card>

      {showCreate && (
        <Modal
          title='Crear Nuevo Plan de Mantenimiento'
          onClose={closeCreateModal}
        >
          <Field label='Nombre del Plan'>
            <input
              placeholder='Ej: PM Semanal - Bomba #3'
              style={inputStyle}
              value={planName}
              onChange={(e) => {
                setPlanName(e.target.value);
                setCreateError('');
              }}
            />
          </Field>
          <Field label='Activo Asociado'>
            <select
              style={inputStyle}
              value={planActivoId}
              onChange={(e) => setPlanActivoId(e.target.value)}
            >
              {ASSETS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.code} — {a.name}
                </option>
              ))}
            </select>
          </Field>
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}
          >
            <Field label='Frecuencia (valor)'>
              <input
                type='number'
                style={inputStyle}
                min={1}
                value={planFreq}
                onChange={(e) => setPlanFreq(Number(e.target.value) || 0)}
              />
            </Field>
            <Field label='Unidad'>
              <select
                style={inputStyle}
                value={planUnit}
                onChange={(e) =>
                  setPlanUnit(
                    e.target.value as 'dias' | 'semanas' | 'meses' | 'anios',
                  )
                }
              >
                <option value='dias'>Dias</option>
                <option value='semanas'>Semanas</option>
                <option value='meses'>Meses</option>
                <option value='anios'>Años</option>
              </select>
            </Field>
          </div>
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}
          >
            <Field label='Duracion estimada (h)'>
              <input
                type='number'
                style={inputStyle}
                min={1}
                value={planDuracion}
                onChange={(e) => setPlanDuracion(Number(e.target.value) || 0)}
              />
            </Field>
            <Field label='Prioridad'>
              <select
                style={inputStyle}
                value={planPrioridad}
                onChange={(e) =>
                  setPlanPrioridad(
                    e.target.value as 'baja' | 'media' | 'alta' | 'critico',
                  )
                }
              >
                <option value='baja'>Baja</option>
                <option value='media'>Media</option>
                <option value='alta'>Alta</option>
                <option value='critico'>Critico</option>
              </select>
            </Field>
          </div>
          <Field label='Estado'>
            <select
              style={inputStyle}
              value={planActivo ? 'activo' : 'inactivo'}
              onChange={(e) => setPlanActivo(e.target.value === 'activo')}
            >
              <option value='activo'>Activo</option>
              <option value='inactivo'>Inactivo</option>
            </select>
          </Field>
          <Field label='Checklist de Actividades'>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <input
                placeholder='Ej: Verificar presión de aceite'
                style={inputStyle}
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addPlanItem();
                  }
                }}
              />
              <button
                type='button'
                onClick={addPlanItem}
                style={{
                  background: '#1d4ed8',
                  color: '#e2e8f0',
                  border: 'none',
                  borderRadius: 6,
                  padding: '0 12px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontFamily: 'inherit',
                }}
              >
                Agregar
              </button>
            </div>
            <div
              style={{
                border: '1px solid #1e3a5f',
                borderRadius: 8,
                overflow: 'hidden',
              }}
            >
              {planItems.length === 0 ? (
                <div
                  style={{
                    color: '#64748b',
                    fontSize: 12,
                    padding: '10px 12px',
                    background: '#0a1628',
                  }}
                >
                  Aún no hay actividades.
                </div>
              ) : (
                planItems.map((item, index) => (
                  <div
                    key={`${item}-${index}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '9px 12px',
                      borderBottom:
                        index === planItems.length - 1
                          ? 'none'
                          : '1px solid #0d1f38',
                      background: '#0a1628',
                    }}
                  >
                    <span style={{ fontSize: 13, color: '#cbd5e1' }}>
                      {item}
                    </span>
                    <button
                      type='button'
                      onClick={() => removePlanItem(index)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color: '#ef4444',
                        fontSize: 12,
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontFamily: 'inherit',
                      }}
                    >
                      Quitar
                    </button>
                  </div>
                ))
              )}
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: 11,
                color: '#64748b',
                fontFamily: 'monospace',
              }}
            >
              Total actividades: {planItems.length}
            </div>
          </Field>
          {createError && (
            <div
              style={{
                marginTop: 4,
                color: '#fca5a5',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {createError}
            </div>
          )}
          <ModalFooter
            onCancel={closeCreateModal}
            onConfirm={createPlan}
            confirmLabel='Crear Plan'
          />
        </Modal>
      )}
    </div>
  );
}

export function WorkOrdersScreen({
  wo,
  setWo,
}: {
  wo: OrdenTrabajo[];
  setWo: Dispatch<SetStateAction<OrdenTrabajo[]>>;
}) {
  const [selected, setSelected] = useState<OrdenTrabajo | null>(null);
  const [filterStatus, setFilter] = useState('');
  const [filterActivoId, setFilterActivoId] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newOtData, setNewOtData] = useState({
    titulo: '',
    activoId: ASSETS[0]?.id || '',
    tipo: 'preventivo' as OrdenTrabajo['tipo'],
    prioridad: 'media' as OrdenTrabajo['prioridad'],
    tecnicoId: TECNICOS[0]?.id || '',
    fechaCompromiso: format(new Date(), 'yyyy-MM-dd'),
    fechaCierre: '',
    downtimeMinutos: '',
    descripcionProblema: '',
    descripcionServicio: '',
    gastoDinero: false,
    montoGastado: '',
    usoRefaccionConsumible: false,
    refaccionConsumibleDetalle: '',
  });

  const closeCreateModal = () => {
    setShowCreate(false);
    setNewOtData({
      titulo: '',
      activoId: ASSETS[0]?.id || '',
      tipo: 'preventivo',
      prioridad: 'media',
      tecnicoId: TECNICOS[0]?.id || '',
      fechaCompromiso: format(new Date(), 'yyyy-MM-dd'),
      fechaCierre: '',
      downtimeMinutos: '',
      descripcionProblema: '',
      descripcionServicio: '',
      gastoDinero: false,
      montoGastado: '',
      usoRefaccionConsumible: false,
      refaccionConsumibleDetalle: '',
    });
  };

  const createWorkOrder = () => {
    const titulo = newOtData.titulo.trim();
    if (!titulo || !newOtData.activoId || !newOtData.tecnicoId) {
      alert('Completa título, activo y técnico.');
      return;
    }

    const now = new Date();
    const maxId = wo.reduce((max, item) => {
      const current = Number(item.id.replace(/\D/g, ''));
      return Number.isNaN(current) ? max : Math.max(max, current);
    }, 0);
    const nextId = maxId + 1;

    const tecnico = TECNICOS.find((t) => t.id === newOtData.tecnicoId);
    const fechaCompromiso = newOtData.fechaCompromiso
      ? new Date(`${newOtData.fechaCompromiso}T00:00:00`)
      : now;
    const fechaCierre = newOtData.fechaCierre
      ? new Date(`${newOtData.fechaCierre}T00:00:00`)
      : undefined;
    const downtimeMinutos = Number(newOtData.downtimeMinutos || '0');

    if (Number.isNaN(downtimeMinutos) || downtimeMinutos < 0) {
      alert('El tiempo de paro debe ser 0 o mayor.');
      return;
    }

    const montoGastado = newOtData.gastoDinero
      ? Number(newOtData.montoGastado)
      : 0;

    if (
      newOtData.gastoDinero &&
      (Number.isNaN(montoGastado) || montoGastado <= 0)
    ) {
      alert('Si se gastó dinero, captura un monto mayor a 0.');
      return;
    }

    const refaccionConsumibleDetalle =
      newOtData.refaccionConsumibleDetalle.trim();
    const descripcionProblema = newOtData.descripcionProblema.trim();
    const descripcionServicio = newOtData.descripcionServicio.trim();

    if (newOtData.usoRefaccionConsumible && !refaccionConsumibleDetalle) {
      alert(
        'Si se usó refacción o consumible, captura cuál fue en el detalle.',
      );
      return;
    }

    const nuevaOt: OrdenTrabajo = {
      id: `OT${String(nextId).padStart(3, '0')}`,
      empresaId: 'EMP001',
      folio: `OT-${now.getFullYear()}-${String(nextId).padStart(3, '0')}`,
      activoId: newOtData.activoId,
      titulo,
      descripcion:
        descripcionServicio || descripcionProblema || 'Sin descripción',
      descripcionProblema,
      descripcionServicio,
      tipo: newOtData.tipo,
      status: 'nueva',
      prioridad: newOtData.prioridad,
      tecnicoId: newOtData.tecnicoId,
      tecnicoNombre: tecnico?.nombre || 'Sin asignar',
      fechaCreacion: now,
      fechaCompromiso,
      fechaCierre,
      observaciones: descripcionProblema,
      gastoDinero: newOtData.gastoDinero,
      montoGastado,
      usoRefaccionConsumible: newOtData.usoRefaccionConsumible,
      refaccionConsumibleDetalle: newOtData.usoRefaccionConsumible
        ? refaccionConsumibleDetalle
        : '',
      evidencias: [],
      historial: [],
      downtimeMinutos,
      createdAt: now,
      updatedAt: now,
    };

    setWo((prev) => [nuevaOt, ...prev]);
    closeCreateModal();
  };

  const statusCounts: Record<string, number> = {};
  wo.forEach((w) => {
    statusCounts[w.status] = (statusCounts[w.status] || 0) + 1;
  });
  const filtered = wo.filter((w) => {
    const matchesStatus = !filterStatus || w.status === filterStatus;
    const matchesActivo = !filterActivoId || w.activoId === filterActivoId;

    return matchesStatus && matchesActivo;
  });

  const changeStatus = (id: string, s: string) => {
    setWo((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, status: s as OrdenTrabajo['status'] } : w,
      ),
    );
  };

  if (selected) {
    const asset = ASSETS.find((a) => a.id === selected.activoId);
    const curWo = wo.find((w) => w.id === selected.id) || selected;
    const descripcionProblema =
      curWo.descripcionProblema || curWo.observaciones || '';
    const descripcionServicio = curWo.descripcionServicio || '';
    return (
      <div style={{ padding: '28px', overflowY: 'auto', height: '100%' }}>
        <BtnBack onClick={() => setSelected(null)} />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 24,
            paddingBottom: 20,
            borderBottom: '1px solid #dde3ea',
            background:
              'linear-gradient(90deg, rgba(255,244,219,0.9) 0%, transparent 100%)',
            padding: '16px 20px',
            margin: '0 -20px 24px -20px',
            borderRadius: '8px 8px 0 0',
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                fontFamily: 'monospace',
                color: '#b7791f',
                marginBottom: 5,
                letterSpacing: '0.05em',
              }}
            >
              {curWo.folio}
            </div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: '#111827',
                letterSpacing: '-0.02em',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: 4,
                  height: 22,
                  background:
                    'linear-gradient(180deg, #d89b2b 0%, #b7791f 100%)',
                  borderRadius: 2,
                }}
              />
              {curWo.titulo}
            </h1>
            {asset && (
              <p
                style={{
                  fontSize: 13,
                  color: '#667085',
                  marginTop: 6,
                  marginLeft: 16,
                }}
              >
                {asset.name} ·{' '}
                <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
                  {asset.code}
                </span>
              </p>
            )}
          </div>
          <div
            style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
              justifyContent: 'flex-end',
            }}
          >
            <Badge
              label={STL[curWo.status] || curWo.status}
              color={STC[curWo.status] || '#3b82f6'}
            />
            <Badge label={PRL[curWo.prioridad]} color={PRC[curWo.prioridad]} />
            <Badge
              label={curWo.tipo === 'preventivo' ? 'Preventivo' : 'Correctivo'}
              color={curWo.tipo === 'preventivo' ? '#3b82f6' : '#ef4444'}
            />
          </div>
        </div>

        <div className='mb-4 grid grid-cols-1 gap-4 md:grid-cols-2'>
          <Card>
            <CardTitle>Datos de la Orden</CardTitle>
            <RowData label='Asignado a' value={curWo.tecnicoNombre} />
            <RowData
              label='Fecha de creacion'
              value={format(new Date(curWo.fechaCreacion), 'dd/MM/yyyy')}
            />
            <RowData
              label='Fecha de vencimiento'
              value={
                curWo.fechaCompromiso
                  ? format(new Date(curWo.fechaCompromiso), 'dd/MM/yyyy')
                  : '-'
              }
            />
            <RowData
              label='Fecha de cierre'
              value={
                curWo.fechaCierre
                  ? format(new Date(curWo.fechaCierre), 'dd/MM/yyyy')
                  : '—'
              }
            />
            <RowData
              label='Tiempo de paro'
              value={
                curWo.downtimeMinutos ? curWo.downtimeMinutos + ' min' : '0 min'
              }
            />
          </Card>
          <Card>
            <CardTitle>Descripción y Analisis</CardTitle>
            {descripcionProblema && (
              <div style={{ marginBottom: 14 }}>
                <div
                  style={{
                    fontSize: 11,
                    color: '#667085',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: 5,
                  }}
                >
                  Descripción del problema
                </div>
                <p style={{ fontSize: 13, color: '#111827', lineHeight: 1.6 }}>
                  {descripcionProblema}
                </p>
              </div>
            )}
            {descripcionServicio && (
              <div style={{ marginBottom: 14 }}>
                <div
                  style={{
                    fontSize: 11,
                    color: '#667085',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: 5,
                  }}
                >
                  Descripción del servicio
                </div>
                <p style={{ fontSize: 13, color: '#111827', lineHeight: 1.6 }}>
                  {descripcionServicio}
                </p>
              </div>
            )}
            <div style={{ marginBottom: 14 }}>
              <div
                style={{
                  fontSize: 11,
                  color: '#667085',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: 5,
                }}
              >
                Gasto económico
              </div>
              <p style={{ fontSize: 13, color: '#111827', lineHeight: 1.6 }}>
                {curWo.gastoDinero ? 'Sí' : 'No'}
                {curWo.gastoDinero
                  ? ` · $${(curWo.montoGastado || 0).toLocaleString('es-MX', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  : ''}
              </p>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div
                style={{
                  fontSize: 11,
                  color: '#667085',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: 5,
                }}
              >
                Refacción o consumible
              </div>
              <p style={{ fontSize: 13, color: '#111827', lineHeight: 1.6 }}>
                {curWo.usoRefaccionConsumible ? 'Sí' : 'No'}
              </p>
            </div>
            {curWo.usoRefaccionConsumible && (
              <div style={{ marginBottom: 14 }}>
                <div
                  style={{
                    fontSize: 11,
                    color: '#667085',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: 5,
                  }}
                >
                  Detalle de refacción o consumible
                </div>
                <p style={{ fontSize: 13, color: '#111827', lineHeight: 1.6 }}>
                  {curWo.refaccionConsumibleDetalle || 'No especificado'}
                </p>
              </div>
            )}
            {curWo.causa && (
              <div style={{ marginBottom: 14 }}>
                <div
                  style={{
                    fontSize: 11,
                    color: '#667085',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: 5,
                  }}
                >
                  Causa Raiz
                </div>
                <p style={{ fontSize: 13, color: '#111827', lineHeight: 1.6 }}>
                  {curWo.causa}
                </p>
              </div>
            )}
            {curWo.accion && (
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: '#667085',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: 5,
                  }}
                >
                  Accion Tomada
                </div>
                <p style={{ fontSize: 13, color: '#111827', lineHeight: 1.6 }}>
                  {curWo.accion}
                </p>
              </div>
            )}
            {!descripcionProblema &&
              !descripcionServicio &&
              !curWo.gastoDinero &&
              !curWo.usoRefaccionConsumible &&
              !curWo.causa &&
              !curWo.accion && (
                <p style={{ fontSize: 13, color: '#94a3b8' }}>
                  Sin descripciones registradas.
                </p>
              )}
          </Card>
        </div>

        <Card>
          <CardTitle>Cambiar Estado de la OT</CardTitle>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              'pendiente',
              'asignada',
              'en_proceso',
              'en_espera',
              'completada',
              'cancelada',
            ].map((s) => (
              <button
                key={s}
                onClick={() => changeStatus(curWo.id, s)}
                className={`${workOrderFilterPillBase} ${
                  curWo.status === s
                    ? workOrderFilterPillActive
                    : workOrderFilterPillInactive
                }`}
              >
                {STL[s as keyof typeof STL] || s}
              </button>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '28px', overflowY: 'auto', height: '100%' }}>
      <PageHeader
        title='Ordenes de Trabajo'
        sub={wo.length + ' ordenes registradas'}
        action={
          <BtnPrimary onClick={() => setShowCreate(true)}>
            + Nueva OT
          </BtnPrimary>
        }
      />

      <div className='mb-4 flex flex-wrap gap-2'>
        <button
          onClick={() => setFilter('')}
          className={`${workOrderFilterPillBase} ${
            !filterStatus
              ? workOrderFilterPillActive
              : workOrderFilterPillInactive
          }`}
        >
          Todas ({wo.length})
        </button>
        {Object.entries(statusCounts).map(([s, n]) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`${workOrderFilterPillBase} ${
              filterStatus === s
                ? workOrderFilterPillActive
                : workOrderFilterPillInactive
            }`}
          >
            {STL[s as keyof typeof STL] || s} ({n})
          </button>
        ))}
        <select
          value={filterActivoId}
          onChange={(e) => setFilterActivoId(e.target.value)}
          className={workOrderSelectClassName}
        >
          <option value=''>Todos los activos</option>
          {ASSETS.map((asset) => (
            <option key={asset.id} value={asset.id}>
              {asset.code} - {asset.name}
            </option>
          ))}
        </select>
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <DataTable
          head={[
            'Folio',
            'Titulo',
            'Tipo',
            'Asignado',
            'Vencimiento',
            'Prioridad',
            'Status',
            '',
          ]}
        >
          {filtered.map((w) => (
            <tr
              key={w.id}
              className='bg-app-surface hover:bg-app-surface-subtle transition-colors'
              style={{ cursor: 'pointer' }}
            >
              <Td mono>{w.folio}</Td>
              <Td bold>{w.titulo}</Td>
              <Td>
                <Badge
                  label={w.tipo === 'preventivo' ? 'Preventivo' : 'Correctivo'}
                  color={w.tipo === 'preventivo' ? '#3b82f6' : '#ef4444'}
                />
              </Td>
              <Td>{w.tecnicoNombre}</Td>
              <Td mono>
                {w.fechaCompromiso
                  ? format(new Date(w.fechaCompromiso), 'dd/MM/yyyy')
                  : '-'}
              </Td>
              <Td>
                <Badge label={PRL[w.prioridad]} color={PRC[w.prioridad]} />
              </Td>
              <Td>
                <Badge
                  label={STL[w.status] || w.status}
                  color={STC[w.status] || '#3b82f6'}
                />
              </Td>
              <Td>
                <BtnGhost onClick={() => setSelected(w)}>Ver detalle</BtnGhost>
              </Td>
            </tr>
          ))}
        </DataTable>
      </Card>

      {showCreate && (
        <Modal title='Nueva Orden de Trabajo' onClose={closeCreateModal}>
          <Field label='Titulo de la Orden'>
            <input
              placeholder='Ej: Revision preventiva bomba #3'
              value={newOtData.titulo}
              onChange={(e) =>
                setNewOtData((prev) => ({ ...prev, titulo: e.target.value }))
              }
            />
          </Field>
          <Field label='Activo'>
            <select
              value={newOtData.activoId}
              onChange={(e) =>
                setNewOtData((prev) => ({ ...prev, activoId: e.target.value }))
              }
            >
              {ASSETS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.code} — {a.name}
                </option>
              ))}
            </select>
          </Field>
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}
          >
            <Field label='Tipo'>
              <select
                value={newOtData.tipo}
                onChange={(e) =>
                  setNewOtData((prev) => ({
                    ...prev,
                    tipo: e.target.value as OrdenTrabajo['tipo'],
                  }))
                }
              >
                <option value='preventivo'>Preventivo</option>
                <option value='correctivo'>Correctivo</option>
              </select>
            </Field>
            <Field label='Prioridad'>
              <select
                value={newOtData.prioridad}
                onChange={(e) =>
                  setNewOtData((prev) => ({
                    ...prev,
                    prioridad: e.target.value as OrdenTrabajo['prioridad'],
                  }))
                }
              >
                <option value='baja'>Baja</option>
                <option value='media'>Media</option>
                <option value='alta'>Alta</option>
                <option value='critico'>Critico</option>
              </select>
            </Field>
          </div>
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}
          >
            <Field label='Asignado a'>
              <select
                value={newOtData.tecnicoId}
                onChange={(e) =>
                  setNewOtData((prev) => ({
                    ...prev,
                    tecnicoId: e.target.value,
                  }))
                }
              >
                {TECNICOS.map((tecnico) => (
                  <option key={tecnico.id} value={tecnico.id}>
                    {tecnico.nombre}
                  </option>
                ))}
              </select>
            </Field>
            <Field label='Fecha de Vencimiento'>
              <input
                type='date'
                value={newOtData.fechaCompromiso}
                onChange={(e) =>
                  setNewOtData((prev) => ({
                    ...prev,
                    fechaCompromiso: e.target.value,
                  }))
                }
              />
            </Field>
          </div>
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}
          >
            <Field label='Tiempo de paro (min)'>
              <input
                type='number'
                min={0}
                placeholder='0'
                value={newOtData.downtimeMinutos}
                onChange={(e) =>
                  setNewOtData((prev) => ({
                    ...prev,
                    downtimeMinutos: e.target.value,
                  }))
                }
              />
            </Field>
            <Field label='Fecha de cierre'>
              <input
                type='date'
                value={newOtData.fechaCierre}
                onChange={(e) =>
                  setNewOtData((prev) => ({
                    ...prev,
                    fechaCierre: e.target.value,
                  }))
                }
              />
            </Field>
          </div>
          <Field label='Descripción del problema'>
            <textarea
              placeholder='Describe el problema detectado...'
              value={newOtData.descripcionProblema}
              onChange={(e) =>
                setNewOtData((prev) => ({
                  ...prev,
                  descripcionProblema: e.target.value,
                }))
              }
            />
          </Field>
          <Field label='Descripción del servicio'>
            <textarea
              placeholder='Describe el servicio realizado o a realizar...'
              value={newOtData.descripcionServicio}
              onChange={(e) =>
                setNewOtData((prev) => ({
                  ...prev,
                  descripcionServicio: e.target.value,
                }))
              }
            />
          </Field>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
              marginBottom: 12,
            }}
          >
            <label
              style={{
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                fontSize: 13,
                color: '#667085',
              }}
            >
              <input
                type='checkbox'
                checked={newOtData.gastoDinero}
                onChange={(e) =>
                  setNewOtData((prev) => ({
                    ...prev,
                    gastoDinero: e.target.checked,
                    montoGastado: e.target.checked ? prev.montoGastado : '',
                  }))
                }
              />
              ¿Se gastó dinero?
            </label>
            <label
              style={{
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                fontSize: 13,
                color: '#667085',
              }}
            >
              <input
                type='checkbox'
                checked={newOtData.usoRefaccionConsumible}
                onChange={(e) =>
                  setNewOtData((prev) => ({
                    ...prev,
                    usoRefaccionConsumible: e.target.checked,
                    refaccionConsumibleDetalle: e.target.checked
                      ? prev.refaccionConsumibleDetalle
                      : '',
                  }))
                }
              />
              ¿Se usó refacción o consumible?
            </label>
          </div>
          {newOtData.gastoDinero && (
            <Field label='Monto gastado'>
              <input
                type='number'
                min={0}
                step='0.01'
                placeholder='Ej: 1500.00'
                value={newOtData.montoGastado}
                onChange={(e) =>
                  setNewOtData((prev) => ({
                    ...prev,
                    montoGastado: e.target.value,
                  }))
                }
              />
            </Field>
          )}
          {newOtData.usoRefaccionConsumible && (
            <Field label='Detalle de refacción o consumible *'>
              <input
                type='text'
                placeholder='Ej: Rodamiento SKF 6205'
                value={newOtData.refaccionConsumibleDetalle}
                onChange={(e) =>
                  setNewOtData((prev) => ({
                    ...prev,
                    refaccionConsumibleDetalle: e.target.value,
                  }))
                }
              />
            </Field>
          )}
          <ModalFooter
            onCancel={closeCreateModal}
            onConfirm={createWorkOrder}
            confirmLabel='Crear OT'
          />
        </Modal>
      )}
    </div>
  );
}

interface Notificacion {
  id: string;
  titulo: string;
  msg: string;
  tipo: 'vencida' | 'proxima' | 'asignada';
  leida: boolean;
  fecha: string;
}

interface NotificationTone {
  accent: string;
  iconBg: string;
  iconColor: string;
  badgeBg: string;
  badgeColor: string;
  badgeBorder: string;
}

const notificationTone: Record<Notificacion['tipo'], NotificationTone> = {
  vencida: {
    accent: '#dc2626',
    iconBg: '#fee2e2',
    iconColor: '#dc2626',
    badgeBg: '#fee2e2',
    badgeColor: '#dc2626',
    badgeBorder: '#fecaca',
  },
  proxima: {
    accent: '#d89b2b',
    iconBg: '#fef3c7',
    iconColor: '#b7791f',
    badgeBg: '#fef3c7',
    badgeColor: '#b7791f',
    badgeBorder: '#fde68a',
  },
  asignada: {
    accent: '#2563eb',
    iconBg: '#dbeafe',
    iconColor: '#2563eb',
    badgeBg: '#dbeafe',
    badgeColor: '#2563eb',
    badgeBorder: '#bfdbfe',
  },
};

export function NotificationsScreen({
  notifs,
  setNotifs,
}: {
  notifs: any[];
  setNotifs: any;
}) {
  const unread = notifs.filter((n) => !n.leida).length;
  const markRead = (id: string) =>
    setNotifs((ns) => ns.map((n) => (n.id === id ? { ...n, leida: true } : n)));
  const markAll = () =>
    setNotifs((ns) => ns.map((n) => ({ ...n, leida: true })));

  return (
    <div style={{ padding: '28px', overflowY: 'auto', height: '100%' }}>
      <PageHeader
        title='Notificaciones'
        sub={unread > 0 ? unread + ' sin leer' : 'Todo al dia'}
        action={
          unread > 0 ? (
            <button
              onClick={markAll}
              style={{
                background: 'var(--app-surface, #ffffff)',
                border: '1px solid var(--app-border-soft, #dde3ea)',
                color: 'var(--app-text-secondary, #667085)',
                fontSize: 12,
                fontWeight: 650,
                padding: '7px 14px',
                borderRadius: 9,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontFamily: 'inherit',
                transition:
                  'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  'var(--app-surface-subtle, #f8fafc)';
                e.currentTarget.style.borderColor =
                  'var(--app-border, #cbd5e1)';
                e.currentTarget.style.color =
                  'var(--app-text-primary, #111827)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  'var(--app-surface, #ffffff)';
                e.currentTarget.style.borderColor =
                  'var(--app-border-soft, #dde3ea)';
                e.currentTarget.style.color =
                  'var(--app-text-secondary, #667085)';
              }}
            >
              Marcar todas como leidas
            </button>
          ) : null
        }
      />
      <div className='flex w-full max-w-[860px] flex-col gap-3'>
        {notifs.map((n) => {
          const tone = notificationTone[n.tipo];
          const cardBackground = n.leida
            ? 'var(--app-surface-subtle, #f8fafc)'
            : 'var(--app-surface, #ffffff)';

          return (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              style={{
                background: cardBackground,
                border: `1px solid ${
                  n.leida
                    ? 'var(--app-border-soft, #dde3ea)'
                    : 'var(--app-border, #cbd5e1)'
                }`,
                borderLeft: `3px solid ${tone.accent}`,
                borderRadius: 14,
                padding: '16px 18px',
                cursor: 'pointer',
                boxShadow: n.leida
                  ? '0 1px 2px rgb(15 23 42 / 0.03)'
                  : '0 0 0 1px rgb(15 23 42 / 0.02), 0 2px 6px rgb(15 23 42 / 0.06)',
                transition:
                  'background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  'var(--app-surface-subtle, #f8fafc)';
                e.currentTarget.style.boxShadow =
                  '0 0 0 1px rgb(15 23 42 / 0.03), 0 4px 10px rgb(15 23 42 / 0.07)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = cardBackground;
                e.currentTarget.style.boxShadow = n.leida
                  ? '0 1px 2px rgb(15 23 42 / 0.03)'
                  : '0 0 0 1px rgb(15 23 42 / 0.02), 0 2px 6px rgb(15 23 42 / 0.06)';
              }}
            >
              <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
                <div
                  style={{
                    display: 'flex',
                    gap: 14,
                    alignItems: 'flex-start',
                    minWidth: 0,
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      background: tone.iconBg,
                      color: tone.iconColor,
                      fontSize: 17,
                      lineHeight: 1,
                      flexShrink: 0,
                    }}
                  >
                    {NTI[n.tipo]}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        gap: 8,
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        marginBottom: 5,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: n.leida
                            ? 'var(--app-text-secondary, #667085)'
                            : 'var(--app-text-primary, #111827)',
                        }}
                      >
                        {n.titulo}
                      </span>
                      {!n.leida && (
                        <span
                          style={{
                            width: 7,
                            height: 7,
                            background: tone.accent,
                            borderRadius: '50%',
                            display: 'inline-block',
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </div>
                    <p
                      style={{
                        fontSize: 13,
                        color: 'var(--app-text-secondary, #667085)',
                        lineHeight: 1.5,
                        margin: 0,
                      }}
                    >
                      {n.msg}
                    </p>
                  </div>
                </div>
                <div className='flex flex-row flex-wrap items-center gap-2 sm:ml-5 sm:flex-col sm:items-end sm:text-right'>
                  <span
                    style={{
                      fontSize: 11,
                      padding: '3px 9px',
                      borderRadius: 999,
                      fontWeight: 700,
                      letterSpacing: '0.02em',
                      background: tone.badgeBg,
                      color: tone.badgeColor,
                      border: `1px solid ${tone.badgeBorder}`,
                      whiteSpace: 'nowrap',
                      fontFamily: 'monospace',
                    }}
                  >
                    {NTL[n.tipo]}
                  </span>
                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--app-text-muted, #94a3b8)',
                      fontFamily: 'monospace',
                    }}
                  >
                    {n.fecha}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const REPORT_DATE_PRESET = {
  THIS_MONTH: 'this_month',
  LAST_3_MONTHS: 'last_3_months',
  LAST_6_MONTHS: 'last_6_months',
  CUSTOM: 'custom',
} as const;

type ReportDatePreset =
  (typeof REPORT_DATE_PRESET)[keyof typeof REPORT_DATE_PRESET];

interface ReportDateRange {
  from: Date;
  to: Date;
}

interface ReportFilters {
  datePreset: ReportDatePreset;
  dateRange: ReportDateRange;
  area: string;
  technicianId: string;
  assetId: string;
  status: EstadoOT | '';
}

interface ReportKpiSummary {
  metric: string;
  value: string | number;
  detail: string;
}

const REPORT_EXPORT_KIND = {
  FULL_PDF: 'full_pdf',
  EXECUTIVE_PDF: 'executive_pdf',
  DATABASE_CSV: 'database_csv',
} as const;

type ReportExportKind =
  (typeof REPORT_EXPORT_KIND)[keyof typeof REPORT_EXPORT_KIND];

const reportStatusFilterOptions = [
  { label: 'Todos', value: '' },
  { label: 'Nueva', value: 'nueva' },
  { label: 'Asignada', value: 'asignada' },
  { label: 'En proceso', value: 'en_proceso' },
  { label: 'En espera', value: 'en_espera' },
  { label: 'Completada', value: 'completada' },
  { label: 'Cerrada', value: 'cerrada' },
  { label: 'Cancelada', value: 'cancelada' },
] as const satisfies ReadonlyArray<{ label: string; value: EstadoOT | '' }>;

const closedStatuses: EstadoOT[] = ['completada', 'cerrada', 'cancelada'];

const REPORT_MONTHLY_TREND_OMITTED_NOTE =
  'Las gráficas de tendencia mensual se omiten en periodos de un mes o menos. Selecciona un rango mayor para incluir análisis histórico.';

const reportStatusLabel: Record<EstadoOT, string> = {
  nueva: 'Nueva',
  asignada: 'Asignada',
  en_proceso: 'En Proceso',
  en_espera: 'En Espera',
  completada: 'Completada',
  cerrada: 'Cerrada',
  cancelada: 'Cancelada',
};

const reportPriorityLabel: Record<PrioridadOT, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  critico: 'Crítico',
};

const datePresetOptions = [
  { label: 'Este mes', value: REPORT_DATE_PRESET.THIS_MONTH },
  { label: 'Últimos 3 meses', value: REPORT_DATE_PRESET.LAST_3_MONTHS },
  { label: 'Últimos 6 meses', value: REPORT_DATE_PRESET.LAST_6_MONTHS },
  { label: 'Personalizado', value: REPORT_DATE_PRESET.CUSTOM },
] as const;

function getPresetRange(preset: ReportDatePreset): ReportDateRange {
  const now = new Date();

  if (preset === REPORT_DATE_PRESET.LAST_3_MONTHS) {
    return { from: startOfMonth(subMonths(now, 2)), to: endOfMonth(now) };
  }

  if (preset === REPORT_DATE_PRESET.LAST_6_MONTHS) {
    return { from: startOfMonth(subMonths(now, 5)), to: endOfMonth(now) };
  }

  return { from: startOfMonth(now), to: endOfMonth(now) };
}

function getDateRangeDays(startDate: Date, endDate: Date) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const rangeInMs = end.getTime() - start.getTime();
  const dayInMs = 1000 * 60 * 60 * 24;

  return Math.floor(Math.abs(rangeInMs) / dayInMs) + 1;
}

function isRangeLongerThanOneMonth(startDate: Date, endDate: Date) {
  return getDateRangeDays(startDate, endDate) > 31;
}

function getInitialReportFilters(): ReportFilters {
  return {
    datePreset: REPORT_DATE_PRESET.THIS_MONTH,
    dateRange: getPresetRange(REPORT_DATE_PRESET.THIS_MONTH),
    area: '',
    technicianId: '',
    assetId: '',
    status: '',
  };
}

function getAssetById(assetId: string) {
  return ASSETS.find((asset) => asset.id === assetId);
}

function getFilteredAssets(filters: ReportFilters) {
  return ASSETS.filter((asset) => {
    if (filters.assetId && asset.id !== filters.assetId) return false;
    if (filters.area && asset.area !== filters.area) return false;
    return true;
  });
}

function getFilteredWorkOrders(orders: OrdenTrabajo[], filters: ReportFilters) {
  const filteredAssetIds = new Set(
    getFilteredAssets(filters).map((asset) => asset.id),
  );

  return orders.filter((workOrder) => {
    const creationDate = new Date(workOrder.fechaCreacion);

    if (creationDate < filters.dateRange.from) return false;
    if (creationDate > filters.dateRange.to) return false;
    if (!filteredAssetIds.has(workOrder.activoId)) return false;
    if (filters.technicianId && workOrder.tecnicoId !== filters.technicianId) {
      return false;
    }
    if (filters.status && workOrder.status !== filters.status) return false;

    return true;
  });
}

function getFilteredPlans(filters: ReportFilters) {
  const filteredAssetIds = new Set(
    getFilteredAssets(filters).map((asset) => asset.id),
  );

  return PLANS.filter((plan) => {
    if (!filteredAssetIds.has(plan.assetId)) return false;
    return true;
  });
}

function filterReportsData(orders: OrdenTrabajo[], filters: ReportFilters) {
  return {
    assets: getFilteredAssets(filters),
    workOrders: getFilteredWorkOrders(orders, filters),
    plans: getFilteredPlans(filters),
  };
}

function sanitizeFilenameSegment(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'todos'
  );
}

function buildReportFilename(filters: ReportFilters, kind: ReportExportKind) {
  const from = format(filters.dateRange.from, 'yyyyMMdd');
  const to = format(filters.dateRange.to, 'yyyyMMdd');
  const asset = filters.assetId
    ? getAssetById(filters.assetId)?.code || filters.assetId
    : 'todos-los-activos';
  const period = `${from}-${to}`;
  const prefixByKind: Record<ReportExportKind, string> = {
    [REPORT_EXPORT_KIND.FULL_PDF]: 'pm0-reporte-completo',
    [REPORT_EXPORT_KIND.EXECUTIVE_PDF]: 'pm0-reporte-ejecutivo',
    [REPORT_EXPORT_KIND.DATABASE_CSV]: 'pm0-base-datos-reporte',
  };

  return `${prefixByKind[kind]}-${sanitizeFilenameSegment(asset)}-${period}`;
}

function escapeHtml(
  value: string | number | boolean | Date | null | undefined,
) {
  const stringValue =
    value instanceof Date ? formatDate(value) : String(value ?? '');

  return stringValue
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildPrintRows(
  rows: Array<
    Record<string, string | number | boolean | Date | null | undefined>
  >,
  emptyLabel: string,
) {
  if (rows.length === 0) {
    return `<p class="empty">${escapeHtml(emptyLabel)}</p>`;
  }

  const headers = Object.keys(rows[0] || {});

  return `
    <table>
      <thead>
        <tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (row) => `
              <tr>
                ${headers
                  .map((header) => `<td>${escapeHtml(row[header])}</td>`)
                  .join('')}
              </tr>
            `,
          )
          .join('')}
      </tbody>
    </table>
  `;
}

interface CapturedReportChart {
  id: string;
  title: string;
  dataUrl: string;
}

const REPORT_CHART_EXPORT_SELECTOR = '[data-report-chart-export="true"]';

function waitForReportCharts(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function captureVisibleReportCharts(): Promise<CapturedReportChart[]> {
  await waitForReportCharts(120);

  const chartContainers = Array.from(
    document.querySelectorAll<HTMLElement>(REPORT_CHART_EXPORT_SELECTOR),
  ).filter((container) => {
    const rect = container.getBoundingClientRect();

    return rect.width > 0 && rect.height > 0;
  });

  const chartInstances = chartContainers
    .map((container) => {
      const echartsRoot =
        container.querySelector<HTMLElement>('.echarts-for-react');

      if (!echartsRoot) {
        return null;
      }

      const instance = echarts.getInstanceByDom(echartsRoot);

      if (!instance) {
        return null;
      }

      return { container, instance };
    })
    .filter(
      (chart): chart is { container: HTMLElement; instance: echarts.ECharts } =>
        Boolean(chart),
    );

  chartInstances.forEach(({ instance }) => instance.resize());
  await waitForReportCharts(160);

  return chartInstances.map(({ container, instance }, index) => ({
    id: container.dataset.reportChartId || `chart-${index + 1}`,
    title: container.dataset.reportChartTitle || `Gráfica ${index + 1}`,
    dataUrl: instance.getDataURL({
      type: 'png',
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      excludeComponents: ['toolbox'],
    }),
  }));
}

function openReportPrintWindow({
  title,
  filename,
  body,
}: {
  title: string;
  filename: string;
  body: string;
}) {
  const printWindow = window.open('', '_blank');

  if (!printWindow) {
    window.alert(
      'No se pudo abrir la ventana de impresión. Permití pop-ups para exportar el PDF.',
    );
    return;
  }

  printWindow.document.write(`<!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(title)} - ${escapeHtml(filename)}.pdf</title>
        <style>
          @page { size: A4; margin: 14mm; }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            background: #ffffff;
            color: #111827;
            font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            font-size: 12px;
            line-height: 1.45;
          }
          .report { padding: 24px; }
          .header {
            border-bottom: 3px solid #0f3a5f;
            margin-bottom: 18px;
            padding-bottom: 14px;
          }
          .brand { color: #b7791f; font-size: 11px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
          h1 { color: #0f3a5f; font-size: 26px; margin: 6px 0 8px; }
          h2 { color: #0f3a5f; font-size: 16px; margin: 20px 0 8px; }
          .meta { color: #475569; display: grid; gap: 3px; }
          .grid { display: grid; gap: 10px; grid-template-columns: repeat(4, minmax(0, 1fr)); margin: 14px 0 8px; }
          .card { border: 1px solid #dde3ea; border-radius: 10px; padding: 10px; background: #f8fafc; }
          .card-label { color: #667085; font-size: 10px; font-weight: 800; text-transform: uppercase; }
          .card-value { color: #111827; font-size: 20px; font-weight: 900; margin-top: 4px; }
          .card-detail { color: #667085; font-size: 11px; margin-top: 3px; }
          .chart-section { page-break-inside: avoid; }
          .chart-grid { display: grid; gap: 10px; grid-template-columns: repeat(2, minmax(0, 1fr)); margin: 10px 0 14px; }
          .chart-card { border: 1px solid #dde3ea; border-radius: 10px; padding: 10px; background: #ffffff; page-break-inside: avoid; }
          .chart-card h3 { color: #0f3a5f; font-size: 12px; margin: 0 0 8px; }
          .chart-image { display: block; height: auto; max-height: 230px; object-fit: contain; width: 100%; }
          table { border-collapse: collapse; width: 100%; margin-bottom: 10px; page-break-inside: auto; }
          th, td { border: 1px solid #dde3ea; padding: 6px 7px; text-align: left; vertical-align: top; }
          th { background: #f1f5f9; color: #475569; font-size: 10px; text-transform: uppercase; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          .empty { border: 1px dashed #cbd5e1; border-radius: 8px; color: #667085; padding: 10px; }
          .note { color: #667085; font-size: 10px; margin-top: 16px; }
          @media print { .report { padding: 0; } }
        </style>
      </head>
      <body>
        <main class="report">
          ${body}
          <p class="note">Al guardar como PDF, el navegador puede ignorar el nombre sugerido: ${escapeHtml(filename)}.pdf</p>
        </main>
        <script>
          const waitForImages = () => Promise.all(
            Array.from(document.images).map((image) => {
              if (image.complete) return Promise.resolve();
              return new Promise((resolve) => {
                image.addEventListener('load', resolve, { once: true });
                image.addEventListener('error', resolve, { once: true });
              });
            })
          );

          window.addEventListener('load', async () => {
            await waitForImages();
            window.focus();
            window.print();
          });
        </script>
      </body>
    </html>`);
  printWindow.document.close();
}

function formatDate(value: Date | string) {
  return format(new Date(value), 'dd MMM yyyy', { locale: es });
}

function ReportField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className='flex flex-col gap-1.5'>
      <span className='text-shNeutral-700 text-xs font-semibold'>{label}</span>
      {children}
    </label>
  );
}

function SoftBadge({ children, tone }: { children: string; tone: string }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-2.5 py-1 text-xs font-bold whitespace-nowrap',
        tone,
      )}
    >
      {children}
    </span>
  );
}

function getStatusBadgeClass(status: EstadoOT) {
  if (status === 'completada' || status === 'cerrada') {
    return 'border-shSuccess-200 bg-shSuccess-50 text-shSuccess-800';
  }
  if (status === 'cancelada') {
    return 'border-shNeutral-200 bg-shNeutral-100 text-shNeutral-700';
  }
  if (status === 'en_proceso' || status === 'en_espera') {
    return 'border-shAccent-200 bg-shAccent-50 text-shAccent-800';
  }
  return 'border-shPrimary-200 bg-shPrimary-50 text-shPrimary-800';
}

function getPriorityBadgeClass(priority: PrioridadOT) {
  if (priority === 'critico') {
    return 'border-shDanger-200 bg-shDanger-50 text-shDanger-800';
  }
  if (priority === 'alta') {
    return 'border-shAccent-200 bg-shAccent-50 text-shAccent-800';
  }
  if (priority === 'media') {
    return 'border-shPrimary-200 bg-shPrimary-50 text-shPrimary-800';
  }
  return 'border-shSuccess-200 bg-shSuccess-50 text-shSuccess-800';
}

export function ReportsScreen({ wo }: { wo: OrdenTrabajo[] }) {
  const setOrdenes = useWorkOrdersStore((state) => state.setOrdenes);
  const [filters, setFilters] = useState<ReportFilters>(
    getInitialReportFilters,
  );
  const [draftFilters, setDraftFilters] = useState<ReportFilters>(
    getInitialReportFilters,
  );
  const [showPicker, setShowPicker] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const {
    assets: filteredAssets,
    workOrders: filteredWo,
    plans: filteredPlans,
  } = filterReportsData(wo, filters);
  const selectedAsset = filters.assetId;
  const selectedAssetCode = selectedAsset
    ? getAssetById(selectedAsset)?.code
    : null;
  const selectedAssetName = selectedAsset
    ? getAssetById(selectedAsset)?.name || selectedAsset
    : 'todos los activos';
  const printDateLabel = `${formatDate(filters.dateRange.from)} - ${formatDate(
    filters.dateRange.to,
  )}`;
  const reportMonths = eachMonthOfInterval({
    start: startOfMonth(filters.dateRange.from),
    end: endOfMonth(filters.dateRange.to),
  });
  const areas = Array.from(new Set(ASSETS.map((asset) => asset.area))).sort();
  const technicians = Array.from(
    new Map(
      wo.map((workOrder) => [
        workOrder.tecnicoId,
        { id: workOrder.tecnicoId, name: workOrder.tecnicoNombre },
      ]),
    ).values(),
  ).sort((first, second) => first.name.localeCompare(second.name));

  const historyData = reportMonths.map((month) => {
    const monthWO = getFilteredWorkOrders(wo, {
      ...filters,
      dateRange: { from: startOfMonth(month), to: endOfMonth(month) },
    });
    const monthCompleted = monthWO.filter(
      (workOrder) => workOrder.status === 'completada',
    ).length;
    const totalFinished = monthWO.filter((workOrder) =>
      closedStatuses.includes(workOrder.status),
    ).length;

    return {
      mes: format(month, 'MMM', { locale: es }),
      compliance:
        totalFinished > 0
          ? Math.round((monthCompleted / totalFinished) * 100)
          : 0,
      downtime:
        monthWO.reduce((sum, workOrder) => sum + workOrder.downtimeMinutos, 0) /
        60,
    };
  });

  const chartCompliance = historyData.map((item) => ({
    mes: item.mes,
    val: item.compliance,
  }));
  const chartDowntime = historyData.map((item) => ({
    mes: item.mes,
    hrs: Math.round(item.downtime * 10) / 10,
  }));
  const totalDown = filteredWo.reduce(
    (sum, workOrder) => sum + workOrder.downtimeMinutos,
    0,
  );
  const correctivos = filteredWo.filter(
    (workOrder) => workOrder.tipo === 'correctivo',
  ).length;
  const preventivos = filteredWo.filter(
    (workOrder) => workOrder.tipo === 'preventivo',
  ).length;
  const pct =
    filteredWo.length > 0
      ? Math.round((correctivos / filteredWo.length) * 100)
      : 0;
  const avgMTTR =
    correctivos > 0 ? Math.round((totalDown / 60 / correctivos) * 10) / 10 : 0;
  const completed = filteredWo.filter(
    (workOrder) => workOrder.status === 'completada',
  ).length;
  const total = filteredWo.filter((workOrder) =>
    closedStatuses.includes(workOrder.status),
  ).length;
  const compliancePct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const chartTipo = [
    { name: 'Preventivo', value: preventivos, color: '#486581' },
    { name: 'Correctivo', value: correctivos, color: '#b91c1c' },
  ];
  const assetGroups = filteredWo
    .filter((workOrder) => workOrder.tipo === 'correctivo')
    .reduce(
      (accumulator, workOrder) => {
        if (!accumulator[workOrder.activoId]) {
          accumulator[workOrder.activoId] = {
            count: 0,
            down: 0,
            id: workOrder.activoId,
          };
        }

        accumulator[workOrder.activoId].count += 1;
        accumulator[workOrder.activoId].down += workOrder.downtimeMinutos;
        return accumulator;
      },
      {} as Record<string, { count: number; down: number; id: string }>,
    );
  const dynamicTopFallas = Object.values(assetGroups)
    .map((group) => ({
      asset: getAssetById(group.id)?.name || 'Desconocido',
      count: group.count,
      down: Math.round(group.down / 60),
    }))
    .sort((first, second) => second.count - first.count);
  const kpiSummary: ReportKpiSummary[] = [
    {
      metric: 'Cumplimiento PM',
      value: `${compliancePct}%`,
      detail: `${completed} completadas de ${total} OTs cerradas/canceladas`,
    },
    { metric: 'MTTR promedio', value: `${avgMTTR} h`, detail: 'Correctivos' },
    {
      metric: 'Paro acumulado',
      value: `${Math.round(totalDown / 60)} h`,
      detail: `${filteredWo.length} OTs filtradas`,
    },
    {
      metric: '% Correctivo',
      value: `${pct}%`,
      detail: `Prev: ${preventivos} · Corr: ${correctivos}`,
    },
  ];
  const periodLabel =
    datePresetOptions.find((option) => option.value === filters.datePreset)
      ?.label || printDateLabel;
  const selectedAreaLabel = filters.area || '';
  const selectedTechnicianLabel = filters.technicianId
    ? technicians.find((technician) => technician.id === filters.technicianId)
        ?.name || filters.technicianId
    : '';
  const selectedStatusLabel = filters.status
    ? reportStatusFilterOptions.find(
        (option) => option.value === filters.status,
      )?.label || reportStatusLabel[filters.status]
    : '';
  const activeFilterSummary = [
    `Mostrando información de ${periodLabel} para ${selectedAssetName}`,
    selectedStatusLabel ? `Estado: ${selectedStatusLabel}` : '',
  ]
    .filter(Boolean)
    .join(' · ');
  const hasAdditionalFilters = Boolean(
    filters.area || filters.technicianId || filters.status,
  );
  const detailRows = filteredWo.slice(0, 50);

  const updateDraftFilter = <TKey extends keyof ReportFilters>(
    key: TKey,
    value: ReportFilters[TKey],
  ) => {
    setDraftFilters((currentFilters) => ({ ...currentFilters, [key]: value }));
  };

  const applyPreset = (preset: ReportDatePreset) => {
    const range = getPresetRange(preset);
    const nextFilters = {
      ...draftFilters,
      datePreset: preset,
      dateRange: range,
    };

    setDraftFilters(nextFilters);
    if (preset !== REPORT_DATE_PRESET.CUSTOM) {
      setFilters(nextFilters);
      setShowPicker(false);
    } else {
      setShowPicker(true);
    }
  };

  const updateReportFilter = <TKey extends keyof ReportFilters>(
    key: TKey,
    value: ReportFilters[TKey],
  ) => {
    const nextFilters = { ...filters, [key]: value };

    setDraftFilters({ ...draftFilters, [key]: value });
    setFilters(nextFilters);
  };

  const applyFilters = () => {
    setFilters(draftFilters);
    setShowPicker(false);
  };

  const clearFilters = () => {
    const nextFilters = { ...filters, area: '', technicianId: '', status: '' };

    setDraftFilters({
      ...draftFilters,
      area: '',
      technicianId: '',
      status: '',
    });
    setFilters(nextFilters);
    setShowPicker(false);
  };

  const updateHeaderAsset = (assetId: string) => {
    const nextDraftFilters = { ...draftFilters, assetId };

    setDraftFilters(nextDraftFilters);
    setFilters({ ...filters, assetId });
  };

  const regenerateDemoData = () => {
    if (
      !window.confirm(
        'Se generará un nuevo set de datos demo para órdenes de trabajo. ¿Deseas continuar?',
      )
    ) {
      return;
    }

    setOrdenes(generarDatosSeisMeses());
  };

  const getWorkOrderRootCause = (workOrder: OrdenTrabajo) => {
    const legacyWorkOrder = workOrder as OrdenTrabajo & {
      causa?: string;
      accion?: string;
    };

    return legacyWorkOrder.causaRaiz || legacyWorkOrder.causa || '';
  };

  const getWorkOrderAction = (workOrder: OrdenTrabajo) => {
    const legacyWorkOrder = workOrder as OrdenTrabajo & {
      causa?: string;
      accion?: string;
    };

    return legacyWorkOrder.accionTomada || legacyWorkOrder.accion || '';
  };

  const buildPrintHeader = (title: string) => `
    <section class="header">
      <div class="brand">PM0 / Paro Cero</div>
      <h1>${escapeHtml(title)}</h1>
      <div class="meta">
        <span><strong>Generado:</strong> ${escapeHtml(format(new Date(), 'dd MMM yyyy HH:mm', { locale: es }))}</span>
        <span><strong>Activo seleccionado:</strong> ${escapeHtml(selectedAssetCode ? `${selectedAssetCode} · ${selectedAssetName}` : selectedAssetName)}</span>
        <span><strong>Periodo:</strong> ${escapeHtml(periodLabel)} (${escapeHtml(printDateLabel)})</span>
        ${selectedAreaLabel ? `<span><strong>Área:</strong> ${escapeHtml(selectedAreaLabel)}</span>` : ''}
        ${selectedTechnicianLabel ? `<span><strong>Técnico / responsable:</strong> ${escapeHtml(selectedTechnicianLabel)}</span>` : ''}
        ${selectedStatusLabel ? `<span><strong>Estado de OT:</strong> ${escapeHtml(selectedStatusLabel)}</span>` : ''}
        <span><strong>Alcance:</strong> ${escapeHtml(filteredWo.length)} OTs · ${escapeHtml(filteredAssets.length)} activos · ${escapeHtml(filteredPlans.length)} planes PM</span>
      </div>
    </section>
  `;

  const buildKpiCards = () => `
    <section class="grid">
      ${kpiSummary
        .map(
          (kpi) => `
            <article class="card">
              <div class="card-label">${escapeHtml(kpi.metric)}</div>
              <div class="card-value">${escapeHtml(kpi.value)}</div>
              <div class="card-detail">${escapeHtml(kpi.detail)}</div>
            </article>
          `,
        )
        .join('')}
    </section>
  `;

  const buildSummaryTables = () => {
    const chartRows = historyData.map((item) => ({
      Mes: item.mes,
      'Cumplimiento PM (%)': item.compliance,
      'Horas paro': Math.round(item.downtime * 10) / 10,
    }));
    const failureRows = dynamicTopFallas.map((failure, index) => ({
      '#': index + 1,
      Activo: failure.asset,
      Fallas: failure.count,
      'Paro (h)': failure.down,
    }));
    const typeRows = chartTipo.map((item) => ({
      Tipo: item.name,
      Órdenes: item.value,
    }));

    return `
      <h2>Resumen de tendencias</h2>
      ${buildPrintRows(chartRows, 'Sin datos de tendencia para el periodo.')}
      <h2>Ranking de fallas</h2>
      ${buildPrintRows(failureRows, 'Sin fallas para los filtros aplicados.')}
      <h2>Preventivo vs correctivo</h2>
      ${buildPrintRows(typeRows, 'Sin órdenes para comparar.')}
    `;
  };

  const buildVisualCharts = (capturedCharts: CapturedReportChart[]) => {
    return `
      <section class="chart-section">
        <h2>Gráficas visibles del reporte</h2>
        <div class="chart-grid">
          ${
            capturedCharts.length > 0
              ? capturedCharts
                  .map(
                    (chart) => `
                    <article class="chart-card" data-chart-id="${escapeHtml(chart.id)}">
                      <h3>${escapeHtml(chart.title)}</h3>
                      <img class="chart-image" src="${escapeHtml(chart.dataUrl)}" alt="${escapeHtml(chart.title)}" />
                    </article>
                  `,
                  )
                  .join('')
              : '<p class="empty">No se pudieron capturar las gráficas visibles. Verificá que estén renderizadas antes de exportar.</p>'
          }
        </div>
      </section>
    `;
  };

  const buildMonthlyTrendChartsOmittedNote = () => `
    <section class="chart-section">
      <h2>Gráficas visibles del reporte</h2>
      <p class="empty">${escapeHtml(REPORT_MONTHLY_TREND_OMITTED_NOTE)}</p>
    </section>
  `;

  const exportFullPdf = async () => {
    const shouldIncludeMonthlyTrendCharts = isRangeLongerThanOneMonth(
      filters.dateRange.from,
      filters.dateRange.to,
    );
    const capturedCharts = shouldIncludeMonthlyTrendCharts
      ? await captureVisibleReportCharts()
      : [];
    const detailPrintRows = detailRows.map((workOrder) => {
      const asset = getAssetById(workOrder.activoId);

      return {
        Folio: workOrder.folio,
        Activo: asset ? `${asset.code} · ${asset.name}` : workOrder.activoId,
        Área: asset?.area || '—',
        Tipo: workOrder.tipo,
        Estado: reportStatusLabel[workOrder.status],
        Prioridad: reportPriorityLabel[workOrder.prioridad],
        Responsable: workOrder.tecnicoNombre,
        Fecha: formatDate(workOrder.fechaCreacion),
        'Paro (h)': Math.round((workOrder.downtimeMinutos / 60) * 10) / 10,
        'Causa raíz': getWorkOrderRootCause(workOrder) || '—',
        'Acción tomada': getWorkOrderAction(workOrder) || '—',
      };
    });

    openReportPrintWindow({
      title: 'Reportes y KPIs',
      filename: buildReportFilename(filters, REPORT_EXPORT_KIND.FULL_PDF),
      body: `
        ${buildPrintHeader('Reportes y KPIs')}
        ${buildKpiCards()}
        ${
          shouldIncludeMonthlyTrendCharts
            ? buildVisualCharts(capturedCharts)
            : buildMonthlyTrendChartsOmittedNote()
        }
        ${buildSummaryTables()}
        <h2>Detalle visible del reporte</h2>
        ${buildPrintRows(detailPrintRows, 'Sin órdenes de trabajo para los filtros aplicados.')}
      `,
    });
  };

  const exportExecutivePdf = () => {
    openReportPrintWindow({
      title: 'Reporte ejecutivo PM0 / Paro Cero',
      filename: buildReportFilename(filters, REPORT_EXPORT_KIND.EXECUTIVE_PDF),
      body: `
        ${buildPrintHeader('Reporte ejecutivo PM0 / Paro Cero')}
        ${buildKpiCards()}
        <h2>Resumen ejecutivo</h2>
        ${buildPrintRows(
          [
            {
              Indicador: 'Cumplimiento PM',
              Valor: `${compliancePct}%`,
              Lectura: `${completed} completadas de ${total} OTs cerradas/canceladas`,
            },
            {
              Indicador: 'Paro acumulado',
              Valor: `${Math.round(totalDown / 60)} h`,
              Lectura: `${filteredWo.length} OTs filtradas`,
            },
            {
              Indicador: 'MTTR',
              Valor: `${avgMTTR} h`,
              Lectura: 'Promedio sobre OTs correctivas',
            },
            {
              Indicador: '% correctivo',
              Valor: `${pct}%`,
              Lectura: `Prev: ${preventivos} · Corr: ${correctivos}`,
            },
          ],
          'Sin KPIs para el periodo.',
        )}
        <h2>Principales tendencias</h2>
        ${buildPrintRows(
          historyData.map((item) => ({
            Mes: item.mes,
            'Cumplimiento PM (%)': item.compliance,
            'Horas paro': Math.round(item.downtime * 10) / 10,
          })),
          'Sin datos de tendencia para el periodo.',
        )}
      `,
    });
  };

  const exportDatabaseCsv = () => {
    exportToCsv({
      filename: `${buildReportFilename(filters, REPORT_EXPORT_KIND.DATABASE_CSV)}.csv`,
      columns: [
        { header: 'Folio', value: (workOrder) => workOrder.folio },
        {
          header: 'Activo',
          value: (workOrder) => {
            const asset = getAssetById(workOrder.activoId);
            return asset ? `${asset.code} - ${asset.name}` : workOrder.activoId;
          },
        },
        {
          header: 'Área',
          value: (workOrder) => getAssetById(workOrder.activoId)?.area || '',
        },
        {
          header: 'Técnico',
          value: (workOrder) => workOrder.tecnicoNombre,
        },
        { header: 'Tipo', value: (workOrder) => workOrder.tipo },
        {
          header: 'Estado',
          value: (workOrder) => reportStatusLabel[workOrder.status],
        },
        {
          header: 'Prioridad',
          value: (workOrder) => reportPriorityLabel[workOrder.prioridad],
        },
        {
          header: 'Fecha',
          value: (workOrder) => formatDate(workOrder.fechaCreacion),
        },
        {
          header: 'Paro',
          value: (workOrder) =>
            Math.round((workOrder.downtimeMinutos / 60) * 10) / 10,
        },
        {
          header: 'Causa raíz',
          value: (workOrder) => getWorkOrderRootCause(workOrder),
        },
        {
          header: 'Acción tomada',
          value: (workOrder) => getWorkOrderAction(workOrder),
        },
      ] satisfies CsvColumn<OrdenTrabajo>[],
      rows: filteredWo,
    });
  };

  const runExport = (kind: ReportExportKind) => {
    setShowExportMenu(false);

    if (kind === REPORT_EXPORT_KIND.FULL_PDF) {
      void exportFullPdf();
      return;
    }

    if (kind === REPORT_EXPORT_KIND.EXECUTIVE_PDF) {
      exportExecutivePdf();
      return;
    }

    exportDatabaseCsv();
  };

  return (
    <div className='report-print-root h-full overflow-y-auto p-4 sm:p-6 lg:p-7'>
      <div className='no-print'>
        <PageHeader
          title='Reportes y KPIs'
          sub='Analiza mantenimiento, paros, cumplimiento y desempeño por activo, área, técnico o periodo.'
          action={
            <div className='no-print flex flex-col gap-2 sm:flex-row sm:items-center'>
              <select
                value={selectedAsset}
                onChange={(event) => updateHeaderAsset(event.target.value)}
                className='border-shNeutral-200 bg-shNeutral-50 text-shNeutral-900 focus:border-shAccent-500 focus:ring-shAccent-500/20 h-10 min-w-56 rounded-lg border px-3 text-sm font-semibold shadow-inner outline-none focus:ring-2'
              >
                <option value=''>Todos los activos</option>
                {ASSETS.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.code} — {asset.name}
                  </option>
                ))}
              </select>

              <div className='relative'>
                <button
                  onClick={() => setShowExportMenu((current) => !current)}
                  className='border-shPrimary-200 text-shPrimary-800 hover:bg-shPrimary-50 inline-flex h-10 items-center gap-2 rounded-lg border bg-white px-4 text-sm font-bold shadow-sm transition-colors'
                  aria-haspopup='menu'
                  aria-expanded={showExportMenu}
                >
                  Exportar reporte
                  <span className='text-shNeutral-500 text-xs'>▾</span>
                </button>

                {showExportMenu && (
                  <div
                    role='menu'
                    className='border-shNeutral-200 shadow-shNeutral-900/10 absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded-xl border bg-white p-1.5 shadow-lg'
                  >
                    <button
                      type='button'
                      role='menuitem'
                      onClick={() => runExport(REPORT_EXPORT_KIND.FULL_PDF)}
                      className='text-shNeutral-800 hover:bg-shNeutral-50 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold transition-colors'
                    >
                      <span className='text-shDanger-700'>📄</span>
                      PDF vista completa
                    </button>
                    <button
                      type='button'
                      role='menuitem'
                      onClick={() =>
                        runExport(REPORT_EXPORT_KIND.EXECUTIVE_PDF)
                      }
                      className='text-shNeutral-800 hover:bg-shNeutral-50 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold transition-colors'
                    >
                      <span className='text-shDanger-700'>📑</span>
                      PDF ejecutivo
                    </button>
                    <button
                      type='button'
                      role='menuitem'
                      onClick={() => runExport(REPORT_EXPORT_KIND.DATABASE_CSV)}
                      className='text-shNeutral-800 hover:bg-shNeutral-50 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold transition-colors'
                    >
                      <span className='text-shSuccess-700'>▦</span>
                      CSV base de datos
                    </button>
                  </div>
                )}
              </div>
            </div>
          }
        />
      </div>

      <div className='print-only-date'>Fecha: {printDateLabel}</div>

      <section className='no-print border-shNeutral-200 mb-6 rounded-2xl border bg-white p-3 shadow-sm sm:p-4'>
        <div className='flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between'>
          <div>
            <h2 className='text-shPrimary-900 text-sm font-bold'>
              Controles del reporte
            </h2>
            <p className='text-shNeutral-500 mt-1 text-sm'>
              {activeFilterSummary}
            </p>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            {datePresetOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => applyPreset(option.value)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-bold transition-colors',
                  draftFilters.datePreset === option.value
                    ? 'border-shAccent-300 bg-shAccent-100 text-shAccent-900'
                    : 'border-shAccent-100 bg-shAccent-50 text-shAccent-800 hover:bg-shAccent-100',
                )}
              >
                {option.label}
              </button>
            ))}
            <BtnGhost onClick={regenerateDemoData}>
              Regenerar datos demo
            </BtnGhost>
          </div>
        </div>

        {showPicker && (
          <div className='border-shAccent-200 bg-shAccent-50 mb-4 rounded-xl border p-3'>
            <DayPicker
              mode='range'
              selected={draftFilters.dateRange}
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  updateDraftFilter('dateRange', {
                    from: range.from,
                    to: range.to,
                  });
                }
              }}
              locale={es}
            />
            <div className='mt-2 flex justify-end'>
              <button
                onClick={applyFilters}
                className='bg-shAccent-500 text-shForeground hover:bg-shAccent-600 rounded-lg px-4 py-2 text-sm font-bold transition-colors'
              >
                Aplicar período
              </button>
            </div>
          </div>
        )}

        <div className='mt-3 grid grid-cols-1 gap-3 md:grid-cols-3 xl:max-w-5xl'>
          <ReportField label='Área'>
            <select
              value={draftFilters.area}
              onChange={(event) =>
                updateReportFilter('area', event.target.value)
              }
              className='report-filter-control'
            >
              <option value=''>Todas</option>
              {areas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </ReportField>
          <ReportField label='Estado de OT'>
            <select
              value={draftFilters.status}
              onChange={(event) =>
                updateReportFilter(
                  'status',
                  event.target.value as ReportFilters['status'],
                )
              }
              className='report-filter-control'
            >
              {reportStatusFilterOptions.map((option) => (
                <option key={option.value || 'todos'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </ReportField>
          <ReportField label='Técnico / responsable'>
            <select
              value={draftFilters.technicianId}
              onChange={(event) =>
                updateReportFilter('technicianId', event.target.value)
              }
              className='report-filter-control'
            >
              <option value=''>Todos</option>
              {technicians.map((technician) => (
                <option key={technician.id} value={technician.id}>
                  {technician.name}
                </option>
              ))}
            </select>
          </ReportField>
        </div>

        {hasAdditionalFilters && (
          <div className='mt-3 flex justify-end'>
            <button
              onClick={clearFilters}
              className='border-shNeutral-200 text-shNeutral-700 hover:bg-shNeutral-50 rounded-lg border bg-white px-4 py-2 text-sm font-bold transition-colors'
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </section>

      <div className='print-content'>
        <div className='report-kpi-grid mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4'>
          <KpiCard
            label='Cumplimiento PM'
            value={`${compliancePct}%`}
            sub={
              selectedAsset
                ? 'Basado en histórico del activo'
                : 'Meta: 90% · General'
            }
            color='#486581'
            icon={<span>📊</span>}
          />
          <KpiCard
            label='MTTR Promedio'
            value={`${avgMTTR}h`}
            sub='Mean time to repair'
            color='#047857'
            icon={<span>🔧</span>}
          />
          <KpiCard
            label='Paro Acumulado'
            value={`${Math.round(totalDown / 60)}h`}
            sub={selectedAsset ? 'Paro total activo' : 'Total acumulado'}
            color='#b91c1c'
            icon={<span>⏱</span>}
          />
          <KpiCard
            label='% Correctivo'
            value={`${pct}%`}
            sub={`Prev: ${preventivos} · Corr: ${correctivos}`}
            color='#d97706'
            icon={<span>🔴</span>}
          />
        </div>

        <div className='report-main-charts mb-4 grid grid-cols-1 gap-4 xl:grid-cols-2'>
          <Card>
            <CardTitle>Cumplimiento PM — periodo filtrado (%)</CardTitle>
            <div
              data-report-chart-export='true'
              data-report-chart-id='pm-compliance'
              data-report-chart-title='Cumplimiento PM — periodo filtrado (%)'
            >
              <EChartsArea
                data={chartCompliance}
                dataKey='val'
                color='#486581'
                name='Cumplimiento %'
                height={210}
                yDomain={[0, 100]}
              />
            </div>
          </Card>
          <Card>
            <CardTitle>Horas de Paro por Mes</CardTitle>
            <div
              data-report-chart-export='true'
              data-report-chart-id='downtime-by-month'
              data-report-chart-title='Horas de Paro por Mes'
            >
              <EChartsBar
                data={chartDowntime}
                dataKey='hrs'
                color='#b91c1c'
                name='Horas paro'
                height={210}
              />
            </div>
          </Card>
        </div>

        <div className='report-bottom-grid mb-4 grid grid-cols-1 gap-4 xl:grid-cols-2'>
          <Card>
            <CardTitle>Ranking de Fallas por Activo</CardTitle>
            <DataTable head={['#', 'Activo', 'Fallas', 'Paro (h)']}>
              {dynamicTopFallas.length > 0 ? (
                dynamicTopFallas.map((failure, index) => (
                  <tr key={failure.asset}>
                    <Td mono>{index + 1}</Td>
                    <Td bold={index < 2}>{failure.asset}</Td>
                    <Td>
                      <span className='text-shDanger-700 font-mono font-bold'>
                        {failure.count}
                      </span>
                    </Td>
                    <Td>
                      <span className='text-shAccent-700 font-mono'>
                        {failure.down}
                      </span>
                    </Td>
                  </tr>
                ))
              ) : (
                <tr>
                  <Td>Sin datos</Td>
                  <Td>Sin fallas para los filtros aplicados</Td>
                  <Td>0</Td>
                  <Td>0</Td>
                </tr>
              )}
            </DataTable>
          </Card>
          <Card>
            <CardTitle>Preventivo vs. Correctivo</CardTitle>
            <div
              data-report-chart-export='true'
              data-report-chart-id='preventive-vs-corrective'
              data-report-chart-title='Preventivo vs. Correctivo'
            >
              <EChartsPie data={chartTipo} height={185} />
            </div>
            <div className='mt-3 flex flex-wrap justify-center gap-5'>
              {chartTipo.map((item) => (
                <div key={item.name} className='flex items-center gap-2'>
                  <div
                    className='h-2.5 w-2.5 rounded-sm'
                    style={{ background: item.color }}
                  />
                  <span className='text-shNeutral-600 text-sm'>
                    {item.name}:{' '}
                    <strong className='text-shNeutral-900'>{item.value}</strong>
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className='mb-4'>
          <div className='mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between'>
            <div>
              <CardTitle>Detalle del reporte</CardTitle>
              <p className='text-shNeutral-500 text-sm'>
                {activeFilterSummary}
              </p>
            </div>
            <span className='text-shNeutral-500 text-xs font-semibold'>
              {filteredWo.length} OTs · {filteredAssets.length} activos ·{' '}
              {filteredPlans.length} planes PM
            </span>
          </div>
          <div className='border-shNeutral-200 overflow-x-auto rounded-xl border'>
            <table className='w-full min-w-[980px] border-collapse bg-white text-sm'>
              <thead className='bg-shNeutral-50 text-shNeutral-600'>
                <tr>
                  {[
                    'Folio',
                    'Activo',
                    'Área',
                    'Tipo',
                    'Técnico',
                    'Estado',
                    'Prioridad',
                    'Fecha',
                    'Paro (h)',
                  ].map((heading) => (
                    <th
                      key={heading}
                      className='border-shNeutral-200 border-b px-4 py-3 text-left text-xs font-bold tracking-wide uppercase'
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {detailRows.length > 0 ? (
                  detailRows.map((workOrder) => {
                    const asset = getAssetById(workOrder.activoId);
                    return (
                      <tr
                        key={workOrder.id}
                        className='hover:bg-shNeutral-50 transition-colors'
                      >
                        <td className='border-shNeutral-100 text-shPrimary-800 border-b px-4 py-3 font-mono text-xs font-bold'>
                          {workOrder.folio}
                        </td>
                        <td className='border-shNeutral-100 text-shNeutral-900 border-b px-4 py-3'>
                          <div className='font-semibold'>
                            {asset?.code || workOrder.activoId}
                          </div>
                          <div className='text-shNeutral-500 text-xs'>
                            {asset?.name || 'Sin activo'}
                          </div>
                        </td>
                        <td className='border-shNeutral-100 text-shNeutral-600 border-b px-4 py-3'>
                          {asset?.area || '—'}
                        </td>
                        <td className='border-shNeutral-100 text-shNeutral-700 border-b px-4 py-3'>
                          {workOrder.tipo}
                        </td>
                        <td className='border-shNeutral-100 text-shNeutral-700 border-b px-4 py-3'>
                          {workOrder.tecnicoNombre}
                        </td>
                        <td className='border-shNeutral-100 border-b px-4 py-3'>
                          <SoftBadge
                            tone={getStatusBadgeClass(workOrder.status)}
                          >
                            {reportStatusLabel[workOrder.status]}
                          </SoftBadge>
                        </td>
                        <td className='border-shNeutral-100 border-b px-4 py-3'>
                          <SoftBadge
                            tone={getPriorityBadgeClass(workOrder.prioridad)}
                          >
                            {reportPriorityLabel[workOrder.prioridad]}
                          </SoftBadge>
                        </td>
                        <td className='border-shNeutral-100 text-shNeutral-600 border-b px-4 py-3'>
                          {formatDate(workOrder.fechaCreacion)}
                        </td>
                        <td className='border-shNeutral-100 text-shDanger-700 border-b px-4 py-3 font-mono font-bold'>
                          {Math.round((workOrder.downtimeMinutos / 60) * 10) /
                            10}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={9}
                      className='text-shNeutral-500 px-4 py-10 text-center'
                    >
                      Sin resultados para los filtros aplicados. Probá ampliar
                      el periodo o limpiar filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <style jsx global>{`
        .report-filter-control {
          height: 42px;
          width: 100%;
          border-radius: 0.625rem;
          border: 1px solid var(--color-shNeutral-200);
          background: var(--color-shNeutral-50);
          padding: 0 0.75rem;
          color: var(--color-shNeutral-900);
          font-size: 0.875rem;
          font-weight: 600;
          box-shadow: inset 0 1px 2px rgb(15 23 42 / 0.04);
          outline: none;
        }

        .report-filter-control:focus {
          border-color: var(--color-shAccent-500);
          box-shadow:
            0 0 0 3px rgb(245 158 11 / 0.18),
            inset 0 1px 2px rgb(15 23 42 / 0.04);
        }

        .print-only-date {
          display: none;
        }

        @media print {
          @page {
            size: A4 landscape;
            margin: 6mm;
          }

          html,
          body {
            background: #fff !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .no-print {
            display: none !important;
          }

          .app-topbar {
            display: none !important;
          }

          main.container {
            max-width: 100% !important;
            padding-top: 0 !important;
          }

          .report-print-root {
            padding: 0 !important;
            height: auto !important;
            overflow: visible !important;
          }

          .print-only-date {
            display: block;
            margin: 0 0 8px;
            font-size: 12px;
            color: #111827;
            font-weight: 600;
          }

          .report-kpi-grid {
            gap: 8px !important;
            margin-bottom: 10px !important;
          }

          .report-main-charts {
            gap: 10px !important;
            margin-bottom: 10px !important;
          }

          .report-bottom-grid {
            gap: 10px !important;
          }

          .report-main-charts .echarts-for-react {
            height: 180px !important;
          }

          .report-bottom-grid .echarts-for-react {
            height: 140px !important;
          }

          .report-print-root th,
          .report-print-root td {
            font-size: 10px !important;
            padding: 4px !important;
          }

          .report-print-root table,
          .report-print-root tr,
          .report-print-root td,
          .report-print-root th {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
