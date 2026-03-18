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
  NTC,
  NTL,
  NTI,
  assetComplianceData,
  assetDowntimeData,
  assetTipoData,
} from '@/app/data';

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

// ─── PLANS ────────────────────────────────────────────────────────────────────
export function PlansScreen() {
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState({});
  const [showCreate, setShowCreate] = useState(false);
  const toggle = (key) => setChecked((c) => ({ ...c, [key]: !c[key] }));

  if (selected) {
    const asset = ASSETS.find((a) => a.id === selected.assetId);
    const done = selected.items.filter(
      (_, i) => checked[selected.id + '-' + i],
    ).length;
    const pct = Math.round((done / selected.items.length) * 100);
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
              {selected.id}
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
              {selected.name}
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
              label={selected.activo ? 'Activo' : 'Inactivo'}
              color={selected.activo ? '#22c55e' : '#64748b'}
            />
            <Badge
              label={PRL[selected.prioridad]}
              color={PRC[selected.prioridad]}
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
              value={'Cada ' + selected.freq + ' ' + selected.unit}
            />
            <RowData
              label='Prioridad'
              value={
                <Badge
                  label={PRL[selected.prioridad]}
                  color={PRC[selected.prioridad]}
                />
              }
            />
            <RowData
              label='Duracion estimada'
              value={selected.duracion + ' horas'}
            />
            <RowData
              label='Total actividades'
              value={selected.items.length + ' items'}
            />
            <RowData
              label='Estado'
              value={
                <Badge
                  label={selected.activo ? 'Activo' : 'Inactivo'}
                  color={selected.activo ? '#22c55e' : '#64748b'}
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
            {selected.items.map((item, i) => {
              const k = selected.id + '-' + i;
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
        sub={PLANS.length + ' planes configurados'}
        action={
          <BtnPrimary onClick={() => setShowCreate(true)}>
            + Nuevo Plan
          </BtnPrimary>
        }
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
          {PLANS.map((p) => {
            const asset = ASSETS.find((a) => a.id === p.assetId);
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
                  <Badge label={PRL[p.prioridad]} color={PRC[p.prioridad]} />
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
          onClose={() => setShowCreate(false)}
        >
          <Field label='Nombre del Plan'>
            <input placeholder='Ej: PM Semanal - Bomba #3' />
          </Field>
          <Field label='Activo Asociado'>
            <select>
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
              <input type='number' defaultValue={1} />
            </Field>
            <Field label='Unidad'>
              <select>
                <option>dias</option>
                <option>semanas</option>
                <option>meses</option>
                <option>anios</option>
                <option>horas</option>
              </select>
            </Field>
          </div>
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}
          >
            <Field label='Duracion estimada (h)'>
              <input type='number' defaultValue={2} />
            </Field>
            <Field label='Prioridad'>
              <select>
                <option>baja</option>
                <option>media</option>
                <option>alta</option>
                <option>critico</option>
              </select>
            </Field>
          </div>
          <ModalFooter
            onCancel={() => setShowCreate(false)}
            onConfirm={() => setShowCreate(false)}
            confirmLabel='Crear Plan'
          />
        </Modal>
      )}
    </div>
  );
}

// ─── WORK ORDERS ──────────────────────────────────────────────────────────────
export function WorkOrdersScreen({ wo, setWo }) {
  const [selected, setSelected] = useState(null);
  const [filterStatus, setFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const statusCounts = {};
  wo.forEach((w) => {
    statusCounts[w.status] = (statusCounts[w.status] || 0) + 1;
  });
  const filtered = wo.filter((w) => !filterStatus || w.status === filterStatus);

  const changeStatus = (id, s) => {
    setWo((prev) => prev.map((w) => (w.id === id ? { ...w, status: s } : w)));
  };

  if (selected) {
    const asset = ASSETS.find((a) => a.id === selected.assetId);
    const curWo = wo.find((w) => w.id === selected.id) || selected;
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
                letterSpacing: '0.05em',
              }}
            >
              {curWo.folio}
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
              {curWo.titulo}
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
            <Badge label={STL[curWo.status]} color={STC[curWo.status]} />
            <Badge label={PRL[curWo.prioridad]} color={PRC[curWo.prioridad]} />
            <Badge
              label={curWo.tipo === 'preventivo' ? 'Preventivo' : 'Correctivo'}
              color={curWo.tipo === 'preventivo' ? '#3b82f6' : '#ef4444'}
            />
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
            marginBottom: 16,
          }}
        >
          <Card>
            <CardTitle>Datos de la Orden</CardTitle>
            <RowData label='Asignado a' value={curWo.asignado} />
            <RowData label='Fecha de creacion' value={curWo.fechaCreacion} />
            <RowData label='Fecha de vencimiento' value={curWo.fechaVen} />
            <RowData label='Fecha de cierre' value={curWo.fechaCierre || '—'} />
            <RowData
              label='Tiempo de paro'
              value={curWo.downtime ? curWo.downtime + ' min' : '0 min'}
            />
          </Card>
          <Card>
            <CardTitle>Observaciones y Analisis</CardTitle>
            {curWo.obs && (
              <div style={{ marginBottom: 14 }}>
                <div
                  style={{
                    fontSize: 11,
                    color: '#64748b',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: 5,
                  }}
                >
                  Observaciones
                </div>
                <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6 }}>
                  {curWo.obs}
                </p>
              </div>
            )}
            {curWo.causa && (
              <div style={{ marginBottom: 14 }}>
                <div
                  style={{
                    fontSize: 11,
                    color: '#64748b',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: 5,
                  }}
                >
                  Causa Raiz
                </div>
                <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6 }}>
                  {curWo.causa}
                </p>
              </div>
            )}
            {curWo.accion && (
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: '#64748b',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: 5,
                  }}
                >
                  Accion Tomada
                </div>
                <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6 }}>
                  {curWo.accion}
                </p>
              </div>
            )}
            {!curWo.obs && !curWo.causa && !curWo.accion && (
              <p style={{ fontSize: 13, color: '#475569' }}>
                Sin observaciones registradas.
              </p>
            )}
          </Card>
        </div>

        <Card>
          <CardTitle>Cambiar Estado de la OT</CardTitle>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              'pendiente',
              'asignado',
              'en_progreso',
              'pausado',
              'completado',
              'cancelado',
            ].map((s) => (
              <button
                key={s}
                onClick={() => changeStatus(curWo.id, s)}
                style={{
                  background: curWo.status === s ? STC[s] + '33' : '#060e20',
                  border: `1.5px solid ${curWo.status === s ? STC[s] : '#1e3a5f'}`,
                  color: curWo.status === s ? STC[s] : '#64748b',
                  fontSize: 12,
                  fontWeight: 700,
                  padding: '7px 16px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  fontFamily: 'inherit',
                }}
              >
                {STL[s]}
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

      <div
        style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}
      >
        <button
          onClick={() => setFilter('')}
          style={{
            background: !filterStatus ? '#f59e0b22' : '#0d1627',
            border: `1.5px solid ${!filterStatus ? '#f59e0b' : '#1e3a5f'}`,
            color: !filterStatus ? '#f59e0b' : '#64748b',
            fontSize: 12,
            fontWeight: 700,
            padding: '6px 14px',
            borderRadius: 5,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Todas ({wo.length})
        </button>
        {Object.entries(statusCounts).map(([s, n]) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              background: filterStatus === s ? STC[s] + '22' : '#0d1627',
              border: `1.5px solid ${filterStatus === s ? STC[s] : '#1e3a5f'}`,
              color: filterStatus === s ? STC[s] : '#64748b',
              fontSize: 12,
              fontWeight: 700,
              padding: '6px 14px',
              borderRadius: 5,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {STL[s]} ({n})
          </button>
        ))}
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
              style={{ cursor: 'pointer' }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = '#0f2040')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = 'transparent')
              }
            >
              <Td mono>{w.folio}</Td>
              <Td bold>{w.titulo}</Td>
              <Td>
                <Badge
                  label={w.tipo === 'preventivo' ? 'Preventivo' : 'Correctivo'}
                  color={w.tipo === 'preventivo' ? '#3b82f6' : '#ef4444'}
                />
              </Td>
              <Td>{w.asignado}</Td>
              <Td mono>{w.fechaVen}</Td>
              <Td>
                <Badge label={PRL[w.prioridad]} color={PRC[w.prioridad]} />
              </Td>
              <Td>
                <Badge label={STL[w.status]} color={STC[w.status]} />
              </Td>
              <Td>
                <BtnGhost onClick={() => setSelected(w)}>Ver detalle</BtnGhost>
              </Td>
            </tr>
          ))}
        </DataTable>
      </Card>

      {showCreate && (
        <Modal
          title='Nueva Orden de Trabajo'
          onClose={() => setShowCreate(false)}
        >
          <Field label='Titulo de la Orden'>
            <input placeholder='Ej: Revision preventiva bomba #3' />
          </Field>
          <Field label='Activo'>
            <select>
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
              <select>
                <option>preventivo</option>
                <option>correctivo</option>
              </select>
            </Field>
            <Field label='Prioridad'>
              <select>
                <option>baja</option>
                <option>media</option>
                <option>alta</option>
                <option>critico</option>
              </select>
            </Field>
          </div>
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}
          >
            <Field label='Asignado a'>
              <select>
                <option>Carlos Mendez</option>
                <option>Luis Ramirez</option>
                <option>Maria Gonzalez</option>
                <option>Pedro Sanchez</option>
              </select>
            </Field>
            <Field label='Fecha de Vencimiento'>
              <input type='date' />
            </Field>
          </div>
          <Field label='Observaciones'>
            <textarea placeholder='Describe el trabajo a realizar...' />
          </Field>
          <ModalFooter
            onCancel={() => setShowCreate(false)}
            onConfirm={() => setShowCreate(false)}
            confirmLabel='Crear OT'
          />
        </Modal>
      )}
    </div>
  );
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
export function NotificationsScreen({ notifs, setNotifs }) {
  const unread = notifs.filter((n) => !n.leida).length;
  const markRead = (id) =>
    setNotifs((ns) => ns.map((n) => (n.id === id ? { ...n, leida: true } : n)));
  const markAll = () =>
    setNotifs((ns) => ns.map((n) => ({ ...n, leida: true })));

  return (
    <div style={{ padding: '28px', overflowY: 'auto', height: '100%' }}>
      <PageHeader
        title='Notificaciones'
        sub={unread > 0 ? unread + ' sin leer' : 'Todo al dia ✓'}
        action={
          unread > 0 ? (
            <BtnGhost onClick={markAll}>Marcar todas como leidas</BtnGhost>
          ) : null
        }
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          maxWidth: 860,
        }}
      >
        {notifs.map((n) => (
          <div
            key={n.id}
            onClick={() => markRead(n.id)}
            style={{
              background: '#0d1627',
              border: `1px solid ${n.leida ? '#1e3a5f' : NTC[n.tipo] + '55'}`,
              borderLeft: `4px solid ${n.leida ? '#1e3a5f44' : NTC[n.tipo]}`,
              borderRadius: 8,
              padding: '16px 22px',
              cursor: 'pointer',
              opacity: n.leida ? 0.5 : 1,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!n.leida) e.currentTarget.style.background = '#0f2040';
            }}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#0d1627')}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}
              >
                <span style={{ fontSize: 20, lineHeight: 1, marginTop: 1 }}>
                  {NTI[n.tipo]}
                </span>
                <div>
                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      alignItems: 'center',
                      marginBottom: 5,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: n.leida ? '#94a3b8' : '#f1f5f9',
                      }}
                    >
                      {n.titulo}
                    </span>
                    {!n.leida && (
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          background: NTC[n.tipo],
                          borderRadius: '50%',
                          display: 'inline-block',
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </div>
                  <p
                    style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}
                  >
                    {n.msg}
                  </p>
                </div>
              </div>
              <div
                style={{ textAlign: 'right', flexShrink: 0, marginLeft: 20 }}
              >
                <Badge label={NTL[n.tipo]} color={NTC[n.tipo]} />
                <div
                  style={{
                    fontSize: 11,
                    color: '#475569',
                    marginTop: 6,
                    fontFamily: 'monospace',
                  }}
                >
                  {n.fecha}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── REPORTS ──────────────────────────────────────────────────────────────────
export function ReportsScreen({ wo }) {
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [showPicker, setShowPicker] = useState(false);

  const quickOptions = [
    {
      label: 'Este mes',
      getValue: () => ({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
      }),
    },
    {
      label: 'Últimos 3 meses',
      getValue: () => ({
        from: subMonths(new Date(), 2),
        to: new Date(),
      }),
    },
    {
      label: 'Últimos 6 meses',
      getValue: () => ({
        from: subMonths(new Date(), 5),
        to: new Date(),
      }),
    },
  ];

  // --- Cálculos Dinámicos de Histórico (6 meses) ---
  const last6Months = eachMonthOfInterval({
    start: subMonths(startOfMonth(new Date()), 5),
    end: endOfMonth(new Date()),
  });

  const historyData = last6Months.map((month) => {
    const monthWO = wo.filter((w) => {
      const wDate = new Date(w.fechaCreacion);
      const sameAsset = !selectedAsset || w.assetId === selectedAsset;
      return sameAsset && isSameMonth(wDate, month);
    });

    const completed = monthWO.filter((w) => w.status === 'completado').length;
    const totalFinished = monthWO.filter((w) =>
      ['completado', 'vencido', 'cancelado'].includes(w.status),
    ).length;

    return {
      mes: format(month, 'MMM', { locale: es }),
      compliance:
        totalFinished > 0 ? Math.round((completed / totalFinished) * 100) : 0,
      downtime: monthWO.reduce((s, w) => s + (w.downtime || 0), 0) / 60, // horas
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

  // --- Cálculos Dinámicos del Filtro Actual ---
  const filteredWo = wo.filter((w) => {
    if (selectedAsset && w.assetId !== selectedAsset) return false;
    if (!dateRange || !dateRange.from || !dateRange.to) return true;
    const woDate = new Date(w.fechaCreacion);
    return woDate >= dateRange.from && woDate <= dateRange.to;
  });

  const totalDown = filteredWo.reduce((s, w) => s + (w.downtime || 0), 0);
  const correctivos = filteredWo.filter((w) => w.tipo === 'correctivo').length;
  const preventivos = filteredWo.filter((w) => w.tipo === 'preventivo').length;
  const pct =
    filteredWo.length > 0
      ? Math.round((correctivos / filteredWo.length) * 100)
      : 0;

  // MTTR Dinámico (Mean Time To Repair)
  const avgMTTR =
    correctivos > 0 ? Math.round((totalDown / 60 / correctivos) * 10) / 10 : 0;

  const completed = filteredWo.filter((w) => w.status === 'completado').length;
  const total = filteredWo.filter((w) =>
    ['completado', 'vencido', 'cancelado'].includes(w.status),
  ).length;
  const compliancePct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const chartTipo = [
    { name: 'Preventivo', value: preventivos, color: '#3b82f6' },
    { name: 'Correctivo', value: correctivos, color: '#ef4444' },
  ];

  // Ranking de Fallas Dinámico
  const assetGroups = filteredWo
    .filter((w) => w.tipo === 'correctivo')
    .reduce((acc, w) => {
      if (!acc[w.assetId]) {
        acc[w.assetId] = { count: 0, down: 0, id: w.assetId };
      }
      acc[w.assetId].count += 1;
      acc[w.assetId].down += w.downtime || 0;
      return acc;
    }, {});

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

  return (
    <div style={{ padding: '28px', overflowY: 'auto', height: '100%' }}>
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
        }
      />

      <div
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
              border: '1px solid #e2e8f0',
              background: '#fff',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
              color: '#475569',
            }}
          >
            {opt.label}
          </button>
        ))}
        <button
          onClick={() => setShowPicker(!showPicker)}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid #e2e8f0',
            background: '#fff',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 500,
            color: '#475569',
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
              background: '#fff',
              borderRadius: 8,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              padding: 16,
            }}
          >
            <DayPicker
              mode='range'
              selected={dateRange}
              onSelect={setDateRange}
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

      <div
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
              ? 'Basado en histórico del activo'
              : 'Meta: 90% · General'
          }
          color='#3b82f6'
          icon='📊'
        />
        <KpiCard
          label='MTTR Promedio'
          value={avgMTTR + 'h'}
          sub='Mean time to repair'
          color='#22c55e'
          icon='🔧'
        />
        <KpiCard
          label='Paro Acumulado'
          value={Math.round(totalDown / 60) + 'h'}
          sub={selectedAsset ? 'Paro total activo' : 'Total acumulado'}
          color='#ef4444'
          icon='⏱'
        />
        <KpiCard
          label='% Correctivo'
          value={pct + '%'}
          sub={`Prev: ${preventivos} · Corr: ${correctivos}`}
          color='#f97316'
          icon='🔴'
        />
      </div>

      <div
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
          <Card></Card>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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
                    <span style={{ fontFamily: 'monospace', color: '#f97316' }}>
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
  );
}
