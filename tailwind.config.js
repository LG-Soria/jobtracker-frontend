/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
        serif: ['system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
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
        bg: 'rgb(var(--bg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        'surface-muted': 'rgb(var(--surface-muted) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        ink: 'rgb(var(--text) / <alpha-value>)',
        'ink-muted': 'rgb(var(--text-muted) / <alpha-value>)',
        'ink-soft': 'rgb(var(--text-soft) / <alpha-value>)',
        primary: 'rgb(var(--primary) / <alpha-value>)',
        'primary-hover': 'rgb(var(--primary-hover) / <alpha-value>)',
        danger: 'rgb(var(--danger) / <alpha-value>)',
        'danger-hover': 'rgb(var(--danger-hover) / <alpha-value>)',
        'danger-soft': 'rgb(var(--danger-soft) / <alpha-value>)',
        'info-bg': 'rgb(var(--info-bg) / <alpha-value>)',
        'info-text': 'rgb(var(--info-text) / <alpha-value>)',
        'warning-bg': 'rgb(var(--warning-bg) / <alpha-value>)',
        'warning-text': 'rgb(var(--warning-text) / <alpha-value>)',
        'success-bg': 'rgb(var(--success-bg) / <alpha-value>)',
        'success-text': 'rgb(var(--success-text) / <alpha-value>)',
      },
      borderRadius: {
        card: 'var(--radius-card)',
        input: 'var(--radius-input)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
      },
    },
  },
  plugins: [],
}
