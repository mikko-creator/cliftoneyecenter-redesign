# Neo spec: Clifton Eye Center, neoclassical theme ("Temple")

Status: **build spec**, 2026-09-29. This is the single design document the neoclassical build implements across all
349 pages. It is a **second theme built beside the shipped glass one** ("Daylight Canopy", `docs/DESIGN-SPEC.md`),
not a replacement. `CEC_THEME=neo node src/build.mjs` builds it from `src/themes/neo/` and `assets/fonts/neo/` into
`dist-neo/` through the same content, SEO, forms and image pipeline (`src/build.mjs` lines 30-40).

Precedence: `docs/DESIGN-BRIEF.md` bylaws and the binding rules of `docs/NEO-BRIEF.md` ("MUST" and "never") > this
file for the neo **look, markup additions and image slots** > `docs/COMPONENTS.md` for everything this file does not
change (landmarks, slots, `data-*` hooks, ledgered behaviour L01-L23). Where this file departs from the brief, section
7.3 says so and why. Evidence this spec relies on and does not repeat: NEO-BRIEF 2 (palette and the 42 gated pairs),
3 (faces and scale), 4 (ornament kit), 5 (image classes), 6 (planes and motion vocabulary);
`docs/IMAGE-PLAN-NEO.md` (the 12 reviewed neo images and their caveats).

The operator's request (2026-09-29): explore a **Neoclassical** style instead of more glassmorphism, and **keep the
brand colours and the layering of images** (images crossing sections, breaking out of frames, cut-outs over other
elements) so the brand tone and the depth survive. The moodboard `tmp/neo/reference-moodboard.png` is a third-party
reference: only its traits are used (NEO-BRIEF 1.1). No poster, artwork, statue, word or lockup from it appears here.

---

## 0. Winner

**Winner: `temple`** (3 of 3 judge votes; summed totals temple 122, gallery 113, poster 108).
It is the most unmistakably neoclassical of the three labs (pediment, pilasters, arched niches, stelae, a pediment
footer, all on a strict central axis) while it keeps the exact brand tokens, the `#759b2a` strip and the most brand-green
surface of the three. It also has the richest and best-documented depth (the N0-N5 plane model, figures and niches
crossing four seams), and its stele, arch and pediment patterns carry directly to the 349 interior pages.

### 0.1 Lab files to lift from (read-only; copy, then change as this spec says)

| what | file | lines | change on lift |
|---|---|---|---|
| tokens, base | `tmp/lab-neo/temple/lab.css` | 10-88 | rename the families (2.2); textures become the baked grounds (2.7) |
| N0 grounds, grain | same | 90-98 | `.deco--*::before` uses `var(--n-ground-*)` at opacity 1 (2.7) |
| ornament kit, engraved underline | same | 100-143 | none |
| top strip plaques | same | 145-158 | selector `.plaque` becomes `.band-pill` (COMPONENTS B.1 markup) |
| header split nav, round buttons, progress | same | 160-202 | add the scrolled actions (3.2) |
| drawer | same | 204-217 | `[data-open]` becomes the `hidden` + `data-drawer` contract (COMPONENTS 1) |
| plates, section heads, buttons | same | 219-258 | none |
| arch frame | same | 260-265 | none |
| hero temple front | same | 267-431 | recomposed per 3.3 (photo arch, 2x2 portico, phone plates, pedestal) |
| welcome | same | 433-491 | the sidebar layout of 3.7 replaces the triptych (473-487) and the CSS columns |
| services arcade | same | 494-529 | none, plus the seam relief (3.6) |
| reviews band | same | 531-568 | light stelae, left-aligned roman quotes, carousel below 1024 (3.8) |
| #HeretoHelp Q&A plate, rosette summary | same | 570-609 | centred head, CSS niche, no generated image (3.9) |
| designer band and plates | same | 611-634 | pilaster brackets, wall-label names (3.10) |
| visit | same | 636-684 | real map in a map plate, column, medallion (3.11) |
| footer | same | 686-730 | both link columns left-aligned (3.12) |
| reveals, reduced motion | same | 747-759 | `up` alias, release timings (5) |
| scroll-linked (parallax, settle, progress, header) | `tmp/lab-neo/temple/lab.js` | 13-70 | none |
| reveals (IO, release, fail-safe) | same | 72-108 | add the scrolled-past release (5.2 trap 7) |
| hours highlight | same | 139-145 | none |
| drawer | glass `src/scripts/site.js` | drawer block | the COMPONENTS 1 contract, not temple 110-137 |
| head script (`js-motion` before paint) | glass `src/lib/templates.mjs` | 45-47 | none |
| home markup and verbatim copy | `tmp/lab-neo/temple/index.html` | 120-416 | restructured per 3.3-3.11; glass class names (3.25) |
| graft: phone number nowrap | `tmp/lab-neo/gallery/lab.css` | 181 | applied to every visible number (3.0) |
| graft: hand resting on the What's New frame | same | 383-390 | baked T3 image instead of `filter: url()` |
| graft: wall-label plaque | same | 455-462 | used for designer names (3.10) |
| graft: laurel sprigs flanking #HappyPatients | same | 500-510 | colour green-400 on the dark band |
| graft: Visit three planes (map, column, NAP plate), NAP badge turn | same | 602-630 | real iframe; the column never covers it (3.11) |
| graft: release reveals already scrolled past | `tmp/lab-neo/gallery/lab.js` | 71-80 | none |
| graft: script over the title | `tmp/lab-neo/poster/lab.css` | 139-141, 409-412 | text-shadow halo instead of `-webkit-text-stroke` (3.3) |
| graft: phone hero (bust beside script, 2x2 plates over its base) | same | 129-160 | marble plates (3.4) |
| graft: pilaster brackets | same | 441-443 | on the `#759b2a` band (3.10) |
| graft: welcome sidebar (aside + article) | same | 376-381, 426-432 | single-column article, no `columns` (3.7) |
| graft: family token rename (`--n-face-script`) | same | 18, 31 | all three families renamed (2.2) |
| probes | `tmp/lab-neo/temple/work/` | `coverage.mjs`, `contrast-probe.mjs`, `measure.mjs`, `bisect-overflow.mjs`, `hover-focus.mjs`, `copy-parity.mjs`, `motion-check.mjs`, `targets-control.mjs` | point them at `dist-neo/` over http; fix `hover-focus.mjs` (7.2 #20) |
| probes | `tmp/lab-neo/poster/_tools/` | `script-overlap.mjs`, `ornament-overlap.mjs`, `reveal-flake.mjs` | same |
| probe | `tmp/lab-neo/gallery/_tools/pending.mjs`, `tmp/lab-neo/_judge-ux/ux-probe.mjs` | whole files | fold, persistent CTA, number wraps (gate NG9, NG19) |

### 0.2 Where the theme lives, and the build hooks it needs

New files (the build already loads them by path, `src/build.mjs` 35-37):

| file | contents |
|---|---|
| `src/themes/neo/templates.mjs` | exports `createTemplates`, `icon`, `isoDate` (plus `ICON_NAMES`, `SPRITE`), with the **same `T` API** as `src/lib/templates.mjs`: `head topbar header drawer footer dock hours aside band rail indexCards postCards reviewCard ctaBand docCards teamCard visit accordion payRow page mapEmbed` (glass line 429) |
| `src/themes/neo/home.mjs` | `buildHome(ctx)` under the unchanged HOME CONTRACT (COMPONENTS G.1) |
| `src/themes/neo/styles/tokens.css` | first comment contains `REDESIGN TOKENS` (the build ships a layered file only from its marker, `src/build.mjs` 930-948) |
| `src/themes/neo/styles/site.css` | every component |
| `src/themes/neo/styles/motion.css` | first comment contains `@redesign-motion` |
| `src/themes/neo/scripts/site.js` | the COMPONENTS 1 hook contract plus the neo hooks (3.25) |
| `src/themes/neo/images.mjs` | the neo image map (6.3) and derivative recipes (2.10), read only by the three hooks below |

Do **not** add `src/themes/neo/styles/fonts.css`: it would replace `assets/fonts/neo/fonts.css` (NEO-BRIEF 3.1).

**Build hooks** (in `src/build.mjs`, each guarded by `THEME !== 'glass'`; the glass branch stays byte-identical, gate
NG17). The pipeline itself (`src/lib/content.mjs`, `forms.mjs`, `seo.mjs`, `images.mjs`) is not touched.
1. **Image map.** Take `bandPlan`, the cut-out prefix table and the 404 cut-out from `src/themes/neo/images.mjs`
   instead of the inline glass tables (`src/build.mjs` 342-379: `CUTS`, `PHOTO_PAGES`, `bandPlan`; and the
   `'cut-lens-prism'` literal at 747). The `SVC` feature table (353-360) stays shared. The same
   `useGen` exclusions (brand names, "Dr. Clifton", "Deana", "Ask Dr.", brand logos in main) apply unchanged.
2. **Derivatives.** Before `genImages.web`, bake every id that has a recipe in `images.mjs` `DERIVE` with ffmpeg into
   `tmp/build-cache/derived/`, cached by source hash plus recipe, exactly as the `tex-frosted-glass` derivative is made
   (`src/build.mjs` 146-172). The AI label says "(tone-mapped and resized by the build)". `genFor`, `useGen` and
   `ctx.gen` then return the derivative, so templates never see a raw file.
3. **Grounds.** Bake the three pre-composited grounds (2.7) and append
   `:root { --n-ground-light: url(...); --n-ground-dark: url(...); --n-ground-deep: url(...) }` to the shipped
   `tokens.css`, as the build appends `--tex-frost` (`src/build.mjs` 949-953). The CSS integrity check (`src/build.mjs`
   959-974) then finds them defined.
4. Because `REPORTS` is glass-only (`src/build.mjs` 40), the neo build writes its slot log to
   `tmp/neo/build/image-slots.json` so gate NG14 has a record.

---

## 1. Concept: "Temple"

A community clinic built like a small civic temple: a **pediment and a pair of pilasters frame the practice's own
words**, a **carved marble bust wearing modern spectacles stands in the cella and breaks the title**, and the **real
people stay in colour** in round-headed arches beside it. The deep ground is not black but a **green-black** mixed from
the brand's darkest green and ink, and daylight marble carries everything that is read. Green leads on every screen:
the `#759b2a` strip, green rules, numerals, meanders, the `#759b2a` designer band and the green script "We Know You!",
which is the smile against the capitals.

Why it keeps the brand: every colour is a brand token or an sRGB mix of two (2.1); the logo files are used as they are;
the copy is verbatim; the tone rules of NEO-BRIEF 1.3 hold (daylight dominates interior pages, people in colour, the
script as the warm accent, no mourning iconography, no gold).

Why it keeps the depth: the glass build's layering survives as **architecture**. Six planes (N0-N5, 2.8) replace the
glass P0-P4. Figures and frames cross **four home seams** (hero to Welcome, Welcome to Services, Services to reviews,
the designer band to Visit), Visit stacks three planes, arches rise out of their plinth plates, the What's New plate carries
a marble hand on its frame, and every interior title band stands a carved figure in a dark arched niche that breaks its
frame and crosses the band's edge.

Motif rules (from the judges' findings):
- **One statue per page leads.** Home: the glasses bust. Interior: at most one cut-out in the title band (6.3).
- **Arches frame people and scenes; plates carry text.** Text is never on a photograph or a statue (NEO-BRIEF 2.5).
- **One script phrase per page:** "We Know You!" on the home hero. "in Bossier City, Louisiana" is a serif line
  (7.2 #6).
- **Numerals are ornament:** `aria-hidden` I-VII on the home sections only.
- **No generated image in a section whose own text names a brand, "Dr. Clifton", "Deana" or "Ask Dr."** (6.1).

---

## 2. Tokens

### 2.1 Palette and allowed text pairs

Core brand tokens: verbatim from `src/styles/tokens.css` (re-read 2026-09-29: `--green-50` `#f8faf2` to `--green-950`
`#141f00`, anchors `--green-400` `#94bc4a` and `--green-500` `#759b2a`; `--ink-950`..`--ink-50` with body
`--ink-700` `#464451`; `--slate-700` `#36565e`, `--slate-900` `#1d2e33`; `--paper` `#ffffff`, `--ground` `#fafcf6`,
`--stone` `#efefef`; `--alert` `#941221`, `--alert-50` `#f8eeef`; `--focus` `#446600`, `--focus-on-band` `#141f00`,
`--focus-on-dark` `#d4e4b7`; `--sunlight` `#fffbe9`). Neo additions: NEO-BRIEF 2.2 verbatim (`--marble-50` `#f7f5ec`,
`--marble-100` `#eeece4`, `--marble-200` `#e2e0d9`, `--marble-300` `#c9c7c4`, `--marble-400` `#a2a0a2`, `--poster`
`#1b2012`, `--poster-deep` `#11140b`, `--poster-2` `#1e280b`). **No other colour is added.** Surface roles: NEO-BRIEF
2.3.

**The only text pairs this build uses** (worst case over the listed surfaces, from NEO-BRIEF 2.4 and
`tmp/neo/brief/neo-contrast.json`; thresholds body 4.5, large 3.0, UI 3.0; the script is held to 4.5). Anything not
in this table needs a new `tools/neo-contrast.mjs` pair first.

| where | text or UI colour | on | worst ratio | use |
|---|---|---|---|---|
| prose, answers, reviews on light plates | `ink-700` | light (paper, marble-50/100/200, green-50/100, textured marble-50) | 7.07 | body |
| strong, h4-h6, table heads, nav, labels, quick-action labels | `ink-900` | light | 9.67 | body |
| secondary, captions, form help, breadcrumb separator | `ink-600` | light | 5.02 | body |
| h1, h2, poster words on light | `poster` / `slate-900` | light | 12.36 / 10.46 | display |
| section headings (Services title, h3, offer heading) | `slate-700` | light | 5.89 | display, h3 |
| links, eyebrows, meta caps, dates, attribution | `green-700` | light | 4.96 | body |
| link hover, current nav, phone links | `green-800` | light | 7.49 | body |
| numerals, `#` of a tag title on light | `green-600` | light | 3.93 | large only (24px+) |
| emergency heading, required marks | `alert` | light | 6.59 | body |
| poster lines, tag titles, footer links on dark | `marble-50` / `paper` | dark (poster, poster-deep, poster-2, textured) | 9.87 / 10.78 | any |
| footer NAP, secondary on dark | `green-200` | dark | 8.55 | body |
| legal row, muted on dark | `ink-200` | dark | 7.02 | body |
| footer headings (meta caps), links on dark | `green-300` | dark | 6.71 | body |
| **script "We Know You!"**, numerals, `#` on dark | `green-400` | dark | 4.90 | held to 4.5 |
| top strip, designer title, band numeral | `green-950` / `poster` | `#759b2a` | 5.29 / 5.13 | any |
| CTA band text / accent | `paper` / `green-300` | `green-800` | 10.08 / 6.28 | any |
| primary button, primary quick action | `paper` | `green-700` | 6.67 | any |
| emergency tile / alert button | `paper` on `alert` / `alert` on `paper` | | 8.87 | any |
| error line | `alert` | `alert-50` | 7.80 (DESIGN-SPEC 3.20) | body |
| focus ring | `green-700` / `focus-on-dark` / `green-950` | light / dark, green-800, green-700 / the `#759b2a` band | 4.96 / 4.95 / 5.29 | UI |
| only boundary of a control (inputs, round buttons) | `ink-500` / `green-300` | light / dark | 4.00 / 6.71 | UI |
| meaningful icons, stars, the accordion rosette | `green-600` / `green-400` | light / dark | 3.93 / 4.90 | UI |

Banned (NEO-BRIEF 2.6, kept): `ink-500` as text; `green-600` small text on light; `#759b2a` as text on light or small
text on dark; `green-400` on light; white on `#94bc4a`; alert text on poster; any text over the verdigris or marble
ramps or over T5 (2.10); `green-900` text (not in the matrix: today's hours row uses `ink-900`, 3.11).

### 2.2 Fonts

Self-hosted from `assets/fonts/neo/` (SIL OFL 1.1; the build copies the folder to `dist-neo/fonts/`,
`src/build.mjs` 924-926; `fonts.css` has 8 `@font-face` blocks with relative `url()`s, checked 2026-09-29).
- **Preload two** in `head()`: `fonts/NotoSerifDisplay-normal-latin.woff2` and `fonts/SourceSerif4-normal-latin.woff2`
  (`as="font" type="font/woff2" crossorigin`). The labs left them out only because `file://` blocks crossorigin
  preloads; the build is served over http.
- **Family tokens renamed** (the poster lab found that NEO-BRIEF 3.1's `--n-script` family collides with the 3.4 size
  token of the same name; taken literally, the script falls back to the display serif):
  `--n-face-display: "Noto Serif Display", "Times New Roman", Georgia, serif;`
  `--n-face-text: "Source Serif 4", Georgia, "Times New Roman", serif;`
  `--n-face-script: "Parisienne", "Segoe Script", cursive;`
  The size tokens keep the NEO-BRIEF 3.4 names, including `--n-script` (size). The temple CSS used `--n-script`
  (family) and `--n-script-fs` (size); both are renamed on lift.
- Settings (NEO-BRIEF 3.3): display `font-stretch: 62.5%` weight 500 for poster lines, tag titles and numerals (400);
  `font-stretch: 75%` weight 500 for h1, h2 and pull titles; never below 28px. Text face 400 body, 600 UI and meta
  caps and h3, 700 h4-h6 and `strong`, italic 400. Parisienne 400 for "We Know You!" only.
- Never re-subset or rename the files (Reserved Font Names "Source" and "Parisienne").

### 2.3 Type scale

NEO-BRIEF 3.4 verbatim (`--n-meta` 13-14, `--n-sm` 15-16, `--n-ui` 16-17, `--n-base` 17-19, `--n-lead` 19-23,
`--n-h4` 19-22, `--n-h3` 22-30, `--n-h2` 30-56, `--n-h1` 36-80, `--n-tag` 38-120, `--n-poster` 52-168, `--n-script`
34-76, `--n-numeral` 28-64, `--n-measure: 59ch`, line heights and tracking). Additions:

```css
:root {
  --n-h2-prose: clamp(1.75rem, 1.4rem + 1.2vw, 2.5rem);   /* 28 -> 40: h2 inside .prose and interior section titles */
  --n-hero: clamp(3.25rem, calc((100vw - 2 * var(--gutter) - 92px) / 9.2), 7.6rem); /* hero poster lines, >= 700 */
  --n-hero-phone: clamp(3.25rem, 15vw, 5rem);             /* hero poster lines, < 700 (temple 411) */
}
```

| role | face and setting | size | colour |
|---|---|---|---|
| hero poster lines | display 62.5% 500, caps, `--lh-poster`, `.02em` | `--n-hero` / `--n-hero-phone` | `marble-50` |
| tag titles `#HappyPatients`, `#HeretoHelp` | display 62.5% 500, caps | `--n-tag` | `marble-50` on dark, `poster` on light; `#` green-400 / green-600 |
| home h1 (Welcome) | display 75% 500, centred, the head spans the wrap | `--n-h1` | `poster` |
| "in Bossier City, Louisiana" | display 75% 500, block, `.62em` of the h1 | | `slate-700` |
| home h2 titles | display 75% 500 | `--n-h2` | `slate-900` / `slate-700` on green-100 / `poster` on the band |
| interior h1 (band) | display 75% 500, `--lh-h1`, max 22ch, `text-wrap: balance` | `--n-h1` | `poster` |
| prose h2, interior `.section-title` | display 75% 500 | `--n-h2-prose` | `slate-700` |
| h3 | text 600 | `--n-h3` | `slate-700` |
| h4-h6, card titles | text 700 | `--n-h4` | `ink-900` |
| body, answers, inputs | text 400, `--lh-body` | `--n-base` | `ink-700` |
| lead paragraph | text 400, 1.55 | `--n-lead` | `ink-900` |
| nav, buttons, labels | text 600 | `--n-ui` | per surface |
| meta caps (eyebrows, dates, attributions, footer headings) | text 600, caps, `.14em` | `--n-meta` | `green-700` / `green-300` |
| captions, breadcrumbs, legal, form help | text 400 | `--n-sm` | `ink-600` / `ink-200` |
| script | Parisienne 400 | `--n-script`; at 1024+ `clamp(2.5rem, 1.2rem + 2.4vw, 4.25rem)` | `green-400` on dark |

Rules kept from NEO-BRIEF 3.5: source casing in the DOM (capitals from CSS only); **no essential control label in meta
caps** (quick actions, service names, brand names, buttons and nav are `--n-ui` 600 or larger; the poster lab's
13-14px service labels and 12.5px medallion text are the defect this rule prevents); prose left-aligned at
`--n-measure`; lining figures for numbers. Container rule (NEO-BRIEF 3.4): a title in a narrower column is re-measured
(widest word em x size); the fix is a smaller clamp, never `overflow-wrap: anywhere`.

### 2.4 Spacing, layout, breakpoints

```css
:root {
  --s-1: 4px; --s-2: 8px; --s-3: 12px; --s-4: 16px; --s-5: 24px; --s-6: 32px;   /* glass scale (NEO-BRIEF 1.2) */
  --s-7: clamp(40px, 28px + 3vw, 64px);
  --n-sec: clamp(48px, 4.4vw, 72px);        /* section padding; phones 48px (was 56-120 in the lab) */
  --gutter: clamp(16px, 4vw, 56px);         /* 16px at 390 (temple 44) */
  --wrap: 1240px; --aside: 320px; --solo: 980px;
  --n-seam: clamp(40px, 8vw, 140px);        /* how far a home figure crosses a seam (NEO-BRIEF 5.5): 40/61/82/115 at 390/768/1024/1440 */
  --n-cross: clamp(24px, 5vw, 72px);        /* how far an interior band figure crosses the band edge */
}
```

| breakpoint | what changes |
|---|---|
| 320 | smallest QA width (new for neo): every gate runs here |
| 390 | phone QA width: fold gate NG9 |
| < 560 | small-phone offsets; the What's New hand and the laurel sprigs hide |
| < 700 | phone hero (bust beside the script, 2x2 plates over its base); parallax x .55; welcome stacked |
| < 720 | top strip shows the Call plaque only (L02) |
| 700-1023 | hero three bays: photo arch, bust, plaque list; the script sits under line 2, touching nothing |
| 768 | tablet QA width |
| 1024 | full nav; aside beside content; pilasters; the script crosses line 2; scrolled header shows "Make an appointment" |
| 1100 | welcome sidebar; Visit three-column plane composition with the column; the laurel medallion |
| 1200 | hero portico: 2x2 arched niches in the right bay, the lower row straddling the seam |
| 1280 | symmetric split nav (logo on the axis); scrolled header adds "Call" on the left |
| 1440 | desktop QA width |

### 2.5 Radii and arches

- `--r-arch: 999px 999px 0 0` (true semicircular head at any width up to 1998px; NEO-BRIEF 4.3). Arch proportion
  3:4 for photos, niches and the band niche; the promo arch 3:4; the service arches 3:4 at 72% of the card width.
- `--r-stele: 50% 50% 0 0 / 64px 64px 0 0` (segmental head) for review stelae and the NAP stele (temple 550-552, 651).
- Everything else is **square-cut** (radius 0): plates, sheets, buttons, inputs, logo chips, the emergency tile. Round:
  medallions, round buttons, the smile portraits, the social button (50%).
- Outer fine rule: `::before` at `inset: -8px -8px 0` with the same radius (concentric), keystone `::after` 12 x 9
  trapezoid at the crown. Plinth: a plate under an arch is 6px thicker at its base (`border-bottom: 6px solid
  var(--green-700)`), the "wall and plinth" rhythm of NEO-BRIEF 1.2.

### 2.6 Elevation and figure light

One light source for the whole site: **upper left**. Every shadow falls down and right.

```css
:root {
  --n-e-plate: 0 20px 30px -24px rgb(17 20 11 / .45);   /* plates, sheets, cards */
  --n-e-lift:  0 26px 36px -22px rgb(17 20 11 / .50);   /* hover and focus lift */
  --n-e-hang:  0 26px 40px -26px rgb(17 20 11 / .55);   /* plates hanging across a band edge, niches */
  --n-drop-dark:  drop-shadow(14px 30px 36px rgb(0 0 0 / .45));                 /* a figure on a dark ground */
  --n-drop-light: drop-shadow(10px 18px 20px rgb(17 20 11 / .32)) drop-shadow(0 0 1px rgb(17 20 11 / .40)); /* on light */
}
```

A statue that stands on something gets a **contact shadow**: a `radial-gradient(ellipse 50% 40% at 50% 0%,
rgb(0 0 0 / .45), transparent)` strip 18px tall on the top face of what it stands on (the craft judge's pedestal
finding).

### 2.7 Grounds, texture and grain (N0 only)

The labs painted the marble texture as a full-size JPEG under a runtime opacity. The build instead bakes each textured
ground **once**, pre-composited at its cap, and CSS paints it opaque:

| token (set by build hook 3) | recipe (ffmpeg, 1600 x 893, then cwebp q60) | bytes (measured) | used on |
|---|---|---|---|
| `--n-ground-light` | `neo-tex-marble-light` at **18%** over `--marble-50` | 7,640 | marble sections, interior page ground, title bands |
| `--n-ground-dark` | `neo-tex-marble-dark` at **14%** over `--poster` | 12,062 | hero, #HappyPatients band, the #HeretoHelp niche |
| `--n-ground-deep` | `neo-tex-marble-dark` at **10%** over `--poster-deep` | not measured (same recipe) | footer |

Evidence (`tmp/neo/spec/pct.mjs`, texture only, before grain; controls white/black 21.00 and `#767676`/white 4.54):
light ground 2nd-percentile luminance 0.8149, so `green-700` reads 5.50 and `ink-600` 5.56 against it; dark ground
98th percentile 0.0254, so `green-400` reads 6.33 and `marble-50` 12.75. Both are above the NEO-BRIEF 2.4 worst cases,
which model the grain too. The **darkest single light-ground pixel** is `#cac6c1` (L 0.5679), a vein; the rendered
probe (NG2), which reads the 2nd-percentile pixel under each text run, stays the gate. The caps are NEO-BRIEF 2.5
(light 20% or less, dark 15% or less).

- `background: var(--marble-50) var(--n-ground-light) center / cover` on `.deco--light::before`; the flat colour is the
  fallback while the image loads. Interior pages: one fixed `div.ground` (new, 3.25) behind `div.page`.
- **Grain** stays a CSS layer on N0 only (`.deco::after`, temple 94-98): ink specks at .05 on light (cap .06), white
  specks at .045 on dark (cap .05), 180px SVG noise tile (temple 56-57). Never on plates (NEO-BRIEF 2.6).
- Meander: the CSS mask of NEO-BRIEF 4.1 with the `-webkit-mask` prefix; where masks are unsupported,
  `@supports not ((mask: url("")) or (-webkit-mask: url("")))` draws a 4px double rule instead.

### 2.8 Planes and stacking

| plane | z | lives there |
|---|---|---|
| N0 ground | 0 | `.deco` (baked ground + grain), meander runs, `div.ground` (interior) |
| N1 frieze | 1 | poster lines, tag titles, band h1, pediments, pilasters, arch frames and the photos inside them, the band niche and its scene, the map plate, the #HeretoHelp niche |
| N2 statue | 2 | cut-outs, the pedestal, the smile medallions, the laurel medallion ring, parts of framed photos that cross a seam |
| N3 plate | 3 | plates, sheets, the quick-action niches and plates, stelae, the Q&A plate, forms, logo chips, the aside cards |
| N4 relief | 4 | a figure lying on a plate's **ornamental** edge only: the What's New hand, the magnifier on the map ledge, the NAP medallion |
| N5 chrome | 50-100 | top strip 60, sticky header 55, progress rule (inside the header), scrim 80, drawer 90, skip link 200 |

**Section stacking (temple's model, kept):** sections are `position: relative` with **no z-index and no isolation**,
so they never form stacking contexts. Every `.wrap` is `z-index: 3`, and tree order decides between sections: a figure
that crosses a seam paints over the next section's ground (N0) but **under** the next section's plates, so a crossing
figure never covers text (NEO-BRIEF 5.5). A section-level group that must paint over the previous section's wrap (the
smile medallions crossing up into Services) takes `z-index: 4`. Protrusions need `overflow: visible` on every ancestor
up to the section; only `.deco` clips.

### 2.9 Motion tokens

NEO-BRIEF 6.3 verbatim: `--n-ease: cubic-bezier(.22,.61,.36,1)`, `--ease-out: cubic-bezier(.16,1,.3,1)`,
`--n-t-hover: .45s`, `--n-t-rise: 1.1s`, `--n-t-arch: 1.3s`, `--n-t-settle: 1.6s`, `--n-stagger: 120ms`.

### 2.10 Image treatments and the baked recipes

| class | treatment | recipe (ffmpeg `-vf`, then cwebp) | applies to |
|---|---|---|---|
| T0 untouched | original pixels | resize only, never upscaled | logos, brand campaign images, the QR code (copied byte-identical), diagrams, article images, Dr. Clifton's portrait, section-index tiles, the 404 illustration, **`neo-cut-magnifier` and `neo-cut-laurel`** (an instrument and a patinated wreath, not stone: they keep their colour, IMAGE-PLAN-NEO 3.2 and NEO-BRIEF 5.1) |
| T1 natural colour, classical frame | arch, medallion or fine double frame | resize only | people photos: the hero woman, promo, service tiles, smile portraits, band photos |
| T2 duo-night (text-safe) | `--poster-deep` to `--green-600` | `format=gray,format=rgb24,lutrgb=r='17+val*66/255':g='20+val*98/255':b='11+val*2/255'` | reserved: only if a backdrop ever carries text (none in this spec) |
| T3 duo-marble | `--ink-950` to `--marble-50`, alpha kept | `format=rgba,colorchannelmixer=rr=.2126:rg=.7152:rb=.0722:gr=.2126:gg=.7152:gb=.0722:br=.2126:bg=.7152:bb=.0722,lutrgb=r='35+val*212/255':g='34+val*211/255':b='41+val*195/255':a=val` | the busts, the hand, the eye relief, the column |
| T4 duo-verdigris | `--poster` to `--green-300` | as NEO-BRIEF 5.2 | not used |
| **T5 duo-niche (new)** | tritone `--poster-deep`, `--green-800` at 63%, `--marble-400`, after a 1.8 gamma | `format=gray,lut=y='255*pow(val/255,1.8)',format=rgb24,lutrgb=r='if(lt(val,160),17+val*32/160,49+(val-160)*113/95)':g='if(lt(val,160),20+val*53/160,73+(val-160)*87/95)':b='if(lt(val,160),11-val*11/160,(val-160)*162/95)'` | scenes inside arched niches (the three `neo-scene-*`). **No text on T5** |

Why T5: the judges found the colonnade in duo-night "a flat, saturated green-600 slab" (all three). The source scenes
are mostly near-white stone, so any two-stop ramp maps them onto its highlight colour. A gamma plus a third stop gives
the stone back its modelling (dark green shadows, grey-marble light). Evidence: `tmp/neo/spec/ramps-colonnade.png`
(five two-stop ramps, all flat), `ramps-2.png` (gamma variants), `t5-scenes.png` (T5 on all three scenes). Measured
bounds (`tmp/neo/spec/stats.mjs`): duo-night lightest pixel `#53760d` (matches NEO-BRIEF 5.2); T5 lightest `#a2a0a2`
(= `--marble-400`, L 0.3543, so T5 is decoration only); T3 on the glasses bust keeps its alpha exactly (0 of 171,360
pixels differ from the resized original; the control with alpha halved reports 69,444 differing pixels), darkest
`#232229`, lightest `#f6f4eb`.

---

## 3. Components

Every component keeps its **glass class names and markup** (COMPONENTS.md) unless a row below says otherwise; the new
classes are listed in 3.25. "Kept" means the COMPONENTS section applies unchanged; the look is new. `.glass`,
`.glass--*`, `.is-flat` and `.is-solid` still appear where the **shared pipeline** emits them (`src/build.mjs` 420,
423, 448, 581, 749; `src/lib/forms.mjs` 168); in neo they are **inert tokens** that no neo rule styles. Neo templates
never emit them.

### 3.0 Base controls

- **Buttons** `.btn` (square, `min-height: 52px`, padding `0 30px`, text 600 `--n-ui`, `.04em`): an inner fine rule
  (`::before` at `inset: 3px`, 1px `currentColor` at .55). Primary: `green-700` fill, `paper` text; hover and focus:
  `green-800`, the inner rule insets to 5px, `translate: 0 -2px` (movement only under `hover: hover` and
  no-preference). Alert: `paper` fill, `alert` text; hover `marble-100`. Invert (on green-800 / green-700 / the band):
  `paper` fill, `green-800` text. Temple 246-258.
- **Links:** `green-700` on light, `green-300` on dark; prose links always carry one 1px hairline (never colour alone);
  the **engraved underline** (two 1px hairlines 2px apart growing from the centre, temple 125-143) on hover and focus.
  `.more` is 600 `--n-ui`, 44px tall, arrow +4px on hover and focus.
- **Round buttons** `.round-btn`: 44px circle, 1px `ink-500` boundary on paper, `green-800` glyph; hover and focus:
  `green-700` fill, `paper` glyph.
- **Focus:** `outline: 3px solid var(--focus); outline-offset: 2px`, swapped per surface (2.1). A control that
  straddles a dark/light seam gets the two-tone ring (a 5px `focus-on-dark` shadow inside a 3px `green-700` outline,
  temple 389).
- **Icons:** one sprite per page (COMPONENTS 0), the glass names `pin cal phone mail form cart star chev arrow case fb
  menu close clock alert doc`, drawn at stroke 1.5 (`tmp/lab-neo/temple/index.html` 41-53). **Ornament symbols
  added** to the same sprite: `o-rosette`, `o-star`, `o-badge` (NEO-BRIEF 4.5, 4.7, 4.8; strings in
  `tmp/lab-neo/temple/index.html` 22-39) and `o-sprig` (4.2, string in `tmp/neo/brief/ornaments.json`). All
  `aria-hidden="true" focusable="false"`.
- **Phone numbers never break:** every visible "318-550-5815" in a text node is wrapped in `span.nw`
  (`white-space: nowrap`, gallery 181), by `T.page` as a final pass over the page HTML: text nodes only, never inside a
  tag or attribute, text unchanged (ledger N02). `a[href^="tel:"]` also gets `white-space: nowrap`.
- Skip link `a.skip` to `#main` (the lab's `#content` is the defect; COMPONENTS A.3).

### 3.1 Top bar (COMPONENTS B.1, kept)

`#759b2a` strip (`green-500`), `green-950` text (5.29), `min-height: 56px`. The address link (engraved underline on its
`strong`). The two `a.band-pill` become **ruled plaques**: 44px tall, 1px `green-950` border plus an inner 3px band
and a 1px rule (`box-shadow: inset 0 0 0 3px var(--green-500), inset 0 0 0 4px rgb(20 31 0 / .55)`), icon + label.
Hover and focus: `green-950` fill, `green-100` text, the inner rule in `green-300` (temple 152-158). Focus ring
`--focus-on-band`. Below 720px only `band-pill--call` shows, centred (L02); below 1024px `band-pill--appt` hides.
Not sticky, not a landmark.

### 3.2 Header, primary nav, drawer (COMPONENTS B.2, kept, plus the scrolled actions)

**Anatomy.** `header.site-header` is sticky, `marble-50`, with a 4px double `marble-300` rule on its bottom edge.
- **1280+:** a symmetric entablature: the flat 5-item menu is split around the logo on the axis (2 left, 3 right,
  temple lab.css 163-174), small `green-600` diamonds between items, logo 116px wide, bar 92px. **Markup departure:**
  the nav renders two lists in source order, `ul.mainnav__list.mainnav__list--l` (items 1-2) and
  `ul.mainnav__list.mainnav__list--r` (items 3-5), inside the one `nav.mainnav[aria-label="Primary"]`, because a single
  list cannot be centred on a logo between groups of unequal width with CSS alone (temple used the same split). Reading
  and tab order stay the source order; the drawer keeps one list.
- **1024-1279:** logo left, the menu right (temple 187-194).
- **Below 1024:** logo left (92px), `div.mobile-actions` right (three 44px round buttons), bar 72px.
- `div.progress > span` moves **inside** the header as its last child (a 2px `green-600` rule on the bottom edge,
  `scale: var(--scroll) 1`).

**Scrolled state** (`.is-scrolled` at `scrollY > 40`, set by site.js): a soft shadow and the logo `scale: .82`
(transform only: **no layout size changes**, DESIGN-SPEC 5.9 trap 3). **New (UX must-fix, ledger N03):**
`div.site-header__actions` holds two round buttons, `a.round-btn.site-header__call` (`tel:318-550-5815`,
`aria-label="Call"`) and `a.round-btn.site-header__appt` (`aria-label="Make an appointment"`), the same labels as
`.mobile-actions` (L13). They are absolutely positioned at the wrap's left and right edges (they take no layout
space), hidden (`visibility: hidden; opacity: 0`) at rest, shown in `.is-scrolled`, and rendered only from 1024px
(`display: none` below, where `.mobile-actions` already does this job). At 1024-1279 only the appointment button
shows (the menu leaves no room for two); from 1280 the call button sits left of the menu and the appointment button
right of it, keeping the axis. NG3 and NG11 check the row at 1024 and 1280.

**Nav states:** links `ink-900` 600 `--n-ui`, 44px tall; hover and focus: `green-800` plus the engraved underline;
`aria-current="page"`: the double hairline at full width plus a small `o-star` before it; `is-section`: the single
hairline.

**Drawer** (COMPONENTS B.2 markup and hooks: `nav.drawer#drawer[data-drawer][hidden]`, label "Primary",
`div.scrim[data-drawer-close][hidden]` after `div.page`, focus trap, Esc, `inert` on `div.page`): a `marble-50`
panel from the right, `width: min(86vw, 380px)`, 1px `marble-300` border, `--n-e-hang`; links 52px tall, `--n-lead`
600 `ink-900`, engraved underline; `drawer__actions` holds the two plaques. It slides in (.5s `--ease-out`), and
appears without sliding under reduced motion. The scrim is `rgb(17 20 11 / .45)`.

### 3.3 Home hero (COMPONENTS G.3, restructured)

The temple front on the green-black poster ground. **Every text node is the source's** (the three `div.ecp-heading`
lines of row 0; the four badges of row 1).

```html
<section class="hero">
  <div class="deco deco--dark" aria-hidden="true"></div>
  <div class="hero__frame" aria-hidden="true">{4 x svg.star.star--tl|tr|bl|br using #o-star}</div>
  <div class="wrap hero__grid">
    <div class="pediment pediment--hero" aria-hidden="true"><svg viewBox="0 0 1000 106.3" preserveAspectRatio="none"><polyline points="0,105.8 500,.5 1000,105.8" vector-effect="non-scaling-stroke"/></svg><span class="numeral">I</span></div>
    <span class="cornice" aria-hidden="true"></span>
    <span class="pilaster pilaster--l" aria-hidden="true"></span><span class="pilaster pilaster--r" aria-hidden="true"></span>
    <p class="hero__statement">
      <span class="hero__line hero__line--1">Your Community</span>
      <span class="hero__line hero__line--2">Eye Care Clinic</span>
      <span class="hero__line hero__line--accent">We Know You!</span>
    </p>
    <figure class="hero__photo"><span class="hero__photo-in" data-reveal="settle"><img src="{src /Girl-Smiling-Brown-Hair/}" alt="" width="1280" height="853" fetchpriority="high" decoding="async"></span></figure>
    <img class="hero__cut" src="{gen neo-cut-bust-glasses (T3)}" alt="" width="{w}" height="{h}" decoding="async">
    <span class="hero__pedestal" aria-hidden="true"></span>
    <div class="hero__stylobate" aria-hidden="true"><span class="meander"></span></div>
    <nav class="dock dock--portico" aria-label="Quick links">{4 x a.dock__tile, 3.4}</nav>
  </div>
</section>
```

No `aria-label` on the section (the lab's "Welcome" was an invented label, COMPONENTS H.1 #8). The statement stays a
`<p>` (source semantics). **No `data-reveal` on anything in the hero** except the photo's non-hiding settle: the quick
actions must be there at first paint. The bust carries no `fetchpriority` (the lab's `high` on it competed with the
LCP photo) and **no parallax** (it stands on the pedestal).

**Layout by width** (grid areas on `.hero__grid`; the statement spans all columns; row 3 is the cella):

| width | row 1-2 | cella (row 3): left bay / centre / right bay | seam |
|---|---|---|---|
| **1200+** | pediment (82% wide, numeral I), cornice, pilasters, two poster lines at `--n-hero` | **photo arch** (T1, 3:4, `--photo-w: clamp(260px, 21vw, 300px)`, face kept inside with `object-position: 78% 18%`, re-checked by NG5) / **bust** (`--bust-w: clamp(250px, 21vw, 310px)`) on the pedestal / **2x2 portico of arched niches** (3.4) | the lower niche row straddles the seam; the photo's plinth and the pedestal cross it by `--n-seam` (115px at 1440); the meander stylobate passes behind all three |
| **1024-1199** | as 1200+ | photo arch / bust / **plaque list** (4 ruled plaques, 3.4) | photo plinth and pedestal cross by `--n-seam` (82px at 1024) |
| **700-1023** | pediment, cornice (no pilasters), lines at `--n-hero` | photo arch / bust (`--bust-w: clamp(200px, 26vw, 250px)`) / plaque list | as 1024 (61px at 768) |
| **< 700** | small pediment without its numeral (temple 423), lines at `--n-hero-phone` (they wrap to 4: YOUR / COMMUNITY / EYE CARE / CLINIC) | two columns: **script left, bust right** (`--bust-w: min(48vw, 200px)`), its crown breaking the last line; then the **2x2 quick-action plates** over the bust's base (3.4); then the **photo arch** centred, `width: min(62vw, 260px)` | the photo arch crosses the seam by 40px |

**The script ("We Know You!", graft from poster).** Parisienne, `text-transform: none` (the poster lines above it are
capitals by CSS only), `green-400` on the poster ground (4.90), with a
**halo in the ground colour made with text-shadow** (eight 0-blur offsets at .06em in `--poster`), which every engine
draws; `-webkit-text-stroke` plus `paint-order` is not used (its WebKit support on HTML text is unverified, and a
stroke without `paint-order` eats the glyph). From 1024px it is absolutely placed at the left end of line 2,
`rotate: -4deg`, crossing the lowest part of "EYE": **2 letters at most, 35% of cap height at most**, target 5-20%
(poster measured 2-10%), and it ends 24px or more before the bust's head. At 700-1023 it sits under line 2 at the left
and touches no letter; below 700 it stacks in the left column beside the bust (2-3 lines). The photo arch in the left
bay starts at least 16px below the script's glyph box at every width (text never on a photo).

**The bust (N2 over N1).** `neo-cut-bust-glasses`, T3, its crown breaks line 2 ("CARE") from 700px and the last line
("CLINIC") below 700. **Coverage gate (tightened from the lab's 0.40, NG5):** no glyph box covered more than **0.30**,
at most 2 glyphs per line over 0.20 (NEO-BRIEF 5.3 limits stay: 2 glyphs over 25%, none over 45%). Tune with the bust's
`margin-top` (temple 321) and a lateral nudge so the break falls on the lower bowls, not on the R's leg; re-run
`tmp/lab-neo/temple/work/coverage.mjs` with its face-box control. Shadow `--n-drop-dark`. Clearance: 24px or more from
the photo arch's frame and from every control.

**The pedestal (craft must-fix).** `span.hero__pedestal` in the centre column, `width: calc(var(--bust-w) * .44)`
(temple 347), from the bust's plinth down through the stylobate, crossing the seam by `--n-seam`. It is modelled
stone, not a veined box: a **cylindrical** horizontal gradient in the site light (lit from the left: `rgb(255 255 255
/ .14)` at 28%, `rgb(35 34 41 / .38)` at the right edge) over `var(--n-ground-light)`; a **cap moulding** (`::before`:
abacus 10px, a 4px fillet and a 1px `marble-400` cyma line, overhanging 10px each side, its own down-right shadow); a
**base moulding** (`::after`: plinth 22px plus a torus line, overhanging 14px); and the **contact shadow** under the
bust (2.6). Hidden below 700 (the plates overlap the bust's own small plinth there).

**The photo arch (LCP, warmth must-fix).** The real hero photo leads: it is at least 1.8 times the lab tondo's area at
1440 (300 x 400 against a 280px circle), in a 3:4 arch with the outer rule and keystone (`green-400` on dark), a 5px
`marble-50` mat, and a plinth plate under it. `fetchpriority="high"`, never lazy; the build preloads it
(`src/build.mjs` 782-783). NG9 records the LCP element: it must be the photo or the title text, never the bust.

**Frame and stars:** a 1px `rgb(117 155 42 / .7)` inset frame at 16px (8px below 700) with four `o-star` at its
corners, `green-400` (NEO-BRIEF budget: 4 stars on the home page, all here).

**First screen (UX must-fix, gate NG9):** at 390 x 844 all four quick-action plates lie fully inside 844px (estimate:
about 595-741px; temple measured 897); at 1024 x 768 and 1440 x 900 every quick-action label lies fully inside the
first viewport; at 1440 x 900 the hero photo's face box is inside it.

### 3.4 Quick actions (COMPONENTS B.4, kept markup)

The four source links in source order (Email Us, Schedule An Appointment, Patient Forms, Order Contacts Online;
`target="_blank" rel="noopener"` on the two the source opens in a new tab). "Schedule An Appointment" is always
`dock__tile--primary`. Markup per tile: `a.dock__tile > span.dock__icon > (svg.dock__ring using #o-badge + icon) +
span.dock__label`.

| variant | where | shape | states |
|---|---|---|---|
| **portico niche** | hero 1200+, `nav.dock.dock--portico` | round-headed niche (`--r-arch`), `marble-50` fill, 1px `green-600` border with a 6px `green-700` plinth, outer rule at -9px and keystone (`green-500`); ring 64px, label `ink-900` 600 `--n-ui`; height `clamp(150px, 12vw, 172px)`; primary: `green-700` fill, `paper` text and ring | hover and focus: arch lift -6px, the outer rule grows 9 to 13px, the keystone rises 4px, the ring turns 45deg, fill `paper` (primary `green-800`); straddling tiles use the two-tone ring (temple 368-397) |
| **plaque list** | hero 700-1199 | ruled plaques (gallery 311-326 shape): 64px, square, `marble-50`, inner double rule, ring 44px + label + arrow | lift -4px, arrow +4px, rule `green-700` |
| **phone plates** | hero < 700 | 2 x 2 grid of `marble-50` plates, 68px or more tall, 1px `green-600` border, ring 44px left of the label, **overlapping the bust's base by 24-40px** (N3 over N2; poster 150-160 composition) | fill `paper`; primary `green-800`; focus ring `green-700` |
| **aside** | `nav.dock.dock--aside` (interior) | the plaque list, full aside width | as the plaque list |
| **row** | `div.dock.dock--row` (9 builder pages) | a 2 or 4 column row of plaques, each with `data-reveal="up"` | as the plaque list |

### 3.5 Section headers (COMPONENTS B.5, kept, plus ornaments)

Home sections open with a centred `div.sec-head` (new): an ornament, the title, and optionally a rosette divider.

| section | ornament above | title | divider |
|---|---|---|---|
| II Welcome | `div.pediment` (300px) with numeral II | `h1.section-title.section-title--center.welcome__h` | yes |
| III Services | pediment with III | `h2.section-title.section-title--center > a.title-link` | yes |
| IV #HappyPatients | `span.arch-mark` with IV | `h2.tag-title` flanked by the laurel sprig pair (`div.tag-row`) | no |
| V #HeretoHelp | `span.arch-mark` with V | `h2.tag-title.help__tag` (centred, full width) | no |
| VI Designer | numeral VI | `h2.designer__title` bracketed by the pilaster pair | no |
| VII Visit | numeral VII only (`div.sec-head--quiet`, `aria-hidden`) | none (the source row has no heading) | yes |

Numerals are `aria-hidden`, display 62.5% 400, `green-600` on light and `green-400` on dark (large only), never a
count or a date (NEO-BRIEF 1.2; ledger N01). The rosette divider (NEO-BRIEF 4.6) is `div.divider` with two
`span`s and an `o-rosette`: 3 on the home page (II, III, VII), the budget. Tag titles: `--n-tag`, caps; the `#` is a
`span.hash`. **Interior:** `h2.section-title` stays left-aligned display 75% `--n-h2-prose` `slate-700` with a 48px
double rule under it; `div.section-head` runs keep their source levels (`section-title--sub` is text 600 `--n-h3`),
and the build's `span.nobr` keeps spaced capitals whole.

### 3.6 Service tiles (COMPONENTS G.5, kept)

The arcade (temple 494-529) on a `green-100` ground: `ul.svc-grid` (4 columns from 1024px, 2 below) of
`a.svc` cards. `span.svc__frame` is the **arch** (3:4, 72% of the card width, outer rule and keystone `green-600`),
holding the source photo (T1, `alt=""`, L12) with a per-photo `object-position` (`tmp/lab-neo/temple/index.html`
244-262); it **rises out of
the plinth plate** `span.svc__foot` (paper, inset hairline, 6px `green-700` plinth) by 28% of the arch height (about
200px at 1440, measured by NG4). `span.svc__name` (600 `--n-ui`, `.1em` tracking; `--n-sm` below 560 with `.06em`)
and the arrow `span.svc__go`. States: arch lift -6px, the outer rule grows 8 to 12px, the keystone follows, the photo
`scale: 1.03` inside its clip, the name `green-800`, the arrow +6px, the plate shadow `--n-e-lift`. The arch photos
use `data-reveal="arch"` (5.1). No `data-tilt`.

**Seam relief (new placement, 6.2):** `img.services__relief` (`neo-cut-eye-relief`, T3, `width: clamp(150px, 17vw,
240px)`, `alt=""`) sits on the axis on the Welcome/Services seam, over the Services pediment's apex like a keystone
relief, crossing the seam by `clamp(40px, 5vw, 72px)` up and down; `data-depth="-0.04" data-depth-max="16"`.

### 3.7 Welcome (COMPONENTS G.4, kept markup, new layout)

- `div.sec-head`: pediment II, the h1 "Welcome to Clifton Eye Center" with `span.welcome__place` "in Bossier City,
  Louisiana" as a **serif** second line (display 75%, `slate-700`, `.62em`, poster 182) instead of the lab's script
  (UX must-fix: the key local phrase in the least legible face), then the divider.
- **1100+ (graft from poster, UX judge):** `div.welcome__grid` is two columns, `minmax(0, 1fr) minmax(0, 1.7fr)`:
  `div.welcome__side` (the promo plate, then the What's New plate) beside `div.welcome__main` (the practice copy as a
  **single-column stele**). This is the aside-plus-article pattern of the interior pages, and it ends the lab's CSS
  columns that split the service list. Below 1100: stacked in source order (promo, What's New, practice copy).
- **Promo** `article.promo` (paper plate, inset hairline at 7px): `figure.promo__img` is an arch (3:4, `min(42%,
  184px)`) with the source photo (T1), **rising 58px above the plate** (44px below 700); `h3.promo__title` text 700
  `--n-h4` `green-800`; the paragraph `--n-sm` with its Promotions link.
- **What's New** `section.news` (plate): `h2.news__h` display 75% with a 64px double rule; `h3.news__title` link;
  `p.news__date.date-pill` in meta caps with the clock icon; excerpt; `a.more`. **New N4 figure (graft from gallery):**
  `img.news__cut` (`neo-cut-hand-spectacles`, T3, `width: clamp(200px, 19vw, 260px)`, `alt=""`), its underside
  resting **12px into the plate's top frame**, 24px or more from any text (gallery 383-390); 560px and wider only.
- **Practice copy** `div.welcome__main` (plate, `max-width` `--n-measure` per child): `p.lead` with a display drop cap
  (`::first-letter`, `green-700`, temple 446-449); paragraphs; `ul.feature-list` with the **`<strong>` lead terms
  restored** (L07; the lab dropped them) and 18px `o-rosette` markers (`green-600`); `h3.offer-h` (`slate-700`);
  `ul.offer-list` with small diamond markers; `p.closing`. Every "318-550-5815" in it is in `span.nw`.

### 3.8 Testimonials (COMPONENTS G.6 and F.3, kept markup)

**Home, `section.reviews`** on the poster ground (`deco--dark`), the one dark feature band of the page:
- `div.smiles` (aria-hidden, z 4): the three source smile photos (T1) as **round medallions** with a 5px `marble-50`
  ring and a 1px `green-500` outer rule, a symmetric trio **centred on the Services/reviews seam** (the middle one
  `clamp(116px, 12.5vw, 180px)`, the flanks `clamp(92px, 10vw, 140px)` set 30-40px lower; temple 533-542). Never paired
  with a quote (L04). `data-depth` -.04 to -.06 with `data-depth-max` 14-18.
- `div.sec-head`: arch-mark IV; `div.tag-row` = `svg.laurel-sprig` + `h2.tag-title#rev-h` + `svg.laurel-sprig
  .laurel-sprig--r` (NEO-BRIEF 4.2 shape, `green-400`, `clamp(30px, 6vw, 88px)`, hidden below 420px; gallery
  500-510). `data-settle` on the title (the page's one letter-spacing settle, 5.3).
- **Stelae, light (UX must-fix):** each `figure.review` is a `marble-50` plate with the segmental head
  (`--r-stele`), an inner hairline and a 6px `green-600` plinth; `p.stars` (`green-600` stars, UI 3.93) at the top;
  the quote **left-aligned, roman** Source Serif 4 `--n-base` `ink-700`, 34ch or less; `figcaption.review__by` in meta
  caps `green-700` with a short double rule above it. **Natural heights** (`align-items: start`): no empty voids
  under the short "I love Dr. Clifton..." quote. No quote glyph (`svg.review__q` is not rendered).
- 1024+: a static 3-column row. **Below 1024: the COMPONENTS G.6 snap carousel** (`section.rev-carousel` >
  `div.rev-track` > `div.rev-slide[role=group]`, 44px round prev/next buttons, no autoplay, L04). The lab stacked all
  three stelae on phones; the carousel is part of the phone page-length fix (NG18).
- `p.reviews__more` with `a.btn.btn--primary` "Read More Reviews" (source attributes kept, `rel` gains `noopener`),
  focus ring `focus-on-dark`.

**Interior:** `/contact-us/testimonials/` renders `ul.rev-grid` of the same light stelae on the marble ground (3, 2
or 1 columns, `minmax(300px, 1fr)`); `/testimonial/*` renders one stele inside the first sheet.

### 3.9 Ask-the-doctor accordion (#HeretoHelp, COMPONENTS G.7 and F.6, kept markup)

- **Head centred (symmetry must-fix):** arch-mark V and `h2.tag-title.help__tag#help-h` "#HeretoHelp" across the
  full wrap on the axis, `--n-tag` (no `cqi` units, WebKit must-fix).
- **1024+:** `div.help__grid` two bays under the centred head, `minmax(0, 5fr) minmax(0, 7fr)`: the left bay holds
  `span.help__niche` (new, aria-hidden), a **blind niche**: a 3:4 arch (`width: min(100%, 300px)`), outer rule and
  keystone `green-600`, filled with `--n-ground-dark`, holding a large carved patera (`o-rosette` at 46% of the niche
  width in `marble-50` at .22, inside an `o-badge` ring in `green-400` at .35). The Q&A plate **overlaps the niche's right rule by
  `clamp(24px, 3vw, 48px)`** (N3 over N1). Below 1024: the niche centred above the plate at `min(68%, 250px)`.
  **No generated image in this section** (its text contains "Ask Dr." and "Dr. Deana Clifton", 6.1; operator option
  7.6 #1 restores the lab's relief niche).
- **Q&A plate** `div.qa` (paper, inset hairline): `h2.qa__h` display 75% `slate-900`; `div.qa__list[data-accordion]`
  of `details.qa__item` with `summary.qa__q > span.qa__text + span.qa__icon`; **the first item is open** (L05).
  `span.qa__icon` draws the rosette with a CSS mask in `green-600` (28px) and turns 45deg when `[open]` (none under
  reduced motion). Rows 60px or more, 600 `--n-lead` `ink-900`, 1px `marble-300` rules; hover and focus: the engraved
  underline on `span.qa__text`, text and rosette `green-800`. Answers `--n-base` `ink-700` at `--n-measure`, indented
  50px (4px below 700), with the "More about Dry Eyes..." link.
- **Generic accordions** (the payment accordion and the builder heading-accordions, closed by default): the same item
  on a plate, used by `T.accordion`.

### 3.10 Designer brands (COMPONENTS G.8, kept markup)

The one `#759b2a` brand band (`green-500`, full bleed, a 4px double `rgb(20 31 0 / .4)` rule 10px under its top edge).
`div.designer__head` (new): numeral VI (`green-950`), then `h2.designer__title` "Our Designer Optical" (display 75%
500 `--n-h2`, `poster`, 5.13) **bracketed by a pilaster pair** from 1024px (poster 441-443, `poster` flutes at .8; the
home's second pilaster pair, 7.3 #3). `ul.brands` of four `a.brand` **paper plates** (`brand__img` holds the source
ad **T0: never cropped, masked, filtered or arch-framed**, alts verbatim), in source order, `repeat(4, minmax(0,
220px))`, **hanging across the band's lower edge into Visit** by `clamp(84px, 7vw, 104px)` (2 x 2 below 768px, the
second row hangs 150px). `span.brand__name` is a **wall-label plaque** (gallery 455-462) that overlaps the plate's
bottom margin by 24px (never the ad), 600 `--n-ui` `.14em` `ink-900`. States: plate lift -4px, a fine `green-950`
rule appears around it (`::before` inset -6px), shadow `--n-e-lift`; focus ring `--focus-on-band` at 10px offset.

### 3.11 Visit: map, NAP and hours, emergency (COMPONENTS G.9, kept markup plus the map plate)

- `div.sec-head--quiet` (numeral VII, divider).
- **Map plate** (new wrapper `div.map-plate`, N1): a `poster-2` mat 14px wide with an inset 1px `rgb(189 213 143 /
  .55)` hairline around the **real keyless embed** (`div.map > iframe.map__frame`, `title="Google map"`, L22; the
  BUILD-DECISIONS #10 link fallback if it does not resolve). No "Map placeholder" text or drawn map ever ships. The
  map is **rectangular** (an arch would clip Google's top controls). Under it, `span.map-plate__ledge` (aria-hidden), a
  `poster-2` ledge `clamp(72px, 7vw, 96px)` tall with a double rule on top.
- **Magnifier** `img.visit__magnifier` (`neo-cut-magnifier`, T0 colour, resized, `alt=""`, N4): it lies on the ledge,
  its **lens over the dark ledge only** (IMAGE-PLAN-NEO 3.2: never over a photograph or white), the handle crossing
  the mat's right frame rule. **It never overlaps the iframe** (Google attribution and controls stay clear).
  `data-depth="-0.04" data-depth-max="12"`.
- **1100+ three planes (graft from gallery):** grid `minmax(0, 1fr) minmax(0, 1.08fr) minmax(0, 1fr)`: the map plate
  (N1), then `img.visit__column` (`neo-cut-column`, T3, `width: clamp(150px, 16vw, 240px)`, `alt=""`, N2) standing in
  the gap and **crossing the mat's outer rule by 12px or more, never the iframe**, with the NAP stele (N3)
  overlapping its right side by 24-40px; then the emergency tile. The column carries a contact shadow on the ground
  (2.6) and `--n-drop-light`.
- **NAP stele** `div.nap` (+ `nap--stele`): paper plate with the round head (`--r-arch`), inner hairline, 6px
  `green-700` plinth, centred: `p.nap__title` link (display 75% `slate-900`), `p.nap__addr`, `p.nap__phone` ("Phone:"
  label strong, the number a `green-800` link in `span.nw`), `dl.hours[data-hours]` (7 rows, `data-day` 1-6 then 0,
  `hours__row` with `dt` 600 `ink-900` and `dd` `ink-700` tabular figures, 1px `marble-200` rules, a 4px double rule
  on top; **today's row** `is-today` gets a `green-100` background with `ink-900` text, L16). From 1100:
  `span.nap__medal` (new, aria-hidden, N4) on the crown: `neo-cut-laurel` (T0 patina, 150-170px) around an `o-badge`
  ring and an `o-rosette`, rising half its height above the crown, 24px or more from the title; it turns 45deg on the
  stele's `:hover` / `:focus-within` (gallery 630). Padding-top grows to fit it.
- **Emergency** `div.sos` (kept): `alert` tile, a 1px `rgb(255 255 255 / .4)` inset rule at 7px, `span.icon-tile` a
  50px ringed circle with the case icon, `h3.sos__h` text 600 `--n-h3` `paper`, the source paragraph `--n-sm` `paper`,
  `a.btn.btn--alert` with the number; focus ring `paper`.
- 700-1099: two columns, the stele spanning both rows on the right, map plate then emergency on the left (temple
  679-684); no column figure. Below 700: stacked.
- `/hours-location/` and `/location/clifton-eye-center/` reuse the block without the column and the medallion
  (their text is the source's; the container query of COMPONENTS "CHANGED G.9" lays it out by its own width), followed
  on `/hours-location/` by the payment accordion.

### 3.12 Footer (COMPONENTS B.13, kept content)

`footer.site-footer` on `--n-ground-deep` (`deco--deep`):
- `div.footer__frieze` (new): `div.pediment.pediment--footer` (`min(100%, 820px)`, `green-500`) with the **reversed
  logo in its tympanum** (`a.site-logo.site-logo--footer`, `logo-clifton-light.png`, 100px; below 700 the logo sits
  under the gable line instead), then the second meander run (`green-500`) and a double rule.
- `div.footer__bays` (new; replaces `footer__panel`): from 900px three bays, `minmax(0, 1fr) auto minmax(0, 1fr)`:
  `nav.footer__col` "Important Links", `div.footer__brand` (NAP line verbatim with its " , " spacing, the number in
  `span.nw`, the Facebook `a.social` medallion), `nav.footer__col` "Quick Links". **Both link columns are
  left-aligned** (UX must-fix: the lab right-aligned the first); each column block is pushed toward the axis so the
  bays stay symmetric. Below 900: brand first, then the two columns side by side.
- `p.footer__h` meta caps `green-300`; links `marble-50` `--n-ui`, engraved underline, hover `paper`; **44px tall below
  768px, 36px above**. `div.footer__legal`: "© 2026" and Accessibility, Sitemap (`sitemap.xml`, L10), Privacy,
  Disclaimer in `ink-200` `--n-sm`, 44px below 768px, 24px or more above.
- `a.social`: 46px ring `green-300`; hover and focus: `green-300` fill, `poster` glyph, the medallion turn (the glyph
  counter-rotates).

### 3.13 Interior title band and breadcrumbs (COMPONENTS C.2, kept markup plus the niche)

The **daylight** band (graft: gallery's marble idiom for interior pages; the dark temple front stays special to the
home):

```html
<section class="band band--scene band--has-cut" aria-labelledby="page-title">
  <div class="band__stage" aria-hidden="true"><span class="band__frame">{2 x svg.star}</span></div>
  <div class="wrap band__grid">
    <div class="band__title">
      <nav class="crumbs" aria-label="Breadcrumb">{COMPONENTS C.2}</nav>
      <h1 class="band__h" id="page-title">{h1}</h1>
      <div class="divider band__divider" aria-hidden="true"><span></span><svg><use href="#o-rosette"/></svg><span></span></div>
    </div>
    <span class="pilaster pilaster--l" aria-hidden="true"></span><span class="pilaster pilaster--r" aria-hidden="true"></span>
    <div class="band__niche" aria-hidden="true">
      <span class="band__arch"><img class="band__scene" src="{gen scene (T5)}" alt="" width="{w}" height="{h}" decoding="async"></span>
      <img class="band__cut" src="{gen cut (T3)}" alt="" width="{w}" height="{h}" decoding="async" data-depth="-0.05" data-depth-max="16">
    </div>
  </div>
</section>
```

- Ground: `--n-ground-light` + grain on `band__stage`; `band__frame` a 1px `green-600` hairline inset 12px with two
  `o-star` at its top corners (the interior budget: 2 stars, 1 pilaster pair, 2 rosette dividers, 1 meander run).
  The band's bottom edge is a 4px double `marble-300` rule. **No meander on interior bands** (budget).
- Title column: crumbs (links `green-700` 600 `--n-sm` with the engraved underline, `crumbs__sep` "»" in `ink-600`
  and `aria-hidden`, the current item `ink-900` with `aria-current`, empty segments dropped L21, wrapping, never
  truncated); `h1.band__h` display 75% `--n-h1` `poster`, max 22ch, balance; the rosette divider (left-aligned).
- **Niche (1024+):** grid `minmax(0, 1fr) clamp(200px, 20vw, 288px)`; `band__arch` is a 3:4 arch with the outer rule
  and keystone (`green-600`), clipped, holding the family scene in **T5**, or, on `band--plain` pages that still have
  a cut-out, the flat `--n-ground-dark` (the busts need a dark ground, IMAGE-PLAN-NEO 3.1). The cut-out (T3) stands
  in it: its lower part inside the arch, its **top rising 12-22% of the arch height above the crown or a shoulder
  breaking a side rule** (NEO-BRIEF 5.4), and its base **crossing the band's bottom edge by `--n-cross`**. The band
  then gets `margin-bottom: calc(var(--n-cross) + 24px)` (`band--has-cut`, new), so the crossing lands in empty
  ground above both the first sheet and the aside, never on a plate (5.5 rule, no collision to gate on text).
  `band__scene` is above the fold: **no arch reveal** on it.
- **700-1023:** the niche at `clamp(160px, 22vw, 200px)` to the right of the title column. **Below 700:** no niche
  and no scene; the cut-out alone (`width: clamp(104px, 30vw, 128px)`) sits at the band's bottom-right, crossing the
  edge by 24px, and the band's padding-bottom reserves its height so it never meets the h1 (NG5).
- **`band--photo`** (the 8 source header photos, COMPONENTS C.2): `figure.band__visual` in a fine double frame (T1,
  square, `max-height: 320px`, `band__visual--left|right` focus as the build passes it; `/designer-frames/` brand
  photo T0) in the right column from 1024px, crossing the band edge by `--n-cross`; below 1024 under the title.
  `fetchpriority="high"` (the build preloads it).
- **`band--plain`** without a cut-out: title only, no niche. Blog posts add `p.date-pill` (meta caps with the clock
  icon, `green-700`) after the h1 (C.3).
- Min-height 220px below 768px, 300px from 1024px (plus the crossing margin).

### 3.14 Page frame, aside, section rail (COMPONENTS A.3, C.1, B.15, B.17, kept markup)

- `div.ground` (new, first child of `body` after the sprite, aria-hidden, `position: fixed; inset: 0; z-index: -1`)
  paints `--n-ground-light` + grain behind every interior page. The glass `div.field` and its blobs are not rendered.
- `div.page-grid` / `div.page-body`: `minmax(0, 1fr) var(--aside)` from 1024px, gap `clamp(24px, 1rem + 2.5vw,
  56px)`, padding-top `--s-7`; `is-solo` pages one column at `--solo`. `main` passes columns through (subgrid), as
  glass.
- **Sheets** `section.sheet` (emitted by the build): a **paper plate** with the inset hairline at 7px (`marble-300`),
  padding `clamp(22px, 1rem + 2vw, 44px)`, `--n-e-plate`, square; consecutive sheets 24px apart. The first 12 carry
  `data-reveal="up"` (build).
- **Aside** `aside.page-aside[data-sticky-fit]`: `nav.dock.dock--aside` (plaques, 3.4); `section.aside-card
  .aside-card--location` (plate: `h2.aside-card__h` link in the **text** face 700 `--n-h4` `slate-900`, because the
  display face is banned below 28px; address, phone in `span.nw`, `div.map.map--aside` in a 10px `poster-2` mat, the
  hours `dl`); `section.aside-card.aside-card--insurance` (plate, h3 text 700). Sticky only while it fits
  (`is-sticky`).
- **Section rail (library sub-navigation, L19)** `details.rail[data-rail]`: below 1024 a closed plate above the
  article whose `summary` (600 `--n-ui`, 48px, a `chev` that turns) is the parent's title; from 1024 site.js opens it
  and CSS places it as the aside's top plate with the summary hidden. `p.rail__h` (the parent title link, 600
  `--n-ui` `slate-900`, never meta caps: it is a control) over a double rule; `ul.rail__list` links `ink-900` 44px
  tall with the engraved underline; the current page `aria-current="page"`: `green-800`, the double hairline and a
  7px `green-800` diamond before it (a state marker; no star, so the band's two stars stay the page's only ones).

### 3.15 Long-form article body (COMPONENTS D, kept: the pipeline's output)

Inside `div.prose` (every child `max-width: var(--n-measure)` except figures, tables and embeds):
- **Headings:** h2 display 75% `--n-h2-prose` `slate-700`, margin-top 1.6em, `scroll-margin-top: 120px`; h3 text 600
  `--n-h3` `slate-700`; h4-h6 text 700 `--n-h4` `ink-900`.
- **Paragraphs** `--n-base` `ink-700` 1.7, spacing .9em, left-aligned, `hyphens: manual`. `p.attribution`
  `--n-sm` `ink-600`. `p.linkrow` / `linkrow--toc`: a ruled row of links separated by small `green-600` diamonds,
  each link 24px or more tall. `span.nobr` whole.
- **Lists:** `ul` with 7px `green-600` diamond markers (rotated squares, `aria-hidden` by being CSS); `ol` decimal
  600 `ink-900` markers (never upper-roman in prose: steps are referred to by number); gap .45em.
- **Links:** `green-700` with one hairline at rest, the second on hover and focus; hover `green-800`.
- **Blockquote:** a 4px double `green-600` rule on the left, `marble-100` fill, italic `ink-700`. `hr`: a centred
  48-120px double `marble-400` rule (no rosette: budget).
- **Tables:** `div.table-scroll[role=region][tabindex=0]` (the build's label) scrolls sideways inside the sheet
  (the page never does), focus ring on the region; `table` full width, `th` 600 `ink-900` on `marble-100` with a 4px
  double `marble-400` rule under `thead`, cells `--n-sm`-`--n-base` padding 10px 12px, 1px `marble-300` row rules.
- **Figures** (role class from the build, D.3): `fig--photo` (T1) in a fine double frame (1px `marble-400` at -8px,
  square), breaking out of the sheet padding on one side by `clamp(8px, 2.4vw, 36px)` (`fig--start` / `fig--end`
  alternate), `--n-e-plate`, no rotation; `fig--feature` (the `svc-*` panels) the same, wider. `fig--plate`: paper
  plate with padding 12px and the inset hairline, floated right at 44% from 900px. `fig--portrait`: arch mask; **Dr.
  Clifton's portrait T0, 225 CSS px at most, never protrudes, never on the dark ground, never in a medallion or
  laurel**. `fig--diagram`: a white plate, **never filtered, tinted, blended or arch-masked**, no break-out.
  `fig--brand`: as-is, no break-out, never beside a generated image. `div.fig-grid` 2-4 columns.
  `figcaption` `--n-sm` `ink-600`.
- **Embeds:** `div.embed--video` 16:9 in a fine double frame; `embed--map` in the `poster-2` mat of 3.11.

### 3.16 Index cards (COMPONENTS F.1, kept)

`ul.index-cards`: `repeat(auto-fill, minmax(260px, 1fr))`, gap 24px. `li.index-card` is a paper plate with the inset
hairline and a 6px `green-700` plinth. `span.index-card__thumb` (the 25 source thumbnails, T0: **rectangular, never
arch-cropped**, some carry baked text) in a fine double frame, **rising 32px above the card top**; `p.index-card__title
> a.index-card__link` (text 700 `--n-h4` `ink-900`, stretched to the card by `::after`, one link per card);
`p.index-card__summary` `--n-sm`; `span.index-card__go` arrow. States (hover and `:focus-within`): lift -6px, the
thumbnail -6px, the title engraved underline, arrow +6px. First 12 carry `data-reveal="rise"`.

### 3.17 Blog index and pagination (COMPONENTS F.2, F.5, kept)

`/whats-new/`: all 151 cards on one URL in source order. `ul.post-cards`: 3, 2 or 1 columns (`minmax(300px, 1fr)`).
`li.post-card`: paper plate, inset hairline, `content-visibility: auto; contain-intrinsic-size: auto 280px`; DOM order
title, date, excerpt, Read More; `h2.post-card__title > a.post-card__link` (text 700 `--n-h4`, stretched, engraved
underline on hover and focus); `p.date-pill` meta caps `green-700` with the clock icon (no pill fill);
`p.post-card__excerpt` `--n-sm` at 52ch; `a.more`. First 12 carry reveals. **Pagination: not built** (F.5 stays
reserved, operator decision).

### 3.18 Blog post (COMPONENTS C.3, kept)

`band--plain` with the h1 and the date line; the aside; prose sheets (3.15); the source's picture as `fig--plate` (or
`fig--photo` from 480px native); the 2 YouTube posts use `embed--video`. No previous/next navigation.

### 3.19 Forms and the inert notice (COMPONENTS E, kept markup: `src/lib/forms.mjs` emits it)

`section.sheet.sheet--form` (paper plate). `div.form__intro` prose; `div.form__grid` two columns from 768px
(`field--wide` spans both).
- `label.field__label` / `legend` 600 `--n-ui` `ink-900`; `span.field__req` "*" `alert`; `p.field__help` `--n-sm`
  `ink-600` at 52ch.
- `.field__control`: **square**, paper, 1px `ink-500` boundary (UI 4.00), `min-height: 48px`, padding 12px 14px,
  `--n-base`. Hover: `green-700` boundary. Focus: `green-700` boundary plus the 3px ring. `select` with a CSS chevron.
- `.choice`: native radio kept (visually hidden, focusable), a 22px circle drawn on `label.choice__label::before`
  (1px `ink-500`), checked: a 10px `green-700` dot; focus ring on the drawn circle via `:focus-visible + label`.
- Invalid (`is-invalid`, `aria-invalid`): `alert` boundary, `alert-50` fill, `p.field__error` `alert` with the
  alert icon and the browser's `validationMessage`.
- **The honest notice** `p.form__notice` (role status, focused when shown): a `green-50` plate with a 4px double
  `green-700` rule on its left edge, `ink-900` text, the tel link `green-700` in `span.nw`: "This form is not
  connected yet — please call 318-550-5815". Nothing is sent; no mailto. Operator option (DESIGN-SPEC 7.6 #4): the
  same sentence also above the form.
- `div.form__foot`: the notice, then `button.btn.btn--primary` "Submit".

### 3.20 Logo grids, payment row, QR plate (COMPONENTS B.21, kept)

`ul.logo-grid`: `repeat(auto-fill, minmax(140px, 1fr))`, gap 12px. `li.logo-chip`: **paper**, square, inset
hairline, `min-height: 104px`, padding 14px; logos T0 at intrinsic size (never upscaled), `max-height: 70px`;
`span.logo-chip__name` `--n-sm` `ink-900` only where the source prints it. Only `logo-chip--link` has states: lift
-4px, a fine `green-700` rule appears, focus ring. `ul.pay-row` of 51 x 32 icons inline. `figure.qr-plate`: paper
plate at the QR's intrinsic 250px, byte-identical file.

### 3.21 CTA band (COMPONENTS B.22, kept scope)

Only around the source's own button groups on the 9 builder pages. `section.cta-band` (or `div`): the deep laurel
band, `green-800` fill, square, padding `clamp(28px, 4vw, 56px)`, `span.cta-band__frame` (new; replaces
`cta-band__rings`) a 1px `rgb(189 213 143 / .45)` hairline inset 10px; `h2.cta-band__h` display 75% `--n-h2-prose`
`paper` (10.08);
`p.cta-band__actions` with `a.btn.btn--invert` (paper fill, `green-800` text; external targets keep `rel="noopener"`);
focus ring `focus-on-dark`. No ornaments (interior budget).

### 3.22 Team card and doc cards (COMPONENTS F.4, kept)

`article.team-card` (plate): `figure.team-card__photo` arch mask on Dr. Clifton's 225 x 397 portrait (T0, 225px at
most, never protrudes, no laurel, never on the dark ground); `h2.team-card__name` display 75% `--n-h2-prose`
`slate-900`; `a.more`. The page's tel button (`btn--primary`) and the emergency `div.sos` follow in source order. No
generated image on these pages (the build excludes them: "Dr. Clifton"). `ul.doc-cards`: `li.doc-card` plates, the
`doc` icon, the label 600 `--n-ui` with the engraved underline, 56px tall.

### 3.23 404 (COMPONENTS F.7, kept)

`band--plain` with the source h1 "404"; `section.sheet.sheet--404` (plate) with the source copy ("The Diagnosis / The
Treatment", "(We are Eye Doctors after all!)", its links) and `404.png` as `fig--plate`; `img.sheet__cut` is
`neo-cut-eye-relief` (T3, via the 404 cut of build hook 1), breaking the sheet's top-right frame by 48px, 24px or
more from text. `dist-neo/404.html` keeps the root-relative exception.

### 3.24 Template map

| family (pages) | band | scene in the niche (T5) | cut-out | aside, rail | body |
|---|---|---|---|---|---|
| home (1) | hero 3.3 | none | bust | none | 3.4-3.12 |
| service-hub (5) | `/eye-care-services/`: `--photo`; others `--scene` | `neo-scene-colonnade` | `neo-cut-eye-relief` | as COMPONENTS C.1 | sheets, index cards, dock row, CTA band |
| service-detail (13) | `--scene` | `neo-scene-colonnade` | 6.3 table | aside + rail | sheets, `svc-*` feature |
| library-article (101) | `--scene` (new: glass was plain) | `neo-scene-library` | `neo-cut-bust-profile` on the 13 section indexes only | aside + rail | sheets, TOC rows, index cards |
| eyewear-contacts (47) | 4 hubs `--photo`; others `--scene` | `neo-scene-arch-garden` | `neo-cut-hand-spectacles` (brand pages: none) | as C.1 | sheets, logo walls, QR plate |
| insurance (4) | `/insurance/`: `--photo`; children `--scene` | `neo-scene-colonnade` | none | children | logo grid, CTA band, index cards |
| contact-forms (6) | `/hours-location/`: `--photo`; others `--scene` | `neo-scene-colonnade` | none | as C.1 | forms, doc cards, visit block |
| blog-index (1) | `--scene` | `neo-scene-library` | none | none | post cards |
| blog-post (151) | `--plain` + date | none | none | aside | prose |
| doctor-team (2), staff (1), legal (4), testimonials (4), archive (5), platform-artefact (4) | as glass | none (most name Dr. Clifton; the build excludes them) | none | as C.1 | as C.1 |

Any page whose main text trips the build's exclusions (brand names, "Dr. Clifton", "Deana", "Ask Dr.", a brand logo)
renders its `--scene` band as `--plain` with no niche, exactly as glass (`src/build.mjs` 533-556, COMPONENTS C.2).

### 3.25 New classes, markup and hooks (the build must add these; everything else keeps its glass name)

**New elements and classes** (neo templates, home, CSS):
- Global: `div.ground`; `span.nw`; `div.sec-head`, `div.sec-head--quiet`; `div.pediment`, `pediment--hero`,
  `pediment--footer`; `span.cornice`; `span.numeral`, `numeral--band`; `div.divider`; `span.arch-mark`; `span.arch`,
  `span.arch__photo` (home arches); `span.pilaster`, `pilaster--l`, `pilaster--r`; `svg.star`, `star--tl|tr|bl|br`;
  `span.meander`; `.plate` (utility for home plates); `svg.laurel-sprig`, `laurel-sprig--r`; `div.tag-row`;
  `.deco--light`, `.deco--dark`, `.deco--deep` (modifiers of the kept `div.deco`).
- Sprite symbols: `o-rosette`, `o-star`, `o-badge`, `o-sprig`.
- Header: `div.site-header__actions`, `a.site-header__call`, `a.site-header__appt`; `mainnav__list--l`,
  `mainnav__list--r` (the split list, 3.2); `div.progress` moves inside the header.
- Hero: `hero__frame`, `hero__line--1`, `hero__line--2`, `hero__pedestal`, `hero__stylobate`; `nav.dock--portico`;
  `svg.dock__ring`.
- Home: `news__cut`, `services__relief`, `help__niche`, `designer__head`, `map-plate`, `map-plate__ledge`,
  `visit__magnifier`, `visit__column`, `nap--stele`, `nap__medal`.
- Footer: `div.footer__frieze`, `div.footer__bays` (replaces `footer__panel`).
- Interior: `band__frame`, `band__divider`, `band__niche`, `band__arch`, `band--has-cut`; `cta-band__frame`
  (replaces `cta-band__rings`).

**Not rendered in neo** (glass-only): `div.field` and `blob*`, `orb*`, `iris*`, `img.sprig`, `svg.swash`,
`hero__stage` / `__scene` / `__veil` / `__sun` / `__beams` / `hero__copy`, `span.site-header__glass`,
`services__band`, `svg.review__q`, `band__veil`, `band__rings`, `cta-band__rings`, `.pop`, `help__iris`, `data-tilt`,
`data-rot`, `data-hero`.

**Hooks** (site.js contract, COMPONENTS 1, unchanged except):
- `data-reveal` values: `up` and `rise` (the same slow rise), `arch`, `settle`. `left`, `right` and `blur` are not
  emitted by neo templates (the build emits only `up`).
- **New `data-settle`** (one element per page, the #HappyPatients title): site.js writes `--settle` (0 to 1) from the
  scroll handler at 1024px and wider with motion allowed; CSS: `letter-spacing: calc(.08em - .06em * var(--settle,
  1))`.
- `data-depth-max` is **required** and 32 or less (default removed).
- The drawer, accordion, rail, sticky-fit, carousel, hours and form hooks are the glass ones.

---

## 4. Layering and protrusion rules

Values are **targets at rest** (reduced motion, or a viewport over 2400px tall), after the fonts load. NG4 passes when
each measured value is within ±8px, or a changed value is recorded with its reason. **Parallax may never erase a
protrusion:** every `data-depth` element carries `data-depth-max` of 40% or less of its rest offset and 32px or less.

### 4.1 Home

| element (plane) | breaks | 320 / 390 | 768 | 1024 | 1440 | rule |
|---|---|---|---|---|---|---|
| bust (N2) over the poster lines (N1) | line 4 "CLINIC" (< 700) / line 2 "CARE" | coverage ≤ .30 | ≤ .30 | ≤ .30 | ≤ .30 | ≤ 2 glyphs over .20 per line; control fires (NG5) |
| script (N1 accent) over line 2 | "EYE" | 0 letters | 0 letters | ≤ 2 letters, ≤ 35% depth | same | text-shadow halo; ≥ 24px before the bust's head |
| photo arch (T1, N1) | hero seam | 40px | 61px | 82px | 115px | `--n-seam`; never under the script's glyph box |
| pedestal (N2) | stylobate and seam | hidden | 61px | 82px | 115px | contact shadow under the bust |
| portico niches (N3) | seam (lower row) | n/a | n/a | n/a | half the niche height (about 86px) | 1200+ only |
| phone plates (N3) over the bust base (N2) | bust base | 24-40px overlap | n/a | n/a | n/a | < 700 only; all 4 inside 844px at 390 |
| eye relief (N2) | Welcome/Services seam | 40px up and down | 40px | 51px | 72px | `clamp(40px, 5vw, 72px)`; ≥ 24px from the Services title |
| promo arch (N1) | its plate top | 44px | 58px | 58px | 58px | left edge ≥ 16px inside the viewport |
| hand (N4) | What's New frame | hidden (< 560) | 12px into the frame | same | same | ≥ 24px from text |
| service arches (N1) | plinth plate top | 28% of arch height | same | same | about 200px | measured |
| smile medallions (N2, z 4) | Services/reviews seam | centred on it | same | same | same | ≥ 24px from the service plates and the tag title |
| designer plates (N3) | band bottom edge | 2nd row hangs 150px | 84px | 84px | 101px | `clamp(84px, 7vw, 104px)`; the Visit padding clears them |
| brand-name plaques (N3) | plate bottom margin | 24px | same | same | same | never over the ad |
| map plate magnifier (N4) | mat frame rule | lens on the ledge | same | same | same | never over the iframe |
| column (N2) | map mat outer rule | hidden | hidden | hidden | ≥ 12px past the rule | 1100+; never over the iframe |
| NAP stele (N3) over the column | column right side | n/a | n/a | n/a | 24-40px | 1100+ |
| NAP medallion (N4) | stele crown | hidden | hidden | hidden (< 1100) | half its height above | ≥ 24px from the title |
| Q&A plate (N3) over the help niche (N1) | niche right rule | n/a | n/a | 31px | 43px | `clamp(24px, 3vw, 48px)`, 1024+ |

Section order of crossings (tree order does the stacking, 2.8): hero figures cross into Welcome (Welcome's padding-top
= the largest crossing + 48px); the relief belongs to Services and crosses up; the smiles belong to reviews (z 4) and
cross up; the designer plates cross down (Visit's padding-top clears them); nothing crosses into the footer.

### 4.2 Interior

| element | breaks | offset | rule |
|---|---|---|---|
| band cut-out (T3, N2) | the band niche's crown or side rule, then the band's bottom edge | head 12-22% of the arch height above the crown; base `--n-cross` below the edge (24px at 390, about 51px at 1024, 72px at 1440) | lands in the `band--has-cut` margin, never on a plate or the h1 |
| `band--photo` visual (T1) | band bottom edge | `--n-cross` | 1024+; below, under the title |
| `fig--photo` | sheet padding, one side | `clamp(8px, 2.4vw, 36px)`, alternating | never diagrams, logos, the QR code, the portrait |
| index-card thumbnail | card top | 32px | the 25 thumbnailed children only |
| 404 relief | sheet top-right frame | 48px | ≥ 24px from text |
| CTA band, forms, tables, aside | none | none | depth from rules and shadows only |

### 4.3 Collision and legibility (gate NG5)

A figure never covers body text, links, buttons, form fields, a phone number, the logo, the nav or a person's face in a
photo, and keeps **24px or more** clear of them (NEO-BRIEF 5.3.5). Exceptions by design: the bust over the poster line
(coverage-gated) and plates over figures (N3 over N2, which is the brief's layering). The rendered-contrast probe
counts covered glyph pixels as covered, not as text (poster lab `contrast-probe.figures-hidden.json` method).

### 4.4 No-horizontal-scroll guard (gate NG3)

1. Never `overflow-x` on `html` or `body`. Sections have no overflow property; only `.deco` clips.
2. Every horizontal offset is bounded by the gutter: pilasters sit inside the wrap's padding (46px from 1024px),
   figures use `max()` against 8px, medallion rings stay inside their grid column (temple found an 18px overflow at 320
   from the tondo rings, and poster a 6px one from an arch ledge pseudo-element).
3. Rotated or animated decoration (the script's -4deg, medallion turns, the settle's wide pose) is measured at its
   widest pose; the settle start pose must fit (8.15em x 120px = 978px, under the 1240px wrap).
4. Measurement: one foreground headless Chrome, 320/390/768/1024/1440, normal and reduced motion, the home page plus
   one page per family plus the 404: scroll through, then sample `scrollWidth` **12 times over about 6 seconds**; it
   must equal `innerWidth` every time, and `tools/overflow.mjs` plus the pseudo-element bisect
   (`tmp/lab-neo/temple/work/bisect-overflow.mjs`) must list nothing.

---

## 5. Motion, hover and focus, reduced motion

### 5.1 Reveal variants

| variant | hidden state | entrance | used on |
|---|---|---|---|
| `rise` (and `up`, emitted by the build) | opacity 0, `translate: 0 28px` (20px below 700) | 1.1s `--n-ease`, stagger 120ms (index mod 6) | plates, cards, stelae, sheets, section heads below the hero |
| `arch` | `clip-path: inset(100% 0 0 0 round 999px 999px 0 0)` | to `inset(0 0 0 0 round 999px 999px 0 0)`, 1.3s, .15s delay | the service arches, the promo arch (never an above-fold arch, never the LCP) |
| `settle` | **opacity 1**, `scale: 1.04` | to 1 over 1.6s | the hero photo wrapper only (the LCP is never hidden) |

Budget: 40 revealed elements per page; long lists reveal their first 12. Nothing in the hero or the interior band
reveals except the settle (the band title's `data-reveal="up"` from COMPONENTS C.2 is dropped by neo `T.band`: it is
above the fold on every page). `@supports not (clip-path: inset(0 round 1px))`: `arch` falls back to `rise`.

### 5.2 Reveal implementation: the traps (DESIGN-BRIEF, DESIGN-SPEC 5.2, and the neo labs)

1. **`js-motion` is set in `<head>` before first paint** (the glass `HEAD_SCRIPT`, `src/lib/templates.mjs` 47), never
   under reduced motion, rolled back after 4s unless site.js sets `window.__siteReady`. Temple added it from lab.js at
   the end of `body`; that is the defect (content can paint, then vanish, then fade back).
2. **The hidden state has no transition; only `.is-in` animates** (temple 748-753).
3. IntersectionObserver `root: null, rootMargin: '0px', threshold: 0`; unobserve after the reveal. Never a ratio
   threshold (a tall form can never show 8% of itself).
4. **Release** `data-reveal`, `is-in` and `--i` after the entrance (rise 1150ms, arch 1500ms, settle 1700ms, plus
   i x 120ms), so reveal rules never outrank hover transforms.
5. **The fail-safe runs only if the observer never delivered an entry** (3s); `beforeprint` releases everything.
6. No scroll-timeline reveals; if ever added: never `cover N%` ranges, fixed-length entry ranges plus an at-load
   exemption.
7. **Scrolled-past release (gallery lab.js 71-80):** a fast jump (End key, scrollbar drag, an anchor or find-in-page)
   can carry an element past the viewport between two frames, so the observer never sees it intersect. On every
   scroll tick, any pending reveal whose `getBoundingClientRect().bottom < 0` is revealed at once. Evidence: without
   it, 17 elements stayed hidden after a jump in the gallery lab; with it, 0.
8. **Tall viewports:** when `innerHeight > 2400` every pending reveal is released at once and parallax rests (temple
   lab.js 89-92 and 101-102; full-page captures show the designed composition, never a half-revealed plate).
9. Under reduced motion `transition-duration: .01ms !important` turns any property change into a 0.01ms transition:
   probes that inject CSS must wait a frame before reading styles (poster lab finding).

### 5.3 Scroll-linked effects (one rAF-throttled passive handler, temple lab.js 13-70)

- **Progress rule:** `--scroll` on `<html>`; the 2px `green-600` rule under the header. It stays under reduced
  motion (direct feedback).
- **Header state:** `is-scrolled` above 40px: shadow, logo `scale: .82`, the scrolled actions (3.2). Transform and
  visibility only.
- **Statue parallax** on `[data-depth]` (.03-.07): offset = clamp(-(element centre - viewport centre) x depth x k,
  ±`data-depth-max`), k = 1 (0.55 below 700px); skip layers more than 1.5 viewports away; re-measure on `load`,
  `document.fonts.ready` and resize with `--py` reset while measuring; rest at 0 when `innerHeight > 2400`. Figures:
  the relief, the hand, the smiles, the magnifier, the column, the band cut-out. **Not** the hero bust or the hero
  photo (they stand on something), not the NAP medallion (it sits on the crown).
- **Letter-spacing settle:** the #HappyPatients title, 1024px and wider, `.08em` to `.02em` as it rises from the
  bottom of the viewport to 55% up (temple lab.js 45-52); opacity stays 1.
- **Medallion turn:** 45deg on its link's (or container's) hover and focus only. **No ambient loops.**

### 5.4 Hover and focus (keyboard parity)

Every `:hover` rule has an identical `:focus-visible` partner (`:focus-within` for containers). Movement-only hover is
inside `@media (hover: hover) and (prefers-reduced-motion: no-preference)`; the focus movement is inside
`@media (prefers-reduced-motion: no-preference)`; colour, rule and underline changes apply everywhere.

| component | hover and focus-visible | timing |
|---|---|---|
| nav, footer, legal, crumbs, rail, news title, NAP title, `.more`, title link, section links | engraved underline grows from the centre; colour `green-800` on light, `paper` on dark | .45s |
| prose links | the second hairline appears | .45s |
| top-strip plaques | `green-950` fill, `green-100` text, inner rule `green-300` | .45s |
| round buttons | `green-700` fill, `paper` glyph | .45s |
| buttons | fill darkens, inner rule 3px to 5px, -2px | .35s |
| portico niche | arch lift -6px, outer rule 9 to 13px, keystone +4px, ring 45deg, fill `paper` / `green-800` | .6s, ring .8s |
| plaque (aside, row, 700-1199 hero) and phone plate | lift -4px (plates: none), arrow +4px, rule `green-700`, fill `paper` | .45s |
| service arch card | arch lift -6px, rule 8 to 12px, photo 1.03, name `green-800`, arrow +6px, `--n-e-lift` | .6s, photo .9s |
| index card, post card (`:focus-within` on the card) | lift -6px, thumbnail -6px, title underline, arrow +6px | .45s |
| accordion summary | underline on the question, text and rosette `green-800`; `[open]` turns the rosette 45deg | .45s, rosette .8s |
| designer plate | lift -4px, fine `green-950` rule appears, `--n-e-lift` | .45s |
| linked logo chip | lift -4px, fine `green-700` rule | .45s |
| social medallion | `green-300` fill, turn 45deg (glyph counter-turns) | .8s |
| NAP stele (`:focus-within`) | medallion turn 45deg | .8s |
| form control | boundary `green-700` (hover); focus adds the ring | .2s |
| carousel buttons | `green-700` fill, `paper` glyph | .3s |

Focus rings per surface (2.1); the two-tone ring on straddling niches. **Targets:** 44px minimum on phones for every
control (plaques 64px or more, round buttons 44px, drawer links 52px, accordion rows 60px, footer and legal links
44px); inline prose links and desktop legal links 24px or more.

### 5.5 Reduced motion

`js-motion` is never set, so nothing is ever hidden; no parallax (the handler returns before writing `--py`), no
clip, settle or letter-spacing animation, no rotation (the accordion rosette stays square when open), no drawer slide;
`*, *::before, *::after { animation: none !important; transition-duration: .01ms !important; transition-delay: 0s
!important; scroll-behavior: auto !important; }`; hover and focus keep colour, rule and underline changes and lose
every `transform`, `translate`, `rotate` and `scale`. The carousel scrolls instantly. The progress rule still tracks.

### 5.6 Property ownership

`translate`: the reveal entrance **or** parallax, never both on one element (wrap one in the other); hover lifts use
`translate` only on elements that neither reveal nor parallax, or on an inner child. `scale`: the settle, and hover
photo zoom on an inner `img`. `rotate`: the script's tilt, medallion turns. `clip-path`: the arch reveal. `opacity`:
reveals only. `letter-spacing`: the settle only.

### 5.7 WebKit (cannot be tested here, gate NG13)

Removed from the risk list by this spec: `filter: url()` on `<img>` (all tones are baked), `cqi` units (dropped),
`paint-order` halos (text-shadow halo). Still to check on an Apple device: `-webkit-mask` meander (with its double-rule
fallback), animated `clip-path: inset(... round ...)` (with its `rise` fallback), the individual `translate` /
`rotate` / `scale` properties, `text-wrap: balance` (progressive), subgrid on the interior frame, `content-visibility`.

---

## 6. Image slot map

### 6.1 Rules

- Only the reviewed files of `src/content/image-plan-neo.json` (12 of 12 accepted in `audit/generated-images.json`,
  checked 2026-09-29) and the source photos. A missing or unreviewed file means an empty slot, never a placeholder.
- Every generated image ships as a build derivative with the IPTC `trainedAlgorithmicMedia` XMP label (build hook 2;
  IMAGE-PLAN-NEO 3.6), is decorative (`alt=""`) in every slot below, and is never captioned or placed as Dr. Clifton,
  staff, the office, a patient, a result or a brand.
- **Exclusion unit.** Interior pages: the page (the build's `useGen`: brand names, "Dr. Clifton", "Deana", "Ask Dr.",
  brand logos in main). **Home: the section.** The home page as a whole names brands and Dr. Clifton, so the page-level
  rule of NEO-BRIEF 5.6 would forbid every generated image there; the glass home (DESIGN-SPEC 6.1) already applied it
  per section (generated images only in the hero and on the Welcome/Services seam; the #HeretoHelp emblem was CSS).
  Neo does the same: **no generated image in #HappyPatients, #HeretoHelp or Designer**. The temple lab's eye relief and
  colonnade in the #HeretoHelp niche broke this; they move (7.3 #1).
- People stay in colour (T1); stone goes T3; scenes in niches go T5; logos, brand images, diagrams and the doctor's
  portrait stay T0.

### 6.2 Home

| slot | image | treatment | display size (1440) | notes |
|---|---|---|---|---|
| header logo | `assets/brand/logo-clifton.png` (build `logoHeader`) | T0 | 116px wide | original inks on the light header |
| footer logo | `assets/brand/logo-clifton-light.png` (`logoFooter`) | T0 | 100px | reversed, in the tympanum |
| hero ground | `--n-ground-dark` | baked (2.7) | full bleed | plus grain |
| hero photo (LCP) | `assets/source/6a111a60-Girl-Smiling-Brown-Hair-1280x853.jpg` | T1 | 300 x 400 arch | `alt=""` (L12), `fetchpriority="high"`, preloaded |
| hero statue | `neo-cut-bust-glasses` | T3, 760px wide | `--bust-w` ≤ 310px | the far-lens grey wedge is accepted (IMAGE-PLAN-NEO 3.1) |
| promo | `assets/source/ea0df44c-contact-in-water.jpg` | T1 | 184px arch | `alt=""` |
| What's New hand | `neo-cut-hand-spectacles` | T3, 560px | ≤ 260px | 560px and wider; N4 on the frame |
| Welcome/Services seam | `neo-cut-eye-relief` | T3, 560px | ≤ 240px | keystone relief over the Services pediment |
| service arches | `81b71862`, `291abc74`, `0d41af0c`, `e0cfe7e9` (source) | T1 | arch 72% of card | `alt=""`, `object-position` per photo (`tmp/lab-neo/temple/index.html` 244-262) |
| smile medallions | `663dba41`, `34ee7792`, `48c72009` (source) | T1 | 140 / 180 / 140px | `aria-hidden`, never beside a quote |
| #HappyPatients | SVG `o-sprig` pair | ornament | 88px | no generated image |
| #HeretoHelp | CSS niche with the `o-rosette` patera | ornament | 300px | no generated image (operator option 7.6 #1) |
| designer ads | `f502f0b5-Kaenon-Ad.jpg`, `e33aad07-IZOD-Ad.jpg`, `81fe17d9-AlanJ_250x300.jpg`, `f3fc2141-Converse-20Ad.jpg` | T0 | 250 x 300 native | alts verbatim |
| map | keyless Google embed | n/a | map plate | real; fallback link |
| Visit magnifier | `neo-cut-magnifier` | T0 colour, 600px | ≤ 300px | lens over the dark ledge only |
| Visit column | `neo-cut-column` | T3, 480px | ≤ 240px | 1100+ |
| NAP medallion | `neo-cut-laurel` | T0 patina, 400px | 150-170px | 1100+, around an `o-rosette` (no copy) |
| footer ground | `--n-ground-deep` | baked | full bleed | |

### 6.3 Interior (`src/themes/neo/images.mjs`, build hook 1)

**Band scene by family** (`bandPlan`; `--photo` pages unchanged from glass `PHOTO_PAGES`, `src/build.mjs` 370):
service-hub and service-detail, insurance, contact-forms: `neo-scene-colonnade`; eyewear-contacts:
`neo-scene-arch-garden`; library-article and blog-index: `neo-scene-library`; every other family: `--plain`. All T5,
cropped 3:4 on the centre, 640px wide.

**Cut-out by URL prefix, first match wins** (then the exclusions):

| prefix | cut-out |
|---|---|
| the 13 `your-eye-health` section indexes (`LIB_INDEXES`, `src/build.mjs` 340) | `neo-cut-bust-profile` |
| `/eye-care-services/eye-exams/pediatric-eye-exams/`, `/eyeglasses-contacts/eyeglasses/kids-optical/` | `neo-cut-hand-spectacles` |
| `/eye-care-services/eye-exams/` and children | `neo-cut-eye-relief` |
| `/eye-care-services/contact-lens-exams/`, `/eyeglasses-contacts/contact-lenses/`, `/order-contacts-online/` | `neo-cut-eye-relief` |
| `/eyeglasses-contacts/eyeglasses/transitions-lenses/`, `/eyeglasses-contacts/eyeglasses/designer-frames/`, `/promotions/` | **none** (brand pages) |
| `/eyeglasses-contacts/` and the rest of `/eyeglasses-contacts/eyeglasses/` | `neo-cut-hand-spectacles` |
| `/eye-care-services/` hub, `eye-conditions/`, `management-of-ocular-diseases/`, `eye-emergencies-pinkred-eyes/`, `lasik-refractive-surgery-co-management/` | `neo-cut-eye-relief` |
| 404 (the `sheet__cut`) | `neo-cut-eye-relief` |
| everything else | none |

`neo-cut-bust-profile` is never on `/our-eye-doctors/`, `/team/*` or beside Dr. Clifton copy (the exclusions already
remove those pages; the image plan's "companion on Our Eye Doctors" proposal is not adopted).

### 6.4 Content images

- The glass `svc-*` feature figures and the four `fillFor` slot-fills stay as glass places them (the build's shared
  `SVC` table and `src/content/image-plan.json`; T1 in the neo fine double frame, their plan alts, L18).
- Every other source image: as classified in `docs/IMAGE-PLAN.md` section 1, at or below native size, in the role of
  COMPONENTS D.3.

### 6.5 Derivatives and delivery

| id | recipe | max width (px) | measured WebP bytes (cwebp q82, `tmp/neo/spec/`) | source bytes |
|---|---|---|---|---|
| `neo-cut-bust-glasses` | T3 | 760 | 36,822 | 2,152,199 |
| `neo-cut-bust-profile` | T3 | 560 | 20,332 | 1,771,131 |
| `neo-cut-column` | T3 | 480 | 25,758 | 2,005,993 |
| `neo-cut-hand-spectacles` | T3 | 560 | 15,200 | 541,950 |
| `neo-cut-eye-relief` | T3 | 560 | 16,278 | 939,753 |
| `neo-cut-magnifier` | T0 resize | 600 | 13,126 | 1,366,475 |
| `neo-cut-laurel` | T0 resize | 400 | 25,296 | 720,558 |
| `neo-scene-*` | T5, 3:4 crop | 640 | colonnade 30,462 (q76) | 1.24-1.9 MB |
| grounds | 2.7 | 1600 | light 7,640, dark 12,062 (q60) | 0.85-1.95 MB |

All 12 full-size neo files total 16,613,905 bytes on disk (`assets/generated/neo-*`; the temple home loaded about
9.8 MB of them, per the judges); the derivatives the home page needs (its six cut-outs plus the light and dark grounds;
the deep ground was not encoded) measure 152,182 bytes together in this test. The shipped numbers come from `dist-neo`
(NG10). WebP with alpha for cut-outs (`-exact -alpha_q 90`), `width` and `height` on every `img`, `loading="lazy"`
below the fold, never upscaled; the QR code byte-identical.

### 6.6 New generated images: none

No entry is added to `src/content/image-plan-neo.json` (0 of the 8 allowed). Every slot above is filled by the 12
accepted files, the source photos, or ornament; the only section without a figure (#HeretoHelp) is empty by rule, not
by a missing file, so a new image would not be allowed there either.

---

## 7. Grafts, must-fix resolutions, ledger, gates, decisions

### 7.1 Grafts adopted

| from | graft | where |
|---|---|---|
| poster | phone hero: bust beside the script, 2x2 plates over the bust's base; all four actions in the first 844px | 3.3, 3.4 |
| poster | "We Know You!" crossing the lower caps of line 2 at 1024px+ (≤ 2 letters, ≤ 35%) | 3.3 |
| poster | pilaster brackets flanking "Our Designer Optical" | 3.10 |
| poster | Welcome as aside (promo, What's New) plus article; the interior template pattern | 3.7 |
| poster | family token rename (the `--n-script` collision) | 2.2 |
| gallery | the real woman photo as a large arch that crosses the hero seam and leads | 3.3 |
| gallery | Visit three planes: map plate, the column across its rule, the NAP plate in front | 3.11 |
| gallery | the marble hand resting 12px into the What's New frame | 3.7 |
| gallery | laurel sprigs flanking #HappyPatients | 3.8 |
| gallery | wall-label plaques over the designer plates' bottom edges | 3.10 |
| gallery | the daylight marble band (frame, stars) as the interior title band; the dark temple front stays on the home | 3.13 |
| gallery | `.nw` for every phone number | 3.0 |
| gallery | the second h1 line as a `slate-700` serif line | 3.7 |
| gallery / poster | left-aligned, roman review quotes on light plates, natural heights | 3.8 |
| gallery | releasing reveals already scrolled past | 5.2 #7 |

**Not adopted:** the poster lab's dark header on every page (only the reversed logo showed; the brand's original-ink
logo leads on the light header); its three dark bands (daylight dominates, NEO-BRIEF 1.3); its lone numeral "I" in
empty hero space (read as a stray glyph); the marble hand pressed on the real woman's shoulder (uncanny); the gallery
lab's stacked 171px masthead (it cannot be sticky); CSS multi-column prose (splits lists); any laurel near a person;
the gallery lab's double-rule "room numeral" dividers (temple's pediment and arch-mark numerals already number the
sections; a third numeral style would be noise).

### 7.2 The judges' must-fix list and how this spec resolves it

| # | must-fix (judges) | resolution |
|---|---|---|
| 1 | #HeretoHelp colonnade in duo-night reads as a flat saturated green slab (all three) | T5 tritone with a gamma (2.10, evidence images); the colonnade moves to the title-band niches (6.3); the home niche becomes the CSS blind niche (3.9) |
| 2 | Phone quick actions below the fold (y≈897 at 390); also y774 at 1024x768, y967 at 1440x900 (UX) | phone plates over the bust base; 700-1199 plaque list in the right bay; 1200+ 2x2 niches in the right bay; gate NG9 at all three sizes (3.3, 3.4) |
| 3 | The real woman photo shrunk to a 280px tondo; the statue leads (all three) | a 3:4 arch at 300 x 400 (about 1.8x the area), LCP with priority, preloaded; NG9 records the LCP element (3.3) |
| 4 | Bust hides 35-40% of glyphs in CARE (0.40 at 1440) | coverage ≤ .30, ≤ 2 glyphs over .20 per line, re-run `coverage.mjs` with its control (3.3, NG5) |
| 5 | The script-over-serif trait is missing from the hero | poster graft, halo by text-shadow, `script-overlap.mjs` with its control (3.3, NG5) |
| 6 | Script inside the h1 ("in Bossier City, Louisiana" in Parisienne) (UX) | serif `slate-700` line; one script phrase per page (3.7) |
| 7 | Payload: about 9.8 MB of full-size assets, runtime SVG duotone filters | baked, display-size derivatives (measured sizes in 6.5); pre-composited grounds (2.7); `filter: url(` count 0 in shipped CSS (NG10) |
| 8 | Phone page 11,306px at 390 | carousel below 1024, smaller hero, `--n-sec` 48px on phones; gate ≤ 10,300px (NG18) |
| 9 | Symmetry lapse at #HeretoHelp | centred head over a two-bay body anchored by the niche (3.9) |
| 10 | "Map placeholder" text and plate | the real keyless embed in a map plate; no placeholder ships (3.11) |
| 11 | WebKit untested (filter:url on img, -webkit-mask, cqi, clip-path round) | the first and third removed; fallbacks for the others; NG13 on an Apple device (5.7) |
| 12 | Phone number breaks mid-number (footer at every width, stele at 768/1024) | `span.nw` on every visible number plus `a[href^=tel]` nowrap; NG19 (3.0) |
| 13 | Reviews centred light italic on dark; empty space in short cards | light stelae, left-aligned roman quotes, natural height (3.8) |
| 14 | Footer "Important Links" right-aligned | both columns left-aligned (3.12) |
| 15 | Appointment and call unreachable after scrolling on desktop | scrolled header round buttons from 1024 (appointment) and 1280 (call), ledger N03 (3.2) |
| 16 | Hero pedestal is a flat veined box | cylindrical shading, cap and base mouldings, contact shadow (3.3) |
| 17 | Fonts not preloaded (file:// lab) | two preloads in `head()` over http (2.2) |
| 18 | Designer band has only a bare "VI" | pilaster brackets and wall-label plaques (3.10) |
| 19 | The unused column and hand; the Welcome triptych has no figure | hand on What's New (3.7); column in the Visit planes (3.11) |
| 20 | Explain or fix the hover tool's constant "55 Tab presses" | **explained (likely, unverified in a browser):** a static count of `tmp/lab-neo/temple/index.html` gives 60 links + 2 buttons + 3 summaries, minus the 5 hidden drawer links, its close button and the 3 hidden mobile actions = **56 tab stops at 1440**. A constant 55, within one stop of the whole tab order, means each search wrapped once around the page, starting from the target itself (Chrome's sequential-focus starting point stays on the last focused or blurred node). The MATCH verdicts stay valid (each target did reach real `:focus-visible`), but the count is useless. **Fix:** before each target, focus and blur the skip link (a fixed start), compute the target's index in the tab order, and assert the press count equals it; flag any target whose count equals the total (NG6) |

### 7.3 Departures and new defects found while writing this spec

1. **Generated imagery in the "Ask Dr." section (new).** Temple put `neo-cut-eye-relief` and `neo-scene-colonnade` in
   the #HeretoHelp niche beside "Ask Dr. Deana Clifton a Question...", against NEO-BRIEF 5.6 and the glass home
   precedent. Moved (6.1, 3.9); the operator may restore it (7.6 #1).
2. **Temple markup against COMPONENTS:** `js-motion` set from an end-of-body script (5.2 #1); skip link to `#content`
   (A.3); `aria-label="Welcome"` on the hero and "Location and hours" on Visit (invented labels, H.1 #8); the drawer
   labelled "Primary (mobile)" and driven by `data-open` (H.1 #7); the `<strong>` lead terms of the services list
   dropped (L07); `fetchpriority="high"` on the decorative bust. All fixed by building from the COMPONENTS markup.
3. **Ornament budget (NEO-BRIEF 4.9) amended for the home page:** 2 pilaster pairs (hero, designer band) instead of 1,
   both 1024px+ only and never taller than what they flank; badges: 1 (the NAP medallion; the quick-action rings are
   icon frames, not badges). Interior budget unchanged. The current-nav star of NEO-BRIEF 6.4 is a state marker and
   is not counted.
4. **T5 added** to the treatment classes (2.10) for scenes inside niches; T2 and T4 are not used.
5. **Script halo by `text-shadow`** instead of NEO-BRIEF 3.5's `-webkit-text-stroke` plus `paint-order` (engine
   support); the contrast rule (judged against the ground) is unchanged.
6. **Library pages get the scene niche** (glass: plain band), so the 101 library pages carry depth; the 88 non-index
   pages show the scene without a figure.
7. **The band title no longer reveals** (COMPONENTS C.2 had `data-reveal="up"`): it is above the fold on 348 pages.
8. **The primary nav is two lists** in the header (3.2), one in the drawer; COMPONENTS B.2 has one.

### 7.4 Ledger

L01-L23 apply unchanged (DESIGN-SPEC 7.4). Neo adds:

| id | kind | change | why |
|---|---|---|---|
| N01 | ADD | `aria-hidden` roman numerals I-VII on the home section heads | ornament (NEO-BRIEF 1.2); no copy; copy parity skips `aria-hidden` |
| N02 | CHANGE | markup only: every visible "318-550-5815" wrapped in `span.nw` | the number never breaks; text unchanged |
| N03 | ADD | desktop scrolled-header round buttons (Make an appointment 1024+, Call 1280+), the L13 labels | appointment and call reachable after scrolling |
| N04 | ADD | neo generated imagery per section 6 (extends L18), home exclusion by section | the operator's layering request |
| N05 | CHANGE | the home map sits in a framed plate with a ledge (the embed itself as L22) | the Visit composition; no copy |

### 7.5 Verification gates (the build is not done until each is shown with evidence)

All browser gates: one foreground headless Chrome at a time, closed at the end, profile inside the workspace
(`userDataDir` under `tmp/`), `dist-neo/` served over http (`tools/serve.mjs`).

| gate | check | pass |
|---|---|---|
| NG1 | copy parity (`tmp/lab-neo/temple/work/copy-parity.mjs` against `audit/raw`, with its control), home plus one page per family | 0 unexplained; control fails; only N01/L13 labels outside raw |
| NG2 | rendered-pixel contrast probe (`tmp/lab-neo/temple/work/contrast-probe.mjs`) at 320/390/768/1024/1440, fonts loaded, home plus one page per family, plus the figures-hidden variant | 0 fails; controls 4.54 and 3.24; script ≥ 4.5 |
| NG3 | overflow (4.4), normal and reduced | `scrollWidth === innerWidth` 12 of 12; offender and pseudo-element lists empty |
| NG4 | protrusions against 4.1 / 4.2 at rest | ±8px or recorded |
| NG5 | collisions and legibility: `coverage.mjs` (≤ .30), `script-overlap.mjs` (≥ 1024: ≤ 2 letters, ≤ 35%; below: 0), figure clearance ≥ 24px, face boxes, `ornament-overlap.mjs` | all pass; each control fires |
| NG6 | hover/focus: static scan plus the fixed CDP comparator (7.2 #20) on 14 or more components | 100% partnered; all MATCH; no count equal to the tab total |
| NG7 | reduced motion (`motion-check.mjs`) | no `js-motion`; 0 hidden; no `--py`/`--settle`; no transforms on hover |
| NG8 | reveals: 0 pending after a scroll-through; jump-scroll control (`reveal-flake.mjs`, `pending.mjs`) | 0 hidden in or above the viewport; no above-fold opacity drop after first paint |
| NG9 | first screen (`ux-probe.mjs` extended): 390x844 all 4 actions inside 844px and "318-550-5815" visible as text; 1024x768 and 1440x900 all 4 labels inside the viewport and (1440) the hero face box inside it; LCP element at 390 and 1440 via `PerformanceObserver` | pass; LCP = hero photo or title text |
| NG10 | payload: bytes of `dist-neo/img/generated/*` referenced by `index.html` (plus the ground images); `filter:\s*url\(` in shipped CSS | ≤ 400 KB (the test set measured 152,182 bytes without the deep ground); 0 |
| NG11 | touch targets at 320 and 390 (`targets-control.mjs` with its control) | 44px or more, except inline prose and desktop legal links (24px) |
| NG12 | JS errors (`tools/jserrors.mjs`, `MSYS_NO_PATHCONV=1`), with a positive control | 0 |
| NG13 | Safari / WebKit (5.7) | the operator, on an Apple device |
| NG14 | generated images: every `neo-*` file in `dist-neo` carries the XMP label; `tmp/neo/build/image-slots.json` lists every slot; no `neo-*` image in a home section whose text matches the brand or doctor lists | all pass |
| NG15 | secret scan: no `AIza` and no fal key id in `dist-neo/`, with a positive control | 0 |
| NG16 | no platform survivors in `dist-neo/` (`wp-content`, `fl-`, `gform`, `ecp-`, GTM, icon fonts) | 0 |
| NG17 | glass untouched: rebuild glass after the neo hooks land and hash `dist/` by the method of commit 440a6d9 | identical to the committed build (0e6d64d9, 665 files) |
| NG18 | page length at 390 (home) | ≤ 10,300px (temple 11,306); record 1440 |
| NG19 | phone number: each visible "318-550-5815" has one line box (`getClientRects().length === 1`) at 320-1440 | all |

### 7.6 Decisions for the operator

1. **#HeretoHelp figure.** Default: the CSS blind niche, no generated image beside "Ask Dr. Deana Clifton a
   Question..." (6.1). Option: restore the temple lab's carved eye relief as the niche keystone over the colonnade (now
   T5); the relief then leaves the Welcome/Services seam.
2. **"in Bossier City, Louisiana".** Default: a `slate-700` serif line (UX judge). Option: Parisienne, as NEO-BRIEF
   3.3 allows (the craft judge liked it); then the home carries two script phrases.
3. **Which theme ships.** Neo is an exploration beside glass; the operator reviews `dist-neo` (a preview through
   `tools/make-preview.mjs --dist dist-neo`) against the glass preview before choosing.
4. **Scrolled-header buttons** (N03). Default on.
5. **Home ornament budget** (7.3 #3): two pilaster pairs. Default on; off drops the designer brackets.
6. Carried from DESIGN-SPEC 7.6: nav dropdowns (none), blog pagination (none), the section rail (on), the form notice
   timing (on submit), the `/designer-frames/` h1 ("Designer Frames"), the Safari check, a high-resolution logo.

### 7.7 Evidence produced for this spec, and what is unverified

Commands (from the workspace root; everything written under `tmp/neo/spec/`, git-ignored):
- ffmpeg ramp tests of the colonnade, arch-garden and library scenes: `ramps-colonnade.png`, `ramps-2.png`,
  `t5-scenes.png`; T3 on the glasses bust with alpha: `bust-compare.png`.
- `node tmp/neo/spec/stats.mjs <files>` (run from `tmp/neo/spec/`): lightest and darkest opaque pixels, T3 alpha
  parity (0 differing) with a control (69,444 differing).
- `node tmp/neo/spec/pct.mjs`: 2nd / 98th percentile luminance of the baked grounds and the resulting ratios, with the
  21.00 and 4.54 controls.
- Display-size derivative encodes and their byte sizes (6.5): `d-*.webp`.
- Read: `docs/NEO-BRIEF.md`, `docs/COMPONENTS.md`, `docs/DESIGN-SPEC.md` (sections 2-7), `docs/DESIGN-BRIEF.md`,
  `docs/IMAGE-PLAN-NEO.md`, `src/content/image-plan-neo.json`, `audit/generated-images.json` (neo entries),
  `src/styles/tokens.css`, `src/build.mjs` (theme, image and style paths), `src/lib/images.mjs`,
  `src/lib/templates.mjs` (API), the temple lab in full, the gallery and poster graft sources, all 18 review images and
  the moodboard.

Unverified (not measured in a browser for this spec):
- Every hero number in 3.3 and 4.1 (fold positions, coverage, script overlap, the face box, the LCP element) is a
  design target from arithmetic on the lab's measurements; NG4, NG5 and NG9 decide.
- The phone page length after these changes (NG18) and the shipped payload (NG10).
- Contrast of the baked grounds **with** grain, and every rendered pair (NG2); 2.7 measured the texture only.
- The cause of the hover tool's constant 55 (7.2 #20) is inferred from a static tab-stop count of 56.
- WebKit behaviour (NG13).
- `--n-ground-deep` bytes (not encoded in this test).
