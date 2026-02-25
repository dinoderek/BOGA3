import { Fragment, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export type SessionContentSetValue = {
  id: string;
};

export type SessionContentExerciseValue<TSet extends SessionContentSetValue = SessionContentSetValue> = {
  id: string;
  name: string;
  machineName?: string | null;
  sets: TSet[];
};

type SessionContentLayoutProps<TSet extends SessionContentSetValue> = {
  showMetadataSection?: boolean;
  dateTimeValue: ReactNode;
  gymValue: ReactNode;
  exercises: SessionContentExerciseValue<TSet>[];
  emptyExercisesText?: string;
  renderSetRow: (input: {
    exercise: SessionContentExerciseValue<TSet>;
    exerciseIndex: number;
    set: TSet;
    setIndex: number;
  }) => ReactNode;
  renderExerciseHeaderAction?: (input: {
    exercise: SessionContentExerciseValue<TSet>;
    exerciseIndex: number;
  }) => ReactNode;
  renderExerciseFooter?: (input: {
    exercise: SessionContentExerciseValue<TSet>;
    exerciseIndex: number;
  }) => ReactNode;
  renderEmptyState?: (text: string) => ReactNode;
};

export function SessionContentLayout<TSet extends SessionContentSetValue>({
  showMetadataSection = true,
  dateTimeValue,
  gymValue,
  exercises,
  emptyExercisesText = 'No exercises logged yet.',
  renderSetRow,
  renderExerciseHeaderAction,
  renderExerciseFooter,
  renderEmptyState,
}: SessionContentLayoutProps<TSet>) {
  return (
    <>
      {showMetadataSection ? (
        <View style={styles.section}>
          <View style={styles.topRow}>
            <View style={styles.rowField}>
              <Text style={styles.label}>Date and Time</Text>
              {dateTimeValue}
            </View>

            <View style={styles.rowField}>
              <Text style={styles.label}>Gym</Text>
              {gymValue}
            </View>
          </View>
        </View>
      ) : null}

      <View style={styles.exerciseList}>
        {exercises.map((exercise, exerciseIndex) => (
          <View key={exercise.id} style={styles.exerciseCard}>
            <View style={styles.exerciseCardHeader}>
              <View style={styles.exerciseHeaderTextStack}>
                <Text numberOfLines={1} style={styles.exerciseCardTitle}>
                  {exercise.name || `Exercise ${exerciseIndex + 1}`}
                </Text>
                {exercise.machineName?.trim() ? (
                  <Text numberOfLines={1} style={styles.exerciseCardSubtitle}>
                    {exercise.machineName.trim()}
                  </Text>
                ) : null}
              </View>
              {renderExerciseHeaderAction ? renderExerciseHeaderAction({ exercise, exerciseIndex }) : null}
            </View>

            <View style={styles.setList}>
              {exercise.sets.map((set, setIndex) => (
                <Fragment key={set.id}>
                  {renderSetRow({
                    exercise,
                    exerciseIndex,
                    set,
                    setIndex,
                  })}
                </Fragment>
              ))}
            </View>

            {renderExerciseFooter ? renderExerciseFooter({ exercise, exerciseIndex }) : null}
          </View>
        ))}

        {exercises.length === 0
          ? renderEmptyState
            ? renderEmptyState(emptyExercisesText)
            : (
              <Text style={styles.emptyText}>{emptyExercisesText}</Text>
            )
          : null}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
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
    color: '#222222',
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
  exerciseHeaderTextStack: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  exerciseCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#121212',
  },
  exerciseCardSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5a5a5a',
  },
  setList: {
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#555555',
  },
});
