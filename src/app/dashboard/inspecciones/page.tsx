'use client';

import { InspeccionesScreen } from '@/app/screens3';
import { useInspeccionesStore } from '@/app/stores/useInspeccionesStore';
import { useAuthStore } from '@/store/auth-store';
import { getRolePermissions } from '@/features/technician/access';

export default function InspeccionesPage() {
  const checklists = useInspeccionesStore((state) => state.checklists);
  const setChecklists = useInspeccionesStore((state) => state.setChecklists);
  const hallazgos = useInspeccionesStore((state) => state.hallazgos);
  const setHallazgos = useInspeccionesStore((state) => state.setHallazgos);
  const plantillas = useInspeccionesStore((state) => state.plantillas);
  const setPlantillas = useInspeccionesStore((state) => state.setPlantillas);
  const role = useAuthStore((state) => state.user?.role);
  const permissions = getRolePermissions(role);

  return (
    <InspeccionesScreen
      checklists={checklists}
      setChecklists={setChecklists}
      hallazgos={hallazgos}
      setHallazgos={setHallazgos}
      plantillas={plantillas}
      setPlantillas={setPlantillas}
      canManage={permissions?.inspections.manage ?? false}
      canExecute={permissions?.inspections.execute ?? false}
      canRegisterFinding={permissions?.inspections.registerFinding ?? false}
      canCreateWorkOrder={permissions?.inspections.createWorkOrder ?? false}
    />
  );
}
