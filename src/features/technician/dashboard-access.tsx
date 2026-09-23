'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { canVisitDashboard } from './access';

/** Client-only demo guard; backend authorization remains a production prerequisite. */
export default function DashboardAccess({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);
  if (!ready)
    return (
      <p className='text-app-text-secondary p-6 text-sm' role='status'>
        Cargando perfil…
      </p>
    );
  if (canVisitDashboard(user, pathname)) return children;
  return (
    <section className='border-app-border-soft bg-app-surface my-6 space-y-4 rounded-xl border p-6'>
      <h1 className='text-app-text-primary text-xl font-bold'>
        {user?.role === 'tecnico'
          ? 'Tu espacio de trabajo es Mis tareas'
          : 'Acceso no disponible para este perfil'}
      </h1>
      <p className='text-app-text-secondary text-sm'>
        {user?.role === 'tecnico'
          ? 'Planeación, horarios y edición de órdenes son funciones del jefe. Consultá tu OT desde el detalle de la tarea.'
          : 'Se requiere una sesión activa con el perfil correspondiente.'}
      </p>
      <Link
        href={
          user?.role === 'tecnico'
            ? '/dashboard/mis-tareas'
            : user
              ? '/dashboard'
              : '/login'
        }
        className='bg-shPrimary-800 inline-block rounded-lg px-4 py-2 text-sm font-semibold text-white'
      >
        {user?.role === 'tecnico'
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
