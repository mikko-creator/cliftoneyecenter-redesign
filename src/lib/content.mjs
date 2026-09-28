/* content.mjs - turns a source page's HTML into clean, platform-free content fragments.

   Ported from the friscoeyesource reference build (src/lib/content.mjs). The generic sanitiser and its
   helpers (wrapLooseText, balanceFragment, dedupe*, figures, sections) are carried unchanged; the
   Clifton-specific changes are the ones docs/PORT-NOTES.md sections 1-3 require:
   - R-1  mainRegion: <main> whenever it exists (346/349); <body> only for the 3 /template/* pages.
          The sidebar (div.ecp-secondary, always OUTSIDE main) is chrome, rendered by the templates.
   - R-2  the platform breadcrumb (div.ecp-breadcrumb, 338 files) is parsed from the RAW main before
          sanitising (each <a> + the trailing text node, split on span.ecp-breadcrumb-separator), then
          removed; empty segments are dropped (testimonials "Home » »", archives "Home »": L21).
   - X-1  hidden nodes: span[itemprop=reviewRating] (display:none "5") removed before sanitising;
          the star count comes from span.ecp-rating-star-full.
   - NEW  structured components lifted out of the raw markup and replaced by a token the templates
          render (so the copy survives and the platform wrapper does not): testimonial cards,
          child-page listings (+ archive title lists), post summaries, quick-action badges, ecp-button
          CTA groups, hours lists, the Gravity Forms form (forms.mjs), the post date of single posts.
   - NEW  div.ecp-heading visual headings -> real headings; heading-accordion wrappers -> the heading;
          WOW.js classes go with every class attribute.
   Copy is never rewritten: text comes out of the source HTML and goes into the rebuild unchanged. */
import { esc, decodeEntities, plain, findElements } from './util.mjs';

export const PARA_BREAK = String.fromCharCode(1);
export const TOKEN = String.fromCharCode(2);
export const tokenOf = (n) => TOKEN + 'C' + n + TOKEN;
export const TOKEN_RE = new RegExp(TOKEN + 'C(\\d+)' + TOKEN, 'g');

const KEEP_TAGS = new Set(['h1','h2','h3','h4','h5','h6','p','ul','ol','li','a','strong','b','em','i','u','br','hr','img','blockquote','table','thead','tbody','tfoot','tr','th','td','figure','figcaption','sup','sub','small','iframe','dl','dt','dd','address','cite','code','pre']);
/* Unwrapping one of these leaves no separator: they sit inside a word or phrase. */
const INLINE_UNWRAP = new Set(['span','font','abbr','acronym','bdi','bdo','mark','ins','del','s','strike','big','tt','var','samp','kbd','q','time','wbr','nobr','center']);
const DROP_WHOLE = /<(script|style|noscript|svg|form|select|button|textarea|nav|header|footer|aside)\b[^>]*>[\s\S]*?<\/\1>/gi;
const SELF_DROP = /<(input|meta|link|source|track)\b[^>]*\/?>/gi;
const BLOCK_LEVEL = new Set(['ul','ol','li','h1','h2','h3','h4','h5','h6','table','thead','tbody','tfoot','tr','td','th','blockquote','figure','figcaption','hr','iframe','img','form','section','div','dl','dt','dd','pre','address']);
const VOID_LEVEL = new Set(['hr','img','br','input','source']);
const VOID_TAGS = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
const DIAGRAM = /diagram|astigmatism|cataract|glaucoma|macular|anatomy|chart|\buv\b|cross.?section|before.and.after|latisse|myopia|hyperopia|presbyopia|\bamd\b|focal|lenses\.png/i;

const SOCIAL_HOSTS = [
  [/(^|\.)facebook\.com$/i, 'Facebook'], [/(^|\.)yelp\.com$/i, 'Yelp'], [/(^|\.)google\.com$/i, 'Google'],
  [/(^|\.)instagram\.com$/i, 'Instagram'], [/(^|\.)linkedin\.com$/i, 'LinkedIn'], [/(^|\.)youtube\.com$/i, 'YouTube'],
  [/(^|\.)(twitter|x)\.com$/i, 'Twitter'],
];

const attrOf = (tag, name) => {
  const m = new RegExp('(?:^|\\s)' + name + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))', 'i').exec(tag || '');
  return m ? (m[1] !== undefined ? m[1] : m[2] !== undefined ? m[2] : m[3]) : null;
};
const textIn = (html) => plain(String(html || '').replace(/<(script|style|svg)\b[\s\S]*?<\/\1>/gi, ' '));

export function createContent(ctx) {
  const { origin, imageMap, willExist, moved, fail, stats, imgUrl } = ctx;
  const OLD_VENDOR = /eyecarepro/i;
  const bump = (k, n = 1) => { stats[k] = (stats[k] || 0) + n; };

  /* mod_pagespeed rewrites one image into many URLs that differ only by a cache hash. */
  function baseKey(u) {
    return String(u || '')
      .replace(/\.pagespeed\.[a-z]{2}\.[A-Za-z0-9_-]+(\.[a-z0-9]+)$/i, '$1')
      .replace(/\/x([^/]+)$/, '/$1');
  }

  /* Architecture is preserved: /a/b/ on the source is /a/b/ in the rebuild. Every internal URL is
     page-relative (../ x depth + path/index.html) so dist/ works from any directory or subpath.
     Returns null for an internal target this build does not produce (the anchor is unwrapped: words
     stay, dead href goes). A target the source mis-links but this build serves elsewhere is
     repointed (MOVED). */
  function localHref(href, depth) {
    if (href === null || href === undefined) return null;
    let h = String(href).trim();
    if (/^tel:/i.test(h)) return 'tel:' + h.slice(4).replace(/\s+/g, '');   // L17: "tel: 318-550-5815"
    if (/^(mailto:|#|javascript:)/i.test(h)) return h;
    if (/^\/\//.test(h)) h = 'https:' + h;
    let u;
    try { u = new URL(h, origin + '/'); } catch { return null; }
    const own = u.origin === origin || /^https?:\/\/(www\.)?cliftoneyecenter\.com$/i.test(u.origin);
    if (!own) return u.href;
    const p = decodeURIComponent(u.pathname).replace(/^\/+|\/+$/g, '');
    const rel = depth === 0 ? '' : '../'.repeat(depth);
    if (/\.(xml|txt|pdf)$/i.test(p)) return rel + p;
    if (!p) return rel + 'index.html' + (u.hash || '');
    if (!willExist.has(p)) {
      const m = moved.get(p);
      if (m && willExist.has(m)) { stats.moved.set(p, (stats.moved.get(p) || 0) + 1); return rel + m + '/index.html' + (u.hash || ''); }
      stats.dead.set(p, (stats.dead.get(p) || 0) + 1);
      return null;
    }
    return rel + p + '/index.html' + (u.hash || '');
  }

  function socialBrand(href) {
    let host;
    try { host = new URL(href, origin + '/').hostname; } catch { return null; }
    for (const [re, name] of SOCIAL_HOSTS) if (re.test(host)) return name;
    return null;
  }

  /* An icon-only anchor (its glyph was an inline <svg>, dropped with the platform markup) keeps a
     visible label only when the SOURCE gave it one: its own aria-label ("Visit us on facebook").
     The reference printed the brand word ("Facebook"), which is authored copy; any other empty
     anchor is dropped. */
  function fillIconLinks(html) {
    return html.replace(/<a\b([^>]*)><\/a>/gi, (full, attrs) => {
      const m = /href\s*=\s*"([^"]*)"/i.exec(attrs);
      if (!m || !socialBrand(decodeEntities(m[1]))) return '';
      const label = /aria-label="([^"]*)"/i.exec(attrs);
      if (!label) { bump('iconLinksDropped'); return ''; }
      bump('iconLinksLabelled');
      return '<a' + attrs.replace(/\s*aria-label="[^"]*"/i, '') + '>' + label[1] + '</a>';
    });
  }

  /* R-1: <main> whenever it exists. The reference chose between <main> and <body> by text length,
     which picked <body> on 23 Clifton pages and leaked the sidebar widgets into their content. */
  function mainRegion(html) {
    const m = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
    if (m) return { html: m[1], region: 'main' };
    const b = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
    return { html: b ? b[1] : html, region: 'body' };
  }

  function stripVendorClauses(html) {
    return html.replace(/<p>([\s\S]*?)<\/p>/gi, (full, inner) => {
      if (!OLD_VENDOR.test(inner)) return full;
      const kept = inner.split(/(?<=\.)\s+/).filter((s) => {
        if (!OLD_VENDOR.test(s)) return true;
        bump('vendorClauses');
        (stats.vendorSentences = stats.vendorSentences || new Set()).add(decodeEntities(s.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim());
        return false;
      });
      const out = kept.join(' ').replace(/\s+/g, ' ').trim();
      if (!out) { bump('vendorParas'); return ''; }
      return '<p>' + out + '</p>';
    });
  }

  /* The source's map embed carries the former agency's Google Maps API key and a place_id the keyless
     endpoint cannot resolve; the keyless maps?q=<name + address>&output=embed form is used (L22). */
  function dekeyMapEmbed(src) {
    let u;
    try { u = new URL(src, origin + '/'); } catch { return src; }
    if (!/(^|\.)google\.com$/i.test(u.hostname)) return src;
    if (!/^\/maps\/embed\/v1\//.test(u.pathname)) return src;
    let q = u.searchParams.get('q') || u.searchParams.get('center');
    if (!q) { bump('mapKeysLeft'); return 'https://www.google.com/maps?q=' + encodeURIComponent(ctx.mapQuery) + '&output=embed'; }
    if (/^place_id:/i.test(q) && ctx.mapQuery) { q = ctx.mapQuery; bump('mapPlaceIdsResolved'); }
    bump('mapKeysStripped');
    return 'https://www.google.com/maps?q=' + encodeURIComponent(q) + '&output=embed';
  }

  function wrapLooseText(html) {
    html = html.replace(/<\/p>\s*<p\b[^>]*>/gi, PARA_BREAK).replace(/<p\b[^>]*>/gi, '').replace(/<\/p>/gi, PARA_BREAK);
    const tagRe = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;
    let out = '', buf = '', depth = 0, last = 0, m;
    const flush = () => {
      for (const part of buf.split(PARA_BREAK)) {
        const text = part.replace(/<[^>]+>/g, '').replace(/&nbsp;|\s/g, '');
        if (text) { out += '<p>' + part.trim() + '</p>'; bump('looseRunsWrapped'); }
      }
      buf = '';
    };
    while ((m = tagRe.exec(html))) {
      const chunk = html.slice(last, m.index);
      last = tagRe.lastIndex;
      const closing = !!m[1], tag = m[2].toLowerCase();
      const isBlock = BLOCK_LEVEL.has(tag), isVoid = VOID_LEVEL.has(tag);
      if (depth > 0) { out += chunk + m[0]; }
      else if (isBlock) { buf += chunk; flush(); out += m[0]; }
      else { buf += chunk + m[0]; continue; }
      if (isBlock && !isVoid) depth += closing ? -1 : 1;
      if (depth < 0) depth = 0;
    }
    buf += html.slice(last);
    flush();
    return out;
  }

  function mapImage(rawSrc, imgBase) {
    let abs = rawSrc;
    try { abs = new URL(rawSrc, imgBase).href; } catch { /* keep raw */ }
    if (/^\/\//.test(rawSrc)) abs = 'https:' + rawSrc;
    return imageMap.get(abs) || imageMap.get(rawSrc) || imageMap.get(baseKey(abs)) || null;
  }

  /* base: the page's own URL with its trailing slash (WordPress serves every page there), which is
     what a RELATIVE <img src> resolves against in a browser - not the site root. */
  function sanitize(html, depth, base) {
    const imgBase = base ? String(base).replace(/\/?$/, '/') : origin + '/';
    let s = html;
    s = s.replace(/<!--[\s\S]*?-->/g, '');
    s = s.replace(/<a\b[^>]*>\s*Skip to (?:main )?content\s*<\/a>/gi, '');
    s = s.replace(/<a\b[^>]*href\s*=\s*["']#["'][^>]*>\s*(?:[xX×✕✖+−^]|&times;)\s*<\/a>/g, '');
    /* an anchor with BLOCK children keeps its own label: flatten the blocks before unwrapping */
    s = s.replace(/<a\b[^>]*>[\s\S]*?<\/a>/gi, (anchor) => {
      if (!/<(div|p|h[1-6]|section|article|header|footer|ul|ol|li|figure)\b/i.test(anchor)) return anchor;
      bump('anchorsFlattened');
      return anchor.replace(/<\/?(div|p|h[1-6]|section|article|header|footer|ul|ol|li|figure)\b[^>]*>/gi, ' ');
    });
    let prev;
    do { prev = s; s = s.replace(DROP_WHOLE, ''); } while (s !== prev);
    s = s.replace(SELF_DROP, '');

    s = s.replace(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g, (full, close, tagRaw, attrs) => {
      const tag = tagRaw.toLowerCase();
      if (!KEEP_TAGS.has(tag)) return INLINE_UNWRAP.has(tag) ? '' : PARA_BREAK;
      if (close) return '</' + tag + '>';
      const out = [];
      const pick = (name) => attrOf(attrs, name);
      if (tag === 'a') {
        const rawHref = decodeEntities(pick('href') || '').trim();
        if (!rawHref || rawHref === '#') return '';
        if (/^tel:\s*$/i.test(rawHref)) { bump('emptyTelUnwrapped'); return ''; }   // href="tel:" with no number (hours-location)
        const pdf = ctx.pdfFor ? ctx.pdfFor(rawHref, depth) : null;
        const href = pdf || localHref(rawHref, depth);
        if (!href) return '';
        out.push('href="' + esc(href) + '"');
        if (/^https?:/i.test(href)) out.push('rel="noopener"', 'target="_blank"');
        const ariaLabel = decodeEntities(pick('aria-label') || '').trim();
        if (ariaLabel) out.push('aria-label="' + esc(ariaLabel) + '"');
      } else if (tag === 'img') {
        const rawSrc = decodeEntities(pick('src') || pick('data-src') || '');
        const mapped = mapImage(rawSrc, imgBase);
        if (!mapped) { fail('build:img', rawSrc, 'no mapping for image referenced in content'); return ''; }
        if (mapped.drop) { bump('imagesDroppedByDecision'); if (mapped.why) (stats.decidedImageDrops = stats.decidedImageDrops || []).push({ src: rawSrc, why: mapped.why }); return ''; }
        const altAttr = decodeEntities(pick('alt') || '');
        const alt = mapped.kind === 'generated' ? mapped.alt : (mapped.altOverride !== undefined && mapped.altOverride !== null ? mapped.altOverride : (altAttr || mapped.alt || ''));
        out.push('src="' + esc(imgUrl(mapped.file, depth)) + '"', 'alt="' + esc(alt) + '"');
        if (mapped.w && mapped.h) out.push('width="' + mapped.w + '"', 'height="' + mapped.h + '"');
        out.push('loading="lazy"', 'decoding="async"');
        if (mapped.kind === 'generated') out.push('data-generated="' + esc(mapped.genId || '') + '"');
        if (mapped.cls) out.push('data-class="' + esc(mapped.cls) + '"');
      } else if (tag === 'iframe') {
        let src = decodeEntities(pick('src') || pick('data-src') || '');
        if (!src) return '';
        if (/^\/\//.test(src)) src = 'https:' + src;
        src = dekeyMapEmbed(src);
        const t = decodeEntities(pick('title') || '')
          || (/google\.com\/maps/.test(src) ? 'Google map'
            : /youtube(-nocookie)?\.com|youtu\.be/.test(src) ? 'YouTube video'
            : 'Embedded content');
        out.push('src="' + esc(src) + '"', 'loading="lazy"', 'title="' + esc(t) + '"');
        if (/youtube/.test(src)) out.push('allowfullscreen');
      } else if (tag === 'td' || tag === 'th') {
        for (const n of ['colspan', 'rowspan']) { const v = pick(n); if (v) out.push(n + '="' + esc(v) + '"'); }
      } else if (/^h[1-6]$/.test(tag)) {
        const id = pick('id');
        if (id && /^[A-Za-z][\w:.-]*$/.test(id)) out.push('data-src-id="' + esc(id) + '"');
      } else if (tag === 'ol') {
        const st = pick('start'); if (st && /^\d+$/.test(st)) out.push('start="' + st + '"');
      }
      return '<' + tag + (out.length ? ' ' + out.join(' ') : '') + '>';
    });

    s = fillIconLinks(s);
    s = stripVendorClauses(s);
    s = s.replace(/<(strong|em|b|i|u|small|sup|sub|a|span)\b[^>]*>(\s+)<\/\1>/gi, ' ');
    do { prev = s; s = s.replace(/<(p|li|h[1-6]|blockquote|figcaption|td|th|strong|em|a|b|i|u)(?:\s[^>]*)?>\s*<\/\1>/gi, ''); } while (s !== prev);
    s = s.replace(/(<br>\s*){3,}/gi, '<br><br>');
    s = wrapLooseText(s);
    s = s.split(PARA_BREAK).join(' ');
    const BLOCKS = 'p|ul|ol|h[1-6]|div|table|blockquote|figure|figcaption|hr|iframe|section|form';
    s = s.replace(new RegExp('(</(?:' + BLOCKS + ')>)\\s*(?:<br>\\s*)+', 'gi'), '$1');
    s = s.replace(new RegExp('(?:<br>\\s*)+(<(?:' + BLOCKS + ')\\b)', 'gi'), '$1');
    s = s.replace(/<p>(?:\s|&nbsp;| )*<\/p>/gi, '');
    s = s.replace(/<(h[1-6])(?:\s[^>]*)?>(?:\s|&nbsp;| )*<\/\1>/gi, () => { bump('emptyHeadingsDropped'); return ''; });
    s = s.replace(/(?:<hr>\s*){2,}/gi, '<hr>');
    /* every table scrolls inside itself rather than overflowing the page */
    s = s.replace(/<table>([\s\S]*?)<\/table>/gi, (full, inner) => {
      if (/<th[\s>]/i.test(inner)) return full;
      let promoted = false;
      const out = inner.replace(/<tr>([\s\S]*?)<\/tr>/i, (row, cells) => {
        if (promoted) return row;
        promoted = true;
        return '<tr>' + cells.replace(/<td(\s[^>]*)?>([\s\S]*?)<\/td>/gi, (c, attrs, body) => '<th scope="col"' + (attrs || '') + '>' + body + '</th>') + '</tr>';
      });
      return '<table>' + out + '</table>';
    });
    s = s.replace(/<table>[\s\S]*?<\/table>/gi, (t) => { bump('tablesWrapped'); return '<div class="table-scroll" tabindex="0" role="region" aria-label="Table">' + t + '</div>'; });
    s = s.replace(/[ \t]*[\r\n]+[ \t\r\n]*/g, ' ');   /* no <pre> in any source main (0 files): newlines are layout whitespace */
    s = s.replace(/[ \t\u00a0]{2,}/g, ' ');
    /* block elements: trim; inline elements: move the edge space OUTSIDE (never glue two words) */
    s = s.replace(/<(h[1-6]|li|p|figcaption|td|th)((?:\s[^>]*)?)>\s+/gi, '<$1$2>').replace(/\s+<\/(h[1-6]|li|p|figcaption|td|th)>/gi, '</$1>');
    s = s.replace(/<(strong|b|em|i|a)((?:\s[^>]*)?)>\s+/gi, ' <$1$2>').replace(/\s+<\/(strong|b|em|i|a)>/gi, '</$1> ');
    s = s.replace(/ {2,}/g, ' ').replace(/(<(?:h[1-6]|li|p|figcaption|td|th)(?:\s[^>]*)?>) /gi, '$1').replace(/ (<\/(?:h[1-6]|li|p|figcaption|td|th)>)/gi, '$1');
    return s.trim();
  }

  /* Restore ONLY heading ids the cleaned page links to, onto the heading whose text matches the
     source element that held the id. */
  function restoreAnchorTargets(clean, raw) {
    const wanted = new Set();
    for (const m of clean.matchAll(/href="#([A-Za-z][\w:.-]*)"/g)) wanted.add(m[1]);
    clean = clean.replace(/ data-src-id="([^"]*)"/g, (full, id) => (wanted.has(id) ? ' id="' + id + '"' : ''));
    const norm = (t) => decodeEntities(String(t).replace(/<[^>]+>/g, ' ')).replace(/[\s:：]+/g, ' ').trim().toLowerCase();
    for (const id of wanted) {
      if (new RegExp('id="' + id + '"').test(clean)) continue;
      const src = new RegExp('<([a-z][a-z0-9]*)\\b[^>]*\\bid=["\']' + id + '["\'][^>]*>([\\s\\S]*?)<\\/\\1>', 'i').exec(raw);
      if (!src) continue;
      const label = norm(src[2]);
      if (!label) continue;
      let done = false;
      clean = clean.replace(/<(h[1-6])>([\s\S]*?)<\/\1>/gi, (full, tag, inner) => {
        if (done || norm(inner) !== label) return full;
        done = true; bump('anchorsRestored');
        return '<' + tag + ' id="' + id + '">' + inner + '</' + tag + '>';
      });
    }
    return clean;
  }

  function balanceFragment(frag) {
    const stack = [];
    const re = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)(?:\s[^>]*?)?(\/?)>/g;
    let out = '', last = 0, m;
    while ((m = re.exec(frag))) {
      const tag = m[2].toLowerCase();
      if (VOID_TAGS.has(tag) || m[3] === '/') continue;
      if (m[1] !== '/') { stack.push(tag); continue; }
      const at = stack.lastIndexOf(tag);
      if (at === -1) { out += frag.slice(last, m.index); last = m.index + m[0].length; bump('balanceStray'); continue; }
      if (at < stack.length - 1) {
        out += frag.slice(last, m.index) + stack.slice(at + 1).reverse().map((t) => '</' + t + '>').join('');
        last = m.index;
        bump('balanceClosed', stack.length - 1 - at);
      }
      stack.length = at;
    }
    out += frag.slice(last);
    while (stack.length) { out += '</' + stack.pop() + '>'; bump('balanceClosed'); }
    return out;
  }

  function dropEmptyShells(frag) {
    let prev;
    do {
      prev = frag;
      frag = frag.replace(/<(li|ul|ol|p|strong|em|span)(?:\s[^>]*)?>(?:\s|&nbsp;)*<\/\1>/gi, () => { bump('emptyShellsDropped'); return ''; });
    } while (frag !== prev);
    return frag;
  }

  function stripBogusComments(frag) {
    const out = frag
      .replace(/&lt;!\s*(?:&#8211;|&#8212;|&ndash;|&mdash;|[–—])\s*/gi, '')
      .replace(/\s*(?:&#8211;|&#8212;|&ndash;|&mdash;|[–—])\s*&gt;/gi, '')
      .replace(/<!\s*[–—]\s*/g, '')
      .replace(/\s*[–—]\s*>/g, '');
    if (out !== frag) bump('bogusCommentsStripped');
    return out;
  }

  function blockKey(block) {
    return decodeEntities(String(block).replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ')
      .replace(/\s+([.,;:!?)\]])/g, '$1').replace(/([(\[])\s+/g, '$1').trim().toLowerCase();
  }

  function dedupeWithinCard(html) {
    const seen = new Set();
    return html.replace(/<(p|h[2-6]|ul|ol|blockquote)(?:\s[^>]*)?>[\s\S]*?<\/\1>/gi, (block) => {
      const key = blockKey(block);
      if (key.length < 80) return block;
      if (seen.has(key)) { bump('withinCardDupes'); return ''; }
      seen.add(key);
      return block;
    });
  }

  function dedupeAdjacentRuns(html) {
    const blocks = [...html.matchAll(/<(h[1-6]|p|ul|ol|figure|table|blockquote)(?:\s[^>]*)?>[\s\S]*?<\/\1>/gi)]
      .map((m) => ({ text: m[0], start: m.index, end: m.index + m[0].length }));
    if (blocks.length < 4) return html;
    const keys = blocks.map((b) => blockKey(b.text));
    for (let len = Math.floor(blocks.length / 2); len >= 2; len--) {
      for (let i = 0; i + 2 * len <= blocks.length; i++) {
        let same = true, runChars = 0;
        for (let k = 0; k < len && same; k++) { if (keys[i + k] !== keys[i + len + k]) same = false; runChars += keys[i + k].length; }
        if (!same || runChars < 60) continue;
        if (html.slice(blocks[i + len - 1].end, blocks[i + len].start).trim() !== '') continue;
        bump('adjacentRunsDropped'); bump('adjacentBlocksDropped', len);
        return dedupeAdjacentRuns(html.slice(0, blocks[i + len].start) + html.slice(blocks[i + 2 * len - 1].end));
      }
    }
    return html;
  }

  /* A figure's ROLE decides how it may be shown (DESIGN-SPEC 3.16): a diagram, logo, QR code or a
     small source image is never cropped, enlarged or broken out; only a photo >= 480px may break out. */
  /* COMPONENTS D.3 role classes, decided in this order from audit/image-classification.json and the
     native size: diagram, brand, portrait, photo (>= 480px), plate (everything else). */
  function imgRole(tag) {
    const num = (n) => { const m = new RegExp(n + '="(\\d+)"').exec(tag); return m ? Number(m[1]) : 0; };
    const cls = (/data-class="([^"]*)"/.exec(tag) || [])[1] || '';
    const w = num('width'), h = num('height');
    if (cls === 'functional-qr-code') return 'qr';
    if (cls === 'educational-diagram') return 'diagram';
    if (cls === 'brand-campaign-image') return 'brand';
    if (cls === 'practice-doctor-photo') return 'portrait';
    if (/data-generated=/.test(tag)) return 'plate';               /* slot-fills (fill-*, alt "") */
    if (cls === 'platform-404-illustration' || /logo|payment|third-party/.test(cls)) return 'plate';
    if (w && h && h > w && w >= 400) return 'portrait';
    if (w >= 480) return 'photo';
    return 'plate';
  }

  function bindFigureCaptions(html) {
    return html.replace(/(<figure class="fig fig--[a-z]+"><span class="fig__media"><img[^>]*><\/span><\/figure>)\s*<p>\s*([\s\S]{1,80}?)\s*<\/p>/gi, (full, fig, para) => {
      const alt = (/alt="([^"]*)"/.exec(fig) || [])[1] || '';
      const p = para.replace(/<[^>]+>/g, '').trim();
      const norm = (s) => decodeEntities(s).replace(/[×x]\s*\d+/gi, '').replace(/\s+/g, ' ').trim().toLowerCase();
      if (!p || !alt || norm(alt) !== norm(p)) return full;
      bump('captionsBound');
      return fig.replace(/<\/figure>$/, '<figcaption>' + para + '</figcaption></figure>');
    });
  }

  function groupFigureRuns(html) {
    return html.replace(/(?:<figure class="fig[^"]*">[\s\S]*?<\/figure>\s*){2,}/gi, (run) => {
      const n = (run.match(/<figure class="fig/gi) || []).length;
      if (n < 2) return run;
      bump('figureGrids'); bump('figureGridItems', n);
      return '<div class="fig-grid" data-count="' + n + '">' + run.trim() + '</div>';
    });
  }

  function wrapContentFigures(html) {
    html = html.replace(/<h[1-6]>\s*(<img[^>]*>)\s*<\/h[1-6]>/gi, (full, img) => { bump('headingImagesUnwrapped'); return img; });
    /* a list whose every item is a lone image (optionally linked) is a logo wall (COMPONENTS B.21):
       carriers, frame brands, contact-lens brands, promotions; payment icons are a pay-row */
    html = html.replace(/<(ul|ol)>([\s\S]*?)<\/\1>/gi, (full, listTag, inner) => {
      const items = [...inner.matchAll(/<li>([\s\S]*?)<\/li>/gi)].map((x) => x[1]);
      if (items.length < 1 || inner.replace(/<li>[\s\S]*?<\/li>/gi, '').trim()) return full;
      const allImg = items.every((it) => (it.match(/<img[^>]*>/gi) || []).length === 1 && it.replace(/<[^>]+>/g, '').replace(/&[a-z#0-9]+;/gi, '').trim() === '');
      if (!allImg) return full;
      const payment = items.every((it) => /data-class="payment-logo"/.test(it));
      bump(payment ? 'payRows' : 'logoGrids'); bump('logoGridItems', items.length);
      if (payment) return '<ul class="pay-row">' + items.map((it) => '<li class="pay-row__item">' + (it.match(/<img[^>]*>/i) || [''])[0] + '</li>').join('') + '</ul>';
      return '<ul class="logo-grid" data-count="' + items.length + '">' + items.map((it) => {
        const img = (it.match(/<img[^>]*>/i) || [''])[0];
        const a = /<a\b([^>]*)>/i.exec(it);
        if (a) return '<li class="logo-chip logo-chip--link"><a class="logo-chip__link"' + a[1] + '>' + img + '</a></li>';
        return '<li class="logo-chip">' + img + '</li>';
      }).join('') + '</ul>';
    });
    let depth = 0, out = '', last = 0, m;
    const token = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)(?:\s[^>]*?)?(\/?)>/g;
    while ((m = token.exec(html))) {
      const tag = m[2].toLowerCase();
      if (tag === 'img') {
        if (depth === 0) {
          const role = imgRole(m[0]);
          bump('figuresWrapped');
          stats.figureRoles[role] = (stats.figureRoles[role] || 0) + 1;
          out += html.slice(last, m.index) + (role === 'qr' ? '<figure class="qr-plate">' + m[0] + '</figure>' : '<figure class="fig fig--' + role + '"><span class="fig__media">' + m[0] + '</span></figure>');
          last = m.index + m[0].length;
        }
        continue;
      }
      if (!/^(li|p|a|td|th|figure|table|blockquote|ul|ol|dl|dd)$/.test(tag)) continue;
      if (m[3] === '/') continue;
      depth += m[1] === '/' ? -1 : 1;
      if (depth < 0) depth = 0;
    }
    out += html.slice(last);
    return groupFigureRuns(bindFigureCaptions(out));
  }

  /* An <img> left inside a <p> (the source's right-floated post picture) is lifted out as a figure. */
  function liftParagraphImages(html) {
    return html.replace(/<p>((?:\s*<img\b[^>]*>\s*)+)<\/p>/gi, (full, imgs) => { bump('paraImagesLifted'); return imgs.trim(); });
  }

  function splitSections(html) {
    const parts = [];
    const re = /<h2(?:\s[^>]*)?>([\s\S]*?)<\/h2>/gi;
    let last = 0, m, pendingHeading = null, pendingAttrs = '';
    while ((m = re.exec(html))) {
      const body = html.slice(last, m.index).trim();
      if (body || pendingHeading) parts.push({ heading: pendingHeading, attrs: pendingAttrs, body });
      pendingHeading = m[1].trim();
      pendingAttrs = (/<h2(\s[^>]*)?>/i.exec(m[0]) || [])[1] || '';
      last = m.index + m[0].length;
    }
    const tail = html.slice(last).trim();
    if (tail || pendingHeading) parts.push({ heading: pendingHeading, attrs: pendingAttrs, body: tail });
    return parts.filter((p) => String(p.heading || '').replace(/<[^>]+>/g, '').trim() || String(p.body || '').replace(/<[^>]+>/g, '').trim() || /<(img|iframe)\b/i.test(p.body || ''));
  }

  function dedupeSections(parts) {
    const sigOf = (s) => decodeEntities(String(s || '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim().toLowerCase();
    const seen = new Set(), kept = [], out = [];
    for (const p of parts) {
      const body = p.body || '';
      const hasMedia = /<(img|iframe|table|ul|ol|form)\b/i.test(body) || TOKEN_RE.test(body);
      TOKEN_RE.lastIndex = 0;
      const headText = sigOf(p.heading), bodyText = sigOf(body);
      if (!bodyText && !hasMedia) { if (headText) { bump('headingOnlySections'); out.push({ heading: p.heading, attrs: p.attrs, body: '', headingOnly: true }); } continue; }
      const sig = headText + '|' + bodyText;
      if (seen.has(sig)) { bump('dupSectionsDropped'); (stats.dupSections = stats.dupSections || []).push(sig.slice(0, 120)); continue; }
      const words = bodyText.split(' ').filter(Boolean);
      if (words.length >= 25) {
        let dup = false;
        for (const prev of kept) {
          if (prev.words.length < words.length * 0.8) continue;
          const bag = new Map();
          for (const w of prev.words) bag.set(w, (bag.get(w) || 0) + 1);
          let hit = 0;
          for (const w of words) { const n = bag.get(w) || 0; if (n > 0) { bag.set(w, n - 1); hit++; } }
          if (hit / words.length >= 0.9) { dup = true; break; }
        }
        if (dup) { bump('dupSectionsDropped'); (stats.dupSections = stats.dupSections || []).push(sig.slice(0, 120)); continue; }
      }
      seen.add(sig);
      kept.push({ words });
      out.push({ heading: p.heading, attrs: p.attrs, body });
    }
    /* A run of heading-only sections is merged with the NEXT section that has a body, in source
       order: the first heading stays the section's h2, the later ones (including that section's own
       heading) become h3 before its body. The reference merged each into the next section AFTER its
       h2, which reordered builder headings ("SEE BETTER / DESIGNER EYEWEAR / LIVE BETTER"). */
    const merged = [];
    let pending = [];
    for (const s of out) {
      if (s.headingOnly) { pending.push(s); continue; }
      if (pending.length) {
        const first = pending[0];
        const subs = pending.slice(1).map((x) => ({ heading: x.heading, attrs: x.attrs }));
        if (s.heading) subs.push({ heading: s.heading, attrs: s.attrs });
        merged.push({ heading: first.heading, attrs: first.attrs, body: subs.map((t) => '<h3' + (/\sid="/.test(t.attrs || '') ? ' ' + (/\sid="[^"]*"/.exec(t.attrs)[0]).trim() : '') + '>' + t.heading + '</h3>').join('') + s.body });
        bump('headingRunsMerged');
        pending = [];
        continue;
      }
      merged.push(s);
    }
    for (const s of pending) merged.push({ heading: s.heading, attrs: s.attrs, body: '' });
    return merged.filter((s) => s.heading || s.body);
  }

  function finishSection(body) {
    return wrapContentFigures(liftParagraphImages(dedupeWithinCard(dedupeAdjacentRuns(stripBogusComments(dropEmptyShells(balanceFragment(body)))))));
  }

  /* ----------------------------------------------------------------------------------------------
     RAW-LEVEL PREPARATION (before sanitising). Each extractor lifts a platform module out of the raw
     <main>, records its source strings as data, and leaves a token (wrapped in a <div> so it becomes
     its own paragraph) that build.mjs swaps for the rendered component. */
  function prepare(mainHtml, opts = {}) {
    const comps = [];
    const add = (kind, data) => { comps.push({ kind, data }); return '<div>' + tokenOf(comps.length - 1) + '</div>'; };
    let h = mainHtml.replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style|noscript)\b[\s\S]*?<\/\1>/gi, '');

    /* R-2: the source trail, from the RAW markup (hrefs not yet relativised, no 300-char cap) */
    let trail = null, trailRaw = null;
    h = h.replace(/<div class="ecp-breadcrumb\b[^"]*"[^>]*>([\s\S]*?)<\/div>/i, (m, inner) => {
      trailRaw = inner;
      const parts = inner.split(/<span[^>]*ecp-breadcrumb-separator[^>]*>[\s\S]*?<\/span>/i);
      const segs = [];
      for (const part of parts) {
        const a = /<a\b([^>]*)>([\s\S]*?)<\/a>/i.exec(part);
        const text = plain(part);
        if (!text) { bump('crumbSegmentsEmptyDropped'); continue; }
        segs.push({ text, href: a ? decodeEntities(attrOf(a[1], 'href') || '') || null : null });
      }
      trail = segs;
      bump('sourceCrumbsTaken');
      return '';
    });

    /* X-1: the hidden schema.org rating value */
    h = h.replace(/<span\b[^>]*itemprop=["']reviewRating["'][^>]*>\s*<span\b[^>]*itemprop=["']ratingValue["'][^>]*>[^<]*<\/span>\s*<\/span>/gi, () => { bump('hiddenRatingValuesRemoved'); return ''; });

    /* the post date of a single post (ecp-view-complete): rendered in the title band (DESIGN-SPEC 3.19) */
    let postDate = null;
    if (/ecp-posts-wrapper-post\b[^"]*ecp-view-complete/.test(h)) {
      h = h.replace(/<div class="ecp-post-date\b[^"]*">\s*([^<]*?)\s*<\/div>/i, (m, d) => { postDate = plain(d); return ''; });
    }

    /* Gravity Forms (F-1/F-2): only a gform_wrapper INSIDE <main>; parsed from this script-stripped
       markup, never from the raw bytes */
    if (opts.parseForm) {
      for (const el of findElements(h, /<(div)\b[^>]*class=['"][^'"]*\bgform_wrapper\b[^>]*>/i)) {
        const form = opts.parseForm(el.html);
        h = h.slice(0, el.start) + (form ? add('form', form) : '') + h.slice(el.end);
        bump('formsParsed');
        break;
      }
    }
    /* any other form in main (search modules, the voice search, /category/our-doctors/): removed (L11) */
    h = h.replace(/<form\b[\s\S]*?<\/form>/gi, (m) => { if (/role=["']search|ecp-search|voice_search/i.test(m)) bump('searchFormsRemoved'); else bump('otherFormsRemoved'); return ''; });
    /* the visible label of the removed voice search (declared L11; only /template/footer/ has it in its region) */
    h = h.replace(/<strong>\s*(?:<span\b[^>]*>)?\s*Ask Here, Voice Search\s*(?:<\/span>)?\s*<\/strong>/gi, () => { bump('voiceSearchLabelsRemoved'); return ''; });

    /* COMPONENTS G.9 visit block for /hours-location/ and /location/*: every location module of the
       page (map, title, address, phone, hours, payment) merged into one component at the first
       module's position; a heading-accordion before the payment module becomes its summary */
    if (opts.composeVisit) {
      const locs = findElements(h, /<(div)\b[^>]*class="ecp-posts-wrapper\b[^"]*ecp-posts-wrapper-location\b[^"]*"[^>]*>/gi);
      if (locs.length) {
        const v = { mapSrc: null, title: null, subs: {}, address: [], phoneLabel: 'Phone:', phone: null, hours: [], payment: null };
        const sub = (x) => { const m = /<div class="heading-h3">([\s\S]*?)<\/div>/i.exec(x); return m ? plain(m[1]) : ''; };
        for (const el of locs) {
          const x = el.html;
          const ifr = /<iframe\b[^>]*\ssrc=["']([^"']+)["']/i.exec(x);
          if (ifr && !v.mapSrc) { let src = decodeEntities(ifr[1]); if (/^\/\//.test(src)) src = 'https:' + src; v.mapSrc = dekeyMapEmbed(src); }
          const t = /<div class="ecp-post-title[^"]*">[\s\S]*?<a\b([^>]*)>([\s\S]*?)<\/a>/i.exec(x);
          if (t && !v.title) v.title = { text: plain(t[2]), href: decodeEntities(attrOf(t[1], 'href') || '') };
          const cd = findElements(x, /<(div)\b[^>]*class="ecp-post-contactdetails\b[^"]*"[^>]*>/i)[0];
          if (cd) {
            if (sub(cd.html)) v.subs.contact = sub(cd.html);
            const ph = /<strong class="ecp-post-label">([\s\S]*?)<\/strong>[\s\S]*?href="tel:([^"]*)"/i.exec(cd.html);
            if (ph) { v.phoneLabel = plain(ph[1]); v.phone = ph[2].replace(/\s+/g, ''); }
          }
          const ad = findElements(x, /<(div)\b[^>]*class="ecp-post-address\b[^"]*"[^>]*>/i)[0];
          if (ad) {
            if (sub(ad.html)) v.subs.address = sub(ad.html);
            const body = ad.html.replace(/^<div[^>]*>|<\/div>$/g, '').replace(/<div class="ecp-post-subheading">[\s\S]*?<\/div>\s*<\/div>/i, '');
            v.address = body.split(/<br\s*\/?>/i).map((l) => plain(l)).filter(Boolean);
          }
          const hr = findElements(x, /<(div)\b[^>]*class="ecp-post-hours\b[^"]*"[^>]*>/i)[0];
          if (hr) {
            if (sub(hr.html)) v.subs.hours = sub(hr.html);
            v.hours = [...hr.html.matchAll(/<li\b[^>]*ecp-post-hours-item[^>]*>\s*<strong[^>]*>([\s\S]*?)<\/strong>\s*<span[^>]*>([\s\S]*?)<\/span>/gi)].map((m) => [plain(m[1]).replace(/:$/, ''), plain(m[2])]);
          }
          const pay = findElements(x, /<(div)\b[^>]*class="ecp-post-paymentinfo\b[^"]*"[^>]*>/i)[0];
          if (pay) {
            v.payment = {
              summary: sub(pay.html),
              weAccept: plain((/<p>\s*<strong>([\s\S]*?)<\/strong>\s*<\/p>/i.exec(pay.html) || [])[1] || ''),
              icons: [...pay.html.matchAll(/<img\b([^>]*)>/gi)].map((m) => ({ src: decodeEntities(attrOf(m[1], 'src') || ''), alt: decodeEntities(attrOf(m[1], 'alt') || '') })),
              start: el.start,
            };
          }
        }
        /* the builder heading-accordion that collapses the payment module ("Forms of Payment") */
        let accordionCut = null;
        if (v.payment) {
          const acc = findElements(h, /<(div|h[1-6])\b[^>]*class="[^"]*\becp-heading-accordion\b[^"]*"[^>]*>/gi).filter((a) => a.end <= v.payment.start).pop();
          if (acc) { const txt = /<span class="ecp-heading-text">([\s\S]*?)<\/span>/i.exec(acc.html); if (txt && !v.payment.summary) v.payment.summary = plain(txt[1]); accordionCut = acc; bump('paymentAccordions'); }
          if (!v.payment.summary) v.payment.summary = v.payment.weAccept || 'Payment';
          delete v.payment.start;
        }
        const cuts = locs.map((e) => ({ start: e.start, end: e.end }));
        if (accordionCut) cuts.push({ start: accordionCut.start, end: accordionCut.end });
        cuts.sort((a, b) => b.start - a.start);
        const firstStart = Math.min(...locs.map((e) => e.start));
        for (const c of cuts) h = h.slice(0, c.start) + (c.start === firstStart ? add('visit', v) : '') + h.slice(c.end);
        bump('visitBlocks');
      }
    }

    /* F.4 doc cards: a paragraph whose only link is a PDF (patient forms) */
    if (opts.docCards) {
      h = h.replace(/(?:<p>\s*(?:<strong>)?\s*<a\b[^>]*href="[^"]*\.pdf"[^>]*>[\s\S]*?<\/a>[^<]*(?:<\/strong>)?\s*<\/p>\s*)+/gi, (run) => {
        const items = [...run.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>([^<]*)/gi)].map((m) => ({ rawHref: decodeEntities(attrOf(m[1], 'href') || ''), label: plain(m[2]), after: decodeEntities(m[3]).replace(/\s+/g, ' ').replace(/\s+$/, '') }));
        bump('docCards', items.length);
        return add('docs', items);
      });
    }

    /* F.4 team card (/our-eye-doctors/): the team module with the portrait; its "Read More" comes
       from the team summary module that follows (removed there so it prints once) */
    if (opts.composeTeam) {
      const teams = findElements(h, /<(div)\b[^>]*class="ecp-posts-wrapper\b[^"]*ecp-posts-wrapper-team\b[^"]*"[^>]*>/gi);
      const withImg = teams.find((t) => /<img\b/i.test(t.html));
      if (withImg) {
        const img = /<img\b([^>]*)>/i.exec(withImg.html);
        const t = /<div class="ecp-post-title[^"]*">[\s\S]*?<a\b([^>]*)>([\s\S]*?)<\/a>/i.exec(withImg.html);
        let more = null;
        const moreRe = /<div class="ecp-post-metabar[^"]*">\s*<span class="ecp-post-meta-readmore">\s*<a\b([^>]*)>([\s\S]*?)<\/a>\s*<\/span>\s*<\/div>/i;
        const other = teams.find((x) => x !== withImg && moreRe.test(x.html));
        if (other) { const m = moreRe.exec(other.html); more = plain(m[2]); }
        const data = { img: img ? { src: decodeEntities(attrOf(img[1], 'src') || ''), alt: decodeEntities(attrOf(img[1], 'alt') || '') } : null, name: t ? plain(t[2]) : '', href: t ? decodeEntities(attrOf(t[1], 'href') || '') : '', more };
        const token = add('team', data);
        if (other) h = h.slice(0, other.start) + other.html.replace(moreRe, '') + h.slice(other.end);
        const again = findElements(h, /<(div)\b[^>]*class="ecp-posts-wrapper\b[^"]*ecp-posts-wrapper-team\b[^"]*"[^>]*>/gi).find((x) => /<img\b/i.test(x.html));
        if (again) h = h.slice(0, again.start) + token + h.slice(again.end);
        bump('teamCards');
      }
    }

    /* testimonial cards (5 files, 9 cards): the whole posts wrapper becomes one component */
    for (;;) {
      const el = findElements(h, /<(div)\b[^>]*class="ecp-posts-wrapper\b[^"]*"[^>]*>/i).find((e) => /ecp-posttype-testimonial/.test(e.html));
      if (!el) break;
      const cards = [];
      for (const post of findElements(el.html, /<(div)\b[^>]*class="ecp-post ecp-post-\d+ ecp-posttype-testimonial\b[^"]*"[^>]*>/i)) {
        const content = (findElements(post.html, /<(div)\b[^>]*class="ecp-post-content\b[^"]*"[^>]*>/i)[0] || {}).html || '';
        const attr = (findElements(post.html, /<(div)\b[^>]*class="ecp-post-attribute"[^>]*>/i)[0] || {}).html || '';
        const stars = (post.html.match(/ecp-rating-star-full/g) || []).length;
        const inner = content.replace(/^<div[^>]*>|<\/div>$/g, '');
        cards.push({ html: inner, text: textIn(inner), name: textIn(attr).replace(/^-\s*/, ''), stars });
      }
      h = h.slice(0, el.start) + add('testimonials', cards) + h.slice(el.end);
      bump('testimonialCards', cards.length);
    }

    /* post summaries (/whats-new/ 151, the home's latest-post list) */
    for (;;) {
      const el = findElements(h, /<(div)\b[^>]*class="ecp-posts-wrapper\b[^"]*ecp-posts-wrapper-post\b[^"]*ecp-view-summary[^"]*"[^>]*>/i)[0];
      if (!el) break;
      const items = [];
      for (const post of findElements(el.html, /<(div)\b[^>]*class="ecp-post ecp-post-\d+ ecp-posttype-post\b[^"]*"[^>]*>/i)) {
        const t = /<div class="ecp-post-title[^"]*">[\s\S]*?<a\b([^>]*)>([\s\S]*?)<\/a>/i.exec(post.html);
        const d = /<div class="ecp-post-date[^"]*">\s*([\s\S]*?)\s*<\/div>/i.exec(post.html);
        const c = /<div class="ecp-post-content[^"]*">([\s\S]*?)<\/div>/i.exec(post.html);
        const more = /<span class="ecp-post-meta-readmore">\s*<a\b([^>]*)>([\s\S]*?)<\/a>/i.exec(post.html);
        items.push({
          title: t ? plain(t[2]) : '', href: t ? decodeEntities(attrOf(t[1], 'href') || '') : '',
          date: d ? plain(d[1]) : '', excerpt: c ? plain(c[1]) : '',
          more: more ? plain(more[2]) : '', moreLabel: more ? decodeEntities(attrOf(more[1], 'aria-label') || '') : '',
        });
      }
      h = h.slice(0, el.start) + add('posts', items) + h.slice(el.end);
      bump('postSummaries', items.length);
    }

    /* child-page listings (29 hubs, 169 items; 25 thumbnails) */
    for (const el of findElements(h, /<(div)\b[^>]*class="ecp-childpages\b[^"]*"[^>]*>/gi).reverse()) {
      const items = [];
      for (const li of findElements(el.html, /<(li)\b[^>]*class="ecp-childpages-link\b[^"]*"[^>]*>/gi)) {
        const link = /<div class="ecp-childpages-link">\s*<a\b([^>]*)>([\s\S]*?)<\/a>/i.exec(li.html);
        const sum = /<div class="ecp-childpages-summary">([\s\S]*?)<\/div>/i.exec(li.html);
        const img = /<div class="ecp-childpages-image">[\s\S]*?<img\b([^>]*)>/i.exec(li.html);
        items.push({
          title: link ? plain(link[2]) : '', href: link ? decodeEntities(attrOf(link[1], 'href') || '') : '',
          summary: sum ? plain(sum[1]) : '',
          thumb: img ? { src: decodeEntities(attrOf(img[1], 'src') || ''), alt: decodeEntities(attrOf(img[1], 'alt') || '') } : null,
        });
      }
      h = h.slice(0, el.start) + add('childpages', { items, variant: items.some((i) => i.thumb) ? 'thumbs' : 'plain' }) + h.slice(el.end);
      bump('childpageLists'); bump('childpageItems', items.length);
    }

    /* archive title lists (/category/*, /tag/*): runs of div.ecp-entry-title > a */
    h = h.replace(/(?:<div class="ecp-entry-title">\s*<a\b[^>]*>[\s\S]*?<\/a>\s*<\/div>\s*)+/gi, (run) => {
      const items = [...run.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].map((m) => ({ title: plain(m[2]), href: decodeEntities(attrOf(m[1], 'href') || ''), summary: '', thumb: null }));
      bump('archiveLists'); bump('archiveItems', items.length);
      return add('childpages', { items, variant: 'archive' });
    });

    /* quick-action badges inside main (9 builder pages): the dock row */
    for (const el of findElements(h, /<(div)\b[^>]*class="ecp-badges\b[^"]*"[^>]*>/gi).reverse()) {
      const items = [...el.html.matchAll(/<a\b([^>]*class="ecp-badge\b[^"]*"[^>]*)>([\s\S]*?)<\/a>/gi)].map((m) => ({
        label: plain((/<div class="ecp-badge-title">([\s\S]*?)<\/div>/i.exec(m[2]) || [])[1] || attrOf(m[1], 'aria-label') || ''),
        href: decodeEntities(attrOf(m[1], 'href') || ''), newTab: /target=["']_blank/i.test(m[1]),
      }));
      h = h.slice(0, el.start) + add('badges', items) + h.slice(el.end);
      bump('badgeRowsInMain');
    }

    /* hours lists (location widgets in main) */
    for (const el of findElements(h, /<(div)\b[^>]*class="ecp-post-hours clear"[^>]*>/gi).reverse()) {
      const rows = [...el.html.matchAll(/<li\b[^>]*ecp-post-hours-item[^>]*>\s*<strong[^>]*>([\s\S]*?)<\/strong>\s*<span[^>]*>([\s\S]*?)<\/span>/gi)].map((m) => [plain(m[1]).replace(/:$/, ''), plain(m[2])]);
      h = h.slice(0, el.start) + add('hours', rows) + h.slice(el.end);
      bump('hoursListsInMain');
    }

    /* ecp-button CTAs: consecutive buttons form one group (the CTA band restyles them, DESIGN-SPEC 3.22).
       A <span class="ecp-button" href=""> is a dead button: its label is kept as a link to the
       appointment form only in the top bar (L01); inside main there are none (B24 = 0). */
    h = h.replace(/(?:<div class="ecp-button-wrapper[^"]*">\s*)?<a\b([^>]*class="ecp-button\b[^"]*"[^>]*)>\s*<span class="ecp-button-label">([\s\S]*?)<\/span>\s*<\/a>(?:\s*<\/div>)?/gi, (m, attrs, label) => {
      bump('ctaButtons');
      return add('button', { label: plain(label), href: decodeEntities(attrOf(attrs, 'href') || ''), newTab: /target=["']_blank/i.test(attrs) });
    });

    /* heading accordions: the heading keeps its level; the collapsible wrapper goes (the next
       module stays visible - the source's collapsed state was a platform script toggle) */
    h = h.replace(/<(h[1-6]|div)\b([^>]*class="[^"]*\becp-heading-accordion\b[^"]*"[^>]*)>([\s\S]*?<span class="ecp-heading-text">([\s\S]*?)<\/span>[\s\S]*?)<\/\1>/gi, (m, tag, attrs, inner, text) => {
      bump('headingAccordions');
      const lvl = /^h[1-6]$/i.test(tag) ? tag.toLowerCase() : 'h2';
      return '<' + lvl + '>' + text.trim() + '</' + lvl + '>';
    });
    /* div.ecp-heading visual headings (J8) -> h2 */
    h = h.replace(/<div\b([^>]*class="ecp-heading\b[^"]*\becp-heading-tag\b[^"]*"[^>]*)>\s*<span class="ecp-heading-text">([\s\S]*?)<\/span>\s*<\/div>/gi, (m, attrs, text) => {
      bump('divHeadingsPromoted');
      return '<h2>' + text.trim() + '</h2>';
    });
    /* empty team-list modules render nothing (B21) */
    h = h.replace(/<div class="ecp-posts-wrapper\b[^"]*ecp-posts-wrapper-team\b[^"]*"[^>]*>\s*<\/div>/gi, () => { bump('emptyTeamModules'); return ''; });

    return { html: h, trail, trailRaw, comps, postDate };
  }

  return { baseKey, localHref, mainRegion, sanitize, restoreAnchorTargets, splitSections, dedupeSections, finishSection, balanceFragment, blockKey, prepare, mapImage, dekeyMapEmbed, imgRole };
}
