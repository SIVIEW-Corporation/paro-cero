'use client';

import { ReportsScreen } from '@/app/screens2';
import { useWorkOrdersStore } from '@/app/stores/useWorkOrdersStore';
import { useAuthStore } from '@/store/auth-store';
import { getRolePermissions } from '@/features/technician/access';

export default function ReportsPage() {
  const wo = useWorkOrdersStore((state) => state.ordenes);
  const role = useAuthStore((state) => state.user?.role);

  return (
    <ReportsScreen
      wo={wo}
      canManageDemoData={getRolePermissions(role)?.workOrders.edit ?? false}
    />
  );
}
