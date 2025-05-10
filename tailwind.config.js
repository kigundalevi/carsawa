/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3563E9', // Rich blue - conveys trust and reliability
          hover: '#2954D2', // Slightly darker blue for hover states
          light: '#D6E4FF',
        },
        secondary: {
          DEFAULT: '#1A202C', // Dark slate for text and headers
          light: '#4A5568', 
        },
        accent: {
          DEFAULT: '#FF9F1C', // Warm orange for CTAs and highlights
          hover: '#F08700', // Slightly darker orange for hover states
        },
        success: {
          DEFAULT: '#22C55E', // Green for positive indicators
          hover: '#16A34A', // Slightly darker green for hover states
        },
        danger: {
          DEFAULT: '#EF4444', // Red for errors and warnings
          hover: '#DC2626', // Slightly darker red for hover states
        },
        neutral: {
          100: '#F7FAFC', // Very light gray/almost white
          200: '#EDF2F7', // Light gray for backgrounds
          300: '#E2E8F0', // Light gray for borders
          400: '#CBD5E0', // Medium light gray
          500: '#A0AEC0', // Medium gray
        }

      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};