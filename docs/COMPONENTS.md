# Components: the markup contract (Clifton Eye Center, "Daylight Canopy")
Status: binding markup contract, 2026-09-28, for the pipeline (`src/build.mjs`, `src/lib/*.mjs`), the home composer (`src/lib/home.mjs`), the CSS author (`src/styles/*.css`) and the script author (`scripts/site.js`). Inputs read in full: `docs/DESIGN-SPEC.md` (winner **canopy**), `tmp/lab/canopy/index.html` + `lab.js`, `docs/SITE-ARCHITECTURE.md`, `docs/PORT-NOTES.md`, `docs/BUILD-DECISIONS.md`, `src/content/site-map.json`, `src/content/image-plan.json`, and the friscoeyesource reference `src/lib/templates.mjs`, `content.mjs`, `forms.mjs`, `build.mjs`.

Precedence: the HOME CONTRACT (section G, verbatim) > this file for **markup** (elements, classes, ARIA, hooks, order) > DESIGN-SPEC for **visual values** (sizes, colours, offsets, timings). Where this file departs from DESIGN-SPEC or the lab, section H says so and why. This file contains no CSS and no JS; where it names a behaviour, section 1 is the contract and `site.js` implements it.

## 0. Conventions
- `{name}` is a value filled by the build: source copy from `audit/raw` (unchanged), a `ctx`/`chrome` value, or a computed URL. `{up}` is the page-relative prefix for the page depth (`../` × depth; empty at depth 0).
- `?` after an element in a comment means optional: render it only when its source exists. `…` means repeat.
- **URLs are page-relative everywhere** (`ctx.localHref(href, depth)`); no root-relative `/…` in any attribute (one exception: `dist/404.html`, F.7). A `null` from `localHref` means a dead target: keep the words, drop the `<a>`. External links keep their source attributes and add `rel="noopener"` when they open a new tab.
- **Strings.** Visible text is source copy only. Allowed non-source strings are the accessibility labels in H.2 (all non-visible), the BUILD-DECISIONS #4 notice sentence, and the BUILD-DECISIONS #10 fallback "Open in Google Maps". Source UI strings used by the chrome (verified in `audit/raw` this run): "Skip to main content" (349 files), "Open Menu" and "Close Menu" (348), "Previous slide" and "Next slide" (index.html), "Visit us on facebook" (347), "Read&nbsp;More" plus `aria-label="Read more about '…'"` (blog lists).
- **Classes** are BEM: block, `block__element`, `block--modifier`. Lab names are kept wherever the lab has the component. State classes are `is-*`. Template classes on `<body>` are `t-*`. Glass surfaces always carry two classes: `glass` plus exactly one recipe, `glass--image` (A), `glass--light` (B), `glass--leaf` (C1), `glass--leaf-deep` (C2), or `glass--dark` (D). Build-time glass modifiers: `is-flat` (fallback fill at every width) and `is-solid` (fallback fill below 700px).
- **Icons.** One sprite per page, first child of `<body>`: `<svg class="sprite" aria-hidden="true" focusable="false" width="0" height="0"><defs>` + one `<symbol id="i-{name}" viewBox="0 0 24 24">` per icon `</defs></svg>`. Names: `pin cal phone mail form cart star chev arrow case fb menu close clock alert doc`. Paths for the first 14 are copied from `tmp/lab/canopy/index.html` lines 33-46 (`i-fb` = lab `i-fb`); `alert` and `doc` are new line icons in the same style. The lab's `#leaf`, `#sprig`, `i-ask`, `i-glasses`, `i-eye`, `i-lens`, `i-heart` are not shipped. `ctx.icon(name)` returns exactly `<svg class="ico" aria-hidden="true" focusable="false"><use href="#i-{name}"/></svg>`.
- **Images.** Every `<img>` has `src`, `alt` (possibly empty), `width`, `height` (native pixels), `decoding="async"`, and `loading="lazy"` unless it is above the fold (hero photo, title-band photo or scene). Decorative images have `alt=""`. A generated image whose `ctx.gen(id)` is `null` is **not rendered at all**: no placeholder, no empty frame.
- **IDs** fixed by this contract: `main`, `drawer`, `page-title`, `i-*`, `aside-loc`, `aside-ins`, `f-imp`, `f-quick`, and the home ids in G. Form ids follow E.1. Every other id is `{block}-{n}`, unique per page.

## 1. Hooks and state (the site.js contract)
`site.js` reads **only** these attributes and classes. Any other `data-*` in the output is a defect.

| hook | on | value | site.js does | no JS, or reduced motion |
|---|---|---|---|---|
| `data-reveal` | a block that enters on scroll; never on an element that also has `data-depth` | `up` (default), `left`, `right`, `rise`, `blur`, `settle` (DESIGN-SPEC 5.1) | IntersectionObserver on the viewport, root margin 0px, threshold 0; adds `is-in`; at 1000 + i × 90 ms removes the attribute and `--i`; fail-safe (3 s) only if the observer never delivered any entry; `beforeprint` reveals all | `js-motion` never set, nothing hidden |
| `data-stagger` | a list or grid container | none | sets `--i` = index mod 6 on descendant `[data-reveal]` | none |
| `data-depth` | a parallax layer (P0 orb, P3 protrusion) | signed float, for example `-0.07` | writes `--py` (px) from one rAF-throttled passive scroll handler; skips layers over 1.6 viewports away; re-measures on `load`, `document.fonts.ready`, resize | not written; rests at 0 |
| `data-depth-max` | same element as `data-depth` | integer px | clamps `--py` (default 42). **Required** on every protrusion: at most 40% of its rest offset | n/a |
| `data-rot` | the olive sprig only | degrees | writes `--pr` (scroll-linked rotation) | not written |
| `data-tilt` | a hoverable card link (`a.svc`) | max degrees | fine pointer only, and only after its host's `data-reveal` is released: `--rx`, `--ry`, class `is-tilting` | none |
| `data-header` | `header.site-header` | none | class `is-scrolled` while the page is scrolled more than 40px | none |
| `data-hero` | `.hero__grid` | none | writes `--hp` (0..1 over the hero height) | not written |
| `data-drawer` | `nav.drawer` | none | open: remove `hidden`, add `is-open`, `aria-expanded="true"` on the opener, `inert` on `div.page`, class `is-locked` on `<html>`, focus the first link, trap Tab; close on Esc, scrim, close button; restore focus to the opener | drawer stays `hidden`; the footer "Quick Links" carries the same 5 links |
| `data-drawer-open` | the header menu `<button>` | none | opens the drawer | inert |
| `data-drawer-close` | drawer close button, `div.scrim` | none | closes the drawer | inert |
| `data-accordion` | wrapper of a `<details>` group | none | `beforeprint` opens every item, `afterprint` restores | native `<details>` |
| `data-rail` | `details.rail` | none | keeps the `open` attribute set while the viewport is 1024px or wider and removed below, updating live | stays closed |
| `data-sticky-fit` | `aside.page-aside` | none | class `is-sticky` only while the aside's height fits the viewport below the header | static aside |
| `data-carousel` | the reviews carousel section | none | below 1024px un-hides the two buttons, at 1024px and up hides them; sets `aria-disabled="true"` at the ends | track scrolls natively |
| `data-carousel-track` | the scroll track | none | scroll target | native scroll |
| `data-carousel-prev`, `data-carousel-next` | the two buttons | none | `scrollBy` one slide width (`smooth`, or `auto` under reduced motion) | rendered `hidden` |
| `data-hours` | `dl.hours` | none | adds `is-today` to the row whose `data-day` is today's weekday number (0 Sunday to 6 Saturday) | no highlight |
| `data-day` | each hours row | `0` (Sunday) to `6` | read only | n/a |
| `data-count` | `ul.logo-grid`, `div.fig-grid` | item count | not read (CSS only: column choice) | n/a |
| `data-form` | `form.form` | none | sets `noValidate`; validates on blur and on submit; **always** `preventDefault` on submit; first invalid field gets focus; a valid submit un-hides and focuses the notice | native validation; see E.4 |
| `data-form-notice` | the notice paragraph | none | un-hidden and focused when a valid submit is prevented | stays hidden |
| `data-field-error` | each error line | none | fills `.field__error-text` with the control's `validationMessage`, adds its id to `aria-describedby`, sets `aria-invalid="true"` and `is-invalid` on the `.field` | stays hidden |

Class hooks: `.glass` (fine pointers only: `--mx`, `--my` for the specular), `.progress` (none; `--scroll` is written on `<html>`). State classes set by JS: `js-motion` (head script), `is-in`, `is-scrolled`, `is-tilting`, `is-open`, `is-locked`, `is-sticky`, `is-today`, `is-invalid`. State set by the build: `aria-current="page"`, `is-section`, `is-flat`, `is-solid`, the `open` attribute on the first Q&A item. `site.js` sets the global flag `window.__siteReady` as its first action. `data-nav` is **not defined**: the nav state is rendered at build time.

## A. Page shell
### A.1 Head, in this order (no pipeline head list exists on disk yet; derived from friscoeyesource `templates.mjs head()` plus DESIGN-SPEC 2.2 and 5.2 and BUILD-DECISIONS #1/#2; the pipeline may add tags but keeps this relative order)
```html
<!doctype html>
<html lang="en-US">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{description}">
<meta name="robots" content="{merged robots}">
<link rel="canonical" href="{canonical}">
<meta name="theme-color" content="#759b2a">
<meta property="og:type" content="website">
<meta property="og:site_name" content="{chrome.brandName}">
<meta property="og:title" content="{og title}">
<meta property="og:description" content="{description}">
<meta property="og:url" content="{canonical}">
<meta property="og:image" content="{og image}">
<meta name="twitter:card" content="{summary_large_image or summary}">
<meta name="twitter:image" content="{og image}">
<link rel="icon" href="{up}{favicon path}" type="image/png">
<link rel="preload" href="{up}{fonts dir}/Fraunces-normal-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="{up}{fonts dir}/NunitoSans-normal-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="{LCP image url}" as="image" fetchpriority="high">
<script>{head motion script}</script>
<link rel="stylesheet" href="{up}{fonts dir}/fonts.css">
<link rel="stylesheet" href="{up}styles/brand.css">
<link rel="stylesheet" href="{up}styles/site.css">
<script type="application/ld+json">{Optometric JSON-LD}</script>
</head>
```

- Optional tags are omitted, never emitted empty: `description` (and `og:description`) when there is none after derivation, `robots` when the merged value is empty, `og:image` / `twitter:image` when none, and the LCP preload when the page has no above-fold photo (home: the hero arch photo; `band--photo` pages: the band photo).
- `{merged robots}`: every robots meta in the raw head, most restrictive wins (BUILD-DECISIONS #1, PORT-NOTES S-1).
- `{head motion script}`: `tmp/lab/neighborhood/index.html` line 9 verbatim, with `window.__labReady` renamed `window.__siteReady` (DESIGN-SPEC 5.2). It sets `js-motion` on `<html>` before first paint (motion allowed and IntersectionObserver present) and removes it after 4 s unless `site.js` ran.
- Font files are the 8 woff2 in `assets/fonts/web/` with `fonts.css` beside them (its `url()`s are relative to itself); the OFL texts ship in the same folder. `src/styles/tokens.css` (source evidence) and `src/styles/motion.css` (source keyframes) are **not linked**.

### A.2 Body classes per template family (families from `src/content/site-map.json`)
| family | `<body class>` |
|---|---|
| home | `t-home` |
| every other family | `t-page t-{family}` plus exactly one of `has-aside` / `is-solo` (C.1 decides which) |
| `/404-page-not-found/` and `dist/404.html` | `t-page t-platform-artefact t-404 is-solo` |

`{family}` is the site-map key verbatim: `service-hub`, `service-detail`, `library-article`, `eyewear-contacts`, `insurance`, `contact-forms`, `blog-index`, `blog-post`, `doctor-team`, `staff`, `testimonials`, `legal`, `archive`, `platform-artefact`.

### A.3 Body order, skip link, landmarks
```html
<body class="t-page t-library-article has-aside">
<svg class="sprite" aria-hidden="true" focusable="false" width="0" height="0"><defs>{symbols}</defs></svg>
<div class="field" aria-hidden="true">
  <span class="blob blob--sun"></span><span class="blob blob--lime"></span><span class="blob blob--teal"></span><span class="blob blob--leaf"></span>
</div>
<div class="progress" aria-hidden="true"><span></span></div>
<a class="skip" href="#main">Skip to main content</a>
<div class="page">
  {B.1 top bar}
  {B.2 header}
  <div class="page-body">
    <main id="main" tabindex="-1">
      {C.2 title band}
      {B.17 section rail?}
      <div class="page-main" data-stagger>{content: sheets, cards, forms}</div>
    </main>
    <aside class="page-aside" data-sticky-fit>{B.15 aside}</aside>
  </div>
  {B.13 footer}
</div>
{B.2 drawer and scrim}
<script src="{up}scripts/site.js" defer></script>
</body>
</html>
```

- **Home:** `div.page` holds the top bar, the header, `<main id="main" tabindex="-1">{buildHome(ctx)}</main>` and the footer. There is no `div.page-body` and no aside.
- **`is-solo` pages:** same as above without the `<aside>`.
- The drawer and scrim sit **after** `div.page`, so `inert` on `div.page` never disables the drawer.
- Landmarks (DESIGN-SPEC 7.3): `header` (banner), `nav[aria-label="Primary"]`, `main#main`, `aside.page-aside` (complementary, **outside** `<main>`, after it, as in the source), `footer` (contentinfo). Inner navs: `nav.dock[aria-label="Quick links"]` (home hero, aside), `nav.crumbs[aria-label="Breadcrumb"]`, `nav.rail__nav` (labelled by the parent title), the two footer column navs (`aria-labelledby`). One `<h1>` per page.
- Layout note for the CSS author (a constraint, not CSS): the band spans the full width inside `<main>` while the aside sits beside `.page-main`, and the rail sits at the top of the aside column from 1024px. So `div.page-body` is the grid, and `<main>` passes its columns and rows through (subgrid). Below 1024px the order is band, rail, content, aside.

## B. Components (DESIGN-SPEC section 3)
Coverage: 3.0 B.0 · 3.1 B.1 · 3.2 B.2 · 3.3 G.3 · 3.4 G.3 + B.4 · 3.5 B.5 · 3.6 G.5 · 3.7 G.4 · 3.8 G.6 + F.3 · 3.9 G.7 + F.6 · 3.10 B.10 · 3.11 G.8 · 3.12 G.9 · 3.13 B.13 · 3.14 C.2 · 3.15 B.15 · 3.16 D · 3.17 B.17 + F.1 · 3.18 F.2 + F.5 · 3.19 C.3 · 3.20 E · 3.21 B.21 · 3.22 B.22 · 3.23 F.7 · 3.24 C.1.

### B.0 Base controls (3.0)
```html
<a class="btn btn--primary" href="{href}">{label}{icon arrow}</a>
<a class="btn btn--alert" href="tel:{phone}">{icon phone}{phone}</a>
<a class="btn btn--invert" href="{href}">{label}{icon arrow}</a>
<button class="btn btn--primary" type="submit">Submit</button>
<a class="more" href="{href}" aria-label="{source aria-label}">Read&nbsp;More{icon arrow}</a>
<a class="round-btn" href="{href}" aria-label="{label}">{icon}</a>
<button class="round-btn" type="button">{icon}<span class="sr">{source label}</span></button>
<span class="sr">{visually hidden text}</span>
```

- `btn--primary` on light surfaces; `btn--alert` for emergency tel buttons; `btn--invert` on C2 and on the band. `.more` is the stand-alone "Read More" link (the `aria-label` only when the source anchor has one).
- The skip link is `a.skip` (A.3). Focus rings are CSS only; no markup.

### B.1 Top bar (3.1)
```html
<div class="topbar">
  <div class="wrap topbar__in">
    <a class="topbar__addr" href="{localHref('/eye-care-services/')}">{icon pin}<strong>{chrome.topbar.address.label}</strong></a>
    <div class="topbar__actions">
      <a class="band-pill band-pill--appt" href="{localHref('/contact-us/appointment-request-form/')}">{icon cal}<span>Make an Appointment</span></a>
      <a class="band-pill band-pill--call" href="tel:318-550-5815">{icon phone}<span>Call Us: 318-550-5815</span></a>
    </div>
  </div>
</div>
```

- Address text verbatim ("We're in Bossier City, 1000 Chinaberry Drive, Suite 302, Louisiana, 71111."). The link to `/eye-care-services/` is the source's (sic). The appointment pill gains its href (ledger L01); `tel:` loses the space (L17).
- The modifiers exist so CSS can show only `band-pill--call` below 720px and hide `band-pill--appt` below 1024px (L02). The top bar is not sticky and not a landmark.

### B.2 Header, primary nav, drawer (3.2)
```html
<header class="site-header" data-header>
  <div class="wrap">
    <div class="site-header__bar">
      <span class="site-header__glass glass glass--image" aria-hidden="true"></span>
      <!-- CHANGED 2026-09-29 (operator): no plate, no white ground - the transparent logo sits directly in the bar -->
      <a class="site-logo" href="{localHref('/')}" aria-label="Clifton Eye Center home"><img src="{transparent logo url}" alt="Clifton Eye Center logo" width="288" height="189" decoding="async"></a>
      </a>
      <nav class="mainnav" aria-label="Primary">
        <ul class="mainnav__list">
          <li class="mainnav__item"><a class="mainnav__link" href="{href}">{label}</a></li>
          <li class="mainnav__item"><a class="mainnav__link" href="{href}" aria-current="page">{label}</a></li>
        </ul>
      </nav>
      <div class="mobile-actions">
        <a class="round-btn" href="{localHref('/contact-us/appointment-request-form/')}" aria-label="Make an appointment">{icon cal}</a>
        <a class="round-btn" href="tel:318-550-5815" aria-label="Call">{icon phone}</a>
        <button class="round-btn round-btn--menu" type="button" aria-expanded="false" aria-controls="drawer" data-drawer-open>{icon menu}<span class="sr">Open Menu</span></button>
      </div>
    </div>
  </div>
</header>
```

- Items: `chrome.nav`, 5 items, source order and labels, **no dropdowns** (the source menu is flat).
- `aria-current="page"` on the exact page; `is-section` (no ARIA) on the top-level item whose path is a prefix of the current path. The glass is a **sibling layer** (`span.site-header__glass`), never a wrapper of the content.
- The logo file is used as-is at its native 317 × 221; the plate trims it in CSS.

```html
<nav class="drawer glass glass--image" id="drawer" aria-label="Primary" data-drawer hidden>
  <button class="round-btn drawer__close" type="button" data-drawer-close>{icon close}<span class="sr">Close Menu</span></button>
  <ul class="drawer__list">
    <li class="drawer__item"><a class="drawer__link" href="{href}">{label}</a></li>
  </ul>
  <div class="drawer__actions">
    <a class="band-pill band-pill--appt" href="{localHref('/contact-us/appointment-request-form/')}">{icon cal}<span>Make an Appointment</span></a>
    <a class="band-pill band-pill--call" href="tel:318-550-5815">{icon phone}<span>Call Us: 318-550-5815</span></a>
  </div>
</nav>
<div class="scrim" data-drawer-close hidden></div>
```

The same 5 links and the same `aria-current` / `is-section` state as the main nav. The source's "Return to top of menu" link is not rendered (replaced by the JS focus trap, L11).

### B.4 Quick-action tiles, aside variant and row variant (3.4)
The home dock skeleton is in G.3. The same four links (`chrome.quickActions`: Email Us, Schedule An Appointment, Patient Forms, Order Contacts Online, with `target="_blank" rel="noopener"` on the two the source opens in a new tab) render in two more places:

```html
<nav class="dock dock--aside" aria-label="Quick links">
  <a class="dock__tile glass glass--light" href="{href}">
    <span class="dock__icon">{icon mail}</span><span class="dock__label">Email Us</span>
  </a>
  <a class="dock__tile dock__tile--primary glass glass--leaf-deep" href="{href}" target="_blank" rel="noopener">
    <span class="dock__icon">{icon cal}</span><span class="dock__label">Schedule An Appointment</span>
  </a>
</nav>
<div class="dock dock--row" data-stagger>{the same 4 tiles, each with data-reveal="up"}</div>
```

- Icons in order: `mail`, `cal`, `form`, `cart`. "Schedule An Appointment" is always `dock__tile--primary` on `glass--leaf-deep`. The order never changes.
- `dock--row` is the in-main badge set of a builder page (`ecp-badges` inside the raw main, 9 pages). It is a `div`, not a second "Quick links" nav.

### B.5 Section headers (3.5)
```html
<h2 class="section-title section-title--center" id="{id}" data-reveal="up">{text}</h2>
<h2 class="section-title section-title--center tag-title" id="{id}" data-reveal="up"><span class="hash">#</span>{rest}</h2>
<h2 class="section-title section-title--center" id="{id}" data-reveal="up"><a class="title-link" href="{href}" target="_blank" rel="noopener">{text}{icon arrow}</a></h2>
<h2 class="section-title">{text}</h2>
```

- `section-title--center` is the home variant; the 22px iris ornament above it is drawn by CSS (no element).
- Interior composed sections (builder pages) use the plain left-aligned `h2.section-title`. Headings inside `.prose` carry no class (D).
- Heading levels follow L06: builder `div.ecp-heading` and the designer `<p>` become `h2`; see G for the home.

### B.10 Decorative layer and motifs (3.10)
```html
<div class="deco" aria-hidden="true">
  <span class="orb orb--lime {section}__orb-a" data-depth="0.05"></span>
  <span class="orb orb--teal {section}__orb-b" data-depth="0.03"></span>
</div>
<span class="iris iris--lg" aria-hidden="true"></span>
<img class="sprig" src="{gen cut-olive-sprig}" alt="" width="{w}" height="{h}" loading="lazy" decoding="async" data-depth="-0.08" data-depth-max="24" data-rot="12">
```

- `div.field` (A.3) is the fixed P0 layer. Per-section pools live **only** inside `div.deco`, the first child of their section; nothing else in a section may clip. Orb modifiers: `orb--lime`, `orb--teal`, `orb--mint`, `orb--sun`.
- `iris--lg` is the #HeretoHelp illustration (G.7). At most one large iris per page. The band ring pair is `span.band__rings` (C.2).
- The sprig renders on the home only, once (G.4). The lab's leaves, dapple, sprigs, `help__bubble`, `cutslot`, `map__canvas` and `map__note` are not rendered.

### B.13 Footer (3.13)
```html
<footer class="site-footer">
  <div class="wrap">
    <div class="footer__panel glass glass--dark" data-reveal="up">
      <div class="footer__brand">
        <!-- CHANGED 2026-09-29 (operator): no paper plate - the reversed transparent logo (grey ink -> paper, greens kept) on the dark glass -->
        <a class="site-logo site-logo--footer" href="{localHref('/')}" aria-label="Clifton Eye Center home"><img src="{reversed transparent logo url}" alt="Clifton Eye Center logo" width="288" height="189" loading="lazy" decoding="async"></a>
        </a>
        <p class="footer__nap"><strong>Clifton Eye Center</strong>{rest of the source NAP line, verbatim}<a href="tel:318-550-5815">318-550-5815</a></p>
        <a class="social" href="{facebook url}" aria-label="Visit us on facebook" rel="noopener">{icon fb}</a>
      </div>
      <nav class="footer__col" aria-labelledby="f-imp">
        <p class="footer__h" id="f-imp">Important Links</p>
        <ul class="footer__list"><li><a href="{href}">{label}</a></li></ul>
      </nav>
      <nav class="footer__col" aria-labelledby="f-quick">
        <p class="footer__h" id="f-quick">Quick Links</p>
        <ul class="footer__list"><li><a href="{href}">{label}</a></li></ul>
      </nav>
      <div class="footer__legal">
        <span>{chrome.footer.copyright}</span>
        <ul class="footer__legal-list"><li><a href="{href}">{label}</a></li></ul>
      </div>
    </div>
  </div>
</footer>
```

- NAP line verbatim from the source footer, including its " , " spacing. The Facebook link keeps the source `target`.
- Legal list: Accessibility, Sitemap (href `{up}sitemap.xml`, L10), Privacy, Disclaimer, in the source order. Not rendered (L11): voice search, "Powered by" plus the vendor logo, Login, the microdata block. "© 2026" (`chrome.footer.copyright`) is the source string, not a computed year. Link lists: `chrome.footer.columns` and `chrome.footer.util`; social: `chrome.footer.social`.
- No orbs or `div.deco` in the footer; the lime field is the footer's own background. Nothing follows `</footer>` inside `div.page`.

### B.15 Aside (3.15)
```html
<aside class="page-aside" data-sticky-fit>
  {B.4 nav.dock.dock--aside}
  <section class="aside-card aside-card--location glass glass--light" aria-labelledby="aside-loc">
    <h2 class="aside-card__h" id="aside-loc"><a href="{localHref(chrome.sidebar.location.href)}">{chrome.sidebar.location.title}</a></h2>
    <p class="nap__addr">{icon pin}<span>{chrome.addressLines, joined by a br element}</span></p>
    <p class="nap__phone">{icon phone}<span>{chrome.sidebar.location.phoneLabel} <a href="tel:{chrome.phone}">{chrome.phone}</a></span></p>
    <div class="map map--aside"><iframe class="map__frame" src="{keyless map url}" title="Google map" loading="lazy"></iframe></div>
    {G.9 dl.hours}
  </section>
  <section class="aside-card aside-card--insurance glass glass--light" aria-labelledby="aside-ins">
    <h3 class="aside-card__h" id="aside-ins">{chrome.sidebar.insurance.title}</h3>
    <p>{one p per chrome.sidebar.insurance.paras item}</p>
  </section>
</aside>
```

- Order and text come from the source sidebar (`div.ecp-secondary`) as captured in `src/content/chrome.json` (`sidebar.*`, `addressLines`, `phone`, `hours`, `mapQuery`); the aside hours are the G.9 `dl.hours` skeleton filled from `chrome.hours`. Removed (L11): the search widget and the empty h3.
- The section rail is **not** inside the aside (B.17 explains why); from 1024px CSS places it at the top of this column.
- Map: keyless embed with the full practice address as the query (BUILD-DECISIONS #10, L22). If browser QA shows it does not resolve, the build replaces the `div.map` with `<p class="map__link"><a href="{maps search url}" rel="noopener" target="_blank">{chrome.mapsLinkLabel}</a></p>` ("Open in Google Maps"). Map query: `chrome.mapQuery`. No placeholder art ever ships.

### B.17 Section rail (3.17)
```html
<details class="rail glass glass--light" data-rail>
  <summary class="rail__summary">{parent title}</summary>
  <nav class="rail__nav" aria-label="{parent title}">
    <p class="rail__h"><a href="{parent href}">{parent title}</a></p>
    <ul class="rail__list">
      <li class="rail__item"><a class="rail__link" href="{sibling href}">{sibling title}</a></li>
      <li class="rail__item"><a class="rail__link" href="{own href}" aria-current="page">{own title}</a></li>
    </ul>
  </nav>
</details>
```

- Rendered on `has-aside` pages of `library-article`, `eyewear-contacts`, `service-hub` and `service-detail` whose URL parent is a page other than `/` and has at least 2 child pages (L19; the operator can turn it off).
- One DOM copy, placed in `<main>` before `div.page-main`: below 1024px it is a closed `<details>` above the article; from 1024px `site.js` opens it and CSS places it as the top card of the aside column, with the summary hidden and `p.rail__h` acting as the card heading.
- Hierarchy from `site-map.json` / the URL tree; order = the parent's `ecp-childpages` order where it has one, else content-inventory order. **Labels = each page's own h1 as the build renders it** (site-map.json holds paths only).

### B.21 Logo grids, payment row, QR plate (3.21)
```html
<ul class="logo-grid" data-count="{n}">
  <li class="logo-chip"><img src="{url}" alt="{alt}" width="{w}" height="{h}" loading="lazy" decoding="async"></li>
  <li class="logo-chip"><img src="{url}" alt="{alt}" width="{w}" height="{h}" loading="lazy" decoding="async"><span class="logo-chip__name">{source name}</span></li>
  <li class="logo-chip logo-chip--link"><a class="logo-chip__link" href="{source href}" target="_blank" rel="noopener"><img src="{url}" alt="{alt}" width="{w}" height="{h}" loading="lazy" decoding="async"></a></li>
</ul>
<p>We Accept:</p>
<ul class="pay-row"><li class="pay-row__item"><img src="{url}" alt="{source alt}" width="51" height="32" loading="lazy" decoding="async"></li></ul>
<figure class="qr-plate"><img src="{url}" alt="{source alt}" width="250" height="250" loading="lazy" decoding="async"></figure>
```

- `logo-grid` is produced from a source list whose items are each a lone image, and from the logo walls (insurance carriers, designer frames 31, contact-lens brands, promotions). A name renders only where the source prints one. `logo-chip--link` only when the source image is linked (no hover affordance otherwise).
- `{source alt}` and the payment "We Accept:" line are verbatim source. The QR file is byte-identical, at native size.

### B.22 CTA band (3.22)
```html
<section class="cta-band glass glass--leaf-deep" aria-labelledby="{heading id}">
  <span class="cta-band__rings" aria-hidden="true"></span>
  <h2 class="cta-band__h" id="{heading id}">{source heading of the same builder row}</h2>
  <p class="cta-band__actions">
    <a class="btn btn--invert" href="{source href}">{source button label}{icon arrow}</a>
  </p>
</section>
<div class="cta-band glass glass--leaf-deep">{rings}{p.cta-band__actions only, when the row has no heading}</div>
```

Only on the builder pages, only around the source's own in-content button groups (for example "BOOK AN APPOINTMENT ONLINE TODAY!", "Call 318-550-5815"; external targets such as meetmarlo.com keep `target` and get `rel="noopener"`). There is **no template-level CTA band** on any page (it would be invented content).

## C. Interior page frame
### C.1 Frame per family (DESIGN-SPEC 3.24, SITE-ARCHITECTURE 6)
`has-aside` = the raw page has `div.ecp-secondary` (337 pages) **and** its family is not `blog-index` or `platform-artefact` **and** it is not `/location/clifton-eye-center/`. Everything else is `is-solo`. Breadcrumbs render exactly where the raw main has `div.ecp-breadcrumb` (338 pages).

| family | band (C.2) | crumbs | aside | rail | main column (in order) |
|---|---|---|---|---|---|
| service-hub (5) | `/eye-care-services/`: `band--photo` (`e73b67d5`); the other 4: `band--scene` (`scene-exam-room`) | yes | all but `/eye-care-services/` | the 4 non-root hubs | sheets (D); `svc-*` feature figure at the top of the first sheet where planned; `dock--row` (hub); index cards (F.1; thumbnails on the hub); CTA band where the source has buttons |
| service-detail (13) | `band--scene` (`scene-exam-room`) | yes | yes | yes | sheets; lead figure; `svc-*` feature where planned |
| library-article (101) | `band--plain` | yes | yes | yes | sheets with TOC chip rows; index cards on the 13 section indexes |
| eyewear-contacts (47) | 4 builder hubs: `band--photo` (`9271b8ff`, `b98910e8`, `5b34873c` or `df345d8a`); others `band--scene` (`scene-optical-boutique`) | not on the 4 hubs | all but the 4 hubs | pages with an aside | sheets; logo grids (designer frames 31, promotions); QR plate (`/order-contacts-online/`); brand photos as-is; `dock--row` and CTA band on builder pages |
| insurance (4) | `/insurance/`: `band--photo` (`57b0091d`); children `band--scene` (`scene-greenery-window`) | not on `/insurance/` | children only | no | logo grid (VSP plus 7 medical, with names); CTA band; index cards |
| contact-forms (6) | `/hours-location/`: `band--photo` (`69e5a18d`); others `band--scene` (`scene-greenery-window`) | not on `/hours-location/` | `/contact-us/`, appointment form, contact form, patient forms | no | forms (E) on the 2 form pages; doc cards (F.4) on patient forms; `/hours-location/` and `/location/*`: G.9 visit block plus the payment accordion (F.6) |
| blog-index (1) | `band--scene` (`scene-greenery-window`) | yes | no | no | post cards (F.2), all 151, no pagination |
| blog-post (151) | `band--plain` with the date pill (C.3) | yes | yes | no | sheets (D); plate figure; YouTube embeds on 2 posts |
| doctor-team (2) | `/our-eye-doctors/`: `band--photo` (`29a1ce9d`, never captioned as the doctor); `/team/*`: `band--plain` | `/team/*` only | `/team/*` only | no | team card (F.4), tel button, emergency card (`div.sos`, G.9) |
| staff (1), legal (4) | `band--plain` | yes | yes | no | sheets (the empty team module is dropped) |
| testimonials (4) | `band--plain` | yes (empty segments dropped) | yes | no | review cards (F.3) |
| archive (5) | `band--plain` | yes | yes | no | index cards without summaries; `/category/our-doctors/` without its search form (L11) |
| platform-artefact (4) | `band--plain` | as the source | no | no | kept, noindex; the 404 uses F.7 |

Related links: the only sub-navigation the source has is the `ecp-childpages` listings (rendered as index cards, F.1) and breadcrumbs. The rail (B.17) is the one addition (L19). No other "related links" block is rendered.

### C.2 Title band and breadcrumbs (3.14)
```html
<section class="band band--scene" aria-labelledby="page-title">
  <div class="band__stage" aria-hidden="true">
    <img class="band__scene" src="{gen scene}" alt="" width="{w}" height="{h}" decoding="async">
    <span class="band__veil"></span>
  </div>
  <div class="wrap band__grid">
    <div class="band__title glass glass--image" data-reveal="up">
      <nav class="crumbs" aria-label="Breadcrumb">
        <ol class="crumbs__list">
          <li class="crumbs__item"><a class="crumbs__link" href="{up or ./}">Home</a><span class="crumbs__sep" aria-hidden="true">&raquo;</span></li>
          <li class="crumbs__item"><a class="crumbs__link" href="{ancestor href}">{ancestor label}</a><span class="crumbs__sep" aria-hidden="true">&raquo;</span></li>
          <li class="crumbs__item"><span class="crumbs__current" aria-current="page">{current label}</span></li>
        </ol>
      </nav>
      <h1 class="band__h" id="page-title">{h1}</h1>
    </div>
    <img class="band__cut" src="{gen cut}" alt="" width="{w}" height="{h}" decoding="async" data-depth="-0.06" data-depth-max="24">
  </div>
</section>
```

- `band--photo`: `div.band__stage` holds only `span.band__veil`; the source header photo is framed after the title: `<figure class="band__visual" data-reveal="blur"><picture><source media="(max-width: 767px)" srcset="{mobile variant}" width="{w}" height="{h}"><img src="{url}" alt="" width="{w}" height="{h}" fetchpriority="high" decoding="async"></picture></figure>` (mobile variants `cffb21c7`, `d5d8ab84` where they exist; otherwise no `<source>`).
- `band--plain`: `div.band__stage` holds `span.band__rings` only (the faint iris ring pair). No image.
- `band__scene`: `ctx.gen` of the family scene (C.1). If it is `null`, the band renders as `band--plain`.
- `band__cut`: the cut-out resolved by DESIGN-SPEC 6.3 (prefix table, then the brand-name and Dr. Clifton exclusions); absent when none applies or the file is missing. Never over the h1.
- Breadcrumb trail: parsed from the RAW `div.ecp-breadcrumb` before sanitising (PORT-NOTES R-2): each `<a>` text + href, then the trailing text node as the current item; empty segments dropped (L21). Labels are the source's, never the h1. No crumb block when the source has none.
- h1 (`{h1}`): the page's h1; builder pages use their layout h1; `/testimonial/*` "Testimonial" and `/category/our-doctors/` "Our Doctors" (BUILD-DECISIONS #3); `/eyeglasses-contacts/eyeglasses/designer-frames/` "Designer Frames" from its `<title>` (L20). The content's own copy of that h1 is removed by text match.

### C.3 Blog post additions (3.19)
Inside `div.band__title`, after the h1: `<p class="date-pill">{icon clock}<time datetime="{YYYY-MM-DD}">{source date "Mon D, YYYY"}</time></p>`. The source's usually right-floated picture becomes `fig--plate` (or `fig--photo` at 480px native width and above) inside the first sheet. No previous/next navigation (the source has none).

### C.4 Content column
```html
<div class="page-main" data-stagger>
  <section class="sheet glass glass--light is-flat" data-reveal="up">
    <div class="prose">
      <h2>{section heading}</h2>
      {D content}
    </div>
  </section>
</div>
```

- The cleaned content is split at `h2` (friscoeyesource `splitSections` + `dedupeSections`): one `section.sheet` per part. Sheets carry no accessible name (a named `section` becomes a region landmark; 10+ regions per article is noise); the h2 gives the structure. `is-flat` on every long-form sheet at every width.
- Reveals: the first 12 sheets carry `data-reveal="up"`; later ones carry none (budget: 40 revealed elements per page).
- Composed builder content (dock rows, logo grids, CTA bands, index cards, team cards, visit blocks) sits between sheets in source order, never inside `.prose`.

## D. Long-form content (what the content pipeline may emit inside `div.prose`)
### D.1 Allowed elements and attributes
| element | allowed attributes | notes |
|---|---|---|
| `h2` `h3` `h4` `h5` `h6` | `id` only when an in-page link targets it | no `h1` ever (a content h1 becomes h2 unless it is the page h1, removed by text) |
| `p` | `class="linkrow"`, `class="linkrow linkrow--toc"`, `class="attribution"` | `linkrow`: a paragraph made only of 2+ links; `--toc` when every href is `#…`; `attribution`: the "Special thanks to…" line |
| `ul` `ol` `li` | `ol[start]` | |
| `dl` `dt` `dd` `blockquote` `hr` `address` `cite` `code` `pre` | none | |
| `a` | `href`, `target="_blank"` + `rel="noopener"` (external only), `aria-label` (only when the source has one) | a dead or `#`-only href unwraps to its words |
| `strong` `b` `em` `i` `u` `sup` `sub` `small` `br` | none | at most 2 consecutive `br` |
| `table` `caption` `thead` `tbody` `tfoot` `tr` `th` `td` | `colspan`, `rowspan` on cells | only inside `div.table-scroll` |
| `figure` `figcaption` | `class` from D.3 | |
| `img` | `src alt width height loading decoding` | block level: only inside `figure.fig`; inline (inside `p`, `li`, `a`, `td`): no class |
| `iframe` | `src title loading allowfullscreen` | only inside `div.embed` |
| `div` | only the wrappers `table-scroll`, `embed`, `fig-grid` | no other `div` |
| `span` | only `fig__media`, `logo-chip__name` | every other `span` is unwrapped |

Never emitted: `style`, source `class`/`id`, `data-*` (the internal `data-src-id` is resolved to `id` or dropped before output), `script`, `style`, `form`, `input`, `button`, `svg`, `nav`, `header`, `footer`, `aside`, `font`, `center`, empty elements, and any `ecp-`, `fl-`, `gform`, `wp-` token.

### D.2 Tables and embeds
```html
<div class="table-scroll" role="region" tabindex="0" aria-label="{caption, else the nearest preceding heading, else the page h1}">
  <table>…</table>
</div>
<div class="embed embed--video">
  <iframe src="{source YouTube src}" title="YouTube video" loading="lazy" allowfullscreen></iframe>
</div>
```

- Every table is wrapped (the page itself never scrolls sideways). `role="region"` is required because `aria-label` is not allowed on a plain `div`.
- Every iframe in prose is wrapped in `div.embed`: `embed--video` for YouTube (source src kept), `embed--map` for any Google map left in prose (keyless URL, `title="Google map"`). Other iframes: `div.embed` with a `title` of "Embedded content". The 3 in-main maps of the source (home, `/hours-location/`, `/location/*`) are composed as G.9, not left in prose.

### D.3 Figures and image placement
```html
<figure class="fig fig--photo fig--start"><span class="fig__media"><img src="{url}" alt="{alt}" width="{w}" height="{h}" loading="lazy" decoding="async"></span></figure>
<figure class="fig fig--plate"><span class="fig__media"><img src="{url}" alt="{alt}" width="{w}" height="{h}" loading="lazy" decoding="async"></span><figcaption>{source caption}</figcaption></figure>
<div class="fig-grid" data-count="{n}">{2 or more figure.fig}</div>
```

Role class (exactly one), decided in this order from `audit/image-classification.json` and native size:

| role | when | placement (the CSS reads only the class) |
|---|---|---|
| `fig--diagram` | class `educational-diagram` (9) | white plate, no break-out, never blurred, tinted or blended |
| `fig--brand` | class `brand-campaign-image` (8) | as-is, no break-out, never next to a generated image |
| `fig--portrait` | class `practice-doctor-photo` (capped at 225 CSS px, never protrudes), or a photo with `h > w` and `w >= 400` | arch mask |
| `fig--photo` | native width 480 or more (and the `svc-*` feature figures, which add `fig--feature`) | breaks out of the sheet padding on one side |
| `fig--plate` | everything else: under 480px, clipart, the 404 illustration, slot-fills (`fill-*`, `alt=""`) | paper plate; floats right from 900px |

- `fig--photo` also gets `fig--start` or `fig--end`, alternating in document order per page (first `fig--start`).
- A `figcaption` exists only when the source has a caption-like line bound to the image (friscoeyesource `bindFigureCaptions`: a short paragraph right after the image whose text equals its alt). No caption is authored.
- Alt: the image pipeline's value (override map, else source alt); file-name alts become `""` (L12). Generated feature figures use their image-plan alt.
- Logo lists and walls render as B.21, never as figures. The QR code renders as `figure.qr-plate` (B.21).

## E. Forms (3.20)
Only `/contact-us/appointment-request-form/` (Gravity Form 9) and `/contact-us/contact-form/` (Gravity Form 10) render a form: the two pages with `div.gform_wrapper` inside the raw `<main>` (PORT-NOTES F-1). Fields, labels, descriptions, required marks and option texts come from that markup, in source order. The honeypot and every hidden GF input are dropped (L23).

### E.1 Shell
```html
<section class="sheet sheet--form glass glass--light">
  <form class="form" method="post" aria-labelledby="page-title" data-form>
    <div class="form__intro">{source intro paragraphs}</div>
    <div class="form__grid">{E.2 fields}</div>
    <div class="form__foot">
      <p class="form__notice glass glass--leaf" role="status" tabindex="-1" data-form-notice hidden>This form is not connected yet — please call <a href="tel:318-550-5815">318-550-5815</a></p>
      <button class="btn btn--primary" type="submit">Submit</button>
    </div>
  </form>
</section>
```

- Notice text: `chrome.notice.before` + the tel link + `chrome.notice.after` (BUILD-DECISIONS #4, the only authored UI sentence).
- Ids: `f{formId}-{fieldId}` from the GF input id (`input_9_5` becomes `f9-5`; sub-inputs `input_9_6_3` become `f9-6-3`). `name` equals the id (nothing is sent).
- The form's name is the page h1 ("Appointment Request Form" / "Email Us"); no heading is added, and the sheet itself carries no name (one landmark, not two). The sheet is real glass (not `is-flat`); the controls themselves are solid paper.
- No `action` attribute and no `mailto:` (BUILD-DECISIONS #4). `method="post"` keeps any no-JS submit out of the URL.
- Operator option (DESIGN-SPEC 7.6 #4): the same `p.form__notice` may also render once, without `hidden`, as the first child of the form. Default: off.

### E.2 Fields
```html
<div class="field">
  <label class="field__label" for="f9-7">{label}<span class="field__req" aria-hidden="true">*</span></label>
  <input class="field__control" type="email" id="f9-7" name="f9-7" required aria-required="true" autocomplete="email" aria-describedby="f9-7-help">
  <p class="field__help" id="f9-7-help">{source description}</p>
  <p class="field__error" id="f9-7-err" data-field-error hidden>{icon alert}<span class="field__error-text"></span></p>
</div>
<fieldset class="field field--group" aria-describedby="f9-6-help">
  <legend class="field__label">{label}<span class="field__req" aria-hidden="true">*</span></legend>
  <div class="field__row">
    <div class="field__sub"><input class="field__control" type="text" id="f9-6-3" name="f9-6-3" required aria-required="true" autocomplete="given-name"><label class="field__sublabel" for="f9-6-3">{source sub-label}</label></div>
    <div class="field__sub"><input class="field__control" type="text" id="f9-6-6" name="f9-6-6" required aria-required="true" autocomplete="family-name"><label class="field__sublabel" for="f9-6-6">{source sub-label}</label></div>
  </div>
  <p class="field__help" id="f9-6-help">{source description}</p>
  <p class="field__error" id="f9-6-err" data-field-error hidden>{icon alert}<span class="field__error-text"></span></p>
</fieldset>
<fieldset class="field field--choice">
  <legend class="field__label">{label}<span class="field__req" aria-hidden="true">*</span></legend>
  <div class="choice"><input class="choice__input" type="radio" id="f9-4-0" name="f9-4" value="{option}" required><label class="choice__label" for="f9-4-0">{option}</label></div>
  <p class="field__error" id="f9-4-err" data-field-error hidden>{icon alert}<span class="field__error-text"></span></p>
</fieldset>
```

- Textareas: `div.field.field--wide` holding `textarea.field__control` with the same label, help and error children.
- Control types follow the source input `type` (`text`, `email`, `tel`, `number`, `radio`, `select`, `textarea`). `placeholder` only where the source control has one, verbatim. `autocomplete` tokens are allowed (not copy).
- Required: `required` + `aria-required="true"` on the control; on a radio set, `required` on each radio only (`aria-required` is not valid on role radio); plus the visible `*` in `span.field__req` hidden from assistive technology. Not required: no `span.field__req`.
- `field__help` renders only when GF has a `gfield_description`; `aria-describedby` lists only existing ids. JS appends the `-err` id while an error shows.
- Groups use `fieldset`/`legend`: the Name pair, the time field (hours `number`, minutes `number`, AM/PM `select`, sub-labels "Hours" / "Minutes" / "AM/PM" from the GF screen-reader labels), and each radio set.
- `select`: `<select class="field__control" id name required?>` with the source `<option>`s verbatim.

### E.3 States
`aria-invalid="true"` on the control and `is-invalid` on its `.field` while invalid; the error text is the browser's `validationMessage` (no authored copy). Hover/focus/checked are CSS on the classes above; the native inputs stay in the DOM and focusable (custom 22px radios are drawn on `choice__label`).

### E.4 Without JS
Native constraint validation runs; a submit then POSTs to the page's own URL on a static host (typically 405 or the page again), nothing is stored, and no data enters the URL. The notice stays hidden. This is accepted: wiring is a launch task (OPEN-DECISIONS #2).

## F. Cards, pagination, accordion, 404
### F.1 Index cards (section index, childpages; 3.17)
```html
<ul class="index-cards" data-stagger>
  <li class="index-card glass glass--light" data-reveal="rise">
    <span class="index-card__thumb"><img src="{url}" alt="" width="{w}" height="{h}" loading="lazy" decoding="async"></span>
    <p class="index-card__title"><a class="index-card__link" href="{href}">{source title}</a></p>
    <p class="index-card__summary">{source summary}</p>
    <span class="index-card__go" aria-hidden="true">{icon arrow}</span>
  </li>
</ul>
```

- One link per card (stretched by CSS). `index-card__thumb` only for the 25 thumbnailed children; `index-card__summary` only when the source summary is non-empty. The title is a `p`, not a heading (the source title is a `div` link).
- Only the first 12 cards carry `data-reveal`. Archives use the same card without thumbnail or summary.
- The home "Our Most Popular Services" tiles are a different card (`a.svc`, G.5).

### F.2 Blog post card (3.18)
```html
<ul class="post-cards">
  <li class="post-card glass glass--light is-solid" data-reveal="up">
    <h2 class="post-card__title"><a class="post-card__link" href="{href}">{source title}</a></h2>
    <p class="date-pill">{icon clock}<time datetime="{YYYY-MM-DD}">{source date}</time></p>
    <p class="post-card__excerpt">{source excerpt}</p>
    <a class="more" href="{href}" aria-label="{source aria-label}">Read&nbsp;More{icon arrow}</a>
  </li>
</ul>
```

DOM order is the source order (title, date, excerpt, Read More); CSS may lift the pill above the title visually. All 151 cards on `/whats-new/`, in source order; only the first 12 carry `data-reveal`. `date-pill` is C1-styled but is not a `.glass` element (no blur layer per card).

### F.3 Testimonial card (3.8)
```html
<figure class="review glass glass--light is-solid">
  <svg class="review__q" aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="{lab quote path}"/></svg>
  <p class="stars" role="img" aria-label="{n} out of 5 stars">{icon star × n}</p>
  <blockquote class="review__text"><p>{source text, verbatim}</p></blockquote>
  <figcaption class="review__by">{source attribution, for example "- Andrea H."}</figcaption>
</figure>
```

- `{n}` = count of `span.ecp-rating-star-full` (5 on all 9 source cards); the hidden `ratingValue` span is never rendered (L14). `{lab quote path}` = `tmp/lab/canopy/index.html` line 294.
- `/contact-us/testimonials/`: `<ul class="rev-grid" data-stagger>` with one `<li data-reveal="up">` per card. `/testimonial/*`: one card directly in the first sheet. The home carousel wraps the same card (G.6).
- No portrait or smile image is ever placed next to a review.

### F.4 Team card, doc cards (3.24)
```html
<article class="team-card glass glass--light" aria-labelledby="team-1">
  <figure class="team-card__photo"><img src="{portrait url}" alt="{alt}" width="225" height="397" loading="lazy" decoding="async"></figure>
  <h2 class="team-card__name" id="team-1">Dr. Deana Clifton, OD</h2>
  <a class="more" href="{localHref('/team/dr-deana-clifton-od/')}">{source link text}{icon arrow}</a>
</article>
<ul class="doc-cards">
  <li class="doc-card glass glass--light"><a class="doc-card__link" href="{up}{pdf path}" type="application/pdf">{icon doc}<span class="doc-card__label">{source link text}</span></a></li>
</ul>
```

The team card is used on `/our-eye-doctors/` (the portrait is capped at 225 CSS px, arch mask, never protrudes); the tel button (`btn--primary`) and the emergency card (`div.sos`, G.9) follow it in source order. Doc cards link the two harvested PDFs (BUILD-DECISIONS #9) with the source link texts only.

### F.5 Pagination (3.18): reserved, not built
Default: none (151 cards on one URL, as in the source). If the operator approves it (an ADD row for the new `/whats-new/page/N/` URLs, and a row for the nav label, which the source does not have): `<nav class="pagination" aria-label="{approved label}"><ol class="pagination__list"><li><a class="pagination__link" href="{href}">2</a></li><li><span class="pagination__current" aria-current="page">3</span></li></ol></nav>`. Numbers only; no "Previous/Next" words without a ledger row.

### F.6 Accordion via `<details>` (3.9)
```html
<div class="accordion" data-accordion>
  <details class="qa__item glass glass--leaf is-solid" open>
    <summary class="qa__q"><span class="qa__text">{question or heading text}</span><span class="qa__icon" aria-hidden="true"></span></summary>
    <div class="qa__a">{answer: source paragraphs and links}</div>
  </details>
</div>
```

- The home Q&A (G.7) uses `div.qa__list` in place of `div.accordion`, with the same hook and items; its first item is `open` (L05). Builder heading-accordions (`/hours-location/` "Forms of Payment", `/eyeglasses-contacts/contact-lenses/`, designer-frames): the summary text is the visual heading, and the answer is the **next module** in the source (`data-accordion-target-next`), rendered with its own component (for example B.21 `pay-row`). These are closed by default.
- `summary` holds text only (no heading element, no link). `span.qa__icon` is empty: the +/- is drawn by CSS.
- Source `<a href="#">` toggles and `[hidden]` panels become this markup (L05). Any FAQ section uses it too.

### F.7 404 (3.23)
```html
<section class="band band--plain" aria-labelledby="page-title">
  <div class="band__stage" aria-hidden="true"><span class="band__rings"></span></div>
  <div class="wrap band__grid"><div class="band__title glass glass--image"><h1 class="band__h" id="page-title">404</h1></div></div>
</section>
<div class="page-main">
  <section class="sheet sheet--404 glass glass--light is-flat">
    <img class="sheet__cut" src="{gen cut-lens-prism}" alt="" width="{w}" height="{h}" loading="lazy" decoding="async" data-depth="-0.05" data-depth-max="16">
    <div class="prose">{source copy: "The Diagnosis / The Treatment", "(We are Eye Doctors after all!)", the source links, and 404.png as figure.fig.fig--plate}</div>
  </section>
</div>
```

Used by `/404-page-not-found/` and `dist/404.html` (the same markup; `dist/404.html` has no breadcrumb). **Exception to page-relative URLs:** hosts serve `dist/404.html` at the failing request's path, at any depth, so every URL in that one file is root-relative (`/styles/site.css`, `/`, …); no `<base>` element (it would break `#main`). No crumbs on the 404 unless the source page has one.

## G. Home
### G.1 HOME CONTRACT (verbatim)
```text
HOME CONTRACT (shared by the pipeline and design agents):
src/lib/home.mjs exports function buildHome(ctx) returning the HTML placed inside <main id="main"> of the homepage. ctx = { raw: string of audit/raw/index.html, depth: 0, esc(s), plain(html), localHref(href, depth) -> page-relative href | null (null = dead internal target: caller keeps the words, drops the link), src(pattern) -> { url, w, h, alt } for a SOURCE image whose original src matches the RegExp/string (throws if absent), gen(id) -> { url, w, h, alt } | null for a GENERATED image id of src/content/image-plan.json (null while not generated: render without it and call fail), chrome: parsed src/content/chrome.json (name, NAP, phone, hours, menus, social), icon(name) -> inline SVG string, fail(stage, target, reason), stats }. The pipeline builds ctx and imports home.mjs dynamically inside try/catch (a broken or missing home.mjs falls back to a stub that renders the home content through the generic content pipeline, and is listed as a build failure). $CEC_DIST overrides the output directory (default dist/).
```

Additions binding on `buildHome` (they do not change the contract): the return value is only the 7 sections below, in this order; `ctx.icon` returns the sprite `<use>` form (section 0); every text block of the raw home `<main>` lands in a slot or is reported through `ctx.fail('home:leftover', '/', …)` (no silent drops); `ctx.src` throwing is a build failure, never caught into a placeholder.

### G.2 Section order and sources
| # | section | raw rows (`data-node`) | spec |
|---|---|---|---|
| 1 | `section.hero` | 0 `5ded9754972ce` (3 div headings, row background photo) + 1 `5ded9754977e9` (4 badges) | 3.3, 3.4 |
| 2 | `section.welcome` | 2 `5ded975497569` (h1) + 3 `5df6091f63e9d` (promo, What's New, practice copy) | 3.5, 3.7 |
| 3 | `section.services` | 4 `5ded97549790b` ("Our Most Popular Services", 4 gallery tiles) | 3.6 |
| 4 | `section.reviews` | 5 `5ded975498007` (#HappyPatients, 3 carousel PNGs, 3 testimonials, reviews button) | 3.8 |
| 5 | `section.help` | 6 `5ded975497aee` (#HeretoHelp, Q&A accordion; the empty team module drops) | 3.9 |
| 6 | `section.designer` | 7 `5ded9754987c6` ("Our Designer Optical", 4 brand callouts) | 3.11 |
| 7 | `section.visit` | 8 `5ded975497d41` (map, NAP and hours, emergency) | 3.12 |

Rows 5 to 7 render at every width (L03). Heading outline: the only `h1` is the Welcome heading; "What's New!" is `h2`; the div headings and "Our Designer Optical" are `h2`; the promo line is `h3` (L06).

### G.3 Hero and dock (3.3, 3.4)
```html
<section class="hero">
  <div class="wrap hero__grid" data-hero>
    <div class="hero__stage" aria-hidden="true">
      <img class="hero__scene" src="{gen scene-greenery-window}" alt="" width="{w}" height="{h}" decoding="async">
      <span class="hero__veil"></span>
      <span class="hero__sun"></span>
      <span class="hero__beams"></span>
    </div>
    <div class="hero__copy glass glass--image" data-reveal="left">
      <p class="hero__statement">
        <span class="hero__line">Your Community</span>
        <span class="hero__line">Eye Care Clinic</span>
        <span class="hero__line hero__line--accent">We Know You!<svg class="swash" viewBox="0 0 300 24" aria-hidden="true" focusable="false" preserveAspectRatio="none"><path d="M4 16C62 6 130 4 190 9s84 7 106 3"/></svg></span>
      </p>
    </div>
    <figure class="hero__photo" data-depth="0.035" data-depth-max="24">
      <span class="hero__photo-in" data-reveal="settle"><img src="{src /Girl-Smiling-Brown-Hair/}" alt="" width="1280" height="853" fetchpriority="high" decoding="async"></span>
    </figure>
    <img class="hero__cut" src="{gen cut-eyeglasses}" alt="" width="{w}" height="{h}" decoding="async" data-depth="-0.07" data-depth-max="32">
    <nav class="dock" aria-label="Quick links" data-stagger>
      <a class="dock__tile glass glass--image" href="{Email Us href}" data-reveal="up"><span class="dock__icon">{icon mail}</span><span class="dock__label">Email Us</span></a>
      <a class="dock__tile dock__tile--primary glass glass--leaf-deep" href="{href}" target="_blank" rel="noopener" data-reveal="up"><span class="dock__icon">{icon cal}</span><span class="dock__label">Schedule An Appointment</span></a>
      <a class="dock__tile glass glass--image" href="{Patient Forms href}" data-reveal="up"><span class="dock__icon">{icon form}</span><span class="dock__label">Patient Forms</span></a>
      <a class="dock__tile glass glass--image" href="{href}" target="_blank" rel="noopener" data-reveal="up"><span class="dock__icon">{icon cart}</span><span class="dock__label">Order Contacts Online</span></a>
    </nav>
  </div>
</section>
```

- Statement lines: the 3 `div.ecp-heading` texts of row 0, verbatim; the statement stays a `<p>` (7.3). `data-reveal="left"` (CSS turns it into the `up` pose below 860px). The swash path is the lab's.
- `hero__scene` and `hero__cut` are omitted when `ctx.gen` returns `null` (and `ctx.fail` is called). The arch photo is the row background image (`data-background-image-src`), `alt=""` because the source shows it as a CSS background; it is the LCP image. `data-depth` sits on the figure and `data-reveal` on the inner span (5.8: never both on one element).
- Dock labels and hrefs from row 1 (they equal `chrome.quickActions`).

### G.4 Welcome (3.5, 3.7)
```html
<section class="welcome" aria-labelledby="welcome-h">
  <div class="deco" aria-hidden="true">
    <span class="orb orb--lime welcome__orb-a" data-depth="0.05"></span><span class="orb orb--teal welcome__orb-b" data-depth="0.03"></span><span class="orb orb--sun welcome__orb-c" data-depth="0.06"></span>
  </div>
  <img class="sprig" src="{gen cut-olive-sprig}" alt="" width="{w}" height="{h}" loading="lazy" decoding="async" data-depth="-0.08" data-depth-max="24" data-rot="12">
  <div class="wrap">
    <h1 class="section-title section-title--center welcome__h" id="welcome-h" data-reveal="up">Welcome to Clifton Eye Center <span class="welcome__place">in Bossier City, Louisiana</span></h1>
    <div class="welcome__grid">
      <div class="welcome__side">
        <article class="promo glass glass--light is-solid" data-reveal="up">
          <figure class="promo__img pop" data-depth="-0.04" data-depth-max="20">
            <span class="promo__img-in" data-reveal="blur"><img src="{src /contact-in-water/}" alt="" width="1280" height="853" loading="lazy" decoding="async"></span>
          </figure>
          <h3 class="promo__title">{source promo line}</h3>
          <p>{source paragraph with the Promotions link}</p>
        </article>
        <section class="news glass glass--light is-solid" data-reveal="up" aria-labelledby="news-h">
          <h2 class="news__h" id="news-h">What's New!</h2>
          <article class="news__post">
            <h3 class="news__title"><a href="{post href}">{post title}</a></h3>
            <p class="news__date date-pill">{icon clock}<time datetime="2019-11-26">Nov 26, 2019</time></p>
            <p class="news__excerpt">{source excerpt}</p>
            <a class="more" href="{post href}" aria-label="{source aria-label}">Read&nbsp;More{icon arrow}</a>
          </article>
        </section>
      </div>
      <div class="welcome__main glass glass--light is-solid" data-reveal="up">
        <p class="lead">{source paragraph 1}</p>
        <p>{source paragraphs 2-4, with their links}</p>
        <ul class="feature-list" data-stagger>
          <li data-reveal="up"><strong>Eye Exams</strong> &#8211; {rest of the item, verbatim}</li>
          <li data-reveal="up"><strong>Contact Lens Fittings and Evaluations</strong> &#8211; {rest}</li>
          <li data-reveal="up"><strong>Eye Disease Treatment</strong>- {rest}</li>
        </ul>
        <h3 class="offer-h">Our Product Offerings:</h3>
        <ul class="offer-list"><li>{source item}</li></ul>
        <p class="closing"><a href="{localHref('/contact-us')}">Contact our eye care clinic</a> today to find out how we can help.</p>
      </div>
    </div>
  </div>
</section>
```

- The span around "in Bossier City, Louisiana" and the `<strong>` lead terms are markup only; the text, the dash characters and spacing are unchanged (L07). The lab's `feature-list__icon` spans and `ul.chips` are not used; the markers are CSS.
- The welcome copy's h1 source is row 2; the promo, What's New and practice copy are row 3 in its source order.

### G.5 Services (3.6)
```html
<section class="services" aria-labelledby="svc-h">
  <div class="services__band" aria-hidden="true"></div>
  <div class="wrap services__in">
    <h2 class="section-title section-title--center" id="svc-h" data-reveal="up"><a class="title-link" href="{localHref('/eye-care-services/')}" target="_blank" rel="noopener">Our Most Popular Services{icon arrow}</a></h2>
    <ul class="svc-grid" data-stagger>
      <li data-reveal="rise">
        <a class="svc glass glass--light is-solid" href="{tile href}" data-tilt="7">
          <span class="svc__frame"><img src="{src}" alt="" width="{w}" height="{h}" loading="lazy" decoding="async"></span>
          <span class="svc__foot"><span class="svc__name">{source caption}</span><span class="svc__go">{icon arrow}</span></span>
        </a>
      </li>
    </ul>
  </div>
</section>
```

Tiles in source order: UNIQUE OPTICAL (`/woman-clear-frames-red-lips/`, to `/eyeglasses-contacts/eyeglasses/designer-frames/`), CONTACT LENS SERVICES (`/contact-lenses-demo/`), COMPREHENSIVE EYE EXAMS (`/girl_eye_exam2/`), PEDIATRIC EYE CARE (`/boy-with-glasses-winter-coat/`, href re-pointed from the alias to `/eye-care-services/eye-exams/pediatric-eye-exams/`, L09). The source h2 captions become `span.svc__name` inside the link (the card is one link); `alt=""` (L12).

### G.6 Reviews and carousel (3.8, 5.6)
```html
<section class="reviews">
  <div class="deco" aria-hidden="true">
    <span class="orb orb--lime reviews__orb-a" data-depth="0.05"></span><span class="orb orb--teal reviews__orb-b" data-depth="0.07"></span><span class="orb orb--mint reviews__orb-c" data-depth="0.03"></span>
  </div>
  <div class="wrap">
    <div class="smiles" aria-hidden="true">
      <span class="smile smile--a is-solid" data-depth="-0.05" data-depth-max="24"><img src="{src /smile-girl-cowboy-hat/}" alt="" width="300" height="299" loading="lazy" decoding="async"></span>
      <span class="smile smile--b is-solid" data-depth="-0.1" data-depth-max="24"><img src="{src /smile-woman-plant/}" alt="" width="300" height="300" loading="lazy" decoding="async"></span>
      <span class="smile smile--c is-solid" data-depth="-0.02" data-depth-max="24"><img src="{src /simle-couple-1/}" alt="" width="300" height="299" loading="lazy" decoding="async"></span>
    </div>
    <h2 class="section-title section-title--center tag-title" id="rev-h" data-reveal="up"><span class="hash">#</span>HappyPatients</h2>
    <div class="reviews__stage">
      <section class="rev-carousel" aria-roledescription="carousel" aria-labelledby="rev-h" data-carousel>
        <div class="rev-track" tabindex="0" data-carousel-track>
          <div class="rev-slide" role="group" aria-roledescription="slide" aria-label="1 of 3" data-reveal="up">{F.3 figure.review}</div>
          {two more slides: aria-label "2 of 3", "3 of 3"}
        </div>
        <div class="rev-nav">
          <button class="round-btn rev-nav__btn rev-nav__btn--prev" type="button" data-carousel-prev hidden>{icon chev}<span class="sr">Previous slide</span></button>
          <button class="round-btn rev-nav__btn rev-nav__btn--next" type="button" data-carousel-next hidden>{icon chev}<span class="sr">Next slide</span></button>
        </div>
      </section>
      <p class="reviews__more" data-reveal="up"><a class="btn btn--primary" href="{source Google reviews URL}" rel="noopener">Read More Reviews{icon arrow}</a></p>
    </div>
  </div>
</section>
```

- The outer `section.reviews` is unnamed so that "#HappyPatients" names one region only (the carousel). Cards: the 3 `div.ecp-post.ecp-posttype-testimonial` of row 5, excerpt verbatim with its trailing "...". The smiles are never paired with a quote (L04). No autoplay. `rev-nav__btn--prev` shows the chevron mirrored by CSS.
- The track is focusable for arrow-key scrolling; from 1024px CSS shows it as a static 3-column row and JS hides the buttons.
- The reviews button keeps every source attribute (URL, `target` if present) and adds `rel="noopener"`.

### G.7 #HeretoHelp (3.9)
```html
<section class="help" aria-labelledby="help-h">
  <div class="deco" aria-hidden="true"><span class="orb orb--lime help__orb-a" data-depth="0.05"></span><span class="orb orb--sun help__orb-b" data-depth="0.03"></span></div>
  <div class="wrap help__grid">
    <div class="help__side" data-reveal="left">
      <h2 class="section-title tag-title help__tag" id="help-h"><span class="hash">#</span>HeretoHelp</h2>
      <div class="help__iris" data-depth="-0.05" data-depth-max="16" aria-hidden="true"><span class="iris iris--lg"></span></div>
    </div>
    <div class="qa glass glass--light" data-reveal="up">
      <h2 class="qa__h">Ask Dr. Deana Clifton a Question...</h2>
      <div class="qa__list" data-accordion>
        <details class="qa__item glass glass--leaf is-solid" open>
          <summary class="qa__q"><span class="qa__text">{span.ecp-accordion-trigger-label text}</span><span class="qa__icon" aria-hidden="true"></span></summary>
          <div class="qa__a"><p>{source answer}</p><p><a href="{localHref(dry-eye alias)}">More about Dry Eyes...</a></p></div>
        </details>
        {items 2 and 3: the same details.qa__item, without open}
      </div>
    </div>
  </div>
</section>
```

The 3 answers come from `div.ecp-accordion-content[hidden]` (real copy). "More about Dry Eyes..." resolves through `localHref` to `/eye-care-services/eye-conditions/dry-eye-disease-and-treatment/` (alias, L09). The lab's `help__bubble` and sprigs are not rendered.

### G.8 Designer optical (3.11)
```html
<section class="designer" aria-labelledby="des-h">
  <div class="designer__band">
    <div class="wrap designer__grid">
      <h2 class="designer__title" id="des-h" data-reveal="up">Our Designer Optical</h2>
      <ul class="brands" data-stagger>
        <li data-reveal="rise">
          <a class="brand is-solid" href="{localHref('/eyeglasses/designer-frames')}">
            <span class="brand__img"><img src="{src /Kaenon-Ad/}" alt="Model wearing Kaenon eyeglasses" width="250" height="300" loading="lazy" decoding="async"></span>
            <span class="brand__name">KAENON</span>
          </a>
        </li>
      </ul>
    </div>
  </div>
</section>
```

Plates in source order: KAENON (`/Kaenon-Ad/`), IZOD (`/IZOD-Ad/`), ALAN J (`/AlanJ_250x300/`), CONVERSE (`/Converse/`); alts are the source/override alts verbatim; each href resolves (alias) to `/eyeglasses-contacts/eyeglasses/designer-frames/` (L09). The ads are never cropped, zoomed or filtered. The band is full-bleed (outside `.wrap`), with no orbs.

### G.9 Visit: map, NAP and hours, emergency (3.12)
```html
<section class="visit">
  <div class="deco" aria-hidden="true"><span class="orb orb--lime visit__orb-a" data-depth="0.04"></span><span class="orb orb--teal visit__orb-b" data-depth="0.06"></span></div>
  <div class="wrap visit__grid" data-stagger>
    <div class="map" data-reveal="up"><iframe class="map__frame" src="{keyless map url}" title="Google map" loading="lazy"></iframe></div>
    <div class="nap glass glass--image" data-reveal="up">
      <p class="nap__title"><a href="{localHref('/location/clifton-eye-center/')}">Clifton Eye Center</a></p>
      <p class="nap__addr">{icon pin}<span>{source address, source line breaks}</span></p>
      <p class="nap__phone">{icon phone}<span>{source "Phone:" label} <a href="tel:318-550-5815">318-550-5815</a></span></p>
      <dl class="hours" data-hours>
        <div class="hours__row is-solid" data-day="1"><dt>Monday:</dt><dd>8:30 AM - 4:30 PM</dd></div>
        <div class="hours__row is-solid" data-day="0"><dt>Sunday:</dt><dd>Closed</dd></div>
      </dl>
    </div>
    <div class="sos glass glass--dark is-solid" data-reveal="up">
      <div class="sos__head"><span class="icon-tile">{icon case}</span><h3 class="sos__h">Is it an Emergency?</h3></div>
      <p>{source paragraph, with its br and strong}</p>
      <a class="btn btn--alert" href="tel:318-550-5815">{icon phone}318-550-5815</a>
    </div>
  </div>
</section>
```

- Hours: 7 rows in source order (Monday to Sunday), `data-day` 1 to 6 then 0, verbatim labels and times (`ecp-post-hours-item`). Today's row gets `is-today` from JS (background only, L16).
- The location title stays a `<p>` link (7.3). Inline formatting inside NAP and emergency copy follows the source.
- The lab's `is-alert` rim class, map placeholder and `map__note` are not rendered. Map fallback: B.15.
- `/hours-location/` and `/location/clifton-eye-center/` reuse this block (without `div.deco`) with their own source content, followed on `/hours-location/` by the payment accordion (F.6 + B.21).

## H. Departures, labels, ledger additions
### H.1 Departures from DESIGN-SPEC or the canopy lab (each with its reason)
1. Skip link `href="#main"` (spec 3.0 says `#content`, the lab uses `main#content`): the HOME CONTRACT fixes `main#main`.
2. Page-relative URLs (spec 5.9 #11 says root-relative): the HOME CONTRACT's `localHref` returns page-relative hrefs.
3. Carousel slides are `div.rev-slide[role=group]` in `div.rev-track` (spec 5.6: `ul.rev-track` > `li[role=group]`): ARIA in HTML does not allow `role="group"` on `li`, and a `ul` whose items lose `listitem` fails list checks.
4. Section rail sits in `<main>` before the content column, placed into the aside column from 1024px (spec 3.15 lists it as aside item 1; spec 3.17 wants it above the article below 1024px): one DOM copy satisfies both positions without duplicating 20+ links.
5. Rail labels come from each page's h1 (spec 3.17: "from site-map.json"): `site-map.json` holds paths, not titles.
6. `div.table-scroll` gets `role="region"` (spec 3.16 gives `tabindex` and `aria-label` only): `aria-label` is prohibited on a generic `div`.
7. The drawer uses the `hidden` attribute plus `data-drawer` (lab: `data-open`, `data-menu-open/close`), and is labelled "Primary" (lab: "Primary (mobile)"); the main nav and the drawer are never exposed at the same time.
8. The hero and visit sections have no `aria-label` (lab: "Welcome", "Location and hours"): those were invented labels.
9. In-main badge rows are `div.dock.dock--row`, not a second "Quick links" nav.
10. Date pills are not `.glass` elements (spec 2.7 lists date pills under C1): 151 blur layers on `/whats-new/` would break the glass budget; they keep the C1 fill.
11. Index-card titles are `p`, not headings: the source titles are `div` links, and no headings are added.
12. Heading-accordion summaries hold text, not a heading element (robust `<summary>` semantics).
13. `/location/clifton-eye-center/` gets no aside (spec 3.24 lists the contact-forms aside for the forms pages and `/contact-us/` only), although its raw page has the sidebar. The sidebar is chrome repeated on 336 other pages, and the page renders G.9 in main.
14. Class renames from the lab: `hero__canopy` becomes `hero__stage`, `a.logo` becomes `a.logo-plate` (spec names); `ul.chips` becomes `ul.offer-list` (spec: plain list); the NAP card moves from `glass--light` to `glass--image` (spec: recipe A); `qa__chev` becomes the empty `qa__icon` (spec: CSS +/- icon); `p.center` around the reviews button becomes `p.reviews__more`; the footer `a.logo.logo--plate` becomes `a.logo-plate.logo-plate--footer`. New modifiers: `band-pill--appt`, `band-pill--call`, `dock__tile--primary`, `logo-plate--footer`.
15. `src/styles/tokens.css` and `motion.css` are not linked (spec 2: tokens.css is evidence; motion.css holds source keyframes that the redesign does not use).

### H.2 Non-visible accessibility labels (ledger L13 must list all of them)
"Clifton Eye Center home", "Primary", "Quick links", "Breadcrumb", "Make an appointment", "Call", "{n} out of 5 stars", "1 of 3" / "2 of 3" / "3 of 3", `aria-roledescription` "carousel" and "slide", iframe titles "Google map" and "YouTube video" ("Embedded content" if any other iframe survives), and each table-scroll label (copied from existing text). Source strings, not additions: "Skip to main content", "Open Menu", "Close Menu", "Previous slide", "Next slide", "Visit us on facebook", "Read more about '…'".

### H.3 Ledger rows this contract implies beyond DESIGN-SPEC 7.4
- L12 extension: index-card thumbnails `alt=""` (the card title names the page).
- L19 note: the rail placement in H.1 #4.
- Known axe best-practice items, accepted: the top bar sits outside every landmark (the same address and phone are inside the footer landmark); the home heading order goes h1 (Welcome) then h3 (promo) because of L06.
CHANGED: A.1 stylesheets (design agent): pages link `fonts/fonts.css`, `styles/tokens.css`, `styles/site.css`, `styles/motion.css` in that order; tokens.css and motion.css ship only from their redesign markers ("REDESIGN TOKENS", "@redesign-motion"), the measured evidence above each marker never ships, and no brand.css exists (supersedes A.1's brand.css line and H.1 #15).
CHANGED: A.3 the class `field` names both the P0 light field and form fields (E.2); CSS addresses the light field only as `body > .field`, so `div.field[aria-hidden="true"]` must stay a direct child of `<body>`.
CHANGED: A.3 the interior grid wrapper is `div.page-grid` (as templates.mjs emits it); CSS styles `.page-grid` and `.page-body` alike.
CHANGED: G.9 the visit block lays out by its own width (a container query on `section.visit`), so one markup serves the full-bleed home and the 980px column of `/hours-location/` and `/location/*`.
CHANGED: section 1: site.js also wires the DESIGN-SPEC 3.2 disclosure pattern if a `.mainnav__item > button[aria-expanded][aria-controls]` ever renders (no data-* hook; nothing renders it today, the source menu is flat).

END OF CONTRACT