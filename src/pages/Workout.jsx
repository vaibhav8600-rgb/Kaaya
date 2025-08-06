import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import data, { getRoutines, getExercises } from '../data/workouts';

/**
 * Workout page renders the active routine based on the query parameter.  It uses
 * simple CSS classes defined in index.css (card, btn-glow) and inline styles
 * for layout rather than Tailwind utilities.  This avoids build errors
 * related to unknown Tailwind classes.
 */
export default function Workout() {
  const [searchParams] = useSearchParams();
  const routines = getRoutines();
  const routineId = searchParams.get('routine') || (routines[0] && routines[0].id);
  const routine = routines.find((r) => r.id === routineId) || (routines[0] || { exercises: [] });

  // Maintain current session input values for each exercise
  const [sessionData, setSessionData] = useState(() => {
    const initial = {};
    routine.exercises.forEach((ex) => {
      initial[ex.id] = ex.sets.map((set) => ({
        reps: set.reps !== undefined && set.reps !== null ? set.reps : '',
        weight: set.weight !== undefined && set.weight !== null ? set.weight : ''
      }));
    });
    return initial;
  });

  // Reset sessionData whenever the routine changes
  useEffect(() => {
    const initial = {};
    routine.exercises.forEach((ex) => {
      initial[ex.id] = ex.sets.map((set) => ({
        reps: set.reps !== undefined && set.reps !== null ? set.reps : '',
        weight: set.weight !== undefined && set.weight !== null ? set.weight : ''
      }));
    });
    setSessionData(initial);
  }, [routine]);

  // Load previous sessions for each exercise from localStorage
  const [previousLogs, setPreviousLogs] = useState({});

  useEffect(() => {
    const logs = JSON.parse(localStorage.getItem('exerciseLogs') || '{}');
    const prev = {};
    routine.exercises.forEach((ex) => {
      const history = logs[ex.id];
      if (history && history.length > 0) {
        prev[ex.id] = history[history.length - 1];
      }
    });
    setPreviousLogs(prev);
  }, [routine]);

  // Update sessionData when input fields change
  function handleInputChange(exId, index, field, value) {
    setSessionData((prev) => {
      const updated = { ...prev };
      updated[exId] = [...updated[exId]];
      updated[exId][index] = { ...updated[exId][index], [field]: value };
      return updated;
    });
  }

  // Save current session to localStorage when user ends workout
  function saveSession() {
    const logs = JSON.parse(localStorage.getItem('exerciseLogs') || '{}');
    routine.exercises.forEach((ex) => {
      logs[ex.id] = logs[ex.id] || [];
      logs[ex.id].push({
        date: new Date().toISOString(),
        sets: sessionData[ex.id],
      });
    });
    localStorage.setItem('exerciseLogs', JSON.stringify(logs));
    alert('Workout saved!');
  }

  return (
    <div>
      <h1>{routine.name}</h1>
      {routine.exercises.map((exercise) => {
        const prev = previousLogs[exercise.id];
        return (
          <div key={exercise.id} className="card">
            <h2>{exercise.name}</h2>
            {/* Inputs for each set (reps, weight, set number) */}
            {sessionData[exercise.id].map((set, index) => (
              <div
                key={index}
                style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}
              >
                <input
                  type="number"
                  value={set.reps !== undefined && set.reps !== null ? set.reps : ''}
                  onChange={(e) => handleInputChange(exercise.id, index, 'reps', e.target.value)}
                  placeholder="reps"
                  style={{ width: '4rem', marginRight: '0.5rem' }}
                />
                <input
                  type="number"
                  value={set.weight !== undefined && set.weight !== null ? set.weight : ''}
                  onChange={(e) => handleInputChange(exercise.id, index, 'weight', e.target.value)}
                  placeholder="kg"
                  style={{ width: '5rem', marginRight: '0.5rem' }}
                />
                <input
                  type="text"
                  readOnly
                  value={`${index + 1}/${sessionData[exercise.id].length}`}
                  style={{ width: '3rem', textAlign: 'center' }}
                />
              </div>
            ))}
            {/* Previous session display */}
            {prev && (
              <div className="card" style={{ marginTop: '0.5rem', background: 'rgba(255,255,255,0.05)', position: 'relative' }}>
                <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.25rem' }}>
                  Last session: {new Date(prev.date).toLocaleDateString()}
                  <button
                    aria-label="Delete previous session"
                    style={{ background: 'none', border: 'none', color: '#ec4899', cursor: 'pointer', fontSize: '1.1rem', marginLeft: 8 }}
                    onClick={() => {
                      // Remove the last session for this exercise from localStorage and update state
                      const logs = JSON.parse(localStorage.getItem('exerciseLogs') || '{}');
                      if (logs[exercise.id] && logs[exercise.id].length > 0) {
                        logs[exercise.id].pop();
                        localStorage.setItem('exerciseLogs', JSON.stringify(logs));
                        // Force update previousLogs state
                        setPreviousLogs((prevLogs) => {
                          const updated = { ...prevLogs };
                          if (logs[exercise.id] && logs[exercise.id].length > 0) {
                            updated[exercise.id] = logs[exercise.id][logs[exercise.id].length - 1];
                          } else {
                            delete updated[exercise.id];
                          }
                          return updated;
                        });
                      }
                    }}
                    title="Delete previous session"
                  >
                    🗑️
                  </button>
                </p>
                {prev.sets.map((s, idx) => (
                  <p key={idx} style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                    Set {idx + 1}: {s.reps || '-'} reps @ {s.weight || '-'} kg
                    {/* PR badge if this set exceeds previous session weight or reps */}
                    {sessionData[exercise.id][idx] &&
                    ((parseFloat(sessionData[exercise.id][idx].weight || 0) > parseFloat(s.weight || 0)) ||
                      (parseFloat(sessionData[exercise.id][idx].reps || 0) > parseFloat(s.reps || 0))) ? (
                      <span style={{ marginLeft: '0.5rem', color: '#ec4899', fontWeight: 600 }}>PR</span>
                    ) : null}
                  </p>
                ))}
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-glow"
              style={{ marginTop: '0.5rem' }}
              onClick={() => alert('Set completed!')}
            >
              Complete Set
            </motion.button>
          </div>
        );
      })}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="btn-glow"
        style={{ width: '100%', marginTop: '1rem' }}
        onClick={saveSession}
      >
        End Workout
      </motion.button>
    </div>
  );
}
