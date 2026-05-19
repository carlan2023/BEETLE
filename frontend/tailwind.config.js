/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        orange: {
          DEFAULT: '#FF6B00',
          50:  '#FFF3E8',
          100: '#FFE0C2',
          200: '#FFBF80',
          300: '#FF9C40',
          400: '#FF8020',
          500: '#FF6B00',
          600: '#E05E00',
          700: '#B84D00',
          800: '#8A3900',
          900: '#5C2600',
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'cursive'],
        heading: ['"Barlow Condensed"', 'sans-serif'],
        body: ['"Barlow"', 'sans-serif'],
      },
      animation: {
        'fade-up':   'fadeUp 0.5s ease forwards',
        'fade-in':   'fadeIn 0.4s ease forwards',
        'slide-in':  'slideIn 0.4s ease forwards',
        'pulse-dot': 'pulseDot 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeUp:   { from: { opacity: 0, transform: 'translateY(24px)' }, to: { opacity: 1, transform: 'none' } },
        fadeIn:   { from: { opacity: 0 }, to: { opacity: 1 } },
        slideIn:  { from: { opacity: 0, transform: 'translateX(-20px)' }, to: { opacity: 1, transform: 'none' } },
        pulseDot: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.3 } },
      },
    },
  },
  plugins: [],
}
