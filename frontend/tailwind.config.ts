import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: '#1E1E1E', 2: '#2A2A2A', 3: '#3A3A3A' },
        ci: {
          red: '#E03455',
          'red-light': '#E8476A',
          'red-dark': '#C42A47',
          gold: '#d4a020',
          'gold-light': '#f0c040',
          green: '#22cc6e',
          blue: '#4488ff',
          purple: '#9966ff',
        },
        glass: { DEFAULT: 'rgba(255,255,255,0.05)', light: 'rgba(255,255,255,0.08)', border: 'rgba(255,255,255,0.08)' },
      },
      fontFamily: {
        heading: ['Bebas Neue', 'sans-serif'],
        body: ['Barlow', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      borderRadius: { ci: '16px', 'ci-sm': '12px' },
      boxShadow: {
        glow: '0 0 30px rgba(224,52,85,0.08), 0 0 60px rgba(224,52,85,0.04)',
        'glow-strong': '0 0 30px rgba(224,52,85,0.18), 0 0 60px rgba(224,52,85,0.08)',
        card: '0 0 0 1px rgba(224,52,85,0.04), 0 4px 24px rgba(0,0,0,0.4), 0 0 40px rgba(224,52,85,0.03)',
      },
      keyframes: {
        fadeUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        float: { '0%': { transform: 'translateY(0) scale(1)' }, '100%': { transform: 'translateY(-15px) scale(1.05)' } },
        shimmer: { to: { backgroundPosition: '200% center' } },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(224,52,85,0.15)' },
          '50%': { boxShadow: '0 0 40px rgba(224,52,85,0.3)' },
        },
        'border-glow': {
          '0%, 100%': { borderColor: 'rgba(224,52,85,0.12)' },
          '50%': { borderColor: 'rgba(224,52,85,0.3)' },
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
