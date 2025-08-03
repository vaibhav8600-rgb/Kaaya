import React, { useContext, useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip,
  Filler,
} from 'chart.js';
import { UserContext } from '../context/UserContext';

// Register components for Chart.js
Chart.register(LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip, Filler);

/**
 * WeightTracker page allows users to record daily/weekly body weight and
 * optional metrics like body fat %, water %, and lean mass.  It displays
 * historical logs in a list, visualizes trends using a line/area chart,
 * shows progress toward a goal weight, and renders a simple heatmap of
 * logging consistency over the past month.
 */
export default function WeightTracker() {
  const { currentUser, updateUser } = useContext(UserContext);
  const userId = currentUser ? currentUser.id : null;
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [water, setWater] = useState('');
  const [lean, setLean] = useState('');
  const [logs, setLogs] = useState([]);
  const [range, setRange] = useState('week');

  // Load logs from localStorage on mount or when user changes
  useEffect(() => {
    if (userId) {
      const stored = localStorage.getItem(`weightLogs_${userId}`);
      setLogs(stored ? JSON.parse(stored) : []);
    }
  }, [userId]);

  // Save logs to localStorage whenever they change
  useEffect(() => {
    if (userId) {
      localStorage.setItem(`weightLogs_${userId}`, JSON.stringify(logs));
    }
  }, [logs, userId]);

  // Handle adding a new weight entry
  function addEntry() {
    if (!weight) return;
    const entry = {
      date: new Date().toISOString(),
      weight: parseFloat(weight),
      bodyFat: bodyFat ? parseFloat(bodyFat) : null,
      water: water ? parseFloat(water) : null,
      lean: lean ? parseFloat(lean) : null,
    };
    setLogs((prev) => {
      const updated = [...prev, entry];
      // Persist immediately to avoid data loss on navigation before effect runs
      if (userId) {
        try {
          localStorage.setItem(`weightLogs_${userId}`, JSON.stringify(updated));
        } catch (e) {
          console.error('Failed to persist weight logs', e);
        }
      }
      return updated;
    });
    setWeight('');
    setBodyFat('');
    setWater('');
    setLean('');
  }

  // Derived values for chart and goal progress
  const sortedLogs = [...logs].sort((a, b) => new Date(a.date) - new Date(b.date));
  const labels = sortedLogs.map((l) => new Date(l.date).toLocaleDateString());
  const weights = sortedLogs.map((l) => l.weight);
  // Chart data
  const data = {
    labels,
    datasets: [
      {
        label: 'Weight',
        data: weights,
        borderColor: 'rgba(139,92,246,1)',
        backgroundColor: 'rgba(139,92,246,0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: { labels: { color: 'var(--text-color)' } },
    },
    scales: {
      x: {
        ticks: { color: 'var(--text-color)' },
        grid: { color: 'rgba(255,255,255,0.1)' },
      },
      y: {
        ticks: { color: 'var(--text-color)' },
        grid: { color: 'rgba(255,255,255,0.1)' },
      },
    },
  };

  // Goal progress calculations
  const goalWeight = currentUser?.goalWeight ? parseFloat(currentUser.goalWeight) : null;
  const goalDate = currentUser?.goalDate ? new Date(currentUser.goalDate) : null;
  const currentWeight = weights.length > 0 ? weights[weights.length - 1] : null;
  const startWeight = weights.length > 0 ? weights[0] : null;
  let progressPercent = 0;
  let daysRemaining = null;
  if (goalWeight != null && startWeight != null && currentWeight != null) {
    const totalDiff = Math.abs(goalWeight - startWeight);
    const currentDiff = Math.abs(currentWeight - startWeight);
    progressPercent = totalDiff !== 0 ? Math.min((currentDiff / totalDiff) * 100, 100) : 0;
  }
  if (goalDate) {
    const diffMs = goalDate.getTime() - Date.now();
    daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }

  // Heatmap data: create array of last 30 days with boolean flag
  const heatmap = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const dateStr = date.toISOString().split('T')[0];
    const hasEntry = logs.some((l) => l.date.startsWith(dateStr));
    heatmap.push({ date: dateStr, logged: hasEntry });
  }

  // BMI calculation if height available
  const bmi = currentUser?.height && currentWeight
    ? (currentWeight / Math.pow(parseFloat(currentUser.height) / 100, 2)).toFixed(1)
    : null;

  return (
    <div>
      <h1>Weight Tracker</h1>
      {/* Entry form */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label>Weight ({currentUser?.units || 'kg'})</label>
        <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
        <label>Body Fat % (optional)</label>
        <input type="number" value={bodyFat} onChange={(e) => setBodyFat(e.target.value)} />
        <label>Water % (optional)</label>
        <input type="number" value={water} onChange={(e) => setWater(e.target.value)} />
        <label>Lean Mass (optional)</label>
        <input type="number" value={lean} onChange={(e) => setLean(e.target.value)} />
        <button onClick={addEntry} className="btn-glow" style={{ marginTop: '0.5rem' }}>
          Add Entry
        </button>
      </div>
      {/* Goal setup */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <h2>Goal</h2>
        <label>Target Weight ({currentUser?.units || 'kg'})</label>
        <input
          type="number"
          value={currentUser?.goalWeight || ''}
          onChange={(e) => updateUser(currentUser.id, { goalWeight: e.target.value })}
        />
        <label>Goal Date</label>
        <input
          type="date"
          value={currentUser?.goalDate || ''}
          onChange={(e) => updateUser(currentUser.id, { goalDate: e.target.value })}
        />
        {goalWeight && currentWeight != null && (
          <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--muted-color)' }}>
              Progress: {progressPercent.toFixed(1)}%
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--muted-color)' }}>
              {daysRemaining != null ? `${daysRemaining} days remaining` : ''}
            </p>
            <div style={{ height: '0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '0.25rem' }}>
              <div
                style={{
                  width: `${progressPercent}%`,
                  height: '100%',
                  background: 'linear-gradient(to right, var(--button-start), var(--button-mid), var(--button-end))',
                  borderRadius: '0.25rem',
                }}
              ></div>
            </div>
          </div>
        )}
      </div>
      {/* Chart */}
      <div className="card">
        <h2>Weight Trend</h2>
        {weights.length > 0 ? <Line data={data} options={options} /> : <p>No entries yet</p>}
      </div>
      {/* Heatmap */}
      <div className="card">
        <h2>Logging Consistency</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '0.25rem' }}>
          {heatmap.map((cell, idx) => (
            <div
              key={idx}
              title={`${cell.date} ${cell.logged ? '✔️' : '✖️'}`}
              style={{
                width: '1.2rem',
                height: '1.2rem',
                borderRadius: '0.25rem',
                background: cell.logged
                  ? 'linear-gradient(to right, var(--button-start), var(--button-mid), var(--button-end))'
                  : 'rgba(255,255,255,0.1)',
              }}
            ></div>
          ))}
        </div>
      </div>
      {/* History list */}
      <div className="card">
        <h2>History</h2>
        {sortedLogs.length === 0 && <p>No weight logs yet.</p>}
        {sortedLogs.map((entry, idx) => (
          <div
            key={idx}
            style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}
          >
            <span>{new Date(entry.date).toLocaleDateString()}</span>
            <span>{entry.weight} {currentUser?.units || 'kg'}</span>
            {entry.bodyFat != null && <span>{entry.bodyFat}%</span>}
          </div>
        ))}
      </div>
      {/* BMI display */}
      {bmi && (
        <div className="card">
          <h2>BMI</h2>
          <p>Your BMI is {bmi}</p>
        </div>
      )}
    </div>
  );
}