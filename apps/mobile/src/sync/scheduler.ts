import { flushSyncOutbox, setSyncNetworkOnline, type SyncFlushResult } from './engine';

export const SYNC_GENERAL_CADENCE_MS = 60_000;
export const SYNC_SESSION_RECORDER_CADENCE_MS = 10_000;

export type SyncCadenceContext = 'general' | 'session-recorder';

type TimerHandle = ReturnType<typeof setTimeout>;

export type SyncScheduler = {
  start(): void;
  stop(): void;
  setContext(context: SyncCadenceContext): void;
  setOnline(isOnline: boolean): void;
  getContext(): SyncCadenceContext;
  isRunning(): boolean;
};

export const syncCadenceContextFromPathname = (pathname: string | null | undefined): SyncCadenceContext => {
  if (typeof pathname === 'string' && pathname.startsWith('/session-recorder')) {
    return 'session-recorder';
  }

  return 'general';
};

const cadenceForContext = (context: SyncCadenceContext) =>
  context === 'session-recorder' ? SYNC_SESSION_RECORDER_CADENCE_MS : SYNC_GENERAL_CADENCE_MS;

export const createSyncScheduler = (options: {
  flush?: () => Promise<SyncFlushResult>;
  setTimeoutFn?: (fn: () => void, delayMs: number) => TimerHandle;
  clearTimeoutFn?: (handle: TimerHandle) => void;
} = {}): SyncScheduler => {
  const flush = options.flush ?? (() => flushSyncOutbox());
  const setTimeoutFn = options.setTimeoutFn ?? ((fn, delayMs) => setTimeout(fn, delayMs));
  const clearTimeoutFn = options.clearTimeoutFn ?? ((handle) => clearTimeout(handle));

  let running = false;
  let context: SyncCadenceContext = 'general';
  let online = true;
  let timer: TimerHandle | null = null;

  const clearTimer = () => {
    if (!timer) {
      return;
    }
    clearTimeoutFn(timer);
    timer = null;
  };

  const scheduleNextTick = () => {
    if (!running) {
      return;
    }

    clearTimer();
    timer = setTimeoutFn(() => {
      void tick();
    }, cadenceForContext(context));
  };

  const tick = async () => {
    if (!running) {
      return;
    }

    await flush();
    scheduleNextTick();
  };

  return {
    start() {
      if (running) {
        return;
      }

      running = true;
      scheduleNextTick();
    },
    stop() {
      running = false;
      clearTimer();
    },
    setContext(nextContext) {
      if (context === nextContext) {
        return;
      }

      context = nextContext;
      if (running) {
        scheduleNextTick();
      }
    },
    setOnline(isOnline) {
      if (online === isOnline) {
        return;
      }

      const wasOnline = online;
      online = isOnline;
      setSyncNetworkOnline(isOnline);

      if (!running) {
        return;
      }

      if (!wasOnline && isOnline) {
        void flush();
      }

      scheduleNextTick();
    },
    getContext() {
      return context;
    },
    isRunning() {
      return running;
    },
  };
};

const defaultSyncScheduler = createSyncScheduler();

export const startDefaultSyncScheduler = () => {
  defaultSyncScheduler.start();
};

export const stopDefaultSyncScheduler = () => {
  defaultSyncScheduler.stop();
};

export const setDefaultSyncCadenceContext = (context: SyncCadenceContext) => {
  defaultSyncScheduler.setContext(context);
};

export const setDefaultSyncCadenceContextFromPathname = (pathname: string | null | undefined) => {
  defaultSyncScheduler.setContext(syncCadenceContextFromPathname(pathname));
};

export const setDefaultSyncOnline = (isOnline: boolean) => {
  defaultSyncScheduler.setOnline(isOnline);
};
