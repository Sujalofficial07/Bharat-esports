/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0a0a0f',
          dark: '#050508',
        },
        secondary: {
          DEFAULT: '#1a0b2e',
          light: '#2d1654',
        },
        accent: {
          DEFAULT: '#7b2cbf',
          light: '#9d4edd',
        },
        aqua: {
          DEFAULT: '#00f5ff',
          light: '#6efff9',
          dark: '#00c9d4',
        },
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, #0a0a0f 0%, #1a0b2e 50%, #2d1654 100%)',
        'gradient-purple': 'linear-gradient(135deg, #7b2cbf 0%, #9d4edd 100%)',
        'gradient-aqua': 'linear-gradient(135deg, #00f5ff 0%, #6efff9 100%)',
      },
      boxShadow: {
        'glow-aqua': '0 0 20px rgba(0, 245, 255, 0.5), 0 0 40px rgba(0, 245, 255, 0.3)',
        'glow-aqua-lg': '0 0 30px rgba(0, 245, 255, 0.6), 0 0 60px rgba(0, 245, 255, 0.4)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 245, 255, 0.5), 0 0 40px rgba(0, 245, 255, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(0, 245, 255, 0.7), 0 0 60px rgba(0, 245, 255, 0.5)' },
        },
      },
    },
  },
  plugins: [],
}
