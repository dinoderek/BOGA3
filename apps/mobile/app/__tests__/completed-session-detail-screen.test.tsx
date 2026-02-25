import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import CompletedSessionDetailRoute, {
  CompletedSessionDetailScreenShell,
  type CompletedSessionDetailDataClient,
  type CompletedSessionDetailRecord,
} from '../completed-session/[sessionId]';

let mockLocalSearchParams: Record<string, string | undefined> = {
  sessionId: 'session-completed-1',
};
const mockStackScreen = jest.fn();

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockLocalSearchParams,
  Stack: {
    Screen: (props: unknown) => {
      mockStackScreen(props);
      return null;
    },
  },
}));

jest.mock('@/src/data', () => ({
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
  loadLocalGymById: jest.fn(),
  loadSessionSnapshotById: jest.fn(),
}));

const {
  loadLocalGymById: mockLoadLocalGymById,
  loadSessionSnapshotById: mockLoadSessionSnapshotById,
} = jest.requireMock('@/src/data') as {
  loadLocalGymById: jest.Mock;
  loadSessionSnapshotById: jest.Mock;
};

const COMPLETED_SESSION_DETAIL_FIXTURE: CompletedSessionDetailRecord = {
  id: 'completed-under-test',
  startedAt: '2026-02-20T16:00:00.000Z',
  completedAt: '2026-02-20T16:58:00.000Z',
  durationDisplay: '58m',
  gymName: 'Westside Barbell Club',
  deletedAt: null,
  reopenDisabledReason: 'Finish or discard the active session before reopening another.',
  exercises: [
    {
      id: 'exercise-1',
      name: 'Bench Press',
      machineName: 'Flat Bench',
      sets: [
        { id: 'set-1', weight: '185', reps: '8' },
        { id: 'set-2', weight: '185', reps: '6' },
      ],
    },
  ],
};

describe('CompletedSessionDetailScreenShell', () => {
  beforeEach(() => {
    mockLoadLocalGymById.mockReset();
    mockLoadSessionSnapshotById.mockReset();
    mockStackScreen.mockReset();
  });

  it('renders loading then a recorder-like read-only detail on success', async () => {
    const dataClient: CompletedSessionDetailDataClient = {
      loadCompletedSession: jest.fn().mockResolvedValue(COMPLETED_SESSION_DETAIL_FIXTURE),
    };

    render(<CompletedSessionDetailScreenShell sessionId="completed-under-test" dataClient={dataClient} />);

    expect(screen.getByTestId('completed-session-detail-loading')).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByTestId('completed-session-detail-screen')).toBeTruthy();
    });

    expect(screen.getByText('Start')).toBeTruthy();
    expect(screen.getByText('End')).toBeTruthy();
    expect(screen.getByText('Duration')).toBeTruthy();
    expect(screen.getByText('Location')).toBeTruthy();
    expect(screen.queryByText('Date and Time')).toBeNull();
    expect(screen.queryByText('Gym')).toBeNull();
    expect(screen.getByText('Edit')).toBeTruthy();
    expect(screen.getByText('Reopen')).toBeTruthy();
    expect(screen.getByText('Delete')).toBeTruthy();
    expect(screen.getByTestId('completed-session-detail-screen').props.stickyHeaderIndices).toEqual([0]);
    expect(screen.getByTestId('completed-session-detail-sets-table-header-exercise-1')).toBeTruthy();
    expect(screen.getByText('Weight')).toBeTruthy();
    expect(screen.getByText('Reps')).toBeTruthy();
    expect(screen.getByText('Bench Press')).toBeTruthy();
    expect(screen.getByText('Flat Bench')).toBeTruthy();
    expect(screen.getAllByText('185').length).toBeGreaterThan(0);
    expect(screen.getByText('8')).toBeTruthy();
    expect(screen.getByText('58m')).toBeTruthy();
  });

  it('edit action toggles mode and updates the route title', async () => {
    const dataClient: CompletedSessionDetailDataClient = {
      loadCompletedSession: jest.fn().mockResolvedValue({
        ...COMPLETED_SESSION_DETAIL_FIXTURE,
        reopenDisabledReason: null,
      }),
    };

    render(<CompletedSessionDetailScreenShell sessionId="completed-under-test" dataClient={dataClient} />);

    await waitFor(() => {
      expect(screen.getByTestId('completed-session-detail-screen')).toBeTruthy();
    });

    expect(screen.getByText('Edit')).toBeTruthy();
    expect(mockStackScreen).toHaveBeenLastCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({ title: 'View Session' }),
      })
    );

    fireEvent.press(screen.getByTestId('completed-session-detail-edit-button'));

    expect(screen.getByText('View')).toBeTruthy();
    expect(screen.getByTestId('completed-session-detail-edit-mode-banner')).toBeTruthy();
    expect(mockStackScreen).toHaveBeenLastCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({ title: 'Edit Session' }),
      })
    );
  });

  it('reopen action shows feedback when enabled', async () => {
    const dataClient: CompletedSessionDetailDataClient = {
      loadCompletedSession: jest.fn().mockResolvedValue({
        ...COMPLETED_SESSION_DETAIL_FIXTURE,
        reopenDisabledReason: null,
      }),
    };

    render(<CompletedSessionDetailScreenShell sessionId="completed-under-test" dataClient={dataClient} />);

    await waitFor(() => {
      expect(screen.getByTestId('completed-session-detail-screen')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('completed-session-detail-reopen-button'));

    expect(screen.getByText('Reopen action coming next.')).toBeTruthy();
  });

  it('delete action toggles to undelete and back', async () => {
    const dataClient: CompletedSessionDetailDataClient = {
      loadCompletedSession: jest.fn().mockResolvedValue({
        ...COMPLETED_SESSION_DETAIL_FIXTURE,
        deletedAt: null,
      }),
    };

    render(<CompletedSessionDetailScreenShell sessionId="completed-under-test" dataClient={dataClient} />);

    await waitFor(() => {
      expect(screen.getByTestId('completed-session-detail-screen')).toBeTruthy();
    });

    expect(screen.getByText('Delete')).toBeTruthy();
    fireEvent.press(screen.getByTestId('completed-session-detail-delete-button'));
    expect(screen.getByText('Undelete')).toBeTruthy();
    expect(screen.getByText('Session hidden from default history (viewer-only stub).')).toBeTruthy();

    fireEvent.press(screen.getByTestId('completed-session-detail-delete-button'));
    expect(screen.getByText('Delete')).toBeTruthy();
    expect(screen.getByText('Session restored to default history (viewer-only stub).')).toBeTruthy();
  });

  it('renders a stable empty state when the session is missing', async () => {
    const dataClient: CompletedSessionDetailDataClient = {
      loadCompletedSession: jest.fn().mockResolvedValue(null),
    };

    render(<CompletedSessionDetailScreenShell sessionId="missing-session" dataClient={dataClient} />);

    await waitFor(() => {
      expect(screen.getByTestId('completed-session-detail-empty')).toBeTruthy();
    });

    expect(screen.getByText('Session not found')).toBeTruthy();
  });

  it('renders an error state when loading fails', async () => {
    const dataClient: CompletedSessionDetailDataClient = {
      loadCompletedSession: jest.fn().mockRejectedValue(new Error('boom')),
    };

    render(<CompletedSessionDetailScreenShell sessionId="broken-session" dataClient={dataClient} />);

    await waitFor(() => {
      expect(screen.getByTestId('completed-session-detail-error')).toBeTruthy();
    });

    expect(screen.getByText('boom')).toBeTruthy();
  });
});

describe('CompletedSessionDetailRoute', () => {
  beforeEach(() => {
    mockLoadLocalGymById.mockReset();
    mockLoadSessionSnapshotById.mockReset();
    mockStackScreen.mockReset();
  });

  it('reads the session id from route params', async () => {
    mockLocalSearchParams = { sessionId: 'session-completed-1' };

    render(<CompletedSessionDetailRoute />);

    await waitFor(() => {
      expect(screen.getByTestId('completed-session-detail-screen')).toBeTruthy();
    });
    expect(screen.getByTestId('completed-session-detail-screen').props.testID).toBe('completed-session-detail-screen');
  });

  it('uses Edit Session title when route intent is edit', async () => {
    mockLocalSearchParams = { sessionId: 'session-completed-1', intent: 'edit' };

    render(<CompletedSessionDetailRoute />);

    await waitFor(() => {
      expect(screen.getByTestId('completed-session-detail-screen')).toBeTruthy();
    });

    expect(mockStackScreen).toHaveBeenLastCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({ title: 'Edit Session' }),
      })
    );
  });

  it('loads a persisted completed session by generated id via the default route data client', async () => {
    const generatedSessionId = 'generated-completed-session-id';
    mockLoadSessionSnapshotById.mockResolvedValue({
      sessionId: generatedSessionId,
      gymId: 'test-gym-1',
      status: 'completed',
      startedAt: new Date('2026-02-25T10:00:00.000Z'),
      completedAt: new Date('2026-02-25T10:45:00.000Z'),
      durationSec: 2700,
      deletedAt: null,
      createdAt: new Date('2026-02-25T10:00:00.000Z'),
      updatedAt: new Date('2026-02-25T10:45:00.000Z'),
      exercises: [
        {
          id: 'exercise-1',
          name: 'Back Squat',
          machineName: 'Rack',
          originScopeId: 'private',
          originSourceId: 'local',
          sets: [
            { id: 'set-1', repsValue: '5', weightValue: '225' },
            { id: 'set-2', repsValue: '5', weightValue: '225' },
          ],
        },
      ],
    });
    mockLoadLocalGymById.mockResolvedValue({
      id: 'test-gym-1',
      name: 'Route Test Gym',
    });

    mockLocalSearchParams = { sessionId: generatedSessionId };

    render(<CompletedSessionDetailRoute />);

    await waitFor(() => {
      expect(screen.getByTestId('completed-session-detail-screen')).toBeTruthy();
    });
    expect(screen.getByText('Back Squat')).toBeTruthy();
    expect(screen.getByText('Route Test Gym')).toBeTruthy();
    expect(screen.queryByTestId('completed-session-detail-empty')).toBeNull();
    expect(mockLoadSessionSnapshotById).toHaveBeenCalledWith(generatedSessionId);
  });
});
