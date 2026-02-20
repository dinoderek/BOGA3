export type SessionSet = {
  id: string;
  reps: string;
  weight: string;
};

export type SessionExercise = {
  id: string;
  name: string;
  machineName: string;
  sets: SessionSet[];
};

export type Session = {
  dateTime: string;
  locationId: string | null;
  exercises: SessionExercise[];
};

export type SessionLocation = {
  id: string;
  name: string;
  archived: boolean;
};

export type SessionExercisePreset = {
  id: string;
  name: string;
  archived: boolean;
};

export type GymModalMode = 'picker' | 'manage' | 'editor';
export type GymEditorReturnMode = 'picker' | 'manage';
export type ExerciseModalMode = 'picker' | 'manage' | 'editor';
export type ExerciseEditorReturnMode = 'picker' | 'manage';

export type SessionRecorderState = {
  session: Session;
  locations: SessionLocation[];
  pendingLocationName: string;
  gymPickerVisible: boolean;
  gymModalMode: GymModalMode;
  editorReturnMode: GymEditorReturnMode;
  showArchivedInManager: boolean;
  editingLocationId: string | null;
  editingLocationName: string;
  exercisePickerVisible: boolean;
  exerciseModalMode: ExerciseModalMode;
  exerciseEditorReturnMode: ExerciseEditorReturnMode;
  exercisePresets: SessionExercisePreset[];
  pendingExerciseName: string;
  showArchivedExercisesInManager: boolean;
  editingExerciseId: string | null;
  editingExerciseName: string;
  exerciseSelectionTargetId: string | null;
  exerciseActionMenuVisible: boolean;
  activeExerciseActionId: string | null;
};

export const SEEDED_LOCATIONS: SessionLocation[] = [
  { id: 'downtown-iron-temple', name: 'Downtown Iron Temple', archived: false },
  { id: 'westside-barbell-club', name: 'Westside Barbell Club', archived: false },
  { id: 'north-end-strength-lab', name: 'North End Strength Lab', archived: false },
];

export const SEEDED_EXERCISES: SessionExercisePreset[] = [
  { id: 'barbell-squat', name: 'Barbell Squat', archived: false },
  { id: 'bench-press', name: 'Bench Press', archived: false },
  { id: 'deadlift', name: 'Deadlift', archived: false },
  { id: 'overhead-press', name: 'Overhead Press', archived: false },
  { id: 'lat-pulldown', name: 'Lat Pulldown', archived: false },
  { id: 'leg-press', name: 'Leg Press', archived: false },
];
