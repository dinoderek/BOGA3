import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import SessionRecorderScreen from '../session-recorder';

const mockPush = jest.fn();
const mockFocusCallbacks = new Set<() => void | (() => void)>();
let mockSearchParams: Record<string, string | undefined> = {};

jest.mock('@/src/data', () => ({
  loadLocalGymById: jest.fn().mockResolvedValue(null),
  loadLatestSessionDraftSnapshot: jest.fn().mockResolvedValue(null),
  loadSessionSnapshotById: jest.fn().mockResolvedValue(null),
  persistCompletedSessionSnapshot: jest.fn().mockResolvedValue({
    sessionId: 'test-session',
    completedAt: new Date('2026-02-24T00:00:00.000Z'),
    durationSec: 0,
  }),
  persistSessionDraftSnapshot: jest.fn().mockResolvedValue({ sessionId: 'test-session' }),
  upsertLocalGym: jest.fn().mockResolvedValue(undefined),
  completeSessionDraft: jest.fn().mockResolvedValue({
    sessionId: 'test-session',
    completedAt: new Date('2026-02-24T00:00:00.000Z'),
    durationSec: 0,
    wasAlreadyCompleted: false,
  }),
}));

jest.mock('@/src/data/exercise-catalog', () => ({
  listExerciseCatalogExercises: jest.fn().mockResolvedValue([
    {
      id: 'sys_barbell_back_squat',
      name: 'Barbell Squat',
      deletedAt: null,
      mappings: [],
    },
    {
      id: 'sys_barbell_bench_press',
      name: 'Bench Press',
      deletedAt: null,
      mappings: [],
    },
    {
      id: 'sys_romanian_deadlift',
      name: 'Deadlift',
      deletedAt: null,
      mappings: [],
    },
  ]),
  listExerciseCatalogMuscleGroups: jest.fn().mockResolvedValue([
    { id: 'chest', displayName: 'Chest', familyName: 'Chest', sortOrder: 0 },
    { id: 'triceps', displayName: 'Triceps', familyName: 'Arms', sortOrder: 1 },
    { id: 'delts_front', displayName: 'Front Delts', familyName: 'Shoulders', sortOrder: 2 },
  ]),
  saveExerciseCatalogExercise: jest.fn().mockImplementation(async (input: any) => ({
    id: input.id ?? 'custom-exercise-1',
    name: input.name.trim(),
    deletedAt: null,
    mappings: input.mappings.map((mapping: any, index: number) => ({
      id: `map-${index + 1}`,
      muscleGroupId: mapping.muscleGroupId,
      weight: mapping.weight,
      role: mapping.role,
    })),
  })),
}));

jest.mock('expo-router', () => ({
  useFocusEffect: (callback: () => void | (() => void)) => {
    const React = require('react');
    React.useEffect(() => {
      mockFocusCallbacks.add(callback);
      const cleanup = callback();
      return () => {
        mockFocusCallbacks.delete(callback);
        if (typeof cleanup === 'function') {
          cleanup();
        }
      };
    }, [callback]);
  },
  useLocalSearchParams: () => mockSearchParams,
  useNavigation: () => ({ addListener: jest.fn(() => () => undefined), dispatch: jest.fn() }),
  useRouter: () => ({ replace: jest.fn(), push: mockPush }),
  __triggerFocus: () => {
    for (const callback of [...mockFocusCallbacks]) {
      callback();
    }
  },
}));

const { __triggerFocus } = jest.requireMock('expo-router') as {
  __triggerFocus: () => void;
};

const { loadSessionSnapshotById: mockLoadSessionSnapshotById } = jest.requireMock('@/src/data') as {
  loadSessionSnapshotById: jest.Mock;
};

const { saveExerciseCatalogExercise: mockSaveExerciseCatalogExercise } = jest.requireMock(
  '@/src/data/exercise-catalog'
) as {
  saveExerciseCatalogExercise: jest.Mock;
};

const buildCompletedEditSnapshot = (overrides: Partial<any> = {}) => ({
  sessionId: 'completed-edit-1',
  gymId: null,
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
      name: 'Bench Press',
      machineName: null,
      originScopeId: 'private',
      originSourceId: 'local',
      sets: [{ id: 'set-1', repsValue: '5', weightValue: '225' }],
    },
  ],
  ...overrides,
});

describe('SessionRecorderScreen exercise interactions', () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockFocusCallbacks.clear();
    mockSearchParams = {};
    mockLoadSessionSnapshotById.mockReset();
    mockLoadSessionSnapshotById.mockResolvedValue(null);
    mockSaveExerciseCatalogExercise.mockClear();
  });

  it('adds a preset exercise from the log flow and updates first set fields', async () => {
    render(<SessionRecorderScreen />);

    expect(screen.getByText('No exercises logged yet.')).toBeTruthy();

    fireEvent.press(screen.getByText('Log new exercise'));
    expect(screen.getByText('Select Exercise')).toBeTruthy();
    expect(await screen.findByLabelText('Select exercise Barbell Squat')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Select exercise Barbell Squat'));

    expect(screen.queryByText('Select Exercise')).toBeNull();
    expect(screen.getByText('Barbell Squat')).toBeTruthy();
    expect(screen.queryByText('No exercises logged yet.')).toBeNull();

    fireEvent.changeText(screen.getByLabelText('Weight for exercise 1 set 1'), '225');
    fireEvent.changeText(screen.getByLabelText('Reps for exercise 1 set 1'), '5');

    expect(screen.getByDisplayValue('225')).toBeTruthy();
    expect(screen.getByDisplayValue('5')).toBeTruthy();
  });

  it('creates a new exercise inline from the picker and keeps set add/remove interactions intact', async () => {
    render(<SessionRecorderScreen />);

    fireEvent.press(screen.getByText('Log new exercise'));
    fireEvent.press(screen.getByText('Add new'));
    expect(mockPush).not.toHaveBeenCalled();
    expect(await screen.findByText('Create Exercise')).toBeTruthy();

    fireEvent.changeText(screen.getByLabelText('Exercise definition name'), 'Custom Press');
    fireEvent.press(screen.getByLabelText('Open primary muscle selector'));
    fireEvent.press(await screen.findByLabelText('Select primary muscle Chest'));
    fireEvent.press(screen.getByLabelText('Save exercise definition'));

    await waitFor(() => {
      expect(mockSaveExerciseCatalogExercise).toHaveBeenCalledWith({
        id: undefined,
        name: 'Custom Press',
        mappings: [{ muscleGroupId: 'chest', weight: 1, role: 'primary' }],
      });
    });

    expect(screen.getByText('Custom Press')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Add set to exercise 1'));
    expect(screen.getByLabelText('Weight for exercise 1 set 2')).toBeTruthy();

    fireEvent.changeText(screen.getByLabelText('Reps for exercise 1 set 2'), '10');
    fireEvent.changeText(screen.getByLabelText('Weight for exercise 1 set 2'), '70');

    fireEvent.press(screen.getByLabelText('Remove set 1 from exercise 1'));
    expect(screen.queryByLabelText('Weight for exercise 1 set 2')).toBeNull();
    expect(screen.getByLabelText('Weight for exercise 1 set 1')).toBeTruthy();
    expect(screen.getByDisplayValue('10')).toBeTruthy();
    expect(screen.getByDisplayValue('70')).toBeTruthy();
  });

  it('routes Manage to exercise catalog', async () => {
    render(<SessionRecorderScreen />);

    fireEvent.press(screen.getByText('Log new exercise'));
    expect(await screen.findByLabelText('Select exercise Barbell Squat')).toBeTruthy();
    fireEvent.press(screen.getByText('Manage'));
    expect(mockPush).toHaveBeenCalledWith('/exercise-catalog?source=session-recorder&intent=manage');
    expect(screen.queryByText('Select Exercise')).toBeNull();
  });

  it('reopens the exercise picker on focus after routing to catalog', async () => {
    render(<SessionRecorderScreen />);

    fireEvent.press(screen.getByText('Log new exercise'));
    expect(await screen.findByLabelText('Select exercise Barbell Squat')).toBeTruthy();

    fireEvent.press(screen.getByText('Manage'));
    expect(screen.queryByText('Select Exercise')).toBeNull();

    act(() => {
      __triggerFocus();
    });

    await waitFor(() => {
      expect(screen.getByText('Select Exercise')).toBeTruthy();
    });
  });

  it('uses the same inline add-new flow in completed-edit mode', async () => {
    mockSearchParams = { mode: 'completed-edit', sessionId: 'completed-edit-1' };
    mockLoadSessionSnapshotById.mockResolvedValue(buildCompletedEditSnapshot());

    render(<SessionRecorderScreen />);

    await waitFor(() => {
      expect(screen.getByText('Save Changes')).toBeTruthy();
      expect(screen.getByText('Bench Press')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Log new exercise'));
    fireEvent.press(screen.getByText('Add new'));
    expect(await screen.findByText('Create Exercise')).toBeTruthy();

    fireEvent.changeText(screen.getByLabelText('Exercise definition name'), 'Cable Fly');
    fireEvent.press(screen.getByLabelText('Open primary muscle selector'));
    fireEvent.press(await screen.findByLabelText('Select primary muscle Chest'));
    fireEvent.press(screen.getByLabelText('Save exercise definition'));

    await waitFor(() => {
      expect(mockSaveExerciseCatalogExercise).toHaveBeenCalledWith({
        id: undefined,
        name: 'Cable Fly',
        mappings: [{ muscleGroupId: 'chest', weight: 1, role: 'primary' }],
      });
      expect(screen.getByText('Cable Fly')).toBeTruthy();
    });
  });

  it('removes an exercise and updates nested set totals', async () => {
    render(<SessionRecorderScreen />);

    fireEvent.press(screen.getByText('Log new exercise'));
    expect(await screen.findByLabelText('Select exercise Barbell Squat')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Select exercise Barbell Squat'));
    fireEvent.press(screen.getByText('Log new exercise'));
    expect(await screen.findByLabelText('Select exercise Bench Press')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Select exercise Bench Press'));

    expect(screen.getByLabelText('Exercise options 1')).toBeTruthy();
    expect(screen.getByLabelText('Exercise options 2')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Exercise options 2'));
    expect(screen.getByLabelText('Change exercise')).toBeTruthy();
    fireEvent.press(screen.getByText('Change exercise'));
    expect(await screen.findByLabelText('Select exercise Deadlift')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Select exercise Deadlift'));
    expect(screen.getByText('Deadlift')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Exercise options 2'));
    fireEvent.press(screen.getByText('Remove exercise'));

    expect(screen.getByLabelText('Exercise options 1')).toBeTruthy();
    expect(screen.queryByLabelText('Exercise options 2')).toBeNull();
    expect(screen.queryByText('Deadlift')).toBeNull();
  });
});
