import { useEffect, useState } from 'react';

export type Unit = 'cm' | 'in';

const STORAGE_KEY = 'yosiart.unit';
const DEFAULT_UNIT: Unit = 'cm';

/** 1 cm in inches. */
const CM_TO_IN = 0.393701;

const subscribers = new Set<(u: Unit) => void>();

function read(): Unit {
  if (typeof window === 'undefined') return DEFAULT_UNIT;
  const v = localStorage.getItem(STORAGE_KEY);
  return v === 'cm' || v === 'in' ? v : DEFAULT_UNIT;
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
