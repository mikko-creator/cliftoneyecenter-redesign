# Port notes: friscoeyesource build → cliftoneyecenter

Brief for the build agent. It covers every extraction rule, selector, marker and regex that
`C:\Users\Dell\friscoeyesource-reforge\src\build.mjs` and `src/lib/{content,forms,home,seo,images,templates,util}.mjs`
depend on, measured against BOTH raw corpora and classified. Read it together with `docs/SITE-ARCHITECTURE.md` and
`src/content/site-map.json`. The reference project is read-only; nothing there was modified.

## 0. How the numbers were produced

- **Reference code read in full:** build.mjs 422 lines, content.mjs 540, forms.mjs 236, home.mjs 398, seo.mjs 121,
  images.mjs 95, templates.mjs 182, util.mjs 89.
- **Census** (`tmp/port-census/census.mjs`, output `census.json`): 149 markers counted per file.
  **here** = `audit/raw/*.html` (349 files). **there** = `friscoeyesource-reforge/audit/raw/*.html` (287 files).
  Cells read "files (hits)". Regions: `markup` is the raw HTML minus `<script>`, `<style>` and comments (so CSS/JS
  mentions do not count; a whole-file grep reports `ecp-breadcrumb` in 349/349 files but the element exists in
  338); `main` is `<main…>…</main>` of the markup; `sidebar` runs from `div.ecp-secondary` to the footer wrapper;
  `header`, `footer` and `head` are the obvious landmarks; `doc` is the raw bytes. Re-run with
  `node tmp/port-census/census.mjs out.json audit/raw <frisco>/audit/raw`.
- **Harness, used as a positive control** (`tmp/port-census/harness.mjs`, outputs `harness-{clifton,frisco}.json`).
  The reference functions (`createContent().mainRegion / sanitize / takeSourceTrail / splitSections / dedupeSections`,
  `formsFor`) are imported read-only and run over each corpus with that project's own `content-inventory.json` and
  `image-inventory.json`. On the Frisco corpus it reproduces Frisco's known behaviour: a real appointment form on
  285 pages, 225 source trails taken, 38 map keys stripped, 36 "Request Appointment" widget titles dropped, and 6
  vendor sentences removed. So a divergence on Clifton is a property of Clifton's markup, not of the harness.
- **Legend.** CARRY: carries over unchanged. CHANGE: must change (how is stated). NEW: the marker exists only here
  and needs a rule. INERT: 0 hits here, so the rule is harmless and may be deleted.

### Harness results side by side (reference code, unmodified)

| Measure | here (349) | there (287) |
|---|---|---|
| `mainRegion` picks `<main>` / `<body>` / no main | 323 / **23** / 3 | 248 / 37 / 2 |
| Source breadcrumb trail taken by `takeSourceTrail` | 280 | 225 |
| Pages left with the source crumb "Home » …" as their first content paragraph | **58** | 59 |
| Pages whose sanitised content still holds an `<h1>` | 10 | 2 |
| `formsFor`: real source form / **invented DEFAULT_FIELDS stub** / none | 2 / **347** / 0 | 285 / 2 / 0 |
| `content-inventory` pages with `forms.length > 0` (feeds the stub fallback) | 349 | 287 |
| Sections after split + dedupe | 867 | 683 |
| anchorsFlattened · looseRunsWrapped · tablesWrapped | 186 · 4178 · 1 | 266 · 3214 · 1 |
| mapKeysStripped (= mapPlaceIdsResolved) | 24 | 38 |
| widgetTitlesDropped ("Request Appointment") | 0 | 36 |
| vendorClauses / vendorParas | 6 / 1 | 6 / 1 |
| dupSectionsDropped / emptySectionsDropped | 2 / 2 | 3 / 1 |
| Internal targets unwrapped as dead (MOVED = empty here, Frisco's MOVED there) | 13 targets, 21 refs | 10 targets |
| Content images failing lookup (with every inventory src mapped) | 0 | 0 |

## 1. Blockers: porting these unchanged ships wrong or invented content

| # | Rule | Evidence (here vs there) | Failure if ported as-is | Required change |
|---|---|---|---|---|
| **F-1** | `forms.mjs formsFor` L207-218 with `DEFAULT_FIELDS` L198-203 | Harness: invented stub on **347/349** here vs 2/287 there. Gravity Forms wrapper G1: **2** files here vs 285 there. The sidebar appointment widget G3 is 0 vs 283. `page.forms` is non-empty on 349/349 because the extractor counted the search and voice-search forms | Every page except the two form pages gets a fabricated "Request An Appointment" form (Name*, Phone*, Email*, Comments). That is invented UI and copy (bylaw B3) | Delete the fallback. Render a form **only** where `div.gform_wrapper` sits inside `<main>` (`/contact-us/appointment-request-form/`, `/contact-us/contact-form/`). The interior "request appointment" affordance is the source's sidebar badge set (4 links), not a form |
| **F-2** | `forms.mjs scanSourceForm` L19-20 scans the RAW document with `/<form[\s\S]*?<\/form>/gi` | G12: the literal `"<form></form><form></form>"` inside inline jQuery occurs in **347 files (694 hits)** here vs 2 (4) there | On 347 pages the longest "non-search form" candidate is that jQuery string; today it yields null, which is what triggers F-1. Any later rule that trusts the raw scan inherits it | Scan the script-stripped markup, never the raw bytes |
| **F-3** | `forms.mjs formShell` L221-236 | Authored strings: default heading "Request An Appointment", button "Submit Request", note "Please do not send personal health information through this form." Source here: GF submit value "Submit" (2/2); form page h1s "Appointment Request Form" and "Email Us"; no PHI note anywhere (0 files) | Rewrites source labels and adds authored copy | Heading = the page's own h1; button = "Submit"; drop the PHI note or record it as an authored UI addition (open question). `mailto:` target: the only published address is `cliftoneyecenter@yahoo.com` (1 file, `/website-accessibility-policy/`) |
| **R-1** | `content.mjs mainRegion` L84-96 (bodyChars heuristic) | Harness: `<body>` chosen on **23** pages here (37 there). On those 23 the sidebar leaks into content: the "Insurance Plans" widget text on 23/23 and the hours list on 22/23. Their bodyChars run 1,947–3,864 against a main text of 54–935 chars | Sidebar widgets are rendered as page copy on /contact-us/, /the-staff/, the tag and category archives, the testimonials, /location/…, /order-contacts-online/ and 13 more | Use `<main>` whenever it exists (A1: 346/349). Use `<body>` only for the 3 `/template/*` pages (no main). The sidebar (A10: 337 files, always OUTSIDE main, A11 = 0) becomes chrome. **Parity:** the content-inventory `bodyText` of those 23 pages includes sidebar sentences, so exclude sidebar/widget sentences when scoring them, or render the widgets in the aside |
| **R-2** | `content.mjs takeSourceTrail` L521-537 | C1 `div.ecp-breadcrumb` in main: **338** here / 284 there. C3 `<p>Home »` in the raw: 0 / 0 (the `<p>` only appears after sanitising). The regex caps the crumb at 300 chars **after** hrefs are relativised: trail taken on 280/338 here (225/284 there), and **58** pages here (59 there) keep "Home » …" as their first content paragraph. Verified in Frisco's shipped output: `dist/eye-care-services/your-eye-health/eye-exams/common-tests/autorefractor/index.html` has the hero trail "Home » Autorefractor" (4 segments lost) and its first content card opens with the source crumb | A duplicated breadcrumb in body copy, and truncated hero trails, on every library page at depth 4–5 | Parse `div.ecp-breadcrumb` from the RAW main **before** sanitising: segments = each `<a href>` text + the trailing text node, split on `span.ecp-breadcrumb-separator` (338 files, 950 separators); then delete the div. Edge cases: archives print a bare "Home »"; testimonials print "Home » »" (empty title) |
| **S-1** | `build.mjs` L270 `robots = NOINDEX_PAGES.has(slug) ? … : s.metaRobots` | `seo-inventory.metaRobots` is `max-image-preview:large` on **349/349**. The raw heads carry a SECOND `<meta name="robots">` on 224 pages here (K3: **217 noindex** variants, 7 `index,follow`) and on 192 there (168 noindex). Frisco's dist emits noindex on 16 pages only, so the Frisco port silently dropped 168 source noindex directives | The rebuild would make 217 syndicated or duplicate pages indexable: 101/101 library, 86/151 posts, 20/47 eyewear, 5 archives, 4 artefacts, 1 service page | Read ALL robots metas from the raw `<head>` and merge them, most restrictive wins; emit the result; leave noindex pages out of `sitemap.xml`. Keeping all 217 is the default (it preserves the live indexing state); changing it is an owner decision |
| **L-1** | `seo.mjs MOVED` L29-42 (12 Frisco pairs) | Harness with an empty MOVED: 13 dead targets / 21 refs here. 7 of them (13 refs) are live **aliases** (site-inventory): the home's 4 designer cards → `/eyeglasses/designer-frames`, 3 "More about Dry Eyes..." links → `/eye-care-services/dry-eye-disease-and-treatment`, 1 services tile → `/eye-care-services/pediatric-eye-exams` (8 home refs), plus 5 refs on library and eyewear pages (`/your-eye-health/protecting-your-eyes` ×2, `/your-eye-health/eye-diseases`, `/your-eye-health/eye-conditions`, `/eyeglasses-contacts/designer-frames`). 2 are 404s whose content exists (cataracts, macular-degeneration); 4 targets (6 refs) are dead (glare, uv-rays, cataracts-video, consider-a-second-pair). The Frisco pair `our-eye-doctors → our-eye-doctor` is **wrong here**: `/our-eye-doctors/` is the real page. It only stays harmless because `localHref` checks `willExist` first | Home CTAs unwrapped into plain text | MOVED = the 7 `site-inventory` aliases + `your-eye-health/eye-diseases/cataracts → eye-care-services/your-eye-health/eye-diseases/cataracts` + `your-eye-health/eye-diseases/macular-degeneration → eye-care-services/your-eye-health/eye-diseases/macular-degeneration`. The 4 dead targets are unwrapped (words kept) and listed in `audit/dead-links.json` |
| **H-1** | `home.mjs buildHome` L30-398 | J1: **0 of the 9** Frisco anchor headings are in `index.html` here (8 there), so it throws "homepage anchors not found". Review regex L93 `ecp-review splide__slide`: H1 is 0 here / 1 file (7) there. `data-slide-url` J2: 0 / 1. All of the Frisco `srcImg` names (happy_mother_daughter, doctors_picture, IMG_049x, carolina-bonito, BB-Hero-male, eye-emergencies-bg, joanna-kosinska, IMG_0481) have 0 hits in this inventory | Build aborts | Rewrite the composer around the 9 Beaver Builder rows (by `data-node`, SITE-ARCHITECTURE §5), reading the RAW row markup. 6 of the home's visual headings are `div.ecp-heading` (the 3 hero lines, "Our Most Popular Services", "#HappyPatients", "#HeretoHelp"), and "Our Designer Optical" is a styled `<p>`. Sanitising flattens both kinds to `<p>` (J8: 13 on 5 pages here, 0 there). Keep `blocksOf` and the leftover accounting (no silent drops). Testimonials: see §2.3 |
| **X-1** | Hidden content: `sanitize` strips attributes but keeps children | `style="…display:none"` in main: **7 files (21)** here vs 5 (11). `[hidden]`: 2 (4) vs 1 (1). `itemprop="ratingValue"` (inside a `display:none` span): **5 files (9)** here vs 1 (1) | A stray visible "5" before each of the 9 testimonial cards (home ×3, /contact-us/testimonials/ ×3, 3 singles) | NEW pre-sanitise step: remove `span[itemprop=ratingValue]` (use the count of `span.ecp-rating-star-full` as the star count; H3 = 45 = 9 × 5). The GF wrapper `display:none` goes with its form. The home accordion answers `div.ecp-accordion-content[hidden]` (3) are real copy: render them as `<details>` |
| **I-1** | Identity constants | Logo `/black-version-eye-source-logo/` D17: 0 here / 287 there; Clifton logo `clifton_eye_center_medium-e1478229278850.jpg` D18: 349 (1,519 refs). Favicon `/1526401368\.png/` D20: 0 / 287, and `<link rel=icon>` D19: 0 / 287 (**this site ships no favicon**). FONTS: Raleway TTFs (Frisco). The source here uses the Arial/Helvetica stack; the only harvested font is `EyeCarePro-Icons` (must not ship). Hero film `assets/media/hero-eyewear.*` belongs to the Frisco owner. `ALT_OVERRIDES`: 7 Frisco files, 0 present. `seo.jsonLd` hard-codes Frisco / TX / 75034 plus a fax | `srcImg` throws, `fail('build:asset', favicon)`, Frisco facts leak into the JSON-LD | Swap every constant (§2.4, §2.7, §2.8). Clifton has **no fax** (0 of 349 pages carry one) |
| **G-1** | Content images with no usable file | 291 `<img>` in main: 285 real images on disk, **5 missing** (404 at source) and **1 HTML soft-404** (`/why-do-we-need-glasses/clipart/instruments/clipart-010.jpg`, flagged UNRECOGNISED-FORMAT; `sniff()` returns null) | `fail('build:asset', …)` for 6 images | For each, decide a stand-in via `image-plan.json fillFor` (declared as generated) or a declared removal (ledger row). List: SITE-ARCHITECTURE §12 |

## 2. Rule by rule

### 2.1 content.mjs

| Rule (line) | Marker / selector | here | there | Verdict | Action / note |
|---|---|---|---|---|---|
| `mainRegion` (84-96) | `<main class="ecp-primary" id="content">` (A2) | 346 | 285 | CHANGE | R-1 |
| DROP_WHOLE `header` (14) | `<header class="ecp-entry-header">` in main (A4) | 346 | 285 | CARRY | Removes the platform title `h1.ecp-entry-title` (A5: 337 vs 284) with it. The hero prints `page.h1` |
| same | empty entry header (A6) | 9 | 1 | CARRY | Builder pages (the h1 lives in the layout, A7: 10 files / 13 h1 vs 2 / 4). The text-matched h1 removal in build.mjs 217-223 plus the h1→h2 demotion handle it (harness: h1 survives sanitising on 10 pages) |
| DROP_WHOLE `aside`/`nav` (14) | `<aside>` anywhere / `<nav>` in main (A12, B3) | 0 / 0 | 0 / 0 | INERT | The sidebar is a `div` (A10: 337 vs 284) and is excluded only by the region choice |
| DROP_WHOLE `svg/form/button` (14) | in main (B4 / B5 / B6) | 14 (96) / 7 (7) / 5 (5) | 3 (47) / 5 (6) / 1 (1) | CARRY | Star icons, badge icons, 2 GF forms + 5 search modules |
| skip link (166) | "Skip to main content" (B8; B9 in main) | 349; 0 in main | 287; 0 in main | INERT inside main | The chrome supplies its own skip link |
| dismiss glyph (168) | `<a href="#">x</a>` (B10) | 0 | 287 | INERT | No announcement bar here |
| `href="#"` dropped (191) | in main (B11) | 1 (3) | 0 | CARRY | The home accordion toggles (their icons only; the question label is a sibling span, kept) |
| anchor with block children (170-174) | B12 | 9 (44) | 1 (4) | CARRY | Gallery tiles, photo callouts, badges, childpage items |
| `img` src / data-src (198-209) | `<img>` in main (D1); data-src (D7); srcset (D8) | 198 (291); 0; 0 | 135 (205); 0; 0 | CARRY | Hosts in main: `da4e1j5r7gw87.cloudfront.net` 105 (150) vs 71 (97); clipart CDN `d3dhq28juvmj53` 82 (87) vs 56 (61); `storage.googleapis.com` 2 (39) vs 2 (40); `static.ecpbuilder.com` 10 (10) vs 5 (5) |
| imgBase = page URL + `/` (163) | root-relative src (D4); page-relative (D5) | 2 (2); 2 (2) | 1 (1); 1 (1) | CARRY | All 4 resolve correctly; 3 of them 404 and 1 is a soft-404 (G-1) |
| `baseKey` pagespeed (33-37) | `.pagespeed.xx.HASH.ext` (D6, doc) | 1 (1) | 2 (2) | CARRY | The one hit (`xAfrican-Woman-…`) is a 404 whose base name is not in the inventory either |
| `dekeyMapEmbed` (117-131) | keyed `maps/embed/v1` iframe (F1 markup / F2 main / F3 sidebar) | 338 / 3 / 335 | 284 / 3 / 281 | CARRY | With a main-only region, 3 in-content maps (home, /hours-location/, /location/clifton-eye-center/). `q=place_id:ChIJn41mUbs0MYYRBw9ZpWeJ-YM` (F4) is on 338/338, so set `ctx.mapQuery = "Clifton Eye Center, 1000 Chinaberry Drive, Suite 302, Bossier City, LA 71111"`. That the keyless endpoint resolves this query is **unverified** (no live request in this run); check it in browser QA |
| iframe title (216-220) | iframe without a title in main (F10) | 2 (2) | 2 (2) | CARRY | 2 YouTube (`9XayZ3skcdg`, `H45GYPAuTdg`) → "YouTube video". YourLens branch F6: 0 vs 1, INERT |
| heading id → `data-src-id` (224-227) | M5 | 7 (18) | 5 (9) | CARRY | |
| `restoreAnchorTargets` (264-283) | `href="#x"` in main (M6) | 3 (9) | 1 (3) | CARRY | Glaucoma library TOCs |
| `fillIconLinks` / `SOCIAL_HOSTS` (21-25, 63-80) | icon-only social anchor in main (E7) | 0 | 0 | INERT in content | The footer Facebook link is chrome (templates) |
| `stripVendorClauses` (100-113) | "EyeCarePro" inside a `<p>` in main (E5) | 1 (3) | 1 (3) | CARRY | `/disclaimer/`: 3 paragraphs, 6 sentences (harness: 6 clauses, 1 whole paragraph, identical to Frisco) |
| `localHref` (42-61) | absolute own-origin hrefs in main (E1 here / E2 there) | 181 (1,009) | 181 (844) | CARRY | Origin swap only (`chrome.origin`). E8 legacy `/your-eye-health/` hrefs: 6 (11) vs 6 (12), see L-1 |
| `wrapLooseText` / `balanceFragment` / `dropEmptyShells` / `dedupe*` / `finishSection` | none | see harness | | CARRY | Generic |
| "Request Appointment" widget title (242) | M4 | 0 | 0 in main | INERT | There is no appointment widget here |
| empty headings (244) | M7 | 3 (3) | 0 | CARRY | The empty h1 of the 3 testimonial singles, so the hero has no text (open question) |
| tables (247-257) | M2 | 1 (1) | 1 (1) | CARRY | `/1-eye-allergies-2016/` |
| `stripBogusComments` (319-327) | M1 | 0 | 1 (1) | INERT | |
| `imgRole` DIAGRAM (19, 366-377) | D14 | 18 (18) | 13 (13) | CARRY | |
| `takeSourceTrail` (521-537) | C1-C4 | 338 | 284 | CHANGE | R-2 |
| `decodeEntities` (util 8-17), used by `plain()` / `blockKey` | named entities in main that it does not decode | hellip 8, reg 5, trade 1, ouml 2 | hellip 2, reg 5, ouml 2 | CARRY (+tiny fix) | Affects text keys only, not output HTML. Add `&hellip;` `&reg;` `&trade;` `&ouml;` `&copy;` for exact parity keys |
| **NEW** `div.ecp-heading` visual headings | J8 | 5 (13) | 0 | NEW | Sanitising turns them into `<p>`. Per page: home 6 (the 3 hero lines, "Our Most Popular Services", "#HappyPatients", "#HeretoHelp"), designer-frames 3 ("SEE BETTER", "LIVE BETTER", "#TELLITLIKEITIS"), contact-lenses 2 (incl. "Our Recommended Brands:"), insurance 1 ("WE'VE GOT YOU COVERED"), hours-location 1 (the "Forms of Payment" heading-accordion). Map them to real headings in the builder-page composers |
| **NEW** heading accordions | B14 `div.ecp-heading-accordion-wrapper` (`data-accordion-target-next`) | 3 (3) | 0 | NEW | /hours-location/ ("Forms of Payment" → the payment icons module), /eyeglasses-contacts/contact-lenses/, …/designer-frames/. The collapsed content is the NEXT module |
| **NEW** Q&A accordion | B13 `ecp-accordion` / B15 `[hidden]` panels | 1 (23) / 1 (3) | 0 / 0 | NEW | Home only. Question = `span.ecp-accordion-trigger-label`, answer = `div.ecp-accordion-content` |
| **NEW** hidden nodes | X-1 | 7 (21) | 5 (11) | NEW | X-1 |
| **NEW** WOW.js classes | B16 | 4 (18) | 0 | NEW (strip) | Source motion evidence only: fadeInDownBig, bounceInLeft, fadeInUpBig, bounceInDown, pulse, shake, fadeInLeftBig |
| **NEW** empty team modules | B21 `ecp-posts-wrapper-team` in main | 4 (5) | 3 (4) | CARRY | They render nothing on the home and on /the-staff/, and drop out naturally |
| **NEW** device-only BB rows | B26 `fl-visible-desktop/mobile` in main | 3 (10) | 1 (17) | CHANGE (decide) | Home rows 5-7 are desktop-only (reviews, Q&A, brands); designer-frames and our-eye-doctors each have a desktop hero-text row plus an EMPTY mobile row, so no copy is doubled. Show everything at every width and record it as a UX change |
| **NEW** row background photos | D9 `data-background-image-src` (markup) | 9 (12) | 1 (7) | NEW | Not an `<img>`, so sanitising never sees them (the home hero `Girl-Smiling-Brown-Hair-1280x853.jpg`, the hub heroes). The composers must read them explicitly |
| **NEW** child-page listings | B17 `div.ecp-childpages` / B18 thumbnails | 29 files, 169 items / 4 files, 25 thumbs | 31 / 0 | CARRY (+design) | Kept today as ul/li + summary text. They are the ONLY sub-navigation (the menu has no dropdowns), so give them a designed card grid |

### 2.2 forms.mjs

| Rule (line) | Marker | here | there | Verdict | Note |
|---|---|---|---|---|---|
| `scanSourceForm` raw form regex (19-20) | G12 jQuery `<form></form>` literal (doc) | 347 (694) | 2 (4) | CHANGE | F-2 |
| `isSearchForm` (9-11) | `role=search` (G10) / voice `name="s"` (G11) | 341 (342) / 347 | 284 (285) / 0 | CARRY | Both are filtered correctly (harness: never chosen) |
| `hasOwnMainForm` (12-15) | GF in main (G2) | 2 (2) | 4 (5) | CARRY | |
| `scope:'chrome'` second form | GF outside main (G3) | 0 | 283 | INERT | No sidebar appointment widget |
| honeypot strip (27-29) | `gform_validation_container` (G4) | 2 (2) | 285 (288) | CARRY | The honeypot labels here are "Email" (form 9) and "Phone" (form 10), so left in they would pose as duplicate real fields |
| akismet strip (29) | G5 | 2 (2) | 285 (288) | CARRY | |
| `FORM_NOISE` (7) | "This field is for validation purposes" (G6) | 2 (2) | 285 (288) | CARRY | The clone-removals row count becomes **2 pages**, not 285 |
| label↔control by `for`/`id` (77-80) | GF `label for="input_N_…"` (G9) | 2 (18) | 285 (1,805) | CARRY | Harness: form 9 → 15 controls, form 10 → 9, every label paired. The time field's visible sub-labels become "Hours" / "Minutes" / "AM/PM" (GF screen-reader labels); the HH/MM placeholders and the ":" are lost (cosmetic) |
| required detection (104) | `gfield_required` (G7) / `aria-required` (G8) | 2 (16) / 2 (8) | 285 (3,454) / 285 (1,442) | CARRY | |
| complex fields | `gfield--type-name/time` (G15) | 2 (3) | 285 (293) | CARRY | |
| field descriptions | `gfield_description` → `p.form-note` | 5 real + 2 honeypot | n/a | CARRY | Source copy, kept |
| `typeForLabel` (57-66) | none | | | CARRY | |
| `DEFAULT_FIELDS` + fallback (198-218) | none | stub 347 | stub 2 | CHANGE | F-1 |
| `formShell` (221-236) | none | | | CHANGE | F-3. The `data-needs-backend` offline notice is a UI label, so keep it (see open questions) |

### 2.3 home.mjs

| Rule (line) | Frisco marker | here | there | Verdict | Clifton replacement |
|---|---|---|---|---|---|
| `blocksOf` (12-28) | none | | | CARRY | |
| anchor headings (45-56) | 9 Frisco headings (J1) | 0 in index.html | 8 | CHANGE | Anchor on the BB rows: `5ded9754972ce` hero · `5ded9754977e9` quick actions · `5ded975497569` welcome h1 · `5df6091f63e9d` promo + What's New + welcome copy · `5ded97549790b` services tiles · `5ded975498007` #HappyPatients · `5ded975497aee` #HeretoHelp Q&A · `5ded9754987c6` designer optical · `5ded975497d41` map / NAP+hours / emergency |
| intro + quick-action row (59-74) | `chrome.quickActions` | | | CHANGE | 4 badges (J7: 9 files / 36 class hits). Labels: Email Us, Schedule An Appointment, Patient Forms, Order Contacts Online |
| doctor block (77-91) | `doctors_picture`, "Carey Brooks, OD" | 0 | 1 | CHANGE | The home has no doctor block; its team module is EMPTY. The doctor lives at /our-eye-doctors/ and /team/dr-deana-clifton-od/ (portrait `deana_GSP_UID_8da55bc2-…png`) |
| reviews (92-99) | `div.ecp-review.splide__slide`, `.ecp-review-comment`, `.ecp-review-name`, `ecp-rating-star-full` (H1/H2/H3) | 0 / 0 / 5 (45) | 1 (7) / 1 (7) / 2 (40) | CHANGE | `div.ecp-post.ecp-posttype-testimonial` (H4: 5 files, 9 cards) → text `div.ecp-post-content` (the home copy is a truncated excerpt ending "..."; the full text is on /contact-us/testimonials/), name `div.ecp-post-attribute` (strip the leading "- "), stars = count of `span.ecp-rating-star-full` |
| relative times (105-112) | "N weeks ago" (H7) | 0 | 1 (7) | INERT | |
| designer shop (115-124) | "Our Designer Optical Shop" | 0 | 1 | CHANGE | Row 7: 4 `ecp-callout` photo cards (J6), captions KAENON / IZOD / ALAN J / CONVERSE, each linking to the alias `/eyeglasses/designer-frames/` |
| featuring / Optos (138-142) | `NowFeaturing`, `data-slide-url` (J2) | 0 | 1 | INERT | |
| sharp-vision trio (145-155) | h2 + (img, heading, p) ×3 | 0 | 1 | CHANGE | Row 4 services gallery: 4 `ecp-gallery-item` tiles (J3 16 = 4 × 4 classes), h2 caption, linked photo |
| emergencies (158-162) | `cross-eye-emerg` (D16) | 0 | 1 (2) | INERT | Row 8 col 3: h3 "Is it an Emergency?" + paragraph + tel button |
| news (165-181) | h5 title (I7) + date regex `^[A-Z][a-z]{2} \d{1,2}, \d{4}$` (I3) | h5: 0; date format: 153 files (303) | h5: 1 (3); date: 90 (179) | CHANGE (title) / CARRY (date) | Row 3 left column: **1** post, h3 title link, date "Nov 26, 2019", excerpt, "Read More" |
| contact / locate / hours (184-189) | "Contact Us" / "Locate Us" / "Hours" | 0 | 1 | CHANGE | Row 8: map iframe · NAP + 7-day hours (`ecp-post-hours-item`) · emergency |
| leftover accounting (194-206) | none | | | CARRY | Keep "nothing dropped silently" |
| render (209-397) | srcImg names, `chrome.nav[2..3]`, hero film | 0 | | CHANGE | New design; the imagery comes from this inventory and the fal plan |

### 2.4 seo.mjs

| Rule (line) | here | there | Verdict | Note |
|---|---|---|---|---|
| `NOINDEX_PAGES` (9-15), 16 Frisco slugs | 8 of the 16 slugs exist here (404-page-not-found, category/our-doctors, category/uncategorized, tag/all-about-vision, tag/eye-emergencies, tag/gsp-eye-emergencies, template/footer, template/header); author/* and slideshow/* do not | | CHANGE | Replace with the source robots (S-1) plus `site-map.json artefacts` (15 rows: 13 keep+noindex, including template/inner-header, the 3 testimonials and cataract-awareness-month-2016-2; 2 keep) |
| `CANONICAL_OVERRIDE` (21-24) | 0 of its 2 slugs exist | 2 | INERT → empty | Source canonicals here: self on 344, missing on 5 (archives; K1 344 vs 280), none pointing elsewhere. `/pink-stinging-eyes/` vs `/pink-stinging-eyes-it-could-be-pink-eye/` share 99% of their words and both self-canonicalise; leave as is unless the owner decides |
| `MOVED` (29-42) | see L-1 | | CHANGE | |
| `DANGLING_TAIL` (44) | K6: 0 | 4 | INERT | Keep it; it costs nothing |
| `ARCHIVE_PAGE` title rule (45, 52) | 5 archives borrow or have empty titles | | CARRY | `/category/our-doctors/` becomes its h1 "Nothing Found" |
| empty `<title>` (not handled) | 4 pages (category/our-doctors, 3 testimonials), og:title also empty | 0 | CHANGE | `pageTitle` returns ''. Needs a rule that invents nothing (open question) |
| `deriveDescription` (62-76) | description missing on 168 (K2 present 181) | 117 missing (170 present) | CARRY | |
| `canonicalSlugFor` (79-92) | | | CARRY | |
| `to24` (94-100) | "8:30 AM - 4:30 PM" → 08:30 / 16:30 | | CARRY | |
| `jsonLd` (103-121) | Source JSON-LD: `WebPage` + `Organization` on 349/349 (K5) | 287 | CHANGE | `Optometric`: name "Clifton Eye Center", streetAddress "1000 Chinaberry Drive, Suite 302", addressLocality "Bossier City", addressRegion "LA", postalCode "71111", telephone "318-550-5815", Mon–Fri 08:30–16:30, sameAs Facebook. **No fax. Do NOT use the footer microdata lat/long** (L5: `42.859280, -73.820210`, 346 files, which points to New York state, not Louisiana) |
| og:image (build.mjs 272-277) | Present on 349: 237 logo, 93 CDN images, **19 relative `/clipart/…` (404)** | | CHANGE | For the 19, use the CDN copy (same file name under `d3dhq28juvmj53.cloudfront.net/clipart/`, which is on disk) or the page's generated scene |

### 2.5 images.mjs

| Rule (line) | here | there | Verdict | Note |
|---|---|---|---|---|
| `sniff` by magic bytes (26-33) | 1 HTML soft-404 saved as .jpg (`57a2e231-clipart-010.jpg`); 1 GIF saved as .png (`5c75645b-Cibalogo.png`) | the file comment names the same two cases | CARRY | Verified by sniffing all 294 local files |
| cwebp re-encode, `-metadata none` (48-93) | `cwebp` 1.6.0 on PATH | | CARRY | Verified this run |
| AI XMP label via webpmux (39-47, 79-88) | `webpmux` 1.6.0 on PATH | | CARRY | Required by the brief (AI images labelled) |
| mislabelled-extension temp copy (69-74) | 1 file | | CARRY | |

### 2.6 util.mjs

`esc`, `plain`, `stripTags`, `up`, `imageSize` (jpg/png/gif/svg/webp), `ownPath`, `depthOf`, `walk`, `readJSON`: all
CARRY. `decodeEntities`: CARRY plus the small entity addition in §2.1.

### 2.7 templates.mjs (chrome is driven by `src/content/chrome.json`, which must be rewritten from this source)

| Element (line) | Frisco | Clifton source | Verdict |
|---|---|---|---|
| `head` theme-color (58) | `#fdf7f4` | Brand green; the theme declares `#759b2a` (measured tokens are in `src/styles/tokens.css`) | CHANGE |
| font preloads (68-69) | raleway-300/400 TTF | none (Arial stack) | CHANGE |
| announce bar (92, 96-97) | red announcement + dismiss (287 files) | none (0) | CHANGE: remove |
| address strip as `<h2>` (98-102) | Frisco printed its strip as h2 | the top bar is `<strong class="ecp-heading-tag">` + link; **not a heading** | CHANGE: no heading. Keep the source's own words "We're in Bossier City, 1000 Chinaberry Drive, Suite 302, Louisiana, 71111." |
| `navList` with dropdowns (78-88) | 12 sub-menu links per page (L10 3,420 hits) | **flat 5-item menu** (L10 0) | CARRY (the code handles no-children) |
| header CTA buttons (107-110) | appointment + phone | Top bar "Make an Appointment" is a **dead span** (no href); mobile icon → `/contact-us/appointment-request-form/`; "Call Us: 318-550-5815" | CHANGE: linking the top-bar button is a behaviour change; record it |
| `hoursList` (136-138) | `chrome.hours` | Monday–Friday "8:30 AM - 4:30 PM"; Saturday, Sunday "Closed" | CARRY (new data) |
| footer (140-165) | brand h2, fax, email, 2 link lists, util | "Important Links" (6) · "Quick Links" (5) · voice search (REMOVE) · Facebook · NAP line · util (Accessibility, Sitemap → 404, Privacy, Disclaimer, Login → REMOVE) | CHANGE: data. The "Sitemap" link needs the `raw` re-point to `/sitemap.xml` (Frisco precedent), since `/sitemap/` 404s (L6 346) |
| `ctaBand` (167-179) | stripLead + addressLine | The source has no CTA band; any band is a redesign element and may use only source strings (the address line, "Make an Appointment", "Call Us: 318-550-5815") | CHANGE (data) |
| icons (5-23) incl. facebook | | Facebook only | CARRY |

### 2.8 build.mjs

| Rule (line) | here | there | Verdict | Note |
|---|---|---|---|---|
| `OLD_VENDOR /eyecarepro/i` on images (55, 80) | 2 inventory entries (eyecarepro-logo.svg, review-quote.png) | 2 (same files) | CARRY | |
| `PLATFORM_UI` regex (57, 81) | 21 inventory entries (fas-fa-*, spinner, gf-creditcards*, chosen-sprite*, new-*.png, ribbon, tag, snowflake1-3) | 23 (also pattern-part2, arrow.png) | CARRY | 0 of them are inside main here (D15) |
| `DROP` list (59-62) | D16: 0 | 1 (2) | INERT → empty | |
| `ALT_OVERRIDES` (64-72) | 0 of 7 files present. File-name alts: D12 **22 files (24 imgs)** in main vs 2 (2); 28 inventory entries have file-name-like alts (e.g. "dry eyes droplet 250x376.jpg", "woman clear frames red lips 1280x853.jpg") | | CHANGE | Author a Clifton override map describing what each picture shows. D13: 96 main imgs have NO alt attribute (55 there) |
| image-only heading unwrap (196-200) | D11: 4 (4) | 3 (3) | CARRY | |
| h1 removal by text, h1→h2 (217-223) | | | CARRY | |
| logo `srcImg(/black-version-eye-source-logo/)` (119) | 0 | 287 | CHANGE | `/clifton_eye_center_medium-e1478229278850/` (alt "Clifton Eye Center logo"; the mobile-header copy declares 317×221; read the real size from the file) |
| `TOPICS` / `topicFor` scene + cutout ids (127-142) | | | CHANGE (ids) / CARRY (mechanism) | Needs this project's generated set (no fal calls were made in this run) |
| `aside()` (154-166) | | | CHANGE | The source sidebar = search (REMOVE) + 4 badges + location (NAP, map, hours) + "Insurance Plans" text |
| `crumbsHtml` separator » (168-178) | separator span " » " (C2 950) | 830 | CARRY | Feed it from R-2 |
| `formsFor` in page body (230, 249) | | | CHANGE | F-1 / F-3 |
| `FONTS` (299) | | | CHANGE | I-1 |
| hero film (303-307) | | | CHANGE: remove | |
| favicon (313-315) | none in source | | CHANGE | Open question: derive one from the logo's "e" eye mark (a derived asset, to be declared) or ship none |
| prune unreferenced images (322-334) | | | CARRY | |
| sitemap.xml (337-342) | | | CARRY + CHANGE | Also exclude source-noindex pages (S-1) |
| redirects from aliases (349-361) | 7 aliases on 6 pages | 7 | CARRY | Plus the 2 MOVED re-points, so `_redirects` / `.htaccess` get 9 rules |
| clone-removals strings (369-390) | honeypot: **2 pages**; "Powered by": 346; "Login": 346 | 285; 285; 285 | CHANGE | Drop the rows with 0 hits here (dismiss glyph 0, relative times 0, Now Featuring 0, Red Cross 0). ADD rows: footer voice search ("Ask Here, Voice Search" / "Speak Field", 346 + /template/footer/); sidebar search (337 + 5 in main); mobile-menu focus trap "Return to top of menu" (348 files); GTM `GTM-P6GSK34` (349); footer microdata with wrong coordinates (346); the `EyeCarePro-Icons` icon font; `/category/our-doctors/`'s search prompt form |

## 3. New markers here (no Frisco rule exists)

| Marker | here | there | Rule to add |
|---|---|---|---|
| `span[itemprop=ratingValue][style*=display:none]` | 5 (9) | 1 (1) | Strip before sanitising (X-1) |
| `div.ecp-heading.ecp-heading-tag` visual headings | 5 (13) | 0 | Promote to headings in the composers |
| `div.ecp-heading-accordion` (+ `data-accordion-target-next`) | 3 (3) | 0 | Heading plus collapsible next module, rendered as `<details>` or an open section |
| `div.ecp-accordion` Q&A | 1 (3 items) | 0 | `<details><summary>` |
| `ecp-posttype-testimonial` cards | 5 files (9 cards) | 1 (1) | Testimonial extractor (§2.3) |
| `ecp-gallery-item` / `ecp-carousel-item` | 1 (4 tiles) / 1 (3 slides) | 1 / 0 | Home composer |
| `ecp-badge` quick actions in main | 9 (36 class hits) | 0 | Composers (they duplicate the sidebar badges) |
| `data-background-image-src` | 9 (12) | 1 (7) | Read explicitly for heroes |
| WOW.js classes | 4 (18) | 0 | Strip; keep as motion evidence |
| `span.ecp-button[href=""]` (top bar "Make an Appointment") | header of 346 | n/a | Record the linking decision |
| footer `#voice_search` form | 347 | 0 | REMOVE (ledger) |
| `ecp-post-paymentinfo` payment icons (theme images cash/check/mastercard/visa) | /hours-location/, /location/clifton-eye-center/ | there: 6 icons incl. debit/discover | KEEP as content ("We Accept:") |
| second robots meta | 224 (217 noindex) | 192 (168 noindex) | S-1 |

## 4. Open questions for the owner or orchestrator

1. Keep the source's `noindex` on 217 pages (the default here), or index some of them?
2. Favicon: the source has none. Derive one from the logo mark (a declared derived asset), or ship none?
3. The 3 `/testimonial/*` pages and `/category/our-doctors/` have an empty title/h1 (4 pages). What heading is allowed without inventing one: the reviewer's name, or a neutral UI label?
4. Forms have no backend. Use a `mailto:cliftoneyecenter@yahoo.com` fallback (the address appears only on the accessibility page), or leave them inert with the offline notice? Keep or drop Frisco's authored PHI note?
5. Footer "Sitemap" (a 404 on 346 pages): re-point to `/sitemap.xml` (Frisco precedent) or build an HTML sitemap?
6. The top-bar "Make an Appointment" button is dead in the source. Link it to `/contact-us/appointment-request-form/` (a behaviour change, recorded)?
7. Show the desktop-only home rows (reviews, Q&A, designer brands) on phones?
8. The 6 content images with no file: stand-ins (declared generated) or removal?
9. The 2 patient-form PDFs live only on the platform CDN (`da4e1j5r7gw87.cloudfront.net/…/new-pt-paperwork.pdf`, `established-pt-paperwork.pdf`) and are not on disk. Harvest them in a later run, or keep them as external links (they break when the platform account closes)?
10. Does the keyless Google Maps endpoint resolve "Clifton Eye Center, 1000 Chinaberry Drive, Suite 302, Bossier City, LA 71111"? Unverified; check in browser QA.

## Appendix A. Full marker census (generated from `tmp/port-census/census.json`; do not edit by hand)

Corpora: here = 349 files, there = 287 files. Cells are "files (hits)". Regex flags `gi`; `\|` in a regex is an escaped pipe for the table.

| ID | Region | Marker | Regex | here | there | e.g. (here) |
|---|---|---|---|---|---|---|
| A1 | markup | a <main> element exists | `<main\b` | 346 (346) | 285 (285) | 1-eye-allergies-2016.html |
| A2 | markup | exact platform main tag | `<main class="ecp-primary" id="content">` | 346 (346) | 285 (285) | 1-eye-allergies-2016.html |
| A3 | markup | WordPress article inside main | `<article id="post-\d+"` | 345 (345) | 284 (284) | 1-eye-allergies-2016.html |
| A4 | main | entry header (DROP_WHOLE removes it with its h1) | `<header class="ecp-entry-header">` | 346 (346) | 285 (285) | 1-eye-allergies-2016.html |
| A5 | main | platform page title h1 | `<h1 class="ecp-entry-title"` | 337 (337) | 284 (284) | 1-eye-allergies-2016.html |
| A6 | main | EMPTY entry header (builder pages put their h1 elsewhere) | `<header class="ecp-entry-header">\s*</header>` | 9 (9) | 1 (1) | eye-care-services.html |
| A7 | main | h1 NOT the entry title (Beaver Builder ecp-heading h1 etc.) | `<h1\b(?![^>]*ecp-entry-title)` | 10 (13) | 2 (4) | eye-care-services.html |
| A8 | main | entry content wrapper | `<div class="ecp-entry-content">` | 186 (186) | 181 (181) | 404-page-not-found.html |
| A9 | main | Beaver Builder layout inside main | `<div class="fl-builder-content` | 14 (14) | 19 (19) | eye-care-services.html |
| A10 | markup | sidebar widget area | `<div class="ecp-secondary ecp-widget-area"` | 337 (337) | 284 (284) | 1-eye-allergies-2016.html |
| A11 | main | sidebar INSIDE main (would leak into content) | `<div class="ecp-secondary` | 0 | 0 |  |
| A12 | markup | <aside> anywhere (DROP_WHOLE target) | `<aside\b` | 0 | 0 |  |
| A13 | main | <aside> inside main | `<aside\b` | 0 | 0 |  |
| B1 | markup | site header | `<header class="ecp-header">` | 346 (346) | 285 (285) | 1-eye-allergies-2016.html |
| B2 | markup | site footer | `<footer class="ecp-footer">` | 346 (346) | 285 (285) | 1-eye-allergies-2016.html |
| B3 | main | nav inside main | `<nav\b` | 0 | 0 |  |
| B4 | main | inline svg inside main (dropped whole) | `<svg\b` | 14 (96) | 3 (47) | contact-us-testimonials.html |
| B5 | main | form inside main (dropped by sanitize; rebuilt by forms.mjs) | `<form\b` | 7 (7) | 5 (6) | category-our-doctors.html |
| B6 | main | button inside main | `<button\b` | 5 (5) | 1 (1) | category-our-doctors.html |
| B7 | main | noscript inside main | `<noscript\b` | 0 | 0 |  |
| B8 | markup | skip link text | `>\s*Skip to (?:main )?content\s*<` | 349 (349) | 287 (287) | 1-eye-allergies-2016.html |
| B9 | main | skip link inside main | `>\s*Skip to (?:main )?content\s*<` | 0 | 0 |  |
| B10 | markup | announcement dismiss glyph <a href="#">x</a> | `<a\b[^>]*href\s*=\s*["']#["'][^>]*>\s*(?:[xX×✕✖+−^]\|&times;)\s*</a>` | 0 | 287 (287) |  |
| B11 | main | href="#" anchors in main (accordion toggles etc.; dropped) | `<a\b[^>]*href\s*=\s*["']#["']` | 1 (3) | 0 | index.html |
| B12 | main | anchor wrapping block children (anchorsFlattened) | `<a\b[^>]*>(?:(?!</a>)[\s\S])*?<(?:div\|p\|h[1-6]\|section\|article\|header\|footer\|ul\|ol\|li\|figure)\b` | 9 (44) | 1 (4) | eye-care-services.html |
| B13 | main | ecp-accordion (Q&A accordion; trigger is href=#, content is [hidden]) | `class="[^"]*\becp-accordion\b` | 1 (23) | 0 | index.html |
| B14 | main | ecp-heading-accordion (collapsible heading sections) | `class="ecp-heading-accordion-wrapper` | 3 (3) | 0 | eyeglasses-contacts-contact-lenses.html |
| B15 | main | accordion panel with [hidden] attribute | `<div class="ecp-accordion-content" hidden` | 1 (3) | 0 | index.html |
| B16 | main | WOW.js entrance-animation classes | `class="[^"]*\bwow\b` | 4 (18) | 0 | eyeglasses-contacts-eyeglasses-designer-frames.html |
| B17 | main | child-page listing (ecp-childpages) | `<div class="ecp-childpages` | 29 (392) | 31 (363) | contact-us.html |
| B18 | main | child-page listing with thumbnails | `class="ecp-childpages-image` | 4 (25) | 0 | eye-care-services.html |
| B19 | main | quick-action badges inside main | `class="ecp-badges` | 9 (9) | 1 (1) | eye-care-services.html |
| B20 | main | ecp posts wrapper (posts/team/location/testimonial lists) | `class="ecp-posts-wrapper` | 163 (171) | 96 (101) | 1-eye-allergies-2016.html |
| B21 | main | team list (often EMPTY) | `class="ecp-posts-wrapper ecp-instance-\w+ ecp-posts-wrapper-team` | 4 (5) | 3 (4) | index.html |
| B22 | main | location widget (map/address/hours) inside main | `class="ecp-posts-wrapper ecp-instance-\w+ ecp-posts-wrapper-location` | 4 (8) | 4 (6) | contact-us.html |
| B23 | main | ecp-button CTAs inside main | `<div class="ecp-button-wrapper\|<a class="ecp-button` | 9 (17) | 2 (3) | eye-care-services.html |
| B24 | main | ecp-button rendered as <span href=""> (dead button, no link) | `<span class="ecp-button[^"]*"\s+href=""` | 0 | 0 |  |
| B25 | main | ecp-callout modules inside main | `class="ecp-callout` | 4 (56) | 2 (39) | contact-us.html |
| B26 | main | Beaver Builder device-only rows inside main | `fl-visible-(?:desktop\|mobile)` | 3 (10) | 1 (17) | eyeglasses-contacts-eyeglasses-designer-frames.html |
| C1 | main | platform breadcrumb block in main | `<div class="ecp-breadcrumb` | 338 (338) | 284 (284) | 1-eye-allergies-2016.html |
| C2 | main | separator span | `ecp-breadcrumb-separator` | 338 (950) | 284 (830) | 1-eye-allergies-2016.html |
| C3 | main | breadcrumb already a <p>Home » …</p> in the raw | `<p>\s*(?:<a\s[^>]*>)?\s*Home\s*(?:</a>)?\s*(?:&raquo;\|»\|&rsaquo;\|›\|&gt;)` | 0 | 0 |  |
| C4 | main | breadcrumb starts with Home link | `<div class="ecp-breadcrumb[^"]*"[^>]*>\s*<a href="/">\s*Home\s*</a>` | 338 (338) | 284 (284) | 1-eye-allergies-2016.html |
| D1 | main | <img> in main | `<img\b` | 198 (291) | 135 (205) | 1-eye-allergies-2016.html |
| D2 | main | img from da4e1j5r7gw87.cloudfront.net (wp uploads CDN) | `<img\b[^>]*\bsrc=["']https?://da4e1j5r7gw87\.cloudfront\.net/` | 105 (150) | 71 (97) | 10-eye-healthy-foods-to-eat-this-year-2017.html |
| D3 | main | img from d3dhq28juvmj53.cloudfront.net (clipart CDN) | `<img\b[^>]*\bsrc=["']https?://d3dhq28juvmj53\.cloudfront\.net/` | 82 (87) | 56 (61) | 1-eye-allergies-2016.html |
| D4 | main | root-relative img src | `<img\b[^>]*\bsrc=["']/(?!/)` | 2 (2) | 1 (1) | october-is.html |
| D5 | main | page-relative img src (resolved against page URL) | `<img\b[^>]*\bsrc=["'](?!https?:\|/\|data:)` | 2 (2) | 1 (1) | treating-vision-problems-lowers-risk-of-falling-in-seniors.html |
| D6 | doc | mod_pagespeed URL (baseKey) | `\.pagespeed\.[a-z]{2}\.[A-Za-z0-9_-]+\.[a-z0-9]+` | 1 (1) | 2 (2) | eyeglasses-contacts-eyeglasses-eyeglass-basics-womens-eyeglass-frames.html |
| D7 | main | lazy data-src | `<img\b[^>]*\bdata-src=` | 0 | 0 |  |
| D8 | main | srcset | `<img\b[^>]*\bsrcset=` | 0 | 0 |  |
| D9 | markup | Beaver Builder row background photo (not an <img>) | `data-background-image-src=` | 9 (12) | 1 (7) | eye-care-services.html |
| D10 | main | inline CSS background image in main | `background-image\s*:\s*url\(` | 0 | 0 |  |
| D11 | main | image-only heading (build.mjs unwraps) | `<(h[1-6])\b[^>]*>(?:\s\|<img\b[^>]*>\|<br\s*/?>\|<a\b[^>]*>\|</a>)*<img\b[^>]*>(?:\s\|<img\b[^>]*>\|<br\s*/?>\|<a\b[^>]*>\|</a>)*</\1>` | 4 (4) | 3 (3) | eye-care-services-eye-emergencies-pinkred-eyes.html |
| D12 | main | alt text that is a file name | `<img\b[^>]*\balt=["'][^"']*\.(?:jpe?g\|png\|gif)["']` | 22 (24) | 2 (2) | 12-tips-for-optimal-eye-health-2019.html |
| D13 | main | img with no alt attribute | `<img\b(?![^>]*\balt=)` | 96 (96) | 55 (55) | 1-eye-allergies-2016.html |
| D14 | main | DIAGRAM regex hit on src (imgRole plate) | `<img\b[^>]*\bsrc=["'][^"']*(?:diagram\|astigmatism\|cataract\|glaucoma\|macular\|anatomy\|chart\|\buv\b\|cross.?section\|before.and.after\|latisse\|myopia\|hyperopia\|presbyopia\|\bamd\b\|focal\|lenses\.png)` | 18 (18) | 13 (13) | 7-facts-you-should-know-about-glaucoma.html |
| D15 | main | PLATFORM_UI regex hit (img in main) | `<img\b[^>]*\bsrc=["'][^"']*(?:spinner\.svg\|fas-fa-\|chosen-sprite\|gf-creditcards\|/arrow\.png\|ribbon\.png\|snowflake\d\|new-(?:black\|orange\|blue)\.png\|/tag\.png\|pattern-part2\|review-quote)` | 0 | 0 |  |
| D16 | doc | build.mjs DROP list files | `cross-eye-emerg\.png\|NowFeaturingTag3\.png` | 0 | 1 (2) |  |
| D17 | doc | Frisco logo file | `black-version-eye-source-logo` | 0 | 287 (1362) |  |
| D18 | doc | Clifton logo file | `clifton_eye_center_medium` | 349 (1519) | 0 | 1-eye-allergies-2016.html |
| D19 | head | favicon <link> | `<link[^>]*rel=["'](?:shortcut )?icon` | 0 | 287 (287) |  |
| D20 | doc | favicon file Frisco build copies | `1526401368\.png` | 0 | 287 (574) |  |
| D21 | main | img from /clipart/ on own origin (all 404) | `<img\b[^>]*\bsrc=["']https?://(?:www\.)?cliftoneyecenter\.com/clipart/` | 0 | 0 |  |
| D22 | main | img from storage.googleapis.com | `<img\b[^>]*\bsrc=["']https?://storage\.googleapis\.com/` | 2 (39) | 2 (40) | eyeglasses-contacts-eyeglasses-designer-frames.html |
| D23 | main | img from static.ecpbuilder.com | `<img\b[^>]*\bsrc=["']https?://static\.ecpbuilder\.com/` | 10 (10) | 5 (5) | april-is-womens-eye-health-and-safety-month-2017.html |
| D24 | main | img from s3.amazonaws.com | `<img\b[^>]*\bsrc=["']https?://s3\.amazonaws\.com/` | 0 | 0 |  |
| E1 | main | absolute own-origin href (Clifton) | `href=["']https?://(?:www\.)?cliftoneyecenter\.com/` | 181 (1009) | 0 | category-uncategorized.html |
| E2 | main | absolute own-origin href (Frisco) | `href=["']https?://(?:www\.)?friscoeyesource\.com/` | 0 | 181 (844) |  |
| E3 | main | javascript: href | `href=["']javascript:` | 0 | 0 |  |
| E4 | markup | ecpbuilder.com reference (staging/admin host) | `ecpbuilder\.com` | 349 (1053) | 287 (862) | 1-eye-allergies-2016.html |
| E5 | main | EyeCarePro named inside a <p> in main (stripVendorClauses) | `<p\b[^>]*>(?:(?!</p>)[\s\S])*eyecarepro` | 1 (3) | 1 (3) | disclaimer.html |
| E6 | main | PDF links in main | `href=["'][^"']*\.pdf` | 4 (5) | 0 | 9-tips-for-coping-with-eye-allergy-season.html |
| E7 | main | icon-only social anchor in main (fillIconLinks) | `<a\b[^>]*href=["'][^"']*(?:facebook\|yelp\|instagram\|twitter\|linkedin\|youtube)\.com[^>]*>\s*(?:<svg[\s\S]*?</svg>\|<i\b[^>]*></i>\|<span\b[^>]*>\s*(?:<svg[\s\S]*?</svg>)?\s*</span>)?\s*</a>` | 0 | 0 |  |
| E8 | main | href to /your-eye-health/* (legacy tree; 404 or alias) | `href=["'](?:https?://(?:www\.)?cliftoneyecenter\.com)?/your-eye-health/` | 6 (11) | 6 (12) | eye-care-services-management-of-ocular-diseases-cataract-surgery-co-management.html |
| F1 | markup | Google Maps Embed API v1 iframe (keyed) | `<iframe\b[^>]*src=["'][^"']*maps/embed/v1/` | 338 (338) | 284 (284) | 1-eye-allergies-2016.html |
| F2 | main | keyed map iframe inside main | `<iframe\b[^>]*src=["'][^"']*maps/embed/v1/` | 3 (3) | 3 (3) | hours-location.html |
| F3 | sidebar | keyed map iframe in sidebar | `<iframe\b[^>]*src=["'][^"']*maps/embed/v1/` | 335 (335) | 281 (281) | 1-eye-allergies-2016.html |
| F4 | markup | map q=place_id: (keyless endpoint cannot resolve it; dekeyMapEmbed swaps in mapQuery) | `<iframe\b[^>]*src=["'][^"']*maps/embed/v1/[^"']*q=place_id:` | 338 (338) | 284 (284) | 1-eye-allergies-2016.html |
| F5 | main | YouTube iframe in main | `<iframe\b[^>]*src=["'][^"']*(?:youtube(?:-nocookie)?\.com\|youtu\.be)` | 2 (2) | 1 (1) | keeping-your-contact-lenses-clean.html |
| F6 | markup | YourLens iframe | `<iframe\b[^>]*src=["'][^"']*yourlens\.com` | 0 | 1 (1) |  |
| F7 | markup | GTM noscript iframe | `<iframe\b[^>]*src=["'][^"']*googletagmanager` | 349 (349) | 287 (287) | 1-eye-allergies-2016.html |
| F8 | main | any OTHER iframe in main | `<iframe\b(?![^>]*(?:maps/embed\|youtube\|youtu\.be\|yourlens\|googletagmanager))` | 0 | 0 |  |
| F9 | main | <video> in main | `<video\b` | 0 | 4 (4) |  |
| F10 | main | iframe with no title in main | `<iframe\b(?![^>]*\btitle=)` | 2 (2) | 2 (2) | keeping-your-contact-lenses-clean.html |
| G1 | markup | Gravity Forms wrapper anywhere | `<div class=["'][^"']*gform_wrapper` | 2 (2) | 285 (288) | contact-us-appointment-request-form.html |
| G2 | main | Gravity Forms wrapper in main | `<div class=["'][^"']*gform_wrapper` | 2 (2) | 4 (5) | contact-us-appointment-request-form.html |
| G3 | outside | Gravity Forms wrapper OUTSIDE main (sidebar appointment widget) | `<div class=["'][^"']*gform_wrapper` | 0 | 283 (283) |  |
| G4 | markup | GF honeypot li | `gform_validation_container` | 2 (2) | 285 (288) | contact-us-appointment-request-form.html |
| G5 | markup | Akismet hidden block | `akismet-fields-container` | 2 (2) | 285 (288) | contact-us-appointment-request-form.html |
| G6 | markup | GF honeypot instruction string | `This field is for validation purposes` | 2 (2) | 285 (288) | contact-us-appointment-request-form.html |
| G7 | markup | GF required marker span | `class=["']gfield_required` | 2 (16) | 285 (3454) | contact-us-appointment-request-form.html |
| G8 | markup | aria-required on controls | `aria-required=["']true` | 2 (8) | 285 (1442) | contact-us-appointment-request-form.html |
| G9 | markup | GF label for= pairing | `<label\b[^>]*\bfor=["']input_\d+_` | 2 (18) | 285 (1805) | contact-us-appointment-request-form.html |
| G10 | markup | search form (role=search) | `<form\b[^>]*role=["']search` | 341 (342) | 284 (285) | 1-eye-allergies-2016.html |
| G11 | markup | voice search form (footer) | `<form\b[^>]*id=["']voice_search` | 347 (347) | 0 | 1-eye-allergies-2016.html |
| G12 | doc | literal "<form></form>" inside inline jQuery (raw-regex false positive) | `<form></form>` | 347 (694) | 2 (4) | 1-eye-allergies-2016.html |
| G13 | markup | GF wrapper hidden until JS runs | `<div class=["'][^"']*gform_wrapper[^>]*style=["']display:none` | 1 (1) | 284 (287) | contact-us-contact-form.html |
| G14 | markup | GF field label | `class=["']gfield_label` | 2 (16) | 285 (2080) | contact-us-appointment-request-form.html |
| G15 | markup | GF complex fields (sub-labels after inputs) | `gfield--type-(?:name\|time\|address)` | 2 (3) | 285 (293) | contact-us-appointment-request-form.html |
| H1 | markup | Frisco-home review slide (home.mjs) | `<div class="ecp-review splide__slide` | 0 | 1 (7) |  |
| H2 | markup | review comment | `ecp-review-comment` | 0 | 1 (7) |  |
| H3 | markup | full star | `ecp-rating-star-full` | 5 (45) | 2 (40) | contact-us-testimonials.html |
| H4 | markup | testimonial post card | `class="ecp-post ecp-post-\d+ ecp-posttype-testimonial` | 5 (9) | 1 (1) | contact-us-testimonials.html |
| H5 | markup | testimonial attribution | `class="ecp-post-attribute"` | 5 (9) | 1 (1) | contact-us-testimonials.html |
| H6 | markup | ecp-rating block | `class="ecp-rating"` | 5 (9) | 2 (8) | contact-us-testimonials.html |
| H7 | markup | frozen relative time | `>\s*(?:\d+\|a\|an)\s+(?:minute\|hour\|day\|week\|month\|year)s?\s+ago\s*<` | 0 | 1 (7) |  |
| H8 | markup | posts rendered as a carousel | `ecp-view-carousel` | 1 (2) | 1 (2) | index.html |
| I1 | main | post LIST (summary view) | `ecp-posts-wrapper-post ecp-view-summary` | 2 (2) | 1 (1) | index.html |
| I2 | main | single post (complete view) | `ecp-posts-wrapper-post ecp-view-complete` | 151 (151) | 88 (88) | 1-eye-allergies-2016.html |
| I3 | main | post date in "Mon D, YYYY" form | `<div class="ecp-post-date[^"]*">\s*[A-Z][a-z]{2} \d{1,2}, \d{4}\s*<` | 153 (303) | 90 (179) | 1-eye-allergies-2016.html |
| I4 | main | read-more metabar | `class="ecp-post-metabar` | 3 (153) | 2 (93) | index.html |
| I5 | main | pagination | `class="(?:page-numbers\|nav-links\|ecp-pagination)` | 0 | 0 |  |
| I6 | markup | body.single-post | `<body[^>]*\bsingle-post\b` | 151 (151) | 88 (88) | 1-eye-allergies-2016.html |
| I7 | main | h5 in main | `<h5\b` | 0 | 1 (3) |  |
| J1 | main | home.mjs anchor headings | `>\s*(?:Meet Our Frisco Eye Doctor\|Our Designer Optical Shop\|Eye Exams for the Whole Family\|Sharp Vision &amp; Healthy Eyes\|Eye Emergencies\|What.s New\?\|Locate Us)\s*<` | 1 (1) | 1 (8) | eye-care-services-eye-exams.html |
| J2 | markup | slider slide URL (Optos banner) | `data-slide-url=` | 0 | 1 (1) |  |
| J3 | main | gallery tile | `class="ecp-gallery-item` | 1 (16) | 1 (16) | index.html |
| J4 | main | image carousel slide | `class="ecp-carousel-item` | 1 (6) | 0 | index.html |
| J5 | main | Q&A accordion | `ecp-accordion-theme-qanda` | 1 (1) | 0 | index.html |
| J6 | main | photo callout card (designer brand cards) | `ecp-callout-imagery-type-photo` | 4 (8) | 2 (4) | contact-us.html |
| J7 | main | quick-action badge | `class="ecp-badge ecp-badge-withicon` | 9 (36) | 0 | eye-care-services.html |
| J8 | main | ecp-heading rendered as a DIV (visual heading, not h*) | `<div class="ecp-heading [^"]*ecp-heading-tag` | 5 (13) | 0 | eyeglasses-contacts-contact-lenses.html |
| K1 | head | canonical | `<link rel=["']canonical["']` | 344 (344) | 280 (280) | 1-eye-allergies-2016.html |
| K2 | head | meta description | `<meta name=["']description["']` | 181 (181) | 170 (170) | 10-tips-to-protect-your-vision.html |
| K3 | head | noindex robots | `<meta name=["']robots["'][^>]*noindex` | 217 (217) | 168 (168) | 1-eye-allergies-2016.html |
| K4 | head | og:title | `<meta property=["']og:title` | 349 (349) | 287 (287) | 1-eye-allergies-2016.html |
| K5 | doc | JSON-LD block | `application/ld\+json` | 349 (698) | 287 (575) | 1-eye-allergies-2016.html |
| K6 | head | title ends on a dangling word (DANGLING_TAIL) | `<title>[^<]*(?:\b(?:for\|the\|a\|an\|and\|of\|to\|in\|on\|with\|your\|our\|from\|at\|by\|is\|are)\s*\|[\|:,\-–—]\s*)</title>` | 0 | 4 (4) |  |
| L1 | footer | "Powered by" vendor credit | `Powered by` | 346 (346) | 285 (285) | 1-eye-allergies-2016.html |
| L2 | footer | vendor logo | `eyecarepro-logo\.svg` | 346 (346) | 285 (285) | 1-eye-allergies-2016.html |
| L3 | footer | Login link to ecpbuilder wp-admin | `id="ecp-footer-login-link"` | 346 (346) | 285 (285) | 1-eye-allergies-2016.html |
| L4 | footer | footer microdata (data-vocabulary.org) | `data-vocabulary\.org/MedicalClinic` | 346 (346) | 285 (285) | 1-eye-allergies-2016.html |
| L5 | footer | footer latitude meta | `<meta itemprop="latitude"` | 346 (346) | 285 (285) | 1-eye-allergies-2016.html |
| L6 | footer | footer Sitemap link (/sitemap/ is a 404 here) | `href="/sitemap/"` | 346 (346) | 285 (285) | 1-eye-allergies-2016.html |
| L7 | footer | voice search label | `Ask Here, Voice Search` | 346 (346) | 0 | 1-eye-allergies-2016.html |
| L8 | header | header top-bar callout | `class="ecp-callout-title-text"` | 346 (346) | 0 | 1-eye-allergies-2016.html |
| L9 | header | primary menu nav (menu id 2) | `<nav class="menu- 2 ecp-menu` | 346 (692) | 285 (570) | 1-eye-allergies-2016.html |
| L10 | header | dropdown sub-menus in header | `class="sub-menu` | 0 | 285 (3420) |  |
| L11 | markup | announcement/alert bar | `class="[^"]*ecp-announcement\|ecp-topbar\|ecp-alert-bar` | 0 | 287 (287) |  |
| M1 | main | bogus en-dash comment (stripBogusComments) | `&lt;!\s*(?:&#8211;\|&#8212;\|&ndash;\|&mdash;\|[–—])\|<!\s*[–—]` | 0 | 1 (1) |  |
| M2 | main | table in main | `<table\b` | 1 (1) | 1 (1) | 1-eye-allergies-2016.html |
| M4 | main | widget title "Request Appointment" as <p> | `<p>\s*Request Appointment\s*</p>` | 0 | 0 |  |
| M5 | main | heading with id (restoreAnchorTargets) | `<(h[1-6])\b[^>]*\bid=["'][A-Za-z][\w:.-]*["']` | 7 (18) | 5 (9) | can-you-really-go-blind-from-looking-at-a-solar-eclipse.html |
| M6 | main | in-page #fragment link | `href=["']#[A-Za-z]` | 3 (9) | 1 (3) | eye-care-services-management-of-ocular-diseases-glaucoma-testing-treatment.html |
| M7 | main | empty heading | `<(h[1-6])\b[^>]*>\s*</\1>` | 3 (3) | 0 | testimonial-4726-2.html |
| M8 | main | font/center tags | `<(?:font\|center)\b` | 0 | 0 |  |
| M9 | main | any iframe in main | `<iframe\b` | 5 (5) | 5 (5) | hours-location.html |
| M10 | main | definition list | `<dl\b` | 0 | 0 |  |
