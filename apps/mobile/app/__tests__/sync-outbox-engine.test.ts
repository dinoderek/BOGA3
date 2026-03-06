/* eslint-disable import/first */

import type { PendingSyncEvent } from '@/src/sync/outbox';

const mockApplySyncIngestResponse = jest.fn();
const mockGetSyncDeliveryState = jest.fn();
const mockListPendingSyncEvents = jest.fn();
const mockMarkSyncAttemptStarted = jest.fn();
const mockRecordSyncTransportFailure = jest.fn();

jest.mock('@/src/sync/outbox', () => {
  const actual = jest.requireActual('@/src/sync/outbox');
  return {
    ...actual,
    applySyncIngestResponse: (...args: unknown[]) => mockApplySyncIngestResponse(...args),
    getSyncDeliveryState: (...args: unknown[]) => mockGetSyncDeliveryState(...args),
    listPendingSyncEvents: (...args: unknown[]) => mockListPendingSyncEvents(...args),
    markSyncAttemptStarted: (...args: unknown[]) => mockMarkSyncAttemptStarted(...args),
    recordSyncTransportFailure: (...args: unknown[]) => mockRecordSyncTransportFailure(...args),
  };
});

import {
  __resetSyncEngineForTests,
  calculateBackoffDelayMs,
  flushSyncOutbox,
  setSyncIngestTransport,
  setSyncNetworkOnline,
  SYNC_BACKOFF_INITIAL_DELAY_MS,
  SYNC_BACKOFF_JITTER_RATIO,
  SYNC_BACKOFF_MAX_DELAY_MS,
  SYNC_BACKOFF_MULTIPLIER,
  type SyncIngestTransport,
} from '@/src/sync';

const createPendingEvents = (): PendingSyncEvent[] => [
  {
    eventId: 'event-1',
    sequenceInDevice: 1,
    occurredAt: new Date('2026-03-06T10:00:00.000Z'),
    entityType: 'sessions',
    entityId: 'session-1',
    eventType: 'upsert',
    payload: { id: 'session-1' },
    schemaVersion: 1,
    traceId: null,
  },
  {
    eventId: 'event-2',
    sequenceInDevice: 2,
    occurredAt: new Date('2026-03-06T10:00:01.000Z'),
    entityType: 'exercise_sets',
    entityId: 'set-1',
    eventType: 'upsert',
    payload: { id: 'set-1' },
    schemaVersion: 1,
    traceId: null,
  },
];

const createTransport = (
  ingestBatch: SyncIngestTransport['ingestBatch']
): jest.Mocked<SyncIngestTransport> => ({
  ingestBatch: jest.fn(ingestBatch),
});

describe('sync outbox engine', () => {
  beforeEach(() => {
    __resetSyncEngineForTests();
    setSyncIngestTransport(null);
    setSyncNetworkOnline(true);

    mockApplySyncIngestResponse.mockReset();
    mockGetSyncDeliveryState.mockReset();
    mockListPendingSyncEvents.mockReset();
    mockMarkSyncAttemptStarted.mockReset();
    mockRecordSyncTransportFailure.mockReset();

    mockGetSyncDeliveryState.mockResolvedValue({
      id: 'primary',
      deviceId: 'device-1',
      nextSequenceInDevice: 3,
      consecutiveFailures: 0,
      retryBlocked: false,
      nextAttemptAt: null,
      lastAttemptAt: null,
      lastSuccessAt: null,
      lastErrorMessage: null,
      updatedAt: new Date('2026-03-06T10:00:00.000Z'),
    });
    mockListPendingSyncEvents.mockResolvedValue(createPendingEvents());
    mockMarkSyncAttemptStarted.mockResolvedValue(undefined);
    mockRecordSyncTransportFailure.mockResolvedValue(new Date('2026-03-06T10:00:02.000Z'));
  });

  afterEach(() => {
    setSyncIngestTransport(null);
    setSyncNetworkOnline(true);
    __resetSyncEngineForTests();
  });

  it('returns disabled when no transport is configured', async () => {
    const result = await flushSyncOutbox();
    expect(result).toEqual({ status: 'disabled' });
  });

  it('returns offline when network is offline', async () => {
    setSyncIngestTransport(createTransport(async () => ({ status: 'SUCCESS' })));
    setSyncNetworkOnline(false);

    const result = await flushSyncOutbox();
    expect(result).toEqual({ status: 'offline' });
    expect(mockGetSyncDeliveryState).toHaveBeenCalledTimes(0);
  });

  it('returns blocked when delivery state blocks retries', async () => {
    setSyncIngestTransport(createTransport(async () => ({ status: 'SUCCESS' })));
    mockGetSyncDeliveryState.mockResolvedValueOnce({
      id: 'primary',
      deviceId: 'device-1',
      nextSequenceInDevice: 3,
      consecutiveFailures: 2,
      retryBlocked: true,
      nextAttemptAt: null,
      lastAttemptAt: null,
      lastSuccessAt: null,
      lastErrorMessage: 'invalid',
      updatedAt: new Date('2026-03-06T10:00:00.000Z'),
    });

    const result = await flushSyncOutbox();
    expect(result).toEqual({ status: 'blocked' });
  });

  it('returns backoff when next_attempt_at is in the future', async () => {
    const now = new Date('2026-03-06T10:00:00.000Z');
    const nextAttemptAt = new Date('2026-03-06T10:00:10.000Z');
    setSyncIngestTransport(createTransport(async () => ({ status: 'SUCCESS' })));
    mockGetSyncDeliveryState.mockResolvedValueOnce({
      id: 'primary',
      deviceId: 'device-1',
      nextSequenceInDevice: 3,
      consecutiveFailures: 1,
      retryBlocked: false,
      nextAttemptAt,
      lastAttemptAt: null,
      lastSuccessAt: null,
      lastErrorMessage: 'boom',
      updatedAt: now,
    });

    const result = await flushSyncOutbox({ now });
    expect(result).toEqual({ status: 'backoff', nextAttemptAt });
  });

  it('sends a batch and reports success when ingest returns SUCCESS', async () => {
    const transport = createTransport(async () => ({ status: 'SUCCESS' }));
    setSyncIngestTransport(transport);
    mockApplySyncIngestResponse.mockResolvedValueOnce({
      status: 'success',
      removedCount: 2,
    });

    const result = await flushSyncOutbox({ now: new Date('2026-03-06T10:01:00.000Z') });

    expect(result).toEqual({ status: 'success', sentCount: 2 });
    expect(transport.ingestBatch).toHaveBeenCalledTimes(1);
    expect(mockApplySyncIngestResponse).toHaveBeenCalledWith(
      expect.objectContaining({
        response: { status: 'SUCCESS' },
      })
    );
  });

  it('applies FAILURE responses and reports retry scheduling', async () => {
    const transport = createTransport(async () => ({
      status: 'FAILURE',
      error_index: 1,
      should_retry: true,
      message: 'transient',
    }));
    setSyncIngestTransport(transport);
    const nextAttemptAt = new Date('2026-03-06T10:01:02.000Z');
    mockApplySyncIngestResponse.mockResolvedValueOnce({
      status: 'failure_retry_scheduled',
      removedCount: 1,
      nextAttemptAt,
    });

    const result = await flushSyncOutbox({ now: new Date('2026-03-06T10:01:00.000Z') });

    expect(result).toEqual({ status: 'failure_retry_scheduled', sentCount: 2, nextAttemptAt });
  });

  it('maps non-retry failures to failure_blocked', async () => {
    const transport = createTransport(async () => ({
      status: 'FAILURE',
      error_index: 0,
      should_retry: false,
      message: 'invalid',
    }));
    setSyncIngestTransport(transport);
    mockApplySyncIngestResponse.mockResolvedValueOnce({
      status: 'failure_blocked',
      removedCount: 0,
    });

    const result = await flushSyncOutbox();
    expect(result).toEqual({ status: 'failure_blocked', sentCount: 2 });
  });

  it('uses an in-flight guard to reject concurrent flush requests', async () => {
    const deferred: {
      resolve: (value: { status: 'SUCCESS' }) => void;
      promise: Promise<{ status: 'SUCCESS' }>;
    } = {
      resolve: () => undefined,
      promise: Promise.resolve({ status: 'SUCCESS' }),
    };
    deferred.promise = new Promise<{ status: 'SUCCESS' }>((resolve) => {
      deferred.resolve = resolve;
    });
    const transport = createTransport(async () => deferred.promise);
    setSyncIngestTransport(transport);
    mockApplySyncIngestResponse.mockResolvedValue({
      status: 'success',
      removedCount: 2,
    });

    const firstPromise = flushSyncOutbox();
    const second = await flushSyncOutbox();
    expect(second).toEqual({ status: 'in_flight' });

    deferred.resolve({ status: 'SUCCESS' });
    const first = await firstPromise;
    expect(first).toEqual({ status: 'success', sentCount: 2 });
  });

  it('records transport failures and returns transport_failure', async () => {
    const transport = createTransport(async () => {
      throw new Error('network down');
    });
    setSyncIngestTransport(transport);
    const nextAttemptAt = new Date('2026-03-06T10:02:00.000Z');
    mockRecordSyncTransportFailure.mockResolvedValueOnce(nextAttemptAt);

    const result = await flushSyncOutbox();

    expect(result).toEqual({
      status: 'transport_failure',
      sentCount: 2,
      nextAttemptAt,
      message: 'network down',
    });
  });

  it('uses the locked backoff constants', () => {
    expect(SYNC_BACKOFF_INITIAL_DELAY_MS).toBe(2_000);
    expect(SYNC_BACKOFF_MULTIPLIER).toBe(2);
    expect(SYNC_BACKOFF_MAX_DELAY_MS).toBe(120_000);
    expect(SYNC_BACKOFF_JITTER_RATIO).toBe(0.25);

    expect(calculateBackoffDelayMs(1, () => 0.5)).toBe(2_000);
    expect(calculateBackoffDelayMs(2, () => 0.5)).toBe(4_000);
    expect(calculateBackoffDelayMs(3, () => 0.5)).toBe(8_000);
    expect(calculateBackoffDelayMs(50, () => 0.5)).toBe(120_000);
  });
});
