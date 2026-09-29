# Neo build notes: templates and the theme-aware pipeline

Status: 2026-09-29, pipeline agent (sections 1-6); integration agent (section 7: first full review, five CSS fixes,
definition of done on the final `dist-neo` 17f041cb...); fixer (section 8: QA round 1, 21 findings, final `dist-neo`
39fa000c...). Scope: the neoclassical "Temple" theme's templates and the build hooks that let
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

1. **NG18 fails** (superseded by 8.1 VH3: 10,395px after the phone spacing trims, accepted by the operator's delegate):
   the home at 390 is **10,654px** (gate 10,300; temple lab 11,306). Section budget at 390
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

## 8. QA round 1 (2026-09-29, fixer)

Scope: the 21 confirmed findings of QA round 1 (lenses visual-home, visual-interior, runtime-a11y-contrast,
content-seo-contract), fixed at their root in the neo-owned files only: `src/themes/neo/styles/site.css`,
`src/themes/neo/scripts/site.js`, `src/themes/neo/templates.mjs`, `src/themes/neo/home.mjs` and the neo-only hook 2
of `src/build.mjs` (inside `if (TI)`). No shared file (`src/lib/*`, `tools/*`, glass paths of `src/build.mjs`) was
changed; the glass guard below is identical. Spec values that changed are recorded in `docs/NEO-SPEC.md` (3.0-3.4,
3.7, 3.9, 3.11, 3.13, 3.15, 3.22, 4.1 incl. a new "Phone spacing" paragraph, 4.2, 7.5 NG18) and
`docs/NEO-COMPONENTS.md` (departure 6 made literal, new departure 9, the three `p.nap__addr` markups).

Method: every "before" was re-measured by the fixer on the untouched artifact (`17f041cb...`, kept as
`tmp/qa-neo/fix/before-dist-neo/`) with copies of the refuters' probes (port changed to 8851, outputs under
`tmp/qa-neo/fix/{home,interior,runtime}/`, `*.before.json`), then again on the rebuilt `dist-neo`. One headless Chrome
at a time, `tools/serve.mjs --root dist-neo --port 8851`. Reduced motion (rest pose) for geometry and colour.

### 8.1 Findings: fix, before and after

| id | fix (root cause) | before | after | evidence / repro |
|---|---|---|---|---|
| VH1 major | `--script-fs` capped at `3.375rem` (was `4.25rem`): the script grew until 2033px while the poster lines, the wrap and the bust stopped at 1323-1476px, so its end ran into the bust | "!" glyph box to the bust's opaque pixels 64.2 / 31.7 / 1.3 / 0 px at 1440 / 1680 / 1920 / 2048; ink gap 82.2 / 54.7 / 26.4 / 13.4; from 1680 the ink crossed "C" and "A" of CARE | 64.2 at 1440, 61.0 at 1680-2560 (script 54px from 1447); ink gap 79.5; only the last "E" of EYE crossed, 5% deep; 1024-1440 unchanged; control (script moved 300px right) ink gap 0.4 | `home/geo/script{.before,}.json`, `home/crops/script-bust.2048.x2.png` (viewed); `node tmp/qa-neo/fix/home/script.mjs --widths 1024,...,2560` |
| VH2 major | the 1200+ portico dock is end-aligned in the cella (`align-self: end`), so its negative margin-bottom IS the lower row's crossing (start-aligned it only gave back its share of a track the photo sizes); crossing 30% of the niche, **recorded** in NEO-SPEC 4.1 instead of half: at half the lower labels would sit at 884-930px at 1440 x 900, outside NG9's first screen | lower row past the seam 6 / 7 / 10 / 15 / 23 / 34 / 36 px (1200 / 1280 / 1366 / 1440 / 1536 / 1680 / 1920) | 45 / 46 / 49 / 52 / 52 / 52 / 52 px; photo and pedestal still cross by `--n-seam` 96-140 (control unchanged); NG9 1440 x 900: lowest label 894px (inside) | `home/geo/portico{.before,}.json`, `home/crops/portico-seam.1280.png`, `proto/portico-C-seam.1440.png` (viewed), `ng9.after1.json`; `node tmp/qa-neo/fix/home/portico.mjs`, `node tmp/qa-neo/fix/ng9.mjs` |
| VH3 major (NG18) | empty ground trimmed below 700 only (the delegate's decision): Welcome padding-top crossing + 32 (was + 48); Welcome/Services seam crossing + 24 above (was + 43) and + 28 below (was + 40); Services/reviews paddings sized from the phone medallion trio (126px below 700, 110px below 420) + 11px rule + 30px (were sized from the 116px desktop medallion + 48-70px); help niche `min(44%, 170px)` (was `min(68%, 250px)`) and a 32px gap (was 40); promo arch 44px (VH6); Visit padding-top below 768 150 + 24 + 24 (was + 48). No copy, figure or depth layer removed, no text resized | home at 390: 10,654px (414: 10,637; 360: 10,841; 320: 11,284); help niche 325px | **10,395px** at 390 (414: 10,382; 360: 10,591; 320: 11,061); sections: welcome 3185 -> 3150, services 1002 -> 964, reviews 804 -> 764, help 1447 -> 1324, visit 1825 -> 1801 (hero, designer, footer unchanged); 768: 8,569 (+10, VH7), 1440: 7,834 (unchanged). **Lands between 10,300 and 10,654: recorded and accepted per the operator's delegate** (NEO-SPEC 7.5) | `home/geo/ng18{.before,}.json`, `shots/home.390.{A,B,C,D}.png` (viewed); `node tmp/qa-neo/fix/home/ng18.mjs` |
| VH4 minor | `.map-plate .map` carries the 280px floor itself and takes its proportion from a padding strut (`::before { padding-top: 102% }`), the iframe `inset: 0; min-height: 0`; the magnifier 4px lower (lens under the ledge's middle) | 320: box 260 x 265, iframe 280 tall, mat band under the map -1px; magnifier 6.9px from the iframe (21.7 at 334-1024) | 320: box = iframe 260 x 280, mat band 14px at every width 320-1440; magnifier 25.7px (320-1024), 31.4 (1440); lens still wholly on the ledge | `home/geo/map{.before,}.json`, `home/crops/map-bottom.320.x3.png` (viewed); `node tmp/qa-neo/fix/home/map.mjs` |
| VH5 minor | **resolved by record** (NG4 allows it): the relief's own 240px width cap leaves its opaque part 62.2% of its height, so `clamp(40px, 5vw, 72px)` cannot be reached (72px would need a 311px relief); NEO-SPEC 4.1 now states half its opaque height. No CSS change | opaque crossing up/down 35/34 (390, 768), 40/41 (1024), 50/50 (1280), 56/55 (1440, 1920) against 40 / 51 / 64 / 72 | unchanged values, now the spec's; centred on the seam within 0.5px; Services title clearance 69px at 390 (was 81, the phone seam trim), 78-80 elsewhere | `home/geo/relief{.before,}.json`; `node tmp/qa-neo/fix/home/relief.mjs` |
| VH6 minor | below 700 `.promo { margin-top: 44px }`, `.promo__img { margin-top: -44px }` (NEO-SPEC 3.7) | promo arch rise 58px at 320-414 | 44px at 320 / 360 / 390 / 414; 58 at 768 and 1440 (spec) | `home/geo/ng18{.before,}.json` (promoRise) |
| VH7 minor | with the hand, the What's New plate's padding-top + 10px (the fingertips were too near the heading's glyph box) | hand to "What's New!" glyph box 17.3 / 17.0 / 20.2 / 22.7 / 22.7 px (768 / 1100 / 1280 / 1440 / 1920) | 27.1 / 27.0 / 30.2 / 32.7 / 32.7 (1024: 57.3); ink gap 40-46; underside still 11-12px into the frame; control (heading moved into the hand) 0 | `home/geo/hand{.before,}.json`; `node tmp/qa-neo/fix/home/hand.mjs` |
| VH8 minor | the plaque-list dock (700-1199) starts 22px under line 2 (was 6px) | first plaque 8 / 9 / 9 / 9 / 10 px under the "EYE CARE CLINIC" ink (768 / 900 / 1024 / 1100 / 1199) | 24 / 25 / 25 / 25 / 26 px; NG9 1024 x 768 lowest label 700px (was 684, inside 768) | `home/geo/plaque{.before,}.json`, `home/crops/hero-plaque.1024.png` (viewed) |
| VH9 minor | "Suite 302" wrapped in `span.nobr` (home Visit, `T.visit`, inside main) / `span.nw` (aside) by `home.mjs` and `templates.mjs`; characters unchanged | "Suite" / "302" on different lines at 1200, 1100, 768, 700, 360 | on one line at all 14 widths (1920-320); control ("Drive," / "Bossier", split by `<br>`) two lines at all 14 | `home/geo/wraps.before.json` (refuter probe), `home/geo/wraps2.json` (same probe walking descendant text nodes: the refuter's reads direct children only and cannot read the new span; run on the kept before-build it reports the 5 broken widths again, `home/geo/wraps2.control-before.json`), `home/crops/nap-addr.1100.x2.png` (viewed) |
| VI-1 major | same root as VH4 (`.map__frame { min-height: 280px }` beat `inset: 0` in a shorter box): the box keeps the floor (4:3 strut `padding-top: 75%` on `visit--page`). A first attempt with `aspect-ratio` + `min-height` was caught by the re-measure: Chrome transferred the floor to a 373px min-width, widening the map past its plate onto the NAP stele at 768 (6 scan points); replaced by the strut | /hours-location/ and /location/clifton-eye-center/: box 195 / 248 / 233 px under a 280px iframe (320 / 390 / 768); the ledge over the iframe's bottom 71 / 19 / 33 px; bottom-strip scan on the iframe 0/156, 25/150, 0/156 | box = iframe 280px at 320 / 390 / 768 (321 / 330 at 1024 / 1440, unchanged); ledge over the iframe 0; scan 156/156, 150/150, 156/156 (and 150/150 at 1024, 1440); on all 3 pages x 5 widths the map sits inside the mat with 14px left, right and bottom; attribution row visible | `interior/map/map{.before,}.json`, `interior/map/hours.390.plate.png` (viewed); `node tmp/qa-neo/fix/interior/map.mjs` |
| VI-2 major | `band__cut--photo` placed in a grid area instead of over the photo: from 1024 the title column (`grid-column: 1 / 2; grid-row: 1 / 2`; both lines explicit, an `auto` end line is the padding edge for an absolutely placed item), right side 24px short of the visual's paper, opaque centre on the band's bottom edge; below 1024 the visual's row, hanging under the photo's bottom-right corner (opaque top 10px below the paper) | the cut's opaque pixels on the band photo: /eyeglasses-contacts/ 419 / 243 / 266 / 111 / 111 samples (1440 / 1024 / 768 / 390 / 320), at 1440 the lace cuff at the woman's jaw; /eye-care-services/ 577 / 337 / 344 / 123 / 123 | 0 samples on the photo on both pages at all 5 widths; 1440: hand x 598-742 against the photo from 783 (paper 777); 1024: 418-522 against 560; below 1024 under the photo, clear of the first sheet | `interior/cut/cut.reduce{.before,}.json`, `interior/cut/eyehub.{1440,1024,390}.reduce.png`, `svchub.1440.reduce.png` (viewed); `node tmp/qa-neo/fix/interior/cut.mjs reduce` |
| VI-3 minor | `.band--plain` is a flex column and its grid grows (`flex: 1 0 auto; align-items: center`): a plain band shorter than its min-height centres the title and its 1024+ pilasters stand 21-36px inside the frame at top and base, as on scene bands | 1024: crumbs 37px under the frame top, divider 93px over its base, pilasters inset 21 / 77; 1440: 52 / 61, pilasters 36 / 45; 404: divider 134 / 102 / 94 / 97 px over the base (1024 / 1440 / 390 / 320) | 1024: 65 / 65, pilasters 21 / 21; 1440: 56 / 57, pilasters 36 / 38; 404: 86 / 85 (1024), 76 / 78 (1440), 54 / 62 (390), 56 / 64 (320); scene, photo and dated-post bands unchanged (control) | `interior/band/band{.before,}.json`, `interior/band/{privacy.1024,e404.390}.png` (viewed); `node tmp/qa-neo/fix/interior/band.mjs` |
| VI-4 minor | `.fig--photo:not(.fig--feature) { width: fit-content; max-width: 100% }` (up to 100% + the break-out for `fig--start/--end` in a sheet, `fig--end` pushed right), the `img { width: 100% }` rule kept for `fig--feature` only; fig-grid photos centred at their own width | 500px photo at 803 / 520 / 650 (1440 / 1024 / 768); 640px photos at 915 / 882 / 650 | 500 -> 500 and 640 -> 640 at 1440 / 1024 / 768 (1x); 390 unchanged (308 = the column) | `interior/upscale/upscale{.before,}.json`, `shots/postclean.1440.png` (viewed); `node tmp/qa-neo/fix/interior/upscale.mjs` |
| VI-5 minor | bust bands below 700 reserve 18px more (`--band-pb: ... - 46px`, was `- 64px`) | bust head 9-12px under the h1 box at 320 (7 pages), 10 / 18 at 390 | 27-29px at 320, 28-127 at 390; all 39 page x width rows >= 27px; control (bust 30px up) 0 | `interior/bust/bust{.before,}.json`; `node tmp/qa-neo/fix/interior/bust.mjs` |
| VI-6 minor | `.doc-card { display: flex; align-items: center; column-gap: .3em }` (as glass) | " (pdf)" baseline 9.1 / 9.0 px below the label's (390 / 1440); at 320 the second card's "(pdf)" wrapped to its own line (+37.9px) | "(pdf)" centred on the row (centre offset -0.6 to 0 px at 320-1440), beside the label at 320 too | `interior/doccard/{doccard,baseline}{.before,}.json`, `interior/doccard/doccards.390.png` (viewed) |
| RA-1 major | the sticky header's clearance moved from `html { scroll-padding-top }` (it also applied to the header's own controls) to `scroll-margin-top` on focus and anchor targets in main, aside and footer (`:where()`, specificity 0); `closeDrawer` restores focus with `preventScroll` | drawer close by button / Escape / scrim: 1500 -> 1066 (-434) at 390 and 320 on 2 pages; keyboard route 1500 -> 1072 -> 1066 -> 632; 1440 nav-link focus -462 from 800 / 1500 / 2500 | every route 1500 -> 1500 (delta 0), keyboard route 1500 throughout, 1440 nav focus delta 0; regression probe: a main link under the stuck header reached by Tab / Shift+Tab lands at 116 (1440) / 96 (390), below the header (92 / 72); anchor targets at 120; control (scroll-margin removed) leaves the link under the header | `runtime/ra1-scroll.{before,after}.json`, `obscure.json`; `node tmp/qa-neo/fix/runtime/ra1-scroll.mjs --base http://127.0.0.1:8851`, `node tmp/qa-neo/fix/obscure.mjs` |
| RA-2 major | `.skip:is(:hover, :focus, :focus-visible) { color: var(--paper) }` | focused skip link green-800 on green-700 1.51:1 | paper on green-700 6.67:1 (computed and pixel p98, 3 pages x 1440 / 390); Enter still moves focus to main | `runtime/ra23/ra23{.before,}.json`; `node tmp/qa-neo/fix/runtime/ra23-focus.mjs --base ...` |
| RA-3 major | `.topbar__addr:is(:hover, :focus-visible) { color: var(--green-950) }` | focus 3.11:1 (green-800), hover 5.29 | focus 5.29 = hover, on link, strong and icon (1440, 1024, 768) | same |
| RA-4 major | `.btn` padding `10px 30px` (was `0 30px`); a one-line button stays 52px | 3-line CTA labels at 320-380: line boxes -2 / -0.8 px past the button, ink on the inner rule | line-box gaps 8 / 9.2 px, ink 10-11 px clear of the rule; 3-line button 77.6px, 2-line 58.5px (was 52) | `runtime/ra45/ra45{.before,}.json`, `ra45/cta_eye_care_services_-375-0-x4.png` (viewed); `node tmp/qa-neo/fix/runtime/ra45-framed.mjs --base ...` |
| RA-5 minor | `.band-pill` padding `10px 16px`, line-height 1.3 (one line stays 44px) | drawer "Make an Appointment" at 320: 2 lines in 53px, gaps 3 / 3.5, descenders on the inner rule | 2 lines in 61px, gaps 10 / 10.5, descenders 7 rows clear of the rule; one-line plaques 44px | same, `ra45/drawer-320-0-x4.png` (viewed) |
| CSC-01 minor | hook 2 (`src/build.mjs`, inside `if (TI)`): when the audit's `postProcess.what` says the matte was replaced, CreatorTool credits the key (`alpha keyed from its black-backdrop edit (matte-key-black.mjs)`) instead of birefnet | `neo-cut-eye-relief.3353156294.webp`, `neo-cut-hand-spectacles.413aa9dfd4.webp`: "fal.ai fal-ai/flux-pro/kontext + fal-ai/birefnet/v2 (...)" | `neo-cut-eye-relief.a70d390810.webp`, `neo-cut-hand-spectacles.73d350c29f.webp`: "fal.ai fal-ai/flux-pro/kontext + alpha keyed from its black-backdrop edit (matte-key-black.mjs) (tone-mapped (T3 duo-marble) and resized by the build)"; decoded RGBA identical to the old files (sha256 4333b468... / a19d2c97...; control file differs); 58 pages reference the new names, 0 the old; the other 11 neo files unchanged; 13/13 carry trainedAlgorithmicMedia | `content/xmp-creatortool.{before,after}.log`; `webpmux -get xmp <file> -o -` |

Not changed, with the reason: none of the 21 was left open. VH2 and VH5 end as recorded spec values (NG4 "or
recorded"), VH3 as the accepted NG18 value.

Seen while measuring, not part of any finding and not changed: at 1024-1280 (below the new cap, so untouched by VH1)
the script's ink also reaches the "C" of CARE, 1-12% of its height deep (1024: "E" 2% + "C" 1%; 1100 and 1200: "C"
12%; 1280: "C" 5%; `home/geo/script.json`). That is within NEO-SPEC 3.3's limit (2 letters at most, 35% at most), but
the letter is in CARE rather than EYE; left for the design owner.

### 8.2 Reviewed by eye (this round, after the last edit)

Viewed after the fixes: the 1440 x 900 first screen with the portico option chosen (`proto/portico-C.1440.png`, and the
rejected option A with 3:4 niches, whose upper niches were half empty), the portico seam at 1280 and 1440, the script
end at 2048 (2x), the 1024 plaque list, the home at 390 in four parts (hero to promo, the relief seam to the medallion
seam, the help niche, the designer plates to the map), the Suite line at 1100, the home map at 320 (3x), the
/hours-location/ map plate at 390, the photo bands of /eyeglasses-contacts/ at 1440 / 1024 / 390 and of
/eye-care-services/ at 1440, the plain bands of /privacy-policy/ at 1024 and the 404 at 390, the contact-lens photo
at native size at 1440, the patient-form cards at 390, a 3-line CTA at 375 (4x) and the drawer plaque at 320 (4x).

### 8.3 Regression (final `dist-neo`, built after the last source edit; every check below ran on it)

| gate | command | result |
|---|---|---|
| build | `CEC_THEME=neo node src/build.mjs` | **exit 0**, 349 / 349 + `404.html`, **0 build failures**, generated slots 249 rendered / 17 skipped (unchanged) |
| reproducible | `CEC_THEME=neo CEC_DIST=tmp/qa-neo/fix/repro-a` and `-b`, `hashdir.mjs tmp/qa-neo/fix/repro-a tmp/qa-neo/fix/repro-b dist-neo --control` | **IDENTICAL** `39fa000c5457f5c26959f933cff271f70756d80b93aa5be3901e7e0634885220`, 668 files (all three), control fired |
| glass guard | `CEC_DIST=tmp/qa-neo/fix/guard node src/build.mjs`, `hashdir.mjs tmp/qa-neo/fix/guard dist --control` | **IDENTICAL** `0e6d64d9b6e89b988d883b854d6fb8e39738900849b4c496da9a21355d32aa3b`, 665 files, control fired |
| sentence parity | `node tools/sentence-parity.mjs --dir dist-neo` | 349 pages, 13,966 sentences, **0 lost** (13,595 found, 363 source chrome, 8 declared, 3 whitespace-only), control fired |
| tag balance | `node tools/tag-balance.mjs --dir dist-neo` | 350 pages, **0 findings**, control fired |
| link check | `node tools/link-check.mjs --dir dist-neo` | 354 files, 20,789 local refs, **0 broken**, control fired |
| decontamination | `sr-decontaminate --project . --dir dist-neo --strict`; report copied to `tmp/qa-neo/fix/decontamination-dist-neo.json`; `git checkout -- audit/decontamination.json project.json` | **CLEAN**, 359 files, 0 / 0 / 0; after the restore `git status` shows neither file |
| robots + markup contract | `node tmp/neo/build/neo-audit.mjs dist-neo dist` | robots **0 mismatches** (census 83 / 122 / 137 / 7 + `404.html` noindex); markup **0 findings**; controls fired |
| fabrication-equivalent | `node tmp/qa-neo/fix/reg/fab-diff.mjs` (copy of `tmp/neo/int/fab-diff.mjs`, output moved) | 20 pages: neo-only strings "II", "III", "VII" only (the aria-hidden numerals, ledger N01), as before; control fired |
| overflow | `tmp/qa-neo/fix/reg/sweep.mjs --base http://127.0.0.1:8851 --root dist-neo --width W`, W = 320 / 390 / 768 / 1024 / 1440 | **0 overflowing pages** of 350 at each width, **0 JS errors**; control (a planted 600px block: 390 -> 600) fired |
| JS errors, drawer, reduced motion, inert form | `tmp/qa-neo/fix/reg/dod-browser.mjs --base http://127.0.0.1:8851` | E: **0** errors over 24 loads, drawer open + Escape 12 / 12, control fired; R: 0 pages with hidden content or `js-motion` (24 loads), control fired; F: the honest notice shown and focused, 0 non-GET requests |
| reveals, hover/keyboard parity | `tmp/qa-neo/fix/reg/behaviour.mjs --base http://127.0.0.1:8851` | A (reduced, 1440 / 390): no `js-motion`, 0 hidden, 0 pending, no `--py` / `--settle`, hover moves nothing; B (natural): 0 pending or invisible in view at load, after a scroll-through 0 pending / 0 invisible, End jump 0 pending above; C: **14 MATCH** of 15, the portico tile differs only in the designed two-tone focus ring (`box-shadow`, as in 7.2); D: 0 real errors on 6 pages, control caught |
| NG11 / NG19 | `tmp/qa-neo/fix/reg/ux.mjs --base http://127.0.0.1:8851` | NG11: 508 targets at 320 / 390, **0 under 44px**; NG19: 135 numbers, **0** in more than one line box; both controls fired |
| tel buttons | `tmp/qa-neo/fix/reg/telbtn.mjs` | 9 buttons at 320 / 390 / 1440: label 1 line box (0 on the home's number-only button), number 1 line box, arrow inside and clear of the number |
| NG9 first screen | `tmp/qa-neo/fix/ng9.mjs` (new, `ng9.final.json`) | 390 x 844: the 4 plates inside (lowest 739), the number visible; 1024 x 768: labels inside (lowest 700); 1440 x 900: labels inside (lowest 894); control (1024 x 600) fired |
| NG18 | `tmp/qa-neo/fix/home/ng18.mjs`, `ux.mjs` | **10,395px** at 390 (rest and natural, both probes); accepted value (8.1 VH3) |
| palette contrast | `tmp/qa-neo/fix/reg/neo-contrast.mjs` (copy of `tools/neo-contrast.mjs`, output moved) | 42 pairs, **0 failing**; `--control` adds a failing pair and exits 1 |
| rendered contrast | `tmp/qa-neo/fix/reg/contrast.mjs --base http://127.0.0.1:8851 --pages "/,/eye-care-services/,/eye-care-services/your-eye-health/how-the-eye-works/,/contact-us/appointment-request-form/,/hours-location/" --widths 390,1440 --out contrast-fix` (copy of the QA lens probe: force-settled, every step, 2nd-percentile ink) | 10 page x width runs, 1313 text and icon runs, **0 FAIL**; controls fired on every run (4.54 passes, 3.24 and 2.11 fail). The home's non-fail categories are as in the QA baseline (390: rect-only 2, decorative 6; 1440: rect-only 2, decorative 7): rect-only = glyph boxes of "EYE CARE CLINIC" under the coverage-gated bust (ink passes), decorative = the aria-hidden stars and patera |

### 8.4 Reproduce this section

```sh
node tools/serve.mjs --root dist-neo --port 8851 --no-open                                  # background; kill after
# per finding (copies of the refuters' probes, port 8851, outputs under tmp/qa-neo/fix/)
node tmp/qa-neo/fix/home/script.mjs --widths 1024,1100,1200,1280,1440,1680,1760,1920,2048,2560   # VH1
node tmp/qa-neo/fix/home/portico.mjs; node tmp/qa-neo/fix/ng9.mjs                           # VH2 + NG9
node tmp/qa-neo/fix/home/ng18.mjs                                                           # VH3, VH6
node tmp/qa-neo/fix/home/map.mjs; node tmp/qa-neo/fix/interior/map.mjs                     # VH4, VI-1
node tmp/qa-neo/fix/home/relief.mjs; node tmp/qa-neo/fix/home/hand.mjs                     # VH5, VH7
node tmp/qa-neo/fix/home/plaque.mjs; node tmp/qa-neo/fix/home/wraps2.mjs                   # VH8, VH9
node tmp/qa-neo/fix/interior/cut.mjs reduce; node tmp/qa-neo/fix/interior/band.mjs          # VI-2, VI-3
node tmp/qa-neo/fix/interior/upscale.mjs; node tmp/qa-neo/fix/interior/bust.mjs            # VI-4, VI-5
node tmp/qa-neo/fix/interior/doccard.mjs; node tmp/qa-neo/fix/interior/doccard-baseline.mjs # VI-6
MSYS_NO_PATHCONV=1 node tmp/qa-neo/fix/runtime/ra1-scroll.mjs --base http://127.0.0.1:8851 --out tmp/qa-neo/fix/runtime/ra1-scroll.after.json
node tmp/qa-neo/fix/obscure.mjs                                                             # RA-1 regression
MSYS_NO_PATHCONV=1 node tmp/qa-neo/fix/runtime/ra23-focus.mjs --base http://127.0.0.1:8851  # RA-2, RA-3
MSYS_NO_PATHCONV=1 node tmp/qa-neo/fix/runtime/ra45-framed.mjs --base http://127.0.0.1:8851 # RA-4, RA-5
for f in dist-neo/img/generated/neo-*.webp; do webpmux -get xmp $f -o - | grep -o '<xmp:CreatorTool>[^<]*'; done  # CSC-01
# regression: 8.3 (the int / gallery / contrast probes are copied to tmp/qa-neo/fix/reg/ with port 8851)
```

## 9. Operator revision of the home (asked 2026-09-29 21:14, verified and published 2026-09-30)

Request: "on the hero section, remove the girl altogether ... move the Email us and Schedule an appointment buttons on
the left side of the head bust and align all the buttons so there are 4 buttons across the whole hero section ... in
the happy patients section, make sure all the text box are the same size for all the reviews ... in the heretohelp
section, put the photo of Dr. Deana, it would be great if you can increase the quality of this photo".

Implemented on 2026-09-29 (21:15-21:28) in `src/themes/neo/home.mjs`, `images.mjs`, `styles/site.css`,
`scripts/site.js`, plus two theme-inert hooks in shared code: `src/build.mjs` ships `TI.ENHANCED` photos (null for
glass), and `src/lib/images.mjs` takes an optional IPTC source type that defaults to the old value. That session ended
during verification. It was resumed on 2026-09-30, and the full verification below ran on the final build.

### 9.1 What changed

| ask | result |
|---|---|
| remove the girl | The source hero photo is not rendered. It is declared in `home.mjs` (`declaredRemoved`), so the completeness check counts a decision, not a loss. The head no longer preloads an image: `build.mjs` preloads the hero photo only when the home renders it. The bust is the hero's only image (`fetchpriority="high"`). The page's LCP element is the hero's marble ground, a CSS background, at 1440, 1024 and 390 (`tmp/orch/resume/lcp.mjs`; a planted text-block control fires). |
| Email Us + Schedule left of the bust, 4 across | `home.mjs` sets the side from the label (`dock__tile--l` / `--r`) and orders the left pair first, so DOM and Tab order match the visual order. >= 1024: one row `[1][2] bust [4][5]`, straddling the seam by 30% of `--niche-h`. 700-1023: a pair of plaques in each bay. < 700: 2 x 2 plates under the bust; the stylobate frieze is hidden. |
| review boxes one size | The track stretches its slides (`align-items: stretch`), each card fills its slide, and the name sits on the base. Below 1024 the carousel `fit()` only clears a stale inline height; it used to size the track to the card in view, which clipped a taller card waiting off-screen. |
| Dr. Deana's photo, better quality | The live site has only a 225 x 397 copy (`assets/source/23fe4783-deana_GSP_UID_…png`). Four fal upscalers were run and each result scaled back to 225 x 397: `fal-ai/aura-sr` matched the original best (PSNR 38.31 dB, SSIM 0.9916; topaz 37.36 / 0.9797, recraft 35.07 / 0.9765, esrgan 34.73 / 0.9746; a 3px blur of the original scores 26.5). The build ships it as `img/deana-clifton-portrait.d95928dfed.webp`, 720 x 1271, 74,466 bytes, labelled `compositeWithTrainedAlgorithmicMedia` ("enhanced, not generated"). Provenance: `assets/enhanced/deana-clifton-aurasr-x4.json`; tool `tools/fal-upscale.mjs` (key via `FAL_KEY` or `--key-file` outside the project, refused inside it). |

### 9.2 Found when the revision was verified (2026-09-30), fixed in `styles/site.css`

| # | defect (R1-R3 measured on the 2026-09-29 build `94f66deb…`, R4-R5 on `e2e9f235…`) | fix | after (final `9844142e…`) |
|---|---|---|---|
| R1 | A second person's hair along the photo's right edge still showed at 390 (2x capture). The photo is narrower than the arch (0.57 vs 0.76), so `cover` crops only top and bottom, and the old comment "drops the sliver" was false. The hair reaches 2.7% in from the edge (pixel strip of the 900 x 1588 upscale). | The `<img>` box is 106% wide, anchored left; the frame clips the right 5.7%. | no trace at 1440 x 2 or 390 x 2 (`tmp/orch/resume/final/portrait-pair.png`); the refuter (on `e2e9f235…`; the portrait rules have not changed since): the visible photo is the left 94.34% of the file at every width, the hair starts at columns 684-708 of 720, 0 dark edge pixels shipped vs 2,093 with the crop removed (its control) |
| R2 | From 1024 the Q&A plate (pulled left by `clamp(24px, 3vw, 48px)`) covered the right ~15% of the portrait and its arch (43px of 290 at 1440). | `--qa-pull` on `.help__grid`, portrait `margin-right: calc(var(--qa-pull) + 36px)`; the plate is unchanged. | the whole arch visible at 1920, 1440, 1280 and 1024 (`tmp/orch/resume/final/sheet-h.png`); 36px from the plate and 27px from its outer rule (refuter, on `e2e9f235…`) |
| R3 | The niche labels ran into the niche's padding and base. At 1024 "Order Contacts Online" took 3 lines, clear -14px. At 1200 / 1280 / 1366 the 2-line labels were clear -19 / -16 / -5px; at 1200 the label box ended 3px into the green base. `height: var(--niche-h)` (150-164px) was less than the ~169px a 2-line label needs. | `min-height: var(--niche-h)`. The row stretches all four to one size, and the dock is end-aligned, so the extra height grows upward. | clear >= 0 at 1024-1920 (10 widths), four equal niches per width, one row, Email + Schedule left of the bust centre, no bust overlap (`tmp/orch/resume/dock.after.txt`; a control label forced to 40px wraps). Script-to-niche gap >= 88px (`scriptgap.mjs`). |
| R4 | (independent refuter) Below 1024 the lower tiles now cross the seam, and the hero's light focus outline alone (`--focus-on-dark`, 3px) measured 1.14-1.22:1 on the marble below it (390, 768). | The two-tone ring (outline `green-700` 3px at 5px offset over a 5px `--focus-on-dark` band) at every width, with each variant's own shadow. | the refuter's `keys.mjs`: all four tiles at 1440, 1100, 768 and 390 show outline `rgb(68, 102, 0)` 3px / 5px plus the band; `green-700` on marble about 5.9:1, the band on the dark ground about 12.3:1 (`tmp/orch/resume/final/focus-after.png`) |
| R5 | (independent refuter) The hero frame's bottom corner stars, centred on the seam, touched the outer tiles: -1 / -1 / -0.4px at 320 / 390 / 414, 7 / 3 / 5.7px at 600 / 700 / 768. | Not drawn below 1024. | the refuter's `corner.mjs` with `e2e9f235…` served as the regression control: the control reproduces every gap, the final build draws no bottom star below 1024; `stars.mjs`: all four stars drawn from 1024 |

Also corrected: comments and docs that called the bust "the hero's LCP" (see 9.1).

**Recorded, not changed (F1, the operator's decision):** with the four niches in one row on the seam, no quick-action
label lies inside the first screen at common laptop viewports: 1280 x 720, 1366 x 768, 1536 x 864 and 1024 x 600
(label bottoms 793 / 831 / 864 / 701-721px). Before the revision the right-bay 2 x 2 showed two of the four there. NG9
(390 x 844, 1024 x 768, 1440 x 900) passes, and at 1440 x 900 all four tiles are now fully in view, where two were
before. The top bar's "Make an Appointment" and "Call Us" are visible at every size. A browser's own toolbars make the
viewport shorter still (not measured). A `(min-width: 1024px) and (max-height: ~880px)` rule that trims the hero by
at least 84px at 1280 x 720 would lift the row; it is not built, pending the operator (evidence:
`tmp/orch/refuter/fold.json`, `sheet-fold-1366.png`).

### 9.3 Verification (final `dist-neo` `9844142ea6f6…`, 668 files; every check ran on it)

| gate | command | result |
|---|---|---|
| build | `CEC_THEME=neo node src/build.mjs` | exit 0, 349 + `404.html`, 0 build failures, generated slots 249 / 17 (unchanged) |
| reproducible | `CEC_THEME=neo CEC_DIST=tmp/orch/resume/repro-a` and `-b`, `hashdir.mjs repro-a repro-b dist-neo --control` | IDENTICAL `9844142ea6f66d4da56dba8eaf201845f166f6b4b7c4aaaf57cd1d7674f24854` (all three), control fired |
| glass guard | `CEC_DIST=tmp/orch/resume/guard node src/build.mjs`, `hashdir.mjs … dist --control` | IDENTICAL `40fc4155bf35c699e61e70a3019cc544f4cc859c6c6bff343261c5269ca1a885`, 665 files, control fired |
| changed files | `diff -rq` against the committed `dist-neo` (`39fa000c…`, kept as `tmp/neo-prev/`) | `index.html`, `styles/site.css`, `scripts/site.js`, `img/deana-clifton-portrait.d95928dfed.webp` added, `img/girl-smiling-brown-hair-1280x853.f515b43d5d.webp` removed |
| sentence parity | `node tools/sentence-parity.mjs --dir dist-neo` | 13,966 sentences, 0 lost, control fired |
| tag balance / links | `tools/tag-balance.mjs`, `tools/link-check.mjs` `--dir dist-neo` | 0 findings of 350 pages; 0 broken of 20,788 local refs; controls fired |
| robots + markup | `node tmp/neo/build/neo-audit.mjs dist-neo dist` | 0 mismatches, 0 markup findings, controls fired |
| fabrication-equivalent | `node tmp/qa-neo/fix/reg/fab-diff.mjs` | neo-only strings "II", "III", "VII" (as before) and the portrait's alt "Dr. Deana Clifton, OD", which is the live site's own (`audit/raw/our-eye-doctors.html`, `team-dr-deana-clifton-od.html`); control fired |
| decontamination | `sr-decontaminate --project . --dir dist-neo --strict`, audit files restored | CLEAN 0 / 0 / 0 |
| AI labels | `webpmux -get xmp` | portrait `compositeWithTrainedAlgorithmicMedia`; 20 of 20 generated images `trainedAlgorithmicMedia` |
| home-only change | `grep -l` in `dist-neo` | `dock--portico`, `rev-track`, `help__portrait`, `help__grid`, `data-carousel` each on 1 page (the home) |
| **browser suite** | `bash tmp/orch/resume/verify-final.sh`, strictly sequential | The rows below ran on `e2e9f235…`, which differs from the final build only by the two home-only rules of R4 and R5 (a focus ring and two hidden ornaments; no layout change). The same suite re-ran on the final `9844142e…` (log `tmp/orch/resume/verify-final.log`; the `e2e9f235…` run is kept as `verify-final.e2e9f235.log`). |
| overflow | `sweep.mjs --width W`, W = 320 / 390 / 768 / 1024 / 1440 | 0 overflowing pages of 350 at each width, 0 JS errors; control (a planted 600px block: 390 -> 600) fired |
| JS errors, drawer, reduced motion, inert form | `dod-browser.mjs` | E: 0 errors over 24 loads, drawer open + Escape 12 / 12, control fired; R: 0 pages with hidden content or `js-motion` (24 loads), control fired; F: the notice shown and focused, 0 non-GET requests |
| reveals, hover/keyboard parity | `behaviour.mjs` | A (reduced, 1440 / 390): no `js-motion`, 0 hidden, 0 pending, hover moves nothing; B (natural): 0 pending or invisible in view at load, 0 / 0 after a scroll-through, End jump 0 pending above; C: 14 MATCH of 15, the portico tile differing only in the designed two-tone ring (as in 8.3); D: 0 errors on 6 pages, control caught |
| NG11 / NG19 | `ux.mjs` | 508 targets at 320 / 390, 0 under 44px; 135 numbers, 0 in more than one line box; controls fired |
| tel buttons | `telbtn.mjs` | 9 buttons at 320 / 390 / 1440: label 1 line box (0 on the home's number-only button), number 1, arrow inside and clear of the number |
| RA-1 | `obscure.mjs` | PASS 10 cases (Tab, Shift+Tab and anchor jumps land below the sticky header at 1440 and 390); control fired |
| rendered contrast | `MSYS_NO_PATHCONV=1 contrast.mjs --pages / --widths 390,1440` | home 390: 214 runs, 0 FAIL; 1440: 225 runs, 0 FAIL; controls fired (4.54 passes, 3.24 and 2.11 fail); rect-only 2, decorative 4 / 5 (was 6 / 7: the patera niche is now the portrait) |
| palette contrast | `neo-contrast.mjs` | 42 pairs, 0 failing, controls fired |
| NG9 first screen | `tmp/orch/resume/ng9r.mjs` | 390 x 844: the 4 plates inside (lowest 745), the number visible; 1024 x 768: labels inside (lowest 720); 1440 x 900: labels inside (lowest 864, was 894), the bust wholly inside; control (1024 x 600) fired |
| NG18 | `tmp/orch/resume/ng18r.mjs` | 10,244px at 390 (was 10,395), the same at rest and after a natural scroll-through; 414: 10,182, 360: 10,480, 320: 11,003 |
| hero tiles | `tmp/orch/resume/dock.mjs` | as 9.2 R3; control fired |
| VH1 script vs bust | `tmp/qa-neo/fix/home/script.mjs`, 1024-2560 | glyph gap >= 59.8px at every width; control (the script shifted 300px) 0.4 |
| LCP | `tmp/orch/resume/lcp.mjs` | `div.deco--dark` (the hero's marble ground) at 1440, 1024 and 390; control (a planted text block) fired |
| independent refuter | one agent, read-only, its own Chrome profile, briefed with the change set | 3 findings, all new against the pre-change build: R4 and R5 (fixed, above) and F1 (recorded, above). Everything else it attacked held: 22 widths with no overflow, Tab order, hover vs focus, equal review cards, the carousel buttons and track height, the portrait crop at 6 widths at DPR 2, reveals under both motion settings; each "never happens" claim shown able to fire (`tmp/orch/refuter/`) |

### 9.4 Reproduce

```sh
node tools/serve.mjs --root dist-neo --port 8851 --no-open        # background; kill after
bash tmp/orch/resume/verify-final.sh                               # the browser suite, strictly sequential (log: verify-final.log)
node tmp/orch/resume/cap.mjs --widths 1440,390 --sel ".help__portrait" --dpr 2 --out tmp/orch/resume/after
node tmp/orch/resume/dock.mjs; node tmp/orch/resume/scriptgap.mjs; node tmp/orch/resume/lcp.mjs
```

The `tmp/qa-neo/fix/reg/*` probes (and `tmp/qa-neo/fix/{ng9,obscure}.mjs`) pin one Chrome profile each, so never run
two of them at once. A second launch attaches to the first one's browser and closes it on exit. That showed up here as
sweeps exiting 13 with no output and a focus-parity DIFF; those runs were discarded and re-run alone. `ng9.mjs` and
`home/ng18.mjs` read the removed photo and the replaced niche (`ng18.mjs` then exits 0 silently), so this round ran
revision-aware copies, `tmp/orch/resume/ng9r.mjs` and `ng18r.mjs`.
