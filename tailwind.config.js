import { type Config } from 'tailwindcss';
import { colors, spacing, radius } from './src/theme/tokens';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors,
      spacing,
      borderRadius: radius,
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system'],
      },
    },
  },
  plugins: [],
} satisfies Config;
