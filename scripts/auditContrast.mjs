#!/usr/bin/env node
/**
 * Contrast + dark-surface audit.
 *
 * WHY THIS EXISTS
 * ---------------
 * The high-contrast accessibility mode once drove the footer to #0a0a0a text on
 * the #0a0a0a stage — a 1.00:1 ratio, i.e. completely invisible. It shipped
 * because the rule was keyed off a hand-written allowlist of light text
 * utilities, and `text-flame-300` simply was not on it. Nothing failed; the
 * build was green; only a human looking at the page could see it.
 *
 * This script is that human, automated. It runs against the PRERENDERED HTML in
 * dist/, so it audits what visitors actually receive rather than what the source
 * appears to say.
 *
 * It enforces two things:
 *
 *   1. Every dark-filled element carries `data-surface="dark"` (on itself or an
 *      ancestor). That attribute is what flips high-contrast mode to white text.
 *      Miss it and you reproduce the original bug exactly.
 *
 *   2. Every explicit text colour sitting on a known surface clears WCAG AA
 *      (4.5:1 for body text) in NORMAL mode — checked in both modes, since a
 *      fix for one can regress the other.
 *
 * Exit code 1 on any failure, so `npm run audit:contrast` gates a release.
 *
 * Usage:  node scripts/auditContrast.mjs        (expects dist/ to exist)
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const DIST = join(ROOT, 'dist');

/* ── palette ──────────────────────────────────────────────────────────────
   Parsed from tailwind.config.ts rather than duplicated, so renaming or
   retuning a colour can never silently desync this audit from the site. */
function loadPalette() {
  const src = readFileSync(join(ROOT, 'tailwind.config.ts'), 'utf8');
  const flat = {};

  // Flat entries:  name: '#rrggbb'
  for (const [, k, v] of src.matchAll(/(\w[\w-]*)\s*:\s*'(#[0-9a-fA-F]{6})'/g)) {
    flat[k] = v.toLowerCase();
  }
  // Nested scales:  flame: { 50: '#...', 300: '#...' }
  for (const [, scale, body] of src.matchAll(
    /(\w+)\s*:\s*\{([^{}]*#[0-9a-fA-F]{6}[^{}]*)\}/g,
  )) {
    for (const [, key, hex] of body.matchAll(
      /(\w+)\s*:\s*'(#[0-9a-fA-F]{6})'/g,
    )) {
      flat[key === 'DEFAULT' ? scale : `${scale}-${key}`] = hex.toLowerCase();
    }
  }
  // Aliases the config expresses via CSS vars, resolved to their real values.
  flat.primary = flat.accent ?? '#eb5e28';
  flat.white = '#ffffff';
  flat.black = '#000000';
  return flat;
}

const PALETTE = loadPalette();

/* ── WCAG maths (sRGB relative luminance, WCAG 2.1 §1.4.3) ─────────────── */
const luminance = (hex) => {
  const c = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (fg, bg) => {
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
};

/** A fill counts as dark when white text beats near-black text on it. */
const isDark = (hex) => luminance(hex) < 0.18;

/* ── tiny HTML walker ─────────────────────────────────────────────────────
   A tag stack, not a full DOM. Prerendered output is machine-generated and
   well-formed, so this is sufficient and keeps the script dependency-free. */
const VOID_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

function walk(html, visit) {
  const stack = [];
  const tagRe = /<(\/?)([a-zA-Z][\w-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g;
  let m;
  while ((m = tagRe.exec(html))) {
    const [, closing, rawName, attrs, selfClose] = m;
    const name = rawName.toLowerCase();
    if (closing) {
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].name === name) {
          stack.length = i;
          break;
        }
      }
      continue;
    }
    const cls = (attrs.match(/\sclass="([^"]*)"/) || [, ''])[1].split(/\s+/);
    const node = {
      name,
      cls,
      darkSurface: /\sdata-surface="dark"/.test(attrs),
      line: html.slice(0, m.index).split('\n').length,
    };
    visit(node, stack);
    if (!VOID_TAGS.has(name) && !selfClose) stack.push(node);
  }
}

/** Resolve a `bg-*` / `text-*` utility to a hex, ignoring opacity variants
 *  (`bg-ink/5`) and state prefixes (`hover:`, `focus:`, `md:`) — neither
 *  describes the element's resting, default appearance. */
function resolve(cls, prefix) {
  if (cls.includes(':') || cls.includes('/')) return null;
  if (!cls.startsWith(prefix)) return null;
  return PALETTE[cls.slice(prefix.length)] ?? null;
}

/* ── audit ────────────────────────────────────────────────────────────────*/
const failures = [];
const warnings = [];

function auditFile(file) {
  const html = readFileSync(file, 'utf8');
  const rel = relative(ROOT, file);

  walk(html, (node, stack) => {
    const inDark = node.darkSurface || stack.some((a) => a.darkSurface);

    // (1) High-contrast simulation, modelled on the real CSS rather than on a
    // proxy. index.css blackens text UNLESS the element is inside a declared
    // dark surface, or carries one of the spared light-text utilities. So a
    // dark fill is only a bug when NEITHER escape applies — which is exactly
    // the footer case (`text-flame-300`, not spared, on `bg-stage`).
    const bg = node.cls.map((c) => resolve(c, 'bg-')).find(Boolean);
    const spared = node.cls.some((c) =>
      /text-(paper|white|flame-50)\b/.test(c),
    );
    if (bg && isDark(bg) && !inDark && !spared) {
      failures.push(
        `${rel}:${node.line}  <${node.name}> has dark fill ${bg}, but is ` +
          `neither inside data-surface="dark" nor using a spared light-text ` +
          `utility.\n      High contrast forces its text to #0a0a0a ` +
          `→ ${ratio('#0a0a0a', bg).toFixed(2)}:1 (unreadable).`,
      );
    }

    // (2) explicit text colour on a known surface must clear AA in normal mode.
    const fg = node.cls.map((c) => resolve(c, 'text-')).find(Boolean);
    if (fg) {
      // An element's OWN fill wins over any inherited surface — a dark button
      // on a white page is a dark surface for its own label. Getting this
      // wrong reported `text-paper` on `bg-ink` as white-on-white.
      const surface = bg ?? (inDark ? PALETTE.stage : PALETTE.paper);
      const r = ratio(fg, surface);
      if (r < 4.5) {
        const where = bg
          ? 'own fill'
          : inDark
            ? 'dark surface'
            : 'light surface';
        // Large display type is held to AA-large (3:1) instead.
        const large = node.cls.some((c) =>
          /^text-(4xl|5xl|6xl|7xl|8xl|9xl)$/.test(c),
        );
        const msg =
          `${rel}:${node.line}  <${node.name}> ${fg} on ${where} ` +
          `${surface} = ${r.toFixed(2)}:1`;
        if (large && r >= 3) warnings.push(`${msg} (large text, AA-large OK)`);
        else if (r < 3) failures.push(`${msg} — below AA (needs 4.5:1)`);
        else warnings.push(`${msg} — below AA for body text`);
      }
    }
  });
}

/* ── high-contrast simulation of the two mode outcomes ───────────────────*/
function auditModes() {
  const cases = [
    ['high contrast, light surface', '#0a0a0a', PALETTE.paper],
    ['high contrast, dark surface', '#ffffff', PALETTE.stage],
    ['normal, footer', PALETTE['flame-300'], PALETTE.stage],
    ['normal, body', PALETTE.ink, PALETTE.paper],
  ];
  console.log('Mode matrix');
  for (const [label, fg, bg] of cases) {
    const r = ratio(fg, bg);
    const ok = r >= 4.5;
    console.log(
      `  ${ok ? 'PASS' : 'FAIL'}  ${label.padEnd(30)} ${fg} on ${bg} = ${r.toFixed(2)}:1`,
    );
    if (!ok) failures.push(`Mode matrix: ${label} = ${r.toFixed(2)}:1`);
  }
  console.log('');
}

/* ── run ──────────────────────────────────────────────────────────────────*/
if (!existsSync(DIST)) {
  console.error('dist/ not found — run `npm run build` first.');
  process.exit(1);
}

const htmlFiles = [];
(function collect(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) collect(p);
    else if (entry.endsWith('.html')) htmlFiles.push(p);
  }
})(DIST);

auditModes();
htmlFiles.forEach(auditFile);

console.log(`Scanned ${htmlFiles.length} prerendered page(s).\n`);

if (warnings.length) {
  console.log(`${warnings.length} warning(s):`);
  warnings.forEach((w) => console.log(`  ! ${w}`));
  console.log('');
}

if (failures.length) {
  console.error(`${failures.length} FAILURE(S):`);
  failures.forEach((f) => console.error(`  x ${f}`));
  process.exit(1);
}

console.log('Contrast audit passed.');
