'use client';

import { useQuery } from '@tanstack/react-query';
import { workOrdersService } from '@/services/work-orders-service';
import {
  isWorkOrderSessionCurrent,
  useWorkOrderSession,
  workOrderListKey,
} from '@/hooks/use-work-order-session';

export function useWorkOrdersQuery() {
  const session = useWorkOrderSession();

  return useQuery({
    queryKey: workOrderListKey(session),
    queryFn: async () => {
      return workOrdersService.getAllWorkOrders({
        isRequestCurrent: () => isWorkOrderSessionCurrent(session),
      });
    },
    enabled: session.canRead,
    staleTime: 60 * 1000,
    retry: false,
  });
}
