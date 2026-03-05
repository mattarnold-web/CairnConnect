import type { Config } from 'tailwindcss';
import { CAIRN_COLORS } from '@cairn/shared/constants/colors';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: CAIRN_COLORS,
      fontFamily: {
        display: ['SpaceGrotesk'],
        body: ['Inter'],
      },
    },
  },
  plugins: [],
};

export default config;
