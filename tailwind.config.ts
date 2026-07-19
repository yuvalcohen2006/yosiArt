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
        // The dark stage behind the landing hero and the footer. Deeper and
        // more neutral than flame-900, so the grid and beams drifting over it
        // read as light rather than as a lifted grey.
        stage: '#0a0a0a',
        // ===== FIXED SITE PALETTE ("Flame") — the 5-color system. =====
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
        // `accent` tracks the site accent (object form so shadcn gets
        // accent-foreground). Drives the focus-visible ring among others.
        accent: { DEFAULT: '#eb5e28', foreground: '#ffffff' },
        // The accent as SMALL TEXT ON A LIGHT SURFACE, and nothing else.
        //
        // #eb5e28 is 3.41:1 on white — fine for fills, borders and large
        // display type (AA-large wants 3:1), but under the 4.5:1 that WCAG AA
        // and ת"י 5568 require for body-size text. This is the same hue two
        // steps darker: 4.69:1, so nav hover, links, card titles and the rail
        // eyebrow comply without touching the signature colour anywhere it is
        // a fill, a border, or sitting on the dark stage (5.81:1 there).
        //
        // Rule of thumb: `bg-primary`/`border-primary` stay primary;
        // `text-primary` on a light surface becomes `text-accent-ink`.
        'accent-ink': '#c44f12',

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
