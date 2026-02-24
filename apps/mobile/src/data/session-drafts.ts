import { and, asc, desc, eq, inArray, isNull } from 'drizzle-orm';

import { bootstrapLocalDataLayer, type LocalDatabase } from './bootstrap';
import { exerciseSets, sessionExercises, sessions } from './schema';

export type SessionDraftStatus = 'draft' | 'active';

export type SessionDraftSetInput = {
  id?: string;
  repsValue: string;
  weightValue: string;
};

export type SessionDraftExerciseInput = {
  id?: string;
  name: string;
  machineName?: string | null;
  originScopeId?: string;
  originSourceId?: string;
  sets: SessionDraftSetInput[];
};

export type PersistSessionDraftInput = {
  sessionId?: string;
  gymId: string | null;
  startedAt: Date;
  status?: SessionDraftStatus;
  exercises: SessionDraftExerciseInput[];
};

export type PersistSessionDraftResult = {
  sessionId: string;
};

export type SessionDraftSetSnapshot = {
  id: string;
  repsValue: string;
  weightValue: string;
};

export type SessionDraftExerciseSnapshot = {
  id: string;
  name: string;
  machineName: string | null;
  originScopeId: string;
  originSourceId: string;
  sets: SessionDraftSetSnapshot[];
};

export type SessionDraftSnapshot = {
  sessionId: string;
  gymId: string | null;
  status: SessionDraftStatus;
  startedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  exercises: SessionDraftExerciseSnapshot[];
};

export type CompletedSessionAnalysisRecord = {
  sessionId: string;
  gymId: string | null;
  startedAt: Date;
  completedAt: Date;
  durationSec: number;
};

export type ListCompletedSessionsOptions = {
  minDurationSec?: number;
  maxDurationSec?: number;
  completedAfter?: Date;
  completedBefore?: Date;
  sortBy?: 'completedAt' | 'durationSec';
  sortDirection?: 'asc' | 'desc';
  limit?: number;
};

export type CompleteSessionOptions = {
  completedAt?: Date;
  now?: Date;
};

export type CompleteSessionResult = {
  sessionId: string;
  completedAt: Date;
  durationSec: number;
  wasAlreadyCompleted: boolean;
};

export type SessionPersistenceRecord = {
  id: string;
  gymId: string | null;
  status: 'draft' | 'active' | 'completed';
  startedAt: Date;
  completedAt: Date | null;
  durationSec: number | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type StoredDraftSetRecord = {
  id: string;
  sessionExerciseId: string;
  orderIndex: number;
  repsValue: string;
  weightValue: string;
};

type StoredDraftExerciseRecord = {
  id: string;
  sessionId: string;
  orderIndex: number;
  name: string;
  machineName: string | null;
  originScopeId: string;
  originSourceId: string;
};

type StoredDraftGraph = {
  session: SessionPersistenceRecord;
  exercises: (StoredDraftExerciseRecord & {
    sets: StoredDraftSetRecord[];
  })[];
};

type SaveDraftGraphInput = {
  sessionId?: string;
  gymId: string | null;
  status: SessionDraftStatus;
  startedAt: Date;
  exercises: SessionDraftExerciseInput[];
  now: Date;
};

export type SessionDraftStore = {
  saveDraftGraph(input: SaveDraftGraphInput): Promise<PersistSessionDraftResult>;
  loadLatestDraftGraph(): Promise<StoredDraftGraph | null>;
  loadSessionById(sessionId: string): Promise<SessionPersistenceRecord | null>;
  completeSession(input: {
    sessionId: string;
    completedAt: Date;
    durationSec: number;
    updatedAt: Date;
  }): Promise<void>;
  listCompletedSessions(): Promise<SessionPersistenceRecord[]>;
};

const DRAFT_STATUSES: SessionDraftStatus[] = ['draft', 'active'];
const DEFAULT_DURATION_SORT = 'completedAt';
const DEFAULT_SORT_DIRECTION = 'desc';

const isValidDate = (value: Date) => !Number.isNaN(value.getTime());

const toDate = (value: Date | number | null | undefined): Date | null => {
  if (value === null || value === undefined) {
    return null;
  }

  if (value instanceof Date) {
    return isValidDate(value) ? value : null;
  }

  const converted = new Date(value);
  return isValidDate(converted) ? converted : null;
};

const ensureDate = (value: Date, label: string) => {
  if (!isValidDate(value)) {
    throw new Error(`${label} must be a valid Date`);
  }
};

const createLocalEntityId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const normalizeDraftStatus = (status: SessionDraftStatus | undefined): SessionDraftStatus => status ?? 'draft';

export const calculateSessionDurationSec = (startedAt: Date, completedAt: Date) => {
  ensureDate(startedAt, 'startedAt');
  ensureDate(completedAt, 'completedAt');

  const deltaMs = completedAt.getTime() - startedAt.getTime();
  return Math.max(0, Math.floor(deltaMs / 1000));
};

const mapSessionRow = (row: typeof sessions.$inferSelect): SessionPersistenceRecord => {
  const startedAt = toDate(row.startedAt);
  const createdAt = toDate(row.createdAt);
  const updatedAt = toDate(row.updatedAt);

  if (!startedAt || !createdAt || !updatedAt) {
    throw new Error(`Session ${row.id} contains invalid timestamp values`);
  }

  return {
    id: row.id,
    gymId: row.gymId,
    status: row.status,
    startedAt,
    completedAt: toDate(row.completedAt),
    durationSec: row.durationSec,
    deletedAt: toDate(row.deletedAt),
    createdAt,
    updatedAt,
  };
};

const mapDraftSnapshot = (graph: StoredDraftGraph): SessionDraftSnapshot => ({
  sessionId: graph.session.id,
  gymId: graph.session.gymId,
  status: graph.session.status as SessionDraftStatus,
  startedAt: graph.session.startedAt,
  createdAt: graph.session.createdAt,
  updatedAt: graph.session.updatedAt,
  exercises: graph.exercises.map((exercise) => ({
    id: exercise.id,
    name: exercise.name,
    machineName: exercise.machineName,
    originScopeId: exercise.originScopeId,
    originSourceId: exercise.originSourceId,
    sets: exercise.sets.map((set) => ({
      id: set.id,
      repsValue: set.repsValue,
      weightValue: set.weightValue,
    })),
  })),
});

const loadDraftGraphBySessionId = (database: LocalDatabase, sessionId: string): StoredDraftGraph | null => {
  const sessionRow = database.select().from(sessions).where(eq(sessions.id, sessionId)).get();
  if (!sessionRow) {
    return null;
  }

  const exerciseRows = database
    .select()
    .from(sessionExercises)
    .where(eq(sessionExercises.sessionId, sessionId))
    .orderBy(asc(sessionExercises.orderIndex))
    .all();

  const exerciseIds = exerciseRows.map((exercise) => exercise.id);
  const setRows =
    exerciseIds.length > 0
      ? database
          .select()
          .from(exerciseSets)
          .where(inArray(exerciseSets.sessionExerciseId, exerciseIds))
          .orderBy(asc(exerciseSets.orderIndex))
          .all()
      : [];

  const setsByExerciseId = setRows.reduce<Map<string, StoredDraftSetRecord[]>>((acc, row) => {
    const current = acc.get(row.sessionExerciseId) ?? [];
    current.push({
      id: row.id,
      sessionExerciseId: row.sessionExerciseId,
      orderIndex: row.orderIndex,
      repsValue: row.repsValue,
      weightValue: row.weightValue,
    });
    acc.set(row.sessionExerciseId, current);
    return acc;
  }, new Map<string, StoredDraftSetRecord[]>());

  return {
    session: mapSessionRow(sessionRow),
    exercises: exerciseRows.map((exercise) => ({
      id: exercise.id,
      sessionId: exercise.sessionId,
      orderIndex: exercise.orderIndex,
      name: exercise.name,
      machineName: exercise.machineName,
      originScopeId: exercise.originScopeId,
      originSourceId: exercise.originSourceId,
      sets: setsByExerciseId.get(exercise.id) ?? [],
    })),
  };
};

export const createDrizzleSessionDraftStore = (): SessionDraftStore => ({
  async saveDraftGraph(input) {
    const database = await bootstrapLocalDataLayer();
    const sessionId = input.sessionId?.trim() || createLocalEntityId('session');

    database.transaction((tx) => {
      const existingSession = tx.select().from(sessions).where(eq(sessions.id, sessionId)).get();
      if (existingSession?.status === 'completed') {
        throw new Error(`Cannot modify completed session ${sessionId}`);
      }

      if (!existingSession) {
        tx.insert(sessions)
          .values({
            id: sessionId,
            gymId: input.gymId,
            status: input.status,
            startedAt: input.startedAt,
            completedAt: null,
            durationSec: null,
            createdAt: input.now,
            updatedAt: input.now,
          })
          .run();
      } else {
        tx.update(sessions)
          .set({
            gymId: input.gymId,
            status: input.status,
            startedAt: input.startedAt,
            completedAt: null,
            durationSec: null,
            updatedAt: input.now,
          })
          .where(eq(sessions.id, sessionId))
          .run();
      }

      const existingExerciseRows = tx
        .select({ id: sessionExercises.id })
        .from(sessionExercises)
        .where(eq(sessionExercises.sessionId, sessionId))
        .all();
      const existingExerciseIds = existingExerciseRows.map((row) => row.id);

      if (existingExerciseIds.length > 0) {
        tx.delete(exerciseSets).where(inArray(exerciseSets.sessionExerciseId, existingExerciseIds)).run();
      }
      tx.delete(sessionExercises).where(eq(sessionExercises.sessionId, sessionId)).run();

      input.exercises.forEach((exercise, exerciseIndex) => {
        const sessionExerciseId = exercise.id?.trim() || createLocalEntityId('exercise');

        tx.insert(sessionExercises)
          .values({
            id: sessionExerciseId,
            sessionId,
            orderIndex: exerciseIndex,
            name: exercise.name,
            machineName: exercise.machineName ?? null,
            originScopeId: exercise.originScopeId ?? 'private',
            originSourceId: exercise.originSourceId ?? 'local',
            createdAt: input.now,
            updatedAt: input.now,
          })
          .run();

        exercise.sets.forEach((set, setIndex) => {
          tx.insert(exerciseSets)
            .values({
              id: set.id?.trim() || createLocalEntityId('set'),
              sessionExerciseId,
              orderIndex: setIndex,
              repsValue: set.repsValue,
              weightValue: set.weightValue,
              createdAt: input.now,
              updatedAt: input.now,
            })
            .run();
        });
      });
    });

    return { sessionId };
  },
  async loadLatestDraftGraph() {
    const database = await bootstrapLocalDataLayer();

    const latestDraft = database
      .select()
      .from(sessions)
      .where(and(inArray(sessions.status, DRAFT_STATUSES), isNull(sessions.deletedAt)))
      .orderBy(desc(sessions.updatedAt), desc(sessions.createdAt))
      .get();
    if (!latestDraft) {
      return null;
    }

    return loadDraftGraphBySessionId(database, latestDraft.id);
  },
  async loadSessionById(sessionId) {
    const database = await bootstrapLocalDataLayer();
    const row = database.select().from(sessions).where(eq(sessions.id, sessionId)).get();
    return row ? mapSessionRow(row) : null;
  },
  async completeSession(input) {
    const database = await bootstrapLocalDataLayer();
    database
      .update(sessions)
      .set({
        status: 'completed',
        completedAt: input.completedAt,
        durationSec: input.durationSec,
        updatedAt: input.updatedAt,
      })
      .where(eq(sessions.id, input.sessionId))
      .run();
  },
  async listCompletedSessions() {
    const database = await bootstrapLocalDataLayer();
    const rows = database.select().from(sessions).where(eq(sessions.status, 'completed')).all();
    const nonDeletedRows = rows.filter((row) => row.deletedAt === null);
    return nonDeletedRows.map(mapSessionRow);
  },
});

export const createSessionDraftRepository = (store: SessionDraftStore = createDrizzleSessionDraftStore()) => ({
  async persistDraftSnapshot(
    input: PersistSessionDraftInput,
    options: {
      now?: Date;
    } = {}
  ): Promise<PersistSessionDraftResult> {
    ensureDate(input.startedAt, 'startedAt');

    const now = options.now ?? new Date();
    ensureDate(now, 'now');

    return store.saveDraftGraph({
      sessionId: input.sessionId,
      gymId: input.gymId,
      startedAt: input.startedAt,
      status: normalizeDraftStatus(input.status),
      exercises: input.exercises,
      now,
    });
  },
  async loadLatestDraftSnapshot(): Promise<SessionDraftSnapshot | null> {
    const graph = await store.loadLatestDraftGraph();
    if (!graph || graph.session.status === 'completed') {
      return null;
    }

    return mapDraftSnapshot(graph);
  },
  async completeSession(sessionId: string, options: CompleteSessionOptions = {}): Promise<CompleteSessionResult> {
    const existingSession = await store.loadSessionById(sessionId);
    if (!existingSession) {
      throw new Error(`Session ${sessionId} does not exist`);
    }

    const now = options.now ?? new Date();
    ensureDate(now, 'now');

    const resolvedCompletedAt = existingSession.completedAt ?? options.completedAt ?? now;
    ensureDate(resolvedCompletedAt, 'completedAt');

    const resolvedDurationSec =
      existingSession.durationSec ?? calculateSessionDurationSec(existingSession.startedAt, resolvedCompletedAt);

    const needsBackfill =
      existingSession.status === 'completed' &&
      (existingSession.completedAt === null || existingSession.durationSec === null);
    const shouldWrite = existingSession.status !== 'completed' || needsBackfill;

    if (shouldWrite) {
      await store.completeSession({
        sessionId,
        completedAt: resolvedCompletedAt,
        durationSec: resolvedDurationSec,
        updatedAt: now,
      });
    }

    return {
      sessionId,
      completedAt: resolvedCompletedAt,
      durationSec: resolvedDurationSec,
      wasAlreadyCompleted: existingSession.status === 'completed' && !needsBackfill,
    };
  },
  async listCompletedSessionsForAnalysis(
    options: ListCompletedSessionsOptions = {}
  ): Promise<CompletedSessionAnalysisRecord[]> {
    const allCompleted = await store.listCompletedSessions();

    const completedAfter = options.completedAfter?.getTime();
    const completedBefore = options.completedBefore?.getTime();
    const minDurationSec = options.minDurationSec;
    const maxDurationSec = options.maxDurationSec;
    const sortBy = options.sortBy ?? DEFAULT_DURATION_SORT;
    const sortDirection = options.sortDirection ?? DEFAULT_SORT_DIRECTION;

    const filtered = allCompleted
      .filter((session): session is SessionPersistenceRecord & { completedAt: Date; durationSec: number } => {
        if (session.status !== 'completed' || session.completedAt === null || session.durationSec === null) {
          return false;
        }

        if (completedAfter !== undefined && session.completedAt.getTime() < completedAfter) {
          return false;
        }

        if (completedBefore !== undefined && session.completedAt.getTime() > completedBefore) {
          return false;
        }

        if (minDurationSec !== undefined && session.durationSec < minDurationSec) {
          return false;
        }

        if (maxDurationSec !== undefined && session.durationSec > maxDurationSec) {
          return false;
        }

        return true;
      })
      .map((session) => ({
        sessionId: session.id,
        gymId: session.gymId,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        durationSec: session.durationSec,
      }));

    filtered.sort((left, right) => {
      const leftValue = sortBy === 'durationSec' ? left.durationSec : left.completedAt.getTime();
      const rightValue = sortBy === 'durationSec' ? right.durationSec : right.completedAt.getTime();
      const base = leftValue === rightValue ? left.sessionId.localeCompare(right.sessionId) : leftValue - rightValue;
      return sortDirection === 'asc' ? base : -base;
    });

    const limit = options.limit;
    if (limit === undefined || limit < 1) {
      return filtered;
    }

    return filtered.slice(0, limit);
  },
});

const defaultSessionDraftRepository = createSessionDraftRepository();

export const persistSessionDraftSnapshot = defaultSessionDraftRepository.persistDraftSnapshot;
export const loadLatestSessionDraftSnapshot = defaultSessionDraftRepository.loadLatestDraftSnapshot;
export const completeSessionDraft = defaultSessionDraftRepository.completeSession;
export const listCompletedSessionsForAnalysis = defaultSessionDraftRepository.listCompletedSessionsForAnalysis;
