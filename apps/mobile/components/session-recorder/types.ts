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

export type GymModalMode = 'picker' | 'manage' | 'editor';
export type GymEditorReturnMode = 'picker' | 'manage';

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
};

export const SEEDED_LOCATIONS: SessionLocation[] = [
  { id: 'downtown-iron-temple', name: 'Downtown Iron Temple', archived: false },
  { id: 'westside-barbell-club', name: 'Westside Barbell Club', archived: false },
  { id: 'north-end-strength-lab', name: 'North End Strength Lab', archived: false },
];

export const SEEDED_EXERCISES: string[] = [
  'Barbell Squat',
  'Bench Press',
  'Deadlift',
  'Overhead Press',
  'Lat Pulldown',
  'Leg Press',
];
