/**
 * Wire protocol shared by the browser api-client and the BFF route handlers.
 * Pure module: safe to import from client, server and proxy code.
 */

/** Same-origin BFF prefixes. The browser never talks to the backend directly. */
export const BFF_BACKEND_PREFIX = '/api/backend';
export const BFF_AUTH_PREFIX = '/api/auth';

/** Custom header required on every BFF request (CSRF defence in depth). */
export const REQUESTED_WITH_HEADER = 'X-Requested-With';
export const REQUESTED_WITH_VALUE = 'paro-cero';

/** 409 + this header: another request is rotating the session; retry shortly. */
export const SESSION_RETRY_HEADER = 'X-Session-Retry';
/** 401 + this header: the session is definitively gone; log out. */
export const SESSION_EXPIRED_HEADER = 'X-Session-Expired';

export const MAX_SESSION_RETRIES = 2;
const RETRY_MIN_DELAY_MS = 300;
const RETRY_DELAY_SPREAD_MS = 300;

export const BFF_ACTION = {
  RETRY: 'retry',
  EXPIRED: 'expired',
  TRANSIENT: 'transient',
  DONE: 'done',
} as const;

export type BffResponseAction =
  | { type: typeof BFF_ACTION.RETRY; delayMs: number }
  | { type: typeof BFF_ACTION.EXPIRED }
  | { type: typeof BFF_ACTION.TRANSIENT }
  | { type: typeof BFF_ACTION.DONE };

interface HeaderReader {
  get(name: string): string | null;
}

/** Jittered delay between 300 and 600 ms (inclusive). */
export function sessionRetryDelayMs(random: () => number = Math.random) {
  const sample = Math.min(Math.max(random(), 0), 0.9999999);
  return RETRY_MIN_DELAY_MS + Math.floor(sample * (RETRY_DELAY_SPREAD_MS + 1));
}

/**
 * Decides what the client does with a BFF response.
 * `attempt` is the number of session retries already performed.
 */
export function classifyBffResponse(
  status: number,
  headers: HeaderReader,
  attempt: number,
  random: () => number = Math.random,
): BffResponseAction {
  if (status === 409 && headers.get(SESSION_RETRY_HEADER) === '1') {
    return attempt < MAX_SESSION_RETRIES
      ? { type: BFF_ACTION.RETRY, delayMs: sessionRetryDelayMs(random) }
      : { type: BFF_ACTION.TRANSIENT };
  }
  if (status === 401 && headers.get(SESSION_EXPIRED_HEADER) === '1')
    return { type: BFF_ACTION.EXPIRED };
  if (status === 503) return { type: BFF_ACTION.TRANSIENT };
  return { type: BFF_ACTION.DONE };
}
