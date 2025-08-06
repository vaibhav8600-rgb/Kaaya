import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Outlet, Link, useLocation } from 'react-router-dom';
// Using simple emoji icons instead of FontAwesome to avoid external
// dependencies.  Each nav item below specifies its own emoji.
import { UserContext } from '../context/UserContext';

/**
 * Layout component wraps all pages with a flexible container and
 * provides a bottom navigation bar. It uses simple CSS classes
 * defined in index.css instead of Tailwind utilities so that
 * the application can run without a build step.
 */
export default function Layout() {
  const location = useLocation();
  const { users, currentUserId } = useContext(UserContext);
  const navItems = [
    { to: '/', icon: '🏠', label: 'Home' },
    { to: '/workout', icon: '🏋️', label: 'Workout' },
    { to: '/routine', icon: '➕', label: 'Build' },
    { to: '/progress', icon: '📈', label: 'Progress' },
    { to: '/bodyweight', icon: '⚖️', label: 'Body & Weight' },
    { to: '/profile', icon: '👤', label: 'Profile' },
    { to: '/settings', icon: '⚙️', label: 'Settings' },
  ];
  return (
    <div className="app-container">
      <main className="page-container">
        {/* Page transition wrapper */}
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <nav className="navbar">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={location.pathname === item.to ? 'nav-item active' : 'nav-item'}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}