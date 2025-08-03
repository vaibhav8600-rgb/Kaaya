import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

/**
 * Login page for Kaaya.  It presents a simple form inside a centered card
 * using plain CSS (no Tailwind utilities).  Upon submission it navigates
 * back to the home page.  In a real application this would authenticate
 * against a backend or local storage.
 */
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  // Pull auth functions and state from context.  We also need
  // loggedIn and logoutUser to enforce single‑user access.
  const { loginUser, registerUser, loggedIn, logoutUser } = useContext(UserContext);

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    // If there is an active session, prevent new login/registration
    if (loggedIn) {
      setError('Please log out from the current session to switch accounts.');
      return;
    }
    if (isRegister) {
      // registration flow
      if (!email || !password || !confirm || password !== confirm) {
        setError('Please enter matching passwords');
        return;
      }
      // rudimentary email format check
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address');
        return;
      }
      const success = registerUser({ name, email, password });
      if (success) navigate('/');
    } else {
      // login flow
      if (!email || !password) {
        setError('Please enter both email and password');
        return;
      }
      const success = loginUser({ email, password });
      if (success) navigate('/');
      else setError('Invalid credentials');
    }
  }

  function simulateLogin(provider) {
    // Simulate third‑party login: create or login dummy user
    const demoEmail = `${provider}@example.com`;
    const demoName = provider.charAt(0).toUpperCase() + provider.slice(1) + ' User';
    const demoPassword = 'demo123';
    // Try to login or register
    // Prevent simulation if a session is already active
    if (loggedIn) {
      setError('Please log out from the current session to switch accounts.');
      return;
    }
    if (!loginUser({ email: demoEmail, password: demoPassword })) {
      registerUser({ name: demoName, email: demoEmail, password: demoPassword });
    }
    navigate('/');
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 20% 30%, #15204f 0%, #0a0f24 45%, #05091b 100%)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '20rem',
          padding: '1.5rem',
          borderRadius: '1rem',
          background: 'rgba(17, 24, 39, 0.8)',
          boxShadow: '0 0 20px rgba(92, 39, 181, 0.4)',
        }}
        className="space-y-4"
      >
        <h1 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center' }}>Kaaya</h1>
        <p style={{ textAlign: 'center', color: '#9ca3af' }}>Train like a star. Track like a pro.</p>
        {error && <p style={{ color: '#f87171', textAlign: 'center' }}>{error}</p>}
        {/* If user is already logged in, show message and logout option instead of form */}
        {loggedIn ? (
          <div style={{ textAlign: 'center', margin: '1rem 0' }}>
            <p style={{ marginBottom: '1rem' }}>You are already logged in.</p>
            <button
              onClick={() => {
                logoutUser();
                setError('');
              }}
              className="btn-glow"
              style={{ width: '100%' }}
            >
              Log Out
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {isRegister && (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                required
              />
            )}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
            {isRegister && (
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm Password"
                required
              />
            )}
            <button type="submit" className="btn-glow" style={{ width: '100%' }}>
              {isRegister ? 'Register' : 'Log In'}
            </button>
          </form>
        )}
        <button
          onClick={() => setIsRegister((prev) => !prev)}
          style={{
            width: '100%',
            padding: '0.5rem 0',
            borderRadius: '0.5rem',
            border: '1px solid rgb(55, 65, 81)',
            color: '#d1d5db',
            background: 'transparent',
          }}
        >
          {isRegister ? 'Have an account? Log In' : 'Need an account? Register'}
        </button>
        <div style={{ marginTop: '0.5rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>
          <span>Or sign in with</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
          <button
            onClick={() => simulateLogin('google')}
            className="btn-glow"
            style={{ flex: 1, marginRight: '0.25rem' }}
          >
            Google
          </button>
          <button
            onClick={() => simulateLogin('apple')}
            className="btn-glow"
            style={{ flex: 1, marginLeft: '0.25rem' }}
          >
            Apple
          </button>
        </div>
      </div>
    </div>
  );
}
