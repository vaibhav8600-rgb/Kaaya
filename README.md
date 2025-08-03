# Kaaya PWA

Kaaya is a fitness tracking Progressive Web App built with React.js.  It features a cosmic dark/light theme, workout logging, routine builder, progress analytics, body stats, multi-user profiles, and weight management.  Offline support is provided via Vite PWA configuration.  Local storage is used for persistence.

## Features

### General

- **Session handling** – On startup the app reads persisted authentication state from `localStorage`.  If a user is logged in, it automatically navigates to the dashboard; otherwise it shows the login screen.  Unauthenticated users are prevented from accessing protected routes.

- **Single‑user enforcement** – Only one account can be active at a time.  Attempting to log in or register while another session is active prompts the user to log out first.  Multi‑user switching has been disabled in favor of explicit logout/login flows.

- **Email/password registration and login** – Users can register with name, email and password, with simple validation.  Confirming the password is required when creating an account.  Login validates credentials against local storage.

- **Third‑party login (simulated)** – Buttons are provided for “Sign in with Google” and “Sign in with Apple”.  These create or log in a demo account to illustrate third‑party auth flows.

- **Theme toggle** – Users can switch between dark (cosmic) and light (nebula) themes.  The choice persists across sessions.  All colours are defined via CSS variables that change when the theme class is toggled.

- **Smooth animations** – Page transitions, button hover states and modal interactions use Framer Motion and CSS transitions for a polished user experience.

### Fitness Tracking

- **Workout logging** – Start a workout and record sets, reps and weights.  Previous session stats for each exercise are shown to help gauge progress, with PR badges when you exceed prior bests.

- **Routine builder** – Create, edit and delete routines organised by muscle group.  Build your own Push/Pull/Leg day workouts.

- **Progress analytics** – Visualise performance using interactive charts built with Chart.js.  Charts include line and area graphs, radar/spider charts for body part development, bar charts for weekly volume, and stacked charts for sets vs reps.  Toggle between weekly and monthly views.

- **Body stats tracker** – Upload progress photos and record measurements like bodyweight, body fat, arms and squats.  BMI is calculated automatically from height and weight.

- **Weight management module** – Log daily or weekly weight and body composition (body fat %, water %, lean mass).  Set target weight and timeframe, then see progress percentage, time remaining and a goal line on the chart.  A calendar heatmap visualises logging consistency.

- **Import/export** – Import workout or weight logs from CSV/JSON files and map them into the app.  Export workout history and weight logs as CSV files.

- **User profile** – Manage personal information (name, age, height, email, units, theme) and upload a profile photo.  Settings like unit type and theme are stored per user.

## Running the app

1. Install dependencies: `npm install`
2. Start the dev server: `npm run dev`
3. Build for production: `npm run build`

## Testing

Unit tests are written using Jest and React Testing Library.  Run tests with:

```
npm test
```

## Folder Structure

```
kaaya/
  src/
    components/
    context/
    pages/
    data/
    hooks/
    __tests__/
    index.css
    App.jsx
    main.jsx
  public/
  package.json
  vite.config.js
```