import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../context/UserContext';
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

// Register necessary Chart.js components once
Chart.register(LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip, Filler);

/**
 * Stats page combines weight tracking and body measurements/photo logging into a
 * single unified interface.  Users can add weight entries, view trends and
 * consistency heatmaps, edit measurements like body fat and custom fields,
 * and upload progress photos.  All data is persisted per user in localStorage
 * via context or explicit storage keys.
 */
export default function Stats() {
  const { currentUser, updateUser } = useContext(UserContext);
  const userId = currentUser ? currentUser.id : null;
  // Weight entry fields
  const [weightInput, setWeightInput] = useState('');
  const [bodyFatInput, setBodyFatInput] = useState('');
  const [waterInput, setWaterInput] = useState('');
  const [leanInput, setLeanInput] = useState('');
  // Weight logs
  const [logs, setLogs] = useState([]);
  // Measurement fields (persisted in user object)
  const [bodyWeight, setBodyWeight] = useState(currentUser?.bodyWeight || '');
  const [bodyFat, setBodyFat] = useState(currentUser?.bodyFat || '');
  const [arms, setArms] = useState(currentUser?.arms || '');
  const [chest, setChest] = useState(currentUser?.chest || '');
  const [waist, setWaist] = useState(currentUser?.waist || '');
  // Photos
  const [photos, setPhotos] = useState([]);

  // Load weight logs and photos from localStorage on mount or when user changes
  useEffect(() => {
    if (userId) {
      const storedLogs = localStorage.getItem(`weightLogs_${userId}`);
      setLogs(storedLogs ? JSON.parse(storedLogs) : []);
      const storedPhotos = localStorage.getItem(`bodyPhotos_${userId}`);
      setPhotos(storedPhotos ? JSON.parse(storedPhotos) : []);
    }
  }, [userId]);

  // Persist weight logs when they change
  useEffect(() => {
    if (userId) {
      try {
        localStorage.setItem(`weightLogs_${userId}`, JSON.stringify(logs));
      } catch (e) {
        console.error('Failed to persist weight logs', e);
      }
    }
  }, [logs, userId]);

  // Persist photos when they change
  useEffect(() => {
    if (userId) {
      localStorage.setItem(`bodyPhotos_${userId}`, JSON.stringify(photos));
    }
  }, [photos, userId]);

  // Handler to add weight entry
  function addWeightEntry() {
    if (!weightInput) return;
    const entry = {
      date: new Date().toISOString(),
      weight: parseFloat(weightInput),
      bodyFat: bodyFatInput ? parseFloat(bodyFatInput) : null,
      water: waterInput ? parseFloat(waterInput) : null,
      lean: leanInput ? parseFloat(leanInput) : null,
    };
    setLogs((prev) => {
      const updated = [...prev, entry];
      // Immediately persist to avoid data loss
      if (userId) {
        localStorage.setItem(`weightLogs_${userId}`, JSON.stringify(updated));
      }
      return updated;
    });
    setWeightInput('');
    setBodyFatInput('');
    setWaterInput('');
    setLeanInput('');
  }

  // Save measurement fields to user profile
  function saveMeasurements() {
    if (currentUser) {
      updateUser(currentUser.id, {
        bodyWeight: bodyWeight,
        bodyFat: bodyFat,
        arms: arms,
        chest: chest,
        waist: waist,
      });
    }
  }

  // Handle photo uploads (convert to base64 and persist)
  function handlePhotoChange(event) {
    const files = event.target.files;
    if (!files) return;
    const promises = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      const promise = new Promise((resolve) => {
        reader.onload = () => resolve(reader.result);
      });
      reader.readAsDataURL(file);
      promises.push(promise);
    }
    Promise.all(promises).then((dataUrls) => {
      setPhotos((prev) => [...prev, ...dataUrls]);
    });
  }

  if (!currentUser) {
    return <p style={{ color: 'var(--muted-color)' }}>No user selected.</p>;
  }

  // Prepare data for chart
  const sortedLogs = [...logs].sort((a, b) => new Date(a.date) - new Date(b.date));
  const labels = sortedLogs.map((l) => new Date(l.date).toLocaleDateString());
  const weights = sortedLogs.map((l) => l.weight);
  const chartData = {
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
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: 'var(--text-color)' } },
    },
    scales: {
      x: { ticks: { color: 'var(--text-color)' }, grid: { color: 'rgba(255,255,255,0.1)' } },
      y: { ticks: { color: 'var(--text-color)' }, grid: { color: 'rgba(255,255,255,0.1)' } },
    },
  };
  // Heatmap for last 30 days
  const heatmap = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const dateStr = date.toISOString().split('T')[0];
    const hasEntry = logs.some((l) => l.date.startsWith(dateStr));
    heatmap.push({ date: dateStr, logged: hasEntry });
  }

  return (
    <div>
      <h1>Body & Weight</h1>
      {/* Weight logging section */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h2>Weight Log</h2>
        <label>Weight ({currentUser.units || 'kg'})</label>
        <input type="number" value={weightInput} onChange={(e) => setWeightInput(e.target.value)} />
        <label>Body Fat % (optional)</label>
        <input type="number" value={bodyFatInput} onChange={(e) => setBodyFatInput(e.target.value)} />
        <label>Water % (optional)</label>
        <input type="number" value={waterInput} onChange={(e) => setWaterInput(e.target.value)} />
        <label>Lean Mass (optional)</label>
        <input type="number" value={leanInput} onChange={(e) => setLeanInput(e.target.value)} />
        <button onClick={addWeightEntry} className="btn-glow" style={{ marginTop: '0.5rem' }}>
          Add Entry
        </button>
      </div>
      <div className="card">
        <h2>Weight Trend</h2>
        {weights.length > 0 ? <Line data={chartData} options={chartOptions} /> : <p>No entries yet</p>}
      </div>
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
      {/* Measurements section */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h2>Body Measurements</h2>
        <label>Body Weight ({currentUser.units || 'kg'})</label>
        <input type="number" value={bodyWeight} onChange={(e) => setBodyWeight(e.target.value)} />
        <label>Body Fat %</label>
        <input type="number" value={bodyFat} onChange={(e) => setBodyFat(e.target.value)} />
        <label>Arms (cm/in)</label>
        <input type="number" value={arms} onChange={(e) => setArms(e.target.value)} />
        <label>Chest (cm/in)</label>
        <input type="number" value={chest} onChange={(e) => setChest(e.target.value)} />
        <label>Waist (cm/in)</label>
        <input type="number" value={waist} onChange={(e) => setWaist(e.target.value)} />
        <button onClick={saveMeasurements} className="btn-glow" style={{ marginTop: '0.5rem' }}>
          Save Measurements
        </button>
      </div>
      {/* Progress photos section */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h2>Progress Photos</h2>
        <input type="file" accept="image/*" multiple onChange={handlePhotoChange} />
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
          {photos.map((src, idx) => (
            <img key={idx} src={src} alt={`progress-${idx}`} className="photo-thumb" />
          ))}
        </div>
      </div>
    </div>
  );
}