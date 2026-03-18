'use client';

import { InspeccionesScreen } from '@/app/screens3';
import { useInspeccionesStore } from '@/app/stores/useInspeccionesStore';

export default function InspeccionesPage() {
  const checklists = useInspeccionesStore((state) => state.checklists);
  const setChecklists = useInspeccionesStore((state) => state.setChecklists);
  const hallazgos = useInspeccionesStore((state) => state.hallazgos);
  const setHallazgos = useInspeccionesStore((state) => state.setHallazgos);
  const plantillas = useInspeccionesStore((state) => state.plantillas);
  const setPlantillas = useInspeccionesStore((state) => state.setPlantillas);

  return (
    <InspeccionesScreen
      checklists={checklists}
      setChecklists={setChecklists}
      hallazgos={hallazgos}
      setHallazgos={setHallazgos}
      plantillas={plantillas}
      setPlantillas={setPlantillas}
    />
  );
}
