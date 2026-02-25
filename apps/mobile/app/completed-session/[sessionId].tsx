import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { SessionContentLayout } from '@/components/session-recorder/session-content-layout';
import { formatSessionListCompactDuration, loadLocalGymById, loadSessionSnapshotById } from '@/src/data';

export type CompletedSessionDetailSet = {
  id: string;
  weight: string;
  reps: string;
};

export type CompletedSessionDetailExercise = {
  id: string;
  name: string;
  machineName: string | null;
  sets: CompletedSessionDetailSet[];
};

export type CompletedSessionDetailRecord = {
  id: string;
  startedAt: string;
  completedAt: string;
  durationDisplay: string;
  gymName: string | null;
  deletedAt: string | null;
  reopenDisabledReason?: string | null;
  exercises: CompletedSessionDetailExercise[];
};

export type CompletedSessionDetailDataClient = {
  loadCompletedSession(sessionId: string): Promise<CompletedSessionDetailRecord | null>;
};

export type CompletedSessionDetailScreenShellProps = {
  sessionId?: string | null;
  dataClient?: CompletedSessionDetailDataClient;
  initialMode?: 'view' | 'edit';
};

function formatDateTimeStamp(isoTimestamp: string): string {
  const parsed = new Date(isoTimestamp);
  if (Number.isNaN(parsed.getTime())) {
    return isoTimestamp;
  }

  const month = `${parsed.getMonth() + 1}`.padStart(2, '0');
  const day = `${parsed.getDate()}`.padStart(2, '0');
  const year = parsed.getFullYear();
  const hours = `${parsed.getHours()}`.padStart(2, '0');
  const minutes = `${parsed.getMinutes()}`.padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function coerceRouteParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

const DEFAULT_COMPLETED_SESSION_DETAILS: Record<string, CompletedSessionDetailRecord> = {
  'session-completed-1': {
    id: 'session-completed-1',
    startedAt: '2026-02-19T16:00:00.000Z',
    completedAt: '2026-02-19T16:58:00.000Z',
    durationDisplay: '58m',
    gymName: 'Westside Barbell Club',
    deletedAt: null,
    reopenDisabledReason: 'Finish or discard the active session before reopening another.',
    exercises: [
      {
        id: 'm7-detail-ex-1',
        name: 'Bench Press',
        machineName: 'Flat Bench',
        sets: [
          { id: 'm7-detail-set-1', weight: '185', reps: '8' },
          { id: 'm7-detail-set-2', weight: '185', reps: '6' },
        ],
      },
      {
        id: 'm7-detail-ex-2',
        name: 'Lat Pulldown',
        machineName: 'Cable',
        sets: [
          { id: 'm7-detail-set-3', weight: '120', reps: '12' },
          { id: 'm7-detail-set-4', weight: '120', reps: '12' },
        ],
      },
    ],
  },
  'session-completed-2': {
    id: 'session-completed-2',
    startedAt: '2026-02-17T18:10:00.000Z',
    completedAt: '2026-02-17T19:15:00.000Z',
    durationDisplay: '1h 5m',
    gymName: 'Downtown Fitness',
    deletedAt: '2026-02-18T08:00:00.000Z',
    reopenDisabledReason: null,
    exercises: [
      {
        id: 'm7-detail-ex-3',
        name: 'Leg Press',
        machineName: 'Hammer Strength',
        sets: [
          { id: 'm7-detail-set-5', weight: '360', reps: '10' },
          { id: 'm7-detail-set-6', weight: '360', reps: '10' },
        ],
      },
    ],
  },
};

export const DEFAULT_COMPLETED_SESSION_DETAIL_DATA_CLIENT: CompletedSessionDetailDataClient = {
  async loadCompletedSession(sessionId) {
    const sessionGraph = await loadSessionSnapshotById(sessionId);

    if (sessionGraph && sessionGraph.status === 'completed') {
      const gymRecord = sessionGraph.gymId ? await loadLocalGymById(sessionGraph.gymId) : null;
      const completedAt = sessionGraph.completedAt ?? sessionGraph.startedAt;

      return {
        id: sessionGraph.sessionId,
        startedAt: sessionGraph.startedAt.toISOString(),
        completedAt: completedAt.toISOString(),
        durationDisplay: formatSessionListCompactDuration(sessionGraph.durationSec),
        gymName: gymRecord?.name ?? null,
        deletedAt: sessionGraph.deletedAt ? sessionGraph.deletedAt.toISOString() : null,
        reopenDisabledReason: null,
        exercises: sessionGraph.exercises.map((exercise) => ({
          id: exercise.id,
          name: exercise.name,
          machineName: exercise.machineName,
          sets: exercise.sets.map((set) => ({
            id: set.id,
            weight: set.weightValue,
            reps: set.repsValue,
          })),
        })),
      };
    }

    return DEFAULT_COMPLETED_SESSION_DETAILS[sessionId] ?? null;
  },
};

export function CompletedSessionDetailScreenShell({
  sessionId,
  dataClient = DEFAULT_COMPLETED_SESSION_DETAIL_DATA_CLIENT,
  initialMode = 'view',
}: CompletedSessionDetailScreenShellProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [session, setSession] = useState<CompletedSessionDetailRecord | null>(null);
  const [viewerMode, setViewerMode] = useState<'view' | 'edit'>(initialMode);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  useEffect(() => {
    setViewerMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    let cancelled = false;

    if (!sessionId) {
      setSession(null);
      setErrorMessage(null);
      setIsLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setIsLoading(true);
    setErrorMessage(null);
    setActionFeedback(null);

    dataClient
      .loadCompletedSession(sessionId)
      .then((loadedSession) => {
        if (cancelled) {
          return;
        }
        setSession(loadedSession);
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load session');
      })
      .finally(() => {
        if (cancelled) {
          return;
        }
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [dataClient, sessionId]);

  const deleteLabel = session?.deletedAt ? 'Undelete' : 'Delete';
  const reopenDisabled = Boolean(session?.reopenDisabledReason);
  const editLabel = viewerMode === 'edit' ? 'View' : 'Edit';

  const formattedStartedAt = useMemo(
    () => (session ? formatDateTimeStamp(session.startedAt) : '—'),
    [session]
  );
  const formattedCompletedAt = useMemo(
    () => (session ? formatDateTimeStamp(session.completedAt) : '—'),
    [session]
  );

  const handleToggleMode = () => {
    setViewerMode((current) => (current === 'edit' ? 'view' : 'edit'));
    setActionFeedback(null);
  };

  const handleReopen = () => {
    if (reopenDisabled) {
      return;
    }

    setActionFeedback('Reopen action coming next.');
  };

  const handleToggleDeletedState = () => {
    setSession((current) => {
      if (!current) {
        return current;
      }

      const nextIsDeleted = current.deletedAt === null;
      setActionFeedback(
        nextIsDeleted
          ? 'Session hidden from default history (viewer-only stub).'
          : 'Session restored to default history (viewer-only stub).'
      );

      return {
        ...current,
        deletedAt: nextIsDeleted ? new Date().toISOString() : null,
      };
    });
  };

  const updateSessionField = (field: 'startedAt' | 'completedAt' | 'gymName', value: string) => {
    setSession((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        [field]: value,
      };
    });
    setActionFeedback('Editing locally (not saved yet).');
  };

  const updateSetField = (
    exerciseId: string,
    setId: string,
    field: 'weight' | 'reps',
    value: string
  ) => {
    setSession((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        exercises: current.exercises.map((exercise) =>
          exercise.id !== exerciseId
            ? exercise
            : {
                ...exercise,
                sets: exercise.sets.map((set) => (set.id === setId ? { ...set, [field]: value } : set)),
              }
        ),
      };
    });
    setActionFeedback('Editing locally (not saved yet).');
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: viewerMode === 'edit' ? 'Edit Session' : 'View Session' }} />
        <View style={styles.centerState} testID="completed-session-detail-loading">
          <Text style={styles.stateTitle}>Loading session...</Text>
        </View>
      </>
    );
  }

  if (errorMessage) {
    return (
      <>
        <Stack.Screen options={{ title: viewerMode === 'edit' ? 'Edit Session' : 'View Session' }} />
        <View style={styles.centerState} testID="completed-session-detail-error">
          <Text style={styles.stateTitle}>Unable to load session</Text>
          <Text style={styles.stateBody}>{errorMessage}</Text>
        </View>
      </>
    );
  }

  if (!sessionId || !session) {
    return (
      <>
        <Stack.Screen options={{ title: viewerMode === 'edit' ? 'Edit Session' : 'View Session' }} />
        <View style={styles.centerState} testID="completed-session-detail-empty">
          <Text style={styles.stateTitle}>Session not found</Text>
          <Text style={styles.stateBody}>This completed session could not be loaded.</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: viewerMode === 'edit' ? 'Edit Session' : 'View Session' }} />
      <ScrollView
        contentContainerStyle={styles.content}
        stickyHeaderIndices={[0]}
        testID="completed-session-detail-screen">
        <View style={styles.stickyActionBarWrap}>
          <View style={styles.actionBarCard}>
            <View style={styles.actionBar} testID="completed-session-detail-action-bar">
              <Pressable
                accessibilityRole="button"
                onPress={handleToggleMode}
                style={[styles.actionBarButton, styles.actionBarPrimaryButton]}
                testID="completed-session-detail-edit-button">
                <Text numberOfLines={1} style={styles.actionBarPrimaryButtonText}>
                  {editLabel}
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                disabled={reopenDisabled}
                onPress={handleReopen}
                style={[
                  styles.actionBarButton,
                  styles.actionBarSecondaryButton,
                  reopenDisabled ? styles.disabledActionButton : null,
                ]}
                testID="completed-session-detail-reopen-button">
                <Text
                  numberOfLines={1}
                  style={[
                    styles.actionBarSecondaryButtonText,
                    reopenDisabled ? styles.disabledActionButtonText : null,
                  ]}>
                  Reopen
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={handleToggleDeletedState}
                style={[styles.actionBarButton, styles.actionBarDangerButton]}
                testID="completed-session-detail-delete-button">
                <Text numberOfLines={1} style={styles.actionBarDangerButtonText}>
                  {deleteLabel}
                </Text>
              </Pressable>
            </View>

            {reopenDisabled && session.reopenDisabledReason ? (
              <Text style={styles.reopenHintText}>{session.reopenDisabledReason}</Text>
            ) : null}

            {actionFeedback ? <Text style={styles.actionFeedbackText}>{actionFeedback}</Text> : null}
          </View>
        </View>

        <View style={styles.headerCard}>
          <View style={styles.metricGrid}>
            <View style={styles.metricCell}>
              <Text style={styles.metricLabel}>Start</Text>
              <Text style={styles.metricValue}>{formattedStartedAt}</Text>
            </View>
            <View style={styles.metricCell}>
              <Text style={styles.metricLabel}>End</Text>
              <Text style={styles.metricValue}>{formattedCompletedAt}</Text>
            </View>
            <View style={styles.metricCell}>
              <Text style={styles.metricLabel}>Duration</Text>
              <Text style={styles.metricValue}>{session.durationDisplay}</Text>
            </View>
            <View style={styles.metricCell}>
              <Text style={styles.metricLabel}>Location</Text>
              <Text numberOfLines={1} style={styles.metricValue}>
                {session.gymName?.trim() ? session.gymName : 'No gym'}
              </Text>
            </View>
          </View>
        </View>

        {viewerMode === 'edit' ? (
          <View style={styles.editModeBanner} testID="completed-session-detail-edit-mode-banner">
            <Text style={styles.editModeBannerTitle}>Edit mode</Text>
            <Text style={styles.editModeBannerBody}>Local edits are enabled in this viewer shell (save flow comes next).</Text>
          </View>
        ) : null}

        <SessionContentLayout
          showMetadataSection={viewerMode === 'edit'}
          dateTimeValue={
            viewerMode === 'edit' ? (
              <TextInput
                accessibilityLabel="Edit session started time"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.editFieldInput}
                testID="completed-session-detail-started-input"
                value={session.startedAt}
                onChangeText={(value) => updateSessionField('startedAt', value)}
              />
            ) : (
              <View style={styles.readOnlyField}>
                <Text style={styles.readOnlyFieldText}>{formattedStartedAt}</Text>
              </View>
            )
          }
          gymValue={
            viewerMode === 'edit' ? (
              <TextInput
                accessibilityLabel="Edit session gym"
                autoCapitalize="words"
                autoCorrect={false}
                style={styles.editFieldInput}
                testID="completed-session-detail-gym-input"
                value={session.gymName ?? ''}
                onChangeText={(value) => updateSessionField('gymName', value)}
              />
            ) : (
              <View style={styles.readOnlyField}>
                <Text numberOfLines={1} style={styles.readOnlyFieldText}>
                  {session.gymName?.trim() ? session.gymName : 'No gym'}
                </Text>
              </View>
            )
          }
          exercises={session.exercises}
          emptyExercisesText="No exercises logged in this session."
          renderSetRow={({ exercise, set, setIndex }) =>
            viewerMode === 'edit' ? (
              <View style={styles.setRowEdit} testID={`completed-session-detail-set-row-${set.id}`}>
                <Text style={styles.setIndexText}>Set {setIndex + 1}</Text>
                <TextInput
                  accessibilityLabel={`Edit weight for set ${setIndex + 1}`}
                  keyboardType="decimal-pad"
                  style={styles.editSetInput}
                  testID={`completed-session-detail-set-weight-input-${set.id}`}
                  value={set.weight}
                  onChangeText={(value) => updateSetField(exercise.id, set.id, 'weight', value)}
                />
                <TextInput
                  accessibilityLabel={`Edit reps for set ${setIndex + 1}`}
                  keyboardType="number-pad"
                  style={styles.editSetInput}
                  testID={`completed-session-detail-set-reps-input-${set.id}`}
                  value={set.reps}
                  onChangeText={(value) => updateSetField(exercise.id, set.id, 'reps', value)}
                />
              </View>
            ) : (
              <View>
                {setIndex === 0 ? (
                  <View
                    style={styles.setTableHeaderRow}
                    testID={`completed-session-detail-sets-table-header-${exercise.id}`}>
                    <Text style={[styles.setTableHeaderCell, styles.setTableIndexCell]}>Set</Text>
                    <Text style={[styles.setTableHeaderCell, styles.setTableValueCell]}>Weight</Text>
                    <Text style={[styles.setTableHeaderCell, styles.setTableValueCell]}>Reps</Text>
                  </View>
                ) : null}
                <View style={styles.setTableRow} testID={`completed-session-detail-set-row-${set.id}`}>
                  <Text style={[styles.setTableCell, styles.setTableIndexCell]}>{setIndex + 1}</Text>
                  <Text style={[styles.setTableCell, styles.setTableValueCell]}>{set.weight || '—'}</Text>
                  <Text style={[styles.setTableCell, styles.setTableValueCell]}>{set.reps || '—'}</Text>
                </View>
              </View>
            )
          }
        />
      </ScrollView>
    </>
  );
}

export default function CompletedSessionDetailRoute() {
  const params = useLocalSearchParams<{ sessionId?: string | string[]; intent?: string | string[] }>();
  const sessionId = coerceRouteParam(params.sessionId);
  const intent = coerceRouteParam(params.intent);
  const initialMode = intent === 'edit' ? 'edit' : 'view';

  return <CompletedSessionDetailScreenShell sessionId={sessionId} initialMode={initialMode} />;
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 16,
    backgroundColor: '#f4f7fb',
  },
  stickyActionBarWrap: {
    backgroundColor: '#f4f7fb',
    paddingBottom: 2,
  },
  centerState: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f4f7fb',
  },
  stateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#122033',
  },
  stateBody: {
    fontSize: 13,
    color: '#56667f',
    textAlign: 'center',
  },
  headerCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d7deea',
    backgroundColor: '#ffffff',
    padding: 14,
    gap: 12,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCell: {
    width: '48%',
    gap: 2,
  },
  metricLabel: {
    color: '#56667f',
    fontSize: 12,
    fontWeight: '600',
  },
  metricValue: {
    color: '#122033',
    fontSize: 14,
    fontWeight: '700',
  },
  actionBarCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d7deea',
    backgroundColor: '#ffffff',
    padding: 10,
    gap: 6,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBarButton: {
    flex: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    minHeight: 36,
  },
  actionBarPrimaryButton: {
    backgroundColor: '#0f5cc0',
    borderColor: '#0f5cc0',
  },
  actionBarPrimaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },
  actionBarSecondaryButton: {
    backgroundColor: '#eef2f9',
    borderColor: '#c7d3e8',
  },
  actionBarSecondaryButtonText: {
    color: '#20324f',
    fontWeight: '700',
    fontSize: 12,
  },
  disabledActionButton: {
    backgroundColor: '#f4f6fa',
    borderColor: '#dde4f0',
  },
  disabledActionButtonText: {
    color: '#8190a8',
  },
  reopenHintText: {
    color: '#56667f',
    fontSize: 12,
  },
  actionBarDangerButton: {
    backgroundColor: '#fff0f0',
    borderColor: '#f3c5c5',
  },
  actionBarDangerButtonText: {
    color: '#8a2323',
    fontWeight: '700',
    fontSize: 12,
  },
  actionFeedbackText: {
    color: '#20324f',
    fontSize: 12,
    fontWeight: '600',
  },
  editModeBanner: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cfe1ff',
    backgroundColor: '#f5f9ff',
    padding: 10,
    gap: 4,
  },
  editModeBannerTitle: {
    color: '#0f2a46',
    fontSize: 13,
    fontWeight: '700',
  },
  editModeBannerBody: {
    color: '#37516f',
    fontSize: 12,
  },
  readOnlyField: {
    borderWidth: 1,
    borderColor: '#c7d3e8',
    borderRadius: 8,
    backgroundColor: '#f7f9fc',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  readOnlyFieldText: {
    color: '#20324f',
    fontWeight: '600',
  },
  editFieldInput: {
    borderWidth: 1,
    borderColor: '#b7c6dd',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 9,
    color: '#13243b',
    fontWeight: '600',
  },
  setRowEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#cfe1ff',
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#f7fbff',
  },
  setIndexText: {
    color: '#122033',
    fontWeight: '700',
    fontSize: 12,
  },
  editSetInput: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderColor: '#b7c6dd',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 7,
    color: '#13243b',
    fontWeight: '600',
  },
  setTableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: '#d7deea',
    backgroundColor: '#f1f5fb',
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 8,
  },
  setTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d7deea',
    borderTopWidth: 0,
    paddingHorizontal: 8,
    paddingVertical: 7,
    gap: 8,
    backgroundColor: '#ffffff',
  },
  setTableCell: {
    color: '#20324f',
    fontSize: 12,
    fontWeight: '600',
  },
  setTableHeaderCell: {
    color: '#56667f',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  setTableIndexCell: {
    width: 36,
  },
  setTableValueCell: {
    flex: 1,
  },
});
