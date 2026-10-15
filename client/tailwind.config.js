/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hollywood: {
          gold: '#FFD700',
          red: '#E50914',
          dark: '#0B0C10',
          card: '#1F2833',
          neon: '#45A29E',
          accent: '#66FCF1',
          purple: '#8B5CF6'
        }
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
