import { useEffect, useState } from 'react';

import { createSyncStateRepository } from '@/src/data';

import type { SyncStateSnapshot } from './types';

export type SyncStateReader = {
  loadState(options?: { now?: Date }): Promise<SyncStateSnapshot>;
  __isFallback?: boolean;
  fallbackSnapshot?: SyncStateSnapshot;
};

const createFallbackSnapshot = (now: Date = new Date()): SyncStateSnapshot => ({
  id: 'device',
  status: 'never_initialized',
  pausedReason: null,
  lastSuccessfulSyncAt: null,
  lastFailedSyncAt: null,
  lastAttemptedSyncAt: null,
  createdAt: now,
  updatedAt: now,
});

const createDefaultReader = (): SyncStateReader => {
  const repositoryFactory = createSyncStateRepository as unknown;

  if (typeof repositoryFactory === 'function') {
    return createSyncStateRepository();
  }

  return {
    __isFallback: true,
    fallbackSnapshot: createFallbackSnapshot(),
    async loadState({ now = new Date() }: { now?: Date } = {}) {
      return createFallbackSnapshot(now);
    },
  };
};

export const useSyncStateSnapshot = ({
  repository,
  refreshToken = 0,
  pollIntervalMs = 15_000,
}: {
  repository?: SyncStateReader;
  refreshToken?: number;
  pollIntervalMs?: number;
}) => {
  const [defaultRepository] = useState<SyncStateReader>(() => createDefaultReader());
  const activeRepository = repository ?? defaultRepository;
  const [snapshot, setSnapshot] = useState<SyncStateSnapshot | null>(
    !repository && activeRepository.__isFallback ? activeRepository.fallbackSnapshot ?? createFallbackSnapshot() : null
  );
  const [isLoading, setIsLoading] = useState(() => !(!repository && activeRepository.__isFallback));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!repository && activeRepository.__isFallback) {
      return;
    }

    let cancelled = false;

    const loadSnapshot = async (options?: { keepExistingData?: boolean }) => {
      if (!options?.keepExistingData) {
        setIsLoading(true);
      }

      setErrorMessage(null);

      try {
        const nextSnapshot = await activeRepository.loadState();

        if (cancelled) {
          return;
        }

        setSnapshot(nextSnapshot);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setErrorMessage(error instanceof Error ? error.message : 'Unable to load sync status.');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadSnapshot();

    if (pollIntervalMs <= 0) {
      return () => {
        cancelled = true;
      };
    }

    const intervalId = globalThis.setInterval(() => {
      void loadSnapshot({ keepExistingData: true });
    }, pollIntervalMs);

    return () => {
      cancelled = true;
      globalThis.clearInterval(intervalId);
    };
  }, [activeRepository, pollIntervalMs, refreshToken, repository]);

  return {
    snapshot,
    isLoading,
    errorMessage,
  };
};
