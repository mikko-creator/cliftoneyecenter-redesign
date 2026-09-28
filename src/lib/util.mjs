/* util.mjs - shared helpers for the Clifton Eye Center build. Node builtins only.
   Ported from the friscoeyesource reference build (src/lib/util.mjs); the only change is the
   entity table (PORT-NOTES 2.1: &hellip; &reg; &trade; &ouml; &copy; &raquo; decoded for text keys). */
import fs from 'node:fs';
import path from 'node:path';

export const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const NAMED = {
  nbsp: ' ', lt: '<', gt: '>', quot: '"', apos: "'", rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”',
  ndash: '–', mdash: '—', hellip: '…', reg: '®', trade: '™', ouml: 'ö', copy: '©', raquo: '»', laquo: '«',
  rsaquo: '›', lsaquo: '‹', times: '×', eacute: 'é', egrave: 'è', uuml: 'ü', auml: 'ä', deg: '°', frac12: '½',
  middot: '·', bull: '•', shy: '',
};

export function decodeEntities(s) {
  return String(s || '')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
    .replace(/&([a-z][a-z0-9]*);/gi, (m, n) => (n.toLowerCase() === 'amp' ? m : (NAMED[n] !== undefined ? NAMED[n] : (NAMED[n.toLowerCase()] !== undefined ? NAMED[n.toLowerCase()] : m))))
    .replace(/&amp;/g, '&');
}

export const stripTags = (s) => String(s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
export const plain = (s) => decodeEntities(String(s || '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

export function up(depth) { return depth === 0 ? '' : '../'.repeat(depth); }

/* Intrinsic dimensions straight from the file header - the bytes are the only honest source.
   Every <img> gets width/height so the browser reserves its box (no layout shift). */
const dimCache = new Map();
export function imageSize(absFile) {
  if (dimCache.has(absFile)) return dimCache.get(absFile);
  let out = null;
  try {
    const b = fs.readFileSync(absFile);
    if (b.length > 24 && b[0] === 0x89 && b[1] === 0x50) {
      out = { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
    } else if (b[0] === 0xff && b[1] === 0xd8) {
      let i = 2;
      while (i < b.length - 9) {
        if (b[i] !== 0xff) { i++; continue; }
        const marker = b[i + 1];
        if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
          out = { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
          break;
        }
        i += 2 + b.readUInt16BE(i + 2);
      }
    } else if (/\.svg$/i.test(absFile)) {
      const t = b.toString('utf8').slice(0, 2000);
      const wAttr = /\bwidth\s*=\s*["']([\d.]+)/i.exec(t);
      const hAttr = /\bheight\s*=\s*["']([\d.]+)/i.exec(t);
      if (wAttr && hAttr) out = { w: Math.round(+wAttr[1]), h: Math.round(+hAttr[1]) };
      else {
        const vb = /viewBox\s*=\s*["']\s*[\d.-]+\s+[\d.-]+\s+([\d.]+)\s+([\d.]+)/i.exec(t);
        if (vb) out = { w: Math.round(+vb[1]), h: Math.round(+vb[2]) };
      }
    } else if (b.length > 30 && b.slice(0, 4).toString('latin1') === 'RIFF' && b.slice(8, 12).toString('latin1') === 'WEBP') {
      const fmt = b.slice(12, 16).toString('latin1');
      if (fmt === 'VP8X') out = { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
      else if (fmt === 'VP8 ') out = { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
      else if (fmt === 'VP8L') {
        const bits = b.readUInt32LE(21);
        out = { w: (bits & 0x3fff) + 1, h: ((bits >> 14) & 0x3fff) + 1 };
      }
    } else if (b.slice(0, 3).toString('latin1') === 'GIF') {
      out = { w: b.readUInt16LE(6), h: b.readUInt16LE(8) };
    }
  } catch { out = null; }
  dimCache.set(absFile, out);
  return out;
}

export function ownPath(url, origin) {
  try { return new URL(url, origin + '/').pathname.replace(/^\/+|\/+$/g, ''); } catch { return null; }
}

export function depthOf(url) {
  let p;
  try { p = new URL(url).pathname; } catch { return 0; }
  return p.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean).length;
}

export function walk(dir, base = dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, base, out); else out.push(path.relative(base, p).split(path.sep).join('/'));
  }
  return out;
}

export const readJSON = (abs, fallback) => {
  if (fallback !== undefined && !fs.existsSync(abs)) return fallback;
  return JSON.parse(fs.readFileSync(abs, 'utf8'));
};

/* Find the element that OPENS at `openIdx` (a `<tag ...>` start) and return the index just past its
   matching close tag, counting nested same-name tags. Used to lift whole platform modules
   (div.ecp-breadcrumb, div.ecp-childpages, testimonial posts) out of the raw markup intact. */
export function elementEnd(html, openIdx, tag) {
  const re = new RegExp('<(/?)' + tag + '\\b[^>]*>', 'gi');
  re.lastIndex = openIdx;
  let depth = 0, m;
  while ((m = re.exec(html))) {
    if (m[1]) { depth--; if (depth === 0) return m.index + m[0].length; }
    else if (!/\/>$/.test(m[0])) depth++;
  }
  return html.length;
}

/* Every element whose opening tag matches `openRe` (which must match `<tag ...>` and capture the
   tag name in group 1), outermost first, as { start, end, html }. Non-overlapping. */
export function findElements(html, openRe) {
  const out = [];
  const re = new RegExp(openRe.source, openRe.flags.includes('g') ? openRe.flags : openRe.flags + 'g');
  let m;
  while ((m = re.exec(html))) {
    const tag = m[1].toLowerCase();
    const end = elementEnd(html, m.index, tag);
    out.push({ start: m.index, end, html: html.slice(m.index, end), match: m });
    re.lastIndex = end;
  }
  return out;
}
