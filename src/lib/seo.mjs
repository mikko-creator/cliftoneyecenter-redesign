/* seo.mjs - head-level fields for the Clifton Eye Center rebuild, carried forward from the source
   and repaired ONLY from the page's own content. Ported from the friscoeyesource reference
   (src/lib/seo.mjs) with every item of docs/PORT-NOTES.md 2.4 applied:
   - S-1: robots are read from ALL <meta name="robots"> in the RAW head and merged, most restrictive
     wins (seo-inventory.metaRobots recorded only the first meta: max-image-preview:large on 349/349);
   - NOINDEX_PAGES (16 Frisco slugs) replaced by the merged source robots plus the site-map.json
     artefact decisions (docs/BUILD-DECISIONS.md #1);
   - CANONICAL_OVERRIDE is empty here (0 of its Frisco slugs exist; no source canonical points
     elsewhere);
   - MOVED = the 7 live 301 aliases + the 2 re-pointable 404s (L-1). The Frisco pair
     our-eye-doctors -> our-eye-doctor is WRONG here and is gone;
   - JSON-LD: Optometric + Organization + BreadcrumbList from the published NAP/hours only.
     No fax (0 of 349 pages carry one). The footer microdata lat/long (42.859280, -73.820210) points
     to New York state and is never used. */
import { decodeEntities, ownPath, plain } from './util.mjs';

/* Internal targets the source links to that the live site 301s (site-inventory aliases) or 404s on
   while the content exists at another path this build serves. The href is repointed, not unwrapped. */
export const MOVED = new Map(Object.entries({
  /* the 7 live aliases (audit/site-inventory.json pages[].aliases) */
  'your-eye-health/eye-conditions': 'eye-care-services/eye-conditions',
  'eye-care-services/dry-eye-disease-and-treatment': 'eye-care-services/eye-conditions/dry-eye-disease-and-treatment',
  'eye-care-services/pediatric-eye-exams': 'eye-care-services/eye-exams/pediatric-eye-exams',
  'your-eye-health/eye-diseases': 'eye-care-services/your-eye-health/eye-diseases',
  'your-eye-health/protecting-your-eyes': 'eye-care-services/your-eye-health/protecting-your-eyes',
  'eyeglasses/designer-frames': 'eyeglasses-contacts/eyeglasses/designer-frames',
  'eyeglasses-contacts/designer-frames': 'eyeglasses-contacts/eyeglasses/designer-frames',
  /* 404 on the live site, content exists under the library (SITE-ARCHITECTURE section 10) */
  'your-eye-health/eye-diseases/cataracts': 'eye-care-services/your-eye-health/eye-diseases/cataracts',
  'your-eye-health/eye-diseases/macular-degeneration': 'eye-care-services/your-eye-health/eye-diseases/macular-degeneration',
}));

/* Kept from the reference: a source title ending on a function word is a truncation. 0 hits here (K6). */
const DANGLING_TAIL = /(?:\b(?:for|the|a|an|and|of|to|in|on|with|your|our|from|at|by|is|are)\s*|[|:,\-–—]\s*)$/i;
const ARCHIVE_PAGE = /^(author|category|tag)\//;

/* S-1: every robots meta in the raw <head>, merged. Directives are comma/space separated; the most
   restrictive of each pair wins (noindex over index, nofollow over follow); other directives
   (max-image-preview:large) are kept once, in first-seen order. */
export function sourceRobots(raw) {
  const head = (String(raw).match(/<head\b[\s\S]*?<\/head>/i) || [''])[0];
  const metas = [...head.matchAll(/<meta\b[^>]*>/gi)].map((m) => m[0]).filter((t) => /\bname\s*=\s*["']?robots["'\s>]/i.test(t));
  const tokens = [];
  for (const t of metas) {
    const c = (/\bcontent\s*=\s*"([^"]*)"|\bcontent\s*=\s*'([^']*)'/i.exec(t) || []);
    const v = c[1] !== undefined ? c[1] : (c[2] || '');
    for (const tok of v.toLowerCase().split(/[\s,]+/).filter(Boolean)) tokens.push(tok);
  }
  return { metas: metas.length, tokens };
}

export function mergeRobots(tokens, extra = []) {
  const all = [...tokens, ...extra];
  const has = (t) => all.includes(t);
  const out = [];
  if (has('noindex')) out.push('noindex'); else if (has('index')) out.push('index');
  if (has('nofollow')) out.push('nofollow'); else if (has('follow')) out.push('follow');
  for (const t of all) if (!/^(no)?(index|follow)$/.test(t) && !out.includes(t)) out.push(t);
  return out.join(', ');
}

export function pageTitle(s, page, h1Text, slug, log, fallbackLabel) {
  const title = (s.title || page.title || '').trim();
  const og = ((s.openGraph && s.openGraph['og:title']) || '').trim();
  const h1 = (h1Text || '').trim();
  let out = title || og || h1, why = '';
  if (ARCHIVE_PAGE.test(slug) && h1) { out = h1; why = 'WordPress gave this archive the title of the first post it lists (or none); replaced with the page own h1.'; }
  else if (title && DANGLING_TAIL.test(title)) {
    const full = (og.length > title.length && og) || (h1.length > title.length && h1) || '';
    if (full) { out = full; why = 'Source title stops on a dangling function word (truncated); replaced from the page own og:title or h1.'; }
  }
  if (!title && !og && h1 && !why) why = 'Source <title> and og:title are empty; the title follows the band h1' + (fallbackLabel ? ' (the neutral UI label of BUILD-DECISIONS #3)' : '') + '.';
  if (!out && fallbackLabel) { out = fallbackLabel; why = 'Source <title>, og:title and h1 are empty; the neutral UI label (BUILD-DECISIONS #3).'; }
  if (out !== title) log.titles.push({ page: '/' + (slug ? slug + '/' : ''), from: title, to: out, why });
  return out;
}

/* No meta description at source: take the page's own opening prose, ~155 chars, cut on a word. */
export function deriveDescription(sections, bodyText) {
  let text = '';
  for (const sec of sections) {
    const t = String(sec.body || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (t.length >= 60) { text = t; break; }
  }
  if (!text) text = String(bodyText || '').replace(/\s+/g, ' ').trim();
  text = decodeEntities(text).replace(/\s+/g, ' ').trim();
  if (text.length < 40) return '';
  if (text.length <= 155) return text;
  const cut = text.slice(0, 155);
  const stop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
  if (stop > 80) return cut.slice(0, stop + 1).trim();
  return cut.slice(0, cut.lastIndexOf(' ')).trim() + '…';
}

/* Canonical must name a page this build serves; only the homepage is the homepage; trailing slash.
   Here every declared canonical is self (344) or missing (5 archives -> self). */
export function canonicalSlugFor(s, page, slug, willExist, origin, log) {
  let out;
  const declared = s.canonical ? ownPath(s.canonical, origin) : null;
  if (declared === null) out = slug;
  else if (declared !== slug && !willExist.has(declared)) out = slug;
  else if (declared === '' && slug !== '') out = slug;
  else out = declared;
  if (!s.canonical || out !== ownPath(s.canonical, origin)) log.canonicals.push({ page: '/' + (slug ? slug + '/' : ''), from: s.canonical || '(none declared)', to: origin + '/' + (out ? out + '/' : '') });
  return out;
}

function to24(t) {
  const m = /(\d+):(\d+)\s*(AM|PM)/i.exec(t || '');
  if (!m) return '';
  let h = Number(m[1]) % 12;
  if (/pm/i.test(m[3])) h += 12;
  return String(h).padStart(2, '0') + ':' + m[2];
}

/* Structured data from the published NAP and hours only (chrome.json, itself read from
   audit/raw/index.html). Optometric is the schema.org MedicalBusiness subtype for an optometry
   practice. Organization carries name/url/logo (as the source's own Organization node did). The
   BreadcrumbList mirrors the SOURCE trail the page renders; pages without a source trail get none. */
export function jsonLd({ pageUrl, chrome, origin, logoUrl, trail }) {
  const orgId = origin + '/#organization';
  const bizId = origin + '/#optometric';
  const open = chrome.hours.filter((r) => !/closed/i.test(r[1]));
  const graph = [
    {
      '@type': 'Organization',
      '@id': orgId,
      name: chrome.brandName,
      url: origin + '/',
      ...(logoUrl ? { logo: logoUrl } : {}),
      sameAs: ((chrome.footer && chrome.footer.social) || chrome.social || []).map((x) => x.href),
    },
    {
      '@type': 'Optometric',
      '@id': bizId,
      name: chrome.brandName,
      url: origin + '/',
      telephone: chrome.phone,
      ...(logoUrl ? { image: logoUrl } : {}),
      parentOrganization: { '@id': orgId },
      address: {
        '@type': 'PostalAddress',
        streetAddress: chrome.address.street,
        addressLocality: chrome.address.locality,
        addressRegion: chrome.address.region,
        postalCode: chrome.address.postalCode,
        addressCountry: 'US',
      },
      openingHoursSpecification: open.map((r) => {
        const parts = r[1].split(/\s+-\s+/);
        return { '@type': 'OpeningHoursSpecification', dayOfWeek: 'https://schema.org/' + r[0], opens: to24(parts[0]), closes: to24(parts[1]) };
      }),
      sameAs: ((chrome.footer && chrome.footer.social) || chrome.social || []).map((x) => x.href),
    },
  ];
  if (trail && trail.length >= 2) {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: trail.map((seg, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: seg.text,
        ...(seg.abs ? { item: seg.abs } : (i === trail.length - 1 ? { item: pageUrl } : {})),
      })),
    });
  }
  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
  return '<script type="application/ld+json">' + json + '</' + 'script>';
}

export { plain };
