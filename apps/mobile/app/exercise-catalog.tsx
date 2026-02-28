import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ExerciseEditorModal } from '@/components/exercise-catalog/exercise-editor-modal';
import { TopLevelTabs } from '@/components/navigation/top-level-tabs';
import { uiColors } from '@/components/ui';
import {
  deleteExerciseCatalogExercise,
  listExerciseCatalogExercises,
  listExerciseCatalogMuscleGroups,
  undeleteExerciseCatalogExercise,
  type ExerciseCatalogExercise,
  type ExerciseCatalogMuscleGroup,
} from '@/src/data/exercise-catalog';

const coerceRouteParam = (value: string | string[] | undefined): string | null => {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
};

const getMuscleDisplayName = (
  muscleGroupId: string,
  muscleGroupById: Map<string, ExerciseCatalogMuscleGroup>
) => muscleGroupById.get(muscleGroupId)?.displayName ?? muscleGroupId;

const pickPrimaryMapping = (exercise: ExerciseCatalogExercise) =>
  exercise.mappings.find((mapping) => mapping.role === 'primary') ??
  [...exercise.mappings].sort((left, right) => right.weight - left.weight)[0] ??
  null;

const formatExerciseMuscleSummary = (
  exercise: ExerciseCatalogExercise,
  muscleGroupById: Map<string, ExerciseCatalogMuscleGroup>
) => {
  if (exercise.mappings.length === 0) {
    return 'No muscle links';
  }

  const primaryMapping = pickPrimaryMapping(exercise);

  if (!primaryMapping) {
    return 'No muscle links';
  }

  const secondaryMappings = exercise.mappings.filter((mapping) => mapping.id !== primaryMapping.id);
  const primaryLabel = getMuscleDisplayName(primaryMapping.muscleGroupId, muscleGroupById);

  if (secondaryMappings.length === 0) {
    return primaryLabel;
  }

  if (secondaryMappings.length === 1) {
    const secondaryLabel = getMuscleDisplayName(secondaryMappings[0].muscleGroupId, muscleGroupById);
    return `${primaryLabel} · ${secondaryLabel} (s)`;
  }

  return `${primaryLabel} · ${secondaryMappings.length} secondaries`;
};

export default function ExerciseCatalogScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ source?: string | string[]; intent?: string | string[] }>();
  const routeSource = coerceRouteParam(params.source);
  const routeIntent = coerceRouteParam(params.intent);
  const isFromSessionRecorder = routeSource === 'session-recorder';

  const [isLoading, setIsLoading] = useState(true);
  const [isEditorModalVisible, setIsEditorModalVisible] = useState(false);
  const [showDeletedExercises, setShowDeletedExercises] = useState(false);
  const [didHandleInitialIntent, setDidHandleInitialIntent] = useState(false);
  const [exerciseActionMenuTarget, setExerciseActionMenuTarget] = useState<ExerciseCatalogExercise | null>(null);
  const [editorExerciseTarget, setEditorExerciseTarget] = useState<ExerciseCatalogExercise | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [muscleGroups, setMuscleGroups] = useState<ExerciseCatalogMuscleGroup[]>([]);
  const [exercises, setExercises] = useState<ExerciseCatalogExercise[]>([]);

  const reloadCatalog = useCallback(async (options: { includeDeleted: boolean }) => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const [loadedMuscleGroups, loadedExercises] = await Promise.all([
        listExerciseCatalogMuscleGroups(),
        listExerciseCatalogExercises({ includeDeleted: options.includeDeleted }),
      ]);
      setMuscleGroups(loadedMuscleGroups);
      setExercises(loadedExercises);
    } catch {
      setLoadError('Unable to load exercise catalog. Try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      void (async () => {
        setIsLoading(true);
        setLoadError(null);

        try {
          const [loadedMuscleGroups, loadedExercises] = await Promise.all([
            listExerciseCatalogMuscleGroups(),
            listExerciseCatalogExercises({ includeDeleted: showDeletedExercises }),
          ]);

          if (cancelled) {
            return;
          }

          setMuscleGroups(loadedMuscleGroups);
          setExercises(loadedExercises);
        } catch {
          if (cancelled) {
            return;
          }

          setLoadError('Unable to load exercise catalog. Try again.');
        } finally {
          if (!cancelled) {
            setIsLoading(false);
          }
        }
      })();

      return () => {
        cancelled = true;
      };
    }, [showDeletedExercises])
  );

  const muscleGroupById = new Map(muscleGroups.map((muscleGroup) => [muscleGroup.id, muscleGroup]));
  const openEditorForExercise = (exercise: ExerciseCatalogExercise) => {
    setEditorExerciseTarget(exercise);
    setSaveFeedback(null);
    setIsEditorModalVisible(true);
  };

  const startNewExercise = () => {
    setEditorExerciseTarget(null);
    setSaveFeedback(null);
    setIsEditorModalVisible(true);
  };

  useEffect(() => {
    if (didHandleInitialIntent || isLoading || loadError) {
      return;
    }

    if (routeIntent === 'add') {
      setEditorExerciseTarget(null);
      setSaveFeedback(null);
      setIsEditorModalVisible(true);
    }

    setDidHandleInitialIntent(true);
  }, [didHandleInitialIntent, isLoading, loadError, routeIntent]);

  const closeEditorModal = () => {
    setIsEditorModalVisible(false);
    setEditorExerciseTarget(null);
    setExerciseActionMenuTarget(null);
  };

  const handleEditorSaved = (savedExercise: ExerciseCatalogExercise) => {
    const wasEditing = editorExerciseTarget !== null;
    setExercises((current) => {
      const withoutSaved = current.filter((exercise) => exercise.id !== savedExercise.id);
      return [...withoutSaved, savedExercise].sort((left, right) => left.name.localeCompare(right.name));
    });
    setSaveFeedback(wasEditing ? 'Exercise updated.' : 'Exercise created.');
    setIsEditorModalVisible(false);
    setEditorExerciseTarget(null);
    setExerciseActionMenuTarget(null);

    if (isFromSessionRecorder) {
      router.back();
    }
  };

  const deleteExercise = async (exercise: ExerciseCatalogExercise) => {
    try {
      await deleteExerciseCatalogExercise(exercise.id);
      await reloadCatalog({ includeDeleted: showDeletedExercises });
      setSaveFeedback('Exercise deleted.');

      if (editorExerciseTarget?.id === exercise.id) {
        setEditorExerciseTarget(null);
      }
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unable to delete exercise.');
    }
  };

  const undeleteExercise = async (exercise: ExerciseCatalogExercise) => {
    try {
      await undeleteExerciseCatalogExercise(exercise.id);
      await reloadCatalog({ includeDeleted: showDeletedExercises });
      setSaveFeedback('Exercise restored.');
      setExerciseActionMenuTarget(null);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unable to restore exercise.');
    }
  };

  const bottomTabs = (
    <TopLevelTabs
      activeTab="exercises"
      onPressSessions={() => router.push('/session-list')}
      onPressExercises={() => {}}
    />
  );

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <View style={styles.centeredState}>
          <Text selectable style={styles.stateText}>
            Loading exercise catalog…
          </Text>
        </View>
        {bottomTabs}
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={styles.screen}>
        <View style={styles.centeredState}>
          <Text selectable style={styles.errorText}>
            {loadError}
          </Text>
        </View>
        {bottomTabs}
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.pinnedTopRegion}>
        <View style={styles.topActionRow}>
          <Pressable
            accessibilityLabel="Create new exercise"
            style={[styles.primaryButton, styles.topActionButton]}
            onPress={startNewExercise}
            testID="create-new-exercise-button">
            <Text style={styles.primaryButtonText}>New Exercise</Text>
          </Pressable>
          <Pressable
            accessibilityLabel="Toggle show deleted exercises"
            style={[styles.secondaryButton, styles.topActionButton]}
            onPress={() => {
              setShowDeletedExercises((current) => !current);
              setSaveError(null);
              setSaveFeedback(null);
            }}>
            <Text style={styles.secondaryButtonText}>
              {showDeletedExercises ? 'Hide deleted' : 'Show deleted'}
            </Text>
          </Pressable>
        </View>
        {saveFeedback ? (
          <View style={styles.feedbackCard}>
            <Text selectable style={styles.successText}>
              {saveFeedback}
            </Text>
          </View>
        ) : null}
        {saveError ? (
          <View style={styles.errorCard}>
            <Text selectable style={styles.errorText}>
              {saveError}
            </Text>
          </View>
        ) : null}
      </View>

      <ScrollView
        style={styles.scroll}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}>
        <View style={styles.list}>
          {exercises.map((exercise) => (
            <View key={exercise.id} style={styles.exerciseListRow}>
              <Pressable
                accessibilityLabel={`Edit exercise definition ${exercise.name}`}
                style={styles.exerciseListRowMainPressable}
              onPress={() => {
                if (exercise.deletedAt) {
                  return;
                }
                openEditorForExercise(exercise);
              }}>
                <View style={styles.exerciseListRowTextStack}>
                  <View style={styles.exerciseListRowTitleRow}>
                    <Text numberOfLines={1} style={styles.exerciseListRowTitle}>
                      {exercise.name}
                    </Text>
                    {exercise.deletedAt ? (
                      <Text selectable style={styles.deletedExerciseChip}>
                        Deleted
                      </Text>
                    ) : null}
                  </View>
                  <Text numberOfLines={1} style={styles.exerciseListRowMuscleSummary}>
                    {formatExerciseMuscleSummary(exercise, muscleGroupById)}
                  </Text>
                </View>
              </Pressable>
              <Pressable
                accessibilityLabel={`Exercise actions ${exercise.name}`}
                style={styles.exerciseRowKebabButton}
                onPress={() => setExerciseActionMenuTarget(exercise)}>
                <Text style={styles.exerciseRowKebabText}>⋮</Text>
              </Pressable>
            </View>
          ))}

          {exercises.length === 0 ? (
            <Text selectable style={styles.helperText}>
              {showDeletedExercises
                ? 'No exercises found for this filter.'
                : 'No active exercises yet. Create one with the button above.'}
            </Text>
          ) : null}
        </View>
      </ScrollView>

      <ExerciseEditorModal
        visible={isEditorModalVisible}
        editingExercise={editorExerciseTarget}
        muscleGroups={muscleGroups}
        onRequestClose={closeEditorModal}
        onSaved={handleEditorSaved}
      />

      <Modal
        animationType="fade"
        transparent
        visible={exerciseActionMenuTarget !== null}
        onRequestClose={() => setExerciseActionMenuTarget(null)}>
        <View style={styles.modalRoot}>
          <Pressable
            accessibilityLabel="Dismiss exercise action menu overlay"
            style={styles.modalOverlay}
            onPress={() => setExerciseActionMenuTarget(null)}
          />
          <View style={styles.actionMenuCard}>
            <Text selectable style={styles.modalTitle}>
              Exercise Actions
            </Text>
            <Text selectable style={styles.helperText}>
              {exerciseActionMenuTarget?.name ?? 'Exercise'}
            </Text>
            <Pressable
              accessibilityLabel="Edit exercise from actions"
              style={styles.actionMenuButton}
              disabled={Boolean(exerciseActionMenuTarget?.deletedAt)}
              onPress={() => {
                const target = exerciseActionMenuTarget;
                setExerciseActionMenuTarget(null);
                if (target && !target.deletedAt) {
                  openEditorForExercise(target);
                }
              }}>
              <Text style={styles.actionMenuButtonText}>Edit</Text>
            </Pressable>
            {exerciseActionMenuTarget?.deletedAt ? (
              <Pressable
                accessibilityLabel="Undelete exercise from actions"
                style={styles.actionMenuButton}
                onPress={() => {
                  const target = exerciseActionMenuTarget;
                  if (target) {
                    void undeleteExercise(target);
                  }
                }}>
                <Text style={styles.actionMenuButtonText}>Undelete</Text>
              </Pressable>
            ) : (
              <Pressable
                accessibilityLabel="Delete exercise from actions"
                style={[styles.actionMenuButton, styles.actionMenuDeleteButton]}
                onPress={() => {
                  const target = exerciseActionMenuTarget;
                  setExerciseActionMenuTarget(null);
                  if (target) {
                    void deleteExercise(target);
                  }
                }}>
                <Text style={styles.actionMenuDeleteButtonText}>Delete</Text>
              </Pressable>
            )}
          </View>
        </View>
      </Modal>

      {bottomTabs}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: uiColors.surfacePage,
    padding: 16,
    gap: 12,
  },
  scroll: {
    flex: 1,
  },
  content: {
    gap: 12,
    paddingBottom: 12,
  },
  pinnedTopRegion: {
    gap: 8,
    flexShrink: 0,
  },
  topActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  topActionButton: {
    flex: 1,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: uiColors.borderMuted,
    backgroundColor: uiColors.surfaceDefault,
  },
  stateText: {
    fontSize: 15,
    color: uiColors.textPrimary,
  },
  section: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: uiColors.borderMuted,
    backgroundColor: uiColors.surfaceDefault,
    padding: 14,
    gap: 10,
  },
  feedbackCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: uiColors.borderSuccess,
    backgroundColor: uiColors.surfaceSuccess,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  errorCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: uiColors.actionDangerSubtleBorder,
    backgroundColor: uiColors.actionDangerSubtleBg,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  list: {
    gap: 8,
  },
  helperText: {
    fontSize: 13,
    color: uiColors.textSecondary,
  },
  errorText: {
    fontSize: 13,
    color: uiColors.actionDanger,
    fontWeight: '500',
  },
  successText: {
    fontSize: 13,
    color: uiColors.textSuccess,
    fontWeight: '600',
  },
  primaryButton: {
    borderRadius: 8,
    backgroundColor: uiColors.actionPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    minHeight: 42,
  },
  primaryButtonText: {
    color: uiColors.surfaceDefault,
    fontWeight: '700',
  },
  secondaryButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: uiColors.textSecondary,
    backgroundColor: uiColors.surfaceDefault,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    minHeight: 42,
    flex: 1,
  },
  secondaryButtonText: {
    color: uiColors.textSecondary,
    fontWeight: '600',
  },
  exerciseListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: uiColors.borderMuted,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 7,
    backgroundColor: uiColors.surfaceDefault,
  },
  exerciseListRowMainPressable: {
    flex: 1,
  },
  exerciseListRowTextStack: {
    flex: 1,
    gap: 1,
  },
  exerciseListRowTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  exerciseListRowTitle: {
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '600',
    color: uiColors.textPrimary,
  },
  exerciseListRowMuscleSummary: {
    fontSize: 11,
    color: uiColors.textSecondary,
    fontWeight: '600',
  },
  deletedExerciseChip: {
    fontSize: 9,
    fontWeight: '700',
    color: uiColors.textWarning,
    borderWidth: 1,
    borderColor: uiColors.borderWarning,
    backgroundColor: uiColors.surfaceWarning,
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  exerciseRowKebabButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: uiColors.borderMuted,
    backgroundColor: uiColors.surfacePage,
  },
  exerciseRowKebabText: {
    fontSize: 14,
    fontWeight: '700',
    color: uiColors.textSecondary,
    lineHeight: 16,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: uiColors.overlayScrim,
  },
  actionMenuCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: uiColors.borderMuted,
    backgroundColor: uiColors.surfaceDefault,
    padding: 14,
    gap: 8,
  },
  actionMenuButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: uiColors.borderMuted,
    backgroundColor: uiColors.surfaceDefault,
    paddingVertical: 10,
    paddingHorizontal: 12,
    minHeight: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionMenuButtonText: {
    color: uiColors.textPrimary,
    fontWeight: '700',
  },
  actionMenuDeleteButton: {
    borderColor: uiColors.actionDangerSubtleBorder,
    backgroundColor: uiColors.actionDangerSubtleBg,
  },
  actionMenuDeleteButtonText: {
    color: uiColors.actionDangerText,
    fontWeight: '700',
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: uiColors.textPrimary,
  },
});
