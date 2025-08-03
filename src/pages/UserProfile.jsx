import React, { useContext, useState } from 'react';
import { UserContext } from '../context/UserContext';
import { ThemeContext } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

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

  if (!currentUser) {
    return <p style={{ color: 'var(--muted-color)' }}>No user selected.</p>;
  }

  function handlePhotoChange(e) {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        setPreview(dataUrl);
        updateUser(currentUser.id, { photo: dataUrl });
      };
      reader.readAsDataURL(file);
    }
  }

  function handleChange(field, value) {
    updateUser(currentUser.id, { [field]: value });
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
        <input type="text" value={currentUser.name || ''} onChange={(e) => handleChange('name', e.target.value)} />
        <label>Age</label>
        <input type="number" value={currentUser.age || ''} onChange={(e) => handleChange('age', e.target.value)} />
        <label>Height (cm)</label>
        <input type="number" value={currentUser.height || ''} onChange={(e) => handleChange('height', e.target.value)} />
        <label>Email</label>
        <input type="email" value={currentUser.email || ''} onChange={(e) => handleChange('email', e.target.value)} />
        <label>Units</label>
        <select value={currentUser.units || 'kg'} onChange={(e) => handleChange('units', e.target.value)}>
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