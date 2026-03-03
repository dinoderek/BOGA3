import {
  planSessionExerciseReferenceResolution,
  resolveExerciseDefinitionNameMatch,
} from '@/src/data/session-exercise-reference-backfill';

describe('session exercise reference backfill helpers', () => {
  const definitions = [
    { id: 'exercise-1', name: 'Bench Press' },
    { id: 'exercise-2', name: 'Lat Pulldown' },
  ];

  it('matches exercise definitions by normalized unique name', () => {
    expect(resolveExerciseDefinitionNameMatch('  bench press  ', definitions)).toEqual(definitions[0]);
    expect(resolveExerciseDefinitionNameMatch('Unknown Exercise', definitions)).toBeNull();
  });

  it('plans machine-variation creation only for deterministically resolved legacy rows', () => {
    expect(
      planSessionExerciseReferenceResolution({
        name: 'Bench Press',
        machineName: ' Cable ',
        exerciseDefinitionsToSearch: definitions,
      })
    ).toEqual({
      exerciseDefinitionId: 'exercise-1',
      exerciseVariationId: null,
      normalizedMachineName: 'Cable',
      shouldCreateMachineVariation: true,
    });

    expect(
      planSessionExerciseReferenceResolution({
        name: 'Unknown Exercise',
        machineName: 'Cable',
        exerciseDefinitionsToSearch: definitions,
      })
    ).toEqual({
      exerciseDefinitionId: null,
      exerciseVariationId: null,
      normalizedMachineName: 'Cable',
      shouldCreateMachineVariation: false,
    });
  });

  it('reuses provided variation references and rejects mismatched exercise IDs', () => {
    expect(
      planSessionExerciseReferenceResolution({
        name: 'Bench Press',
        machineName: 'Cable',
        exerciseVariationId: 'variation-1',
        resolvedVariationExerciseDefinitionId: 'exercise-1',
        exerciseDefinitionsToSearch: definitions,
      })
    ).toEqual({
      exerciseDefinitionId: 'exercise-1',
      exerciseVariationId: 'variation-1',
      normalizedMachineName: 'Cable',
      shouldCreateMachineVariation: false,
    });

    expect(() =>
      planSessionExerciseReferenceResolution({
        name: 'Bench Press',
        exerciseDefinitionId: 'exercise-2',
        exerciseVariationId: 'variation-1',
        resolvedVariationExerciseDefinitionId: 'exercise-1',
        exerciseDefinitionsToSearch: definitions,
      })
    ).toThrow('does not belong to exercise definition');
  });
});
