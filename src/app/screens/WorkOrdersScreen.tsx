'use client';

import { useState, useMemo } from 'react';
import type {
  OrdenTrabajo,
  EstadoOT,
  PrioridadOT,
  TipoOT,
  Activo,
  Evidencia,
  FiltrosOT,
} from '../data/types';
import { ASSETS } from '../data/mock-data';
import {
  STC,
  STL,
  PRC,
  PRL,
  TECNICOS,
  ESTADOS_OT,
  PRIORIDADES,
  TIPOS_OT,
} from '../data/constants';
import { useWorkOrdersStore } from '../stores/useWorkOrdersStore';
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
} from '../components/ui';

function formatDate(date: Date | string | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-MX');
}

export function WorkOrdersScreen() {
  const {
    ordenes,
    filtros,
    addOrden,
    updateOrden,
    changeStatus,
    setFiltros,
    clearFiltros,
    getFilteredOrdenes,
  } = useWorkOrdersStore();

  const [selected, setSelected] = useState<OrdenTrabajo | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  // Estado para formulario de nueva OT
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    activoId: '',
    tipo: 'preventivo' as TipoOT,
    prioridad: 'media' as PrioridadOT,
    tecnicoId: '',
    fechaCompromiso: '',
    fechaCierre: '',
    downtimeMinutos: '',
    descripcionProblema: '',
    descripcionServicio: '',
    gastoDinero: false,
    montoGastado: '',
    usoRefaccionConsumible: false,
    refaccionConsumibleDetalle: '',
  });

  const filteredOrdenes = getFilteredOrdenes();

  // KPIs
  const stats = useMemo(() => {
    const total = ordenes.length;
    const pendientes = ordenes.filter(
      (o) => o.status === 'nueva' || o.status === 'asignada',
    ).length;
    const enProceso = ordenes.filter((o) => o.status === 'en_proceso').length;
    const completadas = ordenes.filter((o) => o.status === 'completada').length;
    const cerradas = ordenes.filter((o) => o.status === 'cerrada').length;
    return { total, pendientes, enProceso, completadas, cerradas };
  }, [ordenes]);

  const handleCreateOrden = () => {
    if (!formData.titulo || !formData.activoId || !formData.tecnicoId) {
      alert('Por favor completa los campos requeridos');
      return;
    }

    const now = new Date();
    const downtimeMinutos = Number(formData.downtimeMinutos || '0');
    if (Number.isNaN(downtimeMinutos) || downtimeMinutos < 0) {
      alert('El tiempo de paro debe ser 0 o mayor');
      return;
    }

    const montoGastado = formData.gastoDinero
      ? Number(formData.montoGastado)
      : 0;
    if (
      formData.gastoDinero &&
      (Number.isNaN(montoGastado) || montoGastado <= 0)
    ) {
      alert('Si se gastó dinero, captura un monto mayor a 0');
      return;
    }

    const refaccionConsumibleDetalle =
      formData.refaccionConsumibleDetalle.trim();
    if (formData.usoRefaccionConsumible && !refaccionConsumibleDetalle) {
      alert('Detalla qué refacción o consumible se usó');
      return;
    }

    addOrden({
      empresaId: 'EMP001',
      activoId: formData.activoId,
      titulo: formData.titulo,
      descripcion: formData.descripcion,
      tipo: formData.tipo,
      status: 'nueva',
      prioridad: formData.prioridad,
      tecnicoId: formData.tecnicoId,
      tecnicoNombre:
        TECNICOS.find((t) => t.id === formData.tecnicoId)?.nombre || '',
      fechaCreacion: now,
      fechaCompromiso: new Date(formData.fechaCompromiso || now),
      fechaCierre: formData.fechaCierre
        ? new Date(`${formData.fechaCierre}T00:00:00`)
        : undefined,
      descripcionProblema: formData.descripcionProblema,
      descripcionServicio: formData.descripcionServicio,
      observaciones: formData.descripcionProblema,
      gastoDinero: formData.gastoDinero,
      montoGastado,
      usoRefaccionConsumible: formData.usoRefaccionConsumible,
      refaccionConsumibleDetalle: formData.usoRefaccionConsumible
        ? refaccionConsumibleDetalle
        : '',
      evidencias: [],
      downtimeMinutos,
    });

    setShowCreate(false);
    setFormData({
      titulo: '',
      descripcion: '',
      activoId: '',
      tipo: 'preventivo',
      prioridad: 'media',
      tecnicoId: '',
      fechaCompromiso: '',
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

  const handleStatusChange = (id: string, newStatus: EstadoOT) => {
    changeStatus(id, newStatus, 'current-user', 'Usuario Actual');
    if (selected && selected.id === id) {
      const updated = useWorkOrdersStore.getState().getOrdenById(id);
      if (updated) setSelected(updated);
    }
  };

  const getActivoById = (id: string): Activo | undefined => {
    return ASSETS.find((a) => a.id === id);
  };

  // Vista detalle
  if (selected) {
    const activo = getActivoById(selected.activoId);
    const descripcionProblema =
      selected.descripcionProblema || selected.observaciones || '';
    const descripcionServicio = selected.descripcionServicio || '';
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
              {selected.folio}
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
              {selected.titulo}
            </h1>
            {activo && (
              <p
                style={{
                  fontSize: 13,
                  color: '#64748b',
                  marginTop: 6,
                  marginLeft: 16,
                }}
              >
                {activo.name} ·{' '}
                <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
                  {activo.code}
                </span>
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Badge label={STL[selected.status]} color={STC[selected.status]} />
            <Badge
              label={PRL[selected.prioridad]}
              color={PRC[selected.prioridad]}
            />
            <Badge
              label={
                selected.tipo === 'preventivo' ? 'Preventivo' : 'Correctivo'
              }
              color={selected.tipo === 'preventivo' ? '#3b82f6' : '#ef4444'}
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
            <RowData label='Asignado a' value={selected.tecnicoNombre} />
            <RowData
              label='Fecha de creación'
              value={formatDate(selected.fechaCreacion)}
            />
            <RowData
              label='Fecha de compromiso'
              value={formatDate(selected.fechaCompromiso)}
            />
            <RowData
              label='Fecha de inicio'
              value={formatDate(selected.fechaInicio)}
            />
            <RowData
              label='Fecha de cierre'
              value={formatDate(selected.fechaCierre)}
            />
            <RowData
              label='Cierre técnico'
              value={formatDate(selected.fechaCierreTecnico)}
            />
            <RowData
              label='Cierre administrativo'
              value={formatDate(selected.fechaCierreAdmin)}
            />
            <RowData
              label='Tiempo de paro'
              value={
                selected.downtimeMinutos
                  ? selected.downtimeMinutos + ' min'
                  : '0 min'
              }
            />
          </Card>
          <Card>
            <CardTitle>Descripción y Análisis</CardTitle>
            {selected.descripcion && (
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
                  Descripción
                </div>
                <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6 }}>
                  {selected.descripcion}
                </p>
              </div>
            )}
            {descripcionProblema && (
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
                  Descripción del problema
                </div>
                <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6 }}>
                  {descripcionProblema}
                </p>
              </div>
            )}
            {descripcionServicio && (
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
                  Descripción del servicio
                </div>
                <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6 }}>
                  {descripcionServicio}
                </p>
              </div>
            )}
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
                Gasto económico
              </div>
              <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6 }}>
                {selected.gastoDinero ? 'Sí' : 'No'}
                {selected.gastoDinero
                  ? ` · $${(selected.montoGastado || 0).toLocaleString(
                      'es-MX',
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      },
                    )}`
                  : ''}
              </p>
            </div>
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
                Refacción o consumible
              </div>
              <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6 }}>
                {selected.usoRefaccionConsumible ? 'Sí' : 'No'}
              </p>
              {selected.usoRefaccionConsumible && (
                <p
                  style={{
                    marginTop: 6,
                    fontSize: 12,
                    color: '#94a3b8',
                    lineHeight: 1.5,
                  }}
                >
                  Detalle:{' '}
                  {selected.refaccionConsumibleDetalle || 'No especificado'}
                </p>
              )}
            </div>
            {selected.causaRaiz && (
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
                  Causa Raíz
                </div>
                <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6 }}>
                  {selected.causaRaiz}
                </p>
              </div>
            )}
            {selected.accionTomada && (
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
                  Acción Tomada
                </div>
                <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6 }}>
                  {selected.accionTomada}
                </p>
              </div>
            )}
            {!selected.descripcion &&
              !descripcionProblema &&
              !descripcionServicio &&
              !selected.gastoDinero &&
              !selected.usoRefaccionConsumible &&
              !selected.causaRaiz &&
              !selected.accionTomada && (
                <p style={{ fontSize: 13, color: '#475569' }}>
                  Sin descripciones registradas.
                </p>
              )}
          </Card>
        </div>

        {/* Evidencias */}
        <Card style={{ marginBottom: 16 }}>
          <CardTitle>Evidencias ({selected.evidencias.length})</CardTitle>
          {selected.evidencias.length > 0 ? (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {selected.evidencias.map((ev) => (
                <div
                  key={ev.id}
                  style={{
                    padding: '8px 12px',
                    background: '#060e20',
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                >
                  📎 {ev.nombre}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 13, color: '#475569' }}>
              No hay evidencias adjuntas.
            </p>
          )}
        </Card>

        {/* Historial */}
        <Card style={{ marginBottom: 16 }}>
          <CardTitle>
            Historial de Cambios ({selected.historial.length})
          </CardTitle>
          {selected.historial.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selected.historial.map((h) => (
                <div
                  key={h.id}
                  style={{
                    padding: '8px 12px',
                    background: '#060e20',
                    borderRadius: 6,
                    fontSize: 12,
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>
                    <strong>{h.usuarioNombre}</strong> cambió {h.campo} de{' '}
                    {h.valorAnterior || '—'} → {h.valorNuevo}
                  </span>
                  <span style={{ color: '#64748b' }}>
                    {formatDate(h.fecha)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 13, color: '#475569' }}>
              No hay cambios registrados.
            </p>
          )}
        </Card>

        {/* Cambiar Estado */}
        <Card>
          <CardTitle>Cambiar Estado de la OT</CardTitle>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {ESTADOS_OT.map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(selected.id, s)}
                style={{
                  background: selected.status === s ? STC[s] + '33' : '#060e20',
                  border: `1.5px solid ${selected.status === s ? STC[s] : '#1e3a5f'}`,
                  color: selected.status === s ? STC[s] : '#64748b',
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

  // Vista principal
  return (
    <div style={{ padding: '28px', overflowY: 'auto', height: '100%' }}>
      <PageHeader
        title='Órdenes de Trabajo'
        sub={`${ordenes.length} órdenes registradas`}
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <BtnGhost
              onClick={() =>
                setViewMode(viewMode === 'table' ? 'kanban' : 'table')
              }
            >
              {viewMode === 'table' ? '📋 Kanban' : '📊 Tabla'}
            </BtnGhost>
            <BtnPrimary onClick={() => setShowCreate(true)}>
              + Nueva OT
            </BtnPrimary>
          </div>
        }
      />

      {/* KPIs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 12,
          marginBottom: 24,
        }}
      >
        <KpiCard label='Total' value={stats.total} color='#3b82f6' />
        <KpiCard label='Pendientes' value={stats.pendientes} color='#94a3b8' />
        <KpiCard label='En Proceso' value={stats.enProceso} color='#f59e0b' />
        <KpiCard
          label='Completadas'
          value={stats.completadas}
          color='#22c55e'
        />
        <KpiCard label='Cerradas' value={stats.cerradas} color='#0d9488' />
      </div>

      {/* Filtros */}
      <Card style={{ marginBottom: 18, padding: 16 }}>
        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <select
            value={filtros.status}
            onChange={(e) =>
              setFiltros({ status: e.target.value as EstadoOT | '' })
            }
            style={{ width: 'auto', minWidth: 140 }}
          >
            <option value=''>Todos los estados</option>
            {ESTADOS_OT.map((s) => (
              <option key={s} value={s}>
                {STL[s]}
              </option>
            ))}
          </select>

          <select
            value={filtros.prioridad}
            onChange={(e) =>
              setFiltros({ prioridad: e.target.value as PrioridadOT | '' })
            }
            style={{ width: 'auto', minWidth: 140 }}
          >
            <option value=''>Todas las prioridades</option>
            {PRIORIDADES.map((p) => (
              <option key={p} value={p}>
                {PRL[p]}
              </option>
            ))}
          </select>

          <select
            value={filtros.tecnicoId}
            onChange={(e) => setFiltros({ tecnicoId: e.target.value })}
            style={{ width: 'auto', minWidth: 160 }}
          >
            <option value=''>Todos los técnicos</option>
            {TECNICOS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre}
              </option>
            ))}
          </select>

          <select
            value={filtros.activoId}
            onChange={(e) => setFiltros({ activoId: e.target.value })}
            style={{ width: 'auto', minWidth: 160 }}
          >
            <option value=''>Todos los activos</option>
            {ASSETS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.code} - {a.name}
              </option>
            ))}
          </select>

          <input
            type='text'
            placeholder='Buscar...'
            value={filtros.busqueda}
            onChange={(e) => setFiltros({ busqueda: e.target.value })}
            style={{ width: 'auto', minWidth: 160 }}
          />

          {(filtros.status ||
            filtros.prioridad ||
            filtros.tecnicoId ||
            filtros.activoId ||
            filtros.busqueda) && (
            <BtnGhost onClick={clearFiltros}>Limpiar</BtnGhost>
          )}
        </div>
      </Card>

      {/* Vista Tabla */}
      {viewMode === 'table' && (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <DataTable
            head={[
              'Folio',
              'Título',
              'Tipo',
              'Asignado',
              'Vencimiento',
              'Prioridad',
              'Status',
              '',
            ]}
          >
            {filteredOrdenes.map((w) => (
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
                    label={
                      w.tipo === 'preventivo' ? 'Preventivo' : 'Correctivo'
                    }
                    color={w.tipo === 'preventivo' ? '#3b82f6' : '#ef4444'}
                  />
                </Td>
                <Td>{w.tecnicoNombre}</Td>
                <Td mono>{formatDate(w.fechaCompromiso)}</Td>
                <Td>
                  <Badge label={PRL[w.prioridad]} color={PRC[w.prioridad]} />
                </Td>
                <Td>
                  <Badge label={STL[w.status]} color={STC[w.status]} />
                </Td>
                <Td>
                  <BtnGhost onClick={() => setSelected(w)}>
                    Ver detalle
                  </BtnGhost>
                </Td>
              </tr>
            ))}
          </DataTable>
        </Card>
      )}

      {/* Vista Kanban */}
      {viewMode === 'kanban' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {ESTADOS_OT.map((status) => {
            const otStatus = filteredOrdenes.filter((o) => o.status === status);
            return (
              <div key={status}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 12,
                    padding: '8px 12px',
                    background: '#0d1627',
                    borderRadius: '8px 8px 0 0',
                    border: `1px solid ${STC[status]}`,
                    borderBottom: 'none',
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: 12,
                      color: STC[status],
                      textTransform: 'uppercase',
                    }}
                  >
                    {STL[status]}
                  </span>
                  <span
                    style={{
                      background: STC[status] + '20',
                      color: STC[status],
                      padding: '2px 8px',
                      borderRadius: 10,
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {otStatus.length}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    minHeight: 200,
                    background: '#0a1425',
                    borderRadius: 8,
                    padding: 8,
                  }}
                >
                  {otStatus.map((ot) => {
                    const activo = getActivoById(ot.activoId);
                    return (
                      <div
                        key={ot.id}
                        onClick={() => setSelected(ot)}
                        style={{
                          background: '#0d1627',
                          border: '1px solid #1e3a5f',
                          borderRadius: 6,
                          padding: 12,
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#f59e0b';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#1e3a5f';
                        }}
                      >
                        <div
                          style={{
                            fontSize: 11,
                            color: '#f59e0b',
                            fontFamily: 'monospace',
                            marginBottom: 4,
                          }}
                        >
                          {ot.folio}
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: '#e2e8f0',
                            marginBottom: 8,
                          }}
                        >
                          {ot.titulo}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: 11,
                            color: '#64748b',
                          }}
                        >
                          <span>{activo?.code}</span>
                          <Badge
                            label={PRL[ot.prioridad]}
                            color={PRC[ot.prioridad]}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {otStatus.length === 0 && (
                    <div
                      style={{
                        textAlign: 'center',
                        color: '#475569',
                        fontSize: 12,
                        padding: 20,
                      }}
                    >
                      Sin órdenes
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Crear OT */}
      {showCreate && (
        <Modal
          title='Nueva Orden de Trabajo'
          onClose={() => setShowCreate(false)}
        >
          <Field label='Título *'>
            <input
              placeholder='Ej: Revisión preventiva bomba #3'
              value={formData.titulo}
              onChange={(e) =>
                setFormData({ ...formData, titulo: e.target.value })
              }
            />
          </Field>
          <Field label='Descripción'>
            <textarea
              placeholder='Describe el trabajo a realizar...'
              value={formData.descripcion}
              onChange={(e) =>
                setFormData({ ...formData, descripcion: e.target.value })
              }
            />
          </Field>
          <Field label='Activo *'>
            <select
              value={formData.activoId}
              onChange={(e) =>
                setFormData({ ...formData, activoId: e.target.value })
              }
            >
              <option value=''>Seleccionar activo...</option>
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
                value={formData.tipo}
                onChange={(e) =>
                  setFormData({ ...formData, tipo: e.target.value as TipoOT })
                }
              >
                {TIPOS_OT.map((t) => (
                  <option key={t} value={t}>
                    {t === 'preventivo'
                      ? 'Preventivo'
                      : t === 'correctivo'
                        ? 'Correctivo'
                        : 'Predictivo'}
                  </option>
                ))}
              </select>
            </Field>
            <Field label='Prioridad'>
              <select
                value={formData.prioridad}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    prioridad: e.target.value as PrioridadOT,
                  })
                }
              >
                {PRIORIDADES.map((p) => (
                  <option key={p} value={p}>
                    {PRL[p]}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}
          >
            <Field label='Técnico *'>
              <select
                value={formData.tecnicoId}
                onChange={(e) =>
                  setFormData({ ...formData, tecnicoId: e.target.value })
                }
              >
                <option value=''>Seleccionar técnico...</option>
                {TECNICOS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </Field>
            <Field label='Fecha de Vencimiento'>
              <input
                type='date'
                value={formData.fechaCompromiso}
                onChange={(e) =>
                  setFormData({ ...formData, fechaCompromiso: e.target.value })
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
                value={formData.downtimeMinutos}
                onChange={(e) =>
                  setFormData({ ...formData, downtimeMinutos: e.target.value })
                }
              />
            </Field>
            <Field label='Fecha de cierre'>
              <input
                type='date'
                value={formData.fechaCierre}
                onChange={(e) =>
                  setFormData({ ...formData, fechaCierre: e.target.value })
                }
              />
            </Field>
          </div>
          <Field label='Descripción del problema'>
            <textarea
              placeholder='Describe el problema detectado...'
              value={formData.descripcionProblema}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  descripcionProblema: e.target.value,
                })
              }
            />
          </Field>
          <Field label='Descripción del servicio'>
            <textarea
              placeholder='Describe el servicio realizado o a realizar...'
              value={formData.descripcionServicio}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  descripcionServicio: e.target.value,
                })
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
                color: '#cbd5e1',
              }}
            >
              <input
                type='checkbox'
                checked={formData.gastoDinero}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    gastoDinero: e.target.checked,
                    montoGastado: e.target.checked ? formData.montoGastado : '',
                  })
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
                color: '#cbd5e1',
              }}
            >
              <input
                type='checkbox'
                checked={formData.usoRefaccionConsumible}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    usoRefaccionConsumible: e.target.checked,
                    refaccionConsumibleDetalle: e.target.checked
                      ? formData.refaccionConsumibleDetalle
                      : '',
                  })
                }
              />
              ¿Se usó refacción o consumible?
            </label>
          </div>
          {formData.gastoDinero && (
            <Field label='Monto gastado'>
              <input
                type='number'
                min={0}
                step='0.01'
                placeholder='Ej: 1500.00'
                value={formData.montoGastado}
                onChange={(e) =>
                  setFormData({ ...formData, montoGastado: e.target.value })
                }
              />
            </Field>
          )}
          {formData.usoRefaccionConsumible && (
            <Field label='Detalle de refacción/consumible *'>
              <input
                type='text'
                placeholder='Ej: Rodamiento 6205, aceite hidráulico ISO 46'
                value={formData.refaccionConsumibleDetalle}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    refaccionConsumibleDetalle: e.target.value,
                  })
                }
              />
            </Field>
          )}
          <ModalFooter
            onCancel={() => setShowCreate(false)}
            onConfirm={handleCreateOrden}
            confirmLabel='Crear OT'
          />
        </Modal>
      )}
    </div>
  );
}
