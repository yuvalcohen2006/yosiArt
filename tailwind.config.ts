import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Direct hex values — Tailwind 3.4+ generates per-opacity variants
      // automatically (e.g. bg-paper/50 works), so we don't need the
      // <alpha-value> CSS-variable indirection at the theme layer.
      colors: {
        paper: '#ffffff',
        ink: '#353535',
        mist: '#d9d9d9',
        teal: '#3c6e71',
        deep: '#284b63',
      },
      fontFamily: {
        // Hero — firm, modern editorial serif for the home headline only.
        // Heavier than Cormorant; pairs cleanly with DM Sans body.
        hero: [
          '"DM Serif Display"',
          '"Frank Ruhl Libre"',
          'ui-serif',
          'Georgia',
          'serif',
        ],
        // Display — refined gallery serif. Used everywhere except hero:
        // section headings ("Bodies of work"), page titles ("Yosi", "Contact"),
        // logo wordmark, painting card titles.
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
