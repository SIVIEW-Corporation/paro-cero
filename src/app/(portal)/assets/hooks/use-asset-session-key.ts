'use client';

import { useSyncExternalStore } from 'react';
import { useAuthStore } from '@/store/auth-store';

type AuthSnapshot = ReturnType<typeof useAuthStore.getState>;

interface AssetSessionSource {
  user?: Pick<
    NonNullable<AuthSnapshot['user']>,
    'id' | 'company_id' | 'role' | 'is_active'
  > | null;
  accessToken?: string | null;
}

/** Snapshot returned during SSR / before hydration; queries stay disabled. */
export const SERVER_SESSION_KEY = 'server';

/**
 * Identity used to scope asset query keys. Token refresh alone does not change
 * it, and the bearer token itself never enters a query key.
 */
export function assetSessionKey(state: AssetSessionSource): string {
  return JSON.stringify([
    state.user?.id ?? null,
    state.user?.company_id ?? null,
    state.user?.role ?? null,
    state.user?.is_active ?? null,
    Boolean(state.accessToken),
  ]);
}

const subscribe = (listener: () => void) => useAuthStore.subscribe(listener);
const getSnapshot = () => assetSessionKey(useAuthStore.getState());
const getServerSnapshot = () => SERVER_SESSION_KEY;

export function useAssetSessionKey(): string {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
