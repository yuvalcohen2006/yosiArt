import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      // Aurora background drift (Aceternity UI). Paired with the
      // animated `after:` layer in AuroraBackground.tsx + the colour
      // CSS variables in src/index.css.
      animation: {
        aurora: 'aurora 60s linear infinite',
      },
      keyframes: {
        aurora: {
          from: { backgroundPosition: '50% 50%, 50% 50%' },
          to: { backgroundPosition: '350% 50%, 350% 50%' },
        },
      },
      // Direct hex values — Tailwind 3.4+ generates per-opacity variants
      // automatically (e.g. bg-paper/50 works), so we don't need the
      // <alpha-value> CSS-variable indirection at the theme layer.
      colors: {
        // Grey-forward editorial palette. Legacy token names (paper/ink/mist/
        // teal/deep) are kept and re-pointed to greys so every existing
        // component re-themes with zero class changes.
        paper: '#f4f3f1', // warm off-white page surface
        ink: '#1a1a1a', // headline + body ink — ~15.8:1 on paper (AAA)
        mist: '#dcdad6', // card backings / skeletons (decorative)
        teal: '#5c5c5c', // legacy accent name → mid-grey, ~6.3:1 (text-safe)
        deep: '#4a4a4a', // legacy "Sold"/price accent → darker grey, ~7.4:1
        // New editorial tokens:
        accent: '#3f3f3f', // single swappable "pop" grey — text-safe; one line to change later
        line: '#c9c7c2', // structural grid / baseline rules (decorative)
        slate: '#5c5c5c', // secondary readable body text, ~6.3:1
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
