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
    const defaultSets = [
      { reps: '', weight: '' },
      { reps: '', weight: '' },
      { reps: '', weight: '' }
    ];
    if (routine && Array.isArray(routine.exercises)) {
      routine.exercises.forEach((ex) => {
        if (ex && Array.isArray(ex.sets) && ex.sets.length > 0) {
          initial[ex.id] = ex.sets.map((set) => ({
            reps: set && set.reps !== undefined && set.reps !== null ? set.reps : '',
            weight: set && set.weight !== undefined && set.weight !== null ? set.weight : ''
          }));
        } else {
          initial[ex.id] = defaultSets;
        }
      });
    }
    return initial;
  });

  // Reset sessionData whenever the routine changes (only when routineId or exercises change)
  useEffect(() => {
    if (!routine || !Array.isArray(routine.exercises)) return;
    const initial = {};
    const defaultSets = [
      { reps: '', weight: '' },
      { reps: '', weight: '' },
      { reps: '', weight: '' }
    ];
    routine.exercises.forEach((ex) => {
      if (ex && Array.isArray(ex.sets) && ex.sets.length > 0) {
        initial[ex.id] = ex.sets.map((set) => ({
          reps: set && set.reps !== undefined && set.reps !== null ? set.reps : '',
          weight: set && set.weight !== undefined && set.weight !== null ? set.weight : ''
        }));
      } else {
        initial[ex.id] = defaultSets;
      }
    });
    setSessionData(initial);
  }, [routineId, JSON.stringify(routine.exercises)]);

  // Load previous sessions for each exercise from localStorage
  const [previousLogs, setPreviousLogs] = useState({});

  useEffect(() => {
    if (!routine || !Array.isArray(routine.exercises)) return;
    const logs = JSON.parse(localStorage.getItem('exerciseLogs') || '{}');
    const prev = {};
    routine.exercises.forEach((ex) => {
      if (!ex) return;
      const history = logs[ex.id];
      if (history && history.length > 0) {
        prev[ex.id] = history[history.length - 1];
      }
    });
    setPreviousLogs(prev);
  }, [routineId, JSON.stringify(routine.exercises)]);

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
      {Array.isArray(routine.exercises) && routine.exercises.length > 0 ? (
        routine.exercises.map((exercise) => {
          if (!exercise) return null;
          const prev = previousLogs[exercise.id];
          return (
            <div key={exercise.id} className="card">
              <h2>{exercise.name}</h2>
              {/* Inputs for each set (reps, weight, set number) */}
          {Array.isArray(sessionData[exercise.id]) && sessionData[exercise.id].map((set, index) => (
            <div
              key={set && set._id ? set._id : `${exercise.id}-set-${index}`}
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
              {prev && Array.isArray(prev.sets) && (
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
                <p key={s && s._id ? s._id : `${exercise.id}-prevset-${idx}`} style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                  Set {idx + 1}: {s.reps || '-'} reps @ {s.weight || '-'} kg
                  {/* PR badge if this set exceeds previous session weight or reps */}
                  {sessionData[exercise.id] && sessionData[exercise.id][idx] &&
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
        })
      ) : (
        <div className="card" style={{ margin: '1rem 0', color: '#f87171' }}>No exercises in this routine.</div>
      )}
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
