'use client';

import PlanningScreen from '@/features/planning/planning-screen';
import { useAuthStore } from '@/store/auth-store';
import { getRolePermissions } from '@/features/technician/access';

export default function PlanningPage() {
  const role = useAuthStore((state) => state.user?.role);
  const readOnly = !(getRolePermissions(role)?.planning.manage ?? false);

  return <PlanningScreen readOnly={readOnly} />;
}
