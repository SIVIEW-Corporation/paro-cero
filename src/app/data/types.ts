// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS PRINCIPALES - APEX Maintenance
// ═══════════════════════════════════════════════════════════════════════════════

// --- Estados y Enums ---

export type EstadoActivo =
  | 'activo'
  | 'detenido'
  | 'mantenimiento'
  | 'descomisionado';
export type Criticidad = 'baja' | 'media' | 'alta' | 'critico';

export type EstadoOT =
  | 'nueva'
  | 'asignada'
  | 'en_proceso'
  | 'en_espera'
  | 'completada'
  | 'cerrada'
  | 'cancelada';

export type PrioridadOT = 'baja' | 'media' | 'alta' | 'critico';
export type TipoOT = 'preventivo' | 'correctivo' | 'predictivo';

export type EstadoChecklist =
  | 'pendiente'
  | 'en_ejecucion'
  | 'completado'
  | 'vencido';

export type EstadoHallazgo = 'abierto' | 'en_proceso' | 'resuelto';
export type SeveridadHallazgo = 'baja' | 'media' | 'alta' | 'critica';

export type TipoNotificacion = 'vencida' | 'proxima' | 'asignada';

export type Turno = 'Matutino' | 'Vespertino' | 'Nocturno';
export type ItemChecklistValor = 'ok' | 'nok' | 'na';

export type FrecuenciaPlan = 'dias' | 'semanas' | 'meses' | 'anios';

// --- Interfaces de Entidades ---

export interface Empresa {
  id: string;
  nombre: string;
  razonSocial: string;
  rfc: string;
  createdAt: Date;
}

export interface Usuario {
  id: string;
  empresaId: string;
  email: string;
  nombre: string;
  rol: 'admin' | 'supervisor' | 'tecnico';
  activo: boolean;
  createdAt: Date;
}

export interface Activo {
  id: string;
  empresaId: string;
  code: string;
  name: string;
  area: string;
  status: EstadoActivo;
  criticidad: Criticidad;
  fabricante: string;
  modelo: string;
  serie: string;
  instalacion: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlanMantenimiento {
  id: string;
  empresaId: string;
  activoId: string;
  name: string;
  freq: number;
  unit: FrecuenciaPlan;
  prioridad: PrioridadOT;
  duracion: number;
  activo: boolean;
  items: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Evidencia {
  id: string;
  tipo: 'foto' | 'documento';
  url: string;
  nombre: string;
  fechaSubida: Date;
}

export interface HistorialCambio {
  id: string;
  fecha: Date;
  usuarioId: string;
  usuarioNombre: string;
  campo: string;
  valorAnterior: string | null;
  valorNuevo: string | null;
}

export interface CierreTecnico {
  tecnicoId: string;
  tecnicoNombre: string;
  fecha: Date;
  observaciones: string;
  firma: string;
}

export interface CierreAdministrativo {
  adminId: string;
  adminNombre: string;
  fecha: Date;
  observaciones: string;
  firma: string;
}

export interface OrdenTrabajo {
  id: string;
  empresaId: string;
  folio: string;
  activoId: string;
  titulo: string;
  descripcion: string;
  tipo: TipoOT;
  status: EstadoOT;
  prioridad: PrioridadOT;
  tecnicoId: string;
  tecnicoNombre: string;
  fechaCreacion: Date;
  fechaCompromiso: Date;
  fechaInicio?: Date;
  fechaCierre?: Date;
  fechaCierreTecnico?: Date;
  fechaCierreAdmin?: Date;
  observaciones: string;
  causaRaiz?: string;
  accionTomada?: string;
  cierreTecnico?: CierreTecnico;
  cierreAdministrativo?: CierreAdministrativo;
  evidencias: Evidencia[];
  historial: HistorialCambio[];
  downtimeMinutos: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChecklistItem {
  id: number;
  descripcion: string;
}

export interface ChecklistItemRespuesta {
  itemId: number;
  valor: ItemChecklistValor;
  nota: string;
}

export interface Checklist {
  id: string;
  empresaId: string;
  folio: string;
  plantillaId: string;
  plantillaName: string;
  activoId: string;
  activoCode: string;
  activoName: string;
  area: string;
  fecha: string;
  turno: Turno;
  responsable: string;
  horometro?: number;
  estado: EstadoChecklist;
  items: ChecklistItemRespuesta[];
  createdAt: string;
}

export interface Hallazgo {
  id: string;
  empresaId: string;
  checklistId: string;
  checklistFolio: string;
  itemId: number;
  itemDescripcion: string;
  descripcion: string;
  severidad: SeveridadHallazgo;
  status: EstadoHallazgo;
  activoId: string;
  activoCode: string;
  activoName: string;
  responsable: string;
  createdAt: string;
  otId: string | null;
  resolvedAt: string | null;
}

export interface Notificacion {
  id: string;
  empresaId: string;
  tipo: TipoNotificacion;
  titulo: string;
  msg: string;
  fecha: string;
  leida: boolean;
  createdAt: Date;
}

// --- Tipos para Reportes ---

export interface ChartDataPoint {
  mes: string;
  val?: number;
  hrs?: number;
}

export interface PieChartDataPoint {
  name: string;
  value: number;
  color: string;
}

export interface TopFalla {
  asset: string;
  count: number;
  down: number;
}

// --- Utilidades ---

export type StatusColor = string;
export type StatusLabel = string;

export interface StatusConfig {
  [key: string]: {
    color: StatusColor;
    label: StatusLabel;
  };
}

// --- Tipos para Filtros ---

export interface FiltrosOT {
  status?: EstadoOT | '';
  prioridad?: PrioridadOT | '';
  tecnicoId?: string | '';
  activoId?: string | '';
  fechaInicio?: string;
  fechaFin?: string;
  busqueda?: string;
}

export interface FiltrosChecklist {
  estado?: EstadoChecklist | '';
  activoId?: string | '';
  fechaInicio?: string;
  fechaFin?: string;
  responsable?: string;
}
