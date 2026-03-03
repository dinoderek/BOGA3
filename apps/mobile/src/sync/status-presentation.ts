import type { SyncPausedReason, SyncStateSnapshot } from './types';

export type SyncStatusTone = 'success' | 'neutral' | 'warning';

export type SyncStatusPresentation = {
  tone: SyncStatusTone;
  statusLabel: string;
  headline: string;
  detail: string;
  pausedReasonLabel: string | null;
};

const padNumber = (value: number) => `${value}`.padStart(2, '0');

export const formatSyncTimestamp = (value: Date | null) => {
  if (!value) {
    return 'Not yet';
  }

  return `${value.getFullYear()}-${padNumber(value.getMonth() + 1)}-${padNumber(value.getDate())} ${padNumber(
    value.getHours()
  )}:${padNumber(value.getMinutes())}`;
};

export const formatSyncAge = (value: Date | null, now: Date) => {
  if (!value) {
    return 'not yet';
  }

  const diffMs = Math.max(0, now.getTime() - value.getTime());
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) {
    return 'just now';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return formatSyncTimestamp(value);
};

export const getSyncPausedReasonLabel = (reason: SyncPausedReason | null) => {
  if (!reason) {
    return null;
  }

  switch (reason) {
    case 'auth_missing':
      return 'No signed-in account';
    case 'auth_expired':
      return 'Signed-in session expired';
    case 'backend_unconfigured':
      return 'Backend not configured on this build';
    case 'offline':
      return 'Device is offline';
    case 'backend_unavailable':
      return 'Backend is temporarily unavailable';
    default:
      return 'Unknown pause reason';
  }
};

export const getSyncStatusPresentation = (
  snapshot: SyncStateSnapshot,
  now: Date = new Date()
): SyncStatusPresentation => {
  if (snapshot.status === 'idle') {
    return snapshot.lastSuccessfulSyncAt
      ? {
          tone: 'success',
          statusLabel: 'Healthy',
          headline: 'Sync is up to date',
          detail: `Last successful sync ${formatSyncAge(snapshot.lastSuccessfulSyncAt, now)}.`,
          pausedReasonLabel: null,
        }
      : {
          tone: 'neutral',
          statusLabel: 'Ready',
          headline: 'Ready to sync',
          detail: 'Sync is enabled and will run automatically when there is work to send or pull.',
          pausedReasonLabel: null,
        };
  }

  if (snapshot.status === 'syncing') {
    return {
      tone: 'neutral',
      statusLabel: 'Syncing',
      headline: 'Sync in progress',
      detail: 'The app is checking for remote changes right now.',
      pausedReasonLabel: null,
    };
  }

  if (snapshot.status === 'paused') {
    const pausedReasonLabel = getSyncPausedReasonLabel(snapshot.pausedReason);

    switch (snapshot.pausedReason) {
      case 'offline':
        return {
          tone: 'neutral',
          statusLabel: 'Waiting',
          headline: 'Waiting for connection',
          detail: 'Local tracking continues offline. Sync resumes automatically after reconnecting.',
          pausedReasonLabel,
        };
      case 'auth_missing':
        return {
          tone: 'neutral',
          statusLabel: 'Paused',
          headline: 'Sign in required',
          detail: 'Local tracking stays available, but cloud sync waits for an authenticated session.',
          pausedReasonLabel,
        };
      case 'auth_expired':
        return {
          tone: 'neutral',
          statusLabel: 'Paused',
          headline: 'Sign in again to resume',
          detail: 'Your previous authenticated session expired, so sync is waiting quietly.',
          pausedReasonLabel,
        };
      case 'backend_unconfigured':
        return {
          tone: 'neutral',
          statusLabel: 'Unavailable',
          headline: 'Sync is unavailable on this build',
          detail: 'This app build is missing the backend configuration needed for sync.',
          pausedReasonLabel,
        };
      case 'backend_unavailable':
      default:
        return {
          tone: 'warning',
          statusLabel: 'Delayed',
          headline: 'Sync is temporarily delayed',
          detail: 'The backend is not reachable right now. The app will retry automatically.',
          pausedReasonLabel,
        };
    }
  }

  if (snapshot.status === 'error') {
    return {
      tone: 'warning',
      statusLabel: 'Delayed',
      headline: 'Sync is temporarily delayed',
      detail: 'The backend is not reachable right now. The app will retry automatically.',
      pausedReasonLabel: getSyncPausedReasonLabel(snapshot.pausedReason),
    };
  }

  return {
    tone: 'neutral',
    statusLabel: 'Waiting',
    headline: 'Sync has not started yet',
    detail: 'Sync will start automatically when this device has an authenticated session.',
    pausedReasonLabel: null,
  };
};
