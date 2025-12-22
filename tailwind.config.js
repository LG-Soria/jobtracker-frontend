/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f4f7ff',
          100: '#e8edff',
          200: '#ccd9ff',
          500: '#4064e3',
          600: '#304fc0',
          700: '#243d99',
        },
      },
    },
  },
  plugins: [],
}
