// ═══════════════════════════════════════════════════════════════════════════════
// ZUSTAND STORE - Inspecciones (Checklists y Hallazgos)
// ═══════════════════════════════════════════════════════════════════════════════

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type {
  Checklist,
  Hallazgo,
  ChecklistItemRespuesta,
  EstadoChecklist,
  EstadoHallazgo,
} from '../data/types';
import {
  INIT_CHECKLISTS,
  INIT_HALLAZGOS,
  PLANTILLAS_CHECKLIST,
} from '../data/mock-data';

interface InspeccionesState {
  checklists: Checklist[];
  hallazgos: Hallazgo[];
  plantillas: typeof PLANTILLAS_CHECKLIST;

  // Setters for compatibility
  setChecklists: (
    checklists: Checklist[] | ((prev: Checklist[]) => Checklist[]),
  ) => void;
  setHallazgos: (
    hallazgos: Hallazgo[] | ((prev: Hallazgo[]) => Hallazgo[]),
  ) => void;
  setPlantillas: (
    plantillas:
      | typeof PLANTILLAS_CHECKLIST
      | ((prev: typeof PLANTILLAS_CHECKLIST) => typeof PLANTILLAS_CHECKLIST),
  ) => void;

  // Checklist actions
  addChecklist: (checklist: Omit<Checklist, 'id' | 'createdAt'>) => void;
  updateChecklist: (id: string, updates: Partial<Checklist>) => void;
  updateChecklistItem: (
    checklistId: string,
    itemIndex: number,
    respuesta: ChecklistItemRespuesta,
  ) => void;
  changeChecklistStatus: (id: string, estado: EstadoChecklist) => void;
  deleteChecklist: (id: string) => void;

  // Hallazgo actions
  addHallazgo: (hallazgo: Omit<Hallazgo, 'id' | 'createdAt'>) => void;
  updateHallazgo: (id: string, updates: Partial<Hallazgo>) => void;
  resolveHallazgo: (id: string, otId?: string) => void;
  deleteHallazgo: (id: string) => void;

  // Plantillas
  addPlantilla: (plantilla: (typeof PLANTILLAS_CHECKLIST)[number]) => void;
  updatePlantilla: (
    id: string,
    updates: Partial<(typeof PLANTILLAS_CHECKLIST)[number]>,
  ) => void;

  // Getters
  getChecklistById: (id: string) => Checklist | undefined;
  getHallazgosByChecklist: (checklistId: string) => Hallazgo[];
  getHallazgosByActivo: (activoId: string) => Hallazgo[];
  getHallazgosByStatus: (status: EstadoHallazgo) => Hallazgo[];
}

export const useInspeccionesStore = create<InspeccionesState>()(
  persist(
    (set, get) => ({
      checklists: INIT_CHECKLISTS,
      hallazgos: INIT_HALLAZGOS,
      plantillas: PLANTILLAS_CHECKLIST,

      setChecklists: (checklists) => {
        set((state) => ({
          checklists:
            typeof checklists === 'function'
              ? checklists(state.checklists)
              : checklists,
        }));
      },

      setHallazgos: (hallazgos) => {
        set((state) => ({
          hallazgos:
            typeof hallazgos === 'function'
              ? hallazgos(state.hallazgos)
              : hallazgos,
        }));
      },

      setPlantillas: (plantillas) => {
        set((state) => ({
          plantillas:
            typeof plantillas === 'function'
              ? plantillas(state.plantillas)
              : plantillas,
        }));
      },

      addChecklist: (checklistData) => {
        const nuevo: Checklist = {
          ...checklistData,
          id: `CHK-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          checklists: [nuevo, ...state.checklists],
        }));
      },

      updateChecklist: (id, updates) => {
        set((state) => ({
          checklists: state.checklists.map((c) =>
            c.id === id ? { ...c, ...updates } : c,
          ),
        }));
      },

      updateChecklistItem: (checklistId, itemIndex, respuesta) => {
        set((state) => ({
          checklists: state.checklists.map((c) =>
            c.id === checklistId
              ? {
                  ...c,
                  items: c.items.map((item, idx) =>
                    idx === itemIndex ? respuesta : item,
                  ),
                }
              : c,
          ),
        }));
      },

      changeChecklistStatus: (id, estado) => {
        set((state) => ({
          checklists: state.checklists.map((c) =>
            c.id === id ? { ...c, estado } : c,
          ),
        }));
      },

      deleteChecklist: (id) => {
        set((state) => ({
          checklists: state.checklists.filter((c) => c.id !== id),
        }));
      },

      addHallazgo: (hallazgoData) => {
        const nuevo: Hallazgo = {
          ...hallazgoData,
          id: `HAL-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          hallazgos: [nuevo, ...state.hallazgos],
        }));
      },

      updateHallazgo: (id, updates) => {
        set((state) => ({
          hallazgos: state.hallazgos.map((h) =>
            h.id === id ? { ...h, ...updates } : h,
          ),
        }));
      },

      resolveHallazgo: (id, otId) => {
        set((state) => ({
          hallazgos: state.hallazgos.map((h) =>
            h.id === id
              ? {
                  ...h,
                  status: 'resuelto' as EstadoHallazgo,
                  resolvedAt: new Date().toISOString(),
                  otId: otId || h.otId,
                }
              : h,
          ),
        }));
      },

      deleteHallazgo: (id) => {
        set((state) => ({
          hallazgos: state.hallazgos.filter((h) => h.id !== id),
        }));
      },

      addPlantilla: (plantilla) => {
        set((state) => ({
          plantillas: [
            ...state.plantillas,
            { ...plantilla, id: `PLT-${Date.now()}` },
          ],
        }));
      },

      updatePlantilla: (id, updates) => {
        set((state) => ({
          plantillas: state.plantillas.map((p) =>
            p.id === id ? { ...p, ...updates } : p,
          ),
        }));
      },

      getChecklistById: (id) => {
        return get().checklists.find((c) => c.id === id);
      },

      getHallazgosByChecklist: (checklistId) => {
        return get().hallazgos.filter((h) => h.checklistId === checklistId);
      },

      getHallazgosByActivo: (activoId) => {
        return get().hallazgos.filter((h) => h.activoId === activoId);
      },

      getHallazgosByStatus: (status) => {
        return get().hallazgos.filter((h) => h.status === status);
      },
    }),
    {
      name: 'inspecciones-session-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        checklists: state.checklists,
        hallazgos: state.hallazgos,
        plantillas: state.plantillas,
      }),
    },
  ),
);
