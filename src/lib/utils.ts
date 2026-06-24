import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge conditional class names and de-dupe conflicting Tailwind utilities.
 * `clsx` resolves the conditionals; `tailwind-merge` makes the last
 * conflicting utility win (e.g. `px-2 px-4` → `px-4`).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
