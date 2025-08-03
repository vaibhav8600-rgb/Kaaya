import React, { createContext, useEffect, useState } from 'react';

/**
 * ThemeContext provides a global dark/light theme state and toggle handler.
 * The preference is persisted to localStorage under the key `theme`.
 * When the theme changes, it updates a class on the document element
 * (`theme-dark` or `theme-light`) so CSS can switch variables accordingly.
 */
export const ThemeContext = createContext({ theme: 'dark', toggleTheme: () => {} });

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Read initial theme from localStorage or default to dark
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    // Persist theme preference
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
      // Apply class to html element to drive CSS variables
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('theme-dark');
        root.classList.remove('theme-light');
      } else {
        root.classList.add('theme-light');
        root.classList.remove('theme-dark');
      }
    }
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}