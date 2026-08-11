import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2f0ff',
          100: '#e6e1ff',
          200: '#cabeff',
          300: '#a891ff',
          400: '#8a63f9',
          500: '#7c3aed', // primary
          600: '#6d28d9',
          700: '#5b21b6',
          800: '#4c1d95',
          900: '#3b1878',
          DEFAULT: '#7c3aed',
          dark: '#5b21b6',
        },
        accent: {
          DEFAULT: '#ec4899', // hồng cho gradient
          light: '#f472b6',
        },
      },
      fontFamily: {
        sans: ['var(--font-sora)', 'ui-sans-serif', 'system-ui'],
        script: ['var(--font-dancing)', 'cursive'], // nếu muốn dùng Dancing Script ở đâu đó, ví dụ logo
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
        'brand-gradient-soft': 'linear-gradient(135deg, #f2f0ff 0%, #fce7f3 100%)',
      },
      boxShadow: {
        card: '0 4px 20px -4px rgba(124,58,237,0.15)',
        'card-hover': '0 12px 32px -8px rgba(124,58,237,0.28)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};
export default config;