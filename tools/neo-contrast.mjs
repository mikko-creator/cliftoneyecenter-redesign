// neo-contrast.mjs — WCAG 2.x contrast for the NEOCLASSICAL palette proposed in docs/NEO-BRIEF.md.
// Pure Node, same arithmetic as tools/brand-contrast.mjs: sRGB hex, `color-mix(in srgb, …)` as a linear
// per-channel mix of the 0-255 values, relative luminance with the 0.04045 knee.
// Layers that sit between text and its ground (film grain, marble texture, duotone photos) are judged at
// their WORST case: grain and texture as a flat layer of their most contrast-reducing colour at their
// capped opacity; a duotone photo as the lightest point of its colour ramp (every pixel of a duotone lies
// on the ramp, so the ramp's luminance maximum bounds every pixel for light text on it).
//   node tools/neo-contrast.mjs            -> prints markdown tables, writes tmp/neo/brief/neo-contrast.json
//   node tools/neo-contrast.mjs --control  -> adds a pair that must fail, and exits 1 (proves the gate can fire)
//   exit 1 if any proposed pair misses its threshold, or a positive control is off
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTROL = process.argv.includes('--control');

const hex2rgb = (h) => { h = h.replace('#', ''); if (h.length === 3) h = [...h].map((c) => c + c).join(''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); };
const rgb2hex = (c) => '#' + c.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('');
const mix = (a, p, b) => rgb2hex(hex2rgb(a).map((v, i) => v * p + hex2rgb(b)[i] * (1 - p))); // color-mix(in srgb, a p, b)
const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const lum = (h) => { const [r, g, b] = hex2rgb(h).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const r2 = (x) => Math.round(x * 100) / 100;
// OKLab distance (for "how close is X to Y" statements only; never used for gating)
const oklab = (h) => { const [r, g, b] = hex2rgb(h).map(lin); const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b), m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b), s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b); return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s]; };
const dE = (a, b) => { const x = oklab(a), y = oklab(b); return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]); };

// positive controls: the ratio function must reproduce the two textbook values
const ctl = [r2(ratio('#ffffff', '#000000')), r2(ratio('#767676', '#ffffff'))];
if (ctl[0] !== 21 || ctl[1] !== 4.54) { console.error('positive control off: ' + ctl.join(', ')); process.exit(1); }

// ---- brand tokens, verbatim from src/styles/tokens.css (redesign layer) --------------------------------
const B = {
  'green-50': '#f8faf2', 'green-100': '#eef4e2', 'green-200': '#ddeac5', 'green-300': '#bdd58f', 'green-400': '#94bc4a',
  'green-500': '#759b2a', 'green-600': '#53760d', 'green-700': '#446600', 'green-800': '#314900', 'green-900': '#233500',
  'green-950': '#141f00', 'ink-950': '#232229', 'ink-900': '#313039', 'ink-700': '#464451', 'ink-600': '#5c5a66',
  'ink-500': '#6b6974', 'ink-300': '#acabb1', 'ink-200': '#d1d0d4', 'ink-100': '#e9e9ea', 'ink-50': '#f6f6f6',
  'slate-700': '#36565e', 'slate-900': '#1d2e33', alert: '#941221', 'alert-50': '#f8eeef', paper: '#ffffff',
  ground: '#fafcf6', stone: '#efefef', sunlight: '#fffbe9', 'focus-on-dark': '#d4e4b7',
};

// ---- neo additions: every value is an sRGB mix of brand tokens (formula kept beside it) ----------------
const N = {};
const F = {}; // formula text
const def = (name, formula, value) => { N[name] = value; F[name] = formula; };
def('marble-50', 'color-mix(in srgb, var(--stone) 50%, var(--sunlight))', mix(B.stone, 0.5, B.sunlight));
def('marble-100', 'color-mix(in srgb, var(--ink-700) 5%, var(--marble-50))', mix(B['ink-700'], 0.05, N['marble-50']));
def('marble-200', 'color-mix(in srgb, var(--ink-700) 12%, var(--marble-50))', mix(B['ink-700'], 0.12, N['marble-50']));
def('marble-300', 'color-mix(in srgb, var(--ink-700) 26%, var(--marble-50))', mix(B['ink-700'], 0.26, N['marble-50']));
def('marble-400', 'color-mix(in srgb, var(--ink-700) 48%, var(--marble-50))', mix(B['ink-700'], 0.48, N['marble-50']));
def('poster', 'color-mix(in srgb, var(--green-950) 55%, var(--ink-950))', mix(B['green-950'], 0.55, B['ink-950']));
def('poster-deep', 'color-mix(in srgb, var(--poster) 62%, #000)', mix(N.poster, 0.62, '#000000'));
def('poster-2', 'color-mix(in srgb, var(--green-900) 40%, var(--poster))', mix(B['green-900'], 0.40, N.poster));
const C = { ...B, ...N };

// worst-case layered surfaces (caps are the rules the brief states)
const GRAIN_LIGHT = 0.06, GRAIN_DARK = 0.05;     // film grain opacity cap. Grain lives on the GROUND plane only (over the texture, under every
                                                 // opaque panel), so panels are judged solid and the full-bleed grounds with texture + grain
const TEX_LIGHT = 0.25, TEX_DARK = 0.15;         // marble texture opacity cap (textures only on the full-bleed grounds marble-50 and poster / poster-deep)
const S = {}; // surfaces: name -> { hex, note }
const surf = (name, hex, note) => { S[name] = { hex, note }; };
for (const k of ['paper', 'ground', 'marble-50', 'marble-100', 'marble-200', 'stone', 'green-50', 'green-100']) surf(k, C[k], 'solid');
surf('marble-50+texture+grain', mix(B['ink-950'], GRAIN_LIGHT, mix(N['marble-300'], TEX_LIGHT, N['marble-50'])), `light marble texture at ${TEX_LIGHT} (darkest vein held at marble-300: the texture's 2nd-percentile luminance must be >= marble-300), then an ink-950 grain speck at ${GRAIN_LIGHT}`);
for (const k of ['poster', 'poster-deep', 'poster-2', 'slate-900', 'green-800', 'green-700']) surf(k, C[k], 'solid');
// record only (NOT valid compositions): what grain would do if it were laid over the panels too
const GRAIN_ON_PANEL = { light: mix(B['ink-950'], GRAIN_LIGHT, N['marble-200']), dark: mix(B.paper, GRAIN_DARK, N['poster-2']) };
surf('poster+texture+grain', mix(B.paper, GRAIN_DARK, mix(B['ink-300'], TEX_DARK, N.poster)), `dark marble texture at ${TEX_DARK} (brightest vein held at ink-300: the texture's 98th-percentile luminance must be <= ink-300), then a white grain speck at ${GRAIN_DARK}`);
surf('green-500', B['green-500'], 'brand band, solid');
surf('green-400', B['green-400'], 'lime band, solid');
surf('alert', B.alert, 'emergency tile');
// duotone ramps: shadow -> highlight in sRGB (what feComponentTransfer type="table" with 2 values does)
const ramp = (a, b, n = 256) => Array.from({ length: n }, (_, i) => mix(b, i / (n - 1), a));
const rampMax = (a, b) => ramp(a, b).reduce((m, h) => (lum(h) > lum(m) ? h : m));
const rampMin = (a, b) => ramp(a, b).reduce((m, h) => (lum(h) < lum(m) ? h : m));
const DUO = {
  'duo-night': { shadow: N['poster-deep'], highlight: B['green-600'], use: 'photos that carry light text directly (title-band backdrops)' },
  'duo-verdigris': { shadow: N.poster, highlight: B['green-300'], use: 'decorative photos on poster grounds; NO text over them' },
  'duo-marble': { shadow: B['ink-950'], highlight: N['marble-50'], use: 'statue / marble cut-outs and decorative photos on light grounds; NO text over them' },
};
for (const [k, d] of Object.entries(DUO)) { d.max = rampMax(d.shadow, d.highlight); d.min = rampMin(d.shadow, d.highlight); }
surf('duo-night (lightest pixel)', DUO['duo-night'].max, 'max-luminance point of the poster-deep -> green-600 ramp (256 samples)');

// ---- full matrix: every text token on every surface ----------------------------------------------------
const TEXT = ['paper', 'marble-50', 'green-50', 'green-100', 'green-200', 'green-300', 'green-400', 'green-500', 'green-600', 'green-700', 'green-800', 'green-900', 'green-950',
  'ink-950', 'ink-900', 'ink-700', 'ink-600', 'ink-500', 'ink-300', 'ink-200', 'slate-700', 'slate-900', 'poster', 'alert', 'alert-50', 'marble-300', 'marble-400', 'focus-on-dark'];
const matrix = {};
for (const [sn, s] of Object.entries(S)) {
  matrix[sn] = {};
  for (const t of TEXT) matrix[sn][t] = r2(ratio(C[t], s.hex));
}

// ---- proposed role pairs (the gate) ---------------------------------------------------------------------
// [use, fg token, [surfaces], need]  need: 4.5 body | 3 large | 3 ui ; script accents are held to 4.5
const LIGHT_ALL = ['paper', 'ground', 'marble-50', 'marble-100', 'marble-200', 'stone', 'green-50', 'green-100', 'marble-50+texture+grain'];
const DARK = ['poster', 'poster-deep', 'poster-2', 'poster+texture+grain'];
const PAIRS = [
  // light grounds
  ['L body text', 'ink-700', LIGHT_ALL, 4.5],
  ['L strong text, h4-h6, table heads', 'ink-900', LIGHT_ALL, 4.5],
  ['L secondary text (captions, meta)', 'ink-600', LIGHT_ALL, 4.5],
  ['L muted text (dates, legal): ink-600 is the floor', 'ink-600', LIGHT_ALL, 4.5],
  ['L display titles, h1-h3 (poster ink)', 'poster', LIGHT_ALL, 4.5],
  ['L display titles, alternate (deep slate)', 'slate-900', LIGHT_ALL, 4.5],
  ['L section headings (slate)', 'slate-700', LIGHT_ALL, 4.5],
  ['L links, eyebrows, engraved meta caps', 'green-700', LIGHT_ALL, 4.5],
  ['L link hover, current nav item', 'green-800', LIGHT_ALL, 4.5],
  ['L script accent (held to 4.5 despite its size)', 'green-700', LIGHT_ALL, 4.5],
  ['L large accent: roman numerals, big figures (>= 24px)', 'green-600', LIGHT_ALL, 3],
  ['L emergency heading, required marks', 'alert', LIGHT_ALL, 4.5],
  // dark grounds
  ['D body text', 'marble-50', DARK, 4.5],
  ['D body text (paper)', 'paper', DARK, 4.5],
  ['D secondary text', 'green-200', DARK, 4.5],
  ['D muted text', 'ink-200', DARK, 4.5],
  ['D links, eyebrows, meta caps', 'green-300', DARK, 4.5],
  ['D brand green as text: eyebrows, numerals, script accent', 'green-400', DARK, 4.5],
  ['D lead green #759b2a: LARGE only (numerals, poster words >= 24px)', 'green-500', DARK, 3],
  ['D display titles (marble)', 'marble-50', DARK, 4.5],
  ['slate ground: body and titles', 'paper', ['slate-900'], 4.5],
  ['slate ground: lime accents', 'green-300', ['slate-900'], 4.5],
  ['deep laurel band green-800: text', 'paper', ['green-800'], 4.5],
  ['deep laurel band green-800: lime accent', 'green-300', ['green-800'], 4.5],
  ['green-700 band / primary button: text', 'paper', ['green-700'], 4.5],
  // brand bands
  ['brand band #759b2a: any size', 'green-950', ['green-500'], 4.5],
  ['brand band #759b2a: poster ink, any size', 'poster', ['green-500'], 4.5],
  ['brand band #759b2a: white, LARGE only', 'paper', ['green-500'], 3],
  ['lime band #94bc4a: any size', 'green-950', ['green-400'], 4.5],
  ['lime band #94bc4a: poster ink, any size', 'poster', ['green-400'], 4.5],
  ['emergency tile: white', 'paper', ['alert'], 4.5],
  // text over a duotone photo
  ['duo-night photo: white text directly on the photo', 'paper', ['duo-night (lightest pixel)'], 4.5],
  ['duo-night photo: marble text directly on the photo', 'marble-50', ['duo-night (lightest pixel)'], 4.5],
  // non-text
  ['UI focus ring on light', 'green-700', LIGHT_ALL, 3],
  ['UI focus ring on dark (focus-on-dark)', 'focus-on-dark', [...DARK, 'slate-900', 'green-800', 'green-700'], 3],
  ['UI focus ring on the brand bands', 'green-950', ['green-500', 'green-400'], 3],
  ['UI icons, stars, ornaments that carry meaning, on light', 'green-600', LIGHT_ALL, 3],
  ['UI icons, stars, ornaments that carry meaning, on dark', 'green-400', DARK, 3],
  ['UI the only boundary of a control on light (input, outline button)', 'ink-500', LIGHT_ALL, 3],
  ['UI the only boundary of a control on dark', 'green-300', DARK, 3],
  ['UI ornaments in the lead green on dark (badges, meander)', 'green-500', DARK, 3],
  ['UI ornaments in the lead green on light (paper / ground only)', 'green-500', ['paper', 'ground'], 3],
];
if (CONTROL) PAIRS.push(['CONTROL (must fail): #759b2a text on marble-50', 'green-500', ['marble-50'], 4.5]);

const rows = PAIRS.map(([use, fg, surfaces, need]) => {
  const per = surfaces.map((sn) => { if (!S[sn]) throw new Error('unknown surface ' + sn); return { surface: sn, hex: S[sn].hex, ratio: r2(ratio(C[fg], S[sn].hex)) }; });
  const worst = per.reduce((m, x) => (x.ratio < m.ratio ? x : m));
  return { use, fg, fgHex: C[fg], per, worst: worst.ratio, worstOn: worst.surface, need, pass: worst.ratio >= need };
});

// rejected alternatives (record only, never gate): tried while writing the brief
const REJECTED = [
  ['#759b2a as text on light grounds', 'green-500', ['paper', 'marble-50', 'marble-100']],
  ['green-400 on light grounds', 'green-400', ['paper', 'marble-50']],
  ['white on the lime band #94bc4a', 'paper', ['green-400']],
  ['ink-500 as muted TEXT (kept for input borders only)', 'ink-500', ['marble-200', 'marble-50+texture+grain']],
  ['green-600 as SMALL text (large-only on light)', 'green-600', ['marble-100', 'marble-200', 'marble-50+texture+grain']],
  ['#759b2a as small text / script on dark (large-only)', 'green-500', ['poster', 'poster+texture+grain']],
  ['grain laid over a light panel too (why grain stays on the ground plane): green-700', 'green-700', [{ surface: 'marble-200 + grain', hex: GRAIN_ON_PANEL.light }]],
  ['grain laid over a light panel too: ink-600', 'ink-600', [{ surface: 'marble-200 + grain', hex: GRAIN_ON_PANEL.light }]],
  ['grain laid over a dark panel too: #759b2a', 'green-500', [{ surface: 'poster-2 + grain', hex: GRAIN_ON_PANEL.dark }]],
  ['marble-400 as a control boundary on light (decorative rules only)', 'marble-400', ['marble-50', 'marble-200']],
  ['#759b2a ornaments on marble grounds (decorative only; meaning-bearing icons use green-600)', 'green-500', ['marble-50', 'marble-100']],
  ['alert red as text on poster', 'alert', ['poster']],
  ['white text over the decorative duo-verdigris ramp (its lightest pixel)', 'paper', []],
].map(([use, fg, surfaces]) => {
  if (!surfaces.length) { const h = DUO['duo-verdigris'].max; return { use, fg, per: [{ surface: 'duo-verdigris max', hex: h, ratio: r2(ratio(C[fg], h)) }] }; }
  return { use, fg, per: surfaces.map((sn) => (typeof sn === 'object' ? { ...sn, ratio: r2(ratio(C[fg], sn.hex)) } : { surface: sn, hex: S[sn].hex, ratio: r2(ratio(C[fg], S[sn].hex)) })) };
});

// ---- output ------------------------------------------------------------------------------------------------
const md = [];
md.push('#### Derived neo tokens\n', '| token | value | formula | L |', '|---|---|---|---|');
for (const k of Object.keys(N)) md.push(`| \`--${k}\` | \`${N[k]}\` | \`${F[k]}\` | ${lum(N[k]).toFixed(4)} |`);
md.push('', '#### Worst-case layered surfaces\n', '| surface | resolves to | model |', '|---|---|---|');
for (const [k, s] of Object.entries(S)) if (s.note !== 'solid') md.push(`| ${k} | \`${s.hex}\` | ${s.note} |`);
md.push('', '#### Duotone ramps (256 samples each)\n', '| ramp | shadow | highlight | lightest pixel | darkest pixel | use |', '|---|---|---|---|---|---|');
for (const [k, d] of Object.entries(DUO)) md.push(`| ${k} | \`${d.shadow}\` | \`${d.highlight}\` | \`${d.max}\` | \`${d.min}\` | ${d.use} |`);
md.push('', '#### Proposed pairs (gated)\n', '| use | fg | worst ratio (on) | needs | result |', '|---|---|---|---|---|');
for (const r of rows) md.push(`| ${r.use} | \`${r.fg}\` ${r.fgHex} | **${r.worst.toFixed(2)}** (${r.worstOn}) | ${r.need === 3 ? (r.use.startsWith('UI') ? '3 ui' : '3 large') : '4.5 body'} | ${r.pass ? 'PASS' : 'FAIL'} |`);
md.push('', '#### Rejected (record only)\n', '| use | fg | ratios |', '|---|---|---|');
for (const r of REJECTED) md.push(`| ${r.use} | \`${r.fg}\` | ${r.per.map((p) => `${p.surface} ${p.ratio.toFixed(2)}`).join('; ')} |`);
// matrix: allowed text per surface
md.push('', '#### Matrix: text tokens allowed per surface (body >= 4.5; large-only 3.0-4.49)\n', '| surface | hex | body (any size) | large only |', '|---|---|---|---|');
const TEXTISH = TEXT.filter((t) => !['marble-300', 'marble-400', 'focus-on-dark'].includes(t));
for (const [sn, s] of Object.entries(S)) {
  const body = TEXTISH.filter((t) => matrix[sn][t] >= 4.5).map((t) => `${t} ${matrix[sn][t].toFixed(2)}`);
  const large = TEXTISH.filter((t) => matrix[sn][t] >= 3 && matrix[sn][t] < 4.5).map((t) => `${t} ${matrix[sn][t].toFixed(2)}`);
  md.push(`| ${sn} | \`${s.hex}\` | ${body.join(', ') || 'none'} | ${large.join(', ') || 'none'} |`);
}
const failing = rows.filter((r) => !r.pass);
md.push('', `positive controls: white/black ${ctl[0].toFixed(2)}, #767676/white ${ctl[1].toFixed(2)}`,
  `image-review ground in src/content/image-plan-neo.json (#10150c) vs --poster-deep ${N['poster-deep']}: OKLab dE ${dE('#10150c', N['poster-deep']).toFixed(4)}; vs --poster ${N.poster}: ${dE('#10150c', N.poster).toFixed(4)}`,
  `proposed pairs: ${rows.length}, failing: ${failing.length}`);
console.log(md.join('\n'));
fs.mkdirSync(path.join(ROOT, 'tmp/neo/brief'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'tmp/neo/brief/neo-contrast.json'), JSON.stringify({ schema: 'cec-neo/contrast@1', generated: new Date().toISOString(), controls: ctl, tokens: N, formulas: F, surfaces: S, duotone: DUO, pairs: rows, rejected: REJECTED, matrix }, null, 1));
fs.writeFileSync(path.join(ROOT, 'tmp/neo/brief/neo-contrast.md'), md.join('\n') + '\n');
if (failing.length) { for (const r of failing) console.error('FAIL ' + r.worst + ' < ' + r.need + ': ' + r.use); process.exit(1); }
