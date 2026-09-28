# Build notes: the Clifton Eye Center pipeline (`src/build.mjs`)

Written by the build agent, 2026-09-28; sections 4 (items 17-27), 5, 6, 7 and 8 rewritten by the
integration agent the same day, after the first full visual review; section 9 (and the items it marks in 3, 4,
5, 6 and 8) added by the QA round 1 fixer, the same day, for the 40 confirmed findings of
`tmp/qa/round1-confirmed.json`; section 10 (and the items it marks in 4, 5, 6 and 7) added by the QA round 2 fixer,
2026-09-29, for the 26 confirmed round-2 findings. This file says what the pipeline does, which decisions it applies,
and the evidence for each definition-of-done item. Every number in section 5 was produced by a command run on the
final `dist/` (aggregate `ec2f3712...`, 663 files); the command is named beside it.

## 1. Run it

```
node src/build.mjs                     # -> dist/ (wiped and rebuilt every run)
CEC_DIST=tmp/repro/a node src/build.mjs # -> any other directory; audit/ reports are then NOT rewritten
```

Node builtins only. `cwebp`, `webpmux` and `ffmpeg`/`ffprobe` must be on PATH (or `$CWEBP` / `$WEBPMUX` /
`$FFMPEG`). Encoded images are cached in `tmp/build-cache/{img,generated}/`, keyed by content hash + encode
settings, so a rebuild re-encodes nothing and two builds are byte-identical (section 5, item 2). The two
build-derived generated assets (the 6% texture and the trimmed cut-outs, section 4 items 18-19) are cached in
`tmp/build-cache/derived/`; both ffmpeg recipes and the cwebp encode were run twice and gave identical bytes
(section 5, item 2). Delete the cache to force a full re-encode (about 30 s). Exit code 1 whenever any build failure is recorded; every failure is
printed and written to `audit/build-report.json` and `audit/failures.json` (stage `build:*`).

Output: `dist/<path>/index.html` for all 349 crawled pages (home = `dist/index.html`), `dist/404.html`,
`dist/sitemap.xml`, `dist/robots.txt`, `dist/_redirects` + `dist/.htaccess` (9 carried-forward 301s; the `.htaccess`
also sends every 404 to `/404.html`, QA r2),
`dist/styles/` (the design CSS), `dist/scripts/` (`site.js`), `dist/fonts/` (8 woff2 + `fonts.css` + 2
OFL texts), `dist/img/` (WebP; generated images under `img/generated/`), `dist/docs/` (the 2 patient
PDFs), `dist/favicon-32.png` + `dist/apple-touch-icon.png`. Every internal URL is page-relative
(`../` x depth + `path/index.html`), so `dist/` works from any directory or subpath; the one exception is
`dist/404.html`, whose URLs are root-relative (COMPONENTS F.7, section 4 item 15).

## 2. Files

| file | role |
|---|---|
| `src/build.mjs` | orchestrator: image map, per-page assembly, head/SEO, static assets, sitemap, redirects, reports |
| `src/lib/util.mjs` | reference helpers + a full entity table + `findElements` (nested-element lifter) |
| `src/lib/content.mjs` | the reference sanitiser (unchanged rules) + the raw-level `prepare()` extractors |
| `src/lib/forms.mjs` | Gravity Forms parser + COMPONENTS E renderer |
| `src/lib/seo.mjs` | robots merge, MOVED, titles, descriptions, canonicals, JSON-LD |
| `src/lib/images.mjs` | cwebp/webpmux encoder with cache and the AI XMP label (reference, plus a lossless copy mode) |
| `src/lib/templates.mjs` | page shell and every interior component of `docs/COMPONENTS.md` |
| `src/content/chrome.json` | top bar, menus, quick actions, sidebar, footer, hours: every string verified in `audit/raw` |
| `tools/write-facts.mjs` | `facts/client-facts.json` from the evidence (9 testimonial cards, NAP, hours, the doctor) |
| `tools/sentence-parity.mjs` | every source sentence present on its rebuilt page (with a positive control) |
| `tools/tag-balance.mjs` | open/close balance and block-in-`<p>` on every built page (with a control) |
| `tools/link-check.mjs` | every local href/src/srcset/url() resolves to a file (new; with 4 planted controls) |
| `tools/ledger-decide.mjs` | the change-control ledger: one decision + narrative slot + why + rebuilt-as per row through `sr-plan --set`, the added L/REMOVE/ADD rows, presets through `sr-match --answer` (section 8) |
| `tmp/orch/collide.mjs` | review tool: cut-out boxes vs the h1, breadcrumb, rail summary, aside and first main text, at rest (`--control` moves a cut-out onto the h1 and must flag it) |
| `tmp/orch/hashdir.mjs` | review tool: aggregate sha256 of a tree, comparison of several, `--control` |
| `tmp/orch/split.mjs`, `shoot-all.sh`, `shoot2.sh`, `measure.sh` | review tools: the screenshot round and the measurement batch of section 7 |

Reports written by the canonical build (not by `CEC_DIST` builds): `audit/build-report.json`,
`audit/build-pages.json` (per page: family, band, aside, rail, robots, title, h1, components),
`audit/dead-links.json`, `audit/clone-removals.json`, `audit/image-slots.json`, `audit/seo-repairs.json`,
`audit/redirects.json`, and the `build:*` items of `audit/failures.json`.

## 3. PORT-NOTES items, as applied

| item | what the build does |
|---|---|
| F-1 | `DEFAULT_FIELDS` and the every-page fallback are gone. A form renders only where `div.gform_wrapper` is inside the raw `<main>`: 2 pages (`formsParsed` 2). |
| F-2 | The form parser reads the script-stripped `<main>` only. |
| F-3 | No authored form copy: the form is named by the page h1 (`aria-labelledby="page-title"`), the button is the source "Submit", no PHI note, no `action`, no `mailto:`. The one UI sentence is the BUILD-DECISIONS #4 notice. The honeypot and Akismet blocks are dropped. Ids follow COMPONENTS E.1 (`f9-11-3` from `input_9_11_3`). |
| R-1 | `<main>` whenever it exists; `<body>` only for the 3 `/template/*` pages. The sidebar is chrome, rendered by the templates as the COMPONENTS B.15 aside on 334 pages. |
| R-2 | The trail is parsed from the RAW `div.ecp-breadcrumb` (no 300-char cap, hrefs not yet relativised), then removed: 338 trails; 11 empty segments dropped (L21). |
| S-1 | Every robots meta in the raw `<head>` is merged, most restrictive wins: 217 source noindex pages keep noindex. |
| L-1 | MOVED = the 7 live aliases + 2 re-pointable 404s (23 references re-pointed: 15 in interior content, 8 on the home through `ctx.localHref`). The 4 truly dead targets are unwrapped, words kept (6 references): `audit/dead-links.json`. |
| X-1 | `span[itemprop=ratingValue]` removed before sanitising (9); stars = count of `span.ecp-rating-star-full`. |
| I-1 | Logo `clifton_eye_center_medium-e1478229278850`; no fax anywhere; the New York footer coordinates never used; the Frisco film, fonts and ALT_OVERRIDES are gone. |
| G-1 | 5 broken content images get their planned stand-in (`fillFor`, 4 slot-fills + `svc-eyewear-boutique`); the thanksgiving basket on `/october-is/` is a declared removal. |
| H-1 | `home.mjs` is loaded dynamically; the pipeline builds the HOME CONTRACT `ctx` (section 4). |
| 2.1 new markers | `div.ecp-heading` -> h2 (13); heading accordions -> their heading (builder pages) or the payment accordion (visit pages); testimonial cards, child-page listings (29 lists, 169 items), archive title lists (4 lists, 22 items), post summaries (151 + home), quick-action badges in main (9 rows), `ecp-button` CTAs (13, grouped into CTA bands), location modules (visit blocks on `/hours-location/` and `/location/clifton-eye-center/`), team card, doc cards: each lifted out of the raw markup as data and rendered with its COMPONENTS markup. WOW classes go with every class attribute. |
| 2.4 og:image | The page's own source share image when it maps to a shipped local file (the 19 dead `/clipart/` paths map to their CDN twin by file name); else the logo. Always an absolute `https://www.cliftoneyecenter.com/img/...` of a file that ships. **QA r2 (F3):** `twitter:title` is the source page's own, verbatim (341 pages; 74 differ from og:title); omitted on the 4 archives whose title was repaired, where the source value is that same wrong post title (og:title is the fallback). |
| 2.8 alts | File-name, upload-hash or %20-garbled alts (37 inventory entries, for example "dry eyes droplet 250x376.jpg", "clipart 010", "daisy 20glasses") become `alt=""`; readable alts are kept verbatim; nothing is authored (L12). Index-card thumbnails are `alt=""` (COMPONENTS H.3). **QA CS-05:** the alt is the page's OWN source alt (`content.mjs` sanitize): an `<img>` with no alt on its page gets `alt=""`, never the alt the same file carries on another page (4 pages changed, `altsNotBorrowedFromOtherPages` 4; the women's-health post no longer says "after eye surgery for cataracts"). |
| 2.8 clone-removals | Rows rewritten for this site (2 honeypot pages, the voice search, sidebar search, focus-trap link, GTM, microdata, empty team modules, rating value, icon font, review-quote.png) with ledger ids. |

## 4. Decisions and departures (each is recorded here and, where it is a behaviour change, in the ledger)

1. **Stylesheets.** Every page links, in the task's order, `fonts/fonts.css`, `styles/tokens.css`,
   `styles/site.css`, `styles/motion.css` (plus `styles/brand.css`, COMPONENTS A.1's name, only if such a
   file exists; it does not). The CSS agent kept the MEASURED SOURCE EVIDENCE at the top of
   `src/styles/tokens.css` and `src/styles/motion.css` (read by the gates) and appended the redesign layer
   after a marker comment ("REDESIGN TOKENS", "@redesign-motion"). The evidence carries `wp-content` URLs
   and `ecp-`/`fl-` selectors: shipped whole, `motion.css` failed `sr-decontaminate` (1 blocker
   `wp-content-path`, 1 major `beaver-class`, measured this session). So `dist/styles/` gets only the
   redesign layer of those two files, from the marker comment on (the source files are untouched; a file
   without its marker is evidence only and is neither shipped nor linked). A fail-closed integrity check
   runs on the shipped CSS: every `var(--x)` without a fallback must be defined in it (or set by
   `site.js`), and every animation name must have its `@keyframes` in it: 0 undefined, 0 missing.
   COMPONENTS A.1/H.1 #15 (brand.css; tokens/motion not linked) was written before the CSS agent chose
   this layout; the orchestrator's head order (fonts, tokens, site, motion) is what the CSS depends on.
   The head script adds the `js` class (task) and then runs the COMPONENTS A.1 motion script.
   `src/styles/fonts.css` (the CSS agent's copy, urls `../fonts/...`) ships once, at `dist/fonts/fonts.css`.
2. **`site.js`** is linked at the end of `<body>` with `defer` (COMPONENTS A.3), not in the head.
3. **JSON-LD** is one `@graph`: `Organization` + `Optometric` (the schema.org MedicalBusiness type for an
   optometry practice; there is no `Optometrist` type) + `BreadcrumbList` where the page has a source trail.
   Facts: name, street, locality, region, postal code, phone, Mon-Fri 08:30-16:30, Facebook. No fax, no geo.
4. **Robots.** `noindex` in dist = 217 merged-source + 3 declared artefact changes (the `/testimonial/*`
   singles, `site-map.json` artefacts "keep+noindex", source indexable) = 220; `dist/404.html` is also
   noindex (a dist artefact, not a crawled page). The sitemap lists the 129 indexable pages.
5. **Titles.** Archives take their own h1 (reference rule); the 3 testimonials take "Testimonial" and
   `/category/our-doctors/` "Our Doctors" (BUILD-DECISIONS #3); `/category/our-doctors/` keeps its source h1
   "Nothing Found" as the first content heading so no source copy is lost. `/designer-frames/` h1 =
   its `<title>` "Designer Frames" (L20). The 3 `/template/*` pages have no h1 and use their `<title>`.
6. **Descriptions** (rewritten by QA CS-01/CS-03). A missing source description is derived from ONE source
   block of the page's own prose: the first `p`/`li`/`td`/`th`/`dd`/`blockquote`/`figcaption` of 60+ characters
   (headings and all-bold lead lines never, a list item holding a list never), cut at its last sentence end
   within 155 characters (a list number "1." or an abbreviation is not one) or else on a word with an ellipsis
   (`seo.mjs deriveDescription`). No qualifying block: no description tag at all (COMPONENTS A.1: omitted rather
   than emitted badly). The former whole-main-column fallback, which always ran blocks together, is gone. The
   **home page gets no derived description** (the source home has none and an empty og:description; its opening
   blocks are hero fragments and a promo). 156 of the 168 pages without a source description get one; 12 have
   none (the home, `/404-page-not-found/` and 404.html, the two tag archives, `/category/uncategorized/`,
   `/contact-us/testimonials/`, `/location/clifton-eye-center/`, the 3 `/testimonial/*` singles and 2
   `/template/*` artefacts: their text is all components or all-bold leads). `desc-check`: 0 of the derived
   descriptions span source blocks (was 14, 9 indexable). **QA r2 (F1):** an inline tag (`a`, `strong`, `em`,
   `span` ...) adds no space when the block is flattened, a line break or other tag still does: `/october-is/` read
   "October is ' Eye Injury Prevention Month ' in the USA" (the source links sit flush inside the quotes); it now
   reads as the page renders. 1 of the 349 descriptions changed (`tmp/qa/fixer-r2/after/desc-diff.log`).
7. **Heading-only runs** ("SEE BETTER / DESIGNER EYEWEAR / LIVE BETTER") are merged in source order into
   the next section with body (first heading h2, the rest h3). The reference merged each one after the
   next section's h2, which reordered them.
8. **CTA bands** render without a heading (the `div` variant of COMPONENTS B.22): the source heading of the
   same builder row is already rendered as a section heading, so repeating it inside the band would print
   it twice. Button groups: adjacent source buttons form one band.
9. **Visit block** (`/hours-location/`, `/location/clifton-eye-center/`): the location page's source
   sub-headings ("Contact Details", "Address", "Hours") render as `p.nap__sub` inside the NAP card (a
   class COMPONENTS does not list; without it that copy would be dropped). The payment accordion summary
   is the source's "Forms of Payment" heading-accordion (hours-location) or "Payment Information" sub-heading.
10. **Generated imagery exclusions** (DESIGN-SPEC 6.3): brand names come from the logo-class alts plus
    KAENON, IZOD, ALAN J, CONVERSE, Transitions and Chanel (the brand-campaign file names; their alts are
    descriptions, not names). Names of 3 characters or fewer ("OP", "ECO", "XXL") match only in capitals:
    case-insensitive "op" matched "pre-op"/"post-op" on the cataract co-management page. 10 slots excluded
    by text, plus 4 by the brand-logo rule of item 21, listed with the reason in `audit/image-slots.json`.
11. **Band photos**: `/designer-frames/` has three row background photos in the source; the band shows
    `Designer-Frame-3a` with the mobile variant `Designer-Page-Hero-Girl-mobile`. **QA CS-06:**
    `Frames-Chanel-Pink-sm` (a KEEP image, the source row background behind "#TELLITLIKEITIS", the review
    symbol and "More Google Reviews") now renders as-is, uncropped, `alt=""`, as `figure.fig.fig--brand` right
    under the "#TELLITLIKEITIS" heading. Generic rule in `build.mjs`: a photo-band page's row background that the
    band does not use is placed at the top of the section whose source row holds it (found by the row's first
    heading); the build fails if that heading is not on the rebuilt page. 1 image placed site-wide.
12. **Icon-only links** keep the source `aria-label` as their visible text ("Visit us on facebook", only on
    `/template/footer/`); the reference printed an authored brand word.
13. **Outbound Drupal link.** `/living-with-low-vision/` cites `www.preventblindness.org/sites/default/files/...pdf`;
    the path matches `sr-decontaminate`'s `drupal-marker` pattern. The link is kept as the source prints it and
    the file is declared in `audit/clone-removals.json` `prosePlatformNames` with the reason. The platform
    grep in section 5 item 6 still scans that file (0 hits).
14. **Empty `tel:`** on `/hours-location/` (the source's `<a href="tel:"> 318-550-5815.</a>`) is unwrapped:
    the number stays as text.
15. **404.html** is the `/404-page-not-found/` content at depth 0. **QA VIB-01:** every URL in that one file
    is root-relative (`/styles/site.css`, `/img/...`, `/`, `x/index.html` -> `/x/`), as COMPONENTS F.7 requires:
    hosts serve it at the failing request's own path at ANY depth (not only on a subpath deploy), and the
    page-relative version loaded with no CSS, fonts or images and linked "home" to `/some-old-post/index.html`.
    Consequence: 404.html works at the site root at any depth, but not from a subpath deploy (the rest of
    `dist/` still does). `tools/link-check.mjs` checks this exception: in `404.html` a root-relative reference is
    resolved against the dist root and a page-relative one is a finding (`page-relative-in-404`, own control).
    **QA r2 (F4):** Apache never served the file (its own bare error page answers unless told otherwise):
    `dist/.htaccess` now starts with `ErrorDocument 404 /404.html`. Netlify and Cloudflare Pages serve a root
    `404.html` by convention, so `_redirects` needs no line.
16. **Source claim kept verbatim**: the appointment form's field description "Details are stored securely
    and not sent by email." is source copy. It is only true once the form is wired to a backend that
    honours it (a launch item).

Added by the integration review (each one was found on a screenshot or by a measurement; section 7):

17. **Declared drops are not build failures.** `audit/generated-images.json` `dropped` (the imagery review's
    recorded decision: `svc-contact-lens`, no acceptable result in 45 generations) makes its slot empty by
    decision: logged in `audit/image-slots.json` with the recorded reason, never a placeholder. This removed
    the 2 `build:generated` failures; the build now exits 0. A generated file that is planned but neither
    shipped nor declared dropped is still a failure.
18. **`tex-frosted-glass` is wired** (DESIGN-SPEC 6.4: "optional ... if the reviewed file shows no seam"; the
    review found 0 seams). CSS cannot fade one background layer, so the build derives a copy with the alpha
    baked in: `ffmpeg ... geq=a='255*0.06*min(1,2*(1-Y/H))'` (15/255 = 5.9% over the top half, falling to 0
    at the bottom row, measured on the shipped file), encoded with lossless alpha (`images.mjs` `alphaQ`,
    new option; the cache key changes only when it is not the default), AI-labelled, and exposed as
    `--tex-frost` appended to the shipped `tokens.css`. `site.css` layers it in the home hero statement
    (only where `backdrop-filter` is supported) and every interior `.sheet.glass--light.is-flat`. 43 KB,
    one file site-wide. Contrast re-probed (section 7).
19. **Band and 404 cut-outs ship trimmed.** The reviewed PNGs carry wide transparent margins
    (`tmp/orch/alphabox.mjs`: cut-eyeglasses 35% top and bottom, cut-sunglasses 38% bottom, cut-kids-glasses
    33%, cut-lens-prism 20%), so a box positioned to cross the band edge showed an object that stopped short
    of it (screenshots: sunglasses at 1440 floated inside the band). `trimmedGen()` crops each to its opaque
    box (alpha > 24) plus a 2% pad: only fully transparent pixels are removed. Flat objects (aspect >= 2:
    eyeglasses, sunglasses, kids glasses) get `band__cut--wide` (wider, crossing by 24px: an 86px offset
    would carry a 90px-tall object entirely below the band, a recorded change to DESIGN-SPEC 4.2);
    compact ones (prism, phoropter) keep the spec offset at `clamp(120px, 13vw, 200px)`. The hero cut-out
    and the olive sprig keep the original file (their CSS crops it).
20. **`cut-contact-lens` rises inside the stage.** The fingertip is cut flat at its bottom and left edges;
    floating across the band edge it showed a severed finger (screenshots at 1440 and 390). It now sits
    INSIDE the clipped `band__stage`, mirrored (`scale: -1 1`) so both cut edges lie flush on the stage's
    rounded bottom-right corner, with no rotation, shadow or parallax (a lifted edge would show). 9 pages.
    A recorded change to "crosses the band's bottom edge": this image cannot cross an edge without
    showing its cut.
21. **Brand logos count as brand names (IMAGE-PLAN 3c).** The DESIGN-SPEC 6.3 exclusion read only the main
    text, so `/eyeglasses-contacts/contact-lenses/our-featured-brands/` (a wall of contact-lens brand
    logos) rendered a generated contact lens beside Acuvue and friends. A designer-frame, contact-lens or
    carrier logo, or a brand-campaign image, in the page's main region now excludes generated imagery
    too: 2 pages lose 4 slots (listed in `audit/image-slots.json`). It only ever removes images.
22. **The 13 `your-eye-health` section indexes get `cut-lens-prism`** (DESIGN-SPEC 6.3 lists them; the
    build's prefix table did not, so 13 planned slots were silently empty). The set is derived from
    `site-map.json` (library pages with children) and the build fails if it is not 13.
23. **Heading-only sheets became section titles.** A section whose only prose is its heading (a logo grid,
    dock row or cards follows) rendered as a sheet holding nothing but the heading ("Vision Plans We
    Accept" on `/insurance/`). It now renders as the interior composed-section heading `h2.section-title`
    (COMPONENTS B: "interior composed sections use the plain left-aligned h2.section-title"): 5 pages.
    **QA VIA-04 extends it:** a prose chunk holding only headings (plus a source `<hr>`) before a composed
    component was still a sheet ("<hr><h3>Our Contact Lens Services:</h3>" before the index cards; on
    `/designer-frames/` "SEE BETTER / DESIGNER EYEWEAR / LIVE BETTER" before the dock row and "O U R . F U L L
    ... / DESIGNER EYEWEAR IN Bossier City" before the logo wall). One heading now renders as `hN.section-title`
    at its source level; a run renders as `div.section-head` (first heading `.section-title`, the others
    `.section-title--sub`, source levels and order); the `<hr>` above the title is dropped (1). In `dist/`: 7
    interior `.section-title` headings on 4 pages (6 h2, 1 h3), 2 of them leading a `div.section-head`; the
    heading-only-sheet scan (`tmp/qa/visual-interior-a/heading-only-sheets.mjs`) finds 0 (control fires).
24. **Sheets carry no accessible name** (COMPONENTS C.4). The build had put `aria-labelledby` on every
    prose sheet (166 pages), making each a region landmark, with generated `sec-N` ids nothing linked to.
    Both are gone; an h2 keeps an id only when the source's own anchor links target it. **QA RA-07:** the form
    sheet is no longer named either, and on the 2 form pages the title band carries no `aria-labelledby`: the
    `<form>` alone is named by the h1 (PORT-NOTES F-3), so no two landmarks share that name.
25. **Layout fixes from the review** (all `site.css`): consecutive photo figures (the svc feature above the
    source lead photo, tilted opposite ways) get `clamp(24px, ...)` between them (they touched); the
    testimonials page stacks its cards in one column at the prose measure (a 2-column grid left a ~380px
    void beside the long middle review; 3 columns in the 810px main column would set the quotes at ~200px
    lines: a recorded change to "3 cards in a grid"); a photo band with a cut-out keeps a 48px (not 92px)
    tail below 1024px, so the cut-out crosses the photo's corner instead of floating in an empty stage;
    below 1024px the rail sits 64px under a band whose cut-out crosses its edge (the prism covered the rail
    summary's chevron by 16-21px at 390 and 768, `tmp/orch/collide.mjs`).
26. **Favicon links**: `favicon-32.png` (`sizes="32x32"`), `favicon-192.png` (`sizes="192x192"`, the size
    Android picks for a home-screen shortcut) and `apple-touch-icon.png` (180). The 512px master stays in
    `assets/brand/`. There is no `/favicon.ico`; every page declares its icon.
27. **Hub slots with no host.** The image-plan `usedFor` names an "eye exams section" and an "optical
    section" on the `/eye-care-services/` hub; the hub has neither (its 7 source index cards carry source
    thumbnails). Both are declared "not placed" in `audit/image-slots.json` rather than left silent.

## 5. Definition of done: evidence

Final run 2026-09-29 by the QA round 2 fixer (section 10), on the canonical `dist/` built by `node src/build.mjs`
(`tmp/qa/fixer-r2/regression/01-build.log`) with every source file as it stands now. `dist/` aggregate sha256
`ec2f3712db54e76df616b8cfb47b92cec8f385754828657cc7c56e93cb2af139` (663 files, the same file list as round 1). Every
check below ran on that tree; logs in `tmp/qa/fixer-r2/regression/`. Rows 3a and 8 were not re-run in this pass
(their tools read nothing the round-2 fixes changed in a way they measure, but that is unverified).

| # | check | command | result |
|---|---|---|---|
| 1 | build | `node src/build.mjs` | **exit 0**, **0 build failures**; 349/349 page files + `dist/404.html`. 271 source images kept, 292 image files shipped, **18 generated files shipped, 18 carrying the `trainedAlgorithmicMedia` XMP**. Generated slots: **143 rendered, 17 skipped, each with its reason** in `audit/image-slots.json`. CSS integrity: 0 `var()` left undefined, 0 animation names without `@keyframes` (the round-2 scroll-driven keyframes included). (`01-build.log`) |
| 2 | reproducible | `CEC_DIST=tmp/repro/a` and `tmp/repro/b` builds, then `node tmp/orch/hashdir.mjs tmp/repro/a tmp/repro/b dist --control` | 663 files each; aggregate `ec2f3712...` for a, b and `dist/`: **IDENTICAL**; control fired (one byte appended to `index.html` changes the aggregate and names the file). A cold-cache rebuild was not run (unverified). (`02-hash.log`) |
| 3a | sr-parity readings | `node <skill>/sr-parity.mjs --project .` | **not re-run** since the round-1 note (unverified). |
| 3b | sentence parity | `node tools/sentence-parity.mjs` | 13,966 source sentences: **13,595 found**, 363 source chrome only, 8 declared removals, **0 lost**; 3 found only whitespace-insensitively. Control fired. (`03-sentence-parity.log`) |
| 4 | tag balance | `node tools/tag-balance.mjs` | 350 pages, **0 unbalanced**, 0 findings; control fired (6 planted kinds). (`04-tag-balance.log`) |
| 5 | fabrication | `sr-fabrication --project . --strict` (facts not regenerated: no fact source changed) | **SOURCED**, 350 files, 660 claims, **0 blocker / 0 major**, exit 0. (`06-fabrication.log`) |
| 6 | decontamination | `sr-decontaminate --project . --dir dist --strict` | **CLEAN**, 358 files, 0/0/0, exit 0 (1 declared prose file, section 4 item 13). (`07-decontaminate.log`) |
| 7 | links | `node tools/link-check.mjs` | 354 html/css files, **20,333** local refs, 2,882 external skipped, **0 broken**; planted controls fired (the 404 exception has its own). (`05-link-check.log`) |
| 8 | noindex | from the build (`01-build.log`) and `dist/sitemap.xml` | 220 noindex pages + `dist/404.html`; sitemap **129** URLs (build summary). The raw-head re-parse was not repeated. |
| 9 | JS errors | `node tools/serve.mjs --root dist --port 8791 --no-open`; `MSYS_NO_PATHCONV=1 node tools/jserrors.mjs --base http://127.0.0.1:8791 --paths ...` | **12 pages, 0 errors** (home, services hub, dry-eye, glaucoma, designer frames, contact lenses, contact form, appointment form, what's new, a blog post, hours & location, 404.html). Control: a `data:` page calling an undefined function reports its ReferenceError and exits 1. (`10-jserrors.log`, `10-jserrors-control.log`) |
| 10 | overflow | `MSYS_NO_PATHCONV=1 node tmp/gallery/overflow-sample.mjs --base http://127.0.0.1:8791/ --paths ... --widths 320,390,768,1024,1440` | home + 6 families (services hub, service detail, library, eyewear, blog post, form) + hours & location + 404.html, plus the 6 pages whose layout round 2 changed (eyeglasses hub, insurance, location, the dry-eye post with a merged picture, the eyeglass guide, hard-to-fit): **150 combinations** (15 pages x 5 widths x normal/reduced motion), scrollWidth === innerWidth on all 12 samples each, **0 offenders** (the 14 non-home pages on tree `b0264de7...`, which differs from the final tree only by the `.rev-slide` width rule of the home carousel; the home re-run on the final tree: 10/10, `08-overflow-home-final.log`) (`08-overflow-a.log`, `-b.log`, `-c.log`) |
| 11 | behaviour gates (G6/G7 and more) | `node tmp/gallery/verify.mjs --base http://127.0.0.1:8791/` | **12/12 PASS**: IO-driven reveals, all released after a scroll-through; hover lifts a revealed service card -10px (frame -8px); keyboard focus gives the same lift without rotation; reduced motion at 390 and 1440 leaves 0 hidden content, 0 running animations, no parallax; phone fold; glass budget 10; drawer trap; form submit paths; 0 JS errors. (`09-verify-g6g7.log`) |
| 12 | ledger | `sr-plan --project . --check` | **exit 0**, 1,588 rows, COMPLETE (section 8; no rule text needed a change in round 2). (`11-sr-plan-check.log`) |
| 13 | frame time (G10) | `node tmp/qa/fixer-r2-ra/perf.mjs http://127.0.0.1:8791 <width> 7 blank,privacy,home` | on the final tree: home p95 **16.8 ms at 390 on 5/5 runs** (0.8% of frames over 17.5ms) and **at 1440 on 6/7** (2.7%; the miss read 33.3); blank and privacy 16.8 on every run. Before: 33-50 ms (section 10, RA2-02). (`tmp/qa/fixer-r2-ra/perf-390-finaltree.log`, `perf-1440-finaltree.log`) |

Also run on the final tree: **markup contract audit** (`node tmp/orch/markup-audit.mjs`, stdout in
`tmp/qa/fixer-r2/regression/12-markup-audit.log`): 350 pages, 0 `style` attributes, 0 duplicate ids, exactly one
`h1` per page, every `<img>` with width/height/alt, all 339 iframes inside `div.embed`/`div.map`, JSON-LD parses
everywhere, 0 source class tokens. It **exits 1 on the same two expected departures** as in round 1 (section 9):
`rootAbs: 404.html` (the F.7 exception) and `dataStray: data-show-if` x2 on the contact form. The audit script
belongs to the orchestrator (`tmp/orch/`) and was not edited.

## 6. Open items (not fixable by this pipeline alone, or not yet verified)

- **G13 Safari/WebKit** (glass, the prefixed path, fallbacks, `overflow: clip`, individual transforms,
  `:has()` in the cut-out and rail rules) cannot run on this machine; an Apple device is needed.
- **G10 frame-time profile** at 4x CPU throttle: **addressed in QA round 2 (RA2-02, section 10)**. The home now
  reads p95 16.8 ms on 12 of 12 runs at 390 and 19 of 21 at 1440 (three batches; the misses read 33.3), against
  33-50 ms before; `/privacy-policy/` and a blank page read 16.8 on every run of the same batches. The machine is
  shared (49 chrome.exe of other agents, 5-30% background CPU), so single batches drift; every comparison was
  made inside one interleaved batch (`tmp/qa/fixer-r2-ra/perf.mjs`).
- **QA tools that freeze parallax** by forcing `--py: 0` no longer freeze it where scroll-driven animations exist
  (Chrome): the layers move by CSS animation (section 10, RA2-02). Freeze with reduced-motion emulation,
  `[data-depth] { animation: none }`, or a viewport taller than 2400px (the rest pose).
- **G6-G8**: the gallery behaviour gates (reveals, hover lift on a revealed card, focus parity, reduced motion)
  pass 12/12 on the QA round 2 build (section 5 row 11); the full hover/focus comparator
  (`tmp/gallery/hover-focus.mjs`) was not re-run.
- **Scroll-driven parallax** (RA2-02) is Chrome-verified only: Safari 26+ also has `animation-timeline`, older
  Safari and Firefox fall back to the rAF path; neither was run here (see G13). The rest pose for viewports
  taller than 2400px, reduced motion and the +/- `data-depth-max` bounds were checked in Chrome (section 10).
- **Contrast over moving layers** was re-measured for the promo title only (CG2-02). The other layers move within
  the same bounds as before (and the orbs no longer move), so the earlier readings over them are expected to
  hold; that is unverified (not re-run).
- **Contact-form phone masks** (`(999) 999-9999` on the source's two phone inputs, a jQuery plugin) are not
  carried; the show-if rules are (QA CS-04). The inputs are `type=tel` with `autocomplete=tel`.
- ~~Visit block without an emergency card: an empty stone strip beside the NAP card~~ **fixed in QA round 2
  (VIB-R2-01, section 10)**: the NAP card spans the block there and covers the whole tray.
- The markup contract audit's hook list and root-absolute rule predate `data-show-if` and the 404.html
  exception (section 5).
- **Contrast with the texture** was re-probed on 3 pages (home, privacy policy, library root) at 1440 and
  390; the other families' sheets carry the same 6% layer but were not re-probed.
- `svc-contact-lens` (declared drop): `/eye-care-services/contact-lens-exams/` has no feature panel.
- The patient-education library licence (OPEN-DECISIONS #1) and form wiring (OPEN-DECISIONS #2).
- The keyless map renders in headless Chrome today (section 7); the `map__link` fallback (COMPONENTS B.15)
  is styled but not wired, so if Google withdraws the keyless endpoint every map becomes an empty frame.

## 7. Integration review (2026-09-28): what was looked at and what changed

**Screenshot round.** Served `dist/` on port 8791 (`tools/serve.mjs`, stopped at the end). One page per
template family at 1440 and 390 (`tools/shoot.mjs --full --scroll-steps 8`, one headless Chrome at a
time: `tmp/orch/shoot-all.sh`), split with ffmpeg (`tmp/orch/split.mjs`: 1440 at 50% in parts of 2,600 page
px, 390 at 1x in three 1,300 px columns) and viewed. Every shot: scrollWidth equal to the width, 0 broken
images. Notes, one per view:

| page | width | note |
|---|---|---|
| `/` | 1440 | hero glass over the scene, arch photo, dock, eyeglasses across the photo corner, promo break-out, sprig on the seam: as specified |
| `/` | 1440 | services cards break out of their tops, smile cluster crosses the seam, reviews level row, iris over the Q&A panel edge |
| `/` | 1440 | designer plates cross both band edges; **the keyless map renders the practice pin** (BUILD-DECISIONS #10 verified in Chrome); today (Monday) highlighted; footer ends on the lime field |
| `/` | 390 | Call strip, 64px header, 3 statement lines, photo under the glass, cut-out across the photo corner, 2x2 dock |
| `/` | 390 | services 2x2, carousel with peek and buttons, iris over the panel top, designer 2x2 hanging below the band, NAP over the map |
| `/eye-care-services/` | 1440 | photo band, prism crosses the band edge, CTA band, dock row, index cards with rising thumbnails |
| `/eye-care-services/` | 390 | readable; **empty ~100px stage tail under the photo** (fixed: item 25) |
| dry-eye detail | 1440 / 390 | **feature photo and source lead photo touch at the seam** (fixed: item 25); rail and aside correct |
| macular-degeneration | 1440 | plain band with iris rings, diagram on a white plate, rail current pill, index cards |
| sunglasses | 1440 | **the cut-out stays inside the band** (transparent margins; fixed: item 19) |
| `/insurance/` | 1440 | **heading-only sheets** "Vision/Medical Plans We Accept" (fixed: item 23) |
| appointment form | 1440 | solid paper fields, source labels and help, fieldsets, Submit, aside: correct |
| testimonials | 1440 | **~380px void under the short first card** (fixed: item 25) |
| `/whats-new/` | 1440 / 390 | plain band (the "Deana" exclusion), 3/2/1-column post cards; the phone capture stops at 16,000px (tool cap, not a site defect) |
| blog post with table | 1440 | plain band with date pill, plate figure right, table on paper in a labelled scroll region |
| `/our-eye-doctors/` | 1440 | photo band, dock row, team card with the 225px arch portrait, bio, CTA band; the emergency section is a prose sheet with its photo, not the C.1 `div.sos` card (left as is: the card has no photo slot) |
| privacy policy | 1440 | plain band, one long sheet at the measure |
| tag archive | 390 | h1 "eye-emergencies" is the source's own; index card; footer ends on the lime field |
| 404.html | 1440 | trimmed prism crosses the sheet's top-right edge by ~48px |
| hours & location | 1440 | visit block inside the 980px column, NAP over the map, payment accordion, dock row |
| after fixes: dry-eye, sunglasses, disposable contacts (twice), pediatric, insurance, testimonials, hub 390, dry-eye and library root 390 | both | each fix confirmed on the re-shot page; **disposable contacts first showed a severed fingertip** at 1440 and 390 (fixed: item 20) |

**Measurements after the fixes** (`tmp/orch/measure.sh`, log `tmp/orch/measure.log`):
- Collisions (`tmp/orch/collide.mjs`, at rest under reduced motion, 12 cut-out pages x 390/768/1024/1440;
  control fired): the prism and phoropter lay over the rail summary by 16-21px at 390 and 768 and the wide
  cut-outs touched it by 2-3px at 768; after item 25, the 8 affected pages at 390/768/1024 report 0. The
  one remaining flag, `404.html` at 1440, is the h2's full-width block box beside the floated plate (the
  text is at the left; the shot shows no overlap). Boxes are axis-aligned boxes of rotated images: a
  conservative test; visible-pixel overlap was not measured.
- Overflow (`tmp/gallery/overflow-sample.mjs`, the design agent's DESIGN-SPEC 4.3 method: scroll through,
  12 scrollWidth samples over ~6 s, offender list): 14 pages x 4 widths x normal/reduced = **112
  combinations, 0 failures, 0 offenders**.
- Contrast (`tmp/gallery/contrast-probe.mjs`, rendered pixels, fonts loaded, drift guard): home, privacy
  policy and the library root at 1440 and 390: **0 FAIL**, controls 4.54 and 3.24, no drift; "We Know
  You!" over the textured hero glass 9.39 (1440) and 8.84 (390) against 4.5; "Our Designer Optical" 3.88-
  3.93 and 3.58 against 3.5.

**Static cross-check** of HTML classes against the shipped CSS: 36 classes carry no rule of their own
(body family classes `t-*`, modifiers such as `band--plain`, JS hooks); 12 CSS classes are never emitted
(the dormant dropdown pattern, `map__link`, the heading-less CTA band's `cta-band__h`, linked logo chips:
the source has no linked logos, `linkrow`: no source paragraph is a pure link row). No mismatch that
leaves rendered markup unstyled was found.

## 8. Change-control ledger (`tools/ledger-decide.mjs`)

`audit/change-control.json`: **1,588 rows**, `sr-plan --project . --check` **exit 0** ("COMPLETE"):
IMPROVE 1,543, REMOVE 19, REPLACE 9, ADD 14, PRESERVE 3. Every row has a decision, a narrative slot, a why
naming the component the rebuild renders (`rebuiltAs`), and a preset from the index; `sr-match` reports 0
undecided. The rule for each row is in `audit/ledger-rules.json`.

- The 1,544 crawled rows are decided by page family (`site-map.json`) and label: the home's 8 rows by
  position (hero + Welcome, offerings, the 4 service tiles, Q&A, emergency); the sidebar's "Clifton Eye
  Center" and "Insurance Plans" rows (334 each) as the aside cards; the 5 sidebar rows on the 3 pages
  rendered without an aside as REMOVE with the reason; the 3 `/template/*` artefacts PRESERVE.
- 44 rows the crawl cannot produce are added once (ids `www.cliftoneyecenter.com/#ledger-*`, `sourceTag:
  "ledger-added"`): the DESIGN-SPEC 7.4 rows L01-L23 (L08 unused by the spec; L11, L14 and the honeypot
  half of L23 are the per-removal rows), one REMOVE (or REPLACE) row per element of
  `audit/clone-removals.json` (the voice-search form, the sidebar search, the "Powered by" vendor credit,
  the Login link, the "Return to top of menu" trap, GTM, the New York microdata, empty team modules, the
  empty sidebar h3, the hidden ratingValue, the form honeypot, the icon font, review-quote.png) plus the
  vendor sentences on `/disclaimer/` and the thanksgiving image; and ADD rows for each generated-imagery
  kind (hero, sprig, band scenes, band cut-outs, svc features, slot-fills, the 404 prism, the texture,
  with their page lists from `audit/image-slots.json`), `dist/404.html` and the favicon.
- Presets: the matcher ran once (its verdict kept in `audit/preset-match.matcher-verdict.json`); every row
  was then answered with the preset of the component actually built (24 matcher picks overridden, listed in
  `audit/ledger-rules.json`). For REMOVE rows the preset names the component that took over that part of
  the page.
- A plain `sr-plan --project .` refresh keeps the added rows but flags them `absentFromLatestCrawl` (the
  skill never drops rows); re-running `node tools/ledger-decide.mjs` is idempotent.
- **QA round 1 (2026-09-28):** no decision changed. The rule texts in `tools/ledger-decide.mjs` were brought in
  line with the fixes (L06: promo h2, service captions h3; L13: "Quick actions"; `add-404-html`: root-relative
  URLs; the service-tile and form-page rules; the reading measure "about 66 characters per line" instead of
  "66ch" in the article, blog-post and legal rules; a new `heading-run-title` rule for the 4 heading-only
  sections of section 4 item 23). `node tools/ledger-decide.mjs --dry` wrote the plan to
  `audit/ledger-rules.json`, and only the 696 rows whose why / rebuilt-as differed from it were applied, each
  through the skill's own `sr-plan --set` (`tmp/qa/fixer-r1/resume/ledger-sync.mjs`; a second dry pass reports
  0 left). `sr-plan --check` exit 0. The 44 added rows carry `absentFromLatestCrawl: true` from a plain
  `sr-plan --project .` refresh made before this pass (not by it); the flag changes no decision.

## 9. QA round 1 fixes (2026-09-28)

The 40 confirmed findings of `tmp/qa/round1-confirmed.json` (1 blocker, 10 major, 29 minor), each fixed in its
owning source file; the before/after reading of each is in the fixer's report and under `tmp/qa/fixer-r1/`.
A first fixer run died mid-way; its partial source edits were reviewed hunk by hunk, kept where they fixed a
finding, and completed. Items marked **spec** change a DESIGN-SPEC value; **contract** extends or departs from
COMPONENTS.md (which this pass does not own, so the change is recorded here).

| finding | change (file) | recorded change |
|---|---|---|
| VIB-01 blocker | every URL in `dist/404.html` root-relative (`build.mjs`); link-check knows the exception | F.7 as written; section 4 item 15 |
| CS-01 | the home gets no derived description (`build.mjs`) | section 4 item 6 |
| CS-02 | a link around only an image is one block unit (`content.mjs` wrapLooseText, wrapContentFigures): the EyeGlass Guide logo links to `http://ecp.eyeglassguide.com/tool/default.aspx` again, target `_blank`; the 4 linked header logos on 2 `/template/*` artefacts come back too. The link sits inside `span.fig__media` | contract: `a` inside `fig__media` |
| CS-03 | descriptions from one source block (`seo.mjs`) | section 4 item 6 |
| CS-04 | the contact form's source show-if rules parsed from the raw page (`forms.mjs parseConditionalLogic`, fail-closed on anything else) -> `data-show-if="{name}={value}"` on the field; `site.js` hides the field and disables its controls until that choice is made (no JS: every field shows) | contract: new hook `data-show-if` (COMPONENTS section 1) |
| CS-05 | page-own alts (`content.mjs`) | section 3, 2.8 |
| CS-06 | unused row background photos placed as section figures (`build.mjs`) | section 4 item 11 |
| CS-07, CS-08 | `og:type` (152 article / 197 website + 404) and `twitter:card` ("summary") follow the source page (`build.mjs`, `templates.mjs`) | contract: COMPONENTS A.1 fixed "website" / "summary_large_image" |
| VH-01 | from 860 to 1279px the hero photo and the eyeglasses sit 46px higher (`.hero__photo` margin-bottom -34px, `.hero__cut` -82px) so the 4th dock tile clears the chin | spec 3.3 margin-bottom |
| VH-02 | below 440px the service-tile arrow chip takes its own line at the card's right | spec 3.6 |
| VH-03 | the 4 service labels are `h3.svc__name` inside `div.svc__foot`, styled as before (`home.mjs`) | contract: COMPONENTS G.5 / spec 3.6 `span.svc__name` |
| VH-04, VIB-02 | the visit block's map panel grows by the cards' overlap (a "tray"); the embed stops at the cards' top edge, so Google's logo, attribution, Terms, Street View thumbnail and camera control are never covered; the emergency card starts on the NAP card's line | spec 3.12 overlap geometry |
| VH-05 | an hours value never breaks (`white-space: nowrap`; the row wraps whole under its day if it must; tighter padding in a narrow NAP card) | spec 3.12 |
| VH-06 | the olive sprig follows the services band's left edge once the band stops growing (~1480px+) | spec 3.10 position |
| VH-07 | below 860px the hero grid has 36px top padding (was 22): a 12px gap under the hanging logo plate | spec 3.3 |
| VH-09 | the top-bar address is `text-wrap: balance` (two even lines at 1024, no lone "71111.") | none |
| VIA-01 | `--measure` 66ch -> **51ch** (median full line 64-66 characters at 1440 and 768; 66ch set 85-89) | **spec** 2.3 `--measure: 66ch` (the 7.2 #12 resolution) -> 51ch; it also narrows every other `--measure` user (home Welcome and Q&A text, testimonial cards, form intro, plate cap), viewed at 1440 |
| VIA-02 | `glasses-contacts-hero` is cropped from the left (`band__visual--left`, `object-position: 10% 40%`; `build.mjs` BAND_FOCUS) | none (the file is unchanged) |
| VIA-03 | `.fig { margin: 0 }` removed: a figure after text gets the prose rhythm (.9em) | none |
| VIA-04 | heading-only chunks become section titles / `div.section-head` | contract: `div.section-head`, `.section-title--sub`; section 4 item 23 |
| VIA-05 | letter-spaced capitals in headings keep each spaced word whole (`span.nobr`) | contract: new span class `nobr` |
| VIA-06 | from 900px a plate that ends its prose block is not floated | spec 3.16 (float only where text can wrap) |
| VIA-07 | logos at intrinsic size (the 70px height cap dropped; grid column minimum 161px) | **spec** 3.21 "max-height 70px" removed |
| VIA-09 | index-card thumbnails never drawn wider than their file | none (spec 6.4/6.5 as written) |
| RA-01 | below 1024px the "#HeretoHelp" side row may wrap (the iris drops under the title at 320-340px) | none |
| RA-02 | `--scroll` is written on the progress bar's span, its only consumer; custom properties are written only when their value changes (`site.js`) | contract: COMPONENTS section 1 "--scroll on html" |
| RA-04 | focus inside a not-yet-revealed block shows it at once (`motion.css :focus-within`) and marks it revealed (`site.js` focusin) | none |
| RA-05 | the home promo title is h2 (was h3 after the h1) | ledger L06 |
| RA-06 | the top bar and the header bar sit in one `<header class="masthead">` (banner landmark, `display: contents`, the bar stays sticky); the bar itself is `div.site-header` | contract: COMPONENTS B.1/B.2 |
| RA-07 | the docks' non-visible label is "Quick actions"; the form sheet and, on form pages, the band are unnamed | ledger L13; section 4 item 24 |
| RA-08 | inline prose links get 3px block padding (26-28px hit boxes, no layout change); footer and breadcrumb "Home" 44px wide below 768px; the NAP / footer tel links 44px tall | none |
| RA-09 | the reviews track is `role="group"` named by "#HappyPatients"; it is a Tab stop only below 1024px | none |
| VIB-04 | phone numbers never split: CTA labels, the home emergency button and 14 numbers in running text sit in `span.nobr` (inside a flex button the span is `display: contents`) | contract: span class `nobr` |
| VIB-05 | no `content-visibility` on the 151 post cards (the document height is stable while scrolling) | **spec** 3.18 |
| VIB-07 | radios carry `required` only (no `aria-required`) (`forms.mjs`) | none (COMPONENTS E.2 as written) |
| CG-02 | from 561 to 859px the Welcome section ends 68px lower, so the sprig clears the closing link at every parallax pose | spec 3.7 / 3.10 spacing |
| CG-03 | parallax layers re-measure on any page-height change (`<details>` toggle, ResizeObserver on body) | none |
| CG-04 | the stuck header bar and plate get one short, tight shadow instead of `--gb-shadow` + `--e-2` | **spec** 3.2 "the glass gains --e-2" |

## 10. QA round 2 fixes (2026-09-29)

The 26 confirmed round-2 findings, each fixed in its owning source file, rebuilt, and re-measured with the lens's own
repro script (copied under `tmp/qa/fixer-r2*/`, so no lens folder was written). The five findings past the 21 spelled
out in the orchestrator's task text (it was cut off inside CG2-01) were taken from the round-2 attacker and refuter
evidence: CG2-02 (`tmp/qa/contrast-glass-r2-refuter/promo.mjs`) and the four content-seo items F1-F4
(`tmp/qa/content-seo-r2/evidence-snippets.txt`, refuter checks in `tmp/qa/content-seo-r2-refuter/`). A build of the
unchanged sources reproduced the round-1 `dist/` exactly (`538444d2...`), so every later difference is attributable
to these edits. Markers as in section 9: **spec** changes a DESIGN-SPEC value; **contract** extends or departs from
COMPONENTS.md.

| finding | change (file) | before -> after (evidence) | recorded change |
|---|---|---|---|
| VHR2-01 | below 340px the logo plate box narrows with the viewport (112px at 340 -> 92px at 320), so the 3 round buttons keep 8px to the plate (`site.css`) | 320: plate over the calendar button by 12px -> clear by 8px (`tmp/qa/fixer-r2-vh/probe2.after.log`; `crops/header.320.after.x3.png` viewed) | spec 3.2 plate size below 340px |
| VHR2-02 | below 440px `.svc__foot` is an inline-size container and `.svc__name` is `min(--fs-sm, 10.4cqi)` | "COMPREHENSI/VE" at 320, "COMPREHENSIV/E" at 340 -> 0 mid-word breaks over 18 widths, chip inside the card (`svc-breaks.log`; `crops/svc.320.after.png` viewed) | spec 3.6 caption size below ~366px |
| VHR2-03 | the emergency card is start-aligned from 720px (stretched again from 1240) | paragraph-to-button gap 41-116px at 768-1239 -> 14px at every width (`probe2.after.log`; `crops/visit.1100.after.png` viewed) | none (the VH-04 geometry stays) |
| VHR2-04 | in a NAP card narrower than 232px the hours list reaches 8px into the card padding | 320: Wednesday row 60px, its value under the day -> all 7 rows 36px and level (`probe2.after.json` B.hours) | spec 3.12 |
| VHR2-05 | below 1024px `site.js` sizes the reviews track to the cards at least half in view (+ its padding) on load, slide change, resize and card reflow; `overflow-y` clipped; the height eases (`motion.css`); a slide is `min(86%, 640px)` (was 420px), so below 1024 at most ~44% of the next card peeks and one card sets the height (capped at 420px, a tablet showed ~60% of a second card and no height fitted both) | void under the first card 112-244px (142-145 at 720-900) -> 28-29px (the track padding) at every carousel width 320-1023; card-to-buttons 18-19px on every slide; height auto again from 1024 (`probe2.final2.log`, `carousel-run.after.log`, `carousel-run.final.log`; `crops/reviews.390.after.png`, `reviews.768.final.png` viewed) | **spec** 5.6 track height, slide cap 420 -> 640px; contract: runtime behaviour of `[data-carousel-track]` |
| R2-VIA-01 | below 400px the logo grid's column minimum is 140px and the chip padding 12px (`--logo-col`, `--logo-pad`) | 360/365: one 328px column, wall 4,638px, page 8,297px -> 2 columns (158/160.5px), logos 133 x 110 (full size), wall 2,324px, page 5,983px (`tmp/qa/fixer-r2-via/logo360.after.log`) | spec 3.21 column minimum below 400px |
| R2-VIA-03 | below 1024px a band with the rising fingertip keeps `1.022 x cut width + 12px` (net of the band padding) under the title panel | overlap 92 x 11-14px, 6/12 top points under the panel -> 0 and 0/12 at 320-1024 on both repro pages (`riseoverlap.after.log`) | spec 3.14 |
| R2-VIA-04 | `glasses-hero-1.jpg` gets `band__visual--right` (`object-position: 90% 40%`; `build.mjs` BAND_FOCUS) | visible x 22-78% (1440) / 25-75% (390) -> 40-96% / 45-95%; the subject (57-86%) inside at 320-1440 (`egband.after.log`; `crops/egband.1440-390.png` viewed) | none (the file is unchanged) |
| R2-VIA-05 | the index-card thumbnail frame is one 3:2 slot as wide as the card allows (max 325px), the image centred in it at no more than its file size (a paper mat round the 250px file) | title offset 150 against 161-191 in one row -> equal in every row (160/161 at 1440, 188 at 768, 190 at 390) (`cardrow.after.log`) | spec 6.4/6.5 frame (the image rule is unchanged) |
| R2-VIA-06 | from 900px a text-only sheet on a solo page is its measure + padding wide, at the column's left edge (a sheet with a picture, table, embed, logo wall or form keeps the full width) | text sheets 33-44% empty -> 0-4% (`sheetfill.after.log`; `crops/after.insurance.1440.p0.png`, `p1.png` viewed). The two plan-name lists on `/insurance/` (1 and 7 short names) stay 62-89% empty: their content is that short | **spec** 3.15 solo sheet width |
| R2-VIA-07 | a linked plate lifts -6px and gains `--e-2` on hover and keyboard focus (`site.css`, `motion.css`) | no hover change -> figure `translateY(-6px)`, shadow e-1 -> e-2 under a real CDP hover (`plate-hover.after.log`) | none (spec 5.5 linked-chip pattern) |
| R2-VIA-08 | in every heading of `<main>` the word before an em dash and the dash sit in `span.nobr` (`build.mjs`; 1 heading site-wide) | "PLENTY OF CHOICE" / "—EYEGLASSES" -> "PLENTY OF CHOICE—" / "EYEGLASSES"; no line starts with the dash at 320-1440 (`eg-h1.after.log`) | contract: `span.nobr` use extended |
| R2-VIA-09 | `.section-title--sub` is `text-wrap: balance` | "... IN Bossier" / "City" -> "DESIGNER EYEWEAR" / "IN Bossier City" at 320-414 (`df-hlines.after.log`) | none |
| VIB-R2-01 | 720-1239px, a visit block with no emergency card: the NAP card spans the block (24px in) and lays out in two columns (contact lines left, hours right; a grid whose last row is 1fr) | uncovered tray 375-500 x 120px -> 24px side margins only; Google's strip never covered (`tmp/qa/fixer-r2-vib/tray.after.log`; `shots/map.after_hours.1024.cards.png`, `map.after_loc.1440.cards.png` viewed) | **spec** 3.12 interior variant |
| VIB-R2-02 | `site.js`: while a pointer is down on a submit control (until its click, 1.5s at most) the field focusout check waits; the submit handler checks every field and focuses the first invalid one | 8/8 invalid runs lost the click -> 8/8: 1 click, 1 submit, focus on the invalid field; 8/8 valid controls show the notice (`lostclick.after.log`) | none (spec 3.20 as written) |
| VIB-R2-03 | `.glass::after` (the sheen) at `z-index: -1`: every `.glass` isolates, so it still paints over the glass fill, but under its in-flow text | focused notice glyphs 4.04-4.58 -> 12.6-12.7 at 1440/1024/768/390 (blurred control 12.3-12.4) (`segcontrast.after.log`; `notice/notice.1440.focused.full.png` viewed) | none |
| VIB-R2-04 | a prose chunk holding only pictures joins the next sheet (at its start: source order), else the previous one; with neither it stands in the column without a sheet (`build.mjs`; 23 merged incl. 404.html, 1 unwrapped on `/template/header/`); from 900px the heading or paragraph beside a plate that opens its sheet starts level with it (`site.css`) | 22 image-only sheets -> 0 (the scan's 3 `/testimonial/*` hits are its known false positives; its control fires) (`tmp/qa/fixer-r2/after/image-only-sheets.log`; `tmp/qa/fixer-r2-vib/crops/merged.dryeye.1440.top.png` viewed: the cactus plate floats beside its heading and text, as in the source) | contract: C.4 (no picture-only sheet) |
| RA2-01, CG2-01 | a `fig__media` holding a link does not clip (`overflow: visible`); the image is rounded itself | focus ring: 0 changed pixels -> 8,630/17,438 (1440), 8,632/17,446 (390), 13,036/26,274 (`/template/header/`) ring-band pixels, equal to the refuter's no-clip control (`tmp/qa/fixer-r2-cg/focus.after.summary.log`; focused crop viewed) | none |
| RA2-02 | see below | home p95 33-50 ms -> 16.8 ms at 4x CPU (390: 12/12 runs; 1440: 19/21, median 16.8) | **spec** 5.3 / 5.4 (below) |
| RA2-03 | `site.js`: when the layout turns desktop with focus in the open drawer, focus moves to the primary-nav link with the same href (else the first nav link, else the logo) | focus on `<body>`, the next Tab restarted at the skip link -> focus on the matching `a.mainnav__link`, Tab continues through the nav, on both repro paths (`tmp/qa/fixer-r2-ra/drawer-resize.after.log`) | contract: section 1 drawer behaviour |
| CG2-02 | the promo photo only rises from its rest pose (JS path `min(--py, 0)`; scroll-driven path `cec-depth-up`) | 768: ring over the title's glyph tops, rendered 1.10, nominal 2.9 -> over every in-view pose with the title below the header: rendered >= 4.27, nominal >= 3.84 (the rest-pose shadow; the title is large text, 3:1) at 390, 768 (x900, x1024), 1024, 1440 (`tmp/qa/fixer-r2-cg/promo.after.log`; crop viewed) | spec 5.3 promo depth one-way |
| F1 (content-seo) | derived descriptions: an inline tag adds no space (`seo.mjs`) | see section 4 item 6 | none |
| F2 (content-seo) | an external link keeps its source `rel` (nofollow, noopener, noreferrer, sponsored, ugc) and `target`, plus `noopener` on a new tab (`content.mjs`); CTA buttons and quick-action tiles carry their source rel (`content.mjs` extractors, `templates.mjs` `relOf`); the footer Facebook link is `rel="nofollow noopener"` as on all 347 source pages (`chrome.json`) | nofollow lost 14 -> 0, noreferrer lost 40 -> 0, target added 13 -> 0 (the 1 row left is the check's own false positive: `/glossary-of-eye-care-terms/` has two anchors to one URL, one with and one without target, both reproduced exactly); Facebook `nofollow noopener` 351/351 (`tmp/qa/fixer-r2/after/rel-check.log`) | COMPONENTS as written ("keep their source attributes") |
| F3 (content-seo) | `twitter:title` from the source page (`build.mjs`, `templates.mjs` head) | 0 pages -> 341, every one verbatim (control fires) (`after/tw-verbatim.log`) | contract: COMPONENTS A.1 head |
| F4 (content-seo) | `ErrorDocument 404 /404.html` in `.htaccess` (`build.mjs`) | 0 -> 1 line (`after/htaccess.log`) | section 4 item 15 |

**RA2-02 (gate G10): what was measured and what changed.** Harness `tmp/qa/fixer-r2-ra/perf.mjs` (the runtime-a11y
r2 method: rAF deltas over a 6,000px synthesized scroll gesture at 4x CPU; variants injected; round-robin interleaved
with a blank page and `/privacy-policy/` as the noise floor; 3-7 reps). Attribution on the round-1 build: at 390 the
cost was the per-frame custom-property writes (suppressing `--py`/`--pr`/`--hp` alone gave p95 16.8; promoting every
layer to its own compositor layer still left 8% of frames over 17.5ms; the inherited `--hp` alone restyled the whole
hero); at 1440 it was those writes plus the orbs' `cec-morph` keyframes, which animated `border-radius` on
42px-blurred elements (a main-thread repaint every frame). Changes:

1. Where `animation-timeline: view()` is supported, the scroll-linked movement is CSS scroll-driven animations run by
   the compositor (`motion.css` `@supports` block: `cec-depth`, `cec-depth-up` and `cec-rot` on `view()`; the hero
   photo and sun on a named `--hero` view timeline over `exit-crossing`). `site.js` copies each layer's
   `data-depth`, `data-depth-max` and `data-rot` into `--d`/`--max`/`--rot` once and writes nothing per frame. The
   bounds are the JS path's: every layer stays within +/- `data-depth-max` (checked on every layer over a full sweep
   at 1440 and 390, 0 violations), the sprig within +/- 12deg, the promo photo never below rest, the hero photo
   1.06 -> 1; reduced motion and a viewport taller than 2400px leave every layer at rest
   (`tmp/qa/fixer-r2-ra/layers-move.log`). Elsewhere the rAF path runs unchanged. A layer's excursion is linear
   across its pass through the viewport between its clamped end poses, so it is never larger than the JS path's.
2. `cec-morph` animates `transform` only (rotate + scale); the border-radius steps are gone.
3. The 10 colour orbs carry no `data-depth` (`home.mjs`): 42px-blurred layers moving under the glass kept 1440 at
   p95 33ms even on the compositor. The depth comes from the protruding photos, cut-outs, sprig, smiles and iris.
4. The ambient drifts (blobs, orbs, hero beams, from 700px) pause while the page scrolls: `site.js` sets
   `html.is-scrolling` from the first scroll event until 200ms after the last (the class changes twice per scroll,
   never per frame). Contract: a new runtime class for COMPONENTS section 1.

Result: at 390 the home reads p95 16.8 on 7/7 runs (the build before the last two CSS rules) and on 5/5 on the final
tree (0.8-1.9% of frames over 17.5ms; was p95 33-50, 27-43%); at 1440 on 13/14 runs over two batches before and 6/7
on the final tree (1.5-2.7%; was p95 50, 80.6%); privacy and blank read 16.8 on every run of the same batches
(`perf-390-final.log`, `perf-1440-final.log`, `perf-1440-smiles.log`, `perf-390-finaltree.log`,
`perf-1440-finaltree.log`). The two 1440 misses (33.3, 2 of 21 runs) fell in batches where privacy held 16.8, so the
median meets G10 but the margin at 1440 is thin on this shared machine (49 chrome.exe of other agents); a re-profile
on a quiet machine is the check that would settle it.
