import { render, screen, waitFor } from '@testing-library/react-native';

import IndexScreen from '../index';

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
    active: {
      id: 'home-active',
      status: 'active',
      startedAt: new Date('2026-02-23T12:00:00.000Z'),
      completedAt: null,
      durationSec: 1500,
      compactDuration: '25m',
      deletedAt: null,
      gymName: 'Home Gym',
      exerciseCount: 2,
      setCount: 6,
    },
    completed: [],
  }),
  persistSessionDraftSnapshot: jest.fn(),
  setSessionDeletedState: jest.fn(),
}));

jest.mock('expo-router', () => {
  const mockPush = jest.fn();

  return {
    useRouter: () => ({
      push: mockPush,
    }),
    useFocusEffect: () => {},
    __mockPush: mockPush,
  };
});

const { __mockPush: mockPush } = jest.requireMock('expo-router') as {
  __mockPush: jest.Mock;
};

describe('IndexScreen', () => {
  beforeEach(() => {
    mockPush.mockReset();
  });

  it('renders the session list shell as the home route', async () => {
    render(<IndexScreen />);

    await waitFor(() => {
      expect(screen.getByText('Active Session')).toBeTruthy();
    });
    expect(screen.getByText('Completed History')).toBeTruthy();
    expect(screen.getByTestId('resume-active-session-button')).toBeTruthy();
    expect(screen.getByTestId('complete-active-session-button')).toBeTruthy();
    expect(screen.queryByText('Milestone 0 foundation ready')).toBeNull();
  });
});
