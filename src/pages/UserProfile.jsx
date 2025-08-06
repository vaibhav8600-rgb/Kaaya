import React, { useContext, useState } from 'react';
import { UserContext } from '../context/UserContext';
import { ThemeContext } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { validateAndCompressImage, MAX_IMAGE_SIZE_MB } from '../utils/imageUtils';

/**
 * UserProfile page displays and allows editing of the current user's personal
 * information such as name, age, height, email, and photo.  Users can also
 * choose units and theme preferences here.  All changes are persisted via
 * the UserContext.
 */
export default function UserProfile() {
  const { currentUser, updateUser } = useContext(UserContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { logoutUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [preview, setPreview] = useState(currentUser?.photo || '');
  // Local state for all fields to prevent context update on every keystroke
  const [form, setForm] = useState({
    name: currentUser.name || '',
    age: currentUser.age || '',
    height: currentUser.height || '',
    email: currentUser.email || '',
    units: currentUser.units || 'kg',
  });

  if (!currentUser) {
    return <p style={{ color: 'var(--muted-color)' }}>No user selected.</p>;
  }

  async function handlePhotoChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const { thumbnail } = await validateAndCompressImage(file);
      setPreview(thumbnail);
      updateUser(currentUser.id, { photo: thumbnail });
    } catch (err) {
      alert(err.message || `Image too large. Please upload an image under ${MAX_IMAGE_SIZE_MB}MB.`);
    }
  }

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleBlur(field) {
    if (form[field] !== currentUser[field]) {
      updateUser(currentUser.id, { [field]: form[field] });
    }
  }

  return (
    <div>
      <h1>Profile</h1>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {preview ? (
            <img src={preview} alt="profile" style={{ width: '6rem', height: '6rem', borderRadius: '3rem', objectFit: 'cover', border: '2px solid var(--button-mid)' }} />
          ) : (
            <div style={{ width: '6rem', height: '6rem', borderRadius: '3rem', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '2rem', color: 'var(--muted-color)' }}>👤</span>
            </div>
          )}
        </div>
        <label>Name</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => handleChange('name', e.target.value)}
          onBlur={() => handleBlur('name')}
        />
        <label>Age</label>
        <input
          type="number"
          value={form.age}
          onChange={(e) => handleChange('age', e.target.value)}
          onBlur={() => handleBlur('age')}
        />
        <label>Height (cm)</label>
        <input
          type="number"
          value={form.height}
          onChange={(e) => handleChange('height', e.target.value)}
          onBlur={() => handleBlur('height')}
        />
        <label>Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => handleChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
        />
        <label>Units</label>
        <select
          value={form.units}
          onChange={(e) => handleChange('units', e.target.value)}
          onBlur={() => handleBlur('units')}
        >
          <option value="kg">kg</option>
          <option value="lbs">lbs</option>
        </select>
        <label>Theme</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
          <span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
        </div>
        <label>Photo</label>
        <input type="file" accept="image/*" onChange={handlePhotoChange} />
        {/* Logout Button */}
        <button
          onClick={() => {
            logoutUser();
            navigate('/login');
          }}
          className="btn-glow"
          style={{ marginTop: '1rem' }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}