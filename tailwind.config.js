/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf8f3',
          100: '#f7ede3',
          200: '#f0dbcc',
          300: '#e4c4b0',
          400: '#d4a88c',
          500: '#c48d6e',
          600: '#b07754',
          700: '#936145',
          800: '#77503b',
          900: '#5f4232',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
