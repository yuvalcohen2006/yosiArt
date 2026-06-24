import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Direct hex values — Tailwind 3.4+ generates per-opacity variants
      // automatically (e.g. bg-paper/50 works), so we don't need the
      // <alpha-value> CSS-variable indirection at the theme layer.
      colors: {
        // Deep-sea palette — the site's core colour system.
        sea: {
          900: '#0d1b2a', // deepest navy (hero field / ink)
          800: '#1b263b', // dark sea
          600: '#415a77', // mid sea blue (accent)
          400: '#778da9', // muted sea blue
          100: '#e0e1dd', // pale sea mist (light text on dark)
        },
        // Semantic tokens — names kept so existing components re-theme for
        // free; re-pointed onto the deep-sea palette.
        paper: '#f5f6f7', // cool near-white page surface
        ink: '#0d1b2a', // deep-navy headlines + body (very high contrast)
        mist: '#dfe1e4', // card backings / skeletons (decorative)
        teal: '#415a77', // legacy accent name -> deep-sea blue
        deep: '#1b263b', // legacy "Sold"/price accent -> dark sea
        accent: '#415a77', // swappable accent -> deep-sea blue (~6.4:1 text-safe)
        line: '#cfd4da', // structural grid / baseline rules (decorative)
        slate: '#415a77', // secondary readable text (~6.4:1)
      },
      fontFamily: {
        // Big titles / oversized Swiss-editorial headlines — Heebo, run heavy
        // (font-black / 900) for impact. Hebrew + Latin both in-family.
        hero: ['"Heebo"', 'system-ui', 'sans-serif'],
        // Section headings, page titles, logo wordmark, card titles — also Heebo
        // so the typographic system is one family with weight-driven hierarchy.
        display: ['"Heebo"', 'system-ui', 'sans-serif'],
        // Running / body text — Alef (Heebo as a metrics-compatible fallback).
        sans: ['"Alef"', '"Heebo"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
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
