'use client';

import { NotificationsScreen } from '@/app/screens2';
import { useNotificacionesStore } from '@/app/stores/useNotificacionesStore';

export default function NotificationsPage() {
  const notifs = useNotificacionesStore((state) => state.notificaciones);
  const setNotifs = useNotificacionesStore((state) => state.setNotificaciones);

  return <NotificationsScreen notifs={notifs} setNotifs={setNotifs} />;
}
