import {
  REFRESH_OUTCOME,
  type RefreshOutcome,
  type SessionTokens,
} from './types';

/**
 * Pure refresh logic: response classification and a per-instance single-flight
 * coordinator. Serverless instances do not share memory; the backend's 409
 * grace window covers cross-instance races.
 */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function optionalSeconds(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? value
    : null;
}

/** Extracts the token pair from a login/refresh body, or `null` if malformed. */
export function parseTokenResponse(body: unknown): SessionTokens | null {
  if (!isRecord(body)) return null;
  const { access_token: accessToken, refresh_token: refreshToken } = body;
  if (typeof accessToken !== 'string' || accessToken.length === 0) return null;
  if (typeof refreshToken !== 'string' || refreshToken.length === 0)
    return null;
  return {
    accessToken,
    refreshToken,
    expiresIn: optionalSeconds(body.expires_in),
    refreshExpiresIn: optionalSeconds(body.refresh_expires_in),
  };
}

/**
 * 200 → ok (malformed body → transient), 401/400/403/422 → unauthorized,
 * 409 → conflict (rotated within the grace window), anything else → transient.
 */
export function classifyRefreshResponse(
  status: number,
  body: unknown,
): RefreshOutcome {
  if (status === 200) {
    const tokens = parseTokenResponse(body);
    return tokens
      ? { kind: REFRESH_OUTCOME.OK, tokens }
      : { kind: REFRESH_OUTCOME.TRANSIENT };
  }
  if (status === 409) return { kind: REFRESH_OUTCOME.CONFLICT };
  if ([400, 401, 403, 422].includes(status))
    return { kind: REFRESH_OUTCOME.UNAUTHORIZED };
  return { kind: REFRESH_OUTCOME.TRANSIENT };
}

interface MinimalResponse {
  status: number;
  json: () => Promise<unknown>;
}

/** Runs one refresh request through `send`; network errors are transient. */
export async function performRefreshRequest(
  refreshToken: string,
  send: (body: { refresh_token: string }) => Promise<MinimalResponse>,
): Promise<RefreshOutcome> {
  let response: MinimalResponse;
  try {
    response = await send({ refresh_token: refreshToken });
  } catch {
    return { kind: REFRESH_OUTCOME.TRANSIENT };
  }
  const body =
    response.status === 200 ? await response.json().catch(() => null) : null;
  return classifyRefreshResponse(response.status, body);
}

/** Hex SHA-256 via Web Crypto (works in Node, Edge and the proxy). */
export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
}

export interface RefreshCoordinatorDeps {
  /** `clientIp` is forwarded for backend rate limiting; it is not part of the key. */
  performRefresh: (
    refreshToken: string,
    clientIp?: string,
  ) => Promise<RefreshOutcome>;
  hashToken: (refreshToken: string) => Promise<string>;
  now: () => number;
  /** How long settled ok/unauthorized results are reused (default 10 s). */
  cacheTtlMs?: number;
  maxEntries?: number;
}

interface FlightEntry {
  promise: Promise<RefreshOutcome>;
  /** `Infinity` while in flight. */
  expiresAt: number;
}

const DEFAULT_CACHE_TTL_MS = 10_000;
const DEFAULT_MAX_ENTRIES = 500;

/**
 * Concurrent refreshes of the same token (keyed by its SHA-256) share one
 * backend call; ok/unauthorized results are reused for a short TTL so late
 * requests carrying the old cookie get the same rotated pair.
 */
export function createRefreshCoordinator({
  performRefresh,
  hashToken,
  now,
  cacheTtlMs = DEFAULT_CACHE_TTL_MS,
  maxEntries = DEFAULT_MAX_ENTRIES,
}: RefreshCoordinatorDeps) {
  const flights = new Map<string, FlightEntry>();

  const prune = () => {
    const current = now();
    for (const [key, entry] of flights) {
      if (entry.expiresAt <= current) flights.delete(key);
    }
    while (flights.size > maxEntries) {
      const oldest = flights.keys().next().value;
      if (oldest === undefined) break;
      flights.delete(oldest);
    }
  };

  return async function refresh(
    refreshToken: string,
    clientIp?: string,
  ): Promise<RefreshOutcome> {
    const key = await hashToken(refreshToken);
    prune();
    const existing = flights.get(key);
    if (existing) return existing.promise;

    const entry: FlightEntry = {
      expiresAt: Number.POSITIVE_INFINITY,
      promise: performRefresh(refreshToken, clientIp)
        .catch((): RefreshOutcome => ({ kind: REFRESH_OUTCOME.TRANSIENT }))
        .then((outcome) => {
          const cacheable =
            outcome.kind === REFRESH_OUTCOME.OK ||
            outcome.kind === REFRESH_OUTCOME.UNAUTHORIZED;
          if (cacheable) entry.expiresAt = now() + cacheTtlMs;
          else if (flights.get(key) === entry) flights.delete(key);
          return outcome;
        }),
    };
    flights.set(key, entry);
    return entry.promise;
  };
}
