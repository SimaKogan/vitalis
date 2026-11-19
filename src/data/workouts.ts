export type Level = 'Easy' | 'Moderate' | 'Hard'

export interface Exercise {
  name: string
  seconds: number
  cue: string
  /** overrides the workout's rest time; 0 means no rest after this exercise */
  rest?: number
}

export interface Workout {
  slug: string
  title: string
  emoji: string
  hue: number
  level: Level
  equipment: string
  focus: string
  /** rest between exercises, in seconds */
  restSeconds: number
  /** how many times to go through the exercise list */
  rounds: number
  exercises: Exercise[]
}

export const WORKOUTS: Workout[] = [
  {
    slug: 'morning-reset',
    title: 'Morning reset',
    emoji: '🌅',
    hue: 40,
    level: 'Easy',
    equipment: 'None',
    focus: 'Wake up the joints, no sweat required',
    restSeconds: 15,
    rounds: 1,
    exercises: [
      { name: 'Cat-cow', seconds: 40, cue: 'On hands and knees, round and arch the spine slowly with your breath.' },
      { name: 'Arm circles', seconds: 40, cue: 'Big slow circles, 20 seconds each direction.' },
      { name: 'Bodyweight squats', seconds: 40, cue: 'Hips back, chest up, knees track over toes.' },
      { name: 'Reverse lunges', seconds: 40, cue: 'Step back, lower the knee gently, alternate legs.' },
      { name: 'Glute bridge', seconds: 40, cue: 'Squeeze at the top for one second.' },
      { name: 'World’s greatest stretch', seconds: 40, cue: 'Deep lunge, elbow to instep, then rotate the chest open. Swap sides halfway.' },
      { name: 'Slow breathing', seconds: 40, cue: 'In for 4 seconds, out for 6.' },
    ],
  },
  {
    slug: 'full-body-strength',
    title: 'Full-body strength',
    emoji: '💪',
    hue: 350,
    level: 'Moderate',
    equipment: 'Backpack or dumbbells',
    focus: 'Legs, back, chest and core',
    restSeconds: 20,
    rounds: 3,
    exercises: [
      { name: 'Squats', seconds: 45, cue: 'Hold a loaded backpack at your chest if you want more.' },
      { name: 'Push-ups', seconds: 45, cue: 'Hands on a table or the wall to make it easier.' },
      { name: 'Reverse lunges', seconds: 45, cue: 'Alternate legs, torso tall.' },
      { name: 'Backpack row', seconds: 45, cue: 'Hinge forward with a flat back, pull the bag to your ribs.' },
      { name: 'Glute bridge', seconds: 45, cue: 'Feet close to hips, drive through the heels.' },
      { name: 'Plank', seconds: 45, cue: 'A straight line from head to heels. Drop to knees if you shake.' },
    ],
  },
  {
    slug: 'hiit-express',
    title: 'HIIT express',
    emoji: '🔥',
    hue: 15,
    level: 'Hard',
    equipment: 'None',
    focus: 'Heart rate, fast and sweaty',
    restSeconds: 15,
    rounds: 3,
    exercises: [
      { name: 'Jumping jacks', seconds: 30, cue: 'Land softly, keep a steady rhythm.' },
      { name: 'High knees', seconds: 30, cue: 'Knees to hip height, pump the arms.' },
      { name: 'Squat jumps', seconds: 30, cue: 'Or fast squats without the jump.' },
      { name: 'Mountain climbers', seconds: 30, cue: 'Hips low, drive the knees under the chest.' },
      { name: 'Skater hops', seconds: 30, cue: 'Side to side, soft landings.' },
      { name: 'Step-back burpees', seconds: 30, cue: 'Step the feet back instead of jumping to protect your knees.' },
    ],
  },
  {
    slug: 'core-twelve',
    title: 'Core in twelve',
    emoji: '🎯',
    hue: 210,
    level: 'Moderate',
    equipment: 'Mat',
    focus: 'Abs, back and hips',
    restSeconds: 20,
    rounds: 2,
    exercises: [
      { name: 'Dead bug', seconds: 40, cue: 'Lower back stays pressed into the floor.' },
      { name: 'Bird dog', seconds: 40, cue: 'Reach long, keep the hips level.' },
      { name: 'Plank', seconds: 40, cue: 'Squeeze the glutes and breathe.' },
      { name: 'Bicycle crunch', seconds: 40, cue: 'Slow and controlled, shoulders off the floor.' },
      { name: 'Side plank, left', seconds: 30, cue: 'Stack the feet, lift the hips.' },
      { name: 'Side plank, right', seconds: 30, cue: 'Stack the feet, lift the hips.' },
    ],
  },
  {
    slug: 'mobility-stretch',
    title: 'Evening stretch',
    emoji: '🌙',
    hue: 265,
    level: 'Easy',
    equipment: 'Mat',
    focus: 'Loosen hips, back and shoulders before bed',
    restSeconds: 10,
    rounds: 1,
    exercises: [
      { name: 'Neck rolls', seconds: 45, cue: 'Slow half-circles, never force the range.' },
      { name: 'Thoracic rotation', seconds: 60, cue: 'On all fours, hand behind the head, rotate the elbow to the ceiling. Swap sides halfway.' },
      { name: 'Hip flexor stretch', seconds: 60, cue: 'Half-kneeling, tuck the pelvis, lean forward gently. Swap sides halfway.' },
      { name: 'Hamstring stretch', seconds: 60, cue: 'Heel on the floor, hinge forward with a flat back. Swap sides halfway.' },
      { name: 'Figure-four stretch', seconds: 60, cue: 'Lying down, ankle over the opposite knee, pull the thigh in. Swap sides halfway.' },
      { name: 'Child’s pose', seconds: 60, cue: 'Sink the hips back and let the shoulders drop.' },
    ],
  },
  {
    slug: 'brisk-walk-intervals',
    title: 'Brisk walk intervals',
    emoji: '🚶',
    hue: 140,
    level: 'Easy',
    equipment: 'Trainers and a path',
    focus: 'Easy cardio that anyone can start with',
    restSeconds: 0,
    rounds: 1,
    exercises: [
      { name: 'Easy warm-up walk', seconds: 300, cue: 'Relaxed pace, loosen the shoulders.' },
      { name: 'Brisk walk', seconds: 180, cue: 'You can talk, but not sing.' },
      { name: 'Easy walk', seconds: 120, cue: 'Let the breathing settle.' },
      { name: 'Brisk walk', seconds: 180, cue: 'Longer strides, swing the arms.' },
      { name: 'Easy walk', seconds: 120, cue: 'Let the breathing settle.' },
      { name: 'Brisk walk', seconds: 180, cue: 'Last push, stay tall.' },
      { name: 'Easy cool-down walk', seconds: 300, cue: 'Slow right down, then stretch the calves.' },
    ],
  },
]

export function getWorkout(slug: string | undefined): Workout | undefined {
  return WORKOUTS.find((w) => w.slug === slug)
}
