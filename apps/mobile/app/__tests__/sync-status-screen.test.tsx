import { render, screen, waitFor } from '@testing-library/react-native';

import { SyncStatusScreenShell } from '../sync-status';
import type { SyncStateSnapshot } from '@/src/sync';

const buildSnapshot = (overrides: Partial<SyncStateSnapshot> = {}): SyncStateSnapshot => ({
  id: 'device',
  status: 'never_initialized',
  pausedReason: null,
  lastSuccessfulSyncAt: null,
  lastFailedSyncAt: null,
  lastAttemptedSyncAt: null,
  createdAt: new Date('2026-03-03T10:00:00.000Z'),
  updatedAt: new Date('2026-03-03T10:00:00.000Z'),
  ...overrides,
});

describe('SyncStatusScreenShell', () => {
  it('shows the healthy sync summary and timestamps', async () => {
    const repository = {
      loadState: jest.fn().mockResolvedValue(
        buildSnapshot({
          status: 'idle',
          lastSuccessfulSyncAt: new Date('2026-03-03T09:45:00.000Z'),
          lastAttemptedSyncAt: new Date('2026-03-03T09:45:00.000Z'),
        })
      ),
    };

    render(
      <SyncStatusScreenShell
        now={new Date('2026-03-03T10:00:00.000Z')}
        refreshToken={1}
        syncStateRepository={repository}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('sync-status-current-state-value').props.children).toBe('Healthy');
    });

    expect(screen.getByTestId('sync-status-status-note-value').props.children).toBe('Sync is up to date');
    expect(screen.getByTestId('sync-status-last-successful-value').props.children).toBe('2026-03-03 09:45');
    expect(screen.getByTestId('sync-status-pause-reason-value').props.children).toBe('None');
  });

  it('shows a calm paused state for offline sync', async () => {
    const repository = {
      loadState: jest.fn().mockResolvedValue(
        buildSnapshot({
          status: 'paused',
          pausedReason: 'offline',
          lastFailedSyncAt: new Date('2026-03-03T09:40:00.000Z'),
          lastAttemptedSyncAt: new Date('2026-03-03T09:40:00.000Z'),
        })
      ),
    };

    render(
      <SyncStatusScreenShell
        now={new Date('2026-03-03T10:00:00.000Z')}
        refreshToken={1}
        syncStateRepository={repository}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('sync-status-current-state-value').props.children).toBe('Waiting');
    });

    expect(screen.getByTestId('sync-status-status-note-value').props.children).toBe('Waiting for connection');
    expect(screen.getByTestId('sync-status-pause-reason-value').props.children).toBe('Device is offline');
    expect(screen.getByTestId('sync-status-last-failed-value').props.children).toBe('2026-03-03 09:40');
  });

  it('shows an explicit fallback when sync status cannot be loaded', async () => {
    const repository = {
      loadState: jest.fn().mockRejectedValue(new Error('boom')),
    };

    render(<SyncStatusScreenShell refreshToken={1} syncStateRepository={repository} />);

    await waitFor(() => {
      expect(screen.getByText('Sync status is unavailable right now')).toBeTruthy();
    });

    expect(screen.getByText('boom')).toBeTruthy();
  });
});
