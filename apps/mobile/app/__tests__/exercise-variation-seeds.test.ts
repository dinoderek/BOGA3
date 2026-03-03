import {
  assertValidSystemExerciseVariationSeeds,
  getSystemExerciseVariationSeedSummary,
  SYSTEM_EXERCISE_VARIATION_KEY_SEEDS,
  SYSTEM_EXERCISE_VARIATION_VALUE_SEEDS,
  validateSystemExerciseVariationSeeds,
} from '@/src/data/exercise-variation-seeds';

describe('M9 exercise variation seeds', () => {
  it('ships the expected seeded keys and starter values', () => {
    expect(validateSystemExerciseVariationSeeds()).toEqual([]);
    expect(() => assertValidSystemExerciseVariationSeeds()).not.toThrow();

    const summary = getSystemExerciseVariationSeedSummary();

    expect(summary.keyCount).toBe(5);
    expect(summary.valueCount).toBe(21);
    expect(summary.keySlugs).toEqual(['grip', 'hold', 'machine', 'implement', 'incline']);

    expect(SYSTEM_EXERCISE_VARIATION_KEY_SEEDS.map((entry) => entry.slug)).toContain('machine');
    expect(SYSTEM_EXERCISE_VARIATION_VALUE_SEEDS.filter((entry) => entry.variationKeyId === 'var_key_machine')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ displayName: 'Cable' }),
        expect.objectContaining({ displayName: 'Hammer Strength' }),
      ])
    );
  });
});
