'use client';

import { useEffect, useState } from 'react';
import { Dashboard } from '@/app/screens/screens1';
import { useWorkOrdersStore } from '@/app/stores/useWorkOrdersStore';

export default function DashboardPage() {
  const [isHydrated, setIsHydrated] = useState(false);
  const wo = useWorkOrdersStore((state) => state.ordenes);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return null;
  }

  return <Dashboard wo={wo} />;
}
