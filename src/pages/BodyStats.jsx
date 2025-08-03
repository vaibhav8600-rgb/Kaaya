import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../context/UserContext';

/**
 * BodyStats page allows users to view and update body statistics such as
 * current weight and body fat percentage.  It also supports uploading
 * progress photos.  All data is persisted per user to localStorage.
 */
export default function BodyStats() {
  const { currentUser, updateUser } = useContext(UserContext);
  const userId = currentUser ? currentUser.id : null;
  const [weight, setWeight] = useState(currentUser?.bodyWeight || '');
  const [bodyFat, setBodyFat] = useState(currentUser?.bodyFat || '');
  const [photos, setPhotos] = useState([]);

  // Load saved photos from localStorage on mount or when user changes
  useEffect(() => {
    if (userId) {
      const stored = localStorage.getItem(`bodyPhotos_${userId}`);
      setPhotos(stored ? JSON.parse(stored) : []);
    }
  }, [userId]);

  // Persist photos whenever they change
  useEffect(() => {
    if (userId) {
      localStorage.setItem(`bodyPhotos_${userId}`, JSON.stringify(photos));
    }
  }, [photos, userId]);

  // We no longer persist weight/bodyFat on every render to avoid infinite loops.
  // Instead, we provide a Save button to persist the stats when user is ready.

  function handleFileChange(event) {
    const files = event.target.files;
    if (!files) return;
    const promises = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Convert file to Base64 data URL for persistence
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

  function saveStats() {
    if (currentUser) {
      updateUser(currentUser.id, { bodyWeight: weight, bodyFat });
    }
  }

  if (!currentUser) {
    return <p style={{ color: 'var(--muted-color)' }}>No user selected.</p>;
  }

  return (
    <div>
      <h1>Body Stats</h1>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Weight and body fat editing */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', color: 'var(--muted-color)' }}>Current Weight ({currentUser.units || 'kg'})</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Enter weight"
          />
          <label style={{ fontSize: '0.875rem', color: 'var(--muted-color)' }}>Body Fat %</label>
          <input
            type="number"
            value={bodyFat}
            onChange={(e) => setBodyFat(e.target.value)}
            placeholder="Enter body fat %"
          />
        </div>
        {/* Photo upload */}
        <div>
          <label style={{ fontSize: '0.875rem', color: 'var(--muted-color)', display: 'block', marginBottom: '0.25rem' }}>
            Upload Progress Photo
          </label>
          <input type="file" accept="image/*" multiple onChange={handleFileChange} />
        </div>
        {/* Photo thumbnails */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
          {photos.map((src, idx) => (
            <img
              key={idx}
              src={src}
              alt={`progress-${idx}`}
              className="photo-thumb"
            />
          ))}
        </div>
        {/* Save stats button */}
        <button onClick={saveStats} className="btn-glow" style={{ marginTop: '0.5rem' }}>
          Save Stats
        </button>
      </div>
    </div>
  );
}