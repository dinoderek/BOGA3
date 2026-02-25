import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import ExerciseCatalogScreen from '../exercise-catalog';

import {
  listExerciseCatalogExercises,
  listExerciseCatalogMuscleGroups,
  saveExerciseCatalogExercise,
} from '@/src/data/exercise-catalog';

jest.mock('@/src/data/exercise-catalog', () => ({
  listExerciseCatalogMuscleGroups: jest.fn(),
  listExerciseCatalogExercises: jest.fn(),
  saveExerciseCatalogExercise: jest.fn(),
}));

const mockListMuscleGroups = jest.mocked(listExerciseCatalogMuscleGroups);
const mockListExercises = jest.mocked(listExerciseCatalogExercises);
const mockSaveExercise = jest.mocked(saveExerciseCatalogExercise);

describe('ExerciseCatalogScreen', () => {
  beforeEach(() => {
    mockListMuscleGroups.mockReset();
    mockListExercises.mockReset();
    mockSaveExercise.mockReset();

    mockListMuscleGroups.mockResolvedValue([
      { id: 'chest', displayName: 'Chest', familyName: 'Chest', sortOrder: 0 },
      { id: 'triceps', displayName: 'Triceps', familyName: 'Arms', sortOrder: 1 },
      { id: 'delts_front', displayName: 'Front Delts', familyName: 'Shoulders', sortOrder: 2 },
    ]);
  });

  it('creates a new exercise with a muscle link and persists weights', async () => {
    mockListExercises.mockResolvedValue([]);
    mockSaveExercise.mockResolvedValue({
      id: 'custom-ex-1',
      name: 'Incline Press',
      mappings: [{ id: 'map-1', muscleGroupId: 'chest', weight: 1, role: null }],
    });

    render(<ExerciseCatalogScreen />);

    await screen.findByText('Create Exercise');

    fireEvent.changeText(screen.getByLabelText('Exercise definition name'), 'Incline Press');
    fireEvent.press(screen.getByLabelText('Add muscle link Chest'));
    fireEvent.changeText(screen.getByLabelText('Weight for muscle link row 1'), '1.0');
    fireEvent.press(screen.getByLabelText('Save exercise definition'));

    await waitFor(() =>
      expect(mockSaveExercise).toHaveBeenCalledWith({
        id: undefined,
        name: 'Incline Press',
        mappings: [{ muscleGroupId: 'chest', weight: 1, role: null }],
      })
    );

    expect(screen.getByText('Exercise created.')).toBeTruthy();
    expect(screen.getByText('Incline Press')).toBeTruthy();
  });

  it('edits an existing exercise by updating a weight and removing a muscle link', async () => {
    mockListExercises.mockResolvedValue([
      {
        id: 'sys_barbell_bench_press',
        name: 'Barbell Bench Press',
        mappings: [
          { id: 'map-chest', muscleGroupId: 'chest', weight: 1, role: 'primary' },
          { id: 'map-triceps', muscleGroupId: 'triceps', weight: 0.5, role: 'secondary' },
        ],
      },
    ]);
    mockSaveExercise.mockResolvedValue({
      id: 'sys_barbell_bench_press',
      name: 'Barbell Bench Press',
      mappings: [{ id: 'map-chest', muscleGroupId: 'chest', weight: 0.8, role: 'primary' }],
    });

    render(<ExerciseCatalogScreen />);

    await screen.findByDisplayValue('Barbell Bench Press');

    fireEvent.changeText(screen.getByLabelText('Weight for muscle link row 1'), '0.8');
    fireEvent.press(screen.getByLabelText('Remove muscle link Triceps'));
    fireEvent.press(screen.getByLabelText('Save exercise definition'));

    await waitFor(() =>
      expect(mockSaveExercise).toHaveBeenCalledWith({
        id: 'sys_barbell_bench_press',
        name: 'Barbell Bench Press',
        mappings: [{ muscleGroupId: 'chest', weight: 0.8, role: 'primary' }],
      })
    );

    expect(screen.getByText('Exercise updated.')).toBeTruthy();
    expect(screen.queryByLabelText('Remove muscle link Triceps')).toBeNull();
  });

  it('blocks save when no muscle links are selected', async () => {
    mockListExercises.mockResolvedValue([]);

    render(<ExerciseCatalogScreen />);

    await screen.findByText('Create Exercise');

    fireEvent.changeText(screen.getByLabelText('Exercise definition name'), 'Cable Fly');
    fireEvent.press(screen.getByLabelText('Save exercise definition'));

    expect(screen.getByText('Add at least one linked muscle before saving.')).toBeTruthy();
    expect(mockSaveExercise).not.toHaveBeenCalled();
  });

  it('prevents duplicate links and surfaces invalid row weight validation', async () => {
    mockListExercises.mockResolvedValue([]);

    render(<ExerciseCatalogScreen />);

    await screen.findByText('Create Exercise');

    fireEvent.changeText(screen.getByLabelText('Exercise definition name'), 'Press Variation');
    fireEvent.press(screen.getByLabelText('Add muscle link Chest'));
    fireEvent.press(screen.getByLabelText('Add muscle link Chest'));

    expect(screen.getAllByLabelText(/Weight for muscle link row/i)).toHaveLength(1);

    fireEvent.changeText(screen.getByLabelText('Weight for muscle link row 1'), '0');
    fireEvent.press(screen.getByLabelText('Save exercise definition'));

    expect(screen.getByText('Weight must be a number greater than 0 and at most 10.')).toBeTruthy();
    expect(mockSaveExercise).not.toHaveBeenCalled();
  });
});
