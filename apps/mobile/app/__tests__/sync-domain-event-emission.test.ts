/* eslint-disable import/first */

const mockBootstrapLocalDataLayer = jest.fn();
const mockEnqueueSyncEventsTx = jest.fn();
const mockEnqueueSyncEvent = jest.fn();

jest.mock('@/src/data/bootstrap', () => ({
  bootstrapLocalDataLayer: (...args: unknown[]) => mockBootstrapLocalDataLayer(...args),
}));

jest.mock('@/src/sync', () => ({
  enqueueSyncEventsTx: (...args: unknown[]) => mockEnqueueSyncEventsTx(...args),
  enqueueSyncEvent: (...args: unknown[]) => mockEnqueueSyncEvent(...args),
}));

import { upsertLocalGym } from '@/src/data/local-gyms';
import { createDrizzleSessionListStore } from '@/src/data/session-list';
import { createDrizzleExerciseCatalogStore } from '@/src/data/exercise-catalog';
import { createDrizzleExerciseTagStore } from '@/src/data/exercise-tags';
import { __replaceSessionExerciseGraphForTests } from '@/src/data/session-drafts';
import { exerciseDefinitions } from '@/src/data/schema/exercise-definitions';
import { exerciseMuscleMappings } from '@/src/data/schema/exercise-muscle-mappings';
import { exerciseTagDefinitions } from '@/src/data/schema/exercise-tag-definitions';
import { gyms } from '@/src/data/schema/gyms';
import { sessions } from '@/src/data/schema/sessions';

describe('sync domain event emission', () => {
  beforeEach(() => {
    mockBootstrapLocalDataLayer.mockReset();
    mockEnqueueSyncEventsTx.mockReset();
    mockEnqueueSyncEvent.mockReset();
    mockEnqueueSyncEvent.mockResolvedValue(undefined);
  });

  it('emits gyms outbox events from gym upsert writes', async () => {
    const run = jest.fn();
    const tx = {
      select: jest.fn(() => ({
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            get: jest.fn(() => undefined),
          })),
        })),
      })),
      insert: jest.fn(() => ({
        values: jest.fn(() => ({ run })),
      })),
      update: jest.fn(() => ({
        set: jest.fn(() => ({
          where: jest.fn(() => ({ run })),
        })),
      })),
    };

    mockBootstrapLocalDataLayer.mockResolvedValue({
      transaction: (callback: (input: typeof tx) => void) => callback(tx),
    });

    await upsertLocalGym({
      id: 'gym-1',
      name: 'Downtown',
      now: new Date('2026-03-06T11:00:00.000Z'),
    });

    expect(mockEnqueueSyncEventsTx).toHaveBeenCalledTimes(1);
    const events = mockEnqueueSyncEventsTx.mock.calls[0]?.[1];
    expect(events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          entityType: 'gyms',
          entityId: 'gym-1',
          eventType: 'upsert',
        }),
      ])
    );
  });

  it('emits sessions delete/upsert events from session deleted-state writes', async () => {
    const now = new Date('2026-03-06T11:10:00.000Z');
    const tx = {
      update: jest.fn(() => ({
        set: jest.fn(() => ({
          where: jest.fn(() => ({
            run: jest.fn(),
          })),
        })),
      })),
      select: jest.fn(() => ({
        from: jest.fn((table: unknown) => ({
          where: jest.fn(() => ({
            get: jest.fn(() =>
              table === sessions
                ? {
                    id: 'session-1',
                    gymId: 'gym-1',
                    status: 'active',
                    startedAt: now,
                    completedAt: null,
                    durationSec: null,
                    deletedAt: now,
                    createdAt: now,
                    updatedAt: now,
                  }
                : null
            ),
          })),
        })),
      })),
    };

    mockBootstrapLocalDataLayer.mockResolvedValue({
      transaction: (callback: (input: typeof tx) => void) => callback(tx),
    });

    const store = createDrizzleSessionListStore();
    await store.setSessionDeletedState({
      sessionId: 'session-1',
      deletedAt: now,
      updatedAt: now,
    });

    expect(mockEnqueueSyncEventsTx).toHaveBeenCalledTimes(1);
    const events = mockEnqueueSyncEventsTx.mock.calls[0]?.[1];
    expect(events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          entityType: 'sessions',
          entityId: 'session-1',
          eventType: 'delete',
        }),
      ])
    );
  });

  it('emits exercise definition + muscle mapping events from catalog saves', async () => {
    const now = new Date('2026-03-06T11:20:00.000Z');
    const tx = {
      select: jest.fn((fields?: unknown) => ({
        from: jest.fn((table: unknown) => ({
          where: jest.fn(() => ({
            get: jest.fn(() => (table === exerciseDefinitions ? undefined : null)),
            all: jest.fn(() =>
              table === exerciseMuscleMappings
                ? [
                    {
                      id: 'map-old',
                      exerciseDefinitionId: 'exercise-1',
                      muscleGroupId: 'muscle-old',
                      weight: 0.5,
                      role: 'secondary',
                      createdAt: now,
                    },
                  ]
                : []
            ),
          })),
        })),
      })),
      insert: jest.fn(() => ({
        values: jest.fn(() => ({
          run: jest.fn(),
        })),
      })),
      update: jest.fn(() => ({
        set: jest.fn(() => ({
          where: jest.fn(() => ({
            run: jest.fn(),
          })),
        })),
      })),
      delete: jest.fn(() => ({
        where: jest.fn(() => ({
          run: jest.fn(),
        })),
      })),
    };

    const database = {
      transaction: (callback: (input: typeof tx) => void) => callback(tx),
      select: jest.fn(() => ({
        from: jest.fn((table: unknown) => ({
          where: jest.fn(() => ({
            get: jest.fn(() =>
              table === exerciseDefinitions
                ? {
                    id: 'exercise-1',
                    name: 'Bench Press',
                    deletedAt: null,
                    createdAt: now,
                    updatedAt: now,
                  }
                : null
            ),
            orderBy: jest.fn(() => ({
              all: jest.fn(() => [
                {
                  id: 'map-new',
                  exerciseDefinitionId: 'exercise-1',
                  muscleGroupId: 'muscle-new',
                  weight: 1,
                  role: 'primary',
                },
              ]),
            })),
          })),
        })),
      })),
    };

    mockBootstrapLocalDataLayer.mockResolvedValue(database);

    const store = createDrizzleExerciseCatalogStore();
    await store.saveExercise({
      id: 'exercise-1',
      name: 'Bench Press',
      mappings: [{ muscleGroupId: 'muscle-new', weight: 1, role: 'primary' }],
      now,
    });

    expect(mockEnqueueSyncEventsTx).toHaveBeenCalledTimes(1);
    const events = mockEnqueueSyncEventsTx.mock.calls[0]?.[1];
    expect(events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          entityType: 'exercise_definitions',
          eventType: 'upsert',
        }),
        expect.objectContaining({
          entityType: 'exercise_muscle_mappings',
          eventType: 'attach',
        }),
        expect.objectContaining({
          entityType: 'exercise_muscle_mappings',
          eventType: 'detach',
        }),
      ])
    );
  });

  it('emits exercise tag + assignment events from tag writes', async () => {
    const now = new Date('2026-03-06T11:30:00.000Z');
    const database = {
      insert: jest.fn(() => ({
        values: jest.fn(() => ({
          run: jest.fn(),
        })),
      })),
      select: jest.fn(() => ({
        from: jest.fn((table: unknown) => ({
          where: jest.fn(() => ({
            get: jest.fn(() =>
              table === exerciseTagDefinitions
                ? {
                    id: 'tag-1',
                    exerciseDefinitionId: 'exercise-1',
                    name: 'Pause',
                    normalizedName: 'pause',
                    deletedAt: null,
                    createdAt: now,
                    updatedAt: now,
                  }
                : null
            ),
          })),
        })),
      })),
      update: jest.fn(() => ({
        set: jest.fn(() => ({
          where: jest.fn(() => ({
            run: jest.fn(),
          })),
        })),
      })),
      delete: jest.fn(() => ({
        where: jest.fn(() => ({
          run: jest.fn(),
        })),
      })),
    };

    mockBootstrapLocalDataLayer.mockResolvedValue(database);

    const store = createDrizzleExerciseTagStore();
    await store.createTagDefinition({
      exerciseDefinitionId: 'exercise-1',
      name: 'Pause',
      normalizedName: 'pause',
      now,
    });
    await store.createTagAssignment({
      sessionExerciseId: 'session-exercise-1',
      tagDefinitionId: 'tag-1',
      now,
    });

    expect(mockEnqueueSyncEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: 'exercise_tag_definitions',
        eventType: 'upsert',
      }),
      expect.any(Object)
    );
    expect(mockEnqueueSyncEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: 'session_exercise_tags',
        eventType: 'attach',
      }),
      expect.any(Object)
    );
  });

  it('emits session exercise + set events from session graph replacements', () => {
    const now = new Date('2026-03-06T11:40:00.000Z');
    const run = jest.fn();
    const tx = {
      select: jest.fn(() => ({
        from: jest.fn((table: unknown) => ({
          where: jest.fn(() => ({
            all: jest.fn(() => {
              if (table === gyms) {
                return [];
              }
              if (table === sessions) {
                return [];
              }
              return [];
            }),
          })),
        })),
      })),
      insert: jest.fn(() => ({
        values: jest.fn(() => ({ run })),
      })),
      delete: jest.fn(() => ({
        where: jest.fn(() => ({ run })),
      })),
    } as any;

    const events = __replaceSessionExerciseGraphForTests(tx, {
      sessionId: 'session-1',
      now,
      exercises: [
        {
          id: 'exercise-1',
          exerciseDefinitionId: 'exercise-definition-1',
          name: 'Bench Press',
          sets: [{ id: 'set-1', repsValue: '5', weightValue: '225' }],
        },
      ],
    });

    expect(events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          entityType: 'session_exercises',
          eventType: 'upsert',
        }),
        expect.objectContaining({
          entityType: 'exercise_sets',
          eventType: 'upsert',
        }),
      ])
    );
  });
});
