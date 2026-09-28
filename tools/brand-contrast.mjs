// brand-contrast.mjs — WCAG 2.x contrast for every text/background pair proposed in docs/BRAND-SYSTEM.md.
// Pure Node (no browser): colours are resolved here with the same sRGB arithmetic CSS uses for
// `color-mix(in srgb, …)` and for painting a translucent layer over an opaque one (source-over).
// Glass is judged as the translucent fill composited over its WORST-CASE backdrop (named per pair);
// backdrop blur is ignored, because blur averages the backdrop and can only move it toward the mean,
// never past the extreme we assume. Gradients are judged at every stop; the worst stop is reported.
//   node tools/brand-contrast.mjs            -> prints the markdown table, writes audit/brand-contrast.json
//   exit 1 if any pair marked for text misses its threshold
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const hex2rgb = (h) => { h = h.replace('#', ''); if (h.length === 3) h = [...h].map((c) => c + c).join(''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); };
const rgb2hex = (c) => '#' + c.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('');
// color-mix(in srgb, A p%, B) == A*p + B*(1-p)
const mix = (a, p, b) => rgb2hex(hex2rgb(a).map((v, i) => v * p + hex2rgb(b)[i] * (1 - p)));
// a translucent colour [hex, alpha] painted over an opaque backdrop
const over = (fg, alpha, bg) => mix(fg, alpha, bg);
const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const lum = (h) => { const [r, g, b] = hex2rgb(h).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

// ---- source anchors (measured: audit/design-baseline.json + audit/capture/*.style.json) ----------
const SRC = {
  green: '#759b2a', lime: '#94bc4a', divider: '#446600', body: '#464451', slate: '#36565e',
  slateDeep: '#1d2e33', hero: '#2d2d2d', grey: '#757575', band: '#b7b7b7', alert: '#941221',
  promo: '#60af28', stone: '#efefef', white: '#ffffff', black: '#000000',
};

// ---- proposed tokens ----------------------------------------------------------------------------
const T = {
  // greens: 400 and 500 are the brand anchors, 700 is the source's own nav-divider green
  'green-50': mix(SRC.lime, 0.07, '#ffffff'),
  'green-100': mix(SRC.lime, 0.16, '#ffffff'),
  'green-200': mix(SRC.lime, 0.32, '#ffffff'),
  'green-300': mix(SRC.lime, 0.62, '#ffffff'),
  'green-400': SRC.lime,
  'green-500': SRC.green,
  'green-600': mix(SRC.green, 0.3, SRC.divider),
  'green-700': SRC.divider,
  'green-800': mix(SRC.divider, 0.72, '#000000'),
  'green-900': mix(SRC.divider, 0.52, '#000000'),
  'green-950': mix(SRC.divider, 0.3, '#000000'),
  // ink: derived from the source body colour #464451
  'ink-950': mix(SRC.body, 0.5, '#000000'),
  'ink-900': mix(SRC.body, 0.7, '#000000'),
  'ink-700': SRC.body,
  'ink-600': mix(SRC.body, 0.88, '#ffffff'),
  'ink-500': mix(SRC.body, 0.8, '#ffffff'),
  'ink-300': mix(SRC.body, 0.45, '#ffffff'),
  'ink-200': mix(SRC.body, 0.25, '#ffffff'),
  'ink-100': mix(SRC.body, 0.12, '#ffffff'),
  'ink-50': mix(SRC.body, 0.05, '#ffffff'),
  // headings: the source's own slates
  'slate-700': SRC.slate,
  'slate-900': SRC.slateDeep,
  // alert: the source's emergency red
  alert: SRC.alert,
  'alert-50': mix(SRC.alert, 0.07, '#ffffff'),
  // surfaces
  paper: '#ffffff',
  ground: mix(SRC.lime, 0.05, '#ffffff'),
  stone: SRC.stone,
  // light-field pools the light glass floats over (decorative, never text)
  'field-lime': mix(SRC.lime, 0.45, '#ffffff'),
  'field-teal': mix(SRC.slate, 0.16, '#ffffff'),
  // focus
  focus: SRC.divider,
  'focus-on-dark': mix(SRC.lime, 0.4, '#ffffff'),
  'focus-on-band': mix(SRC.divider, 0.3, '#000000'),
};

// ---- glass recipes: [fill hex, alpha] per gradient stop, and the worst-case backdrop --------------
const GLASS = {
  // A. light glass over photography: worst case = pure black under the panel
  'glass-image': { stops: [['#ffffff', 0.84], ['#ffffff', 0.76]], worst: '#000000', why: 'a black region of the photo (darkest possible pixel) under the whole panel' },
  // B. light glass on the light page ground: worst case = the deepest light-field pool (field-lime)
  'glass-light': { stops: [['#ffffff', 0.7], ['#ffffff', 0.56]], worst: T['field-lime'], why: 'the deepest light-field pool (--field-lime) under the whole panel; photos never sit behind it (use glass-image there)' },
  // C1. green-tinted glass (chips, sidebar links, active nav pill) on light ground or photos: worst = black
  'glass-leaf': { stops: [[T['green-50'], 0.9], [T['green-100'], 0.86]], worst: '#000000', why: 'black under the whole chip (it may sit on a photo)' },
  // C2. deep green glass (primary CTA band, top bar) with white text: worst = pure white behind it
  'glass-leaf-deep': { stops: [[T['green-700'], 0.9], [T['green-800'], 0.92]], worst: '#ffffff', why: 'pure white under the whole panel (lightest possible backdrop for white text)' },
  // D. dark glass (footer, emergency): worst = pure white behind it
  'glass-dark': { stops: [[T['green-950'], 0.86], [T['ink-950'], 0.9]], worst: '#ffffff', why: 'pure white under the whole panel (lightest possible backdrop for light text)' },
  // pill buttons on the solid #759b2a top bar: the backdrop IS the band, a known flat colour
  'pill-on-band': { stops: [['#ffffff', 0.9], ['#ffffff', 0.82]], worst: T['green-500'], why: 'the solid #759b2a band itself (a known flat colour, nothing else can be behind the pill)' },
};
const glassStops = (name) => GLASS[name].stops.map(([c, a]) => over(c, a, GLASS[name].worst));
// the solid fallbacks under @supports not (backdrop-filter)
const FALLBACK = {
  'glass-image': mix('#ffffff', 0.94, '#000000'),
  'glass-light': mix('#ffffff', 0.9, T['field-lime']),
  'glass-leaf': T['green-50'],
  'glass-leaf-deep': T['green-700'],
  'glass-dark': T['green-950'],
  'pill-on-band': '#ffffff',
};

// A background spec is a token name, a glass name (judged at every stop over its worst backdrop),
// or 'fallback:<glass>'.
const resolveBg = (spec) => {
  if (spec.startsWith('fallback:')) return [[spec, FALLBACK[spec.slice(9)]]];
  if (GLASS[spec]) return glassStops(spec).map((h, i) => [`${spec}[stop ${i + 1}]`, h]);
  if (T[spec]) return [[spec, T[spec]]];
  if (spec.startsWith('#')) return [[spec, spec]];
  throw new Error('unknown bg ' + spec);
};
const resolveFg = (spec) => (T[spec] ? T[spec] : spec.startsWith('#') ? spec : (() => { throw new Error('unknown fg ' + spec); })());

// [group, use, fg, [bg...], kind]  kind: 'body' 4.5 | 'large' 3.0 (>=24px, or >=18.66px bold) | 'ui' 3.0 (non-text) | 'source' (record only)
const PAIRS = [
  // --- the live site as it is (record only; shows what the redesign must fix) ---
  ['source', 'top bar callout + buttons (14px, white on #759b2a)', '#ffffff', ['#759b2a'], 'source-body'],
  ['source', '"Our Designer Optical" band title (34px, white on #759b2a)', '#ffffff', ['#759b2a'], 'source-large'],
  ['source', 'footer links (14px, white on #94bc4a)', '#ffffff', ['#94bc4a'], 'source-body'],
  ['source', 'footer headings (24px, white on #94bc4a)', '#ffffff', ['#94bc4a'], 'source-large'],
  ['source', 'main nav links (18px bold, #759b2a on white)', '#759b2a', ['#ffffff'], 'source-body'],
  ['source', 'body copy (#464451 on white)', '#464451', ['#ffffff'], 'source-body'],
  ['source', 'section headings (#36565e on white, 32-40px)', '#36565e', ['#ffffff'], 'source-large'],
  ['source', 'location band text (#464451 on #b7b7b7)', '#464451', ['#b7b7b7'], 'source-body'],
  ['source', 'location band headings (#1d2e33 on #b7b7b7, 22px)', '#1d2e33', ['#b7b7b7'], 'source-body'],
  ['source', 'reviews band text (white on #757575)', '#ffffff', ['#757575'], 'source-body'],
  ['source', 'review stars (#94bc4a on #757575)', '#94bc4a', ['#757575'], 'source-ui'],
  ['source', 'legal bar links (13px, #757575 on white)', '#757575', ['#ffffff'], 'source-body'],
  ['source', 'promo heading (17.5px, #60af28 on white)', '#60af28', ['#ffffff'], 'source-body'],
  ['source', 'emergency heading (28-30px, #941221 on white)', '#941221', ['#ffffff'], 'source-large'],

  // --- proposed: page text on solid surfaces ---
  ['solid', 'body text', 'ink-700', ['paper', 'ground', 'stone', 'green-50'], 'body'],
  ['solid', 'strong text, h3-h6', 'ink-900', ['paper', 'ground', 'green-50'], 'body'],
  ['solid', 'secondary text', 'ink-600', ['paper', 'ground', 'stone', 'green-50'], 'body'],
  ['solid', 'muted text: dates, captions, legal bar', 'ink-500', ['paper', 'ground', 'stone', 'green-50'], 'body'],
  ['solid', 'section headings (slate)', 'slate-700', ['paper', 'ground', 'green-50'], 'body'],
  ['solid', 'display headings, hero (deep slate)', 'slate-900', ['paper', 'ground', 'green-50'], 'body'],
  ['solid', 'links, eyebrows, nav text (deep green)', 'green-700', ['paper', 'ground', 'stone', 'green-50', 'green-100'], 'body'],
  ['solid', 'link hover / current nav item', 'green-800', ['paper', 'ground', 'green-50', 'green-100'], 'body'],
  ['solid', 'emergency heading and required-field marks', 'alert', ['paper', 'ground', 'alert-50'], 'body'],
  ['solid', 'white on primary button (rest; gradient green-600 -> green-700, every stop)', '#ffffff', ['green-600', 'green-700'], 'body'],
  ['solid', 'top-bar pill buttons: green-800 on white glass pill over the #759b2a band', 'green-800', ['pill-on-band', 'fallback:pill-on-band'], 'body'],
  ['solid', 'top-bar callout: deep green text directly on the #759b2a band', 'green-950', ['green-500'], 'body'],
  ['solid', 'white on primary button (hover)', '#ffffff', ['green-800'], 'body'],
  ['solid', 'white on the brand band #759b2a: LARGE text only (>=24px or >=18.66px bold)', '#ffffff', ['green-500'], 'large'],
  ['solid', 'deep green text on the brand band #759b2a', 'green-950', ['green-500'], 'body'],
  ['solid', 'ink on the lime band #94bc4a', 'green-950', ['green-400'], 'body'],
  ['solid', 'white on the emergency icon tile / alert button', '#ffffff', ['alert'], 'body'],
  ['solid', 'green-600 accent text (tags, secondary links)', 'green-600', ['paper', 'ground', 'green-50', 'stone'], 'body'],

  // --- proposed: glass over worst-case backdrops ---
  ['glass', 'A glass-image: body text', 'ink-700', ['glass-image', 'fallback:glass-image'], 'body'],
  ['glass', 'A glass-image: headings (deep slate)', 'slate-900', ['glass-image', 'fallback:glass-image'], 'body'],
  ['rejected', 'A glass-image: links in green-700 (rejected; use green-800)', 'green-700', ['glass-image'], 'source-body'],
  ['glass', 'A glass-image: links / eyebrow (green-800)', 'green-800', ['glass-image', 'fallback:glass-image'], 'body'],
  ['glass', 'A glass-image: muted text (large only)', 'ink-500', ['glass-image'], 'large'],
  ['glass', 'B glass-light: body text', 'ink-700', ['glass-light', 'fallback:glass-light'], 'body'],
  ['glass', 'B glass-light: muted text', 'ink-500', ['glass-light', 'fallback:glass-light'], 'body'],
  ['glass', 'B glass-light: section headings (slate)', 'slate-700', ['glass-light', 'fallback:glass-light'], 'body'],
  ['glass', 'B glass-light: links (deep green)', 'green-700', ['glass-light', 'fallback:glass-light'], 'body'],
  ['glass', 'C1 glass-leaf: chip / sidebar link text', 'green-900', ['glass-leaf', 'fallback:glass-leaf'], 'body'],
  ['glass', 'C1 glass-leaf: body text', 'ink-700', ['glass-leaf', 'fallback:glass-leaf'], 'body'],
  ['glass', 'C1 glass-leaf: current nav item / active pill (green-800)', 'green-800', ['glass-leaf', 'fallback:glass-leaf'], 'body'],
  ['glass', 'A/B/C1: strong text and h3-h6 (ink-900) on every light glass', 'ink-900', ['glass-image', 'glass-light', 'glass-leaf'], 'body'],
  ['glass', 'B glass-light: secondary text (ink-600)', 'ink-600', ['glass-light', 'fallback:glass-light'], 'body'],
  ['rejected', 'ink-600 secondary text on leaf and image glass (rejected; use ink-700 there)', 'ink-600', ['glass-leaf', 'glass-image'], 'source-body'],
  ['glass', 'C2 glass-leaf-deep: white text (CTA band, appointment panel)', '#ffffff', ['glass-leaf-deep', 'fallback:glass-leaf-deep'], 'body'],
  ['glass', 'C2 glass-leaf-deep: lime accent text', 'green-300', ['glass-leaf-deep', 'fallback:glass-leaf-deep'], 'large'],
  ['glass', 'D glass-dark: white text (footer, emergency)', '#ffffff', ['glass-dark', 'fallback:glass-dark'], 'body'],
  ['glass', 'D glass-dark: footer headings / eyebrows in lime #94bc4a', 'green-400', ['glass-dark', 'fallback:glass-dark'], 'body'],
  ['glass', 'D glass-dark: secondary text (green-200)', 'green-200', ['glass-dark', 'fallback:glass-dark'], 'body'],
  ['glass', 'D glass-dark: muted text (ink-200)', 'ink-200', ['glass-dark', 'fallback:glass-dark'], 'body'],

  // --- non-text: focus ring, rims, stars, icons (3:1 against the adjacent colour) ---
  ['ui', 'focus ring on light surfaces', 'focus', ['paper', 'ground', 'green-50', 'glass-image', 'glass-light', 'glass-leaf'], 'ui'],
  ['ui', 'focus ring vs the primary button it surrounds (2px offset keeps a light gap)', 'focus', ['paper'], 'ui'],
  ['rejected', 'default focus ring #446600 on the #759b2a / #94bc4a bands (rejected; use focus-on-band)', 'focus', ['green-500', 'green-400'], 'source-ui'],
  ['ui', 'focus ring on the solid #759b2a and #94bc4a bands', 'focus-on-band', ['green-500', 'green-400'], 'ui'],
  ['ui', 'focus ring on dark / deep-green glass','focus-on-dark', ['glass-dark', 'fallback:glass-dark', 'glass-leaf-deep', 'fallback:glass-leaf-deep'], 'ui'],
  ['rejected', 'stars / icons in #759b2a on light glass (rejected; use green-600)', 'green-500', ['paper', 'ground', 'glass-light'], 'source-ui'],
  ['ui', 'review stars / icons on light surfaces, light glass, leaf glass (green-600)', 'green-600', ['paper', 'ground', 'stone', 'glass-light', 'glass-leaf'], 'ui'],
  ['ui', 'review stars / icons on image glass (green-700)', 'green-700', ['glass-image', 'fallback:glass-image'], 'ui'],
  ['ui', 'decorative #759b2a rules, arcs, rims: paper and ground only', 'green-500', ['paper', 'ground'], 'ui'],
  ['ui', 'white glyph on a #759b2a icon tile (icon = non-text)', '#ffffff', ['green-500'], 'ui'],
  ['ui', 'review stars in #94bc4a on dark glass', 'green-400', ['glass-dark'], 'ui'],
  ['ui', 'input border (ink-500) on paper', 'ink-500', ['paper', 'glass-light'], 'ui'],
];

const need = (k) => (k === 'body' || k === 'source-body' ? 4.5 : 3.0);
const rows = PAIRS.map(([group, use, fg, bgs, kind]) => {
  const fgHex = resolveFg(fg);
  const per = bgs.flatMap(resolveBg).map(([label, h]) => ({ bg: label, bgHex: h, ratio: Math.round(ratio(fgHex, h) * 100) / 100 }));
  const worst = per.reduce((m, x) => (x.ratio < m.ratio ? x : m));
  const threshold = need(kind);
  return { group, use, fg, fgHex, kind, threshold, worst, per, pass: worst.ratio >= threshold };
});

const out = { schema: 'site-reforge/brand-contrast@1', generated: new Date().toISOString(), method: 'WCAG 2.x relative luminance; glass = fill composited over the stated worst-case backdrop; gradients judged at every stop', tokens: T, glass: Object.fromEntries(Object.entries(GLASS).map(([k, v]) => [k, { ...v, compositeStops: glassStops(k), fallback: FALLBACK[k] }])), rows };
fs.writeFileSync(path.join(ROOT, 'audit', 'brand-contrast.json'), JSON.stringify(out, null, 2));

const fmt = (r) => `| ${r.use} | \`${r.fg}\` ${r.fgHex} | ${r.per.map((p) => `${p.bg} ${p.bgHex} **${p.ratio.toFixed(2)}**`).join('<br>')} | ${r.worst.ratio.toFixed(2)} | ${r.threshold} ${r.kind.replace('source-', '')} | ${r.pass ? 'PASS' : 'FAIL'} |`;
if (process.argv.includes('--tokens')) { for (const [k, v] of Object.entries(T)) console.log(`--${k}: ${v};`); for (const [k] of Object.entries(GLASS)) console.log(k, glassStops(k).join(' '), 'fallback', FALLBACK[k]); }
for (const g of ['source', 'solid', 'glass', 'ui', 'rejected']) {
  console.log(`\n#### ${g}\n\n| use | foreground | background(s) | worst | needs | result |\n|---|---|---|---|---|---|`);
  for (const r of rows.filter((x) => x.group === g)) console.log(fmt(r));
}
const REC = new Set(['source', 'rejected']); // record-only rows: shown in the table, never gate the exit code
const bad = rows.filter((r) => !REC.has(r.group) && !r.pass);
console.log(`\nproposed pairs: ${rows.filter((r) => !REC.has(r.group)).length}, failing: ${bad.length}${bad.length ? ' -> ' + bad.map((b) => b.use).join('; ') : ''}`);
console.log(`source pairs: ${rows.filter((r) => r.group === 'source').length}, failing: ${rows.filter((r) => r.group === 'source' && !r.pass).length}`);
process.exit(bad.length ? 1 : 0);
