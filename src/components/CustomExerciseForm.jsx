import React, { useState } from 'react';

const defaultCategories = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Custom'];

export default function CustomExerciseForm({ onSave, onCancel, initial, categories }) {
  const [name, setName] = useState(initial?.name || '');
  const [group, setGroup] = useState(initial?.group || 'Custom');
  const [weightType, setWeightType] = useState(initial?.weightType || 'bodyweight');
  const [notes, setNotes] = useState(initial?.notes || '');

  return (
    <div className="card" style={{ padding: 16, margin: 8, background: '#222', borderRadius: 8 }}>
      <h3>{initial ? 'Edit' : 'Add'} Custom Exercise</h3>
      <label>Name</label>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Exercise name" />
      <label>Category</label>
      <select value={group} onChange={e => setGroup(e.target.value)}>
        {(categories || defaultCategories).map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
      <label>Weight Type</label>
      <select value={weightType} onChange={e => setWeightType(e.target.value)}>
        <option value="bodyweight">Bodyweight</option>
        <option value="barbell">Barbell</option>
        <option value="dumbbell">Dumbbell</option>
        <option value="machine">Machine</option>
        <option value="other">Other</option>
      </select>
      <label>Notes</label>
      <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (optional)" />
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button className="btn-glow" onClick={() => onSave({ name, group, weightType, notes })} disabled={!name.trim()}>Save</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
