/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Safelist phase colors for dynamic class generation
  safelist: [
    // Phase colors - core variants
    'text-phase-impact', 'text-phase-damage', 'text-phase-timber', 'text-phase-compliance',
    'bg-phase-impact', 'bg-phase-damage', 'bg-phase-timber', 'bg-phase-compliance',
    'border-phase-impact', 'border-phase-damage', 'border-phase-timber', 'border-phase-compliance',
    // Left border accents for sidebar workflow items
    'border-l-phase-impact', 'border-l-phase-damage', 'border-l-phase-timber', 'border-l-phase-compliance',
    // Background opacity variants
    'bg-phase-impact/5', 'bg-phase-damage/5', 'bg-phase-timber/5', 'bg-phase-compliance/5',
    'bg-phase-impact/10', 'bg-phase-damage/10', 'bg-phase-timber/10', 'bg-phase-compliance/10',
    'bg-phase-impact/20', 'bg-phase-damage/20', 'bg-phase-timber/20', 'bg-phase-compliance/20',
    // Border opacity variants
    'border-phase-impact/20', 'border-phase-damage/20', 'border-phase-timber/20', 'border-phase-compliance/20',
    'border-phase-impact/30', 'border-phase-damage/30', 'border-phase-timber/30', 'border-phase-compliance/30',
    'border-phase-impact/40', 'border-phase-damage/40', 'border-phase-timber/40', 'border-phase-compliance/40',
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

        // Phase-specific colors (Workflow differentiation)
        phase: {
          impact: '#22d3ee',    // Cyan - Satellite/analysis
          damage: '#f59e0b',    // Amber - Warning/assessment
          timber: '#10b981',    // Emerald - Forest/salvage
          compliance: '#a855f7', // Purple - Regulatory/official
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
