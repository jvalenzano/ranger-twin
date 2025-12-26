/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#0f172a',
                surface: '#1e293b',
                safe: '#10b981',
                warning: '#f59e0b',
                severe: '#ef4444',
                'accent-cyan': '#22d3ee',
            },
            fontFamily: {
                display: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
        },
    },
    plugins: [],
}
