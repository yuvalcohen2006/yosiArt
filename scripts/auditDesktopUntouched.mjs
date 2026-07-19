#!/usr/bin/env node
/**
 * Verifies the mobile work cannot affect desktop.
 *
 * The rule for this codebase is that phone fixes are written as `max-md:`
 * variants or inside `md:hidden` elements, never by editing a base utility —
 * because Tailwind is mobile-first, so an unprefixed class applies at EVERY
 * width and silently moves the desktop layout too.
 *
 * This script reads the built stylesheet and, for each mobile-only token,
 * reports the @media context every occurrence sits in. Anything that turns up
 * outside a `max-width` query is a violation: it would apply on desktop.
 *
 * Usage: node scripts/auditDesktopUntouched.mjs
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ASSETS = 'dist/assets';

/** The largest CSS bundle is the app stylesheet; the rest are route chunks. */
function mainStylesheet() {
  const files = readdirSync(ASSETS)
    .filter((f) => f.endsWith('.css'))
    .map((f) => join(ASSETS, f));
  if (!files.length) throw new Error('no CSS in dist/assets — run npm run build');
  return files
    .map((f) => ({ f, len: readFileSync(f, 'utf8').length }))
    .sort((a, b) => b.len - a.len)[0].f;
}

const file = mainStylesheet();
const css = readFileSync(file, 'utf8');

/** Char ranges of every @media block, with its condition. */
const ranges = [];
const re = /@media([^{]+)\{/g;
let m;
while ((m = re.exec(css))) {
  let depth = 1;
  let j = m.index + m[0].length;
  while (j < css.length && depth > 0) {
    if (css[j] === '{') depth++;
    else if (css[j] === '}') depth--;
    j++;
  }
  ranges.push({ q: m[1].trim(), start: m.index, end: j });
}

const contextAt = (pos) => {
  const hits = ranges.filter((r) => pos >= r.start && pos < r.end).map((r) => r.q);
  return hits.length ? hits.join(' AND ') : null; // null = applies at all widths
};

/** Tokens that must never apply at >=768px. */
const MOBILE_ONLY = [
  '.max-md\\:hidden',
  '.max-md\\:grid',
  '.max-md\\:px-4',
  '.max-md\\:py-2',
  '.max-md\\:h-12',
  '.max-md\\:pt-\\[88px\\]',
  '.max-md\\:min-h-\\[100svh\\]',
  '.md\\:hidden',
];

let violations = 0;
console.log(`Stylesheet: ${file}\n`);

for (const token of MOBILE_ONLY) {
  const contexts = new Set();
  let p = 0;
  while ((p = css.indexOf(token, p)) !== -1) {
    contexts.add(contextAt(p));
    p += token.length;
  }
  if (!contexts.size) {
    console.log(`  --   ${token}  (not emitted — unused)`);
    continue;
  }
  for (const c of contexts) {
    // Tailwind compiles `max-md:` to `@media not all and (min-width: 768px)`,
    // NOT to a `max-width` query. Both mean "below 768px"; only the negated
    // form is emitted. Checking for the literal string "max-width" therefore
    // fails every correct rule, which is exactly what this script did first.
    const isBelowBreakpoint =
      !!c && (c.includes('max-width') || /not\s+all\s+and\s*\(\s*min-width/.test(c));
    // `md:hidden` is correct as a min-width rule: it HIDES at >=768, which is
    // how it keeps phone-only markup off desktop.
    const isMinWidthHide = token === '.md\\:hidden' && !!c && c.includes('min-width');
    const ok = isBelowBreakpoint || isMinWidthHide;
    if (!ok) violations++;
    console.log(
      `  ${ok ? 'OK  ' : 'FAIL'} ${token}\n         ${c ?? '(no media query — APPLIES AT ALL WIDTHS)'}`,
    );
  }
}

/* Custom properties: report each DECLARATION and its media context, so the
   desktop value and the phone override can be eyeballed side by side. Matching
   `--nav-h:` with the colon is what keeps this from also hitting the token
   inside escaped utility class names like `.h-\[calc\(100svh-var\(--nav-h\)\)\]`,
   which produced pages of noise on the first attempt. */
for (const prop of ['--nav-h', '--frame-max-h']) {
  console.log(`\n  ${prop}`);
  const needle = `${prop}:`;
  let p = 0;
  while ((p = css.indexOf(needle, p)) !== -1) {
    const end = css.indexOf(';', p);
    const close = css.indexOf('}', p);
    const stop = end === -1 || (close !== -1 && close < end) ? close : end;
    const value = css.slice(p + needle.length, stop).trim();
    console.log(
      `         ${prop}: ${value.padEnd(24)} in  ${contextAt(p) ?? 'base (all widths)'}`,
    );
    p += needle.length;
  }
}

console.log('');
if (violations) {
  console.error(`${violations} token(s) would apply on desktop. FAIL.`);
  process.exit(1);
}
console.log('All mobile-only tokens are confined to max-width queries.');
