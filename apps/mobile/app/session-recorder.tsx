import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import {
  SEEDED_EXERCISES,
  SEEDED_LOCATIONS,
  SessionExercise,
  SessionExercisePreset,
  SessionLocation,
  SessionRecorderState,
  SessionSet,
} from '@/components/session-recorder/types';

function formatCurrentDateTime(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  const hours = `${date.getHours()}`.padStart(2, '0');
  const minutes = `${date.getMinutes()}`.padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

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
    exerciseModalMode: 'picker',
    exerciseEditorReturnMode: 'picker',
    exercisePresets: SEEDED_EXERCISES,
    pendingExerciseName: '',
    showArchivedExercisesInManager: false,
    editingExerciseId: null,
    editingExerciseName: '',
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

function createExercisePresetId(exerciseName: string): string {
  return `custom-exercise-${exerciseName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
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

function createExercise(name: string): SessionExercise {
  return {
    id: createExerciseId(),
    name,
    machineName: '',
    sets: [createEmptySet()],
  };
}

type SessionValidationErrors = {
  location?: string;
  exercises?: string;
  sets?: string;
};

type SessionSubmitSummary = {
  dateTime: string;
  gymName: string;
  exerciseCount: number;
  setCount: number;
};

function countLoggedSets(exercises: SessionExercise[]): number {
  return exercises.reduce((totalSets, exercise) => totalSets + exercise.sets.length, 0);
}

function validateSessionForSubmit(state: SessionRecorderState): SessionValidationErrors {
  const validationErrors: SessionValidationErrors = {};
  const hasAnyExercises = state.session.exercises.length > 0;

  if (!state.session.locationId) {
    validationErrors.location = 'Select a gym before submitting.';
  }

  if (!hasAnyExercises) {
    validationErrors.exercises = 'Log at least one exercise before submitting.';
    return validationErrors;
  }

  const hasExerciseWithoutSets = state.session.exercises.some((exercise) => exercise.sets.length === 0);
  if (hasExerciseWithoutSets) {
    validationErrors.sets = 'Each exercise needs at least one set.';
    return validationErrors;
  }

  const hasIncompleteSet = state.session.exercises.some((exercise) =>
    exercise.sets.some((set) => set.reps.trim().length === 0 || set.weight.trim().length === 0)
  );
  if (hasIncompleteSet) {
    validationErrors.sets = 'Enter weight and reps for every set before submitting.';
  }

  return validationErrors;
}

export default function SessionRecorderScreen() {
  const [state, setState] = useState<SessionRecorderState>(createInitialState);
  const [validationErrors, setValidationErrors] = useState<SessionValidationErrors>({});
  const [submitSummary, setSubmitSummary] = useState<SessionSubmitSummary | null>(null);

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

  const activeExercisePresets = useMemo(
    () => state.exercisePresets.filter((exercisePreset) => !exercisePreset.archived),
    [state.exercisePresets]
  );

  const managedExercisePresets = useMemo(
    () =>
      state.showArchivedExercisesInManager
        ? state.exercisePresets
        : state.exercisePresets.filter((exercisePreset) => !exercisePreset.archived),
    [state.exercisePresets, state.showArchivedExercisesInManager]
  );

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
    setSubmitSummary(null);
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
  };

  const openExerciseModal = (exerciseIdToChange: string | null = null) => {
    setState((current) => ({
      ...current,
      exercisePickerVisible: true,
      exerciseModalMode: 'picker',
      exerciseEditorReturnMode: 'picker',
      pendingExerciseName: '',
      editingExerciseId: null,
      editingExerciseName: '',
      showArchivedExercisesInManager: false,
      exerciseSelectionTargetId: exerciseIdToChange,
      exerciseActionMenuVisible: false,
      activeExerciseActionId: null,
    }));
  };

  const dismissExerciseModal = () => {
    setState((current) => ({
      ...current,
      exercisePickerVisible: false,
      exerciseModalMode: 'picker',
      exerciseEditorReturnMode: 'picker',
      pendingExerciseName: '',
      editingExerciseId: null,
      editingExerciseName: '',
      showArchivedExercisesInManager: false,
      exerciseSelectionTargetId: null,
    }));
  };

  const selectExercisePreset = (exercisePresetId: string) => {
    const selectedExercisePreset = state.exercisePresets.find(
      (exercisePreset) => exercisePreset.id === exercisePresetId
    );
    if (!selectedExercisePreset) {
      return;
    }

    setState((current) => ({
      ...current,
      session: {
        ...current.session,
        exercises: current.exerciseSelectionTargetId
          ? current.session.exercises.map((exercise) =>
              exercise.id === current.exerciseSelectionTargetId
                ? { ...exercise, name: selectedExercisePreset.name }
                : exercise
            )
          : [...current.session.exercises, createExercise(selectedExercisePreset.name)],
      },
      exercisePickerVisible: false,
      exerciseModalMode: 'picker',
      exerciseEditorReturnMode: 'picker',
      pendingExerciseName: '',
      editingExerciseId: null,
      editingExerciseName: '',
      showArchivedExercisesInManager: false,
      exerciseSelectionTargetId: null,
    }));
    setSubmitSummary(null);
  };

  const openManageExercises = () => {
    setState((current) => ({
      ...current,
      exerciseModalMode: 'manage',
      pendingExerciseName: '',
      editingExerciseId: null,
      editingExerciseName: '',
      exerciseActionMenuVisible: false,
      activeExerciseActionId: null,
    }));
  };

  const openAddExerciseEditor = () => {
    setState((current) => ({
      ...current,
      exerciseModalMode: 'editor',
      exerciseEditorReturnMode: 'picker',
      pendingExerciseName: '',
      editingExerciseId: null,
      editingExerciseName: '',
      exerciseActionMenuVisible: false,
      activeExerciseActionId: null,
    }));
  };

  const openEditExerciseEditor = (exercisePreset: SessionExercisePreset) => {
    setState((current) => ({
      ...current,
      exerciseModalMode: 'editor',
      exerciseEditorReturnMode: 'manage',
      editingExerciseId: exercisePreset.id,
      editingExerciseName: exercisePreset.name,
      pendingExerciseName: '',
    }));
  };

  const returnFromExerciseEditor = () => {
    setState((current) => ({
      ...current,
      exerciseModalMode: current.exerciseEditorReturnMode,
      pendingExerciseName: '',
      editingExerciseId: null,
      editingExerciseName: '',
    }));
  };

  const handlePendingExerciseNameChange = (pendingExerciseName: string) => {
    setState((current) => ({
      ...current,
      pendingExerciseName,
    }));
  };

  const handleEditingExerciseNameChange = (editingExerciseName: string) => {
    setState((current) => ({
      ...current,
      editingExerciseName,
    }));
  };

  const saveExerciseFromEditor = () => {
    const draftName = (state.editingExerciseId ? state.editingExerciseName : state.pendingExerciseName).trim();
    if (!draftName) {
      return;
    }

    if (state.editingExerciseId) {
      setState((current) => ({
        ...current,
        exercisePresets: current.exercisePresets.map((exercisePreset) =>
          exercisePreset.id === current.editingExerciseId ? { ...exercisePreset, name: draftName } : exercisePreset
        ),
        exerciseModalMode: 'manage',
        editingExerciseId: null,
        editingExerciseName: '',
      }));
      return;
    }

    const newExercisePreset: SessionExercisePreset = {
      id: createExercisePresetId(draftName),
      name: draftName,
      archived: false,
    };

    setState((current) => ({
      ...current,
      exercisePresets: [...current.exercisePresets, newExercisePreset],
      session: {
        ...current.session,
        exercises: current.exerciseSelectionTargetId
          ? current.session.exercises.map((exercise) =>
              exercise.id === current.exerciseSelectionTargetId
                ? { ...exercise, name: newExercisePreset.name }
                : exercise
            )
          : [...current.session.exercises, createExercise(newExercisePreset.name)],
      },
      exercisePickerVisible: false,
      exerciseModalMode: 'picker',
      exerciseEditorReturnMode: 'picker',
      pendingExerciseName: '',
      editingExerciseId: null,
      editingExerciseName: '',
      showArchivedExercisesInManager: false,
      exerciseSelectionTargetId: null,
    }));
    setSubmitSummary(null);
  };

  const returnToPickerFromExerciseManage = () => {
    setState((current) => ({
      ...current,
      exerciseModalMode: 'picker',
      showArchivedExercisesInManager: false,
      editingExerciseId: null,
      editingExerciseName: '',
    }));
  };

  const toggleExerciseArchivedVisibility = () => {
    setState((current) => ({
      ...current,
      showArchivedExercisesInManager: !current.showArchivedExercisesInManager,
    }));
  };

  const toggleExerciseArchive = (exercisePresetId: string, archived: boolean) => {
    setState((current) => ({
      ...current,
      exercisePresets: current.exercisePresets.map((exercisePreset) =>
        exercisePreset.id === exercisePresetId ? { ...exercisePreset, archived: !archived } : exercisePreset
      ),
    }));
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
    setSubmitSummary(null);
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
    setSubmitSummary(null);
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
    setSubmitSummary(null);
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
    setSubmitSummary(null);
  };

  const startNewEntry = () => {
    setState(createInitialState());
    setValidationErrors({});
    setSubmitSummary(null);
  };

  const handleSubmit = () => {
    const nextValidationErrors = validateSessionForSubmit(state);
    const hasValidationErrors = Object.values(nextValidationErrors).some(Boolean);
    if (hasValidationErrors) {
      setValidationErrors(nextValidationErrors);
      setSubmitSummary(null);
      return;
    }

    setValidationErrors({});
    setSubmitSummary({
      dateTime: state.session.dateTime,
      gymName: selectedGym?.name ?? 'Unknown gym',
      exerciseCount: state.session.exercises.length,
      setCount: countLoggedSets(state.session.exercises),
    });
  };

  const gymEditorPrimaryLabel = state.editingLocationId ? 'Save' : 'Add';
  const gymEditorTitle = state.editingLocationId ? 'Edit Gym' : 'Add Gym';
  const gymEditorInputValue = state.editingLocationId ? state.editingLocationName : state.pendingLocationName;
  const exerciseEditorPrimaryLabel = state.editingExerciseId ? 'Save' : 'Add';
  const exerciseEditorTitle = state.editingExerciseId ? 'Edit Exercise' : 'Add Exercise';
  const exerciseEditorInputValue = state.editingExerciseId ? state.editingExerciseName : state.pendingExerciseName;

  return (
    <ScrollView contentContainerStyle={styles.content} testID="session-recorder-screen">
      <View style={styles.section}>
        <View style={styles.topRow}>
          <View style={styles.rowField}>
            <Text style={styles.label}>Date and Time</Text>
            <View accessibilityLabel="Session date and time" style={styles.readOnlyInput}>
              <Text style={styles.readOnlyInputText}>{state.session.dateTime}</Text>
            </View>
          </View>

          <View style={styles.rowField}>
            <Text style={styles.label}>Gym</Text>
            <Pressable style={[styles.gymButton, validationErrors.location ? styles.fieldErrorBorder : null]} onPress={openGymModal}>
              <Text numberOfLines={1} style={styles.gymButtonText}>
                {selectedGym ? selectedGym.name : 'Choose gym'}
              </Text>
            </Pressable>
            {validationErrors.location ? (
              <Text style={styles.fieldErrorText}>{validationErrors.location}</Text>
            ) : null}
          </View>
        </View>
      </View>

      <View style={styles.exerciseList}>
        {validationErrors.exercises || validationErrors.sets ? (
          <View style={styles.validationCard}>
            {validationErrors.exercises ? (
              <Text style={styles.fieldErrorText}>{validationErrors.exercises}</Text>
            ) : null}
            {validationErrors.sets ? <Text style={styles.fieldErrorText}>{validationErrors.sets}</Text> : null}
          </View>
        ) : null}

        {state.session.exercises.map((exercise, exerciseIndex) => (
          <View key={exercise.id} style={styles.exerciseCard}>
            <View style={styles.exerciseCardHeader}>
              <Text numberOfLines={1} style={styles.exerciseCardTitle}>
                {exercise.name || `Exercise ${exerciseIndex + 1}`}
              </Text>
              <Pressable
                accessibilityLabel={`Exercise options ${exerciseIndex + 1}`}
                style={styles.exerciseMenuButton}
                onPress={() => openExerciseActionMenu(exercise.id)}>
                <Text style={styles.exerciseMenuButtonText}>•••</Text>
              </Pressable>
            </View>

            <View style={styles.setList}>
              {exercise.sets.map((set, setIndex) => (
                <View key={set.id} style={styles.setRow}>
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
              ))}
            </View>

            <Pressable
              accessibilityLabel={`Add set to exercise ${exerciseIndex + 1}`}
              style={styles.addSetButton}
              onPress={() => addSetToExercise(exercise.id)}>
              <Text style={styles.primaryActionButtonText}>Add set</Text>
            </Pressable>
          </View>
        ))}

        {state.session.exercises.length === 0 ? <Text style={styles.emptyText}>No exercises logged yet.</Text> : null}
      </View>

      <Pressable
        accessibilityLabel="Log new exercise"
        style={styles.logExerciseButton}
        onPress={() => openExerciseModal()}>
        <Text style={styles.logExerciseButtonText}>Log new exercise</Text>
      </Pressable>

      {submitSummary ? (
        <View style={styles.successCard}>
          <Text style={styles.successTitle}>Session submitted (UI only)</Text>
          <Text style={styles.successLine}>Date: {submitSummary.dateTime}</Text>
          <Text style={styles.successLine}>Gym: {submitSummary.gymName}</Text>
          <Text style={styles.successLine}>Exercises: {submitSummary.exerciseCount}</Text>
          <Text style={styles.successLine}>Sets: {submitSummary.setCount}</Text>
          <Text style={styles.nonPersistenceNotice}>
            This session is not saved to local storage or backend yet.
          </Text>
          <Pressable style={styles.successResetButton} onPress={startNewEntry}>
            <Text style={styles.successResetButtonText}>Start new entry</Text>
          </Pressable>
        </View>
      ) : null}

      <Pressable accessibilityLabel="Submit session" style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit Session</Text>
      </Pressable>

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
            {state.exerciseModalMode === 'picker' ? (
              <>
                <Text style={styles.modalTitle}>Select Exercise</Text>
                <ScrollView contentContainerStyle={styles.modalList}>
                  {activeExercisePresets.map((exercisePreset) => (
                    <Pressable
                      key={exercisePreset.id}
                      accessibilityLabel={`Select exercise ${exercisePreset.name}`}
                      style={styles.pickerOption}
                      onPress={() => selectExercisePreset(exercisePreset.id)}>
                      <Text style={styles.pickerOptionText}>{exercisePreset.name}</Text>
                    </Pressable>
                  ))}
                </ScrollView>

                <View style={styles.equalButtonRow}>
                  <Pressable style={styles.secondaryActionButton} onPress={openManageExercises}>
                    <Text style={styles.secondaryActionButtonText}>Manage</Text>
                  </Pressable>
                  <Pressable style={styles.secondaryActionButton} onPress={openAddExerciseEditor}>
                    <Text style={styles.secondaryActionButtonText}>Add new</Text>
                  </Pressable>
                </View>
              </>
            ) : null}

            {state.exerciseModalMode === 'manage' ? (
              <>
                <Text style={styles.modalTitle}>Manage Exercises</Text>

                <View style={styles.equalButtonRow}>
                  <Pressable style={styles.secondaryActionButton} onPress={returnToPickerFromExerciseManage}>
                    <Text style={styles.secondaryActionButtonText}>Back to picker</Text>
                  </Pressable>
                  <Pressable style={styles.secondaryActionButton} onPress={toggleExerciseArchivedVisibility}>
                    <Text style={styles.secondaryActionButtonText}>
                      {state.showArchivedExercisesInManager ? 'Hide archived' : 'Show archived'}
                    </Text>
                  </Pressable>
                </View>

                <ScrollView contentContainerStyle={styles.modalList}>
                  {managedExercisePresets.map((exercisePreset) => (
                    <View key={exercisePreset.id} style={styles.manageRow}>
                      <Text numberOfLines={1} style={styles.manageRowTitle}>
                        {exercisePreset.name}
                      </Text>
                      <Pressable
                        accessibilityLabel={`Edit exercise ${exercisePreset.name}`}
                        style={styles.inlineSecondaryButton}
                        onPress={() => openEditExerciseEditor(exercisePreset)}>
                        <Text style={styles.inlineSecondaryButtonText}>Edit</Text>
                      </Pressable>
                      <Pressable
                        accessibilityLabel={`${exercisePreset.archived ? 'Unarchive' : 'Archive'} exercise ${exercisePreset.name}`}
                        style={[
                          styles.inlineArchiveButton,
                          exercisePreset.archived ? styles.unarchiveButton : styles.archiveDangerButton,
                        ]}
                        onPress={() => toggleExerciseArchive(exercisePreset.id, exercisePreset.archived)}>
                        <Text style={styles.inlineArchiveButtonText}>
                          {exercisePreset.archived ? 'Unarchive' : 'Archive'}
                        </Text>
                      </Pressable>
                    </View>
                  ))}
                  {managedExercisePresets.length === 0 ? (
                    <Text style={styles.emptyText}>No exercises for the current filter.</Text>
                  ) : null}
                </ScrollView>
              </>
            ) : null}

            {state.exerciseModalMode === 'editor' ? (
              <>
                <Text style={styles.modalTitle}>{exerciseEditorTitle}</Text>
                <TextInput
                  autoFocus
                  placeholder="Exercise name"
                  style={styles.input}
                  value={exerciseEditorInputValue}
                  onChangeText={state.editingExerciseId ? handleEditingExerciseNameChange : handlePendingExerciseNameChange}
                />
                <View style={styles.equalButtonRow}>
                  <Pressable style={styles.secondaryActionButton} onPress={returnFromExerciseEditor}>
                    <Text style={styles.secondaryActionButtonText}>Back</Text>
                  </Pressable>
                  <Pressable style={styles.primaryActionButton} onPress={saveExerciseFromEditor}>
                    <Text style={styles.primaryActionButtonText}>{exerciseEditorPrimaryLabel}</Text>
                  </Pressable>
                </View>
              </>
            ) : null}
          </View>
        </View>
      </Modal>

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
  section: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    gap: 12,
    backgroundColor: '#fafafa',
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
    borderColor: '#c3c3c3',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  readOnlyInput: {
    borderWidth: 1,
    borderColor: '#c3c3c3',
    borderRadius: 8,
    backgroundColor: '#f4f4f4',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  readOnlyInputText: {
    color: '#2f2f2f',
    fontWeight: '500',
  },
  gymButton: {
    borderWidth: 1,
    borderColor: '#0f5cc0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
  },
  gymButtonText: {
    color: '#0f5cc0',
    fontWeight: '600',
  },
  fieldErrorBorder: {
    borderColor: '#b3261e',
  },
  fieldErrorText: {
    fontSize: 13,
    color: '#b3261e',
    fontWeight: '600',
  },
  validationCard: {
    borderWidth: 1,
    borderColor: '#f2c3bf',
    borderRadius: 10,
    backgroundColor: '#fff3f1',
    padding: 10,
    gap: 4,
  },
  logExerciseButton: {
    borderRadius: 8,
    backgroundColor: '#0f5cc0',
    paddingVertical: 10,
    alignItems: 'center',
  },
  logExerciseButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  exerciseList: {
    gap: 12,
  },
  exerciseCard: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 10,
    backgroundColor: '#ffffff',
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
    borderColor: '#bfbfbf',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  exerciseMenuButtonText: {
    color: '#5a5a5a',
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
    borderColor: '#d9d9d9',
    borderRadius: 8,
    padding: 8,
    gap: 8,
    backgroundColor: '#fafafa',
  },
  setRowInput: {
    flex: 1,
    paddingVertical: 8,
  },
  addSetButton: {
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#0f5cc0',
  },
  setDeleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#b3261e',
  },
  setDeleteButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 12,
  },
  submitButton: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#0f5cc0',
  },
  submitButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  successCard: {
    borderWidth: 1,
    borderColor: '#b9dfc3',
    borderRadius: 10,
    backgroundColor: '#effcf3',
    padding: 12,
    gap: 6,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#125d2f',
  },
  successLine: {
    fontSize: 14,
    color: '#1a1a1a',
  },
  nonPersistenceNotice: {
    fontSize: 13,
    color: '#5a332a',
    fontWeight: '600',
  },
  successResetButton: {
    marginTop: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#125d2f',
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  successResetButtonText: {
    color: '#125d2f',
    fontWeight: '700',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  modalCard: {
    maxHeight: '90%',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    padding: 16,
    gap: 12,
  },
  actionMenuCard: {
    borderRadius: 12,
    backgroundColor: '#ffffff',
    padding: 16,
    gap: 10,
  },
  actionMenuSecondaryButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6f6f6f',
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  actionMenuSecondaryButtonText: {
    color: '#444444',
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
    borderColor: '#cccccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
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
    borderColor: '#6f6f6f',
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryActionButtonText: {
    color: '#444444',
    fontWeight: '600',
  },
  primaryActionButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#0f5cc0',
  },
  primaryActionButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  dangerActionButton: {
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#b3261e',
  },
  dangerActionButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  manageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#d0d0d0',
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
    borderColor: '#0f5cc0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  inlineSecondaryButtonText: {
    color: '#0f5cc0',
    fontWeight: '600',
  },
  inlineArchiveButton: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  archiveDangerButton: {
    backgroundColor: '#b3261e',
  },
  unarchiveButton: {
    backgroundColor: '#1f8740',
  },
  inlineArchiveButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    color: '#555555',
  },
});
