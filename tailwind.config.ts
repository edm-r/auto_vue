import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        surface: 'var(--surface)',
        surface2: 'var(--surface-2)',
        border: 'var(--border)',
        foreground: 'var(--text)',
        muted: 'var(--text-secondary)',
        accent: 'var(--accent)',
        accent2: 'var(--accent-2)',
        danger: 'var(--danger)',
        success: 'var(--success)',
        info: 'var(--info)',
      },
      borderRadius: {
        xl: '16px',
      },
      boxShadow: {
        soft: '0 10px 30px rgba(0,0,0,0.25)',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
    },
  },
  plugins: [animate],
} satisfies Config

