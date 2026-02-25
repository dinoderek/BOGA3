import {
  createExerciseCatalogRepository,
  type ExerciseCatalogStore,
} from '@/src/data/exercise-catalog';

const createMockStore = (): jest.Mocked<ExerciseCatalogStore> => ({
  listMuscleGroups: jest.fn(),
  listExercises: jest.fn(),
  saveExercise: jest.fn(),
});

describe('exercise catalog repository', () => {
  it('validates and saves an exercise with normalized muscle-link payload', async () => {
    const store = createMockStore();
    const repository = createExerciseCatalogRepository(store);
    const now = new Date('2026-02-25T10:00:00.000Z');

    store.listMuscleGroups.mockResolvedValue([
      { id: 'chest', displayName: 'Chest', familyName: 'Chest', sortOrder: 0 },
      { id: 'triceps', displayName: 'Triceps', familyName: 'Arms', sortOrder: 1 },
    ]);
    store.saveExercise.mockResolvedValue({
      id: 'exercise-1',
      name: 'Custom Press',
      mappings: [
        { id: 'map-1', muscleGroupId: 'chest', weight: 1, role: null },
        { id: 'map-2', muscleGroupId: 'triceps', weight: 0.5, role: null },
      ],
    });

    const saved = await repository.saveExercise({
      name: '  Custom Press  ',
      mappings: [
        { muscleGroupId: 'chest', weight: 1 },
        { muscleGroupId: 'triceps', weight: 0.5, role: null },
      ],
      now,
    });

    expect(saved.name).toBe('Custom Press');
    expect(store.saveExercise).toHaveBeenCalledWith({
      id: undefined,
      name: 'Custom Press',
      mappings: [
        { muscleGroupId: 'chest', weight: 1, role: null },
        { muscleGroupId: 'triceps', weight: 0.5, role: null },
      ],
      now,
    });
  });

  it('rejects missing links, duplicate links, and invalid weights', async () => {
    const store = createMockStore();
    const repository = createExerciseCatalogRepository(store);

    store.listMuscleGroups.mockResolvedValue([
      { id: 'chest', displayName: 'Chest', familyName: 'Chest', sortOrder: 0 },
    ]);

    await expect(
      repository.saveExercise({
        name: 'Bench',
        mappings: [],
      })
    ).rejects.toThrow('At least one muscle link is required');

    await expect(
      repository.saveExercise({
        name: 'Bench',
        mappings: [
          { muscleGroupId: 'chest', weight: 1 },
          { muscleGroupId: 'chest', weight: 0.5 },
        ],
      })
    ).rejects.toThrow('Duplicate muscle link');

    await expect(
      repository.saveExercise({
        name: 'Bench',
        mappings: [{ muscleGroupId: 'chest', weight: 0 }],
      })
    ).rejects.toThrow('Invalid muscle weight');

    expect(store.saveExercise).not.toHaveBeenCalled();
  });
});
