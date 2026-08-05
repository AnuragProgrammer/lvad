/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#4a9bb5',
        danger: '#cc4455',
        warning: '#cc9933',
        success: '#44aa66',
        dark: {
          900: '#0e1014',
          800: '#14161a',
          700: '#1c1e24',
          600: '#24272e',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'SF Mono', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
