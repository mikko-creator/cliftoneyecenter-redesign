// write-facts.mjs — facts/client-facts.json, written FROM THE EVIDENCE, never typed by hand.
// Adapted from the friscoeyesource reference to Clifton Eye Center. Every entry carries a `source`
// pointer into audit/raw/ (the untouched 2026-09-28 crawl) or src/content/chrome.json (itself
// verified string-by-string against audit/raw/index.html). sr-fabrication reads this file as the list
// of claims the rebuild may make beyond the extractor's text capture.
//   node tools/write-facts.mjs
// Fails closed: the testimonial parse must find exactly the 9 cards (5 files) PORT-NOTES H4 counted,
// the NAP/hours in chrome.json must match the raw markup, and the doctor's name must be the h1 of
// /team/dr-deana-clifton-od/.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RAW = path.join(PROJ, 'audit/raw');
const chrome = JSON.parse(fs.readFileSync(path.join(PROJ, 'src/content/chrome.json'), 'utf8'));
const NAMED = { nbsp: ' ', amp: '&', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', ndash: '–', mdash: '—', hellip: '…', quot: '"', lt: '<', gt: '>' };
const plain = (s) => String(s || '').replace(/<[^>]+>/g, ' ')
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d)).replace(/&([a-z]+);/gi, (m, n) => (NAMED[n] !== undefined ? NAMED[n] : m))
  .replace(/\s+/g, ' ').trim();
const fail = (msg) => { console.error('write-facts: ' + msg); process.exit(1); };

/* ---- testimonials: div.ecp-post.ecp-posttype-testimonial cards in every raw page ---- */
const testimonials = [];
const files = fs.readdirSync(RAW).filter((f) => f.endsWith('.html')).sort();
for (const f of files) {
  const raw = fs.readFileSync(path.join(RAW, f), 'utf8');
  const main = (raw.match(/<main\b[\s\S]*?<\/main>/i) || [raw])[0].replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<!--[\s\S]*?-->/g, '');
  const starts = [...main.matchAll(/<div class="ecp-post ecp-post-(\d+) ecp-posttype-testimonial\b[^"]*"[^>]*>/g)];
  for (let i = 0; i < starts.length; i++) {
    const chunk = main.slice(starts[i].index, i + 1 < starts.length ? starts[i + 1].index : main.length);
    const quote = plain((chunk.match(/<div class="ecp-post-content[^"]*">([\s\S]*?)<\/div>/) || [])[1]);
    const name = plain((chunk.match(/<div class="ecp-post-attribute"[^>]*>([\s\S]*?)<\/div>/) || [])[1]).replace(/^-\s*/, '');
    const rating = (chunk.match(/ecp-rating-star-full/g) || []).length;
    if (!quote) fail('empty testimonial card in ' + f);
    testimonials.push({ quote, name, rating, post: 'testimonial post ' + starts[i][1], source: 'audit/raw/' + f + ' (div.ecp-post.ecp-posttype-testimonial: .ecp-post-content / .ecp-post-attribute / count of .ecp-rating-star-full), live site 2026-09-28' + (f === 'index.html' ? '; the homepage prints a truncated excerpt ending "..."' : '') });
  }
}
const pagesWith = new Set(testimonials.map((t) => t.source.split(' ')[0]));
if (testimonials.length !== 9 || pagesWith.size !== 5) fail('expected the 9 testimonial cards on 5 pages (PORT-NOTES H4), found ' + testimonials.length + ' on ' + pagesWith.size + ' - the source changed; re-verify before declaring');

/* ---- NAP / hours: re-verified against the raw sidebar location widget ---- */
const side = fs.readFileSync(path.join(RAW, '1-eye-allergies-2016.html'), 'utf8');
const addr = plain((side.match(/<div class="ecp-post-address[^"]*">([\s\S]*?)<\/div>/) || [])[1]);
if (addr !== chrome.addressLines.join(' ')) fail('chrome.json address "' + chrome.addressLines.join(' ') + '" != raw "' + addr + '"');
const rawHours = [...side.matchAll(/<li class="ecp-post-hours-item[^"]*">\s*<strong[^>]*>([\s\S]*?)<\/strong>\s*<span[^>]*>([\s\S]*?)<\/span>/g)].map((m) => [plain(m[1]).replace(/:$/, ''), plain(m[2])]);
if (JSON.stringify(rawHours) !== JSON.stringify(chrome.hours)) fail('chrome.json hours differ from the raw hours widget: ' + JSON.stringify(rawHours));
if (!side.includes('tel:' + chrome.phone)) fail('phone ' + chrome.phone + ' not in the raw sidebar');

/* ---- the doctor ---- */
const team = fs.readFileSync(path.join(RAW, 'team-dr-deana-clifton-od.html'), 'utf8');
const doctor = plain((team.match(/<h1 class="ecp-entry-title">([\s\S]*?)<\/h1>/) || [])[1]);
if (doctor !== 'Dr. Deana Clifton, OD') fail('doctor h1 is "' + doctor + '"');

/* ---- email: printed on one page only ---- */
const acc = fs.readFileSync(path.join(RAW, 'website-accessibility-policy.html'), 'utf8');
const email = (acc.match(/mailto:([^"'?]+)/) || [])[1] || '';
if (email !== 'cliftoneyecenter@yahoo.com') fail('accessibility-page email is "' + email + '"');

const facts = {
  schema: 'site-reforge/client-facts@1',
  note: 'Declared facts for Clifton Eye Center. ONLY facts recorded here or present in audit/content-inventory.json may appear as claims on the rebuild. Written by tools/write-facts.mjs from the evidence; every entry names its source. Nothing here is supplied by the client or invented - it is what the LIVE SITE says, including places the extractor text capture did not reach (testimonial cards, icon-only footer links).',
  generatedBy: 'tools/write-facts.mjs',
  generated: new Date().toISOString().slice(0, 10),
  legalName: '',
  brand: chrome.brandName,
  people: [{ name: doctor, role: 'optometrist (the practice owner, per her bio)', source: 'audit/raw/team-dr-deana-clifton-od.html h1.ecp-entry-title; /our-eye-doctors/ team card' }],
  phone: [{ value: chrome.phone, source: 'audit/raw/index.html top bar, mobile header, sidebar location widget and footer NAP (tel:318-550-5815)' }],
  fax: [],
  faxNote: 'The source publishes no fax number (0 of 349 pages).',
  email: [{ value: email, source: 'audit/raw/website-accessibility-policy.html (the only page that prints it)' }],
  addresses: [
    { value: chrome.topbar.address.label, source: 'audit/raw/index.html header top bar (strong.ecp-heading-tag)' },
    { value: chrome.addressLines.join(', '), source: 'audit/raw/*.html sidebar location widget (div.ecp-post-address)' },
    { value: chrome.brandName + ' - Located at ' + chrome.address.street + ', ' + chrome.address.locality + ', ' + chrome.address.region + ' ' + chrome.address.postalCode, source: 'audit/raw/index.html footer NAP line' },
  ],
  geo: null,
  geoNote: 'The footer microdata latitude/longitude (42.859280, -73.820210) points to New York state, not Bossier City; it is not a fact about this practice and is not used.',
  hours: chrome.hours.map(([d, h]) => d + ': ' + h).join('; '),
  hoursSource: 'audit/raw/*.html sidebar hours widget (li.ecp-post-hours-item), identical on /hours-location/ and the homepage',
  licences: [], certifications: [], awards: [], statistics: [], clients: [], guarantees: [], pricing: [], services: [],
  testimonials,
  socialProfiles: chrome.footer.social.map((s) => ({ network: s.network, label: s.label, url: s.href, source: 'aria-label + href of the icon-only footer link on every source page (audit/raw/*.html); the glyph was an inline <svg>' })),
  /* A verbatim source string whose rebuild NEIGHBOUR differs. sr-fabrication's superlative detector
     reads the matched word ("Best") plus the next 50 characters across element boundaries; the source
     prints the GF label with its required asterisk and then the screen-reader sub-label "Hours" in a
     different element order than the rebuild's fieldset, so the window no longer matches the text
     capture. Every word is the source's. Declared with the page and the exact source text. */
  sourcedClaimContexts: [
    {
      page: '/contact-us/appointment-request-form/',
      sourceText: 'Best Time to be Reached for Confirmation*',
      rebuildContext: 'Best Time to be Reached for Confirmation * Hours',
      why: 'Gravity Forms time-field label (not a claim: "Best" is part of the field name) followed by its required mark and the first sub-label "Hours", both source strings.',
      source: 'audit/raw/contact-us-appointment-request-form.html (li#field_9_14: label.gfield_label, span.gfield_required, label.hour_label)',
    },
  ],
};
fs.mkdirSync(path.join(PROJ, 'facts'), { recursive: true });
fs.writeFileSync(path.join(PROJ, 'facts/client-facts.json'), JSON.stringify(facts, null, 2) + '\n');
console.log('client-facts written: testimonials', testimonials.length, 'on', pagesWith.size, 'pages | people', facts.people.length, '| social', facts.socialProfiles.length, '| hours rows', chrome.hours.length);
