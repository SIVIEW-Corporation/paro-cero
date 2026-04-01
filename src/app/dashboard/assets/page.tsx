'use client';

import { AssetsScreen } from '@/app/screens/screens1';
import { useWorkOrdersStore } from '@/app/stores/useWorkOrdersStore';

export default function AssetsPage() {
  const wo = useWorkOrdersStore((state) => state.ordenes);

  return <AssetsScreen wo={wo} />;
}
