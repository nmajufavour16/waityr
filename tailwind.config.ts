import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Body — Plus Jakarta Sans
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        // Headings — Poppins
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      colors: {
        teal: {
          600: '#0D9488',
          700: '#0f766e',
        },
      },
    },
  },
  plugins: [],
};

export default config;
