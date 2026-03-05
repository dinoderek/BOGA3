import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import {
  default as SessionListRoute,
  SessionListItem,
  SessionListScreenShell,
  formatCompactDuration,
} from '../session-list';

jest.mock('@/src/data', () => ({
  completeSessionDraft: jest.fn(),
  formatSessionListCompactDuration: (durationSec: number | null) => {
    if (!durationSec || durationSec <= 0) {
      return '0m';
    }

    const totalMinutes = Math.floor(durationSec / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours <= 0) {
      return `${totalMinutes}m`;
    }

    if (minutes <= 0) {
      return `${hours}h`;
    }

    return `${hours}h ${minutes}m`;
  },
  listSessionListBuckets: jest.fn().mockResolvedValue({
    active: null,
    completed: [],
  }),
  persistSessionDraftSnapshot: jest.fn(),
  reopenCompletedSessionDraft: jest.fn(),
  setSessionDeletedState: jest.fn(),
}));

jest.mock('expo-router', () => {
  const mockPush = jest.fn();
  let latestFocusCallback: (() => void) | null = null;

  return {
    useRouter: () => ({
      push: mockPush,
    }),
    useFocusEffect: (callback: () => void) => {
      latestFocusCallback = callback;
    },
    __mockPush: mockPush,
    __triggerFocus: () => {
      latestFocusCallback?.();
    },
  };
});

const { __mockPush: mockPush, __triggerFocus: triggerFocus } = jest.requireMock('expo-router') as {
  __mockPush: jest.Mock;
  __triggerFocus: () => void;
};

const {
  listSessionListBuckets: mockListSessionListBuckets,
  persistSessionDraftSnapshot: mockPersistSessionDraftSnapshot,
  reopenCompletedSessionDraft: mockReopenCompletedSessionDraft,
  setSessionDeletedState: mockSetSessionDeletedState,
} = jest.requireMock('@/src/data') as {
  listSessionListBuckets: jest.Mock;
  persistSessionDraftSnapshot: jest.Mock;
  reopenCompletedSessionDraft: jest.Mock;
  setSessionDeletedState: jest.Mock;
};

const NO_ACTIVE_SESSIONS: SessionListItem[] = [
  {
    id: 'completed-visible',
    startedAt: '2026-02-20T16:00:00.000Z',
    status: 'completed',
    completedAt: '2026-02-20T16:58:00.000Z',
    durationSec: 3480,
    durationDisplay: '58m',
    gymName: 'Westside',
    exerciseCount: 3,
    setCount: 12,
    totalWeight: 4230,
    deletedAt: null,
  },
  {
    id: 'completed-deleted',
    startedAt: '2026-02-19T16:00:00.000Z',
    status: 'completed',
    completedAt: '2026-02-19T17:05:00.000Z',
    durationSec: 3900,
    durationDisplay: '1h 5m',
    gymName: 'Westside',
    exerciseCount: 2,
    setCount: 9,
    totalWeight: 2780,
    deletedAt: '2026-02-20T12:00:00.000Z',
  },
];

const ACTIVE_ONLY_SESSIONS: SessionListItem[] = [
  {
    id: 'active-only',
    startedAt: '2026-02-22T07:45:00.000Z',
    status: 'active',
    completedAt: null,
    durationSec: 1200,
    durationDisplay: '20m',
    gymName: 'Garage Gym',
    exerciseCount: 1,
    setCount: 5,
    totalWeight: 1800,
    deletedAt: null,
  },
];

describe('SessionListScreenShell', () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockListSessionListBuckets.mockReset();
    mockPersistSessionDraftSnapshot.mockReset();
    mockListSessionListBuckets.mockResolvedValue({
      active: null,
      completed: [],
    });
    mockPersistSessionDraftSnapshot.mockResolvedValue({ sessionId: 'created-session-id' });
    mockReopenCompletedSessionDraft.mockReset();
    mockReopenCompletedSessionDraft.mockResolvedValue(undefined);
    mockSetSessionDeletedState.mockReset();
    mockSetSessionDeletedState.mockResolvedValue(undefined);
  });

  it('hydrates DB-backed summaries through the route data client', async () => {
    mockListSessionListBuckets.mockResolvedValueOnce({
      active: null,
      completed: [
        {
          id: 'db-completed-1',
          status: 'completed',
          startedAt: new Date('2026-02-20T16:00:00.000Z'),
          completedAt: new Date('2026-02-20T16:42:00.000Z'),
          durationSec: 2520,
          compactDuration: '42m',
          deletedAt: null,
          gymName: 'Garage Gym',
          exerciseCount: 2,
          setCount: 6,
        },
      ],
    });

    render(<SessionListRoute />);

    expect(screen.getByTestId('session-list-loading-state')).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByTestId('completed-session-row-db-completed-1')).toBeTruthy();
    });

    expect(screen.getByTestId('session-summary-db-completed-1-duration').props.children).toBe('42m');
    expect(screen.getByTestId('session-summary-db-completed-1-exercises').props.children).toBe('2 exercises');
    expect(screen.getByTestId('session-summary-db-completed-1-gym').props.children).toBe('Garage Gym');
  });

  it('reloads DB-backed route data when the list screen regains focus', async () => {
    let phase: 'initial' | 'updated' = 'initial';

    mockListSessionListBuckets.mockImplementation(async () => {
      if (phase === 'initial') {
        return {
          active: {
            id: 'active-stale',
            status: 'active',
            startedAt: new Date('2026-02-24T10:00:00.000Z'),
            completedAt: null,
            durationSec: null,
            compactDuration: '0m',
            deletedAt: null,
            gymName: null,
            exerciseCount: 0,
            setCount: 0,
          },
          completed: [],
        };
      }

      return {
        active: {
          id: 'active-stale',
          status: 'active',
          startedAt: new Date('2026-02-24T10:00:00.000Z'),
          completedAt: null,
          durationSec: null,
          compactDuration: '0m',
          deletedAt: null,
          gymName: 'Westside Barbell Club',
          exerciseCount: 1,
          setCount: 1,
        },
        completed: [],
      };
    });

    render(<SessionListRoute />);

    await waitFor(() => {
      expect(screen.getByTestId('active-session-row-active-stale')).toBeTruthy();
    });
    expect(screen.getByTestId('session-summary-active-stale-sets').props.children).toBe('0 sets');
    expect(screen.getByTestId('session-summary-active-stale-exercises').props.children).toBe('0 exercises');
    expect(screen.queryByTestId('session-summary-active-stale-gym')).toBeNull();

    phase = 'updated';
    act(() => {
      triggerFocus();
    });

    await waitFor(() => {
      expect(screen.getByTestId('session-summary-active-stale-sets').props.children).toBe('1 sets');
    });
    expect(screen.getByTestId('session-summary-active-stale-exercises').props.children).toBe('1 exercise');
    expect(screen.getByTestId('session-summary-active-stale-gym').props.children).toBe('Westside Barbell Club');
  });

  it('routes to settings from the shared top-level navigation surface', async () => {
    render(<SessionListRoute />);

    await waitFor(() => {
      expect(screen.getByLabelText('Open Settings')).toBeTruthy();
    });

    fireEvent.press(screen.getByLabelText('Open Settings'));

    expect(mockPush).toHaveBeenCalledWith('/settings');
  });

  it('shows deleted completed sessions after toggling Show deleted in the DB-backed route flow', async () => {
    mockListSessionListBuckets.mockImplementation(
      async ({ includeDeleted }: { includeDeleted?: boolean } = {}) => ({
        active: null,
        completed: [
          {
            id: 'db-completed-visible',
            status: 'completed',
            startedAt: new Date('2026-02-20T16:00:00.000Z'),
            completedAt: new Date('2026-02-20T16:58:00.000Z'),
            durationSec: 3480,
            compactDuration: '58m',
            deletedAt: null,
            gymName: 'Westside',
            exerciseCount: 3,
            setCount: 12,
          },
          ...(includeDeleted
            ? [
                {
                  id: 'db-completed-deleted',
                  status: 'completed' as const,
                  startedAt: new Date('2026-02-19T16:00:00.000Z'),
                  completedAt: new Date('2026-02-19T17:05:00.000Z'),
                  durationSec: 3900,
                  compactDuration: '1h 5m',
                  deletedAt: new Date('2026-02-20T12:00:00.000Z'),
                  gymName: 'Westside',
                  exerciseCount: 2,
                  setCount: 9,
                },
              ]
            : []),
        ],
      })
    );

    render(<SessionListRoute />);

    await waitFor(() => {
      expect(screen.getByTestId('completed-session-row-db-completed-visible')).toBeTruthy();
    });
    expect(screen.queryByTestId('completed-session-row-db-completed-deleted')).toBeNull();

    fireEvent.press(screen.getByTestId('toggle-deleted-sessions-button'));

    await waitFor(() => {
      expect(screen.getByTestId('completed-session-row-db-completed-deleted')).toBeTruthy();
    });
    expect(mockListSessionListBuckets).toHaveBeenCalledWith(
      expect.objectContaining({ includeDeleted: true })
    );
  });

  it('restores a just-deleted DB-backed session when Show deleted is toggled on', async () => {
    jest.useFakeTimers();

    type MutableCompletedSummary = {
      id: string;
      status: 'completed';
      startedAt: Date;
      completedAt: Date;
      durationSec: number;
      compactDuration: string;
      deletedAt: Date | null;
      gymName: string | null;
      exerciseCount: number;
      setCount: number;
    };

    const completedRows: MutableCompletedSummary[] = [
      {
        id: 'db-completed-visible',
        status: 'completed',
        startedAt: new Date('2026-02-20T16:00:00.000Z'),
        completedAt: new Date('2026-02-20T16:58:00.000Z'),
        durationSec: 3480,
        compactDuration: '58m',
        deletedAt: null,
        gymName: 'Westside',
        exerciseCount: 3,
        setCount: 12,
      },
    ];

    mockSetSessionDeletedState.mockImplementation(async (sessionId: string, isDeleted: boolean) => {
      const row = completedRows.find((item) => item.id === sessionId);
      if (!row) {
        throw new Error('Session not found');
      }
      row.deletedAt = isDeleted ? new Date('2026-02-23T12:00:00.000Z') : null;
    });

    mockListSessionListBuckets.mockImplementation(
      async ({ includeDeleted }: { includeDeleted?: boolean } = {}) => ({
        active: null,
        completed: completedRows
          .filter((row) => includeDeleted || row.deletedAt === null)
          .map((row) => ({
            ...row,
          })),
      })
    );

    render(<SessionListRoute />);

    await waitFor(() => {
      expect(screen.getByTestId('completed-session-row-db-completed-visible')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('completed-session-menu-button-db-completed-visible'));
    fireEvent.press(screen.getByTestId('completed-session-modal-action-button'));

    act(() => {
      jest.advanceTimersByTime(400);
    });

    await waitFor(() => {
      expect(screen.queryByTestId('completed-session-row-db-completed-visible')).toBeNull();
    });

    fireEvent.press(screen.getByTestId('toggle-deleted-sessions-button'));

    await waitFor(() => {
      expect(screen.getByTestId('completed-session-row-db-completed-visible')).toBeTruthy();
    });
    expect(screen.getByText('Hide deleted')).toBeTruthy();

    jest.useRealTimers();
  });

  it('creates an active local session on Start Session so returning to the list shows the active row', async () => {
    let hasActiveSession = false;

    mockPersistSessionDraftSnapshot.mockImplementationOnce(async () => {
      hasActiveSession = true;
      return { sessionId: 'db-active-session-1' };
    });

    mockListSessionListBuckets.mockImplementation(async () => {
      if (!hasActiveSession) {
        return {
          active: null,
          completed: [],
        };
      }

      return {
        active: {
          id: 'db-active-session-1',
          status: 'active',
          startedAt: new Date('2026-02-23T18:00:00.000Z'),
          completedAt: null,
          durationSec: null,
          compactDuration: '0m',
          deletedAt: null,
          gymName: null,
          exerciseCount: 0,
          setCount: 0,
        },
        completed: [],
      };
    });

    const route = render(<SessionListRoute />);

    await waitFor(() => {
      expect(screen.getByTestId('start-session-button')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('start-session-button'));

    await waitFor(() => {
      expect(mockPersistSessionDraftSnapshot).toHaveBeenCalledWith(
        expect.objectContaining({
          gymId: null,
          status: 'active',
          exercises: [],
        })
      );
    });
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/session-recorder');
    });

    route.unmount();
    render(<SessionListRoute />);

    await waitFor(() => {
      expect(screen.getByTestId('active-session-row-db-active-session-1')).toBeTruthy();
    });
    expect(screen.getByTestId('resume-active-session-button')).toBeTruthy();
    expect(screen.queryByTestId('start-session-button')).toBeNull();
  });

  it('shows Start Session when no active session exists and navigates to the recorder', () => {
    render(<SessionListScreenShell initialSessions={NO_ACTIVE_SESSIONS} />);

    expect(screen.getByTestId('session-list-pinned-top-region')).toBeTruthy();
    expect(screen.getByTestId('completed-history-scroll')).toBeTruthy();
    expect(screen.queryByText('Active')).toBeNull();
    expect(screen.getByText('Start Session')).toBeTruthy();
    expect(screen.queryByText('Resume Active')).toBeNull();
    expect(screen.queryByText('Close Active')).toBeNull();

    fireEvent.press(screen.getByTestId('start-session-button'));
    expect(mockPush).toHaveBeenCalledWith('/session-recorder');
  });

  it('renders a compact active row and tapping it resumes the session', () => {
    render(<SessionListScreenShell />);

    expect(screen.queryByText('Start Session')).toBeNull();
    expect(screen.getByTestId('resume-active-session-button')).toBeTruthy();
    expect(screen.getByTestId('complete-active-session-button')).toBeTruthy();
    expect(screen.getByTestId('active-session-menu-button')).toBeTruthy();
    expect(screen.getByTestId('session-summary-session-active-1-start').props.children).toBe('2/20 17:30');
    expect(screen.getByTestId('session-summary-session-active-1-sets').props.children).toBe('14 sets');
    expect(screen.queryByTestId('session-summary-session-active-1-weight')).toBeNull();

    fireEvent.press(screen.getByTestId('resume-active-session-button'));
    expect(mockPush).toHaveBeenCalledWith('/session-recorder');
  });

  it('shows no completed-history state while an active session exists', () => {
    render(<SessionListScreenShell initialSessions={ACTIVE_ONLY_SESSIONS} />);

    expect(screen.getByText('Active')).toBeTruthy();
    expect(screen.getByTestId('resume-active-session-button')).toBeTruthy();
    expect(screen.getByText('No completed sessions')).toBeTruthy();
    expect(screen.queryByTestId('session-list-empty-state')).toBeNull();
  });

  it('completes the active session from the inline action and returns Start Session gating', () => {
    render(<SessionListScreenShell />);

    fireEvent.press(screen.getByTestId('complete-active-session-button'));

    expect(screen.getByText('Start Session')).toBeTruthy();
    expect(screen.queryByTestId('resume-active-session-button')).toBeNull();
    expect(screen.getByTestId('completed-session-row-session-active-1')).toBeTruthy();
  });

  it('opens the active-session menu and discards the active session', () => {
    render(<SessionListScreenShell />);

    fireEvent.press(screen.getByTestId('active-session-menu-button'));
    expect(screen.getByText('Delete')).toBeTruthy();

    fireEvent.press(screen.getByTestId('discard-active-session-button'));

    expect(screen.getByText('Start Session')).toBeTruthy();
    expect(screen.queryByTestId('active-session-menu-button')).toBeNull();
  });

  it('toggles deleted-session visibility, shows compact metrics, and supports delete/undelete', () => {
    jest.useFakeTimers();
    render(<SessionListScreenShell initialSessions={NO_ACTIVE_SESSIONS} />);

    expect(screen.getByTestId('session-summary-completed-visible-duration').props.children).toBe('58m');
    expect(screen.getByTestId('session-summary-completed-visible-sets').props.children).toBe('12 sets');
    expect(screen.queryByTestId('session-summary-completed-visible-weight')).toBeNull();
    expect(screen.queryByText('Read-only')).toBeNull();
    expect(screen.queryByTestId('completed-session-row-completed-deleted')).toBeNull();

    fireEvent.press(screen.getByTestId('completed-session-menu-button-completed-visible'));
    expect(screen.getByTestId('completed-session-delete-modal-card')).toBeTruthy();
    expect(screen.getByText('Delete')).toBeTruthy();
    fireEvent.press(screen.getByTestId('completed-session-menu-overlay'));
    expect(screen.queryByTestId('completed-session-delete-modal-card')).toBeNull();
    expect(screen.getByTestId('completed-session-row-completed-visible')).toBeTruthy();

    fireEvent.press(screen.getByTestId('completed-session-menu-button-completed-visible'));
    fireEvent.press(screen.getByTestId('completed-session-modal-action-button'));
    expect(screen.getByTestId('completed-session-row-completed-visible')).toBeTruthy();
    act(() => {
      jest.advanceTimersByTime(400);
    });
    expect(screen.queryByTestId('completed-session-row-completed-visible')).toBeNull();

    fireEvent.press(screen.getByTestId('toggle-deleted-sessions-button'));

    expect(screen.getByTestId('completed-session-row-completed-deleted')).toBeTruthy();
    expect(screen.getByTestId('session-summary-completed-deleted-duration').props.children).toBe('1h 5m');
    expect(screen.getByTestId('completed-session-menu-button-completed-deleted')).toBeTruthy();

    fireEvent.press(screen.getByTestId('completed-session-menu-button-completed-deleted'));
    expect(screen.getByTestId('completed-session-undelete-modal-card')).toBeTruthy();
    expect(screen.getByText('Undelete')).toBeTruthy();
    expect(screen.queryByText('Session Options')).toBeNull();
    expect(screen.queryByText('Restore this session to the default history list.')).toBeNull();
    fireEvent.press(screen.getByTestId('completed-session-menu-overlay'));
    expect(screen.queryByTestId('completed-session-undelete-modal-card')).toBeNull();
    expect(screen.getByTestId('completed-session-row-completed-deleted')).toBeTruthy();

    fireEvent.press(screen.getByTestId('completed-session-menu-button-completed-deleted'));
    fireEvent.press(screen.getByTestId('completed-session-modal-action-button'));
    expect(screen.getByLabelText('Open completed session actions completed-deleted')).toBeTruthy();

    jest.useRealTimers();
  });

  it('navigates from completed row body and keeps menu interaction separate', () => {
    render(<SessionListScreenShell initialSessions={NO_ACTIVE_SESSIONS} />);

    fireEvent.press(screen.getByTestId('completed-session-open-button-completed-visible'));
    expect(mockPush).toHaveBeenCalledWith('/completed-session/completed-visible');

    mockPush.mockReset();
    fireEvent.press(screen.getByTestId('completed-session-menu-button-completed-visible'));

    expect(mockPush).not.toHaveBeenCalled();
    expect(screen.getByText('Edit')).toBeTruthy();
    expect(screen.getByText('Reopen')).toBeTruthy();
    expect(screen.getByText('Delete')).toBeTruthy();
  });

  it('renders completed session menu actions in one row without title or helper copy', () => {
    render(<SessionListScreenShell initialSessions={NO_ACTIVE_SESSIONS} />);

    fireEvent.press(screen.getByTestId('completed-session-menu-button-completed-visible'));

    expect(screen.queryByText('Session Options')).toBeNull();
    expect(screen.queryByText('Hide this session from the default history list.')).toBeNull();
    expect(screen.queryByText('Finish or discard the active session before reopening another.')).toBeNull();

    expect(StyleSheet.flatten(screen.getByTestId('completed-session-menu-action-row').props.style)).toEqual(
      expect.objectContaining({ flexDirection: 'row' })
    );
  });

  it('opens completed edit in recorder mode from the menu', () => {
    render(<SessionListScreenShell initialSessions={NO_ACTIVE_SESSIONS} />);

    fireEvent.press(screen.getByTestId('completed-session-menu-button-completed-visible'));
    fireEvent.press(screen.getByTestId('completed-session-edit-menu-action-button'));

    expect(mockPush).toHaveBeenCalledWith('/session-recorder?mode=completed-edit&sessionId=completed-visible');
  });

  it('disables completed reopen from the menu while an active session exists', () => {
    render(
      <SessionListScreenShell
        initialSessions={[
          ...ACTIVE_ONLY_SESSIONS,
          {
            id: 'completed-visible',
            startedAt: '2026-02-20T16:00:00.000Z',
            status: 'completed',
            completedAt: '2026-02-20T16:58:00.000Z',
            durationSec: 3480,
            durationDisplay: '58m',
            gymName: 'Westside',
            exerciseCount: 3,
            setCount: 12,
            totalWeight: 4230,
            deletedAt: null,
          },
        ]}
      />
    );

    fireEvent.press(screen.getByTestId('completed-session-menu-button-completed-visible'));
    expect(screen.queryByText('Finish or discard the active session before reopening another.')).toBeNull();
    expect(screen.getByTestId('completed-session-reopen-menu-action-button').props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true })
    );
  });

  it('reopens a DB-backed completed session from the menu and refreshes it into the active row', async () => {
    type MutableSessionRow = {
      id: string;
      status: 'active' | 'completed';
      startedAt: Date;
      completedAt: Date | null;
      durationSec: number | null;
      compactDuration: string;
      deletedAt: Date | null;
      gymName: string | null;
      exerciseCount: number;
      setCount: number;
    };

    const rows: MutableSessionRow[] = [
      {
        id: 'db-completed-reopen-target',
        status: 'completed',
        startedAt: new Date('2026-02-20T16:00:00.000Z'),
        completedAt: new Date('2026-02-20T16:58:00.000Z'),
        durationSec: 3480,
        compactDuration: '58m',
        deletedAt: null,
        gymName: 'Westside',
        exerciseCount: 3,
        setCount: 12,
      },
      {
        id: 'db-completed-other',
        status: 'completed',
        startedAt: new Date('2026-02-19T16:00:00.000Z'),
        completedAt: new Date('2026-02-19T17:05:00.000Z'),
        durationSec: 3900,
        compactDuration: '1h 5m',
        deletedAt: null,
        gymName: 'Garage Gym',
        exerciseCount: 2,
        setCount: 9,
      },
    ];

    mockReopenCompletedSessionDraft.mockImplementation(async (sessionId: string) => {
      const target = rows.find((row) => row.id === sessionId);
      if (!target) {
        throw new Error('Session not found');
      }

      target.status = 'active';
      target.completedAt = null;
      target.durationSec = null;
      target.compactDuration = '0m';
    });

    mockListSessionListBuckets.mockImplementation(async () => ({
      active:
        rows.find((row) => row.status === 'active' && row.deletedAt === null) ?? null,
      completed: rows.filter((row) => row.status === 'completed'),
    }));

    render(<SessionListRoute />);

    await waitFor(() => {
      expect(screen.getByTestId('completed-session-row-db-completed-reopen-target')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('completed-session-menu-button-db-completed-reopen-target'));
    fireEvent.press(screen.getByTestId('completed-session-reopen-menu-action-button'));

    await waitFor(() => {
      expect(mockReopenCompletedSessionDraft).toHaveBeenCalledWith('db-completed-reopen-target');
      expect(screen.getByTestId('active-session-row-db-completed-reopen-target')).toBeTruthy();
    });

    expect(screen.queryByTestId('completed-session-row-db-completed-reopen-target')).toBeNull();
    expect(screen.queryByTestId('completed-session-delete-modal-card')).toBeNull();
  });

  it('closes the completed-session menu and keeps the list stable when reopen fails', async () => {
    mockReopenCompletedSessionDraft.mockRejectedValueOnce(new Error('boom'));
    mockListSessionListBuckets.mockResolvedValue({
      active: null,
      completed: [
        {
          id: 'db-completed-reopen-failure',
          status: 'completed',
          startedAt: new Date('2026-02-20T16:00:00.000Z'),
          completedAt: new Date('2026-02-20T16:58:00.000Z'),
          durationSec: 3480,
          compactDuration: '58m',
          deletedAt: null,
          gymName: 'Westside',
          exerciseCount: 3,
          setCount: 12,
        },
      ],
    });

    render(<SessionListRoute />);

    await waitFor(() => {
      expect(screen.getByTestId('completed-session-row-db-completed-reopen-failure')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('completed-session-menu-button-db-completed-reopen-failure'));
    expect(screen.getByTestId('completed-session-delete-modal-card')).toBeTruthy();

    fireEvent.press(screen.getByTestId('completed-session-reopen-menu-action-button'));

    await waitFor(() => {
      expect(mockReopenCompletedSessionDraft).toHaveBeenCalledWith('db-completed-reopen-failure');
      expect(screen.queryByTestId('completed-session-delete-modal-card')).toBeNull();
    });

    expect(screen.getByTestId('completed-session-row-db-completed-reopen-failure')).toBeTruthy();
    expect(screen.queryByTestId('active-session-row-db-completed-reopen-failure')).toBeNull();
  });

  it('shows the empty state when there are no active or completed sessions', () => {
    render(<SessionListScreenShell initialSessions={[]} />);

    expect(screen.getByText('No sessions yet')).toBeTruthy();
    expect(screen.getByText('Start Session')).toBeTruthy();
  });
});

describe('formatCompactDuration', () => {
  it('formats durations in compact tokens', () => {
    expect(formatCompactDuration(null)).toBe('0m');
    expect(formatCompactDuration(3600)).toBe('1h');
    expect(formatCompactDuration(4500)).toBe('1h 15m');
  });
});
