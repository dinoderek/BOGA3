import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { AppState, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ExerciseEditorModal } from '@/components/exercise-catalog/exercise-editor-modal';
import { SessionContentLayout } from '@/components/session-recorder/session-content-layout';
import { uiColors } from '@/components/ui';
import {
  SEEDED_LOCATIONS,
  Session,
  SessionExercise,
  SessionLocation,
  SessionRecorderState,
  SessionSet,
} from '@/components/session-recorder/types';
import {
  completeSessionDraft,
  loadLocalGymById,
  loadLatestSessionDraftSnapshot,
  loadSessionSnapshotById,
  persistCompletedSessionSnapshot,
  persistSessionDraftSnapshot,
  upsertLocalGym,
  type SessionDraftSnapshot,
  type SessionGraphSnapshot,
} from '@/src/data';
import {
  listExerciseCatalogExercises,
  type ExerciseCatalogExercise,
} from '@/src/data/exercise-catalog';
import { createDraftAutosaveController, type DraftAutosaveController } from '@/src/session-recorder/draft-autosave';
import { createSessionRecorderLifecycleHelpers } from '@/src/session-recorder/lifecycle-helpers';

function formatCurrentDateTime(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  const hours = `${date.getHours()}`.padStart(2, '0');
  const minutes = `${date.getMinutes()}`.padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function parseSessionDateTime(dateTime: string): Date | null {
  const trimmed = dateTime.trim();
  const matched = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/.exec(trimmed);
  if (!matched) {
    return null;
  }

  const [, yearText, monthText, dayText, hourText, minuteText] = matched;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);

  if ([year, month, day, hour, minute].some((value) => Number.isNaN(value))) {
    return null;
  }

  if (month < 1 || month > 12 || day < 1 || day > 31 || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null;
  }

  const parsed = new Date(year, month - 1, day, hour, minute, 0, 0);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day ||
    parsed.getHours() !== hour ||
    parsed.getMinutes() !== minute
  ) {
    return null;
  }

  return parsed;
}

function mapDraftSnapshotToSession(snapshot: SessionDraftSnapshot): Session {
  return {
    dateTime: formatCurrentDateTime(snapshot.startedAt),
    locationId: snapshot.gymId,
    exercises: snapshot.exercises.map((exercise) => ({
      id: exercise.id,
      exerciseDefinitionId: exercise.exerciseDefinitionId,
      name: exercise.name,
      machineName: exercise.machineName ?? '',
      sets: exercise.sets.map((set) => ({
        id: set.id,
        reps: set.repsValue,
        weight: set.weightValue,
      })),
    })),
  };
}

function mapSessionGraphSnapshotToSession(snapshot: SessionGraphSnapshot): Session {
  return {
    dateTime: formatCurrentDateTime(snapshot.startedAt),
    locationId: snapshot.gymId,
    exercises: snapshot.exercises.map((exercise) => ({
      id: exercise.id,
      exerciseDefinitionId: exercise.exerciseDefinitionId,
      name: exercise.name,
      machineName: exercise.machineName ?? '',
      sets: exercise.sets.map((set) => ({
        id: set.id,
        reps: set.repsValue,
        weight: set.weightValue,
      })),
    })),
  };
}

const coerceRouteParam = (value: string | string[] | undefined): string | null => {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
};

const getDateTimeValidationMessage = (
  startedAtText: string,
  completedAtText: string | null
): string | null => {
  const parsedStart = parseSessionDateTime(startedAtText);
  if (!parsedStart) {
    return 'Enter a valid Start time in YYYY-MM-DD HH:mm format.';
  }

  if (completedAtText === null) {
    return null;
  }

  const parsedEnd = parseSessionDateTime(completedAtText);
  if (!parsedEnd) {
    return 'Enter a valid End time in YYYY-MM-DD HH:mm format.';
  }

  if (parsedEnd.getTime() < parsedStart.getTime()) {
    return 'End time must be later than or equal to Start time.';
  }

  return null;
};

const getCompletedEditStartTimeValidationMessage = (startedAtText: string): string | null => {
  const parsedStart = parseSessionDateTime(startedAtText);
  if (!parsedStart) {
    return 'Enter a valid Start time in YYYY-MM-DD HH:mm format.';
  }

  return null;
};

const getCompletedEditEndTimeValidationMessage = (
  startedAtText: string,
  completedAtText: string | null
): string | null => {
  if (completedAtText === null) {
    return 'Enter a valid End time in YYYY-MM-DD HH:mm format.';
  }

  const parsedEnd = parseSessionDateTime(completedAtText);
  if (!parsedEnd) {
    return 'Enter a valid End time in YYYY-MM-DD HH:mm format.';
  }

  const parsedStart = parseSessionDateTime(startedAtText);
  if (!parsedStart) {
    return null;
  }

  if (parsedEnd.getTime() < parsedStart.getTime()) {
    return 'End time must be later than or equal to Start time.';
  }

  return null;
};

function hasPersistableSessionContent(session: Session): boolean {
  return session.locationId !== null || session.exercises.length > 0;
}

const toPersistDraftExercises = (session: Session) =>
  session.exercises.map((exercise) => ({
    id: exercise.id,
    exerciseDefinitionId: exercise.exerciseDefinitionId,
    name: exercise.name,
    machineName: exercise.machineName || null,
    sets: exercise.sets.map((set) => ({
      id: set.id,
      repsValue: set.reps,
      weightValue: set.weight,
    })),
  }));

function createInitialState(): SessionRecorderState {
  return {
    session: {
      dateTime: formatCurrentDateTime(new Date()),
      locationId: null,
      exercises: [],
    },
    locations: SEEDED_LOCATIONS,
    pendingLocationName: '',
    gymPickerVisible: false,
    gymModalMode: 'picker',
    editorReturnMode: 'picker',
    showArchivedInManager: false,
    editingLocationId: null,
    editingLocationName: '',
    exercisePickerVisible: false,
    exerciseSelectionTargetId: null,
    exerciseActionMenuVisible: false,
    activeExerciseActionId: null,
  };
}

function createLocationId(locationName: string): string {
  return `custom-${locationName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
}

function createExerciseId(): string {
  return `exercise-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createSetId(): string {
  return `set-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createEmptySet(): SessionSet {
  return {
    id: createSetId(),
    reps: '',
    weight: '',
  };
}

function createExercise(exerciseDefinitionId: string, name: string): SessionExercise {
  return {
    id: createExerciseId(),
    exerciseDefinitionId,
    name,
    machineName: '',
    sets: [createEmptySet()],
  };
}

type SubmitCleanupPrompt = {
  step: 'incomplete-sets' | 'empty-exercises';
  affectedCount: number;
  nextSession: Session;
};

function removeIncompleteSets(session: Session): { session: Session; removedSets: number } {
  let removedSets = 0;

  const exercises = session.exercises.map((exercise) => {
    const sets = exercise.sets.filter((set) => {
      const isComplete = set.reps.trim().length > 0 && set.weight.trim().length > 0;
      if (!isComplete) {
        removedSets += 1;
      }
      return isComplete;
    });

    return {
      ...exercise,
      sets,
    };
  });

  return {
    session: {
      ...session,
      exercises,
    },
    removedSets,
  };
}

function removeExercisesWithNoSets(session: Session): { session: Session; removedExercises: number } {
  let removedExercises = 0;
  const exercises = session.exercises.filter((exercise) => {
    const hasSets = exercise.sets.length > 0;
    if (!hasSets) {
      removedExercises += 1;
    }
    return hasSets;
  });

  return {
    session: {
      ...session,
      exercises,
    },
    removedExercises,
  };
}

export default function SessionRecorderScreen() {
  const router = useRouter();
  const navigation = useNavigation<any>();
  const params = useLocalSearchParams<{ mode?: string | string[]; sessionId?: string | string[] }>();
  const routeMode = coerceRouteParam(params.mode) === 'completed-edit' ? 'completed-edit' : 'active';
  const routeSessionId = coerceRouteParam(params.sessionId);

  const [state, setState] = useState<SessionRecorderState>(createInitialState);
  const [submitCleanupPrompt, setSubmitCleanupPrompt] = useState<SubmitCleanupPrompt | null>(null);
  const [completedEditEndDateTime, setCompletedEditEndDateTime] = useState<string | null>(null);
  const [completedEditLoadError, setCompletedEditLoadError] = useState<string | null>(null);
  const [isCompletedEditLoading, setIsCompletedEditLoading] = useState(false);
  const [completedEditAutosaveNotice, setCompletedEditAutosaveNotice] = useState<string | null>(null);
  const [completedEditStartTouched, setCompletedEditStartTouched] = useState(false);
  const [completedEditEndTouched, setCompletedEditEndTouched] = useState(false);
  const [completedEditSubmitAttempted, setCompletedEditSubmitAttempted] = useState(false);
  const [exercisePickerOptions, setExercisePickerOptions] = useState<ExerciseCatalogExercise[]>([]);
  const [isExerciseCatalogLoading, setIsExerciseCatalogLoading] = useState(false);
  const [exerciseCatalogLoadError, setExerciseCatalogLoadError] = useState<string | null>(null);
  const [isExerciseCreateModalVisible, setIsExerciseCreateModalVisible] = useState(false);
  const stateRef = useRef(state);
  const completedEditEndDateTimeRef = useRef<string | null>(completedEditEndDateTime);
  const persistedSessionIdRef = useRef<string | null>(null);
  const persistenceHydratedRef = useRef(false);
  const autosaveRef = useRef<DraftAutosaveController | null>(null);
  const hasSessionMutationRef = useRef(false);
  const replayingBeforeRemoveActionRef = useRef(false);
  const pendingExercisePickerRestoreTargetRef = useRef<string | null | undefined>(undefined);

  stateRef.current = state;
  completedEditEndDateTimeRef.current = completedEditEndDateTime;

  if (!autosaveRef.current) {
    autosaveRef.current = createDraftAutosaveController({
      persistDraft: async () => {
        const currentState = stateRef.current;
        const parsedStartedAt = parseSessionDateTime(currentState.session.dateTime);
        const selectedGym =
          currentState.session.locationId === null
            ? null
            : currentState.locations.find((location) => location.id === currentState.session.locationId) ?? null;
        const canCreateNewRecord =
          persistedSessionIdRef.current !== null || hasPersistableSessionContent(currentState.session);
        if (!canCreateNewRecord) {
          return;
        }

        if (!parsedStartedAt) {
          return;
        }

        if (selectedGym) {
          await upsertLocalGym({
            id: selectedGym.id,
            name: selectedGym.name,
          });
        }

        if (routeMode === 'completed-edit') {
          const currentEndText = completedEditEndDateTimeRef.current;
          const timingValidationMessage = getDateTimeValidationMessage(
            currentState.session.dateTime,
            currentEndText
          );

          if (timingValidationMessage || !currentEndText || !persistedSessionIdRef.current) {
            setCompletedEditAutosaveNotice(
              timingValidationMessage
                ? 'Autosave paused until Start/End times are valid.'
                : 'Autosave waiting for completed-session timestamps.'
            );
            return;
          }

          const parsedCompletedAt = parseSessionDateTime(currentEndText);
          if (!parsedCompletedAt) {
            setCompletedEditAutosaveNotice('Autosave paused until Start/End times are valid.');
            return;
          }

          await persistCompletedSessionSnapshot({
            sessionId: persistedSessionIdRef.current,
            gymId: selectedGym?.id ?? null,
            startedAt: parsedStartedAt,
            completedAt: parsedCompletedAt,
            exercises: toPersistDraftExercises(currentState.session),
          });
          setCompletedEditAutosaveNotice(null);
          return;
        }

        const persisted = await persistSessionDraftSnapshot({
          sessionId: persistedSessionIdRef.current ?? undefined,
          gymId: selectedGym?.id ?? null,
          startedAt: parsedStartedAt,
          status: 'active',
          exercises: toPersistDraftExercises(currentState.session),
        });

        persistedSessionIdRef.current = persisted.sessionId;
      },
    });
  }

  const autosaveController = autosaveRef.current;
  const lifecycleHelpers = useMemo(() => createSessionRecorderLifecycleHelpers(autosaveController), [autosaveController]);

  useEffect(() => {
    if (routeMode !== 'completed-edit') {
      return;
    }

    if (!navigation || typeof navigation.addListener !== 'function') {
      return;
    }

    const unsubscribe = navigation.addListener('beforeRemove', (event: any) => {
      if (replayingBeforeRemoveActionRef.current) {
        replayingBeforeRemoveActionRef.current = false;
        return;
      }

      if (!hasSessionMutationRef.current) {
        return;
      }

      event.preventDefault();

      void autosaveController
        .dispose({ flushDirty: true })
        .catch(() => {
          // Best-effort save on navigation out; allow navigation even if persistence fails.
        })
        .finally(() => {
          replayingBeforeRemoveActionRef.current = true;
          navigation.dispatch?.(event.data.action);
        });
    });

    return unsubscribe;
  }, [autosaveController, navigation, routeMode]);

  useEffect(() => {
    let cancelled = false;

    if (routeMode === 'completed-edit') {
      if (!routeSessionId) {
        setCompletedEditLoadError('Missing completed session id');
        persistenceHydratedRef.current = true;
        return () => {
          cancelled = true;
        };
      }

      setIsCompletedEditLoading(true);
      setCompletedEditLoadError(null);
      setCompletedEditStartTouched(false);
      setCompletedEditEndTouched(false);
      setCompletedEditSubmitAttempted(false);

      void loadSessionSnapshotById(routeSessionId)
        .then(async (snapshot) => {
          if (cancelled || !snapshot || hasSessionMutationRef.current) {
            if (!snapshot && !cancelled) {
              setCompletedEditLoadError('Completed session not found');
            }
            return;
          }

          if (snapshot.status !== 'completed') {
            setCompletedEditLoadError('Session is not completed');
            return;
          }

          persistedSessionIdRef.current = snapshot.sessionId;
          const loadedGym = snapshot.gymId ? await loadLocalGymById(snapshot.gymId) : null;

          if (cancelled) {
            return;
          }

          setState((current) => ({
            ...current,
            locations:
              loadedGym && !current.locations.some((location) => location.id === loadedGym.id)
                ? [...current.locations, { id: loadedGym.id, name: loadedGym.name, archived: false }]
                : current.locations,
            session: mapSessionGraphSnapshotToSession(snapshot),
          }));
          setCompletedEditEndDateTime(
            formatCurrentDateTime(snapshot.completedAt ?? snapshot.startedAt)
          );
        })
        .catch(() => {
          if (!cancelled) {
            setCompletedEditLoadError('Unable to load completed session');
          }
        })
        .finally(() => {
          if (!cancelled) {
            setIsCompletedEditLoading(false);
            persistenceHydratedRef.current = true;
          }
        });

      return () => {
        cancelled = true;
      };
    }

    void loadLatestSessionDraftSnapshot()
      .then((snapshot) => {
        if (cancelled || !snapshot || hasSessionMutationRef.current) {
          return;
        }

        persistedSessionIdRef.current = snapshot.sessionId;
        setState((current) => ({
          ...current,
          session: mapDraftSnapshotToSession(snapshot),
        }));
      })
      .catch(() => {
        // Keep the recorder usable even if local restore fails; autosave writes can still recreate state.
      })
      .finally(() => {
        if (!cancelled) {
          persistenceHydratedRef.current = true;
        }
      });

    return () => {
      cancelled = true;
    };
  }, [routeMode, routeSessionId]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      void lifecycleHelpers.onAppStateChange(nextState);
    });

    return () => {
      subscription.remove();
    };
  }, [lifecycleHelpers]);

  useEffect(() => {
    return () => {
      void lifecycleHelpers.onScreenBlur();
      void lifecycleHelpers.onRouteChange();
      void autosaveController.dispose({ flushDirty: true });
    };
  }, [autosaveController, lifecycleHelpers]);

  const reloadExercisePickerOptions = useCallback(async () => {
    setIsExerciseCatalogLoading(true);
    setExerciseCatalogLoadError(null);

    try {
      const loadedExercises = await listExerciseCatalogExercises();
      setExercisePickerOptions(loadedExercises);
    } catch {
      setExerciseCatalogLoadError('Unable to load exercises right now.');
    } finally {
      setIsExerciseCatalogLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      void (async () => {
        setIsExerciseCatalogLoading(true);
        setExerciseCatalogLoadError(null);

        try {
          const loadedExercises = await listExerciseCatalogExercises();
          if (cancelled) {
            return;
          }
          setExercisePickerOptions(loadedExercises);
        } catch {
          if (cancelled) {
            return;
          }
          setExerciseCatalogLoadError('Unable to load exercises right now.');
        } finally {
          if (!cancelled) {
            setIsExerciseCatalogLoading(false);
            if (pendingExercisePickerRestoreTargetRef.current !== undefined) {
              const selectionTargetId = pendingExercisePickerRestoreTargetRef.current;
              pendingExercisePickerRestoreTargetRef.current = undefined;
              setState((current) => ({
                ...current,
                exercisePickerVisible: true,
                exerciseSelectionTargetId: selectionTargetId ?? null,
                exerciseActionMenuVisible: false,
                activeExerciseActionId: null,
              }));
            }
          }
        }
      })();

      return () => {
        cancelled = true;
      };
    }, [])
  );

  const markSessionStructuralMutation = () => {
    hasSessionMutationRef.current = true;
    if (!persistenceHydratedRef.current) {
      return;
    }

    void autosaveController.markStructuralMutation();
  };

  const markSessionTextMutation = () => {
    hasSessionMutationRef.current = true;
    if (!persistenceHydratedRef.current) {
      return;
    }

    autosaveController.markTextMutation();
  };

  const selectedGym = useMemo<SessionLocation | undefined>(
    () => state.locations.find((location) => location.id === state.session.locationId),
    [state.locations, state.session.locationId]
  );

  const activeGyms = useMemo(
    () => state.locations.filter((location) => !location.archived),
    [state.locations]
  );

  const managedGyms = useMemo(
    () =>
      state.showArchivedInManager
        ? state.locations
        : state.locations.filter((location) => !location.archived),
    [state.locations, state.showArchivedInManager]
  );

  const clearSubmitFeedback = () => {
    setSubmitCleanupPrompt(null);
  };

  const openGymModal = () => {
    setState((current) => ({
      ...current,
      gymPickerVisible: true,
      gymModalMode: 'picker',
      editorReturnMode: 'picker',
      pendingLocationName: '',
      editingLocationId: null,
      editingLocationName: '',
      showArchivedInManager: false,
    }));
  };

  const dismissGymModal = () => {
    setState((current) => ({
      ...current,
      gymPickerVisible: false,
      gymModalMode: 'picker',
      editorReturnMode: 'picker',
      pendingLocationName: '',
      editingLocationId: null,
      editingLocationName: '',
      showArchivedInManager: false,
    }));
  };

  const selectGym = (locationId: string) => {
    setState((current) => ({
      ...current,
      session: { ...current.session, locationId },
      gymPickerVisible: false,
      gymModalMode: 'picker',
      editorReturnMode: 'picker',
      pendingLocationName: '',
      editingLocationId: null,
      editingLocationName: '',
    }));
    clearSubmitFeedback();
    markSessionStructuralMutation();
  };

  const openManageGyms = () => {
    setState((current) => ({
      ...current,
      gymModalMode: 'manage',
      pendingLocationName: '',
      editingLocationId: null,
      editingLocationName: '',
    }));
  };

  const openAddGymEditor = () => {
    setState((current) => ({
      ...current,
      gymModalMode: 'editor',
      editorReturnMode: 'picker',
      pendingLocationName: '',
      editingLocationId: null,
      editingLocationName: '',
    }));
  };

  const openEditGymEditor = (location: SessionLocation) => {
    setState((current) => ({
      ...current,
      gymModalMode: 'editor',
      editorReturnMode: 'manage',
      editingLocationId: location.id,
      editingLocationName: location.name,
      pendingLocationName: '',
    }));
    markSessionStructuralMutation();
  };

  const returnFromEditor = () => {
    setState((current) => ({
      ...current,
      gymModalMode: current.editorReturnMode,
      pendingLocationName: '',
      editingLocationId: null,
      editingLocationName: '',
    }));
  };

  const handlePendingLocationNameChange = (pendingLocationName: string) => {
    setState((current) => ({
      ...current,
      pendingLocationName,
    }));
  };

  const handleEditingLocationNameChange = (editingLocationName: string) => {
    setState((current) => ({
      ...current,
      editingLocationName,
    }));
  };

  const saveGymFromEditor = () => {
    const draftName = (state.editingLocationId ? state.editingLocationName : state.pendingLocationName).trim();
    if (!draftName) {
      return;
    }

    if (state.editingLocationId) {
      setState((current) => ({
        ...current,
        locations: current.locations.map((location) =>
          location.id === current.editingLocationId ? { ...location, name: draftName } : location
        ),
        gymModalMode: 'manage',
        editingLocationId: null,
        editingLocationName: '',
      }));
      return;
    }

    const newLocation: SessionLocation = {
      id: createLocationId(draftName),
      name: draftName,
      archived: false,
    };

    setState((current) => ({
      ...current,
      locations: [...current.locations, newLocation],
      session: { ...current.session, locationId: newLocation.id },
      gymPickerVisible: false,
      gymModalMode: 'picker',
      editorReturnMode: 'picker',
      pendingLocationName: '',
    }));
  };

  const returnToPickerFromManage = () => {
    setState((current) => ({
      ...current,
      gymModalMode: 'picker',
      showArchivedInManager: false,
      editingLocationId: null,
      editingLocationName: '',
    }));
  };

  const toggleArchivedVisibility = () => {
    setState((current) => ({
      ...current,
      showArchivedInManager: !current.showArchivedInManager,
    }));
  };

  const toggleGymArchive = (locationId: string, archived: boolean) => {
    setState((current) => ({
      ...current,
      locations: current.locations.map((location) =>
        location.id === locationId ? { ...location, archived: !archived } : location
      ),
      session:
        current.session.locationId === locationId && !archived
          ? { ...current.session, locationId: null }
          : current.session,
    }));
    markSessionStructuralMutation();
  };

  const openExerciseModal = (exerciseIdToChange: string | null = null) => {
    setState((current) => ({
      ...current,
      exercisePickerVisible: true,
      exerciseSelectionTargetId: exerciseIdToChange,
      exerciseActionMenuVisible: false,
      activeExerciseActionId: null,
    }));
    void reloadExercisePickerOptions();
  };

  const dismissExerciseModal = () => {
    setState((current) => ({
      ...current,
      exercisePickerVisible: false,
      exerciseSelectionTargetId: null,
    }));
  };

  const selectExercisePreset = (exercisePresetId: string) => {
    const selectedExercisePreset = exercisePickerOptions.find((exercisePreset) => exercisePreset.id === exercisePresetId);
    if (!selectedExercisePreset) {
      return;
    }

    applySelectedExerciseSelection(selectedExercisePreset.id, selectedExercisePreset.name);
  };

  const applySelectedExerciseSelection = (exerciseDefinitionId: string, exerciseName: string) => {
    setState((current) => ({
      ...current,
      session: {
        ...current.session,
        exercises: current.exerciseSelectionTargetId
          ? current.session.exercises.map((exercise) =>
              exercise.id === current.exerciseSelectionTargetId
                ? { ...exercise, exerciseDefinitionId, name: exerciseName }
                : exercise
            )
          : [...current.session.exercises, createExercise(exerciseDefinitionId, exerciseName)],
      },
      exercisePickerVisible: false,
      exerciseSelectionTargetId: null,
    }));
    clearSubmitFeedback();
    markSessionStructuralMutation();
  };

  const openExerciseCatalogFromRecorder = () => {
    pendingExercisePickerRestoreTargetRef.current = state.exerciseSelectionTargetId;
    setState((current) => ({
      ...current,
      exercisePickerVisible: false,
      exerciseActionMenuVisible: false,
      activeExerciseActionId: null,
    }));
    router.push('/exercise-catalog?source=session-recorder&intent=manage');
  };

  const openInlineExerciseCreate = () => {
    setState((current) => ({
      ...current,
      exercisePickerVisible: false,
      exerciseActionMenuVisible: false,
      activeExerciseActionId: null,
    }));
    setIsExerciseCreateModalVisible(true);
  };

  const closeInlineExerciseCreate = () => {
    setIsExerciseCreateModalVisible(false);
    setState((current) => ({
      ...current,
      exercisePickerVisible: true,
      exerciseActionMenuVisible: false,
      activeExerciseActionId: null,
    }));
  };

  const handleInlineExerciseCreated = async (exercise: ExerciseCatalogExercise) => {
    setExercisePickerOptions((current) => {
      const withoutSaved = current.filter((option) => option.id !== exercise.id);
      return [...withoutSaved, exercise].sort((left, right) => left.name.localeCompare(right.name));
    });
    setIsExerciseCreateModalVisible(false);
    applySelectedExerciseSelection(exercise.id, exercise.name);
  };

  const openExerciseActionMenu = (exerciseId: string) => {
    setState((current) => ({
      ...current,
      exerciseActionMenuVisible: true,
      activeExerciseActionId: exerciseId,
    }));
  };

  const dismissExerciseActionMenu = () => {
    setState((current) => ({
      ...current,
      exerciseActionMenuVisible: false,
      activeExerciseActionId: null,
    }));
  };

  const removeActiveExerciseFromMenu = () => {
    setState((current) => {
      if (!current.activeExerciseActionId) {
        return {
          ...current,
          exerciseActionMenuVisible: false,
          activeExerciseActionId: null,
        };
      }

      return {
        ...current,
        session: {
          ...current.session,
          exercises: current.session.exercises.filter((exercise) => exercise.id !== current.activeExerciseActionId),
        },
        exerciseActionMenuVisible: false,
        activeExerciseActionId: null,
      };
    });
    clearSubmitFeedback();
    markSessionStructuralMutation();
  };

  const changeActiveExerciseFromMenu = () => {
    if (!state.activeExerciseActionId) {
      dismissExerciseActionMenu();
      return;
    }

    openExerciseModal(state.activeExerciseActionId);
  };

  const addSetToExercise = (exerciseId: string) => {
    setState((current) => ({
      ...current,
      session: {
        ...current.session,
        exercises: current.session.exercises.map((exercise) =>
          exercise.id === exerciseId ? { ...exercise, sets: [...exercise.sets, createEmptySet()] } : exercise
        ),
      },
    }));
    clearSubmitFeedback();
    markSessionStructuralMutation();
  };

  const updateSetField = (
    exerciseId: string,
    setId: string,
    field: keyof Pick<SessionSet, 'reps' | 'weight'>,
    value: string
  ) => {
    setState((current) => ({
      ...current,
      session: {
        ...current.session,
        exercises: current.session.exercises.map((exercise) =>
          exercise.id === exerciseId
            ? {
                ...exercise,
                sets: exercise.sets.map((set) => (set.id === setId ? { ...set, [field]: value } : set)),
              }
            : exercise
        ),
      },
    }));
    clearSubmitFeedback();
    markSessionTextMutation();
  };

  const updateSessionStartDateTime = (value: string) => {
    setState((current) => ({
      ...current,
      session: {
        ...current.session,
        dateTime: value,
      },
    }));
    clearSubmitFeedback();
    setCompletedEditAutosaveNotice(null);
    markSessionTextMutation();
  };

  const updateCompletedEditEndDateTimeValue = (value: string) => {
    setCompletedEditEndDateTime(value);
    clearSubmitFeedback();
    setCompletedEditAutosaveNotice(null);
    markSessionTextMutation();
  };

  const handleCompletedEditStartBlur = () => {
    setCompletedEditStartTouched(true);
  };

  const handleCompletedEditEndBlur = () => {
    setCompletedEditEndTouched(true);
  };

  const removeSetFromExercise = (exerciseId: string, setId: string) => {
    setState((current) => ({
      ...current,
      session: {
        ...current.session,
        exercises: current.session.exercises.map((exercise) =>
          exercise.id === exerciseId
            ? { ...exercise, sets: exercise.sets.filter((set) => set.id !== setId) }
            : exercise
        ),
      },
    }));
    clearSubmitFeedback();
    markSessionStructuralMutation();
  };

  const finalizeSubmit = (submittedSession: Session) => {
    setState((current) => ({
      ...current,
      session: submittedSession,
    }));

    void (async () => {
      const parsedStartedAt = parseSessionDateTime(submittedSession.dateTime);
      if (!parsedStartedAt) {
        return;
      }
      const submittedGym =
        submittedSession.locationId === null
          ? null
          : stateRef.current.locations.find((location) => location.id === submittedSession.locationId) ?? null;
      await autosaveController.flushNow();

      if (submittedGym) {
        await upsertLocalGym({
          id: submittedGym.id,
          name: submittedGym.name,
        });
      }

      if (routeMode === 'completed-edit') {
        const endTimeText = completedEditEndDateTimeRef.current;
        if (!endTimeText || !persistedSessionIdRef.current) {
          return;
        }

        const parsedCompletedAt = parseSessionDateTime(endTimeText);
        if (!parsedCompletedAt) {
          return;
        }

        await persistCompletedSessionSnapshot({
          sessionId: persistedSessionIdRef.current,
          gymId: submittedGym?.id ?? null,
          startedAt: parsedStartedAt,
          completedAt: parsedCompletedAt,
          exercises: toPersistDraftExercises(submittedSession),
        });

        hasSessionMutationRef.current = false;
        router.dismissTo('/');
        return;
      }

      const persisted = await persistSessionDraftSnapshot({
        sessionId: persistedSessionIdRef.current ?? undefined,
        gymId: submittedGym?.id ?? null,
        startedAt: parsedStartedAt,
        status: 'active',
        exercises: toPersistDraftExercises(submittedSession),
      });

      await completeSessionDraft(persisted.sessionId);
      persistedSessionIdRef.current = null;
      hasSessionMutationRef.current = false;
      router.dismissTo('/');
    })().catch(() => {
      // Keep recorder screen state available for retry if persistence/complete/navigation fails.
    });
  };

  const beginSubmitFlow = (sessionCandidate: Session) => {
    const { session: withoutIncompleteSets, removedSets } = removeIncompleteSets(sessionCandidate);
    if (removedSets > 0) {
      setSubmitCleanupPrompt({
        step: 'incomplete-sets',
        affectedCount: removedSets,
        nextSession: withoutIncompleteSets,
      });
      return;
    }

    const { session: withoutEmptyExercises, removedExercises } = removeExercisesWithNoSets(sessionCandidate);
    if (removedExercises > 0) {
      setSubmitCleanupPrompt({
        step: 'empty-exercises',
        affectedCount: removedExercises,
        nextSession: withoutEmptyExercises,
      });
      return;
    }

    setSubmitCleanupPrompt(null);
    finalizeSubmit(sessionCandidate);
  };

  const handleSubmit = () => {
    if (routeMode === 'completed-edit') {
      const validationMessage = getDateTimeValidationMessage(state.session.dateTime, completedEditEndDateTime);
      if (validationMessage) {
        setCompletedEditSubmitAttempted(true);
        setCompletedEditStartTouched(true);
        setCompletedEditEndTouched(true);
        setCompletedEditAutosaveNotice(null);
        return;
      }
    }

    beginSubmitFlow(state.session);
  };

  const confirmSubmitCleanup = () => {
    if (!submitCleanupPrompt) {
      return;
    }

    beginSubmitFlow(submitCleanupPrompt.nextSession);
  };

  const cancelSubmitCleanup = () => {
    setSubmitCleanupPrompt(null);
  };

  const gymEditorPrimaryLabel = state.editingLocationId ? 'Save' : 'Add';
  const gymEditorTitle = state.editingLocationId ? 'Edit Gym' : 'Add Gym';
  const gymEditorInputValue = state.editingLocationId ? state.editingLocationName : state.pendingLocationName;
  const cleanupModalTitle =
    submitCleanupPrompt?.step === 'incomplete-sets'
      ? 'Remove incomplete sets and submit?'
      : 'Remove exercises with no sets and submit?';
  const cleanupModalMessage =
    submitCleanupPrompt?.step === 'incomplete-sets'
      ? `${submitCleanupPrompt.affectedCount} incomplete set${
          submitCleanupPrompt.affectedCount === 1 ? '' : 's'
        } missing reps or weight will be removed.`
      : `${submitCleanupPrompt?.affectedCount ?? 0} exercise${
          submitCleanupPrompt?.affectedCount === 1 ? '' : 's'
        } with no sets will be removed.`;
  const cleanupModalConfirmLabel =
    submitCleanupPrompt?.step === 'incomplete-sets'
      ? routeMode === 'completed-edit'
        ? 'Remove incomplete sets and save changes'
        : 'Remove incomplete sets and submit'
      : routeMode === 'completed-edit'
        ? 'Remove empty exercises and save changes'
        : 'Remove empty exercises and submit';

  const completedEditTimeValidationMessage =
    routeMode === 'completed-edit' ? getDateTimeValidationMessage(state.session.dateTime, completedEditEndDateTime) : null;
  const completedEditStartValidationMessage =
    routeMode === 'completed-edit'
      ? getCompletedEditStartTimeValidationMessage(state.session.dateTime)
      : null;
  const completedEditEndValidationMessage =
    routeMode === 'completed-edit'
      ? getCompletedEditEndTimeValidationMessage(state.session.dateTime, completedEditEndDateTime)
      : null;
  const showCompletedEditStartValidationError =
    Boolean(completedEditStartValidationMessage) && (completedEditStartTouched || completedEditSubmitAttempted);
  const showCompletedEditEndValidationError =
    Boolean(completedEditEndValidationMessage) && (completedEditEndTouched || completedEditSubmitAttempted);
  const showCompletedEditSaveBlockedNotice =
    routeMode === 'completed-edit' &&
    Boolean(completedEditTimeValidationMessage) &&
    (completedEditStartTouched || completedEditEndTouched || completedEditSubmitAttempted);

  if (routeMode === 'completed-edit' && isCompletedEditLoading) {
    return (
      <View style={styles.loadingState} testID="completed-edit-recorder-loading">
        <Text style={styles.loadingStateTitle}>Loading completed session...</Text>
      </View>
    );
  }

  if (routeMode === 'completed-edit' && completedEditLoadError) {
    return (
      <View style={styles.loadingState} testID="completed-edit-recorder-error">
        <Text style={styles.loadingStateTitle}>Unable to open completed session</Text>
        <Text style={styles.loadingStateBody}>{completedEditLoadError}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content} testID="session-recorder-screen">
      {routeMode === 'completed-edit' ? (
        <View style={styles.completedEditMetadataCard}>
          <View style={styles.completedEditMetadataRow}>
            <Text style={styles.completedEditMetadataLabel}>Start time</Text>
            <TextInput
              accessibilityLabel="Session start time"
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="YYYY-MM-DD HH:mm"
              style={styles.input}
              testID="completed-edit-start-time-input"
              value={state.session.dateTime}
              onChangeText={updateSessionStartDateTime}
              onBlur={handleCompletedEditStartBlur}
            />
            {showCompletedEditStartValidationError ? (
              <Text style={styles.validationErrorText} testID="completed-edit-start-time-validation-error">
                {completedEditStartValidationMessage}
              </Text>
            ) : null}
          </View>

          <View style={[styles.completedEditMetadataRow, styles.completedEditMetadataRowDivider]}>
            <Text style={styles.completedEditMetadataLabel}>End time</Text>
            <TextInput
              accessibilityLabel="Session end time"
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="YYYY-MM-DD HH:mm"
              style={styles.input}
              testID="completed-edit-end-time-input"
              value={completedEditEndDateTime ?? ''}
              onChangeText={updateCompletedEditEndDateTimeValue}
              onBlur={handleCompletedEditEndBlur}
            />
            {showCompletedEditEndValidationError ? (
              <Text style={styles.validationErrorText} testID="completed-edit-time-validation-error">
                {completedEditEndValidationMessage}
              </Text>
            ) : null}
            {completedEditAutosaveNotice ? (
              <Text style={styles.completedEditHintText} testID="completed-edit-autosave-notice">
                {completedEditAutosaveNotice}
              </Text>
            ) : null}
          </View>

          <View style={[styles.completedEditMetadataRow, styles.completedEditMetadataRowDivider]}>
            <Text style={styles.completedEditMetadataLabel}>Gym</Text>
            <Pressable style={styles.gymButton} onPress={openGymModal}>
              <Text numberOfLines={1} style={styles.gymButtonText}>
                {selectedGym ? selectedGym.name : 'Choose gym'}
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <SessionContentLayout
        showMetadataSection={routeMode !== 'completed-edit'}
        dateTimeValue={
          <View accessibilityLabel="Session date and time" style={styles.readOnlyInput}>
            <Text style={styles.readOnlyInputText}>{state.session.dateTime}</Text>
          </View>
        }
        gymValue={
          <Pressable style={styles.gymButton} onPress={openGymModal}>
            <Text numberOfLines={1} style={styles.gymButtonText}>
              {selectedGym ? selectedGym.name : 'Choose gym'}
            </Text>
          </Pressable>
        }
        exercises={state.session.exercises}
        renderSetRow={({ exercise, exerciseIndex, set, setIndex }) => (
          <View style={styles.setRow}>
            <TextInput
              accessibilityLabel={`Weight for exercise ${exerciseIndex + 1} set ${setIndex + 1}`}
              keyboardType="decimal-pad"
              placeholder="Weight"
              style={[styles.input, styles.setRowInput]}
              value={set.weight}
              onChangeText={(value) => updateSetField(exercise.id, set.id, 'weight', value)}
            />
            <TextInput
              accessibilityLabel={`Reps for exercise ${exerciseIndex + 1} set ${setIndex + 1}`}
              keyboardType="number-pad"
              placeholder="Reps"
              style={[styles.input, styles.setRowInput]}
              value={set.reps}
              onChangeText={(value) => updateSetField(exercise.id, set.id, 'reps', value)}
            />
            <Pressable
              accessibilityLabel={`Remove set ${setIndex + 1} from exercise ${exerciseIndex + 1}`}
              style={styles.setDeleteButton}
              onPress={() => removeSetFromExercise(exercise.id, set.id)}>
              <Text style={styles.setDeleteButtonText}>X</Text>
            </Pressable>
          </View>
        )}
        renderExerciseHeaderAction={({ exercise, exerciseIndex }) => (
          <Pressable
            accessibilityLabel={`Exercise options ${exerciseIndex + 1}`}
            style={styles.exerciseMenuButton}
            onPress={() => openExerciseActionMenu(exercise.id)}>
            <Text style={styles.exerciseMenuButtonText}>•••</Text>
          </Pressable>
        )}
        renderExerciseFooter={({ exercise, exerciseIndex }) => (
          <Pressable
            accessibilityLabel={`Add set to exercise ${exerciseIndex + 1}`}
            style={styles.addSetButton}
            onPress={() => addSetToExercise(exercise.id)}>
            <Text style={styles.primaryActionButtonText}>Add set</Text>
          </Pressable>
        )}
        renderEmptyState={(text) => <Text style={styles.emptyText}>{text}</Text>}
      />

      <Pressable
        accessibilityLabel="Log new exercise"
        style={styles.logExerciseButton}
        onPress={() => openExerciseModal()}>
        <Text style={styles.logExerciseButtonText}>Log new exercise</Text>
      </Pressable>

      {showCompletedEditSaveBlockedNotice ? (
        <View style={styles.completedEditSaveBlockedNotice} testID="completed-edit-save-blocked-notice">
          <Text style={styles.completedEditSaveBlockedNoticeText}>
            Fix Start/End time validation errors above before saving. Autosave stays paused until times are valid.
          </Text>
        </View>
      ) : null}

      <Pressable
        accessibilityLabel={routeMode === 'completed-edit' ? 'Save changes' : 'Submit session'}
        testID="session-recorder-submit-button"
        style={[
          styles.submitButton,
          routeMode === 'completed-edit' && completedEditTimeValidationMessage ? styles.submitButtonDisabled : null,
        ]}
        onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>
          {routeMode === 'completed-edit' ? 'Save Changes' : 'Submit Session'}
        </Text>
      </Pressable>

      <Modal
        animationType="fade"
        transparent
        visible={Boolean(submitCleanupPrompt)}
        onRequestClose={cancelSubmitCleanup}>
        <View style={styles.modalContainer}>
          <Pressable
            accessibilityLabel="Dismiss submit cleanup modal overlay"
            style={styles.modalBackdrop}
            onPress={cancelSubmitCleanup}
          />
          <View style={styles.confirmationModalCard}>
            <Text style={styles.confirmationTitle}>{cleanupModalTitle}</Text>
            <Text style={styles.confirmationBody}>{cleanupModalMessage}</Text>
            <View style={styles.confirmationButtonStack}>
              <Pressable style={styles.confirmationPrimaryButton} onPress={confirmSubmitCleanup}>
                <Text style={styles.confirmationPrimaryButtonText}>{cleanupModalConfirmLabel}</Text>
              </Pressable>
              <Pressable style={styles.confirmationSecondaryButton} onPress={cancelSubmitCleanup}>
                <Text style={styles.confirmationSecondaryButtonText}>Go back to edit session</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent
        visible={state.gymPickerVisible}
        onRequestClose={dismissGymModal}>
        <View style={styles.modalContainer}>
          <Pressable
            accessibilityLabel="Dismiss gym modal overlay"
            style={styles.modalBackdrop}
            onPress={dismissGymModal}
          />

          <View style={styles.modalCard}>
            {state.gymModalMode === 'picker' ? (
              <>
                <Text style={styles.modalTitle}>Select Gym</Text>
                <ScrollView contentContainerStyle={styles.modalList}>
                  {activeGyms.map((location) => (
                    <Pressable
                      key={location.id}
                      accessibilityLabel={`Select gym ${location.name}`}
                      style={styles.pickerOption}
                      onPress={() => selectGym(location.id)}>
                      <Text style={styles.pickerOptionText}>{location.name}</Text>
                    </Pressable>
                  ))}
                </ScrollView>

                <View style={styles.equalButtonRow}>
                  <Pressable style={styles.secondaryActionButton} onPress={openManageGyms}>
                    <Text style={styles.secondaryActionButtonText}>Manage</Text>
                  </Pressable>
                  <Pressable style={styles.secondaryActionButton} onPress={openAddGymEditor}>
                    <Text style={styles.secondaryActionButtonText}>Add new</Text>
                  </Pressable>
                </View>
              </>
            ) : null}

            {state.gymModalMode === 'manage' ? (
              <>
                <Text style={styles.modalTitle}>Manage Gyms</Text>

                <View style={styles.equalButtonRow}>
                  <Pressable style={styles.secondaryActionButton} onPress={returnToPickerFromManage}>
                    <Text style={styles.secondaryActionButtonText}>Back to picker</Text>
                  </Pressable>
                  <Pressable style={styles.secondaryActionButton} onPress={toggleArchivedVisibility}>
                    <Text style={styles.secondaryActionButtonText}>
                      {state.showArchivedInManager ? 'Hide archived' : 'Show archived'}
                    </Text>
                  </Pressable>
                </View>

                <ScrollView contentContainerStyle={styles.modalList}>
                  {managedGyms.map((location) => (
                    <View key={location.id} style={styles.manageRow}>
                      <Text numberOfLines={1} style={styles.manageRowTitle}>
                        {location.name}
                      </Text>
                      <Pressable
                        accessibilityLabel={`Edit gym ${location.name}`}
                        style={styles.inlineSecondaryButton}
                        onPress={() => openEditGymEditor(location)}>
                        <Text style={styles.inlineSecondaryButtonText}>Edit</Text>
                      </Pressable>
                      <Pressable
                        accessibilityLabel={`${location.archived ? 'Unarchive' : 'Archive'} gym ${location.name}`}
                        style={[
                          styles.inlineArchiveButton,
                          location.archived ? styles.unarchiveButton : styles.archiveDangerButton,
                        ]}
                        onPress={() => toggleGymArchive(location.id, location.archived)}>
                        <Text style={styles.inlineArchiveButtonText}>
                          {location.archived ? 'Unarchive' : 'Archive'}
                        </Text>
                      </Pressable>
                    </View>
                  ))}
                  {managedGyms.length === 0 ? (
                    <Text style={styles.emptyText}>No gyms for the current filter.</Text>
                  ) : null}
                </ScrollView>
              </>
            ) : null}

            {state.gymModalMode === 'editor' ? (
              <>
                <Text style={styles.modalTitle}>{gymEditorTitle}</Text>
                <TextInput
                  autoFocus
                  placeholder="Gym name"
                  style={styles.input}
                  value={gymEditorInputValue}
                  onChangeText={state.editingLocationId ? handleEditingLocationNameChange : handlePendingLocationNameChange}
                />
                <View style={styles.equalButtonRow}>
                  <Pressable style={styles.secondaryActionButton} onPress={returnFromEditor}>
                    <Text style={styles.secondaryActionButtonText}>Back</Text>
                  </Pressable>
                  <Pressable style={styles.primaryActionButton} onPress={saveGymFromEditor}>
                    <Text style={styles.primaryActionButtonText}>{gymEditorPrimaryLabel}</Text>
                  </Pressable>
                </View>
              </>
            ) : null}
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent
        visible={state.exercisePickerVisible}
        onRequestClose={dismissExerciseModal}>
        <View style={styles.modalContainer}>
          <Pressable
            accessibilityLabel="Dismiss exercise modal overlay"
            style={styles.modalBackdrop}
            onPress={dismissExerciseModal}
          />

          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Exercise</Text>
            <ScrollView contentContainerStyle={styles.modalList}>
              {isExerciseCatalogLoading ? <Text style={styles.emptyText}>Loading exercises...</Text> : null}
              {!isExerciseCatalogLoading && exerciseCatalogLoadError ? (
                <Text style={styles.emptyText}>{exerciseCatalogLoadError}</Text>
              ) : null}
              {!isExerciseCatalogLoading && !exerciseCatalogLoadError ? (
                <>
                  {exercisePickerOptions.map((exercisePreset) => (
                    <Pressable
                      key={exercisePreset.id}
                      accessibilityLabel={`Select exercise ${exercisePreset.name}`}
                      style={styles.pickerOption}
                      onPress={() => selectExercisePreset(exercisePreset.id)}>
                      <Text style={styles.pickerOptionText}>{exercisePreset.name}</Text>
                    </Pressable>
                  ))}
                  {exercisePickerOptions.length === 0 ? (
                    <Text style={styles.emptyText}>No active exercises available.</Text>
                  ) : null}
                </>
              ) : null}
            </ScrollView>

            <View style={styles.equalButtonRow}>
              <Pressable
                style={styles.secondaryActionButton}
                onPress={() => {
                  openExerciseCatalogFromRecorder();
                }}>
                <Text style={styles.secondaryActionButtonText}>Manage</Text>
              </Pressable>
              <Pressable
                style={styles.secondaryActionButton}
                onPress={() => {
                  openInlineExerciseCreate();
                }}>
                <Text style={styles.secondaryActionButtonText}>Add new</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <ExerciseEditorModal
        visible={isExerciseCreateModalVisible}
        editingExercise={null}
        onRequestClose={closeInlineExerciseCreate}
        onSaved={(exercise) => {
          void handleInlineExerciseCreated(exercise);
        }}
      />

      <Modal
        animationType="fade"
        transparent
        visible={state.exerciseActionMenuVisible}
        onRequestClose={dismissExerciseActionMenu}>
        <View style={styles.modalContainer}>
          <Pressable
            accessibilityLabel="Dismiss exercise action menu overlay"
            style={styles.modalBackdrop}
            onPress={dismissExerciseActionMenu}
          />
          <View style={styles.actionMenuCard}>
            <Pressable
              accessibilityLabel="Change exercise"
              style={styles.actionMenuSecondaryButton}
              onPress={changeActiveExerciseFromMenu}>
              <Text style={styles.actionMenuSecondaryButtonText}>Change exercise</Text>
            </Pressable>
            <Pressable style={styles.dangerActionButton} onPress={removeActiveExerciseFromMenu}>
              <Text style={styles.dangerActionButtonText}>Remove exercise</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 20,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 8,
    backgroundColor: uiColors.surfacePage,
  },
  loadingStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: uiColors.textPrimary,
  },
  loadingStateBody: {
    fontSize: 13,
    color: uiColors.textSecondary,
    textAlign: 'center',
  },
  completedEditMetadataCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: uiColors.borderMuted,
    backgroundColor: uiColors.surfaceDefault,
    padding: 12,
    gap: 6,
  },
  completedEditMetadataRow: {
    gap: 6,
  },
  completedEditMetadataRowDivider: {
    borderTopWidth: 1,
    borderTopColor: uiColors.borderMuted,
    paddingTop: 10,
    marginTop: 4,
  },
  completedEditMetadataLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: uiColors.textPrimary,
  },
  completedEditHintText: {
    fontSize: 12,
    color: uiColors.textSecondary,
  },
  completedEditSaveBlockedNotice: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: uiColors.borderWarning,
    backgroundColor: uiColors.surfaceWarning,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  completedEditSaveBlockedNoticeText: {
    fontSize: 12,
    color: uiColors.textWarning,
    fontWeight: '600',
  },
  validationErrorText: {
    fontSize: 12,
    color: uiColors.actionDangerText,
    fontWeight: '600',
  },
  section: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: uiColors.borderDefault,
    gap: 12,
    backgroundColor: uiColors.surfaceMuted,
  },
  topRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-end',
  },
  rowField: {
    flex: 1,
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: uiColors.borderDefault,
    borderRadius: 8,
    backgroundColor: uiColors.surfaceDefault,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  readOnlyInput: {
    borderWidth: 1,
    borderColor: uiColors.borderDefault,
    borderRadius: 8,
    backgroundColor: uiColors.surfaceReadOnly,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  readOnlyInputText: {
    color: uiColors.textPrimary,
    fontWeight: '500',
  },
  gymButton: {
    borderWidth: 1,
    borderColor: uiColors.actionPrimary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: uiColors.surfaceDefault,
  },
  gymButtonText: {
    color: uiColors.actionPrimary,
    fontWeight: '600',
  },
  logExerciseButton: {
    borderRadius: 8,
    backgroundColor: uiColors.actionPrimary,
    paddingVertical: 10,
    alignItems: 'center',
  },
  logExerciseButtonText: {
    color: uiColors.surfaceDefault,
    fontWeight: '700',
  },
  exerciseList: {
    gap: 12,
  },
  exerciseCard: {
    borderWidth: 1,
    borderColor: uiColors.borderDefault,
    borderRadius: 10,
    backgroundColor: uiColors.surfaceDefault,
    padding: 10,
    gap: 8,
  },
  exerciseCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  exerciseCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  exerciseMenuButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: uiColors.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: uiColors.surfaceDefault,
  },
  exerciseMenuButtonText: {
    color: uiColors.textMuted,
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 16,
  },
  setList: {
    gap: 8,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: uiColors.borderDefault,
    borderRadius: 8,
    padding: 8,
    gap: 8,
    backgroundColor: uiColors.surfaceMuted,
  },
  setRowInput: {
    flex: 1,
    paddingVertical: 8,
  },
  addSetButton: {
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: uiColors.actionPrimary,
  },
  setDeleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: uiColors.actionDanger,
  },
  setDeleteButtonText: {
    color: uiColors.surfaceDefault,
    fontWeight: '600',
    fontSize: 12,
  },
  submitButton: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: uiColors.actionPrimary,
  },
  submitButtonDisabled: {
    backgroundColor: uiColors.actionPrimaryDisabled,
  },
  submitButtonText: {
    color: uiColors.surfaceDefault,
    fontWeight: '700',
  },
  successCard: {
    borderWidth: 1,
    borderColor: uiColors.borderSuccess,
    borderRadius: 10,
    backgroundColor: uiColors.surfaceSuccess,
    padding: 12,
    gap: 6,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: uiColors.textSuccess,
  },
  successLine: {
    fontSize: 14,
    color: uiColors.textPrimary,
  },
  nonPersistenceNotice: {
    fontSize: 13,
    color: uiColors.textWarning,
    fontWeight: '600',
  },
  successResetButton: {
    marginTop: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: uiColors.textSuccess,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: uiColors.surfaceDefault,
  },
  successResetButtonText: {
    color: uiColors.textSuccess,
    fontWeight: '700',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: uiColors.overlayScrim,
  },
  modalCard: {
    maxHeight: '90%',
    borderRadius: 12,
    backgroundColor: uiColors.surfaceDefault,
    padding: 16,
    gap: 12,
  },
  confirmationModalCard: {
    borderRadius: 12,
    backgroundColor: uiColors.surfaceDefault,
    padding: 16,
    gap: 12,
  },
  confirmationTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: uiColors.textPrimary,
  },
  confirmationBody: {
    fontSize: 14,
    color: uiColors.textSecondary,
  },
  confirmationButtonStack: {
    gap: 8,
  },
  confirmationPrimaryButton: {
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: uiColors.actionPrimary,
  },
  confirmationPrimaryButtonText: {
    color: uiColors.surfaceDefault,
    fontWeight: '700',
  },
  confirmationSecondaryButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: uiColors.borderStrong,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: uiColors.surfaceDefault,
  },
  confirmationSecondaryButtonText: {
    color: uiColors.textMuted,
    fontWeight: '600',
  },
  actionMenuCard: {
    borderRadius: 12,
    backgroundColor: uiColors.surfaceDefault,
    padding: 16,
    gap: 10,
  },
  actionMenuSecondaryButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: uiColors.borderStrong,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: uiColors.surfaceDefault,
  },
  actionMenuSecondaryButtonText: {
    color: uiColors.textMuted,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  modalList: {
    gap: 8,
    paddingBottom: 4,
  },
  pickerOption: {
    borderWidth: 1,
    borderColor: uiColors.borderDefault,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: uiColors.surfaceDefault,
  },
  pickerOptionText: {
    fontSize: 14,
  },
  equalButtonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryActionButton: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: uiColors.borderStrong,
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryActionButtonText: {
    color: uiColors.textMuted,
    fontWeight: '600',
  },
  primaryActionButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: uiColors.actionPrimary,
  },
  primaryActionButtonText: {
    color: uiColors.surfaceDefault,
    fontWeight: '700',
  },
  dangerActionButton: {
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: uiColors.actionDanger,
  },
  dangerActionButtonText: {
    color: uiColors.surfaceDefault,
    fontWeight: '700',
  },
  manageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: uiColors.borderDefault,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  manageRowTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  inlineSecondaryButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: uiColors.actionPrimary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  inlineSecondaryButtonText: {
    color: uiColors.actionPrimary,
    fontWeight: '600',
  },
  inlineArchiveButton: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  archiveDangerButton: {
    backgroundColor: uiColors.actionDanger,
  },
  unarchiveButton: {
    backgroundColor: uiColors.actionSuccess,
  },
  inlineArchiveButtonText: {
    color: uiColors.surfaceDefault,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    color: uiColors.textMuted,
  },
});
