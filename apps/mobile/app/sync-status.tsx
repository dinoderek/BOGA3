import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { SyncStatusCard } from '@/components/sync/sync-status-card';
import { UiSurface, UiText, uiBorder, uiColors, uiRadius, uiSpace } from '@/components/ui';
import { formatSyncTimestamp, getSyncPausedReasonLabel, getSyncStatusPresentation } from '@/src/sync/status-presentation';
import { useSyncStateSnapshot, type SyncStateReader } from '@/src/sync/use-sync-state-snapshot';

export type SyncStatusScreenShellProps = {
  syncStateRepository?: SyncStateReader;
  refreshToken?: number;
  now?: Date;
};

function DetailRow({ label, value, testID }: { label: string; value: string; testID?: string }) {
  return (
    <View style={styles.detailRow}>
      <UiText style={styles.detailLabel} variant="subtitle">
        {label}
      </UiText>
      <UiText selectable style={styles.detailValue} testID={testID} variant="labelStrong">
        {value}
      </UiText>
    </View>
  );
}

export function SyncStatusScreenShell({
  syncStateRepository,
  refreshToken = 0,
  now = new Date(),
}: SyncStatusScreenShellProps) {
  const { snapshot, isLoading, errorMessage } = useSyncStateSnapshot({
    repository: syncStateRepository,
    refreshToken,
  });

  if (isLoading && !snapshot) {
    return (
      <View style={styles.loadingScreen}>
        <UiSurface style={styles.statePanel}>
          <UiText selectable variant="bodyMuted">
            Loading sync status...
          </UiText>
        </UiSurface>
      </View>
    );
  }

  if (errorMessage && !snapshot) {
    return (
      <View style={styles.loadingScreen}>
        <UiSurface style={styles.errorPanel}>
          <UiText style={styles.errorText} variant="labelStrong">
            Sync status is unavailable right now
          </UiText>
          <UiText selectable variant="bodyMuted">
            {errorMessage}
          </UiText>
        </UiSurface>
      </View>
    );
  }

  if (!snapshot) {
    return null;
  }

  const presentation = getSyncStatusPresentation(snapshot, now);

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
      style={styles.screen}
      testID="sync-status-screen">
      <SyncStatusCard presentation={presentation} testID="sync-status-summary-card" />

      <UiSurface style={styles.section}>
        <UiText variant="labelStrong">Recent activity</UiText>
        <DetailRow label="Current state" testID="sync-status-current-state-value" value={presentation.statusLabel} />
        <DetailRow label="Status note" testID="sync-status-status-note-value" value={presentation.headline} />
        <DetailRow
          label="Pause reason"
          testID="sync-status-pause-reason-value"
          value={getSyncPausedReasonLabel(snapshot.pausedReason) ?? 'None'}
        />
        <DetailRow
          label="Last successful sync"
          testID="sync-status-last-successful-value"
          value={formatSyncTimestamp(snapshot.lastSuccessfulSyncAt)}
        />
        <DetailRow
          label="Last failed sync"
          testID="sync-status-last-failed-value"
          value={formatSyncTimestamp(snapshot.lastFailedSyncAt)}
        />
        <DetailRow
          label="Last attempted sync"
          testID="sync-status-last-attempted-value"
          value={formatSyncTimestamp(snapshot.lastAttemptedSyncAt)}
        />
      </UiSurface>

      <UiSurface style={styles.section}>
        <UiText variant="labelStrong">How it works</UiText>
        <UiText selectable style={styles.supportText} variant="bodyMuted">
          Sync runs automatically while the app is open. Logged workouts always stay available locally, even when sync
          is paused or delayed.
        </UiText>
      </UiSurface>

      {errorMessage ? (
        <UiSurface style={styles.inlineErrorPanel}>
          <UiText style={styles.errorText} variant="labelStrong">
            Latest refresh note
          </UiText>
          <UiText selectable variant="bodyMuted">
            {errorMessage}
          </UiText>
        </UiSurface>
      ) : null}
    </ScrollView>
  );
}

export default function SyncStatusRoute() {
  const [refreshToken, setRefreshToken] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setRefreshToken((current) => current + 1);
    }, [])
  );

  return <SyncStatusScreenShell refreshToken={refreshToken} />;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: uiColors.surfacePage,
  },
  content: {
    padding: uiSpace.screen,
    gap: uiSpace.xxl,
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: uiColors.surfacePage,
    padding: uiSpace.screen,
  },
  statePanel: {
    borderColor: uiColors.borderMuted,
    backgroundColor: uiColors.surfaceDefault,
    borderRadius: uiRadius.lg,
    padding: uiSpace.xxl,
  },
  errorPanel: {
    borderColor: uiColors.actionDangerSubtleBorder,
    backgroundColor: uiColors.actionDangerSubtleBg,
    borderRadius: uiRadius.lg,
    padding: uiSpace.xxl,
    gap: uiSpace.sm,
  },
  inlineErrorPanel: {
    borderColor: uiColors.borderWarning,
    backgroundColor: uiColors.surfaceWarning,
    borderRadius: uiRadius.lg,
    padding: uiSpace.xxl,
    gap: uiSpace.sm,
  },
  errorText: {
    color: uiColors.actionDangerText,
  },
  section: {
    borderColor: uiColors.borderMuted,
    borderRadius: uiRadius.lg,
    padding: uiSpace.xxl,
    gap: uiSpace.md,
  },
  detailRow: {
    gap: uiSpace.xs,
    paddingTop: uiSpace.xs,
    borderTopWidth: uiBorder.width,
    borderTopColor: uiColors.borderMuted,
  },
  detailLabel: {
    color: uiColors.textSecondary,
  },
  detailValue: {
    color: uiColors.textPrimary,
  },
  supportText: {
    color: uiColors.textSecondary,
  },
});
