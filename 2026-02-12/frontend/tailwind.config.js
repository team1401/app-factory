/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    {
      pattern: /bg-(debate-blue|debate-orange)-(400|500|600|700)\/(10|20|30)/,
    },
    {
      pattern: /border-(debate-blue|debate-orange)-(400|500|600|700)\/(20|30)/,
    },
    {
      pattern: /text-(debate-blue|debate-orange)-(400|500)/,
    },
    {
      pattern: /from-(debate-blue|debate-orange)-(500|600)/,
    },
    {
      pattern: /to-(debate-blue|debate-orange)-(500|600)/,
    },
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors
        'debate-blue': {
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },
        'debate-orange': {
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
        },
        // Dark theme
        'dark': {
          950: '#030712',
          900: '#111827',
          800: '#1F2937',
          700: '#374151',
          600: '#4B5563',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'typing': 'typing 1.5s steps(3) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(59, 130, 246, 0.6)' },
        },
        typing: {
          '0%, 100%': { content: '.' },
          '33%': { content: '..' },
          '66%': { content: '...' },
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
