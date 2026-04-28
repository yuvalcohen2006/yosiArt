import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: 'rgb(var(--color-paper) / <alpha-value>)',   // #ffffff
        ink: 'rgb(var(--color-ink) / <alpha-value>)',       // #353535
        mist: 'rgb(var(--color-mist) / <alpha-value>)',     // #d9d9d9
        teal: 'rgb(var(--color-teal) / <alpha-value>)',     // #3c6e71
        deep: 'rgb(var(--color-deep) / <alpha-value>)',     // #284b63
      },
      fontFamily: {
        // Display — refined gallery serif. Cormorant for LTR; Frank Ruhl Libre for RTL.
        display: [
          '"Cormorant Garamond"',
          '"Frank Ruhl Libre"',
          'ui-serif',
          'Georgia',
          'serif',
        ],
        // Body — clean, modern sans with subtle character.
        sans: [
          '"DM Sans"',
          '"Heebo"',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
      transitionTimingFunction: {
        gallery: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config;
