# Image plan: Clifton Eye Center, neoclassical exploration (core imagery)

Written 2026-09-29. This is the imagery for the second design direction, a **neoclassical** version built next to the
shipped glass "Daylight Canopy" design. It does not replace that design. It keeps the brand colours from
`src/styles/tokens.css` and the layered-image depth of the glass build: cut-outs that break out of frames and cross
section seams.

- Plan (machine-readable, same schema as `src/content/image-plan.json`): `src/content/image-plan-neo.json`, 12 entries, every id prefixed `neo-`
- Generator: `tools/fal-gen.mjs --plan src/content/image-plan-neo.json` (unchanged tool)
- Provenance: `audit/generated-images.json` (every neo entry with prompt, model, seed, request id, sha256; the rejected rounds are under `rejected[]`)
- Review evidence (gitignored): `tmp/imgreview-neo/<id>/<round>/`. The contact sheet of the finals is `tmp/imgreview-neo/final/contact-sheet.png`
- Style reference: `tmp/neo/reference-moodboard.png`, a **third-party** moodboard. Only its traits were used: monochrome
  classical marble, cut-out statues over large serif type, arched frames, deep flat grounds with fine grain, circular
  badges. No poster, artwork, statue, word or type lockup from it was recreated.

## 0. Summary

| | |
|---|---|
| Images delivered | **12 of 12**: 8 accepted as generated, 4 fixed and then accepted, 0 dropped |
| fal generations used | **17 of the 30 budget**: 12 in round 1, 4 in round 2 (2 new generations, 2 Kontext edits), 1 in round 3 (a Kontext edit). Counted from the record: 12 current plus 5 rejected neo entries |
| birefnet cut-out calls | 12. Two of the shipped cut-outs do **not** use the birefnet matte (section 2, deterministic matte) |
| Key hygiene | `tmp/imgreview-neo/bin/keyscan.mjs` over the project tree: 17,005 files, 0 hits. Its positive control (the key file itself) scored 2 of 2 |
| Record integrity | `tmp/imgreview-neo/bin/verify-record-neo.mjs`: PASS on 12 neo entries (file, sha256, raw present, prompt/alt/model agree with the plan). The 15 pre-existing glass entries are unchanged (sha256 compared with `tmp/imgreview-neo/generated-images.before-neo.json`) |

| id | file (px) | role | alt | verdict |
|---|---|---|---|---|
| neo-cut-bust-glasses | `assets/generated/neo-cut-bust-glasses.png` (1792x2368) | depth-cutout | "Classical marble bust wearing modern thin-rimmed eyeglasses" | accepted (see caveat 3.1) |
| neo-cut-bust-profile | `assets/generated/neo-cut-bust-profile.png` (1792x2368) | depth-cutout | "Classical marble bust of a woman in profile" | fixed, then accepted (round 2 regenerated) |
| neo-cut-column | `assets/generated/neo-cut-column.png` (1536x2752) | depth-cutout | "" | accepted (see caveat 3.3) |
| neo-cut-laurel | `assets/generated/neo-cut-laurel.png` (1024x1024) | depth-cutout | "" | fixed, then accepted (round 2 Kontext colour edit) |
| neo-cut-hand-spectacles | `assets/generated/neo-cut-hand-spectacles.png` (1184x880) | depth-cutout | "Marble hand fragment with antique round spectacles resting in its palm" | fixed, then accepted (round 2 regenerated, round 3 Kontext backdrop edit plus a deterministic matte) |
| neo-cut-eye-relief | `assets/generated/neo-cut-eye-relief.png` (1184x880) | depth-cutout | "Marble relief fragment carved with a single eye" | fixed, then accepted (round 2 Kontext backdrop edit plus a deterministic matte) |
| neo-cut-magnifier | `assets/generated/neo-cut-magnifier.png` (2368x1792) | depth-cutout | "Antique brass magnifying glass" | accepted (see caveat 3.2) |
| neo-scene-arch-garden | `assets/generated/neo-scene-arch-garden.jpg` (1792x2368) | scene-backdrop | "" | accepted |
| neo-scene-colonnade | `assets/generated/neo-scene-colonnade.jpg` (2752x1536) | scene-backdrop | "" | accepted |
| neo-scene-library | `assets/generated/neo-scene-library.jpg` (2752x1536) | scene-backdrop | "" | accepted |
| neo-tex-marble-light | `assets/generated/neo-tex-marble-light.jpg` (2752x1536) | texture | "" | accepted |
| neo-tex-marble-dark | `assets/generated/neo-tex-marble-dark.jpg` (2752x1536) | texture | "" | accepted |

Alt rule: an alt describes what is shown. Decorative layers (backdrops, textures, the column, the laurel) carry `alt=""`.
Where a described cut-out sits beside a heading that already says the same thing, use `alt=""` there too. Never caption
or place a bust, hand or eye as Dr. Deana Clifton, staff, a patient or the office.

## 1. Review method (every image)

1. **Scaled overview** of the final file and, for cut-outs, of the raw fal output (`overview.png`, `raw-overview.png`).
2. **Native-resolution crops**, enlarged 2x or 3x by nearest-neighbour for viewing only (`crop-*.png`). These cover
   every eyewear hinge, temple, bridge and lens, every face, the hands (digit count), book spines, the clock, gilt
   ornament, column capitals, the brass rim and collar, and vein clusters.
3. **Cut-out matte**: `alpha-stats.mjs` (bbox, edge contact, 4-neighbour components, specks), plus composites over the
   three neo review grounds, both whole (`comp.*`) and as native crops (`cc-*`): **dark** `#10150c` (deep green-black
   derived from green-950 `#141f00` and ink-950 `#232229`), **light** `#fafcf6` (`--ground`) and **mid** `#759b2a`
   (`--green-500`).
4. **Colour**: `hue-stats.mjs` (mean RGB, luma, a hue histogram in 30-degree bins) where a hue question came up.
5. **Textures**: `seams.mjs`. Its positive control `tmp/imgreview/bin/ctrl-seam.png` fires (a vertical seam at x=500).

## 2. Decision log

### Round 1: 12 generations (`tmp/imgreview-neo/gen-run1.log`)

- **neo-cut-bust-glasses: accepted.** It's an original curly-haired youth bust with blank carved eyes, so it reads as
  stone, not a person. The round metal eyeglasses are clean at 3x: both temples are plain with no pseudo-text, the near
  temple bends down behind the ear, and the hinge, bridge and nose pad are coherent (`r1/crop-glasses-native.png`,
  `crop-left-hinge-x3.png`, `crop-right-temple-x3.png`). The matte is 1 component with no specks and no edge contact,
  and the hair edge is clean on dark (`r1/cc-hair-edge.dark.png`). Deviation: the bust stands on a small plinth instead
  of being cut off at mid-chest by the frame. Caveat 3.1 covers the lens.
- **neo-cut-bust-profile: rejected.** The head is in three-quarter view facing **left**, so the alt "in profile" would
  be false. The pose also nearly duplicates the glasses bust (`r1/raw-overview.png`).
- **neo-cut-column: accepted** (alt ""). A clean, symmetric capital with no letter-like forms in the egg-and-dart or
  leaf band (`r1/crop-capital-native.png`). The red-brown weathering at the plinth corners is in the raw image, not a
  matte fringe (`r1/cc-plinth.dark.png`). See caveat 3.3.
- **neo-cut-laurel: rejected on colour.** The wreath and matte were clean (the centre is fully transparent; one 3 px
  speck), but the leaves were blue-green verdigris: dominant hue 150 degrees, mean `#818e7b`. The brand anchors
  `#759b2a` and `#94bc4a` sit at about 80 degrees, so beside them this reads as a second, clashing green. A CSS
  hue-rotate would also turn the gold stems orange.
- **neo-cut-hand-spectacles: rejected on anatomy and material.** The digits don't resolve into one thumb plus four
  fingers, and it reads as a porcelain mannequin hand with fingernails. The spectacles float in front of the hand; the
  right lens kept the grey backdrop as an opaque disc; the forearm runs off the frame (`r1/comp.dark.png`).
- **neo-cut-eye-relief: rejected on the matte.** The carving is good: a calm, stylised eye with a smooth carved ball
  for the iris and no inscription, so nothing uncanny. But birefnet cut holes through the relief's flat light-grey
  field, which has the same tone as the backdrop (`r1/comp.dark.png`).
- **neo-scene-arch-garden: accepted.** Symmetric arch, no inscription. The far end at 2x shows an arcade, steps and two
  small lanterns, with no people or signs (`r1/crop-vanishing-x2.png`, `crop-arch-top-native.png`).
- **neo-scene-colonnade: accepted.** Straight, evenly spaced fluted columns and coherent bases, with no frieze text or
  people (`r1/crop-capitals-native.png`, `crop-far-end-x2.png`, `crop-right-bases-native.png`).
- **neo-scene-library: accepted.** The highest text risk, cleared at native and 2x/3x: the book spines carry only gold
  bands, the wall clock has plain baton markers and no numerals, the desk photo frame is blank, and the gilt corner
  ornament is foliate with no letters (`r1/crop-left-spines-x2.png`, `crop-right-spines-x2.png`, `crop-clock-x3.png`,
  `crop-desk-frame-x3.png`, `crop-gilt-*-x3.png`, `crop-far-end-x2.png`).
- **neo-tex-marble-light: accepted.** Neutral: mean `#e6e5e5`, 0.2% chromatic pixels (a few tan flecks). No seams
  (`r1/seams.json`), and no vein that reads as a letter or face (`r1/crop-vein-cluster-native.png`).
- **neo-tex-marble-dark: accepted.** Mean `#23302e` (hue about 170 degrees), luma 45.1. It sits with the brand slate
  family (slate-900 `#1d2e33`) and carries the moodboard's fine grain. No seams; bright white veins
  (`r1/crop-vein-cluster-native.png`).
- **neo-cut-magnifier: accepted with a placement rule** (caveat 3.2). No engraving on the brass rim, collar or end cap
  (`r1/crop-collar-x2.png`, `crop-endcap-x2.png`), and a clean matte on light (`r1/cc-rim-bottom.light.png`).

### Round 2: 4 generations (`tmp/imgreview-neo/gen-run2.log`)

Before each fresh regeneration, the round-1 raw was copied to `assets/generated/rejected/<id>.r1.raw.jpg`, because
fal-gen overwrites `raw/<id>.jpg`. The replaced finals were archived by fal-gen as `rejected/<id>.<timestamp>.png`.

- **neo-cut-bust-profile: new generation, accepted.** A true side profile facing right, with a blank carved eye and a
  modest high-necked drapery; the point that showed on the chest at display scale is a vein junction
  (`r2/crop-face-native.png`, `crop-chest-native.png`). The body is turned slightly toward the viewer, and the alt
  ("in profile") describes the head. The hair matte is clean on dark (`r2/cc-hair-profile.dark.png`).
- **neo-cut-laurel: Kontext colour edit, accepted.** The dominant hue is now 60 to 90 degrees (49% and 30%), mean
  `#979b78`, olive. The centre is transparent: max alpha 0 in the central 250x250, while the control box on the leaves
  is opaque (max 255, 7,607 px). Edges are clean on light and brand green (`r2/cc-left-leaves.light.png`). The crossed
  stem ends kept a trace of teal, which is negligible at badge size (`r2/cc-stem-cross.mid.png`). Kontext returns about
  1 MP, so it is now 1024x1024.
- **neo-cut-hand-spectacles: new generation, image accepted, matte rejected.** Palm up, one thumb plus four fingers,
  marble veining, no nails. The spectacles rest in the palm with stone under both lenses, and there's no pseudo-text on
  the temples or hinges (`r2/crop-spectacles-native.png`, `crop-hinge-x3.png`). Then birefnet cut away the little
  finger's base and the heel of the palm, leaving the fingertip floating (`r2/cc-lower-fingers.dark.png` against
  `crop-lower-fingers-raw.png`).
- **neo-cut-eye-relief: Kontext edit to a black backdrop, image accepted, matte rejected.** The edit left the carving
  unchanged, but birefnet cut the **same** holes again (`r2/comp.mid.png`). So the fault is birefnet reading the flat
  field inside the ring as background seen through a hole, not low contrast.

### Round 3: 1 generation (`tmp/imgreview-neo/gen-run3.log`)

- **neo-cut-hand-spectacles: Kontext edit of the round-2 raw to a black backdrop.** The hand and spectacles are
  unchanged (`r3/raw-overview.png`), but birefnet dropped large parts of the palm (`r3/comp.mid.png`). It treats the
  spectacles as the subject.

### Deterministic matte for the eye relief and the hand (no generation)

Two birefnet failures on two different backdrops showed a matting fault, not an image fault, so more generations would
not fix it. Both Kontext edits sit on a pure black backdrop (border max channel p50 0, p99 0 to 1, max 3 to 4), so a
luminance key can be exact. `tmp/imgreview-neo/bin/matte-key-black.mjs` works in five steps:

1. Background is a flood fill from the border through `max(R,G,B) <= 24`. Dark carved shadows inside the subject can't
   be reached, so they stay opaque.
2. The core gets alpha 255 with RGB untouched.
3. A 2 px edge band gets alpha = `maxch / local core median`, with RGB un-premultiplied over black, so no dark fringe
   is left.
4. Detached alpha specks under 64 px (4-neighbour) are cleared.
5. Nothing is drawn or painted.

- Eye relief: the key keeps 67,307 px of stone that birefnet dropped, and drops only 173 px that birefnet kept. The
  result is 1 component with 0 specks. Edges are clean on dark and light (`r2/cc-keyed-left-edge.*.png`), and the
  field around the eye is solid (`r2/cc-keyed-eye.light.png`, `r2/keyed-comp.mid.png`).
- Hand: the key keeps 48,950 px that birefnet dropped, and drops only 26 px that birefnet kept. The result is 1 component, 0 specks, every finger attached, both lenses show the stone palm. Edges are clean on light and
  green (`r3/keyed-comp.light.png`, `cc-keyed-lower-fingers.light.png`, `cc-keyed-spectacles.mid.png`).
- Installed by `tmp/imgreview-neo/bin/install-keyed.mjs`. It archives the birefnet file as
  `rejected/<id>.<round>-birefnet.png` and records `sha256Before`, `sha256` and `postProcess` in
  `audit/generated-images.json`, in the same shape as the glass project's `cut-sunglasses`. The plan entries carry a
  `matteOverride` note.
- **Do not run fal-gen with `--force` on these two ids.** It would bring back a birefnet matte with holes. If you ever
  regenerate them, re-key and re-install afterwards.

## 3. Placement caveats for the lab designers

- **3.1 neo-cut-bust-glasses.** The far lens extends past the cheek. birefnet matted the glass as opaque, so that wedge
  (about 90x280 px at native size) keeps the grey backdrop and reads as a grey glass reflection on dark and light
  grounds (`r1/cc-left-lens.dark.png`, `.light.png`). This is the same glass limitation as the glass build's
  `cut-lens-prism`. It's accepted: at hero size it reads as glass, and a Kontext fix would halve the hero's resolution.
  Also, white marble on `#fafcf6` has low edge contrast (`r1/cc-hair-edge.light.png`), so the busts work best on the
  deep green-black or brand-green grounds.
- **3.2 neo-cut-magnifier.** The style suffix put a magnified grey-green marble view in the lens, and the lens is
  opaque after the cut-out. Place it over the dark marble ground (`neo-tex-marble-dark`) or a dark flat ground, where
  it reads as magnifying the stone. Not over photographs or white.
- **3.3 neo-cut-column.** It's a whole column (capital, fluted shaft, base, rough plinth), not a broken fragment, and
  the capital is Composite-style (Ionic volutes over acanthus). Its alt is "", so nothing false is claimed, but don't
  label it "Ionic" in copy.
- **3.4 Resolution of the Kontext-derived cut-outs.** Laurel 1024x1024, eye relief and hand 1184x880. For 2x-crisp
  display, keep them at or below about 512 css px (laurel) and 590 css px wide (relief, hand).
- **3.5 Colour.** Everything stays inside the brand family. Marble is neutral-to-slate, the laurel is olive, and the
  arch garden and library lamps are leaf green. The dark marble is slate-900-adjacent: put it under a flat
  green-black veil (for example green-950 `#141f00` or `#10150c`) so light type keeps its contrast.
- **3.6 AI label.** An ffmpeg re-encode (like the two keyed mattes) drops the fal C2PA manifest. Attach the IPTC
  `trainedAlgorithmicMedia` XMP label at build, as for the glass images.
- **3.7 Originality.** Every bust, hand and relief was prompted as an original generic classical-style carving. On
  visual review, none matches a famous sculpture I recognise. That is unverified beyond visual review; no reverse-image
  search was run.

## 4. Files

- New: `src/content/image-plan-neo.json`, `docs/IMAGE-PLAN-NEO.md`, `assets/generated/neo-*` (12 finals),
  `assets/generated/raw/neo-*` (raw fal outputs and Kontext `.edit.jpg`), and `assets/generated/rejected/neo-*`
  (5 replaced finals, 2 birefnet mattes, 5 kept round raws).
- Changed: `audit/generated-images.json`. Twelve neo entries and 5 neo rejected entries were appended by
  `tools/fal-gen.mjs`, and 2 postProcess blocks by `install-keyed.mjs`. The backup from before this run is
  `tmp/imgreview-neo/generated-images.before-neo.json`.
- Review tools (gitignored): `tmp/imgreview-neo/bin/` holds `review.sh`, `comp.sh`, `compcrop.sh`, `crop.sh`,
  `view.sh`, `alpha-stats.mjs`, `hue-stats.mjs`, `seams.mjs`, `keyscan.mjs`, `verify-record-neo.mjs`,
  `matte-key-black.mjs` and `install-keyed.mjs`.
