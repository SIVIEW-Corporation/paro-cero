'use client';

import { useQuery } from '@tanstack/react-query';
import { assetsService } from '../services/assets-service';

export interface UseAssetsQueryParams {
  page: number;
  size?: number;
  sortBy?: string;
  sortOrder?: string;
  criticality?: string | null;
  status?: string | null;
  area?: string | null;
  code?: string | null;
  serial?: string | null;
  manufacturer?: string | null;
}

export function useAssetsQuery(params: UseAssetsQueryParams) {
  const {
    page,
    size = 10,
    sortBy,
    sortOrder,
    criticality,
    status,
    area,
    code,
    serial,
    manufacturer,
  } = params;

  return useQuery({
    queryKey: [
      'assets',
      'list',
      {
        page,
        size,
        sortBy,
        sortOrder,
        criticality,
        status,
        area,
        code,
        serial,
        manufacturer,
      },
    ],
    queryFn: () =>
      assetsService.getAssets({
        offset: (page - 1) * size,
        limit: size,
        sortBy,
        sortOrder,
        criticality,
        status,
        area,
        code,
        serial,
        manufacturer,
      }),
    placeholderData: (prev) => prev,
  });
}
