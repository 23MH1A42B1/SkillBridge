/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        admin: {
          bg:     '#07080f',
          card:   '#0d0f1c',
          border: '#1a1d35',
          hover:  '#141728',
        },
        brand: {
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
        },
        accent: {
          teal:   '#2dd4bf',
          purple: '#a78bfa',
          pink:   '#f472b6',
          orange: '#fb923c',
          green:  '#4ade80',
          red:    '#f87171',
          yellow: '#facc15',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in':   'fadeIn 0.4s ease-out',
        'slide-up':  'slideUp 0.4s ease-out',
        'slide-in':  'slideIn 0.3s ease-out',
        'pulse-slow':'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { transform: 'translateY(16px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        slideIn: { from: { transform: 'translateX(-16px)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
      },
    },
  },
  plugins: [],
};
