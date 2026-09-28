// sentence-parity.mjs — does every source SENTENCE survive somewhere on its rebuilt page?
// Adapted from the friscoeyesource reference tool for Clifton Eye Center.
// Source text = the RAW HTML of each page (audit/raw, never edited), split at block elements, then
// into sentences of >= 5 words. A sentence is FOUND when it appears verbatim (normalised quotes,
// dashes, whitespace) in the rebuilt page's text. A missing sentence is then classified:
//   sourceChrome  - it is the source's own chrome: header, nav, footer, and the sidebar widget area
//                   (div.ecp-secondary, always outside <main>: PORT-NOTES R-1) or any menu/widget/search
//                   block. The rebuild renders its own chrome from src/content/chrome.json.
//   declared      - a declared removal (audit/clone-removals.json strings + vendorClauses.removed)
//   lost          - anything else: a real loss. The run exits 1 when lost > 0.
// Positive control: a found sentence is deleted from one rebuilt page IN MEMORY and must be reported
// lost; the run exits 1 if the control does not fire.
//   node tools/sentence-parity.mjs [--show 20]        ($CEC_DIST overrides dist/)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.resolve(process.env.CEC_DIST || path.join(PROJ, 'dist'));
const content = JSON.parse(fs.readFileSync(path.join(PROJ, 'audit/content-inventory.json'), 'utf8'));
const removals = JSON.parse(fs.readFileSync(path.join(PROJ, 'audit/clone-removals.json'), 'utf8'));
const show = Number(process.argv[process.argv.indexOf('--show') + 1]) || 20;
const NAMED = { raquo: '»', nbsp: ' ', amp: '&', rsquo: "'", lsquo: "'", ldquo: '"', rdquo: '"', ndash: '-', mdash: '-', hellip: '…', quot: '"', lt: '<', gt: '>', reg: '®', trade: '™', copy: '©', ouml: 'ö' };
const decode = (s) => String(s || '')
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
  .replace(/&([a-z]+);/gi, (m, n) => (NAMED[n.toLowerCase()] !== undefined ? NAMED[n.toLowerCase()] : m));
const norm = (s) => decode(s).replace(/[‘’ʼ]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/ /g, ' ').replace(/…/g, '...').replace(/\s+/g, ' ').replace(/\s+([.,;:!?)])/g, '$1').trim().toLowerCase();
const textOf = (h) => String(h || '').replace(/<(script|style|noscript|svg|template)\b[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ');
const sentences = (t) => norm(t).split(/(?<=[.!?])\s+(?=[a-z0-9"(])/).map((s) => s.trim()).filter((s) => s.split(' ').length >= 5);

function chromeText(raw) {
  const body = (raw.match(/<body\b[^>]*>([\s\S]*)<\/body>/i) || [])[1] || raw;
  const out = [];
  const openRe = /<(header|nav|footer|aside)\b[^>]*>|<(div|section|ul|form)\b[^>]*class="[^"]*\b(menu|widget|sidebar|ecp-secondary|search|fl-page-header|fl-page-footer)[^"]*"[^>]*>/gi;
  let m;
  while ((m = openRe.exec(body))) {
    const tag = (m[1] || m[2]).toLowerCase();
    const re = new RegExp('<(/?)' + tag + '\\b[^>]*>', 'gi');
    re.lastIndex = m.index + m[0].length;
    let depth = 1, mm, end = body.length;
    while ((mm = re.exec(body))) { depth += mm[1] ? -1 : 1; if (depth === 0) { end = mm.index; break; } }
    out.push(body.slice(m.index, end));
    openRe.lastIndex = end;
  }
  return norm(textOf(out.join(' ')));
}

const BLOCK = /<\/?(p|li|h[1-6]|td|th|dt|dd|figcaption|blockquote|div|section|article|header|footer|nav|aside|ul|ol|br|tr|table|form|label|option|button|main|address)\b[^>]*>/gi;
function sourceBlocks(raw) {
  const body = ((raw.match(/<body\b[^>]*>([\s\S]*)<\/body>/i) || [])[1] || raw)
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style|noscript|svg|select)\b[\s\S]*?<\/\1>/gi, ' ');
  return body.replace(BLOCK, '\n').split('\n').map((t) => norm(t.replace(/<[^>]+>/g, ' '))).filter((t) => t.split(' ').length >= 5);
}
const declared = [
  ...(removals.strings || []).map((s) => norm(s.value)),
  ...((removals.vendorClauses && removals.vendorClauses.removed) || []).map(norm),
  ...((removals.sentences || []).map((s) => norm(s.value))),
].filter(Boolean);
const isDeclared = (s) => declared.some((d) => s.includes(d) || d.includes(s));
const squash = (s) => s.replace(/\s+/g, '');

function builtTextFor(page) {
  const slug = new URL(page.url).pathname.replace(/^\/+|\/+$/g, '');
  const file = slug ? path.join(DIST, slug, 'index.html') : path.join(DIST, 'index.html');
  if (!fs.existsSync(file)) return null;
  return norm(textOf(fs.readFileSync(file, 'utf8')));
}

function score(pages, overrideBuilt) {
  let total = 0, found = 0, chromeOnly = 0, declaredMiss = 0;
  const lost = [], chromeList = [], declaredList = [], wsOnly = [];
  for (const page of pages) {
    const built = overrideBuilt && overrideBuilt.has(page.url) ? overrideBuilt.get(page.url) : builtTextFor(page);
    if (built === null) { lost.push({ url: page.url, sentence: '(page missing)' }); continue; }
    const builtSq = squash(built);
    const raw = fs.readFileSync(path.join(PROJ, 'audit/raw', page.savedAs), 'utf8');
    const chrome = chromeText(raw);
    const units = new Set(sourceBlocks(raw).flatMap((b) => sentences(b)));
    for (const s of units) {
      total++;
      if (built.includes(s)) { found++; continue; }
      if (builtSq.includes(squash(s))) { found++; wsOnly.push({ url: page.url, sentence: s }); continue; }
      if (chrome.includes(s)) { chromeOnly++; chromeList.push({ url: page.url, sentence: s }); continue; }
      if (isDeclared(s)) { declaredMiss++; declaredList.push({ url: page.url, sentence: s }); continue; }
      lost.push({ url: page.url, sentence: s });
    }
  }
  return { totals: { pages: pages.length, sentences: total, found, sourceChromeOnly: chromeOnly, declaredRemovals: declaredMiss, lost: lost.length, foundWhitespaceInsensitiveOnly: wsOnly.length }, lost, chromeList, declaredList, wsOnly };
}

const res = score(content.pages);

/* positive control: remove one FOUND content sentence from one rebuilt page, in memory */
let control = { fired: false };
for (const page of content.pages) {
  const built = builtTextFor(page);
  if (!built) continue;
  const raw = fs.readFileSync(path.join(PROJ, 'audit/raw', page.savedAs), 'utf8');
  const chrome = chromeText(raw);
  const s = [...new Set(sourceBlocks(raw).flatMap((b) => sentences(b)))].find((x) => built.includes(x) && !chrome.includes(x) && x.length > 60);
  if (!s) continue;
  const mutated = new Map([[page.url, built.split(s).join(' ')]]);
  const r2 = score([page], mutated);
  control = { page: page.url, sentence: s.slice(0, 80), fired: r2.lost.some((l) => l.sentence === s) };
  break;
}

const out = {
  schema: 'cec/sentence-parity@1', generated: new Date().toISOString(), dist: DIST,
  method: 'every distinct >=5-word sentence of each source page (raw HTML split at block elements) must appear verbatim (normalised quotes/dashes/whitespace) in the rebuilt page text; misses are classified as source chrome (header/nav/footer/sidebar widget area), declared removal, or lost',
  totals: res.totals, control, lost: res.lost, whitespaceOnly: res.wsOnly, declared: res.declaredList, sourceChrome: res.chromeList.slice(0, 400), sourceChromeCount: res.chromeList.length,
};
if (!process.env.CEC_DIST) fs.writeFileSync(path.join(PROJ, 'audit/sentence-parity.json'), JSON.stringify(out, null, 1));
console.log(JSON.stringify(res.totals));
console.log('control:', control.fired ? 'fired (' + control.page.replace(/^https?:\/\/[^/]+/, '') + ')' : 'DID NOT FIRE');
for (const l of res.lost.slice(0, show)) console.log(' -', l.url.replace(/^https?:\/\/[^/]+/, ''), '|', l.sentence.slice(0, 160));
if (res.lost.length || !control.fired) process.exit(1);
