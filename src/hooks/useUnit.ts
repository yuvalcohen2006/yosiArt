import { useEffect, useState } from 'react';
import i18n from '@/i18n';

export type Unit = 'cm' | 'in';

const STORAGE_KEY = 'yosiart.unit';

/** 1 cm in inches. */
const CM_TO_IN = 0.393701;

const subscribers = new Set<(u: Unit) => void>();

/** An explicit choice, or null if the visitor has never picked one. */
function stored(): Unit | null {
  if (typeof window === 'undefined') return null;
  const v = localStorage.getItem(STORAGE_KEY);
  return v === 'cm' || v === 'in' ? v : null;
}

/** Israel measures canvases in centimetres; an English-speaking buyer is
 *  almost certainly measuring a wall in inches. Start each visitor in the
 *  convention they think in — the toggle is there for the other case. */
function localeDefault(): Unit {
  return (i18n.resolvedLanguage ?? 'he').startsWith('he') ? 'cm' : 'in';
}

function read(): Unit {
  return stored() ?? localeDefault();
}

// Switching language re-picks the default, but only for a visitor who has
// never touched the toggle. An explicit choice always outranks the locale.
if (typeof window !== 'undefined') {
  i18n.on('languageChanged', () => {
    if (stored()) return;
    const next = localeDefault();
    subscribers.forEach((cb) => cb(next));
  });
}

/**
 * Measurement-unit store for the painting dimensions. Same tiny pub-sub
 * shape as `useCurrency` — no React Context, every consumer reads the
 * same in-memory value and re-renders when `setUnit` fires. Persisted
 * to localStorage so the choice survives reloads. Defaults to cm.
 */
export function useUnit() {
  const [unit, setUnitState] = useState<Unit>(read);

  useEffect(() => {
    const cb = (next: Unit) => setUnitState(next);
    subscribers.add(cb);
    return () => {
      subscribers.delete(cb);
    };
  }, []);

  const setUnit = (next: Unit) => {
    if (next === unit) return;
    localStorage.setItem(STORAGE_KEY, next);
    subscribers.forEach((cb) => cb(next));
  };

  return { unit, setUnit };
}

/**
 * Format a width × height pair (stored in cm) for display in the active unit.
 *
 * Inches are rounded to whole numbers. A canvas is not a machined part — "24 ×
 * 32 in" is the figure a buyer wants for a wall, and the decimal that rounding
 * discards is under half a centimetre.
 */
export function formatDimensions(
  widthCm: number,
  heightCm: number,
  unit: Unit,
): string {
  if (unit === 'in') {
    const fmt = (cm: number) => Math.round(cm * CM_TO_IN);
    return `${fmt(widthCm)} × ${fmt(heightCm)} in`;
  }
  return `${widthCm} × ${heightCm} cm`;
}
