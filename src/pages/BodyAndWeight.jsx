import React, { useContext, useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { UserContext } from '../context/UserContext';
import { validateAndCompressImage, MAX_IMAGE_SIZE_MB } from '../utils/imageUtils';
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

Chart.register(LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip, Filler);

export default function BodyAndWeight() {
  const { currentUser, updateUser } = useContext(UserContext);
  const userId = currentUser ? currentUser.id : null;
  // Weight log state
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [water, setWater] = useState('');
  const [lean, setLean] = useState('');
  const [logs, setLogs] = useState([]);
  // Measurements state
  const [bodyWeight, setBodyWeight] = useState(currentUser?.bodyWeight || '');
  const [bodyFatM, setBodyFatM] = useState(currentUser?.bodyFat || '');
  const [arms, setArms] = useState(currentUser?.arms || '');
  const [chest, setChest] = useState(currentUser?.chest || '');
  const [waist, setWaist] = useState(currentUser?.waist || '');
  // Photos
  const [photos, setPhotos] = useState([]);

  // Load logs and photos from localStorage on mount or user change
  useEffect(() => {
    if (userId) {
      const storedLogs = localStorage.getItem(`weightLogs_${userId}`);
      setLogs(storedLogs ? JSON.parse(storedLogs) : []);
      const storedPhotos = localStorage.getItem(`bodyPhotos_${userId}`);
      setPhotos(storedPhotos ? JSON.parse(storedPhotos) : []);
    }
  }, [userId]);

  // Persist logs/photos when they change
  useEffect(() => {
    if (userId) {
      localStorage.setItem(`weightLogs_${userId}`, JSON.stringify(logs));
    }
  }, [logs, userId]);
  useEffect(() => {
    if (userId) {
      localStorage.setItem(`bodyPhotos_${userId}`, JSON.stringify(photos));
    }
  }, [photos, userId]);

  // Add weight entry
  function addWeightEntry() {
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
      if (userId) {
        localStorage.setItem(`weightLogs_${userId}`, JSON.stringify(updated));
      }
      return updated;
    });
    setWeight(''); setBodyFat(''); setWater(''); setLean('');
  }

  // Save measurements
  function saveMeasurements() {
    if (currentUser) {
      updateUser(currentUser.id, {
        bodyWeight: bodyWeight,
        bodyFat: bodyFatM,
        arms: arms,
        chest: chest,
        waist: waist,
      });
    }
  }

  // Handle photo uploads
  async function handlePhotoChange(event) {
    const files = event.target.files;
    if (!files) return;
    const promises = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      promises.push(
        validateAndCompressImage(file)
          .then(({ thumbnail }) => thumbnail)
          .catch((err) => {
            alert(err.message || `Image too large. Please upload an image under ${MAX_IMAGE_SIZE_MB}MB.`);
            return null;
          })
      );
    }
    const dataUrls = await Promise.all(promises);
    setPhotos((prev) => [...prev, ...dataUrls.filter(Boolean)]);
  }

  // Chart data
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

  if (!currentUser) {
    return <p style={{ color: 'var(--muted-color)' }}>No user selected.</p>;
  }

  return (
    <div>
      <h1>Body & Weight</h1>
      {/* Weight logging section */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h2>Weight Log</h2>
        <label>Weight ({currentUser.units || 'kg'})</label>
        <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
        <label>Body Fat % (optional)</label>
        <input type="number" value={bodyFat} onChange={(e) => setBodyFat(e.target.value)} />
        <label>Water % (optional)</label>
        <input type="number" value={water} onChange={(e) => setWater(e.target.value)} />
        <label>Lean Mass (optional)</label>
        <input type="number" value={lean} onChange={(e) => setLean(e.target.value)} />
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
        <input type="number" value={bodyFatM} onChange={(e) => setBodyFatM(e.target.value)} />
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
            <div key={idx} style={{ position: 'relative', display: 'inline-block' }}>
              <img
                src={src}
                alt={`progress-${idx}`}
                className="photo-thumb"
                style={{ display: 'block' }}
              />
              <button
                aria-label="Delete photo"
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  background: 'rgba(0,0,0,0.5)',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '50%',
                  width: 22,
                  height: 22,
                  cursor: 'pointer',
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                }}
                onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== idx))}
                title="Delete photo"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
