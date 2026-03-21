// ═══════════════════════════════════════════════════════════════════════════════
// ZUSTAND STORE - Autenticación
// ═══════════════════════════════════════════════════════════════════════════════

import { create } from 'zustand';
import type { Usuario } from '../data/types';

// Usuario mock para demo
const DEMO_USER: Usuario = {
  id: 'U001',
  empresaId: 'EMP001',
  email: 'supervisor@apex.com',
  nombre: 'Supervisor Maintenace',
  rol: 'supervisor',
  activo: true,
  createdAt: new Date('2024-01-01'),
};

interface AuthState {
  user: Usuario | null;
  isAuthenticated: boolean;
  login: (user: Usuario) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: DEMO_USER, // Por defecto logueado para demo
  isAuthenticated: true,

  login: (user) => {
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
}));
