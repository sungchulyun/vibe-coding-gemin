/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "../**/*.{html,js,ts,jsx,tsx}", // Adjust this path if your HTML files are not in the frontend directory
    "./*.html", // Scan HTML files in the frontend directory
    "./js/**/*.js", // Scan JS files in the frontend/js directory
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}