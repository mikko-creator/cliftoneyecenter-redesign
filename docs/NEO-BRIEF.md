# Neoclassical design brief: Clifton Eye Center ("neo" exploration)

Status: **design brief**, 2026-09-29. This is the design language that the three neoclassical lab designers and then the
neo build follow. It is a **second design built alongside the shipped glass one ("Daylight Canopy")** and does not
replace it. `src/build.mjs` already switches themes: `CEC_THEME=neo` builds from `src/themes/neo/` (templates, home,
styles, scripts) and `assets/fonts/neo/` into `dist-neo/`. It uses the same content, SEO, forms and image pipeline. The
glass files (`src/styles/`, `src/scripts/`, `src/lib/`, `dist/`) are not touched by neo work.

What the operator asked for (2026-09-29): explore a **Neoclassical** style instead of more glassmorphism, and
**keep the brand colours and the layering of images**. That means depth: images crossing sections and breaking out
of frames, and cut-outs overlapping other elements. The brand tone and depth of the glass build must survive.

Binding documents that still apply: `docs/DESIGN-BRIEF.md` (bylaws), `docs/BRAND-SYSTEM.md` (logo, source palette,
tone), `docs/SITE-ARCHITECTURE.md` (349 pages, menus), `docs/IMAGE-PLAN.md` (image classes),
`docs/BUILD-DECISIONS.md`, and the ledger rows L01-L23 in `docs/DESIGN-SPEC.md` 7.4 (behaviour changes carry over
unchanged). `docs/COMPONENTS.md` is the glass markup contract. The neo templates keep its landmarks, slots,
`data-*` hooks and ledgered behaviour. Only the look and the ornament markup change.

"MUST" and "never" are binding. "May" is a lab choice.

---

## 1. What "neoclassical" means here

### 1.1 Traits observed on the moodboard (describe, never copy)

`tmp/neo/reference-moodboard.png` is a **third-party** style reference: four posters by other designers. We take
**traits only**:

| trait observed | how it shows on the moodboard (described) |
|---|---|
| Classical sculpture rendered **monochrome** | grey-white marble figures and busts, soft studio light, no colour except the ground |
| **Cut-out figures overlapping huge display type** | the title sits behind the figure; the figure's head or shoulder breaks the letters, so the type reads as a plane *behind* the sculpture |
| **Tall, condensed, high-contrast serif display type** | titles set in capitals across the full poster width, hairline serifs, very tight line spacing |
| **Script accent over a serif title** | a flowing script word laid over the lower part of a serif title, in a contrasting colour |
| **Arched frames** | an engraved scene inside a round-headed arch drawn with a fine rule |
| **Deep flat grounds with fine grain** | near-black, deep red or pale blush fields with a subtle film grain, no gradients |
| **Fine-line frames and rules** | hairline borders inset from the edge, thin rules separating blocks, small ruled information cells |
| **Small editorial meta text** | tiny tracked capitals and short paragraphs in corners and margins, often in two symmetric columns |
| **Circular badges and sparkles** | small ringed circles and four-point stars at corners or flanking the figure |
| **Symmetry** | a central axis: figure centred, title centred, meta blocks mirrored left and right |

**Never taken from the moodboard:** its posters as layouts, its artworks, its statues or any recognisable famous
sculpture, its words, its type lockups, its barcodes, series numbers or invented labels, its blackletter/ornamental
display face, and its red and blush grounds. The brand colours replace them. Everything we make is original:
our figures are generic, original classical-style carvings (`src/content/image-plan-neo.json`), and our words are the
practice's own copy.

### 1.2 Classical principles, translated to a local community eye clinic

| principle | how it appears on this site | limit |
|---|---|---|
| **Symmetry** | Home hero, section titles, title bands, footer frieze and badges are built on a centre axis. Paired ornaments (laurel sprigs, pilasters, sparkles) are mirrored | Long-form text is **never** centred: prose, forms, tables and lists stay left-aligned on a readable measure |
| **Proportion** | Arches are 2:3 or 3:4 (width:height) with a true semicircular head. Wall-and-plinth rhythm: a frame is thicker at the base than at the sides, as a plinth. Spacing uses the glass `--s-*` scale | No golden-ratio theatre: proportions serve reading width and image native size |
| **Orders: columns and pilasters** | Thin fluted **pilasters** (section 4.4) flank a centred title band or the footer frieze; one generated column fragment may stand at a section edge (image plan `neo-cut-column`) | Never a colonnade of repeated SVG columns, never behind text |
| **Arches** | The signature frame: hero photo, service images and the Visit photo sit in round-headed arches with a fine outer rule and keystone (4.3). Arches lift on hover and focus | Arch masks never crop brand campaign images, logos, diagrams or the QR code |
| **Pediments** | A shallow gable (about 12 degrees) drawn as a single fine line above a centred section title on the home page, or as the top edge of the footer frieze | Home and footer only; one per section at most |
| **Meander (Greek key)** | One continuous key border (4.1) as a frieze: the footer's top edge, optionally the hero's bottom edge | At most 2 meander runs per page |
| **Egg-and-dart** | Only inside imagery (the carved capital of `neo-cut-column`). Not drawn in SVG | Too busy at web sizes as a drawn band |
| **Laurel** | Small open sprigs (4.2) beside a medallion or under a hero title; the bronze wreath cut-out (`neo-cut-laurel`) as a badge frame | At most 2 per page; never around a person's name or portrait (reads as a memorial) |
| **Rosettes and medallions** | Rosette (4.5) as the centre of a rule divider and as the accordion marker; circular badge (4.8) holding real HTML copy | Sparse: see the budget in 4.9 |
| **Roman numerals** | Ornamental numbering only: `list-style-type: upper-roman` on an existing `<ol>` whose items carry no number in their text, or `aria-hidden` section numerals on the home page | Never years, dates, "Est.", counts, rankings or any claim. Never replace a number that is part of the copy |
| **Engraved capitals** | Tracked uppercase meta lines in the text face (3.5), like lettering cut in stone: eyebrows, section numerals, captions of ornaments | The DOM keeps the source casing; capitals come from CSS `text-transform` only |
| **Marble and stone surfaces** | Warm marble grounds (`--marble-*`), an optional low-opacity marble texture on the full-bleed grounds, and statues in monochrome marble | Texture and grain caps in 2.5; never behind small text beyond those caps |

### 1.3 Tone: stately but warm, never cold or funereal

The practice speaks as a neighbour: "Your Community Eye Care Clinic", "We Know You!", "#HappyPatients", "#HeretoHelp".
Neoclassical gives it **dignity and craft**, not distance. Concrete rules:

1. **Daylight dominates.** Interior pages are mostly warm marble grounds. The deep poster ground is for the home hero,
   one or two feature bands, and the footer. Never whole interior pages in dark.
2. **Warm, never grey.** The marble is mixed from `--stone` and the warm `--sunlight` (`--marble-50 #f7f5ec`), not cold
   white or blue-grey. The dark ground is a **green**-black derived from the brand (`--poster #1b2012`), never pure black.
3. **People stay in colour; stone is monochrome.** Real photographs of people (the hero woman, service photos,
   testimonial faces, the stock header people) keep their natural colour in classical frames. Only statues, stone and
   atmospheric backdrops go monochrome or duotone (section 5). A page must never read as a gallery of grey heads.
4. **The script is the smile.** "We Know You!" in the script accent, in green, is the warm counterweight to the capitals.
5. **Green leads.** Every screen shows brand green: the `#759b2a` top strip, green eyebrows, green rules and ornaments,
   and the green-black ground itself.
6. **No mourning iconography.** No urns, cypress, draped figures in grief, skulls, torches, or a snapped-top ("broken")
   column, which is a 19th-century mourning symbol. A column fragment cut by the frame or a section edge is fine; a
   visibly snapped top is not. `assets/generated/neo-cut-column.png` (the 08:29 version) was viewed over the poster
   ground. It is a complete Ionic column with an intact capital and a base on a rough-hewn plinth, so it passes this
   rule. A regenerated version is checked again. A laurel wreath never frames
   Dr. Deana Clifton's portrait or name, and her photo is never set on the dark poster ground inside a medallion.
7. **Not luxury chrome.** No black-and-gold, no gold at all (it is not a brand colour), no hairline-thin type at small
   sizes. The display face is set at weight 500 so its hairlines survive, and it is never used below 28px (3.5).

---

## 2. Palette

Evidence: `node tools/neo-contrast.mjs` (pure Node, same arithmetic as `tools/brand-contrast.mjs`) writes
`tmp/neo/brief/neo-contrast.json` and `neo-contrast.md`. It **exits 1 if any proposed pair misses its threshold**.
It did while this palette was being set: 5 pairs failed on the first run (2.6). `--control` appends a pair that must fail, and it exits 1
(`#759b2a` on marble-50, 2.97). Positive controls: white/black **21.00**, `#767676`/white **4.54**. Final run:
**42 proposed pairs, 0 failing.** Thresholds: body **4.5**; large **3.0** (24px or more, or 18.66px bold or more);
UI **3.0** (focus rings, icons that carry meaning, the only boundary of a control). The **script accent is held to
4.5** at any size, because its strokes are thin.

### 2.1 Core: the brand tokens, unchanged

Verbatim from `src/styles/tokens.css` (redesign layer). **Green stays the lead brand colour.**

`--green-50 #f8faf2`, `--green-100 #eef4e2`, `--green-200 #ddeac5`, `--green-300 #bdd58f`, **`--green-400 #94bc4a`**
(footer green, logo "e"), **`--green-500 #759b2a`** (top-bar green), `--green-600 #53760d`, `--green-700 #446600`
(source nav divider), `--green-800 #314900`, `--green-900 #233500`, `--green-950 #141f00`; `--ink-950 #232229`,
`--ink-900 #313039`, **`--ink-700 #464451`** (source body text), `--ink-600 #5c5a66`, `--ink-500 #6b6974`,
`--ink-300 #acabb1`, `--ink-200 #d1d0d4`, `--ink-100 #e9e9ea`, `--ink-50 #f6f6f6`; `--slate-700 #36565e`,
`--slate-900 #1d2e33`; `--paper #ffffff`, `--ground #fafcf6`, `--stone #efefef`; `--alert #941221`,
`--alert-50 #f8eeef`; `--focus #446600`, `--focus-on-band #141f00`, `--focus-on-dark #d4e4b7`; `--sunlight #fffbe9`.

### 2.2 Neo additions (all sRGB mixes of brand tokens)

| token | value | formula | role |
|---|---|---|---|
| `--marble-50` | `#f7f5ec` | `color-mix(in srgb, var(--stone) 50%, var(--sunlight))` | main light ground (warm marble) |
| `--marble-100` | `#eeece4` | `color-mix(in srgb, var(--ink-700) 5%, var(--marble-50))` | panels, cards, the form sheet on marble-50 |
| `--marble-200` | `#e2e0d9` | `color-mix(in srgb, var(--ink-700) 12%, var(--marble-50))` | sub-panels, table stripes, pressed states |
| `--marble-300` | `#c9c7c4` | `color-mix(in srgb, var(--ink-700) 26%, var(--marble-50))` | veins and decorative rules on light (**never text, never a control boundary**) |
| `--marble-400` | `#a2a0a2` | `color-mix(in srgb, var(--ink-700) 48%, var(--marble-50))` | "engraved" relief ornaments on light (decorative only) |
| `--poster` | `#1b2012` | `color-mix(in srgb, var(--green-950) 55%, var(--ink-950))` | the deep green-black **poster ground** |
| `--poster-deep` | `#11140b` | `color-mix(in srgb, var(--poster) 62%, #000)` | deepest band (footer base, duotone shadows) |
| `--poster-2` | `#1e280b` | `color-mix(in srgb, var(--green-900) 40%, var(--poster))` | raised panel on the poster ground |

The marble ramp is mixed with the source body ink, so marble veins read faintly grey-violet like the brand ink, not
blue. The image-review ground in `src/content/image-plan-neo.json` (`#10150c`) is within OKLab ΔE **0.004** of
`--poster-deep`, which is visually identical. Cut-outs reviewed there are reviewed on our ground.

### 2.3 Roles

| role | tokens | rule |
|---|---|---|
| **Light grounds** | `--marble-50` (page), `--marble-100` / `--marble-200` (panels), `--paper` (inputs, logo plates, brand-logo plates), `--ground` / `--green-50` / `--green-100` (green-tinted wash) | Most interior surface area |
| **Dark grounds** | `--poster` (hero, feature bands, footer), `--poster-deep` (footer base), `--poster-2` (panels on poster), `--slate-900` (an alternate cool dark band) | Home hero, at most 2 feature bands per page, footer |
| **Brand bands** | `--green-500 #759b2a` (top strip, one brand band per page), `--green-400 #94bc4a` (thin lime strip), `--green-800` / `--green-700` (deep "laurel" CTA band) | Text colours per 2.4 only |
| **Text on light** | `ink-700` body; `ink-900` strong, h4-h6; `ink-600` secondary **and the muted floor**; `poster` or `slate-900` display; `slate-700` section headings; `green-700` links, eyebrows, meta caps, script; `green-800` hover and current; `alert` emergency | `ink-500` is **not** a text colour in neo (2.6) |
| **Text on dark** | `marble-50` or `paper` body and display; `green-200` secondary; `ink-200` muted; `green-300` links and meta caps; `green-400` eyebrows, numerals, script | `#759b2a` as text on dark: **large only** |
| **Accents** | `green-600` large numerals on light; `green-400` / `green-500` on dark; `alert` only for emergencies | One accent family per section |
| **Rules** | Decorative: `marble-300` / `marble-400` or `green-600` on light, `green-300` or `green-500` on dark. A rule that is the **only** boundary of a control: `ink-500` (light), `green-300` (dark) | Decorative rules are exempt from 1.4.11; control boundaries are not |
| **Ornaments** | `green-600` (light), `green-400` / `green-500` / `green-300` (dark), `marble-400` for low-relief "carved" ornaments on light | An ornament that carries meaning (a star rating, an open/closed marker) uses the UI rows in 2.4 |
| **Focus** | `--focus` (`green-700`) on every light surface; `--focus-on-dark` on poster, slate, green-800 and green-700; `--focus-on-band` (`green-950`) on the `#759b2a` and `#94bc4a` bands | `outline: 3px solid; outline-offset: 2px` |

### 2.4 Allowed text on each surface (only compliant pairs; worst case over every listed surface)

"Light" = paper, ground, marble-50, marble-100, marble-200, stone, green-50, green-100, and the textured ground
marble-50 + texture + grain. "Dark" = poster, poster-deep, poster-2 and poster + texture + grain (2.5).

| use | colour | worst ratio (on) | needs |
|---|---|---|---|
| body text on light | `ink-700` #464451 | **7.07** (marble-50+texture+grain) | 4.5 |
| strong text, h4-h6, table heads on light | `ink-900` #313039 | **9.67** (textured) | 4.5 |
| secondary and muted text on light (the floor) | `ink-600` #5c5a66 | **5.02** (textured) | 4.5 |
| display titles h1-h3 on light | `poster` #1b2012 | **12.36** (textured) | 4.5 |
| display titles, alternate | `slate-900` #1d2e33 | **10.46** (textured) | 4.5 |
| section headings | `slate-700` #36565e | **5.89** (textured) | 4.5 |
| links, eyebrows, engraved meta caps, **script accent** on light | `green-700` #446600 | **4.96** (textured) | 4.5 |
| link hover, current nav item | `green-800` #314900 | **7.49** (textured) | 4.5 |
| large numerals and figures on light (24px or more) | `green-600` #53760d | **3.93** (textured) | 3.0 |
| emergency heading, required marks | `alert` #941221 | **6.59** (textured) | 4.5 |
| body and display on dark | `marble-50` #f7f5ec | **9.87** (poster+texture+grain) | 4.5 |
| body on dark (paper) | `paper` #ffffff | **10.78** | 4.5 |
| secondary on dark | `green-200` #ddeac5 | **8.55** | 4.5 |
| muted on dark | `ink-200` #d1d0d4 | **7.02** | 4.5 |
| links, meta caps on dark | `green-300` #bdd58f | **6.71** | 4.5 |
| eyebrows, numerals, **script accent** on dark | `green-400` #94bc4a | **4.90** | 4.5 |
| lead green `#759b2a` on dark: **large only** (poster words, numerals 24px or more) | `green-500` | **3.33** | 3.0 |
| slate band: body and titles / lime accents | `paper` / `green-300` on `slate-900` | **14.09** / **8.77** | 4.5 |
| deep laurel band `green-800`: text / lime accent | `paper` / `green-300` | **10.08** / **6.28** | 4.5 |
| `green-700` band, primary button | `paper` | **6.67** | 4.5 |
| brand band `#759b2a`, any size | `green-950` / `poster` | **5.29** / **5.13** | 4.5 |
| brand band `#759b2a`, **large only** | `paper` | **3.24** | 3.0 |
| lime band `#94bc4a`, any size | `green-950` / `poster` | **7.79** / **7.57** | 4.5 |
| emergency tile | `paper` on `alert` | **8.87** | 4.5 |
| text directly on a **duo-night** photo (5.2) | `paper` / `marble-50` on its lightest pixel `#53760d` | **5.30** / **4.85** | 4.5 |
| UI: focus ring on light | `green-700` | **4.96** | 3.0 |
| UI: focus ring on dark, slate, green-800, green-700 | `focus-on-dark` #d4e4b7 | **4.95** (on green-700) | 3.0 |
| UI: focus ring on the brand bands | `green-950` | **5.29** | 3.0 |
| UI: meaningful icons, stars, markers on light / dark | `green-600` / `green-400` | **3.93** / **4.90** | 3.0 |
| UI: only boundary of a control on light / dark | `ink-500` / `green-300` | **4.00** / **6.71** | 3.0 |
| UI: lead-green ornaments on dark / on paper and ground only | `green-500` | **3.33** / **3.14** | 3.0 |

The complete matrix (every text token on every surface, compliant pairs only, split into body and large-only) is in
`tmp/neo/brief/neo-contrast.md`. The role table above is the rule; the matrix is the record.

### 2.5 Layers between text and ground: grain, texture, photos

- **Grain lives on the ground plane only** (N0, section 6.1): over the texture, under every opaque panel. Light
  ground grain is `--ink-950` specks at **6% or less**; dark ground grain is white specks at **5% or less**. Modelled as a
  flat layer at the cap, the worst cases are in the table above. Grain on panels is rejected (2.6).
- **Marble texture** (`neo-tex-marble-light` / `-dark`) only on the full-bleed grounds `marble-50` and `poster` /
  `poster-deep`. Light texture opacity **25% or less**, and its darkest 2nd-percentile luminance must be at least
  `--marble-300`'s (L 0.5725). Dark texture opacity **15% or less**, and its brightest 98th-percentile luminance must be
  at most `--ink-300`'s (L 0.4107). A texture that breaks its percentile is re-graded or used at a lower opacity,
  never shipped as-is.
- **Measured on the files the image task generated during this brief** (`assets/generated/neo-tex-marble-*.jpg`, 08:30;
  4,227,072 pixels each, from an ffmpeg `rawvideo` dump):
  - **Dark passes.** Its 98th percentile is L 0.2413, at or under 0.4107, so it may be used at 15%.
  - **Light fails its rule.** Its 2nd percentile is L 0.5089 (pixel `#bdbdbd`), darker than marble-300.
    - With that real vein at 25% plus grain, the gated pairs still pass with less margin: green-700 **4.82**, ink-600
      **4.88**, green-600 large 3.83, ink-500 border 3.89.
    - At **20%** they are within 0.01 of the table above: green-700 **4.95** (table 4.96), ink-600 5.01 (table 5.02).
    - **So the light texture is used at 20% or less** (or re-graded to lift its veins).
  - If either file is regenerated, re-run this check.
- **Text is never set directly on a photograph**, except on the **duo-night** treatment (5.2), whose lightest
  possible pixel is `#53760d` (white 5.30 in the model; 5.36 at the worst pixel of real photos, 5.2).
- **Type is never in front of a statue or a light image.** Figures go in front of type (5.3).

### 2.6 Rejected while setting the palette (record only; these pairs are not allowed)

| tried | ratios | decision |
|---|---|---|
| `ink-500` as muted text | marble-200 4.08; textured 4.00 | muted floor is `ink-600`; `ink-500` stays for control borders |
| `green-600` as small text on light | marble-100 4.48; marble-200 4.01; textured 3.93 | large only |
| `#759b2a` small text or script on dark | poster 5.13, but textured 3.33 | large only; script on dark uses `green-400` |
| grain laid over panels too | marble-200 + grain: green-700 **4.54**, ink-600 **4.60**; poster-2 + grain: `#759b2a` 4.10 | grain stays on the ground plane (margins too thin) |
| `marble-400` as a control boundary | marble-50 2.38; marble-200 1.97 | decorative rules only |
| `#759b2a` as text or meaningful ornament on marble | paper 3.24; marble-50 2.97; marble-100 2.74 | on light it is a band or decoration only |
| `green-400` on light | paper 2.20; marble-50 2.01 | dark grounds only |
| white on the lime band `#94bc4a` | 2.20 | `green-950` / `poster` only |
| alert red as text on poster | 1.88 | emergencies on dark use a `paper` on `alert` tile |
| white over the decorative **duo-verdigris** ramp | 1.61 | never text over verdigris or marble duotones |

Before the caps were set, the first run failed 5 pairs: textured-ground `ink-500` 4.27 and `green-600` 4.20, dark
texture at 30% pulling `green-400` to 4.11 and `#759b2a` to 2.79, and `marble-400` rules at 2.06. The caps and roles
above are the fixes.

---

## 3. Typography

### 3.1 Faces (self-hosted, SIL OFL 1.1, in `assets/fonts/neo/`)

| role | family | licence evidence (checked 2026-09-29) | axes in the served file (read from its `fvar`) | files (latin / latin-ext bytes) |
|---|---|---|---|---|
| **(a) display** | **Noto Serif Display** (Google) | `license: "OFL"` in google/fonts `ofl/notoserifdisplay/METADATA.pb`; font name ID 14 `http://scripts.sil.org/OFL`; `OFL-NotoSerifDisplay.txt` | `wght` 100-900 (default 400), `wdth` 62.5-100 (default 100); roman only | `NotoSerifDisplay-normal-latin.woff2` 76,372 / `-latin-ext` 325,488 |
| **(b) text** | **Source Serif 4** (Frank Grießhammer, Adobe) | `license: "OFL"` in `ofl/sourceserif4/METADATA.pb`; name ID 14 OFL; `OFL-SourceSerif4.txt`; **Reserved Font Name "Source"** | `wght` 200-900 (default 400) only. The `opsz` axis was not requested, so the served file carries a fixed optical size whose value it does not record (**unverified**) | roman 50,824 / 42,040; italic 51,516 / 44,260 |
| **(c) script accent** | **Parisienne** (Astigmatic) | `license: "OFL"` in `ofl/parisienne/METADATA.pb`; name ID 14 OFL; `OFL-Parisienne.txt`; **Reserved Font Name "Parisienne"** | static 400 | 22,600 / 14,232 |

`assets/fonts/neo/fonts.css` holds 8 `@font-face` blocks, modelled on `assets/fonts/web/fonts.css`. Each
`unicode-range`, weight range and `font-stretch` range is copied verbatim from Google's CSS. `font-display: swap`,
`src` is a relative url, and the build copies the whole folder to `dist-neo/fonts/` (`src/build.mjs` lines 924-929), where the
urls still resolve. **Do not add `src/themes/neo/styles/fonts.css` unless its urls are rewritten**, because it would
supersede this one. The files are byte-identical to what fonts.gstatic.com served (downloaded with a browser
User-Agent, `wOF2` magic checked; `tmp/neo/brief/neo-fonts-manifest.json` has sizes and sha256 prefixes). Because
Source and Parisienne are **Reserved Font Names**, never re-subset, modify or rename these files. Re-download instead
(`node tmp/neo/brief/fetch-fonts.mjs assets/fonts/neo "family=Noto+Serif+Display:wdth,wght@62.5..100,400..700"
"family=Source+Serif+4:ital,wght@0,400..700;1,400..700" "family=Parisienne"`).

**latin-ext is never fetched in practice.** No character in the `<body>` text of any of the 350 built HTML files in
`dist/` falls in the latin-ext ranges. The only characters outside latin are ❤ (twice), ⅓ and ⅔ (once each) in `<main>`
text, and they are in neither subset. With `unicode-range`, the 325 KB Noto latin-ext file stays on the server. In the verification run
the browser requested only the four latin files (3.4). If new copy ever adds a latin-ext character, the file loads on
its own, and nothing breaks.

**Preload** two files: `NotoSerifDisplay-normal-latin.woff2` and `SourceSerif4-normal-latin.woff2`. Parisienne is
small and appears once per page at most; it is not preloaded.

Fallback stacks: `--n-display: "Noto Serif Display", "Times New Roman", Georgia, serif;`
`--n-text: "Source Serif 4", Georgia, "Times New Roman", serif;` `--n-script: "Parisienne", "Segoe Script", cursive;`

### 3.2 Why these three (specimen evidence)

`node tmp/neo/brief/specimen.mjs` rendered real copy in 7 display, 3 text and 4 script candidates in one headless
Chrome (`tmp/neo/brief/specimen-cand.png`, measures in `specimen-cand.json`):

- **Display.** Noto Serif Display at `wdth` 62.5 is tall, condensed and high-contrast. It is the closest open-licence
  match to the moodboard trait, with its `wdth` axis for h1/h2 (75%). Bodoni Moda's hairlines are fashion-thin (the
  brand system warns against luxury hairline type). Playfair is wider and 184 KB. Instrument Serif is condensed but a
  single weight with less stately contrast.
- **Text.** Source Serif 4 at 18px/1.7 sets a **median of 65 characters per 560px line**, with x-height **0.50em**
  (Nunito Sans 0.49, Alegreya Sans 0.46) and lining figures, so phone numbers and hours read cleanly. A sturdy text
  serif carries the classical voice through 349 pages without the display face's thin hairlines. Alegreya Sans read
  smaller and uses old-style figures.
- **Script.** Parisienne has the most open letterforms and the strongest strokes of the four candidates (Pinyon, Great
  Vibes and Italianno are more formal or thinner). It reads as a warm handwritten flourish, not a wedding invitation.

### 3.3 Where each face is used

| face | settings | used for | never |
|---|---|---|---|
| Noto Serif Display | `font-stretch: 62.5%`, `font-weight: 500` | home poster lines, hashtag titles, poster words behind a statue, numerals (`400`) | below 28px; body text; buttons; nav |
| Noto Serif Display | `font-stretch: 75%`, `font-weight: 500` (600 allowed for h2 on dark) | h1, h2, pull titles | — |
| Source Serif 4 | 400 body; 600 UI, meta caps and h3; 700 h4-h6 and `<strong>`; italic 400 | body, prose, answers, forms, nav, buttons, tables, captions, h3-h6, meta | — |
| Parisienne | 400 | **only these verbatim phrases**, which exist in `audit/raw` (checked): "We Know You!" (home hero), "in Bossier City, Louisiana" (the Welcome h1's second part, a markup-only span as glass L07), "Eye Care for Everyone" (`audit/raw/eye-care-services-eye-exams.html`) | body copy, links, buttons, nav, headings on their own, anything under 32px, uppercase, more than one phrase per viewport |

### 3.4 Fluid type scale (320 -> 1440 px, linear between, clamped; root 16px)

Generated by `node tmp/neo/brief/type-scale.mjs` (`tmp/neo/brief/type-scale.json`):

```css
:root {
  --n-meta:    clamp(0.8125rem, 0.7946rem + 0.0893vw, 0.875rem);  /* 13 -> 14   text 600, uppercase, .14em: eyebrows, ornament captions */
  --n-sm:      clamp(0.9375rem, 0.9196rem + 0.0893vw, 1rem);      /* 15 -> 16   captions, form help, breadcrumbs, legal */
  --n-ui:      clamp(1rem, 0.9821rem + 0.0893vw, 1.0625rem);      /* 16 -> 17   nav, buttons, labels, tabs (600) */
  --n-base:    clamp(1.0625rem, 1.0268rem + 0.1786vw, 1.1875rem); /* 17 -> 19   body, answers, inputs */
  --n-lead:    clamp(1.1875rem, 1.1161rem + 0.3571vw, 1.4375rem); /* 19 -> 23   lead paragraph, FAQ summaries */
  --n-h4:      clamp(1.1875rem, 1.1339rem + 0.2679vw, 1.375rem);  /* 19 -> 22   h4-h6, card titles (text 700) */
  --n-h3:      clamp(1.375rem, 1.2321rem + 0.7143vw, 1.875rem);   /* 22 -> 30   h3 (text 600) */
  --n-h2:      clamp(1.875rem, 1.4107rem + 2.3214vw, 3.5rem);     /* 30 -> 56   h2 (display wdth 75, 500) */
  --n-h1:      clamp(2.25rem, 1.4643rem + 3.9286vw, 5rem);        /* 36 -> 80   h1 (display wdth 75, 500) */
  --n-tag:     clamp(2.375rem, 0.9107rem + 7.3214vw, 7.5rem);     /* 38 -> 120  #HappyPatients / #HeretoHelp (wdth 62.5, caps) */
  --n-poster:  clamp(3.25rem, 1.1786rem + 10.3571vw, 10.5rem);    /* 52 -> 168  hero lines, poster words (wdth 62.5, caps) */
  --n-script:  clamp(2.125rem, 1.375rem + 3.75vw, 4.75rem);       /* 34 -> 76   approved script phrases */
  --n-numeral: clamp(1.75rem, 1.1071rem + 3.2143vw, 4rem);        /* 28 -> 64   numerals in medallions (wdth 62.5, 400) */
  --n-measure: 59ch;  /* about 66 characters of Source Serif 4 (1ch = 0.529em, mean character 0.471em, measured) */
  --lh-poster: .86; --lh-tag: .9; --lh-h1: 1.02; --lh-h2: 1.05; --lh-h3: 1.2; --lh-h4: 1.3; --lh-lead: 1.6; --lh-body: 1.7;
  --ls-poster: .02em; --ls-tag: .02em; --ls-h1: -.005em; --ls-meta: .14em;
}
```

Values at 390 / 768 / 1024: base 17.13 / 17.80 / 18.26; h2 31.6 / 40.4 / 46.3; h1 38.8 / 53.6 / 63.7; poster
59.3 / 98.4 / 124.9.

**Where the minimums come from.** The line box at 320 is 288px (320 minus two 16px gutters). The widest unbreakable
word across **all 349 h1s** is "Ophthalmoscope", at 7.09em in the h1 setting, so 36px gives 255px. The widest poster
word is "COMMUNITY" at 5.16em plus tracking, so 52px gives 278px. "#HAPPYPATIENTS" is 7.31em with tracking, so 38px gives
278px. A word's width grows more slowly with the viewport than the line box does (for example poster
100.7 + 0.553vw against vw minus 32), so a role that fits at 320 fits at every larger width.

**Verified in the browser** (`node tmp/neo/brief/verify-type.mjs`, one headless Chrome, `tmp/neo/brief/verify-type.json`,
shots `verify-type-320.png` / `-1440.png`): the page loads `assets/fonts/neo/fonts.css` over http, and
`document.fonts.check` is true for Noto 400/500, Source Serif 4 400/700/italic, and Parisienne. At **320, 390, 768, 1024
and 1440**, the hero lines, both hashtag titles, the script phrase, an article paragraph and **all 349 real h1s** render
with **0 overflowing elements** and `scrollWidth === innerWidth` at every width.

**Container rule.** Those numbers assume the title spans the wrap. A title in a narrower column (for example a
two-column hero from 860px) must have a column at least *widest word em x font-size* wide, re-measured by the lab.
The fix is a smaller clamp for that slot, never `overflow-wrap: anywhere` (which splits words mid-glyph).

### 3.5 Setting rules

- **Casing:** the DOM keeps the source casing. Poster lines, hashtag titles and meta caps use
  `text-transform: uppercase`. h1 and h2 stay in source case: long interior titles, up to 74 characters, read badly in
  capitals.
- **Engraved meta caps:** Source Serif 4 600, `--n-meta`, `letter-spacing: .14em`, `green-700` on light / `green-300` on
  dark. They carry eyebrows and ornament captions only; an essential control label is never a meta cap (minimum
  `--n-ui`).
- **Display below 28px is banned** (the hairlines of a display design thin out). h3 and smaller use the text face.
- **Script:** one approved phrase per viewport, at least 32px, `green-700` on light / `green-400` on dark (held to 4.5).
  When it overlaps a serif title (the moodboard's script-over-title trait), it gets a halo in the ground colour
  (`paint-order: stroke fill; -webkit-text-stroke: .12em var(--ground-of-section)`). Its contrast is then judged against
  the ground, it overlaps the title's lowest 35% of cap height at most, and never covers more than two letters.
- **Prose:** `max-width: var(--n-measure)`, left-aligned, `hyphens: manual`. Paragraph spacing is 0.9em. Lists use the
  rosette or a small star marker (4.5, 4.7) at `green-600`/`green-400`, `aria-hidden`.
- **Figures:** Source Serif 4's default lining figures are used for phone numbers, hours and prices. Never old-style.

---

## 4. Ornament kit (inline SVG and CSS, `aria-hidden="true" focusable="false"`, colour = `currentColor`)

Every reference below was rendered on marble-50 and on the poster ground in one headless Chrome
(`node tmp/neo/brief/ornaments.mjs`, `tmp/neo/brief/ornaments.png`, 3x crop `ornaments-zoom.png`; exact strings in
`ornaments.json`). **Trap found there:** an SVG `<pattern id>` repeated on a page resolves to its first definition,
so a meander in a second colour context drew in the first one's colour. The meander therefore ships as a **CSS mask**
filled with `currentColor` (verified: three contexts, three different computed colours).

### 4.1 Meander border (Greek key)
Shape: a 20 x 14 unit with one continuous baseline and a square spiral hooked onto it (grid 4 x 3), stroke 1.5,
square caps. It tiles seamlessly along x.
```css
.meander { display: block; height: 14px; background: currentColor;
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 14'%3E%3Cpath d='M0 13H20M1 13V1H17V10H5V4H13V7H9' fill='none' stroke='%23000' stroke-width='1.5' stroke-linecap='square'/%3E%3C/svg%3E") 0 0/20px 14px repeat-x;
          mask: (same value); }
```
Where: the footer's top frieze; optionally the home hero's bottom edge. At most 2 runs per page, full-bleed or wrap width, `green-600` on light,
`green-500` / `green-300` on dark. Never vertical, never around text blocks, never inside cards.

### 4.2 Laurel sprig
Shape: a gently curved stem (`M4,58Q18,18 58,6`, stroke 1.4, round cap) with 9 almond leaves (two quadratic curves each)
alternating sides at ±34 degrees to the stem, tapering from 17 to 8 units, plus a tip leaf. It sits in a 72 x 64 viewBox and is mirrored
with `transform: scaleX(-1)` for a pair. The full string is in `ornaments.json`. Where: a mirrored pair under the home hero
title or either side of a medallion. At most 2 sprigs (1 pair) per page, 48-96px wide. `green-600` on light,
`green-400` on dark. Never around a person's name or portrait, never as a repeated pattern (the glass judges' leaf-overuse finding stands).

### 4.3 Arch frame
Shape: a box with `border-radius: 999px 999px 0 0` (CSS scales the radii so the head is a true semicircle for any
width up to 1998px, as the glass `--r-arch`). An outer fine rule is a `::before` at `inset: -8px -8px 0` with the
same radius, so it is concentric: both spring lines sit at the same height. A keystone (12 x 9 trapezoid,
`clip-path: polygon(0 0,100% 0,80% 100%,20% 100%)`) crosses the rule at the crown. Optional imposts: 12 x 3 ledges at the
spring line, outside the rule. Proportion 2:3 or 3:4. Where: the hero photo, service and Visit photos, index-card thumbnails,
the doctor portrait (**mask only**, no protruding cut-out). Rule colour `green-600` / `marble-400` on light, `green-300`
on dark.

### 4.4 Column / pilaster
Shape (CSS): an 18-24px-wide strip whose flutes are
`repeating-linear-gradient(90deg, currentColor 0 1px, transparent 1px 5px)`. The capital and base are `::before` /
`::after` double rules 4px wider than the shaft on each side. Where: a mirrored pair flanking a centred title band or the footer frieze, **1024px and
wider only**, and never taller than the block it flanks. Never behind text, never repeated as a colonnade. The carved
column *image* (`neo-cut-column`) is a separate, figure-plane element (5.3).

### 4.5 Rosette
Shape: 8 lens petals (`M0-11Q3.2-6 0-2.6Q-3.2-6 0-11Z` rotated in 45 degree steps) around a 1.8-unit boss, in a
-12..12 viewBox. Sizes 16-32px. Where: the centre of a rule divider (4.6); the accordion marker (it turns on open,
6.4); the centre of a medallion.

### 4.6 Fine double rules
Shape: `height: 4px; border-block: 1px solid currentColor` (two 1px lines with a 2px gap). The divider form is
rule, rosette, rule (`display: flex; gap: 12px`, rules `flex: 1`, max 360px). Where: under an interior h1 in the
title band, above the footer, between major home sections. Decorative colours only (2.3).

### 4.7 Star / sparkle
Shape: a four-point concave star `M0-10Q.9-.9 10 0Q.9.9 0 10Q-.9.9-10 0Q-.9-.9 0-10Z`, 12-20px. Where: at most
4 per page, at the corners of the hero's fine-line frame, as a mirrored pair flanking meta caps, or as a list marker
in short (6 items or fewer) home lists. Never animated in a loop.

### 4.8 Circular badge (medallion)
Shape: a 120 x 120 viewBox with three rings (r 58 at 1px, r 53 at .75px dotted `1 3.2`, r 47 at 1px) and four small
diamonds at the compass points. The **badge draws no letters**. Anything inside it is real HTML copy placed over it:
for example the laurel cut-out around "We Know You!" (script), a rosette, or the round "Call Us: 318-550-5815" link from the
top bar (a real `tel:` link whose accessible name is that verbatim string). Text on a circular path is allowed only
as an `aria-hidden` duplicate of a phrase that appears as real text on the same page, at most once per page, and is
recorded as a ledger ADD row. Where: the home hero (one), the Visit block (one). A slow rotation is allowed only as
the hover/focus "medallion turn" (6.4), never as a loop.

### 4.9 Ornament budget per page (keep it sparse)

| page | meander runs | laurel pairs | badges | stars | pilaster pairs | rosette dividers |
|---|---|---|---|---|---|---|
| home | 2 | 1 | 2 | 4 | 1 | 3 |
| interior (all families) | 1 (footer) | 0 | 0 | 2 | 1 (title band, 1024 and up) | 2 |

---

## 5. Image treatment

### 5.1 Treatment classes (classes from `audit/image-classification.json` / `docs/IMAGE-PLAN.md` 1a)

| class | treatment | applies to |
|---|---|---|
| **T0 untouched** | Original pixels and colour. No filter, duotone, grain overlay, mask that hides content, or crop beyond the glass rules | **brand-campaign-image** (Kaenon, IZOD, Alan J, Converse ads; the three `transitions-*` photos; `Frames-Chanel-Pink-sm`), **every logo** (designer-frame, contact-lens, insurance-carrier, payment, EyeGlass Guide), the practice logo (`assets/brand/logo-clifton.png` on light, `logo-clifton-light.png` on dark, never redrawn or recoloured), the **functional QR code** (byte-identical), **educational diagrams** (their colours carry meaning), **blog and library article images** (a red eye must stay red), **Dr. Deana Clifton's portrait** (a real person: arch mask allowed, no recolouring, never on the poster ground in a medallion, max 225 css px), section-index tiles (some carry baked text), the 404 illustration |
| **T1 natural colour, classical frame** | Arch, medallion ring or fine double frame. Colour untouched | People photography used as content: home hero `6a111a60`, promo `ea0df44c`, service tiles, service-page banners, key-page stock photos, testimonial faces (a cluster, never paired with a named review) |
| **T2 duo-night** (text-safe) | Duotone `--poster-deep` -> `--green-600` | Photos that carry **light text directly**: page-header backgrounds and the generated `neo-scene-*` / glass `scene-*` backdrops in title bands. Not on the brand-named pages (the DESIGN-SPEC 6.3 exclusion list), where the band is plain poster |
| **T3 duo-marble** | Duotone `--ink-950` -> `--marble-50` | Statue, relief and column cut-outs (`neo-cut-*`), decorative stone. No text on it |
| **T4 duo-verdigris** | Duotone `--poster` -> `--green-300` | Decorative scenes inside arches on the poster ground (for example `neo-scene-arch-garden`). No text on it |

The laurel wreath cut-out keeps its own bronze-verdigris patina (it is already on-palette) or takes T4.

### 5.2 Duotone: implementation and proof

Prototype (labs) with an SVG filter in sRGB, so the output is exactly the ramp that `tools/neo-contrast.mjs` models:

```html
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <filter id="duo-night" color-interpolation-filters="sRGB">
    <feColorMatrix type="matrix" values=".2126 .7152 .0722 0 0  .2126 .7152 .0722 0 0  .2126 .7152 .0722 0 0  0 0 0 1 0"/>
    <feComponentTransfer>
      <feFuncR type="table" tableValues="0.0667 0.3255"/><feFuncG type="table" tableValues="0.0784 0.4627"/><feFuncB type="table" tableValues="0.0431 0.0510"/>
    </feComponentTransfer></filter>
  <!-- duo-verdigris: R 0.1059 0.7412 | G 0.1255 0.8353 | B 0.0706 0.5608
       duo-marble:    R 0.1373 0.9686 | G 0.1333 0.9608 | B 0.1608 0.9255 -->
</defs></svg>
```

**Measured on real pixels** (`node tmp/neo/brief/duotone-check.mjs`: the filter applied through a canvas in headless
Chrome, every pixel read back). On the brightest source photos (unfiltered maximum `#feffff`, the positive control),
duo-night's lightest output pixel is `#53750d` / `#52750c`, so **white text measures 5.36 and marble-50 text 4.91** at
the worst pixel, at or above the model's worst case (5.30 / 4.85).

**Build (recommended):** bake T2-T4 derivatives at build time with ffmpeg, so every engine shows the same pixels and
WebKit's handling of `filter: url()` on `<img>` stops mattering. For example duo-night:
`ffmpeg -i in.jpg -vf "format=gray,format=rgb24,lutrgb=r='17+val*66/255':g='20+val*98/255':b='11+val*2/255'" out.png`
then `cwebp`. Verified on the hero photo: 1,091,840 pixels, lightest `#53760d`, darkest `#11140b`, white 5.30. A
derivative is a new file beside an untouched source (the logo-derivative precedent). It is declared in the handoff and
never made from a T0 image. A CSS-only fallback (grey image with `mix-blend-mode: multiply` over the highlight colour,
plus a `lighten` layer in the shadow colour) is bounded by the same highlight, because for duo-night every highlight
channel is at least the shadow channel.

### 5.3 Statue and marble cut-outs overlapping display type

The moodboard's central trait, applied to real headings:

1. **The title is the real heading element** (the page's h1/h2, verbatim), on plane N1. The figure is a sibling `<img>`
   (usually `alt=""`) on N2 **in front** of it. Never an `aria-hidden` duplicate of the title set large, and never an
   invented word (the moodboard's single poster words are not ours).
2. **The figure breaks the title and the title stays readable:** the figure may cover **at most 2 glyphs per line by
   more than 25% of their box, and no glyph by more than 45%**. Check this in a browser: per-character `Range` rects
   against the cut-out's opaque bounding polygon from its alpha channel (lab tool). The uncovered letters meet 2.4 on
   the ground.
3. **Type never sits in front of a figure.** A light statue behind marble or white type fails contrast at its lightest
   pixels. If a lab wants type over a figure, the answer is no.
4. **Hierarchy stays honest.** Poster type behind a figure is used for the home hero lines, the hashtag section titles
   and interior title-band h1s. The page still has exactly one h1.
5. **Clearances:** a figure never covers body text, links, buttons, form fields, the phone number, the logo, the nav or
   a person's face in a photo, and keeps **24px or more** clear of any of them (collision gate, as glass G5).
6. **Which figures:** only the reviewed files of `src/content/image-plan-neo.json` (`neo-cut-bust-glasses`,
   `neo-cut-bust-profile`, `neo-cut-hand-spectacles`, `neo-cut-eye-relief`, `neo-cut-column`, `neo-cut-laurel`,
   `neo-cut-magnifier`), rendered T3. A missing or unreviewed file means an empty slot, never a placeholder.

### 5.4 Arch-framed photos with protruding cut-outs

The photo (T1 or T4) is clipped by the arch (`border-radius: 999px 999px 0 0; overflow: hidden` on the frame). The
cut-out is a **sibling, not a child**, so it is never clipped. It is positioned so its lower part sits inside the arch and its
top rises **12-22% of the arch height above the crown**, or one shoulder breaks the side rule. The outer fine rule
(4.3) passes *behind* the cut-out, which shows the break. People photos are never replaced by statues, and a statue never
stands in for a person in a photo slot.

### 5.5 Section-crossing figures (the depth the operator asked to keep)

The glass build's layering survives with classical framing. Every protrusion in DESIGN-SPEC section 4 has a neo
counterpart: the hero arch photo crossing the hero seam, service images rising above their cards, the testimonial-face
cluster crossing the services seam, designer plates staggered across the band edges, the title-band cut-out breaking
into the first sheet. Figures cross a seam by `clamp(40px, 8vw, 140px)`. The upper section stacks above the lower one
(as glass 2.8), and the lower section's first text panel (N3) stays above the figure (6.1), so a crossing figure passes
behind text, never over it.

### 5.6 Generated imagery (carried rules)

Illustrative only; never depicting or captioned as Dr. Clifton, staff, the office, a patient, a result or any brand;
no text, letters, logos, numbers or inscriptions in pictures (zoom-review native crops of eyewear and instruments,
where fal draws pseudo-text); the AI label in file metadata (IPTC `trainedAlgorithmicMedia` after any re-encode); no
generated image on a page whose main text names a brand (the DESIGN-SPEC 6.3 exclusion list) or contains "Dr.
Clifton", "Deana" or "Ask Dr."; statues read as carved stone, never as living people; never a copy of a famous
sculpture. The review log goes in `docs/IMAGE-PLAN-NEO.md` (owned by the image task).

---

## 6. Depth, motion and interaction

### 6.1 Named planes

| plane | name | z-index | lives there |
|---|---|---|---|
| N0 | **ground** | 0 | section grounds (marble, poster, bands), marble texture, grain (grain only here), meander friezes |
| N1 | **frieze** | 1 | poster type and title-band headings that figures break; duotone backdrops; arch-framed photos; pilasters; badges |
| N2 | **statue** | 2 | cut-out figures, column fragments, laurel cut-out, protruding parts of framed photos; they break N1 and cross seams |
| N3 | **plate** | 3 | opaque text panels, cards, forms, accordions, the NAP/hours plate, logo grids; above N2 so text is never covered |
| N4 | **relief** | 4 | a figure deliberately overlapping a plate's **ornamental** edge (corner or frame rule only; collision-gated) |
| N5 | **chrome** | 50-100 | top strip, sticky header, progress rule, drawer, skip link |

Section stacking follows glass 2.8: a section whose N2 content crosses into the next one sits above it.
Protrusions need `overflow: visible` on every ancestor up to the section. Only `.deco` wrappers clip.

### 6.2 Protrusion and overflow rules (carried from glass section 4)

- Every horizontal offset is bounded by the gutter. Never set `overflow-x` on `html` or `body`.
- Parallax may never erase a protrusion: `data-depth-max` is 40% or less of the rest offset, and 32px or less.
- Measure at rest (reduced motion), after the fonts load, at 320, 390, 768, 1024 and 1440 (**320 is new for neo**).

### 6.3 Motion: stately

Tokens: `--n-ease: cubic-bezier(.22,.61,.36,1)`, `--ease-out: cubic-bezier(.16,1,.3,1)` (glass),
`--n-t-hover: .45s`, `--n-t-rise: 1.1s`, `--n-t-arch: 1.3s`, `--n-t-settle: 1.6s`, `--n-stagger: 120ms`.

| effect | what moves | rule |
|---|---|---|
| **Slow rise** | opacity 0 -> 1, `translate: 0 28px` -> none (20px under 700px) | IntersectionObserver `threshold 0, rootMargin 0px`; hidden state has no transition; release `data-reveal` after the entrance; fail-safe only if the observer never delivered (glass 5.2, all traps apply); at most 40 revealed elements per page |
| **Statue parallax** | `translate` on the N2 figure (`data-depth` .03-.07) | one rAF-throttled passive handler; k = .55 under 700px; rest at 0 when `innerHeight > 2400`; `translate` for reveal **or** parallax, never both on one element (wrap one in the other) |
| **Arch reveal** | `clip-path: inset(100% 0 0 0 round 999px 999px 0 0)` -> `inset(0 round 999px 999px 0 0)` on an arch photo | 1.3s. **Never on the LCP image** (the hero photo uses a non-hiding `scale: 1.04` -> 1 settle, as glass `settle`) |
| **Letter-spacing settle** | poster lines `letter-spacing: .08em` -> `.02em`, opacity stays 1 | 1024px and wider only (the wider start pose must fit: tested line count and `scrollWidth` at both poses); one element per page; the hero title is the likely LCP and is never hidden |
| **Medallion turn** | a badge or rosette rotates 45 degrees | only on its link's hover or focus (6.4); never a loop |

No ambient loops. The progress rule (a 2px `green-600` line under the header) tracks scroll as direct feedback.

**Reduced motion (`prefers-reduced-motion: reduce`):** `js-motion` is never set, so nothing is ever hidden. No parallax,
no clip or letter-spacing animation, no rotation. `animation: none` and near-zero transitions globally. Hover and focus
keep colour, underline and rule changes but lose every transform (as glass 5.7).

### 6.4 Hover and focus (keyboard parity)

Every `:hover` rule has an identical `:focus-visible` partner (`:focus-within` for containers). Movement-only
hover is wrapped in `@media (hover: hover)`; focus states apply everywhere.

| component | hover and focus-visible | timing |
|---|---|---|
| text links, nav links, footer links | **engraved underline**: a double hairline (1px, 2px gap, 1px, drawn with two `linear-gradient` backgrounds) grows from the centre; colour to `green-800` (light) or `paper` (dark) | .45s |
| current nav item | the double hairline shown at full width plus a small star (4.7) before it, `green-800` | static |
| primary button (`green-700` fill, `paper` text, inner fine rule inset 3px) | fill `green-800`, inner rule insets to 5px, `translate: 0 -2px` (hover:hover only) | .35s |
| secondary button (`ink-500` / `green-300` boundary, poster or marble ink) | boundary to `green-700` / `paper`, engraved underline on the label | .35s |
| **arch card** (service, index card, Visit photo) | **arch lift**: -6px, the outer rule's offset grows 8 -> 12px, the photo scales 1.03 inside its clip | .6s |
| **medallion** (badge, accordion rosette) | **medallion turn**: rotate 45 degrees | .8s `--n-ease` |
| accordion `<summary>` | engraved underline; the rosette turns 45 degrees when `[open]` | .45s |
| form control | border `ink-500` -> `green-700` (hover); focus: `green-700` border plus the 3px ring | .2s |
| logo chips (T0 logos on paper plates) | plate -4px, fine rule appears (logo pixels untouched) | .45s |

Focus ring: `outline: 3px solid var(--focus); outline-offset: 2px`, swapped per surface (2.3). Targets: **44px
minimum** for every control on phones (buttons, nav, pills, accordion rows, carousel buttons, footer links);
inline prose links and legal links 24px minimum. Verification: the static scan (every `:hover` has a focus partner)
plus the CDP hover-vs-Tab comparator on 12 or more components (glass G6).

---

## 7. Hard constraints carried from the glass build

1. **Copy verbatim.** Every visible text node and non-empty alt comes out of `audit/raw/*.html` unchanged (G1 copy parity
   with a failing control). No invented claims, reviews, statistics, awards, prices, dates, credentials or roman-numeral
   years. Any dropped or moved block has a ledger row.
2. **349 pages at their URLs.** `dist-neo/` has the same URL tree, menus and hierarchy as `dist/`, with one h1 per page. Behaviour
   changes L01-L23 apply unchanged.
3. **Forms inert with the honest notice.** Field for field, and on submit: "This form is not connected yet — please call
   318-550-5815" (the shipped string, with the `tel:` link). No mailto fallback. Wiring is a launch task.
4. **No platform traces.** 0 `wp-content`, `fl-`, `gform`, `ecp-`, GTM, EyeCarePro/ecpmarketer markup or icon fonts in
   `dist-neo/` (G16). Secret scan: no `AIza` and no fal key id, with a positive control (G15). `audit/raw/` is never published.
5. **AA contrast** on the **rendered pixels** over the busiest backdrop (grain, texture, duotone), at the widths in
   item 6, with fonts loaded (G2). The model in section 2 does not replace the probe.
6. **44px targets** on phones (G11). **No horizontal scroll from 320 to 1440**: `scrollWidth === innerWidth` sampled 12
   times over about 6 seconds at 320/390/768/1024/1440, normal and reduced motion, on the home page and one page per
   family, plus an empty list of offending elements (G3).
7. **Reduced motion honoured**, hover has keyboard parity, no JS errors (G7, G6, G12).
8. **Logo files as-is**, never redrawn, recoloured or filtered. The favicon derivative stays as shipped.
9. **No runtime dependencies**: Node builtins for the build, hand-written CSS, vanilla JS. Glass sources and `dist/`
   stay byte-identical.
10. **Safari/WebKit** cannot be checked on this machine (G13): SVG `filter: url()` on `<img>` (hence the baked
    derivatives), `paint-order` halos on HTML text, `-webkit-mask` for the meander, animated `clip-path: inset(... round
    ...)` and individual transforms. The operator checks these on an Apple device.

---

## 8. What the three labs keep fixed, and what is theirs

**Fixed for all labs:** the palette and allowed pairs (2), the three faces, their settings and the scale (3), the kit
shapes and budget (4), the image classes and overlap rules (5), the planes and motion vocabulary (6), and every
constraint in 7. The home order is the glass `COMPONENTS.md` G.2 order (hero, welcome, services, reviews, help,
designer, visit).

**Each lab's own choices:** the composition of each section; which sections go dark (within the 2-band budget); where
figures cross seams and which figure goes where; arch proportions (2:3 or 3:4); hero symmetry versus a
centred-axis-with-offset figure; the footer frieze (meander, pilasters and pediment line); and whether the title band
uses a duo-night backdrop or a plain poster band. Useful spread across the three labs: one poster-led (dark hero,
statue breaking the lines), one daylight-led (marble grounds, arches and a single green band), one frieze-led
(symmetry, ruled information cells, medallions). All three stay inside this brief.

---

## 9. Evidence, reproduction and what is unverified

| command (from the workspace root) | produces |
|---|---|
| `node tools/neo-contrast.mjs` (and `--control`) | the palette, worst-case surfaces, duotone ramps, 42 gated pairs (0 failing), rejected pairs, full matrix: `tmp/neo/brief/neo-contrast.{json,md}` |
| `node tmp/neo/brief/fetch-fonts.mjs <dir> <css2 queries>` | woff2 download with a browser UA, latin + latin-ext only, verbatim `unicode-range`; manifest in `tmp/neo/brief/neo-fonts-manifest.json` |
| `node tmp/neo/brief/woff2-info.mjs <files>` | `fvar` axes and name IDs 0/1/14 read from the woff2 (positive control: the `head` magic, and Fraunces reads opsz 9-144 as BRAND-SYSTEM states) |
| `node tmp/neo/brief/specimen.mjs` | candidate specimen and word and measure widths: `tmp/neo/brief/specimen-cand.{png,json}` |
| `node tmp/neo/brief/type-scale.mjs` | the clamp() scale: `tmp/neo/brief/type-scale.json` |
| `node tmp/neo/brief/verify-type.mjs` | fonts through `assets/fonts/neo/fonts.css`, all 349 h1s and poster lines at 5 widths: `tmp/neo/brief/verify-type.json`, shots |
| `node tmp/neo/brief/ornaments.mjs` | the ornament kit rendered on both grounds: `tmp/neo/brief/ornaments{.png,-zoom.png,.json}` |
| `node tmp/neo/brief/duotone-check.mjs` | real-pixel duotone bounds on three source photos: `tmp/neo/brief/duotone-check.json` |

Every browser step used one foreground headless Chrome (`tools/cdp.mjs`), closed at the end of each script.
Provenance note: `tools/cdp.mjs` puts each Chrome profile in the OS temp folder (`%TEMP%\srcdp-*`), outside this
workspace. The six profiles these runs created were deleted afterwards (checked not in use first). A future run that
must stay inside the workspace can pass `launch({ userDataDir: '<workspace>/tmp/...' })`. Nothing else was written
outside the workspace. Files written for this brief: `docs/NEO-BRIEF.md`, `tools/neo-contrast.mjs`,
`assets/fonts/neo/` (8 woff2, 3 OFL texts, `fonts.css`), and scripts and evidence in `tmp/neo/brief/` (git-ignored).

**Unverified or open:**
- The marble textures were checked once, against the versions on disk at 08:30 (2.5): dark passes; light only at
  20% or less. The image task owns these files and may still change them.
- Source Serif 4's pinned optical size in the Google-instanced file is not recorded in the file. It was judged
  visually at 18px only.
- All contrast in section 2 is modelled (flat worst-case layers). The rendered-pixel probe on built pages (G2) is still
  required.
- WebKit behaviour (7.10) cannot be tested here.
- Font loading cost on a slow connection was not measured (Noto latin 76 KB, Source Serif 4 roman latin 51 KB).
