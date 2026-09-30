# Change log: Clifton Eye Center, "Daylight Canopy" redesign

This file records what changed from the live site `https://www.cliftoneyecenter.com/` to this rebuild, and in what
order the work happened. The per-section record is `audit/change-control.json` (1,588 rows). Each rule behind a row is
in `audit/ledger-rules.json`. How the build applies the rows is in `docs/BUILD-NOTES.md`. Local time is +08:00
throughout.

| commit | when | what |
|---|---|---|
| `8ff25f7` | 2026-09-28 09:54 | Capture: crawl, extract, assets, browser baseline capture, tokens, motion, understand-phase docs |
| `f9cf8e9` | 2026-09-28 09:54 | Untracked an HTML soft-404 saved as `clipart-010.jpg` (it carries the old agency's Maps key). This removed the file from the tree only: it is still in commit `8ff25f7`, so **the key is in git history** (below) |
| `3b9c0fc` | 2026-09-28 15:24 | Build: the Daylight Canopy pipeline for 349 pages, design system and home page, 15 reviewed fal images, integration review |
| `270777d` | 2026-09-28 19:47 | QA round 1: 40 confirmed findings fixed |
| `5289405` | 2026-09-29 02:16 | QA round 2: 26 confirmed findings fixed |
| `1558378` | 2026-09-29 04:40 | Final verification: map-corner fix (Google attribution clipped at >= 1240px), every gate artifact regenerated on the final build, handoff docs corrected against evidence |
| (next) | 2026-09-29 | Docs updated for the history rewrite that purged the old Maps key (all hashes above are post-rewrite) |

After `5289405`, the final gate chain and an independent re-verification ran on the unchanged `dist/`
(`tmp/final/chain/`, `tmp/final/verify/`). Outside `tmp/`, they changed only files under `audit/` and `project.json`.
The handoff docs (`README.md`, `DEPLOY.md`, this file) and a gate re-run followed on 2026-09-29
(`tmp/final/docs/`). None of this is committed.

**Gate verdict: NOT-READY.** The latest `sr-gate.mjs --project .` run reads 22 PASS, 7 FAIL (C03, C06, C07, C17,
C19, C22, C23), 0 UNPROVEN of 29 (`audit/gate.json`). `docs/README.md` ("Verification record") classifies each FAIL.
The rebuild is not signed off for launch.

**The old Maps key in git history — purged 2026-09-29.** The first capture commit had added
`assets/source/57a2e231-clipart-010.jpg` (a soft-404 carrying the key) and the next only untracked it. Before any push,
the file was removed from every commit with `git filter-branch`, the old refs and reflog dropped and the repo
garbage-collected; afterwards 0 of the 6 commits contain a key-shaped string and 0 unreachable objects remain (positive
control: the untracked `audit/raw/index.html` still matches). All commit hashes changed; the table above lists the new
ones. Evidence and the backup-bundle location: `docs/README.md`, "The old Maps API key". The working copy
holds it in 340 git-ignored files: 338 in `audit/raw/`, plus `assets/source/57a2e231-clipart-010.jpg` and
`tmp/lab/neighborhood/work/main.txt` (`tmp/final/docs-fix/key-scan.log`, `facts.log`).

## 1. Design panel

**Brief** (`docs/DESIGN-BRIEF.md`): the operator asked for a total redesign that keeps the practice's structure (every
page at its own URL, the same menus), its branding and its tone. It also asked for the existing imagery plus
fal-generated eye-care images, layered depth with images that protrude across section edges, clean glassmorphism,
and scroll-driven and hover animation.

**Three directions**, each built as a homepage lab from the same brand tokens (`docs/BRAND-SYSTEM.md` section 5):

| direction | concept | lab |
|---|---|---|
| `canopy` | "Leaf & Light": frosted glass panes over pools of brand lime, slate-teal and sun, with photos leaning across section seams | `tmp/lab/canopy/` |
| `lens` | "Optical Clarity": ring fields, glass panes, a full-bleed designer band, the green-iris illustration | `tmp/lab/lens/` |
| `neighborhood` | "Editorial Community ('We Know You!')": warm paper, magazine asymmetry, glass cards over photographs | `tmp/lab/neighborhood/` |

**Judges.** Three judges scored every lab. Their must-fix list is tagged brand, UX and depth (`docs/DESIGN-SPEC.md`
section 7.2, 27 items). The UX probe outputs are in `tmp/judge-ux/`. **Winner: `canopy`**, with 2 of 3 judge votes and
summed totals of canopy 118, lens 112.5 and neighborhood 103 (`docs/DESIGN-SPEC.md` section 0). The spec's reason: it
is the most recognisably Clifton Eye Center while still a total redesign. It keeps the `#759b2a` top bar, the hero
woman, the green italic "We Know You!" and the neighbourly tone. It also had the strongest evidence: a pixel contrast
probe with controls, a hover/focus comparator, and no overflow at any width.

**Grafts adopted** (`docs/DESIGN-SPEC.md` section 7.1):
- **From `lens`:**
  - the full-bleed lime footer field;
  - the solid `#759b2a` designer band, with staggered plates crossing both edges;
  - the green-iris illustration, which became the single recurring emblem;
  - the first FAQ item open, with +/- rows;
  - the semantic services list, and reviews shown as one level row;
  - a small sticky header on phones (64px), and service labels at `--fs-sm`;
  - the header fill strength, with nav text in green-800;
  - reveals on individual `translate` / `scale` properties.
- **From `neighborhood`:**
  - the hanging logo paper plate that shrinks on scroll;
  - the green italic "in Bossier City, Louisiana" and "Ask Dr. Deana Clifton a Question...";
  - the NAP card overlapping a larger map, with the emergency card offset;
  - the `js-motion` head script with a rollback, and a hidden state with no transition;
  - the compact green Call strip on phones;
  - a 44px minimum height for buttons and pills;
  - left-aligned interior headings;
  - glass over photography.

**Not adopted:** lens's magenta/cyan rims, ring fields, tick gauges and hero loupe; neighborhood's sand palette,
split tagline and zigzag layouts; and any placement of a portrait next to a named review, because reviewer identity
is unverified.

The build spec that resulted is `docs/DESIGN-SPEC.md` ("Daylight Canopy"). The component contract is
`docs/COMPONENTS.md`.

## 2. Build

`node src/build.mjs` (Node builtins plus cwebp/webpmux/ffmpeg) turns the harvested pages in `audit/raw/` into
`dist/`:
- the 349 crawled pages at their own URLs, plus `dist/404.html`;
- `sitemap.xml`, `robots.txt`, `_redirects` and `.htaccess`;
- the design CSS, `site.js`, 8 self-hosted woff2 fonts, WebP images and the 2 patient PDFs.

Source copy comes out unchanged, which is checked sentence by sentence (section 5). The pipeline, the PORT-NOTES items
it applies and its departures are in `docs/BUILD-NOTES.md` sections 1-4.

The integration review of 2026-09-28 viewed one page per template family at 1440 and 390 and fixed what it found
(`docs/BUILD-NOTES.md` section 4 items 17-27 and section 7):
- band cut-outs ship trimmed to their opaque box, so they actually cross the band edge;
- the contact-lens fingertip rises inside the stage instead of showing a severed edge;
- brand-logo pages get no generated imagery;
- the 13 library section indexes get their planned prism;
- heading-only sheets became section titles;
- prose sheets are no longer region landmarks;
- 4 layout fixes (touching figures, a 380px testimonial void, an empty stage tail, a prism over the rail);
- the frosted-glass texture is wired at 6%;
- favicons are linked.

## 3. Imagery review

The plan is `docs/IMAGE-PLAN.md` sections 3-6 and the record is `audit/generated-images.json`. Provider: fal.ai
(`fal-ai/flux-pro/v1.1-ultra` and `fal-ai/flux-pro/kontext` for fixes). The fal key never entered the project tree.

- **45 of 45 generations used** (runs 16 + 10 + 8 + 3 + 3 + 3 + 2). 3 produced nothing usable: 2 safety-checker black
  frames and 1 failed download. Every rejected or replaced file is archived in `assets/generated/rejected/`, and none
  was deleted.
- **15 accepted**, each reviewed as native-resolution crops of every text-prone and anatomy-risk region, and each
  cut-out composited over dark, light and mid-green grounds:
  - 3 scene backdrops: `scene-exam-room`, `scene-optical-boutique`, `scene-greenery-window`;
  - 7 depth cut-outs: `cut-eyeglasses`, `cut-sunglasses`, `cut-kids-glasses`, `cut-contact-lens`, `cut-phoropter`,
    `cut-olive-sprig`, `cut-lens-prism`;
  - 4 section images: `svc-eye-exam`, `svc-pediatric-exam`, `svc-dry-eye`, `svc-eyewear-boutique`;
  - 1 texture: `tex-frosted-glass`.

  What was rejected and why is in the IMAGE-PLAN section 5 table. Examples: pseudo-text on eyeglass temples and
  phoropter dials, a lab coat that read as staff, a clinician who could read as Dr. Clifton, an asymmetric gaze that
  read as a depicted condition.
- **1 dropped:** `svc-contact-lens`. There was no acceptable result within the budget, so its slot stays empty and
  `/eye-care-services/contact-lens-exams/` has no feature panel.
- **One deviation:** the cast-shadow sliver on `cut-sunglasses` was removed from the alpha matte only. 1,510 px were
  set transparent, and 0 RGB pixels changed (IMAGE-PLAN section 5a).
- **Slot-fills with no fal call:** 4 broken source images reuse a generated file (winter sunglasses, computer glasses,
  senior in thought, `clipart-010`), plus `svc-eyewear-boutique` for "Woman Trying on Glasses". The thanksgiving
  basket on `/october-is/` was removed instead, because a stand-in would depict an event (BUILD-DECISIONS #8).
- **Labelling:** fal's C2PA manifest does not survive WebP encoding, so the build attaches an IPTC
  `trainedAlgorithmicMedia` XMP packet to every generated file it ships. Checked 2026-09-29 with
  `grep -c -a trainedAlgorithmicMedia` on each file in `dist/img/generated/`: **18 of 18 files labelled**. These are
  the 15 images plus 6 trimmed cut-out variants, minus 3 cut-outs that ship only trimmed.
- **What the generated images show:** illustrative eye-care imagery only. The record says none stands in for a real
  person, place, product, brand or result of this practice (`audit/generated-images.json` `note`). The review rejected
  versions that carried marks or pseudo-text, and versions that could read as Dr. Clifton or her staff (IMAGE-PLAN
  section 5). Three plan alts that no longer matched their images (IMAGE-PLAN section 5a) now read as the images do in
  the record. For example, `svc-pediatric-exam` renders as "A smiling child wearing round glasses in an exam chair"
  (2 uses in `dist/`). Counting every `<img>` that references `img/generated/` in `dist/` (2026-09-29): all 7
  cut-outs and 3 scene backdrops render with `alt=""` (137 uses), and the 4 section images carry the descriptive alts
  from the record (5 uses). The texture is a CSS background.
- **Favicon** (BUILD-DECISIONS #2, IMAGE-PLAN section 6): the source site has none. One is **derived, not generated**:
  a crop of the eye mark from the practice's own logo file, padded on white, at 32, 180, 192 and 512 px. It is not
  AI imagery and carries no AI label (`grep` count 0 on the 3 shipped PNGs). The practice can replace it with an
  official icon.

## 4. Change-control ledger

`audit/change-control.json`: **1,588 rows**, split IMPROVE 1,543, REMOVE 19, REPLACE 9, ADD 14 and PRESERVE 3 (counted
from the file on 2026-09-29). `sr-plan --project . --check` exits 0 ("COMPLETE",
`tmp/qa/fixer-r2/regression/11-sr-plan-check.log`). Every row has a decision, a narrative slot, a reason and a
preset. 1,539 rows name the component the rebuild renders (`rebuiltAs`). It is empty on the other 49 rows: all 19
REMOVE, 14 ADD and 9 REPLACE rows, and 7 IMPROVE rows, which are the ledger-rule rows L02, L03, L06, L07, L12, L15
and L21 (node count over the file, 2026-09-29, `tmp/final/docs-fix/facts.log`).

Legend:
- **PRESERVE:** kept as-is; content and function unchanged (the 3 `/template/*` platform artefacts).
- **IMPROVE:** same content and meaning, with better structure, hierarchy or design (1,543 rows).
- **REPLACE:** superseded by a better structure; a reason is required.
- **REMOVE:** deliberately dropped; a reason is required.
- **ADD:** a new section that did not exist on the source.

### REMOVE (19)

| what | where | why |
|---|---|---|
| Sidebar cards "Clifton Eye Center" / "Insurance Plans" | `/404-page-not-found/` (2), `/location/clifton-eye-center/` (1), `/whats-new/` (2) | Pages rendered without the aside. Their sentences are on every other page's aside, and the location page's own visit block carries the NAP and hours |
| Voice/site search form (L11) | footer, 347 files | posts to WordPress `/?s=`, which a static build does not serve |
| WordPress search forms (L11) | sidebar on 337 pages, 5 in-main modules, the `/category/our-doctors/` prompt | no search backend |
| "Powered by" vendor credit + EyeCarePro logo (L11) | footer | platform credit |
| "Login" link to the platform admin (L11) | footer | platform admin |
| Google Tag Manager `GTM-P6GSK34` (L11) | script + noscript iframe | the former agency's container; the rebuild would report visitors to their account |
| Footer microdata with New York coordinates (L11) | footer | the coordinates point to New York state, not Bossier City; the NAP text itself is kept |
| Empty team-list modules (L11) | 2 instances | render nothing on the source |
| Empty sidebar `h3` (L11) | sidebar | empty |
| Hidden `ratingValue` "5" (L14) | 9 instances | `display:none` schema value; the visible star count is kept |
| Gravity Forms honeypot + Akismet block (L23) | 2 form pages | anti-spam plumbing whose labels would pose as duplicate fields |
| EyeCarePro icon font (L11) | platform stylesheet | platform font; the rebuild uses its own inline SVG sprite |
| `review-quote.png` (L11) | platform CSS | platform image, 403 on the source |
| 6 vendor sentences naming EyeCarePro | `/disclaimer/` | the former agency's clauses; no replacement text authored (see section 8) |
| Thanksgiving basket image | `/october-is/` | 404 on the live site; a stand-in would depict an event |

### REPLACE (9)

| row | from | to |
|---|---|---|
| L01 | dead top-bar "Make an Appointment" (`<span href="">`) | a link to `/contact-us/appointment-request-form/`, label verbatim (BUILD-DECISIONS #6) |
| L04 | autoplaying Splide testimonial and image carousels | a static level row from 1024px, a user-driven scroll-snap track with Previous/Next below it, and a static smile cluster never paired with a reviewer; reviews verbatim |
| L05 | Beaver Builder accordions (`<a href="#">` over hidden divs) | native `<details>`/`<summary>`, with the first home Q&A open |
| L09 | hrefs to URLs that 301 | links straight to the canonical page, with the redirects also emitted |
| L10 | footer "Sitemap" to `/sitemap/` (404) | `/sitemap.xml` (BUILD-DECISIONS #5) |
| L11 | "Return to top of menu" focus-trap link | a JS focus trap in the drawer |
| L17 | `tel: 318-550-5815` (with a space); an empty `tel:` | `tel:318-550-5815`; the empty one unwrapped, with the number kept as text |
| L22 | keyed Google Maps embed (agency API key) | the keyless embed with the full address as the query (BUILD-DECISIONS #10) |
| L23 | Gravity Forms posting to WordPress | inert field-for-field forms with an honest "please call" notice (BUILD-DECISIONS #4) |

### ADD (14)

| row | what |
|---|---|
| L13 | accessible names with no visible copy: "5 out of 5 stars", "Quick actions", "Clifton Eye Center home", the round buttons' "Make an appointment" / "Call", iframe titles, carousel slide labels, the breadcrumb label |
| L16 | today's row in every hours list gets a background tint; no text is added |
| L19 | in-section rail built only from existing page titles |
| L20 | `/eyeglasses-contacts/eyeglasses/designer-frames/` gets an h1: its own `<title>` "Designer Frames" (the source has none) |
| L18 (x8) | generated imagery: the home hero backdrop and eyeglasses, the olive sprig across one seam, title-band scene backdrops, title-band cut-outs, service feature figures, stand-ins for broken source images, the 404 prism, the frosted texture |
| (x2) | `dist/404.html`; the favicon derived from the logo |

The full page lists are in `audit/change-control.json` and `audit/image-slots.json`.

## 5. Copy that changed

No source sentence was rewritten. `tools/sentence-parity.mjs` checks every source sentence against its rebuilt page:
of 13,966 sentences, 13,595 are found, 363 exist only in source chrome (menus, sidebar, footer), 8 are declared
removals and **0 are lost**. 3 are found only when whitespace is ignored. The control fired
(`tmp/final/chain/01b-sentence-parity.log`). The 8 declared removals are the honeypot label (x2) and the 6 EyeCarePro
sentences on `/disclaimer/` (`tmp/final/chain/01c-chrome-refute.log`).

Text the rebuild shows that is not a source sentence:

| where | text | why |
|---|---|---|
| both forms, after a valid submit | "This form is not connected yet — please call 318-550-5815" | BUILD-DECISIONS #4; the forms send nothing |
| `/testimonial/*` (3), `/category/our-doctors/` | headings "Testimonial" / "Our Doctors" | BUILD-DECISIONS #3; the source title/h1 is empty, and the label restates the URL's own slug. `/category/our-doctors/` keeps its source h1 "Nothing Found" as its first content heading |
| `/eyeglasses-contacts/eyeglasses/designer-frames/` | h1 "Designer Frames" | ledger L20; it is the page's own `<title>` |
| 156 pages with no source description | a meta description | cut from one block of the page's own prose; nothing authored (BUILD-NOTES section 4 item 6) |
| non-visible names | ledger L13 above | accessibility names only |

## 6. QA rounds

Each round ran six attacker lenses. A refuter then checked every finding, and each confirmed finding carries its
refuter verdict (40 of 40 in round 1, 26 of 26 in round 2). A fixer came last. The lenses were content-seo,
visual-home, visual-interior-a, visual-interior-b, runtime-a11y and contrast-glass.

**Round 1** (`tmp/qa/round1-confirmed.json`, `tmp/qa/fix1-report.json`): **47 findings, 40 confirmed** (1 blocker, 10
major, 29 minor), **40 fixed**. Two are fixed with a declared remainder: G10 frame time, which was addressed in round
2, and the contact-form phone masks, which were not carried. The main fixes are in `docs/BUILD-NOTES.md` section 9:
- every URL in `404.html` made root-relative (the blocker, VIB-01);
- descriptions derived from a single source block, and none on the home page;
- the EyeGlass Guide logo link restored;
- the contact form's show-if rules carried;
- alts taken only from the page's own source;
- unused row photos placed;
- `og:type` / `twitter:card` following the source;
- the hero tile and face collision fixed at 860-1279px;
- service captions as `h3`;
- the map attribution no longer covered;
- hours values never breaking;
- the reading measure narrowed from 66ch to 51ch;
- logos at their intrinsic size;
- scroll custom-property writes cut, and focus revealing hidden blocks;
- one banner landmark, and larger hit areas;
- phone numbers never split.

**Round 2** (`tmp/qa/round2-confirmed.json`, `tmp/qa/fix2-report.json`): **27 findings, 26 confirmed** (4 major, 22
minor), **26 fixed**. The main fixes are in `docs/BUILD-NOTES.md` section 10:
- **Frame time (G10):** at 4x CPU the home read p95 33-50 ms. The parallax moved to compositor scroll-driven
  animations, the orb morph became transform-only, and the ambient drifts pause while scrolling. It now reads p95
  16.8 ms on every run at 390, and on most but not all runs at 1440 (`docs/README.md`, "What is NOT verified").
- **Head and links:** external links keep their source `rel`/`target`, `twitter:title` comes from the source, and
  `.htaccess` has `ErrorDocument 404 /404.html`.
- **Home page at 320px:** the logo plate is clear of the buttons, and "COMPREHENSIVE" no longer breaks mid-word.
- **Visit block:** the emergency-card gap is gone, and the interior visit block with no emergency card now fills.
- **Reviews carousel:** the track height follows the card in view.
- **Logo grid:** 2 columns at 360px.
- **Title band:** the lens is no longer hidden under the title panel, and the eyeglasses band is cropped to its
  subject.
- **Card rows:** the rows align.
- **Text sheets:** solo-page text sheets are measure-wide.
- **Forms:** the first click on Submit is no longer lost, and the notice text is legible when focused.
- **Picture-only sheets:** they are merged into a neighbouring sheet.
- **Linked figures:** the focus ring is no longer clipped.
- **Drawer:** focus moves correctly when the layout turns desktop.
- **Promo photo:** it only rises, so the title keeps its contrast.

**Independent re-verification** (`tmp/final/verify/results.json`, read-only on `dist/`) re-ran all 26 round-2
findings:
- 23 hold outright;
- R2-VIA-06 holds with a noted residual;
- CS-R2-04 holds in the file, but no Apache server was available to test it;
- RA2-02 is partial: it holds at 390 on 5/5 runs, and at 1440 on 10 of 11 runs (the miss read p95 33.2 ms).

It found one new defect, the map corner clipping Google's "Terms" link on the home page at 1240px and wider. It was
fixed on 2026-09-29 (the map panel's bottom corners are 8px inside the >= 1240px container query), verified with the
verifier's own probe and zoomed crops, and every gate artifact was then regenerated on the final build (`docs/README.md`,
"Fixed after the independent verification"; final gate 22 PASS / 7 FAIL / 0 UNPROVEN, `tmp/orch/regate/gate3.log`).

## 6b. Operator change after review: the logo without a plate (2026-09-29)

The operator asked for the logo in the navigation bar and the footer with no background and no white container.

- **Assets:** the practice has only a 317 x 221 JPEG on white, so `tools/logo-alpha.mjs` derives two transparent PNGs
  (`assets/brand/logo-clifton.png`, `logo-clifton-light.png`, 288 x 189). Each pixel keeps its own colour with the white
  it was blended with removed; composited over white the result reproduces the original (mean 0.33/255, 0.07% of
  channels over 8/255). The footer version is reversed: the 8 grey shapes (eye outline, CLIFTON) become paper white,
  the 13 green shapes keep their exact greens (classified per shape, because 4:2:0 JPEG colour left grey-looking pixels
  inside thin green strokes). og:image and the JSON-LD logo still use the original JPEG.
- **Header:** the white hanging plate and its scroll-shrink are gone; the logo sits in the glass bar (110 x 72 in a
  92px bar from 1024px, 76 x 50 in a 64px bar below). The sticky aside moved from `top: 104px` to `124px` and its fit
  check from 124 to 144 to clear the taller bar. **Footer:** no paper plate; the reversed logo sits on the dark glass.
- **Found and fixed during verification:** the first CSS pass put the header's absolute positioning on the shared
  `.site-logo` class, which pulled the footer logo onto the address text; the rule is now scoped to the header, and
  the probe (`tmp/orch/logo-verify.mjs`) asserts the footer logo is static with 0 px overlap with the address and the
  Facebook button.
- **Verified:** at 1440/1280/1024/768/390/320 the logo is inside the bar at rest and scrolled, transparent, >= 44px
  from the nav or buttons, no horizontal overflow; screenshots viewed. Link check 0 broken, tag balance 0, fabrication
  and decontamination strict pass, JS errors 0. Live preview: 350/350 pages noindex, 688/688 pages + 307 assets 200.
  All gate artifacts regenerated on the new build (`0e6d64d9...`): 22 PASS / 7 FAIL / 0 UNPROVEN, unchanged.

## 6c. Operator request: a second, Neoclassical design (2026-09-29)

The operator asked to explore a Neoclassical style instead of glassmorphism, keeping the brand colours and the
layered, protruding imagery. It is built as a second theme beside this one, from the same content pipeline; the glass
build `dist/` stayed byte-identical through the neo work (aggregate `0e6d64d9…`, 665 files, re-checked after every change) until the drawer fix below.

- Design: three concepts judged, "Temple" chosen 3/3 (`docs/NEO-SPEC.md`); 12 new fal images (busts, relief, hand,
  column, magnifier, laurel, scenes, marble), each labelled AI-generated in its metadata; self-hosted OFL fonts
  Noto Serif Display, Source Serif 4, Parisienne. The operator's moodboard was used for style traits only and is not
  in the repository.
- Build: `CEC_THEME=neo node src/build.mjs` → `dist-neo/` (349 pages + 404, 0 failures, reproducible `39fa000c…`,
  668 files). Same text as glass (sentence parity 0 lost of 13,966), same head fields and robots, 0 broken links,
  decontamination clean.
- QA round 1: 22 findings, 21 confirmed by independent refuters, 21 fixed or recorded
  (`docs/NEO-BUILD-NOTES.md` section 8). The phone home is 10,395px at 390 against a 10,300px target (accepted).
- Preview: `/neoclassical/` under the review preview, every page `noindex, nofollow`. A missing URL there shows the
  glass 404 page (Pages serves one 404 per site).
- Found in QA and **present in the glass build too, then fixed there as well:** closing the phone menu (or keyboard focus
  on a header control) scrolls the page up about 440px, because `html { scroll-padding-top }` applies to the sticky
  header's own controls. Fixed in both themes the same way: scroll-margin on in-page targets instead of scroll-padding, and `focus({ preventScroll: true })` when the menu closes. Glass after the fix: drawer close 0px on every route (was -437), nav-link focus 0px (was -447), keyboard focus and anchors still land below the sticky header (probe control fires), only `styles/site.css` and `scripts/site.js` changed (`40fc4155...`), gate 22 / 7 / 0 unchanged.

## 6d. Operator revision of the Neoclassical home (asked 2026-09-29, verified and published 2026-09-30)

Four changes to the neo home page only. The glass build is untouched (`dist/` still `40fc4155...`, rebuilt and
compared).

- **Hero:** the source's hero photo (a stock portrait of a smiling girl) is removed ("she looks very irrelevant").
  `home.mjs` declares it as an operator removal, so the build's completeness check counts a decision, not a loss. The
  bust is now the hero's only image (`fetchpriority="high"`). The page's LCP element is the hero's marble ground, a
  CSS background (measured at 1440, 1024 and 390), and the head no longer preloads an image.
- **Hero quick actions:** Email Us and Schedule An Appointment stand in the bay left of the bust, Patient Forms and
  Order Contacts Online right of it. From 1024px the four arched niches form one row across the hero, straddling the
  seam by 30% of their height. From 700 to 1023px each bay holds a pair of plaques (four across would leave ~100px
  buttons). Phones show a 2 x 2 under the bust. The side comes from the label, not the source order, and the Tab
  order follows the visual order.
- **#HappyPatients:** the three review cards are one size at every width. The tallest sets the height and the name
  sits on the card's base. The phone and tablet carousel no longer sizes its track to the card in view.
- **#HeretoHelp:** the empty decorative niche is replaced by Dr. Deana Clifton's portrait in the same arch. The live
  site has only a 225 x 397 copy. It was upscaled 4x with AI (`fal-ai/aura-sr`), chosen from four upscalers for
  fidelity: scaled back down to 225 x 397 it matches the original best (PSNR 38.3 dB, SSIM 0.992). It ships as a
  720 x 1271 WebP labelled in its metadata as the practice's own photograph *enhanced* with AI (IPTC
  `compositeWithTrainedAlgorithmicMedia`), not as a generated image. Provenance is in
  `assets/enhanced/deana-clifton-aurasr-x4.json`. The alt text "Dr. Deana Clifton, OD" is the live site's own.
- **Found when the revision was verified (2026-09-30), fixed before publishing:**
  1. A second person's hair along the photo's right edge still showed. The arch crops only top and bottom, so the
     frame now clips the right 5.7% of the photo; the hair reaches 2.7% in.
  2. From 1024px the Q&A plate, pulled left over the portrait's column, covered the right ~15% of the photo and its
     arch. The portrait now stands clear of it.
  3. The niche labels ran up to 19px into the niche's padding and base at 1024px and at 1200-1366px. The niches now
     grow to fit (`min-height`), and all four stay one size.
- **Found by an independent refuter on the fixed build, fixed:**
  4. Below 1024px the lower tiles now cross the seam. Their light keyboard-focus ring measured 1.14-1.22:1 on the
     marble below it. The two-tone ring the niches use from 1024px (dark green outline, light inner band) now applies
     at every width.
  5. The hero frame's bottom corner stars touched the outer tiles on phones (-1px at 320-414px, 3-7px at 600-768px).
     They are not drawn below 1024px.
- **Recorded, not changed (a decision for the operator):** with the four niches in one row on the hero's seam, no
  quick-action label is inside the first screen at common laptop viewports: 1280 x 720, 1366 x 768, 1536 x 864 and
  1024 x 600 (label bottoms 793, 831, 864 and 701-721px). Before the revision the 2 x 2 portico showed two of four
  there. The design's own first-screen gate (390 x 844, 1024 x 768, 1440 x 900) passes, and at 1440 x 900 all four
  tiles are now fully in view, where two were before. The top bar's "Make an Appointment" and "Call Us" stay visible
  at every size. If wanted, a short-screen rule can lift the row.
- **Result:** `dist-neo` `9844142e...` (668 files, reproducible). Against the previous `dist-neo` only `index.html`,
  `styles/site.css`, `scripts/site.js` and two images changed (the girl's photo out, the portrait in). The phone home
  is 10,244px at 390, under the 10,300px target (was 10,395). The verification record is `docs/NEO-BUILD-NOTES.md`
  section 9.

## 6e. Operator requests: menu spacing, then the mobile view (2026-09-30)

"The navigation bar options are too close to each other, fix the spacing between the options so it is easier for
users to read and click. Then optimize mobile view." Neoclassical theme only. The glass build is untouched (`dist/`
still `40fc4155...`, rebuilt and compared).

- **Menu spacing (desktop header, from 1024px).** Measured before: 14-20px between labels from 1280px, where the
  centred split menu had squeezed its three-link half to leave room for the scroll buttons, and 22-28px at
  1024-1279px. At rest the logo was 5px from the first label at 1024px. Now:

  | width | layout | gap between labels | other |
  |---|---|---|---|
  | 1024-1199px | logo left, the five links as one group | 26-34px | logo 92px, labels 16px, logo 28px or more from the first label |
  | 1200-1365px | the same | 36px | both scroll buttons (call, appointment) together at the right end |
  | 1366px+ | two links, the logo, three links, the whole row centred | 30px | logo spacing 28px, up from 22; equal free space left and right of the row |

  On every page, in every band, the scroll buttons stay 24px or more from the nearest label, the logo 28px or more
  from it, every link keeps a 44px-tall target, and nothing wraps or overflows. This holds with a Windows scrollbar
  (15px, as in the operator's Chrome at 1280 x 585) and without one. With the scrollbar, at 1024-1040px, the logo
  narrows (81px at 1024px) rather than the gap.
- **A balanced row (operator follow-up, same day).** "There's too much space on the left side compared to the right
  side." From 1366px the logo sat on the page's centre line between two links on the left and three on the right. The
  right half is about 168px wider, so the row hung to the right: at 1600px there was 407px of free space on the left
  and 239px on the right. The row (two links, the logo, three links) is now centred as one unit, with equal space on
  both sides, the same 30px gaps and 28px around the logo. The logo sits about 84px left of the page centre. When the
  header shrinks on scroll, the call and appointment buttons are now about 108px from the labels on both sides
  (before: 24px on the right). Browsers without CSS subgrid keep the previous layout.
- **Slower accordions (operator follow-up, same day).** "Make all the accordion collapse and expand effect slower
  for the whole site."
  - The accordions now open *and* close by growing and shrinking over about one second: the home page's "Here to
    help" questions, the payment accordion on Hours & Location and on the Clifton Eye Center location page, and the
    "in this section" menu on 158 inner pages below 1024px.
  - Before, the panel appeared and disappeared at once, with only a 0.6-second fade as it opened. The rosette's turn
    and the answer's fade now take the same second.
  - Visitors who ask their system for reduced motion still get instant accordions. Printing still expands every
    item.
  - The height animation needs Chrome or Edge 131 or later. Other browsers keep the instant open and close, with the
    slower fade.
  - **Applied to the glass site too** (operator: "apply the same slower accordions to the glass site too"):
    - The same 1s and the same easing curve: glass's own ease-out made the same second look finished at about 0.7s.
    - The same items: the home page's questions, the two payment accordions and the rail below 1024px.
    - The glass icon's hover quarter-turn stays quick.
    - Measured on glass: opening 0.87-0.91s, closing about 0.9s, the rail 0.89s (before: instant). Print, reduced
      motion, the desktop rail and the focus rings inside answers are unchanged.
    - Glass `dist` `d1193b3b…` is reproducible: only `styles/motion.css` and `tokens.css` differ, and every HTML page
      is identical.
    - Tag balance 0, links 0 broken of 20,333, decontamination 0 / 0 / 0. The handoff zip
      (`cliftoneyecenter-com-handoff-v20260928.zip`, built 2026-09-29 04:45) predates the plate-free logo (07:54), the
      drawer fix (18:53) and this change, so it needs a re-package before handoff.
- **The current-page mark.** The small rosette that marks the page you are on now sits centred above its label,
  not before it. Before, it made the current link 16px wider, and on the five section pages that width came out of
  the logo gap (10-16px left at 1024px) or the scrolled appointment button's gap (8px from 1366px on Eye Care
  Services, Eyeglasses & Contacts and Insurance). An independent check caught this after the first version of the
  spacing fix, which had been measured on the home page only.
- **Mobile view.** An audit of ten page types at 390px (3x) found the layout clean. There was no overflow, no tap
  target under 44px, the menu drawer was spacious, and no image heavier than a 3x phone needs. Two things were
  changed:
  1. The only text under 14px on a phone was the meta line: dates, review names and footer headings at 13px. It is
     now 14px everywhere, and 0 text runs are under 14px on the audited pages.
  2. The blog index (151 posts on one page, as on the live site) was 60,657px tall at 390px. On phones each excerpt
     now shows three lines, and the full text stays in the page and on the post. The cards are tighter too. The
     page is now 42,238px (-30%; 64,521 -> 42,847 at 360px).
- **Found by a second independent check, and fixed:**
  1. With the meta line at 14px, the footer heading "Important Links" wrapped at 345-366px wide. That range includes
     360px, a common phone width, and the wrap dropped its column 24px below the other. Below 380px the heading now
     has slightly tighter letter-spacing, and it stays on one line down to 342px. The published site already
     wrapped below 345px. The footer headings also get the size-matched fallback font from item 2. When web fonts
     are missing, they now wrap only below 354px; before, they wrapped up to 399px, and the published site up to
     375px.
  2. Before the site's font loads, or when a browser blocks web fonts, the menu showed Georgia. Its bold is 7%
     wider, so from 1366px the scrolled appointment button covered "Insurance". The menu and the footer headings
     now fall back to Georgia sized to match, and the menu labels keep their width to within 1%.
  3. The keyboard focus ring touched the rosette above the current page's label. That link's ring now sits 2px
     further out.
  4. When the header shrinks on scroll, the logo drifted 7-10px inward at 1024-1365px. It now shrinks toward its
     left edge.
  5. Printing the blog index on narrow paper cut the excerpts to three lines. The clamp now applies on screens only.
- **Looked at, not changed:**
  - A larger browser default font (Chrome's "Large", 20px), or a machine translation, makes the desktop menu too
    wide in both the published and the new build, but in different places:
    - the new build shrinks the logo away at 1024-1128px and 1200-1240px;
    - the published build lets labels and the appointment button overlap.
    The robust fix is to switch the header layouts by text size (em) instead of pixels. That is an operator option.
    Browser zoom, the more common setting, works.
  - Unchanged from the published build:
    - Text links standing alone on phones are 24-31px tall: above the 24px WCAG AA minimum, below Apple's 44px.
    - A few headings and buttons end with a single word on a line.
    - The blog index is still long on phones, and tablets (700-1023px) get no clamp.
  - The phone home is long (10,249px) because of its content, not its spacing: only about 14% of it is empty space.
    Shortening it would mean collapsing the practice's own text behind "read more", which is an operator decision.
  - Several photos and logos look soft on 3x phones because the live site's files are small (e.g. 133px insurance
    logos shown at 85px). Better originals from the practice are the fix.

## 7. Decisions taken for the build

`docs/BUILD-DECISIONS.md` (orchestrator, 2026-09-28). The operator said "go ahead, pick the winner and build it", so
these defaults were decided there. Each one can be reversed by the practice.

| # | question | decision |
|---|---|---|
| 1 | source `noindex` on 217 pages | kept; noindex pages stay out of the sitemap |
| 2 | no favicon on the source | derived from the logo's eye mark (a crop, no redraw) |
| 3 | empty title/h1 on `/testimonial/*` and `/category/our-doctors/` | the neutral labels "Testimonial" / "Our Doctors" |
| 4 | forms with no backend | inert, field for field, with an honest notice; no mailto |
| 5 | dead footer "Sitemap" link | points at `/sitemap.xml` |
| 6 | dead top-bar "Make an Appointment" | links to the appointment form |
| 7 | home rows hidden on phones by the platform | shown on phones too |
| 8 | 6 content images with no usable file | generic alt: a decorative generated stand-in; alt naming a person, pet or event: the `<img>` is dropped |
| 9 | patient-form PDFs on the platform CDN | harvested and served locally |
| 10 | keyless Google Maps embed | kept, with the full address as the query |

## 8. Open decisions for the practice

These are from `docs/OPEN-DECISIONS.md`, plus items the records above leave to the practice:

1. **Licence of the syndicated patient-education library and blog.** `docs/OPEN-DECISIONS.md` #1 names the
   pages under `/eye-care-services/your-eye-health/`, the eyewear and contact-lens explainers and "~90 dated blog
   posts" as carrying the article structure that EyeCarePro syndicates to its member practices. Its "about 120" is
   wrong: `/eye-care-services/your-eye-health/` has 101 pages (119 under all of `/eye-care-services/`). Its "~90"
   matches the 89 posts with a year in their URL, but the crawl holds 151 blog posts (WordPress single-post pages).
   Whether the other 62 are syndicated too is **UNVERIFIED**, so this decision may cover all 151. The
   counts come from `find dist/... -name index.html` and a `single-post` body-class count over `audit/raw/`
   (`tmp/final/docs-fix/facts.log`). The pages are kept unchanged at their URLs.
   Whether the practice may keep publishing them after leaving the platform depends on its contract with the vendor.
   Confirm this before launch. If the licence does not survive, remove the affected pages with 301s to their section
   hub (one ledger row per page).
2. **Forms:** choose and wire an endpoint, or accept the "please call" notice (`docs/DEPLOY.md` section 6).
3. **Generated imagery:** replace any of it with real photography of the practice whenever that is available.
4. **Disclaimer:** the 6 removed EyeCarePro sentences disclaimed on the agency's behalf. The practice has no
   endorsement clause of its own until its counsel writes one (ledger REMOVE row).
5. **Indexing:** 220 crawled pages stay `noindex` as on the live site, 217 of them from the source (see
   `docs/DEPLOY.md` section 8). Opening them to search is an SEO decision.
6. **Favicon:** the derived icon can be replaced with an official one.
7. **Safari/iOS check** before launch. It needs an Apple device and has never been run (gate G13).
