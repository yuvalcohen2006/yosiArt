import Logo from './Logo';

const SOCIALS: { href: string; label: string; icon: 'instagram' | 'facebook' }[] = [
  { href: '#', label: 'Instagram', icon: 'instagram' },
  { href: '#', label: 'Facebook', icon: 'facebook' },
];

function SocialIcon({ name }: { name: 'instagram' | 'facebook' }) {
  if (name === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <path d="M14 9h3V5h-3a4 4 0 0 0-4 4v2H7v4h3v6h4v-6h3l1-4h-4V9a0 0 0 0 1 0-0z" />
    </svg>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-32 border-t border-mist/70">
      <div className="mx-auto max-w-7xl px-6 md:px-10 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 items-start">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <Logo variant="footer" />
            <p className="text-sm text-ink/60 max-w-xs leading-relaxed">
              Original acrylic paintings on canvas. Each piece is one of a kind.
            </p>
          </div>

          {/* Socials — center column on desktop */}
          <div className="flex md:justify-center">
            <ul className="flex items-center gap-5">
              {SOCIALS.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    aria-label={s.label}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center justify-center h-10 w-10 rounded-full text-ink/70 hover:text-teal border border-mist hover:border-teal/50 transition-colors duration-300"
                  >
                    <SocialIcon name={s.icon} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Fine print — right column */}
          <div className="flex flex-col md:items-end gap-3 text-xs uppercase tracking-[0.22em] text-ink/55">
            <span>© {year} YosiArt</span>
            <a href="mailto:hello@yosiart.example" className="hover:text-teal transition-colors duration-300 normal-case tracking-normal text-sm text-ink/70">
              hello@yosiart.example
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
