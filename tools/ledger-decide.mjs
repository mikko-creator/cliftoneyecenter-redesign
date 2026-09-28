// ledger-decide.mjs - one change-control decision per ledger row, naming the component the Clifton Eye
// Center rebuild ACTUALLY renders for it (docs/COMPONENTS.md, docs/DESIGN-SPEC.md), plus the rows the
// source crawl cannot produce: the DESIGN-SPEC 7.4 ledger rows (L01-L23), one REMOVE row per declared
// removal in audit/clone-removals.json, and one ADD row per generated-imagery kind (audit/image-slots.json)
// and per page that exists in the build but in no source page (dist/404.html).
// Adapted from the friscoeyesource reference tool (same mechanism, new rules).
//
// Mechanism (unchanged from the reference): decision / slot / why / rebuiltAs go through the skill's
// own CLI `sr-plan --set`; presets go through `sr-match --answer`, which validates every id against the
// preset index. The matcher runs first (its verdict is kept in audit/preset-match.matcher-verdict.json);
// every row is then answered with the preset of the component the build uses. The rule that decided each
// row is written to audit/ledger-rules.json.
//
//   node tools/ledger-decide.mjs [--dry] [--presets-only]
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKILL = path.join(os.homedir(), '.claude', 'skills', 'site-reforge', 'scripts');
const DRY = process.argv.includes('--dry');
const PRESETS_ONLY = process.argv.includes('--presets-only');
const J = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const ledgerFile = path.join(ROOT, 'audit/change-control.json');
const index = J('audit/preset-index.json');
const known = new Set(index.libraries.flatMap((l) => (l.presets || []).map((p) => p.id)));
const pages = new Map(J('audit/build-pages.json').pages.map((p) => [p.path, p]));
const removals = J('audit/clone-removals.json');
const slotsAll = J('audit/image-slots.json').slots;
const ORIGIN = 'https://www.cliftoneyecenter.com';
const HOST = 'www.cliftoneyecenter.com';

/* presets = the component the rebuild renders (every id checked against the index below) */
const P = {
  hero: '00-top12-12-ambient-depth-behind-the-hero-glow-blobs-duotone-wash',
  frosted: '04-signatures-tokens-16-frosted-panel',
  cardGrid: 'card-grid',
  faq: 'accordion-faq',
  cardsFloat: '11-theming-2-cards-float-on-surface',
  testimonials: 'testimonial-grid',
  team: '10-sections-8-team-gallery',
  blog: '10-sections-9-content-blog',
  forms: '10-sections-11-forms-lead-gen',
  logos: 'gallery-row',
  cta: 'cta-banner',
  footer: '10-sections-10-footers',
  header: '10-sections-1-headers-navs',
  utility: '13-utility-pages-1-sgen-living-styleguide-13-utility-system-pages-404-500-no-results-maintenance-loading-1',
  floating: '01-transitions-hero-motion-11-your-product-floating',
  parallax: '01-transitions-hero-motion-20-parallax',
  a11yMenu: '09-accessibility-d-menu-3-keyboard-operable-menu-apg-menu-button',
  a11yAcc: '09-accessibility-d-acc-5-keyboard-operable-accordion-apg-disclosure',
  a11yAria: '09-accessibility-d-aria-7-aria-patterns-the-first-rule-of-aria',
  a11yForm: '09-accessibility-d-form-10-accessible-form-labels-error-states-wcag-3-3-1-3-3-2-labels-error-id',
  mobileBar: '08-scroll-sticky-d-mobile-6-mobile-bottom-bar-safe-area-aware-call-cart-bar-f2-f3',
  stickyHeader: '00-top12-6-glass-sticky-header-transparent-over-hero-blurred-on-scroll',
  reveal: '00-top12-4-scroll-reveal-entrance-with-sibling-stagger',
};
for (const [k, v] of Object.entries(P)) if (!known.has(v)) throw new Error('preset not in index: ' + k + ' = ' + v);

/* ---------- 1. rows the crawl cannot produce (added once, idempotent by id) ---------- */
const count = (pred) => slotsAll.filter(pred).length;
const pagesOf = (pred) => [...new Set(slotsAll.filter(pred).map((s) => s.page))];
const rendered = (image, slotRe) => (s) => s.rendered && (!image || s.image === image) && (!slotRe || slotRe.test(s.slot));
const listPages = (arr) => arr.length + ' page(s): ' + arr.slice(0, 12).join(', ') + (arr.length > 12 ? ', ...' : '') + ' (full list: audit/image-slots.json)';

const SPEC_ROWS = [   /* DESIGN-SPEC 7.4. L08 is unused (spec); L11, L14 and the honeypot half of L23 are the per-removal rows below */
  { key: 'L01', decision: 'REPLACE', slot: 'strategic-cta', preset: P.header, label: 'Top-bar "Make an Appointment" (dead span href="")', why: 'L01 (BUILD-DECISIONS #6): the source top bar prints "Make an Appointment" as a dead <span href="">; it becomes a link to /contact-us/appointment-request-form/, its obvious intent. Label verbatim.' },
  { key: 'L02', decision: 'IMPROVE', slot: 'strategic-cta', preset: P.mobileBar, label: 'Top bar on phones', why: 'L02: the top bar shows on phones in compact form (the Call pill below 720px; address plus Call from 720 to 1023px), so "Call Us: 318-550-5815" is on screen as text at 390 (gate G9). Source strings only.' },
  { key: 'L03', decision: 'IMPROVE', slot: 'social-proof', preset: P.testimonials, label: 'Desktop-only home rows (reviews, Q&A, designer brands)', why: 'L03 (BUILD-DECISIONS #7): the platform hid the #HappyPatients, #HeretoHelp and Our Designer Optical rows below desktop width; they show at every width. Real content, verbatim.' },
  { key: 'L04', decision: 'REPLACE', slot: 'social-proof', preset: P.testimonials, label: 'Splide carousels (testimonials autoplay, smile images)', why: 'L04: the autoplaying Splide testimonial carousel (WCAG 2.2.2) becomes a static level row from 1024px and a user-driven scroll-snap track with Previous/Next below (no autoplay); the image carousel becomes a static smile cluster, never paired with a reviewer. Every review verbatim.' },
  { key: 'L05', decision: 'REPLACE', slot: 'objection-handling', preset: P.a11yAcc, label: 'Accordion toggles (a href="#" + hidden divs)', why: 'L05: the Beaver Builder accordions (<a href="#"> toggles over hidden divs) become native <details>/<summary>; the first home Q&A item (Dr. Clifton\'s own answer) is open by default. Questions and answers verbatim.' },
  { key: 'L06', decision: 'IMPROVE', slot: 'value-proposition', preset: P.frosted, label: 'Home heading levels', why: 'L06: one h1 per page and a valid heading order on the home: "What\'s New!" h1 to h2; the div titles (#HappyPatients, #HeretoHelp, Our Most Popular Services) and the designer <p> to h2; the promo h4 to h3. Text unchanged.' },
  { key: 'L07', decision: 'IMPROVE', slot: 'value-proposition', preset: P.frosted, label: 'Emphasis markup on the Welcome copy', why: 'L07: markup only: a span on "in Bossier City, Louisiana" and <strong> on the three service lead terms of the Welcome list. Text unchanged.' },
  { key: 'L09', decision: 'REPLACE', slot: 'footer', preset: P.footer, label: 'Alias hrefs re-pointed to canonical URLs', why: 'L09: hrefs to URLs that 301 on the live site (the pediatric tile, 4 designer plates, 3 dry-eye links and the other SITE-ARCHITECTURE section 10 aliases) point straight at the canonical page; the redirects are also emitted (dist/_redirects, dist/.htaccess). Link text unchanged.' },
  { key: 'L10', decision: 'REPLACE', slot: 'footer', preset: P.footer, label: 'Footer "Sitemap" link', why: 'L10 (BUILD-DECISIONS #5): the footer "Sitemap" link pointed at /sitemap/, a 404 on the live site; it points at /sitemap.xml, which the build writes. Label verbatim.' },
  { key: 'L12', decision: 'IMPROVE', slot: 'benefits-solution', preset: P.a11yAria, label: 'Image alt text', why: 'L12: the service tiles, promo photo and smile images get alt="" (the card text already names them), and file-name or upload-hash alts ("dry eyes droplet 250x376.jpg", "clipart 010", 37 in all) become alt="". Readable source alts are kept verbatim; no alt is authored.' },
  { key: 'L13', decision: 'ADD', slot: 'footer', preset: P.a11yAria, label: 'Non-visible accessibility labels', why: 'L13: accessible names with no visible copy: "5 out of 5 stars", "Quick links", "Clifton Eye Center home", the round buttons\' "Make an appointment" / "Call", map and YouTube iframe titles, carousel slide labels "n of 3", the breadcrumb nav label.' },
  { key: 'L15', decision: 'IMPROVE', slot: 'value-proposition', preset: P.stickyHeader, label: 'Logo presentation', why: 'L15: the logo JPEG (white box) is presented on white paper plates (the hanging header plate and the footer plate), trimmed in CSS. The file itself is untouched and never redrawn.' },
  { key: 'L16', decision: 'ADD', slot: 'footer', preset: P.cardsFloat, label: "Today's hours row highlighted", why: "L16: the row of today's weekday in every hours list gets a background tint (site.js, background only). No text is added." },
  { key: 'L17', decision: 'REPLACE', slot: 'strategic-cta', preset: P.header, label: 'tel: URI with a space', why: 'L17: the source "tel: 318-550-5815" (with a space) becomes the valid URI tel:318-550-5815; the empty tel: on /hours-location/ is unwrapped and the number stays as text.' },
  { key: 'L19', decision: 'ADD', slot: 'footer', preset: P.frosted, label: 'Section rail (library, eyewear, services)', why: 'L19 (operator decision, default on): an in-section rail built only from existing page titles in site-map.json: the parent page\'s own title as a link, then its children, the current page marked. Top card of the aside from 1024px, a <details> above the article below. No invented label.' },
  { key: 'L20', decision: 'ADD', slot: 'value-proposition', preset: P.frosted, label: '/designer-frames/ h1', why: 'L20 (operator decision): /eyeglasses-contacts/eyeglasses/designer-frames/ has no h1 in the source; the title band h1 is its own <title> "Designer Frames".' },
  { key: 'L21', decision: 'IMPROVE', slot: 'footer', preset: P.frosted, label: 'Empty breadcrumb segments', why: 'L21: the source prints empty trail segments ("Home » »" on the testimonials, "Home »" on archives); they are dropped. Every non-empty label is the source\'s own.' },
  { key: 'L22', decision: 'REPLACE', slot: 'footer', preset: P.cardsFloat, label: 'Google Maps embed', why: 'L22 (BUILD-DECISIONS #10): the keyed Maps embed (the former agency\'s API key, never shipped) becomes the keyless embed with the practice\'s full address as the query. Verified in headless Chrome on 2026-09-28: it renders the Clifton Eye Center pin at 1000 Chinaberry Dr (tmp/orch/shots/home.1440.png).' },
  { key: 'L23', decision: 'REPLACE', slot: 'strategic-cta', preset: P.a11yForm, label: 'Forms without a backend', why: 'L23 (BUILD-DECISIONS #4): the 2 Gravity Forms are rebuilt field for field and are inert: a valid submit shows the notice "This form is not connected yet — please call 318-550-5815" and sends nothing (no action, no mailto). Wiring a backend is a launch task. The honeypot removal is its own row.' },
];
const RM_PRESET = (sel) => /voice_search|widget_search|ecp-search/.test(sel) ? P.footer : /focus-trap/.test(sel) ? P.a11yMenu : /honeypot/.test(sel) ? P.forms : /powered-by|login|data-vocabulary|icon font|review-quote|ratingValue/.test(sel) ? P.footer : /GTM/.test(sel) ? P.footer : P.frosted;
/* narrative slot of each removed element = the part of the page it belonged to */
const RM_SLOT = (sel) => /ratingValue|review-quote/.test(sel) ? 'social-proof' : /honeypot/.test(sel) ? 'strategic-cta' : /team/.test(sel) ? 'trust-positioning' : 'footer';
const removalRows = [];
/* which removed strings (audit/clone-removals.json "strings") belong to which removed element */
const STRINGS_OF = [[/voice_search/, /Voice Search|Speak Field/], [/widget_search/, /^Search:$/], [/powered-by/, /^Powered by$/], [/login-link/, /^Login$/], [/focus-trap/, /Return to top of menu/], [/honeypot/, /validation purposes/]];
for (const el of removals.elements || []) {
  const pair = STRINGS_OF.find(([sel]) => sel.test(el.selector));
  const strings = pair ? (removals.strings || []).filter((s) => pair[1].test(s.value)).map((s) => '"' + s.value + '"') : [];
  const decision = el.decision === 'REPLACE' ? 'REPLACE' : 'REMOVE';
  removalRows.push({ key: 'rm-' + el.selector.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase().slice(0, 48), decision, slot: RM_SLOT(el.selector), preset: RM_PRESET(el.selector), label: el.ledger + ': ' + el.selector,
    why: el.ledger + ' ' + decision + ': ' + el.reason + (el.count ? ' (' + el.count + ' instances)' : '') + (strings.length ? ' Removed strings: ' + strings.join(', ') + '.' : '') + ' Declared in audit/clone-removals.json.' });
}
if (removals.vendorClauses) removalRows.push({ key: 'rm-vendor-clauses', decision: 'REMOVE', slot: 'footer', preset: P.frosted, label: 'Vendor (EyeCarePro) sentences on /disclaimer/', why: 'REMOVE: ' + removals.vendorClauses.count + ' sentences naming EyeCarePro, the former website agency, removed at sentence level on /disclaimer/; no replacement text authored. Caveat: they disclaimed on the agency\'s behalf; the practice has no endorsement clause of its own until its counsel writes one. Declared in audit/clone-removals.json vendorClauses.' });
for (const d of (removals.images && removals.images.decided) || []) removalRows.push({ key: 'rm-img-thanksgiving', decision: 'REMOVE', slot: 'benefits-solution', preset: P.frosted, label: 'Thanksgiving basket image on /october-is/', why: 'REMOVE: ' + d.why });

const imageRows = [
  { key: 'add-hero-imagery', url: ORIGIN + '/', decision: 'ADD', slot: 'value-proposition', preset: P.floating, label: 'L18: home hero generated imagery',
    why: 'L18 ADD: the home hero stage gets the generated scene-greenery-window as a blurred backdrop (blur 6px, opacity .55, under a veil) so the glass statement and dock frost real imagery, and the generated cut-eyeglasses hangs across the arch photo\'s bottom edge (phone: its bottom-left). Decorative, alt="", AI-labelled in the file (IPTC trainedAlgorithmicMedia).' },
  { key: 'add-olive-sprig', url: ORIGIN + '/', decision: 'ADD', slot: 'benefits-solution', preset: P.parallax, label: 'L18: olive sprig across the Welcome / Services seam',
    why: 'L18 ADD: one generated cut-olive-sprig crosses the Welcome to Our Most Popular Services seam (561px and wider), scroll-rotated. It replaces every lab leaf motif (DESIGN-SPEC 3.10). Decorative, alt="", AI-labelled.' },
  { key: 'add-band-scenes', decision: 'ADD', slot: 'benefits-solution', preset: P.parallax, label: 'L18: title-band scene backdrops',
    why: 'L18 ADD: the interior title band of ' + listPages(pagesOf(rendered(null, /^band scene$/))) + ' carries a heavily blurred generated scene (scene-exam-room, scene-optical-boutique or scene-greenery-window by family, DESIGN-SPEC 6.2) behind the glass title panel; never captioned, alt="", AI-labelled. Pages naming a brand or Dr. Clifton, or showing a brand logo, get the plain band instead.' },
  { key: 'add-band-cutouts', decision: 'ADD', slot: 'benefits-solution', preset: P.floating, label: 'L18: title-band cut-outs',
    why: 'L18 ADD: a generated cut-out (eyeglasses, sunglasses, kids glasses, phoropter, lens prism or contact lens by URL prefix, DESIGN-SPEC 6.3) crosses the title band\'s bottom edge on ' + listPages(pagesOf(rendered(null, /^band cut-out$/))) + '. Shipped trimmed to its opaque box (transparent pixels only). The contact-lens fingertip, cut flat at two edges, rises from inside the band\'s clipped bottom-right corner instead of crossing the edge (a floating copy showed a severed finger). Decorative, alt="", AI-labelled; excluded on brand, Dr. Clifton and brand-logo pages.' },
  { key: 'add-svc-features', decision: 'ADD', slot: 'benefits-solution', preset: P.frosted, label: 'L18: svc feature figures',
    why: 'L18 ADD: an illustrative generated feature photo (svc-eye-exam, svc-pediatric-exam, svc-dry-eye) at the top of the first sheet on ' + listPages(pagesOf(rendered(null, /^svc feature$/))) + ', with its plan alt; AI-labelled; never beside Dr. Clifton copy. svc-contact-lens was dropped by the imagery review (no acceptable result), so its two slots stay empty by decision.' },
  { key: 'add-slot-fills', decision: 'ADD', slot: 'benefits-solution', preset: P.frosted, label: 'L18: stand-ins for source images that 404',
    why: 'L18 ADD (BUILD-DECISIONS #8, PORT-NOTES G-1): ' + listPages(pagesOf((s) => s.rendered && /slot-fill/.test(s.slot))) + ' show a generated stand-in where the source <img> is broken on the live site (fill-winter-sunglasses, fill-computer-glasses, fill-senior-thought, fill-clipart-010, svc-eyewear-boutique for "Woman Trying on Glasses"). AI-labelled.' },
  { key: 'add-404-prism', url: ORIGIN + '/404-page-not-found/', decision: 'ADD', slot: 'footer', preset: P.utility, label: 'L18: 404 lens prism',
    why: 'L18 ADD: the generated cut-lens-prism floats over the 404 sheet\'s top-right edge (/404-page-not-found/ and dist/404.html). Decorative, alt="", AI-labelled.' },
  { key: 'add-texture', decision: 'ADD', slot: 'value-proposition', preset: P.frosted, label: 'L18: frosted-glass texture layer',
    why: 'L18 ADD: the generated tex-frosted-glass at 6% (alpha baked by the build, fading to 0) inside the home hero statement and every interior prose sheet (DESIGN-SPEC 6.4). Decorative, AI-labelled.' },
  { key: 'add-404-html', decision: 'ADD', slot: 'footer', preset: P.utility, label: 'dist/404.html',
    why: 'ADD: dist/404.html is a build page in no source page: the /404-page-not-found/ content at depth 0 for a host\'s not-found handler (noindex, out of the sitemap).' },
  { key: 'add-favicon', decision: 'ADD', slot: 'footer', preset: P.header, label: 'Favicon',
    why: 'ADD (BUILD-DECISIONS #2): the source has no favicon; favicon-32.png, favicon-192.png and apple-touch-icon.png are a crop of the eye mark from the practice\'s own logo file (no redraw, docs/IMAGE-PLAN.md section 6).' },
];
const ADDED = [...SPEC_ROWS, ...removalRows, ...imageRows].map((r, i) => ({ ...r, id: HOST + '/#ledger-' + r.key, url: r.url || ORIGIN + '/', index: 1000 + i }));

/* ---------- 2. rules for the rows the crawl produced ---------- */
const pathOf = (u) => { const p = new URL(u).pathname; return p.endsWith('/') ? p : p + '/'; };
const pg = (r) => pages.get(pathOf(r.url)) || {};
const fam = (r) => pg(r).family || '';
const isSidebar = (r) => /^(Clifton Eye Center|Insurance Plans)$/.test(r.label) && r.pageType !== 'home';
const RULES = [
  // ---- the home (rows are its h2/h3 headings; the hero statement is a <p>, so it has no row of its own)
  { id: 'home-first', test: (r) => r.pageType === 'home' && r.index === 1, decision: 'IMPROVE', slot: 'value-proposition', preset: P.hero, as: 'home hero (DESIGN-SPEC 3.3) + Welcome block What\'s New card (3.7)',
    why: 'First home row (its label is the What\'s New post title, the first h2/h3 on the page). The opening of the home, the statement "Your Community Eye Care Clinic, We Know You!" (a <p>, no row of its own), the quick-action dock and the Welcome row holding this What\'s New card, is rebuilt as the Daylight Canopy hero: glass statement over a blurred daylight stage, the source arch photo breaking the stage, the 4 source quick actions as a glass dock (appointment emphasised), then the Welcome block. Copy verbatim.' },
  { id: 'home-offerings', test: (r) => r.pageType === 'home' && r.index === 2, decision: 'IMPROVE', slot: 'benefits-solution', preset: P.frosted, as: 'Welcome practice-copy sheet (3.7)',
    why: '"Our Product Offerings:" and its list sit in the Welcome practice-copy glass sheet (over lime and sun pools), as an h3 and a plain list; the services list above it is a semantic <ul> with the lead terms in <strong> (L07). Copy verbatim.' },
  { id: 'home-service-tile', test: (r) => r.pageType === 'home' && r.index >= 3 && r.index <= 6, decision: 'IMPROVE', slot: 'benefits-solution', preset: P.cardGrid, as: 'service tile (3.6)',
    why: 'Service tile rebuilt as a glass card in a 4-up grid on the services band; the source photo breaks out of the card top (P3) and lifts on hover and keyboard focus. Label verbatim; the pediatric link points at the canonical URL (L09); alt="" (L12).' },
  { id: 'home-qa', test: (r) => r.pageType === 'home' && r.index === 7, decision: 'IMPROVE', slot: 'objection-handling', preset: P.faq, as: '#HeretoHelp Q&A (3.9)',
    why: '"Ask Dr. Deana Clifton a Question..." rebuilt as a glass Q&A panel of <details> items (L05), the first open, beside the #HeretoHelp title and the CSS green-iris illustration that overlaps the panel; shown at every width (L03). Questions and answers verbatim; "More about Dry Eyes..." points at the canonical page (L09).' },
  { id: 'home-emergency', test: (r) => r.pageType === 'home' && r.index === 8, decision: 'IMPROVE', slot: 'strategic-cta', preset: P.cardsFloat, as: 'Visit block: map, NAP card, emergency card (3.12)',
    why: '"Is it an Emergency?" rebuilt as the dark-glass emergency card with an alert icon tile and a tel button, overlapping the keyless map beside the NAP and hours card (today highlighted, L16). Copy verbatim.' },
  // ---- the sidebar (outside <main> on 337 source pages)
  { id: 'sidebar-removed', test: (r) => isSidebar(r) && !pg(r).hasAside, decision: 'REMOVE', slot: 'footer', preset: P.footer, as: '',
    why: 'Sidebar card on a page COMPONENTS C.1 renders without the aside (the blog index, the platform artefacts and /location/clifton-eye-center/, whose own visit block carries the NAP and hours). Every sentence of it is on every other page\'s aside; tools/sentence-parity.mjs counts it as source chrome, not lost copy.' },
  { id: 'sidebar-location', test: (r) => isSidebar(r) && r.label === 'Clifton Eye Center', decision: 'IMPROVE', slot: 'footer', preset: P.frosted, as: 'aside location card (COMPONENTS B.15)',
    why: 'The sidebar location widget rebuilt as the aside\'s glass location card: the name linked to /location/clifton-eye-center/, address, "Phone:" with a tel link, the keyless map (L22) and the hours list with today tinted (L16), under the 4 quick actions. Every value from the source; the search widget above it is removed (L11 row).' },
  { id: 'sidebar-insurance', test: (r) => isSidebar(r) && r.label === 'Insurance Plans', decision: 'IMPROVE', slot: 'objection-handling', preset: P.frosted, as: 'aside insurance card (B.15)',
    why: 'The sidebar "Insurance Plans" widget rebuilt as the aside\'s glass insurance card, text verbatim; the empty h3 before it is dropped (L11 row).' },
  // ---- page families (src/content/site-map.json templates)
  { id: 'template-artefact', test: (r) => /^\/template\//.test(pathOf(r.url)), decision: 'PRESERVE', slot: 'footer', preset: P.frosted, as: 'kept platform artefact (SITE-ARCHITECTURE 11)',
    why: 'Platform template page kept at its own URL with its content (the site header/footer copy) through the content pipeline, noindex as in the source and out of sitemap.xml. Content and function unchanged.' },
  { id: '404', test: (r) => pathOf(r.url) === '/404-page-not-found/', decision: 'IMPROVE', slot: 'footer', preset: P.utility, as: '404 (3.23)',
    why: '404 rebuilt as a plain title band with the source h1 "404" and one glass sheet holding the source copy, the 404.png plate and the source links, with the generated lens prism over its edge (own ADD row). Also emitted as dist/404.html (own ADD row). Copy verbatim.' },
  { id: 'form-page', test: (r) => /^\/contact-us\/(appointment-request-form|contact-form)\/$/.test(pathOf(r.url)), decision: 'IMPROVE', slot: 'strategic-cta', preset: P.forms, as: 'form (COMPONENTS E)',
    why: 'Form page rebuilt with the Gravity Form re-created field for field (labels, descriptions, options, required marks verbatim) on solid paper fields in a glass sheet, native validation with the browser\'s own messages, inert with the honest notice (L23 row). Copy verbatim.' },
  { id: 'patient-forms', test: (r) => pathOf(r.url) === '/contact-us/patient-forms/', decision: 'IMPROVE', slot: 'strategic-cta', preset: P.frosted, as: 'doc cards (F.4)',
    why: 'Patient forms rebuilt as glass sheets with the two PDF links as doc cards pointing at the harvested local PDFs (BUILD-DECISIONS #9; they died with the platform CDN). Copy verbatim.' },
  { id: 'visit-page', test: (r) => /^\/(hours-location|location\/[^/]+)\/$/.test(pathOf(r.url)), decision: 'IMPROVE', slot: 'footer', preset: P.cardsFloat, as: 'visit block (G.9) + payment accordion (F.6)',
    why: 'Hours & location rebuilt as the visit block: the keyless map (L22) with the NAP and hours card overlapping it (today highlighted, L16), the payment accordion (<details>, L05) with the source payment icons, then the source prose in sheets. Copy verbatim.' },
  { id: 'contact-hub', test: (r) => fam(r) === 'contact-forms', decision: 'IMPROVE', slot: 'strategic-cta', preset: P.frosted, as: 'prose sheet + index cards',
    why: 'Contact section page rebuilt as glass prose sheets under a scene title band, with the aside quick actions. Copy verbatim.' },
  { id: 'testimonials', test: (r) => fam(r) === 'testimonials', decision: 'IMPROVE', slot: 'social-proof', preset: P.testimonials, as: 'review card (F.3)',
    why: 'Real patient testimonials rebuilt as glass review cards (quote glyph, 5 stars with the label "5 out of 5 stars", the source quote and name verbatim); the hidden ratingValue microdata is not rendered (L14 row). The /testimonial/* singles keep their URL with the heading "Testimonial" (BUILD-DECISIONS #3), noindex.' },
  { id: 'doctor', test: (r) => fam(r) === 'doctor-team', decision: 'IMPROVE', slot: 'trust-positioning', preset: P.team, as: 'team card (F.4)',
    why: 'Doctor pages rebuilt with the team card (Dr. Clifton\'s real portrait in an arch frame, capped at its native 225px, never beside generated imagery), the bio in a glass sheet and the source call button as a CTA band. The /our-eye-doctors/ band photo is the source\'s stock header, never captioned as the doctor. Copy verbatim.' },
  { id: 'staff', test: (r) => fam(r) === 'staff', decision: 'IMPROVE', slot: 'trust-positioning', preset: P.frosted, as: 'prose sheet (C.4)',
    why: 'Staff page rebuilt as glass prose sheets under a plain title band; the empty team module is dropped (L11 row). Copy verbatim.' },
  { id: 'insurance-logos', test: (r) => fam(r) === 'insurance' && /Plans We Accept/i.test(r.label), decision: 'IMPROVE', slot: 'objection-handling', preset: P.logos, as: 'section title + logo grid (B.21)',
    why: 'Plan heading rebuilt as an interior section title over the carrier logo grid (paper chips, logos at intrinsic size, never upscaled), followed by the source list of plan names. Copy and logos verbatim.' },
  { id: 'insurance', test: (r) => fam(r) === 'insurance', decision: 'IMPROVE', slot: 'objection-handling', preset: P.frosted, as: 'prose sheet, CTA band, index cards',
    why: 'Insurance section rebuilt as glass prose sheets under a photo or scene title band, the source buttons as a CTA band, the child pages as index cards. Copy verbatim.' },
  { id: 'legal', test: (r) => fam(r) === 'legal', decision: 'IMPROVE', slot: 'footer', preset: P.frosted, as: 'prose sheet (C.4)',
    why: 'Legal page rebuilt as glass prose sheets under a plain title band at a 66ch measure. Copy verbatim except the declared vendor sentences on /disclaimer/ (own REMOVE row).' },
  { id: 'archive', test: (r) => fam(r) === 'archive', decision: 'IMPROVE', slot: 'footer', preset: P.cardGrid, as: 'index cards without summaries (F.1)',
    why: 'Archive listing rebuilt as index cards (title links only, as the source lists them) under a plain title band; noindex as in the source; the /category/our-doctors/ search form is removed (L11 row) and its h1 is "Our Doctors" (BUILD-DECISIONS #3).' },
  { id: 'blog-index', test: (r) => fam(r) === 'blog-index', decision: 'IMPROVE', slot: 'benefits-solution', preset: P.blog, as: 'post card (F.2)',
    why: 'Blog summary rebuilt as a post card (date pill, title link, source excerpt, the source "Read More") in the 3/2/1-column grid of all 151 posts on the one /whats-new/ URL, in source order, no pagination (as the source). Copy verbatim.' },
  { id: 'blog-post', test: (r) => fam(r) === 'blog-post', decision: 'IMPROVE', slot: 'benefits-solution', preset: P.frosted, as: 'prose sheet (C.4) under a plain band with the date pill (C.3)',
    why: 'Blog post section rebuilt as a glass prose sheet (66ch measure, display headings, tables in a labelled scroll region, the source picture on a paper plate or breaking out as a photo figure) under a plain title band with the date pill. Copy verbatim.' },
  { id: 'article', test: (r) => /^(library-article|service-hub|service-detail|eyewear-contacts)$/.test(fam(r)), decision: 'IMPROVE', slot: 'benefits-solution', preset: P.frosted, as: 'prose sheet (C.4) + section rail (L19)',
    why: 'Article section rebuilt as a glass prose sheet (66ch measure, display headings, educational diagrams on white plates, photos breaking out of the sheet edge) under a scene, photo or plain title band, with the in-section rail and the aside; child pages as index cards, source buttons as a CTA band, logo walls as paper chips. Copy verbatim.' },
];

const ledger0 = JSON.parse(fs.readFileSync(ledgerFile, 'utf8'));
const existing = new Set(ledger0.rows.map((r) => r.id));
const toInsert = ADDED.filter((r) => !existing.has(r.id));
if (!DRY && toInsert.length) {
  for (const r of toInsert) ledger0.rows.push({ id: r.id, url: r.url, pageType: 'site', index: r.index, label: r.label, sourceTag: 'ledger-added', sourceClass: '', decision: 'UNSET', why: '', narrativeSlot: '', presetId: '', rebuiltAs: '' });
  ledger0.rowCount = ledger0.rows.length;
  fs.writeFileSync(ledgerFile, JSON.stringify(ledger0, null, 2));
}
const addedById = new Map(ADDED.map((r) => [r.id, r]));
const plan = [];
const planRows = DRY ? ledger0.rows.concat(toInsert.map((r) => ({ id: r.id, sourceTag: 'ledger-added' }))) : ledger0.rows;   /* a dry run plans the rows it would insert */
for (const r of planRows) {
  const a = addedById.get(r.id);
  if (a) { plan.push({ id: r.id, rule: 'added:' + a.key, decision: a.decision, slot: a.slot, preset: a.preset, why: a.why, as: '' }); continue; }
  if (!r.id.includes('#ledger-') && r.sourceTag === 'ledger-added') throw new Error('stale added row with no rule: ' + r.id);
  const rule = RULES.find((x) => x.test(r));
  if (!rule) throw new Error('no rule for row ' + r.id + ' (family ' + fam(r) + ')');
  plan.push({ id: r.id, rule: rule.id, decision: rule.decision, slot: rule.slot, preset: rule.preset, why: rule.why, as: rule.as });
}
const noSlot = plan.filter((p) => !p.slot);   /* every row names the narrative slot it serves (task: decision + slot + why) */
if (noSlot.length) throw new Error(noSlot.length + ' row(s) without a narrative slot, e.g. ' + noSlot.slice(0, 3).map((p) => p.id + ' (' + p.rule + ')').join(', '));
const noWhy = plan.filter((p) => !p.why);
if (noWhy.length) throw new Error(noWhy.length + ' row(s) without a why');
const tally = {}; for (const p of plan) tally[p.rule] = (tally[p.rule] || 0) + 1;
const decisions = {}; for (const p of plan) decisions[p.decision] = (decisions[p.decision] || 0) + 1;
const rulesFile = path.join(ROOT, 'audit/ledger-rules.json');
fs.writeFileSync(rulesFile, JSON.stringify({ schema: 'cec/ledger-rules@1', presets: P, rules: RULES.map(({ test, ...r }) => r), added: ADDED.map(({ id, key, decision, label }) => ({ id, key, decision, label })), tally, decisions, plan }, null, 1));
console.log('rows', plan.length, '(added', ADDED.length, 'defined,', toInsert.length, DRY ? 'would be inserted)' : 'inserted now)', JSON.stringify(decisions));
console.log('rules', JSON.stringify(tally));
if (DRY) process.exit(0);

let n = 0;
if (!PRESETS_ONLY) for (const p of plan) {
  const argv = [path.join(SKILL, 'sr-plan.mjs'), '--project', ROOT, '--set', p.id, '--decision', p.decision, '--why', p.why];
  if (p.slot) argv.push('--slot', p.slot);
  if (p.as) argv.push('--as', p.as);
  execFileSync(process.execPath, argv, { stdio: 'pipe' });
  if (++n % 200 === 0) console.log('  decisions set', n);
}

/* presets: the matcher runs once (its verdict is kept), then every row is answered with the preset of the
   component the build renders, in batches under the Windows command-line limit. sr-match exits 1 while
   any matcher row is still UNDECIDED, so every batch but the last exits 1 BY DESIGN: a batch is accepted
   only when its stdout confirms every answer and reports the remaining count; the LAST must exit 0. */
const matchFile = path.join(ROOT, 'audit/preset-match.json');
const verdictFile = path.join(ROOT, 'audit/preset-match.matcher-verdict.json');
if (!fs.existsSync(verdictFile)) {
  const m = spawnSync(process.execPath, [path.join(SKILL, 'sr-match.mjs'), '--project', ROOT], { encoding: 'utf8', maxBuffer: 1 << 26 });
  if (!fs.existsSync(matchFile)) throw new Error('sr-match wrote no audit/preset-match.json: ' + (m.stderr || m.stdout).slice(-800));
  fs.copyFileSync(matchFile, verdictFile);
  console.log('matcher ran: exit', m.status, '| verdict kept in audit/preset-match.matcher-verdict.json');
}
const baseline = JSON.parse(fs.readFileSync(verdictFile, 'utf8'));
const matcherPick = new Map((baseline.rows || []).filter((r) => r.status === 'MATCHED').map((r) => [r.rowId, r.chosen || (r.candidates && r.candidates[0] && r.candidates[0].presetId)]));
const batches = []; let cur = [], len = 0;
for (const p of plan) { const s = p.id + '=' + p.preset; if (len + s.length > 20000) { batches.push(cur); cur = []; len = 0; } cur.push(s); len += s.length + 12; }
if (cur.length) batches.push(cur);
let done = 0, remaining = null;
batches.forEach((b, i) => {
  const r = spawnSync(process.execPath, [path.join(SKILL, 'sr-match.mjs'), '--project', ROOT, ...b.flatMap((x) => ['--answer', x])], { encoding: 'utf8', maxBuffer: 1 << 26 });
  const ok = (r.stdout.match(/^\s*answered /gm) || []).length;
  const m = r.stdout.match(/remaining undecided: (\d+)/);
  if (ok !== b.length || !m) throw new Error('sr-match batch ' + (i + 1) + ': ' + ok + '/' + b.length + ' answered · ' + (r.stderr || r.stdout).slice(-600));
  remaining = Number(m[1]);
  const last = i === batches.length - 1;
  if (last ? r.status !== 0 : r.status > 1) throw new Error('sr-match batch ' + (i + 1) + ' exit ' + r.status + ' with ' + remaining + ' undecided');
  done += ok;
});
const overridden = plan.filter((p) => matcherPick.has(p.id) && matcherPick.get(p.id) !== p.preset).map((p) => ({ id: p.id, matcher: matcherPick.get(p.id), answered: p.preset }));
const rules = JSON.parse(fs.readFileSync(rulesFile, 'utf8'));
rules.matcherOverrides = { note: 'Rows the layout matcher had MATCHED on its own whose preset was replaced by the one the rebuild actually renders (matcher verdict kept in audit/preset-match.matcher-verdict.json).', count: overridden.length, rows: overridden };
fs.writeFileSync(rulesFile, JSON.stringify(rules, null, 1));
console.log('decisions set', n, '· presets answered', done, 'in', batches.length, 'batches · undecided now', remaining, '· matcher picks overridden', overridden.length);
process.exit(0);
