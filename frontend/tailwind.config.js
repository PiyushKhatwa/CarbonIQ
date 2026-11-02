/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#F2F8F5',
          100: '#DDF3E8',
          200: '#B8E5D0',
          300: '#86D1B0',
          400: '#4EB68B',
          500: '#2A9A6D',
          600: '#1B7C55',
          700: '#176B4D', // Primary forest
          800: '#14553E',
          900: '#104B38', // Deep forest
          950: '#07281D',
        },
        charcoal: {
          50: '#F6F8F7',
          100: '#EAEFEA',
          200: '#D4DDD6',
          300: '#B3C1B7',
          400: '#8CA092',
          500: '#68756E', // Secondary text
          600: '#526259',
          700: '#3F4E46',
          800: '#2D3A33',
          900: '#18231E', // Primary text
        },
        surface: {
          ground: '#F7F9F7',
          card: '#FFFFFF',
          border: '#E4EAE5',
          muted: '#EEF2EE',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 10px rgba(24, 35, 30, 0.04)',
        card: '0 4px 20px rgba(24, 35, 30, 0.06)',
        dropdown: '0 10px 30px rgba(24, 35, 30, 0.1)',
      },
    },
  },
  plugins: [],
};

