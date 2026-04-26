#!/usr/bin/env node

/**
 * Expand Exercise Catalog Script
 * 
 * Reads exercises from muscle_load.json and adds missing ones to
 * SYSTEM_EXERCISE_DEFINITION_SEEDS in exercise-catalog-seeds.ts
 * 
 * Usage: node scripts/expand-exercise-catalog.js [OPTIONS]
 * 
 * Options:
 *   --muscle-load <path>  Path to muscle_load.json (default: muscle_load.json)
 *   --dry-run             Show what would be added without modifying the file
 *   --limit N             Only add first N new exercises (useful for testing)
 *   --verbose             Show detailed mapping information
 * 
 * Environment Variables:
 *   MUSCLE_LOAD_PATH      Override path to muscle_load.json
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// Configuration
// ============================================================================

const args = process.argv.slice(2);

// Determine muscle_load.json path
let MUSCLE_LOAD_PATH = process.env.MUSCLE_LOAD_PATH;
if (!MUSCLE_LOAD_PATH) {
    const muscleLoadIndex = args.findIndex(arg => arg === '--muscle-load');
    if (muscleLoadIndex !== -1) {
        MUSCLE_LOAD_PATH = args[muscleLoadIndex + 1];
    } else {
        // Default: relative to this script
        MUSCLE_LOAD_PATH = path.resolve(__dirname, '/muscle_load.json');
    }
}

const EXERCISE_CATALOG_PATH = path.join(__dirname, '..', 'apps', 'mobile', 'src', 'data', 'exercise-catalog-seeds.ts');

// Mapping from source muscle IDs to BOGA3 muscle groups
const MUSCLE_ID_TO_BOGA3_MAPPING = {
    'pectoralis_major': 'chest',
    'pectoralis_minor': 'chest',
    'anterior_deltoid': 'delts_front',
    'deltoid_anterior': 'delts_front',
    'deltoids': 'delts_front', // Default to front if not specified
    'lateral_deltoid': 'delts_lateral',
    'deltoid_lateral': 'delts_lateral',
    'posterior_deltoid': 'delts_rear',
    'deltoid_posterior': 'delts_rear',
    'latissimus_dorsi': 'back_lats',
    'rhomboideus': 'back_upper',
    'trapezius': 'traps_upper', // Default to upper traps
    'erector_spinae': 'spinal_erectors',
    'biceps_brachii': 'biceps',
    'triceps_brachii': 'triceps',
    'brachialis': 'biceps', // Works well with biceps
    'brachioradialis': 'forearms_grip',
    'forearm_flexors': 'forearms_grip',
    'forearm_extensors': 'forearms_grip',
    'rectus_abdominis': 'abs_rectus',
    'obliques': 'abs_obliques',
    'core': 'abs_rectus', // Generic core mapping to abs
    'quadriceps_femoris': 'quads',
    'hamstrings': 'hamstrings',
    'gluteus_maximus': 'glutes_max',
    'gluteus_medius': 'hip_abductors',
    'gluteus_minimus': 'hip_abductors',
    'adductors': 'adductors',
    'gastrocnemius': 'calves',
    'soleus': 'calves',
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Convert exercise name to BOGA3 ID format (sys_snake_case)
 */
function exerciseNameToId(name) {
    return 'sys_' + name
        .toLowerCase()
        .replace(/[&]/g, 'and')
        .replace(/[^\w\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '_')     // Spaces to underscores
        .replace(/_+/g, '_')      // Collapse multiple underscores
        .replace(/(^_|_$)/g, ''); // Trim underscores
}

/**
 * Check if an exercise already exists in the catalog
 */
function isExerciseInCatalog(name, existingExercises) {
    const nameNormalized = name.toLowerCase().trim();
    return existingExercises.some(
        ex => ex.name.toLowerCase().trim() === nameNormalized
    );
}

/**
 * Determine primary and secondary muscles based on load factors
 * Avoids duplicate mappings within same role
 */
function getMusclesByRole(muscleAttribution) {
    if (!Array.isArray(muscleAttribution) || muscleAttribution.length === 0) {
        return { primary: [], secondary: [] };
    }

    const primary = new Set();
    const secondary = new Set();

    for (const muscle of muscleAttribution) {
        const bogaId = MUSCLE_ID_TO_BOGA3_MAPPING[muscle.muscle_id];

        if (!bogaId) {
            console.warn(`  ⚠ Unknown muscle mapping: ${muscle.muscle_id}`);
            continue;
        }

        if (muscle.load_factor >= 1.0) {
            primary.add(bogaId);
        } else if (muscle.load_factor >= 0.5) {
            // Only add as secondary if not already primary
            if (!primary.has(bogaId)) {
                secondary.add(bogaId);
            }
        }
    }

    return {
        primary: Array.from(primary),
        secondary: Array.from(secondary)
    };
}

/**
 * Generate TypeScript mapping entries for an exercise
 * Deduplicates muscles that appear in both primary and secondary
 */
function generateMappingEntries(exerciseId, muscles) {
    const entries = [];
    const seenMuscles = new Set();

    // Primary muscles with weight 1.0
    for (const muscleId of muscles.primary) {
        if (!seenMuscles.has(muscleId)) {
            entries.push(
                `  { exerciseDefinitionId: '${exerciseId}', muscleGroupId: '${muscleId}', weight: 1, role: 'primary' },`
            );
            seenMuscles.add(muscleId);
        }
    }

    // Secondary muscles with weight 0.5
    for (const muscleId of muscles.secondary) {
        if (!seenMuscles.has(muscleId)) {
            entries.push(
                `  { exerciseDefinitionId: '${exerciseId}', muscleGroupId: '${muscleId}', weight: 0.5, role: 'secondary' },`
            );
            seenMuscles.add(muscleId);
        }
    }

    return entries;
}

/**
 * Generate documentation entry for an exercise
 */
function generateDocumentationEntry(exerciseId, exerciseName, muscles) {
    const primaryNames = muscles.primary.join(', ');
    const secondaryNames = muscles.secondary.length > 0 ? `with ${muscles.secondary.join('/')} secondary` : '';
    const rationale = `${exerciseName} is mapped to ${primaryNames}${secondaryNames ? ' ' + secondaryNames : ''}.`;

    return `  {
    exerciseDefinitionId: '${exerciseId}',
    sourceReferenceIds: ['exrx-resistance-exercise-directory'],
    rationale: '${rationale}',
  },`;
}

// ============================================================================
// Main Script
// ============================================================================

async function main() {
    const isDryRun = args.includes('--dry-run');
    const isVerbose = args.includes('--verbose');
    const limitIndex = args.findIndex(arg => arg === '--limit');
    const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1]) : null;

    console.log('📋 Exercise Catalog Expansion Script');
    console.log('=====================================\n');

    // Load muscle_load.json
    console.log('📖 Reading muscle_load.json...');
    let muscleLoadData;
    try {
        const rawData = fs.readFileSync(MUSCLE_LOAD_PATH, 'utf8');
        muscleLoadData = JSON.parse(rawData);
        console.log(`✓ Found ${muscleLoadData.length} exercises in muscle_load.json\n`);
    } catch (err) {
        console.error(`✗ Error reading muscle_load.json: ${err.message}`);
        process.exit(1);
    }

    // Extract existing exercises from catalog
    console.log('📖 Reading current exercise catalog...');
    let catalogContent;
    try {
        catalogContent = fs.readFileSync(EXERCISE_CATALOG_PATH, 'utf8');
    } catch (err) {
        console.error(`✗ Error reading exercise catalog: ${err.message}`);
        process.exit(1);
    }

    // Parse existing exercises (simple regex-based extraction)
    const exerciseDefMatch = catalogContent.match(
        /export const SYSTEM_EXERCISE_DEFINITION_SEEDS[\s\S]*?\] = \[([\s\S]*?)\];/
    );

    if (!exerciseDefMatch) {
        console.error('✗ Could not parse SYSTEM_EXERCISE_DEFINITION_SEEDS');
        process.exit(1);
    }

    const existingExercises = [];
    const existingIds = new Set();

    // Extract existing exercises
    const exercisePattern = /\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)'/g;
    let match;
    while ((match = exercisePattern.exec(exerciseDefMatch[1])) !== null) {
        existingExercises.push({ id: match[1], name: match[2] });
        existingIds.add(match[2].toLowerCase().trim());
    }

    console.log(`✓ Found ${existingExercises.length} existing exercises\n`);

    // Find missing exercises
    console.log('🔍 Finding missing exercises...');
    const missingExercises = [];

    for (const sourceExercise of muscleLoadData) {
        if (!isExerciseInCatalog(sourceExercise.name, existingExercises)) {
            missingExercises.push(sourceExercise);
        }
    }

    console.log(`✓ Found ${missingExercises.length} missing exercises\n`);

    if (missingExercises.length === 0) {
        console.log('✨ All exercises from muscle_load.json are already in the catalog!');
        return;
    }

    // Generate additions
    console.log('🔧 Generating TypeScript additions...\n');

    const newExerciseIds = [];
    const newMappings = [];
    const newDocumentation = [];
    let processedCount = 0;

    for (const sourceExercise of missingExercises) {
        if (limit && processedCount >= limit) break;

        const exerciseId = exerciseNameToId(sourceExercise.name);
        const muscles = getMusclesByRole(sourceExercise.muscle_attribution);

        // Skip exercises with no valid muscle mappings
        if (muscles.primary.length === 0 && muscles.secondary.length === 0) {
            if (isVerbose) {
                console.log(`⊘ Skipping "${sourceExercise.name}" (no valid muscle mappings)`);
            }
            continue;
        }

        newExerciseIds.push(`  { id: '${exerciseId}', name: '${sourceExercise.name}' },`);
        newMappings.push(...generateMappingEntries(exerciseId, muscles));
        newDocumentation.push(generateDocumentationEntry(exerciseId, sourceExercise.name, muscles));

        if (isVerbose) {
            console.log(`✓ ${sourceExercise.name}`);
            console.log(`  Primary: ${muscles.primary.join(', ') || 'none'}`);
            console.log(`  Secondary: ${muscles.secondary.join(', ') || 'none'}`);
        }

        processedCount++;
    }

    console.log(`\n📊 Generation Summary`);
    console.log('====================');
    console.log(`New exercises to add: ${processedCount}`);
    console.log(`New mappings: ${newMappings.length}`);
    console.log(`New documentation entries: ${newDocumentation.length}\n`);

    if (isDryRun) {
        console.log('🏜️ DRY RUN MODE - No changes will be written\n');
        console.log('EXERCISE DEFINITIONS to add:');
        console.log('----------------------------');
        console.log(newExerciseIds.join('\n'));
        console.log('\n\nMUSCLE MAPPINGS to add:');
        console.log('----------------------');
        console.log(newMappings.join('\n'));
        console.log('\n\nDOCUMENTATION to add:');
        console.log('--------------------');
        console.log(newDocumentation.join('\n'));
    } else {
        console.log('✏️ Modifying exercise-catalog-seeds.ts...\n');

        // Simple append strategy - add before the closing bracket
        let modified = catalogContent;

        // Add to SYSTEM_EXERCISE_DEFINITION_SEEDS
        const exerciseDefClosing = /(\s*\];)\s*\n\s*const SYSTEM_EXERCISE_MUSCLE_MAPPING_INPUTS/;
        if (exerciseDefClosing.test(modified)) {
            modified = modified.replace(
                exerciseDefClosing,
                `${newExerciseIds.map(ex => '\n  ' + ex.trim()).join('')}\n];

const SYSTEM_EXERCISE_MUSCLE_MAPPING_INPUTS`
            );
            console.log('✓ Added exercise definitions');
        }

        // Add to SYSTEM_EXERCISE_MUSCLE_MAPPING_INPUTS
        const mappingInputsClosing = /(\];)\s*\n\s*export const SYSTEM_EXERCISE_MUSCLE_MAPPING_SEEDS/;
        if (mappingInputsClosing.test(modified)) {
            modified = modified.replace(
                mappingInputsClosing,
                `${newMappings.map(m => '\n  ' + m.trim()).join('')}\n];

export const SYSTEM_EXERCISE_MUSCLE_MAPPING_SEEDS`
            );
            console.log('✓ Added muscle mappings');
        }

        // Add to SYSTEM_EXERCISE_SEED_DOCUMENTATION
        const docClosing = /(\];)\s*\n\s*export const SYSTEM_EXERCISE_GRANULAR_WEIGHT_RATIONALES/;
        if (docClosing.test(modified)) {
            modified = modified.replace(
                docClosing,
                `${newDocumentation.map(d => '\n  ' + d.trim()).join('')}\n];

export const SYSTEM_EXERCISE_GRANULAR_WEIGHT_RATIONALES`
            );
            console.log('✓ Added documentation entries');
        }

        // Write the modified file
        try {
            fs.writeFileSync(EXERCISE_CATALOG_PATH, modified, 'utf8');
            console.log('\n✅ Successfully updated exercise-catalog-seeds.ts');
            console.log(`   Added ${processedCount} new exercises`);
        } catch (err) {
            console.error(`\n✗ Error writing file: ${err.message}`);
            process.exit(1);
        }
    }

    console.log('\n✨ Done!');
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
