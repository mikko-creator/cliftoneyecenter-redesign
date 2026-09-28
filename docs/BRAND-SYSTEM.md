# Brand system — Clifton Eye Center redesign

Status: **proposal** (brand stage, 2026-09-28). The tokens below are documented here only; they are not yet in
`src/styles/`. `src/styles/tokens.css` still holds the measured source tokens and stays the evidence baseline.

The redesign keeps the practice's own identity: the logo file untouched, the leaf green as the lead colour, the
source's own darker divider green, its slate headings, its grey-violet body ink and its emergency red. What changes
is how they are used. Where the live site puts small white text on its greens, which fails WCAG AA (table in
section 9), the redesign keeps each green where it passes and moves text to deeper greens that also come from
the source.

## 1. Evidence used (all from disk; the live site was not requested)

| source | what it gave |
|---|---|
| `audit/design-baseline.json` | colour counts: text `#464451` 10456, `#ffffff` 4880, `#757575` 560, `#94bc4a` 450, `#759b2a` 174; background `#759b2a` 134, `#757575` 110, `#94bc4a` 32; border `rgb(68,102,0)` = `#446600` |
| `audit/capture/baseline.{index,eye-care-services-eye-exams,our-eye-doctors,hours-location,contact-us-appointment-request-form,insurance,10-steps-to-prevent-vision-loss}.1440.style.json` | which element carries each colour (section 3), read with `tmp/brand/colormap.mjs <capture> bg or fg` |
| `tmp/shots/live-home.1440.part0..3.png`, `live-home.390.png` | visual confirmation of every role in section 3 |
| `audit/raw/index.html` header/mobile header, `audit/image-inventory.json` | the logo (section 2) |
| `audit/content-inventory.json` | tone phrases (section 4), each checked verbatim |
| `tools/brand-contrast.mjs` → `audit/brand-contrast.json` | every contrast ratio in this document (section 9) |
| `tmp/brand/logopx.mjs` (on an ffmpeg `rgb24` dump of the logo) | logo pixel facts (section 2) |

Provenance note: `colormap.mjs` and `logopx.mjs` were first written to the session scratchpad, outside this
workspace, contrary to the workspace-only rule. They were moved into `tmp/brand/` and the scratchpad copies
(plus a logo pixel dump and a Google Fonts CSS test file) were deleted. Nothing else was written outside the
workspace, and the read-only reference project was not modified (no files changed there in the last 60 minutes).

## 2. The logo

| property | value (measured) |
|---|---|
| file | `assets/source/666ec49d-clifton_eye_center_medium-e1478229278850.jpg` |
| source URL | `https://da4e1j5r7gw87.cloudfront.net/wp-content/uploads/sites/3010/2019/12/clifton_eye_center_medium-e1478229278850.jpg` |
| format | JPEG (`mjpeg`, `yuvj420p`), 8,868 bytes, sha256 `7d005da3…8843a` |
| intrinsic size | **317 × 221 px** (the markup declares `width="317" height="221"`) |
| transparency | **none**: JPEG has no alpha channel. All four corners are `#ffffff`; 74.6% of pixels are near-white (> 245) |
| ink bounding box | x 16–303, y 16–207 → **288 × 192 px (exactly 3:2)**; white margin 16 px top/left, 13 px right/bottom |
| colours in the mark | green "e" mean `#90c04c` (1,303 px), which matches the footer green `#94bc4a`; grey eye and wordmark mean `#727170` (6,771 px), which matches `#757575` |
| where used | desktop header (`.ecp-logo`, CSS `max-width: 170px`), mobile header (`.ecp-mobile-header__logo`), `og:image`, `twitter:image`, JSON-LD `Organization.logo` — on all 349 pages |
| larger or alternate version | **none downloaded.** The inventory has no other Clifton logo, favicon, apple-touch icon or `site-icon`; `audit/raw/index.html` has **no `<link rel="icon">`** at all. Other "logo" files are third-party brand logos (Alcon, CIBA, B+L, CooperVision, X-Cel, EyeCarePro) |
| inventory flags | `LOW-RES-FOR-ROLE`, `THIRD-PARTY-ORIGIN`; decision `REPLACE`, role `BACKGROUND`. The role is mislabelled (it is the logo). **REPLACE must not mean regenerate or redraw**: the only valid replacement is a higher-resolution original from the practice |

Usage rules for the redesign:

- Use the file as-is. Never redraw, recolour, invert, trace or AI-upscale it.
- **Sharpness:** 317 px is only enough for a 2x screen up to about **158 CSS px** wide. Render it at 150–158 px on
  desktop (the live site uses 170 px, about 1.86x) and 112–128 px in the mobile header.
- **White box:** the JPEG's white ground shows as a rectangle on any tinted surface. On light surfaces (paper,
  ground, light glass) set `mix-blend-mode: multiply` on the `<img>` so the white drops out. Multiply over a
  near-white surface changes the mark's grey and green only slightly. **Unverified:** that multiply blends with the
  glass fill inside a `backdrop-filter` stacking context in all engines; check it in Chrome and Safari at build
  time. On dark or deep-green glass (footer), set the logo on a **paper plate** (solid `#ffffff`, radius 16 px,
  12 px padding) and never use multiply there.
- **Trim:** to drop the uneven white margin, wrap the image in a 3:2 box with `overflow: hidden` and offset the
  image by the measured margins (16/13 px at intrinsic size, i.e. `width: 110.07%` (317/288) and
  `margin: -5.56% 0 0 -5.56%` (16/288); vertical margin percentages resolve against the box's width, so both
  are /288). Do this in CSS; never edit the file.
- **Favicon:** the source has none. A favicon cropped from the logo is a new brand asset, so it is an **open
  decision for the practice** (see section 11). Do not ship one on assumption.

## 3. Source palette — measured, by element

| colour | role on the live site | evidence (capture element → text/background) |
|---|---|---|
| `#759b2a` | **lead brand green** | top bar background (`div.fl-row-content-wrap`, y 0, h 109, every page); header buttons "Make an Appointment" / "Call Us: 318-550-5815" (bg, white text, white 1 px border); **main nav link text** (18 px / 700); interior sidebar link badges (`a.ecp-badge`, bg, white text: eye exams, contact, insurance); "Our Designer Optical" band on home (`#759d2a`, a 2-unit variant; white 34 px title) |
| `#94bc4a` | **secondary / footer green** | footer band background on every page ("Important Links", "Quick Links", white text); review stars (`svg.fa-star`, 75 instances on home); matches the logo's green "e" |
| `#446600` | source dark green (rule) | main nav dividers: `ul` left border and each `li` right border (`border-color … rgb(68,102,0)`), 90 + 18 counts in the baseline |
| `#464451` | **body ink** (grey-violet) | 10,456 text nodes; interior h1/h2/h3 (e.g. h1 "Comprehensive Eye Exams" 31.5 px), home body copy, hours table |
| `#36565e` | **heading slate** | home section titles: "Welcome to Clifton Eye Center in Bossier City, Louisiana" (40 px), "Our Most Popular Services" (36 px), "#HeretoHelp" (32 px) |
| `#1d2e33` | deep slate | location band heading "Clifton Eye Center" (22 px), "Is it an Emergency?" callout title (22 px / 700) and its icon, emergency phone button text |
| `#2d2d2d` | hero / statement ink | hero "Your Community / Eye Care Clinic / We Know You!" (42 px); "Ask Dr. Deana Clifton a Question..." (26 px); FAQ accordion labels |
| `#757575` | neutral grey | "#HappyPatients" reviews band background (white text); legal bar links (13 px); social icon circle; hero quick-action badges at `#757575` 53% |
| `#b7b7b7` | grey band | map / hours / emergency band on home |
| `#941221` | emergency red | "Is it an Eye Care Emergency?" (our-eye-doctors, 28 px), "Have An Eye Care Emergency?" (hours-location, 30 px) |
| `#60af28` | promo green | home h4 "FREE Shipping Option on Select Annual and Semi-Annual Supply Promotions" (17.5 px) |
| `#332f2f` | current page nav item | the active nav link on interior pages |
| `#383838`, `#efefef`, `#d8d8d8`, `#f4f4f4`, `#808080` | minor neutrals | hero badge titles; our-eye-doctors bands, team card, band text |
| `#ffffff` | page ground | page background; text on the green and grey bands |

Type on the live site is `Arial, Helvetica, sans-serif` throughout (no web fonts, only the EyeCarePro icon font).

## 4. Tone of voice

Taken verbatim from the site (checked against `audit/content-inventory.json`):

| phrase | where |
|---|---|
| "Your Community Eye Care Clinic" | home hero |
| "We Know You!" | home hero |
| "#HappyPatients" | home reviews heading |
| "#HeretoHelp" | home FAQ heading |
| "Ask Dr. Deana Clifton a Question..." | home FAQ |
| "Eye Exams For the Whole Family" | /eye-care-services/eye-exams |
| "Eye Care for Everyone" | /eye-care-services/eye-exams |
| "we take a personal, individual approach to every examination" | home welcome copy |
| "Our staff wants your eye exam to be a pleasant experience" | home services list |
| "(We are Eye Doctors after all!)" | /404-page-not-found |

**Three adjectives: warm, personal, neighbourly.** The voice speaks as "we" to "you", names the doctor, names the
town (Bossier City), uses hashtags and exclamation marks, and makes the odd pun. It reads as a local family
practice, not a clinic chain and not a luxury brand. The design should match: rounded, soft, friendly type, calm
glass, generous space. Avoid anything that reads as corporate chrome or luxury (black and gold, thin hairline type).
All copy stays word for word.

## 5. Redesign palette — tokens

Every derived value is an sRGB mix of a measured source colour. The hex is resolved by `tools/brand-contrast.mjs`;
the `color-mix()` in each comment is the formula.

```css
:root {
  /* greens — 400 and 500 are the brand anchors, kept exactly; 700 is the source's own nav-divider green */
  --green-50:  #f8faf2; /* color-mix(in srgb, #94bc4a 7%,  #fff) — ground tint, leaf glass */
  --green-100: #eef4e2; /* color-mix(in srgb, #94bc4a 16%, #fff) — leaf glass lower stop, hover wash */
  --green-200: #ddeac5; /* color-mix(in srgb, #94bc4a 32%, #fff) — secondary text on dark glass */
  --green-300: #bdd58f; /* color-mix(in srgb, #94bc4a 62%, #fff) — rims on deep glass, large accents */
  --green-400: #94bc4a; /* BRAND ANCHOR (footer green, stars, logo "e") */
  --green-500: #759b2a; /* BRAND ANCHOR (lead green: top bar, bands, icon tiles, arcs) */
  --green-600: #53760d; /* color-mix(in srgb, #759b2a 30%, #446600) — stars/icons on light, tags, button top stop */
  --green-700: #446600; /* SOURCE nav divider — links, eyebrows, nav text, primary button, focus ring */
  --green-800: #314900; /* color-mix(in srgb, #446600 72%, #000) — hover, current page, links on image glass */
  --green-900: #233500; /* color-mix(in srgb, #446600 52%, #000) — chip text on leaf glass */
  --green-950: #141f00; /* color-mix(in srgb, #446600 30%, #000) — text on the #759b2a band, dark glass, shadow tint */

  /* ink — derived from the source body colour #464451 */
  --ink-950: #232229; /* color-mix(in srgb, #464451 50%, #000) — dark glass lower stop */
  --ink-900: #313039; /* color-mix(in srgb, #464451 70%, #000) — strong text, h3-h6 */
  --ink-700: #464451; /* SOURCE body text */
  --ink-600: #5c5a66; /* color-mix(in srgb, #464451 88%, #fff) — secondary text; NOT on leaf or image glass */
  --ink-500: #6b6974; /* color-mix(in srgb, #464451 80%, #fff) — muted text, input borders (floor for text) */
  --ink-300: #acabb1; /* color-mix(in srgb, #464451 45%, #fff) — hairlines, disabled (never text) */
  --ink-200: #d1d0d4; /* color-mix(in srgb, #464451 25%, #fff) — muted text on dark glass */
  --ink-100: #e9e9ea; /* color-mix(in srgb, #464451 12%, #fff) — dividers */
  --ink-50:  #f6f6f6; /* color-mix(in srgb, #464451 5%,  #fff) — neutral wash */

  /* headings — the source's own slates */
  --slate-700: #36565e; /* SOURCE section headings */
  --slate-900: #1d2e33; /* SOURCE deep slate — hero/display, headings on image glass */

  /* alert — the source's emergency red */
  --alert:    #941221;
  --alert-50: #f8eeef; /* color-mix(in srgb, #941221 7%, #fff) */

  /* surfaces */
  --paper:  #ffffff;
  --ground: #fafcf6; /* color-mix(in srgb, #94bc4a 5%, #fff) — page ground */
  --stone:  #efefef; /* SOURCE neutral band */

  /* light field (layer 0: what the glass refracts; decorative, never behind text darker than this) */
  --field-lime: #cfe1ae; /* color-mix(in srgb, #94bc4a 45%, #fff) — the DEEPEST pool allowed behind glass-light */
  --field-teal: #dfe4e5; /* color-mix(in srgb, #36565e 16%, #fff) */
  --field-leaf: rgb(117 155 42 / .18); /* #759b2a pool; on --ground it stays lighter than --field-lime; never stack it on --field-lime behind text (section 6) */

  /* focus */
  --focus:         #446600; /* on paper, ground and all light glass */
  --focus-on-band: #141f00; /* on the solid #759b2a / #94bc4a bands */
  --focus-on-dark: #d4e4b7; /* color-mix(in srgb, #94bc4a 40%, #fff) — on dark and deep-green glass */

  /* shadow tint (every shadow is green-950, so the depth reads green, not grey) */
  --shade: 20 31 0; /* rgb(var(--shade) / a) */
}
```

### Role map: where each source colour goes

| element | live site | redesign |
|---|---|---|
| top bar | `#759b2a`, white 14 px text (3.24, fails) | **`#759b2a` solid band kept** (the brand's signature strip). Callout text `--green-950` (5.29). The two buttons become white glass pills with `--green-800` text (8.39 worst). Focus uses `--focus-on-band` |
| main nav | `#759b2a` 18 px / 700 on white (3.24, fails); `#446600` dividers | nav on glass-light. Links `--green-700` (5.79 worst). Current page `--green-800` on a glass-leaf pill. `#446600` becomes the hover underline |
| hero statement | `#2d2d2d` 42 px Arial | `--slate-900` in Fraunces at `--fs-display` |
| section headings | `#36565e` | `--slate-700` on light surfaces, `--slate-900` on image glass |
| body | `#464451` | `--ink-700` |
| "Our Designer Optical" band | `#759d2a`, white 34 px | `#759b2a` band kept. **White text only at h2 size or larger** (≥ 26 px at 390; 3.24 passes the large-text threshold of 3.0). Any smaller text on it uses `--green-950` |
| reviews band | `#757575`, white text; stars `#94bc4a` (2.10, fails) | the grey band retires into the ink neutrals. Review cards on glass. Stars `--green-600` on light glass, `--green-700` on image glass, `--green-400` on dark glass |
| location / hours band | `#b7b7b7` | `--ground` plus glass-light cards |
| emergency | `#941221` title on white | `--alert` on light (8.87), or a dark-glass card with an `--alert` icon tile (white glyph 8.87) |
| footer | `#94bc4a`, white text (2.20, fails) | **glass-dark over a lime light field**. `#94bc4a` stays as the footer heading/eyebrow colour (5.12) and the star colour, so the footer still reads lime |
| promo h4 | `#60af28` (2.74, fails) | `--green-600` (4.61 worst) |
| legal bar | `#757575` 13 px | `--ink-500` (5.39) |
| primary buttons | `#759b2a`, white 14 px (fails) | gradient `--green-600 → --green-700` with white text (5.30 at the worst stop). Hover `--green-800` (10.08) |

**Rules for the two anchors.** `#759b2a` carries large white text (≥ 24 px, or ≥ 18.66 px at 700), dark
`--green-950` text at any size, icon tiles, arcs, rules, rims, light-field pools and bands. It never carries
small white text, and it is never used as text or icon colour on glass (2.81 on glass-light). `#94bc4a` is used
for bands with `--green-950` text (7.79), lime text on dark glass (5.12), stars on dark glass, and tints. It
never carries white text (2.20).

## 6. Depth and the light field

The glass needs something behind it to refract. A `backdrop-filter` over flat white is just a grey box. Layer 0 is
a fixed field on `--ground`: soft radial pools of `--field-lime`, `--field-teal` and `--field-leaf`, plus the
imagery. Photos and fal images sit in layer 3 and may break frame and section edges (see `DESIGN-BRIEF.md`). Glass
panels (layer 2) float over both. **Contrast rule:** a light-glass text panel may overlap photography only if it
uses recipe A. Recipe B assumes nothing darker than `--field-lime` is behind it.

**Pools compound where they overlap.** Measured: `--field-leaf` on `--ground` composites to `#e2ebd1` (relative
luminance 0.802, fine), but `--field-leaf` stacked on a full-strength `--field-lime` pool gives `#bfd496` (0.604,
below `--field-lime`'s 0.702). Over that point, `--ink-500` on glass-light drops to **4.41 (fails)**;
`--ink-600` (5.53) and `--green-700` (5.46) still pass. So: **the field's darkest composite point behind any
glass-light text must keep relative luminance ≥ 0.702** (`--field-lime`). Do not stack `--field-leaf` on
`--field-lime` at full strength behind text panels. The build's pixel check must confirm this on the real page.

## 7. Glass surface recipes

Every recipe has a `-webkit-` prefix and a solid fallback under `@supports not (backdrop-filter: blur(1px))`, as
the brief requires. Light always comes from above: an inner top highlight, then a stack of green-tinted shadows.
Each worst-case backdrop below is the one the contrast script uses. Blur only averages the backdrop, so it can
never push the panel past that extreme.

### A. Light glass on imagery — `.glass--image`
Hero panels, cards over photos, quick-action dock over the hero.
```css
.glass--image {
  background: linear-gradient(160deg, rgb(255 255 255 / .84), rgb(255 255 255 / .76));
  -webkit-backdrop-filter: blur(18px) saturate(1.6);
          backdrop-filter: blur(18px) saturate(1.6);
  border: 1px solid rgb(255 255 255 / .62);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / .95),         /* top highlight */
    inset 0 -1px 0 rgb(255 255 255 / .22),
    0 1px 2px rgb(var(--shade) / .10),
    0 10px 28px -8px rgb(var(--shade) / .22),
    0 28px 64px -24px rgb(var(--shade) / .28);
}
@supports not (backdrop-filter: blur(1px)) { .glass--image { background: rgb(255 255 255 / .94); } }
```
**Worst-case backdrop: pure black** under the whole panel (the darkest possible pixel of any photo). Composite
`#d6d6d6` → `#c2c2c2`. Text allowed: `--ink-700` (5.34), `--slate-900` (7.91), `--green-800` links (5.66).
`--ink-500` only at large sizes (3.02). **Not** `--green-700` for text (3.75), and **not** `--ink-600`: use
`--ink-700` for secondary text here.

### B. Light glass on white / ground — `.glass--light`
Content sheets, nav bar, location and hours cards, forms.
```css
.glass--light {
  background: linear-gradient(160deg, rgb(255 255 255 / .70), rgb(255 255 255 / .56));
  -webkit-backdrop-filter: blur(14px) saturate(1.5);
          backdrop-filter: blur(14px) saturate(1.5);
  border: 1px solid rgb(255 255 255 / .78);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / .90),
    0 0 0 1px rgb(68 102 0 / .08),                /* hairline so the pane reads on white */
    0 1px 2px rgb(var(--shade) / .06),
    0 8px 24px -10px rgb(var(--shade) / .14),
    0 24px 48px -28px rgb(68 102 0 / .22);
}
@supports not (backdrop-filter: blur(1px)) { .glass--light { background: rgb(255 255 255 / .90); } }
```
**Worst-case backdrop: `--field-lime` `#cfe1ae`** at full strength under the whole panel. Composite `#f1f6e7` →
`#eaf2db`. Text allowed: `--ink-700` (8.26), `--ink-600` (5.86), `--ink-500` (4.67), `--slate-700` (6.88),
`--green-700` (5.79).

### C1. Green-tinted glass — `.glass--leaf`
Chips, sidebar link list (replaces the source's green badges), the active nav pill, FAQ items.
```css
.glass--leaf {
  background: linear-gradient(160deg, rgb(248 250 242 / .90), rgb(238 244 226 / .86));
  -webkit-backdrop-filter: blur(16px) saturate(1.8);
          backdrop-filter: blur(16px) saturate(1.8);
  border: 1px solid rgb(148 188 74 / .45);          /* #94bc4a rim */
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / .85),
    0 1px 2px rgb(var(--shade) / .08),
    0 10px 26px -12px rgb(68 102 0 / .30);
}
@supports not (backdrop-filter: blur(1px)) { .glass--leaf { background: #f8faf2; } }
```
**Worst-case backdrop: pure black** (a chip may sit on a photo). Composite `#dfe1da` → `#cdd2c2`. Text:
`--green-900` (8.60), `--green-800` for the current nav item (6.52), `--ink-700` (6.16), `--ink-900`. **Not**
`--ink-600` (4.37): secondary text on this glass is `--ink-700`.

### C2. Deep green glass — `.glass--leaf-deep`
The appointment call-to-action band and panel, and a featured-service highlight.
```css
.glass--leaf-deep {
  background: linear-gradient(135deg, rgb(68 102 0 / .90), rgb(49 73 0 / .92));
  -webkit-backdrop-filter: blur(18px) saturate(1.4);
          backdrop-filter: blur(18px) saturate(1.4);
  border: 1px solid rgb(189 213 143 / .35);        /* green-300 rim */
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / .18),
    inset 0 -1px 0 rgb(0 0 0 / .12),
    0 1px 2px rgb(var(--shade) / .20),
    0 14px 34px -12px rgb(var(--shade) / .45);
}
@supports not (backdrop-filter: blur(1px)) { .glass--leaf-deep { background: #446600; } }
```
**Worst-case backdrop: pure white** (the lightest possible backdrop for white text). Composite `#577519` →
`#415814`. Text: white (5.30); `--green-300` accent at large sizes only (3.30). Focus: `--focus-on-dark` (3.93).

### D. Dark glass — `.glass--dark` (footer, emergency)
```css
.glass--dark {
  background: linear-gradient(160deg, rgb(20 31 0 / .86), rgb(35 34 41 / .90));
  -webkit-backdrop-filter: blur(22px) saturate(1.3);
          backdrop-filter: blur(22px) saturate(1.3);
  border: 1px solid rgb(221 234 197 / .14);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / .08),
    0 1px 0 rgb(255 255 255 / .04),
    0 24px 60px -20px rgb(0 0 0 / .55);
}
@supports not (backdrop-filter: blur(1px)) { .glass--dark { background: #141f00; } }
/* emergency variant: the rim is decoration only; the message is carried by the heading text and the icon tile */
.glass--dark.is-alert { border-left: 3px solid var(--alert); }
.glass--dark.is-alert .icon-tile { background: var(--alert); color: #fff; } /* 8.87 */
```
**Worst-case backdrop: pure white.** Composite `#353e24` → `#39383e`. Text: white (11.25), `--green-400` headings
and eyebrows (5.12), `--green-200` (8.92), `--ink-200` (7.33). Stars `--green-400` (5.12). Focus: `--focus-on-dark`
(8.35). The logo sits on a paper plate here (section 2).

### Pill on the band — top-bar buttons
```css
.band-pill { background: rgb(255 255 255 / .90); color: var(--green-800); border: 1px solid rgb(255 255 255 / .9);
  box-shadow: inset 0 1px 0 #fff, 0 6px 16px -8px rgb(var(--shade) / .45); }
.band-pill:hover, .band-pill:focus-visible { background: rgb(255 255 255 / .82); }
```
The backdrop is the solid `#759b2a` band itself, a known flat colour, so the pill needs no `backdrop-filter`
and no fallback (the table's "fallback" row is plain white). Composite at rest `#f1f5ea`, on hover `#e6edd9`;
`--green-800` text 8.39 at worst.

## 8. Focus

`outline: 3px solid var(--focus); outline-offset: 2px;`. The 2 px offset leaves a strip of the surrounding surface
between the ring and a filled button, so the ring is judged against the surface, not the button. Swap to
`--focus-on-band` inside the `#759b2a` / `#94bc4a` bands and to `--focus-on-dark` inside dark or deep-green glass.
All three pass 3:1 against every surface they sit on (WCAG 1.4.11). The default ring on the bands fails (2.06) and
is recorded under "rejected". Every hover effect needs a matching `:focus-visible` style.

## 9. Contrast (WCAG 2.x) — every proposed pair

Generated by `node tools/brand-contrast.mjs` (full data in `audit/brand-contrast.json`). It exits 1 if any
proposed pair misses its threshold, and it did during this work. It caught:
- `--green-600` as text at 4.40 on `--ground`, then 4.29 on `--stone` (fixed by darkening it to a 30/70 mix);
- `--green-700` links on image glass at 3.75 (moved to `--green-800`);
- `#759b2a` stars on light glass at 2.81, and `--green-600` stars on image glass at 2.77 (star colour now chosen by surface);
- `--ink-600` on leaf glass at 4.37 (now limited to paper and light glass).

Two gaps were found by reviewing the table, not by the script: the default focus ring on the green bands (2.06, now
its own token) and overlapping light-field pools (section 6). Positive control: its ratio function gives 21.00 for
white/black and 4.54 for `#767676`/white. Thresholds: **body 4.5**, **large 3.0** (≥ 24 px, or ≥ 18.66 px bold),
**ui 3.0** (non-text: focus rings, icons, stars, input borders). Glass rows are the fill composited over the
worst-case backdrop in section 7, at every gradient stop, plus the `@supports` fallback. The "source" rows record
the live site. "Rejected" rows are alternatives that were tried and dropped. Neither kind gates the result.

<!-- CONTRAST-TABLE:BEGIN (generated by tools/brand-contrast.mjs via tmp/brand/splice-table.mjs; do not hand-edit) -->
#### Source site as it is (record only)

| use | foreground | background(s) | worst | needs | result |
|---|---|---|---|---|---|
| top bar callout + buttons (14px, white on #759b2a) | `#ffffff` #ffffff | #759b2a #759b2a **3.24** | 3.24 | 4.5 body | FAIL |
| "Our Designer Optical" band title (34px, white on #759b2a) | `#ffffff` #ffffff | #759b2a #759b2a **3.24** | 3.24 | 3 large | PASS |
| footer links (14px, white on #94bc4a) | `#ffffff` #ffffff | #94bc4a #94bc4a **2.20** | 2.20 | 4.5 body | FAIL |
| footer headings (24px, white on #94bc4a) | `#ffffff` #ffffff | #94bc4a #94bc4a **2.20** | 2.20 | 3 large | FAIL |
| main nav links (18px bold, #759b2a on white) | `#759b2a` #759b2a | #ffffff #ffffff **3.24** | 3.24 | 4.5 body | FAIL |
| body copy (#464451 on white) | `#464451` #464451 | #ffffff #ffffff **9.52** | 9.52 | 4.5 body | PASS |
| section headings (#36565e on white, 32-40px) | `#36565e` #36565e | #ffffff #ffffff **7.93** | 7.93 | 3 large | PASS |
| location band text (#464451 on #b7b7b7) | `#464451` #464451 | #b7b7b7 #b7b7b7 **4.75** | 4.75 | 4.5 body | PASS |
| location band headings (#1d2e33 on #b7b7b7, 22px) | `#1d2e33` #1d2e33 | #b7b7b7 #b7b7b7 **7.02** | 7.02 | 4.5 body | PASS |
| reviews band text (white on #757575) | `#ffffff` #ffffff | #757575 #757575 **4.61** | 4.61 | 4.5 body | PASS |
| review stars (#94bc4a on #757575) | `#94bc4a` #94bc4a | #757575 #757575 **2.10** | 2.10 | 3 ui | FAIL |
| legal bar links (13px, #757575 on white) | `#757575` #757575 | #ffffff #ffffff **4.61** | 4.61 | 4.5 body | PASS |
| promo heading (17.5px, #60af28 on white) | `#60af28` #60af28 | #ffffff #ffffff **2.74** | 2.74 | 4.5 body | FAIL |
| emergency heading (28-30px, #941221 on white) | `#941221` #941221 | #ffffff #ffffff **8.87** | 8.87 | 3 large | PASS |

#### Proposed: text on solid surfaces

| use | foreground | background(s) | worst | needs | result |
|---|---|---|---|---|---|
| body text | `ink-700` #464451 | paper #ffffff **9.52**<br>ground #fafcf6 **9.21**<br>stone #efefef **8.28**<br>green-50 #f8faf2 **9.04** | 8.28 | 4.5 body | PASS |
| strong text, h3-h6 | `ink-900` #313039 | paper #ffffff **13.02**<br>ground #fafcf6 **12.60**<br>green-50 #f8faf2 **12.37** | 12.37 | 4.5 body | PASS |
| secondary text | `ink-600` #5c5a66 | paper #ffffff **6.75**<br>ground #fafcf6 **6.53**<br>stone #efefef **5.87**<br>green-50 #f8faf2 **6.42** | 5.87 | 4.5 body | PASS |
| muted text: dates, captions, legal bar | `ink-500` #6b6974 | paper #ffffff **5.39**<br>ground #fafcf6 **5.21**<br>stone #efefef **4.69**<br>green-50 #f8faf2 **5.12** | 4.69 | 4.5 body | PASS |
| section headings (slate) | `slate-700` #36565e | paper #ffffff **7.93**<br>ground #fafcf6 **7.67**<br>green-50 #f8faf2 **7.53** | 7.53 | 4.5 body | PASS |
| display headings, hero (deep slate) | `slate-900` #1d2e33 | paper #ffffff **14.09**<br>ground #fafcf6 **13.63**<br>green-50 #f8faf2 **13.38** | 13.38 | 4.5 body | PASS |
| links, eyebrows, nav text (deep green) | `green-700` #446600 | paper #ffffff **6.67**<br>ground #fafcf6 **6.46**<br>stone #efefef **5.80**<br>green-50 #f8faf2 **6.34**<br>green-100 #eef4e2 **5.94** | 5.80 | 4.5 body | PASS |
| link hover / current nav item | `green-800` #314900 | paper #ffffff **10.08**<br>ground #fafcf6 **9.75**<br>green-50 #f8faf2 **9.57**<br>green-100 #eef4e2 **8.96** | 8.96 | 4.5 body | PASS |
| emergency heading and required-field marks | `alert` #941221 | paper #ffffff **8.87**<br>ground #fafcf6 **8.58**<br>alert-50 #f8eeef **7.80** | 7.80 | 4.5 body | PASS |
| white on primary button (rest; gradient green-600 -> green-700, every stop) | `#ffffff` #ffffff | green-600 #53760d **5.30**<br>green-700 #446600 **6.67** | 5.30 | 4.5 body | PASS |
| top-bar pill buttons: green-800 on white glass pill over the #759b2a band | `green-800` #314900 | pill-on-band[stop 1] #f1f5ea **9.11**<br>pill-on-band[stop 2] #e6edd9 **8.39**<br>fallback:pill-on-band #ffffff **10.08** | 8.39 | 4.5 body | PASS |
| top-bar callout: deep green text directly on the #759b2a band | `green-950` #141f00 | green-500 #759b2a **5.29** | 5.29 | 4.5 body | PASS |
| white on primary button (hover) | `#ffffff` #ffffff | green-800 #314900 **10.08** | 10.08 | 4.5 body | PASS |
| white on the brand band #759b2a: LARGE text only (>=24px or >=18.66px bold) | `#ffffff` #ffffff | green-500 #759b2a **3.24** | 3.24 | 3 large | PASS |
| deep green text on the brand band #759b2a | `green-950` #141f00 | green-500 #759b2a **5.29** | 5.29 | 4.5 body | PASS |
| ink on the lime band #94bc4a | `green-950` #141f00 | green-400 #94bc4a **7.79** | 7.79 | 4.5 body | PASS |
| white on the emergency icon tile / alert button | `#ffffff` #ffffff | alert #941221 **8.87** | 8.87 | 4.5 body | PASS |
| green-600 accent text (tags, secondary links) | `green-600` #53760d | paper #ffffff **5.30**<br>ground #fafcf6 **5.12**<br>green-50 #f8faf2 **5.03**<br>stone #efefef **4.61** | 4.61 | 4.5 body | PASS |

#### Proposed: text on glass (worst-case backdrop)

| use | foreground | background(s) | worst | needs | result |
|---|---|---|---|---|---|
| A glass-image: body text | `ink-700` #464451 | glass-image[stop 1] #d6d6d6 **6.55**<br>glass-image[stop 2] #c2c2c2 **5.34**<br>fallback:glass-image #f0f0f0 **8.35** | 5.34 | 4.5 body | PASS |
| A glass-image: headings (deep slate) | `slate-900` #1d2e33 | glass-image[stop 1] #d6d6d6 **9.69**<br>glass-image[stop 2] #c2c2c2 **7.91**<br>fallback:glass-image #f0f0f0 **12.36** | 7.91 | 4.5 body | PASS |
| A glass-image: links / eyebrow (green-800) | `green-800` #314900 | glass-image[stop 1] #d6d6d6 **6.93**<br>glass-image[stop 2] #c2c2c2 **5.66**<br>fallback:glass-image #f0f0f0 **8.84** | 5.66 | 4.5 body | PASS |
| A glass-image: muted text (large only) | `ink-500` #6b6974 | glass-image[stop 1] #d6d6d6 **3.71**<br>glass-image[stop 2] #c2c2c2 **3.02** | 3.02 | 3 large | PASS |
| B glass-light: body text | `ink-700` #464451 | glass-light[stop 1] #f1f6e7 **8.65**<br>glass-light[stop 2] #eaf2db **8.26**<br>fallback:glass-light #fafcf7 **9.22** | 8.26 | 4.5 body | PASS |
| B glass-light: muted text | `ink-500` #6b6974 | glass-light[stop 1] #f1f6e7 **4.89**<br>glass-light[stop 2] #eaf2db **4.67**<br>fallback:glass-light #fafcf7 **5.22** | 4.67 | 4.5 body | PASS |
| B glass-light: section headings (slate) | `slate-700` #36565e | glass-light[stop 1] #f1f6e7 **7.20**<br>glass-light[stop 2] #eaf2db **6.88**<br>fallback:glass-light #fafcf7 **7.67** | 6.88 | 4.5 body | PASS |
| B glass-light: links (deep green) | `green-700` #446600 | glass-light[stop 1] #f1f6e7 **6.06**<br>glass-light[stop 2] #eaf2db **5.79**<br>fallback:glass-light #fafcf7 **6.46** | 5.79 | 4.5 body | PASS |
| C1 glass-leaf: chip / sidebar link text | `green-900` #233500 | glass-leaf[stop 1] #dfe1da **10.07**<br>glass-leaf[stop 2] #cdd2c2 **8.60**<br>fallback:glass-leaf #f8faf2 **12.62** | 8.60 | 4.5 body | PASS |
| C1 glass-leaf: body text | `ink-700` #464451 | glass-leaf[stop 1] #dfe1da **7.22**<br>glass-leaf[stop 2] #cdd2c2 **6.16**<br>fallback:glass-leaf #f8faf2 **9.04** | 6.16 | 4.5 body | PASS |
| C1 glass-leaf: current nav item / active pill (green-800) | `green-800` #314900 | glass-leaf[stop 1] #dfe1da **7.64**<br>glass-leaf[stop 2] #cdd2c2 **6.52**<br>fallback:glass-leaf #f8faf2 **9.57** | 6.52 | 4.5 body | PASS |
| A/B/C1: strong text and h3-h6 (ink-900) on every light glass | `ink-900` #313039 | glass-image[stop 1] #d6d6d6 **8.96**<br>glass-image[stop 2] #c2c2c2 **7.31**<br>glass-light[stop 1] #f1f6e7 **11.83**<br>glass-light[stop 2] #eaf2db **11.30**<br>glass-leaf[stop 1] #dfe1da **9.87**<br>glass-leaf[stop 2] #cdd2c2 **8.43** | 7.31 | 4.5 body | PASS |
| B glass-light: secondary text (ink-600) | `ink-600` #5c5a66 | glass-light[stop 1] #f1f6e7 **6.14**<br>glass-light[stop 2] #eaf2db **5.86**<br>fallback:glass-light #fafcf7 **6.54** | 5.86 | 4.5 body | PASS |
| C2 glass-leaf-deep: white text (CTA band, appointment panel) | `#ffffff` #ffffff | glass-leaf-deep[stop 1] #577519 **5.30**<br>glass-leaf-deep[stop 2] #415814 **7.98**<br>fallback:glass-leaf-deep #446600 **6.67** | 5.30 | 4.5 body | PASS |
| C2 glass-leaf-deep: lime accent text | `green-300` #bdd58f | glass-leaf-deep[stop 1] #577519 **3.30**<br>glass-leaf-deep[stop 2] #415814 **4.97**<br>fallback:glass-leaf-deep #446600 **4.16** | 3.30 | 3 large | PASS |
| D glass-dark: white text (footer, emergency) | `#ffffff` #ffffff | glass-dark[stop 1] #353e24 **11.25**<br>glass-dark[stop 2] #39383e **11.61**<br>fallback:glass-dark #141f00 **17.13** | 11.25 | 4.5 body | PASS |
| D glass-dark: footer headings / eyebrows in lime #94bc4a | `green-400` #94bc4a | glass-dark[stop 1] #353e24 **5.12**<br>glass-dark[stop 2] #39383e **5.28**<br>fallback:glass-dark #141f00 **7.79** | 5.12 | 4.5 body | PASS |
| D glass-dark: secondary text (green-200) | `green-200` #ddeac5 | glass-dark[stop 1] #353e24 **8.92**<br>glass-dark[stop 2] #39383e **9.20**<br>fallback:glass-dark #141f00 **13.58** | 8.92 | 4.5 body | PASS |
| D glass-dark: muted text (ink-200) | `ink-200` #d1d0d4 | glass-dark[stop 1] #353e24 **7.33**<br>glass-dark[stop 2] #39383e **7.56**<br>fallback:glass-dark #141f00 **11.16** | 7.33 | 4.5 body | PASS |

#### Proposed: non-text (focus, icons, stars, borders)

| use | foreground | background(s) | worst | needs | result |
|---|---|---|---|---|---|
| focus ring on light surfaces | `focus` #446600 | paper #ffffff **6.67**<br>ground #fafcf6 **6.46**<br>green-50 #f8faf2 **6.34**<br>glass-image[stop 1] #d6d6d6 **4.59**<br>glass-image[stop 2] #c2c2c2 **3.75**<br>glass-light[stop 1] #f1f6e7 **6.06**<br>glass-light[stop 2] #eaf2db **5.79**<br>glass-leaf[stop 1] #dfe1da **5.06**<br>glass-leaf[stop 2] #cdd2c2 **4.32** | 3.75 | 3 ui | PASS |
| focus ring vs the primary button it surrounds (2px offset keeps a light gap) | `focus` #446600 | paper #ffffff **6.67** | 6.67 | 3 ui | PASS |
| focus ring on the solid #759b2a and #94bc4a bands | `focus-on-band` #141f00 | green-500 #759b2a **5.29**<br>green-400 #94bc4a **7.79** | 5.29 | 3 ui | PASS |
| focus ring on dark / deep-green glass | `focus-on-dark` #d4e4b7 | glass-dark[stop 1] #353e24 **8.35**<br>glass-dark[stop 2] #39383e **8.61**<br>fallback:glass-dark #141f00 **12.71**<br>glass-leaf-deep[stop 1] #577519 **3.93**<br>glass-leaf-deep[stop 2] #415814 **5.92**<br>fallback:glass-leaf-deep #446600 **4.95** | 3.93 | 3 ui | PASS |
| review stars / icons on light surfaces, light glass, leaf glass (green-600) | `green-600` #53760d | paper #ffffff **5.30**<br>ground #fafcf6 **5.12**<br>stone #efefef **4.61**<br>glass-light[stop 1] #f1f6e7 **4.81**<br>glass-light[stop 2] #eaf2db **4.60**<br>glass-leaf[stop 1] #dfe1da **4.02**<br>glass-leaf[stop 2] #cdd2c2 **3.43** | 3.43 | 3 ui | PASS |
| review stars / icons on image glass (green-700) | `green-700` #446600 | glass-image[stop 1] #d6d6d6 **4.59**<br>glass-image[stop 2] #c2c2c2 **3.75**<br>fallback:glass-image #f0f0f0 **5.86** | 3.75 | 3 ui | PASS |
| decorative #759b2a rules, arcs, rims: paper and ground only | `green-500` #759b2a | paper #ffffff **3.24**<br>ground #fafcf6 **3.14** | 3.14 | 3 ui | PASS |
| white glyph on a #759b2a icon tile (icon = non-text) | `#ffffff` #ffffff | green-500 #759b2a **3.24** | 3.24 | 3 ui | PASS |
| review stars in #94bc4a on dark glass | `green-400` #94bc4a | glass-dark[stop 1] #353e24 **5.12**<br>glass-dark[stop 2] #39383e **5.28** | 5.12 | 3 ui | PASS |
| input border (ink-500) on paper | `ink-500` #6b6974 | paper #ffffff **5.39**<br>glass-light[stop 1] #f1f6e7 **4.89**<br>glass-light[stop 2] #eaf2db **4.67** | 4.67 | 3 ui | PASS |

#### Rejected alternatives (record only)

| use | foreground | background(s) | worst | needs | result |
|---|---|---|---|---|---|
| A glass-image: links in green-700 (rejected; use green-800) | `green-700` #446600 | glass-image[stop 1] #d6d6d6 **4.59**<br>glass-image[stop 2] #c2c2c2 **3.75** | 3.75 | 4.5 body | FAIL |
| ink-600 secondary text on leaf and image glass (rejected; use ink-700 there) | `ink-600` #5c5a66 | glass-leaf[stop 1] #dfe1da **5.12**<br>glass-leaf[stop 2] #cdd2c2 **4.37**<br>glass-image[stop 1] #d6d6d6 **4.65**<br>glass-image[stop 2] #c2c2c2 **3.79** | 3.79 | 4.5 body | FAIL |
| default focus ring #446600 on the #759b2a / #94bc4a bands (rejected; use focus-on-band) | `focus` #446600 | green-500 #759b2a **2.06**<br>green-400 #94bc4a **3.04** | 2.06 | 3 ui | FAIL |
| stars / icons in #759b2a on light glass (rejected; use green-600) | `green-500` #759b2a | paper #ffffff **3.24**<br>ground #fafcf6 **3.14**<br>glass-light[stop 1] #f1f6e7 **2.94**<br>glass-light[stop 2] #eaf2db **2.81** | 2.81 | 3 ui | FAIL |

proposed pairs: 47, failing: 0
source pairs: 14, failing: 6
<!-- CONTRAST-TABLE:END -->


## 10. Typography

| role | family | licence | weights / axes | use |
|---|---|---|---|---|
| display | **Fraunces** (Undercase Type: Phaedra Charles, Flavia Zimbardi) | SIL OFL 1.1 (`license: "OFL"` in google/fonts `ofl/fraunces/METADATA.pb`, checked 2026-09-28) | variable `opsz` 9–144, `wght` 500–700, `SOFT` pinned 100, `WONK` pinned 0; italic 500 | hero statement, h1, h2, review pull quotes; one italic accent phrase per hero at most |
| body | **Nunito Sans** (Vernon Adams, Jacques Le Bailly, Manvel Shmavonyan, Alexei Vanyashin) | SIL OFL 1.1 (`license: "OFL"` in `ofl/nunitosans/METADATA.pb`, checked 2026-09-28) | variable `opsz` 6–12, `wght` 400–800; italic 400 | body 400, strong 700, nav and buttons 700, eyebrows 800 uppercase at `0.12em`, h3–h6 700 |

Why this pair: the logo's wordmark "CLIFTON" is set in classical flared serif capitals. Fraunces is a serif that
echoes it, and at `SOFT 100` its terminals round off, so headings read warm and friendly rather than luxury.
Pinning `WONK 0` keeps the letterforms upright and calm. Nunito Sans has open, humanist-leaning shapes that stay
friendly and very legible at 16–18 px. It replaces Arial without looking corporate.

**Download URL** (the build downloads this and self-hosts the woff2; nothing was downloaded in this stage):

```
https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,500..700,100,0;1,9..144,500,100,0&family=Nunito+Sans:ital,opsz,wght@0,6..12,400..800;1,6..12,400&display=swap
```

Checked 2026-09-28 (CSS only, no font files): with a current Chrome User-Agent, HTTP 200 and 16 `@font-face`
blocks, all woff2. With a non-browser User-Agent (`curl/8.0`), the same URL returns 10 blocks, **all truetype,
no woff2**, so the build **must** send a browser User-Agent. **Keep only the `latin` and `latin-ext` subsets → 8
woff2 files** (Fraunces roman and italic, Nunito Sans roman and italic, two subsets each). Copy each block's
`unicode-range` verbatim, keep `font-display: swap`, rewrite `src` to the local path, and ship the OFL text next to
the fonts.

Fallback stacks: `--font-display: "Fraunces", Georgia, "Times New Roman", serif;`
`--font-body: "Nunito Sans", "Segoe UI", Arial, Helvetica, sans-serif;` (Arial stays as the last resort, as on
the source). Set `font-optical-sizing: auto` so `opsz` follows the size.

### Fluid type scale (390 → 1440 px, linear between; root 16 px)

```css
:root {
  --fs-xs:      clamp(0.8125rem, 0.7893rem + 0.0952vw, 0.875rem);  /* 13 → 14   legal bar, footnotes, eyebrows */
  --fs-sm:      clamp(0.9063rem, 0.883rem + 0.0952vw, 0.9688rem);  /* 14.5 → 15.5  meta, dates, captions, form help */
  --fs-base:    clamp(1rem, 0.9536rem + 0.1905vw, 1.125rem);        /* 16 → 18   body */
  --fs-lead:    clamp(1.125rem, 1.0554rem + 0.2857vw, 1.3125rem);   /* 18 → 21   lead paragraph, FAQ triggers */
  --fs-h4:      clamp(1.1875rem, 1.1179rem + 0.2857vw, 1.375rem);   /* 19 → 22   h4, card titles */
  --fs-h3:      clamp(1.3125rem, 1.1732rem + 0.5714vw, 1.6875rem);  /* 21 → 27   h3 */
  --fs-h2:      clamp(1.625rem, 1.3rem + 1.3333vw, 2.5rem);         /* 26 → 40   h2, section titles */
  --fs-h1:      clamp(2rem, 1.4893rem + 2.0952vw, 3.375rem);        /* 32 → 54   interior page title */
  --fs-display: clamp(2.375rem, 1.4929rem + 3.619vw, 4.75rem);      /* 38 → 76   home hero statement */

  --lh-body: 1.65;  --lh-lead: 1.55;  --lh-h4: 1.3;  --lh-h3: 1.25;  --lh-h2: 1.15;  --lh-h1: 1.08;  --lh-display: 1.02;
  --ls-display: -0.02em;  --ls-h1: -0.015em;  --ls-h2: -0.01em;  --ls-eyebrow: 0.12em;
}
```

Values at 768 / 1024 px: base 16.72 / 17.21, h2 31.04 / 34.45, h1 39.92 / 45.28, display 51.68 / 60.94. For
comparison, the source homepage measured 14 px body, 40 px h1 and 42 px hero at all four captured widths (390,
768, 1024, 1440), and 24 → 36 px section titles (390/768 → 1024/1440). **Large-text consequence:** only
`--fs-h2` and above are "large" at every width (h2 is 26 px at 390). h3 and h4 are body-size text for contrast
purposes, so white on `#759b2a` is allowed for h2, h1 and display only.

## 11. Open items and what is unverified

- **Logo resolution:** 317 × 221 JPEG is the only version on disk. Ask the practice for the original (SVG or
  large transparent PNG). Until then, render at ≤ 158 CSS px. (Open decision for the practice.)
- **Favicon:** the source has none. Whether to derive one from the logo is the practice's decision.
- **Multiply blending inside glass:** not yet tested in a browser (section 2).
- **Measured ratios on the built page:** the table models glass as fill over a stated worst case. The built page
  still needs a pixel-level check over its real, busiest backdrops, as the brief requires.
- **Tokens are not yet in `src/styles/`.** This document is the proposal the build will implement.
