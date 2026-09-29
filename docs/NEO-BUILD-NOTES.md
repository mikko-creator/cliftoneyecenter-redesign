# Neo build notes: templates and the theme-aware pipeline

Status: 2026-09-29, pipeline agent (sections 1-6); integration agent (section 7: first full review, five CSS fixes,
definition of done on the final `dist-neo` 17f041cb...). Scope: the neoclassical "Temple" theme's templates and the build hooks that let
`CEC_THEME=neo node src/build.mjs` build `dist-neo/` through the shared content, SEO, forms and image pipeline, while
the glass build stays byte-identical. The design itself is `docs/NEO-SPEC.md`; the binding neo markup is
`docs/NEO-COMPONENTS.md`; the look (`src/themes/neo/styles/*`, `scripts/*`, `home.mjs`) belongs to the design agent.

## 1. Files

| file | change |
|---|---|
| `src/themes/neo/templates.mjs` | new. Started from a copy of `src/lib/templates.mjs` (untouched); same exports (`createTemplates`, `icon`, `isoDate`, `ICON_NAMES`, `SPRITE`, plus `orn`, `ORNAMENT_NAMES`) and the same `T` API (21 functions). Markup per NEO-COMPONENTS 1-3 |
| `src/themes/neo/images.mjs` | new. The neo image slot map and derivative recipes named by NEO-SPEC 0.2 (build hooks 1-3): `bandPlan`, `cutRules`, `CUT_404`, `DERIVE`, `recipeOf`, `TONES`, `GROUNDS`, `groundRecipe`. Read only by the theme hooks of `src/build.mjs` |
| `src/build.mjs` | theme hooks, every one guarded by `TI` (null for glass): see section 2 |
| `tools/sentence-parity.mjs`, `tools/tag-balance.mjs`, `tools/link-check.mjs` | optional `--dir <dir>` (wins over `$CEC_DIST`, resolved against the current directory, never writes `audit/`). With neither option the tools behave exactly as before. `link-check.mjs` also reads a quoted CSS `url()` as one token (trap 4; glass output unchanged) |
| `tmp/neo/build/neo-audit.mjs` | new check tool (git-ignored `tmp/`): robots parity with `dist/` plus the markup contract, 17 positive controls |
| `docs/NEO-BUILD-NOTES.md` | this file |

`src/lib/*.mjs` is not changed: NEO-COMPONENTS 4 needs no pipeline change (the sheets, forms, notice and hours plates
keep their inert glass tokens, which no neo rule styles).

## 2. Build hooks in `src/build.mjs` (all inert for glass)

`const TI = THEME === 'glass' ? null : await import('src/themes/<theme>/images.mjs')` (line 43). Every hook tests `TI`:

| hook (NEO-SPEC 0.2) | where | what the neo build does | glass |
|---|---|---|---|
| 1 image map | `BAND_CUTS`, `CUT_404` (400-401); `bandPlan` call (745); cut rule (769); 404 cut (797) | band scene by family (colonnade / arch-garden / library), the cut-out prefix table of NEO-SPEC 6.3, `neo-cut-eye-relief` on the 404 sheet. `PHOTO_PAGES`, `BAND_FOCUS`, `SVC`, the exclusions (`useGen`: brand names, "Dr. Clifton", "Deana", "Ask Dr.", brand logos in main) stay shared | the inline `CUTS`, `bandPlan`, `'cut-lens-prism'` |
| 2 derivatives | 222-256 | each `DERIVE` id is baked once with ffmpeg into `tmp/build-cache/derived/<id>-<tone>.<sha1(src + recipe)>.png`, encoded by the shared encoder with the IPTC label `(tone-mapped ... and resized by the build)`, and **replaces** the raw entry in `genById`, so `genFor`, `useGen` and `ctx.gen` only return derivatives. A failed bake deletes the entry (empty slot + listed failure, never the raw file) | not run |
| 2b trim | `useGen` (596) | the glass trim cuts from the RAW file, so a theme skips it: neo cut-outs ship untrimmed (the NEO-SPEC 6.5 sizes are untrimmed: `d-bust-glasses.png` 760 x 1004) | unchanged |
| 3 grounds | 222-256 bake, 1005-1009 append | the three grounds are baked and appended to the shipped `tokens.css` as `:root { --n-ground-light / -dark / -deep: url(...) }`; the CSS integrity check then finds them defined | `--tex-frost` append (999) unchanged; not appended in neo |
| 4 reports | 1089-1093 ground slots; 1168-1175 | `REPORTS` is glass-only, so neo writes `tmp/neo/build/image-slots.json`, `build-report.json`, `build-pages.json` (never `audit/`) | unchanged |

The THEME block (lines 30-40) predates this task; this task only added the hooks above.

### 2.1 Recipes (`src/themes/neo/images.mjs`), verified against the spec's own samples

Each recipe was run and compared pixel by pixel with the derivative the spec author measured in `tmp/neo/spec/`
(`pxdiff.mjs`, mean / max absolute channel difference out of 255; the control, light ground vs dark ground, differs by
mean 212, so the tool discriminates):

| id | treatment | size | vs spec sample | shipped WebP bytes |
|---|---|---|---|---|
| `neo-cut-bust-glasses` | T3 duo-marble, alpha kept | 760 x 1004 | mean 0.067, max 12 (`d-bust-glasses.png`) | 40,096 (home) |
| `neo-cut-eye-relief` | T3 | 560 x 416 | mean 0.165, max 10 | 19,100 |
| `neo-cut-hand-spectacles` | T3 | 560 x 416 | (same recipe as the relief) | 17,576 |
| `neo-cut-bust-profile` | T3 | 560 x 740 | (same recipe) | 23,590 |
| `neo-cut-column` | T3 | 480 x 860 | (same recipe) | 28,724 (home) |
| `neo-cut-magnifier` | T0 resize | 600 x 454 | mean 0.087, max 10 | 15,868 (home) |
| `neo-cut-laurel` | T0 resize | 400 x 400 | mean 0.336, max 15 | 31,124 (home) |
| `neo-scene-colonnade` / `-arch-garden` / `-library` | T5 duo-niche, 3:4 centre crop | 640 x 854 | colonnade mean 0.497, max 42 (`d-colonnade-t5.png`) | 32,610 / 50,830 / 26,594 |
| `--n-ground-light` | texture 18% over `marble-50` | 1600 x 893 | mean 0.767, max 6 (`d-ground-light.png`) | 8,960 |
| `--n-ground-dark` | 14% over `poster` | 1600 x 893 | mean 0.666, max 5 (`d-ground-dark.png`) | 13,040 |
| `--n-ground-deep` | 10% over `poster-deep` | 1600 x 893 | (no spec sample: NEO-SPEC 7.7 lists it unmeasured) | 9,574 |

The ground is the normal-blend formula `c * (1 - a) + t * a` per channel (`lutrgb`), so no second ffmpeg input is needed.
T3 keeps the alpha exactly: the alpha plane of the baked `neo-cut-bust-glasses` equals the same resize without the tone
(0 of 763,040 pixels differ; the control, alpha halved, differs on 307,761). All 13 baked files have the sizes above
(`ffprobe` over `tmp/build-cache/derived/neo-*`).
Every shipped `neo-*` file carries `trainedAlgorithmicMedia` and its CreatorTool names the treatment (checked on all 13
shipped neo files; the build's own AI-label audit: 20 of 20 generated files labelled).

## 3. Templates (`src/themes/neo/templates.mjs`)

Implemented as NEO-COMPONENTS writes it; the points that needed a decision:

- **Head** (1.1): the glass head order (js-class `HEAD_SCRIPT` verbatim, then `fonts/fonts.css`, then `LINKED_STYLES`:
  tokens, site, motion; `site.js` deferred at the end of `body`) with the two neo font preloads instead of glass's.
- **Shell** (1.2): sprite (16 glass icons unchanged + `o-rosette`, `o-star`, `o-badge` verbatim from the temple lab,
  `o-sprig` = the inner markup of `ornaments.json` `laurel`, inserted by script to avoid transcription), `div.ground`
  on interior pages only, skip link, `header.masthead` (top bar + header bar), main, footer, then drawer and scrim after
  `div.page`. No `div.field`, no top-level `div.progress` (it is the header bar's last child).
- **Logos**: `logoHeader` (`logo-clifton.png`) in the light header, `logoFooter` (`logo-clifton-light.png`) in the
  footer tympanum, the same transparent files and `img` attributes the glass theme ships (never recoloured).
- **Phone numbers** (0, 6.3 #7): the templates wrap numbers **outside `<main>`** in `span.nw` (top bar and drawer call
  plaques, aside, footer NAP); inside `<main>` the shared build pass adds `span.nobr` (T.ctaBand and T.visit rely on
  it, as glass). `neo-audit.mjs` checks every visible number is wrapped exactly once.
- **Band** (3.1): `band--scene` only when the scene resolves; `band__niche` on scene bands and on plain bands that
  still have a cut-out (none today); `band__cut--photo` beside the visual on photo bands; `band--has-cut` whenever a
  cut renders; `band__cut--wide` from the derivative's own ratio (>= 2:1; none of the neo cut-outs is); no
  `data-reveal` anywhere in the band.
- **Dock** (2.6): one tile markup (`dock__ring` + icon, label, `dock__go`); `aside` and `portico` variants are
  `nav[aria-label="Quick actions"]`, `row` is `div[data-stagger]` with `data-reveal="up"` tiles; source `rel` kept
  plus `noopener`.
- No `.glass*`, `is-flat` or `is-solid` is emitted by the neo templates (checked: 0 outside the pipeline's sheets and
  form notice).

## 4. Evidence (this run)

Glass guard, after every change to `src/build.mjs` and the tools:
`CEC_DIST=tmp/neo-guard node src/build.mjs` (349 / 349 + 404, 0 failures) then
`node tmp/orch/hashdir.mjs tmp/neo-guard dist --control` -> `0e6d64d9b6e89b988d883b854d6fb8e39738900849b4c496da9a21355d32aa3b 665 files`
for both, **IDENTICAL**, control fired (baseline before any change: the same hash).

Neo build, final state (11:36, after the design agent's `home.mjs`, `site.css`, `motion.css` and `site.js` landed;
all numbers are for the artifact hashed below):

| check | command | result |
|---|---|---|
| build | `CEC_THEME=neo node src/build.mjs` | **exit 0**, 349 / 349 pages + `404.html`, **0 build failures**, home from `src/themes/neo/home.mjs`; generated slots 249 rendered / 17 skipped (every skip is a shared exclusion or declared drop); 20 of 20 generated files AI-labelled |
| reproducible | second build to `tmp/neo-repro`, `hashdir.mjs tmp/neo-repro dist-neo --control` | **IDENTICAL** `f559f79b583e25802d9531d7089447505348b3d9fb16cc7fcca466582d40d175`, 668 files, control fired; the final `dist-neo` rebuild has the same hash, so every gate below ran on this artifact |
| sentence parity | `node tools/sentence-parity.mjs --dir dist-neo` | 349 pages, 13,966 sentences, **0 lost** (13,595 found, 363 source chrome, 8 declared, 3 whitespace-only); control fired |
| tag balance | `node tools/tag-balance.mjs --dir dist-neo` | 350 pages, **0 findings**; control fired |
| link check | `node tools/link-check.mjs --dir dist-neo` | 354 files, 20,789 local refs, **0 broken**; controls fired (after the CSS `url()` parser fix, trap 4); a planted missing `url()` in a copy of `tokens.css` is reported |
| decontamination | `sr-decontaminate --project . --dir dist-neo --strict` | **CLEAN**, 359 files, 0 blocker / 0 major / 0 minor (report kept as `tmp/neo/build/decontamination-dist-neo.json`; the glass files restored, trap 1) |
| robots | `node tmp/neo/build/neo-audit.mjs dist-neo dist` | **0 mismatches** over the same 350 pages; census: 83 `noindex, max-image-preview:large`, 137 `noindex, nofollow, max-image-preview:large`, 122 `max-image-preview:large`, 7 `index, follow, max-image-preview:large`, `404.html` `noindex` (glass: 220 noindex) |
| markup contract | same | **0 findings** on 350 pages: 0 style attributes, exactly one h1 each, width/height/alt on every img, iframes wrapped, JSON-LD parses, 0 root-absolute URLs outside `404.html` (0 page-relative inside it, F.7), data-* only from the neo registry, `data-depth-max` <= 32 everywhere, no source classes, no glass tokens outside the pipeline's sheets and form notice, every `<use>` resolves, no reveal in the band, every visible number wrapped exactly once; 17 controls fired |
| image slots | `tmp/neo/build/image-slots.json` | 161 scene bands, 68 band cut-outs (13 bust-profile, 24 eye-relief, 31 hand; 2 on photo bands), 0 plain bands with a cut; 9 pages excluded by the shared rules; the 404 relief on both 404 pages; home: the six cut-outs of NEO-SPEC 6.2 |
| home payload (NG10 input, not the gate) | bytes of the neo files the home references | six cut-outs 152,488 + three grounds 31,574 = **184,062 bytes** (NEO-SPEC 6.5 estimated 152,182 without the deep ground) |
| home head | `dist-neo/index.html` | the hero photo is preloaded (`fetchpriority="high"`); stylesheets fonts, tokens, site, motion in that order; no `div.ground` on the home |

Earlier run (11:22, before the design files): exit 1 with exactly 4 failures, all the pending design files (`home.mjs`
not loadable, `site.css` x 2 lines, `site.js`); parity 0 lost, tags 0, decontamination CLEAN, robots and markup 0;
reproducible (`0447e562...`, 660 files).

## 5. Traps found

1. **`sr-decontaminate --project .` writes the glass handoff's evidence.** With `--project` it always rewrites
   `audit/decontamination.json` (target, counts, timestamp) and the `decontaminate` stage and `updatedAt` of
   `project.json`, even when `--dir dist-neo` is scanned. Run on dist-neo, it replaced the glass report with the neo
   one. Restored with `git checkout -- audit/decontamination.json project.json` after confirming the diff held only
   that run's lines; the neo report is copied to `tmp/neo/build/`. Every neo run must do the same (or pass `--dir`
   alone, which loses the source-404 and declared-prose exemptions).
2. **The link check's 404 control is not independent of the build**: it plants `/styles/site.css` as a reference
   that must resolve, so on a build without `site.css` it reports "DID NOT FIRE". It is not a tool defect for glass;
   for neo it simply waits for the design stylesheet.
3. **The glass trim would leak raw files.** `useGen(..., { trim: true })` builds its trimmed copy from the raw PNG;
   left on for neo it would ship an untoned cut-out beside the T3 one. It is off for themes (hook 2b).
4. **The link check misread SVG data URIs in CSS.** Its CSS pattern stopped a `url(` value at the first quote of either
   kind, so the design's grain tokens (`url("data:image/svg+xml,...filter='url(%23n)'...")`) were read as two
   references and the in-SVG fragment `url(%23n)` was reported as a missing file (2 findings in `tokens.css`). A quoted
   `url()` is now one token up to its own closing quote, with a new control (a missing quoted and unquoted `url()`
   reported, the data URI's fragment not). Glass output before and after the fix is identical (354 files, 20,333
   local refs, 2,882 external, 0 broken).

## 6. Reproduce

```sh
CEC_DIST=tmp/neo-guard node src/build.mjs && node tmp/orch/hashdir.mjs tmp/neo-guard dist --control   # glass guard
CEC_THEME=neo node src/build.mjs                                                                       # dist-neo/
node tools/sentence-parity.mjs --dir dist-neo; node tools/tag-balance.mjs --dir dist-neo; node tools/link-check.mjs --dir dist-neo
node ~/.claude/skills/site-reforge/scripts/sr-decontaminate.mjs --project . --dir dist-neo --strict \
  && cp audit/decontamination.json tmp/neo/build/decontamination-dist-neo.json \
  && git checkout -- audit/decontamination.json project.json                                          # trap 1
node tmp/neo/build/neo-audit.mjs dist-neo dist
```

## 7. Integration and first full review (2026-09-29, integration agent)

Scope: build `dist-neo/` from the landed design files, review one page per template family in a browser, fix what
the review found in the owning files (`src/themes/neo/styles/site.css` only; no shared code changed), and run the
definition of done on the final artifact. Every probe below is under `tmp/neo/int/` (git-ignored) and runs against
`dist-neo/` served by `node tools/serve.mjs --root dist-neo --port 8861 --no-open`, one headless Chrome at a time.

### 7.1 Review (15 families x 1440 and 390, `tools/shoot.mjs --full --scroll-steps 8`)

Pages: home `/`, service hub `/eye-care-services/`, service detail `.../dry-eye-disease-and-treatment/`, library
article with diagrams `.../how-the-eye-works/`, library index `/eye-care-services/your-eye-health/`, eyewear with
the logo grid `/eyeglasses-contacts/eyeglasses/designer-frames/`, `/insurance/`, the appointment form, testimonials,
`/whats-new/`, a blog post with the build's only `<table>` (`/1-eye-allergies-2016/`), `/our-eye-doctors/`,
`/privacy-policy/`, the archive `/category/our-doctors/`, `/404.html`. All 30 shots: `scrollWidth === innerWidth`,
0 broken images. Tall shots were cut into strips of at most 1300px (`tmp/neo/int/sheets.mjs`) and viewed.

Fixed (all in `src/themes/neo/styles/site.css`, then rebuilt and re-shot):

| # | defect seen | cause | fix | re-check |
|---|---|---|---|---|
| 1 | eyewear `#TELLITLIKEITIS`: the reviews-symbol plate floated right alone, an empty column beside it (4 pages have a trailing plate) | neo floats every `.prose > .fig--plate` at 900px+; glass stops a **last-child** plate from floating | `.prose > .fig--plate:last-child { float: none; width: fit-content; ... }` inside the 900px block (the glass rule) | 1440 re-shot: the plate sits at its natural size under the brand image |
| 2 | testimonials (1440): stelae of very different heights in a 2-column row, a large hole under the short one | `.rev-grid { align-items: start }` | the row stretches (`align-items: stretch`, `li` flex, the stele fills it) and `.review__by` sits on the plinth (`margin-top: auto`); home carousel untouched (scoped to `.rev-grid`) | 1440 re-shot: one height per row; 390 unchanged (one column) |
| 3 | tel CTA buttons at 390: "Give Us a / Call 318-550-5815"; after a first fix the arrow wrapped alone | `inline-flex` without wrap: the anonymous label item shrank and broke inside itself | tel buttons wrap as whole items (`flex-wrap: wrap`), the trailing arrow is pinned to the right edge (`position: absolute`), tighter inline padding below 420px | `tmp/neo/int/telbtn.mjs`: 9 buttons at 320/390/1440, label 1 line box, number 1 line box, arrow inside the box and clear of the number, all 9; clips viewed |
| 4 | breadcrumb links 26px tall on phones (NG11) | neo `min-height: 24px`; glass has 44px below 768 (RA-08) | glass rule ported: `.crumbs__link, .crumbs__current { min-height: 44px }`, `a.crumbs__link { min-width: 44px }` below 768px | NG11 below; band re-shot at 390 and 320 |
| 5 | visit / hours "Clifton Eye Center" NAP title link 38px tall (NG11) | no padding on the inline-block link | `padding-block: 6px; margin-block: -6px` (44px target, layout unchanged, as glass) | NG11 below |

Seen and left as they are (by design, or shared with glass): the quiet "VII" visit head without a heading (the
source row has none; aria-hidden numeral); the dark map-plate ledge under the map (NEO-SPEC 3.11, the magnifier lies
on it); the `o-star` before the current nav item (NEO-SPEC 3.2); the designer-frames band photo changing at 767px
(the source `<picture>`); the washed insurance band photo (the source file itself, byte-identical to glass); no
breadcrumb on `/designer-frames/` and "Home" as the only crumb on the archive (both identical in `dist/`);
`/whats-new/` 26,084px at 1440 / 60,163px at 390 (all 151 cards on one URL, NEO-SPEC 3.17, same count as glass).

### 7.2 Definition of done (final `dist-neo`, built 14:11:12 from the 14:11:10 `site.css`; every check below ran after it)

| gate | command | result |
|---|---|---|
| build | `CEC_THEME=neo node src/build.mjs` | **exit 0**, 349 / 349 + `404.html`, **0 build failures**, generated slots 249 rendered / 17 skipped |
| reproducible | `CEC_THEME=neo CEC_DIST=tmp/neo-repro/a` and `/b` builds, `hashdir.mjs tmp/neo-repro/{a,b} dist-neo --control` | **IDENTICAL** both, `17f041cba800ed3ef3814828687059074ded97a159e863a44f7c6efde1a4088c`, 668 files, control fired |
| glass guard | `CEC_DIST=tmp/neo-guard node src/build.mjs`, `hashdir.mjs tmp/neo-guard dist --control` | **IDENTICAL** `0e6d64d9b6e89b988d883b854d6fb8e39738900849b4c496da9a21355d32aa3b`, 665 files, control fired (no shared file changed in this task) |
| sentence parity | `node tools/sentence-parity.mjs --dir dist-neo` | 349 pages, 13,966 sentences, **0 lost** (13,595 found, 363 source chrome, 8 declared, 3 whitespace-only), control fired |
| tag balance | `node tools/tag-balance.mjs --dir dist-neo` | 350 pages, **0 findings**, control fired |
| link check | `node tools/link-check.mjs --dir dist-neo` | 354 files, 20,789 local refs, **0 broken**, control fired |
| decontamination | `sr-decontaminate --project . --dir dist-neo --strict` (then trap 1: report copied to `tmp/neo/build/`, glass files restored, `git status` clean for both) | **CLEAN**, 359 files, 0 / 0 / 0 |
| fabrication-equivalent | `node tmp/neo/int/fab-diff.mjs` (20 pages: the 15 review pages plus hours-location, the doctor profile, the staff, a testimonial, the featured-brands page) | every visible text run and every alt / aria-label / title / placeholder value of `dist-neo` is found in the same page of `dist/`, except 3 strings: "II", "III", "VII", the aria-hidden roman numerals of the home section heads (ledger N01). A planted claim ("since 1850") is reported (control fired) |
| robots + markup contract | `node tmp/neo/build/neo-audit.mjs dist-neo dist` | robots **0 mismatches** over 350 pages (census 83 / 122 / 137 / 7 + `404.html` noindex); markup **0 findings**; controls fired |
| overflow | `tmp/gallery-neo/work/sweep.mjs --root dist-neo --width W` for W = 320, 390, 768, 1024, 1440 (every page plus `404.html`, not only home + 6 families) | **0 overflowing pages** and **0 JS errors** at each width (350 pages x 5); control `tmp/neo/int/overflow-control.mjs` (a planted 600px block: 390 -> 600) fired |
| JS errors | `node tmp/neo/int/dod-browser.mjs` (12 pages at 390 with the drawer opened and closed by Escape, and at 1440 with a scroll-through) | **0** uncaught exceptions / console errors / log errors over 24 loads; drawer open + Escape close on 12 / 12; positive control (a page that throws) caught |
| reduced motion | same script, emulated `reduce`, 12 pages at 1440 and 390, after a scroll-through; and `behaviour.mjs` A | **0** invisible elements in `main`/`footer` on 24 loads (excluding the designed `aria-disabled` carousel button at .45 and the native radios whose label draws the control), no `js-motion`; control (a planted opacity 0 block) counted. Home: 0 pending reveals, no `--py` / `--settle` written, 0 translated depth layers, hover moves nothing |
| reveals | `tmp/gallery-neo/work/behaviour.mjs --base http://127.0.0.1:8861` B | 1440 / 390: `js-motion` set, 0 pending or invisible in the first viewport, 27 / 24 below-fold blocks waiting; after a scroll-through 0 pending, 0 invisible; End-key jump: 0 pending above the viewport |
| hover vs keyboard | same, C: 15 components, each reached by real Tab presses from the skip link, `:focus-visible` true | **14 MATCH**; the home portico dock tile differs only in `box-shadow`: focus adds the 5px `focus-on-dark` halo under the outline (site.css 407, the ring the dark hero needs); lift (-6px), colours, arch rule and keystone are identical |
| inert form | `dod-browser.mjs` F | a valid submit of the appointment form shows and focuses "This form is not connected yet — please call 318-550-5815", stays on the page, 0 non-GET requests; an invalid submit shows the field errors instead (site.js 308) |
| NG11 touch targets | `node tmp/neo/int/ux.mjs` (8 pages at 320 and 390) | 508 targets, **0 under 44px** (inline prose links exempt), control (a planted 20px button) fired; before fixes 4 and 5: 16 under 44px |
| NG19 phone line boxes | same, 8 pages at 320 / 390 / 768 / 1024 / 1440 | 135 visible numbers, **0** in more than one line box; control (a number in a 60px box) fired |
| NG10 payload | bytes of the `neo-*` files `index.html` and `tokens.css` reference; `filter:\s*url\(` in shipped CSS | 9 files, **184,062 bytes** (cap 400 KB); 0 (control 1) |
| NG15 / NG16 | `AIza...` / fal key patterns; `wp-content`, `gform`, `fl-`, `ecp-`, GTM, icon fonts in html/css/js | 0 / 0 files (each control pattern matches) |

### 7.3 Open (for QA and the design owner)

1. **NG18 fails:** the home at 390 is **10,654px** (gate 10,300; temple lab 11,306). Section budget at 390
   (`tmp/neo/int/homegeo.mjs`): hero 927, welcome 3,185 (its verbatim practice copy alone 1,911; promo + What's New
   855), services 1,002, reviews 804, help 1,447 (the CSS niche 325, spec-sized `min(68%, 250px)`), designer 517,
   visit 1,830 (222px top padding under the brand plates that hang 150px into it), footer 820. The safe phone-only
   trims (smaller niche, tighter help gap, visit clearance) come to about 100px, so the gate needs a design decision
   (phone type scale or spacing), not a local fix. Not changed.
2. **Not re-measured after this task's CSS changes:** NG2 rendered contrast (no colour changed; tel buttons,
   breadcrumbs and the NAP link changed geometry only), NG4 / NG5 protrusion and collision probes (visual review
   only), NG9 first screen and LCP (the home hero is untouched), NG13 WebKit (operator).
3. **Not viewed:** the library article, insurance and legal pages at 390; `/whats-new/` and the privacy policy below
   their first 5,200px; interior families at 768 and 1024 (covered by the overflow sweep only).
4. Shared with glass and visible in neo: the archive shows only "Home" as a breadcrumb (source "Home » Nothing
   Found"); `/designer-frames/` has no breadcrumb; `/whats-new/` is 60,163px tall at 390 (151 cards on one URL).
5. The pipeline's inert glass classes stay in the neo markup on the sheets and the form notice
   (`sheet glass glass--light is-flat`); no neo rule styles them (section 3).
6. `dist-neo/` is untracked and not in `.gitignore` (the operator decides, 7.6 #3 of NEO-SPEC).

### 7.4 Reproduce this section

```sh
node tools/serve.mjs --root dist-neo --port 8861 --no-open                                  # background; kill after
while read k u; do node tools/shoot.mjs --url "http://127.0.0.1:8861$u" --widths 1440,390 \
  --out tmp/neo/int/shots/$k --full --scroll-steps 8; done < tmp/neo/int/pages.txt
node tmp/neo/int/sheets.mjs tmp/neo/int/shots/<k>.1440.png --scale 0.5 --per 2              # review sheets
for w in 320 390 768 1024 1440; do node tmp/gallery-neo/work/sweep.mjs --base http://127.0.0.1:8861 --root dist-neo --width $w; done
node tmp/neo/int/overflow-control.mjs; node tmp/neo/int/dod-browser.mjs; node tmp/neo/int/ux.mjs; node tmp/neo/int/telbtn.mjs
node tmp/gallery-neo/work/behaviour.mjs --base http://127.0.0.1:8861
node tmp/neo/int/fab-diff.mjs
```
