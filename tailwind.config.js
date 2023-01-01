/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    "./views/**/*.ejs",
    "./public/**/*.{css,js}"
  ],
  mode: "jit",
  theme: {
    extend: {
      fontFamily: {
        'serif': ['Raleway', ...defaultTheme.fontFamily.serif],
        'mono': ['Unbounded', ...defaultTheme.fontFamily.mono],
        'spray': ['Rubik Spray Paint', 'cursive'],
        'rubik': ['Rubik Gemstones', 'cursive']
      },
      gridTemplateColumns: {
        'auto': 'repeat(auto-fit, minmax(180px, 1fr))'
      }
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
};