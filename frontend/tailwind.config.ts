import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F1F6EC',
          100: '#DEEAD1',
          200: '#BFD6A8',
          300: '#9CBD7D',
          400: '#74A052',
          500: '#4B7A3A', // primary
          600: '#3A6330',
          700: '#2C4E27',
          800: '#1F3A1C',
          900: '#142612',
          DEFAULT: '#3A6330',
          dark: '#2C4E27',
        },
        cream: {
          DEFAULT: '#FAF7EE',
          100: '#F4EFDE',
          200: '#ECE4CC',
        },
        accent: {
          DEFAULT: '#D98C4A', // đất nung, dùng nhấn nhá (sticker, highlight)
          light: '#F2B375',
        },
      },
      fontFamily: {
        sans: ['var(--font-sora)', 'ui-sans-serif', 'system-ui'],
        script: ['var(--font-dancing)', 'cursive'],
        display: ['var(--font-display)', 'serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #4B7A3A 0%, #2C4E27 100%)',
        'brand-gradient-soft': 'linear-gradient(135deg, #F1F6EC 0%, #FAF7EE 100%)',
      },
      boxShadow: {
        card: '0 8px 24px -8px rgba(44,78,39,0.18)',
        'card-hover': '0 16px 36px -10px rgba(44,78,39,0.28)',
      },
      borderRadius: {
        xl2: '1.5rem',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')]
};
export default config;