/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'hftm-red': '#c5264e',
        'hftm-gray': '#e4e4e4',
        'hftm-dark-gray': '#2F2F2F'
      }
    },
  },
  plugins: [],
}

