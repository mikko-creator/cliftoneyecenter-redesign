# Clifton Eye Center, "Daylight Canopy" redesign: developer README

A total visual redesign of `https://www.cliftoneyecenter.com/`, the practice site of Clifton Eye Center (Dr. Deana
Clifton, OD, Bossier City, LA). The live site runs WordPress on the EyeCarePro platform. This redesign was produced
with the site-reforge skill in its **REFORGE lane**: the structure is rebuilt exactly, the design is new.

- **Structure kept:** all **349 crawled pages at their live URLs**, with the same menus and hierarchy. There is one
  extra page: `dist/404.html`, for the host's not-found handler. Of 13,966 source sentences, 13,595 are found on
  their rebuilt pages. The other 371 are not: 363 occur only in the source's chrome (menus, sidebar, footer) and 8
  are declared removals. The parity tool counts 0 as lost, meaning 0 fall outside those two groups (see the
  verification record).
- **Design replaced:** "Daylight Canopy". Frosted glass panes over soft pools of the brand greens, photos and cut-outs
  that cross section edges, and scroll-driven and hover motion that honours `prefers-reduced-motion`. It keeps the
  logo file, the `#759b2a` top bar, the lime footer, the hero photo and the practice's tone. The design spec is
  `docs/DESIGN-SPEC.md`, the tokens are in `docs/BRAND-SYSTEM.md`, and the component contract is
  `docs/COMPONENTS.md`.
- **Static output:** `dist/` is 663 files with no runtime dependencies: hand-written CSS, vanilla JS and
  self-hosted fonts. It loads no external script, stylesheet or font. The only third-party content is the keyless
  Google Maps embed (337 pages) and 2 YouTube embeds.
- **Status:** the site-reforge gate says **NOT-READY**. Every remaining FAIL is classified in the verification record
  below: each is source-side, a declared design decision, or inherent to a redesign. The rebuild is not signed off for
  launch, because open decisions for the practice remain (`docs/OPEN-DECISIONS.md`, and `docs/CHANGE-LOG.md` section 8).

## Build

```bash
node src/build.mjs                       # wipes and rebuilds dist/, rewrites the audit/ build reports
CEC_DIST=tmp/x node src/build.mjs        # builds into any other directory; audit/ is NOT rewritten
```

The build needs Node (v24.19.0 here) and `cwebp`, `webpmux` and `ffmpeg`/`ffprobe` on PATH, or `$CWEBP` / `$WEBPMUX`
/ `$FFMPEG`. It exits 1 whenever a build failure is recorded. Encoded images are cached in `tmp/build-cache/`, so a
rebuild re-encodes nothing. Deleting that cache forces a full re-encode, which the build notes put at about 30 s.
Details are in `docs/BUILD-NOTES.md` section 1.

## Run it locally

```bash
node tools/serve.mjs --root dist --port 8791 --no-open
# then open http://127.0.0.1:8791/
```

Every internal URL in `dist/` is page-relative, so the site also works from a subfolder. The one exception is
`dist/404.html`, which is root-relative by design (`docs/DEPLOY.md` section 3). This local server answers a missing
path with a plain-text 404, not with `404.html`.

## Folder map

| path | what |
|---|---|
| `src/build.mjs` | the build orchestrator: pages, head/SEO, images, sitemap, redirects, reports |
| `src/lib/` | `content.mjs` (sanitiser and extractors), `forms.mjs`, `seo.mjs`, `templates.mjs`, `home.mjs`, `images.mjs`, `util.mjs` |
| `src/content/` | `chrome.json` (top bar, menus, footer, hours), `site-map.json`, `image-plan.json` |
| `src/styles/tokens.css` | measured source tokens (evidence), then the redesign tokens after the `REDESIGN TOKENS` marker. Only the redesign layer ships. Change values **here**, never at a call site |
| `src/styles/site.css`, `motion.css`, `fonts.css` | design CSS. `motion.css` keeps the 90 source keyframes as evidence only, and ships only its redesign layer (11 `@keyframes`) from the `@redesign-motion` marker. None of the 90 source keyframes ships |
| `src/scripts/site.js` | the one script: reveals, parallax fallback, drawer, carousel, forms (inert), hours highlight |
| `dist/` | the built site that ships (not tracked by git) |
| `assets/source/` | original images downloaded from the live site |
| `assets/generated/` | the 15 accepted fal images; `raw/` holds the raw downloads and `rejected/` every archived version |
| `assets/brand/` | the favicon set derived from the logo |
| `assets/docs/` | the two patient paperwork PDFs, harvested from the platform CDN |
| `assets/optimized/` | empty; encoded images live in `tmp/build-cache/` and ship under `dist/img/` |
| `facts/client-facts.json` | practice facts taken from the evidence (NAP, hours, the doctor, testimonials) |
| `tools/` | project tools: `serve.mjs`, `link-check.mjs`, `sentence-parity.mjs`, `tag-balance.mjs`, `ledger-decide.mjs`, `fal-gen.mjs`, `sweep-run.mjs`, `screens-run.mjs`, `jserrors.mjs` and others |
| `audit/` | inventories, the change-control ledger, reports and the gate record. **`audit/raw/` holds the former agency's Maps API key (338 pages) and must never be published.** Two more files hold it, and so does git history: see "The old Maps API key" below |
| `docs/` | this file, `DEPLOY.md`, `CHANGE-LOG.md`, `BRAND-SYSTEM.md`, `DESIGN-SPEC.md`, `COMPONENTS.md`, `BUILD-NOTES.md`, `BUILD-DECISIONS.md`, `OPEN-DECISIONS.md`, `IMAGE-PLAN.md`, `SITE-ARCHITECTURE.md`, `PORT-NOTES.md`, `DESIGN-BRIEF.md` |
| `tmp/` | labs, QA and verification evidence. It is **not tracked by git** (`.gitignore`), so the evidence cited below exists only in this working copy |

Git: the shipped source is commit `1558378` (2026-09-29, "Final verification": the map-corner fix on top of QA
round 2, `5289405`); the docs were then updated for the history rewrite in the commit after it. Hashes are the
post-rewrite ones (see "The old Maps API key").

### The old Maps API key: working copy and git history

The former agency's Google Maps API key (one distinct value) is in **340 files of this working copy**, all
git-ignored: the 338 raw pages in `audit/raw/`, `assets/source/57a2e231-clipart-010.jpg` (an HTML soft-404 saved
under an image name) and `tmp/lab/neighborhood/work/main.txt`. `dist/` has 0 (`grep -rlE 'AIzaSy[0-9A-Za-z_-]{33}'`,
`tmp/final/docs-fix/key-scan.log`, whose control fired).

**It is no longer in git history (purged 2026-09-29).** The first capture commit had added
`assets/source/57a2e231-clipart-010.jpg` (the soft-404 carrying the key); a later commit only untracked it, so the key
stayed reachable in history (`tmp/final/docs-fix/facts.log`). Before any push, the file was removed from every commit
(`git filter-branch --index-filter 'git rm --cached --ignore-unmatch assets/source/57a2e231-clipart-010.jpg' -- --all`,
then `refs/original` deleted, reflog expired, `git gc --prune=now`). Verified after the rewrite: a full-key-shaped
`git grep -E 'AIzaSy[A-Za-z0-9_-]{33}'` finds 0 files in every one of the 6 commits, `git log --all -G` with that
pattern lists 0 commits, `git fsck --unreachable` reports 0 objects, and the same grep still finds the key in the
untracked `audit/raw/index.html` (positive control). The rewrite changed every commit hash (old → new:
4a4121a → 8ff25f7, d374874 → f9cf8e9, 5fb7204 → 3b9c0fc, 2608d05 → 270777d, 7e5c462 → 5289405, 2afa709 → 1558378).
A bundle of the pre-rewrite history is kept at `tmp/git-backup-before-key-purge.bundle` (git-ignored; it DOES contain
the key — never share it; delete it once the rewrite is accepted). The key remains public in the live site's own HTML,
so the agency should still rotate or restrict it (`docs/OPEN-DECISIONS.md` #4).

## Verification record

### Build identity

| what | command | result |
|---|---|---|
| dist hash, sha256 aggregate (FINAL build, after the map-corner fix) | `node tmp/orch/hashdir.mjs dist` (2026-09-29) | `75ed34ed4301846e3f1c0b69b07bf3b44fcee03f7c68e905700a4c8af1f2ddcd`, 663 files |
| dist hash, sha1 list (the re-verifier's method) | `node tmp/final/verify/hashdist.mjs tmp/orch/regate/dist-hash-sha1.txt` | `0f8e63d7323c26a68adf5b8adab0954446c12c1f`, 663 files. `diff` against the list the independent re-verification wrote (`tmp/final/docs/dist-hash-sha1.txt`, aggregate `33c6b026...`) shows exactly ONE changed file, `dist/styles/site.css`: the map-corner fix below. Every other shipped file is byte-identical to the re-verified build |
| reproducible build | `CEC_DIST=tmp/orch/repro/a` and `tmp/orch/repro/b` builds, then `node tmp/orch/hashdir.mjs tmp/orch/repro/a tmp/orch/repro/b dist --control` | all three IDENTICAL (`75ed34ed...`); the control fired (`tmp/orch/regate/repro-hashdir.log`). The pre-fix build reproduced the same way at `ec2f3712...` (`tmp/final/chain/00-repro.log`). Warm cache; a cold-cache rebuild was **not** compared |
| build | `node src/build.mjs` | exit 0, 0 build failures, 349/349 pages + `404.html` (`tmp/orch/build-mapfix.log`); 18 generated files shipped, 18 AI-labelled |

### Gate (`sr-gate.mjs --project .`)

**Latest result: NOT-READY, 22 PASS, 7 FAIL, 0 UNPROVEN of 29 — on the FINAL build (`75ed34ed...`).** After the
map-corner fix (below) every artifact the gate reads was regenerated on the final build: parity, sentence parity, tag
balance, link check, fabrication, decontamination and SEO (`tmp/orch/regate/*.log`, all pass as before), and ALL 52
rebuild screenshots and ALL 52 rebuild sweeps were re-taken (`screens-all.log`, `sweep-all.log`; the pixel diff
correctly reported C22 UNPROVEN while 48 of them still showed the pre-fix build, and FAIL/DRIFT again once re-shot).
Final gate: `tmp/orch/regate/gate3.log`; final report:
`audit/reports/cliftoneyecenter-com-2026-09-28T20-37-51-017Z.html`. The 7 FAILs are the same checks as below.
Every run made after these handoff docs were written gave this result. The runs are logged in `tmp/final/docs/gate-after-docs-*.log` (from 2026-09-28T19:48Z UTC, 03:48 on
2026-09-29 local), in `tmp/final/refuter-docs/gate-refuter.log` (the docs refuter's run), and in
`tmp/final/docs-fix/gate-after-fix*.log` (from 2026-09-28T20:18:40Z, after the corrections to these docs; each exits 1,
and 0 of the 29 check results differ from the record before them). The latest is in `audit/gate.json`. The run before them, in the final gate chain
(2026-09-28T19:04:57Z, `tmp/final/chain/07a-gate.log`), read 21 / 8 / 0.
The only difference is C25, which failed then because `README.md`, `DEPLOY.md` and `CHANGE-LOG.md` did not exist yet.
The HTML report of the chain run is
`audit/reports/cliftoneyecenter-com-2026-09-28T19-05-25-309Z.html`; it predates C25 passing.

| check | status | gate evidence, and why a FAIL stands |
|---|---|---|
| C01 site inventory | PASS | 349 html pages inventoried |
| C02 crawl not truncated | PASS | queue drained; 356 urls |
| C03 every crawled page fetched | FAIL, **source-side** | 7 pages 404 on the live site. The final gate chain re-checked them live, with a control URL answering 200 (`tmp/final/chain/05a-live-recheck.log`), and accepted them in `audit/failures.json`. 2 get a redirect (`docs/DEPLOY.md` section 4) |
| C04 content captured | PASS | 349 pages with body text |
| C05 no JS-rendered shells | PASS | 0 high-risk pages |
| C06 SEO inventory | FAIL, **source-side** | 4 source pages have no `<title>` (`/category/our-doctors`, 3 `/testimonial/*`). `dist/` ships "Our Doctors" / "Testimonial" (BUILD-DECISIONS #3) |
| C07 image inventory | FAIL, **source-side** | 23 same-origin image URLs were never downloaded: 22 `/clipart/` URLs that 404 live, and `review-quote.png` (vendor CSS, 403 then 404). All are accepted in `audit/failures.json`. The gate reads the failed URLs, but **19 of the 22 clipart images were recovered**: the same `/clipart/` path was downloaded from a platform mirror (16 from `d3dhq28juvmj53.cloudfront.net`, 3 from `static.ecpbuilder.com`) and ships in `dist/img/` on every page that used it. Of the other 3, 2 get a generated stand-in (`people/clipart-048.jpg`, `senior_man_in_thought2.jpg`) and the thanksgiving basket is removed (BUILD-DECISIONS #8). `review-quote.png` is a declared removal (`node tmp/final/docs-fix/clipart-fate.mjs`, `clipart-fate.log`; the control fired) |
| C08 every image decided | PASS | all 319 images decided |
| C09 browser baseline | PASS | computed capture, 36 viewports covering 390/768/1024/1440 |
| C10 motion inventory | PASS | 90 keyframes, 560 animated elements |
| C11 source animations kept | PASS, **checks `src/` only** | The gate finds the 90 source keyframes verbatim in `src/styles/motion.css`, where they are kept as evidence. **None of them ships.** `dist/styles/` gets only the redesign layer (BUILD-NOTES section 4 item 1): 11 `@keyframes`, sharing 0 names with the 90 source ones (`tmp/final/docs-fix/facts.log`). The redesign replaces the source motion, so this PASS does not mean the rebuild reproduces the source animations |
| C12 presets reviewed | PASS | 186 presets from 27 files |
| C13 token layer used | PASS | 309 tokens declared, 187 referenced across 3 authored sheets, 6 off-token colour literals |
| C14 every section decided | PASS | 1,588 rows decided |
| C15 narrative slots | PASS | 5 required slots mapped |
| C16 every page rebuilt | PASS | 349/349 mapped; 1 page added by decision (`404.html`) |
| C17 content survived | FAIL, **declared removals / platform chrome** | 30 findings: 28 content-loss and 2 section-lost. The 2 section-lost rows are `/404-page-not-found/` and `/whats-new/`, both rendered without the aside. On each, the lost H2 "Clifton Eye Center" sits after `</main>` in the raw page, the `dist/` page has no `<aside>`, and the ledger has REMOVE rows (`#s7`/`#s8` and `#s152`/`#s153`) (`node tmp/final/docs-fix/section-lost-check.mjs`, `section-lost-check.log`; the control fired). The chain classifier `01d-parity-classify.log` checked `/404-page-not-found/` and `/location/clifton-eye-center/`, not `/whats-new/`. The missing-word samples the parity tool lists (read from `audit/parity-report.json`) fall into two groups. Most are menu and navigation labels and other chrome. The rest are the "Return to top of menu" trap, the search and voice-search strings, the form honeypot label and the EyeCarePro sentences on `/disclaimer/`, all of which are ledger REMOVE or REPLACE rows. Sentence parity counts **0 lost** in its own sense: every source sentence missing from its rebuilt page is either one of the 363 chrome-only sentences or one of the 8 declared removals. 0 of the 363 chrome-only sentences occur in the source `<main>` |
| C18 SEO survived | PASS | 0 lost titles, descriptions, canonicals or H1s |
| C19 forms and contact details | FAIL, **declared decision** | 349 findings. 347 are the platform's site-search and voice-search forms, removed because a static site has no search backend (ledger L11). 2 are the contact and appointment forms, rebuilt field for field but inert until an endpoint is wired (ledger L23, BUILD-DECISIONS #4, `docs/DEPLOY.md` section 6). **This is a real functional gap until the forms are wired** |
| C20 no invented content | PASS | 660 claims, all traced to source or declared facts |
| C21 no platform trace | PASS | 358 files scanned, 0 blocker traces |
| C22 pixel-for-pixel match | FAIL, **redesign-inherent** | worst drift 97.346% (`whats-new.1440.png`). A total redesign does not match the old pixels |
| C23 responsive sweep | FAIL, **classified: no visible defect** | 1 blocker, which is the inert appointment form (C19). 401 majors: 137 overflows by `aria-hidden` decorative spans clipped inside the page, 0 visible, and 264 small tap targets, all with hit areas of at least 24x24 px (WCAG 2.2 AA) and 0 against the spec's phone rule. See the sweep row below |
| C24 failures resolved or accepted | PASS | 35 recorded; 32 accepted source-side after a live re-check, 3 resolved, 0 open |
| C25 handoff docs | PASS | docs present, no unfilled template placeholders |
| C26 rebuild has pages | PASS | 350 html files in `dist/` |
| C27 clone lane | PASS | no clone lane in this project |
| C28 presets named | PASS | 24 matched by layout at a mean 80.4%; 1,588 rows name a known preset |
| C29 SEO emitted / repaired | PASS | emitted nothing |

Summary of the 7 FAILs: C03, C06 and C07 are source-side, and no rebuild change can turn them green, because the gate
reads the crawl counts. C17, C19, C22 and C23 follow from the redesign and the declared ledger decisions. **C19**
includes one real, deliberately deferred gap: the 2 inert forms.

### Content, SEO and integrity

| check | command (log) | result |
|---|---|---|
| page parity | `sr-parity.mjs --project .` (`tmp/final/chain/01-parity.log`) | DRIFT: 349/349 mapped, 0 missing, 1 extra (`404.html`), mean recall 98.3%, blocker/major/minor 361/38/218. By code: 347 form-lost (the removed platform search and voice-search forms), 2 form-no-action (the inert forms), 28 content-loss, 20 content-block-missing, 2 section-lost, 212 alt-missing, 4 title-changed, 2 h1-changed (`01d-parity-classify.log`). The losses are platform chrome, not content: see C17 above |
| sentence parity | `CEC_DIST=tmp/final/a node tools/sentence-parity.mjs`, and again on `dist` (`01b-sentence-parity.log`) | 13,966 source sentences: 13,595 found, 363 only in source chrome, 8 declared removals, **0 lost**; 3 found only whitespace-insensitively. The control fired. A refuter found that the 8 missing sentences inside `<main>` are exactly the declared removals, and that 0 of the 363 chrome sentences occur in `<main>` (`01c-chrome-refute.log`). This test cannot separate chrome from content on the 3 `/template/*` pages, which have no `<main>` |
| SEO migration | `sr-seo.mjs --project . --dir dist --site-url https://www.cliftoneyecenter.com --migrating` (`02b-seo.log`) | 0/0/0 migration findings. sr-seo's per-page canonical check only finds `<path>.html` files, so it is blind in this `<path>/index.html` build. The chain's own all-page check found 349/349 canonicals present, absolute, on the origin and self-or-source; the control fired (`02c-seo-migration-crosscheck.log`) |
| noindex and sitemap | `node tmp/final/docs/noindex-sitemap-scan.mjs` (2026-09-29) | 221 noindex files: 220 crawled pages (217 kept from the source, plus the 3 `/testimonial/*` singles by decision) and `404.html`. The sitemap has 129 URLs: all indexable pages, 0 noindex, 0 missing files. The control fired |
| fabrication | `sr-fabrication.mjs --project . --strict` (`06a-fabrication.log`) | **SOURCED**: 350 files, 660 claims, 0 blocker / 0 major, exit 0 |
| decontamination | `sr-decontaminate.mjs --project . --dir dist --strict` (`06b-decontaminate.log`) | **CLEAN**: 358 files, 0/0/0, exit 0. One declared prose exception: `/living-with-low-vision/` cites a preventblindness.org PDF whose path matches a Drupal pattern. A direct grep of that file finds 0 other platform markers (`06c`) |
| link check | `CEC_DIST=<abs>/dist node tools/link-check.mjs` (re-run 2026-09-29, exit 0) | 354 files, 20,333 local refs, 2,882 external skipped, **0 broken**; the control fired |
| tag balance | `CEC_DIST=<abs>/dist node tools/tag-balance.mjs` (re-run 2026-09-29, exit 0) | 350 pages, 0 unbalanced, 0 findings; the control fired (6 planted kinds) |
| AI labels | `grep -c -a trainedAlgorithmicMedia` on each file in `dist/img/generated/` (2026-09-29) | 18 of 18 labelled |
| ledger | `sr-plan --project . --check` (`tmp/qa/fixer-r2/regression/11-sr-plan-check.log`) | exit 0, 1,588 rows, COMPLETE |
| markup contract | `node tmp/orch/markup-audit.mjs` (`tmp/qa/fixer-r2/regression/12-markup-audit.log`) | 350 pages: 0 `style` attributes, 0 duplicate ids, exactly one h1 per page, every `<img>` with width/height/alt. It exits 1 on 2 expected departures: root-relative `404.html` and `data-show-if` x2 |

### Responsive sweep and pixel diff (13 pages x 390/768/1024/1440)

| check | command (log) | result |
|---|---|---|
| sweep | `node tools/sweep-run.mjs --side rebuild ...` then `sr-sweep.mjs --project . --collect` (`03a`, `03b`) | 52 sweeps; blocker/major/minor/nit 1/401/108/1; 0 pages scroll horizontally. The blocker is the inert appointment form (form-no-action). The majors are 137 element-overflow and 264 tap-target-small. A classifier with in-page controls (`03d`, `03e`) found that all 137 overflows are `aria-hidden` decorative spans (blobs, rings, orbs, sun, beams) clipped by an ancestor, with 0 visible past the edge. All 375 uncapped small tap targets have a hit area of at least 24x24 px (WCAG 2.2 SC 2.5.8 AA), and 0 break the spec's G11 phone rule at 390 (44px, or 24px for inline prose and legal links). The live site's own baseline sweep has 324 dead-link blockers and 416 tap-target majors |
| pixel diff vs the live site | `sr-pixeldiff.mjs --project .` (`04c-pixeldiff.log`) | 52 pairs: 0 match, 4 drift, 48 size mismatch; the differing ratio runs from 72.6% (min) through 93.0% (median) to 97.3% (max). The median is the mean of the two middle values of the 52 ratios, 0.928514 and 0.931418. The log's "median 0.931418" is the upper of the two (`tmp/final/docs-fix/facts.log`). This is expected for a total redesign, which is not meant to match the source pixel for pixel |

### Behaviour and performance (Chrome only)

These were run on the final tree by the round-2 fixer (`tmp/qa/fixer-r2/regression/`, `docs/BUILD-NOTES.md` section
5):
- **JS errors:** 12 pages, 0 errors; the control fired.
- **Overflow:** 150 combinations (15 pages x 320/390/768/1024/1440 x normal/reduced motion), 0 offenders. The 14
  non-home pages were measured on a tree that differed from the final one only by the home carousel's slide-width
  rule.
- **Behaviour gates:** `tmp/gallery/verify.mjs` passes 12/12 (reveals, hover lift and focus parity, reduced motion,
  drawer trap, form paths).
- **Frame time at 4x CPU throttle (home):** p95 16.8 ms at 390 on 5/5 runs, and at 1440 on 6/7 runs; the miss read
  33.3 ms. Before round 2 it read 33-50 ms.

### QA rounds

| round | findings | confirmed | fixed | record |
|---|---|---|---|---|
| 1 | 47 | 40 (1 blocker, 10 major, 29 minor) | 40 | `tmp/qa/round1-confirmed.json`, `tmp/qa/fix1-report.json`, BUILD-NOTES section 9 |
| 2 | 27 | 26 (4 major, 22 minor) | 26 | `tmp/qa/round2-confirmed.json`, `tmp/qa/fix2-report.json`, BUILD-NOTES section 10 |

The lenses were content-seo, visual-home, visual-interior-a, visual-interior-b, runtime-a11y and contrast-glass. The
main fixes are listed in `docs/CHANGE-LOG.md` section 6.

### Independent re-verification (`tmp/final/verify/results.json`)

It re-ran all 26 round-2 findings on the current `dist/`, read-only; the sha1 aggregate was identical at start and
end:
- **23 hold outright.**
- **R2-VIA-06 holds with a residual:** on `/insurance/`, the two short plan-name sheets stay 62-89% empty.
- **CS-R2-04 holds in the file:** `ErrorDocument 404 /404.html` is present, but no Apache server was available to
  run it (**UNVERIFIED** at runtime).
- **RA2-02 is partial:** it holds at 390 on 5/5 runs, and at 1440 on 10 of 11 runs; the miss read p95 33.2 ms.

CG2-02 needed a different method. The attacker's own sweep script found nothing to measure after the RA2-02 fix, so
its silence was not evidence. The refuter's method was used instead, with the scroll-driven animation left live. Over
110 scroll positions at 768x900, the worst contrast was 4.487 nominal and 4.755 as rendered, against 3.0 required.
With the old bug forced back, it read 2.939 / 1.103, so the control fired.

A visual spot pass followed: 6 pages at 1440 and 390, split into 35 parts of at most 1300px, all viewed. It found
nothing broken or off-brand, except the map defect listed below.

## What is NOT verified

- **Safari / WebKit and Firefox.** Every browser measurement recorded in this project was made in Chrome or headless
  Chromium; no Safari or Firefox run is recorded. Nothing has been run in Safari: glass and the `-webkit-` path, the
  `backdrop-filter` fallbacks, `overflow: clip`,
  individual transforms, `:has()`. That check (gate G13) needs an Apple device. Engines without
  `animation-timeline` take the JS parallax path, which was not measured.
- **Frame time at 1440.** At 4x CPU throttle, 1 of 7 runs read 33.3 ms on the fixer's final tree, and 1 of 11 read
  33.2 ms in the independent pass. The machine was shared (49 chrome.exe of other agents). A re-profile on a quiet
  machine would settle it.
- **Behaviour on a real host:** redirects, the 404 handler (the Apache `ErrorDocument` was never run), trailing-slash
  handling and the recommended headers/CSP. None of it has been deployed.
- **Form submission:** the forms are inert, and nothing has ever been sent from them.
- **Cold-cache reproducibility:** both identical builds used the warm image cache.
- **Contrast over moving layers** was re-measured for the promo title only. Contrast over the 6% texture was
  re-probed on 3 pages (home, privacy policy, library root) at 1440 and 390, and the other families were not
  re-probed. The full hover/focus comparator was not re-run after round 2; the 12 behaviour gates were.
- **Coverage:** the sweep and the pixel diff cover 13 pages x 4 widths, not all 349 pages. Sentence parity, link
  check, tag balance, fabrication, decontamination and the noindex scan cover every page.
- **Round-1 fixes after round 2:** the independent pass re-ran the round-2 findings only. The 40 round-1 fixes were
  verified by the round-1 fixer, and the round-2 lenses audited the build that contained them. They were not
  re-verified one by one on the final tree.
- **Live-site drift:** the rebuild reflects the live site as crawled on 2026-09-28. Any content the practice changed
  after that date is not in it.

## Fixed after the independent verification

- **Home map, 1240px and wider — FIXED 2026-09-29.** The independent pass found the map iframe reaching the panel's
  rounded bottom-right corner (radius 27-32px), which clipped Google's "Terms" link to "Term"
  (`tmp/final/verify/spot/mapcorner.log`, `zoom-home1440-mapcorner.png`). Fix: in `src/styles/site.css`, inside
  `@container visit (min-width: 1240px)`, the map panel's two bottom corners are 8px (top corners keep `--r-lg`).
  Verified on the rebuilt dist with the verifier's own probe (`node tmp/orch/mapfix-verify.mjs`): bottom-right radius
  8px at 1240/1280/1440/1920 on the home page (was 27.28/28.16/31.68px), unchanged where the embed already stops
  above the corner (home 1100 and 390, `/hours-location/` at 1440/1024/390); zoomed crops
  `tmp/orch/mapfix/corner-home.1440.png` and `.1920.png` show "Keyboard shortcuts | Map data ©2026 Google | Terms"
  whole. This fix is the only shipped-file difference from the re-verified build (sha1 list diff: `styles/site.css`).

## Known defects and residuals (not fixed)

- **Footer Facebook icon focus ring:** the focus-ring metric scores it 0.23 / 0.19 visible. Viewed at 4x, the ring is
  clearly visible and no ancestor clips it, so this is treated as a metric false positive on a round control. The
  cause of the lower score is UNVERIFIED.
- **Solo pages:** text sheets end at the reading measure while CTA bands and tile rows span the full column, which
  gives a ragged right edge. This is a design trade-off from R2-VIA-06. On `/insurance/`, the two short plan-name
  sheets stay 62-89% empty.
- **Map fallback:** if Google withdraws the keyless map, there is no fallback. `map__link` is styled but not wired.
- **Phone masks:** the contact form's source phone masks are not carried.
- **Contact-lens exam page:** `/eye-care-services/contact-lens-exams/` has no feature image. `svc-contact-lens` was
  dropped in the imagery review.
- **Markup audit:** the markup contract audit exits 1 on its 2 known departures (see above).

## AI imagery disclosure

The redesign adds **15 AI-generated images** from fal.ai (`fal-ai/flux-pro/v1.1-ultra` and `fal-ai/flux-pro/kontext`):
- 3 blurred scene backdrops;
- 7 decorative cut-outs: eyeglasses, sunglasses, kids' glasses, a contact lens on a fingertip, a phoropter, an olive
  sprig, a lens prism;
- 4 section images: an eye exam, a child in an exam chair, an eye drop, a woman trying on glasses;
- 1 frosted-glass texture.

They ship as 18 WebP files, including 6 trimmed cut-out variants, in `dist/img/generated/`. **Every one is labelled
as AI-generated in its file metadata** with the IPTC `trainedAlgorithmicMedia` XMP packet: 18 of 18,
`grep -c -a trainedAlgorithmicMedia`, 2026-09-29.

They are illustrative only. Two section images do show generic exam subjects: `svc-eye-exam` is "A man looking into a
phoropter during an eye exam" and `svc-pediatric-exam` is "A smiling child wearing round glasses in an exam chair".
The record says none stands in for a real person, place, product, brand or result of
this practice (`audit/generated-images.json` `note`). So `docs/OPEN-DECISIONS.md` #3's "never depicts ... a patient"
holds only in that sense: no image shows a real patient of this practice. The imagery review
rejected versions that showed marks or pseudo-text, a clinician who could read as Dr. Clifton, or a lab coat that read
as staff (`docs/IMAGE-PLAN.md` section 5). The people in the section images are AI-generated, not photographs of real
people.

**The favicon is not AI imagery.** It is derived from the practice's own logo file: a crop of its eye mark, padded on
white (BUILD-DECISIONS #2, `docs/IMAGE-PLAN.md` section 6). It carries no AI label. The full record of 45
generations, 15 accepted and 1 dropped is in `docs/CHANGE-LOG.md` section 3. Replace any generated image with real
photography of the practice whenever that is available.

## Before you change anything

- Read `docs/CHANGE-LOG.md`. Every section of the old site has a recorded decision in `audit/change-control.json`,
  including what was preserved, restructured, replaced, removed or added, and why.
- `docs/BRAND-SYSTEM.md` still opens with "Status: proposal ... not yet in `src/styles/`". That line predates the
  build: the redesign tokens now live in `src/styles/tokens.css` after the `REDESIGN TOKENS` marker (DESIGN-SPEC
  section 2).
- Never rewrite, invent or drop copy without a ledger row, and never add a claim that is not in the source or in
  `facts/client-facts.json`. `sr-fabrication` and `tools/sentence-parity.mjs` will catch it.
- Do not run `tools/fal-gen.mjs` without `--only`. `svc-contact-lens` is still a plan entry, and a bare run would
  regenerate it without review. The fal key must stay outside the project tree.
- After a change, rebuild and re-run the checks in the verification record. Each one has a positive control.

## Open decisions for the practice

These are listed in `docs/OPEN-DECISIONS.md` and `docs/CHANGE-LOG.md` section 8:
- the **licence of the syndicated patient-education library and blog**: 101 library pages under
  `/eye-care-services/your-eye-health/`, and the blog. The crawl holds 151 posts (WordPress single-post pages), 89 of
  them with a year in their URL, which matches OPEN-DECISIONS' "~90 dated posts". Whether the other 62 are syndicated
  too is **UNVERIFIED**, so the decision may cover all 151 (`tmp/final/docs-fix/facts.log`; `docs/OPEN-DECISIONS.md`
  #1 still says "about 120" and "~90");
- a **form endpoint**;
- replacing the generated imagery with real photography;
- a disclaimer clause of the practice's own;
- whether the 220 noindex pages stay noindex;
- an official favicon;
- the Safari check.

Deployment and launch are covered in `docs/DEPLOY.md`.
