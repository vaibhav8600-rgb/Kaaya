import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import data, { getRoutines } from '../data/workouts';
import { UserContext } from '../context/UserContext';

export default function Home() {
  const routines = getRoutines();
  // Only show routines with visibleOnHome !== false (default true)
  const [routineList, setRoutineList] = useState(routines);
  const [showManage, setShowManage] = useState(false);
  const visibleRoutines = routineList.filter(r => r.visibleOnHome !== false);
  const hiddenRoutines = routineList.filter(r => r.visibleOnHome === false);

  // Hide routine handler
  function toggleVisibility(routineId) {
    setRoutineList(prev => prev.map(r =>
      r.id === routineId ? { ...r, visibleOnHome: r.visibleOnHome === false ? true : false } : r
    ));
    // Update in localStorage for imported routines
    let imported = [];
    try {
      imported = JSON.parse(localStorage.getItem('importedRoutines')) || [];
    } catch { imported = []; }
    let updated = false;
    imported = imported.map(r => {
      if (r.id === routineId) { updated = true; return { ...r, visibleOnHome: r.visibleOnHome === false ? true : false }; }
      return r;
    });
    if (updated) {
      localStorage.setItem('importedRoutines', JSON.stringify(imported));
    }
  }
  const { currentUser, updateUser } = useContext(UserContext) || {};
  // Weekly goal state logic
  const [goalInput, setGoalInput] = useState(() => {
    if (currentUser?.weeklyGoal !== undefined && currentUser?.weeklyGoal !== null) return currentUser.weeklyGoal;
    const stored = localStorage.getItem('userWeeklyGoal');
    if (stored && !isNaN(Number(stored))) return Number(stored);
    return 400;
  });
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalError, setGoalError] = useState('');
  const weeklyGoal = currentUser?.weeklyGoal ?? goalInput;
  const currentSetsDone = currentUser?.currentSetsDone ?? 0;

  function handleGoalSave() {
    const val = Number(goalInput);
    if (!Number.isInteger(val) || val <= 0) {
      setGoalError('Please enter a positive integer.');
      return;
    }
    setGoalError('');
    localStorage.setItem('userWeeklyGoal', val);
    if (currentUser) updateUser(currentUser.id, { weeklyGoal: val });
    setEditingGoal(false);
  }

  function handleGoalReset() {
    setGoalInput(400);
    localStorage.removeItem('userWeeklyGoal');
    if (currentUser) updateUser(currentUser.id, { weeklyGoal: 400 });
    setEditingGoal(false);
  }

  return (
    <div className="page-container">
      {/* Greeting heading replaces the old Home heading.  It uses a subtle fade-in animation and cosmic styling. */}
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--active-color)' }}
      >
        Welcome to Kaaya
      </motion.h2>
      {/* Goals */}
      <div className="card">
        <h2>Workout goal</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Weekly goal</p>
            {editingGoal ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="number"
                  min={1}
                  value={goalInput}
                  onChange={e => setGoalInput(e.target.value.replace(/[^\d]/g, ''))}
                  style={{ fontSize: '1.2rem', width: 80 }}
                />
                <button className="btn-glow" onClick={handleGoalSave} style={{ padding: '0.2rem 0.7rem' }}>Save</button>
                <button onClick={() => setEditingGoal(false)} style={{ padding: '0.2rem 0.7rem' }}>Cancel</button>
                <button onClick={handleGoalReset} style={{ padding: '0.2rem 0.7rem' }}>Reset</button>
              </div>
            ) : (
              <>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', display: 'inline-block', marginRight: 8 }}>{weeklyGoal ? `${weeklyGoal} sets` : 'Not set'}</p>
                <button onClick={() => setEditingGoal(true)} style={{ fontSize: '1rem', marginLeft: 4 }} title="Edit goal">✏️</button>
              </>
            )}
            {goalError && <div style={{ color: '#f87171', fontSize: 12 }}>{goalError}</div>}
          </div>
          <div
            style={{
              width: '4rem',
              height: '4rem',
              borderRadius: '9999px',
              border: '4px solid #8b5cf6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 0 10px rgba(139, 92, 246, 0.4)',
            }}
          >
            <span style={{ fontSize: '1.25rem', fontWeight: '600' }}>{currentSetsDone}</span>
          </div>
        </div>
      </div>
      {/* Floating Manage Routines Icon Button */}
      <div
        className="fixed bottom-6 right-6 bg-black/30 p-3 rounded-full border border-cyan-500 shadow-[0_0_12px_#00eaff] hover:bg-cyan-500 hover:text-black drop-shadow-[0_0_8px_#8b5cf6] cursor-pointer transition duration-200 z-50"
        onClick={() => setShowManage(true)}
        title="Manage Routines"
        aria-label="Manage Routines"
        style={{ lineHeight: 1, fontSize: '1.7rem', display: 'flex', alignItems: 'center', justifyContent: 'right' }}
      >
        ⚙️ 
      </div>
      {visibleRoutines.length === 0 ? (
        <div className="card" style={{ margin: '1rem 0', color: '#f87171', textAlign: 'center' }}>
          No active routines. Add from builder.
        </div>
      ) : (
        visibleRoutines.map((routine) => (
          <motion.div
            key={routine.id}
            whileHover={{ scale: 1.02, boxShadow: '0 0 18px #00eaff' }}
            whileTap={{ scale: 0.98 }}
            className="relative card p-4 rounded-xl bg-black/20 border border-cyan-700 backdrop-blur shadow-[0_0_15px_#00eaff] min-h-[110px] cursor-pointer transition"
            tabIndex={0}
            onClick={() => window.location.href = `/workout?routine=${routine.id}`}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                window.location.href = `/workout?routine=${routine.id}`;
              }
            }}
            aria-label={`Start ${routine.name} routine`}
            role="button"
          >
            {/* Hide icon top-right */}
            <div
              onClick={e => { e.stopPropagation(); toggleVisibility(routine.id); }}
              title="Hide Routine"
              aria-label="Hide Routine"
              className="absolute top-2 right-2 p-1 rounded-full bg-black/30 hover:bg-black/50 cursor-pointer text-pink-300 z-10"
              style={{ lineHeight: 1, fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'right'}}
            >
              👁️
            </div>
            <h3 className="text-white font-semibold text-lg" style={{ margin: 0 }}>{routine.name}</h3>
            <p className="text-gray-400 text-sm mt-3">{routine.description || (routine.muscleGroups ? routine.muscleGroups.join(', ') : '')}</p>
          </motion.div>
        ))
      )}

      {/* Manage Hidden Routines Modal */}
      {showManage && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div className="bg-black/90 p-6 rounded-xl border border-violet-500 shadow-lg" style={{ minWidth: 320, maxWidth: 400 }}>
            <h2 className="text-xl font-bold text-white mb-4">Hidden Routines</h2>
            {hiddenRoutines.length === 0 ? (
              <div className="text-slate-400 italic mb-4">No hidden routines.</div>
            ) : (
              hiddenRoutines.map(routine => (
                <div key={routine.id} className="bg-black/40 p-3 rounded-lg mb-3 border border-violet-500 flex items-center justify-between">
                  <h4 className="text-white" style={{ margin: 0 }}>{routine.name}</h4>
                  <div
                    onClick={() => toggleVisibility(routine.id)}
                    title="Unhide Routine"
                    aria-label="Unhide Routine"
                    className="cursor-pointer text-cyan-400 hover:text-green-400 text-[1.15rem] drop-shadow-[0_0_5px_#00eaff] transition duration-200"
                    style={{ marginLeft: 12 }}
                  >
                    👁️
                  </div>
                </div>
              ))
            )}
            <button
              className="mt-2 px-4 py-1 rounded bg-cyan-500 text-black hover:bg-cyan-400 transition-all duration-200"
              onClick={() => setShowManage(false)}
              style={{ width: '100%' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
