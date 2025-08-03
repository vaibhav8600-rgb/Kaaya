const data = {
  routines: [
    {
      id: 'push',
      name: 'Push Day',
      description: 'Chest, shoulders and triceps',
      exercises: [
        {
          id: 'bench',
          name: 'Bench Press',
          sets: [
            { reps: 10, weight: 60 },
            { reps: 8, weight: 60 },
            { reps: 6, weight: 60 },
          ],
        },
        {
          id: 'overhead',
          name: 'Overhead Press',
          sets: [
            { reps: 10, weight: 40 },
            { reps: 8, weight: 40 },
            { reps: 6, weight: 40 },
          ],
        },
      ],
    },
    {
      id: 'pull',
      name: 'Pull Day',
      description: 'Back and biceps',
      exercises: [
        {
          id: 'deadlift',
          name: 'Deadlift',
          sets: [
            { reps: 5, weight: 80 },
            { reps: 5, weight: 90 },
            { reps: 5, weight: 100 },
          ],
        },
        {
          id: 'rows',
          name: 'Bent Over Row',
          sets: [
            { reps: 10, weight: 50 },
            { reps: 8, weight: 55 },
            { reps: 6, weight: 60 },
          ],
        },
      ],
    },
    {
      id: 'legs',
      name: 'Leg Day',
      description: 'Legs and lower body',
      exercises: [
        {
          id: 'squat',
          name: 'Squats',
          sets: [
            { reps: 10, weight: 80 },
            { reps: 8, weight: 90 },
            { reps: 6, weight: 100 },
          ],
        },
        {
          id: 'legpress',
          name: 'Leg Press',
          sets: [
            { reps: 12, weight: 100 },
            { reps: 12, weight: 100 },
            { reps: 12, weight: 100 },
          ],
        },
      ],
    },
  ],
  exercises: [
    { id: 'bench', name: 'Bench Press', group: 'Chest' },
    { id: 'deadlift', name: 'Deadlift', group: 'Back' },
    { id: 'squat', name: 'Squats', group: 'Legs' },
    { id: 'overhead', name: 'Overhead Press', group: 'Shoulders' },
    { id: 'bicep', name: 'Bicep Curls', group: 'Arms' },
    { id: 'plank', name: 'Plank', group: 'Core' },
  ],
};

export default data;

/**
 * Retrieve combined routines including any imported ones from localStorage.
 * Imported routines are stored under the key `importedRoutines` and have the
 * same shape as routines defined in this file.  When present, they are
 * appended to the base routines array.
 */
export function getRoutines() {
  let imported = [];
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('importedRoutines');
      if (stored) imported = JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse imported routines', e);
    }
  }
  return data.routines.concat(imported);
}

/**
 * Retrieve combined exercises including any imported ones from localStorage.
 * Imported exercises are stored under the key `importedExercises` and have
 * the same shape as the items in the `exercises` array.  They will be
 * appended to the base list when returned.
 */
export function getExercises() {
  let imported = [];
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('importedExercises');
      if (stored) imported = JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse imported exercises', e);
    }
  }
  return data.exercises.concat(imported);
}
