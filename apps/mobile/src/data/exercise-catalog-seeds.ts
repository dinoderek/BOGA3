import { asc, inArray } from 'drizzle-orm';

import { exerciseDefinitions, exerciseMuscleMappings, muscleGroups } from './schema';
import type { LocalDatabase } from './bootstrap';
import { backfillLegacySessionExerciseReferences } from './session-exercise-reference-backfill';
import { seedSystemExerciseVariationMetadata } from './exercise-variation-seeds';

export type MuscleGroupSeed = {
  id: string;
  displayName: string;
  familyName: string;
  sortOrder: number;
  isEditable: 0;
};

export type SystemExerciseDefinitionSeed = {
  id: string;
  name: string;
};

// M6 seeds intentionally avoid stabilizer tagging to reduce false precision.
export type ExerciseMuscleRole = 'primary' | 'secondary';

export type SystemExerciseMuscleMappingSeed = {
  id: string;
  exerciseDefinitionId: string;
  muscleGroupId: string;
  weight: number;
  role: ExerciseMuscleRole;
};

type SystemExerciseMuscleMappingSeedInput = Omit<SystemExerciseMuscleMappingSeed, 'id'>;

export type SeedSourceReference = {
  id: string;
  title: string;
  url: string;
  type: 'study' | 'reference';
  note: string;
};

export type SeedExerciseDocumentation = {
  exerciseDefinitionId: string;
  sourceReferenceIds: string[];
  rationale: string;
};

export type GranularWeightRationale = {
  exerciseDefinitionId: string;
  muscleGroupId: string;
  weight: number;
  sourceReferenceIds: string[];
  rationale: string;
};

export type SystemExerciseCatalogSeedBundle = {
  muscleGroups: MuscleGroupSeed[];
  exerciseDefinitions: SystemExerciseDefinitionSeed[];
  mappings: SystemExerciseMuscleMappingSeed[];
  sourceReferences: SeedSourceReference[];
  exerciseDocumentation: SeedExerciseDocumentation[];
  granularWeightRationales: GranularWeightRationale[];
};

export const M6_SYSTEM_EXERCISE_SEED_POLICY_NOTE =
  'Mappings are practical logging defaults, not exhaustive anatomy claims. Use obvious prime movers and key synergists with simple non-normalized weights (1.0 / 0.5) only.';

export type SystemExerciseCatalogSeedValidationIssue = {
  code:
    | 'duplicate_muscle_group_id'
    | 'duplicate_exercise_definition_id'
    | 'duplicate_exercise_definition_name'
    | 'duplicate_mapping_pair'
    | 'invalid_mapping_weight'
    | 'invalid_mapping_role'
    | 'unknown_mapping_muscle_group_id'
    | 'unknown_mapping_exercise_definition_id'
    | 'exercise_missing_mapping'
    | 'invalid_muscle_group_is_editable'
    | 'invalid_muscle_group_sort_order'
    | 'duplicate_source_reference_id'
    | 'invalid_source_reference_url'
    | 'duplicate_exercise_documentation'
    | 'missing_exercise_documentation'
    | 'unknown_exercise_documentation_source'
    | 'undocumented_granular_weight'
    | 'duplicate_granular_weight_rationale'
    | 'unknown_granular_weight_rationale_source';
  message: string;
};

const DEFAULT_WEIGHTS = new Set([1, 0.5]);

const createMappingId = (exerciseDefinitionId: string, muscleGroupId: string) =>
  `m6_map__${exerciseDefinitionId}__${muscleGroupId}`;

const createMappingPairKey = (exerciseDefinitionId: string, muscleGroupId: string) =>
  `${exerciseDefinitionId}::${muscleGroupId}`;

const createGranularWeightKey = (exerciseDefinitionId: string, muscleGroupId: string, weight: number) =>
  `${exerciseDefinitionId}::${muscleGroupId}::${weight}`;

export const SYSTEM_MUSCLE_GROUP_SEEDS: MuscleGroupSeed[] = [
  { id: 'chest', displayName: 'Chest', familyName: 'Chest', sortOrder: 0, isEditable: 0 },
  { id: 'delts_front', displayName: 'Front Delts', familyName: 'Shoulders', sortOrder: 1, isEditable: 0 },
  { id: 'delts_lateral', displayName: 'Lateral Delts', familyName: 'Shoulders', sortOrder: 2, isEditable: 0 },
  { id: 'delts_rear', displayName: 'Rear Delts', familyName: 'Shoulders', sortOrder: 3, isEditable: 0 },
  { id: 'back_lats', displayName: 'Lats', familyName: 'Back', sortOrder: 4, isEditable: 0 },
  {
    id: 'back_upper',
    displayName: 'Upper Back (Rhomboids + Mid Traps)',
    familyName: 'Back',
    sortOrder: 5,
    isEditable: 0,
  },
  { id: 'traps_upper', displayName: 'Upper Traps', familyName: 'Back', sortOrder: 6, isEditable: 0 },
  { id: 'spinal_erectors', displayName: 'Spinal Erectors', familyName: 'Back', sortOrder: 7, isEditable: 0 },
  { id: 'biceps', displayName: 'Biceps', familyName: 'Arms', sortOrder: 8, isEditable: 0 },
  { id: 'triceps', displayName: 'Triceps', familyName: 'Arms', sortOrder: 9, isEditable: 0 },
  { id: 'forearms_grip', displayName: 'Forearms / Grip', familyName: 'Arms', sortOrder: 10, isEditable: 0 },
  { id: 'abs_rectus', displayName: 'Abs (Rectus Abdominis)', familyName: 'Core', sortOrder: 11, isEditable: 0 },
  { id: 'abs_obliques', displayName: 'Obliques', familyName: 'Core', sortOrder: 12, isEditable: 0 },
  { id: 'quads', displayName: 'Quads', familyName: 'Legs', sortOrder: 13, isEditable: 0 },
  { id: 'hamstrings', displayName: 'Hamstrings', familyName: 'Legs', sortOrder: 14, isEditable: 0 },
  { id: 'glutes_max', displayName: 'Glute Max', familyName: 'Legs', sortOrder: 15, isEditable: 0 },
  { id: 'hip_abductors', displayName: 'Hip Abductors (Glute Med/Min)', familyName: 'Legs', sortOrder: 16, isEditable: 0 },
  { id: 'adductors', displayName: 'Adductors', familyName: 'Legs', sortOrder: 17, isEditable: 0 },
  { id: 'calves', displayName: 'Calves', familyName: 'Lower Legs', sortOrder: 18, isEditable: 0 },
];

export const SYSTEM_EXERCISE_DEFINITION_SEEDS: SystemExerciseDefinitionSeed[] = [
  { id: 'sys_barbell_bench_press', name: 'Barbell Bench Press' },
  { id: 'sys_incline_dumbbell_press', name: 'Incline Dumbbell Press' },
  { id: 'sys_seated_dumbbell_overhead_press', name: 'Seated Dumbbell Overhead Press' },
  { id: 'sys_dumbbell_lateral_raise', name: 'Dumbbell Lateral Raise' },
  { id: 'sys_lat_pulldown', name: 'Lat Pulldown' },
  { id: 'sys_seated_cable_row', name: 'Seated Cable Row' },
  { id: 'sys_barbell_back_squat', name: 'Barbell Back Squat' },
  { id: 'sys_romanian_deadlift', name: 'Romanian Deadlift' },
  { id: 'sys_leg_extension', name: 'Leg Extension' },
  { id: 'sys_seated_leg_curl', name: 'Seated Leg Curl' },
  { id: 'sys_barbell_hip_thrust', name: 'Barbell Hip Thrust' },
  { id: 'sys_standing_calf_raise', name: 'Standing Calf Raise' },
  { id: 'sys_dumbbell_biceps_curl', name: 'Dumbbell Biceps Curl' },
  { id: 'sys_cable_crunch', name: 'Cable Crunch' },
];

const SYSTEM_EXERCISE_MUSCLE_MAPPING_INPUTS: SystemExerciseMuscleMappingSeedInput[] = [
  { exerciseDefinitionId: 'sys_barbell_bench_press', muscleGroupId: 'chest', weight: 1, role: 'primary' },
  { exerciseDefinitionId: 'sys_barbell_bench_press', muscleGroupId: 'delts_front', weight: 0.5, role: 'secondary' },
  { exerciseDefinitionId: 'sys_barbell_bench_press', muscleGroupId: 'triceps', weight: 0.5, role: 'secondary' },

  { exerciseDefinitionId: 'sys_incline_dumbbell_press', muscleGroupId: 'chest', weight: 1, role: 'primary' },
  { exerciseDefinitionId: 'sys_incline_dumbbell_press', muscleGroupId: 'delts_front', weight: 0.5, role: 'secondary' },
  { exerciseDefinitionId: 'sys_incline_dumbbell_press', muscleGroupId: 'triceps', weight: 0.5, role: 'secondary' },

  {
    exerciseDefinitionId: 'sys_seated_dumbbell_overhead_press',
    muscleGroupId: 'delts_front',
    weight: 1,
    role: 'primary',
  },
  {
    exerciseDefinitionId: 'sys_seated_dumbbell_overhead_press',
    muscleGroupId: 'delts_lateral',
    weight: 0.5,
    role: 'secondary',
  },
  {
    exerciseDefinitionId: 'sys_seated_dumbbell_overhead_press',
    muscleGroupId: 'triceps',
    weight: 0.5,
    role: 'secondary',
  },

  { exerciseDefinitionId: 'sys_dumbbell_lateral_raise', muscleGroupId: 'delts_lateral', weight: 1, role: 'primary' },

  { exerciseDefinitionId: 'sys_lat_pulldown', muscleGroupId: 'back_lats', weight: 1, role: 'primary' },
  { exerciseDefinitionId: 'sys_lat_pulldown', muscleGroupId: 'back_upper', weight: 0.5, role: 'secondary' },
  { exerciseDefinitionId: 'sys_lat_pulldown', muscleGroupId: 'biceps', weight: 0.5, role: 'secondary' },

  { exerciseDefinitionId: 'sys_seated_cable_row', muscleGroupId: 'back_upper', weight: 1, role: 'primary' },
  { exerciseDefinitionId: 'sys_seated_cable_row', muscleGroupId: 'back_lats', weight: 0.5, role: 'secondary' },
  { exerciseDefinitionId: 'sys_seated_cable_row', muscleGroupId: 'delts_rear', weight: 0.5, role: 'secondary' },
  { exerciseDefinitionId: 'sys_seated_cable_row', muscleGroupId: 'biceps', weight: 0.5, role: 'secondary' },

  { exerciseDefinitionId: 'sys_barbell_back_squat', muscleGroupId: 'quads', weight: 1, role: 'primary' },
  { exerciseDefinitionId: 'sys_barbell_back_squat', muscleGroupId: 'glutes_max', weight: 0.5, role: 'secondary' },
  { exerciseDefinitionId: 'sys_barbell_back_squat', muscleGroupId: 'adductors', weight: 0.5, role: 'secondary' },
  { exerciseDefinitionId: 'sys_barbell_back_squat', muscleGroupId: 'spinal_erectors', weight: 0.5, role: 'secondary' },

  { exerciseDefinitionId: 'sys_romanian_deadlift', muscleGroupId: 'hamstrings', weight: 1, role: 'primary' },
  { exerciseDefinitionId: 'sys_romanian_deadlift', muscleGroupId: 'glutes_max', weight: 1, role: 'primary' },
  { exerciseDefinitionId: 'sys_romanian_deadlift', muscleGroupId: 'spinal_erectors', weight: 0.5, role: 'secondary' },

  { exerciseDefinitionId: 'sys_leg_extension', muscleGroupId: 'quads', weight: 1, role: 'primary' },

  { exerciseDefinitionId: 'sys_seated_leg_curl', muscleGroupId: 'hamstrings', weight: 1, role: 'primary' },

  { exerciseDefinitionId: 'sys_barbell_hip_thrust', muscleGroupId: 'glutes_max', weight: 1, role: 'primary' },
  { exerciseDefinitionId: 'sys_barbell_hip_thrust', muscleGroupId: 'hamstrings', weight: 0.5, role: 'secondary' },
  { exerciseDefinitionId: 'sys_barbell_hip_thrust', muscleGroupId: 'hip_abductors', weight: 0.5, role: 'secondary' },

  { exerciseDefinitionId: 'sys_standing_calf_raise', muscleGroupId: 'calves', weight: 1, role: 'primary' },

  { exerciseDefinitionId: 'sys_dumbbell_biceps_curl', muscleGroupId: 'biceps', weight: 1, role: 'primary' },
  { exerciseDefinitionId: 'sys_dumbbell_biceps_curl', muscleGroupId: 'forearms_grip', weight: 0.5, role: 'secondary' },

  { exerciseDefinitionId: 'sys_cable_crunch', muscleGroupId: 'abs_rectus', weight: 1, role: 'primary' },
  { exerciseDefinitionId: 'sys_cable_crunch', muscleGroupId: 'abs_obliques', weight: 0.5, role: 'secondary' },
];

export const SYSTEM_EXERCISE_MUSCLE_MAPPING_SEEDS: SystemExerciseMuscleMappingSeed[] =
  SYSTEM_EXERCISE_MUSCLE_MAPPING_INPUTS.map((mapping) => ({
    ...mapping,
    id: createMappingId(mapping.exerciseDefinitionId, mapping.muscleGroupId),
  }));

export const SYSTEM_EXERCISE_CATALOG_SOURCE_REFERENCES: SeedSourceReference[] = [
  {
    id: 'exrx-resistance-exercise-directory',
    type: 'reference',
    title: 'ExRx.net Weight Training Exercise Directory',
    url: 'https://exrx.net/Lists/Directory',
    note: 'Practical exercise anatomy reference used to sanity-check primary and common synergist muscle involvement.',
  },
  {
    id: 'schoenfeld-hypertrophy-mechanisms-2010',
    type: 'study',
    title: 'Schoenfeld (2010) The mechanisms of muscle hypertrophy and their application to resistance training',
    url: 'https://pubmed.ncbi.nlm.nih.gov/20847704/',
    note: 'High-level hypertrophy context; supports treating contribution weights as heuristic relative stimulus proxies rather than exact percentages.',
  },
  {
    id: 'vigotsky-emg-interpretation-2018',
    type: 'study',
    title: 'Vigotsky et al. (2018) Interpreting signal amplitudes in surface electromyography studies in sport and rehabilitation sciences',
    url: 'https://pubmed.ncbi.nlm.nih.gov/29383889/',
    note: 'Used to justify avoiding direct EMG-to-% stimulus normalization and keeping a simple non-normalized weighting convention.',
  },
  {
    id: 'escamilla-squat-biomechanics-2001',
    type: 'study',
    title: 'Escamilla (2001) Knee biomechanics of the dynamic squat exercise',
    url: 'https://pubmed.ncbi.nlm.nih.gov/11394622/',
    note: 'Supports squat lower-body muscle involvement assumptions used in the initial squat mapping.',
  },
  {
    id: 'escamilla-deadlift-sumo-conventional-2002',
    type: 'study',
    title: 'Escamilla et al. (2002) A three-dimensional biomechanical analysis of sumo and conventional style deadlifts',
    url: 'https://pubmed.ncbi.nlm.nih.gov/11991778/',
    note: 'Supports posterior-chain emphasis assumptions applied to Romanian deadlift-style hinge mappings.',
  },
  {
    id: 'contreras-hip-thrust-emg-2015',
    type: 'study',
    title: 'Contreras et al. (2015) A comparison of gluteus maximus, biceps femoris, and vastus lateralis EMG amplitude in the back squat and barbell hip thrust',
    url: 'https://pubmed.ncbi.nlm.nih.gov/25774600/',
    note: 'Supports glute-max primary emphasis and hamstring secondary emphasis in hip thrust mapping.',
  },
];

export const SYSTEM_EXERCISE_SEED_DOCUMENTATION: SeedExerciseDocumentation[] = [
  {
    exerciseDefinitionId: 'sys_barbell_bench_press',
    sourceReferenceIds: ['exrx-resistance-exercise-directory'],
    rationale: 'Bench press is seeded as chest-primary with front-delt/triceps secondary contributions using the default 1.0/0.5 ladder.',
  },
  {
    exerciseDefinitionId: 'sys_incline_dumbbell_press',
    sourceReferenceIds: ['exrx-resistance-exercise-directory'],
    rationale:
      'Incline dumbbell press is mapped to the same chest bucket as flat pressing to avoid false precision about chest sub-region emphasis in the initial system catalog.',
  },
  {
    exerciseDefinitionId: 'sys_seated_dumbbell_overhead_press',
    sourceReferenceIds: ['exrx-resistance-exercise-directory'],
    rationale: 'Overhead pressing is seeded with front delts primary and lateral delts/triceps as common secondary contributors.',
  },
  {
    exerciseDefinitionId: 'sys_dumbbell_lateral_raise',
    sourceReferenceIds: ['exrx-resistance-exercise-directory'],
    rationale: 'Lateral raise is mapped to lateral delts only in M6 to keep the starter catalog focused on clear primary-target logging defaults.',
  },
  {
    exerciseDefinitionId: 'sys_lat_pulldown',
    sourceReferenceIds: ['exrx-resistance-exercise-directory'],
    rationale: 'Pulldown is lats-primary with upper back and biceps as secondary contributors; grip support is intentionally omitted in M6 seed defaults.',
  },
  {
    exerciseDefinitionId: 'sys_seated_cable_row',
    sourceReferenceIds: ['exrx-resistance-exercise-directory'],
    rationale: 'Cable row is upper-back-primary with lats/rear delts/biceps as secondary contributors; grip support is intentionally omitted in M6 seed defaults.',
  },
  {
    exerciseDefinitionId: 'sys_barbell_back_squat',
    sourceReferenceIds: ['exrx-resistance-exercise-directory', 'escamilla-squat-biomechanics-2001'],
    rationale:
      'Back squat starts with quads primary plus glutes/adductors/erectors secondary, while bracing musculature is intentionally omitted to reduce false precision in M6 defaults.',
  },
  {
    exerciseDefinitionId: 'sys_romanian_deadlift',
    sourceReferenceIds: ['exrx-resistance-exercise-directory', 'escamilla-deadlift-sumo-conventional-2002'],
    rationale: 'RDL is seeded as hamstrings and glute-max primary co-drivers with spinal erectors secondary; grip support is intentionally omitted in M6 defaults.',
  },
  {
    exerciseDefinitionId: 'sys_leg_extension',
    sourceReferenceIds: ['exrx-resistance-exercise-directory'],
    rationale: 'Leg extension is mapped to quads only for a simple single-target machine pattern.',
  },
  {
    exerciseDefinitionId: 'sys_seated_leg_curl',
    sourceReferenceIds: ['exrx-resistance-exercise-directory'],
    rationale: 'Seated leg curl is mapped to hamstrings only for a simple single-target machine pattern.',
  },
  {
    exerciseDefinitionId: 'sys_barbell_hip_thrust',
    sourceReferenceIds: ['exrx-resistance-exercise-directory', 'contreras-hip-thrust-emg-2015'],
    rationale: 'Hip thrust is glute-max primary with hamstrings and hip abductors secondary using the default weight ladder.',
  },
  {
    exerciseDefinitionId: 'sys_standing_calf_raise',
    sourceReferenceIds: ['exrx-resistance-exercise-directory'],
    rationale: 'Standing calf raise is mapped to calves only for a simple single-target machine/free-standing pattern.',
  },
  {
    exerciseDefinitionId: 'sys_dumbbell_biceps_curl',
    sourceReferenceIds: ['exrx-resistance-exercise-directory'],
    rationale: 'Biceps curl is biceps-primary with grip/forearm secondary.',
  },
  {
    exerciseDefinitionId: 'sys_cable_crunch',
    sourceReferenceIds: ['exrx-resistance-exercise-directory'],
    rationale: 'Cable crunch is abs-primary with obliques secondary.',
  },
];

export const SYSTEM_EXERCISE_GRANULAR_WEIGHT_RATIONALES: GranularWeightRationale[] = [];

export const SYSTEM_EXERCISE_CATALOG_SEED_BUNDLE: SystemExerciseCatalogSeedBundle = {
  muscleGroups: SYSTEM_MUSCLE_GROUP_SEEDS,
  exerciseDefinitions: SYSTEM_EXERCISE_DEFINITION_SEEDS,
  mappings: SYSTEM_EXERCISE_MUSCLE_MAPPING_SEEDS,
  sourceReferences: SYSTEM_EXERCISE_CATALOG_SOURCE_REFERENCES,
  exerciseDocumentation: SYSTEM_EXERCISE_SEED_DOCUMENTATION,
  granularWeightRationales: SYSTEM_EXERCISE_GRANULAR_WEIGHT_RATIONALES,
};

export type SystemExerciseCatalogSeedSummary = {
  muscleGroupCount: number;
  exerciseCount: number;
  mappingCount: number;
  defaultWeightPolicy: 'non-normalized (default ladder: 1.0 primary / 0.5 secondary)';
  familyCounts: { familyName: string; count: number }[];
  exerciseSummaries: {
    id: string;
    name: string;
    mappingCount: number;
    primaryMuscleIds: string[];
  }[];
  sourceReferences: Pick<SeedSourceReference, 'id' | 'title' | 'url' | 'type'>[];
};

const buildSeedSummary = (bundle: SystemExerciseCatalogSeedBundle): SystemExerciseCatalogSeedSummary => {
  const familyCounts = new Map<string, number>();

  for (const muscleGroup of bundle.muscleGroups) {
    familyCounts.set(muscleGroup.familyName, (familyCounts.get(muscleGroup.familyName) ?? 0) + 1);
  }

  const mappingsByExerciseId = new Map<string, SystemExerciseMuscleMappingSeed[]>();

  for (const mapping of bundle.mappings) {
    const existing = mappingsByExerciseId.get(mapping.exerciseDefinitionId);
    if (existing) {
      existing.push(mapping);
      continue;
    }

    mappingsByExerciseId.set(mapping.exerciseDefinitionId, [mapping]);
  }

  return {
    muscleGroupCount: bundle.muscleGroups.length,
    exerciseCount: bundle.exerciseDefinitions.length,
    mappingCount: bundle.mappings.length,
    defaultWeightPolicy: 'non-normalized (default ladder: 1.0 primary / 0.5 secondary)',
    familyCounts: [...familyCounts.entries()]
      .map(([familyName, count]) => ({ familyName, count }))
      .sort((a, b) => a.familyName.localeCompare(b.familyName)),
    exerciseSummaries: bundle.exerciseDefinitions.map((exercise) => {
      const mappings = mappingsByExerciseId.get(exercise.id) ?? [];

      return {
        id: exercise.id,
        name: exercise.name,
        mappingCount: mappings.length,
        primaryMuscleIds: mappings.filter((mapping) => mapping.role === 'primary').map((mapping) => mapping.muscleGroupId),
      };
    }),
    sourceReferences: bundle.sourceReferences.map(({ id, title, url, type }) => ({ id, title, url, type })),
  };
};

export const getSystemExerciseCatalogSeedSummary = (): SystemExerciseCatalogSeedSummary =>
  buildSeedSummary(SYSTEM_EXERCISE_CATALOG_SEED_BUNDLE);

export const validateSystemExerciseCatalogSeeds = (
  bundle: SystemExerciseCatalogSeedBundle = SYSTEM_EXERCISE_CATALOG_SEED_BUNDLE
): SystemExerciseCatalogSeedValidationIssue[] => {
  const issues: SystemExerciseCatalogSeedValidationIssue[] = [];

  const muscleIds = new Set<string>();
  for (const muscleGroup of bundle.muscleGroups) {
    if (muscleIds.has(muscleGroup.id)) {
      issues.push({
        code: 'duplicate_muscle_group_id',
        message: `Duplicate muscle group id: ${muscleGroup.id}`,
      });
    }
    muscleIds.add(muscleGroup.id);

    if (muscleGroup.isEditable !== 0) {
      issues.push({
        code: 'invalid_muscle_group_is_editable',
        message: `Muscle group ${muscleGroup.id} must be non-editable (isEditable=0) in M6 seeds`,
      });
    }

    if (!Number.isInteger(muscleGroup.sortOrder) || muscleGroup.sortOrder < 0) {
      issues.push({
        code: 'invalid_muscle_group_sort_order',
        message: `Muscle group ${muscleGroup.id} has invalid sortOrder ${muscleGroup.sortOrder}`,
      });
    }
  }

  const exerciseIds = new Set<string>();
  const exerciseNames = new Set<string>();
  for (const exercise of bundle.exerciseDefinitions) {
    if (exerciseIds.has(exercise.id)) {
      issues.push({
        code: 'duplicate_exercise_definition_id',
        message: `Duplicate exercise definition id: ${exercise.id}`,
      });
    }
    exerciseIds.add(exercise.id);

    const normalizedName = exercise.name.trim().toLowerCase();
    if (exerciseNames.has(normalizedName)) {
      issues.push({
        code: 'duplicate_exercise_definition_name',
        message: `Duplicate exercise definition name (case-insensitive): ${exercise.name}`,
      });
    }
    exerciseNames.add(normalizedName);
  }

  const sourceReferenceIds = new Set<string>();
  for (const source of bundle.sourceReferences) {
    if (sourceReferenceIds.has(source.id)) {
      issues.push({
        code: 'duplicate_source_reference_id',
        message: `Duplicate source reference id: ${source.id}`,
      });
    }
    sourceReferenceIds.add(source.id);

    if (!source.url.startsWith('http://') && !source.url.startsWith('https://')) {
      issues.push({
        code: 'invalid_source_reference_url',
        message: `Source reference ${source.id} must have an absolute http(s) URL`,
      });
    }
  }

  const exerciseDocumentationById = new Map<string, SeedExerciseDocumentation>();
  for (const documentation of bundle.exerciseDocumentation) {
    if (exerciseDocumentationById.has(documentation.exerciseDefinitionId)) {
      issues.push({
        code: 'duplicate_exercise_documentation',
        message: `Duplicate exercise documentation entry for ${documentation.exerciseDefinitionId}`,
      });
    }
    exerciseDocumentationById.set(documentation.exerciseDefinitionId, documentation);

    for (const sourceReferenceId of documentation.sourceReferenceIds) {
      if (!sourceReferenceIds.has(sourceReferenceId)) {
        issues.push({
          code: 'unknown_exercise_documentation_source',
          message: `Exercise documentation for ${documentation.exerciseDefinitionId} references unknown source ${sourceReferenceId}`,
        });
      }
    }
  }

  for (const exercise of bundle.exerciseDefinitions) {
    if (!exerciseDocumentationById.has(exercise.id)) {
      issues.push({
        code: 'missing_exercise_documentation',
        message: `Missing exercise documentation for ${exercise.id}`,
      });
    }
  }

  const granularWeightRationaleKeys = new Set<string>();
  for (const rationale of bundle.granularWeightRationales) {
    const key = createGranularWeightKey(rationale.exerciseDefinitionId, rationale.muscleGroupId, rationale.weight);
    if (granularWeightRationaleKeys.has(key)) {
      issues.push({
        code: 'duplicate_granular_weight_rationale',
        message: `Duplicate granular weight rationale for ${key}`,
      });
    }
    granularWeightRationaleKeys.add(key);

    for (const sourceReferenceId of rationale.sourceReferenceIds) {
      if (!sourceReferenceIds.has(sourceReferenceId)) {
        issues.push({
          code: 'unknown_granular_weight_rationale_source',
          message: `Granular weight rationale for ${key} references unknown source ${sourceReferenceId}`,
        });
      }
    }
  }

  const mappingPairs = new Set<string>();
  const mappedExerciseIds = new Set<string>();

  for (const mapping of bundle.mappings) {
    const pairKey = createMappingPairKey(mapping.exerciseDefinitionId, mapping.muscleGroupId);
    if (mappingPairs.has(pairKey)) {
      issues.push({
        code: 'duplicate_mapping_pair',
        message: `Duplicate mapping pair: ${pairKey}`,
      });
    }
    mappingPairs.add(pairKey);

    if (!exerciseIds.has(mapping.exerciseDefinitionId)) {
      issues.push({
        code: 'unknown_mapping_exercise_definition_id',
        message: `Mapping references unknown exerciseDefinitionId: ${mapping.exerciseDefinitionId}`,
      });
    } else {
      mappedExerciseIds.add(mapping.exerciseDefinitionId);
    }

    if (!muscleIds.has(mapping.muscleGroupId)) {
      issues.push({
        code: 'unknown_mapping_muscle_group_id',
        message: `Mapping references unknown muscleGroupId: ${mapping.muscleGroupId}`,
      });
    }

    if (!Number.isFinite(mapping.weight) || mapping.weight <= 0) {
      issues.push({
        code: 'invalid_mapping_weight',
        message: `Mapping ${pairKey} has invalid weight ${mapping.weight}`,
      });
    }

    if (!['primary', 'secondary'].includes(mapping.role)) {
      issues.push({
        code: 'invalid_mapping_role',
        message: `Mapping ${pairKey} has invalid role ${mapping.role}; M6 seeds allow only primary|secondary`,
      });
    }

    if (!DEFAULT_WEIGHTS.has(mapping.weight)) {
      const granularKey = createGranularWeightKey(mapping.exerciseDefinitionId, mapping.muscleGroupId, mapping.weight);
      if (!granularWeightRationaleKeys.has(granularKey)) {
        issues.push({
          code: 'undocumented_granular_weight',
          message: `Mapping ${pairKey} uses non-default weight ${mapping.weight} without a granular rationale`,
        });
      }
    }
  }

  for (const exercise of bundle.exerciseDefinitions) {
    if (!mappedExerciseIds.has(exercise.id)) {
      issues.push({
        code: 'exercise_missing_mapping',
        message: `Exercise ${exercise.id} has no muscle mappings`,
      });
    }
  }

  return issues;
};

export const assertValidSystemExerciseCatalogSeeds = (
  bundle: SystemExerciseCatalogSeedBundle = SYSTEM_EXERCISE_CATALOG_SEED_BUNDLE
) => {
  const issues = validateSystemExerciseCatalogSeeds(bundle);

  if (issues.length === 0) {
    return;
  }

  throw new Error(
    `Invalid M6 system exercise catalog seeds (${issues.length} issue${issues.length === 1 ? '' : 's'}): ${issues
      .map((issue) => issue.message)
      .join(' | ')}`
  );
};

export type SystemExerciseCatalogSeedVerifyResult = {
  muscleGroupCount: number;
  exerciseCount: number;
  mappingCount: number;
  exercisesMissingMappings: string[];
};

export const verifySeededSystemExerciseCatalog = (database: LocalDatabase): SystemExerciseCatalogSeedVerifyResult => {
  const seedExerciseIds = SYSTEM_EXERCISE_DEFINITION_SEEDS.map((exercise) => exercise.id);
  const seedMuscleIds = SYSTEM_MUSCLE_GROUP_SEEDS.map((muscleGroup) => muscleGroup.id);

  const seededMuscleRows = database
    .select({ id: muscleGroups.id })
    .from(muscleGroups)
    .where(inArray(muscleGroups.id, seedMuscleIds))
    .all();

  const seededExerciseRows = database
    .select({ id: exerciseDefinitions.id })
    .from(exerciseDefinitions)
    .where(inArray(exerciseDefinitions.id, seedExerciseIds))
    .all();

  const seededMappingRows = database
    .select({
      exerciseDefinitionId: exerciseMuscleMappings.exerciseDefinitionId,
      muscleGroupId: exerciseMuscleMappings.muscleGroupId,
    })
    .from(exerciseMuscleMappings)
    .where(inArray(exerciseMuscleMappings.exerciseDefinitionId, seedExerciseIds))
    .all();

  const mappedExerciseIds = new Set(seededMappingRows.map((row) => row.exerciseDefinitionId));
  const exercisesMissingMappings = seedExerciseIds.filter((exerciseId) => !mappedExerciseIds.has(exerciseId));

  return {
    muscleGroupCount: seededMuscleRows.length,
    exerciseCount: seededExerciseRows.length,
    mappingCount: seededMappingRows.length,
    exercisesMissingMappings,
  };
};

export const seedSystemExerciseCatalog = (database: LocalDatabase, now: Date = new Date()) => {
  assertValidSystemExerciseCatalogSeeds();

  database.transaction((tx) => {
    for (const muscleGroup of SYSTEM_MUSCLE_GROUP_SEEDS) {
      tx.insert(muscleGroups)
        .values({
          ...muscleGroup,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: muscleGroups.id,
          set: {
            displayName: muscleGroup.displayName,
            familyName: muscleGroup.familyName,
            sortOrder: muscleGroup.sortOrder,
            isEditable: 0,
            updatedAt: now,
          },
        })
        .run();
    }

    for (const exerciseDefinition of SYSTEM_EXERCISE_DEFINITION_SEEDS) {
      tx.insert(exerciseDefinitions)
        .values({
          ...exerciseDefinition,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: exerciseDefinitions.id,
          set: {
            name: exerciseDefinition.name,
            updatedAt: now,
          },
        })
        .run();
    }

    for (const mapping of SYSTEM_EXERCISE_MUSCLE_MAPPING_SEEDS) {
      tx.insert(exerciseMuscleMappings)
        .values({
          ...mapping,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: [exerciseMuscleMappings.exerciseDefinitionId, exerciseMuscleMappings.muscleGroupId],
          set: {
            weight: mapping.weight,
            role: mapping.role,
            updatedAt: now,
          },
        })
        .run();
    }
  });

  seedSystemExerciseVariationMetadata(database, now);
  backfillLegacySessionExerciseReferences(database, now);

  const verification = verifySeededSystemExerciseCatalog(database);

  if (verification.muscleGroupCount !== SYSTEM_MUSCLE_GROUP_SEEDS.length) {
    throw new Error(
      `System exercise catalog seed verification failed: expected ${SYSTEM_MUSCLE_GROUP_SEEDS.length} muscle groups, found ${verification.muscleGroupCount}`
    );
  }

  if (verification.exerciseCount !== SYSTEM_EXERCISE_DEFINITION_SEEDS.length) {
    throw new Error(
      `System exercise catalog seed verification failed: expected ${SYSTEM_EXERCISE_DEFINITION_SEEDS.length} exercises, found ${verification.exerciseCount}`
    );
  }

  if (verification.mappingCount !== SYSTEM_EXERCISE_MUSCLE_MAPPING_SEEDS.length) {
    throw new Error(
      `System exercise catalog seed verification failed: expected ${SYSTEM_EXERCISE_MUSCLE_MAPPING_SEEDS.length} mappings, found ${verification.mappingCount}`
    );
  }

  if (verification.exercisesMissingMappings.length > 0) {
    throw new Error(
      `System exercise catalog seed verification failed: exercises missing mappings: ${verification.exercisesMissingMappings.join(', ')}`
    );
  }
};

export type SeededSystemMuscleGroupRecord = {
  id: string;
  displayName: string;
  familyName: string;
  sortOrder: number;
};

export const listSeededMuscleGroups = async (database: LocalDatabase): Promise<SeededSystemMuscleGroupRecord[]> => {
  const seedMuscleIds = SYSTEM_MUSCLE_GROUP_SEEDS.map((muscleGroup) => muscleGroup.id);

  return database
    .select({
      id: muscleGroups.id,
      displayName: muscleGroups.displayName,
      familyName: muscleGroups.familyName,
      sortOrder: muscleGroups.sortOrder,
    })
    .from(muscleGroups)
    .where(inArray(muscleGroups.id, seedMuscleIds))
    .orderBy(asc(muscleGroups.sortOrder), asc(muscleGroups.displayName))
    .all();
};

export type SeededExerciseMappingRecord = {
  muscleGroupId: string;
  weight: number;
  // Schema allows `stabilizer` even though M6 seed fixtures intentionally do not use it.
  role: 'primary' | 'secondary' | 'stabilizer' | null;
};

export type SeededExerciseDefinitionRecord = {
  id: string;
  name: string;
  mappings: SeededExerciseMappingRecord[];
};

export const listSeededExerciseDefinitionsWithMappings = async (
  database: LocalDatabase
): Promise<SeededExerciseDefinitionRecord[]> => {
  const seedExerciseIds = SYSTEM_EXERCISE_DEFINITION_SEEDS.map((exercise) => exercise.id);

  const exercises = database
    .select({
      id: exerciseDefinitions.id,
      name: exerciseDefinitions.name,
    })
    .from(exerciseDefinitions)
    .where(inArray(exerciseDefinitions.id, seedExerciseIds))
    .orderBy(asc(exerciseDefinitions.name))
    .all();

  const mappings = database
    .select({
      exerciseDefinitionId: exerciseMuscleMappings.exerciseDefinitionId,
      muscleGroupId: exerciseMuscleMappings.muscleGroupId,
      weight: exerciseMuscleMappings.weight,
      role: exerciseMuscleMappings.role,
    })
    .from(exerciseMuscleMappings)
    .where(inArray(exerciseMuscleMappings.exerciseDefinitionId, seedExerciseIds))
    .orderBy(asc(exerciseMuscleMappings.exerciseDefinitionId), asc(exerciseMuscleMappings.muscleGroupId))
    .all();

  return exercises.map((exercise) => ({
    ...exercise,
    mappings: mappings
      .filter((mapping) => mapping.exerciseDefinitionId === exercise.id)
      .map(({ exerciseDefinitionId: _exerciseDefinitionId, ...mapping }) => mapping),
  }));
};

export const getSeededExerciseMapping = (exerciseDefinitionId: string, muscleGroupId: string) =>
  SYSTEM_EXERCISE_MUSCLE_MAPPING_SEEDS.find(
    (mapping) => mapping.exerciseDefinitionId === exerciseDefinitionId && mapping.muscleGroupId === muscleGroupId
  ) ?? null;

export const hasSeededExerciseDefinition = (exerciseDefinitionId: string) =>
  SYSTEM_EXERCISE_DEFINITION_SEEDS.some((exercise) => exercise.id === exerciseDefinitionId);
