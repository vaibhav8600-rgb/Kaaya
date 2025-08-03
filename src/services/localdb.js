/**
 * Simulated local database using browser localStorage.
 */
export async function saveRoutine(routine) {
  const routines = JSON.parse(localStorage.getItem('routines') || '[]');
  routines.push(routine);
  localStorage.setItem('routines', JSON.stringify(routines));
}

export async function getRoutines() {
  return JSON.parse(localStorage.getItem('routines') || '[]');
}
