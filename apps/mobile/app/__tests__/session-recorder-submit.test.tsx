import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import SessionRecorderScreen from '../session-recorder';

jest.mock('@/src/data', () => ({
  loadLatestSessionDraftSnapshot: jest.fn().mockResolvedValue(null),
  persistSessionDraftSnapshot: jest.fn().mockResolvedValue({ sessionId: 'test-session' }),
  upsertLocalGym: jest.fn().mockResolvedValue(undefined),
  completeSessionDraft: jest.fn().mockResolvedValue({
    sessionId: 'test-session',
    completedAt: new Date('2026-02-24T00:00:00.000Z'),
    durationSec: 0,
    wasAlreadyCompleted: false,
  }),
}));

jest.mock('expo-router', () => {
  const mockReplace = jest.fn();
  return {
    useRouter: () => ({ replace: mockReplace, push: jest.fn() }),
    __mockReplace: mockReplace,
  };
});

const {
  persistSessionDraftSnapshot: mockPersistSessionDraftSnapshot,
  completeSessionDraft: mockCompleteSessionDraft,
} = jest.requireMock('@/src/data') as {
  persistSessionDraftSnapshot: jest.Mock;
  completeSessionDraft: jest.Mock;
};

const { __mockReplace: mockReplace } = jest.requireMock('expo-router') as {
  __mockReplace: jest.Mock;
};

describe('SessionRecorderScreen submit cleanup flow', () => {
  beforeEach(() => {
    mockPersistSessionDraftSnapshot.mockClear();
    mockCompleteSessionDraft.mockClear();
    mockReplace.mockClear();
  });

  it('allows submit without gym selection', async () => {
    render(<SessionRecorderScreen />);

    fireEvent.press(screen.getByText('Log new exercise'));
    fireEvent.press(screen.getByLabelText('Select exercise Barbell Squat'));
    fireEvent.changeText(screen.getByLabelText('Weight for exercise 1 set 1'), '225');
    fireEvent.changeText(screen.getByLabelText('Reps for exercise 1 set 1'), '5');
    fireEvent.press(screen.getByText('Submit Session'));

    expect(screen.queryByText('Session submitted (UI only)')).toBeNull();
    await waitFor(() => {
      expect(mockPersistSessionDraftSnapshot).toHaveBeenCalled();
      expect(mockCompleteSessionDraft).toHaveBeenCalledWith('test-session');
      expect(mockReplace).toHaveBeenCalledWith('/session-list');
    });
  });

  it('shows incomplete-set modal with go-back and remove-and-submit actions', async () => {
    render(<SessionRecorderScreen />);

    fireEvent.press(screen.getByText('Choose gym'));
    fireEvent.press(screen.getByLabelText('Select gym Westside Barbell Club'));
    fireEvent.press(screen.getByText('Log new exercise'));
    fireEvent.press(screen.getByLabelText('Select exercise Barbell Squat'));
    fireEvent.changeText(screen.getByLabelText('Weight for exercise 1 set 1'), '225');
    fireEvent.changeText(screen.getByLabelText('Reps for exercise 1 set 1'), '5');
    fireEvent.press(screen.getByLabelText('Add set to exercise 1'));
    fireEvent.changeText(screen.getByLabelText('Weight for exercise 1 set 2'), '205');

    fireEvent.press(screen.getByText('Submit Session'));
    expect(screen.getByText('Remove incomplete sets and submit?')).toBeTruthy();

    fireEvent.press(screen.getByText('Go back to edit session'));
    expect(screen.queryByText('Remove incomplete sets and submit?')).toBeNull();
    expect(screen.queryByText('Session submitted (UI only)')).toBeNull();

    fireEvent.press(screen.getByText('Submit Session'));
    fireEvent.press(screen.getByText('Remove incomplete sets and submit'));

    expect(screen.queryByText('Session submitted (UI only)')).toBeNull();
    await waitFor(() => {
      expect(mockPersistSessionDraftSnapshot).toHaveBeenCalled();
      expect(mockCompleteSessionDraft).toHaveBeenCalledWith('test-session');
      expect(mockReplace).toHaveBeenCalledWith('/session-list');
    });
  });

  it('shows empty-exercise modal and can submit with empty exercises removed', async () => {
    render(<SessionRecorderScreen />);

    fireEvent.press(screen.getByText('Log new exercise'));
    fireEvent.press(screen.getByLabelText('Select exercise Bench Press'));
    fireEvent.press(screen.getByLabelText('Remove set 1 from exercise 1'));
    fireEvent.press(screen.getByText('Submit Session'));

    expect(screen.getByText('Remove exercises with no sets and submit?')).toBeTruthy();
    fireEvent.press(screen.getByText('Remove empty exercises and submit'));

    expect(screen.queryByText('Session submitted (UI only)')).toBeNull();
    await waitFor(() => {
      expect(mockPersistSessionDraftSnapshot).toHaveBeenCalled();
      expect(mockCompleteSessionDraft).toHaveBeenCalledWith('test-session');
      expect(mockReplace).toHaveBeenCalledWith('/session-list');
    });
  });
});
