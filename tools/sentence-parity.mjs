// sentence-parity.mjs — does every source SENTENCE survive somewhere on its rebuilt page?
// Word-multiset recall (sr-parity) charges a page for every repeat the source printed and the rebuild
// shows once (menus x6, a block printed twice). A sentence test asks the reader's question instead:
// is any statement the source made missing from the rebuild? Source text = the extractor's
// page.bodyText (independent of this build). Sentences that are the source's own chrome (menu,
// widget, footer) are reported separately. Each missing CONTENT sentence is checked against the
// declared removals (audit/clone-removals.json); anything left is a real loss.
//   node tools/sentence-parity.mjs [--show 20]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const content = JSON.parse(fs.readFileSync(path.join(PROJ, 'audit/content-inventory.json'), 'utf8'));
const removals = JSON.parse(fs.readFileSync(path.join(PROJ, 'audit/clone-removals.json'), 'utf8'));
const show = Number(process.argv[process.argv.indexOf('--show') + 1]) || 20;
const decode = (s) => String(s || '').replace(/&raquo;/g, '»').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#8217;|&rsquo;|&#039;|&#39;/g, "'").replace(/&#8211;|&ndash;/g, '-').replace(/&#8212;|&mdash;/g, '-').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d));
const norm = (s) => decode(s).replace(/[‘’ʼ]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/ /g, ' ').replace(/\s+/g, ' ').replace(/\s+([.,;:!?)])/g, '$1').trim().toLowerCase();
const textOf = (h) => String(h || '').replace(/<(script|style|noscript|svg)\b[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ');
const sentences = (t) => norm(t).split(/(?<=[.!?])\s+(?=[a-z0-9"(])/).map((s) => s.trim()).filter((s) => s.split(' ').length >= 5);

function chromeText(raw) {
  const body = (raw.match(/<body\b[^>]*>([\s\S]*)<\/body>/i) || [])[1] || raw;
  const out = [];
  const openRe = /<(header|nav|footer|aside)\b[^>]*>|<(div|section|ul)\b[^>]*class="[^"]*\b(menu|widget|sidebar|fl-page-header|fl-page-footer|announcement|search)[^"]*"[^>]*>/gi;
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

/* Source blocks come from the RAW HTML, split at block elements: page.bodyText has no block
   boundaries, so a "sentence" cut from it runs breadcrumb + h1 + date + first line together and can
   never match a rebuild that puts those in different elements (measured: 368 false losses). */
const BLOCK = /<\/?(p|li|h[1-6]|td|th|dt|dd|figcaption|blockquote|div|section|article|header|footer|nav|aside|ul|ol|br|tr|table|form|label|option|button|main|address)\b[^>]*>/gi;
function sourceBlocks(raw) {
  const body = ((raw.match(/<body\b[^>]*>([\s\S]*)<\/body>/i) || [])[1] || raw)
    .replace(/<(script|style|noscript|svg|select)\b[\s\S]*?<\/\1>/gi, ' ');
  return body.replace(BLOCK, '\n').split('\n').map((t) => norm(t.replace(/<[^>]+>/g, ' '))).filter((t) => t.split(' ').length >= 5);
}
const declared = [
  ...(removals.strings || []).map((s) => norm(s.value)),
  ...((removals.vendorClauses && removals.vendorClauses.removed) || []).map(norm),
];
const isDeclared = (s) => declared.some((d) => d && (s.includes(d) || d.includes(s)));
let total = 0, found = 0, chromeOnly = 0, declaredMiss = 0;
const lost = [];
for (const page of content.pages) {
  const slug = new URL(page.url).pathname.replace(/^\/+|\/+$/g, '');
  const file = path.join(PROJ, 'dist', slug, 'index.html');
  if (!fs.existsSync(file)) { lost.push({ url: page.url, sentence: '(page missing)' }); continue; }
  const built = norm(textOf(fs.readFileSync(file, 'utf8')));
  /* whitespace-insensitive fallback: a tag boundary inside a sentence ("(<span>cornea</span>)",
     "</a>—why", "ex<b>am</b>") puts a space on one side and not the other; that is not a loss */
  const squash = (s) => s.replace(/\s+/g, '');
  const builtSq = squash(built);
  const raw = fs.readFileSync(path.join(PROJ, 'audit/raw', page.savedAs), 'utf8');
  const chrome = chromeText(raw);
  const units = new Set(sourceBlocks(raw).flatMap((b) => sentences(b)));
  for (const s of units) {
    total++;
    if (built.includes(s) || builtSq.includes(squash(s))) { found++; continue; }
    if (chrome.includes(s)) { chromeOnly++; continue; }
    if (isDeclared(s)) { declaredMiss++; continue; }
    lost.push({ url: page.url, sentence: s });
  }
}
const out = { schema: 'fes/sentence-parity@1', generated: new Date().toISOString(), method: 'every distinct source sentence (>= 5 words) of page.bodyText must appear verbatim (normalised quotes/dashes/whitespace) in the rebuilt page text', totals: { sentences: total, found, sourceChromeOnly: chromeOnly, declaredRemovals: declaredMiss, lost: lost.length }, lost };
fs.writeFileSync(path.join(PROJ, 'audit/sentence-parity.json'), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out.totals));
for (const l of lost.slice(0, show)) console.log(' -', l.url.replace(/^https?:\/\/[^/]+/, ''), '|', l.sentence.slice(0, 160));
