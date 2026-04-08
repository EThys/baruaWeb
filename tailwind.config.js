/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        brand: {
          DEFAULT: '#0d47a1',
          light:   '#1565c0',
          dark:    '#0a2f6b',
          accent:  '#1976d2',
        },
        surface: {
          DEFAULT: '#ffffff',
          muted:   '#f0f4f8',
          card:    '#f8fafc',
        },
        /** Drapeau RDC — jaune, bleu ciel, rouge (références vexillologiques courantes) */
        rdc: {
          yellow: '#F7D618',
          blue:   '#0085CE',
          red:    '#CE1126',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        card:   '0 2px 12px 0 rgba(13,71,161,0.08)',
        hero:   '0 8px 40px 0 rgba(13,71,161,0.18)',
        glow:   '0 0 20px 2px rgba(29,78,216,0.25)',
      },
      backgroundImage: {
        'hero-gradient':    'linear-gradient(135deg, #0d47a1 0%, #1565c0 40%, #1976d2 100%)',
        'card-gradient':    'linear-gradient(145deg, #ffffff 0%, #eff6ff 100%)',
        'sidebar-gradient': 'linear-gradient(180deg, #0d47a1 0%, #1e3a8a 100%)',
      },
      animation: {
        'fade-in':     'fadeIn 0.4s ease-out',
        'slide-up':    'slideUp 0.4s ease-out',
        'slide-in':    'slideIn 0.3s ease-out',
        'pulse-slow':  'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        marquee:       'marquee 52s linear infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' },              to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideIn: { from: { opacity: '0', transform: 'translateX(-20px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
