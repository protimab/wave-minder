/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          50: '#f0fdff',
          100: '#d4f1f4',
          200: '#75e6da',
          300: '#5bc0de',
          400: '#189ab4',
          500: '#0a4d68',
          600: '#05445e',
          700: '#033649',
          800: '#022838',
          900: '#011a27',
        },
      },
      animation: {
        'wave': 'wave 15s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'ripple': 'ripple 0.6s ease-out',
      },
      keyframes: {
        wave: {
          '0%, 100%': { transform: 'translateX(0) translateY(0)' },
          '50%': { transform: 'translateX(-25px) translateY(-10px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        ripple: {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2.4)', opacity: '0' },
        },
      },
      backgroundImage: {
        'ocean-gradient': 'linear-gradient(135deg, #0a4d68 0%, #05445e 25%, #189ab4 75%, #75e6da 100%)',
      },
    },
  },
  plugins: [],
}