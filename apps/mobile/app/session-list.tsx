import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  completeSessionDraft,
  formatSessionListCompactDuration,
  listSessionListBuckets,
  persistSessionDraftSnapshot,
  setSessionDeletedState,
} from '@/src/data';

export type SessionListItem = {
  id: string;
  startedAt: string;
  status: 'active' | 'completed';
  completedAt: string | null;
  durationSec: number | null;
  durationDisplay: string;
  gymName: string | null;
  exerciseCount: number;
  setCount: number;
  totalWeight: number;
  deletedAt: string | null;
};

export const DEFAULT_SESSION_LIST_ITEMS: SessionListItem[] = [
  {
    id: 'session-active-1',
    startedAt: '2026-02-20T17:30:00.000Z',
    status: 'active',
    completedAt: null,
    durationSec: 2700,
    durationDisplay: '45m',
    gymName: 'Westside Barbell Club',
    exerciseCount: 4,
    setCount: 14,
    totalWeight: 6125,
    deletedAt: null,
  },
  {
    id: 'session-completed-1',
    startedAt: '2026-02-19T16:00:00.000Z',
    status: 'completed',
    completedAt: '2026-02-19T16:58:00.000Z',
    durationSec: 3480,
    durationDisplay: '58m',
    gymName: 'Westside Barbell Club',
    exerciseCount: 5,
    setCount: 18,
    totalWeight: 9420,
    deletedAt: null,
  },
  {
    id: 'session-completed-2',
    startedAt: '2026-02-17T18:10:00.000Z',
    status: 'completed',
    completedAt: '2026-02-17T19:15:00.000Z',
    durationSec: 3900,
    durationDisplay: '1h 5m',
    gymName: 'Downtown Fitness',
    exerciseCount: 4,
    setCount: 16,
    totalWeight: 7840,
    deletedAt: '2026-02-18T08:00:00.000Z',
  },
];

export type SessionListScreenShellProps = {
  initialSessions?: SessionListItem[];
  dataClient?: SessionListDataClient;
  reloadToken?: number;
};

type CompletedSessionMenuState = {
  action: 'delete' | 'undelete';
  sessionId: string;
};

export type SessionListDataClient = {
  loadSessions(input: { showDeletedSessions: boolean }): Promise<SessionListItem[]>;
  startSession(): Promise<void>;
  completeActiveSession(sessionId: string): Promise<void>;
  discardActiveSession(sessionId: string): Promise<void>;
  setCompletedSessionDeletedState(sessionId: string, isDeleted: boolean): Promise<void>;
};

function formatDateTimeStamp(isoTimestamp: string): string {
  const [datePart, timePartWithZone = '00:00:00'] = isoTimestamp.split('T');
  const [, month, day] = datePart.split('-');
  const timePart = timePartWithZone.slice(0, 5);

  return `${Number(month)}/${Number(day)} ${timePart}`;
}

export const formatCompactDuration = formatSessionListCompactDuration;

function formatSetCount(setCount: number): string {
  return `${setCount} sets`;
}

function formatExerciseCount(exerciseCount: number): string {
  return `${exerciseCount} ${exerciseCount === 1 ? 'exercise' : 'exercises'}`;
}

function formatGymToken(gymName: string | null): string {
  return gymName?.trim() ? gymName : 'No gym';
}

const mapRepositorySummaryToListItem = (
  summary: Awaited<ReturnType<typeof listSessionListBuckets>>['completed'][number] | Awaited<ReturnType<typeof listSessionListBuckets>>['active']
): SessionListItem | null => {
  if (!summary) {
    return null;
  }

  return {
    id: summary.id,
    startedAt: summary.startedAt.toISOString(),
    status: summary.status,
    completedAt: summary.completedAt ? summary.completedAt.toISOString() : null,
    durationSec: summary.durationSec,
    durationDisplay: summary.compactDuration,
    gymName: summary.gymName,
    exerciseCount: summary.exerciseCount,
    setCount: summary.setCount,
    totalWeight: 0,
    deletedAt: summary.deletedAt ? summary.deletedAt.toISOString() : null,
  };
};

export const DEFAULT_SESSION_LIST_DATA_CLIENT: SessionListDataClient = {
  async loadSessions({ showDeletedSessions }) {
    const buckets = await listSessionListBuckets({
      includeDeleted: showDeletedSessions,
    });

    const active = mapRepositorySummaryToListItem(buckets.active);
    const completed = buckets.completed
      .map((summary) => mapRepositorySummaryToListItem(summary))
      .filter((summary): summary is SessionListItem => summary !== null);

    return active ? [active, ...completed] : completed;
  },
  async startSession() {
    await persistSessionDraftSnapshot({
      gymId: null,
      startedAt: new Date(),
      status: 'active',
      exercises: [],
    });
  },
  async completeActiveSession(sessionId) {
    await completeSessionDraft(sessionId);
  },
  async discardActiveSession(sessionId) {
    await setSessionDeletedState(sessionId, true);
  },
  async setCompletedSessionDeletedState(sessionId, isDeleted) {
    await setSessionDeletedState(sessionId, isDeleted);
  },
};

function SessionSummaryLine({
  session,
  testIdPrefix,
  nowMs = Date.now(),
}: {
  session: SessionListItem;
  testIdPrefix: string;
  nowMs?: number;
}) {
  const durationLabel =
    session.status === 'active'
      ? formatCompactDuration(
          Math.max(0, Math.floor((nowMs - new Date(session.startedAt).getTime()) / 1000))
        )
      : session.durationDisplay || formatCompactDuration(session.durationSec);

  return (
    <View style={styles.summaryLine}>
      <Text selectable numberOfLines={1} style={[styles.summaryToken, styles.summaryTokenPrimary]} testID={`${testIdPrefix}-start`}>
        {formatDateTimeStamp(session.startedAt)}
      </Text>
      <Text selectable style={styles.summarySeparator}>
        •
      </Text>
      <Text selectable style={styles.summaryToken} testID={`${testIdPrefix}-duration`}>
        {durationLabel}
      </Text>
      <Text selectable style={styles.summarySeparator}>
        •
      </Text>
      <Text selectable style={styles.summaryToken} testID={`${testIdPrefix}-sets`}>
        {formatSetCount(session.setCount)}
      </Text>
      <Text selectable style={styles.summarySeparator}>
        •
      </Text>
      <Text selectable style={styles.summaryToken} testID={`${testIdPrefix}-exercises`}>
        {formatExerciseCount(session.exerciseCount)}
      </Text>
      <Text selectable style={styles.summarySeparator}>
        •
      </Text>
      <Text selectable numberOfLines={1} style={styles.summaryToken} testID={`${testIdPrefix}-gym`}>
        {formatGymToken(session.gymName)}
      </Text>
    </View>
  );
}

export function SessionListScreenShell({
  initialSessions = DEFAULT_SESSION_LIST_ITEMS,
  dataClient,
  reloadToken = 0,
}: SessionListScreenShellProps) {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionListItem[]>(dataClient ? [] : initialSessions);
  const [showDeletedSessions, setShowDeletedSessions] = useState(false);
  const [activeDurationNowMs, setActiveDurationNowMs] = useState(() => Date.now());
  const [isLoadingSessions, setIsLoadingSessions] = useState(Boolean(dataClient));
  const [loadErrorMessage, setLoadErrorMessage] = useState<string | null>(null);
  const [activeSessionMenuVisible, setActiveSessionMenuVisible] = useState(false);
  const [completedSessionMenuVisible, setCompletedSessionMenuVisible] = useState(false);
  const [completedSessionMenuState, setCompletedSessionMenuState] = useState<CompletedSessionMenuState | null>(
    null
  );

  useEffect(() => {
    if (!dataClient) {
      return;
    }

    let isCancelled = false;

    setIsLoadingSessions(true);
    setLoadErrorMessage(null);

    dataClient
      .loadSessions({ showDeletedSessions })
      .then((loadedSessions) => {
        if (isCancelled) {
          return;
        }

        setSessions(loadedSessions);
      })
      .catch((error) => {
        if (isCancelled) {
          return;
        }

        setLoadErrorMessage(error instanceof Error ? error.message : 'Unable to load sessions');
      })
      .finally(() => {
        if (isCancelled) {
          return;
        }

        setIsLoadingSessions(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [dataClient, showDeletedSessions, reloadToken]);

  const reloadSessions = async () => {
    if (!dataClient) {
      return;
    }

    setIsLoadingSessions(true);
    setLoadErrorMessage(null);

    try {
      const loadedSessions = await dataClient.loadSessions({ showDeletedSessions });
      setSessions(loadedSessions);
    } catch (error) {
      setLoadErrorMessage(error instanceof Error ? error.message : 'Unable to load sessions');
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const activeSession = sessions.find((session) => session.status === 'active' && session.deletedAt === null);
  const completedSessions = sessions
    .filter((session) => session.status === 'completed')
    .filter((session) => showDeletedSessions || session.deletedAt === null)
    .sort((left, right) => {
      const leftTime = left.completedAt ? new Date(left.completedAt).getTime() : 0;
      const rightTime = right.completedAt ? new Date(right.completedAt).getTime() : 0;
      return rightTime - leftTime;
    });

  const showEmptyState = !isLoadingSessions && !loadErrorMessage && !activeSession && completedSessions.length === 0;

  useEffect(() => {
    if (!activeSession) {
      return;
    }

    const intervalId = setInterval(() => {
      setActiveDurationNowMs(Date.now());
    }, 30_000);

    return () => {
      clearInterval(intervalId);
    };
  }, [activeSession]);

  const navigateToSessionRecorder = () => {
    if (dataClient && !activeSession) {
      return (async () => {
        await dataClient.startSession();
        await reloadSessions();
        router.push('/session-recorder');
      })();
    }

    router.push('/session-recorder');
  };

  const completeActiveSession = () => {
    if (dataClient && activeSession) {
      return (async () => {
        await dataClient.completeActiveSession(activeSession.id);
        await reloadSessions();
      })();
    }

    setSessions((currentSessions) =>
      currentSessions.map((session) => {
        if (session.status !== 'active' || session.deletedAt !== null) {
          return session;
        }

        return {
          ...session,
          status: 'completed',
          completedAt: '2026-02-20T18:15:00.000Z',
          durationDisplay: session.durationDisplay || formatCompactDuration(session.durationSec),
        };
      })
    );
  };

  const discardActiveSession = () => {
    if (dataClient && activeSession) {
      return (async () => {
        await dataClient.discardActiveSession(activeSession.id);
        await reloadSessions();
        setActiveSessionMenuVisible(false);
      })();
    }

    setSessions((currentSessions) => currentSessions.filter((session) => session.status !== 'active'));
    setActiveSessionMenuVisible(false);
  };

  const toggleDeletedState = (sessionId: string) => {
    if (dataClient) {
      const targetSession = sessions.find((session) => session.id === sessionId);
      return (async () => {
        await dataClient.setCompletedSessionDeletedState(sessionId, !targetSession?.deletedAt);
        await reloadSessions();
      })();
    }

    setSessions((currentSessions) =>
      currentSessions.map((session) => {
        if (session.id !== sessionId) {
          return session;
        }

        return {
          ...session,
          deletedAt: session.deletedAt ? null : '2026-02-23T12:00:00.000Z',
        };
      })
    );
  };

  const openCompletedSessionMenu = (session: SessionListItem) => {
    setCompletedSessionMenuState({
      sessionId: session.id,
      action: session.deletedAt ? 'undelete' : 'delete',
    });
    setCompletedSessionMenuVisible(true);
  };

  const closeCompletedSessionMenu = () => {
    setCompletedSessionMenuVisible(false);
  };

  const applyCompletedSessionMenuAction = () => {
    if (!completedSessionMenuState) {
      return;
    }

    const pendingAction = toggleDeletedState(completedSessionMenuState.sessionId);
    if (pendingAction) {
      void pendingAction.finally(() => {
        setCompletedSessionMenuVisible(false);
      });
      return;
    }

    setCompletedSessionMenuVisible(false);
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        testID="session-list-screen">
        {!activeSession ? (
          <Pressable
            accessibilityLabel="Start session"
            accessibilityRole="button"
            onPress={() => {
              void navigateToSessionRecorder();
            }}
            style={[styles.actionButton, styles.primaryButton]}
            testID="start-session-button">
            <Text style={styles.primaryButtonText}>Start Session</Text>
          </Pressable>
        ) : (
          <View style={styles.sectionBlock}>
            <Text selectable style={styles.sectionTitle}>
              Active Session
            </Text>
            <View style={[styles.sessionRow, styles.activeSessionRow]} testID={`active-session-row-${activeSession.id}`}>
              <Pressable
                accessibilityLabel="Resume active session"
                accessibilityRole="button"
                onPress={() => {
                  void navigateToSessionRecorder();
                }}
                style={styles.sessionRowMainPressable}
                testID="resume-active-session-button">
                <SessionSummaryLine
                  session={activeSession}
                  testIdPrefix={`session-summary-${activeSession.id}`}
                  nowMs={activeDurationNowMs}
                />
              </Pressable>

              <View style={styles.sessionRowActions}>
                <Pressable
                  accessibilityLabel="Complete active session"
                  accessibilityRole="button"
                  onPress={() => {
                    void completeActiveSession();
                  }}
                  style={[styles.iconActionButton, styles.completeButton]}
                  testID="complete-active-session-button">
                  <Text style={[styles.iconGlyphText, styles.completeGlyphText]}>✓</Text>
                </Pressable>

                <Pressable
                  accessibilityLabel="Open active session actions"
                  accessibilityRole="button"
                  onPress={() => setActiveSessionMenuVisible(true)}
                  style={[styles.iconActionButton, styles.menuButton]}
                  testID="active-session-menu-button">
                  <Text style={styles.iconGlyphText}>⋮</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text selectable style={styles.sectionTitle}>
              Completed History
            </Text>
            <Pressable
              accessibilityLabel={showDeletedSessions ? 'Hide deleted sessions' : 'Show deleted sessions'}
              accessibilityRole="button"
              onPress={() => setShowDeletedSessions((current) => !current)}
              style={styles.toggleButton}
              testID="toggle-deleted-sessions-button">
              <Text style={styles.toggleButtonText}>
                {showDeletedSessions ? 'Hide deleted' : 'Show deleted'}
              </Text>
            </Pressable>
          </View>

          {isLoadingSessions ? (
            <View style={styles.emptyPanel} testID="session-list-loading-state">
              <Text selectable style={styles.metaText}>
                Loading sessions...
              </Text>
            </View>
          ) : loadErrorMessage ? (
            <View style={styles.emptyPanel} testID="session-list-load-error">
              <Text selectable style={styles.metaText}>
                {loadErrorMessage}
              </Text>
            </View>
          ) : completedSessions.length === 0 ? (
            <View style={styles.emptyPanel}>
              <Text selectable style={styles.metaText}>
                No completed sessions
              </Text>
            </View>
          ) : (
            <View style={styles.completedList}>
              {completedSessions.map((session) => (
                <View
                  key={session.id}
                  style={[styles.sessionRow, session.deletedAt ? styles.deletedCompletedRow : null]}
                  testID={`completed-session-row-${session.id}`}>
                  <View style={styles.sessionRowMain}>
                    <SessionSummaryLine session={session} testIdPrefix={`session-summary-${session.id}`} />
                  </View>

                  <Pressable
                    accessibilityLabel={`Open completed session actions ${session.id}`}
                    accessibilityRole="button"
                    onPress={() => openCompletedSessionMenu(session)}
                    style={[styles.iconActionButton, styles.menuButton]}
                    testID={`completed-session-menu-button-${session.id}`}>
                    <Text style={styles.iconGlyphText}>⋮</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>

        {showEmptyState ? (
          <View style={styles.globalEmptyState} testID="session-list-empty-state">
            <Text selectable style={styles.globalEmptyTitle}>
              No sessions yet
            </Text>
            <Text selectable style={styles.metaText}>
              Start your first workout session to see it here.
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <Modal
        animationType="fade"
        transparent
        visible={activeSessionMenuVisible}
        onRequestClose={() => setActiveSessionMenuVisible(false)}>
        <View style={styles.modalRoot}>
          <Pressable
            accessibilityLabel="Dismiss active session menu overlay"
            onPress={() => setActiveSessionMenuVisible(false)}
            style={styles.modalOverlay}
            testID="active-session-menu-overlay"
          />
          <View style={styles.modalPanel}>
            <Text selectable style={styles.modalTitle}>
              Active Session
            </Text>
            <Text selectable style={styles.metaText}>
              Discard removes the in-progress session from the list.
            </Text>

            <Pressable
              accessibilityLabel="Discard active session"
              accessibilityRole="button"
              onPress={() => {
                void discardActiveSession();
              }}
              style={[styles.modalActionButton, styles.modalDangerButton]}
              testID="discard-active-session-button">
              <Text style={styles.modalDangerButtonText}>Discard session</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent
        visible={completedSessionMenuVisible}
        onDismiss={() => setCompletedSessionMenuState(null)}
        onRequestClose={closeCompletedSessionMenu}>
        <View style={styles.modalRoot}>
          <Pressable
            accessibilityLabel="Dismiss completed session menu overlay"
            onPress={closeCompletedSessionMenu}
            style={styles.modalOverlay}
            testID="completed-session-menu-overlay"
          />
          {completedSessionMenuState?.action === 'delete' ? (
            <View style={styles.modalPanel} testID="completed-session-delete-modal-card">
              <Text selectable style={styles.modalTitle}>
                Session Options
              </Text>
              <Text selectable style={styles.metaText}>
                Hide this session from the default history list.
              </Text>

              <Pressable
                accessibilityLabel="Delete completed session"
                accessibilityRole="button"
                onPress={() => {
                  void applyCompletedSessionMenuAction();
                }}
                style={[styles.modalActionButton, styles.modalDangerButton]}
                testID="completed-session-modal-action-button">
                <Text style={styles.modalDangerButtonText}>Delete session</Text>
              </Pressable>
            </View>
          ) : null}
          {completedSessionMenuState?.action === 'undelete' ? (
            <View style={styles.modalPanel} testID="completed-session-undelete-modal-card">
              <Text selectable style={styles.modalTitle}>
                Session Options
              </Text>
              <Text selectable style={styles.metaText}>
                Restore this session to the default history list.
              </Text>

              <Pressable
                accessibilityLabel="Undelete completed session"
                accessibilityRole="button"
                onPress={() => {
                  void applyCompletedSessionMenuAction();
                }}
                style={[styles.modalActionButton, styles.modalNeutralButton]}
                testID="completed-session-modal-action-button">
                <Text style={styles.modalNeutralButtonText}>Undelete session</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </Modal>
    </>
  );
}

export default function SessionListRoute() {
  const [reloadToken, setReloadToken] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setReloadToken((current) => current + 1);
    }, [])
  );

  return <SessionListScreenShell dataClient={DEFAULT_SESSION_LIST_DATA_CLIENT} reloadToken={reloadToken} />;
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 16,
    backgroundColor: '#f4f7fb',
  },
  sectionBlock: {
    gap: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#122033',
  },
  actionButton: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#0f5cc0',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  emptyPanel: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e6ee',
    backgroundColor: '#f7f9fc',
    padding: 12,
  },
  sessionRow: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e7ef',
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeSessionRow: {
    borderColor: '#cfe1ff',
    backgroundColor: '#f5f9ff',
  },
  deletedCompletedRow: {
    borderColor: '#e0c9c9',
    backgroundColor: '#fbf4f4',
    opacity: 0.9,
  },
  sessionRowMainPressable: {
    flex: 1,
  },
  sessionRowMain: {
    flex: 1,
  },
  sessionRowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconActionButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 0,
    paddingVertical: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButton: {
    backgroundColor: '#dff5e7',
    borderColor: '#b5e2c6',
  },
  menuButton: {
    backgroundColor: '#eef2f9',
    borderColor: '#c7d3e8',
  },
  iconGlyphText: {
    color: '#20324f',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16,
  },
  completeGlyphText: {
    color: '#124d29',
  },
  summaryLine: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    minHeight: 20,
  },
  summaryToken: {
    color: '#13243b',
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  summaryTokenPrimary: {
    color: '#0f2a46',
  },
  summarySeparator: {
    color: '#8ea0b8',
    fontSize: 11,
  },
  metaText: {
    color: '#56667f',
    fontSize: 13,
  },
  completedList: {
    gap: 10,
  },
  toggleButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#c7d3e8',
    backgroundColor: '#eef2f9',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  toggleButtonText: {
    color: '#20324f',
    fontSize: 12,
    fontWeight: '600',
  },
  globalEmptyState: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d7deea',
    backgroundColor: '#ffffff',
    padding: 16,
    gap: 6,
    alignItems: 'center',
  },
  globalEmptyTitle: {
    color: '#122033',
    fontSize: 16,
    fontWeight: '700',
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  modalPanel: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d7deea',
    backgroundColor: '#ffffff',
    padding: 14,
    gap: 10,
  },
  modalTitle: {
    color: '#122033',
    fontSize: 16,
    fontWeight: '700',
  },
  modalActionButton: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDangerButton: {
    backgroundColor: '#fff0f0',
    borderWidth: 1,
    borderColor: '#f3c5c5',
  },
  modalDangerButtonText: {
    color: '#8a2323',
    fontWeight: '700',
  },
  modalNeutralButton: {
    backgroundColor: '#eef2f9',
    borderWidth: 1,
    borderColor: '#c7d3e8',
  },
  modalNeutralButtonText: {
    color: '#20324f',
    fontWeight: '700',
  },
});
