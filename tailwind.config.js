/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'xp-blue-dark': '#003399',
        'xp-blue': '#245EDC',
        'xp-blue-light': '#0058E6',
        'xp-green': '#3E9C3E', // Start button green
        'xp-red': '#E81123',
        'xp-beige': '#ECE9D8', // Window background
        'xp-taskbar-start': '#1F3F8A',
        'xp-taskbar-end': '#2D5CCC',
      },
      fontFamily: {
        tahoma: ['Tahoma', 'Verdana', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        'xp-window': '4px 4px 10px rgba(0, 0, 0, 0.4)',
        'xp-inset': 'inset 1px 1px 0px #808080, inset -1px -1px 0px #ffffff',
        'xp-outset': 'inset 1px 1px 0px #ffffff, inset -1px -1px 0px #808080',
      },
    },
  },
  plugins: [],
};
