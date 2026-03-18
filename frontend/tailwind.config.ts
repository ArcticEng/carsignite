import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: '#030305', 2: '#08080c', 3: '#0e0e14' },
        ci: {
          red: '#e63946',
          'red-light': '#ff4d5a',
          'red-dark': '#b52030',
          gold: '#d4a020',
          'gold-light': '#f0c040',
          green: '#22cc6e',
          blue: '#4488ff',
          purple: '#9966ff',
        },
        glass: { DEFAULT: 'rgba(255,255,255,0.03)', light: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.06)' },
      },
      fontFamily: {
        heading: ['Bebas Neue', 'sans-serif'],
        body: ['Barlow', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      borderRadius: { ci: '16px', 'ci-sm': '12px' },
      boxShadow: {
        glow: '0 0 30px rgba(230,57,70,0.08), 0 0 60px rgba(230,57,70,0.04)',
        'glow-strong': '0 0 30px rgba(230,57,70,0.15), 0 0 60px rgba(230,57,70,0.08)',
        card: '0 0 0 1px rgba(230,57,70,0.04), 0 4px 24px rgba(0,0,0,0.5), 0 0 40px rgba(230,57,70,0.03)',
      },
      keyframes: {
        fadeUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        float: { '0%': { transform: 'translateY(0) scale(1)' }, '100%': { transform: 'translateY(-15px) scale(1.05)' } },
        shimmer: { to: { backgroundPosition: '200% center' } },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(230,57,70,0.15)' },
          '50%': { boxShadow: '0 0 40px rgba(230,57,70,0.3)' },
        },
        'border-glow': {
          '0%, 100%': { borderColor: 'rgba(230,57,70,0.12)' },
          '50%': { borderColor: 'rgba(230,57,70,0.25)' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease both',
        float: 'float 8s ease-in-out infinite alternate',
        shimmer: 'shimmer 0.7s linear infinite',
        'glow-pulse': 'glow-pulse 3s ease infinite',
        'border-glow': 'border-glow 3s ease infinite',
      },
    },
  },
  plugins: [],
};

export default config;
