import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
      },
      colors: {
        bg: '#0a0a0f',
        surface: {
          DEFAULT: '#111118',
          2: '#18181f',
          3: '#1e1e28',
        },
        border: {
          DEFAULT: '#2a2a38',
          2: '#222230',
        },
        accent: {
          DEFAULT: '#00e5a0',
          2: '#00b8ff',
          3: '#7c5cfc',
        },
        muted: '#7a7a92',
        danger: '#ff4d6d',
        gold: '#ffd166',
      },
      borderRadius: {
        card: '12px',
        'card-lg': '20px',
      },
      boxShadow: {
        glow: '0 0 30px rgba(0,229,160,0.25)',
        'glow-lg': '0 0 60px rgba(0,229,160,0.3)',
        card: '0 4px 24px rgba(0,0,0,0.4)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease both',
        pulse: 'pulse 2s infinite',
        shimmer: 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
