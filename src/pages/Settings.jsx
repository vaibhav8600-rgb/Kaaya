import React, { useState, useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

/**
 * Settings page allows toggling dark mode, selecting units, exporting data,
 * and enabling notifications.  It uses card styling and basic form
 * controls instead of Tailwind utility classes.
 */
export default function Settings() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [units, setUnits] = useState('kg');
  const [notifications, setNotifications] = useState(false);

  // State for import preview (optional)
  const [importPreview, setImportPreview] = useState(null);

  // Handle importing CSV or JSON workout/body stat data
  function handleImport(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        let parsed;
        if (file.name.endsWith('.json')) {
          parsed = JSON.parse(content);
        } else if (file.name.endsWith('.csv')) {
          parsed = parseCsv(content);
        } else {
          alert('Unsupported file type. Please select a CSV or JSON file.');
          return;
        }
        // Show preview and ask for confirmation
        const confirmImport = window.confirm(
          `Import ${Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length} entries from ${file.name}?`
        );
        if (confirmImport) {
          mergeImportedData(parsed);
          alert('Data imported successfully!');
        }
      } catch (err) {
        console.error(err);
        alert('Failed to parse file. Please check the format.');
      }
    };
    reader.readAsText(file);
  }

  // Basic CSV parser: expects first line as headers
  function parseCsv(text) {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map((h) => h.trim());
    return lines.slice(1).map((line) => {
      const values = line.split(',');
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = values[idx];
      });
      return obj;
    });
  }

  // Merge imported data into existing localStorage structure.
  function mergeImportedData(parsed) {
    // If parsed is an array of objects, attempt to interpret workout logs or stats
    if (Array.isArray(parsed)) {
      // Distinguish by presence of weight/bodyFat fields
      const first = parsed[0] || {};
      if ('weight' in first || 'bodyFat' in first) {
        // Treat as body stat logs
        const stats = JSON.parse(localStorage.getItem('bodyStats') || '[]');
        parsed.forEach((entry) => stats.push(entry));
        localStorage.setItem('bodyStats', JSON.stringify(stats));
        return;
      }
      // Otherwise, assume workout logs with arbitrary column names.
      // We'll build exercise logs and create any missing exercises/routines.
      const logs = JSON.parse(localStorage.getItem('exerciseLogs') || '{}');
      const importedExercises = JSON.parse(localStorage.getItem('importedExercises') || '[]');
      const importedRoutines = JSON.parse(localStorage.getItem('importedRoutines') || '[]');
      parsed.forEach((row) => {
        // Determine exercise name and category/program; support various column names
        const name = row.exercise || row.exercise_name || row.exerciseName || row.Exercise || row.ExerciseName || row.Exercise_name;
        if (!name) return;
        // Category may have misspelling "Caregory" in some logs
        const category =
          row.category || row.program || row.Category || row.Program || row.Caregory || 'Imported';
        const reps = row.reps || row.Reps || row.repetitions || row.Repetitions;
        const weight = row.weight || row.Weight || row.kg || row.KG;
        // Parse date strings into ISO; fallback to today
        let date = row.timestamp || row.date || row.Date;
        if (date) {
          // Attempt to parse various date formats
          const parsedDate = new Date(date);
          if (!isNaN(parsedDate.getTime())) {
            date = parsedDate.toISOString();
          } else {
            date = new Date().toISOString();
          }
        } else {
          date = new Date().toISOString();
        }
        // Sanitize id by lowercasing and removing spaces
        const id = name.toLowerCase().replace(/\s+/g, '-');
        // If exercise not already known (in base or imported), add to importedExercises
        const allExercises = [...importedExercises];
        const exists = allExercises.some((ex) => ex.id === id);
        if (!exists) {
          importedExercises.push({ id, name, group: category });
        }
        // Ensure there is an imported routine for this category
        let routine = importedRoutines.find((r) => r.name === category);
        if (!routine) {
          routine = {
            id: `imported-${category.toLowerCase().replace(/\s+/g, '-')}`,
            name: category,
            description: `Imported from file`,
            exercises: [],
          };
          importedRoutines.push(routine);
        }
        // Add exercise to routine if not present
        if (!routine.exercises.find((ex) => ex.id === id)) {
          routine.exercises.push({ id, name, sets: [{ reps: reps || '', weight: weight || '' }] });
        }
        // Add to exercise logs
        logs[id] = logs[id] || [];
        logs[id].push({
          date: date,
          sets: [ { reps: reps || '', weight: weight || '' } ],
        });
      });
      localStorage.setItem('exerciseLogs', JSON.stringify(logs));
      localStorage.setItem('importedExercises', JSON.stringify(importedExercises));
      localStorage.setItem('importedRoutines', JSON.stringify(importedRoutines));
    } else if (typeof parsed === 'object' && parsed !== null) {
      // Parsed object keyed by exerciseId; merge into exerciseLogs
      const logs = JSON.parse(localStorage.getItem('exerciseLogs') || '{}');
      Object.keys(parsed).forEach((id) => {
        logs[id] = logs[id] || [];
        logs[id] = logs[id].concat(parsed[id]);
      });
      localStorage.setItem('exerciseLogs', JSON.stringify(logs));
    }
  }

  // Export weight logs for the current user as CSV
  function exportWeightLogs() {
    // Determine current user via context (we can't import here; we'll require dynamic import)
    const userId = localStorage.getItem('currentUserId');
    if (!userId) {
      alert('No user selected');
      return;
    }
    const logs = JSON.parse(localStorage.getItem(`weightLogs_${userId}`) || '[]');
    if (logs.length === 0) {
      alert('No weight logs to export');
      return;
    }
    const headers = ['date', 'weight', 'bodyFat', 'water', 'lean'];
    const csvRows = [headers.join(',')];
    logs.forEach((l) => {
      csvRows.push([
        l.date,
        l.weight,
        l.bodyFat != null ? l.bodyFat : '',
        l.water != null ? l.water : '',
        l.lean != null ? l.lean : '',
      ].join(','));
    });
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `weight_logs_${userId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Export workout logs as CSV for current user
  function exportWorkoutLogs() {
    const userId = localStorage.getItem('currentUserId');
    if (!userId) {
      alert('No user selected');
      return;
    }
    const logs = JSON.parse(localStorage.getItem('exerciseLogs') || '{}');
    const rows = [];
    Object.keys(logs).forEach((exId) => {
      logs[exId].forEach((session) => {
        session.sets.forEach((set, idx) => {
          rows.push([
            exId,
            session.date,
            idx + 1,
            set.reps || '',
            set.weight || '',
          ].join(','));
        });
      });
    });
    if (rows.length === 0) {
      alert('No workout logs to export');
      return;
    }
    const csvContent = ['exerciseId,date,setNumber,reps,weight'].concat(rows).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `workout_logs_${userId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div>
      <h1>Settings</h1>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Dark Mode</span>
          <input
            type="checkbox"
            checked={theme === 'dark'}
            onChange={toggleTheme}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Units</span>
          <select
            value={units}
            onChange={(e) => setUnits(e.target.value)}
          >
            <option value="kg">kg</option>
            <option value="lbs">lbs</option>
          </select>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Export to CSV</span>
          <button
            onClick={() => alert('Data exported!')}
            className="btn-glow"
            style={{ padding: '0.5rem 1rem' }}
          >
            Export
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Notifications</span>
          <input
            type="checkbox"
            checked={notifications}
            onChange={(e) => setNotifications(e.target.checked)}
          />
        </div>
        {/* Import external data (CSV or JSON) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
          <span>Import Data (CSV or JSON)</span>
          <input type="file" accept=".csv,.json" onChange={handleImport} />
        </div>

        {/* Export data options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
          <span>Export Data</span>
          <button onClick={exportWeightLogs} className="btn-glow" style={{ width: '100%' }}>
            Export Weight Logs (CSV)
          </button>
          <button onClick={exportWorkoutLogs} className="btn-glow" style={{ width: '100%' }}>
            Export Workout Logs (CSV)
          </button>
        </div>
      </div>
    </div>
  );
}
