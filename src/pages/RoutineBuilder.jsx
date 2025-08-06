import React, { useState, useRef } from 'react';
import { getRoutines } from '../data/workouts';

/**
 * RoutineBuilder allows users to assemble custom routines with only exercise names and muscle groups.
 */
export default function RoutineBuilder() {
  const [routineName, setRoutineName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [routineId, setRoutineId] = useState(null);
  const [exerciseDraft, setExerciseDraft] = useState({ name: '', muscleGroup: '' });
  const [editingExerciseIdx, setEditingExerciseIdx] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const inputRef = useRef(null);
  const allRoutines = getRoutines();
  const muscleGroups = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Custom', 'Imported'];

  function resetExerciseDraft() {
    setExerciseDraft({ name: '', muscleGroup: '' });
    setEditingExerciseIdx(null);
  }

  function handleExerciseInputChange(e) {
    const { name, value } = e.target;
    setExerciseDraft(d => ({ ...d, [name]: value }));
  }

  function handleAddOrUpdateExercise() {
    const name = (exerciseDraft.name || '').trim();
    const muscleGroup = exerciseDraft.muscleGroup;
    if (!name) {
      alert('Exercise name is required.');
      return;
    }
    if (!muscleGroup) {
      alert('Please select a muscle group.');
      return;
    }
    if (selectedExercises.some((ex, idx) => ex.name.trim().toLowerCase() === name.toLowerCase() && idx !== editingExerciseIdx)) {
      alert('Duplicate exercise name.');
      return;
    }
    const newEx = { name, muscleGroup };
    let next;
    if (editingExerciseIdx !== null) {
      next = selectedExercises.map((ex, idx) => idx === editingExerciseIdx ? newEx : ex);
    } else {
      next = [...selectedExercises, newEx];
    }
    setSelectedExercises(next);
    resetExerciseDraft();
  }

  function handleRoutineNameChange(e) {
    const val = e.target.value;
    setRoutineName(val);
    if (val.trim().length === 0) {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
      setRoutineId(null);
      setSelectedExercises([]);
      setSelectedGroup('');
      return;
    }
    const matches = allRoutines.filter(r => r.name.toLowerCase().startsWith(val.trim().toLowerCase()));
    setFilteredSuggestions(matches);
    setShowSuggestions(matches.length > 0);
    const exact = matches.find(r => r.name.trim().toLowerCase() === val.trim().toLowerCase());
    if (exact) {
      setRoutineId(exact.id);
      setSelectedGroup((exact.muscleGroups && exact.muscleGroups[0]) || '');
      setSelectedExercises(exact.exercises ? exact.exercises.map(ex => ({ ...ex })) : []);
    } else {
      setRoutineId(null);
      setSelectedExercises([]);
      setSelectedGroup('');
    }
  }

  function handleSuggestionClick(r) {
    setRoutineName(r.name);
    setRoutineId(r.id);
    setSelectedGroup((r.muscleGroups && r.muscleGroups[0]) || '');
    setSelectedExercises(r.exercises ? r.exercises.map(ex => ({ ...ex })) : []);
    setShowSuggestions(false);
    inputRef.current.blur();
  }

  function saveRoutine() {
    if (!routineName.trim()) {
      alert('Please enter a routine name.');
      return;
    }
    if (!selectedExercises.length) {
      alert('Please add at least one exercise.');
      return;
    }
    let imported = [];
    try {
      imported = JSON.parse(localStorage.getItem('importedRoutines')) || [];
    } catch {
      imported = [];
    }
    const nameLC = routineName.trim().toLowerCase();
    const dupe = imported.find(r => r.name.trim().toLowerCase() === nameLC && r.id !== routineId);
    if (dupe) {
      if (!window.confirm('A routine with this name exists. Overwrite?')) return;
      imported = imported.filter(r => r.id !== dupe.id);
    }
    const newRoutine = {
      id: routineId || ('routine-' + Date.now()),
      name: routineName.trim(),
      exercises: selectedExercises,
      visibleOnHome: true,
    };
    if (routineId) imported = imported.filter(r => r.id !== routineId);
    imported.push(newRoutine);
    localStorage.setItem('importedRoutines', JSON.stringify(imported));
    alert('Routine saved!');
    setRoutineName('');
    setSelectedExercises([]);
    setSelectedGroup('');
    setRoutineId(null);
  }

  function handleDeleteExercise(idx) {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== idx));
  }

  function handleMoveExercise(idx, direction) {
    const newExercises = [...selectedExercises];
    const [removed] = newExercises.splice(idx, 1);
    newExercises.splice(idx + direction, 0, removed);
    setSelectedExercises(newExercises);
  }

  return (
    <div>
      <h1>Routine Builder</h1>
      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          value={routineName}
          onChange={handleRoutineNameChange}
          onFocus={() => { if (filteredSuggestions.length > 0) setShowSuggestions(true); }}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder="Routine Name"
          autoComplete="off"
          style={{ width: '100%' }}
        />
        {showSuggestions && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: '#18181b',
            border: '1px solid #6D28D9',
            zIndex: 10,
            borderRadius: 6,
            boxShadow: '0 2px 8px #000a',
            maxHeight: 180,
            overflowY: 'auto',
          }}>
            {filteredSuggestions.map(r => (
              <div
                key={r.id}
                style={{ padding: 8, cursor: 'pointer', color: '#fff', background: routineId === r.id ? '#312e81' : undefined }}
                onMouseDown={() => handleSuggestionClick(r)}
              >
                {r.name}
              </div>
            ))}
          </div>
        )}
        <div style={{ margin: '8px 0' }}>
          <div className="card" style={{ marginBottom: 12, padding: 16 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                name="name"
                value={exerciseDraft.name}
                onChange={handleExerciseInputChange}
                placeholder="Exercise Name"
                style={{ width: 140 }}
              />
              <select
                name="muscleGroup"
                value={exerciseDraft.muscleGroup}
                onChange={handleExerciseInputChange}
                style={{ width: 140 }}
              >
                <option value="">Select Muscle Group</option>
                {muscleGroups.map((group) => (
                  <option key={group}>{group}</option>
                ))}
              </select>
              <button onClick={handleAddOrUpdateExercise}   className="btn-glow" style={{ minWidth: 80 }}>
                {editingExerciseIdx !== null ? 'Update' : 'Add'}
              </button>
              {editingExerciseIdx !== null && (
                <button onClick={resetExerciseDraft}  className="btn-glow" style={{ minWidth: 60 }}>Cancel</button>
              )}
            </div>
          </div>
          <div>
            {selectedExercises.length === 0 && <div>No exercises yet.</div>}
            {selectedExercises.map((ex, idx) => (
              <div key={idx} className="card" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <span>{ex.name}</span>
                  <span style={{ marginLeft: 12 }}>Group: {ex.muscleGroup}</span>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button  className="btn-glow" onClick={() => setEditingExerciseIdx(idx)}>✏️</button>
                  <button  className="btn-glow" onClick={() => handleDeleteExercise(idx)}>🗑️</button>
                  <button  className="btn-glow" onClick={() => handleMoveExercise(idx, -1)} disabled={idx === 0}>▲</button>
                  <button  className="btn-glow" onClick={() => handleMoveExercise(idx, 1)} disabled={idx === selectedExercises.length - 1}>▼</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <button onClick={saveRoutine}  className="btn-glow" style={{ width: '100%', marginTop: '1rem' }}>
          Save Routine
        </button>
      </div>
    </div>
  );
}
