/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // App brand palette
        primary: '#235AFF',
        lighter: '#F6F8FF',
        // Assuming a small typo in the provided value `#FFF3B30` -> using `#FF3B30`
        error: '#FF3B30',
        warning: '#FFCC00',
        info: '#0063F7',
        success: '#06C270',
        gray1: '#939393',
        gray2: '#A0A0A0',
        dark1: '#0B0C15',
        dark2: '#333333',
      },
    },
  },
  plugins: [],
};
