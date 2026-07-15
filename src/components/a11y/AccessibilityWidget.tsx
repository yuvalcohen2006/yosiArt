import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Accessibility,
  Contrast,
  Link as LinkIcon,
  Minus,
  PauseCircle,
  Plus,
  RotateCcw,
  Type,
  X,
} from 'lucide-react';
import { useLocale } from '@/hooks/useLocale';
import { cn } from '@/lib/utils';
import { A11Y_MOTION_EVENT } from './useStopMotion';

/**
 * Accessibility preferences. Applied as classes on <html> (+ a root
 * font-size for text scaling) and persisted to localStorage so they
 * survive navigation and return visits. Never transmitted anywhere.
 *
 * The same key + class names are read by the pre-paint script in
 * index.html — keep the two in sync.
 */
type A11yPrefs = {
  /** Root font-size, percent. 100 = default, up to 150. */
  fontScale: number;
  contrast: boolean;
  links: boolean;
  stopMotion: boolean;
  readable: boolean;
};

const DEFAULT_PREFS: A11yPrefs = {
  fontScale: 100,
  contrast: false,
  links: false,
  stopMotion: false,
  readable: false,
};

const STORAGE_KEY = 'yosiart.a11y';
const FONT_MIN = 100;
const FONT_MAX = 150;
const FONT_STEP = 10;

/** Clamp a stored font scale to a sane, step-aligned value. */
function clampFontScale(v: unknown): number {
  const n = typeof v === 'number' && Number.isFinite(v) ? v : FONT_MIN;
  const stepped = Math.round(n / FONT_STEP) * FONT_STEP;
  return Math.min(FONT_MAX, Math.max(FONT_MIN, stepped));
}

/** Mirror the prefs onto the <html> element. */
function applyPrefs(p: A11yPrefs) {
  const root = document.documentElement;
  root.classList.toggle('a11y-contrast', p.contrast);
  root.classList.toggle('a11y-links', p.links);
  root.classList.toggle('a11y-stop-motion', p.stopMotion);
  root.classList.toggle('a11y-readable', p.readable);
  root.style.fontSize = p.fontScale === 100 ? '' : `${p.fontScale}%`;
}

/** Read persisted prefs, tolerating missing/corrupt/tampered storage. */
function loadPrefs(): A11yPrefs {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<A11yPrefs>;
    return {
      fontScale: clampFontScale(parsed.fontScale),
      contrast: !!parsed.contrast,
      links: !!parsed.links,
      stopMotion: !!parsed.stopMotion,
      readable: !!parsed.readable,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

/**
 * Floating accessibility widget (נגישות) — the small round button pinned to
 * the bottom-left corner on every page. Opens a compact panel with the
 * adjustments Israeli accessibility practice expects from a service widget:
 * text size, high contrast, link highlighting, stopping animations and a
 * readable font — plus reset and a link to the accessibility statement.
 *
 * The panel is a labelled dialog: it takes focus on open, Esc and
 * outside-clicks close it (returning focus to the toggle), the toggle
 * reports `aria-expanded`, and every control is a real button with an
 * `aria-pressed` state.
 */
export default function AccessibilityWidget() {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  // Lazy init straight from storage on the client (SSG renders defaults) —
  // no restore effect, no flash, single source of truth.
  const [prefs, setPrefs] = useState<A11yPrefs>(() =>
    typeof window === 'undefined' ? DEFAULT_PREFS : loadPrefs(),
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // The one place prefs touch the world: apply to <html>, persist, and let
  // JS-driven animations (carousel timers, framer-motion via MotionConfig)
  // know the motion mode may have changed. Runs on mount too, which is a
  // no-op re-application of what the index.html pre-paint script already set.
  useEffect(() => {
    applyPrefs(prefs);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      /* storage may be unavailable (private mode) — prefs still apply */
    }
    window.dispatchEvent(new Event(A11Y_MOTION_EVENT));
  }, [prefs]);

  const update = useCallback((patch: Partial<A11yPrefs>) => {
    setPrefs((prev) => ({ ...prev, ...patch }));
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    toggleRef.current?.focus();
  }, []);

  // Focus the dialog when it opens so keyboard users land inside it.
  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  // Esc closes; clicking/tapping outside closes.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open, close]);

  const toggles: Array<{
    key: 'contrast' | 'links' | 'stopMotion' | 'readable';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { key: 'contrast', label: t('a11y.highContrast'), icon: Contrast },
    { key: 'links', label: t('a11y.highlightLinks'), icon: LinkIcon },
    { key: 'stopMotion', label: t('a11y.stopAnimations'), icon: PauseCircle },
    { key: 'readable', label: t('a11y.readableFont'), icon: Type },
  ];

  return (
    <div ref={rootRef} className="fixed bottom-4 left-4 z-50">
      <button
        ref={toggleRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={t('a11y.open')}
        className="grid h-11 w-11 place-items-center rounded-full bg-ink text-paper shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary active:translate-y-0"
      >
        <Accessibility aria-hidden className="h-6 w-6" />
      </button>

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label={t('a11y.title')}
          tabIndex={-1}
          className="absolute bottom-14 left-0 w-64 rounded-md border border-line bg-white p-4 shadow-2xl outline-none animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-200"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-ink">{t('a11y.title')}</p>
            <button
              type="button"
              onClick={close}
              aria-label={t('a11y.close')}
              className="grid h-7 w-7 place-items-center rounded-md text-slate transition-colors hover:bg-ink/5 hover:text-ink"
            >
              <X aria-hidden className="h-4 w-4" />
            </button>
          </div>

          {/* Text size stepper */}
          <div className="mt-3 flex items-center justify-between rounded-md border border-line px-2 py-1.5">
            <span className="text-xs text-slate">{t('a11y.textSize')}</span>
            <div className="flex items-center gap-1" dir="ltr">
              <button
                type="button"
                onClick={() =>
                  update({
                    fontScale: Math.max(FONT_MIN, prefs.fontScale - FONT_STEP),
                  })
                }
                disabled={prefs.fontScale <= FONT_MIN}
                aria-label={t('a11y.decreaseText')}
                className="grid h-7 w-7 place-items-center rounded-md border border-line text-ink transition-colors hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-40"
              >
                <Minus aria-hidden className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-[44px] text-center text-xs tabular-nums text-ink">
                {prefs.fontScale}%
              </span>
              <button
                type="button"
                onClick={() =>
                  update({
                    fontScale: Math.min(FONT_MAX, prefs.fontScale + FONT_STEP),
                  })
                }
                disabled={prefs.fontScale >= FONT_MAX}
                aria-label={t('a11y.increaseText')}
                className="grid h-7 w-7 place-items-center rounded-md border border-line text-ink transition-colors hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-40"
              >
                <Plus aria-hidden className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Mode toggles */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            {toggles.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => update({ [key]: !prefs[key] })}
                aria-pressed={prefs[key]}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-md border px-2 py-2.5 text-center text-[11px] leading-tight transition-colors duration-200',
                  prefs[key]
                    ? 'border-primary/50 bg-primary/10 text-primary'
                    : 'border-line text-slate hover:border-ink/30 hover:text-ink',
                )}
              >
                <Icon aria-hidden className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Reset + statement link */}
          <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
            <button
              type="button"
              onClick={() => setPrefs({ ...DEFAULT_PREFS })}
              className="inline-flex items-center gap-1.5 text-xs text-slate transition-colors hover:text-ink"
            >
              <RotateCcw aria-hidden className="h-3.5 w-3.5" />
              {t('a11y.reset')}
            </button>
            <Link
              to="/accessibility"
              onClick={() => setOpen(false)}
              className="text-xs text-slate underline underline-offset-2 transition-colors hover:text-primary"
            >
              {t('a11y.statement')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
