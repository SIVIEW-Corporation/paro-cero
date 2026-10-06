import { BACKEND_AUTH_ENDPOINT, backendAuthPost } from './backend';
import {
  createRefreshCoordinator,
  performRefreshRequest,
  sha256Hex,
} from './refresh-core';
import { REFRESH_OUTCOME, type RefreshOutcome } from './types';

/**
 * Per-instance single-flight refresh shared by the proxy, route handlers and
 * server actions of one server instance.
 */
const coordinatedRefresh = createRefreshCoordinator({
  performRefresh: (refreshToken, clientIp = 'unknown') =>
    performRefreshRequest(refreshToken, (body) =>
      backendAuthPost(BACKEND_AUTH_ENDPOINT.REFRESH, body, clientIp),
    ),
  hashToken: sha256Hex,
  now: () => Date.now(),
});

/** Rotates the session; never throws (configuration/network errors are transient). */
export async function refreshSession(
  refreshToken: string,
  clientIp: string,
): Promise<RefreshOutcome> {
  try {
    return await coordinatedRefresh(refreshToken, clientIp);
  } catch {
    return { kind: REFRESH_OUTCOME.TRANSIENT };
  }
}
