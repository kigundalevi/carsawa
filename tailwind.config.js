/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#c1ff72', // Bright lime green - energetic and modern
          hover: '#a8e85c', // Slightly darker lime for hover states
          light: '#d9ffb3', // Lighter tint for backgrounds
        },
        secondary: {
          DEFAULT: '#272D3C', // Dark blue-gray for text and headers
          light: '#3a4356', // Lighter version for secondary text
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