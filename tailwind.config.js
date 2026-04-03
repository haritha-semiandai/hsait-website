/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#38BDF8',
        accent: '#0EA5E9',
        ink: '#0A0A0A',
        'ink-dark': '#F5F5F5',
        mist: '#F8FAFC',
        secondary: '#E2E8F0',
        highlight: '#22D3EE',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        float: '0 16px 36px -24px rgba(14, 165, 233, 0.45)',
      },
      backgroundImage: {
        mesh: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 68%, #f0f9ff 100%)',
        'mesh-dark': 'linear-gradient(180deg, #050505 0%, #0a0a0a 68%, #0f0f0f 100%)',
      },
    },
  },
  plugins: [],
}


