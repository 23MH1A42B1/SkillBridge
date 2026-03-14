import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        skillbridge: {
          bg: '#0f172a',
          card: '#1e293b',
          accent: '#3b82f6',
        },
      },
    },
  },
  plugins: [forms],
};
