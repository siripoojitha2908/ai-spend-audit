import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 0 1px rgba(255,255,255,0.08), 0 30px 90px rgba(92,109,255,0.12)',
      },
      backgroundImage: {
        'glass-gradient': 'radial-gradient(circle at top, rgba(147,197,253,0.18), transparent 42%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08), transparent 28%)',
      },
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          500: '#6366f1',
          700: '#4338ca',
        },
      },
    },
  },
  plugins: [],
};

export default config;
