import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './content/**/*.{ts,tsx,mdx}',
    '../../packages/ui/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: 'hsl(var(--primary))',
        muted: 'hsl(var(--muted))',
      },
    },
  },
  plugins: [],
};

export default config;
