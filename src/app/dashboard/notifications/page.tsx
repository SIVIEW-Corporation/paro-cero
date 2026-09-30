'use client';

import { NotificationsScreen } from '@/app/screens2';
import { useNotificacionesStore } from '@/app/stores/useNotificacionesStore';
import { useAuthStore } from '@/store/auth-store';
import { getRolePermissions } from '@/features/technician/access';

export default function NotificationsPage() {
  const notifs = useNotificacionesStore((state) => state.notificaciones);
  const setNotifs = useNotificacionesStore((state) => state.setNotificaciones);
  const role = useAuthStore((state) => state.user?.role);

  return (
    <NotificationsScreen
      notifs={notifs}
      setNotifs={setNotifs}
      canMarkRead={getRolePermissions(role)?.notifications.markRead ?? false}
    />
  );
}
