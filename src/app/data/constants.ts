// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTES - APEX Maintenance
// ═══════════════════════════════════════════════════════════════════════════════

import type {
  EstadoActivo,
  Criticidad,
  EstadoOT,
  PrioridadOT,
  TipoOT,
  EstadoChecklist,
  EstadoHallazgo,
  SeveridadHallazgo,
  TipoNotificacion,
  Turno,
  ItemChecklistValor,
  FrecuenciaPlan,
} from './types';

// --- Colores y Labels ---

export const STC: Record<
  EstadoActivo | EstadoOT | 'pendiente' | 'vencido',
  string
> = {
  activo: '#22c55e',
  detenido: '#ef4444',
  mantenimiento: '#f59e0b',
  descomisionado: '#64748b',
  pendiente: '#94a3b8',
  nueva: '#94a3b8',
  asignada: '#3b82f6',
  en_proceso: '#f59e0b',
  en_espera: '#f97316',
  completada: '#22c55e',
  cerrada: '#0d9488',
  cancelada: '#64748b',
  vencido: '#ef4444',
};

export const STL: Record<
  EstadoActivo | EstadoOT | 'pendiente' | 'vencido',
  string
> = {
  activo: 'Activo',
  detenido: 'Detenido',
  mantenimiento: 'En Mantenimiento',
  descomisionado: 'Descomisionado',
  pendiente: 'Pendiente',
  nueva: 'Nueva',
  asignada: 'Asignada',
  en_proceso: 'En Proceso',
  en_espera: 'En Espera',
  completada: 'Completada',
  cerrada: 'Cerrada',
  cancelada: 'Cancelada',
  vencido: 'Vencido',
};

export const PRC: Record<PrioridadOT, string> = {
  baja: '#22c55e',
  media: '#3b82f6',
  alta: '#f59e0b',
  critico: '#ef4444',
};

export const PRL: Record<PrioridadOT, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  critico: 'Crítico',
};

export const CRC: Record<Criticidad, string> = {
  baja: '#22c55e',
  media: '#f59e0b',
  alta: '#ef4444',
  critico: '#dc2626',
};

export const CRL: Record<Criticidad, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  critico: 'Crítica',
};

export const NTC: Record<TipoNotificacion, string> = {
  vencida: '#ef4444',
  proxima: '#f59e0b',
  asignada: '#3b82f6',
};

export const NTL: Record<TipoNotificacion, string> = {
  vencida: 'Vencida',
  proxima: 'Próxima',
  asignada: 'Asignada',
};

export const NTI: Record<TipoNotificacion, string> = {
  vencida: '⚠',
  proxima: '🔔',
  asignada: '📋',
};

export const CHECKLIST_ESTADOS: Record<EstadoChecklist, string> = {
  pendiente: 'Pendiente',
  en_ejecucion: 'En Ejecución',
  completado: 'Completado',
  vencido: 'Vencido',
};

export const CHECKLIST_ESTADO_COLORES: Record<EstadoChecklist, string> = {
  pendiente: '#94a3b8',
  en_ejecucion: '#f59e0b',
  completado: '#22c55e',
  vencido: '#ef4444',
};

export const HALLAZGO_STATUS: Record<EstadoHallazgo, string> = {
  abierto: 'Abierto',
  en_proceso: 'En Proceso',
  resuelto: 'Resuelto',
};

export const HALLAZGO_COLORES: Record<EstadoHallazgo, string> = {
  abierto: '#ef4444',
  en_proceso: '#f59e0b',
  resuelto: '#22c55e',
};

export const SEVERIDADES: Record<SeveridadHallazgo, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  critica: 'Crítica',
};

export const SEVERIDAD_COLORES: Record<SeveridadHallazgo, string> = {
  baja: '#22c55e',
  media: '#3b82f6',
  alta: '#f59e0b',
  critica: '#ef4444',
};

export const ITEM_VALORES: Record<ItemChecklistValor, string> = {
  ok: 'OK',
  nok: 'No OK',
  na: 'N/A',
};

export const ITEM_VALOR_COLORES: Record<ItemChecklistValor, string> = {
  ok: '#22c55e',
  nok: '#ef4444',
  na: '#64748b',
};

export const TURNOS: Turno[] = ['Matutino', 'Vespertino', 'Nocturno'];

export const TIPOS_OT: TipoOT[] = ['preventivo', 'correctivo', 'predictivo'];

export const PRIORIDADES: PrioridadOT[] = ['baja', 'media', 'alta', 'critico'];

export const ESTADOS_OT: EstadoOT[] = [
  'nueva',
  'asignada',
  'en_proceso',
  'en_espera',
  'completada',
  'cerrada',
  'cancelada',
];

export const UNIDADES_FRECUENCIA: { value: FrecuenciaPlan; label: string }[] = [
  { value: 'dias', label: 'Días' },
  { value: 'semanas', label: 'Semanas' },
  { value: 'meses', label: 'Meses' },
  { value: 'anios', label: 'Años' },
];

export const TT: React.CSSProperties = {
  background: '#0d1627',
  border: '1px solid #1e3a5f',
  borderRadius: 6,
  fontSize: 12,
  color: '#e2e8f0',
};

// --- Técnicos (datos de ejemplo) ---

export const TECNICOS = [
  { id: 'T001', nombre: 'Carlos Mendez' },
  { id: 'T002', nombre: 'Luis Ramirez' },
  { id: 'T003', nombre: 'Maria Gonzalez' },
  { id: 'T004', nombre: 'Pedro Sanchez' },
];
