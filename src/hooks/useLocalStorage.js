import { useState, useEffect } from 'react';

/**
 * Persist a piece of state to localStorage.
 * @param {string} key
 * @param {*} initialValue
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
