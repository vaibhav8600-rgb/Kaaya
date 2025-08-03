import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import data, { getRoutines } from '../data/workouts';

export default function Home() {
  const routines = getRoutines();
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
            <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>400 sets</p>
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
            <span style={{ fontSize: '1.25rem', fontWeight: '600' }}>63</span>
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
