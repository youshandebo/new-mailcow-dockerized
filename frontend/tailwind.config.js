/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'qq-blue': '#12B7F5',
        'qq-blue-dark': '#0EA5D9',
        'qq-blue-light': '#E8F7FE',
        'qq-sidebar': '#F5F6F7',
        'qq-hover': '#E8E9EB',
        'qq-border': '#E5E6EB',
        'qq-text': '#1F2329',
        'qq-text-secondary': '#8F959E',
        'qq-bg': '#FFFFFF',
        'qq-bg-secondary': '#F7F8FA',
      },
      boxShadow: {
        qq: '0 2px 8px rgba(0, 0, 0, 0.08)',
        'qq-lg': '0 4px 16px rgba(0, 0, 0, 0.12)',
      },
      borderRadius: {
        qq: '8px',
      },
    },
  },
  plugins: [],
};
