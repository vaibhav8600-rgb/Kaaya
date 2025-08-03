import React, { useState } from 'react';
import { Line, Radar, Bar } from 'react-chartjs-2';
import {
  Chart,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip,
  Filler,
  RadarController,
  RadialLinearScale,
  BarElement,
} from 'chart.js';

// Register required chart types
Chart.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip,
  Filler,
  RadarController,
  RadialLinearScale,
  BarElement,
);

/**
 * Progress page displays enhanced analytics including line/area charts,
 * radar charts, bar charts, and stacked bar charts.  Mock data is used
 * for demonstration.  Users can toggle between week and month views to
 * simulate more interactive analytics.
 */
export default function Progress() {
  const [range, setRange] = useState('week');

  // Generate mock data based on range
  const labels = range === 'week'
    ? ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5']
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
  const strengthVals = range === 'week' ? [50, 55, 60, 65, 70] : [50, 60, 70, 80, 90];
  const weightVals = range === 'week' ? [70, 69.5, 69, 68.5, 68] : [70, 69, 68, 67.5, 67];
  const volumeVals = range === 'week' ? [90, 100, 110, 105, 115] : [400, 420, 450, 480, 500];

  // Line chart (with area fill) for strength
  const strengthData = {
    labels,
    datasets: [
      {
        label: 'Strength (kg)',
        data: strengthVals,
        borderColor: 'rgba(139,92,246,1)',
        backgroundColor: 'rgba(139,92,246,0.2)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Weight (kg)',
        data: weightVals,
        borderColor: 'rgba(236,72,153,1)',
        backgroundColor: 'rgba(236,72,153,0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };
  const lineOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: 'var(--text-color)' } },
      tooltip: {},
    },
    scales: {
      x: {
        ticks: { color: 'var(--text-color)' },
        grid: { color: 'rgba(255,255,255,0.1)' },
      },
      y: {
        ticks: { color: 'var(--text-color)' },
        grid: { color: 'rgba(255,255,255,0.1)' },
      },
    },
  };

  // Radar chart for body part development
  const radarData = {
    labels: ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'],
    datasets: [
      {
        label: 'Current',
        data: [70, 65, 80, 60, 75, 70],
        backgroundColor: 'rgba(67,56,202,0.2)',
        borderColor: 'rgba(67,56,202,1)',
        borderWidth: 1,
      },
      {
        label: 'Goal',
        data: [85, 80, 90, 75, 85, 80],
        backgroundColor: 'rgba(236,72,153,0.2)',
        borderColor: 'rgba(236,72,153,1)',
        borderWidth: 1,
      },
    ],
  };
  const radarOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: 'var(--text-color)' } },
      tooltip: {},
    },
    scales: {
      r: {
        angleLines: { color: 'rgba(255,255,255,0.1)' },
        grid: { color: 'rgba(255,255,255,0.1)' },
        pointLabels: { color: 'var(--text-color)' },
        ticks: { display: false },
      },
    },
  };

  // Bar chart for volume comparison
  const barData = {
    labels,
    datasets: [
      {
        label: 'Volume (kg)',
        data: volumeVals,
        backgroundColor: 'rgba(99,102,241,0.8)',
      },
    ],
  };
  const barOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: 'var(--text-color)' } },
    },
    scales: {
      x: {
        ticks: { color: 'var(--text-color)' },
        grid: { color: 'rgba(255,255,255,0.1)' },
      },
      y: {
        ticks: { color: 'var(--text-color)' },
        grid: { color: 'rgba(255,255,255,0.1)' },
      },
    },
  };

  // Stacked bar chart for sets vs volume (mock)
  const stackedData = {
    labels,
    datasets: [
      {
        label: 'Sets',
        data: range === 'week' ? [20, 22, 25, 24, 26] : [80, 85, 90, 95, 100],
        backgroundColor: 'rgba(139,92,246,0.8)',
        stack: 'Stack 0',
      },
      {
        label: 'Reps',
        data: range === 'week' ? [200, 220, 250, 240, 260] : [800, 850, 900, 950, 1000],
        backgroundColor: 'rgba(236,72,153,0.8)',
        stack: 'Stack 0',
      },
    ],
  };
  const stackedOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: 'var(--text-color)' } },
      tooltip: {},
    },
    scales: {
      x: {
        stacked: true,
        ticks: { color: 'var(--text-color)' },
        grid: { color: 'rgba(255,255,255,0.1)' },
      },
      y: {
        stacked: true,
        ticks: { color: 'var(--text-color)' },
        grid: { color: 'rgba(255,255,255,0.1)' },
      },
    },
  };

  return (
    <div>
      <h1>Progress</h1>
      {/* Time range toggle */}
      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => setRange('week')}
          className="btn-glow"
          style={{ marginRight: '0.5rem', opacity: range === 'week' ? 1 : 0.6 }}
        >
          Weekly
        </button>
        <button
          onClick={() => setRange('month')}
          className="btn-glow"
          style={{ opacity: range === 'month' ? 1 : 0.6 }}
        >
          Monthly
        </button>
      </div>
      <div className="card">
        <h2>Strength vs Weight</h2>
        <Line data={strengthData} options={lineOptions} />
      </div>
      <div className="card">
        <h2>Body Development Radar</h2>
        <Radar data={radarData} options={radarOptions} />
      </div>
      <div className="card">
        <h2>Volume</h2>
        <Bar data={barData} options={barOptions} />
      </div>
      <div className="card">
        <h2>Sets vs Reps (Stacked)</h2>
        <Bar data={stackedData} options={stackedOptions} />
      </div>
    </div>
  );
}
