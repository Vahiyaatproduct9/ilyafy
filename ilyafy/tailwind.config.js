/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    './App.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}', // 👈 add this line
    './src/**/*.{js,jsx,ts,tsx}', // if you use a src folder
    './components/**/*.{js,jsx,ts,tsx}', // optional
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {},
  },
  plugins: [],
};
