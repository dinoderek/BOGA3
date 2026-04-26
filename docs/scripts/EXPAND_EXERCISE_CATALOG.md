# Exercise Catalog Expansion Script

Automated script to expand the BOGA3 exercise catalog by reading exercises from `muscle_load.json` and inserting missing ones into `SYSTEM_EXERCISE_DEFINITION_SEEDS`.

## Quick Start

```bash
# Dry run (show what would be added)
node scripts/expand-exercise-catalog.js --dry-run

# Dry run with first 20 exercises only
node scripts/expand-exercise-catalog.js --dry-run --limit 20

# Dry run with verbose output (show muscle mappings)
node scripts/expand-exercise-catalog.js --dry-run --verbose

# Actually apply changes
node scripts/expand-exercise-catalog.js
```

## Usage

```
node scripts/expand-exercise-catalog.js [OPTIONS]
```

### Options

| Option                 | Description                                                  |
| ---------------------- | ------------------------------------------------------------ |
| `--dry-run`            | Show what would be added without modifying files             |
| `--limit N`            | Only add first N new exercises (useful for testing)          |
| `--verbose`            | Show detailed muscle mapping information for each exercise   |
| `--muscle-load <path>` | Custom path to muscle_load.json (if not in default location) |

### Environment Variables

| Variable           | Description                       |
| ------------------ | --------------------------------- |
| `MUSCLE_LOAD_PATH` | Override path to muscle_load.json |

## How It Works

1. **Reads muscle_load.json** — Extracts all exercises with their muscle attributions
2. **Parses exercise-catalog-seeds.ts** — Identifies existing exercises to avoid duplicates
3. **Maps muscles** — Converts source muscle IDs to BOGA3's muscle group taxonomy
4. **Generates TypeScript** — Creates exercise definitions, mappings, and documentation
5. **Writes to file** — Appends new exercises to the catalog (or shows in dry-run)

## Muscle Mapping

The script automatically maps source muscle IDs to BOGA3 muscle groups:

| Source Muscle ID                        | BOGA3 Group       |
| --------------------------------------- | ----------------- |
| `pectoralis_major`                      | `chest`           |
| `anterior_deltoid` / `deltoid_anterior` | `delts_front`     |
| `lateral_deltoid`                       | `delts_lateral`   |
| `posterior_deltoid`                     | `delts_rear`      |
| `latissimus_dorsi`                      | `back_lats`       |
| `rhomboideus`                           | `back_upper`      |
| `trapezius`                             | `traps_upper`     |
| `erector_spinae`                        | `spinal_erectors` |
| `biceps_brachii`                        | `biceps`          |
| `triceps_brachii`                       | `triceps`         |
| `forearm_flexors` / `forearm_extensors` | `forearms_grip`   |
| `rectus_abdominis`                      | `abs_rectus`      |
| `obliques`                              | `abs_obliques`    |
| `quadriceps_femoris`                    | `quads`           |
| `hamstrings`                            | `hamstrings`      |
| `gluteus_maximus`                       | `glutes_max`      |
| `gluteus_medius` / `gluteus_minimus`    | `hip_abductors`   |
| `adductors`                             | `adductors`       |
| `gastrocnemius`                         | `calves`          |

### Load Factor Rules

- **≥ 1.0** → Primary muscle (weight: 1.0)
- **≥ 0.5** → Secondary muscle (weight: 0.5)
- **< 0.5** → Ignored

If a muscle appears in both primary and secondary, it's only included as primary.

## Examples

### Test with 5 exercises

```bash
node scripts/expand-exercise-catalog.js --dry-run --limit 5 --verbose
```

Output shows:
- ✓ Exercise name
- Primary muscles
- Secondary muscles
- Generated TypeScript code

### Add all missing exercises

```bash
node scripts/expand-exercise-catalog.js
```

Will:
1. Add to `SYSTEM_EXERCISE_DEFINITION_SEEDS`
2. Add to `SYSTEM_EXERCISE_MUSCLE_MAPPING_INPUTS`
3. Add to `SYSTEM_EXERCISE_SEED_DOCUMENTATION`
4. Verify with TypeScript compilation

### Use custom muscle_load.json path

```bash
node scripts/expand-exercise-catalog.js --muscle-load /path/to/muscle_load.json --dry-run
```

Or:

```bash
MUSCLE_LOAD_PATH=/path/to/muscle_load.json node scripts/expand-exercise-catalog.js --dry-run
```

## Workflow

### 1. Review Changes (Recommended)

Always run with `--dry-run` first to see what will be added:

```bash
node scripts/expand-exercise-catalog.js --dry-run --verbose
```

### 2. Test with Limited Set

Try adding just a few exercises first:

```bash
node scripts/expand-exercise-catalog.js --dry-run --limit 50 --verbose
```

### 3. Apply Changes

Once satisfied, run without `--dry-run`:

```bash
node scripts/expand-exercise-catalog.js --limit 100
```

### 4. Validate

TypeScript will auto-validate:

```bash
npm run typecheck
```

Or manually check the file:

```bash
npm run lint
```

## Troubleshooting

### "Could not find muscle_load.json"

Provide the correct path:

```bash
MUSCLE_LOAD_PATH=/path/to/muscle_load.json node scripts/expand-exercise-catalog.js --dry-run
```

### Unknown muscle mapping warnings

Some muscle IDs in the source data might not be recognized. The script will warn about these and skip them. Check the `MUSCLE_ID_TO_BOGA3_MAPPING` in the script to add new mappings.

### TypeScript compilation errors after running

This usually means the regex patterns didn't match the file structure. Verify the exercise-catalog-seeds.ts structure is unchanged from what the script expects.

## Performance

- **373 exercises in muscle_load.json**
- **28 existing exercises**
- **~365 missing exercises**
- Processing time: <1 second
- File modification: <1 second

## Automation

To run during CI/CD:

```bash
# Fail if muscle_load.json is not complete
if [ -f "$MUSCLE_LOAD_PATH" ]; then
  node scripts/expand-exercise-catalog.js
  npm run typecheck
else
  echo "muscle_load.json not found"
  exit 1
fi
```
