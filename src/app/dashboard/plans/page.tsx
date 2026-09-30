'use client';

'use client';

import { PlansScreen } from '@/app/screens2';
import { useAuthStore } from '@/store/auth-store';
import { getRolePermissions } from '@/features/technician/access';

export default function PlansPage() {
  const role = useAuthStore((state) => state.user?.role);
  const planPermissions = getRolePermissions(role)?.plans;

  return (
    <PlansScreen
      canManagePlans={planPermissions?.manage ?? false}
      canExecutePlans={planPermissions?.execute ?? false}
    />
  );
}
