// ═══════════════════════════════════════════════════════════════════════════════
// ZUSTAND STORE - Órdenes de Trabajo
// ═══════════════════════════════════════════════════════════════════════════════

import { create } from 'zustand';
import type {
  OrdenTrabajo,
  EstadoOT,
  PrioridadOT,
  TipoOT,
  Evidencia,
  HistorialCambio,
  CierreTecnico,
  CierreAdministrativo,
  FiltrosOT,
} from '../data/types';
import { INIT_WO, generarFolioOT, ASSETS } from '../data/mock-data';
import { TECNICOS } from '../data/constants';

interface WorkOrdersState {
  ordenes: OrdenTrabajo[];
  filtros: FiltrosOT;

  // Actions
  addOrden: (
    orden: Omit<
      OrdenTrabajo,
      'id' | 'folio' | 'historial' | 'createdAt' | 'updatedAt'
    >,
  ) => void;
  updateOrden: (id: string, updates: Partial<OrdenTrabajo>) => void;
  deleteOrden: (id: string) => void;

  // Estado
  changeStatus: (
    id: string,
    newStatus: EstadoOT,
    usuarioId?: string,
    usuarioNombre?: string,
  ) => void;

  // Cierres
  cerrarTecnico: (id: string, cierre: CierreTecnico) => void;
  cerrarAdministrativo: (id: string, cierre: CierreAdministrativo) => void;

  // Evidencias
  addEvidencia: (id: string, evidencia: Evidencia) => void;
  removeEvidencia: (otId: string, evidenciaId: string) => void;

  // Filtros
  setFiltros: (filtros: Partial<FiltrosOT>) => void;
  clearFiltros: () => void;

  // Getters
  getOrdenById: (id: string) => OrdenTrabajo | undefined;
  getFilteredOrdenes: () => OrdenTrabajo[];
  getOrdenesByStatus: (status: EstadoOT) => OrdenTrabajo[];
}

const filtrosVacios: FiltrosOT = {
  status: '',
  prioridad: '',
  tecnicoId: '',
  activoId: '',
  fechaInicio: '',
  fechaFin: '',
  busqueda: '',
};

export const useWorkOrdersStore = create<WorkOrdersState>((set, get) => ({
  ordenes: INIT_WO,
  filtros: filtrosVacios,

  addOrden: (ordenData) => {
    const now = new Date();
    const nuevaOrden: OrdenTrabajo = {
      ...ordenData,
      id: `OT${Date.now()}`,
      folio: generarFolioOT(),
      historial: [
        {
          id: `H${Date.now()}`,
          fecha: now,
          usuarioId: 'current-user',
          usuarioNombre: 'Usuario Actual',
          campo: 'status',
          valorAnterior: null,
          valorNuevo: ordenData.status,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    set((state) => ({
      ordenes: [...state.ordenes, nuevaOrden],
    }));
  },

  updateOrden: (id, updates) => {
    set((state) => ({
      ordenes: state.ordenes.map((ot) =>
        ot.id === id ? { ...ot, ...updates, updatedAt: new Date() } : ot,
      ),
    }));
  },

  deleteOrden: (id) => {
    set((state) => ({
      ordenes: state.ordenes.filter((ot) => ot.id !== id),
    }));
  },

  changeStatus: (
    id,
    newStatus,
    usuarioId = 'current-user',
    usuarioNombre = 'Usuario Actual',
  ) => {
    const orden = get().ordenes.find((ot) => ot.id === id);
    if (!orden) return;

    const historialEntry: HistorialCambio = {
      id: `H${Date.now()}`,
      fecha: new Date(),
      usuarioId,
      usuarioNombre,
      campo: 'status',
      valorAnterior: orden.status,
      valorNuevo: newStatus,
    };

    const updates: Partial<OrdenTrabajo> = {
      status: newStatus,
      historial: [...orden.historial, historialEntry],
      updatedAt: new Date(),
    };

    // Fechas automáticas según estado
    if (newStatus === 'en_proceso' && !orden.fechaInicio) {
      updates.fechaInicio = new Date();
    }
    if (newStatus === 'completada' && !orden.fechaCierre) {
      updates.fechaCierre = new Date();
    }

    set((state) => ({
      ordenes: state.ordenes.map((ot) =>
        ot.id === id ? { ...ot, ...updates } : ot,
      ),
    }));
  },

  cerrarTecnico: (id, cierre) => {
    set((state) => ({
      ordenes: state.ordenes.map((ot) =>
        ot.id === id
          ? {
              ...ot,
              cierreTecnico: cierre,
              fechaCierreTecnico: cierre.fecha,
              status: 'completada' as EstadoOT,
              updatedAt: new Date(),
              historial: [
                ...ot.historial,
                {
                  id: `H${Date.now()}`,
                  fecha: new Date(),
                  usuarioId: cierre.tecnicoId,
                  usuarioNombre: cierre.tecnicoNombre,
                  campo: 'cierre_tecnico',
                  valorAnterior: null,
                  valorNuevo: 'Cierre técnico registrado',
                },
              ],
            }
          : ot,
      ),
    }));
  },

  cerrarAdministrativo: (id, cierre) => {
    set((state) => ({
      ordenes: state.ordenes.map((ot) =>
        ot.id === id
          ? {
              ...ot,
              cierreAdministrativo: cierre,
              fechaCierreAdmin: cierre.fecha,
              status: 'cerrada' as EstadoOT,
              updatedAt: new Date(),
              historial: [
                ...ot.historial,
                {
                  id: `H${Date.now()}`,
                  fecha: new Date(),
                  usuarioId: cierre.adminId,
                  usuarioNombre: cierre.adminNombre,
                  campo: 'cierre_administrativo',
                  valorAnterior: null,
                  valorNuevo: 'Cierre administrativo registrado',
                },
              ],
            }
          : ot,
      ),
    }));
  },

  addEvidencia: (id, evidencia) => {
    set((state) => ({
      ordenes: state.ordenes.map((ot) =>
        ot.id === id
          ? {
              ...ot,
              evidencias: [...ot.evidencias, evidencia],
              updatedAt: new Date(),
            }
          : ot,
      ),
    }));
  },

  removeEvidencia: (otId, evidenciaId) => {
    set((state) => ({
      ordenes: state.ordenes.map((ot) =>
        ot.id === otId
          ? {
              ...ot,
              evidencias: ot.evidencias.filter((e) => e.id !== evidenciaId),
              updatedAt: new Date(),
            }
          : ot,
      ),
    }));
  },

  setFiltros: (nuevosFiltros) => {
    set((state) => ({
      filtros: { ...state.filtros, ...nuevosFiltros },
    }));
  },

  clearFiltros: () => {
    set({ filtros: filtrosVacios });
  },

  getOrdenById: (id) => {
    return get().ordenes.find((ot) => ot.id === id);
  },

  getFilteredOrdenes: () => {
    const { ordenes, filtros } = get();

    return ordenes.filter((ot) => {
      if (filtros.status && ot.status !== filtros.status) return false;
      if (filtros.prioridad && ot.prioridad !== filtros.prioridad) return false;
      if (filtros.tecnicoId && ot.tecnicoId !== filtros.tecnicoId) return false;
      if (filtros.activoId && ot.activoId !== filtros.activoId) return false;

      if (filtros.fechaInicio) {
        const fechaIni = new Date(filtros.fechaInicio);
        const fechaCreacion = new Date(ot.fechaCreacion);
        if (fechaCreacion < fechaIni) return false;
      }

      if (filtros.fechaFin) {
        const fechaFin = new Date(filtros.fechaFin);
        const fechaCreacion = new Date(ot.fechaCreacion);
        if (fechaCreacion > fechaFin) return false;
      }

      if (filtros.busqueda) {
        const busqueda = filtros.busqueda.toLowerCase();
        const matchFolio = ot.folio.toLowerCase().includes(busqueda);
        const matchTitulo = ot.titulo.toLowerCase().includes(busqueda);
        const matchDescripcion = ot.descripcion
          .toLowerCase()
          .includes(busqueda);
        if (!matchFolio && !matchTitulo && !matchDescripcion) return false;
      }

      return true;
    });
  },

  getOrdenesByStatus: (status) => {
    return get().ordenes.filter((ot) => ot.status === status);
  },
}));
