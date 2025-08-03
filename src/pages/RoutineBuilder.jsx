import React, { useState } from 'react';
import data, { getExercises } from '../data/workouts';

/**
 * RoutineBuilder allows users to assemble custom routines.  It uses basic
 * CSS classes defined in index.css for styling and inline styles for
 * interactive elements.  Tailwind classes have been removed to avoid
 * dependency on the Tailwind build pipeline.
 */
export default function RoutineBuilder() {
  const [routineName, setRoutineName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedExercises, setSelectedExercises] = useState([]);
  // Include an additional 'Imported' category so that any exercises imported from
  // external data can be selected and added to new routines.
  const muscleGroups = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Imported'];

  function toggleExercise(ex) {
    setSelectedExercises((prev) =>
      prev.includes(ex) ? prev.filter((e) => e !== ex) : [...prev, ex]
    );
  }

  function saveRoutine() {
    alert('Routine saved!');
    setRoutineName('');
    setSelectedExercises([]);
  }

  return (
    <div>
      <h1>Routine Builder</h1>
      <div>
        <input
          type="text"
          value={routineName}
          onChange={(e) => setRoutineName(e.target.value)}
          placeholder="Routine Name"
        />
        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
        >
          <option value="">Select Muscle Group</option>
          {muscleGroups.map((group) => (
            <option key={group}>{group}</option>
          ))}
        </select>
        <div>
          {selectedGroup &&
            getExercises()
              .filter((ex) => ex.group === selectedGroup)
              .map((ex) => (
                <div
                  key={ex.id}
                  className="card"
                  style={{
                    cursor: 'pointer',
                    background: selectedExercises.includes(ex)
                      ? 'rgba(92,39,181,0.8)'
                      : undefined,
                    borderColor: selectedExercises.includes(ex)
                      ? '#6D28D9'
                      : undefined,
                  }}
                  onClick={() => toggleExercise(ex)}
                >
                  {ex.name}
                </div>
              ))}
        </div>
        <button onClick={saveRoutine} className="btn-glow" style={{ width: '100%', marginTop: '1rem' }}>
          Save Routine
        </button>
      </div>
    </div>
  );
}
