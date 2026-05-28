/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './providers.js',
    './config.js',
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#020617',
        }
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}
