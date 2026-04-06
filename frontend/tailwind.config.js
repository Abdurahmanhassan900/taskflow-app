/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#aa3bff',
        'primary-light': 'rgba(170, 59, 255, 0.1)',
        secondary: '#6b6375',
        'text-dark': '#08060d',
        'bg-light': '#fff',
        border: '#e5e4e7',
        'code-bg': '#f4f3ec',
      },
      fontFamily: {
        sans: ['system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
        heading: ['system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
