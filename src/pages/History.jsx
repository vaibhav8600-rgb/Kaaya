import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, Legend, Tooltip } from 'chart.js';

Chart.register(BarElement, CategoryScale, LinearScale, Legend, Tooltip);

/**
 * History page displays a bar chart of sets completed over several weeks.
 * It uses card styling instead of Tailwind utility classes.
 */
export default function History() {
  const data = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
    datasets: [
      {
        label: 'Sets Completed',
        data: [90, 100, 110, 105, 115],
        backgroundColor: 'rgba(99,102,241,0.8)',
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: '#fff' },
      },
    },
    scales: {
      x: {
        ticks: { color: '#fff' },
        grid: { color: 'rgba(255,255,255,0.1)' },
      },
      y: {
        ticks: { color: '#fff' },
        grid: { color: 'rgba(255,255,255,0.1)' },
      },
    },
  };
  return (
    <div>
      <h1>History</h1>
      <div className="card">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
