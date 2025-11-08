/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        olive: {
          50: '#f6f7f3',
          100: '#e8ebe0',
          200: '#d1d8c1',
          300: '#b3bf9a',
          400: '#96a574',
          500: '#7a8a56',
          600: '#5f6d42',
          700: '#4a5436',
          800: '#3d452e',
          900: '#343b28',
        },
        beige: {
          50: '#faf9f7',
          100: '#f5f3ef',
          200: '#e8e4dc',
          300: '#d9d2c5',
          400: '#c8bdac',
          500: '#b8a890',
          600: '#a08f76',
          700: '#857761',
          800: '#6e6352',
          900: '#5c5345',
        },
      },
    },
  },
  plugins: [],
};
