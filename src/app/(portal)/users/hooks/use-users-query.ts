'use client';

import { useQuery } from '@tanstack/react-query';
import { operatorsService } from '../services/operators-service';

export function useUsersQuery(page: number, size: number = 10) {
  return useQuery({
    queryKey: ['users', 'list', { page, size }],
    queryFn: () => operatorsService.getUsers(page, size),
    placeholderData: (prev) => prev,
  });
}
