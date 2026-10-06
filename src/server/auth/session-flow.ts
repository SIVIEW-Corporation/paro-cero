import { isAccessTokenValid } from '@/lib/session-token';
import {
  REFRESH_OUTCOME,
  type RefreshOutcome,
  type SessionTokens,
} from './types';

/**
 * Pure "call the backend with a valid access token" flow shared by the
 * generic forwarder, `/api/auth/session` and `/api/auth/logout-all`.
 */

/** Tokens expiring within this window are refreshed proactively. */
export const ACCESS_EXPIRY_SKEW_MS = 10_000;

export const SESSION_FLOW = {
  RESPONSE: 'response',
  CONFLICT: 'conflict',
  EXPIRED: 'expired',
  TRANSIENT: 'transient',
} as const;

export type SessionFlowResult =
  | {
      kind: typeof SESSION_FLOW.RESPONSE;
      response: Response;
      /** New pair to persist when the flow rotated the session. */
      tokens: SessionTokens | null;
    }
  | { kind: typeof SESSION_FLOW.CONFLICT }
  | { kind: typeof SESSION_FLOW.EXPIRED }
  | { kind: typeof SESSION_FLOW.TRANSIENT };

export interface SessionFlowInput {
  accessToken?: string;
  refreshToken?: string;
  nowMs: number;
  refresh: (refreshToken: string) => Promise<RefreshOutcome>;
  call: (accessToken: string) => Promise<Response>;
}

export function isAccessUsable(
  accessToken: string | undefined,
  nowMs: number,
): accessToken is string {
  return isAccessTokenValid(accessToken, nowMs + ACCESS_EXPIRY_SKEW_MS);
}

async function discard(response: Response) {
  try {
    await response.body?.cancel();
  } catch {
    // The body may already be consumed or locked; nothing to release.
  }
}

/**
 * Valid access → call. Missing/expired access or a backend 401 → refresh once:
 * ok → call (again) with the new token; conflict/transient → surfaced so the
 * client retries; unauthorized (or no refresh cookie) → expired. A 401 with a
 * freshly rotated token is also treated as expired.
 */
export async function runWithSession({
  accessToken,
  refreshToken,
  nowMs,
  refresh,
  call,
}: SessionFlowInput): Promise<SessionFlowResult> {
  if (isAccessUsable(accessToken, nowMs)) {
    const response = await call(accessToken);
    if (response.status !== 401)
      return { kind: SESSION_FLOW.RESPONSE, response, tokens: null };
    await discard(response);
  }

  if (!refreshToken) return { kind: SESSION_FLOW.EXPIRED };

  const outcome = await refresh(refreshToken);
  switch (outcome.kind) {
    case REFRESH_OUTCOME.CONFLICT:
      return { kind: SESSION_FLOW.CONFLICT };
    case REFRESH_OUTCOME.TRANSIENT:
      return { kind: SESSION_FLOW.TRANSIENT };
    case REFRESH_OUTCOME.UNAUTHORIZED:
      return { kind: SESSION_FLOW.EXPIRED };
    case REFRESH_OUTCOME.OK: {
      const response = await call(outcome.tokens.accessToken);
      if (response.status === 401) {
        await discard(response);
        return { kind: SESSION_FLOW.EXPIRED };
      }
      return {
        kind: SESSION_FLOW.RESPONSE,
        response,
        tokens: outcome.tokens,
      };
    }
  }
}
