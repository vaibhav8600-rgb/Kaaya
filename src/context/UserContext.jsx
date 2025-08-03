import React, { createContext, useEffect, useState } from 'react';

/**
 * UserContext manages multiple local user profiles.  Each user has their own
 * data namespace for logs, preferences, and goals.  A currentUserId
 * reference is maintained in localStorage to persist the last active user.
 */
export const UserContext = createContext({
  users: [],
  currentUser: null,
  currentUserId: null,
  loggedIn: false,
  switchUser: () => {},
  createUser: () => {},
  deleteUser: () => {},
  updateUser: () => {},
  registerUser: () => {},
  loginUser: () => {},
  logoutUser: () => {},
});

export default function UserProvider({ children }) {
  const [users, setUsers] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('users');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });
  const [currentUserId, setCurrentUserId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('currentUserId') || null;
    }
    return null;
  });

  const [loggedIn, setLoggedIn] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('loggedIn') === 'true';
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUserId != null) {
      localStorage.setItem('currentUserId', currentUserId);
    }
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem('loggedIn', loggedIn);
  }, [loggedIn]);

  const currentUser = users.find((u) => u.id === currentUserId) || null;

  function switchUser(id) {
    setCurrentUserId(id);
  }

  function createUser(userData) {
    const id = Date.now().toString();
    const newUser = { id, ...userData };
    setUsers((prev) => [...prev, newUser]);
    setCurrentUserId(id);
  }

  function deleteUser(id) {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    if (id === currentUserId) {
      // if deleting current user, switch to another or null
      const remaining = users.filter((u) => u.id !== id);
      setCurrentUserId(remaining.length > 0 ? remaining[0].id : null);
    }
  }

  function updateUser(id, updates) {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
  }

  // Register a new user with email and password
  function registerUser({ name, email, password }) {
    // Basic validation: ensure email and password lengths
    if (!email || !password || password.length < 6) {
      alert('Invalid registration details');
      return false;
    }
    if (users.find((u) => u.email === email)) {
      alert('Email already registered');
      return false;
    }
    const id = Date.now().toString();
    const newUser = {
      id,
      name: name || 'User',
      email,
      password,
      age: '',
      height: '',
      units: 'kg',
      theme: 'dark',
      photo: '',
    };
    setUsers((prev) => [...prev, newUser]);
    setCurrentUserId(id);
    setLoggedIn(true);
    return true;
  }

  // Login with email and password
  function loginUser({ email, password }) {
    const found = users.find((u) => u.email === email && u.password === password);
    if (!found) {
      alert('Invalid credentials');
      return false;
    }
    setCurrentUserId(found.id);
    setLoggedIn(true);
    return true;
  }

  function logoutUser() {
    setLoggedIn(false);
    setCurrentUserId(null);
  }

  return (
    <UserContext.Provider
      value={{
        users,
        currentUser,
        currentUserId,
        loggedIn,
        switchUser,
        createUser,
        deleteUser,
        updateUser,
        registerUser,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}