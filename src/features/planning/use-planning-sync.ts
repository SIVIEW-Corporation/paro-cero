'use client';

import { useEffect } from 'react';
import { STORAGE_KEY, usePlanningStore } from './store';

/** Shared browser-local demo data. This is not a multi-user backend sync. */
export function usePlanningSync() {
  const initialize = usePlanningStore((state) => state.initialize);
  const sync = usePlanningStore((state) => state.sync);
  useEffect(() => {
    initialize();
    sync();
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null) sync();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', sync);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', sync);
    };
  }, [initialize, sync]);
}
