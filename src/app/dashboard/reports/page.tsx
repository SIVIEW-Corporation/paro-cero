'use client';

import { ReportsScreen } from '@/app/screens2';
import { useWorkOrdersStore } from '@/app/stores/useWorkOrdersStore';

export default function ReportsPage() {
  const wo = useWorkOrdersStore((state) => state.ordenes);

  return <ReportsScreen wo={wo} />;
}
