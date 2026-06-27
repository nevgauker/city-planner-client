/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#faf8f3',
          100: '#f5f1e8',
          200: '#ede7d9',
          300: '#e5dcc8',
          400: '#d9cdb3',
          500: '#cdbf9e',
          600: '#c0b089',
        },
        taupe: {
          100: '#ede8e0',
          200: '#d4cec2',
          300: '#bbb2a4',
          400: '#a29886',
          500: '#897f73',
          600: '#6d655a',
          700: '#554d44',
        },
        sand: {
          50: '#fefdfb',
          100: '#f8f5f0',
          200: '#e8e3d9',
          300: '#d8cfc1',
          400: '#c4b8a8',
          500: '#b5a896',
          600: '#9e927f',
        },
        accent: {
          terracotta: '#b8674f',
          terracotta_light: '#d9846b',
          sage: '#7a9b8e',
          sage_light: '#9fb5ac',
        },
        neutral: {
          dark: '#3a3a38',
          DEFAULT: '#5a5a56',
          light: '#8a8a84',
        },
      },
      backgroundColor: {
        base: '#faf8f3',
        paper: '#f5f1e8',
      },
      textColor: {
        base: '#3a3a38',
        muted: '#8a8a84',
      },
      animation: {
        fadeIn: 'fadeIn 0.6s ease-out',
        slideUp: 'slideUp 0.6s ease-out',
        slideDown: 'slideDown 0.6s ease-out',
        gentleFloat: 'gentleFloat 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { transform: 'translateY(12px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          from: { transform: 'translateY(-12px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        gentleFloat: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      backgroundImage: {
        'topo-light': 'linear-gradient(135deg, transparent 48%, rgba(139, 127, 115, 0.05) 49%, rgba(139, 127, 115, 0.05) 51%, transparent 52%), linear-gradient(45deg, transparent 48%, rgba(139, 127, 115, 0.05) 49%, rgba(139, 127, 115, 0.05) 51%, transparent 52%)',
        'topo-subtle': 'repeating-linear-gradient(90deg, transparent, transparent 100px, rgba(139, 127, 115, 0.03) 100px, rgba(139, 127, 115, 0.03) 200px)',
      },
    },
  },
  plugins: [],
};
