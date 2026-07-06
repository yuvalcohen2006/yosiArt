import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class'],
  theme: {
    extend: {
      // Direct hex values — Tailwind 3.4+ generates per-opacity variants
      // automatically (e.g. bg-paper/50 works), so we don't need the
      // <alpha-value> CSS-variable indirection at the theme layer.
      colors: {
        // ===== FIXED SITE PALETTE ("Flame") — the current 5-color system. =====
        // flame-500 is the accent and equals the shadcn --primary var.
        flame: {
          50: '#fffcf2', // floral white — light surfaces
          300: '#ccc5b9', // timberwolf — muted secondary surfaces
          500: '#eb5e28', // burnt orange — THE accent
          700: '#403d39', // dark taupe — secondary dark
          900: '#252422', // near-black — primary dark (fills, icons, text)
        },
        // Deep-sea palette — legacy colour system (old header/hero); do not
        // use for new work.
        sea: {
          900: '#0d1b2a', // deepest navy (hero field / ink)
          800: '#1b263b', // dark sea
          600: '#415a77', // mid sea blue (accent)
          400: '#778da9', // muted sea blue
          100: '#e0e1dd', // pale sea mist (light text on dark)
        },
        // ===== FIXED SITE PALETTE ("Aurora") — from the landing animation =====
        // Brand trio (the three animated ribbons), tuned for cohesion + contrast.
        brand: '#4863b8', // blue  — PRIMARY (CTAs, key actions, active)
        teal: '#3c8fa0', // teal   — SECONDARY accent / link + hover highlight
        indigo: '#6e5fae', // indigo — TERTIARY accent (sparingly)
        // Surfaces + text.
        paper: '#ffffff', // white base
        ink: '#403d39', // dark taupe (= flame-700) — headlines + body (~10.8:1 on white)
        slate: '#5a6478', // secondary text (~5.6:1)
        mist: '#eef0f4', // card backings / skeletons (decorative)
        line: '#e5e8ef', // cool light borders / rules
        deep: '#3b539c', // darker brand blue — primary hover
        // `accent` is the teal (object form so shadcn gets accent-foreground;
        // existing `text-accent`/`bg-accent` now resolve to teal).
        accent: { DEFAULT: '#3c8fa0', foreground: '#ffffff' },

        // shadcn/ui semantic tokens (CSS-vars in src/index.css :root) — added
        // so the pasted shadcn navbar + its components style correctly. These
        // names don't collide with the project's tokens above.
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      fontFamily: {
        // Titles / headlines — Frank Ruhl Libre (elegant Hebrew + Latin serif).
        hero: ['"Frank Ruhl Libre"', 'Georgia', 'serif'],
        display: ['"Frank Ruhl Libre"', 'Georgia', 'serif'],
        // Running / body + UI text — Assistant (full-weight Hebrew sans).
        sans: ['"Assistant"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
      transitionTimingFunction: {
        gallery: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      },
      animation: {
        // Click ripple that expands from the cursor to flood the button and
        // stays put (fill-mode forwards) — the persistent "rippled" fill.
        rippling: 'rippling 650ms ease-out forwards',
      },
      keyframes: {
        rippling: {
          '0%': { transform: 'scale(0)', opacity: '0.5' },
          '100%': { transform: 'scale(2.8)', opacity: '1' },
        },
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
