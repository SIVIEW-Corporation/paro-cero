'use client';

import React, { useState } from 'react';
import {
  format,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
  isSameMonth,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';

import { EChartsArea, EChartsBar, EChartsPie } from '@/components/charts';

import {
  ASSETS,
  PLANS,
  STC,
  STL,
  PRC,
  PRL,
  CRC,
  NTL,
  NTI,
  assetComplianceData,
  assetDowntimeData,
  assetTipoData,
} from '@/app/data';
import { TECNICOS } from '@/app/data/constants';
import { generarDatosSeisMeses } from '@/app/data/mock-data';
import { useWorkOrdersStore } from '@/app/stores/useWorkOrdersStore';

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

import type { OrdenTrabajo } from '@/app/data/types';

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

  const inputStyle: React.CSSProperties = {
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
  setWo: React.Dispatch<React.SetStateAction<OrdenTrabajo[]>>;
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
                <div
                  className='flex flex-row flex-wrap items-center gap-2 sm:ml-5 sm:flex-col sm:items-end sm:text-right'
                >
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

export function ReportsScreen({ wo }: { wo: OrdenTrabajo[] }) {
  const setOrdenes = useWorkOrdersStore((state) => state.setOrdenes);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [showPicker, setShowPicker] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const closedStatuses: OrdenTrabajo['status'][] = [
    'completada',
    'cerrada',
    'cancelada',
  ];

  const quickOptions = [
    {
      label: 'Este mes',
      getValue: () => ({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
      }),
    },
    {
      label: 'Ultimos 3 meses',
      getValue: () => ({
        from: subMonths(new Date(), 2),
        to: new Date(),
      }),
    },
    {
      label: 'Ultimos 6 meses',
      getValue: () => ({
        from: subMonths(new Date(), 5),
        to: new Date(),
      }),
    },
  ];

  const last6Months = eachMonthOfInterval({
    start: subMonths(startOfMonth(new Date()), 5),
    end: endOfMonth(new Date()),
  });

  const historyData = last6Months.map((month) => {
    const monthWO = wo.filter((w) => {
      const wDate =
        w.fechaCreacion instanceof Date
          ? w.fechaCreacion
          : new Date(w.fechaCreacion);
      const sameAsset = !selectedAsset || w.activoId === selectedAsset;
      return sameAsset && isSameMonth(wDate, month);
    });

    const completed = monthWO.filter((w) => w.status === 'completada').length;
    const totalFinished = monthWO.filter((w) =>
      closedStatuses.includes(w.status),
    ).length;

    return {
      mes: format(month, 'MMM', { locale: es }),
      compliance:
        totalFinished > 0 ? Math.round((completed / totalFinished) * 100) : 0,
      downtime: monthWO.reduce((s, w) => s + (w.downtimeMinutos || 0), 0) / 60,
    };
  });

  const chartCompliance = historyData.map((d) => ({
    mes: d.mes,
    val: d.compliance,
  }));
  const chartDowntime = historyData.map((d) => ({
    mes: d.mes,
    hrs: Math.round(d.downtime * 10) / 10,
  }));

  const filteredWo = wo.filter((w) => {
    if (selectedAsset && w.activoId !== selectedAsset) return false;
    if (!dateRange || !dateRange.from || !dateRange.to) return true;
    const woDate =
      w.fechaCreacion instanceof Date
        ? w.fechaCreacion
        : new Date(w.fechaCreacion);
    return woDate >= dateRange.from && woDate <= dateRange.to;
  });

  const totalDown = filteredWo.reduce(
    (s, w) => s + (w.downtimeMinutos || 0),
    0,
  );
  const correctivos = filteredWo.filter((w) => w.tipo === 'correctivo').length;
  const preventivos = filteredWo.filter((w) => w.tipo === 'preventivo').length;
  const pct =
    filteredWo.length > 0
      ? Math.round((correctivos / filteredWo.length) * 100)
      : 0;

  const avgMTTR =
    correctivos > 0 ? Math.round((totalDown / 60 / correctivos) * 10) / 10 : 0;

  const completed = filteredWo.filter((w) => w.status === 'completada').length;
  const total = filteredWo.filter((w) =>
    closedStatuses.includes(w.status),
  ).length;
  const compliancePct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const chartTipo = [
    { name: 'Preventivo', value: preventivos, color: '#3b82f6' },
    { name: 'Correctivo', value: correctivos, color: '#ef4444' },
  ];

  const assetGroups = filteredWo
    .filter((w) => w.tipo === 'correctivo')
    .reduce(
      (acc, w) => {
        if (!acc[w.activoId]) {
          acc[w.activoId] = { count: 0, down: 0, id: w.activoId };
        }
        acc[w.activoId].count += 1;
        acc[w.activoId].down += w.downtimeMinutos || 0;
        return acc;
      },
      {} as Record<string, { count: number; down: number; id: string }>,
    );

  const dynamicTopFallas = Object.values(assetGroups)
    .map((g) => ({
      asset: ASSETS.find((a) => a.id === g.id)?.name || 'Desconocido',
      count: g.count,
      down: Math.round(g.down / 60),
    }))
    .sort((a, b) => b.count - a.count);

  const selectedAssetName = selectedAsset
    ? ASSETS.find((a) => a.id === selectedAsset)?.name
    : null;
  const printDateLabel =
    dateRange?.from && dateRange?.to
      ? `${format(dateRange.from, 'dd MMM yyyy', { locale: es })} - ${format(dateRange.to, 'dd MMM yyyy', { locale: es })}`
      : format(new Date(), 'dd MMM yyyy', { locale: es });

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

  const exportCsv = () => {
    const headers = [
      'id',
      'folio',
      'activo_id',
      'activo_nombre',
      'tipo',
      'status',
      'prioridad',
      'tecnico',
      'fecha_creacion',
      'fecha_compromiso',
      'fecha_cierre',
      'downtime_minutos',
      'gasto_dinero',
      'monto_gastado',
      'uso_refaccion_consumible',
      'refaccion_consumible_detalle',
      'titulo',
      'descripcion',
      'descripcion_problema',
      'descripcion_servicio',
    ];

    const escapeCsv = (value: string | number) => {
      const stringValue = String(value ?? '');
      if (
        stringValue.includes(',') ||
        stringValue.includes('"') ||
        stringValue.includes('\n')
      ) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const rows = filteredWo.map((item) => {
      const activoNombre =
        ASSETS.find((a) => a.id === item.activoId)?.name || '';
      return [
        item.id,
        item.folio,
        item.activoId,
        activoNombre,
        item.tipo,
        item.status,
        item.prioridad,
        item.tecnicoNombre,
        format(new Date(item.fechaCreacion), 'yyyy-MM-dd'),
        format(new Date(item.fechaCompromiso), 'yyyy-MM-dd'),
        item.fechaCierre
          ? format(new Date(item.fechaCierre), 'yyyy-MM-dd')
          : '',
        item.downtimeMinutos || 0,
        item.gastoDinero ? 'si' : 'no',
        item.montoGastado || 0,
        item.usoRefaccionConsumible ? 'si' : 'no',
        item.refaccionConsumibleDetalle || '',
        item.titulo,
        item.descripcion,
        item.descripcionProblema || item.observaciones || '',
        item.descripcionServicio || '',
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => escapeCsv(cell)).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-kpis-${format(new Date(), 'yyyyMMdd-HHmm')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const exportPdfEjecutivo = () => {
    const periodLabel =
      dateRange?.from && dateRange?.to
        ? `${format(dateRange.from, 'dd MMM yyyy', { locale: es })} - ${format(dateRange.to, 'dd MMM yyyy', { locale: es })}`
        : 'Periodo general';
    const topRows = (
      selectedAsset
        ? [
            {
              asset: selectedAssetName || 'Activo seleccionado',
              count: correctivos,
              down: Math.round(totalDown / 60),
            },
          ]
        : dynamicTopFallas
    )
      .slice(0, 10)
      .map(
        (row, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${row.asset}</td>
            <td>${row.count}</td>
            <td>${row.down}</td>
          </tr>
        `,
      )
      .join('');

    const reportHtml = `
      <!doctype html>
      <html lang="es">
        <head>
          <meta charset="utf-8" />
          <title>Reporte Ejecutivo</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 28px; color: #0f172a; }
            h1 { margin: 0 0 8px; font-size: 22px; }
            .meta { color: #334155; margin-bottom: 18px; font-size: 13px; }
            .kpis { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px; }
            .kpi { border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px 12px; }
            .kpi .label { font-size: 12px; color: #475569; }
            .kpi .value { font-size: 20px; font-weight: 700; margin-top: 2px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; font-size: 12px; }
            th { background: #f1f5f9; }
          </style>
        </head>
        <body>
          <h1>Reporte Ejecutivo de Mantenimiento</h1>
          <div class="meta">
            Activo: ${selectedAssetName || 'Todos'}<br />
            Periodo: ${periodLabel}<br />
            Generado: ${format(new Date(), 'dd MMM yyyy HH:mm', { locale: es })}
          </div>

          <div class="kpis">
            <div class="kpi"><div class="label">Cumplimiento PM</div><div class="value">${compliancePct}%</div></div>
            <div class="kpi"><div class="label">MTTR Promedio</div><div class="value">${avgMTTR} h</div></div>
            <div class="kpi"><div class="label">Paro Acumulado</div><div class="value">${Math.round(totalDown / 60)} h</div></div>
            <div class="kpi"><div class="label">% Correctivo</div><div class="value">${pct}%</div></div>
          </div>

          <h2 style="margin: 0 0 8px; font-size: 16px;">Top fallas por activo</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Activo</th>
                <th>Fallas</th>
                <th>Paro (h)</th>
              </tr>
            </thead>
            <tbody>
              ${topRows || '<tr><td colspan="4">Sin datos para el periodo seleccionado</td></tr>'}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=1100,height=900');
    if (!printWindow) {
      alert('No se pudo abrir la ventana de impresión.');
      return;
    }

    printWindow.document.open();
    printWindow.document.write(reportHtml);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    setShowExportMenu(false);
  };

  const exportPdfVistaCompleta = () => {
    setShowExportMenu(false);
    window.dispatchEvent(new Event('resize'));
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 120);
    }, 260);
  };

  return (
    <div
      className='report-print-root'
      style={{ padding: '28px', overflowY: 'auto', height: '100%' }}
    >
      <div className='no-print'>
        <PageHeader
          title='Reportes y KPIs'
          sub={
            selectedAsset
              ? `Activo: ${selectedAssetName}`
              : dateRange?.from && dateRange?.to
                ? `${format(dateRange.from, 'dd MMM yyyy', { locale: es })} - ${format(dateRange.to, 'dd MMM yyyy', { locale: es })}`
                : 'Indicadores de desempeño'
          }
          action={
            <div
              className='no-print'
              style={{ display: 'flex', gap: 8, alignItems: 'center' }}
            >
              <select
                value={selectedAsset || ''}
                onChange={(e) => setSelectedAsset(e.target.value || null)}
                style={{ minWidth: 220 }}
              >
                <option value=''>Todos los activos</option>
                {ASSETS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.code} — {a.name}
                  </option>
                ))}
              </select>

              <div style={{ position: 'relative' }}>
                <BtnGhost onClick={() => setShowExportMenu((prev) => !prev)}>
                  Exportar reporte ▾
                </BtnGhost>

                {showExportMenu && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 6px)',
                      minWidth: 240,
                      background: '#0d1627',
                      border: '1px solid #1e3a5f',
                      borderRadius: 8,
                      boxShadow: '0 10px 24px rgba(0,0,0,0.35)',
                      padding: 6,
                      zIndex: 80,
                    }}
                  >
                    <button
                      onClick={exportPdfVistaCompleta}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        background: 'transparent',
                        border: 'none',
                        color: '#e2e8f0',
                        padding: '9px 10px',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontSize: 13,
                      }}
                    >
                      Exportar PDF vista completa
                    </button>
                    <button
                      onClick={exportPdfEjecutivo}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        background: 'transparent',
                        border: 'none',
                        color: '#e2e8f0',
                        padding: '9px 10px',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontSize: 13,
                      }}
                    >
                      Exportar PDF ejecutivo
                    </button>
                    <button
                      onClick={exportCsv}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        background: 'transparent',
                        border: 'none',
                        color: '#e2e8f0',
                        padding: '9px 10px',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontSize: 13,
                      }}
                    >
                      Exportar CSV base de datos
                    </button>
                  </div>
                )}
              </div>
            </div>
          }
        />
      </div>

      <div className='print-only-date'>Fecha: {printDateLabel}</div>

      <div
        className='no-print'
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 20,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        {quickOptions.map((opt) => (
          <button
            key={opt.label}
            onClick={() => setDateRange(opt.getValue())}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid #1e3a5f',
              background: '#0d1627',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
              color: '#94a3b8',
            }}
          >
            {opt.label}
          </button>
        ))}
        <BtnGhost onClick={regenerateDemoData}>Regenerar datos demo</BtnGhost>
        <button
          onClick={() => setShowPicker(!showPicker)}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid #1e3a5f',
            background: '#0d1627',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 500,
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          📅{' '}
          {dateRange?.from && dateRange?.to
            ? `${format(dateRange.from, 'dd MMM')} - ${format(dateRange.to, 'dd MMM yyyy')}`
            : 'Personalizado'}
        </button>
        {showPicker && (
          <div
            style={{
              position: 'absolute',
              zIndex: 50,
              marginTop: 8,
              background: '#0d1627',
              borderRadius: 8,
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              padding: 16,
              border: '1px solid #1e3a5f',
            }}
          >
            <DayPicker
              mode='range'
              selected={dateRange}
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  setDateRange({ from: range.from, to: range.to });
                }
              }}
              locale={es}
              footer={
                <button
                  onClick={() => setShowPicker(false)}
                  style={{
                    marginTop: 8,
                    padding: '4px 12px',
                    background: '#3b82f6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 12,
                  }}
                >
                  Aplicar
                </button>
              }
            />
          </div>
        )}
      </div>

      <div className='print-content'>
        <div
          className='report-kpi-grid'
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4,1fr)',
            gap: 14,
            marginBottom: 24,
          }}
        >
          <KpiCard
            label='Cumplimiento PM'
            value={compliancePct + '%'}
            sub={
              selectedAsset
                ? 'Basado en historico del activo'
                : 'Meta: 90% · General'
            }
            color='#3b82f6'
            icon={<span>📊</span>}
          />
          <KpiCard
            label='MTTR Promedio'
            value={avgMTTR + 'h'}
            sub='Mean time to repair'
            color='#22c55e'
            icon={<span>🔧</span>}
          />
          <KpiCard
            label='Paro Acumulado'
            value={Math.round(totalDown / 60) + 'h'}
            sub={selectedAsset ? 'Paro total activo' : 'Total acumulado'}
            color='#ef4444'
            icon={<span>⏱</span>}
          />
          <KpiCard
            label='% Correctivo'
            value={pct + '%'}
            sub={`Prev: ${preventivos} · Corr: ${correctivos}`}
            color='#f97316'
            icon={<span>🔴</span>}
          />
        </div>

        <div
          className='report-main-charts'
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
            marginBottom: 16,
          }}
        >
          <Card>
            <CardTitle>Cumplimiento PM — Ultimos 6 Meses (%)</CardTitle>
            <EChartsArea
              data={chartCompliance}
              dataKey='val'
              color='#3b82f6'
              name='Cumplimiento %'
              height={210}
              yDomain={[0, 100]}
            />
          </Card>
          <Card>
            <CardTitle>Horas de Paro por Mes</CardTitle>
            <EChartsBar
              data={chartDowntime}
              dataKey='hrs'
              color='#ef4444'
              name='Horas paro'
              height={210}
            />
          </Card>
        </div>

        <div
          className='report-bottom-grid'
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}
        >
          <Card>
            <CardTitle>Ranking de Fallas por Activo</CardTitle>
            <DataTable head={['#', 'Activo', 'Fallas', 'Paro (h)']}>
              {selectedAsset ? (
                <tr>
                  <Td mono>1</Td>
                  <Td bold>{selectedAssetName}</Td>
                  <Td>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        color: '#ef4444',
                      }}
                    >
                      {correctivos}
                    </span>
                  </Td>
                  <Td>
                    <span style={{ fontFamily: 'monospace', color: '#f97316' }}>
                      {Math.round(totalDown / 60)}
                    </span>
                  </Td>
                </tr>
              ) : (
                dynamicTopFallas.map((f, i) => (
                  <tr key={i}>
                    <Td mono>{i + 1}</Td>
                    <Td bold={i < 2}>{f.asset}</Td>
                    <Td>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          color: '#ef4444',
                        }}
                      >
                        {f.count}
                      </span>
                    </Td>
                    <Td>
                      <span
                        style={{ fontFamily: 'monospace', color: '#f97316' }}
                      >
                        {f.down}
                      </span>
                    </Td>
                  </tr>
                ))
              )}
            </DataTable>
          </Card>
          <Card>
            <CardTitle>Preventivo vs. Correctivo</CardTitle>
            <EChartsPie data={chartTipo} height={185} />
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 28,
                marginTop: 10,
              }}
            >
              {chartTipo.map((d) => (
                <div
                  key={d.name}
                  style={{ display: 'flex', alignItems: 'center', gap: 7 }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      background: d.color,
                      borderRadius: 3,
                    }}
                  />
                  <span style={{ fontSize: 13, color: '#94a3b8' }}>
                    {d.name}:{' '}
                    <strong style={{ color: '#e2e8f0' }}>{d.value}</strong>
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <style jsx global>{`
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
