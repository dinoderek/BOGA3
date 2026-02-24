import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import SessionRecorderScreen from '../session-recorder';

jest.mock('@/src/data', () => ({
  loadLatestSessionDraftSnapshot: jest.fn().mockResolvedValue(null),
  persistSessionDraftSnapshot: jest.fn().mockResolvedValue({ sessionId: 'persisted-session-1' }),
  upsertLocalGym: jest.fn().mockResolvedValue(undefined),
  completeSessionDraft: jest.fn().mockResolvedValue({
    sessionId: 'persisted-session-1',
    completedAt: new Date('2026-02-24T00:00:00.000Z'),
    durationSec: 0,
    wasAlreadyCompleted: false,
  }),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
}));

const {
  loadLatestSessionDraftSnapshot: mockLoadLatestSessionDraftSnapshot,
  persistSessionDraftSnapshot: mockPersistSessionDraftSnapshot,
} = jest.requireMock('@/src/data') as {
  loadLatestSessionDraftSnapshot: jest.Mock;
  persistSessionDraftSnapshot: jest.Mock;
};

const flushMicrotasks = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

describe('SessionRecorderScreen persistence wiring', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockLoadLatestSessionDraftSnapshot.mockReset();
    mockPersistSessionDraftSnapshot.mockReset();
    mockLoadLatestSessionDraftSnapshot.mockResolvedValue(null);
    mockPersistSessionDraftSnapshot.mockResolvedValue({ sessionId: 'persisted-session-1' });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('persists structural edits immediately and text edits with the existing 3s debounce SLA', async () => {
    render(<SessionRecorderScreen />);

    await waitFor(() => {
      expect(mockLoadLatestSessionDraftSnapshot).toHaveBeenCalledTimes(1);
    });
    await act(async () => {
      await flushMicrotasks();
    });

    fireEvent.press(screen.getByText('Log new exercise'));
    fireEvent.press(screen.getByLabelText('Select exercise Barbell Squat'));

    await waitFor(() => {
      expect(mockPersistSessionDraftSnapshot).toHaveBeenCalledTimes(1);
    });
    expect(mockPersistSessionDraftSnapshot.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        status: 'active',
        exercises: [
          expect.objectContaining({
            name: 'Barbell Squat',
            sets: [expect.objectContaining({ repsValue: '', weightValue: '' })],
          }),
        ],
      })
    );

    mockPersistSessionDraftSnapshot.mockClear();

    fireEvent.changeText(screen.getByLabelText('Weight for exercise 1 set 1'), '225');

    await act(async () => {
      jest.advanceTimersByTime(2_999);
      await flushMicrotasks();
    });
    expect(mockPersistSessionDraftSnapshot).toHaveBeenCalledTimes(0);

    await act(async () => {
      jest.advanceTimersByTime(1);
      await flushMicrotasks();
    });

    expect(mockPersistSessionDraftSnapshot).toHaveBeenCalledTimes(1);
    expect(mockPersistSessionDraftSnapshot.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        sessionId: 'persisted-session-1',
        exercises: [
          expect.objectContaining({
            sets: [expect.objectContaining({ weightValue: '225' })],
          }),
        ],
      })
    );
  });

  it('flushes pending debounced text edits on unmount (best-effort navigation-out/exit flush)', async () => {
    const rendered = render(<SessionRecorderScreen />);

    await waitFor(() => {
      expect(mockLoadLatestSessionDraftSnapshot).toHaveBeenCalledTimes(1);
    });
    await act(async () => {
      await flushMicrotasks();
    });

    fireEvent.press(screen.getByText('Log new exercise'));
    fireEvent.press(screen.getByLabelText('Select exercise Barbell Squat'));
    await waitFor(() => {
      expect(mockPersistSessionDraftSnapshot).toHaveBeenCalledTimes(1);
    });

    mockPersistSessionDraftSnapshot.mockClear();

    fireEvent.changeText(screen.getByLabelText('Reps for exercise 1 set 1'), '5');

    await act(async () => {
      jest.advanceTimersByTime(1_000);
      await flushMicrotasks();
    });
    expect(mockPersistSessionDraftSnapshot).toHaveBeenCalledTimes(0);

    await act(async () => {
      rendered.unmount();
      await flushMicrotasks();
    });

    expect(mockPersistSessionDraftSnapshot).toHaveBeenCalledTimes(1);
    expect(mockPersistSessionDraftSnapshot.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        sessionId: 'persisted-session-1',
        exercises: [
          expect.objectContaining({
            sets: [expect.objectContaining({ repsValue: '5' })],
          }),
        ],
      })
    );
  });
});
