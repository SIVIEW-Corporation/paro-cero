'use client';

import { useQuery } from '@tanstack/react-query';
import { AssetApiError, assetsService } from '../services/assets-service';
import { isUuid } from '../lib/is-uuid';
import type { AssetListParams } from '../types';
import { assetKeys } from './asset-query-keys';
import {
  SERVER_SESSION_KEY,
  useAssetSessionKey,
} from './use-asset-session-key';

/** Client errors (4xx) are deterministic: retrying only delays the message. */
function shouldRetry(failureCount: number, error: Error): boolean {
  if (
    error instanceof AssetApiError &&
    error.status >= 400 &&
    error.status < 500
  ) {
    return false;
  }
  return failureCount < 2;
}

export function useAssetsQuery(params: AssetListParams) {
  const session = useAssetSessionKey();
  const listParams: AssetListParams = {
    page: params.page,
    size: params.size,
    criticality: params.criticality ?? null,
    status: params.status ?? null,
  };

  return useQuery({
    queryKey: assetKeys.list(session, listParams),
    queryFn: () => assetsService.listAssets(listParams),
    enabled: session !== SERVER_SESSION_KEY,
    placeholderData: (previous) => previous,
    retry: shouldRetry,
  });
}

/** Single asset by id. Invalid ids never reach the API (treated as not found). */
export function useAssetQuery(id: string) {
  const session = useAssetSessionKey();

  return useQuery({
    queryKey: assetKeys.detail(session, id),
    queryFn: () => assetsService.getAssetById(id),
    enabled: session !== SERVER_SESSION_KEY && isUuid(id),
    retry: shouldRetry,
  });
}
