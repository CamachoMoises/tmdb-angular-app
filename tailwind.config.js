/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,scss}"
  ],
  theme: {
    extend: {
      colors: {
        'netflix-red': '#e50914',
        'netflix-dark': '#141414',
        'netflix-gray': '#2f2f2f',
        'netflix-light': '#b3b3b3',
      }
    },
  },
  plugins: [],
}
