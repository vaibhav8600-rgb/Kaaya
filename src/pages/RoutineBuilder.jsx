import React, { useState } from 'react';
import data, { getExercises } from '../data/workouts';
import CustomExerciseForm from '../components/CustomExerciseForm';

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
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [editExercise, setEditExercise] = useState(null);
  const [customExercises, setCustomExercises] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('customExercises');
      let parsed = [];
      try {
        parsed = stored ? JSON.parse(stored) : [];
      } catch {
        parsed = [];
      }
      return Array.isArray(parsed) ? parsed : [];
    }
    return [];
  });
  const muscleGroups = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Custom', 'Imported'];

  function persistCustomExercises(next) {
    const arr = Array.isArray(next) ? next : [];
    setCustomExercises(arr);
    if (typeof window !== 'undefined') {
      localStorage.setItem('customExercises', JSON.stringify(arr));
    }
  }

  function toggleExercise(ex) {
    setSelectedExercises((prev) =>
      prev.includes(ex) ? prev.filter((e) => e !== ex) : [...prev, ex]
    );
  }

  function handleAddCustom() {
    setEditExercise(null);
    setShowCustomForm(true);
  }

  function handleEditCustom(ex) {
    setEditExercise(ex);
    setShowCustomForm(true);
  }

  function handleSaveCustom(ex) {
    let next;
    if (editExercise) {
      // Update
      next = customExercises.map((c) => (c === editExercise ? { ...c, ...ex } : c));
    } else {
      // Create
      next = [...customExercises, { ...ex, id: Date.now().toString() }];
    }
    persistCustomExercises(next);
    setShowCustomForm(false);
    setEditExercise(null);
  }

  function handleDeleteCustom(ex) {
    if (window.confirm('Delete this custom exercise?')) {
      const next = customExercises.filter((c) => c !== ex);
      persistCustomExercises(next);
      // Remove from selected if present
      setSelectedExercises((prev) => prev.filter((e) => e !== ex));
    }
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
          value={routineName !== undefined && routineName !== null ? routineName : ''}
          onChange={(e) => setRoutineName(e.target.value)}
          placeholder="Routine Name"
        />
        <select
          value={selectedGroup !== undefined && selectedGroup !== null ? selectedGroup : ''}
          onChange={(e) => setSelectedGroup(e.target.value)}
        >
          <option value="">Select Muscle Group</option>
          {muscleGroups.map((group) => (
            <option key={group}>{group}</option>
          ))}
        </select>
        <div style={{ margin: '8px 0' }}>
          <button className="btn-glow" onClick={handleAddCustom} style={{ marginBottom: 8 }}>
            + Add Custom Exercise
          </button>
          {showCustomForm && (
            <CustomExerciseForm
              onSave={handleSaveCustom}
              onCancel={() => { setShowCustomForm(false); setEditExercise(null); }}
              initial={editExercise}
              categories={muscleGroups}
            />
          )}
          {selectedGroup && (
            <>
              {/* Built-in and imported exercises */}
              {getExercises()
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
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                    onClick={() => toggleExercise(ex)}
                  >
                    <span>{ex.name}</span>
                    {selectedExercises.includes(ex) && (
                      <button
                        aria-label="Remove exercise"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ec4899',
                          cursor: 'pointer',
                          fontSize: '1.1rem',
                          marginLeft: 8,
                        }}
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedExercises(prev => prev.filter(e2 => e2 !== ex));
                        }}
                        title="Remove exercise"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                ))}
              {/* Custom exercises for this group */}
              {customExercises
                .filter((ex) => ex.group === selectedGroup)
                .map((ex) => (
                  <div
                    key={ex.id}
                    className="card"
                    style={{
                      cursor: 'pointer',
                      background: selectedExercises.includes(ex)
                        ? 'rgba(92,39,181,0.8)'
                        : 'rgba(255,255,255,0.03)',
                      borderColor: selectedExercises.includes(ex)
                        ? '#6D28D9'
                        : '#888',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                    onClick={() => toggleExercise(ex)}
                  >
                    <span>
                      {ex.name} <span title="Custom" style={{ color: '#fbbf24', marginLeft: 4 }}>✎</span>
                    </span>
                    <span style={{ display: 'flex', gap: 4 }}>
                      <button
                        aria-label="Edit exercise"
                        style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '1.1rem' }}
                        onClick={e => { e.stopPropagation(); handleEditCustom(ex); }}
                        title="Edit exercise"
                      >
                        ✏️
                      </button>
                      <button
                        aria-label="Delete exercise"
                        style={{ background: 'none', border: 'none', color: '#ec4899', cursor: 'pointer', fontSize: '1.1rem' }}
                        onClick={e => { e.stopPropagation(); handleDeleteCustom(ex); }}
                        title="Delete exercise"
                      >
                        🗑️
                      </button>
                    </span>
                  </div>
                ))}
            </>
          )}
        </div>
        <button onClick={saveRoutine} className="btn-glow" style={{ width: '100%', marginTop: '1rem' }}>
          Save Routine
        </button>
      </div>
    </div>
  );
}
