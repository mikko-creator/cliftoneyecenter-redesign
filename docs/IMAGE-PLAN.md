# Image plan: Clifton Eye Center redesign (glass + layered depth)

Written 2026-09-28 from the on-disk harvest only (no live-site requests, no fal calls). Machine-readable companions:
`audit/image-classification.json` (all 294 source files: class, size, pages, low-res verdict, treatment) and
`src/content/image-plan.json` (the fal generation plan).

## 0. Summary

| | count |
|---|---|
| Source images on disk (`assets/source`) | 294 files (294 of the 319 inventory rows; 25 failed to download) |
| Classes kept as-is | 271 files (every class except platform UI and the soft-404) |
| Platform UI sprites/icons to drop | 22 |
| Broken on the live site | 26: 25 in `failures.json`, plus `clipart-010.jpg`, an HTML soft-404 saved as .jpg |
| Visible `<img>` actually broken | 6 of 26 (the rest: 19 dead `og:image` meta paths and 1 platform CSS background) |
| fal images planned | 16 generated (3 backdrops, 7 cut-outs, 5 service images, 1 texture) plus 4 reuse slot-fills (no fal call) |
| Source images too small for a hero role (< 1600 px wide) | the homepage hero (1280 px) and 5 of the 10 page-header backgrounds, 2 of them mobile-only (table 1c) |

Roles were confirmed by viewing 19 images: 15 source files and 4 live-homepage screenshots.

## 1. Source imagery classification

### 1a. By class

| Class | Files | What it is | Redesign treatment |
|---|---:|---|---|
| practice-logo | 1 | `666ec49d-clifton_eye_center_medium…jpg`, 317x221, on all 349 pages | Keep as-is and never redraw. It is an **opaque JPEG on pure #ffffff** (7 edge pixels sampled, all `#ffffff`). Use `mix-blend-mode: multiply` on light glass and a white chip on the green band. It stays crisp to about 158 css px wide at 2x. |
| practice-doctor-photo | 1 | `23fe4783-deana_GSP…png`, **225x397**, rgb24 with no alpha, on /our-eye-doctors and /team/dr-deana-clifton-od | Keep. Use a CSS mask or ring only. No generative edit and no AI cut-out of a real person. |
| staff / office photos | 0 | None found by filename, alt or page. The /our-eye-doctors header and the /hours-location photos are stock. | n/a |
| home-hero | 1 | `6a111a60-Girl-Smiling-Brown-Hair-1280x853.jpg`, a CSS background in layout 2650 (homepage only) | Keep it framed in a glass card (at most 640 css px) in front of `scene-exam-room`. **Not full-bleed**, because 1280 is under 1600. |
| home-service-tile-or-promo | 5 | The "Our Most Popular Services" tiles: Unique Optical `81b71862` (1280), Contact Lens Services `291abc74` (640), Comprehensive Eye Exams `0d41af0c` (640), Pediatric Eye Care `e0cfe7e9` (640). Also the contact-lens promo `ea0df44c` (1280). | Keep inside the four service cards. Generated cut-outs protrude over them. |
| testimonial-avatar | 3 | `48c72009`, `663dba41`, `34ee7792`: 300x300 rgba circles in the #HappyPatients carousel | Keep at 150 css px or less. They look like stock-style photos (unverified whether they show the reviewers), so add no caption beyond what the source has. |
| brand-campaign-image | 8 | Homepage "Our Designer Optical" ads (Kaenon, IZOD, Alan J, Converse, about 250x300). Three `transitions-*` photos on the Transitions pages. `Frames-Chanel-Pink-sm` (a designer-frames header background). | **Keep exactly as-is.** Never regenerate, imitate, crop or retouch them, and never put generated eyewear beside them. |
| designer-frame-brand-logo | 31 | 133x110 brand logos on /eyeglasses-contacts/eyeglasses/designer-frames | Keep as-is on white glass chips. |
| contact-lens-brand-logo | 8 | Alcon (2000 px), Acuvue, Bausch & Lomb (x2), Ciba, CooperVision (x2), X-Cel | Keep as-is on white glass chips. |
| insurance-carrier-logo | 8 | Aetna, BCBS, Cigna, Health Plus, Medicare, Tricare, UnitedHealthcare, VSP (133x110, /insurance) | Keep as-is and never regenerate. On friscoeyesource, AI "carrier logos" shipped with a misspelled wordmark. |
| payment-logo | 5 | CareCredit, plus cash / check / Mastercard / Visa (51x32) | Keep as-is. |
| third-party-tool-logo | 1 | EyeGlass Guide 2.0 logo | Keep as-is. |
| functional-qr-code | 1 | `f9065bbb-GqNeiKv4….png` (250x250) on /order-contacts-online, under "Scan the QR Code Below" | Keep **lossless**: no lossy re-encode and no downscale, or it stops scanning. |
| educational-diagram | 9 | Eye anatomy, cataract, glaucoma (x2), macular degeneration, UV, anti-reflective, eye chart, cataracts icon. Some carry baked labels and a third-party watermark (EyeGlassGuide.com). | Keep as-is on a white chip. Never put them under glass blur or a tint. |
| page-header-background | 9 | Beaver Builder header backgrounds for /eye-care-services, /eyeglasses-contacts (+ /contact-lenses), /eyeglasses-contacts/eyeglasses, /designer-frames (+ mobile), /hours-location, /insurance, /our-eye-doctors (+ mobile) | Keep as content, but see 1c: most have a **baked dark overlay**. Generated `scene-*` images supply the bright hero backdrops. |
| service-page-image | 25 | 18 service-page banners (1280x480 / 1024x384) plus inline images on service and product pages | Keep. The banners become framed content images, not full-bleed heroes. |
| section-index-tile | 30 | `Thumbnail-*` cards (325x217, 300x200, 250x167) on section index pages | Keep as card images at 325 css px or less. |
| blog-article-image | 122 | Article images and clipart (widest is 1280 px; 61 are 500 px or narrower) | Keep inline at source size. No article image reaches 1600 px, so none goes full-bleed. |
| key-page-stock-photo | 2 | `Emerg-Eye` (/hours-location, /our-eye-doctors) and `Optician-Holding-Glasses` (/hours-location), both 640x427 | Keep. |
| platform-404-illustration | 1 | `404.png` on /404-page-not-found | Keep on the 404 page. |
| **platform-ui-drop** | **22** | Font Awesome SVGs (8), spinner, Gravity Forms credit-card and chosen sprites (4), EyeCarePro theme badges (new-black/orange/blue, ribbon, tag), snowflake overlays (3), EyeCarePro vendor logo | **Drop** along with the platform. |
| broken-soft-404 | 1 | `57a2e231-clipart-010.jpg`: an HTML document, not an image | Stand-in `fill-clipart-010` (section 2) |

The class counts sum to 294. The inventory's own `role` field is kept alongside for reference; one known mislabel is
`Thumbnail-contacts-brands.jpg`, marked LOGO/BRAND, which is really a category tile with baked "CONTACT LENSES" text.

### 1b. Key images: source size vs redesign role

| Image | px | Where used | Verdict |
|---|---|---|---|
| Logo `666ec49d` | 317x221 JPEG | Header and footer on all pages | Small: keep at 160 css px or less for 2x-crisp. Opaque white field (see 1a). |
| Dr. Deana Clifton `23fe4783` | 225x397 | /our-eye-doctors, /team/dr-deana-clifton-od | **Too low-res for a large portrait.** At most about 225 css px wide (about 112 at 2x). No feature-size or protruding use. |
| Home hero `6a111a60` | 1280x853 | Homepage hero background | **Below 1600.** Use it framed, not full-bleed. |
| Home tiles `0d41af0c`, `291abc74`, `e0cfe7e9` | 640x427 | Homepage service tiles | Soft above about 320 css px card width at 2x |
| Home tile `81b71862`, promo `ea0df44c` | 1280x853 | Homepage | OK for cards |
| Brand ads (Kaenon, IZOD, Alan J, Converse) | about 250x300 | Homepage designer band | Keep the cards at 250 css px or less |
| Service banners (18) | 1280x480 / 1024x384 | Service pages | Below 1600: framed content image, not a hero |

### 1c. Page-header backgrounds: size and baked overlay (ffmpeg `signalstats`)

The hero bar is at least 1600 px wide. YMAX is the brightest pixel. Normal photos in this set reach 255 (home hero,
contact-in-water, girl_eye_exam2 and woman-clear-frames all read 255). A YMAX capped at 200 or below means a dark overlay
is baked into the pixels, which makes the image a poor fit for a bright glass hero.

| File | px | Page | Width 1600+ | YMAX | Notes |
|---|---|---|---|---:|---|
| `6a111a60-Girl-Smiling-Brown-Hair` | 1280x853 | / | **no** | 255 | Homepage hero |
| `9271b8ff-Glasses-hero-1` | 2000x578 | /eyeglasses-contacts/eyeglasses | yes | 200 | Overlay (viewed) |
| `b98910e8-Glasses-Contacts-hero` | 2000x578 | /eyeglasses-contacts, /eyeglasses-contacts/contact-lenses | yes | 199 | Overlay inferred from YMAX (not viewed) |
| `e73b67d5-new-services-hero-2b` | 1600x534 | /eye-care-services | exactly 1600 | 231 | Baked grey edge fades (viewed) |
| `57b0091d-Insurance-Family-3` | 1600x584 | /insurance | exactly 1600 | 155 | Overlay (viewed) |
| `29a1ce9d-Docs-Adult-header-1` | 2000x415 | /our-eye-doctors | yes | 255 | Stock patient at a slit lamp; **not Dr. Clifton**; very short (4.8:1) |
| `5b34873c-Designer-Frame-3a` | 1500x661 | /designer-frames | **no** | 139 | Heavy overlay (viewed) |
| `df345d8a-Frames-Chanel-Pink-sm` | 1280x480 | /designer-frames | **no** | 196 | Brand-named: keep as-is |
| `69e5a18d-highway-location-page` | 1280x607 | /hours-location | **no** | 162 | Overlay (viewed); a generic road, not the practice |
| `cffb21c7-Glasses-On-Eye-Sight-Test-Chart-MOBILE-1` | 350x229 | /our-eye-doctors (mobile) | **no** | 255 | Mobile variant only |
| `d5d8ab84-Designer-Page-Hero-Girl-mobile` | 400x277 | /designer-frames (mobile) | **no** | 255 | Mobile variant only |

## 2. Broken images (26)

A strict parse of every `<img src>` and `og:image` / `twitter:image` on each page found three kinds of breakage. The
positive control is that the parser reports the 6 real breaks as `<img>`.

### 2a. Visible `<img>` broken on the live site (6)

| Source (short) | Page | Source alt | Recommendation |
|---|---|---|---|
| cloudfront `…/2017/11/Female20Sunglasses20Outdoors20Winter…jpeg` (404) | /women-and-diabetes-world-diabetes-day-2017 | none | **Decorative stand-in** `fill-winter-sunglasses` (reuses `cut-sunglasses`, alt ""). Its `og:image` also points at the dead URL: fall back to the site default share image. |
| cloudfront `…/xAfrican-Woman-Trying-on-Glasses-1280x853-300x200…jpg` (404) | /eyeglasses-contacts/eyeglasses/eyeglass-basics/womens-eyeglass-frames | "Woman Trying on Glasses" | **Stand-in** `svc-eyewear-boutique` (generic model). The source alt still describes it truthfully, so keep the alt **only if** the reviewed image shows exactly that; otherwise use alt "" and record the alt removal. The stand-in does not try to match the ethnicity in the source filename; the alt never stated one. |
| `/clipart/holidays/thanksgiving - basket slide.jpg` (404) | /october-is | none | **DROP.** It is a holiday (event) image on an October awareness post, so a stand-in would depict an event. The live page already shows it broken. Record a REMOVE row. |
| `/clipart/people/clipart-048.jpg` (404) | /refocus-on-the-digital-age-with-computer-glasses | none | **Decorative stand-in** `fill-computer-glasses` (reuses `cut-eyeglasses`, alt ""). The downloaded `/clipart/eyes/clipart-048.jpg` is in a different folder and is **not** the same image, so don't substitute it. |
| `/clipart/people/senior_man_in_thought2.jpg` (404) | /treating-vision-problems-lowers-risk-of-falling-in-seniors | "senior man in thought2" (filename-derived) | **Decorative stand-in** `fill-senior-thought` (reuses `cut-eyeglasses`, alt ""). No generated person on an article about seniors' falls. Record the alt removal. `senior_man_in_thought.jpg` (no "2") is a different file. |
| `/why-do-we-need-glasses/clipart/instruments/clipart-010.jpg` (soft-404: the server returns HTML) | /why-do-we-need-glasses | "clipart 010" (filename-derived) | **Decorative stand-in** `fill-clipart-010` (reuses `cut-phoropter`, alt ""). Record the alt removal. This one is not in `failures.json`; the inventory flags it UNRECOGNISED-FORMAT. |

### 2b. Dead `og:image` / `twitter:image` meta only; the visible image is fine (19)

On each of these pages the visible `<img>` loads the **same `/clipart/…` path from the platform CDN**
(`d3dhq28juvmj53.cloudfront.net` or `static.ecpbuilder.com`), and that twin **was downloaded**. Only the share-meta path
on the practice's own domain 404s. **Recommendation: keep the visible image (the downloaded twin) and point `og:image` /
`twitter:image` at the rebuilt copy of that twin.** No drop and no stand-in. Byte identity between the dead path and the
twin is unverified (the dead path can't be fetched), but the twin is exactly what visitors saw.

| `/clipart/…` path | Page | Twin on disk |
|---|---|---|
| eyes/blue eye between fingers.jpg | /cutting-edge-eye-dentification-2016 | `dd33adb8` 500x288 |
| eyes/clipart-042.jpg | /1-eye-allergies-2016 | `6835f5f6` 150x224 |
| eyes/clipart-048.jpg | /innovations-in-color-blindness-2016 | `899e513f` 224x150 |
| glasses_and_contacts/glasses5.jpg | /how-uv-damages-your-eyes-2016 | `f23a1231` 500x335 |
| glasses_and_contacts/glassesondogs.JPG | /how-to-find-the-right-pair-of-glasses-for-your-child-2016 | `d400ef9d` 300x200 |
| glasses_and_contacts/puttingincontact.JPG | /how-contact-lenses-can-be-a-danger-to-your-eyes-2016 | `4a49935c` 300x200 |
| nature_images/cactus2.jpg | /dry-eye-syndrome-causes-and-cures-2016 | `8cc7c82e` 300x225 |
| people/IMG_1631.jpg | /poolside-eye-safety-2016 | `406666c6` 300x225 |
| people/boy in front of eye chart.jpg | /when-20-20-vision-isnt-enough-for-your-child-2016 | `6f71fccc` 300x461 |
| people/clipart-032.jpg | /what-is-a-stye-anyway-2016 | `f177986d` 224x150 |
| people/dad-riding-bike-with-daughter.jpg | /prevent-age-related-macular-degeneration-2016 | `99aaf89d` 300x400 |
| people/father and son shaking hands.png | /cataract-awareness-month-2016-2 | `ab1ce6c4` 400x322 |
| people/girl-beside-balcony.jpg | /sunwear-for-a-bright-future-2016 | `56270914` 500x375 |
| people/girl-in-funny-glasses.jpg | /10-tips-to-teach-children-about-eye-safety-2016 | `4572beaf` 500x375 |
| people/jamie_in_the_fall.JPG | /fall-eye-allergies-2016 | `14d00756` 300x400 |
| people/man_in_glasses2.jpg | /an-active-and-eye-safe-lifestyle-2016 | `fc6d5c93` 500x335 |
| people/mom and dad with child in pink.png | /holiday-season-shopping-2016 | `92ccfc9b` 400x301 |
| people/senior couple in orange and white.png | /bifocal-and-multifocal-contact-lenses-2016 | `4c87f0cd` 284x350 |
| people/woman with laptop.jpg | /workplace-eye-wellness-the-dangers-of-blue-light-2016 | `ab5c58e6` 500x334 |

`jamie_in_the_fall.JPG` **names a child** and looks like a personal photo, not stock (viewed). It stays as the source
published it. It must never get a generated stand-in: if the twin is ever removed, the answer is DROP.

### 2c. Platform CSS background (1)

| Source | Where | Recommendation |
|---|---|---|
| `eyecarepro.net/…/ECP/images/review-quote.png` (403) | EyeCarePro theme `public.css` | **DROP** with the platform chrome. The redesign draws its own quote glyph in CSS/SVG. Record it as a platform removal. |

### 2d. Change-control rows to record (not written by this task)

- REMOVE: `<img>` thanksgiving basket on /october-is. It is a holiday/event image, 404 on the live site, and a stand-in would depict an event.
- REMOVE (alt text only): "senior man in thought2" and "clipart 010". Both are filename-derived alts on images that never displayed (404 / soft-404); their decorative stand-ins take alt "".
- REMOVE (platform): review-quote.png CSS background.
- Possibly REMOVE (alt only): "Woman Trying on Glasses", if the reviewed `svc-eyewear-boutique` image does not show exactly that.

## 3. fal generation plan (`src/content/image-plan.json`)

Defaults: `fal-ai/flux-pro/v1.1-ultra`, `output_format: jpeg` (cut-outs are generated as PNG), and the safety checker
on. Cut-outs go through `fal-ai/birefnet/v2` (General Use (Heavy), 2048x2048, png). The style suffix appended to every
non-edit prompt is: bright natural daylight, clean fresh healthcare editorial photography, soft olive green #759b2a and
fresh leaf green #94bc4a accents, shallow depth of field, photorealistic, no text / lettering / numbers / logos / labels
/ watermark / brand marks. Cut-out prompts add "entire object in crisp sharp focus" to offset the depth-of-field term.
**Watch item:** if a hex string ever renders as visible text, drop the hex codes from the suffix.

### 3a. Generated images (16)

| id | role | ratio | cutout | Text-prone (zoom review) | Main use |
|---|---|---|---|---|---|
| scene-exam-room | scene-backdrop | 21:9 | | | Full-bleed homepage hero backdrop the glass headline panel blurs over. /eye-care-services and /eye-exams headers. |
| scene-optical-boutique | scene-backdrop | 21:9 | | **yes** (shelf frames) | /eyeglasses-contacts and /eyeglasses headers; the homepage designer band backdrop |
| scene-greenery-window | scene-backdrop | 16:9 | | | Generic interior pages, blog, footer glass |
| cut-eyeglasses | depth-cutout | 4:3 | yes | **yes** (temples, bridge, lenses) | Breaks out of the homepage hero frame; eyeglasses pages; 2 slot-fills |
| cut-sunglasses | depth-cutout | 4:3 | yes | **yes** (lens corners, hinges) | Sunglasses pages; UV articles; 1 slot-fill |
| cut-kids-glasses | depth-cutout | 4:3 | yes | **yes** (temples) | Pediatric service card; kids-optical |
| cut-contact-lens | depth-cutout | 3:4 | yes | anatomy | Contact Lens Services card (the hand rises from inside the card); contact lens pages |
| cut-phoropter | depth-cutout | 1:1 | yes | **HIGH** (dials, plates) | Comprehensive Eye Exams card; exam pages; 1 slot-fill |
| cut-olive-sprig | depth-cutout | 9:16 | yes | | Brand-green accent crossing section boundaries (alt "") |
| cut-lens-prism | depth-cutout | 1:1 | yes | | Floating layer over glass edges (alt ""). This is a glass cut-out, so white stays baked into its interior: use it only over light surfaces or with `multiply`. |
| svc-eye-exam | section | 4:3 | | **yes** (phoropter dials) | /eye-care-services/eye-exams |
| svc-contact-lens | section | 4:3 | | **yes** (lens-case L/R letters) + anatomy | /eye-care-services/contact-lens-exams, /eyeglasses-contacts/contact-lenses |
| svc-pediatric-exam | section | 4:3 | | **yes** (trial-frame scales) | /eye-care-services/eye-exams/pediatric-eye-exams, kids-optical |
| svc-dry-eye | section | 4:3 | | anatomy | /eye-care-services/eye-conditions/dry-eye-disease-and-treatment |
| svc-eyewear-boutique | section | 4:3 | | **yes** (temples, shelf frames) | /eyeglasses-contacts/eyeglasses; also the stand-in for "Woman Trying on Glasses" |
| tex-frosted-glass | texture | 16:9 | | | Low-opacity fill inside glass panels; the solid fallback under `@supports not (backdrop-filter)` |

In the people images, the clinician is only a white-coat sleeve and hands, and patients are "illustrative models". None
is implied to be Dr. Clifton, staff or a patient.

### 3b. Slot-fills (reuse a generated image; no fal call)

| Entry | Reuses | Fills | alt |
|---|---|---|---|
| fill-winter-sunglasses | cut-sunglasses | Female20Sunglasses… (404) | "" |
| fill-computer-glasses | cut-eyeglasses | /clipart/people/clipart-048.jpg (404) | "" |
| fill-senior-thought | cut-eyeglasses | /clipart/people/senior_man_in_thought2.jpg (404) | "" |
| fill-clipart-010 | cut-phoropter | /why-do-we-need-glasses/clipart/instruments/clipart-010.jpg (soft-404) | "" |
| (fillFor on `svc-eyewear-boutique`) | itself | xAfrican-Woman-Trying-on-Glasses… (404) | "Woman trying on glasses" |

Each `fillFor` is the inventory's exact `src` string, so a build that keys an image map on inventory `src` (as the
friscoeyesource build does) picks them up.

### 3c. Placement rules for generated images

- Never beside, or captioned with, a frame-brand, contact-lens-brand or carrier name (the friscoeyesource homepage captioned an AI portrait "Prada").
- Never beside "Ask Dr. Deana Clifton a Question" or any Dr. Clifton copy.
- The `scene-*` backdrops stay heavily blurred behind glass, read as ambience and are never captioned. Keep them away from address / "our office" copy (/hours-location uses `scene-greenery-window`), so a generated room is never read as the practice's office.
- Protruding cut-outs need `overflow: visible` up to the section and must not cause horizontal scroll at 390 px (see DESIGN-BRIEF).

### 3d. Review and provenance protocol

1. Run with the key file outside the project: `node tools/fal-gen.mjs --plan src/content/image-plan.json --key-file <path outside the project>`. The tool refuses a key file inside the tree. Never write the key into any project file or doc.
2. Review every text-prone or anatomy-risk image as **zoomed native-size crops** of the object. An 800 px contact sheet hid pseudo-text on friscoeyesource. Check the `reviewFocus` field on each entry.
3. Fix pseudo-text with `fal-ai/flux-pro/kontext`: set `editFrom` to the rejected file and write an instruction that describes only the change ("Remove all printed text … keep everything else exactly the same"). The phoropter needed two passes last time. Rejected versions are archived by the tool, never deleted. Do not use `fal-ai/imagen4/preview` (404 on this key).
4. Contact lens: reject anything that reads as a glass dish, a bead, a cup or a droplet.
5. AI label: fal outputs carry C2PA only, and any WebP re-encode drops it (Windows `cwebp` copies ICC only). After encoding, attach an IPTC `trainedAlgorithmicMedia` XMP packet with `webpmux`, then confirm with `grep -a -c trainedAlgorithmicMedia` on every shipped generated file. Also list every generated image in the handoff docs.

## 4. Evidence and limits

- **Classification:** a rule-based classifier over the 294 files, with 5 unmatched files assigned by hand and 2 rule misfits corrected. It writes `audit/image-classification.json` (294 unique files; 36 carry a low-res flag). The 19 viewed images confirmed the logo, the doctor photo, the hero, the tiles, an avatar, a brand ad, a carrier logo, a diagram, a tile, and the header backgrounds.
- **Broken-image split:** a script parses `<img src>` and share-meta per page. Positive control: it reports the 6 real breaks as `<img>`. An earlier substring search had wrongly counted the CDN twins as broken `<img>`, and this strict parse corrected that.
- **Plan checks:** a validator checked ids and prefixes, the counts (16 generated, 20 entries), aspect ratios, cutout/png pairing, decorative alt "", prompts naming the practice, reuse targets, and that each `fillFor` is an exact inventory `src` of a broken image. Result: 0 errors. On a mutated copy with 5 injected faults it fired on all 5, plus the entry count.
- **Tool compatibility:** `tools/fal-gen.mjs --dry`, run from a scratch copy so nothing is created in the project, listed all 16 generated entries with the right model and skipped the 4 reuse entries. It made no network call, because the `--dry` branch continues before the fal request.
- **Unverified:**
  - whether the testimonial avatars show the reviewers;
  - the overlay on `Glasses-Contacts-hero`, which is inferred from YMAX and was not viewed;
  - byte identity of the 19 `og:image` paths with their CDN twins;
  - the output pixel sizes of fal ultra (recorded in `audit/generated-images.json` after generation);
  - everything about image quality, which can only be checked after generation.
