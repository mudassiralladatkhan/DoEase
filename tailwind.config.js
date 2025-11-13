/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#00A9FF',
        'primary-light': '#89CFF3',
        'primary-dark': '#0070A8',
        'secondary': '#48BB78',
        'danger': '#F56565',
        'danger-bg': 'rgba(245, 101, 101, 0.1)',
        'danger-text': '#F56565',
        'warning': '#ECC94B',
        
        'bg-primary': '#070F2B',
        'bg-secondary': '#1B1A55',
        'bg-contrast': '#03001C',

        'text-primary': '#F0F3FF',
        'text-secondary': '#929AAB',
        'text-disabled': '#535C6A',
        
        'border-color': 'rgba(137, 207, 243, 0.2)',
        'glass-bg': 'rgba(137, 207, 243, 0.05)',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '22px',
      },
      boxShadow: {
        'glow-primary': '0 0 15px 0px rgba(0, 169, 255, 0.3)',
        'glow-primary-lg': '0 0 25px 0px rgba(0, 169, 255, 0.4)',
      },
      keyframes: {
        spin: {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' },
        },
        fadeIn: {
          'from': { opacity: 0 },
          'to': { opacity: 1 },
        },
        slideIn: {
          'from': { opacity: 0, transform: 'translateY(-20px) scale(0.95)' },
          'to': { opacity: 1, transform: 'translateY(0) scale(1)' },
        }
      },
      animation: {
        spin: 'spin 1s linear infinite',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-in': 'slideIn 0.5s ease-out forwards',
      }
    },
  },
  plugins: [],
}
