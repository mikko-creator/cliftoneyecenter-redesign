# Design spec: Clifton Eye Center redesign ("Daylight Canopy")

Status: **build spec**, 2026-09-28. This is the single design document the build implements across all 349 pages.
It supersedes the three direction labs. It does not repeat the evidence in `docs/BRAND-SYSTEM.md` (tokens and contrast
table), `docs/SITE-ARCHITECTURE.md` (pages, menus, templates), `docs/IMAGE-PLAN.md` (image classes and fal plan) or
`docs/BUILD-DECISIONS.md` (orchestrator defaults). Where this spec changes one of those, it says so.

Hard rules still apply to every line below (`docs/DESIGN-BRIEF.md`): no copy is rewritten, invented or dropped
without a ledger row; no invented claims; no platform markup; hand-written CSS and vanilla JS; reduced motion honoured;
hover has a keyboard partner; WCAG AA measured on the rendered pixels over the busiest backdrop.

## 0. Winner

**Winner: `canopy`** (2 of 3 judge votes; summed totals canopy 118, lens 112.5, neighborhood 103).
It is the most recognisably Clifton Eye Center while still being a total redesign: it keeps the `#759b2a` top bar, the
same hero woman, a green italic "We Know You!" and the neighbourly tone. It also has the clearest UX and the strongest
evidence (pixel contrast probe at 1440 and 390 with positive controls, a hover/focus comparator, no overflow at any
width), plus a recipe system that carries to 349 interior pages.

### 0.1 Lab files to lift from (read-only references; copy, then change as this spec says)

| what | file | lines |
|---|---|---|
| base, tokens as built | `tmp/lab/canopy/lab.css` | 13-70 |
| fixed light field, orbs | `tmp/lab/canopy/lab.css` | 72-121 |
| glass recipes, rim, specular, fallbacks | `tmp/lab/canopy/lab.css` | 123-173 |
| buttons with glimmer | `tmp/lab/canopy/lab.css` | 175-191 |
| top bar, band pills | `tmp/lab/canopy/lab.css` | 193-213 |
| header, nav, round buttons, drawer | `tmp/lab/canopy/lab.css` | 215-260 |
| hero (stage, copy, arch photo, dock) | `tmp/lab/canopy/lab.css` | 262-336 |
| welcome, promo, news | `tmp/lab/canopy/lab.css` | 338-386 |
| services band and cards | `tmp/lab/canopy/lab.css` | 388-419 |
| reviews and smile cluster | `tmp/lab/canopy/lab.css` | 421-448 |
| #HeretoHelp panel and items | `tmp/lab/canopy/lab.css` | 450-481 |
| designer plates | `tmp/lab/canopy/lab.css` | 483-512 |
| visit cards, hours, emergency | `tmp/lab/canopy/lab.css` | 514-558 |
| footer panel, links, legal | `tmp/lab/canopy/lab.css` | 560-582 |
| responsive rules | `tmp/lab/canopy/lab.css` | 594-659 |
| scroll, parallax, header state | `tmp/lab/canopy/lab.js` | 12-61 |
| reveals (IO, release, fail-safe) | `tmp/lab/canopy/lab.js` | 63-88 |
| glass specular and tilt | `tmp/lab/canopy/lab.js` | 90-116 |
| drawer, hours highlight | `tmp/lab/canopy/lab.js` | 118-139 |
| homepage markup and verbatim copy | `tmp/lab/canopy/index.html` | whole file |
| graft: full-bleed designer band, staggered plates | `tmp/lab/lens/lab.css` | 498-522 |
| graft: green-iris illustration | `tmp/lab/lens/lab.css` | 461-478 |
| graft: accordion summary and +/- icon | `tmp/lab/lens/lab.css` | 480-496 |
| graft: iris-dot list markers, bold lead terms | `tmp/lab/lens/lab.css` | 363-369 |
| graft: iris section ornament | `tmp/lab/lens/lab.css` | 335-338 |
| graft: lime footer field, uppercase-free footer links | `tmp/lab/lens/lab.css` | 566-592 |
| graft: header fill at recipe-A strength, nav in green-800 | `tmp/lab/lens/lab.css` | 187-200 |
| graft: head script that sets `js-motion` before paint | `tmp/lab/neighborhood/index.html` | 9 |
| graft: hanging logo plate | `tmp/lab/neighborhood/lab.css` | 205-248 |
| graft: map / NAP / emergency overlap grid | `tmp/lab/neighborhood/lab.css` | 552-590 |
| graft: reveal hidden state with no transition | `tmp/lab/neighborhood/lab.css` | 627-633 |
| contrast probe (text hidden, 2nd-percentile backdrop, positive controls, drift guard) | `tmp/lab/canopy/_tools/contrast-probe.mjs` | whole file |
| hover vs keyboard-focus comparator (CDP) | `tmp/lab/canopy/_tools/hover-focus.mjs` | whole file |
| overflow and protrusion measurement | `tmp/lab/canopy/_tools/measure.mjs` | whole file |
| copy parity with a failing control | `tmp/lab/lens/work/copy-parity.mjs`, `tmp/lab/neighborhood/work/copy-check.mjs` | whole files |
| the extra contrast pairs in this spec | `tmp/spec/spec-contrast.mjs` | whole file |

## 1. Concept: "Daylight Canopy"

The practice talks like a neighbour ("Your Community Eye Care Clinic, We Know You!", "#HappyPatients", "#HeretoHelp"),
so the redesign keeps what people already recognise: the olive `#759b2a` strip at the top, the lime footer, the
grey-and-green logo on its own white paper plate, the same smiling hero photo and every word of copy. What changes is
the space around it. The page becomes daylight through a clinic window. Frosted panes of light glass float over soft
pools of the brand's lime, a slate-teal and warm sun. That makes glassmorphism read as calm and clean, not tech chrome.
Depth comes from four named planes (section 2.8). Photos lean out of their frames and across section seams: the hero
arch photo, the service photos, the designer plates, the cluster of smiling faces and one generated pair of olive
eyeglasses. The logo's own green iris is the only recurring emblem. There are no leaf silhouettes, rings or gauges.
Motion works like eyes coming into focus: content rises and sharpens as you scroll, panes catch the pointer's light,
and cards lift on hover and on keyboard focus. Everything degrades cleanly under reduced motion and without
`backdrop-filter`.

Motif rules (from the judges' tone findings):
- **One emblem:** the green iris (section 3.10). No tick gauges, ring fields or chromatic rims.
- **One plant, home only:** the generated `cut-olive-sprig` crosses one seam. No inline-SVG leaves or leaf shade anywhere.
- **One hand-drawn stroke:** the swash under "We Know You!".
- **One italic accent per hero.** "We Know You!" on the home hero. Italic elsewhere only on the Welcome heading's
  second line and the "Ask Dr. Deana Clifton a Question..." heading.

## 2. Tokens

`src/styles/tokens.css` keeps the measured source tokens as evidence. Put the tokens below in a new
`src/styles/brand.css` (or rename the old file to `source-tokens.css`). Do not mix the two sets.

### 2.1 Palette

The BRAND-SYSTEM section 5 block is adopted verbatim (greens 50-950, ink 50-950, slate 700/900, alert, paper, ground,
stone, field-lime, field-teal, field-leaf, focus tokens, `--shade`). Additions (all sRGB mixes of source colours, checked
by `tmp/spec/spec-contrast.mjs`):

```css
:root {
  --sunlight:        #fffbe9; /* light-pool tint only (canopy lab); L 0.97 */
  --pool-sun:        #fff5d6; /* orb colour, L 0.914 */
  --pool-mint:       #e2ebd1; /* orb colour = --field-leaf composited on --ground, L 0.802 */
  --field-lime-deep: #85ac3a; /* color-mix(in srgb, #94bc4a 50%, #759b2a): footer field lower stop */
  --field-lime-light:#a9c96e; /* color-mix(in srgb, #94bc4a 80%, #fff): footer field highlight pool */
  --band-pool:       #668b1d; /* color-mix(in srgb, #446600 30%, #759b2a): pool behind the white designer title */
}
```

**Allowed text on each surface** (only AA pairs; worst gradient stop over the recipe's worst-case backdrop. Values are from
BRAND-SYSTEM section 9 unless marked *spec*, which means `tmp/spec/spec-contrast.mjs`: positive controls 21.00 and 4.54,
12 gated pairs, 0 failing, and a `--control` pair that fails and exits 1).

| surface | body / small text allowed | large text only (>= 24px, or >= 18.66px bold) | non-text (icons, stars, rings) |
|---|---|---|---|
| paper, ground, green-50 | ink-700, ink-900, ink-600, ink-500, slate-700, slate-900, green-700, green-800, green-600, alert | + green-600 `#` (5.12) | green-600 icons; `#759b2a` rules only (3.14) |
| stone `#efefef` | ink-700 (8.28), ink-600 (5.87), ink-500 (4.69), green-700 (5.80), green-600 (4.61) | | |
| glass A (image) | ink-700 5.34, ink-900 7.31, slate-900 7.91, green-800 5.66 | ink-500 3.02 | green-700 stars 3.75 |
| glass B (canopy tint) *spec* | ink-700 7.96, ink-600 5.65, ink-900, slate-700 6.63, green-700 5.58, green-800 8.43 | | green-600 stars 4.43 |
| glass B: **ink-500 is banned** *spec* | ink-500 measures 4.51 on the tinted fill: too thin a margin. Muted text on B uses ink-600 | | |
| glass C1 (leaf) | green-900 8.60, green-800 6.52, ink-700 6.16, ink-900 8.43 | | green-600 3.43 |
| glass C2 (deep leaf) | white 5.30 | green-300 3.30 | |
| glass D at .90/.92 *spec* | white 12.33, green-400 5.61, green-100 10.96, ink-200 8.03, green-200 (> 8.92) | | green-400 stars |
| band `#759b2a` | green-950 5.29 | white 3.24 (3.98 over `--band-pool`) *spec* | white glyph on a solid `#759b2a` tile 3.24 |
| lime field `#94bc4a`..`#85ac3a` *spec* | green-950 6.49 (worst stop) | | |
| white pill on the band | green-800 8.39 | | |
| alert tile / alert button | white 8.87 on alert; alert 8.87 on white | | |
| primary button (green-600 -> green-700) | white 5.30; hover green-800 10.08 | | |

Focus rings: `--focus` on light surfaces, `--focus-on-band` on `#759b2a` / `#94bc4a` and on anything whose ring falls on
the band, `--focus-on-dark` on C2 and D (BRAND-SYSTEM section 8). The default ring on the band is 2.06 and is banned.

**Icon tiles (a lab defect this spec fixes):** canopy's dock icon gradient starts at `#86ad38`, and a white glyph on
that stop is **2.61**, under the 3.0 UI threshold (*spec*, computed). Icon tiles use
`linear-gradient(145deg, var(--green-500), var(--green-600))`: white glyph 3.24 to 5.30.

**Recipe B floor:** nothing behind recipe-B text may be darker than `--field-lime` (L 0.702). Checked *spec*:
`--pool-sun` 0.914, `--pool-mint` 0.802, services band `#e5efd2` 0.830, hero stage stop `#dbe9c1` 0.772, a `#759b2a` ring
at 25% on ground 0.742. The deep greens (`--green-400/500`) never sit behind light glass.

### 2.2 Fonts

Adopt BRAND-SYSTEM section 10 exactly: **Fraunces** (display; SIL OFL 1.1; `opsz` 9-144, `wght` 500-700,
`SOFT` 100, `WONK` 0, italic 500) and **Nunito Sans** (body; SIL OFL 1.1; `opsz` 6-12, `wght` 400-800, italic 400).
- The build downloads the CSS from the URL in BRAND-SYSTEM section 10 with a **browser User-Agent** (curl's UA gets
  truetype only), keeps **latin + latin-ext only: 8 woff2 files**, copies each `unicode-range` verbatim, sets
  `font-display: swap`, rewrites `src` to `/assets/fonts/…`, and ships both OFL texts beside the files.
- Preload 2 files: Fraunces roman latin and Nunito Sans roman latin.
- `font-variation-settings: "SOFT" 100, "WONK" 0` on every Fraunces element; `font-optical-sizing: auto`.
- Weights: display and h1/h2 500; h3, quotes and small display 600; body 400; strong, nav, buttons 700; labels 800.
- **After the fonts land, re-tune** (all three were tuned on Georgia/Segoe fallbacks in the lab): display weight
  (500 vs 600, decided on a 1440 and a 390 shot), the swash position, and every measured protrusion and fold number in
  section 4. Then re-run the contrast probe. No probe result taken on fallback fonts counts.
- Fallback metric overrides (`size-adjust` and similar) are optional. If used, the values must be measured from the
  woff2 files; none are given here (unverified).

### 2.3 Type scale

BRAND-SYSTEM section 10 scale (`--fs-xs` 13-14 … `--fs-display` 38-76, line heights and tracking) is adopted. Additions:

```css
:root {
  --fs-tag: clamp(2.25rem, 1.5rem + 3vw, 4.25rem); /* 36 -> 67px at 1440: #HappyPatients, #HeretoHelp */
  --measure: 66ch;        /* prose cap: every paragraph, list and answer in long text */
  --measure-narrow: 52ch; /* card excerpts, captions, form help */
}
```

Usage: hero statement `--fs-display`; page h1 `--fs-h1`; section titles `--fs-h2`; card titles `--fs-h4` (Nunito
800) or `--fs-h3` (Fraunces 600); body `--fs-base`; answers and prose `--fs-base` (never `--fs-sm`); meta `--fs-sm`;
legal `--fs-xs`. **No UI label below `--fs-sm` (14.5px at 390)**, except legal links (`--fs-xs`). Uppercase labels
keep their source casing and use `letter-spacing` of 0.04em or less (the lab's .08-.16em is dropped).

### 2.4 Spacing, layout, breakpoints

```css
:root {
  --s-1: 4px; --s-2: 8px; --s-3: 12px; --s-4: 16px; --s-5: 24px; --s-6: 32px;
  --s-7: clamp(40px, 28px + 3vw, 64px);   /* block gaps */
  --s-8: clamp(56px, 36px + 5vw, 104px);  /* section padding */
  --s-9: clamp(72px, 40px + 8vw, 150px);  /* section padding where protrusions need clearance */
  --gutter: clamp(16px, 2.5vw, 32px);
  --wrap: 1240px; --wrap-wide: 1400px; --aside: 320px;
}
.wrap { width: min(100% - 2 * var(--gutter), var(--wrap)); margin-inline: auto; }
```

| breakpoint | what changes |
|---|---|
| 390 | phone QA width (fold gate, section 7.5) |
| < 561 | small-phone offsets (service photo break-out 40px, smaller plates and tiles) |
| < 700 | motion and glass budget: parallax x0.55, no ambient loops, small surfaces solid (section 2.7) |
| < 720 | top strip shows the Call pill only |
| 768 | tablet QA width; designer plates go 4-up |
| < 860 | hero switches to the stacked phone composition |
| 1024 | full primary nav, sidebar beside content, 3-up grids; tablet-landscape QA width |
| 1100 | designer band two-column with staggered plates |
| 1280 | visit block full overlap composition |
| 1440 | desktop QA width |

### 2.5 Radii

`--r-sm: 14px; --r-md: 22px; --r-lg: clamp(22px, 2.2vw, 32px); --r-xl: clamp(28px, 3.2vw, 48px); --r-pill: 999px;`
`--r-arch: 999px 999px var(--r-lg) var(--r-lg);` (hero photo). Inputs `--r-sm`. Brand ads: 12px at most (a
presentation radius; the file itself is never cropped, zoomed or filtered).

### 2.6 Elevation (every shadow is green-tinted `rgb(var(--shade) / a)`)

```css
:root {
  --e-1: 0 1px 2px rgb(var(--shade) / .06), 0 8px 24px -10px rgb(var(--shade) / .14);
  --e-2: 0 1px 2px rgb(var(--shade) / .10), 0 10px 28px -8px rgb(var(--shade) / .22), 0 28px 64px -24px rgb(var(--shade) / .28);
  --e-4: 0 2px 4px rgb(var(--shade) / .10), 0 34px 60px -30px rgb(var(--shade) / .55);        /* hover lift */
  --e-pop: 0 0 0 5px rgb(255 255 255 / .9), 0 30px 50px -26px rgb(var(--shade) / .55),
           0 12px 20px -14px rgb(var(--shade) / .35);                                           /* protruding media */
  --e-dark: 0 24px 60px -20px rgb(0 0 0 / .55);
}
```

### 2.7 Glass recipes

Lift `tmp/lab/canopy/lab.css` lines 127-173 with these changes:

| recipe | class | fill (stops) | blur / saturate | use |
|---|---|---|---|---|
| A image | `.glass--image` | white .84 / .76 | 18px / 1.6 | any glass over imagery: hero statement, dock, NAP card over the map, title panels, drawer (.96), header (.88 / .80) |
| B light | `.glass--light` | `rgb(251 253 246/.72)` / `rgb(244 249 235/.58)` (canopy tint) | 14px / 1.5 | sheets, cards, Q&A panel, forms sheet, aside cards |
| C1 leaf | `.glass--leaf` | `rgb(248 250 242/.90)` / `rgb(238 244 226/.86)` | 16px / 1.8 | accordion items, date pills, current-nav pill, breadcrumb chips |
| C2 deep leaf | `.glass--leaf-deep` | `rgb(68 102 0/.90)` / `rgb(49 73 0/.92)` | 18px / 1.4 | primary dock tile, CTA band |
| D dark | `.glass--dark` | `rgb(20 31 0/.90)` / `rgb(35 34 41/.92)` (**raised from .86 / .90**, lens measured the lime field pulling footer headings to 4.58 at the old stops) | 22px / 1.3 | footer panel, emergency card |

Every recipe has: a 1px masked gradient rim (`::before`, canopy 128-131), a pointer specular (`::after`, shown on
`:hover`, `:focus-visible` and `:focus-within`, following the pointer on fine pointers only), an inset top highlight,
green-tinted shadows, the `-webkit-` prefix, and a solid fallback under the **combined** condition, so Safari (which
supports only the prefixed property) keeps its glass:

```css
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .glass--image { background: rgb(255 255 255 / .94); }
  .glass--light { background: rgb(250 252 246 / .92); }
  .glass--leaf  { background: #f8faf2; }
  .glass--leaf-deep { background: #446600; }
  .glass--dark  { background: #141f00; }
}
```

**Glass must have something to frost** (the judges' "reads as white cards" finding). Each glass surface names its
backdrop: A sits over imagery (hero stage scene, arch photo, map, title-band scene or photo). Large B sheets must overlap
at least one pool (lime, teal, mint or sun) across an edge. A B sheet over a flat ground with nothing behind it is a
defect.

**Glass budget (UX must-fix):**
- Under 700px, `backdrop-filter` stays only on the header bar, drawer, hero statement, the 4 dock tiles, the Q&A panel,
  the NAP card and the footer panel. **At most 10 on the home page at 390.** Every other surface (promo, news, welcome
  sheet, service cards, review cards, accordion items, brand plates, smile rings, hours rows, emergency card) uses its
  recipe's fallback fill: add `.is-solid` below 700px.
- **Interior long-form sheets use the fallback fill at every width** (`.glass--light.is-flat`: same gradient, rim and
  shadow, no `backdrop-filter`). A multi-thousand-pixel blurred layer over a pale field costs GPU and shows nothing. The
  title panel and aside cards keep real blur.

**Trap:** canopy's `.glass > * { position: relative; z-index: 2 }` overrides absolute children. A child that must be
absolute (quote glyph, cut-out) needs a more specific selector, never `!important` chains.

### 2.8 Z-plane model

| plane | name | z-index | what lives on it |
|---|---|---|---|
| P0 | field | 0 | fixed light field (`.field`: gradient plus 4 drifting blobs); per-section `.deco` layers holding orbs and pools |
| P1 | stage | 1 | hero stage (gradient, blurred scene, veil, sun pool, beams); services band; reviews stage; designer band; interior title band stage; footer lime field |
| P2 | glass | 2-4 | all panes and cards. A pane that must sit over a P3 photo edge gets 4 (hero statement, dock) |
| P3 | lift | 3-6 | everything that breaks a frame: hero arch photo, `cut-eyeglasses`, service photos, promo photo, smile cluster, designer plates and ads, `cut-olive-sprig`, the iris illustration, title-band cut-outs, article photo figures |
| P4 | chrome | 50-100 | sticky header 50 (logo plate inside it), progress bar 60, scrim 65, drawer 70, skip link 100 |

Section stacking on the home page: each section is `position: relative`, and a section whose P3 content crosses into
the next one sits above it. hero 3 > welcome 2 > services 1; reviews 3 > services 1 (smiles cross up); help 2 <
designer 3 (plates rise into help); designer 3 > visit 1 (plates hang into visit); footer auto. Interior: title band 3
> page body 2.

### 2.9 Motion tokens

```css
:root {
  --ease-out: cubic-bezier(.16, 1, .3, 1);
  --ease-spring: cubic-bezier(.34, 1.4, .64, 1);
  --t-fast: .3s; --t-base: .45s; --t-slow: .8s; --t-reveal: .9s;
  --stagger: 90ms;
}
```

## 3. Components

Each entry gives anatomy, states and the lab source. "Source" means `audit/raw` markup. Behaviour changes are
numbered ledger rows (section 7.4).

### 3.0 Base controls

- **Buttons** (`.btn`, canopy 175-191): pill, `min-height: 44px`, Nunito 800, padding `.9em 1.5em`, arrow icon.
  Primary: gradient green-600 to green-700, white text; hover and focus: green-800, lift -2px, glimmer sweep (`::after`
  translateX -160% to 330%, .8s), arrow +3px. Alert: white with alert text; hover alert-50. On C2 or the band:
  inverted (white fill, green-800 text).
- **Links:** green-700 on light, green-800 on A, underline offset .18em. Stand-alone "more" links (`.more`) are 800
  weight with an arrow that moves +4px, and at least 44px tall (padding-block).
- **Focus:** `outline: 3px solid var(--focus); outline-offset: 2px`, swapped per surface (section 2.1).
- **Icons:** one inline SVG sprite (`<symbol>`) per page, stroke 1.8, `currentColor`, `aria-hidden`. There are no icon
  fonts (the EyeCarePro icon font must not ship). The lab's `#leaf` and `#sprig` symbols are deleted.
- **Skip link:** "Skip to main content" (source string) to `#content`.

### 3.1 Top bar

Anatomy: `.topbar`, full-bleed `#759b2a` with a faint white sheen (canopy 196-198), not sticky.
- Address link: pin icon plus the source `<strong>` "We're in Bossier City, 1000 Chinaberry Drive, Suite 302,
  Louisiana, 71111." linking to `/eye-care-services/` as in the source. `--fs-sm` 700, green-950 (5.29).
- Pills (`.band-pill`): "Make an Appointment" to `/contact-us/appointment-request-form/` (**L01**) and "Call Us:
  318-550-5815" to `tel:318-550-5815` (**L17**). White .90 fill, green-800 800 text (8.39), `min-height: 44px`.

Layouts: 1024px and wider, one row, min-height 56px. From 720 to 1023px, the address (`--fs-xs`, may wrap) and the Call
pill; "Make an Appointment" is hidden because the header's appointment button covers it. Below 720px, **a compact strip
with the Call pill only, centred, 56px tall** (**L02**). This graft from neighborhood resolves the UX must-fix that
put the phone number nowhere on screen as text at 390.

States: pill hover and focus: fill .82, lift -1px, green glimmer sweep. Address hover and focus: underline. Focus ring
`--focus-on-band`.

### 3.2 Header, primary nav, drawer

Anatomy (graft: hanging plate from neighborhood; fill and nav colour from lens):
```
header.site-header[data-header]            sticky; top 12px (>= 1024) / 8px (< 1024); z 50
  .wrap > .site-header__bar                height 72px (>= 1024) / 56px (< 1024); radius 28px / 22px
    span.site-header__glass.glass--image   SIBLING layer behind the content (fill .88/.80): multiply cannot reach
                                           the page from inside a backdrop-filter context (canopy and lens both measured it)
    a.logo-plate[aria-label="Clifton Eye Center home"]   position absolute; top 0; left 24px / 14px
      span.logo__box > img                 trimmed 3:2 box (BRAND-SYSTEM section 2 trim), file untouched
    nav.mainnav[aria-label="Primary"]      >= 1024
    .mobile-actions                        < 1024: appointment, call, menu (44px round buttons)
```
- **Logo plate:** paper `#fff`, radius `0 0 20px 20px`, padding `10px 14px 12px` (8/10/9 below 1024), shadow `--e-2`.
  Trimmed box width **140px** at 1200px and wider (image renders at 154 CSS px, under the 158 px 2x-sharp cap), **124px**
  from 1024 to 1199, **112px** below 1024. At rest it hangs about 43px (desktop) or 36px (phone) below the bar. That is
  one more out-of-frame depth element, and the JPEG's white ground becomes a deliberate plate (**L15**).
- **Scrolled state** (`scrollY > 40`): plate `scale: .72` (desktop) or `.76` (phone), `transform-origin: 0 0`; the
  glass gains `--e-2`. **Nothing changes layout size:** the lab's width change shifted content by about 20px (CLS).
  The bar reserves `padding-left` equal to the plate width plus 24px, so nav never sits under the plate.
- **Header height (UX must-fix):** layout height is 12 + 72 = 84px on desktop and **8 + 56 = 64px on phones**, at rest
  and scrolled (13.4% of the viewport in the lab, now 7.6%).
- **Primary nav (flat, as the source):** the 5 source items in source order: Hours & Location, Our Eye Doctor, Eye Care
  Services, Eyeglasses & Contacts, Insurance. Links are Nunito 700, 16px (15px with 10px padding from 1024 to 1199),
  **green-800** (the bar floats over photos: A-strength fill, green-700 would be 3.75). Hover and focus: green-900, C1
  wash, 2px green-700 underline growing from the centre (.4s). Current page: `aria-current="page"`, C1 pill,
  underline kept. Ancestor section: underline kept (`.is-section`), no aria.
- **Dropdowns: not built.** The source menu has 0 sub-menu children on all 346 chrome pages
  (SITE-ARCHITECTURE 4.2); the operator asked for the exact structure. If the operator approves dropdowns later (an
  ADD ledger row), use this pattern: a disclosure `<button aria-expanded aria-controls>` beside each top-level link; a C1
  panel listing that item's children from `site-map.json`; opens on click, Enter or Space; closes on Esc, outside
  click or focus leaving; on fine pointers only, hover opens after 150ms intent; never hover-only.
- **Drawer (< 1024):** fixed right sheet, inset 12px, width `min(86vw, 380px)`, radius 28px, fill A at .96 (not
  translucent: a see-through drawer over a dark scrim read dusty grey on friscoeyesource), scrim
  `rgb(20 31 0 / .32)`. Contents: close button (sr text "Close Menu", a source string), the 5 links (min-height
  52px, `--fs-lead` 800, green-800), then the two top-bar pills full width. The menu button's sr text is "Open Menu"
  (source string). Behaviour: `aria-expanded` on the button; focus moves to the first link; Tab is trapped (replaces the
  source's "Return to top of menu" link, **L11**); Esc and scrim click close; page scroll is locked; focus returns to the
  button; the page behind is `inert`. Slide .5s `--ease-out`; no slide under reduced motion.

Lab: canopy 215-260 (bar, nav, drawer), neighborhood 205-248 (plate), lens 187-200 (fill, nav colour); JS canopy
lab.js 118-132 plus a focus trap.

### 3.3 Home hero

Anatomy, 860px and wider (canopy 262-336, changed as marked):
```
section.hero (z 3) > .wrap.hero__grid[data-hero]      2 cols 1.08fr / 1fr; --cut: 70px
  .hero__stage (P1)       inset 0 0 var(--cut) 0; radius --r-xl; overflow hidden
     gradient #f6faee -> #e8f1d6 -> #dbe9c1
     img.hero__scene      scene-greenery-window: cover, blur(6px), opacity .55, alt "", aria-hidden   (NEW)
     veil                 linear-gradient(160deg, rgb(246 250 238 / .85), rgb(246 250 238 / .2))      (NEW)
     .hero__sun           radial pool, moves with --hp
     .hero__beams         masked light beams (ambient, >= 700 only)
     (the lab's leaf silhouettes and dapple are DELETED)
  .hero__copy.glass--image (P2, z 4)      margin-right -170px (>= 1100) / -96px (860-1099): its right part frosts the arch photo
     p.hero__statement    3 spans, verbatim: "Your Community" / "Eye Care Clinic" / "We Know You!"
  figure.hero__photo[data-depth=.035][data-depth-max=24] (P3, z 2)
     span.hero__photo-in[data-reveal=settle] > img   source 6a111a60, alt "" (a CSS background in the source), fetchpriority high
  img.hero__cut           cut-eyeglasses, alt "", P3 z 5            (replaces the labelled lab slot)
  nav.dock[aria-label="Quick links"]      P2 z 4, row 2, both columns, width min(100%, 820px)
```
- Statement: Fraunces 500 (re-tune after the fonts load), `--fs-display`, line-height 1.04, tracking -0.02em,
  slate-900 (7.91 on A). "We Know You!" is italic green-800 (5.66) with the swash: stroke green-500, 5px, round caps,
  drawn in (section 5.1). **The swash sits fully below the glyph box** (`top: calc(100% + .04em)`, with the line's
  `padding-bottom: .34em` holding it), so it never sits behind letters. The lab probe read 3.11 because the swash was
  inside the text box.
- Arch photo: radius `--r-arch`, height `clamp(420px, 38vw, 560px)` (the lab used up to 640; the 1280px source is soft
  at 2x in a tall crop), `margin-bottom: -96px`, 6px white ring plus `--e-pop`, `object-position: 60% 30%`. Inner scale
  runs from 1.06 to 1.0 with hero progress (the lab used 1.12, which upscales further).
- Cut-out: width `clamp(180px, 15vw, 230px)`, grid column 2 row 2, `justify-self: end; align-self: end`,
  `margin: 0 -24px -132px 0`, `rotate: -6deg`, `filter: drop-shadow(0 18px 18px rgb(var(--shade) / .28))`,
  `data-depth=-.07` with max 32. **If the reviewed generated file does not exist, the element is not rendered.** No
  placeholder ever ships.

Phone composition, below 860px (resolves the "phone depth gap" must-fix):
- One column. Stage inset `0 0 96px 0`. Statement glass on row 1 (margin 0, padding 22/24px).
- Photo on row 2: width 82%, `justify-self: end`, height `clamp(300px, 78vw, 420px)`, **`margin-top: -32px` so it
  slides under the statement glass** (glass over photo on phones too).
- Cut-out on row 2: `justify-self: start; align-self: end`, width `clamp(132px, 38vw, 170px)`,
  `margin: 0 0 -28px -4px`. It crosses the photo's left frame edge and the photo's bottom edge. It must not intersect
  the face (the upper-right of the photo) or any dock label or icon (collision gate, section 7.5).
- Dock on row 3, `margin-top: 20px`, 2 x 2.
- **Fold gate:** at 390 x 844 with the real fonts, the "Schedule An Appointment" tile bottom is at 828 or less.
  Estimated 729 (56 strip + 64 header + 16 + 175 statement + 272 photo + 20 + 126 tile). Measured, not assumed.

### 3.4 Quick-action tiles

Source links: Email Us to `/contact-us/contact-form/`; Schedule An Appointment to
`/contact-us/appointment-request-form/` (`target="_blank"` as in the source); Patient Forms to `/contact-us/patient-forms/`;
Order Contacts Online to `/order-contacts-online/` (`_blank` as in the source). Add `rel="noopener"`.

- Tile (`.dock__tile.glass--image`): radius 24px, padding `20px 12px 18px`, centred; icon tile 56px (48px below 561),
  radius 18px, `linear-gradient(145deg, var(--green-500), var(--green-600))` with a white glyph (section 2.1 fix);
  label Nunito 700 `--fs-sm` ink-900.
- **Primary tile** (UX must-fix, appointment emphasis): "Schedule An Appointment" gets `.dock__tile--primary`: recipe
  C2 with a white label (5.30), a white icon tile with a green-800 glyph (10.08), and a green-300 rim. The order is not
  changed.
- States: hover and focus: lift -6px, `--e-4`, icon `rotate(-8deg) scale(1.08)` (spring .5s). Primary: C2 stops to
  .94/.96. Focus ring `--focus`.
- **Aside variant** (interior sidebar, 337 pages): a vertical list of the same 4 links, rows 56px tall, icon 40px, label
  left-aligned, same primary rule. It sits at the top of the aside.

### 3.5 Section headers

- `.section-title`: Fraunces 500, `--fs-h2`, line-height 1.15, tracking -0.01em, slate-700, `text-wrap: balance`.
- Home: centred, max 22ch, with the **iris ornament** above it (a 22px disc: slate-900 pupil 26%, green iris, white 3px
  ring, 1px `#759b2a` outer ring; lens lab.css 335-338). This replaces canopy's two-leaf ornament.
- Interior: left-aligned, no ornament (the neighborhood graft; left headings scan better on long pages).
- Tag titles (#HappyPatients, #HeretoHelp): `--fs-tag`, line-height 1, `#` in green-600 (5.12).
- Linked title "Our Most Popular Services" (to `/eye-care-services/`, `_blank` as in the source): arrow icon green-600
  at .72em; hover and focus move it +6px and turn the title slate-900.
- Welcome h1 (the page's only h1): `--fs-h1`, max 24ch; "in Bossier City, Louisiana" is wrapped in a span, block from
  768px up, italic green-700 (6.46) (neighborhood graft; text unchanged, **L07**).
- Heading-level changes (**L06**): "What's New!" h1 to h2; div headings (#HappyPatients, #HeretoHelp, Our Most Popular
  Services) and the "Our Designer Optical" `<p>` to h2; promo h4 to h3 (keeps heading order).

### 3.6 Service tiles (home "Our Most Popular Services")

```
section.services (z 1) > .services__band (P1) + .wrap > h2 + ul.svc-grid[data-stagger]
  li[data-reveal=rise] > a.svc.glass--light[data-tilt=7]
    span.svc__frame > img      aspect 4 / 4.7, radius 22px, --e-pop; margin-top -56px (-40px below 561)
    span.svc__foot > span.svc__name + span.svc__go (arrow chip 40px, 32px below 561)
```
- Tiles, in source order: UNIQUE OPTICAL, `81b71862`, to `/eyeglasses-contacts/eyeglasses/designer-frames/`; CONTACT
  LENS SERVICES, `291abc74`, to `/eyeglasses-contacts/contact-lenses/`; COMPREHENSIVE EYE EXAMS, `0d41af0c`, to
  `/eye-care-services/eye-exams/`; PEDIATRIC EYE CARE, `e0cfe7e9`, to the canonical
  `/eye-care-services/eye-exams/pediatric-eye-exams/` (alias re-point, **L09**). All `alt=""` (**L12**; the card text
  names each one).
- Name: Nunito 800, **`--fs-sm` (14.5-15.5px)**, tracking .04em, ink-900 (UX must-fix: was 12.5px with .08em).
- Grid: 4 columns from 1024; 2 columns below (row gap 72px, 60px below 561).
- Band: radius `--r-xl`, horizontal inset `max(0px, (100% - 1400px) / 2)`, gradient `#eef4e2 -> #e5efd2 -> #eaf2dc`
  plus a sun pool at the top. **No leaves.** Band tail 150px (130px below 561).
- States: hover and focus: lift -10px (`transform`), tilt up to 7deg (fine pointer, only after the reveal is released),
  frame -8px, image `scale(1.1)` inside the frame (.9s), arrow chip fills green-700 with a white glyph and rotates -45deg,
  `--e-4`. Focus ring offset 4px, radius 28px. Solid fill below 700px.
- **No generated cut-outs on these cards.** The source photos already show frames, lenses, a phoropter and a child in
  glasses; generated duplicates would be redundant (the image-plan `usedFor` was updated to match).

### 3.7 Welcome block (home rows 2 and 3)

Grid `5fr / 7fr` from 860px, gap `clamp(24px, 3vw, 40px)`: a side column (promo, What's New) and the practice-copy
sheet.
- **Promo card** (B): image `ea0df44c` (`alt=""`) pops out: `margin-top: -52px`, left overhang
  `var(--over)` = `clamp(10px, calc((100vw - 1240px) / 2 + 6px), 48px)`, `rotate: -2.5deg`, aspect 16/10, `--e-pop`,
  `data-depth=-.04` with max 20. Title (h3, **L06**) Nunito 800 `--fs-h4` green-700 (5.58). Body `--fs-sm` ink-700
  with the Promotions link. Card `margin-top` is 48px from 860px and **76px below 860** (UX must-fix: the tilted photo
  sat right under the Welcome heading at 390).
- **What's New card** (B): h2 "What's New!" Fraunces 600 `--fs-h3` slate-700; post title (h3 link) Nunito 800
  `--fs-h4` ink-900, hover green-800 with an underline growing through `background-size` (.5s); date pill (C1 styling,
  `--fs-xs` 800, green-900, clock icon); excerpt `--fs-sm`; "Read More" `.more` link, 44px tall.
- **Practice copy sheet** (B, overlapping a lime pool and a sun pool): every paragraph `max-width: var(--measure)`; lead
  paragraph `--fs-lead` ink-900 with a Fraunces 600 green-700 first letter. The 3-item services list becomes a
  **semantic `<ul>` with iris-dot markers and the lead term in `<strong>`** ("Eye Exams", "Contact Lens Fittings and
  Evaluations", "Eye Disease Treatment"; text unchanged, **L07**; lens 363-369). "Our Product Offerings:" h3 is followed
  by a **plain list** with green-600 disc markers (UX must-fix: the lab's pill chips looked tappable). Then the closing
  paragraph with its link.

### 3.8 Testimonials (#HappyPatients) and the carousel

Source rows 5-7 (this block, #HeretoHelp and Our Designer Optical) were desktop-only; they show at every width
(**L03**).

- **Smile cluster:** the source image-carousel PNGs `663dba41`, `34ee7792`, `48c72009` become a static cluster
  (**L04**). `aria-hidden`, `alt=""`, **never paired with a reviewer** (whether they show the reviewers is unverified).
  Box 300 x 190 (250 x 160 below 561); rings 120/150/116px (100/124/96); 6px glass rim (solid below 700px).
  `margin-top: calc(-1 * var(--band-tail) + 30px)`, so it crosses the services band's bottom seam.
- Tag title "#HappyPatients".
- **Reviews stage** (P1, graft from lens "one panel"): a rounded `--r-xl` panel with no `backdrop-filter`, gradient
  `rgb(238 244 226 / .9) -> rgb(223 228 229 / .6)`, padding `--s-7`. It fills the lab's empty grey-haze right half.
- **Card** (`figure.review.glass--light`, radius `--r-lg`): quote glyph (inline SVG, green-300 at .75, decorative;
  replaces the platform's `review-quote.png`, **L11**); 5 stars in green-600 with `role="img"` and
  `aria-label="5 out of 5 stars"` (**L13**; the source's hidden `ratingValue` "5" is not rendered, **L14**); blockquote in Fraunces, `--fs-lead`, line-height 1.5, ink-900, verbatim
  including the trailing "..."; figcaption "- Andrea H." Nunito 800 green-800. Review cards are not interactive: **no
  hover motion** (canopy removed a hover-only lift that had no keyboard path).
- **Track layout:** from 1024px, a 3-column grid with **`align-items: start` and content height** (a level row: no
  stagger, no equal-height voids; this resolves the canopy-stagger vs lens-equal-height split between the judges).
  Below 1024px, the carousel (section 5.6).
- "Read More Reviews" (`.btn--primary`) keeps the source Google URL and attributes, plus `rel="noopener"`.
- The same card is used on `/contact-us/testimonials/` (3 cards in a grid, no carousel) and on `/testimonial/*`
  (single card).

Lab: canopy 421-448 (cards, cluster); carousel is new.

### 3.9 Ask-the-doctor accordion (#HeretoHelp) and the iris

- Grid `4fr / 7fr` from 1024px, gap `clamp(28px, 4vw, 64px)`.
- **Side:** "#HeretoHelp" tag title and the **green-iris illustration** (lens graft; replaces canopy's "?" bubble and
  sprig). It is a CSS disc, `aria-hidden`: slate-900 pupil 26%, iris from a `repeating-conic-gradient` of green-700 and
  green-400 over a green-400-to-green-600 radial, a white catch-light, an 8px white ring and a 1px `#759b2a` outer ring,
  `--e-2`, plus **one** faint outer ring (`#759b2a` at 25%). No gauges, no rotation. Size 220px from 1024px. It
  **overlaps the Q&A panel's left edge by 36px** and keeps at least 40px from the panel text (panel `padding-left:
  84px`). Below 1024px: 104px, beside the heading, overlapping the panel's top edge by 40px (panel `padding-top: 64px`).
  `data-depth=-.05` with max 16. Lab: lens 461-478.
- **Panel** (B): h2 "Ask Dr. Deana Clifton a Question..." Fraunces 600 italic `--fs-h3` slate-900.
- **Items** (`details.qa__item`, C1, radius 20px, solid below 700px): summary is a grid of question text and a 36px
  icon on the right, padding 20px 22px, Nunito 700 **`--fs-lead`**, ink-900, min-height 64px. The +/- icon (lens
  480-496): 1.5px green-600 ring with green-800 bars. Hover and focus: green-100 fill, `rotate(90deg)`. Open:
  green-700 fill, white bars, `rotate(180deg)`, showing minus. Answer: padding `0 22px 22px`, **`--fs-base`**,
  ink-700, `max-width: var(--measure)` (UX must-fix: was 15.5px at 76-78 characters per line). "More about Dry Eyes..."
  goes to the canonical `/eye-care-services/eye-conditions/dry-eye-disease-and-treatment/` (**L09**).
- **The first item is open by default** (lens graft; Dr. Clifton's own answer is the most personal copy on the page,
  **L05**).
- Item hover and focus-within: `translateX(4px)` plus shadow. Use `:focus-within`, not `:has()`, for engine reach. The
  answer eases in (6px, .5s) on open.
- This same component renders the 3 builder heading-accordions (for example "Forms of Payment" on `/hours-location/`)
  and any FAQ section. Source toggles `<a href="#">` plus hidden divs become `<details>/<summary>` (**L05**).

### 3.10 Decorative layer (P0) and motifs

- `.field` (canopy 72-84): fixed gradient and 4 blobs (sun, lime, teal, leaf at .12). Blob drift only at 700px and
  wider.
- **Section pools** live in a per-section `.deco` wrapper: `position: absolute; inset: -160px 0; overflow: clip;
  pointer-events: none; z-index: 0; aria-hidden`, with `overflow: hidden` as the fallback. This wrapper holds only
  decorations, so clipping it can never cut a protrusion (section 4.3). Orbs: `--field-lime`, `--field-teal`,
  `--pool-mint`, `--pool-sun`, opaque, `filter: blur(42px)`, morph 24s at 700px and wider only. Orbs never sit under
  the designer title.
- **Iris:** the section ornament (22px), the #HeretoHelp illustration (220px), a faint ring pair on `band--plain` title
  bands, and the 404 page. **At most one large iris per page.**
- **Olive sprig:** `cut-olive-sprig`, home only, one instance, 561px and wider. It crosses the Welcome to Services seam:
  `left: clamp(8px, 4vw, 70px); bottom: -150px` (of Welcome), width `clamp(90px, 9vw, 130px)`, `data-depth=-.08` with
  max 24, `data-rot=12`, `alt=""`.
- Deleted from the lab: the `#leaf` and `#sprig` symbols, `.canopy-leaves` (hero, services, designer), `.hero__dapple`,
  `.sprig--hero`, `.sprig--help`, `.help__bubble`, `.cutslot` and `.map__note`.

### 3.11 Designer Optical brand cards

- **Band (lens graft):** a full-bleed section with solid `#759b2a` edge to edge, a 1px `rgb(255 255 255 / .25)` inset top
  highlight, and **no light pools, orbs or leaf shade anywhere on it**. Behind the title sits a single radial pool,
  `radial-gradient(closest-side, var(--band-pool), rgb(102 139 29 / 0))`, sized to the title box plus 60px on each side.
  White on `--band-pool` is 3.98 (*spec*), against 3.24 on the bare band.
- **Title** h2 "Our Designer Optical": white, Fraunces 600, `--fs-h2` (26px at 390, large text), text-shadow
  `0 2px 12px rgb(20 31 0 / .25)`. The measured probe value must be 3.5 or more (gate).
- **Layout:** from 1100px, a two-column grid (250px title column, plates) as in lens; **odd plates rise 96px above the
  band top and even plates hang 72px below the band bottom**, so the plates cross both edges. From 768 to 1099px, the
  title is centred on top and 4 plates in a row hang 96px below the band (canopy). Below 768px, a 2 x 2 grid: the top row
  sits inside the band and the bottom row hangs 64px below. Clearance: help `padding-bottom` of at least 144px from
  1100px; visit `padding-top` of at least the hang plus 64px.
- **Plate** (`a.brand`): links to the canonical `/eyeglasses-contacts/eyeglasses/designer-frames/` (source used the
  alias, **L09**). White at .92 over the band (solid below 700px), radius 26px (20px below 561), padding
  `0 12px 14px`. The ad image is **unaltered** (no crop, zoom or filter; container radius 12px). It lifts 42px above the
  plate top (34px below 561). Name: Nunito 800 `--fs-sm`, tracking .08em, ink-900 (12.02). Alts verbatim ("Model
  wearing Kaenon eyeglasses" and so on).
- States: hover and focus: plate -8px plus `--e-4`, ad a further -10px, never zoomed. Focus ring `--focus-on-band`.

Lab: lens 498-522 (band, stagger), canopy 483-512 (plate and ad).

### 3.12 Location, hours, map, emergency (Visit)

Graft: the neighborhood overlap grid.
- **Map panel:** keyless Google Maps embed with the practice's full address as the query (BUILD-DECISIONS #10;
  PORT-NOTES `ctx.mapQuery`; **L22**). It has a `title` attribute (**L13**), `loading="lazy"`, radius `--r-lg`, and min-height
  520px (from 1280), 360px (768-1279) or 280px. **The keyless endpoint resolving is unverified.** Browser QA must see it
  render; if it does not, use the BUILD-DECISIONS #10 fallback. No placeholder art ships.
- **NAP card:** **recipe A** (it overlaps the map imagery). Name link Fraunces 600 `--fs-h3` slate-900 to
  `/location/clifton-eye-center/` (underline grows on hover and focus); address; "Phone:" plus a tel link (800,
  green-800); hours `<dl>` with 7 verbatim rows. Today's row gets a C1 background tint and green-900 text, with **no
  added text** (**L16**). Rows are solid.
- **Emergency card:** recipe D. **The alert left rim is removed** (the judges called it bolted on). An alert icon tile
  (52px, white glyph 8.87); h3 "Is it an Emergency?" Fraunces 600 white; body `--fs-sm` green-200 with white
  `<strong>`; `.btn--alert` tel button.
- **Layout:** from 1280px, 12 columns: map spans columns 1-8 over rows 1-2; NAP spans columns 7-10 in row 1 with
  `margin: 56px 0 0 -24px`; emergency spans columns 10-13 over rows 1-2 with `margin: 150px 0 0 12px`. From 768 to
  1279px, the map is full width, NAP spans columns 1-7 with `margin-top: -120px; margin-left: 24px`, and emergency spans
  columns 7-13 with `margin-top: -60px; margin-right: 24px`. Below 768px, the map is followed by NAP with
  `margin: -48px 12px 0` (overlapping the map's bottom), then emergency.

Lab: canopy 514-558 (cards), neighborhood 552-590 (grid).

### 3.13 Footer

- **Lime field (lens graft, brand must-fix):** `footer.site-footer` is full-bleed with
  `radial-gradient(70% 90% at 82% 8%, var(--field-lime-light), transparent 70%), linear-gradient(180deg, var(--green-400), var(--field-lime-deep))`,
  padding `clamp(56px, 6vw, 90px) 0 clamp(28px, 3vw, 40px)`. **The page ends on the lime field.** Nothing follows the
  footer, and there is no ground strip below it.
- **Panel:** recipe D at the .90/.92 stops, radius `--r-xl`, padding `clamp(28px, 4vw, 56px)`. Grid `1.3fr 1fr 1fr`
  from 960px; 2 columns from 600 to 959px with the brand block on a full row; 1 column below.
- **Brand column:** logo on a paper plate (white, radius 16px, padding 12px, trimmed box 140px); the NAP line verbatim
  (including the source's spaces before the commas) in green-200 with a white `<strong>` and a white 700 tel link; the
  Facebook link (44px, green-400 fill with a green-950 glyph; hover green-300, -3px, `rotate(-8deg)`; `aria-label`
  "Visit us on facebook" as in the source).
- **Link columns:** "Important Links" (6) and "Quick Links" (5), each a `<p>` heading referenced by `aria-labelledby`,
  Fraunces 600 `--fs-h4` green-400 (5.61). Links are green-100 (10.96); **min-height 44px below 768px and 36px above**;
  a 1px green-400 underline grows from the left on hover and focus; text turns white.
- **Legal row** inside the panel: "© 2026" plus Accessibility, **Sitemap to `/sitemap.xml`** (BUILD-DECISIONS #5,
  **L10**), Privacy, Disclaimer. `--fs-xs` ink-200 (8.03). Link targets are at least 24px tall (44px below 768px).
- Removed (**L11**): the voice search form, "Powered by" plus the EyeCarePro logo, Login, and the footer microdata with
  the wrong coordinates.

Lab: canopy 560-582 (panel), lens 566-592 (field).

### 3.14 Interior title band and breadcrumbs

```
section.band.band--scene | --photo | --plain  (z 3)
  .band__stage (P1)   inset inside min(100% - 2*gutter, 1400px); margin-top 12px; radius --r-xl
     --scene: gradient + img.band__scene (family scene, cover, blur 8px, opacity .5, alt "") + veil
     --photo: gradient only (the source header photo is framed in .band__visual)
     --plain: gradient + one faint iris ring pair (#759b2a at 25%) at the right
  .wrap.band__grid    >= 1024: [title minmax(0, 1.1fr)] [visual minmax(0, .9fr)]; stacked below
    .band__title.glass--image   padding clamp(22px, 3vw, 44px); radius --r-lg
       nav.crumbs[aria-label="Breadcrumb"] > ol
       h1                        Fraunces 500 --fs-h1, line-height 1.08, slate-900, max 22ch, balance
    figure.band__visual          --photo only: source header photo, radius --r-lg, white ring, --e-pop, max-height 320px;
                                 the title panel overlaps it by 48px (>= 1024) or its top by 32px (< 1024): glass over photo
    img.band__cut                optional generated cut-out (section 6.3), P3 z 5, alt ""
```
- Band min-height 220px (below 768) or 300px (from 1024), not counting the header. Padding-block
  `clamp(28px, 4vw, 56px)` plus the cut-out clearance at the bottom.
- **Cut-out:** width `clamp(140px, 16vw, 240px)`, `right: max(8px, 4%)`,
  `bottom: calc(-1 * clamp(40px, 6vw, 96px))`, so it crosses the band's bottom edge into the first sheet.
  `rotate: -8deg`, `data-depth=-.06` with max 24. Below 768px: 120-150px wide, bottom -40px, right 8px. It must not
  overlap the h1 box (collision gate).
- **h1 source:** the page's h1; builder pages use their layout h1; testimonials use "Testimonial" and
  `/category/our-doctors/` uses "Our Doctors" (BUILD-DECISIONS #3); `/eyeglasses-contacts/eyeglasses/designer-frames/`
  has **no h1 in the source**, and the default is its own `<title>` "Designer Frames" (**L20**, an operator decision).
- **Breadcrumb:** rendered only where the source has one (338 pages). The trail is Home, the ancestors, then the current
  page, with the source labels. The separator is the source "»" in a green-600 `aria-hidden` span. Links are green-800
  700 `--fs-sm` (5.66 on A) with an underline on hover and focus; the current item is ink-900 with
  `aria-current="page"` and is not a link. Empty segments are dropped (testimonials "Home » »", archives "Home »",
  **L21**). It wraps on phones and is never truncated.

### 3.15 Interior page frame and aside

- `.page-body`: a grid `minmax(0, 1fr) var(--aside)` from 1024px, gap `clamp(24px, 1rem + 2.5vw, 56px)`,
  `padding-top: var(--s-8)`. Below 1024 the aside follows the main column. Solo variant (no sidebar in the source: the
  9 builder pages): one column, max 980px.
- **Aside** (the source sidebar sits outside `<main>` on 337 pages: `<aside>` after `<main>`, in the same order):
  1. the section rail (section 3.17), where it applies;
  2. quick actions (the aside variant of 3.4);
  3. the location card (B): h2 "Clifton Eye Center" linked, address, "Phone:", the map embed (lazy), and the hours list
     with today tinted;
  4. the insurance card (B): h3 "Insurance Plans" plus its paragraph. The empty h3 before it is dropped (**L11**).
  - The search widget is removed (**L11**; there is no search backend in a static build).
  - The aside is `position: sticky` only when its full height fits the viewport (friscoeyesource HV-5); otherwise it is
    static.

### 3.16 Long-form article body

`.sheet.glass--light.is-flat` (padding `clamp(22px, 1rem + 2vw, 44px)`, radius `--r-xl`) holding `.prose`:
- Measure: every child `max-width: var(--measure)`, except figures, tables and embeds (full sheet width).
- h2: Fraunces 500, `clamp(1.5rem, 1.25rem + 1.2vw, 2.2rem)`, slate-700, margin-top 1.6em. h3: Fraunces 600
  `--fs-h3` slate-700. h4-h6: Nunito 700 1.1rem ink-900. Following sibling margin-top .55em.
- Lists: padding-left 1.3em, gap .45em; `ul li::marker` green-600; `ol` markers ink-900 700. Link: green-700,
  underline thickness 1.5px at offset 3px; hover green-800.
- **Tables:** wrapped in `.table-scroll` (overflow-x auto, radius 14px, focusable with `tabindex="0"` and an
  `aria-label` taken from the caption or the preceding heading); th on green-50, 700 ink-900; cells padding 10px 12px;
  1px ink-100 row rules. The page itself never scrolls sideways.
- **Inline images** (by source width and class, `audit/image-classification.json`):
  - `fig--photo` (photos 480px or wider): break out of the sheet padding on one side by `clamp(8px, 2.4vw, 36px)`,
    alternating sides, `rotate(±.6deg)`, radius 22px, `--e-pop`. They straighten on hover (decorative).
  - `fig--plate` (under 480px, clipart, the source's right-floated post image): paper plate, padding 12px, floated right
    at 44% max from 900px up, no break-out.
  - `fig--portrait`: arch mask, 360px max; **Dr. Clifton's 225 x 397 portrait is capped at 225 CSS px and never
    protrudes** (IMAGE-PLAN 1b).
  - **Educational diagrams** (9): on a white plate, **never under blur, tint or multiply**, no break-out (baked labels
    and a third-party mark stay legible).
  - Brand-campaign images (Transitions and so on) as-is, no break-out, never beside a generated image.
- **Embeds:** YouTube iframes at 16:9, radius 20px, with a `title` added (**L13**).
- Blockquote: C1 tint, green-600 left rule 4px, italic. hr: 1px ink-100.
- The EyeGlass Guide attribution ("Special thanks to…") stays verbatim at `--fs-sm`.
- Anchor tables of contents inside library articles (for example `#signs`) are styled as a C1 chip row when they are a
  run of in-page links. `scroll-margin-top: 110px` on headings clears the sticky header.

### 3.17 In-section sub-navigation (the deep libraries)

The source's only sub-navigation is the `ecp-childpages` listings (29 hubs, 169 links) plus breadcrumbs.
- **Section index cards** (from `ecp-childpages`, source content): `ul.index-cards`, a grid
  `repeat(auto-fill, minmax(260px, 1fr))`, gap 20px. Card (B, radius `--r-lg`): an optional source thumbnail (25 exist,
  shown at 325 CSS px or less) that **rises 32px above the card top**; the title link (Nunito 800 `--fs-h4` ink-900,
  stretched to the card with `::after`, one link per card); the summary in `--fs-sm` ink-700 at `--measure-narrow`;
  and an arrow chip. Hover and focus: lift -6px, thumbnail -6px, the chip fills green-700.
- **Section rail** (**L19**, a new navigation built from existing titles; an operator decision, default on): on
  library-article, eyewear-contacts and service pages whose parent has children. The rail heading is **the parent
  page's own title as a link** (no invented label); below it, the siblings' titles as links; the current page is marked
  `aria-current="page"` with a C1 pill. From 1024px it is the top card of the aside. Below 1024px it is a
  `<details>` above the article whose summary text is the parent's title (the same label). Labels come from
  `site-map.json`, never retyped.

### 3.18 Blog index cards and pagination

- `/whats-new/` shows **all 151 summaries on the one URL, in source order** (the source has 0 pagination; adding
  `/page/N/` URLs would change the architecture). The grid is 3, 2 or 1 columns (`minmax(300px, 1fr)`). Each card
  (B, solid below 700px): the date pill (C1), an h2 title link (Nunito 800 `--fs-h4` ink-900, stretched), the excerpt at
  `--measure-narrow`, and the source "Read More" `.more` link. Cards use `content-visibility: auto;
  contain-intrinsic-size: auto 280px`. Only the first 12 cards carry reveals.
- **Pagination: not built** (an operator decision). If it is approved later: `/whats-new/page/N/` URLs (an ADD ledger
  row, because they are new pages), numbered 44px buttons, the current page as a C1 pill with `aria-current="page"`.
  The source has no pagination labels, so any visible "previous/next" wording would also need a ledger row.

### 3.19 Blog post

`band--plain` with the h1 and the date pill (C1) in the title panel; `.page-body` with the aside; `.prose` sheet. The
source's usually right-floated picture becomes `fig--plate` (or `fig--photo` at 480px and wider); 404 slots use the
image-plan slot-fills (`fillFor`). The 2 YouTube posts use the embed rules. There is no previous/next navigation (the
source has none).

### 3.20 Forms (appointment request, contact form)

Only the two pages with a Gravity Forms wrapper inside `<main>` render a form (PORT-NOTES F-1). The form sits in a B
sheet; **fields are solid paper, never translucent**.
- **Field:** label Nunito 700 `--fs-base` ink-900; required mark "*" in alert (as in Gravity Forms), with
  `aria-required="true"`; the source description in `--fs-sm` ink-600 at `--measure-narrow`, linked with
  `aria-describedby`; control min-height 48px, padding 12px 14px, radius `--r-sm`, 1.5px ink-500 border (5.39 on paper,
  UI 3.0). Hover: green-600 border. Focus: green-700 border plus the focus ring. Groups (First and Last name; the time
  field HH, MM, AM/PM; the radio sets) use `<fieldset>` and `<legend>`. Radios and checkboxes are custom 22px controls,
  green-700 when checked, with the native input kept for accessibility.
- **Validation:** native constraint validation. On blur and on submit, an invalid field gets `aria-invalid="true"`, an
  alert border, an alert-50 fill and an error line (alert text 7.80 on alert-50, with an icon) whose text is **the
  browser's own `validationMessage`** (no invented copy). On submit, focus moves to the first invalid field.
- **Honest notice** (BUILD-DECISIONS #4): when a valid submit is prevented, a C1 notice with `role="status"` appears
  above the submit button and takes focus: "This form is not connected yet — please call 318-550-5815", with the number
  as a tel link. Entered data stays in place. Nothing is sent anywhere, and there is no `mailto` fallback. The honeypot
  field is dropped (**L23**).
- Submit: `.btn--primary` "Submit" (source label).

### 3.21 Logo grids (insurance carriers, frame brands, contact-lens brands, payment)

- `ul.logo-grid`: a grid `repeat(auto-fill, minmax(140px, 1fr))`, gap 12px. Each chip is **paper, never glass or blur**,
  min-height 104px, padding 14px, radius 18px, `--e-1`. The logo is shown at intrinsic size (the 133 x 110 files are
  never upscaled) with max-height 70px. The carrier or brand name is shown only where the source prints it.
- Hover and focus only on **linked** chips (for example the `/promotions/` rebate links): lift -6px, `--e-2`, focus
  ring. Unlinked chips get no hover (no false affordance).
- Payment icons (51 x 32): an inline row at intrinsic size.
- The QR code on `/order-contacts-online/` goes on a paper plate at its intrinsic 250px, **lossless, never re-encoded
  or scaled**.

### 3.22 CTA band

The source has no template-level CTA band, and adding one to every page would be invented content. This component only
restyles **the source's own in-content button groups** on the 9 builder pages (for example "BOOK AN APPOINTMENT ONLINE
TODAY!", "Call 318-550-5815"), together with the source heading in the same builder row. It is a C2 band, radius
`--r-xl`, padding `clamp(28px, 4vw, 56px)`; any heading is white (5.30); buttons are inverted (white fill, green-800
text); the focus ring is `--focus-on-dark`. A faint iris ring pair on the right is the decoration. Button labels are
verbatim, and external targets (meetmarlo.com) keep `rel="noopener"`.

### 3.23 404

`/404-page-not-found/` and `dist/404.html`: `band--plain` with the source h1 "404"; one B sheet with the source copy
("The Diagnosis / The Treatment", "(We are Eye Doctors after all!)") and `404.png` on a paper plate; `cut-lens-prism`
floats over the sheet's top-right edge (48px out, `data-depth=-.05`). The source's links stay.

### 3.24 Template map (which components each family uses)

| family (pages) | band | aside | body |
|---|---|---|---|
| home (1) | hero 3.3 | none | 3.4-3.13 |
| service-hub (5) | `/eye-care-services/`: `--photo` (`e73b67d5`), solo; others `--scene` | yes (not the hub) | prose, index cards, CTA band where the source has buttons; the hub's badges become a dock row |
| service-detail (13) | `--scene` | yes | prose, lead figure, `svc-*` feature panel where planned (section 6.4) |
| library-article (101) | `--plain` | yes, plus the section rail | prose, TOC chips; the 13 indexes get index cards |
| eyewear-contacts (47) | `--photo` on the 4 builder hubs (`9271b8ff`, `b98910e8`, `5b34873c` / `df345d8a`), solo; others `--scene` | yes (not the hubs), plus the section rail | prose, logo walls (designer-frames 31, promotions), QR plate, brand photos as-is |
| insurance (4) | `/insurance/`: `--photo` (`57b0091d`), solo; children `--scene` | children only | logo grid (VSP plus 7 medical), CTA band, index cards |
| contact-forms (6) | `--scene`; `/hours-location/`: `--photo` (`69e5a18d`), solo | forms pages and `/contact-us/` | forms 3.20; the hours-location page uses 3.12 plus the payment accordion; `/location/*` uses 3.12; patient forms: PDF link cards to the harvested local PDFs |
| blog-index (1) | `--scene` | no | 3.18 |
| blog-post (151) | `--plain` | yes | 3.19 |
| doctor-team (2) | `/our-eye-doctors/`: `--photo` (`29a1ce9d`, a stock patient, **never captioned as the doctor**), solo; `/team/*`: `--plain` | `/team/*` | team card: arch portrait at 225px or less, h2 "Dr. Deana Clifton, OD", "Read More"; tel button; emergency card |
| staff (1), legal (4) | `--plain` | yes | prose (the empty team module is dropped) |
| testimonials (4) | `--plain` | yes | review cards 3.8 |
| archive (5) | `--plain` | yes | link list as index cards without summaries; `/category/our-doctors/` loses its search form (**L11**) |
| platform-artefact (4) | `--plain` | no | kept and noindex (SITE-ARCHITECTURE 11); the 404 uses 3.23 |

## 4. Protrusion rules

Values are **at rest** (parallax 0: reduced motion, or a viewport taller than 2400px). Re-measure after the fonts load;
the build passes when each value is within ±8px of the table, or when a changed value is recorded with a reason.
**Parallax may never erase a protrusion:** every `[data-depth]` element on a protrusion carries `data-depth-max` of 40%
of its rest offset or less (canopy's global ±42px shrank the promo break-out to 16px at 768).

### 4.1 Home

| element (plane) | breaks | 390 | 768 | 1024 | 1440 | rule |
|---|---|---|---|---|---|---|
| hero arch photo (P3) | hero stage bottom, then the hero section | slides 32px under the statement glass | same as 390 | below the stage by about 57px (lab) | below the stage by about 149px, past the section by about 79px (lab) | `margin-bottom: -96px` from 860px |
| `cut-eyeglasses` (P3) | photo frame left edge plus photo bottom (< 860); photo bottom-right plus the hero seam (>= 860) | 28px below the photo; x from 12px | same as 390 | `margin: 0 -24px -132px 0` | same as 1024 | never over the face, any dock label or the Welcome h1 |
| statement glass over the photo (P2 over P3) | overlaps the photo | 32px (photo under glass) | 32px | 96px | 170px | recipe A only |
| service photos (P3) | card top | 40px (lab 39) | 56px (lab 55) | 56px | 56px | frame `margin-top` |
| smile cluster (P3) | services band bottom seam | about 89px up (lab) | about 78px | about 78px | about 78px | start = band tail - 30px; at least 24px clear of the card bottoms (lab 26-30) |
| `cut-olive-sprig` (P3) | Welcome / Services seam | hidden | 150px below the Welcome bottom | same | same | 561px and wider only |
| promo photo (P3) | card top and left | 44px up, left overhang 10px | 52px up, overhang 10px | 52px up, overhang 10px | 52px up, overhang 48px | left edge at least 16px inside the viewport (lab min 18px) |
| iris (P3) | Q&A panel edge | 40px over the panel top | 40px over the panel top | 36px over the panel's left edge | 36px | at least 40px from panel text (lab 49px) |
| designer plates (P3) | band edges | bottom row hangs 64px | 4-up hang 96px | 96px | odd rise 96px above the top, even hang 72px below the bottom | clearance padding, section 3.11 |
| brand ads (P3) | plate top | 34px | 42px | 42px | 42px | `margin-top` negative |
| NAP card (P2 over map) | map panel | 48px over the map bottom | 120px over | 120px over | columns 7-10 over the map by about 24px plus 1 column | recipe A over the map |
| header logo plate (P4) | header bar bottom | about 36px (scrolled about 13px) | same | about 43px (scrolled about 11px) | same | transform-only scaling |

### 4.2 Interior templates

| element | breaks | offset | rule |
|---|---|---|---|
| title-band cut-out | band bottom into the first sheet | `clamp(40px, 6vw, 96px)` (40px at 390, about 61px at 1024, 86px at 1440); 120-150px wide below 768 | only on the pages in section 6.3; never over the h1 |
| `--photo` band: title panel over the photo | the photo's edge | 48px (>= 1024) / 32px over the photo top (< 1024) | recipe A |
| `fig--photo` | sheet padding, one side | `clamp(8px, 2.4vw, 36px)`, alternating | never on diagrams, logos, the QR code or the doctor portrait |
| index-card thumbnail | card top | 32px | only the 25 thumbnailed children |
| 404 prism | sheet top-right | 48px | |
| CTA band | none | none | a flat C2 band; depth comes from its shadow |

### 4.3 No-horizontal-scroll guard

Construction rules:
1. **Never set `overflow-x` on `html` or `body`.** It masks the measurement.
2. Sections carry **no overflow property**. Side-spilling decoration lives only in a `.deco` wrapper (section 3.10),
   which clips. The fixed `.field` clips itself.
3. Every horizontal protrusion offset is bounded by the gutter: `var(--over)` for the promo, `-24px` for the
   cut-eyeglasses only where the wrap margin is larger (860px and up: `.wrap` leaves at least 16px), and
   `right: max(8px, 4%)` for band cut-outs.
4. Rotated or animated decorations are measured at their widest pose. A morphing orb or a rotating sprig can overflow
   later than first paint (the canopy lab lesson).

Measurement (gate): with one foreground headless Chrome, at 390, 768, 1024 and 1440, in normal and reduced motion, on
the home page plus one page per family: scroll through, then sample `document.documentElement.scrollWidth` **12 times
over about 6 seconds**. The value must equal `innerWidth` every time. Also list every element whose box extends past
`[0, innerWidth]` (`tools/overflow.mjs`); the list must be empty. Lift `tmp/lab/canopy/_tools/measure.mjs`.

## 5. Motion spec

### 5.1 Reveal variants

| variant | hidden state | duration and easing | used on |
|---|---|---|---|
| `up` (default) | opacity 0, `translate: 0 34px` | opacity .8s, translate .9s, `--ease-out` | cards, sheets, titles |
| `left` / `right` | opacity 0, `translate: ∓40px 0` | same | hero statement (>= 860), #HeretoHelp side |
| `rise` | opacity 0, `translate: 0 60px; scale: .96` | 1s | service cards, designer plates, index cards |
| `blur` | opacity 0, `scale: .94; filter: blur(10px)` | .9s | non-LCP media only (promo image, band photo) |
| `settle` | **opacity 1**, `scale: 1.06` | 1.2s | hero arch photo wrapper: never hidden, because it is the LCP element |
| swash draw | `stroke-dashoffset: 320` | 1.4s `--ease-out`, .7s delay | "We Know You!" |

Stagger: `--i` = index mod 6 inside `[data-stagger]`, delay `calc(var(--i) * 90ms)`. Per-page reveal budget: at most 40
revealed elements. Long lists reveal only their first 12 items.

### 5.2 Reveal implementation (the traps from DESIGN-BRIEF, plus the lab lessons)

1. **Set `js-motion` in `<head>` before first paint**, with a 4-second rollback if `site.js` never runs (neighborhood
   index.html line 9, renamed to `window.__siteReady`). Never add it from an end-of-body script (the UX must-fix: canopy
   could fade already-painted content out and back in).
2. **The hidden state has no transition; only `.is-in` animates** (neighborhood 627-633):
   ```css
   .js-motion [data-reveal] { opacity: 0; translate: 0 34px; }
   .js-motion [data-reveal].is-in { opacity: 1; translate: none; scale: none; filter: none;
     transition: opacity .8s var(--ease-out), translate .9s var(--ease-out), scale 1s var(--ease-out), filter .9s var(--ease-out);
     transition-delay: calc(var(--i, 0) * var(--stagger)); }
   ```
3. IntersectionObserver with `root: null, rootMargin: '0px', threshold: 0`, unobserve after reveal (canopy lab.js
   63-88). Never a ratio threshold: a tall element such as a form can never show 8% of itself at once.
4. **Release:** remove `data-reveal` and `--i` at `1000 + i * 90` ms after the entrance, so reveal rules never outrank
   hover transforms.
5. **The fail-safe runs only if the observer never delivered any entry** (3s), never as an unconditional timer.
   `beforeprint` reveals everything.
6. No scroll-timeline reveals. If any are added later: never `cover N%` ranges; fixed-length entry ranges plus an
   at-load exemption.

### 5.3 Scroll-linked effects (one rAF-throttled passive scroll handler, canopy lab.js 12-61)

- **Progress bar:** fixed, 3px, z 60, `transform: scaleX(var(--scroll))`, green-400 to green-600.
- **Header condense** at `scrollY > 40`: transform only (section 3.2).
- **Parallax** on `[data-depth]`: offset = clamp(-(element centre - viewport centre) x depth x k, ±max), where k is 1
  (0.55 below 700px) and max is `data-depth-max` or 42px. Skip layers more than 1.6 viewports away. Re-measure on
  `load`, `document.fonts.ready` and resize, with `translate` reset while measuring. Rest at 0 when
  `innerHeight > 2400` (full-page captures show the designed composition, a lens rule).
- **Hero progress** `--hp` (0-1 over the hero height): the photo's inner scale 1.06 to 1.0 and `translate` 0 to 20px;
  the sun pool drifts.
- `data-rot` (sprig only): rotation of ±12deg with scroll.

### 5.4 Ambient loops (700px and wider, motion allowed)

Blob drift 38-60s alternate; orb morph 24s; hero beams slide 18s; map pin ping 2.4s (only if a pin is drawn over the
real embed; otherwise none). No other loops.

### 5.5 Hover and focus

Rules: every `:hover` rule has an identical `:focus-visible` partner (or `:focus-within` for containers).
Movement-only hover (lift, tilt, zoom) is wrapped in `@media (hover: hover)` so taps do not leave cards stuck lifted;
focus states apply everywhere. **Tilt is fine-pointer only and starts only after the reveal is released;** keyboard
focus gets the same lift without rotation.

| component | hover and focus-visible | timing |
|---|---|---|
| nav link | green-900, C1 wash, underline grows from the centre | .3s colour, .4s underline |
| band pill | fill .82, -1px, glimmer | .3s / .7s |
| button | -2px, glimmer, arrow +3px, primary to green-800 | .35s / .8s |
| round button | -2px, green-900 | .3s |
| dock tile | -6px, `--e-4`, icon -8deg x 1.08 | .45s, icon spring .5s |
| service card | -10px, tilt up to 7deg, frame -8px, image x1.1, chip fills and rotates -45deg | .55s, image .9s |
| linked title | arrow +6px, slate-900 | .4s |
| text links in cards (news title, NAP name, footer) | underline grows (`background-size` or `scaleX`) | .4-.5s |
| `.more` | arrow +4px | .35s |
| accordion item | +4px x, shadow; icon green-100 and 90deg | .4s, icon .5s |
| brand plate | -8px, ad -10px, `--e-4` | .5s |
| promo card (focus-within) | image x1.06 | .9s |
| social icon | -3px, -8deg, green-300 | spring .35s |
| index card | -6px, thumbnail -6px, chip fills | .45s |
| linked logo chip | -6px, `--e-2` | .45s spring |
| glass specular | shown on hover, focus-visible and focus-within; follows fine pointers | .4s |
| carousel buttons | green-700 fill, white glyph | .3s |
| form control | green-600 border (hover), green-700 border plus ring (focus) | .2s |

Verification: a static scan (every `:hover` selector has a focus partner) plus the CDP comparator
(`tmp/lab/canopy/_tools/hover-focus.mjs`) on at least 12 components: a real mouse hover and a real Tab focus must
produce the same computed transform, colour and shadow. It caught a real mismatch in the lab (the global `a:hover`
colour).

### 5.6 Carousel behaviour (testimonials, below 1024px)

- Markup: `section[aria-roledescription="carousel"][aria-label="#HappyPatients"]` wrapping `ul.rev-track`; each `li`
  has `role="group"`, `aria-roledescription="slide"` and `aria-label="1 of 3"` (**L13**). Prev and next are 44px round
  buttons labelled "Previous slide" and "Next slide" (the source Splide strings), placed under the track and
  right-aligned.
- Track: `display: flex; overflow-x: auto; scroll-snap-type: x mandatory; gap: 16px; scroll-padding-inline:
  var(--gutter)`; each slide `flex: 0 0 min(86%, 420px); scroll-snap-align: start`, so the next card peeks. The
  scrollbar is hidden visually and the track is focusable (`tabindex="0"`) for arrow-key scrolling. `touch-action:
  pan-x pan-y`. The track clips itself; it never widens the page.
- Buttons scroll by one slide width (`scrollBy` with `behavior: smooth`, or `auto` under reduced motion). A button gets
  `aria-disabled="true"` and a .45 opacity at the ends.
- **No autoplay** (the source Splide autoplayed, **L04**). From 1024px the track is a static grid and the buttons are
  `hidden`.

### 5.7 Reduced motion (`prefers-reduced-motion: reduce`)

- `js-motion` is never set, so nothing is ever hidden. No parallax (the JS returns before writing `--py`), no tilt, no
  ambient loops, and the swash is drawn statically.
- `*, *::before, *::after { animation: none !important; transition-duration: .01ms !important; transition-delay: 0s
  !important; scroll-behavior: auto !important; }`.
- **Hover and focus keep colour, underline and shadow changes but lose all movement:** `transform`, `translate`,
  `rotate` and `scale` are none on hover and focus (lens rule; canopy still lifted cards instantly).
- The drawer appears without sliding. The carousel scrolls instantly. The progress bar still tracks scroll (it is direct
  feedback, not animation).

### 5.8 Property ownership (so reveals, parallax and hover never fight)

- `transform`: hover and focus lift and tilt only.
- `translate`: the reveal entrance **or** parallax (`--py`), **never both on one element**. Wrap one inside the other
  (for example `figure[data-depth] > span[data-reveal]`).
- `scale`: reveal entrance, or hero progress on an inner `img`.
- `rotate`: static tilts (promo, cut-outs) and the sprig's scroll rotation.
- `opacity` and `filter`: reveal only.

### 5.9 Implementation traps (checklist)

1. `backdrop-filter` needs the `-webkit-` prefix and the **combined** `@supports not (… or …)` fallback.
2. `mix-blend-mode: multiply` cannot drop the JPEG logo's white inside a sticky header or any `backdrop-filter`
   stacking context (canopy and lens both measured it). Use the paper plate; keep the glass a sibling layer.
3. A scrolled header must not change any layout size; a 20px shift silently invalidated a scroll-stepped pixel probe
   in the lab until a drift guard was added. Keep the drift guard in the probe.
4. One `scrollWidth` reading misses overflow from rotating or morphing decoration: sample it over time.
5. Protrusions need `overflow: visible` on every ancestor up to the section. Only `.deco` clips.
6. CDP `Page.captureScreenshot` clip coordinates are page coordinates, not `getBoundingClientRect` coordinates.
7. `tools/jserrors.mjs --paths /x` needs `MSYS_NO_PATHCONV=1` in Git Bash, or it silently loads
   `C:/Program Files/Git/x` and reports 0 errors.
8. A hidden or background Chrome tab throttles rAF, scroll events and IntersectionObserver: measure in a foreground
   headless page, one Chrome at a time, and always close it.
9. `.glass > *` sets `position: relative` on every child; absolute children need a more specific rule.
10. `:has()` is avoided for states that must work in older engines; use `:focus-within`.
11. Links keep root-relative paths, so previews must be served over http, never `file://`.

## 6. Image slot map

Generated images are illustrative, labelled as AI-generated in file metadata (IPTC `trainedAlgorithmicMedia` XMP after
any re-encode) and in the handoff docs, and **decorative (`alt=""`) in every slot below** except the `svc-*` feature
panels and slot-fills, which use their plan alt (**L18**). `src/content/image-plan.json` `usedFor` was updated to match this map
(20 entries, 16 generated, 4 slot-fills; schema and every other field unchanged, checked against git HEAD).
`docs/IMAGE-PLAN.md` section 3a was aligned with it.

### 6.1 Home

| slot | image | notes |
|---|---|---|
| header logo plate, footer logo plate | `assets/source/666ec49d-clifton_eye_center_medium-e1478229278850.jpg` | trimmed in CSS; the file is never edited |
| hero stage backdrop | plan `scene-greenery-window` | blur 6px, opacity .55, under a veil; serve at about 960px wide (it is blurred) |
| hero arch photo | `6a111a60-Girl-Smiling-Brown-Hair-1280x853.jpg` | `alt=""`; LCP; `fetchpriority="high"` |
| hero cut-out | plan `cut-eyeglasses` | not rendered until the reviewed file exists |
| promo | `ea0df44c-contact-in-water.jpg` | `alt=""` |
| service tiles | `81b71862`, `291abc74`, `0d41af0c`, `e0cfe7e9` | `alt=""` |
| Welcome/Services seam | plan `cut-olive-sprig` | 561px and wider |
| smile cluster | `663dba41`, `34ee7792`, `48c72009` | `aria-hidden`, never paired with a quote |
| designer ads | `f502f0b5-Kaenon-Ad.jpg`, `e33aad07-IZOD-Ad.jpg`, `81fe17d9-AlanJ_250x300.jpg`, `f3fc2141-Converse-20Ad.jpg` | unaltered; alts verbatim |
| #HeretoHelp | CSS iris | no file |
| map | keyless embed | verified in browser QA |

### 6.2 Title-band backdrops (P1, heavily blurred, never captioned)

| scope | band | backdrop |
|---|---|---|
| `/eye-care-services/` and its hubs and details (not the library) | `--scene` (the hub: `--photo`) | `scene-exam-room` |
| `/eyeglasses-contacts/**`, `/order-contacts-online/`, `/promotions/` | `--scene` (4 hubs: `--photo`) | `scene-optical-boutique` |
| `/insurance/**`, `/contact-us/**`, `/hours-location/`, `/location/*`, `/our-eye-doctors/`, `/team/*`, `/whats-new/` | `--scene` or `--photo` as in 3.24 | `scene-greenery-window` (never `scene-exam-room` near address copy, IMAGE-PLAN 3c) |
| library, blog posts, staff, legal, testimonials, archives, artefacts, 404 | `--plain` | none (light field and iris ring) |

`--photo` sources (framed, never full-bleed): `e73b67d5-new-services-hero-2b` (/eye-care-services/),
`9271b8ff-Glasses-hero-1` (/eyeglasses-contacts/eyeglasses/), `b98910e8-Glasses-Contacts-hero` (/eyeglasses-contacts/
and /contact-lenses/), `5b34873c-Designer-Frame-3a` and `df345d8a-Frames-Chanel-Pink-sm` (/designer-frames/, as-is),
`57b0091d-Insurance-Family-3` (/insurance/), `69e5a18d-highway-location-page` (/hours-location/),
`29a1ce9d-Docs-Adult-header-1` (/our-eye-doctors/, a stock patient, never captioned as the doctor). The mobile-only
variants (`cffb21c7`, `d5d8ab84`) are used through `<picture>` below 768px.

### 6.3 Title-band cut-outs (by URL prefix, first match wins)

| prefix | cut-out |
|---|---|
| `/eye-care-services/eye-exams/pediatric-eye-exams/`, `/eyeglasses-contacts/eyeglasses/kids-optical/` | `cut-kids-glasses` |
| `/eye-care-services/eye-exams/` (and children) | `cut-phoropter` |
| `/eye-care-services/contact-lens-exams/`, `/eyeglasses-contacts/contact-lenses/`, `/order-contacts-online/` | `cut-contact-lens` |
| `/eyeglasses-contacts/eyeglasses/sunglasses/` | `cut-sunglasses` |
| `/eyeglasses-contacts/eyeglasses/lens-treatments/` | `cut-lens-prism` |
| `/eyeglasses-contacts/eyeglasses/transitions-lenses/`, `/eyeglasses-contacts/eyeglasses/designer-frames/`, `/promotions/` | **none** (brand-named pages) |
| `/eyeglasses-contacts/` and the rest of `/eyeglasses-contacts/eyeglasses/` | `cut-eyeglasses` |
| `/eye-care-services/` hub, `eye-conditions/`, `management-of-ocular-diseases/`, `eye-emergencies-pinkred-eyes/`, `lasik-refractive-surgery-co-management/`, the 13 `your-eye-health` section indexes | `cut-lens-prism` |
| 404 | `cut-lens-prism` (on the sheet, 3.23) |
| everything else | none |

**Exclusions, applied after the table (deterministic):**
1. Build a `brandNames` list from the alt text, captions and file names of the classes `designer-frame-brand-logo`,
   `contact-lens-brand-logo`, `insurance-carrier-logo` and `brand-campaign-image` in `audit/image-classification.json`,
   plus KAENON, IZOD, ALAN J, CONVERSE and Transitions. If the page's main text contains any of them (case-insensitive,
   whole word), **no generated image renders on that page** (IMAGE-PLAN 3c; the friscoeyesource "Prada" lesson).
2. If the main text contains "Dr. Clifton", "Deana" or "Ask Dr.", no generated image renders on that page.
3. A cut-out renders only if its reviewed file exists in `assets/generated/` with the AI label. A missing file means an
   empty slot, never a placeholder.

The build logs the resolved slot per page (`audit/image-slots.json`) so the handoff can list every generated image by
page.

### 6.4 Content images

- `svc-eye-exam` (/eye-care-services/eye-exams/, the hub's eye-exam section), `svc-contact-lens`
  (/eye-care-services/contact-lens-exams/, /eyeglasses-contacts/contact-lenses/), `svc-pediatric-exam` (pediatric,
  kids-optical), `svc-dry-eye` (dry-eye page only; never beside Dr. Clifton copy), `svc-eyewear-boutique`
  (/eyeglasses-contacts/eyeglasses/, the hub's optical section, and the `fillFor` slot): each is a `fig--photo` feature
  figure at the top of the first sheet, with its plan alt. The same exclusions as 6.3 apply.
- Slot-fills (`fill-winter-sunglasses`, `fill-computer-glasses`, `fill-senior-thought`, `fill-clipart-010`): replace
  the broken source `<img>` in place as `fig--plate`, `alt=""`.
- `tex-frosted-glass`: optional, at 6% opacity inside the hero statement and the large sheets only, if the reviewed
  file shows no seam. The contrast probe re-runs if it is used.
- All other source images: as classified in IMAGE-PLAN section 1, at or below their native size.

### 6.5 Delivery

WebP for photos (cwebp is on PATH), PNG for cut-outs (or lossless WebP with alpha), explicit `width` and `height` on
every `<img>`, `loading="lazy"` below the fold, `srcset` at 1x/2x only up to the native width (never upscaled). The QR
code is served byte-identical.

## 7. Grafts, must-fix resolutions and ledger

### 7.1 Grafts adopted

| from | graft | where |
|---|---|---|
| lens | full-bleed lime footer field reaching the page bottom | 3.13 |
| lens | full-bleed solid `#759b2a` designer band; staggered plates crossing both edges | 3.11 |
| lens | green-iris illustration instead of the "?" bubble and sprig | 3.9, 3.10 |
| lens | first FAQ item open; large rows with a rotating, filling +/- icon | 3.9 |
| lens | semantic services `<ul>` with bold lead terms; product offerings as a plain list | 3.7 |
| lens | reviews in one panel as a level row | 3.8 |
| lens | a sticky header that stays small on phones (64px here) | 3.2 |
| lens | service labels at `--fs-sm` | 3.6 |
| lens | header fill at recipe-A strength with green-800 nav text; dark glass at .90/.92 over the lime field; the combined `@supports` condition | 2.7, 3.2 |
| lens | reveals on individual `translate` / `scale` properties | 5.8 |
| neighborhood | hanging logo paper plate that shrinks on scroll | 3.2 |
| neighborhood | green italic "in Bossier City, Louisiana"; italic "Ask Dr. Deana Clifton a Question..." | 3.5, 3.9 |
| neighborhood | NAP card overlapping a larger map, emergency card offset | 3.12 |
| neighborhood | `js-motion` in `<head>` with a rollback; hidden state without a transition | 5.2 |
| neighborhood | a compact green top strip on phones (the Call pill) | 3.1 |
| neighborhood | 44px minimum height for buttons and pills | 3.0 |
| neighborhood | left-aligned headings on interior pages; a larger hashtag scale | 3.5, 2.3 |
| neighborhood | glass over photography (header over the hero scene, NAP over the map, band title over photos) | 2.7, 3.3, 3.14 |

**Not adopted:** lens chromatic magenta/cyan rims (off-brand hues that read as artifacts); lens ring fields and rotating
tick gauges (clinical tone; repetition across 349 pages); the lens loupe (upscales the hero photo 1.21x); the
neighborhood sand palette (outside BRAND-SYSTEM; pulls away from green); the neighborhood split tagline and zigzag
layouts (hard to scale, slower to scan); **any placement of a portrait next to a named review** (reviewer identity is
unverified, bylaw B3).

### 7.2 Judges' must-fix list and how this spec resolves it

| # | must-fix (judge) | resolution |
|---|---|---|
| 1 | Footer lost the lime band; empty ground under it (brand) | full-bleed lime field to the page bottom (3.13) |
| 2 | Leaf-motif overuse (brand) | all SVG leaves and leaf shade deleted; one `cut-olive-sprig` on the home page; iris as the emblem (3.10) |
| 3 | Visible lab labels over imagery (brand, UX) | no placeholder ships: a missing cut-out means an empty slot; the map is the real embed or the BUILD-DECISIONS fallback (3.3, 3.12, 6.3) |
| 4 | Fonts not real; swash and weight tuned on fallbacks (brand) | self-host 8 woff2; re-tune the weight and swash; re-measure every number; no fallback-font probe counts (2.2) |
| 5 | Designer title contrast on the edge (brand, UX) | solid band with no pools; `--band-pool` behind the title (model 3.98); gate: measured 3.5 or more (3.11) |
| 6 | Ledger rows missing (brand, depth) | rows L01-L23 (7.4) |
| 7 | Phone hero loses its protrusion under the dock (brand, depth) | the photo slides under the glass; the cut-out breaks the photo frame; the dock moves below (3.3) |
| 8 | WebKit/Safari unverified (brand, depth) | prefixed plus combined fallback; a real Safari check is gate G13 (operator) |
| 9 | Phone type: service labels and brand names at 12.5-12.8px (UX) | `--fs-sm` (14.5px or more), tracking at most .08em (3.6, 3.11) |
| 10 | Sticky header 113px on phones (UX) | 64px layout height, transform-only condense (3.2) |
| 11 | Reveal fade-out risk (UX) | head script plus a no-transition hidden state (5.2) |
| 12 | Reading measure 73-78 characters per line (UX) | `--measure: 66ch` on all prose and answers; answers at `--fs-base` (2.3, 3.9, 3.16) |
| 13 | Appointment has no emphasis (UX) | primary C2 tile, order unchanged (3.4) |
| 14 | No phone number on screen as text at 390 (UX) | the phone top strip with "Call Us: 318-550-5815" (3.1); gate G9 |
| 15 | Product chips are a false affordance (UX) | a plain list (3.7) |
| 16 | Thin margins: "We Know You!" 3.11 (UX) | the swash moves out of the glyph box; gate: measured 4.5 or more (3.3) |
| 17 | Glass budget on phones: 31 surfaces plus loops (UX) | 10 or fewer blurred surfaces at 390, no loops below 700px, flat long sheets; frame-time profile (2.7, 5.4, G10) |
| 18 | Legal links 17px tall; footer links 32px (UX) | 24px minimum, 44px on phones (3.13) |
| 19 | Promo photo crowding the heading at 390; dead #HeretoHelp column (UX, depth) | a 76px margin; the iris overlaps the panel (3.7, 3.9) |
| 20 | Cut-out must not cover the face or the dock (UX) | collision gate G5 (3.3) |
| 21 | Glass reads as flat white cards (depth) | the hero scene backdrop; recipe A over photos; pools under every B sheet edge (2.7, 3.3) |
| 22 | Equal-height review voids (depth) | content height, level row (3.8) |
| 23 | Contrast measured at too few widths (depth) | the probe at 390/768/1024/1440, home plus one page per family (G2) |
| 24 | Emergency crimson rim bolted on; muddy footer halo (depth) | rim removed; the lime field replaces the halo (3.12, 3.13) |
| 25 | Dead vertical gaps between sections (depth) | the `--s-8` / `--s-9` scale; `--s-9` only where a protrusion needs clearance (2.4) |
| 26 | "© 2026" missing (lens only) | kept; "Powered by" removed with a row (3.13, L11) |
| 27 | Dock icon glyph at 2.61 on `#86ad38` (**new, found while writing this spec**) | icon gradient `#759b2a` to green-600 (2.1, 3.4) |

### 7.3 Semantics kept from the lab

The hero statement stays a `<p>` (as in the source); the location title stays a `<p>` link; the site has one `<h1>` per
page; the landmarks are header, nav, main, aside and footer.

### 7.4 Change-control ledger rows the build must record

| id | kind | change | why |
|---|---|---|---|
| L01 | CHANGE | top-bar "Make an Appointment" dead `<span href="">` becomes a link to `/contact-us/appointment-request-form/` | BUILD-DECISIONS #6 |
| L02 | CHANGE | the top bar shows on phones in compact form (Call pill below 720px; address plus Call from 720 to 1023px) | UX: phone number on screen |
| L03 | CHANGE | desktop-only home rows (reviews, Q&A, designer) show at every width | BUILD-DECISIONS #7 |
| L04 | CHANGE | the Splide testimonial carousel (autoplay) becomes a static row from 1024px and a user-driven snap track below; the image carousel becomes a static smile cluster | WCAG 2.2.2; the no-JS reading order |
| L05 | CHANGE | accordion `<a href="#">` toggles plus hidden divs become `<details>/<summary>`; the first item is open | accessibility; the lens graft |
| L06 | CHANGE | headings: "What's New!" h1 to h2; div titles and the designer `<p>` to h2; promo h4 to h3 | one h1; heading order |
| L07 | CHANGE | markup only: a span on "in Bossier City, Louisiana"; `<strong>` on the 3 service lead terms | emphasis; text unchanged |
| L09 | CHANGE | alias hrefs re-pointed to canonical URLs (pediatric tile, 4 designer plates, 3 dry-eye links, and the other SITE-ARCHITECTURE section 10 aliases) | aliases 301 on the live site |
| L10 | CHANGE | footer "Sitemap" `/sitemap/` (404) to `/sitemap.xml` | BUILD-DECISIONS #5 |
| L11 | REMOVE | footer voice search; sidebar search (337) and the 5 in-main search modules; "Powered by" plus the EyeCarePro logo; Login; "Return to top of menu" (replaced by a JS focus trap); GTM; footer microdata with wrong coordinates; empty team modules; the empty sidebar h3; `review-quote.png`; the `/category/our-doctors/` search form | platform or vendor, or no backend |
| L12 | CHANGE | alts: service tiles, promo and smiles `alt=""`; filename-derived alts on broken images become `""` | the source alts are file names or repeat the caption |
| L13 | ADD | non-visible accessibility labels: "5 out of 5 stars", "Quick links", "Clifton Eye Center home", "Make an appointment" / "Call" on the round buttons, map and YouTube iframe titles, carousel slide labels "n of 3", the breadcrumb nav label | accessibility; no visible copy |
| L14 | REMOVE | the hidden `ratingValue` "5" microdata | not rendered on the live site |
| L15 | CHANGE | the logo is presented on paper plates (the file is untouched) | the JPEG white box |
| L16 | ADD | today's hours row highlighted (background only) | wayfinding; no text added |
| L17 | CHANGE | `tel: 318-550-5815` (space) becomes `tel:318-550-5815` | a valid URI |
| L18 | ADD | generated imagery per section 6 (hero cut-out and backdrop, the seam sprig, band backdrops and cut-outs, `svc-*` panels, slot-fills), all labelled AI-generated | the operator's request |
| L19 | ADD | the section rail from the parent and sibling titles (library, eyewear, services) | in-section wayfinding; operator can turn it off |
| L20 | ADD | `/designer-frames/` gets an h1 from its own `<title>` "Designer Frames" | the source page has no h1 |
| L21 | CHANGE | empty breadcrumb segments dropped | the source prints "Home » »" |
| L22 | CHANGE | keyed Maps embed becomes keyless (fallback link if unresolved) | BUILD-DECISIONS #10; the agency key never ships |
| L23 | CHANGE | forms are inert with the honest notice; the honeypot is dropped | BUILD-DECISIONS #4 |

(L08 is intentionally unused: the product list was already a `<ul>` in the source.)

### 7.5 Verification gates (the build is not done until each is shown with evidence)

| gate | check | pass |
|---|---|---|
| G1 | copy parity: every visible text node and non-empty alt appears verbatim in `audit/raw` (lens `copy-parity.mjs` plus its `--control`) | 0 unexplained; the control fails |
| G2 | pixel contrast probe (canopy `contrast-probe.mjs`) at 390/768/1024/1440, home plus one page per family, fonts loaded (`document.fonts.check`) | 0 fails; controls 4.54 and 3.24; drift guard fires on injection; designer title 3.5 or more; "We Know You!" 4.5 or more |
| G3 | overflow (section 4.3), normal and reduced motion | `scrollWidth === innerWidth` over 12 samples; offender list empty |
| G4 | protrusions at rest against section 4 | within ±8px, or a recorded change |
| G5 | collisions: cut-outs vs h1, labels and the photo face box; smiles vs cards (24px or more); iris vs Q&A text (40px or more) | no intersection |
| G6 | hover/focus: the static scan plus the CDP comparator on 12 or more components | 100% partnered; all match |
| G7 | reduced motion | no `js-motion`; 0 hidden; 0 running animations; no transform on `[data-depth]` or on hover |
| G8 | reveals | 0 pending and 0 hidden after scroll-through; no above-fold element's opacity decreases after first paint |
| G9 | phone fold and header at 390 x 844 | Schedule tile bottom at 828 or less; "318-550-5815" visible as text above the fold; header layout 80px or less, top and scrolled; layout-shift entries during scroll = 0 |
| G10 | glass budget | 10 or fewer elements with computed `backdrop-filter` other than none on the home page at 390; scroll frame time profiled at 4x CPU throttle and reported (target p95 at most 16.7ms; unverified until measured) |
| G11 | touch targets at 390 | 44px or more, except inline prose links and legal links (24px or more) |
| G12 | JS errors (`tools/jserrors.mjs`, `MSYS_NO_PATHCONV=1`) | 0, with a positive control |
| G13 | Safari/WebKit render of glass, the prefixed path, fallbacks, `overflow: clip`, individual transforms | **cannot run on this machine**; the operator checks on a Mac or iPhone before client review |
| G14 | generated images | zoomed native crops reviewed (`reviewFocus`); the `trainedAlgorithmicMedia` count equals the shipped generated files; listed in the handoff |
| G15 | secret scan | no `AIza` and no fal key id in `dist/`, with a positive control |
| G16 | no platform survivors | 0 `wp-content`, `fl-`, `gform`, `ecp-`, GTM or icon-font hits in `dist/` |

### 7.6 Decisions for the operator

1. **Nav dropdowns:** the source menu is flat. Default: none (exact structure). The pattern is ready in 3.2 if wanted.
2. **Blog pagination:** default none (151 cards on the one `/whats-new/` URL, as in the source).
3. **Section rail** on library, eyewear and service pages (L19): default on; it can be turned off.
4. **Form notice timing:** default on submit (BUILD-DECISIONS #4). Recommended: also show the same sentence above
   each form, so nobody fills in 9 fields first.
5. **`/designer-frames/` h1:** default "Designer Frames" (its `<title>`).
6. **Safari/WebKit check** (G13) needs an Apple device.
7. Still open from BRAND-SYSTEM: a high-resolution original of the logo (the 317px JPEG caps it at 158 CSS px).
