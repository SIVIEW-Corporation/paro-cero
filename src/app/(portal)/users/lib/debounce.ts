export interface Debouncer {
  /** Schedule `callback`, replacing any pending one. */
  run: (callback: () => void) => void;
  /** Drop the pending callback, if any. */
  cancel: () => void;
}

/** Trailing-edge debouncer: only the last scheduled callback runs. */
export function createDebouncer(delayMs: number): Debouncer {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const cancel = () => {
    if (timer === null) return;
    clearTimeout(timer);
    timer = null;
  };

  return {
    run: (callback) => {
      cancel();
      timer = setTimeout(() => {
        timer = null;
        callback();
      }, delayMs);
    },
    cancel,
  };
}
