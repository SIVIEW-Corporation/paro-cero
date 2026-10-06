/**
 * Browser-side session signalling: a single central "session expired" hook and
 * multi-tab sync over BroadcastChannel (fallback: the `storage` event).
 * Dependency-free so the api-client can import it anywhere.
 */

export const AUTH_EVENT = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  EXPIRED: 'expired',
} as const;

export type AuthEventType = (typeof AUTH_EVENT)[keyof typeof AUTH_EVENT];

const CHANNEL_NAME = 'paro-cero-auth';
const STORAGE_KEY = 'paro-cero-auth-event';
const AUTH_EVENT_TYPES = new Set<string>(Object.values(AUTH_EVENT));

let channel: BroadcastChannel | null | undefined;

function getChannel(): BroadcastChannel | null {
  if (channel !== undefined) return channel;
  channel =
    typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined'
      ? new BroadcastChannel(CHANNEL_NAME)
      : null;
  return channel;
}

function parseEvent(value: unknown): AuthEventType | null {
  const type =
    typeof value === 'object' && value !== null && 'type' in value
      ? (value as { type: unknown }).type
      : null;
  return typeof type === 'string' && AUTH_EVENT_TYPES.has(type)
    ? (type as AuthEventType)
    : null;
}

/** Notifies the other tabs (never the current one). */
export function publishAuthEvent(type: AuthEventType) {
  if (typeof window === 'undefined') return;
  const message = { type, at: Date.now() };
  const bc = getChannel();
  if (bc) {
    bc.postMessage(message);
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(message));
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage may be unavailable (private mode); other tabs resync on use.
  }
}

/** Listens for auth events from other tabs. Returns an unsubscribe function. */
export function subscribeAuthEvents(listener: (type: AuthEventType) => void) {
  if (typeof window === 'undefined') return () => {};
  const bc = getChannel();
  if (bc) {
    const onMessage = (event: MessageEvent) => {
      const type = parseEvent(event.data);
      if (type) listener(type);
    };
    bc.addEventListener('message', onMessage);
    return () => bc.removeEventListener('message', onMessage);
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY || !event.newValue) return;
    try {
      const type = parseEvent(JSON.parse(event.newValue));
      if (type) listener(type);
    } catch {
      // Ignore malformed payloads.
    }
  };
  window.addEventListener('storage', onStorage);
  return () => window.removeEventListener('storage', onStorage);
}

let expiredHandler: (() => void) | null = null;
let expiring = false;

/** Registers the single app-wide handler (see `Providers`). */
export function registerSessionExpiredHandler(handler: () => void) {
  expiredHandler = handler;
  return () => {
    if (expiredHandler === handler) expiredHandler = null;
  };
}

/** Builds `/login?next=<current path>` for the current location. */
export function loginUrlForCurrentLocation(): string {
  if (typeof window === 'undefined') return '/login';
  const { pathname, search } = window.location;
  if (pathname === '/login') return '/login';
  return `/login?next=${encodeURIComponent(`${pathname}${search}`)}`;
}

/**
 * Central "session expired" signal. Runs the registered handler once per page
 * lifetime (concurrent 401s collapse into one logout + redirect).
 */
export function notifySessionExpired() {
  if (typeof window === 'undefined' || expiring) return;
  expiring = true;
  if (expiredHandler) {
    expiredHandler();
    return;
  }
  window.location.assign(loginUrlForCurrentLocation());
}

/** Re-arms the expired signal after a successful login (same page lifetime). */
export function resetSessionExpired() {
  expiring = false;
}
