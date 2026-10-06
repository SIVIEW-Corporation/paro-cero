'use client';

import { useSyncExternalStore } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { getRolePermissions } from '@/features/technician/access';

function identity(state: ReturnType<typeof useAuthStore.getState>) {
  return JSON.stringify([
    state.user?.id,
    state.user?.company_id,
    state.user?.role,
    state.user?.is_active,
  ]);
}

let sessionEpoch = 0;
useAuthStore.subscribe((state, previous) => {
  if (identity(state) !== identity(previous)) sessionEpoch += 1;
});

function sessionKey() {
  return `${sessionEpoch}:${identity(useAuthStore.getState())}`;
}

const serverSnapshot = () => 'work-orders:server';
const subscribe = (listener: () => void) => useAuthStore.subscribe(listener);

export interface WorkOrderSession {
  key: string;
  userId: string;
  companyId: string;
  role: string;
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
}

export function useWorkOrderSession(): WorkOrderSession {
  const key = useSyncExternalStore(subscribe, sessionKey, serverSnapshot);
  if (key === serverSnapshot()) {
    return {
      key,
      userId: '',
      companyId: '',
      role: '',
      canRead: false,
      canWrite: false,
      canDelete: false,
    };
  }

  const { user } = useAuthStore.getState();
  const activeSession = Boolean(user?.id && user.company_id && user.is_active);
  const role = user?.role ?? '';
  const permissions = getRolePermissions(role);

  return {
    key,
    userId: user?.id ?? '',
    companyId: user?.company_id ?? '',
    role,
    canRead: activeSession && Boolean(permissions?.workOrders.read),
    canWrite:
      activeSession &&
      Boolean(
        permissions?.workOrders.create ||
        permissions?.workOrders.edit ||
        permissions?.workOrders.changeStatus ||
        permissions?.workOrders.manageEvidence,
      ),
    canDelete: activeSession && Boolean(permissions?.workOrders.delete),
  };
}

export function isWorkOrderSessionCurrent(session: WorkOrderSession) {
  return session.canRead && session.key === sessionKey();
}

export function workOrderListKey(session: WorkOrderSession) {
  return ['work-orders', session.key, 'list'] as const;
}
