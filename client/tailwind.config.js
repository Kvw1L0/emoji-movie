/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hdc: {
          teal: '#00A8B5',
          'teal-dark': '#005F6A',
          'teal-deep': '#00424A',
          'teal-light': '#E0F7FA',
          gold: '#D4AF37',
          'gold-light': '#F6DF88',
          'gold-dark': '#9A7D18',
          cream: '#FAF7F2',
          'cream-dark': '#EFE8DD',
          slate: '#133842',
          green: '#00875A',
        },
        hollywood: {
          gold: '#D4AF37',
          red: '#E50914',
          dark: '#0B0C10',
          card: '#1F2833',
          neon: '#00A8B5',
          accent: '#4FD1C5',
          purple: '#8B5CF6'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Montserrat', 'Inter', 'sans-serif'],
        display: ['Montserrat', 'Outfit', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif']
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce 2s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 15px rgba(255, 215, 0, 0.4)' },
          '100%': { boxShadow: '0 0 35px rgba(255, 215, 0, 0.9)' },
        }
      }
    },
  },
  plugins: [],
}
