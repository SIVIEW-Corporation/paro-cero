'use client';

import { useState, useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { WorkOrdersScreen } from '@/app/screens2';
import { useWorkOrdersStore } from '@/app/stores/useWorkOrdersStore';
import type { OrdenTrabajo } from '@/app/data/types';

export default function WorkOrdersPage() {
  const ordenesStore = useWorkOrdersStore((state) => state.ordenes);
  const setOrdenesStore = useWorkOrdersStore((state) => state.setOrdenes);

  const [wo, setWo] = useState<OrdenTrabajo[]>(ordenesStore);

  useEffect(() => {
    setWo(ordenesStore);
  }, [ordenesStore]);

  const handleSetWo: Dispatch<SetStateAction<OrdenTrabajo[]>> = (value) => {
    const nuevasOrdenes = typeof value === 'function' ? value(wo) : value;
    setWo(nuevasOrdenes);
    setOrdenesStore(nuevasOrdenes);
  };

  return <WorkOrdersScreen wo={wo} setWo={handleSetWo} />;
}
