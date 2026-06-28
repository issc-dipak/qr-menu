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
        sans: ['Inter', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        bg: '#09090b',
        surface: {
          DEFAULT: '#111114',
          2: '#18181b',
          3: '#202024',
        },
        border: {
          DEFAULT: '#1f1f23',
          2: '#27272a',
        },
        accent: {
          DEFAULT: '#6366f1',
          2: '#3b82f6',
          3: '#8b5cf6',
        },
        muted: '#8e8ea8',
        danger: '#ef4444',
        gold: '#ffd166',
      },
      borderRadius: {
        card: '12px',
        'card-lg': '20px',
      },
      boxShadow: {
        glow: '0 0 20px rgba(99,102,241,0.15)',
        'glow-lg': '0 0 40px rgba(99,102,241,0.2)',
        card: '0 4px 20px rgba(0,0,0,0.5)',
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
