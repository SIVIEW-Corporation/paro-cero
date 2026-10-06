/** Token pair returned by the backend login/refresh endpoints (server-only). */
export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
  /** Access token lifetime in seconds, when the backend sent a valid one. */
  expiresIn: number | null;
  /** Refresh token lifetime in seconds, when the backend sent a valid one. */
  refreshExpiresIn: number | null;
}

export const REFRESH_OUTCOME = {
  OK: 'ok',
  CONFLICT: 'conflict',
  UNAUTHORIZED: 'unauthorized',
  TRANSIENT: 'transient',
} as const;

export type RefreshOutcomeKind =
  (typeof REFRESH_OUTCOME)[keyof typeof REFRESH_OUTCOME];

export type RefreshOutcome =
  | { kind: typeof REFRESH_OUTCOME.OK; tokens: SessionTokens }
  | { kind: typeof REFRESH_OUTCOME.CONFLICT }
  | { kind: typeof REFRESH_OUTCOME.UNAUTHORIZED }
  | { kind: typeof REFRESH_OUTCOME.TRANSIENT };
