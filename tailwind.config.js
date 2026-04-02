import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        dark: {
          bg:      '#030810',
          card:    '#060d18',
          lighter: '#0b1628',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon-purple': '0 0 15px rgba(20, 184, 166, 0.4), 0 0 30px rgba(20, 184, 166, 0.2)',
        'neon-glow':   '0 0 20px rgba(20, 184, 166, 0.5)',
        'glass':       '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backgroundImage: {
        'mesh-gradient': 'radial-gradient(at 0% 0%, rgba(20, 184, 166, 0.15) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(99, 102, 241, 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(20, 184, 166, 0.15) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(99, 102, 241, 0.15) 0px, transparent 50%)',
        'nebula': 'radial-gradient(circle at center, rgba(11, 22, 40, 1) 0%, rgba(3, 8, 16, 1) 100%)',
      },
      animation: {
        'fade-in':    'fadeIn 0.5s ease-out',
        'slide-up':   'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow':       'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
        glow: {
          'from': { boxShadow: '0 0 5px #0d9488, 0 0 10px #0d9488' },
          'to':   { boxShadow: '0 0 20px #0d9488, 0 0 30px #0d9488' },
        }
      }
    },
  },
  plugins: [
    forms,
  ],
}
