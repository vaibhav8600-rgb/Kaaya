/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6D28D9',
          light: '#A78BFA',
          dark: '#4C1D95',
        },
        secondary: {
          DEFAULT: '#8B5CF6',
        },
      },
    },
  },
  plugins: [],
};
