/* ============================================================================
   build.mjs - Clifton Eye Center "Daylight Canopy" redesign builder (site-reforge, REFORGE lane)
   Node builtins only. Run from anywhere:  node src/build.mjs
   Output: dist/ (or $CEC_DIST). The output directory is PURE build output: wiped and rebuilt every
   run. Encoded images are cached in tmp/build-cache/ (content-hash keyed) so a rebuild re-encodes
   nothing and two builds produce identical bytes.

   Started from the friscoeyesource reference build (src/build.mjs) with every item of
   docs/PORT-NOTES.md sections 1-3 and docs/BUILD-DECISIONS.md applied; markup per docs/COMPONENTS.md.
   Reads (never edits): audit/raw/*.html, audit/content-inventory.json, audit/seo-inventory.json,
   audit/image-inventory.json, audit/image-classification.json, audit/site-inventory.json,
   audit/generated-images.json, src/content/{chrome,site-map,image-plan}.json.
   Rules: copy is never rewritten; one output page per source page at the same path; no platform
   markup survives; every real image is kept or its removal is declared; generated images are
   decorative (alt="") or declared stand-ins; every internal URL is page-relative.
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { esc, up, depthOf, ownPath, readJSON, walk, plain, decodeEntities } from './lib/util.mjs';
import { createContent, TOKEN_RE } from './lib/content.mjs';
import { parseGravityForm, renderForm, parseConditionalLogic } from './lib/forms.mjs';
import { MOVED, sourceRobots, mergeRobots, pageTitle, deriveDescription, canonicalSlugFor, jsonLd } from './lib/seo.mjs';
import { createImages } from './lib/images.mjs';

const PROJ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = (...a) => path.join(PROJ, ...a);
/* THEME (2026-09-29): the glass design ("Daylight Canopy") is the default and its paths are unchanged, so its output is
   byte-identical; CEC_THEME=neo builds the neoclassical exploration from src/themes/neo/ (templates, home, styles,
   scripts) and assets/fonts/neo/ into dist-neo/, through the SAME content, SEO, forms and image pipeline. */
const THEME = process.env.CEC_THEME || 'glass';
if (!/^[a-z][a-z0-9-]*$/.test(THEME)) throw new Error('CEC_THEME must be a simple name: ' + THEME);
const TH = THEME === 'glass'
  ? { styles: 'src/styles', scripts: 'src/scripts', templates: 'src/lib/templates.mjs', home: 'src/lib/home.mjs', fonts: 'assets/fonts/web', dist: 'dist' }
  : { styles: 'src/themes/' + THEME + '/styles', scripts: 'src/themes/' + THEME + '/scripts', templates: 'src/themes/' + THEME + '/templates.mjs', home: 'src/themes/' + THEME + '/home.mjs', fonts: 'assets/fonts/' + THEME, dist: 'dist-' + THEME };
const { createTemplates, icon, isoDate } = await import(pathToFileURL(P(TH.templates)).href);
const DIST = path.resolve(process.env.CEC_DIST || P(TH.dist));
const REPORTS = !process.env.CEC_DIST && THEME === 'glass';   /* audit/ reports are written only by the canonical (glass) build */
const chrome = readJSON(P('src/content/chrome.json'));
const siteMap = readJSON(P('src/content/site-map.json'));
const ORIGIN = chrome.origin;
const content = readJSON(P('audit/content-inventory.json'));
const seo = readJSON(P('audit/seo-inventory.json'));
const imgInv = readJSON(P('audit/image-inventory.json'));
const classification = readJSON(P('audit/image-classification.json'));
const genRec = readJSON(P('audit/generated-images.json'), { images: [] });
const plan = readJSON(P('src/content/image-plan.json'));
const seoBy = new Map(seo.pages.map((p) => [p.url, p]));

const failures = [];
const fail = (stage, target, reason) => failures.push({ stage, target, reason });
const stats = { figureRoles: {}, moved: new Map(), dead: new Map() };
const seoLog = { titles: [], canonicals: [], descriptions: 0, noindex: [], robotsChanges: [] };
const slots = [];            /* audit/image-slots.json: every generated image placement, by page */
const ledgerHits = {};       /* ledger id -> count of places the build applied it */
const hit = (id, n = 1) => { ledgerHits[id] = (ledgerHits[id] || 0) + n; };

/* ---------- 0. fresh output ---------- */
if (fs.existsSync(DIST)) fs.rmSync(DIST, { recursive: true, force: true });
for (const d of ['img', 'img/generated', 'fonts', 'styles', 'scripts', 'docs']) fs.mkdirSync(path.join(DIST, d), { recursive: true });
const images = createImages({ cacheDir: P('tmp/build-cache/img'), stats });
const genImages = createImages({ cacheDir: P('tmp/build-cache/generated'), stats });
const shipped = new Set();
function ship(rel) {   /* copy a cached web image into dist/img once; rel may start with generated/ */
  if (shipped.has(rel)) return;
  const src = rel.startsWith('generated/') ? P('tmp/build-cache/generated', rel.slice(10)) : P('tmp/build-cache/img', rel);
  fs.copyFileSync(src, path.join(DIST, 'img', rel));
  shipped.add(rel);
}
const imgUrl = (rel, depth) => { ship(rel); return up(depth) + 'img/' + rel; };

/* ---------- 1. image map: every real image kept, or its drop declared ---------- */
const OLD_VENDOR = /eyecarepro/i;
const PLATFORM_UI = /spinner\.svg|fas-fa-|chosen-sprite|gf-creditcards|\/arrow\.png|ribbon\.png|snowflake\d|new-(black|orange|blue)\.png|\/tag\.png|pattern-part2|review-quote/i;
/* Decided per image (docs/IMAGE-PLAN.md 2a, BUILD-DECISIONS #8), recorded in audit/clone-removals.json */
const DROP = [
  { re: /thanksgiving%20-%20basket%20slide\.jpg|thanksgiving - basket slide\.jpg/i, why: 'A holiday (event) picture on /october-is/ that 404s on the live site (the page already shows it broken). A generated stand-in would depict an event, so the <img> is removed (BUILD-DECISIONS #8, IMAGE-PLAN 2a).' },
];
const classByFile = new Map(classification.images.map((c) => [c.file, c.class]));
const fileOf = (src) => { try { return decodeURIComponent(String(src).split('/').pop().split('?')[0]); } catch { return String(src).split('/').pop().split('?')[0]; } };
/* A file-name alt ("dry eyes droplet 250x376.jpg", "clipart 010", an upload hash) describes nothing;
   it becomes "" (DESIGN-SPEC L12 extension). Readable alts, including those WordPress derived from a
   well-named file ("cataracts diagram", "Acuvue"), are kept verbatim. */
const garbageAlt = (alt, src) => {
  const a = String(alt || '').trim();
  if (!a) return false;
  if (/\.(jpe?g|png|gif|webp)\b/i.test(a) || /\b\d{2,4}\s*[x×]\s*\d{2,4}\b/i.test(a) || /^clipart\s*\d+$/i.test(a)) return true;
  if (/(^|\s)20[a-z]{3,}/i.test(a) && /%20/.test(src)) return true;                                      /* "daisy 20glasses" from daisy%20glasses */
  if (/[A-Za-z]\d[A-Za-z]|\d[A-Za-z]\d/.test(a) && /^\S{12,}(\s\S+)?$/.test(a)) return true;           /* upload hash */
  const base = fileOf(src).replace(/\.[a-z0-9]+$/i, '');
  if (!/\s/.test(a) && a === base && /[a-z][A-Z]{2}/.test(a)) return true;                            /* imgur id */
  return false;
};
const imageMap = new Map();
const byBase = new Map();          /* file name -> rec (row background photos use a different host) */
const invBySrc = [];
const notImages = [];
let kept = 0, vendorDropped = 0, uiDropped = 0, decidedDropped = 0, filled = 0, altBlanked = 0;
for (const im of imgInv.images || []) {
  const sig = (im.alts || []).join(' ') + ' ' + im.src;
  if (OLD_VENDOR.test(sig)) { imageMap.set(im.src, { drop: true }); vendorDropped++; continue; }
  if (PLATFORM_UI.test(im.src)) { imageMap.set(im.src, { drop: true }); uiDropped++; continue; }
  const decided = DROP.find((d) => d.re.test(im.src));
  if (decided) { imageMap.set(im.src, { drop: true, why: decided.why }); decidedDropped++; continue; }
  if (!im.localFile) continue;
  const cls = classByFile.get(im.localFile) || '';
  if (cls === 'platform-ui-drop') { imageMap.set(im.src, { drop: true }); uiDropped++; continue; }
  const abs = P(im.localFile);
  if (!fs.existsSync(abs)) {
    /* A file the harvest already recorded as not-an-image (UNRECOGNISED-FORMAT: an HTML soft-404 saved under an image
       URL) takes the same path whether it is on disk or quarantined out of assets/ (tmp/quarantine/: the soft-404
       carries the former agency's Maps key and must not ship in a handoff package). Anything else missing still fails. */
    if ((im.flags || []).includes('UNRECOGNISED-FORMAT')) { notImages.push(im.src); continue; }
    fail('build:asset', im.src, 'kept asset missing on disk: ' + im.localFile); continue;
  }
  const lossless = cls === 'functional-qr-code';
  const big = (im.intrinsicWidth || 0) >= 1000;
  const w = images.web(abs, { maxW: big ? 1600 : 1200, q: 80, name: fileOf(im.src).replace(/\.[a-z0-9]+$/i, ''), lossless });
  if (!w) { notImages.push(im.src); continue; }   /* an HTML soft-404 saved under an image URL: treated as missing */
  const srcAlt = (im.alts || []).find(Boolean) || '';
  const blank = garbageAlt(srcAlt, im.src);
  if (blank) altBlanked++;
  const rec = { file: w.rel, w: w.w, h: w.h, alt: blank ? '' : srcAlt, altOverride: blank ? '' : null, kind: 'source', cls, src: im.src };
  imageMap.set(im.src, rec);
  if (!byBase.has(fileOf(im.src))) byBase.set(fileOf(im.src), rec);
  invBySrc.push({ src: im.src, rec });
  kept++;
}
/* generated images: decorative layers + declared stand-ins; each carries the AI label (IPTC XMP) */
const genById = new Map();
for (const g of genRec.images || []) {
  const abs = P(g.file);
  if (!fs.existsSync(abs)) { fail('build:asset', g.file, 'generated file recorded but missing on disk'); continue; }
  const isCut = /^cut-/.test(g.id);
  const aiLabel = { tool: 'fal.ai ' + g.model + (g.cutout ? ' + ' + g.cutout.model : ''), description: (g.alt || g.id) + ' (AI-generated illustrative image, not a photograph of this practice)' };
  const w = genImages.web(abs, { maxW: isCut ? 1400 : /^scene-/.test(g.id) ? 2000 : 1400, q: isCut ? 82 : 78, name: g.id, aiLabel });
  if (!w) { fail('build:asset', g.file, 'generated file is not an image'); continue; }
  genById.set(g.id, { rel: 'generated/' + w.rel, w: w.w, h: w.h, alt: g.alt || '' });
}
/* Declared drops (audit/generated-images.json "dropped": the imagery agent's recorded decision that a
   planned image ships no file). Their slots stay empty BY DECISION: logged in audit/image-slots.json
   with the recorded reason, never a build failure and never a placeholder (DESIGN-SPEC 6.3 rule 3). */
const droppedGen = new Map((genRec.dropped || []).filter((d) => d && d.id && !genById.has(d.id)).map((d) => [d.id, d.reason || 'dropped by the imagery review']));
/* tex-frosted-glass (DESIGN-SPEC 6.4): a 6% frost layer inside the hero statement and the long sheets.
   CSS cannot fade one background layer, so the alpha is baked into a DERIVED copy: ffmpeg writes an RGBA
   PNG whose alpha is 6% over the top half and falls linearly to 0 at the bottom edge (a tall sheet shows
   no hard line where the non-tiling texture ends). Colour pixels are untouched. The copy is cached by the
   source hash + recipe (reproducible), encoded with lossless alpha, AI-labelled like every generated file,
   and exposed to the CSS as --tex-frost in the shipped tokens.css (section 4). */
const TEX_RECIPE = "scale=1200:-2:flags=lanczos,format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='255*0.06*min(1,2*(1-Y/H))'";
let texFrost = null;
{
  const g = (genRec.images || []).find((x) => x.id === 'tex-frosted-glass');
  const abs = g && P(g.file);
  if (g && fs.existsSync(abs)) {
    const key = crypto.createHash('sha1').update(fs.readFileSync(abs)).update('|' + TEX_RECIPE).digest('hex').slice(0, 10);
    const derivedDir = P('tmp/build-cache/derived');
    fs.mkdirSync(derivedDir, { recursive: true });
    const derived = path.join(derivedDir, 'tex-frosted-glass-a6.' + key + '.png');
    if (!fs.existsSync(derived)) {
      const r = spawnSync(process.env.FFMPEG || 'ffmpeg', ['-loglevel', 'error', '-y', '-i', abs, '-vf', TEX_RECIPE, '-frames:v', '1', derived], { encoding: 'utf8' });
      if (r.status !== 0 || !fs.existsSync(derived)) fail('build:asset', g.file, 'ffmpeg could not derive the 6% texture: ' + String(r.stderr || r.error || '').slice(0, 300));
    }
    if (fs.existsSync(derived)) {
      const aiLabel = { tool: 'fal.ai ' + g.model + ' (alpha reduced to 6% by the build)', description: 'Frosted glass texture (AI-generated illustrative image, not a photograph of this practice)' };
      const w = genImages.web(derived, { maxW: 1200, q: 72, name: 'tex-frosted-glass', aiLabel, alphaQ: 100 });
      if (w) texFrost = { rel: 'generated/' + w.rel, w: w.w, h: w.h };
      else fail('build:asset', derived, 'derived texture is not an image');
    }
  }
}
/* Trimmed cut-outs for the title band and the 404 sheet. The reviewed PNGs carry wide transparent
   margins (cut-eyeglasses 35% top/bottom, cut-sunglasses 38% bottom, cut-kids-glasses 33%, cut-lens-prism
   20%: tmp/orch/alphabox.mjs), so a box positioned to cross the band edge by 40-86px showed an object that
   stopped short of the edge. The build derives a copy cropped to the opaque bounding box (alpha > 24) plus
   a 2% pad: only fully transparent pixels are removed, no visible pixel changes. The hero cut-out and the
   olive sprig keep the original file (their CSS crops it: site.css .hero__cut, .sprig). Cached by source
   hash + recipe; AI-labelled like every generated file. */
const trimById = new Map();
function trimmedGen(id) {
  if (trimById.has(id)) return trimById.get(id);
  let out = null;
  const g = (genRec.images || []).find((x) => x.id === id);
  const abs = g && P(g.file);
  if (g && /\.png$/i.test(g.file) && fs.existsSync(abs)) {
    const key = crypto.createHash('sha1').update(fs.readFileSync(abs)).update('|trim-a24-pad2').digest('hex').slice(0, 10);
    const derivedDir = P('tmp/build-cache/derived');
    fs.mkdirSync(derivedDir, { recursive: true });
    const derived = path.join(derivedDir, id + '-trim.' + key + '.png');
    if (!fs.existsSync(derived)) {
      const probe = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', abs], { encoding: 'utf8' });
      const [w, h] = String(probe.stdout || '').trim().split(',').map(Number);
      const raw = spawnSync(process.env.FFMPEG || 'ffmpeg', ['-loglevel', 'error', '-i', abs, '-vf', 'format=rgba', '-f', 'rawvideo', '-'], { maxBuffer: 1 << 28 });
      if (!w || !h || raw.status !== 0 || raw.stdout.length !== w * h * 4) { fail('build:asset', g.file, 'could not read the cut-out alpha for trimming'); trimById.set(id, null); return null; }
      let x0 = w, y0 = h, x1 = -1, y1 = -1;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (raw.stdout[(y * w + x) * 4 + 3] > 24) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      const pw = Math.round(w * 0.02), ph = Math.round(h * 0.02);
      x0 = Math.max(0, x0 - pw); y0 = Math.max(0, y0 - ph); x1 = Math.min(w - 1, x1 + pw); y1 = Math.min(h - 1, y1 + ph);
      const cw = (x1 - x0 + 1) & ~1, ch = (y1 - y0 + 1) & ~1;
      const r = spawnSync(process.env.FFMPEG || 'ffmpeg', ['-loglevel', 'error', '-y', '-i', abs, '-vf', 'crop=' + cw + ':' + ch + ':' + x0 + ':' + y0, '-frames:v', '1', derived], { encoding: 'utf8' });
      if (r.status !== 0 || !fs.existsSync(derived)) { fail('build:asset', g.file, 'ffmpeg could not trim the cut-out: ' + String(r.stderr || '').slice(0, 200)); trimById.set(id, null); return null; }
    }
    const aiLabel = { tool: 'fal.ai ' + g.model + (g.cutout ? ' + ' + g.cutout.model : '') + ' (transparent margin trimmed by the build)', description: (g.alt || g.id) + ' (AI-generated illustrative image, not a photograph of this practice)' };
    const wv = genImages.web(derived, { maxW: 800, q: 82, name: id + '-trim', aiLabel });
    if (wv) out = { rel: 'generated/' + wv.rel, w: wv.w, h: wv.h, alt: g.alt || '' };
  }
  trimById.set(id, out);
  return out;
}
const planById = new Map(plan.images.map((i) => [i.id, i]));
for (const item of plan.images.filter((i) => i.fillFor)) {
  const g = genById.get(item.reuse || item.id);
  if (!g) { fail('build:asset', item.fillFor, 'planned stand-in not generated yet: ' + (item.reuse || item.id)); continue; }
  imageMap.set(item.fillFor, { file: g.rel, w: g.w, h: g.h, alt: item.alt || '', kind: 'generated', genId: item.id, cls: 'slot-fill' });
  filled++;
}
for (const src of notImages) if (!imageMap.has(src)) fail('build:asset', src, 'source file is not an image and no stand-in is planned');
/* ctx.gen: { url, w, h, alt } | null (COMPONENTS G.1) */
const genFor = (id, depth) => { const g = genById.get(id); return g ? { url: imgUrl(g.rel, depth), w: g.w, h: g.h, alt: (planById.get(id) || {}).alt || g.alt || '', rel: g.rel } : null; };
/* ctx.src: a SOURCE image whose original src matches (throws if absent) */
const srcFor = (pattern, depth) => {
  const re = pattern instanceof RegExp ? pattern : new RegExp(String(pattern).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const hitRec = invBySrc.find((x) => re.test(x.src));
  if (!hitRec) throw new Error('source image not found for ' + re);
  return { url: imgUrl(hitRec.rec.file, depth), w: hitRec.rec.w, h: hitRec.rec.h, alt: hitRec.rec.alt, rel: hitRec.rec.file };
};
const logoHit = invBySrc.find((x) => x.src.includes(chrome.logo.srcPattern));
if (!logoHit) throw new Error('logo not found in the image inventory: ' + chrome.logo.srcPattern);
const logoRec = { rel: logoHit.rec.file, w: logoHit.rec.w, h: logoHit.rec.h };
/* Header + footer logo WITHOUT a background or plate (operator 2026-09-29): transparent derivatives of the logo JPEG,
   made by tools/logo-alpha.mjs (inks unchanged; composited over white they reproduce the original, mean 0.33/255).
   The footer (dark glass) uses the reversed version: grey ink -> paper, greens unchanged. og:image and the JSON-LD
   logo keep logoRec, the original on white. */
function brandLogo(file, name) {
  const abs = P('assets/brand', file);
  if (!fs.existsSync(abs)) throw new Error('missing assets/brand/' + file + ' - run node tools/logo-alpha.mjs');
  const w = images.web(abs, { maxW: 600, q: 92, alphaQ: 100, name });
  if (!w) throw new Error('assets/brand/' + file + ' is not an image');
  return { rel: w.rel, w: w.w, h: w.h };
}
const logoHeader = brandLogo('logo-clifton.png', 'logo-clifton');
const logoFooter = brandLogo('logo-clifton-light.png', 'logo-clifton-light');

/* ---------- 2. helpers ---------- */
const willExist = new Set(content.pages.map((p) => ownPath(p.url, ORIGIN)).filter((v) => v !== null));
const PDFS = new Map([['new-pt-paperwork.pdf', 'new-pt-paperwork.pdf'], ['established-pt-paperwork.pdf', 'established-pt-paperwork.pdf']]);
const pdfFor = (href, depth) => {
  const name = fileOf(href);
  if (!/\.pdf$/i.test(name) || !PDFS.has(name) || !/cloudfront\.net|cliftoneyecenter\.com|^\//i.test(href)) return null;
  if (!fs.existsSync(P('assets/docs', name))) { fail('build:asset', href, 'harvested PDF missing: assets/docs/' + name); return null; }
  stats.pdfLinksLocalised = (stats.pdfLinksLocalised || 0) + 1;
  return up(depth) + 'docs/' + PDFS.get(name);
};
/* stylesheets every page links, decided once from what the design agent wrote: the task's order
   fonts, tokens, site, motion (+ brand.css, the COMPONENTS A.1 name, if it exists). tokens.css and
   motion.css are linked only when they carry their redesign layer (the marker; see section 4). */
const LAYERED = { 'tokens.css': /REDESIGN TOKENS/, 'motion.css': /@redesign-motion/ };
const LINKED_STYLES = ['tokens.css', 'brand.css', 'site.css', 'motion.css'].filter((f) => {
  const abs = P(TH.styles, f);
  if (!fs.existsSync(abs)) return f === 'site.css';   /* site.css is always linked; its absence is a build failure */
  return !LAYERED[f] || LAYERED[f].test(fs.readFileSync(abs, 'utf8'));
});
const C = createContent({ origin: ORIGIN, imageMap, willExist, moved: MOVED, fail, stats, imgUrl, mapQuery: chrome.mapQuery, pdfFor, garbageAlt });
const T = createTemplates({ chrome, localHref: C.localHref, imgUrl, logo: logoHeader, logoFooter });
const MAP_SRC = 'https://www.google.com/maps?q=' + encodeURIComponent(chrome.mapQuery) + '&output=embed';

/* family of every page (site-map.json templates partition all 349 pages) */
const familyOf = new Map();
for (const [fam, paths] of Object.entries(siteMap.templates)) for (const p of paths) familyOf.set(p, fam);
const pathOf = (url) => { const s = ownPath(url, ORIGIN); return s ? '/' + s + '/' : '/'; };
const artefacts = new Map((siteMap.artefacts || []).map((a) => [a.path, a]));

/* h1 as the band renders it (COMPONENTS C.2): the page's h1; builder pages their layout h1; the
   neutral UI labels of BUILD-DECISIONS #3; designer-frames its own <title> (L20) */
const H1_LABELS = { '/category/our-doctors/': 'Our Doctors' };
function h1For(page) {
  const p = pathOf(page.url);
  if (H1_LABELS[p]) return { text: H1_LABELS[p], why: 'BUILD-DECISIONS #3' };
  if (/^\/testimonial\//.test(p)) return { text: 'Testimonial', why: 'BUILD-DECISIONS #3' };
  const h = plain((page.h1 || [])[0] || '');
  if (h) return { text: h, why: '' };
  if (p === '/eyeglasses-contacts/eyeglasses/designer-frames/') return { text: plain(page.title), why: 'L20' };
  return { text: plain(page.title || ''), why: 'no source h1; the page <title>' };
}
const h1ByPath = new Map(content.pages.map((p) => [pathOf(p.url), h1For(p).text]));

/* childpages order per page, straight from the raw listing (rail order, COMPONENTS B.17) */
const rawOf = (page) => fs.readFileSync(P('audit/raw', page.savedAs), 'utf8');
const childOrder = new Map();
for (const page of content.pages) {
  const raw = rawOf(page);
  const m = raw.match(/<main\b[\s\S]*?<\/main>/i);
  if (!m) continue;
  const hrefs = [...m[0].matchAll(/<div class="ecp-childpages-link">\s*<a\b[^>]*href="([^"]+)"/g)].map((x) => {
    const own = ownPath(decodeEntities(x[1]), ORIGIN);
    return own === null ? null : '/' + own + '/';
  }).filter(Boolean);
  if (hrefs.length) childOrder.set(pathOf(page.url), hrefs);
}
const childrenOf = (parentPath) => {
  const kids = content.pages.map((p) => pathOf(p.url)).filter((p) => p !== parentPath && p.startsWith(parentPath) && p.slice(parentPath.length).replace(/\/$/, '').split('/').length === 1);
  const order = childOrder.get(parentPath) || [];
  return kids.sort((a, b) => {
    const ia = order.indexOf(a), ib = order.indexOf(b);
    if (ia !== -1 || ib !== -1) return (ia === -1 ? 1e6 : ia) - (ib === -1 ? 1e6 : ib);
    return 0;   /* content-inventory order (stable sort) */
  });
};

/* DESIGN-SPEC 6.3 exclusions: brand names from the brand/logo classes + the named ad brands */
const brandNames = new Set(['KAENON', 'IZOD', 'ALAN J', 'CONVERSE', 'Transitions', 'Chanel']);
for (const c of classification.images) {
  if (!/^(designer-frame-brand-logo|contact-lens-brand-logo|insurance-carrier-logo)$/.test(c.class)) continue;
  for (const a of c.alts || []) {
    const name = String(a).replace(/_logo$/i, '').replace(/^2000px Logo /i, '').replace(/_/g, ' ').trim();
    if (name.length >= 2 && !/^B L$/i.test(name)) brandNames.add(name);
  }
}
/* whole word, case-insensitive (DESIGN-SPEC 6.3); names of 3 characters or fewer ("OP", "ECO", "XXL")
   match only in the brand's own capitals, or "pre-op" / "post-op" would count as the OP brand */
const reEsc = (b) => b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const longBrands = [...brandNames].filter((b) => b.replace(/\s/g, '').length > 3);
const shortBrands = [...brandNames].filter((b) => b.replace(/\s/g, '').length <= 3);
const brandReLong = new RegExp('(^|[^a-z0-9])(' + longBrands.map(reEsc).join('|') + ')(?![a-z0-9])', 'i');
const brandReShort = new RegExp('(^|[^A-Za-z0-9])(' + shortBrands.map(reEsc).join('|') + ')(?![A-Za-z0-9])');
const brandRe = { exec: (t) => brandReLong.exec(t) || (shortBrands.length ? brandReShort.exec(t) : null) };
/* IMAGE-PLAN 3c: "never beside a frame-brand, contact-lens-brand or carrier name". On logo walls the
   name IS an image (Acuvue, VSP...), which the text test above cannot see: a brand/carrier logo or brand
   campaign image in the page's main region counts as a brand name on the page (integration decision,
   docs/BUILD-NOTES.md; it only ever removes generated images). */
const BRAND_IMG_CLASS = /^(designer-frame-brand-logo|contact-lens-brand-logo|insurance-carrier-logo|brand-campaign-image)$/;
const brandImgBases = new Set((imgInv.images || []).filter((im) => BRAND_IMG_CLASS.test(classByFile.get(im.localFile) || '')).map((im) => fileOf(im.src)));
const DOCTOR_RE = /Dr\. Clifton|Deana|Ask Dr\./;
/* the 13 your-eye-health section indexes (library pages with child pages; SITE-ARCHITECTURE 6) get
   cut-lens-prism (DESIGN-SPEC 6.3). They were missing from this table until the integration review, which
   left 13 planned slots silently empty. */
const libraryPages = (siteMap.templates['library-article'] || []).map((x) => (x.endsWith('/') ? x : x + '/'));
const LIB_INDEXES = new Set(libraryPages.filter((x) => libraryPages.some((q) => q !== x && q.startsWith(x) && q.slice(x.length).replace(/\/$/, '').split('/').length === 1)));
if (LIB_INDEXES.size !== 13) fail('build:plan', 'site-map.json', 'expected the 13 your-eye-health section indexes of SITE-ARCHITECTURE 6, found ' + LIB_INDEXES.size);
const CUTS = [
  [{ test: (x) => LIB_INDEXES.has(x) }, 'cut-lens-prism'],
  [/^\/eye-care-services\/eye-exams\/pediatric-eye-exams\/|^\/eyeglasses-contacts\/eyeglasses\/kids-optical\//, 'cut-kids-glasses'],
  [/^\/eye-care-services\/eye-exams\//, 'cut-phoropter'],
  [/^\/eye-care-services\/contact-lens-exams\/|^\/eyeglasses-contacts\/contact-lenses\/|^\/order-contacts-online\//, 'cut-contact-lens'],
  [/^\/eyeglasses-contacts\/eyeglasses\/sunglasses\//, 'cut-sunglasses'],
  [/^\/eyeglasses-contacts\/eyeglasses\/lens-treatments\//, 'cut-lens-prism'],
  [/^\/eyeglasses-contacts\/eyeglasses\/transitions-lenses\/|^\/eyeglasses-contacts\/eyeglasses\/designer-frames\/|^\/promotions\//, null],
  [/^\/eyeglasses-contacts\//, 'cut-eyeglasses'],
  [/^\/eye-care-services\/$|^\/eye-care-services\/eye-conditions\/|^\/eye-care-services\/management-of-ocular-diseases\/|^\/eye-care-services\/eye-emergencies-pinkred-eyes\/|^\/eye-care-services\/lasik-refractive-surgery-co-management\//, 'cut-lens-prism'],
];
const SVC = {
  '/eye-care-services/eye-exams/': 'svc-eye-exam',
  '/eye-care-services/contact-lens-exams/': 'svc-contact-lens',
  '/eyeglasses-contacts/contact-lenses/': 'svc-contact-lens',
  '/eye-care-services/eye-exams/pediatric-eye-exams/': 'svc-pediatric-exam',
  '/eyeglasses-contacts/eyeglasses/kids-optical/': 'svc-pediatric-exam',
  '/eye-care-services/eye-conditions/dry-eye-disease-and-treatment/': 'svc-dry-eye',
  '/eyeglasses-contacts/eyeglasses/': 'svc-eyewear-boutique',
};
/* Band photos whose subject is not centred get a crop focus (site.css .band__visual--{focus}); the file is never
   edited. Glasses-Contacts-hero (1600 x 463, /eyeglasses-contacts/ and /contact-lenses/): both faces sit at 20-54%
   of the width with a flat grey field on the right, and the centred crop put a face under the title glass (VIA-02).
   Glasses-hero-1 (1600 x 463, /eyeglasses-contacts/eyeglasses/) is the mirror case (QA r2 R2-VIA-04): the woman stands
   at 57-86% of the width beside a flat grey field on the left; centred, the frame cut her face at 390 and her hair
   at 1440. */
const BAND_FOCUS = { 'glasses-contacts-hero.jpg': 'left', 'glasses-hero-1.jpg': 'right' };
/* band variant + backdrop per family (COMPONENTS C.1, DESIGN-SPEC 6.2) */
const PHOTO_PAGES = new Set(['/eye-care-services/', '/eyeglasses-contacts/', '/eyeglasses-contacts/eyeglasses/', '/eyeglasses-contacts/contact-lenses/', '/eyeglasses-contacts/eyeglasses/designer-frames/', '/insurance/', '/hours-location/', '/our-eye-doctors/']);
function bandPlan(family, p) {
  if (PHOTO_PAGES.has(p)) return { variant: 'photo' };
  switch (family) {
    case 'service-hub': case 'service-detail': return { variant: 'scene', scene: 'scene-exam-room' };
    case 'eyewear-contacts': return { variant: 'scene', scene: 'scene-optical-boutique' };
    case 'insurance': case 'contact-forms': case 'blog-index': return { variant: 'scene', scene: 'scene-greenery-window' };
    default: return { variant: 'plain' };
  }
}

/* ---------- 3. pages ---------- */
function markProse(html, pageH1) {
  /* D.1: attribution line, link rows, table labels, embeds; strip internal data-* */
  html = html.replace(/<p>(\s*Special thanks to[\s\S]*?)<\/p>/gi, (m, inner) => { stats.attributions = (stats.attributions || 0) + 1; return '<p class="attribution">' + inner + '</p>'; });
  html = html.replace(/<p(?: class="toc-chips")?>((?:\s*<a\b[^>]*>[\s\S]*?<\/a>\s*(?:\||&nbsp;|·|,)?\s*){2,})<\/p>/gi, (full, inner) => {
    if (inner.replace(/<a\b[^>]*>[\s\S]*?<\/a>/gi, '').replace(/&nbsp;|[\s|·,]/g, '')) return full;
    const hrefs = [...inner.matchAll(/href="([^"]*)"/g)].map((x) => x[1]);
    stats.linkRows = (stats.linkRows || 0) + 1;
    return '<p class="linkrow' + (hrefs.length && hrefs.every((h) => h.startsWith('#')) ? ' linkrow--toc' : '') + '">' + inner.trim() + '</p>';
  });
  html = html.replace(/<iframe\b([^>]*)><\/iframe>/gi, (m, attrs) => {
    const src = (/src="([^"]*)"/.exec(attrs) || [])[1] || '';
    const cls = /youtube|youtu\.be/.test(src) ? 'embed embed--video' : /google\.com\/maps/.test(src) ? 'embed embed--map' : 'embed';
    return '<div class="' + cls + '"><iframe' + attrs + '></iframe></div>';
  });
  html = html.replace(/\s(?:data-generated|data-class)="[^"]*"/g, '');
  return html;
}
function labelTables(html, sectionHeading, pageH1) {
  let lastHeading = sectionHeading ? plain(sectionHeading) : '';
  return html.replace(/<h[2-6][^>]*>([\s\S]*?)<\/h[2-6]>|<div class="table-scroll" tabindex="0" role="region" aria-label="Table">/gi, (m, h) => {
    if (h !== undefined) { lastHeading = plain(h); return m; }
    return '<div class="table-scroll" role="region" tabindex="0" aria-label="' + esc(lastHeading || pageH1) + '">';
  });
}

/* fig--photo alternates fig--start / fig--end in document order per page (COMPONENTS D.3) */
function alternatePhotos(html, counter) {
  return html.replace(/<figure class="fig fig--photo">/g, () => '<figure class="fig fig--photo ' + (counter.n++ % 2 === 0 ? 'fig--start' : 'fig--end') + '">');
}

function renderComp(comp, ctx) {
  const { depth, family, p } = ctx;
  const d = comp.data;
  switch (comp.kind) {
    case 'form':
      hit('L23');
      /* the sheet is not named: the <form> inside carries aria-labelledby="page-title" (PORT-NOTES F-3) and the band
         region is also named by the h1, so a named sheet made a third landmark with the same name (RA-07) */
      return '<section class="sheet sheet--form glass glass--light">\n' + renderForm(d, { localHref: (h) => C.localHref(h, depth), icon, notice: chrome.notice, phone: chrome.phone, conditional: d.conditional }) + '\n</section>';
    case 'testimonials': {
      const card = (c) => T.reviewCard(c, c.html.replace(/<p\b[^>]*>/gi, '<p>').trim() || '<p>' + esc(c.text) + '</p>');
      if (/^\/testimonial\//.test(p)) return '<section class="sheet glass glass--light is-flat" data-reveal="up">\n' + d.map(card).join('\n') + '\n</section>';
      return '<ul class="rev-grid" data-stagger>\n' + d.map((c) => '<li data-reveal="up">' + card(c) + '</li>').join('\n') + '\n</ul>';
    }
    case 'posts':
      return T.postCards(depth, d);
    case 'childpages': {
      const items = d.items.map((it) => {
        let thumb = null;
        if (it.thumb) {
          const rec = C.mapImage(it.thumb.src, ORIGIN + p);
          if (rec && !rec.drop) thumb = { url: imgUrl(rec.file, depth), w: rec.w, h: rec.h };
          else fail('build:img', it.thumb.src, 'child-page thumbnail has no image mapping');
        }
        return { title: it.title, href: it.href, summary: it.summary, thumb };
      });
      if (d.items.some((i) => i.thumb)) hit('L12');
      return T.indexCards(depth, items);
    }
    case 'badges':
      return T.dock(depth, 'row', d);
    case 'buttons':
      return T.ctaBand(depth, d);
    case 'button':
      return T.ctaBand(depth, [d]);
    case 'hours':
      return '<div class="sheet glass glass--light is-flat">' + T.hours(d) + '</div>';
    case 'visit': {
      let out = T.visit(depth, d);
      if (d.payment) {
        const icons = d.payment.icons.map((i) => { const rec = C.mapImage(i.src, ORIGIN + p); return rec && !rec.drop ? { url: imgUrl(rec.file, depth), w: rec.w, h: rec.h, alt: i.alt } : null; }).filter(Boolean);
        out += '\n' + T.accordion(d.payment.summary, (d.payment.weAccept ? '<p>' + esc(d.payment.weAccept) + '</p>' : '') + T.payRow(icons), false);
      }
      return out;
    }
    case 'team': {
      let photo = null;
      if (d.img) { const rec = C.mapImage(d.img.src, ORIGIN + p); if (rec && !rec.drop) photo = { url: imgUrl(rec.file, depth), w: rec.w, h: rec.h, alt: d.img.alt }; }
      return T.teamCard(depth, { photo, name: d.name, href: d.href, more: d.more });
    }
    case 'raw':
      return d;
    case 'docs':
      return T.docCards(d.map((x) => ({ href: pdfFor(x.rawHref, depth) || C.localHref(x.rawHref, depth) || '', label: x.label, after: x.after })).filter((x) => x.href));
    default:
      fail('build:component', p, 'unknown component kind ' + comp.kind);
      return '';
  }
}

/* Group adjacent button tokens into one CTA group; turn a PDF-only paragraph into doc cards */
function groupButtons(html, comps) {
  return html.replace(new RegExp('(?:<p>\\s*' + String.fromCharCode(2) + 'C(\\d+)' + String.fromCharCode(2) + '\\s*<\\/p>\\s*){2,}', 'g'), (run) => {
    const ids = [...run.matchAll(TOKEN_RE)].map((m) => Number(m[1]));
    TOKEN_RE.lastIndex = 0;
    if (!ids.every((i) => comps[i].kind === 'button')) return run;
    comps.push({ kind: 'buttons', data: ids.map((i) => comps[i].data) });
    return '<p>' + String.fromCharCode(2) + 'C' + (comps.length - 1) + String.fromCharCode(2) + '</p>';
  });
}

const canonicalBySlug = new Map();
const pageRecords = [];
let built = 0;
let homeModule = null, homeError = null;
try { homeModule = await import(pathToFileURL(P(TH.home)).href); if (typeof homeModule.buildHome !== 'function') throw new Error('home.mjs does not export buildHome'); }
catch (e) { homeError = e; homeModule = null; }

function buildPage(page, opts = {}) {
  const s = seoBy.get(page.url) || {};
  const depth = opts.depth !== undefined ? opts.depth : depthOf(page.url);
  const slug = ownPath(page.url, ORIGIN);
  const p = pathOf(page.url);
  const family = familyOf.get(p.replace(/\/$/, '') || '/') || familyOf.get(p) || 'page';
  const raw = rawOf(page);
  const isHome = slug === '' && !opts.as404;
  const h1 = h1For(page);
  if (h1.why) (stats.h1Labels = stats.h1Labels || []).push(p + ' -> "' + h1.text + '" (' + h1.why + ')');
  const pageFails = [];

  /* ---- content ---- */
  const region = C.mainRegion(raw);
  const composeVisit = p === '/hours-location/' || /^\/location\//.test(p);
  const prep = C.prepare(region.html, { parseForm: parseGravityForm, composeVisit, docCards: p === '/contact-us/patient-forms/', composeTeam: p === '/our-eye-doctors/' });
  /* CS-04: the form's show-if rules come from the RAW page (the parser reads the script-stripped main, F-2) */
  for (const c of prep.comps) {
    if (c.kind !== 'form' || !c.data) continue;
    const cl = parseConditionalLogic(raw, c.data.id);
    c.data.conditional = cl.rules;
    stats.formShowIfRules = (stats.formShowIfRules || 0) + Object.keys(cl.rules).length;
    for (const u of cl.unsupported) fail('build:form', p, 'source conditional logic not carried: ' + u);
  }
  let clean = C.sanitize(prep.html, depth, page.url);
  clean = clean.replace(/<(h[1-6])(?:\s[^>]*)?>((?:\s|<img\b[^>]*>|<br>|<a\b[^>]*>|<\/a>)*)<\/\1>/gi, (m, tag, inner) => {
    if (!/<img\b/i.test(inner) || inner.replace(/<[^>]+>/g, '').trim()) return m;
    stats.imageHeadingsUnwrapped = (stats.imageHeadingsUnwrapped || 0) + 1;
    return '<p>' + inner.trim() + '</p>';
  });
  const hKey = (x) => plain(x).toLowerCase().replace(/[‘’']/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  clean = clean.replace(/<h1(?:\s[^>]*)?>([\s\S]*?)<\/h1>/i, (m, inner) => {
    if (hKey(inner) === hKey(h1.text)) { stats.titleH1Removed = (stats.titleH1Removed || 0) + 1; return ''; }
    (stats.firstH1Kept = stats.firstH1Kept || []).push(p + ' | ' + plain(inner).slice(0, 60) + ' | band h1: ' + h1.text.slice(0, 40));
    return m;
  });
  clean = clean.replace(/<h1(\s[^>]*)?>([\s\S]*?)<\/h1>/gi, '<h2$1>$2</h2>');
  /* /category/our-doctors/: the band carries the BUILD-DECISIONS #3 label, so the source h1 "Nothing Found" stays as the content heading */
  if (h1.why === 'BUILD-DECISIONS #3' && plain((page.h1 || [])[0] || '') && plain(page.h1[0]) !== h1.text) clean = '<h2>' + esc(plain(page.h1[0])) + '</h2>' + clean;
  clean = C.restoreAnchorTargets(clean, raw);
  clean = groupButtons(clean, prep.comps);
  const sections = C.dedupeSections(C.splitSections(clean));

  /* generated-image eligibility for this page (DESIGN-SPEC 6.3 exclusions) */
  const mainText = plain(region.html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' '));
  const brandHit = brandRe.exec(mainText);
  const doctorHit = DOCTOR_RE.exec(mainText);
  const logoHit = [...region.html.matchAll(/\s(?:src|data-src|data-lazy-src)="([^"]+)"/g)].map((m) => fileOf(decodeEntities(m[1]))).find((b) => brandImgBases.has(b)) || null;
  const genAllowed = !brandHit && !doctorHit && !logoHit;
  const genNote = brandHit ? 'brand name "' + brandHit[2] + '" in main text' : doctorHit ? '"' + doctorHit[0] + '" in main text' : logoHit ? 'brand logo image "' + logoHit + '" in the main region (IMAGE-PLAN 3c)' : '';
  const useGen = (id, slot, opts = {}) => {
    if (!id) return null;
    if (!genAllowed) { slots.push({ page: p, slot, image: id, rendered: false, why: 'excluded: ' + genNote }); return null; }
    const g = genFor(id, depth);
    if (!g && droppedGen.has(id)) { slots.push({ page: p, slot, image: id, rendered: false, why: 'declared drop (audit/generated-images.json): ' + droppedGen.get(id) }); stats.droppedSlots = (stats.droppedSlots || 0) + 1; return null; }
    if (!g) { fail('build:generated', p, slot + ' planned image not generated yet: ' + id); slots.push({ page: p, slot, image: id, rendered: false, why: 'file missing' }); return null; }
    if (opts.trim) {
      const t = trimmedGen(id);
      if (t) {
        slots.push({ page: p, slot, image: id, rendered: true, file: 'trimmed copy' });
        hit('L18');
        /* wide = a flat object (eyeglasses 3.1:1, kids 3.0:1, sunglasses 2.4:1): site.css .band__cut--wide */
        return { url: imgUrl(t.rel, depth), w: t.w, h: t.h, alt: g.alt, wide: t.w / t.h >= 2 };
      }
    }
    slots.push({ page: p, slot, image: id, rendered: true });
    hit('L18');
    return g;
  };

  /* ---- render sections: prose in sheets, composed components between sheets (COMPONENTS C.4) ---- */
  const photoCounter = { n: 0 };
  let sheetN = 0, revealN = 0;
  const bodyParts = [];
  const svcId = SVC[p];
  let svcFig = '';
  if (svcId && !isHome) {
    const g = useGen(svcId, 'svc feature');
    if (g) svcFig = '<figure class="fig fig--photo fig--feature fig--start"><span class="fig__media"><img src="' + esc(g.url) + '" alt="' + esc(g.alt) + '" width="' + g.w + '" height="' + g.h + '" loading="lazy" decoding="async"></span></figure>';
    if (g) photoCounter.n++;
  }
  /* COMPONENTS C.4: sheets carry no accessible name (a named section is a region landmark; 10+ per
     article is noise), and an h2 keeps an id only when an in-page link targets it (the source's own ids,
     restored by C.restoreAnchorTargets). */
  const headId = (headingAttrs) => { const idm = /\sid="([^"]+)"/.exec(headingAttrs || ''); return idm ? ' id="' + esc(idm[1]) + '"' : ''; };
  const sheet = (headingHtml, headingAttrs, body) => {
    sheetN++;
    const h2 = headingHtml ? '<h2' + headId(headingAttrs) + '>' + headingHtml + '</h2>' : '';
    const reveal = revealN++ < 12 ? ' data-reveal="up"' : '';
    let prose = h2 + body;
    if (svcFig && sheetN === 1) { prose = (h2 ? h2 + svcFig + body : svcFig + body); svcFig = ''; }
    return '<section class="sheet glass glass--light is-flat"' + reveal + '>\n<div class="prose">\n' + prose + '\n</div>\n</section>';
  };
  /* a section whose only prose is its heading (a composed component follows: logo grid, dock row,
     index cards) gets the interior composed-section heading h2.section-title (COMPONENTS B, "interior
     composed sections use the plain left-aligned h2.section-title"), not a sheet holding only a heading */
  const sectionTitle = (headingHtml, headingAttrs) => { stats.sectionTitles = (stats.sectionTitles || 0) + 1; return '<h2 class="section-title"' + headId(headingAttrs) + '>' + headingHtml + '</h2>'; };
  /* VIA-04 (item 23 extended): a prose chunk that holds ONLY headings (plus a source <hr> rule) before a composed
     component was still a sheet: "<hr><h3>Our Contact Lens Services:</h3>" before the index cards, and the
     designer-frames runs "SEE BETTER / DESIGNER EYEWEAR / LIVE BETTER" and "O U R . F U L L ... / DESIGNER
     EYEWEAR IN Bossier City" before the dock row and the logo wall. It renders as the plain section title: one
     heading keeps its source level with class section-title; a run is div.section-head (first heading
     .section-title, the rest .section-title--sub), every heading at its source level, in source order. The rule
     is dropped (a thematic break above a title, no text). */
  const HEADS_RE = /<(h[2-6])((?:\s[^>]*)?)>([\s\S]*?)<\/\1>/gi;
  const headingsOnly = (chunk) => {
    if (!/<h[2-6]\b/i.test(chunk)) return null;
    const bare = chunk.replace(HEADS_RE, '').replace(/<hr\s*\/?>/gi, '');
    if (bare.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, '').trim() || /<(img|iframe|table|figure|ul|ol|dl|blockquote)\b/i.test(bare)) return null;
    return [...chunk.matchAll(HEADS_RE)].map((m) => ({ tag: m[1].toLowerCase(), attrs: m[2] || '', html: m[3] }));
  };
  const sectionHead = (heads, hadRule) => {
    stats.sectionTitles = (stats.sectionTitles || 0) + 1;
    if (hadRule) stats.headingRunRulesDropped = (stats.headingRunRulesDropped || 0) + 1;
    const el = (x, cls) => '<' + x.tag + ' class="' + cls + '"' + headId(x.attrs) + '>' + x.html + '</' + x.tag + '>';
    if (heads.length === 1) return el(heads[0], 'section-title');
    stats.sectionHeads = (stats.sectionHeads || 0) + 1;
    return '<div class="section-head">\n' + heads.map((x, i) => el(x, i ? 'section-title--sub' : 'section-title')).join('\n') + '\n</div>';
  };
  for (const sec of sections) {
    let body = C.finishSection(sec.body || '');
    body = alternatePhotos(body, photoCounter);
    body = labelTables(markProse(body, h1.text), sec.heading, h1.text);
    /* logo walls are composed content between sheets, never inside .prose (COMPONENTS C.4, B.21) */
    body = body.replace(/<ul class="logo-grid"[^>]*>[\s\S]*?<\/ul>/g, (ul) => { prep.comps.push({ kind: 'raw', data: ul }); return String.fromCharCode(2) + 'C' + (prep.comps.length - 1) + String.fromCharCode(2); });
    /* split the body at component tokens */
    const pieces = body.split(new RegExp('(?:<p>\\s*)?' + String.fromCharCode(2) + 'C(\\d+)' + String.fromCharCode(2) + '(?:\\s*<\\/p>)?'));
    let headingUsed = false;
    for (let i = 0; i < pieces.length; i++) {
      if (i % 2 === 1) { const comp = prep.comps[Number(pieces[i])]; bodyParts.push(renderComp(comp, { depth, family, p })); continue; }
      const chunk = C.balanceFragment(pieces[i]).trim();
      const hasText = chunk.replace(/<[^>]+>/g, '').trim() || /<(img|iframe|table)\b/i.test(chunk);
      if (!hasText && (headingUsed || !sec.heading)) continue;
      if (!hasText) { bodyParts.push(sectionTitle(sec.heading, sec.attrs)); headingUsed = true; continue; }
      const heads = headingsOnly(chunk);
      if (heads) {
        const all = (!headingUsed && sec.heading ? [{ tag: 'h2', attrs: sec.attrs, html: sec.heading }] : []).concat(heads);
        bodyParts.push(sectionHead(all, /<hr\b/i.test(chunk)));
        headingUsed = true;
        continue;
      }
      bodyParts.push(sheet(headingUsed ? '' : sec.heading, headingUsed ? '' : sec.attrs, chunk));
      headingUsed = true;
    }
    if (!headingUsed && sec.heading) bodyParts.push(sectionTitle(sec.heading, sec.attrs));
  }
  if (svcFig) bodyParts.unshift(sheet('', '', svcFig));
  /* QA r2 VIB-R2-04: a prose chunk holding only pictures (the source's right-floated post picture in a <p> right before
     the first <h2>, or the svc feature photo above a source lead photo) became a glass sheet of its own, cut off from
     the text it stood beside: 22 sheets site-wide, a 300px plate alone in an 868px sheet. The picture joins the sheet
     that follows it (at its start, before its heading: source order, and a plate floats beside that text from 900px);
     if the next part is not a sheet (a component follows), it joins the sheet before it; with neither (only on
     /template/header/: a logo after a CTA band), the picture stands in the column on its own, without a sheet (a plate
     or photo carries its own paper frame and shadow). */
  const PROSE_SHEET = /^(<section class="sheet glass glass--light is-flat"(?: data-reveal="up")?>\n<div class="prose">\n)([\s\S]*)(\n<\/div>\n<\/section>)$/;
  const picturesOnly = (inner) => /<figure\b/i.test(inner) && !inner.replace(/<figure\b[\s\S]*?<\/figure>/gi, '').replace(/<[^>]+>/g, '').replace(/&nbsp;|\s/g, '');
  for (let i = 0; i < bodyParts.length; i++) {
    const m = PROSE_SHEET.exec(bodyParts[i]);
    if (!m || !picturesOnly(m[2])) continue;
    const next = PROSE_SHEET.exec(bodyParts[i + 1] || ''), prev = i > 0 ? PROSE_SHEET.exec(bodyParts[i - 1]) : null;
    if (next) bodyParts[i + 1] = next[1] + m[2] + next[2] + next[3];
    else if (prev) bodyParts[i - 1] = prev[1] + prev[2] + m[2] + prev[3];
    else { bodyParts[i] = m[2].trim(); stats.pictureSheetsUnwrapped = (stats.pictureSheetsUnwrapped || 0) + 1; continue; }
    bodyParts.splice(i, 1); i--;
    stats.pictureSheetsMerged = (stats.pictureSheetsMerged || 0) + 1;
  }

  /* CS-06: a source ROW background photo that the title band does not use (the band takes the first non-mobile
     background and the mobile variant) is a kept image too (image-inventory KEEP). It renders, as-is and never
     cropped, as a figure at the top of the section its source row held, found by that row's first heading
     (/designer-frames/: Frames-Chanel-Pink-sm behind "#TELLITLIKEITIS"). A brand-campaign file gets fig--brand
     (IMAGE-PLAN: keep exactly as-is), anything else fig--photo; alt="" (it was a background). The build fails if
     the row's heading is not found on the rebuilt page, so the image can never go silently missing again. */
  if (PHOTO_PAGES.has(p)) {
    const rowBgs = [...raw.matchAll(/data-background-image-src=["']([^"']+)["']/g)].map((m) => ({ file: fileOf(decodeEntities(m[1])), at: m.index }));
    const bandMain = rowBgs.find((b) => !/mobile/i.test(b.file)), bandMob = rowBgs.find((b) => /mobile/i.test(b.file));
    for (const bg of rowBgs.filter((b) => b !== bandMain && b !== bandMob)) {
      const rec = byBase.get(bg.file);
      if (!rec) { fail('build:asset', p, 'row background photo not in the image map: ' + bg.file); continue; }
      const after = raw.slice(bg.at, bg.at + 20000).replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' ');
      const hm = /<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>|<span class="ecp-heading-text">([\s\S]*?)<\/span>/i.exec(after);
      const rowHeading = hm ? plain(hm[2] !== undefined ? hm[2] : hm[3]) : '';
      const role = rec.cls === 'brand-campaign-image' ? 'brand' : 'photo';
      const fig = '<figure class="fig fig--' + role + '"><span class="fig__media"><img src="' + esc(imgUrl(rec.file, depth)) + '" alt="" width="' + rec.w + '" height="' + rec.h + '" loading="lazy" decoding="async"></span></figure>';
      const at = rowHeading ? bodyParts.findIndex((part) => { const h = /<(h[2-6])\b[^>]*>([\s\S]*?)<\/\1>/i.exec(part); return h && plain(h[2]) === rowHeading; }) : -1;
      if (at < 0) { fail('build:asset', p, 'row background photo ' + bg.file + ': its source row heading "' + rowHeading + '" is not on the rebuilt page'); continue; }
      bodyParts[at] = bodyParts[at].replace(/(<(h[2-6])\b[^>]*>[\s\S]*?<\/\2>)/i, '$1' + fig);
      (stats.rowPhotosPlaced = stats.rowPhotosPlaced || []).push(p + ': ' + bg.file + ' in "' + rowHeading + '"');
    }
  }

  let bodyHtml = bodyParts.join('\n');
  /* any token that was not at a paragraph boundary (inside a list item etc.) */
  bodyHtml = bodyHtml.replace(TOKEN_RE, (m, n) => renderComp(prep.comps[Number(n)], { depth, family, p }));
  TOKEN_RE.lastIndex = 0;
  /* VIA-05: a heading set in letter-spaced capitals ("O U R . F U L L . E Y E W E A R . C O L L E C T I O N", the
     source's own spacing) broke inside a word at 390 ("E Y E W" / "E A R"): every letter space is a break
     opportunity. Each spaced word (with its trailing " .") is kept whole in span.nobr; the text is unchanged and
     lines break only between the dot-separated words. */
  bodyHtml = bodyHtml.replace(/<(h[1-6])(\s[^>]*)?>([\s\S]*?)<\/\1>/gi, (m, tag, attrs, inner) => {
    const out = inner.replace(/(^|>)([^<]+)/g, (mm, pre, text) => pre + text.replace(/(?<![A-Za-z0-9] ?)(?:[A-Z0-9] ){2,}[A-Z0-9](?: \.)?(?![A-Za-z0-9])/g, (run) => { stats.spacedCapsKeptWhole = (stats.spacedCapsKeptWhole || 0) + 1; return '<span class="nobr">' + run + '</span>'; }));
    return out === inner ? m : '<' + tag + (attrs || '') + '>' + out + '</' + tag + '>';
  });

  /* ---- band ---- */
  const bp = bandPlan(family, p);
  let bandHtml = '', lcp = null;
  const trail = (prep.trail || []).map((seg) => ({ text: seg.text, href: seg.href }));
  if (!isHome) {
    /* RA-07: on a form page the <form> is named by the h1 (PORT-NOTES F-3), so the band is not also a region named by
       it (two landmarks with one name); every other band keeps aria-labelledby="page-title" (COMPONENTS C.2) */
    const bandArgs = { depth, variant: bp.variant, trail: trail.length ? trail : null, h1: h1.text, date: family === 'blog-post' ? prep.postDate : null, named: !prep.comps.some((c) => c.kind === 'form') };
    if (bp.variant === 'scene') bandArgs.scene = useGen(bp.scene, 'band scene');
    if (bp.variant === 'photo') {
      const bgs = [...raw.matchAll(/data-background-image-src=["']([^"']+)["']/g)].map((m) => fileOf(decodeEntities(m[1])));
      const main = bgs.find((b) => !/mobile/i.test(b));
      const mob = bgs.find((b) => /mobile/i.test(b));
      const recMain = main && byBase.get(main);
      if (!recMain) { fail('build:asset', p, 'band photo not found for ' + main); bandArgs.variant = 'plain'; }
      else {
        bandArgs.photo = { url: imgUrl(recMain.file, depth), w: recMain.w, h: recMain.h };
        bandArgs.focus = BAND_FOCUS[main.toLowerCase()] || null;
        lcp = bandArgs.photo.url;
        const recMob = mob && byBase.get(mob);
        if (recMob) bandArgs.photoMobile = { url: imgUrl(recMob.file, depth), w: recMob.w, h: recMob.h };
        const unused = bgs.filter((b) => b !== main && b !== mob);
        if (unused.length) (stats.bandPhotosNotRendered = stats.bandPhotosNotRendered || []).push(p + ': ' + unused.join(', '));
      }
    }
    const cutRule = CUTS.find(([re]) => re.test(p));
    bandArgs.cut = cutRule && cutRule[1] ? useGen(cutRule[1], 'band cut-out', { trim: true }) : null;
    /* cut-contact-lens is a fingertip cut flat at its bottom and left edges (the image plan: "its flat bottom
       edge is anchored"): floating across the band edge it showed a severed finger (tmp/orch/shots2, 390 and
       1440). It rises from INSIDE the clipped stage instead, mirrored so both cut edges sit flush on the
       stage's bottom-right corner (templates.mjs band, site.css .band__cut--rise). */
    if (bandArgs.cut && cutRule[1] === 'cut-contact-lens') { bandArgs.cut.rise = true; stats.cutsRisingInStage = (stats.cutsRisingInStage || 0) + 1; }
    bandHtml = T.band(bandArgs);
  }

  /* ---- aside + rail ---- */
  const rawHasSidebar = /<div class="ecp-secondary\b/.test(raw);
  const hasAside = !isHome && rawHasSidebar && !['blog-index', 'platform-artefact'].includes(family) && !/^\/location\//.test(p) && !opts.as404;
  let railHtml = '';
  if (hasAside && ['library-article', 'eyewear-contacts', 'service-hub', 'service-detail'].includes(family)) {
    const parentPath = p.replace(/[^/]+\/$/, '');
    if (parentPath !== '/' && willExist.has(parentPath.replace(/^\/|\/$/g, ''))) {
      const sibs = childrenOf(parentPath);
      if (sibs.length >= 2) {
        railHtml = T.rail(depth, { path: parentPath, title: h1ByPath.get(parentPath) || parentPath }, sibs.map((sp) => ({ path: sp, title: h1ByPath.get(sp) || sp })), p);
        hit('L19');
      }
    }
  }

  /* ---- 404 variant (COMPONENTS F.7) ---- */
  let mainHtml;
  if (opts.as404 || p === '/404-page-not-found/') {
    const cut = useGen('cut-lens-prism', '404 sheet', { trim: true });
    const prose = bodyParts.map((b) => b.replace(/^<section class="sheet[^>]*>\n<div class="prose">\n|\n<\/div>\n<\/section>$/g, '')).join('\n');
    mainHtml = T.band({ depth, variant: 'plain', trail: opts.as404 ? null : (trail.length ? trail : null), h1: h1.text }) + '\n<div class="page-main">\n<section class="sheet sheet--404 glass glass--light is-flat">\n'
      + (cut ? '<img class="sheet__cut" src="' + esc(cut.url) + '" alt="" width="' + cut.w + '" height="' + cut.h + '" loading="lazy" decoding="async" data-depth="-0.05" data-depth-max="16">\n' : '')
      + '<div class="prose">\n' + prose + '\n</div>\n</section>\n</div>';
  } else if (isHome) {
    mainHtml = null;
  } else {
    mainHtml = [bandHtml, railHtml, '<div class="page-main" data-stagger>', bodyHtml || '', '</div>'].filter(Boolean).join('\n');
  }

  /* ---- home ---- */
  if (isHome) {
    let homeHtml = null;
    if (homeModule) {
      const ctx = {
        raw, depth: 0, esc, plain,
        localHref: (href, dp) => C.localHref(href, dp === undefined ? 0 : dp),
        src: (pattern) => srcFor(pattern, 0),
        gen: (id) => { const g = genFor(id, 0); if (g) { slots.push({ page: '/', slot: 'home', image: id, rendered: true }); hit('L18'); } return g; },
        /* chrome.json plus the HOME CONTRACT names: name, menus (site-map.json menus: primary,
           quickActions, footer...), social, and the keyless map URL the aside/visit blocks use */
        chrome: Object.assign({}, chrome, { name: chrome.brandName, menus: siteMap.menus, social: chrome.footer.social, mapSrc: MAP_SRC }),
        icon, fail, stats,
      };
      try { homeHtml = homeModule.buildHome(ctx); if (typeof homeHtml !== 'string' || !homeHtml.trim()) throw new Error('buildHome returned no HTML'); }
      catch (e) { fail('build:home', '/', 'home.mjs threw: ' + String((e && e.stack) || e).slice(0, 600)); homeHtml = null; }
    } else {
      fail('build:home', '/', 'home.mjs not loadable (' + String(homeError && homeError.message || homeError).slice(0, 300) + '); the home content is rendered through the generic content pipeline');
    }
    if (homeHtml === null) {
      /* stub: the home content through the generic pipeline */
      mainHtml = [T.band({ depth: 0, variant: 'plain', trail: null, h1: h1.text }), '<div class="page-main" data-stagger>', bodyHtml, '</div>'].join('\n');
      stats.homeStub = true;
    } else mainHtml = homeHtml;
    const hero = invBySrc.find((x) => /Girl-Smiling-Brown-Hair/.test(x.src));
    if (hero && homeHtml && homeHtml.includes(hero.rec.file)) lcp = up(0) + 'img/' + hero.rec.file;
  }

  /* ---- head ---- */
  const canonicalSlug = canonicalSlugFor(s, page, slug, willExist, ORIGIN, seoLog);
  canonicalBySlug.set(slug, canonicalSlug);
  const canonical = ORIGIN + '/' + (canonicalSlug ? canonicalSlug + '/' : '');
  const fallbackLabel = h1.why === 'BUILD-DECISIONS #3' ? h1.text + ' - ' + chrome.brandName : '';
  const title = pageTitle(s, page, h1.text, slug, seoLog, fallbackLabel);
  let description = (s.metaDescription || '').trim();
  /* CS-01: the home page gets NO derived description: the source home has none (and an empty og:description),
     and its opening blocks are hero fragments and a promo, not a sentence. Every other page without one derives
     it from ONE source block of its own prose (seo.mjs deriveDescription, CS-03), or omits it. */
  if (!description && !isHome) {
    description = deriveDescription(sections.map((x) => ({ body: String(x.body || '').replace(TOKEN_RE, ' ') })));
    TOKEN_RE.lastIndex = 0;
    if (description) seoLog.descriptions++;
    else seoLog.descriptionsOmitted = (seoLog.descriptionsOmitted || 0) + 1;
  }
  const rob = sourceRobots(raw);
  const art = artefacts.get(p);
  const extra = art && /noindex/.test(art.recommendation) && !rob.tokens.includes('noindex') ? ['noindex'] : [];
  if (extra.length) seoLog.robotsChanges.push({ page: p, from: mergeRobots(rob.tokens), to: mergeRobots(rob.tokens, extra), why: 'site-map.json artefact decision: ' + art.recommendation + ' (' + art.why.slice(0, 160) + ')' });
  const robots = opts.as404 ? 'noindex' : mergeRobots(rob.tokens, extra);
  const noindex = /noindex/.test(robots);
  if (noindex && !opts.as404) seoLog.noindex.push(p);
  /* og:image: the page's own source share image when it maps to a shipped local file (the 19 dead
     /clipart/ paths map to their CDN twin by file name); else the logo */
  const ogSrc = (s.openGraph && s.openGraph['og:image']) || '';
  const ogRec = (ogSrc && (imageMap.get(ogSrc) || byBase.get(fileOf(ogSrc)))) || null;
  const ogRel = ogRec && !ogRec.drop && ogRec.kind === 'source' ? ogRec.file : logoRec.rel;
  ship(ogRel);
  if (ogRec && ogRec.kind === 'source' && ogSrc && !imageMap.get(ogSrc)) stats.ogImagesMappedByName = (stats.ogImagesMappedByName || 0) + 1;
  const ogTitle = ((s.openGraph && s.openGraph['og:title']) || '').trim() || title;
  const trailAbs = trail.length >= 2 ? trail.map((seg, i) => {
    let abs = null;
    if (seg.href) { const own = ownPath(seg.href, ORIGIN); if (own !== null && (own === '' || willExist.has(own))) abs = ORIGIN + '/' + (own ? own + '/' : ''); }
    return { text: seg.text, abs: i === trail.length - 1 ? canonical : abs };
  }) : null;
  /* og:type and twitter:card follow the source page (CS-07, CS-08): og:type "article" on the 152 posts and
     "website" elsewhere; twitter:card "summary" on all 349 (seo-inventory). The fixed "website" /
     "summary_large_image" of the first build had no reason on record. */
  const ogType = ((s.openGraph && s.openGraph['og:type']) || '').trim() || 'website';
  const twitterCard = ((s.twitter && s.twitter['twitter:card']) || '').trim() || 'summary';
  /* QA r2 (content-seo F3): every source page carries twitter:title (345 non-empty), and on 74 it is the SEO <title>,
     not og:title; the rebuild dropped the tag, so X/Twitter fell back to og:title. It is emitted verbatim when the
     source has one, except where the page title was repaired and the source twitter:title is that same broken value
     (the archive pages titled after the first post they list): there the tag is omitted (og:title is the fallback). */
  const srcTwitterTitle = ((s.twitter && s.twitter['twitter:title']) || '').trim();
  const srcTitle = (s.title || page.title || '').trim();
  const twitterTitle = srcTwitterTitle && !(title !== srcTitle && srcTwitterTitle === srcTitle) ? srcTwitterTitle : '';
  if (twitterTitle) stats.twitterTitles = (stats.twitterTitles || 0) + 1;
  const headHtml = T.head({
    depth, title, description, robots, canonical, ogTitle, ogType, twitterCard, twitterTitle, ogImage: ORIGIN + '/img/' + ogRel, lang: s.lang || page.lang,
    jsonLd: jsonLd({ pageUrl: canonical, chrome, origin: ORIGIN, logoUrl: ORIGIN + '/img/' + logoRec.rel, trail: trailAbs }),
    lcp, favicon: FAVICON, styles: LINKED_STYLES,
  });
  const bodyClass = isHome ? 't-home' : opts.as404 || p === '/404-page-not-found/' ? 't-page t-platform-artefact t-404 is-solo' : 't-page t-' + family + ' ' + (hasAside ? 'has-aside' : 'is-solo');
  let html = T.page({ depth, curPath: opts.as404 ? '' : p, headHtml, bodyClass, mainHtml, asideHtml: hasAside ? T.aside(depth, MAP_SRC) : '', isHome });
  /* a phone number in running text never splits at its hyphens ("318-550-" / "5815": VIB-04's defect, seen in
     the home Welcome copy at 1440 once the measure came down to ~66 characters, VIA-01). Text nodes of <main>
     only; the characters are unchanged, the number is wrapped in span.nobr (buttons already carry one). */
  html = html.replace(/(<main\b[^>]*>)([\s\S]*?)(<\/main>)/, (m, open, inner, close) => {
    const parts = inner.split(/(<[^>]*>)/);   /* odd indexes are tags, even indexes text: attributes are never touched */
    for (let i = 0; i < parts.length; i += 2) {
      if (!/\d{3}-\d{3}-\d{4}/.test(parts[i]) || parts[i - 1] === '<span class="nobr">') continue;
      parts[i] = parts[i].replace(/(?<![\d-])\d{3}-\d{3}-\d{4}(?![\d-])/g, (n) => { stats.phoneNumbersKeptWhole = (stats.phoneNumbersKeptWhole || 0) + 1; return '<span class="nobr">' + n + '</span>'; });
    }
    return open + parts.join('') + close;
  });
  /* QA r2 R2-VIA-08: a heading line may not START with an em dash ("PLENTY OF CHOICE" / "—EYEGLASSES": the dash is a
     break opportunity before and after). In every heading of <main> (the band h1 included) the word before a dash
     and the dash stay together in span.nobr; the break after the dash stays. Characters are unchanged. */
  html = html.replace(/(<main\b[^>]*>)([\s\S]*?)(<\/main>)/, (m, open, inner, close) => open + inner.replace(/<(h[1-6])(\s[^>]*)?>([\s\S]*?)<\/\1>/gi, (hm, tag, attrs, hin) => {
    const parts = hin.split(/(<[^>]*>)/);
    let changed = false;
    for (let i = 0; i < parts.length; i += 2) {
      if (!/—|&mdash;|&#8212;|&#x2014;/i.test(parts[i]) || parts[i - 1] === '<span class="nobr">') continue;
      parts[i] = parts[i].replace(/([^\s<>]+? ?)(—|&mdash;|&#8212;|&#x2014;)/gi, (run) => { changed = true; stats.dashesKeptWithWord = (stats.dashesKeptWithWord || 0) + 1; return '<span class="nobr">' + run + '</span>'; });
    }
    return changed ? '<' + tag + (attrs || '') + '>' + parts.join('') + '</' + tag + '>' : hm;
  }) + close);
  /* VIB-01 (COMPONENTS F.7): a host serves dist/404.html at the failing request's own path, at ANY depth
     (/some-old-post/ keeps its URL), so a page-relative URL in that one file resolved under the missing path:
     no CSS, no fonts, broken images, and a "home page" link to /some-old-post/index.html. Every URL in 404.html
     is root-relative instead (/styles/site.css, /img/..., /); "x/index.html" becomes "/x/". The one exception
     to the page-relative rule: 404.html works at the site root at any depth, not from a subpath deploy. */
  if (opts.as404) {
    const rootRel = (v) => {
      if (!v || /^(?:[a-z][a-z0-9+.-]*:|#|\/)/i.test(v)) return v;
      const cut = v.indexOf('#'), pathPart = cut < 0 ? v : v.slice(0, cut), hash = cut < 0 ? '' : v.slice(cut);
      return ('/' + pathPart.replace(/^\.\//, '')).replace(/(^|\/)index\.html$/, '$1') + hash;
    };
    html = html.replace(/(\s(?:href|src|poster))="([^"]*)"/g, (m, a, v) => a + '="' + rootRel(v) + '"')
      .replace(/(\s(?:srcset|imagesrcset))="([^"]*)"/g, (m, a, v) => a + '="' + v.split(',').map((part) => { const t = part.trim().split(/\s+/); t[0] = rootRel(t[0]); return t.join(' '); }).join(', ') + '"');
    stats.notFoundRootRelative = (html.match(/\s(?:href|src|srcset)="\//g) || []).length;
  }
  const out = opts.as404 ? path.join(DIST, '404.html') : (slug ? path.join(DIST, slug, 'index.html') : path.join(DIST, 'index.html'));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
  /* slot-fills (generated stand-ins mapped in the image map) are logged from the page itself */
  for (const m of html.matchAll(/<img\b[^>]*src="[^"]*img\/generated\/([a-z0-9-]+)\.[0-9a-f]{10}\.webp"[^>]*>/g)) {
    const before = html.slice(Math.max(0, m.index - 120), m.index);
    if (/<span class="fig__media">$/.test(before) && !/fig--feature/.test(before)) { slots.push({ page: opts.as404 ? '/404.html' : p, slot: 'slot-fill (stand-in for a source image that 404s)', image: m[1], rendered: true }); hit('L18'); }
  }
  if (!opts.as404) {
    built++;
    pageRecords.push({ path: p, family, noindex, robots, title, h1: h1.text, hasAside, rail: !!railHtml, band: bp.variant, sections: sections.length, comps: prep.comps.map((c) => c.kind) });
  }
}

/* favicon (BUILD-DECISIONS #2: derived from the logo mark by the imagery agent into assets/brand/) */
const FAVICON = (() => {
  const icon32 = P('assets/brand/favicon-32.png'), icon180 = P('assets/brand/favicon-180.png'), icon192 = P('assets/brand/favicon-192.png');
  if (!fs.existsSync(icon32)) { fail('build:asset', 'assets/brand/favicon-32.png', 'favicon not supplied yet'); return null; }
  fs.copyFileSync(icon32, path.join(DIST, 'favicon-32.png'));
  const fav = { icon: 'favicon-32.png' };
  if (fs.existsSync(icon180)) { fs.copyFileSync(icon180, path.join(DIST, 'apple-touch-icon.png')); fav.touch = 'apple-touch-icon.png'; }
  /* 192px: the size Android/Chrome picks for a home-screen shortcut (the 512px master stays in assets/brand/) */
  if (fs.existsSync(icon192)) { fs.copyFileSync(icon192, path.join(DIST, 'favicon-192.png')); fav.icon192 = 'favicon-192.png'; }
  return fav;
})();

for (const page of content.pages) {
  try { buildPage(page); } catch (e) { fail('build:page', page.url, String((e && e.stack) || e).slice(0, 800)); }
}
/* image-plan usedFor names two hub placements that have no host in the rebuilt markup: they are
   declared here (audit/image-slots.json), so no planned slot is silently empty. */
slots.push({ page: '/eye-care-services/', slot: 'hub section image (image-plan usedFor: the "eye exams" section)', image: 'svc-eye-exam', rendered: false,
  why: 'not placed: the hub has no eye-exam prose section; its services are the 7 source index cards, each with its source thumbnail (the "Comprehensive Eye Exams" card already shows a phoropter), and a generated duplicate beside a source photo is redundant (DESIGN-SPEC 3.6 rationale). The image renders as the feature on /eye-care-services/eye-exams/.' });
slots.push({ page: '/eye-care-services/', slot: 'hub section image (image-plan usedFor: the "optical" section)', image: 'svc-eyewear-boutique', rendered: false,
  why: 'not placed: /eye-care-services/ has no optical section in the source (its 7 index cards are exams, contact lens exams, conditions, disease management, emergencies, LASIK co-management and Your Eye Health). The image renders as the stand-in on /eyeglasses-contacts/eyeglasses/eyeglass-basics/womens-eyeglass-frames/; its feature slot on /eyeglasses-contacts/eyeglasses/ is excluded by the DESIGN-SPEC 6.3 brand rule ("Transitions" in the main text).' });
slots.push({ page: '(site-wide)', slot: 'texture layer at 6%: the home hero statement and every interior .sheet.is-flat (DESIGN-SPEC 6.4)', image: 'tex-frosted-glass', rendered: !!texFrost, ...(texFrost ? {} : { why: 'derived texture unavailable (see build failures)' }) });
/* dist/404.html: the /404-page-not-found/ content at depth 0 (COMPONENTS F.7) */
{
  const p404 = content.pages.find((p) => pathOf(p.url) === '/404-page-not-found/');
  if (!p404) fail('build:page', '404.html', 'no /404-page-not-found/ page in the inventory');
  else { try { buildPage(p404, { as404: true, depth: 0 }); } catch (e) { fail('build:page', '404.html', String((e && e.stack) || e).slice(0, 800)); } }
}

/* ---------- 4. static assets ---------- */
for (const f of fs.readdirSync(P(TH.fonts)).sort()) {
  if (/\.(woff2|txt|css)$/i.test(f)) fs.copyFileSync(P(TH.fonts, f), path.join(DIST, 'fonts', f));
}
/* the design agent's src/styles/fonts.css (urls rewritten to ../fonts/<file>, valid from dist/fonts/
   too) supersedes the harvested one; it ships ONCE, at the linked {up}fonts/fonts.css (COMPONENTS A.1) */
if (fs.existsSync(P(TH.styles, 'fonts.css'))) fs.copyFileSync(P(TH.styles, 'fonts.css'), path.join(DIST, 'fonts', 'fonts.css'));
/* Stylesheets. src/styles/tokens.css and motion.css each hold the MEASURED SOURCE EVIDENCE (sr-tokens /
   sr-motion output, read by the gates, with wp-content URLs and ecp-/fl- selectors inside) followed,
   after a marker comment, by the redesign's own layer. dist/ ships only the redesign layer (from the
   marker comment on): the evidence is never used by the redesign (the files say so) and would put
   platform traces into the build. A file without its marker is still evidence only and is not shipped.
   The integrity check below fails the build if the shipped CSS references a custom property or a
   keyframe that only the stripped evidence defined. */
const shippedStyles = [];
for (const f of fs.existsSync(P(TH.styles)) ? fs.readdirSync(P(TH.styles)).sort() : []) {
  if (!/\.css$/.test(f) || f === 'fonts.css') continue;   /* fonts.css ships to dist/fonts/ above */
  let css = fs.readFileSync(P(TH.styles, f), 'utf8');
  if (LAYERED[f]) {
    const at = css.search(LAYERED[f]);
    if (at < 0) { (stats.evidenceOnlyStylesNotShipped = stats.evidenceOnlyStylesNotShipped || []).push(f); continue; }
    const start = css.lastIndexOf('/*', at);
    stats.stylesEvidenceStripped = (stats.stylesEvidenceStripped || []).concat(f + ' (' + start + ' of ' + css.length + ' chars)');
    css = '/* ' + f + ' - the redesign layer of ' + TH.styles + '/' + f + ' (the measured source evidence above its marker is not shipped; see docs/BUILD-NOTES.md) */\n' + css.slice(start);
  }
  /* the build-derived 6% texture (section 1): its content-hashed name is known only here */
  if (f === 'tokens.css' && texFrost) {
    ship(texFrost.rel);
    css += '\n/* set by src/build.mjs: tex-frosted-glass with its alpha baked to 6% (AI-generated, labelled in the file) */\n:root { --tex-frost: url("../img/' + texFrost.rel + '"); }\n';
    stats.texFrost = texFrost.rel;
  }
  fs.writeFileSync(path.join(DIST, 'styles', f), css);
  shippedStyles.push(f);
}
for (const f of LINKED_STYLES) if (!shippedStyles.includes(f)) fail('build:asset', 'styles/' + f, 'linked stylesheet not shipped');
if (!shippedStyles.includes('site.css')) fail('build:asset', 'src/styles/site.css', 'the design stylesheet is not written yet');
{
  const all = shippedStyles.map((f) => fs.readFileSync(path.join(DIST, 'styles', f), 'utf8')).join('\n').replace(/\/\*[\s\S]*?\*\//g, '');
  const defined = new Set([...all.matchAll(/(--[A-Za-z0-9_-]+)\s*:/g)].map((m) => m[1]));
  const used = new Set([...all.matchAll(/var\(\s*(--[A-Za-z0-9_-]+)\s*\)/g)].map((m) => m[1]));   /* var(--x, fallback) is safe by construction */
  const js = fs.existsSync(P(TH.scripts, 'site.js')) ? fs.readFileSync(P(TH.scripts, 'site.js'), 'utf8') : '';
  const setByJs = new Set([...js.matchAll(/['"`](--[A-Za-z0-9_-]+)['"`]/g)].map((m) => m[1]));
  const undefinedVars = [...used].filter((v) => !defined.has(v) && !setByJs.has(v));
  const frames = new Set([...all.matchAll(/@keyframes\s+([A-Za-z0-9_-]+)/g)].map((m) => m[1]));
  const anims = new Set();
  for (const m of all.matchAll(/animation(?:-name)?\s*:\s*([^;}]+)/g)) for (const tok of m[1].split(',').map((x) => x.trim().split(/\s+/)).flat()) if (/^[A-Za-z_][A-Za-z0-9_-]*$/.test(tok) && !/^(none|infinite|linear|ease|ease-in|ease-out|ease-in-out|alternate|reverse|normal|forwards|backwards|both|running|paused|step-start|step-end|alternate-reverse|initial|inherit|unset)$/.test(tok)) anims.add(tok);
  const missingFrames = [...anims].filter((a) => !frames.has(a) && !/^var$/.test(a));
  stats.cssCustomPropsUndefined = undefinedVars.length;
  stats.cssKeyframesMissing = missingFrames.length;
  for (const v of undefinedVars) fail('build:css', v, 'custom property used by the shipped CSS but defined nowhere in it (fallback values aside; set by site.js? not found)');
  for (const a of missingFrames) fail('build:css', a, 'animation name used by the shipped CSS with no @keyframes in it');
}
if (fs.existsSync(P(TH.scripts))) for (const f of fs.readdirSync(P(TH.scripts)).sort()) if (/\.js$/.test(f)) fs.copyFileSync(P(TH.scripts, f), path.join(DIST, 'scripts', f));
if (!fs.existsSync(path.join(DIST, 'scripts', 'site.js'))) fail('build:asset', 'src/scripts/site.js', 'script linked by every page is not written yet');
for (const f of PDFS.keys()) { if (fs.existsSync(P('assets/docs', f))) fs.copyFileSync(P('assets/docs', f), path.join(DIST, 'docs', f)); else fail('build:asset', 'assets/docs/' + f, 'harvested PDF missing'); }

/* ---------- 4b. ship only images something references ---------- */
{
  const refd = new Set();
  for (const rel of walk(DIST)) {
    if (!/\.(html|css|js)$/i.test(rel)) continue;
    const body = fs.readFileSync(path.join(DIST, rel), 'utf8');
    for (const m of body.matchAll(/img\/((?:generated\/)?[A-Za-z0-9._-]+\.(?:webp|png|jpe?g|gif|svg|ico))/g)) refd.add(m[1]);
  }
  let pruned = 0;
  for (const rel of walk(path.join(DIST, 'img'))) {
    if (!refd.has(rel)) { fs.unlinkSync(path.join(DIST, 'img', rel)); pruned++; }
  }
  stats.unreferencedImagesPruned = pruned;
  /* AI label audit: every shipped generated file must carry the trainedAlgorithmicMedia XMP */
  let labelled = 0, unlabelled = [];
  const genDir = path.join(DIST, 'img', 'generated');
  for (const f of fs.existsSync(genDir) ? fs.readdirSync(genDir) : []) {
    const b = fs.readFileSync(path.join(genDir, f));
    if (b.includes(Buffer.from('trainedAlgorithmicMedia'))) labelled++; else unlabelled.push(f);
  }
  stats.generatedShipped = labelled + unlabelled.length;
  stats.generatedLabelled = labelled;
  for (const f of unlabelled) fail('build:ai-label', 'img/generated/' + f, 'generated image shipped without the AI provenance label');
}

/* ---------- 5. sitemap + robots (indexable canonical pages only) ---------- */
const noindexSet = new Set(pageRecords.filter((r) => r.noindex).map((r) => r.path));
const sitemapUrls = pageRecords.filter((r) => !r.noindex)
  .map((r) => r.path.replace(/^\/|\/$/g, ''))
  .filter((slug) => (canonicalBySlug.get(slug) ?? slug) === slug)
  .sort()
  .map((slug) => ORIGIN + '/' + (slug ? slug + '/' : ''));
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + sitemapUrls.map((u) => '  <url><loc>' + esc(u) + '</loc></url>').join('\n') + '\n</urlset>\n');
fs.writeFileSync(path.join(DIST, 'robots.txt'), 'User-agent: *\nAllow: /\nSitemap: ' + ORIGIN + '/sitemap.xml\n');

/* ---------- 5b. redirect map: the live 301 aliases + the MOVED re-points ---------- */
const siteInv = readJSON(P('audit/site-inventory.json'));
const redirects = new Map();
for (const pg of siteInv.pages || []) {
  for (const al of pg.aliases || []) {
    const from = ownPath(al, ORIGIN), to = ownPath(pg.finalUrl || pg.url, ORIGIN);
    if (from !== null && to !== null && from !== to) redirects.set(from, { to, why: 'source 301 (live site)' });
  }
}
for (const [from, to] of MOVED) if (!redirects.has(from) && willExist.has(to)) redirects.set(from, { to, why: 'source links here and 404s; content lives at the target' });
const rLines = [...redirects].sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([f, r]) => ['/' + f + '/', '/' + r.to + '/', r.why]);
fs.writeFileSync(path.join(DIST, '_redirects'), '# Carried-forward redirects (see audit/redirects.json)\n' + rLines.flatMap(([f, t]) => [f + '  ' + t + '  301', f.replace(/\/$/, '') + '  ' + t + '  301']).join('\n') + '\n');
/* QA r2 (content-seo F4): Apache serves its own bare error page unless told otherwise, so dist/404.html (root-relative
   URLs, COMPONENTS F.7) was never used there. ErrorDocument points every 404 at it; Netlify and Cloudflare Pages serve
   a root 404.html by convention, so _redirects needs no line. */
fs.writeFileSync(path.join(DIST, '.htaccess'), '# 404 page (dist/404.html; its URLs are root-relative, COMPONENTS F.7)\nErrorDocument 404 /404.html\n\n# Carried-forward redirects (see audit/redirects.json)\n' + rLines.map(([f, t]) => 'RedirectMatch 301 ^' + f.replace(/\/$/, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '/?$ ' + t).join('\n') + '\n');
stats.redirects = rLines.length;

/* ---------- 6. reports ---------- */
const now = new Date().toISOString();
const aud = (f, obj) => { if (REPORTS) fs.writeFileSync(P('audit', f), JSON.stringify(obj, null, 2) + '\n'); };
aud('dead-links.json', {
  schema: 'site-reforge/dead-links@1', generated: now,
  note: 'Internal targets the SOURCE links to but no page serves (404 on the live site, not an alias). The anchor is unwrapped; the link text is kept. Re-pointed targets (live 301 aliases and 404s whose content exists elsewhere) are listed under moved.',
  targets: [...stats.dead.entries()].sort().map(([p, n]) => ({ path: '/' + p + '/', references: n })),
  moved: [...stats.moved.entries()].sort().map(([p, n]) => ({ from: '/' + p + '/', to: '/' + MOVED.get(p) + '/', references: n })),
});
aud('redirects.json', { schema: 'cec/redirects@1', generated: now, note: 'Emitted as dist/_redirects and dist/.htaccess.', redirects: rLines.map(([from, to, why]) => ({ from, to, status: 301, why })) });
aud('seo-repairs.json', { schema: 'site-reforge/seo-repairs@1', generated: now, note: 'Head-level fields: source values carried forward; repairs only from the page own content or a declared decision.', titles: seoLog.titles, canonicals: seoLog.canonicals, descriptionsDerived: seoLog.descriptions, robotsChanges: seoLog.robotsChanges, noindex: seoLog.noindex });
aud('image-slots.json', { schema: 'cec/image-slots@1', generated: now, note: 'Every generated-image slot the build resolved (DESIGN-SPEC 6.3), rendered or not, with the reason.', slots });
aud('clone-removals.json', {
  schema: 'site-reforge/clone-removals@1',
  declaredAt: now,
  note: 'Deliberate removals, each a decision with a reason: platform runtime, former-vendor claims, controls with no backend, or statements that would be false on a static site. Editorial copy is never removed. Ledger ids refer to docs/DESIGN-SPEC.md 7.4.',
  elements: [
    { selector: 'footer #voice_search', decision: 'REMOVE', ledger: 'L11', reason: 'Voice/site search form (347 files): posts to WordPress /?s= which a static build does not serve.' },
    { selector: 'div.ecp-secondary .widget_search, main .ecp-search', decision: 'REMOVE', ledger: 'L11', count: stats.searchFormsRemoved || 0, reason: 'WordPress search forms (sidebar on 337 pages, 5 in-main modules, the /category/our-doctors/ prompt): no search backend in a static build.' },
    { selector: '.ecp-global-footer .ecp-powered-by', decision: 'REMOVE', ledger: 'L11', reason: 'Vendor credit "Powered by" + EyeCarePro logo.' },
    { selector: '#ecp-footer-login-link', decision: 'REMOVE', ledger: 'L11', reason: 'Login link to the platform WordPress admin (cliftoneyecenter2.ecpbuilder.com/wp-admin).' },
    { selector: 'a.ecp-menu-mobile-focus-trap', decision: 'REPLACE', ledger: 'L11', reason: '"Return to top of menu" focus-trap link: replaced by a JS focus trap in the drawer.' },
    { selector: 'GTM-P6GSK34 (script + noscript iframe)', decision: 'REMOVE', ledger: 'L11', reason: 'Google Tag Manager container of the former agency: the rebuild would report visitors to their account.' },
    { selector: 'footer [itemtype*=data-vocabulary.org/MedicalClinic]', decision: 'REMOVE', ledger: 'L11', reason: 'Footer microdata with coordinates 42.859280, -73.820210 (New York state, not Bossier City). The NAP text itself is kept.' },
    { selector: 'div.ecp-posts-wrapper-team (empty)', decision: 'REMOVE', ledger: 'L11', count: stats.emptyTeamModules || 0, reason: 'Empty team-list modules that render nothing on the source.' },
    { selector: 'div.ecp-secondary h3:empty', decision: 'REMOVE', ledger: 'L11', reason: 'The empty h3 above "Insurance Plans" in the sidebar.' },
    { selector: 'span[itemprop=ratingValue]', decision: 'REMOVE', ledger: 'L14', count: stats.hiddenRatingValuesRemoved || 0, reason: 'Hidden (display:none) schema.org rating value "5"; the visible star count is kept.' },
    { selector: 'GF honeypot li.gform_validation_container + Akismet block', decision: 'REMOVE', ledger: 'L23', reason: 'Anti-spam plumbing of the WordPress form backend (2 pages); the field labels "Email"/"Phone" would pose as duplicate real fields.' },
    { selector: 'EyeCarePro-Icons icon font', decision: 'REMOVE', ledger: 'L11', reason: 'Platform icon font; the rebuild draws its own inline SVG sprite.' },
    { selector: 'review-quote.png (EyeCarePro public.css background)', decision: 'REMOVE', ledger: 'L11', reason: 'Platform CSS image (403 on the source).' },
  ],
  strings: [
    { value: 'This field is for validation purposes and should be left unchanged.', decision: 'REMOVE', ledger: 'L23', reason: 'Gravity Forms honeypot instruction (2 pages): anti-spam plumbing for a backend this static build does not carry.' },
    { value: 'Powered by', decision: 'REMOVE', ledger: 'L11', reason: 'Footer credit linking to the former platform vendor (EyeCarePro).' },
    { value: 'Login', decision: 'REMOVE', ledger: 'L11', reason: 'Footer link to the platform WordPress admin. No such backend exists in the rebuild.' },
    { value: 'Ask Here, Voice Search', decision: 'REMOVE', ledger: 'L11', reason: 'Label of the removed footer voice search form (346 pages + /template/footer/).' },
    { value: 'Speak Field', decision: 'REMOVE', ledger: 'L11', reason: 'Visually hidden label of the removed voice search input.' },
    { value: 'Return to top of menu', decision: 'REPLACE', ledger: 'L11', reason: 'Mobile-menu focus-trap link (348 files); the drawer traps focus in JS instead.' },
    { value: 'Search:', decision: 'REMOVE', ledger: 'L11', reason: 'Label of the removed search widget.' },
  ],
  vendorClauses: {
    decision: 'REMOVED', scope: 'sentences naming EyeCarePro (the practice\'s former website agency), removed at sentence level; no replacement text authored',
    count: stats.vendorSentences ? stats.vendorSentences.size : 0,
    removed: stats.vendorSentences ? [...stats.vendorSentences].sort() : [],
    caveat: 'Those sentences disclaimed on the AGENCY\'S behalf (/disclaimer/). The client is left with no endorsement/warranty clause of its own; writing one is for the client\'s counsel, not this build.',
  },
  images: {
    vendorAssets: vendorDropped, platformUi: uiDropped,
    decided: DROP.map((d) => ({ match: String(d.re), why: d.why })),
    altsBlanked: { count: altBlanked, ledger: 'L12', why: 'file-name or upload-hash alt text ("dry eyes droplet 250x376.jpg", "clipart 010") describes nothing; it becomes alt="". Readable alts are kept verbatim.' },
  },
  prosePlatformNames: ['living-with-low-vision/index.html'],
  prosePlatformNamesWhy: {
    'living-with-low-vision/index.html': 'Source copy cites a third-party PDF at www.preventblindness.org/sites/default/files/... (an outbound link to another organisation\'s Drupal site). The path matches sr-decontaminate\'s drupal-marker pattern although it is not a trace of this site\'s platform. The link is kept as the source prints it; the file is still covered by the build\'s own platform grep (docs/BUILD-NOTES.md).',
  },
});
const report = {
  schema: 'cec/build-report@1', generated: now, dist: DIST,
  pages: { built, of: content.pages.length, plus404: fs.existsSync(path.join(DIST, '404.html')) },
  images: { keptSource: kept, vendorDropped, platformUiDropped: uiDropped, decidedDropped, standInsForMissing: filled, generatedAvailable: genById.size, generatedShipped: stats.generatedShipped, generatedLabelled: stats.generatedLabelled, altsBlanked: altBlanked, shipped: shipped.size, pruned: stats.unreferencedImagesPruned, encoded: stats.encoded || 0, cached: stats.cached || 0, copiedLossless: stats.copiedLossless || 0, encoderMissing: stats.encoderMissing || 0 },
  content: Object.fromEntries(Object.entries(stats).filter(([k, v]) => typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean')),
  lists: { h1Labels: stats.h1Labels || [], firstH1Kept: stats.firstH1Kept || [], bandPhotosNotRendered: stats.bandPhotosNotRendered || [], dupSections: stats.dupSections || [] },
  figureRoles: stats.figureRoles,
  links: { movedRefs: [...stats.moved.values()].reduce((a, b) => a + b, 0), deadRefs: [...stats.dead.values()].reduce((a, b) => a + b, 0), deadTargets: stats.dead.size },
  seo: { titlesRepaired: seoLog.titles.length, canonicalsFixed: seoLog.canonicals.length, descriptionsDerived: seoLog.descriptions, noindex: seoLog.noindex.length, robotsChanges: seoLog.robotsChanges.length, sitemapUrls: sitemapUrls.length },
  families: pageRecords.reduce((a, r) => { a[r.family] = (a[r.family] || 0) + 1; return a; }, {}),
  ledgerApplied: ledgerHits,
  generatedSlots: { rendered: slots.filter((x) => x.rendered).length, skipped: slots.filter((x) => !x.rendered).length },
  failures,
};
aud('build-report.json', report);
aud('build-pages.json', { schema: 'cec/build-pages@1', generated: now, pages: pageRecords });
if (REPORTS) {
  const fpath = P('audit/failures.json');
  const existing = fs.existsSync(fpath) ? JSON.parse(fs.readFileSync(fpath, 'utf8')) : { schema: 'site-reforge/failures@1', items: [] };
  existing.items = (existing.items || []).filter((i) => String(i.stage || '').indexOf('build:') !== 0).concat(failures.map((f) => ({ ...f, at: now })));
  fs.writeFileSync(fpath, JSON.stringify(existing, null, 2));
}

console.log('dist             ', DIST);
console.log('pages built      ', built, '/', content.pages.length, '+ 404.html', fs.existsSync(path.join(DIST, '404.html')));
console.log('images           ', JSON.stringify(report.images));
console.log('figure roles     ', JSON.stringify(stats.figureRoles));
console.log('links            ', JSON.stringify(report.links));
console.log('seo              ', JSON.stringify(report.seo));
console.log('generated slots  ', JSON.stringify(report.generatedSlots));
console.log('home             ', stats.homeStub ? 'STUB (generic pipeline)' : 'home.mjs');
console.log('build failures   ', failures.length);
const byReason = {};
for (const f of failures) { const k = f.stage + ' | ' + f.reason.split('\n')[0].slice(0, 140); byReason[k] = (byReason[k] || 0) + 1; }
for (const [r, n] of Object.entries(byReason).sort((a, b) => b[1] - a[1]).slice(0, 25)) console.log('   ', n, r);
process.exitCode = failures.length ? 1 : 0;
