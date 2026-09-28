# Site architecture: https://www.cliftoneyecenter.com/

Built 2026-09-28 from the harvest on disk only (no request to the live site): `audit/raw/*.html` (349 files),
`audit/content-inventory.json`, `site-inventory.json`, `seo-inventory.json`, `architecture.json`, `link-graph.json`,
`image-inventory.json`, `failures.json`, plus the live screenshots in `tmp/shots/`. Every count below was produced by a
script run over those files (the scripts and their JSON outputs are in `tmp/port-census/`; the marker regexes are
listed in `docs/PORT-NOTES.md` Appendix A). The machine-readable companion is `src/content/site-map.json` (menus, 15 template families
that partition all 349 pages, artefact decisions).

## 1. At a glance

| | |
|---|---|
| HTML pages crawled | **349** of 356 URLs fetched. The other 7 are live 404s (see section 10) |
| Discovery | sitemap (370 URLs) plus a link crawl. robots.txt disallows only `/wp-admin/`, `/wp-login.php`, trackback and comments paths |
| Redirect aliases folded by the crawl | 7 old URLs that 301 to 6 pages (section 10) |
| Platform | WordPress, EyeCarePro "Flex" theme (`ecp-*` markup, `data-subdomain="https://cliftoneyecenter2.ecpbuilder.com"`), Beaver Builder 2.8.6 (`fl-*`) on 14 page layouts and 3 global-template posts, Gravity Forms (2 forms), Splide carousels, WOW.js entrance animations, GTM `GTM-P6GSK34` |
| Brand accent the theme declares | `data-theme-accent-color="#759b2a"` on `<body>` (349/349) |
| Fonts | Arial/Helvetica system stack. The only webfont harvested is the `EyeCarePro-Icons` icon font (4 files), which must not ship |
| Chrome | Header top bar, primary menu, both footer menus and the utility links carry **identical labels and hrefs on 346 pages** (1 variant each; checked by script). The 3 `/template/*` pages have no chrome of their own, because they *are* the chrome |
| URL depth | 0:1 · 1:166 · 2:29 · 3:40 · 4:87 · 5:26 |

## 2. Page counts by URL section

| Section | Pages | Notes |
|---|---|---|
| `/` | 1 | Beaver Builder home |
| `/<post-slug>/`: root-level blog posts | 151 | `body.single-post`. Breadcrumb is Home » What's New » title |
| `/<page>/`: root-level pages that are not posts | 15 | `/eye-care-services/` `/eyeglasses-contacts/` `/insurance/` `/contact-us/` `/hours-location/` `/our-eye-doctors/` `/whats-new/` `/order-contacts-online/` `/promotions/` `/the-staff/` `/disclaimer/` `/privacy-policy/` `/return-policies/` `/website-accessibility-policy/` `/404-page-not-found/` |
| `/eye-care-services/*` | 118 (+1 hub counted above = 119) | 17 practice service pages below the hub, plus 101 in the `your-eye-health/` library |
| of which `/eye-care-services/your-eye-health/**` | 101 | eye-exams 24 · eye-conditions-info 23 · eye-diseases 18 · vision-surgery 9 · childrens-vision 6 · vision-over-40 6 · computer-eyestrain 5 · vision-over-60 4 · index 1 · contact-lens-basics 1 · glossary 1 · healthy-sight 1 · how-the-eye-works 1 · protecting-your-eyes 1 |
| of which practice service pages | 17 | management-of-ocular-diseases 5 · eye-conditions 4 · eye-exams 4 · contact-lens-exams 2 · eye-emergencies-pinkred-eyes 1 · lasik-refractive-surgery-co-management 1 |
| `/eyeglasses-contacts/*` | 44 (+1 hub above = 45) | contact-lenses 8 · eyeglasses 1 + prescription-eyeglasses 7 · specialty-eyewear 6 · sunglasses 6 · transitions-lenses 5 · eyeglass-basics 4 · lens-treatments 4 · designer-frames 1 · eyeglass-guide 1 · kids-optical 1 |
| `/insurance/*` | 3 (+1 hub) | carecredit, faqs-of-vision-insurance-plans, whats-in-your-vision-insurance-plan |
| `/contact-us/*` | 4 (+1 hub) | appointment-request-form, contact-form, patient-forms, testimonials |
| `/team/*` | 1 | dr-deana-clifton-od (post type `team`) |
| `/location/*` | 1 | clifton-eye-center (post type `location`) |
| `/testimonial/*` | 3 | 4726-2, 4728-2, 4730-2 (post type `testimonial`) |
| `/category/*` | 2 | our-doctors, uncategorized |
| `/tag/*` | 3 | all-about-vision, eye-emergencies, gsp-eye-emergencies |
| `/template/*` | 3 | header, footer, inner-header (Beaver Builder global templates) |
| **Total** | **349** | |

## 3. Template families

These 15 families partition the site, with every page in exactly one family. The check was a node one-liner over
`src/content/site-map.json` against `content-inventory.json`: 349 crawled, 349 placed, 0 missing, 0 duplicated. A
mutated copy (one page removed, one page doubled) was caught, so the check can fire. `noindex` below means the
page's second robots meta (section 9).

| Family | Pages | Rule | Examples | noindex in source |
|---|---|---|---|---|
| home | 1 | `/` | `/` | 0 |
| service-hub | 5 | `/eye-care-services/` plus any `/eye-care-services/*` outside the library that has child pages | `/eye-care-services/`, `/eye-care-services/eye-exams/`, `/eye-care-services/management-of-ocular-diseases/` | 0 (3 say `index,follow`) |
| service-detail | 13 | other `/eye-care-services/*` outside the library | `/eye-care-services/eye-exams/pediatric-eye-exams/`, `/eye-care-services/eye-emergencies-pinkred-eyes/`, `/eye-care-services/lasik-refractive-surgery-co-management/` | 1 |
| library-article | 101 | `/eye-care-services/your-eye-health/**` (syndicated patient-education library; 13 of them are section indexes) | `/eye-care-services/your-eye-health/eye-conditions-info/glaucoma/`, `/eye-care-services/your-eye-health/eye-exams/common-tests/autorefractor/`, `/eye-care-services/your-eye-health/vision-surgery/lasik/` | **101** |
| eyewear-contacts | 47 | `/eyeglasses-contacts/**` plus `/order-contacts-online/` and `/promotions/` | `/eyeglasses-contacts/eyeglasses/designer-frames/`, `/eyeglasses-contacts/contact-lenses/toric-contact-lenses-for-astigmatism/`, `/order-contacts-online/` | 20 |
| insurance | 4 | `/insurance/**` | `/insurance/`, `/insurance/carecredit/` | 0 |
| contact-forms | 6 | `/contact-us/**` except testimonials, plus `/hours-location/` and `/location/*` | `/contact-us/appointment-request-form/`, `/contact-us/contact-form/`, `/hours-location/` | 0 |
| blog-index | 1 | `/whats-new/` | `/whats-new/` | 0 |
| blog-post | 151 | `body.single-post` | `/10-steps-to-prevent-vision-loss/`, `/hydrogen-peroxide-contact-lens-solution-2019/`, `/welcome-to-our-new-website/` | 86 |
| doctor-team | 2 | `/our-eye-doctors/`, `/team/*` | `/our-eye-doctors/`, `/team/dr-deana-clifton-od/` | 0 |
| staff | 1 | `/the-staff/` | `/the-staff/` | 0 |
| testimonials | 4 | `/contact-us/testimonials/`, `/testimonial/*` | `/contact-us/testimonials/`, `/testimonial/4728-2/` | 0 |
| legal | 4 | disclaimer, privacy-policy, return-policies, website-accessibility-policy | `/disclaimer/`, `/website-accessibility-policy/` | 0 |
| archive | 5 | `/category/*`, `/tag/*` | `/category/uncategorized/`, `/tag/all-about-vision/` | 5 |
| platform-artefact | 4 | `/template/*`, `/404-page-not-found/` | `/template/header/`, `/404-page-not-found/` | 4 |

## 4. Navigation (from the raw header and footer of `audit/raw/index.html`)

### 4.1 Top bar (desktop row `fl-node-5ded97ace91eb`; hidden on phones)

1. Map-pin icon plus **"We're in Bossier City, 1000 Chinaberry Drive, Suite 302, Louisiana, 71111."**, which is
   `<strong class="ecp-heading-tag"><a class="ecp-callout-title-text" href="/eye-care-services/">`. The address
   links to the services hub (sic). It is not a heading element.
2. **"Make an Appointment"**, which is `<span class="ecp-button" href="">`. It looks like a button but links nowhere.
3. **"Call Us: 318-550-5815"**, which is `<a class="ecp-button" href="tel: 318-550-5815">` (note the space after `tel:`).

Phones show a separate mobile header row (`fl-visible-mobile`): the logo plus two icon buttons, "Make an
appointment" → `/contact-us/appointment-request-form/` and "Call" → `tel:318-550-5815`, plus a hamburger
(`ecp-menu-hamburger-content`, with a trailing focus-trap link "Return to top of menu").

There is no announcement bar (0 files; the Frisco source had one on 287).

### 4.2 Primary menu (`<nav class="menu- 2 ecp-menu ecp-menu-orientation-horizontal ecp-menu-depth-all">`)

Logo `clifton_eye_center_medium-e1478229278850.jpg` (alt "Clifton Eye Center logo") → `/`, then:

| # | Label | href (source) | Dropdown children |
|---|---|---|---|
| 1 | Hours & Location | `https://www.cliftoneyecenter.com/hours-location/` | none |
| 2 | Our Eye Doctor | `https://www.cliftoneyecenter.com/our-eye-doctors/` | none |
| 3 | Eye Care Services | `https://www.cliftoneyecenter.com/eye-care-services/` | none |
| 4 | Eyeglasses & Contacts | `https://www.cliftoneyecenter.com/eyeglasses-contacts/` | none |
| 5 | Insurance | `https://www.cliftoneyecenter.com/insurance/` | none |

**The menu is flat.** `class="sub-menu"` occurs 0 times in the header of all 346 chrome-bearing pages; the Frisco
source had 12 per page. The same 5 items are printed 4 times per page: the desktop menu, its hamburger copy, the
mobile-row menu and its hamburger copy. Sub-page discovery on the live site relies on breadcrumbs, `ecp-childpages`
listings and sidebar badges (section 6). If the redesign adds dropdowns, that is a new UX feature and must be
recorded as such. It is not "the source's menu".

### 4.3 Quick actions (badges `ecp-badges`: in the sidebar of 337 pages, and inside main on the 9 no-sidebar builder pages, including home row 1)

| Label | href | target |
|---|---|---|
| Email Us | `/contact-us/contact-form/` | same tab |
| Schedule An Appointment | `/contact-us/appointment-request-form/` | `_blank` |
| Patient Forms | `/contact-us/patient-forms/` | same tab |
| Order Contacts Online | `/order-contacts-online/` | `_blank` |

### 4.4 Footer (`footer.ecp-footer`, green band, same on 346 pages)

| Block | Items (label → href) |
|---|---|
| "Important Links" (div heading; `nav.menu- 3`) | Home → `/` · Contact Us → `/contact-us/` · What's New → `/whats-new/` · Disclaimer → `/disclaimer/` · Privacy Policy → `/privacy-policy/` · Return Policies → `/return-policies/` |
| "Quick Links" (div heading; `nav.menu- 2`, the primary menu again) | Hours & Location · Our Eye Doctor · Eye Care Services · Eyeglasses & Contacts · Insurance (same hrefs as 4.2) |
| Voice search | bold "Ask Here, Voice Search"; `<form id="voice_search" action="/?s=">` with visually-hidden label "Speak Field", placeholder "Search the site" (347 files) |
| Social | one icon link: "Visit us on facebook" → `https://www.facebook.com/Clifton-Eye-Center-154894561271074/?ref=bookmarks` |
| NAP line | "**Clifton Eye Center** - Located at 1000 Chinaberry Drive, Suite 302, Bossier City, LA 71111 Phone: 318-550-5815 (tel link)", wrapped in `itemtype="http://data-vocabulary.org/MedicalClinic"` with `latitude 42.859280` / `longitude -73.820210`. **Those coordinates are not Bossier City** (they point to upstate New York). Do not reuse them as geo data |
| Global footer (`ecp-global-footer`) | "© 2026 Powered by" plus the EyeCarePro logo → eyecarepro.com (vendor credit, REMOVE) · Accessibility → `/website-accessibility-policy/` · Sitemap → `/sitemap/` (**404 on the live site**, linked from 346 pages) · Privacy → `/privacy-policy/` · Disclaimer → `/disclaimer/` · Login → `https://cliftoneyecenter2.ecpbuilder.com/wp-admin` (REMOVE) |

## 5. Homepage section order (`audit/raw/index.html`, 9 Beaver Builder rows in `<main>`)

The homepage has 2 `h1` elements ("Welcome to…" and "What's New!"). Several visual headings are
`<div class="ecp-heading">`, not h-tags, so a generic sanitiser turns them into paragraphs.

| # | Row `data-node` | Shown at | Headings (element) | Contents |
|---|---|---|---|---|
| 0 | `5ded9754972ce` | all | "Your Community" / "Eye Care Clinic" / "We Know You!" (3 × div.ecp-heading, WOW fadeInDownBig / bounceInLeft / fadeInUpBig) | Full-bleed row **background** photo `Girl-Smiling-Brown-Hair-1280x853.jpg` (`data-background-image-src`, not an `<img>`) |
| 1 | `5ded9754977e9` | all | none | Quick-action tiles × 4 (section 4.3). In the live render they overlap the hero's bottom edge |
| 2 | `5ded975497569` | all | **h1** "Welcome to Clifton Eye Center in Bossier City, Louisiana" (WOW bounceInDown) | none |
| 3 | `5df6091f63e9d` | all | left: h4 promo line, **h1** "What's New!"; right: h3 "Our Product Offerings:" | Left column: promo image `contact-in-water.jpg` + h4 "FREE Shipping Option on Select Annual and Semi-Annual Supply Promotions" + a paragraph linking `/promotions/`, then a latest-posts list with **1** post (h3 title link, date "Nov 26, 2019", excerpt, "Read More"). Right column: welcome copy (4 p), a 3-item services list, h3, a 3-item products list, and a closing link "Contact our eye care clinic" → `/contact-us` |
| 4 | `5ded97549790b` | all | div.ecp-heading "Our Most Popular Services" (linked to `/eye-care-services/`, `_blank`) | Services tiles × 4 (`ecp-gallery`, photo + h2 overlay caption): UNIQUE OPTICAL → `/eyeglasses-contacts/eyeglasses/designer-frames/` · CONTACT LENS SERVICES → `/eyeglasses-contacts/contact-lenses/` · COMPREHENSIVE EYE EXAMS → `/eye-care-services/eye-exams/` · PEDIATRIC EYE CARE → `/eye-care-services/pediatric-eye-exams/` (an alias, section 10) |
| 5 | `5ded975498007` | **desktop/tablet only** | div.ecp-heading "#HappyPatients" | Image carousel (Splide autoplay, 3 PNGs: smile-girl-cowboy-hat, smile-woman-plant, simle-couple-1) + **testimonial carousel** (3 reviews, 5 full stars each, excerpts end in "...", attributions "- Andrea H.", "- Heather T.", "- Jessica H.") + button "Read More Reviews" → a google.com/search reviews query |
| 6 | `5ded975497aee` | **desktop/tablet only** | div.ecp-heading "#HeretoHelp"; **h2** "Ask Dr. Deana Clifton a Question..." | An EMPTY team-list module (renders nothing) + **Ask-the-doctor accordion** × 3 (Q&A about dry eye; each answer ends "More about Dry Eyes..." → `/eye-care-services/dry-eye-disease-and-treatment/`, an alias). Answers sit in `<div class="ecp-accordion-content" hidden>`; the toggles are `<a href="#">` |
| 7 | `5ded9754987c6` | **desktop/tablet only** | p "Our Designer Optical" (a styled span, not a heading) | **Designer optical brand cards** × 4 (`ecp-callout` photo cards 250×300: Kaenon-Ad.jpg, IZOD-Ad.jpg, AlanJ_250x300.jpg, "Converse Ad.jpg"; captions KAENON / IZOD / ALAN J / CONVERSE), each → `/eyeglasses/designer-frames/` (an alias); WOW fadeInLeftBig with delays 0 / .5 / 1 / 1.5 s |
| 8 | `5ded975497d41` | all | "Clifton Eye Center" (location title link); **h3** "Is it an Emergency?" | 3 columns: **Google map** iframe · **NAP + hours** (name → `/location/clifton-eye-center/`, address, "Phone: 318-550-5815", Monday–Friday "8:30 AM - 4:30 PM", Saturday/Sunday "Closed") · **emergency** callout (WOW shake) + paragraph + tel button "318-550-5815" |

Rows 5–7 are hidden below the source's mobile breakpoint, so phone visitors never see the reviews, the Q&A or the
brands. Showing them at every width is a redesign improvement; record it as such.

## 6. Interior page anatomy

### 6.1 Common frame (337 pages carry the sidebar. The 12 without it: the home, 8 builder hubs and the 3 templates)

```
header chrome (section 4)
<main class="ecp-primary" id="content">            346 files
  div.ecp-breadcrumb.ecp-breadcrumb-auto            338 files  Home » ancestors » current (separator span " » ")
  article#post-N                                    345 files
    header.ecp-entry-header > h1.ecp-entry-title    337 files  (the page title. The header is EMPTY on 9 builder pages; the h1 is present but empty on the 3 testimonials)
    div.ecp-entry-content                           186 files  (pages)
      | div.ecp-posts-wrapper-post.ecp-view-complete 151 files  (posts: div.ecp-post-date "Mon D, YYYY" + div.ecp-post-content)
    div.ecp-childpages > ul > li.ecp-childpages-link  29 files, 169 items (title link + summary; 25 thumbnails on 4 pages)
</main>
div.ecp-secondary.ecp-widget-area[role=complementary]   337 files, OUTSIDE <main>
  1. search widget: form role=search → GET https://www.cliftoneyecenter.com/?s=  (label "Search:", button "Search")
  2. text widget: quick-action badges ×4 (vertical) + location widget: h2 "Clifton Eye Center" → /location/clifton-eye-center/,
     address, "Phone: 318-550-5815", Google map iframe (335 files), hours list (7 days)
  3. text widget: an empty h3, then h3 "Insurance Plans" + one paragraph (vision vs. health insurance)
footer chrome
```

- **Breadcrumbs**: present on 338 pages. They are absent on the home, the 7 builder hubs without a sidebar (`/eyeglasses-contacts/`,
  `/eyeglasses-contacts/eyeglasses/`, `/eyeglasses-contacts/contact-lenses/`, `/eyeglasses-contacts/eyeglasses/designer-frames/`,
  `/hours-location/`, `/insurance/`, `/our-eye-doctors/`) and on the 3 templates. Library pages have up to 6 segments
  (Home » Eye Care Services » Your Eye Health » Eye Exams » Common Tests » Autorefractor). Archives print a bare
  "Home »"; testimonials print "Home » »" because their title is empty.
- **Page title band**: the source has none. The h1 sits inline at the top of the content column. 9 builder pages
  have an empty entry header; 8 of them carry their h1 as a Beaver Builder `ecp-heading` h1 inside the layout (for example "EYE CARE SERVICES FOR YOU", "OUR EYE DOCTOR",
  "Our Eye Care Practice in Bossier City"); `/eyeglasses-contacts/eyeglasses/designer-frames/` has **no h1 at all**.
- **CTA bands**: the source has no template-level CTA band. The CTAs are (a) the sidebar badges on 337 pages, (b) 12
  `ecp-button`s inside main on 9 builder pages ("BOOK AN APPOINTMENT ONLINE TODAY!", "CLICK NOW & MAKE AN APPOINTMENT"
  ×2, "BOOK AN EYE EXAM TODAY!", "BOOK AN EXAM TODAY", "Schedule An Appointment", "Call 318-550-5815", "Give Us a Call
  318-550-5815", "318-550-5815", "Read More Reviews", "More Google Reviews", "Order Contacts Online" → meetmarlo.com),
  and (c) closing paragraphs inside the copy.
- **Related links / sub-nav**: `ecp-childpages` listings (29 hubs, 169 links) are the only sub-navigation. The
  primary menu has no dropdowns.
- **Beaver Builder layouts inside main**: 14 pages. 9 have no sidebar: `/`, `/eye-care-services/`, `/eyeglasses-contacts/`,
  `/eyeglasses-contacts/eyeglasses/`, `/eyeglasses-contacts/contact-lenses/`, `.../designer-frames/`, `/hours-location/`,
  `/insurance/`, `/our-eye-doctors/`. 5 keep the sidebar: `.../contact-lenses/disposable-contacts/`, `.../eyeglasses/eyeglass-basics/`,
  `.../eyeglasses/kids-optical/`, `.../eyeglasses/transitions-lenses/`, `/order-contacts-online/`. They carry
  `ecp-heading` div headings (13 on 5 pages), heading-accordions (3 pages), badges (9), photo callouts, WOW classes
  (4 pages) and row background photos (`data-background-image-src`, 12 on 9 files).

### 6.2 Per family

| Family | Anatomy beyond the common frame |
|---|---|
| service-hub (5) | `/eye-care-services/`: builder page, no sidebar; crumb; h1 "EYE CARE SERVICES FOR YOU"; h2 and h3 lead copy; CTA button; search module and badges in main; 7 child tiles **with thumbnails**. The other 4 hubs use the standard frame plus a child listing (contact-lens-exams 1, eye-conditions 3, eye-exams 3, management-of-ocular-diseases 4) |
| service-detail (13) | Standard frame. h2/h3 sections, typically one lead image (14 images on 13 pages). 4 end with the "Special thanks to the EyeGlass Guide" attribution (external link ecp.eyeglassguide.com) |
| library-article (101) | Standard frame, **all 101 noindex in the source**. 13 section indexes carry child listings (1–22 children each; eye-conditions-info 22, common-tests 13, your-eye-health 13). 25 carry the EyeGlass Guide attribution. Only 9 images across 101 pages. In-page anchor tables of contents (e.g. glaucoma: `#signs`, `#types`, `#diagnosis`) |
| eyewear-contacts (47) | 43 standard frame, 4 builder hubs without a sidebar (above), 9 builder layouts overall, 9 child listings, 77 images on 21 pages (the designer-frames brand-logo wall alone is 31 images from storage.googleapis.com). `/order-contacts-online/`: button → meetmarlo.com plus a QR-code image. `/promotions/`: manufacturer rebate blurbs + logos (Alcon, Bausch + Lomb, CooperVision, X-Cel) with external rebate links. 20 are noindex |
| insurance (4) | `/insurance/`: builder, no sidebar; h1; h2 "Vision Plans We Accept" (VSP logo), h2 "Medical Plans We Accept" (a row of 7 logos + names; the 8 plan logos are hosted on storage.googleapis.com); CTA button; badges; 3 child links. The 3 children use the standard frame (CareCredit has an external "apply" link) |
| contact-forms (6) | `/contact-us/`: contact callout (h2 "Contact Information"), location contact card, 4 child links. `/contact-us/appointment-request-form/` and `/contact-us/contact-form/`: one Gravity Form each inside main (section 7). `/contact-us/patient-forms/`: 2 PDF links on the platform CDN. `/hours-location/`: builder, no sidebar, no crumb; location modules (map, NAP, a "Forms of Payment" heading-accordion with 4 payment icons: cash, check, mastercard, visa), hours, badges, photo callout, h3 "Have An Eye Care Emergency?". `/location/clifton-eye-center/`: location post type with NAP, map, hours, payment |
| blog-index (1) | `/whats-new/`: **all 151 post summaries on one page** (h2 title link, date, excerpt, "Read More" metabar), with 0 pagination markers. Word count 8,856 |
| blog-post (151) | Standard frame, `ecp-view-complete`: date + content. 141 images on 141 posts (usually one right-floated picture: 62 from the clipart CDN `d3dhq28juvmj53.cloudfront.net`, 65 from the wp-uploads CDN `da4e1j5r7gw87.cloudfront.net`, 14 from elsewhere). 2 YouTube embeds. 86 noindex; 120 have no meta description |
| doctor-team (2) | `/our-eye-doctors/`: builder, no sidebar, no crumb; h1 "OUR EYE DOCTOR"; badges; team card (portrait `deana_GSP_UID_…png`, h2 "Dr. Deana Clifton, OD", "Read More" → `/team/dr-deana-clifton-od/`); tel button; emergency callout (h3 + photo + 3 p). `/team/dr-deana-clifton-od/`: crumb "Home » Our Doctors » …" (Our Doctors → `/our-eye-doctors/`), portrait, position line, 5 bio paragraphs |
| staff (1) | Two paragraphs plus an EMPTY team-list module. Orphan (0 inbound links) |
| testimonials (4) | `/contact-us/testimonials/`: 3 cards (5 star spans, `<p>` text, "- Name"). Each rating also carries a `display:none` `itemprop="ratingValue"` "5". The 3 `/testimonial/*` singles show the same card with an **empty h1 and empty `<title>`** |
| legal (4) | Plain copy. `/disclaimer/` names EyeCarePro in 6 sentences across 3 paragraphs. `/website-accessibility-policy/` is the only page with the practice email (`mailto:cliftoneyecenter@yahoo.com`) |
| archive (5) | Post-title link lists (uncategorized 10, all-about-vision 10, the two eye-emergencies tags 1 each). `/category/our-doctors/` is "Nothing Found" + a search form |
| platform-artefact (4) | Section 11 |

## 7. Forms inventory

| Page | Form | Purpose | Fields (label · type · required) | Posts to |
|---|---|---|---|---|
| `/contact-us/appointment-request-form/` | Gravity Forms `#gform_9` (legacy markup) | appointment request | intro "Please fill in the form below to setup an appointment." · **Reason for Appointment** textarea (optional; has a description) · **Preferred Date & Times** textarea **required** (has a description) · **Patient Type** radio New patient / Returning patient **required** (has a description) · **Name** First + Last **required** · **Phone** tel **required** · **Email** email **required** · **Best Time to be Reached for Confirmation** time (HH number, MM number, AM/PM select) **required** · **Comments** textarea · honeypot (`gform_validation_container`, label "Email") | `POST multipart/form-data` → `/contact-us/appointment-request-form/#gf_9`; submit "Submit"; 11 hidden GF inputs |
| `/contact-us/contact-form/` | Gravity Forms `#gform_10`; wrapper `style='display:none'` until GF JS runs | "Email Us" message | intro (emergency notice + invitation to comment) · **Your Name** First + Last · **Subject** text **required** · **Message** textarea · **Should we reply?** radio Yes, Email Me / Yes, Call Me / No **required** · **Email** email (has a description) · **Phone** tel (has a description) · honeypot (label "Phone") | `POST multipart/form-data` → `/contact-us/contact-form/#gf_10`; submit "Submit" |
| sidebar (337 pages) plus `ecp-search` modules in main on 5 pages | WordPress search, `role=search` | site search | Search: (visually hidden label) · text | `GET https://www.cliftoneyecenter.com/?s=` (342 forms on 341 pages) |
| footer (347 files) | `#voice_search` | voice/site search | "Speak Field" (hidden label) · text | `GET /?s=` |

Unlike the Frisco source, there is **no appointment widget in the sidebar**: Gravity Forms markup sits on 2 pages here
against 285 there. Required markers: 16 `gfield_required` and 8 `aria-required="true"` across the two forms. The
field descriptions (for example "Please let us know if you are a new or existing patient.") are source copy and go with the field.

## 8. Embeds

| Embed | Host / id | Pages | Where |
|---|---|---|---|
| Google Maps Embed API v1, keyed (`key=AIza…` belongs to the platform) with `q=place_id:ChIJn41mUbs0MYYRBw9ZpWeJ-YM` | `www.google.com/maps/embed/v1/place` | **338** pages, 338 iframes | 335 in the sidebar location widget; 3 in main: `/`, `/hours-location/`, `/location/clifton-eye-center/` |
| YouTube | `www.youtube.com/embed/9XayZ3skcdg?rel=0` | 1 | `/keeping-your-contact-lenses-clean/` (no `title` attribute) |
| YouTube | `www.youtube.com/embed/H45GYPAuTdg?rel=0` | 1 | `/this-halloween-be-wary-of-costume-contact-lenses/` (no `title`) |
| Google Tag Manager noscript iframe `GTM-P6GSK34` | googletagmanager.com | 349 | tracker, REMOVE |
| `<video>` | none | 0 | none |
| Splide carousels | none | home only (image carousel + testimonial carousel) | client-side JS widgets |

## 9. SEO surface (head)

- **Robots**: every page prints WordPress's `<meta name='robots' content='max-image-preview:large'>`, and 224 pages
  print a **second** robots meta: `noindex` 80, `noindex,nofollow` 132, `noindex nofollow` 2, `noindex nofollow,follow` 2,
  `noindex nofollow,nofollow` 1, `index,follow` 7. Crawlers apply the most restrictive directive, so **217 pages are
  noindex on the live site**. `seo-inventory.json` recorded only the first meta (`metaRobots` is
  `max-image-preview:large` on all 349), so do not read robots from it (see PORT-NOTES S-1).
- **Canonical**: self-referencing on 344 pages; missing on 5 (the 2 category and 3 tag archives). No page
  canonicalises to another page.
- **Description**: missing on 168 pages (120 blog posts, 12 library, 8 service-detail, and others).
- **Title**: empty `<title>` on 4 pages (`/category/our-doctors/` and the 3 testimonials). Archives borrow the first
  listed item's title. Titles are duplicated across distinct pages in 8 groups (e.g. "Eye Allergies" is both a 2016
  post and a library page).
- **JSON-LD**: `WebPage` + `Organization` (name, url, logo) on all 349 pages. There is no LocalBusiness/Optometric
  schema in the source.
- **Near-duplicate posts**: `/pink-stinging-eyes/` and `/pink-stinging-eyes-it-could-be-pink-eye/` share 99% of their
  words and both self-canonicalise; `/cataract-awareness-month-2016-2/` is a "-2" slug (noindex in the source).

## 10. Redirect aliases the crawl folded, and broken internal targets

Aliases (`site-inventory.json pages[].aliases`; each 301s on the live site):

| Old URL | Lands on | Linked from |
|---|---|---|
| `/your-eye-health/eye-conditions` | `/eye-care-services/eye-conditions/` | `/eye-care-services/your-eye-health/eye-diseases/` |
| `/eye-care-services/dry-eye-disease-and-treatment` | `/eye-care-services/eye-conditions/dry-eye-disease-and-treatment/` | home (3 accordion links) |
| `/eye-care-services/pediatric-eye-exams` | `/eye-care-services/eye-exams/pediatric-eye-exams/` | home (services tile) |
| `/your-eye-health/eye-diseases` | `/eye-care-services/your-eye-health/eye-diseases/` | `/eye-care-services/your-eye-health/eye-conditions-info/` |
| `/your-eye-health/protecting-your-eyes` | `/eye-care-services/your-eye-health/protecting-your-eyes/` | anti-reflective, uv-protection |
| `/eyeglasses/designer-frames` | `/eyeglasses-contacts/eyeglasses/designer-frames/` | home (4 brand cards) |
| `/eyeglasses-contacts/designer-frames` | `/eyeglasses-contacts/eyeglasses/designer-frames/` | `/eyeglasses-contacts/eyeglasses/sunglasses/` |

Live 404s (the 7 crawl failures) and who links to them:

| Target | Referrers | Remedy |
|---|---|---|
| `/sitemap/` | 346 (footer "Sitemap") | re-point to `/sitemap.xml` (Frisco precedent), or build an HTML sitemap page (open question) |
| `/your-eye-health/eye-diseases/cataracts` | cataract-surgery-co-management | content exists at `/eye-care-services/your-eye-health/eye-diseases/cataracts/`, so re-point and add a redirect |
| `/your-eye-health/eye-diseases/macular-degeneration` | treating-macular-degeneration | exists at `/eye-care-services/your-eye-health/eye-diseases/macular-degeneration/`, so re-point and redirect |
| `/your-eye-health/eye-diseases/cataracts/cataracts-video` | cataract-surgery-co-management | no such page anywhere; unwrap the link, keep its words |
| `/your-eye-health/protecting-your-eyes/protecting-your-eyes-from-glare` | anti-reflective | no page; unwrap |
| `/your-eye-health/protecting-your-eyes/protecting-your-eyes-from-uv-rays` | uv-protection | no page; unwrap |
| `/eyeglasses-contacts/prescription-eyeglasses/consider-a-second-pair-of-glasses` | prescription-sunglass-treatments | no page; unwrap |

## 11. Platform artefacts: recommendations

| Path | Recommendation | Reason |
|---|---|---|
| `/template/header/` | keep+noindex | Beaver Builder global-template post that renders the header as a page; orphan; chrome only; source already noindex. Keep the URL for parity; noindex,follow; leave out of sitemap.xml (Frisco precedent) |
| `/template/footer/` | keep+noindex | Same, for the footer |
| `/template/inner-header/` | keep+noindex | Same, for an alternate header (address + phone callouts, logo, menu). Frisco had no equivalent |
| `/404-page-not-found/` | keep+noindex | The 404 body (h1 "404", clipart, "The Diagnosis / The Treatment"). Also render it as `dist/404.html` |
| `/category/our-doctors/` | keep+noindex | Empty archive ("Nothing Found" + search form); empty title; no canonical; source `noindex nofollow`. The search form is removed and gets a ledger row |
| `/category/uncategorized/` | keep+noindex | Archive of 10 post links; borrowed title, so use its own h1 "Uncategorized"; no canonical; orphan |
| `/tag/all-about-vision/` | keep+noindex | Tag archive of library links; borrowed title; orphan |
| `/tag/eye-emergencies/` | keep+noindex | One link; the h1 is the raw slug; title duplicates the emergencies page; orphan |
| `/tag/gsp-eye-emergencies/` | keep+noindex | Same as above |
| `/testimonial/4726-2/`, `/4728-2/`, `/4730-2/` | keep+noindex | Real reviews (so not removed), but orphans with an empty h1 and title, duplicating `/contact-us/testimonials/` and the homepage. **The source does NOT noindex them**, so this is a change from the live indexing state and needs a ledger row, unless the owner prefers to keep them indexable. The hero heading must not be invented (open question) |
| `/the-staff/` (not an artefact; listed because it is orphaned) | keep | Real practice copy; source indexable; drop only the empty team module |
| `/location/clifton-eye-center/` | keep | Location post type with real NAP, hours and payment; linked from 338 location widgets |
| `/cataract-awareness-month-2016-2/` | keep+noindex | "-2" duplicate slug; the source already noindexes it |

## 12. Images (summary; details in `image-inventory.json`)

319 inventoried (294 on disk, 25 failed). Matched by exact resolved src, the 25 failures are: **5 content images**
(below); **19 `og:image`/`twitter:image`-only references** to `/clipart/…` on the own origin, which 404 (the same
file names are served from the `d3dhq28juvmj53.cloudfront.net/clipart/` CDN copy that the post bodies use); and 1
vendor CSS image (`review-quote.png`, 403). One "downloaded" file is an HTML soft-404, not an image. There are 291
`<img>` elements inside main: 285 resolve to a real image on disk and **6 have no usable file** (5 missing + 1 soft-404):
`xAfrican-Woman-Trying-on-Glasses…pagespeed…jpg` (womens-eyeglass-frames), `Female20Sunglasses…preview1.jpeg`
(women-and-diabetes-world-diabetes-day-2017), `thanksgiving - basket slide.jpg` (october-is), `clipart-048.jpg`
(refocus-on-the-digital-age-with-computer-glasses), `senior_man_in_thought2.jpg` (treating-vision-problems-…), and
`clipart-010.jpg` (why-do-we-need-glasses, saved file is an HTML soft-404). The site ships no favicon (0 `<link rel=icon>`).
