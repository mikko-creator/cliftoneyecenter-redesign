// write-facts.mjs — facts/client-facts.json, written FROM THE EVIDENCE, never typed by hand.
// Every entry carries a `source` pointer into audit/raw/ (the untouched 2026-09-25 crawl) or
// src/content/chrome.json (itself verified against audit/raw/index.html). sr-fabrication reads this
// file as the list of claims the rebuild may make beyond the extractor's text capture.
//   node tools/write-facts.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const chrome = JSON.parse(fs.readFileSync(path.join(PROJ, 'src/content/chrome.json'), 'utf8'));
const raw = fs.readFileSync(path.join(PROJ, 'audit/raw/index.html'), 'utf8');
const plain = (s) => String(s || '').replace(/<[^>]+>/g, ' ').replace(/&#8217;|&rsquo;/g, '’').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

/* the homepage review carousel (.ecp-review slides) - same parse as src/lib/home.mjs */
const testimonials = [];
for (const m of raw.matchAll(/<div class="ecp-review splide__slide[\s\S]*?(?=<div class="ecp-review splide__slide|<\/div>\s*<\/div>\s*<\/div>\s*<script)/g)) {
  const b = m[0];
  const quote = plain((b.match(/ecp-review-comment[^>]*>([\s\S]*?)<\/div>/) || [])[1]);
  const name = plain((b.match(/ecp-review-name[^>]*>([\s\S]*?)<\/div>/) || [])[1]);
  const rating = (b.match(/ecp-rating-star-full/g) || []).length;
  if (quote) testimonials.push({ quote, name, rating, source: 'audit/raw/index.html - homepage review carousel (.ecp-review-comment / .ecp-review-name / .ecp-rating-star-full), live site 2026-09-25' });
}
if (testimonials.length !== 7) throw new Error('expected the 7 homepage reviews, found ' + testimonials.length + ' - the source changed; re-verify before declaring');

const facts = {
  schema: 'site-reforge/client-facts@1',
  note: 'Declared facts. ONLY facts recorded here or present in audit/content-inventory.json may appear as claims on the rebuild. Written by tools/write-facts.mjs from the evidence; every entry names its source. Nothing here is supplied by the client or invented - it is what the LIVE SITE says in places the extractor\'s text capture did not reach (a review carousel, icon-only footer links).',
  generatedBy: 'tools/write-facts.mjs',
  generated: new Date().toISOString(),
  legalName: '',
  brand: chrome.brandName,
  phone: [{ value: chrome.phone, source: 'audit/raw/index.html header + footer' }, { value: chrome.fax, kind: 'fax', source: 'audit/raw/index.html contact widget' }],
  email: [{ value: chrome.email, source: 'audit/raw/index.html contact widget' }],
  addresses: [{ value: chrome.addressLine, source: 'audit/raw/index.html header strip' }, { value: chrome.addressShort.join(', '), source: 'audit/raw/index.html contact widget' }],
  hours: chrome.hours.map(([d, h]) => d + ': ' + h).join('; '),
  hoursSource: 'audit/raw/index.html hours widget',
  licences: [], certifications: [], awards: [], statistics: [], clients: [], guarantees: [], pricing: [], services: [],
  testimonials,
  socialProfiles: chrome.social.map((s) => ({ brand: s.brand, label: s.label, url: s.href, source: 'aria-label + href of the icon-only footer links on every source page (audit/raw/*.html); the glyphs were inline <svg>' })),
  /* A verbatim source sentence whose rebuild NEIGHBOUR differs. sr-fabrication's superlative detector
     reads the matched word plus the next 50 characters across element boundaries; on this page the
     source content ENDS at "Women's Eyeglass Frames" and the rebuild's own "Request An Appointment"
     card follows, so the window no longer matches the capture. The claim-bearing words are the
     source's, unchanged. Declared here, with the page and the exact source text, rather than hidden. */
  sourcedClaimContexts: [
    {
      page: '/eyeglasses-contacts/eyeglasses/eyeglass-basics/',
      sourceText: 'How can you narrow down your options and choose the style of frames that are best for you?',
      rebuildContext: 'best for you? Women’s Eyeglass Frames Request An Appointment',
      why: 'The last list item of the page is followed on the rebuild by the site-wide "Request An Appointment" card. No word of the claim is new.',
      source: 'audit/raw/eyeglasses-contacts-eyeglasses-eyeglass-basics.html (.ecp-childpages-summary)',
    },
  ],
};
fs.writeFileSync(path.join(PROJ, 'facts/client-facts.json'), JSON.stringify(facts, null, 2) + '\n');
console.log('client-facts written: testimonials', testimonials.length, '| social', facts.socialProfiles.length, '| claim contexts', facts.sourcedClaimContexts.length);
