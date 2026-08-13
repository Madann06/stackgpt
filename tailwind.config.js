/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0B1220',
        card: '#111827',
        'card-hover': '#1F2937',
        primary: {
          DEFAULT: '#06B6D4',
          hover: '#0891B2',
          light: '#22D3EE',
          dark: '#0E7490',
        },
        success: {
          DEFAULT: '#10B981',
          light: '#34D399',
          dark: '#059669',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FBBF24',
          dark: '#D97706',
        },
        danger: {
          DEFAULT: '#EF4444',
          light: '#F87171',
          dark: '#DC2626',
        },
        neutral: {
          DEFAULT: '#64748B',
          light: '#94A3B8',
          dark: '#475569',
        },
        accent: {
          purple: '#8B5CF6',
          cyan: '#06B6D4',
          emerald: '#10B981'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'glow-primary': '0 0 20px -3px rgba(59, 130, 246, 0.35)',
        'glow-success': '0 0 20px -3px rgba(34, 197, 94, 0.35)',
        'glow-warning': '0 0 20px -3px rgba(245, 158, 11, 0.35)',
        'glow-danger': '0 0 20px -3px rgba(239, 68, 68, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
      }
    },
  },
  plugins: [],
}
