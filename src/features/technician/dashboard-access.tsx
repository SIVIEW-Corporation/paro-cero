'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AUTH_STATUS, useAuthStore } from '@/store/auth-store';
import { canVisitDashboard, isTechnicianRole } from './access';

/** Client-only demo guard; backend authorization remains a production prerequisite. */
export default function DashboardAccess({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user);
  // Wait for `/api/auth/session` when no persisted user is available yet.
  const checking = useAuthStore(
    (state) => !state.user && state.status === AUTH_STATUS.CHECKING,
  );
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);
  if (!ready || checking)
    return (
      <p className='text-app-text-secondary p-6 text-sm' role='status'>
        Cargando perfil…
      </p>
    );
  if (canVisitDashboard(user, pathname)) return children;
  return (
    <section className='border-app-border-soft bg-app-surface my-6 space-y-4 rounded-xl border p-6'>
      <h1 className='text-app-text-primary text-xl font-bold'>
        {isTechnicianRole(user?.role)
          ? 'Tu espacio de trabajo es Mis tareas'
          : 'Acceso no disponible para este perfil'}
      </h1>
      <p className='text-app-text-secondary text-sm'>
        {isTechnicianRole(user?.role)
          ? 'Planeación y horarios son funciones del supervisor. Consultá tu OT desde el detalle de la tarea.'
          : 'Se requiere una sesión activa con el perfil correspondiente.'}
      </p>
      <Link
        href={
          isTechnicianRole(user?.role)
            ? '/dashboard/mis-tareas'
            : user
              ? '/dashboard'
              : '/login'
        }
        className='bg-shPrimary-800 inline-block rounded-lg px-4 py-2 text-sm font-semibold text-white'
      >
        {isTechnicianRole(user?.role)
          ? 'Ir a Mis tareas'
          : user
            ? 'Volver al inicio'
            : 'Iniciar sesión'}
      </Link>
      <p className='text-app-text-secondary text-xs'>
        Control de interfaz para datos de prueba. La autorización de datos
        reales debe validarse en el servidor.
      </p>
    </section>
  );
}
