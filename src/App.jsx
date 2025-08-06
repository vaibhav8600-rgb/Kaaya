import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import BodyAndWeight from './pages/BodyAndWeight';
import Workout from './pages/Workout';
import RoutineBuilder from './pages/RoutineBuilder';
import Progress from './pages/Progress';
import History from './pages/History';
// BodyStats has been merged into Stats
import Settings from './pages/Settings';
import Login from './pages/Login';
import UserProfile from './pages/UserProfile';
import Stats from './pages/Stats';
import { UserContext } from './context/UserContext';
import Layout from './components/Layout';

export default function App() {
  const { loggedIn } = useContext(UserContext);

  // Helper component to protect private routes
  const PrivateRoute = ({ element }) => {
    return loggedIn ? element : <Navigate to="/login" replace />;
  };

  return (
    <Routes>
      {/* Protected routes inside Layout */}
      <Route element={loggedIn ? <Layout /> : <Navigate to="/login" replace /> }>
        <Route path="/" element={<PrivateRoute element={<Home />} />} />
        <Route path="/workout" element={<PrivateRoute element={<Workout />} />} />
        <Route path="/routine" element={<PrivateRoute element={<RoutineBuilder />} />} />
        <Route path="/progress" element={<PrivateRoute element={<Progress />} />} />
        <Route path="/history" element={<PrivateRoute element={<History />} />} />
        {/* Unified body/weight stats page */}
        <Route path="/bodyweight" element={<PrivateRoute element={<BodyAndWeight />} />} />
        <Route path="/profile" element={<PrivateRoute element={<UserProfile />} />} />
        <Route path="/settings" element={<PrivateRoute element={<Settings />} />} />
      </Route>
      {/* Login page is accessible regardless */}
      <Route path="/login" element={<Login />} />
      {/* Default redirect: if logged in go to home, else login */}
      <Route
        path="*"
        element={<Navigate to={loggedIn ? '/' : '/login'} replace />}
      />
    </Routes>
  );
}
