// ═══════════════════════════════════════════════════════════════════════════════
// ZUSTAND STORE - Notificaciones
// ═══════════════════════════════════════════════════════════════════════════════

import { create } from 'zustand';
import type { Notificacion, TipoNotificacion } from '../data/types';
import { INIT_NOTIFS } from '../data/mock-data';

interface NotificacionesState {
  notificaciones: Notificacion[];
  setNotificaciones: (notificaciones: Notificacion[]) => void;
  addNotificacion: (
    notificacion: Omit<Notificacion, 'id' | 'createdAt'>,
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotificacion: (id: string) => void;
  getUnreadCount: () => number;
}

export const useNotificacionesStore = create<NotificacionesState>(
  (set, get) => ({
    notificaciones: INIT_NOTIFS,

    setNotificaciones: (notificaciones) => {
      set({ notificaciones });
    },

    addNotificacion: (notificacionData) => {
      const nueva: Notificacion = {
        ...notificacionData,
        id: `NOTIF-${Date.now()}`,
        createdAt: new Date(),
      };

      set((state) => ({
        notificaciones: [nueva, ...state.notificaciones],
      }));
    },

    markAsRead: (id) => {
      set((state) => ({
        notificaciones: state.notificaciones.map((n) =>
          n.id === id ? { ...n, leida: true } : n,
        ),
      }));
    },

    markAllAsRead: () => {
      set((state) => ({
        notificaciones: state.notificaciones.map((n) => ({
          ...n,
          leida: true,
        })),
      }));
    },

    deleteNotificacion: (id) => {
      set((state) => ({
        notificaciones: state.notificaciones.filter((n) => n.id !== id),
      }));
    },

    getUnreadCount: () => {
      return get().notificaciones.filter((n) => !n.leida).length;
    },
  }),
);
