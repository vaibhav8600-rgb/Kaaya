import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import data, { getRoutines } from '../data/workouts';
import { useContext } from 'react';
import { UserContext } from '../context/UserContext';

export default function Home() {
  const routines = getRoutines();
  const { currentUser, updateUser } = useContext(UserContext);
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
      {/* Routines */}
      {routines.map((routine) => (
        <div key={routine.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '1.125rem', fontWeight: '600' }}>{routine.name}</p>
            <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>{routine.description}</p>
          </div>
          <Link to={`/workout?routine=${routine.id}`}>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-glow">
              Start
            </motion.button>
          </Link>
        </div>
      ))}
    </div>
  );
}
