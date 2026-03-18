'use client';

import { Dashboard } from '@/app/screens/screens1';
import { useWorkOrdersStore } from '@/app/stores/useWorkOrdersStore';

export default function DashboardPage() {
  const wo = useWorkOrdersStore((state) => state.ordenes);

  return <Dashboard wo={wo} />;
}
