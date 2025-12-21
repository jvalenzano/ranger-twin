/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // RANGER Design Tokens - Tactical Futurism
        safe: '#10B981',      // Emerald-500 - Success, low severity
        warning: '#F59E0B',   // Amber-500 - Moderate, caution
        severe: '#EF4444',    // Red-500 - High severity, critical

        // Surface colors
        background: '#020617', // Slate-950 - Deep dark canvas
        surface: {
          DEFAULT: '#0F172A', // Slate-900 - Panel backgrounds
          elevated: '#1E293B', // Slate-800 - Elevated panels
        },

        // Text colors
        text: {
          primary: '#F8FAFC',   // Slate-50
          secondary: '#94A3B8', // Slate-400
          muted: '#64748B',     // Slate-500
        },

        // Accent colors
        accent: {
          cyan: '#06B6D4',    // Peak/high elevation
          emerald: '#10B981', // Safe/active states
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s infinite ease-in-out',
        'live-pulse': 'live-pulse 1.5s infinite ease-in-out',
        'contour-pulse': 'contour-pulse 10s infinite ease-in-out',
        'fire-pulse': 'fire-pulse-intense 3s infinite ease-in-out',
        'fire-glow': 'fire-glow-pulse 3s infinite ease-in-out',
        'flicker': 'flicker 0.15s infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            opacity: '0.7',
            boxShadow: '0 0 15px 2px rgba(16, 185, 129, 0.5)',
          },
          '50%': {
            opacity: '1',
            boxShadow: '0 0 30px 8px rgba(16, 185, 129, 0.8)',
          },
        },
        'live-pulse': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(0.9)' },
          '50%': { opacity: '1', transform: 'scale(1.1)' },
        },
        'contour-pulse': {
          '0%, 100%': { strokeOpacity: '0.2' },
          '50%': { strokeOpacity: '0.6' },
        },
        'fire-pulse-intense': {
          '0%, 100%': {
            opacity: '0.9',
            filter: 'blur(35px) saturate(1.5)',
          },
          '50%': {
            opacity: '1',
            filter: 'blur(45px) saturate(2)',
          },
        },
        'fire-glow-pulse': {
          '0%, 100%': { opacity: '0.9' },
          '50%': { opacity: '1.0' },
        },
        'flicker': {
          '0%': { opacity: '0.97' },
          '5%': { opacity: '0.95' },
          '10%': { opacity: '0.97' },
          '15%': { opacity: '0.9' },
          '25%': { opacity: '0.98' },
          '100%': { opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
