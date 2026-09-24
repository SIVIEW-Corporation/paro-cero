'use client';

import { useSyncExternalStore } from 'react';
import { useAuthStore } from '@/store/auth-store';

function identity(state: ReturnType<typeof useAuthStore.getState>) {
  return JSON.stringify([
    state.user?.id,
    state.user?.company_id,
    state.user?.role,
    state.user?.is_active,
    Boolean(state.accessToken),
  ]);
}

// An epoch also isolates logout/login to the same identity. Token refresh alone
// does not reset a form, and bearer tokens never enter React Query keys.
let sessionEpoch = 0;
useAuthStore.subscribe((state, previous) => {
  if (identity(state) !== identity(previous)) sessionEpoch += 1;
});

function sessionKey() {
  return `${sessionEpoch}:${identity(useAuthStore.getState())}`;
}

const serverSnapshot = () => 'assets:server';

const subscribe = (listener: () => void) => useAuthStore.subscribe(listener);

export interface AssetSession {
  key: string;
  companyId: string;
  canRead: boolean;
  canManage: boolean;
}

export function useAssetSession(): AssetSession {
  const key = useSyncExternalStore(subscribe, sessionKey, serverSnapshot);
  if (key === serverSnapshot())
    return { key, companyId: '', canRead: false, canManage: false };
  const { user, accessToken } = useAuthStore.getState();
  const canRead = Boolean(
    accessToken &&
    user?.id?.trim() &&
    user.company_id?.trim() &&
    user.is_active,
  );

  return {
    key,
    companyId: user?.company_id ?? '',
    canRead,
    canManage:
      canRead && (user?.role === 'admin' || user?.role === 'superadmin'),
  };
}

export function isAssetSessionCurrent(session: AssetSession) {
  return session.canRead && session.key === sessionKey();
}

export function assetListKey(session: AssetSession) {
  return ['assets', session.key, 'list'] as const;
}
