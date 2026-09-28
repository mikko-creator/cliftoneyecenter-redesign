# Build notes: the Clifton Eye Center pipeline (`src/build.mjs`)

Written by the build agent, 2026-09-28; sections 4 (items 17-27), 5, 6, 7 and 8 rewritten by the
integration agent the same day, after the first full visual review. This file says what the pipeline does,
which decisions it applies, and the evidence for each definition-of-done item. Every number in section 5
was produced by a command run on the final `dist/` (aggregate `5e6550b0...`); the command is named beside it.

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
`dist/sitemap.xml`, `dist/robots.txt`, `dist/_redirects` + `dist/.htaccess` (9 carried-forward 301s),
`dist/styles/` (the design CSS), `dist/scripts/` (`site.js`), `dist/fonts/` (8 woff2 + `fonts.css` + 2
OFL texts), `dist/img/` (WebP; generated images under `img/generated/`), `dist/docs/` (the 2 patient
PDFs), `dist/favicon-32.png` + `dist/apple-touch-icon.png`. Every internal URL is page-relative
(`../` x depth + `path/index.html`), so `dist/` works from any directory or subpath.

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
| 2.4 og:image | The page's own source share image when it maps to a shipped local file (the 19 dead `/clipart/` paths map to their CDN twin by file name); else the logo. Always an absolute `https://www.cliftoneyecenter.com/img/...` of a file that ships. |
| 2.8 alts | File-name, upload-hash or %20-garbled alts (37 inventory entries, for example "dry eyes droplet 250x376.jpg", "clipart 010", "daisy 20glasses") become `alt=""`; readable alts are kept verbatim; nothing is authored (L12). Index-card thumbnails are `alt=""` (COMPONENTS H.3). |
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
6. **Descriptions.** Missing source descriptions (168) are derived from the page's own opening prose; the
   fallback is the text of the RENDERED main column, never `page.bodyText` (on the 23 R-1 pages that holds
   the menus: 7 descriptions began "Skip to main content Hours & Location..." before this fix).
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
    `Designer-Frame-3a` with the mobile variant `Designer-Page-Hero-Girl-mobile`. `Frames-Chanel-Pink-sm`
    (a builder row background, brand-named) is not rendered anywhere: the design agent may place it.
12. **Icon-only links** keep the source `aria-label` as their visible text ("Visit us on facebook", only on
    `/template/footer/`); the reference printed an authored brand word.
13. **Outbound Drupal link.** `/living-with-low-vision/` cites `www.preventblindness.org/sites/default/files/...pdf`;
    the path matches `sr-decontaminate`'s `drupal-marker` pattern. The link is kept as the source prints it and
    the file is declared in `audit/clone-removals.json` `prosePlatformNames` with the reason. The platform
    grep in section 5 item 6 still scans that file (0 hits).
14. **Empty `tel:`** on `/hours-location/` (the source's `<a href="tel:"> 318-550-5815.</a>`) is unwrapped:
    the number stays as text.
15. **404.html** is the `/404-page-not-found/` content at depth 0 (page-relative). A host that serves it
    for a missing NESTED path on a subpath deploy will load it without styles; configure the host's 404
    handling at the site root (a deploy note, not fixable with page-relative URLs).
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
24. **Sheets carry no accessible name** (COMPONENTS C.4). The build had put `aria-labelledby` on every
    prose sheet (166 pages), making each a region landmark, with generated `sec-N` ids nothing linked to.
    Both are gone; an h2 keeps an id only when the source's own anchor links target it. The form sheet
    keeps `aria-labelledby="page-title"` (PORT-NOTES F-3).
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

Final run 2026-09-28 by the integration agent, on the canonical `dist/` built by `node src/build.mjs`
(`tmp/orch-build-7.log`) with every source file as it stands now. `dist/` aggregate sha256
`5e6550b0cbd153e27323bc37abaeded1067f060aeb34e069653b8e77b9c18fd5` (662 files); every check below ran on that
tree (re-hashed after the jserrors control page was removed again).

| # | check | command | result |
|---|---|---|---|
| 1 | build | `node src/build.mjs` | **exit 0**, **0 build failures**; 349/349 page files + `dist/404.html`. 271 source images kept, 291 image files shipped, **18 generated files shipped, 18 carrying the `trainedAlgorithmicMedia` XMP** (checked in the shipped bytes). Generated slots: **143 rendered, 17 skipped, each with its reason** in `audit/image-slots.json` (10 brand-name or Dr. Clifton text exclusions, 4 brand-logo exclusions, 1 declared drop, 2 hub sections with no host). CSS integrity: 0 `var()` without a fallback left undefined, 0 animation names without `@keyframes`. |
| 2 | reproducible | `CEC_DIST=tmp/repro/a` and `tmp/repro/b` builds, then `node tmp/orch/hashdir.mjs tmp/repro/a tmp/repro/b dist --control` | 662 files each; aggregate `5e6550b0...` for a, b and `dist/`: **IDENTICAL**. Control: one byte appended to `index.html` in memory changes the aggregate and names the file (fired). The derived assets: the texture recipe and a trim recipe each run twice through ffmpeg give identical bytes (`c1541782...`, `f0cd72d2...`, equal to the cached copies), and cwebp run twice on each gives identical bytes. A full cold-cache rebuild (every cwebp encode from an empty cache) was not run in this session (unverified). |
| 3a | sr-parity readings | `node <skill>/sr-parity.mjs --project .` | 349 mapped, 0 missing, extra `404.html` (its ADD row); mean recall **98.3%**; blocker/major/minor **361/39/213**, verdict DRIFT. Blockers: `form-lost` 347 (the search and voice-search forms, REMOVE rows), `form-no-action` 2 (L23), `content-loss`/`content-block-missing` 12 (R-1 pages whose extractor text holds the menus x4, footer and sidebar; the declared `/disclaimer/` vendor sentences). Majors: 36 of the same R-1 chrome readings, plus 3 `section-lost`: the home's 4 service labels (source h2, rendered as the spec 3.6 `span.svc__name`; text present) and the sidebar "Clifton Eye Center" h2 on `/whats-new/` and `/404-page-not-found/` (no aside by COMPONENTS C.1; REMOVE rows). Minors: 208 `alt-missing` (L12 blanked file-name alts and decorative generated images, `alt=""` by spec L18, including the 13 new library prisms), 4 `title-changed` and 1 `h1-changed` (declared). |
| 3b | sentence parity | `node tools/sentence-parity.mjs` | 13,966 source sentences: **13,595 found**, 363 source chrome only, 8 declared removals, **0 lost**; 3 found only whitespace-insensitively. Control fired. |
| 4 | tag balance | `node tools/tag-balance.mjs` | 350 pages, **0 unbalanced**, 0 findings; control fired (6 planted kinds). |
| 5 | fabrication | `node tools/write-facts.mjs` then `sr-fabrication --project . --strict` | facts: 9 testimonial cards on 5 pages, people 1, social 1, hours 7 (re-verified against `audit/raw`). Gate: **SOURCED**, 350 files, 660 claims, **0 blocker / 0 major**, exit 0. |
| 6 | decontamination | `sr-decontaminate --project . --dir dist --strict`, then `grep -rliaF` per term over **all 662 files** of `dist/` | **CLEAN**, 358 files, 0/0/0, exit 0 (1 declared prose file, section 4 item 13). Grep, case-insensitive, binaries included: wp-content, wp-json, fl-node, fl-row, fl-module, ecp-, gform, gravityforms, eyecarepro, ecpmarketer, cloudfront.net, splide, wow.js, AIza, "Powered by", googletagmanager, GTM-P6GSK34, data-vocabulary: **0 files each**. Control over `audit/raw`: wp-content 349, fl-node/fl-row/fl-module 349, ecp- 349, gform 2, gravityforms 2, eyecarepro 346, cloudfront.net 349, splide 338, AIza 338, "Powered by" 346, googletagmanager 349, GTM-P6GSK34 349, data-vocabulary 347; wp-json, ecpmarketer and wow.js have 0 hits in the raw too, so their control cannot fire. The fal key id was not scanned (this agent does not hold it; the imagery agent reported it in 0 of 3,646 project files). |
| 7 | links | `node tools/link-check.mjs` | 354 html/css files, **20,328** local refs, 2,881 external skipped, **0 broken**, 0 root-absolute; 4 planted controls fired. |
| 8 | noindex | robots re-parsed from the raw heads vs `dist` vs `dist/sitemap.xml` | source **217** noindex, `dist` **220** = 217 + the 3 declared `/testimonial/*` singles; sitemap **129** absolute URLs = the 129 indexable pages, 0 missing, 0 noindex listed; `dist/404.html` noindex. |
| 9 | JS errors | `node tools/serve.mjs --root dist --port 8791 --no-open`; `MSYS_NO_PATHCONV=1 node tools/jserrors.mjs --base http://127.0.0.1:8791 --paths ...` | **17 real pages, 0 errors** (home, services hub, dry-eye detail, library root, macular-degeneration, sunglasses, disposable contacts, insurance, appointment form, testimonials, blog index, a blog post, our eye doctor, privacy policy, a tag archive, hours & location, 404.html). Control: a planted throwing page in `dist/` reported its ReferenceError (the run exits 1 on the control alone); the page was removed and `dist/` re-hashed identical. |

Also run on the final tree: **markup contract audit** (`node tmp/orch/markup-audit.mjs`, log `tmp/orch/markup-audit.log`; a planted `style` attribute fails it): 350 pages, 0 `style`
attributes, 0 duplicate ids, exactly one `h1` per page, every `<img>` with width/height/alt, all 339 iframes
inside `div.embed`/`div.map`, JSON-LD parses everywhere, 0 root-absolute URLs, 0 `data-*` outside the
COMPONENTS section 1 hooks, 0 source class tokens. **Ledger**: `sr-plan --check` exit 0 (section 8).

## 6. Open items (not fixable by this pipeline alone, or not yet verified)

- **G13 Safari/WebKit** (glass, the prefixed path, fallbacks, `overflow: clip`, individual transforms,
  `:has()` in the cut-out and rail rules) cannot run on this machine; an Apple device is needed.
- **G10 frame-time profile** at 4x CPU throttle: not run.
- **G6-G8** (hover/focus comparator, reduced motion, reveals) were run by the design agent before this
  review and not re-run after the integration CSS changes (none of which touches hover, focus or motion
  rules; unverified all the same).
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
