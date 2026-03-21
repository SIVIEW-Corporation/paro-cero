'use client';

import { useEffect, useState, type ReactNode } from 'react';

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true); // eslint-disable-line react-hooks/set-state-in-effect -- Intentional for hydration
  }, []);

  if (!hasMounted) {
    return fallback;
  }

  return children;
}
