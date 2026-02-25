import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import {
  listExerciseCatalogExercises,
  listExerciseCatalogMuscleGroups,
  saveExerciseCatalogExercise,
  type ExerciseCatalogExercise,
  type ExerciseCatalogExerciseMuscleMapping,
  type ExerciseCatalogMuscleGroup,
} from '@/src/data/exercise-catalog';

type EditableMuscleLinkRow = {
  rowId: string;
  muscleGroupId: string;
  weightText: string;
  role: ExerciseCatalogExerciseMuscleMapping['role'];
};

type EditorValidationState = {
  nameError: string | null;
  linksError: string | null;
  rowErrors: Record<string, string>;
};

const createRowId = () => `muscle-link-row-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const formatWeightText = (weight: number) => `${weight}`;

const createBlankValidationState = (): EditorValidationState => ({
  nameError: null,
  linksError: null,
  rowErrors: {},
});

const buildEditorRowsFromExercise = (exercise: ExerciseCatalogExercise): EditableMuscleLinkRow[] =>
  exercise.mappings.map((mapping) => ({
    rowId: mapping.id || createRowId(),
    muscleGroupId: mapping.muscleGroupId,
    weightText: formatWeightText(mapping.weight),
    role: mapping.role,
  }));

export default function ExerciseCatalogScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [muscleGroups, setMuscleGroups] = useState<ExerciseCatalogMuscleGroup[]>([]);
  const [exercises, setExercises] = useState<ExerciseCatalogExercise[]>([]);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [exerciseName, setExerciseName] = useState('');
  const [muscleLinkRows, setMuscleLinkRows] = useState<EditableMuscleLinkRow[]>([]);
  const [validation, setValidation] = useState<EditorValidationState>(createBlankValidationState);

  useEffect(() => {
    let cancelled = false;

    Promise.all([listExerciseCatalogMuscleGroups(), listExerciseCatalogExercises()])
      .then(([loadedMuscleGroups, loadedExercises]) => {
        if (cancelled) {
          return;
        }

        setMuscleGroups(loadedMuscleGroups);
        setExercises(loadedExercises);

        if (loadedExercises.length > 0) {
          const firstExercise = loadedExercises[0];
          setEditingExerciseId(firstExercise.id);
          setExerciseName(firstExercise.name);
          setMuscleLinkRows(buildEditorRowsFromExercise(firstExercise));
        } else {
          setEditingExerciseId(null);
          setExerciseName('');
          setMuscleLinkRows([]);
        }
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setLoadError('Unable to load exercise catalog. Try again.');
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const muscleGroupById = new Map(muscleGroups.map((muscleGroup) => [muscleGroup.id, muscleGroup]));
  const selectedMuscleIds = new Set(muscleLinkRows.map((row) => row.muscleGroupId));

  const resetValidationAndFeedback = () => {
    setValidation(createBlankValidationState());
    setSaveError(null);
    setSaveFeedback(null);
  };

  const openEditorForExercise = (exercise: ExerciseCatalogExercise) => {
    setEditingExerciseId(exercise.id);
    setExerciseName(exercise.name);
    setMuscleLinkRows(buildEditorRowsFromExercise(exercise));
    resetValidationAndFeedback();
  };

  const startNewExercise = () => {
    setEditingExerciseId(null);
    setExerciseName('');
    setMuscleLinkRows([]);
    resetValidationAndFeedback();
  };

  const addMuscleLink = (muscleGroupId: string) => {
    if (selectedMuscleIds.has(muscleGroupId)) {
      return;
    }

    setMuscleLinkRows((current) => [
      ...current,
      {
        rowId: createRowId(),
        muscleGroupId,
        weightText: '1.0',
        role: null,
      },
    ]);
    setValidation((current) => ({
      ...current,
      linksError: null,
    }));
    setSaveError(null);
    setSaveFeedback(null);
  };

  const updateMuscleWeight = (rowId: string, weightText: string) => {
    setMuscleLinkRows((current) => current.map((row) => (row.rowId === rowId ? { ...row, weightText } : row)));
    setValidation((current) => {
      if (!current.rowErrors[rowId]) {
        return current;
      }

      const nextRowErrors = { ...current.rowErrors };
      delete nextRowErrors[rowId];
      return {
        ...current,
        rowErrors: nextRowErrors,
      };
    });
    setSaveError(null);
    setSaveFeedback(null);
  };

  const removeMuscleLink = (rowId: string) => {
    setMuscleLinkRows((current) => current.filter((row) => row.rowId !== rowId));
    setValidation((current) => {
      if (!current.rowErrors[rowId] && current.linksError === null) {
        return current;
      }

      const nextRowErrors = { ...current.rowErrors };
      delete nextRowErrors[rowId];
      return {
        ...current,
        linksError: null,
        rowErrors: nextRowErrors,
      };
    });
    setSaveError(null);
    setSaveFeedback(null);
  };

  const validateEditor = (): { ok: true; parsedMappings: { muscleGroupId: string; weight: number; role: EditableMuscleLinkRow['role'] }[] } | { ok: false } => {
    const trimmedName = exerciseName.trim();
    const nextValidation = createBlankValidationState();

    if (!trimmedName) {
      nextValidation.nameError = 'Exercise name is required.';
    }

    if (muscleLinkRows.length < 1) {
      nextValidation.linksError = 'Add at least one linked muscle before saving.';
    }

    const parsedMappings: { muscleGroupId: string; weight: number; role: EditableMuscleLinkRow['role'] }[] = [];
    const seenMuscleIds = new Set<string>();
    for (const row of muscleLinkRows) {
      if (seenMuscleIds.has(row.muscleGroupId)) {
        nextValidation.rowErrors[row.rowId] = 'Duplicate muscle link.';
        continue;
      }
      seenMuscleIds.add(row.muscleGroupId);

      const parsedWeight = Number(row.weightText);
      if (!Number.isFinite(parsedWeight) || parsedWeight <= 0 || parsedWeight > 10) {
        nextValidation.rowErrors[row.rowId] = 'Weight must be a number greater than 0 and at most 10.';
        continue;
      }

      parsedMappings.push({
        muscleGroupId: row.muscleGroupId,
        weight: parsedWeight,
        role: row.role,
      });
    }

    const hasErrors =
      nextValidation.nameError !== null ||
      nextValidation.linksError !== null ||
      Object.keys(nextValidation.rowErrors).length > 0;

    setValidation(nextValidation);

    if (hasErrors) {
      return { ok: false };
    }

    return { ok: true, parsedMappings };
  };

  const saveEditor = async () => {
    resetValidationAndFeedback();

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
      setMuscleLinkRows(buildEditorRowsFromExercise(savedExercise));
      setSaveFeedback(editingExerciseId ? 'Exercise updated.' : 'Exercise created.');
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unable to save exercise.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centeredState}>
        <Text selectable style={styles.stateText}>
          Loading exercise catalog…
        </Text>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={styles.centeredState}>
        <Text selectable style={styles.errorText}>
          {loadError}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text selectable style={styles.sectionTitle}>
          Exercises
        </Text>
        <Pressable accessibilityLabel="Create new exercise" style={styles.primaryButton} onPress={startNewExercise}>
          <Text style={styles.primaryButtonText}>New Exercise</Text>
        </Pressable>
        <View style={styles.list}>
          {exercises.map((exercise) => (
            <Pressable
              key={exercise.id}
              accessibilityLabel={`Edit exercise definition ${exercise.name}`}
              style={[
                styles.exerciseListRow,
                exercise.id === editingExerciseId ? styles.exerciseListRowSelected : null,
              ]}
              onPress={() => openEditorForExercise(exercise)}>
              <View style={styles.exerciseListRowTextStack}>
                <Text numberOfLines={1} style={styles.exerciseListRowTitle}>
                  {exercise.name}
                </Text>
                <Text style={styles.exerciseListRowMeta}>
                  {exercise.mappings.length} muscle link{exercise.mappings.length === 1 ? '' : 's'}
                </Text>
              </View>
              <Text style={styles.exerciseListRowAction}>Edit</Text>
            </Pressable>
          ))}
          {exercises.length === 0 ? (
            <Text selectable style={styles.helperText}>
              No exercises yet. Create one below.
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.section}>
        <Text selectable style={styles.sectionTitle}>
          {editingExerciseId ? 'Edit Exercise' : 'Create Exercise'}
        </Text>

        <Text style={styles.fieldLabel}>Exercise name</Text>
        <TextInput
          accessibilityLabel="Exercise definition name"
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

        <Text style={styles.fieldLabel}>Add muscle link</Text>
        <View style={styles.muscleChipGrid}>
          {muscleGroups.map((muscleGroup) => {
            const isSelected = selectedMuscleIds.has(muscleGroup.id);
            return (
              <Pressable
                key={muscleGroup.id}
                accessibilityLabel={`Add muscle link ${muscleGroup.displayName}`}
                accessibilityState={{ disabled: isSelected }}
                disabled={isSelected}
                style={[styles.muscleChip, isSelected ? styles.muscleChipDisabled : styles.muscleChipActive]}
                onPress={() => addMuscleLink(muscleGroup.id)}>
                <Text style={[styles.muscleChipText, isSelected ? styles.muscleChipTextDisabled : null]}>
                  {isSelected ? `${muscleGroup.displayName} added` : muscleGroup.displayName}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {validation.linksError ? (
          <Text selectable style={styles.errorText}>
            {validation.linksError}
          </Text>
        ) : null}

        <View style={styles.list}>
          {muscleLinkRows.map((row, index) => {
            const muscleGroup = muscleGroupById.get(row.muscleGroupId);
            const rowError = validation.rowErrors[row.rowId];
            return (
              <View key={row.rowId} style={styles.muscleLinkRow}>
                <View style={styles.muscleLinkRowHeader}>
                  <Text style={styles.muscleLinkRowTitle}>
                    {muscleGroup?.displayName ?? row.muscleGroupId}
                  </Text>
                  <Text style={styles.muscleLinkRowFamily}>{muscleGroup?.familyName ?? 'Unknown'}</Text>
                </View>

                <View style={styles.muscleLinkRowControls}>
                  <View style={styles.weightField}>
                    <Text style={styles.fieldLabel}>Weight</Text>
                    <TextInput
                      accessibilityLabel={`Weight for muscle link row ${index + 1}`}
                      keyboardType="decimal-pad"
                      placeholder="1.0"
                      style={[styles.input, rowError ? styles.inputError : null]}
                      value={row.weightText}
                      onChangeText={(nextValue) => updateMuscleWeight(row.rowId, nextValue)}
                    />
                  </View>
                  <Pressable
                    accessibilityLabel={`Remove muscle link ${muscleGroup?.displayName ?? row.muscleGroupId}`}
                    style={styles.removeButton}
                    onPress={() => removeMuscleLink(row.rowId)}>
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </Pressable>
                </View>

                {rowError ? (
                  <Text selectable style={styles.errorText}>
                    {rowError}
                  </Text>
                ) : null}
              </View>
            );
          })}

          {muscleLinkRows.length === 0 ? (
            <Text selectable style={styles.helperText}>
              Select at least one muscle group to define this exercise.
            </Text>
          ) : null}
        </View>

        {saveError ? (
          <Text selectable style={styles.errorText}>
            {saveError}
          </Text>
        ) : null}
        {saveFeedback ? (
          <Text selectable style={styles.successText}>
            {saveFeedback}
          </Text>
        ) : null}

        <Pressable accessibilityLabel="Save exercise definition" style={styles.primaryButton} disabled={isSaving} onPress={saveEditor}>
          <Text style={styles.primaryButtonText}>{isSaving ? 'Saving…' : 'Save Exercise'}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f7f7f7',
  },
  stateText: {
    fontSize: 15,
    color: '#333333',
  },
  content: {
    padding: 16,
    gap: 16,
    backgroundColor: '#f2f4f7',
  },
  section: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d6dbe2',
    backgroundColor: '#ffffff',
    padding: 14,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#c7ced8',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  inputError: {
    borderColor: '#b91c1c',
  },
  list: {
    gap: 8,
  },
  helperText: {
    fontSize: 13,
    color: '#4b5563',
  },
  errorText: {
    fontSize: 13,
    color: '#b91c1c',
    fontWeight: '500',
  },
  successText: {
    fontSize: 13,
    color: '#166534',
    fontWeight: '600',
  },
  primaryButton: {
    borderRadius: 8,
    backgroundColor: '#0f5cc0',
    alignItems: 'center',
    paddingVertical: 10,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  exerciseListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#d6dbe2',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 9,
    backgroundColor: '#ffffff',
  },
  exerciseListRowSelected: {
    borderColor: '#0f5cc0',
    backgroundColor: '#eef4ff',
  },
  exerciseListRowTextStack: {
    flex: 1,
    gap: 2,
  },
  exerciseListRowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  exerciseListRowMeta: {
    fontSize: 12,
    color: '#4b5563',
  },
  exerciseListRowAction: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f5cc0',
  },
  muscleChipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  muscleChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  muscleChipActive: {
    borderColor: '#0f5cc0',
    backgroundColor: '#ffffff',
  },
  muscleChipDisabled: {
    borderColor: '#c7ced8',
    backgroundColor: '#eef2f7',
  },
  muscleChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f5cc0',
  },
  muscleChipTextDisabled: {
    color: '#6b7280',
  },
  muscleLinkRow: {
    borderWidth: 1,
    borderColor: '#d6dbe2',
    borderRadius: 10,
    backgroundColor: '#f9fafb',
    padding: 10,
    gap: 8,
  },
  muscleLinkRowHeader: {
    gap: 2,
  },
  muscleLinkRowTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  muscleLinkRowFamily: {
    fontSize: 12,
    color: '#4b5563',
  },
  muscleLinkRowControls: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  weightField: {
    flex: 1,
    gap: 4,
  },
  removeButton: {
    borderRadius: 8,
    backgroundColor: '#b3261e',
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
