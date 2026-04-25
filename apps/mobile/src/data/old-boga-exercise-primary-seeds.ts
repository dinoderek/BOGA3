export type OldBogaExercisePrimarySeed = {
  name: string;
  primaryMuscleGroupId: string;
};

const OLD_BOGA_EXERCISE_PRIMARY_ROWS_TEXT = `
Barbell Back Squat|quads
Barbell Bench Press|chest
Standing Barbell Overhead Press|delts_front
Seated Dumbbell Overhead Press|delts_front
Barbell Bent-Over Row|back_lats
Pull-Up|back_lats
Barbell Curl|biceps
Leg Press|quads
Dumbbell Fly|chest
Push-Up|chest
Low Cable One-Arm Lateral Raises|delts_lateral
Machine Lateral Raises|delts_lateral
Rotator Cuffs|delts_lateral
Side-Lying Dumbbell Lateral Raises|delts_lateral
Alternating Dumbbell Front Raises|delts_front
Barbell Front Raises|delts_front
Cable Front Raises|delts_front
Cable One-Arm Front Raises|delts_front
Dumbbell Front Raises|delts_front
One-Dumbbell Front Raises|delts_front
Seated Barbell Front Raises|delts_front
Standing Cable Internal Rotations|delts_lateral
Arnold Presses|delts_lateral
Barbell Front Presses|delts_front
Machine Presses|delts_lateral
One-Arm Arnold Presses|delts_lateral
Standing Barbell Front Presses|delts_front
Alternating Dumbbell Hammer Front Raises|delts_front
Cable One-Arm Hammer Front Raises|delts_front
Dumbbell One-Arm Hammer Front Raises|delts_front
Bent-Over Cable Lateral Raises|delts_rear
Bent-Over Dumbbell Lateral Raises|delts_rear
Dumbbell Lateral Raises|delts_lateral
Kettlebell Lateral Raises|delts_lateral
Lying Dumbbell Lateral Raises|delts_lateral
Reverse High Cable Flys|delts_rear
Reverse Machine Flys|delts_rear
Seated Dumbbell Lateral Raises|delts_lateral
Standing Cable External Rotations|delts_lateral
Barbell Back Presses|delts_lateral
Dumbbell Presses|delts_lateral
Kettlebell Bottom-Up Kneeling Press|delts_lateral
Standing Dumbbell One-Arm Presses|delts_lateral
Standing Dumbbell Presses|delts_lateral
Landmine Press|delts_lateral
Powell Raise|delts_lateral
Barbell Upright Rows|delts_lateral
Cable Face Pulls|delts_rear
Cable Upright Rows|delts_lateral
Dumbbell One-Arm Upright Rows|delts_lateral
Dumbbell Upright Rows|delts_lateral
EZ-Bar Upright Rows|delts_lateral
Kettlebell Upright Rows|delts_lateral
Seated Cable Face Pulls|delts_rear
Cable Flys|chest
Decline Dumbbell Flys|chest
Dumbbell Flys|chest
High Cable Flys|chest
Incline Dumbbell Flys|chest
Low Cable Flys|chest
Machine Flys|chest
Incline Machine Bench Presses|chest
Ball Decline Push-Ups|chest
Barbell Bench Presses|chest
Cable Bench Presses|chest
Decline Push-Ups|chest
Dumbbell Bench Presses|chest
Incline Barbell Bench Presses|chest
Incline Cable Bench Presses|chest
Incline Dumbbell Bench Presses|chest
Incline Smith Machine Bench Presses|chest
Push-Ups|chest
Smith Machine Bench Presses|chest
Spiderman Push-up|chest
Wide-Grip Barbell Bench Presses|chest
Ball Incline Push-Ups|chest
Decline Barbell Bench Presses|chest
Decline Cable Bench Presses|chest
Decline Dumbbell Bench Presses|chest
Incline Push-Ups|chest
Machine Bench Presses|chest
Seated Cable Bench Presses|chest
Seated Machine Bench Presses|chest
Ball Dumbbell Pullovers|chest
Barbell Pullovers|chest
Dumbbell Pullovers|chest
Band Pull-Apart|delts_lateral
Incline Dumbbell Pullover|chest
Barbell Shrugs|traps_upper
Dumbbell Shrugs|traps_upper
Dumbbells Reverse Fly|traps_upper
Machine Shrugs|traps_upper
Trap Bar Shrugs|traps_upper
Alternating Cable Row|traps_upper
Barbell Rows|traps_upper
Dumbbell Rows|traps_upper
Incline Barbell Rows|traps_upper
Incline Dumbbell Rows|traps_upper
Lying Barbell Rows|traps_upper
Lying T-Bar Rows|traps_upper
Smith Machine Rows|traps_upper
T-Bar Rows|traps_upper
Wide-Grip Seated Cable Rows|traps_upper
Wide-Grip Seated Machine Rows|traps_upper
Dumbbell Renegade Rows|traps_upper
Kettlebell Renegade Rows|traps_upper
Dumbbell One-Arm Rows|traps_upper
Kettlebell One-Arm Rows|traps_upper
Pull-Ups|traps_upper
Wide-Grip Back Lat Pull-Downs|traps_upper
Wide-Grip Lat Pull-Downs|traps_upper
Barbell Deadlifts|traps_upper
Dumbbell Deadlifts|traps_upper
Smith Machine Deadlifts|traps_upper
Trap Bar Deadlifts|traps_upper
Reverse Barbell Rows|back_lats
Reverse Dumbbell Rows|back_lats
Reverse Incline Barbell Rows|back_lats
Seated Cable Rows|back_lats
Seated Machine Rows|back_lats
Close-Grip Chin-Ups|back_lats
Close-Grip Lat Pull-Downs|back_lats
One-Arm Lat Pull-Downs|back_lats
Machine Pullovers|back_lats
Seated Cable Pullovers|back_lats
Lat Pull-Downs|back_lats
Machine Lat Pull-Downs|back_lats
Straight-Arm Lat Pull-Downs|back_lats
Chin-Ups|back_lats
Reverse Lat Pull-Downs|back_lats
Reverse Machine Lat Pull-Downs|back_lats
Machine Back Extensions|spinal_erectors
Back Extensions|spinal_erectors
Ball Back Extensions|spinal_erectors
Supermans|spinal_erectors
Barbell Sumo Deadlifts|spinal_erectors
Barbell Romanian Deadlifts|spinal_erectors
Dumbbell Romanian Deadlifts|spinal_erectors
Kettlebell Romanian Deadlifts|spinal_erectors
Straight-Leg Barbell Deadlifts|spinal_erectors
Straight-Leg Dumbbell Deadlifts|spinal_erectors
Close-Grip Barbell Bench Presses|chest
Close-Grip Dumbbell Bench Presses|chest
Close-Grip Incline Dumbbell Bench Presses|chest
Close-Grip Incline Push-Ups|chest
Close-Grip Push-Ups|chest
Machine Dips|chest
Parallel Bar Dips|chest
Hammer Push-Downs|triceps
Incline Low Cable Triceps Extensions|triceps
Lying Barbell Triceps Extensions|triceps
Lying Dumbbell Triceps Extensions|triceps
Lying EZ-Bar Triceps Extensions|triceps
Lying Low Cable Triceps Extensions|triceps
Machine Push-Downs|triceps
One-Arm Hammer Push-Downs|triceps
Push-Downs|triceps
Seated Dumbbell One-Arm Triceps Extensions|triceps
Seated EZ-Bar Triceps Extensions|triceps
Seated High Cable Triceps Extensions|triceps
Seated One-Dumbbell Triceps Extensions|triceps
Standing Dumbbell One-Arm Triceps Extensions|triceps
Standing High Cable One-Arm Triceps Extensions|triceps
Standing Low Cable Hammer Triceps Extensions|triceps
Standing Low Cable Triceps Extensions|triceps
Standing One-Dumbbell Triceps Extensions|triceps
Triceps Kickbacks|triceps
Ball Dips|triceps
Bench Dips|triceps
Reverse One-Arm Push-Downs|triceps
Reverse Push-Downs|triceps
Alternating Dumbbell Curls|biceps
Alternating Dumbbell Preacher Curls|biceps
Alternating Hammer Curls|biceps
Alternating Hammer Preacher Curls|biceps
Alternating Incline Dumbbell Curls|biceps
Alternating Incline Hammer Curls|biceps
Barbell Curls|biceps
Barbell Preacher Curls|biceps
Barbell Spider Curls|biceps
Cable Concentration Curls|biceps
Cable Preacher Curls|biceps
Concentration Curls|biceps
Dumbbell Curls|biceps
Dumbbell Preacher Curls|biceps
Dumbbell Spider Curls|biceps
EZ-Bar Curls|biceps
EZ-Bar Preacher Curls|biceps
EZ-Bar Spider Curls|biceps
Hammer Curls|biceps
Hammer Preacher Curls|biceps
Hammer Spider Curls|biceps
High Cable Curls|biceps
High Cable One-Arm Curls|biceps
Incline Dumbbell Curls|biceps
Incline Hammer Curls|biceps
Low Cable Curls|biceps
Low Cable Hammer Curls|biceps
Low Cable One-Arm Curls|biceps
Machine One-Arm Preacher Curls|biceps
Machine Preacher Curls|biceps
Standing Dumbbell One-Arm Preacher Curls|biceps
Wide-Grip Barbell Curls|biceps
Wide-Grip EZ-Bar Curls|biceps
Alternating Dumbbell Twist Curls|biceps
Alternating Incline Dumbbell Twist Curls|biceps
Dumbbell Twist Curls|biceps
Incline Dumbbell Twist Curls|biceps
Dumbbell Curls (rotated)|biceps
Reverse Barbell Wrist Curls|forearms_grip
Reverse Cable Wrist Curls|forearms_grip
Reverse Dumbbell Wrist Curls|forearms_grip
Reverse Barbell Curls|forearms_grip
Reverse Barbell Preacher Curls|forearms_grip
Reverse Cable Preacher Curls|forearms_grip
Reverse Dumbbell Preacher Curls|forearms_grip
Reverse Dumbbell Spider Curls|forearms_grip
Reverse EZ-Bar Preacher Curls|forearms_grip
Dumbbell Farmer's Walk|forearms_grip
Kettlebell Farmer's Walk|forearms_grip
Trap Bar Farmer's Walk|forearms_grip
Barbell Wrist Curls|forearms_grip
Cable Wrist Curls|forearms_grip
Dumbbell Wrist Curls|forearms_grip
Kettlebell Wrist Curls|forearms_grip
Planks|spinal_erectors
Side Planks|spinal_erectors
Ball Dead Bugs|abs_rectus
Dead Bugs|abs_rectus
Kneeling Cable Crunches|abs_rectus
Seated Cable Crunches|abs_rectus
Ball Crunches|abs_rectus
Crunches|abs_rectus
Flutter Kicks|abs_rectus
Hanging Leg Raises|abs_rectus
Incline Leg Raises|abs_rectus
Incline Sit-Ups|abs_rectus
Leg Raises|abs_rectus
Machine Crunches|abs_rectus
Machine Leg Raises|abs_rectus
Sit-Ups|abs_rectus
Ab-Wheel Rollouts|abs_rectus
Barbell Rollouts|abs_rectus
Dumbbell Rollouts|abs_rectus
EZ-Bar Rollouts|abs_rectus
Incline Twist Sit-Ups|abs_rectus
Twist Crunches|abs_rectus
Twist Sit-Ups|abs_rectus
Mountain Climbers|abs_rectus
Barbell Trunk Rotations|abs_obliques
Cable Side Bends|abs_obliques
Cable Trunk Rotations|abs_obliques
Dumbbell Side Bends|abs_obliques
Seated Cable Trunk Rotations|abs_obliques
Machine Trunk Rotations|abs_obliques
Dumbbell Russian Twists|abs_obliques
Kettlebell Russian Twists|abs_obliques
Russian Twists|abs_obliques
Kettlebell One-Arm Swings|spinal_erectors
Dumbbell Swings|spinal_erectors
Kettlebell Swings|spinal_erectors
Cable Hip Abductions|glutes_max
Lying Hip Abductions|glutes_max
Seated Machine Hip Abductions|glutes_max
Standing Machine Hip Abductions|glutes_max
Ball Hip Thrusts|glutes_max
Barbell Hip Thrusts|glutes_max
Dumbbell Hip Thrusts|glutes_max
Hip Thrusts|glutes_max
Barbell Bridging|glutes_max
Bench Barbell Bridging|glutes_max
Bench Bridging|glutes_max
Bench Reverse Flutter Kicks|glutes_max
Bent-Knee Hip Extensions|glutes_max
Bridging|glutes_max
Cable Hip Extensions|glutes_max
Dumbbell Bridging|glutes_max
Hip Extensions|glutes_max
Machine Hip Extensions|glutes_max
Single Leg Romanian Deadlift|glutes_max
Barbell Lunges|glutes_max
Dumbbell Lunges|glutes_max
Kettlebell Lunges|glutes_max
Burpees|chest
Cosak Squat|glutes_max
One-Dumbbell Squats|glutes_max
Barbell Front Squats|glutes_max
Barbell Squats|glutes_max
Bench Barbell Squats|glutes_max
Bench Dumbbell Squats|glutes_max
Dumbbell Front Squats|glutes_max
Dumbbell Goblet Squats|glutes_max
Dumbbell Squats|glutes_max
Kettlebell Goblet Squats|glutes_max
Smith Machine Squats|glutes_max
Kettlebell Pistol Squats|glutes_max
Pistol Squats|glutes_max
Barbell Bulgarian Split Squats|glutes_max
Bulgarian Split Squats|glutes_max
Dumbbell Bulgarian Split Squats|glutes_max
Machine Hack Squats|glutes_max
Machine Pendulum Squats|glutes_max
Star Jumps|glutes_max
Cable One-Leg Leg Extensions|quads
Leg Extensions|quads
One-Leg Leg Extensions|quads
Reverse Nordics (assisted)|quads
Single Leg Extension Isohold|quads
Sissy Squat|quads
Leg Presses|quads
One-Leg Leg Presses|quads
Seated Leg Presses|quads
Seated One-Leg Leg Presses|quads
Barbell Power Squats|quads
Half Burpees|quads
Cable Adductions|adductors
Machine Adductions|adductors
Barbell Good Mornings|hamstrings
Seated Barbell Good Mornings|hamstrings
Smith Machine Good Mornings|hamstrings
Lying Leg Curls|hamstrings
Lying One-Leg Leg Curls|hamstrings
Nordic Leg Curls|hamstrings
Seated Leg Curls|hamstrings
Seated One-Leg Leg Curls|hamstrings
Standing Leg Curls|hamstrings
Donkey Calf Raises|calves
Seated Barbell Calf Raises|calves
Seated Dumbbell Calf Raises|calves
Seated Machine Calf Raises|calves
Standing Barbell Calf Raises|calves
Standing Calf Raises|calves
Standing Dumbbell One-Leg Calf Raises|calves
Standing Machine Calf Raises|calves
Standing One-Leg Calf Raises|calves
Swimming|delts_lateral
Battle Ropes Alternating Waves|delts_lateral
Battle Ropes Double Waves|delts_lateral
Boxing|delts_lateral
Rowing|back_lats
Cycling|glutes_max
Stationary Cycling|glutes_max
Elliptical Trainer|glutes_max
Jumping Rope|glutes_max
Jumping Rope Double Unders|glutes_max
Jogging|glutes_max
Stationary Stair Climbing|glutes_max
Treadmill Jogging|glutes_max
Treadmill Walking|glutes_max
Walking|glutes_max
Front Elbow Pull Stretch|delts_front
Palms-In Back Arm Extension Stretch|delts_lateral
Straight-Arm Torso Rotation Stretch at Wall|delts_lateral
Child Pose Stretch|delts_lateral
Bent-Arm Torso Rotation Stretch at Wall|chest
Straight-Arm Torso Lean Stretch in Corner|chest
Back Arm Pull Stretch|traps_upper
Cross-Legged Seated Head Tilt Stretch|traps_upper
Standing Head Tilt Stretch|traps_upper
Dead Hang Stretch|back_lats
Side Bend Stretch at Wall|back_lats
Palms-Out Upward Arm Extension Stretch|back_lats
Back Elbow Pull Stretch|triceps
Palms-Out Front Arm Extension Stretch|forearms_grip
Cobra Pose Stretch|abs_rectus
Lying Hip Rotation Stretch|glutes_max
Bent-Knee Lying Leg Pull Stretch|glutes_max
Side-Lying Back Foot Pull Stretch|quads
Standing Back Foot Pull Stretch|quads
Kneeling Lunge Stretch|quads
Straight-Leg Lying Leg Pull Stretch|hamstrings
Standing One-Leg Leg Extension Stretch|hamstrings
Standing Lunge Stretch at Wall|calves
`;

export const OLD_BOGA_EXERCISE_PRIMARY_ROWS: OldBogaExercisePrimarySeed[] =
  OLD_BOGA_EXERCISE_PRIMARY_ROWS_TEXT.trim()
    .split('\n')
    .map((line) => {
      const [name, primaryMuscleGroupId] = line.split('|');
      return { name, primaryMuscleGroupId };
    });
