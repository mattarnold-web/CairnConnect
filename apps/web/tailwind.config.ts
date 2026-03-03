import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cairn: {
          bg: '#0B1A2B',
          card: '#122338',
          'card-hover': '#1A3350',
          elevated: '#1E3A5F',
          border: '#1E3A5F',
          glass: 'rgba(18, 35, 56, 0.85)',
        },
        canopy: {
          DEFAULT: '#10B981',
          dark: '#059669',
          light: '#D1FAE5',
        },
        spotlight: {
          gold: '#F4A261',
          'gold-bg': '#FFF3E0',
          'gold-dark': '#E07B00',
        },
      },
      fontFamily: {
        display: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
        body: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        glass: '16px',
      },
    },
  },
  plugins: [],
};

export default config;
