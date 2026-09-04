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
        creme: '#EEE4DA',
        sand: '#D8C4AC',
        'dusty-pink': '#C8A49F',
        burgundy: '#4D0E13',
        background: '#EEE4DA',
        panel: '#D8C4AC',
        'ink-black': '#4D0E13',
        'dark-cyan': '#D8C4AC',
        'sky-aqua': '#C8A49F',
        'tea-green': '#EEE4DA',
        'mint-cream': '#EEE4DA',
      },
    },
  },
  plugins: [],
}
