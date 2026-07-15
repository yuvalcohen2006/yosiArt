/**
 * Positive modulo — `mod(-1, 5) === 4`. JS's `%` returns negative values for
 * negative operands, which breaks index-wrapping in the carousels; every
 * wrapping component should use this one helper instead of hand-rolling the
 * double-modulo idiom.
 */
export function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}
