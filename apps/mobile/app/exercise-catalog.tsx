import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { TopLevelTabs } from '@/components/navigation/top-level-tabs';
import { uiColors } from '@/components/ui';
import {
  deleteExerciseCatalogExercise,
  listExerciseCatalogExercises,
  listExerciseCatalogMuscleGroups,
  saveExerciseCatalogExercise,
  undeleteExerciseCatalogExercise,
  type ExerciseCatalogExercise,
  type ExerciseCatalogExerciseMuscleMapping,
  type ExerciseCatalogMuscleGroup,
} from '@/src/data/exercise-catalog';

type EditableSecondaryMuscleRow = {
  rowId: string;
  muscleGroupId: string;
};

type EditorValidationState = {
  nameError: string | null;
  primaryMuscleError: string | null;
  secondaryMusclesError: string | null;
};

type MuscleSelectorMode = 'primary' | 'secondary' | null;

const createRowId = () => `muscle-link-row-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const PRIMARY_MUSCLE_WEIGHT = 1;
const SECONDARY_MUSCLE_WEIGHT = 0.5;

const createBlankValidationState = (): EditorValidationState => ({
  nameError: null,
  primaryMuscleError: null,
  secondaryMusclesError: null,
});

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

const buildEditorMuscleSelectionsFromExercise = (
  exercise: ExerciseCatalogExercise
): { primaryMuscleGroupId: string | null; secondaryMuscleRows: EditableSecondaryMuscleRow[] } => {
  const primaryMapping = pickPrimaryMapping(exercise);
  const primaryMuscleGroupId = primaryMapping?.muscleGroupId ?? null;
  const seenSecondaryMuscleIds = new Set<string>();

  const secondaryMuscleRows = exercise.mappings
    .filter((mapping) => mapping.muscleGroupId !== primaryMuscleGroupId)
    .filter((mapping) => {
      if (seenSecondaryMuscleIds.has(mapping.muscleGroupId)) {
        return false;
      }

      seenSecondaryMuscleIds.add(mapping.muscleGroupId);
      return true;
    })
    .map((mapping) => ({
      rowId: mapping.id || createRowId(),
      muscleGroupId: mapping.muscleGroupId,
    }));

  return {
    primaryMuscleGroupId,
    secondaryMuscleRows,
  };
};

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
  const [isSaving, setIsSaving] = useState(false);
  const [isEditorModalVisible, setIsEditorModalVisible] = useState(false);
  const [showDeletedExercises, setShowDeletedExercises] = useState(false);
  const [didHandleInitialIntent, setDidHandleInitialIntent] = useState(false);
  const [muscleSelectorMode, setMuscleSelectorMode] = useState<MuscleSelectorMode>(null);
  const [exerciseActionMenuTarget, setExerciseActionMenuTarget] = useState<ExerciseCatalogExercise | null>(null);
  const [exerciseDeleteTarget, setExerciseDeleteTarget] = useState<ExerciseCatalogExercise | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [muscleGroups, setMuscleGroups] = useState<ExerciseCatalogMuscleGroup[]>([]);
  const [exercises, setExercises] = useState<ExerciseCatalogExercise[]>([]);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [exerciseName, setExerciseName] = useState('');
  const [primaryMuscleGroupId, setPrimaryMuscleGroupId] = useState<string | null>(null);
  const [secondaryMuscleRows, setSecondaryMuscleRows] = useState<EditableSecondaryMuscleRow[]>([]);
  const [validation, setValidation] = useState<EditorValidationState>(createBlankValidationState);

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
  const selectedSecondaryMuscleIds = new Set(secondaryMuscleRows.map((row) => row.muscleGroupId));
  const availablePrimaryMuscleGroupsForSelector = muscleGroups.filter(
    (muscleGroup) =>
      muscleGroup.id === primaryMuscleGroupId || !selectedSecondaryMuscleIds.has(muscleGroup.id)
  );
  const availableSecondaryMuscleGroupsForSelector = muscleGroups.filter(
    (muscleGroup) =>
      muscleGroup.id !== primaryMuscleGroupId && !selectedSecondaryMuscleIds.has(muscleGroup.id)
  );
  const isMuscleSelectorVisible = muscleSelectorMode !== null;
  const selectorOptions =
    muscleSelectorMode === 'primary' ? availablePrimaryMuscleGroupsForSelector : availableSecondaryMuscleGroupsForSelector;
  const selectorTitle = muscleSelectorMode === 'primary' ? 'Select primary muscle' : 'Add secondary muscle';
  const editorTitle = editingExerciseId ? 'Edit Exercise' : 'Create Exercise';

  const resetValidationAndErrors = () => {
    setValidation(createBlankValidationState());
    setSaveError(null);
  };

  const openEditorForExercise = (exercise: ExerciseCatalogExercise) => {
    const nextSelections = buildEditorMuscleSelectionsFromExercise(exercise);
    setEditingExerciseId(exercise.id);
    setExerciseName(exercise.name);
    setPrimaryMuscleGroupId(nextSelections.primaryMuscleGroupId);
    setSecondaryMuscleRows(nextSelections.secondaryMuscleRows);
    resetValidationAndErrors();
    setSaveFeedback(null);
    setIsEditorModalVisible(true);
  };

  const startNewExercise = () => {
    setEditingExerciseId(null);
    setExerciseName('');
    setPrimaryMuscleGroupId(null);
    setSecondaryMuscleRows([]);
    resetValidationAndErrors();
    setSaveFeedback(null);
    setIsEditorModalVisible(true);
  };

  useEffect(() => {
    if (didHandleInitialIntent || isLoading || loadError) {
      return;
    }

    if (routeIntent === 'add') {
      setEditingExerciseId(null);
      setExerciseName('');
      setPrimaryMuscleGroupId(null);
      setSecondaryMuscleRows([]);
      resetValidationAndErrors();
      setSaveFeedback(null);
      setIsEditorModalVisible(true);
    }

    setDidHandleInitialIntent(true);
  }, [didHandleInitialIntent, isLoading, loadError, routeIntent]);

  const closeEditorModal = () => {
    if (isSaving) {
      return;
    }

    setMuscleSelectorMode(null);
    setIsEditorModalVisible(false);
    setExerciseActionMenuTarget(null);
    resetValidationAndErrors();
  };

  const selectPrimaryMuscle = (muscleGroupId: string) => {
    setPrimaryMuscleGroupId(muscleGroupId);
    setSecondaryMuscleRows((current) => current.filter((row) => row.muscleGroupId !== muscleGroupId));
    setValidation((current) => ({
      ...current,
      primaryMuscleError: null,
      secondaryMusclesError: null,
    }));
    setMuscleSelectorMode(null);
    setSaveError(null);
    setSaveFeedback(null);
  };

  const addSecondaryMuscle = (muscleGroupId: string) => {
    if (muscleGroupId === primaryMuscleGroupId || selectedSecondaryMuscleIds.has(muscleGroupId)) {
      return;
    }

    setSecondaryMuscleRows((current) => [
      ...current,
      {
        rowId: createRowId(),
        muscleGroupId,
      },
    ]);
    setValidation((current) => ({
      ...current,
      secondaryMusclesError: null,
    }));
    setMuscleSelectorMode(null);
    setSaveError(null);
    setSaveFeedback(null);
  };

  const removeSecondaryMuscle = (rowId: string) => {
    setSecondaryMuscleRows((current) => current.filter((row) => row.rowId !== rowId));
    setValidation((current) => {
      if (current.secondaryMusclesError === null) {
        return current;
      }
      return {
        ...current,
        secondaryMusclesError: null,
      };
    });
    setSaveError(null);
    setSaveFeedback(null);
  };

  const validateEditor = ():
    | {
        ok: true;
        parsedMappings: { muscleGroupId: string; weight: number; role: ExerciseCatalogExerciseMuscleMapping['role'] }[];
      }
    | { ok: false } => {
    const trimmedName = exerciseName.trim();
    const nextValidation = createBlankValidationState();

    if (!trimmedName) {
      nextValidation.nameError = 'Exercise name is required.';
    }

    if (!primaryMuscleGroupId) {
      nextValidation.primaryMuscleError = 'Select a primary muscle before saving.';
    }

    const parsedMappings: { muscleGroupId: string; weight: number; role: ExerciseCatalogExerciseMuscleMapping['role'] }[] = [];
    const seenMuscleIds = new Set<string>();

    if (primaryMuscleGroupId) {
      seenMuscleIds.add(primaryMuscleGroupId);
      parsedMappings.push({
        muscleGroupId: primaryMuscleGroupId,
        weight: PRIMARY_MUSCLE_WEIGHT,
        role: 'primary',
      });
    }

    for (const row of secondaryMuscleRows) {
      if (seenMuscleIds.has(row.muscleGroupId)) {
        nextValidation.secondaryMusclesError = 'Duplicate secondary muscle.';
        continue;
      }

      seenMuscleIds.add(row.muscleGroupId);
      parsedMappings.push({
        muscleGroupId: row.muscleGroupId,
        weight: SECONDARY_MUSCLE_WEIGHT,
        role: 'secondary',
      });
    }

    const hasErrors =
      nextValidation.nameError !== null ||
      nextValidation.primaryMuscleError !== null ||
      nextValidation.secondaryMusclesError !== null;

    setValidation(nextValidation);

    if (hasErrors) {
      return { ok: false };
    }

    return { ok: true, parsedMappings };
  };

  const saveEditor = async () => {
    resetValidationAndErrors();

    const result = validateEditor();
    if (!result.ok) {
      return;
    }

    setIsSaving(true);
    try {
      const savedExercise = await saveExerciseCatalogExercise({
        id: editingExerciseId ?? undefined,
        name: exerciseName,
        mappings: result.parsedMappings,
      });

      setExercises((current) => {
        const withoutSaved = current.filter((exercise) => exercise.id !== savedExercise.id);
        return [...withoutSaved, savedExercise].sort((left, right) => left.name.localeCompare(right.name));
      });
      setEditingExerciseId(savedExercise.id);
      setExerciseName(savedExercise.name);
      const nextSelections = buildEditorMuscleSelectionsFromExercise(savedExercise);
      setPrimaryMuscleGroupId(nextSelections.primaryMuscleGroupId);
      setSecondaryMuscleRows(nextSelections.secondaryMuscleRows);
      setSaveFeedback(editingExerciseId ? 'Exercise updated.' : 'Exercise created.');
      setIsEditorModalVisible(false);
      setMuscleSelectorMode(null);
      setExerciseActionMenuTarget(null);

      if (isFromSessionRecorder) {
        router.back();
      }
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unable to save exercise.');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteExercise = async () => {
    if (!exerciseDeleteTarget) {
      return;
    }

    try {
      await deleteExerciseCatalogExercise(exerciseDeleteTarget.id);
      await reloadCatalog({ includeDeleted: showDeletedExercises });
      setSaveFeedback('Exercise deleted.');

      if (editingExerciseId === exerciseDeleteTarget.id) {
        setEditingExerciseId(null);
        setExerciseName('');
        setPrimaryMuscleGroupId(null);
        setSecondaryMuscleRows([]);
      }
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unable to delete exercise.');
    } finally {
      setExerciseDeleteTarget(null);
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
        <Pressable
          accessibilityLabel="Create new exercise"
          style={styles.primaryButton}
          onPress={startNewExercise}
          testID="create-new-exercise-button">
          <Text style={styles.primaryButtonText}>New Exercise</Text>
        </Pressable>
        <View style={styles.equalTopButtons}>
          <Pressable
            accessibilityLabel="Toggle show deleted exercises"
            style={styles.secondaryButton}
            onPress={() => {
              setShowDeletedExercises((current) => !current);
              setSaveError(null);
              setSaveFeedback(null);
            }}>
            <Text style={styles.secondaryButtonText}>
              {showDeletedExercises ? 'Hide deleted' : 'Show deleted'}
            </Text>
          </Pressable>
          {isFromSessionRecorder ? (
            <Pressable
              accessibilityLabel="Back to session recorder"
              style={styles.secondaryButton}
              onPress={() => router.back()}>
              <Text style={styles.secondaryButtonText}>Back to recorder</Text>
            </Pressable>
          ) : null}
        </View>
        {saveFeedback ? (
          <View style={styles.feedbackCard}>
            <Text selectable style={styles.successText}>
              {saveFeedback}
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
                  <Text numberOfLines={1} style={styles.exerciseListRowTitle}>
                    {exercise.name}
                  </Text>
                  <Text numberOfLines={1} style={styles.exerciseListRowMuscleSummary}>
                    {formatExerciseMuscleSummary(exercise, muscleGroupById)}
                  </Text>
                  {exercise.deletedAt ? (
                    <Text selectable style={styles.deletedExerciseChip}>
                      Deleted
                    </Text>
                  ) : null}
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

      <Modal
        animationType="slide"
        transparent
        visible={isEditorModalVisible}
        onRequestClose={closeEditorModal}>
        <View style={styles.modalRoot}>
          <Pressable
            accessibilityLabel="Dismiss exercise editor overlay"
            style={styles.modalOverlay}
            onPress={closeEditorModal}
          />
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text selectable style={styles.modalTitle}>
                {editorTitle}
              </Text>
            </View>

            <ScrollView
              style={styles.modalScroll}
              contentInsetAdjustmentBehavior="automatic"
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled">
              <Text style={styles.fieldLabel}>Exercise name</Text>
              <TextInput
                accessibilityLabel="Exercise definition name"
                autoFocus
                placeholder="Exercise name"
                style={[styles.input, validation.nameError ? styles.inputError : null]}
                value={exerciseName}
                onChangeText={(nextValue) => {
                  setExerciseName(nextValue);
                  if (validation.nameError) {
                    setValidation((current) => ({ ...current, nameError: null }));
                  }
                  setSaveError(null);
                  setSaveFeedback(null);
                }}
              />
              {validation.nameError ? (
                <Text selectable style={styles.errorText}>
                  {validation.nameError}
                </Text>
              ) : null}

              <Text style={styles.fieldLabel}>Primary muscle</Text>
              <Pressable
                accessibilityLabel="Open primary muscle selector"
                style={[styles.pickerButton, validation.primaryMuscleError ? styles.inputError : null]}
                onPress={() => setMuscleSelectorMode('primary')}>
                <Text
                  numberOfLines={1}
                  style={primaryMuscleGroupId ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>
                  {primaryMuscleGroupId
                    ? getMuscleDisplayName(primaryMuscleGroupId, muscleGroupById)
                    : 'Select primary muscle'}
                </Text>
                <Text style={styles.pickerButtonChevron}>▾</Text>
              </Pressable>
              {validation.primaryMuscleError ? (
                <Text selectable style={styles.errorText}>
                  {validation.primaryMuscleError}
                </Text>
              ) : null}

              <Text style={styles.fieldLabel}>Secondary muscles</Text>
              <View style={styles.list}>
                {secondaryMuscleRows.map((row) => {
                  const muscleGroup = muscleGroupById.get(row.muscleGroupId);
                  return (
                    <View key={row.rowId} style={styles.secondaryMuscleRow}>
                      <View style={styles.secondaryMuscleRowControls}>
                        <View style={styles.secondaryMuscleLabelCell}>
                          <Text numberOfLines={1} style={styles.secondaryMuscleRowTitle}>
                            {muscleGroup?.displayName ?? row.muscleGroupId}
                          </Text>
                          <Text numberOfLines={1} style={styles.secondaryMuscleRowFamily}>
                            {muscleGroup?.familyName ?? 'Unknown'}
                          </Text>
                        </View>
                        <Pressable
                          accessibilityLabel={`Remove secondary muscle ${muscleGroup?.displayName ?? row.muscleGroupId}`}
                          style={styles.removeButton}
                          onPress={() => removeSecondaryMuscle(row.rowId)}>
                          <Text style={styles.removeButtonText}>Remove</Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                })}

                {secondaryMuscleRows.length === 0 ? (
                  <Text selectable style={styles.helperText}>
                    No secondary muscles selected.
                  </Text>
                ) : null}
              </View>
              {validation.secondaryMusclesError ? (
                <Text selectable style={styles.errorText}>
                  {validation.secondaryMusclesError}
                </Text>
              ) : null}

              <View style={styles.addMuscleLinkRow}>
                <Pressable
                  accessibilityLabel="Open secondary muscle selector"
                  style={styles.addMuscleLinkButton}
                  onPress={() => setMuscleSelectorMode('secondary')}>
                  <Text style={styles.addMuscleLinkButtonText}>Add secondary muscle</Text>
                </Pressable>
              </View>

              {saveError ? (
                <Text selectable style={styles.errorText}>
                  {saveError}
                </Text>
              ) : null}
            </ScrollView>

            <View style={styles.modalFooterRow}>
              <Pressable style={styles.secondaryButton} onPress={closeEditorModal}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                accessibilityLabel="Save exercise definition"
                style={[styles.primaryButton, styles.modalPrimaryButton]}
                disabled={isSaving}
                onPress={saveEditor}>
                <Text style={styles.primaryButtonText}>{isSaving ? 'Saving…' : 'Save Exercise'}</Text>
              </Pressable>
            </View>

          </View>
          {isMuscleSelectorVisible ? (
            <View style={styles.selectorOverlayLayer}>
              <Pressable
                accessibilityLabel="Dismiss muscle link selector overlay"
                style={styles.selectorOverlayBackdrop}
                onPress={() => setMuscleSelectorMode(null)}
              />
              <View style={styles.selectorOverlayCard}>
                <View style={styles.modalHeaderRow}>
                  <Text selectable style={styles.modalTitle}>
                    {selectorTitle}
                  </Text>
                </View>

                <ScrollView contentContainerStyle={styles.selectorList} keyboardShouldPersistTaps="handled">
                  {selectorOptions.map((muscleGroup) => (
                    <Pressable
                      key={muscleGroup.id}
                      accessibilityLabel={`${
                        muscleSelectorMode === 'primary' ? 'Select primary muscle' : 'Select secondary muscle'
                      } ${muscleGroup.displayName}`}
                      style={styles.selectorListRow}
                      onPress={() => {
                        if (muscleSelectorMode === 'primary') {
                          selectPrimaryMuscle(muscleGroup.id);
                          return;
                        }

                        addSecondaryMuscle(muscleGroup.id);
                      }}>
                      <View style={styles.selectorListRowTextStack}>
                        <Text numberOfLines={1} style={styles.selectorListRowTitle}>
                          {muscleGroup.displayName}
                        </Text>
                        <Text numberOfLines={1} style={styles.selectorListRowMeta}>
                          {muscleGroup.familyName}
                        </Text>
                      </View>
                      <Text style={styles.selectorListRowAction}>
                        {muscleSelectorMode === 'primary' ? 'Select' : 'Add'}
                      </Text>
                    </Pressable>
                  ))}
                  {selectorOptions.length === 0 ? (
                    <Text selectable style={styles.helperText}>
                      {muscleSelectorMode === 'primary'
                        ? 'No primary muscle options available.'
                        : 'All available muscle groups are already selected as primary or secondary.'}
                    </Text>
                  ) : null}
                </ScrollView>

                <Pressable
                  accessibilityLabel="Close muscle link selector"
                  style={styles.secondaryButton}
                  onPress={() => setMuscleSelectorMode(null)}>
                  <Text style={styles.secondaryButtonText}>Done</Text>
                </Pressable>
              </View>
            </View>
          ) : null}
        </View>
      </Modal>

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
                  setExerciseDeleteTarget(exerciseActionMenuTarget);
                  setExerciseActionMenuTarget(null);
                }}>
                <Text style={styles.actionMenuDeleteButtonText}>Delete</Text>
              </Pressable>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent
        visible={exerciseDeleteTarget !== null}
        onRequestClose={() => setExerciseDeleteTarget(null)}>
        <View style={styles.modalRoot}>
          <Pressable
            accessibilityLabel="Dismiss exercise delete modal overlay"
            style={styles.modalOverlay}
            onPress={() => setExerciseDeleteTarget(null)}
          />
          <View style={styles.deleteModalCard}>
            <Text selectable style={styles.modalTitle}>
              Delete Exercise
            </Text>
            <Text selectable style={styles.helperText}>
              Delete {exerciseDeleteTarget?.name ?? 'this exercise'} from the exercise catalog?
            </Text>
            <View style={styles.modalFooterRow}>
              <Pressable style={styles.secondaryButton} onPress={() => setExerciseDeleteTarget(null)}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                accessibilityLabel="Confirm delete exercise"
                style={styles.deleteConfirmButton}
                onPress={() => {
                  void deleteExercise();
                }}>
                <Text style={styles.deleteConfirmButtonText}>Delete</Text>
              </Pressable>
            </View>
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
  equalTopButtons: {
    flexDirection: 'row',
    gap: 8,
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
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: uiColors.textSecondary,
  },
  input: {
    borderWidth: 1,
    borderColor: uiColors.borderDefault,
    borderRadius: 8,
    backgroundColor: uiColors.surfaceDefault,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  inputError: {
    borderColor: uiColors.actionDanger,
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
  modalPrimaryButton: {
    flex: 1,
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
  deleteConfirmButton: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: uiColors.actionDanger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    minHeight: 42,
  },
  deleteConfirmButtonText: {
    color: uiColors.surfaceDefault,
    fontWeight: '700',
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
  exerciseListRowTitle: {
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
    fontSize: 10,
    fontWeight: '700',
    color: uiColors.textWarning,
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
  addMuscleLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addMuscleLinkButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: uiColors.actionPrimary,
    backgroundColor: uiColors.surfaceDefault,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minHeight: 38,
    justifyContent: 'center',
  },
  addMuscleLinkButtonText: {
    color: uiColors.actionPrimary,
    fontWeight: '700',
    fontSize: 12,
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: uiColors.borderDefault,
    borderRadius: 8,
    backgroundColor: uiColors.surfaceDefault,
    minHeight: 42,
    paddingHorizontal: 10,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pickerButtonText: {
    flex: 1,
    minWidth: 0,
    color: uiColors.textPrimary,
    fontWeight: '600',
    fontSize: 13,
  },
  pickerButtonPlaceholder: {
    flex: 1,
    minWidth: 0,
    color: uiColors.textSecondary,
    fontSize: 13,
  },
  pickerButtonChevron: {
    color: uiColors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  secondaryMuscleRow: {
    borderWidth: 1,
    borderColor: uiColors.borderMuted,
    borderRadius: 10,
    backgroundColor: uiColors.surfaceMuted,
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 6,
  },
  secondaryMuscleRowTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: uiColors.textPrimary,
  },
  secondaryMuscleRowFamily: {
    fontSize: 11,
    color: uiColors.textSecondary,
  },
  secondaryMuscleRowControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  secondaryMuscleLabelCell: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  removeButton: {
    borderRadius: 8,
    backgroundColor: uiColors.actionDanger,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 38,
  },
  removeButtonText: {
    color: uiColors.surfaceDefault,
    fontWeight: '700',
    fontSize: 12,
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
  modalCard: {
    height: '80%',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: uiColors.borderMuted,
    backgroundColor: uiColors.surfaceDefault,
    padding: 14,
    gap: 12,
  },
  deleteModalCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: uiColors.borderMuted,
    backgroundColor: uiColors.surfaceDefault,
    padding: 14,
    gap: 10,
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
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: uiColors.textPrimary,
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    gap: 10,
    paddingBottom: 6,
  },
  selectorOverlayLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    padding: 12,
  },
  selectorOverlayBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: uiColors.overlayScrimSoft,
    borderRadius: 14,
  },
  selectorOverlayCard: {
    height: '80%',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: uiColors.borderMuted,
    backgroundColor: uiColors.surfaceDefault,
    padding: 14,
    gap: 10,
  },
  selectorList: {
    gap: 8,
    paddingBottom: 4,
  },
  selectorListRow: {
    borderWidth: 1,
    borderColor: uiColors.borderMuted,
    borderRadius: 8,
    backgroundColor: uiColors.surfaceDefault,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectorListRowTextStack: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  selectorListRowTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: uiColors.textPrimary,
  },
  selectorListRowMeta: {
    fontSize: 11,
    color: uiColors.textSecondary,
  },
  selectorListRowAction: {
    fontSize: 12,
    fontWeight: '700',
    color: uiColors.actionPrimary,
  },
  modalFooterRow: {
    flexDirection: 'row',
    gap: 8,
  },
});
