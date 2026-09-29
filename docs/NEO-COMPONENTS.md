# Neo components: the markup contract (Clifton Eye Center, neoclassical theme "Temple")

Status: binding markup contract, 2026-09-29, for the neo theme only: `src/themes/neo/templates.mjs` (pipeline
agent), `src/themes/neo/home.mjs`, `src/themes/neo/styles/*.css` and `src/themes/neo/scripts/site.js` (design-system
agent). Built by `CEC_THEME=neo node src/build.mjs` into `dist-neo/`. The glass contract (`docs/COMPONENTS.md`) is
untouched and still binds the glass build.

Inputs read in full for this file: `docs/NEO-SPEC.md` (sections 0-7), `tmp/lab-neo/temple/index.html`, `lab.css`,
`lab.js`, `docs/COMPONENTS.md`, the glass `src/lib/templates.mjs` (the `T` API and the markup it really emits,
including the QA fixes RA-05/RA-06/RA-07/RA-09/VH-03 that postdate COMPONENTS.md), `src/lib/home.mjs`,
`src/scripts/site.js`, and the class emitters in `src/lib/content.mjs`, `src/lib/forms.mjs` and `src/build.mjs`.

Precedence: the HOME CONTRACT (section 5.1, verbatim) > this file for **neo markup** (elements, classes, ARIA,
hooks, order) > `docs/NEO-SPEC.md` for **visual values** > `docs/COMPONENTS.md` for everything this file does not
restate (URL rules, image attributes, ids, strings, ledger L01-L23). Departures from NEO-SPEC or COMPONENTS are in
section 6 with the reason.

## 0. Conventions (unchanged from COMPONENTS 0 unless stated)

- `{name}` is a build value (source copy, a `ctx`/`chrome` value, a URL); `{up}` the page-relative prefix; `?` optional;
  `…` repeat. URLs page-relative everywhere except `dist-neo/404.html` (root-relative, COMPONENTS F.7).
- Visible text is source copy only; the only non-source strings are the COMPONENTS H.2 accessibility labels plus the
  neo labels of 6.2 (none are visible).
- BEM classes; state classes `is-*`; body template classes `t-*`.
- **No `.glass*`, `is-flat` or `is-solid` class is emitted by any neo template or by `home.mjs`.** Where the shared
  pipeline still emits them (`src/build.mjs` sheets, `src/lib/forms.mjs` notice), they are inert: no neo rule
  styles them (section 4).
- `{icon x}` = `<svg class="ico" aria-hidden="true" focusable="false"><use href="#i-x"/></svg>` (the glass `icon()`).
- `{orn x}` = `<svg class="orn orn--x" aria-hidden="true" focusable="false"><use href="#o-x"/></svg>` (new, 1.2).
- Images: `src alt width height decoding="async"`, `loading="lazy"` unless above the fold. Generated images are
  always `alt=""`; a `null` from `ctx.gen` / `useGen` means the element is **not rendered** (no placeholder, no empty
  frame).
- Every visible "318-550-5815" is unbreakable: inside `<main>` the shared build pass already wraps text-node numbers
  in `span.nobr` (`src/build.mjs` buildPage, "a phone number in running text"); **outside `<main>`** (top bar,
  header, drawer, footer, aside) the neo templates wrap each visible number in `span.nw` themselves. CSS treats
  `.nw` and `.nobr` identically (`white-space: nowrap`). Never wrap a number twice.

## 1. Page shell

### 1.1 Head (the glass `T.head` with three changes)

```html
<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>…</title> {description, robots, canonical, theme-color #759b2a, og:*, twitter:*, icons: exactly as glass}
<link rel="preload" href="{up}fonts/NotoSerifDisplay-normal-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="{up}fonts/SourceSerif4-normal-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="{LCP image}" as="image" fetchpriority="high">   <!-- home hero photo; band--photo photo -->
<script>{HEAD_SCRIPT: the glass string verbatim (js class, js-motion before first paint, 4 s rollback)}</script>
<link rel="stylesheet" href="{up}fonts/fonts.css">
<link rel="stylesheet" href="{up}styles/tokens.css">
<link rel="stylesheet" href="{up}styles/site.css">
<link rel="stylesheet" href="{up}styles/motion.css">
<script type="application/ld+json">…</script>
</head>
```

Changes from glass: the two font preloads (NEO-SPEC 2.2); the stylesheet list is whatever `LINKED_STYLES` resolves
from `src/themes/neo/styles/` (no `brand.css` exists there, so it is tokens, site, motion); nothing else.

### 1.2 Body order

```html
<body class="{t-home | t-page t-{family} has-aside|is-solo | t-page t-platform-artefact t-404 is-solo}">
<svg class="sprite" aria-hidden="true" focusable="false" width="0" height="0"><defs>{icon symbols i-*}{ornament symbols o-*}</defs></svg>
<div class="ground" aria-hidden="true"></div>                     <!-- interior pages only (t-page), not the home -->
<a class="skip" href="#main">Skip to main content</a>
<div class="page">
  <header class="masthead">{2.1 top bar}{2.2 header bar}</header>
  {home:     <main id="main" tabindex="-1">{buildHome(ctx)}</main>}
  {interior: <div class="page-grid"><main id="main" tabindex="-1">{band}{rail?}<div class="page-main" data-stagger>…</div></main>{aside?}</div>}
  {2.10 footer}
</div>
{2.3 drawer + scrim}
<script src="{up}scripts/site.js" defer></script>
</body>
```

- **Not rendered in neo:** `div.field` and its blobs, the separate top-level `div.progress` (it moves inside the
  header bar, 2.2). `header.masthead` keeps the glass role (one banner landmark around the top bar and the header
  bar, RA-06); CSS gives it `display: contents` so the header bar stays sticky.
- The drawer and scrim stay **after** `div.page` (so `inert` on `div.page` never disables them).
- Landmarks: banner (`header.masthead`), `nav.mainnav[aria-label="Primary"]`, `main#main`, `aside.page-aside`
  (outside main), contentinfo (`footer.site-footer`). Inner navs: `nav.dock[aria-label="Quick actions"]` (home hero,
  aside), `nav.crumbs[aria-label="Breadcrumb"]`, `nav.rail__nav`, the two footer column navs. One `h1` per page.

### 1.3 Sprite

Icons: the glass `SYMBOLS` (`pin cal phone mail form cart star chev arrow case fb menu close clock alert doc`),
unchanged. **Ornament symbols added** (all `fill="currentColor"`, strings from `tmp/lab-neo/temple/index.html` lines
22-39 and `tmp/neo/brief/ornaments.json`):

| id | viewBox | source |
|---|---|---|
| `o-rosette` | `-12 -12 24 24` | temple index.html 22-30 (8 petals + centre) |
| `o-star` | `-10 -10 20 20` | temple index.html 31 |
| `o-badge` | `0 0 120 120` | temple index.html 32-39 (three rings, four diamonds; the ring `<g>` keeps `fill="none" stroke="currentColor"`) |
| `o-sprig` | `0 0 72 64` | `ornaments.json` `laurel` (the inner markup of that `<svg>`) |

The `i-star` icon is a stroke path; CSS fills it inside `.stars` (no second star symbol is needed).

## 2. Chrome components

### 2.1 Top bar (COMPONENTS B.1, kept)

```html
<div class="topbar">
  <div class="wrap topbar__in">
    <a class="topbar__addr" href="{localHref(chrome.topbar.address.href)}">{icon pin}<strong>{chrome.topbar.address.label}</strong></a>
    <div class="topbar__actions">
      <a class="band-pill band-pill--appt" href="{localHref(appointment.href)}">{icon cal}<span>Make an Appointment</span></a>
      <a class="band-pill band-pill--call" href="tel:318-550-5815">{icon phone}<span>Call Us: <span class="nw">318-550-5815</span></span></a>
    </div>
  </div>
</div>
```

`band-pill` is the ruled plaque of NEO-SPEC 3.1 (the lab's `.plaque`). Below 720px only `band-pill--call` shows;
below 1024px `band-pill--appt` hides.

### 2.2 Header bar and primary nav (COMPONENTS B.2 + NEO-SPEC 3.2)

```html
<div class="site-header" data-header>
  <div class="wrap">
    <div class="site-header__bar">
      <a class="site-logo" href="{localHref('/')}" aria-label="Clifton Eye Center home"><img src="{transparent logo}" alt="Clifton Eye Center logo" width="{w}" height="{h}" decoding="async"></a>
      <nav class="mainnav" aria-label="Primary">
        <ul class="mainnav__list mainnav__list--l">{items 1-2}</ul>
        <ul class="mainnav__list mainnav__list--r">{items 3-5}</ul>
      </nav>
      <div class="site-header__actions">
        <a class="round-btn site-header__call" href="tel:318-550-5815" aria-label="Call">{icon phone}</a>
        <a class="round-btn site-header__appt" href="{localHref('/contact-us/appointment-request-form/')}" aria-label="Make an appointment">{icon cal}</a>
      </div>
      <div class="mobile-actions">
        <a class="round-btn" href="{localHref(appointment)}" aria-label="Make an appointment">{icon cal}</a>
        <a class="round-btn" href="tel:318-550-5815" aria-label="Call">{icon phone}</a>
        <button class="round-btn round-btn--menu" type="button" aria-expanded="false" aria-controls="drawer" data-drawer-open>{icon menu}<span class="sr">Open Menu</span></button>
      </div>
    </div>
  </div>
  <div class="progress" aria-hidden="true"><span></span></div>
</div>
```

- Item: `<li class="mainnav__item"><a class="mainnav__link[ is-section]" href="{href}"[ aria-current="page"]>{label}</a></li>`
  (glass `navState`). The list is split 2 + 3 in source order (NEO-SPEC 3.2 markup departure); the drawer keeps one list.
- `site-header__actions` is rendered in the markup at every width; CSS shows it only from 1024px and only in
  `.is-scrolled` (the appointment button from 1024px, the call button from 1280px). Labels are the L13 ones.
- `div.progress` is the **last child of `div.site-header`** (the rule on the bar's bottom edge). site.js writes
  `--scroll` on the `span` only (RA-02: never on `<html>`).

### 2.3 Drawer and scrim (COMPONENTS B.2, kept; no glass classes)

```html
<nav class="drawer" id="drawer" aria-label="Primary" data-drawer hidden>
  <button class="round-btn drawer__close" type="button" data-drawer-close>{icon close}<span class="sr">Close Menu</span></button>
  <ul class="drawer__list"><li class="drawer__item"><a class="drawer__link[ is-section]" href="{href}"[ aria-current="page"]>{label}</a></li>…</ul>
  <div class="drawer__actions">
    <a class="band-pill band-pill--appt" href="{appointment}">{icon cal}<span>Make an Appointment</span></a>
    <a class="band-pill band-pill--call" href="tel:318-550-5815">{icon phone}<span>Call Us: <span class="nw">318-550-5815</span></span></a>
  </div>
</nav>
<div class="scrim" data-drawer-close hidden></div>
```

### 2.4 Base controls (COMPONENTS B.0, kept markup)

```html
<a class="btn btn--primary" href="{href}">{label}{icon arrow}</a>
<a class="btn btn--alert" href="tel:318-550-5815">{icon phone}<span class="nobr">318-550-5815</span></a>
<a class="btn btn--invert" href="{href}">{label}{icon arrow}</a>
<button class="btn btn--primary" type="submit">Submit</button>
<a class="more" href="{href}"[ aria-label="{source aria-label}"]>Read&nbsp;More{icon arrow}</a>
<a class="round-btn" href="{href}" aria-label="{label}">{icon}</a>
<span class="sr">{visually hidden text}</span>
<span class="nw">318-550-5815</span>                                  <!-- new: an unbreakable number outside main -->
```

### 2.5 Ornament elements (new; all `aria-hidden="true"`, never focusable, never text)

```html
<div class="pediment[ pediment--hero| pediment--footer]" aria-hidden="true">
  <svg viewBox="0 0 1000 106.3" preserveAspectRatio="none" focusable="false"><polyline points="0,105.8 500,.5 1000,105.8" vector-effect="non-scaling-stroke"/></svg>
  <span class="numeral">{I … VII}</span>?                               <!-- home only; footer: the logo instead (2.10) -->
</div>
<span class="cornice" aria-hidden="true"></span>
<span class="pilaster pilaster--l" aria-hidden="true"></span><span class="pilaster pilaster--r" aria-hidden="true"></span>
<div class="divider" aria-hidden="true"><span></span>{orn rosette}<span></span></div>
<span class="arch-mark" aria-hidden="true"><span class="numeral">{IV|V}</span></span>
<span class="numeral numeral--band" aria-hidden="true">VI</span>
<span class="meander" aria-hidden="true"></span>
<svg class="star star--tl|tr|bl|br" aria-hidden="true" focusable="false"><use href="#o-star"/></svg>
<svg class="laurel-sprig[ laurel-sprig--r]" aria-hidden="true" focusable="false" viewBox="0 0 72 64"><use href="#o-sprig"/></svg>
<div class="deco deco--light|deco--dark|deco--deep" aria-hidden="true"></div>   <!-- N0 ground of a home section / the footer -->
```

Numerals are ornament (ledger N01), home only. Budgets (NEO-SPEC 3.5, 7.3 #3): home 4 stars (hero), 3 rosette
dividers (II, III, VII), 2 pilaster pairs (hero, designer); interior 2 stars, 1 pilaster pair, 1 band divider, 1
meander run (footer).

### 2.6 Quick-action tile (COMPONENTS B.4 + NEO-SPEC 3.4; one markup, four looks)

```html
<a class="dock__tile[ dock__tile--primary]" href="{href}"[ target="_blank" rel="noopener"][ data-reveal="up"]>
  <span class="dock__icon"><svg class="dock__ring" aria-hidden="true" focusable="false"><use href="#o-badge"/></svg>{icon mail|cal|form|cart}</span>
  <span class="dock__label">{label}</span>
  <span class="dock__go" aria-hidden="true">{icon arrow}</span>
</a>
```

| container | where | look |
|---|---|---|
| `<nav class="dock dock--portico" aria-label="Quick actions">` | home hero | portico niches 1200+, plaque list 700-1199, 2x2 phone plates < 700 (`dock__go` hidden in niches and plates) |
| `<nav class="dock dock--aside" aria-label="Quick actions">` | interior aside | plaque list |
| `<div class="dock dock--row" data-stagger>` (tiles carry `data-reveal="up"`) | the 9 builder pages | a row of plaques |

Order and labels from `chrome.quickActions` / home row 1; icons `mail cal form cart`; "Schedule An Appointment" is
always `dock__tile--primary`. The hero tiles carry **no** `data-reveal` (they must be there at first paint).

### 2.7 Aside (COMPONENTS B.15, kept; no glass classes)

```html
<aside class="page-aside" data-sticky-fit>
  {2.6 nav.dock.dock--aside}
  <section class="aside-card aside-card--location" aria-labelledby="aside-loc">
    <h2 class="aside-card__h" id="aside-loc"><a href="{location href}">{title}</a></h2>
    <p class="nap__addr">{icon pin}<span>{addressLines joined by <br>}</span></p>
    <p class="nap__phone">{icon phone}<span>{phoneLabel} <a href="tel:318-550-5815"><span class="nw">318-550-5815</span></a></span></p>
    <div class="map map--aside"><iframe class="map__frame" src="{keyless map url}" title="Google map" loading="lazy"></iframe></div>
    {2.9 dl.hours}
  </section>
  <section class="aside-card aside-card--insurance" aria-labelledby="aside-ins">
    <h3 class="aside-card__h" id="aside-ins">{title}</h3>
    <p>{paras joined by <br>}</p>
  </section>
</aside>
```

### 2.8 Section rail (COMPONENTS B.17, kept; the summary gains a chevron)

```html
<details class="rail" data-rail>
  <summary class="rail__summary"><span class="rail__summary-text">{parent title}</span>{icon chev}</summary>
  <nav class="rail__nav" aria-label="{parent title}">
    <p class="rail__h"><a href="{parent href}">{parent title}</a></p>
    <ul class="rail__list"><li class="rail__item"><a class="rail__link" href="{href}"[ aria-current="page"]>{title}</a></li>…</ul>
  </nav>
</details>
```

### 2.9 Hours list (G.9 `dl.hours`, kept; `is-solid` dropped)

```html
<dl class="hours" data-hours>
  <div class="hours__row" data-day="1"><dt>Monday:</dt><dd>8:30 AM - 4:30 PM</dd></div> … <div class="hours__row" data-day="0">…</div>
</dl>
```

### 2.10 Footer (COMPONENTS B.13 content, NEO-SPEC 3.12 structure)

```html
<footer class="site-footer">
  <div class="deco deco--deep" aria-hidden="true"></div>
  <div class="wrap footer__frieze">
    <div class="pediment pediment--footer">
      <svg viewBox="0 0 1000 106.3" preserveAspectRatio="none" aria-hidden="true" focusable="false"><polyline points="0,105.8 500,.5 1000,105.8" vector-effect="non-scaling-stroke"/></svg>
      <a class="site-logo site-logo--footer" href="{localHref('/')}" aria-label="Clifton Eye Center home"><img src="{reversed transparent logo}" alt="Clifton Eye Center logo" width="{w}" height="{h}" loading="lazy" decoding="async"></a>
    </div>
    <span class="meander" aria-hidden="true"></span>
  </div>
  <div class="wrap footer__bays">
    <div class="footer__brand">
      <p class="footer__nap"><strong>Clifton Eye Center</strong>{rest of the NAP line verbatim} <a href="tel:318-550-5815"><span class="nw">318-550-5815</span></a></p>
      <a class="social" href="{facebook}" aria-label="Visit us on facebook" target="_blank" rel="{source rel}">{icon fb}</a>
    </div>
    <nav class="footer__col footer__col--l" aria-labelledby="f-imp"><p class="footer__h" id="f-imp">Important Links</p><ul class="footer__list"><li><a href>…</a></li>…</ul></nav>
    <nav class="footer__col footer__col--r" aria-labelledby="f-quick"><p class="footer__h" id="f-quick">Quick Links</p><ul class="footer__list">…</ul></nav>
  </div>
  <div class="wrap footer__legal">
    <span>© 2026</span>
    <ul class="footer__legal-list"><li><a href>Accessibility</a></li><li><a href="{up}sitemap.xml">Sitemap</a></li>…</ul>
  </div>
</footer>
```

DOM order brand, Important, Quick (reading order); CSS places Important | brand | Quick from 900px. No
`data-reveal` in the footer. `footer__panel` is not rendered.

## 3. Interior frame

### 3.1 Title band (COMPONENTS C.2 + NEO-SPEC 3.13)

```html
<section class="band band--{scene|photo|plain}[ band--has-cut]"[ aria-labelledby="page-title"]>
  <div class="band__stage" aria-hidden="true">
    <span class="band__frame"><svg class="star star--tl" …><use href="#o-star"/></svg><svg class="star star--tr" …><use href="#o-star"/></svg></span>
  </div>
  <div class="wrap band__grid">
    <div class="band__title">
      {3.2 nav.crumbs?}
      <h1 class="band__h" id="page-title">{h1}</h1>
      <p class="date-pill">{icon clock}<time datetime="{YYYY-MM-DD}">{source date}</time></p>?   <!-- blog posts -->
      <div class="divider band__divider" aria-hidden="true"><span></span>{orn rosette}<span></span></div>
    </div>
    <span class="pilaster pilaster--l" aria-hidden="true"></span><span class="pilaster pilaster--r" aria-hidden="true"></span>
    <div class="band__niche" aria-hidden="true">?                                   <!-- band--scene, or any band with a cut-out except band--photo -->
      <span class="band__arch"><img class="band__scene" src="{scene}" alt="" width height decoding="async"></span>   <!-- img only on band--scene -->
      <img class="band__cut[ band__cut--wide]" src="{cut}" alt="" width height loading="lazy" decoding="async" data-depth="-0.05" data-depth-max="16">?
    </div>
    <figure class="band__visual[ band__visual--left|--right]">?                       <!-- band--photo only -->
      <picture><source media="(max-width: 767px)" srcset="{mobile}" width height>?<img src="{photo}" alt="" width height fetchpriority="high" decoding="async"></picture>
    </figure>
    <img class="band__cut band__cut--photo[ band__cut--wide]" src alt="" width height loading="lazy" decoding="async" data-depth="-0.05" data-depth-max="16">?   <!-- band--photo with a cut-out -->
  </div>
</section>
```

Rules:
- Variant: `band--scene` only when the family scene resolves (`useGen` not null), else `band--plain` (glass rule).
- `band--has-cut` whenever a `band__cut` renders (it reserves the crossing margin under the band).
- `band__niche`: on `band--scene` (with or without a cut); on `band--plain` **only** when a cut-out renders (then
  `band__arch` is empty and CSS paints the flat dark ground: busts need a dark ground). Never on `band--photo`.
- **No `data-reveal` anywhere in the band** (it is above the fold on 348 pages; NEO-SPEC 7.3 #7). The band scene is
  never lazy (above the fold); the cut-out may be lazy (it crosses the edge, usually below the first paint line on
  phones).
- `aria-labelledby="page-title"` except on form pages (`named === false`, RA-07, glass rule kept).
- Glass `band__veil`, `band__rings`, `band__cut--rise` are not rendered.

### 3.2 Breadcrumbs (COMPONENTS C.2, kept)

```html
<nav class="crumbs" aria-label="Breadcrumb"><ol class="crumbs__list">
  <li class="crumbs__item"><a class="crumbs__link" href="{href}">{label}</a><span class="crumbs__sep" aria-hidden="true">&raquo;</span></li>
  <li class="crumbs__item"><span class="crumbs__link">{label with a dead href}</span><span class="crumbs__sep" aria-hidden="true">&raquo;</span></li>
  <li class="crumbs__item"><span class="crumbs__current" aria-current="page">{current}</span></li>
</ol></nav>
```

### 3.3 Frame per family (NEO-SPEC 3.24; has-aside rule, crumbs and rail exactly as COMPONENTS C.1)

| family (pages) | band | scene in the niche | cut-out (NEO-SPEC 6.3) | aside / rail | main column |
|---|---|---|---|---|---|
| home (1) | hero (5.3) | none | bust | none | sections 5.3-5.9 |
| service-hub (5) | `/eye-care-services/`: photo; others scene | `neo-scene-colonnade` | `neo-cut-eye-relief` (hub prefixes) | C.1 | sheets, index cards, `dock--row`, CTA band |
| service-detail (13) | scene | `neo-scene-colonnade` | 6.3 table | aside + rail | sheets, `fig--feature` |
| library-article (101) | scene (**new**, glass was plain) | `neo-scene-library` | `neo-cut-bust-profile` on the 13 section indexes | aside + rail | sheets, `linkrow--toc`, index cards |
| eyewear-contacts (47) | 4 hubs photo; others scene | `neo-scene-arch-garden` | `neo-cut-hand-spectacles` (brand pages none) | C.1 | sheets, logo grids, QR plate |
| insurance (4) | `/insurance/` photo; children scene | `neo-scene-colonnade` | none | children | logo grid, CTA band, index cards |
| contact-forms (6) | `/hours-location/` photo; others scene | `neo-scene-colonnade` | none | C.1 | forms, doc cards, visit block, payment accordion |
| blog-index (1) | scene | `neo-scene-library` | none | none (`is-solo`) | post cards |
| blog-post (151) | plain + date pill | none | none | aside | prose sheets |
| doctor-team, staff, legal, testimonials, archive, platform-artefact | as glass | none | none | C.1 | team card, sheets, review grid, index cards |
| 404 (`/404-page-not-found/`, `404.html`) | plain | none | `sheet__cut` `neo-cut-eye-relief` | none | 3.8 |

A page whose main text trips the build exclusions (brand names, "Dr. Clifton", "Deana", "Ask Dr.", brand logos in
main) renders `band--plain` without a niche (no scene, no cut), exactly as glass.

### 3.4 Content column (COMPONENTS C.4, emitted by `src/build.mjs`, unchanged)

```html
<div class="page-main" data-stagger>
  <section class="sheet glass glass--light is-flat" data-reveal="up"><div class="prose">{h2?}{D content}</div></section>   <!-- first 12 reveal -->
  <h2 class="section-title">{heading}</h2>                                                                             <!-- heading before a composed block -->
  <div class="section-head"><h2 class="section-title">…</h2><h3 class="section-title--sub">…</h3></div>
  {composed components between sheets, in source order: 3.5, 3.6, 4}
</div>
```

`.glass`, `.glass--light`, `.is-flat` on the sheet are inert in neo: the sheet is styled by `.sheet` only.

### 3.5 Interior components rendered by the neo `T` (same API as glass, neo markup)

```html
<!-- index cards (F.1) -->
<ul class="index-cards" data-stagger>
  <li class="index-card"[ data-reveal="rise"]>                                  <!-- first 12 -->
    <span class="index-card__thumb"><img src alt="" width height loading="lazy" decoding="async"></span>?
    <p class="index-card__title"><a class="index-card__link" href="{href}">{title}</a></p>
    <p class="index-card__summary">{summary}</p>?
    <span class="index-card__go" aria-hidden="true">{icon arrow}</span>
  </li>
</ul>
<!-- blog post cards (F.2) -->
<ul class="post-cards">
  <li class="post-card"[ data-reveal="up"]>
    <h2 class="post-card__title"><a class="post-card__link" href="{href}">{title}</a></h2>
    <p class="date-pill">{icon clock}<time datetime="{iso}">{date}</time></p>?
    <p class="post-card__excerpt">{excerpt}</p>?
    <a class="more" href="{href}" aria-label="{source label}">Read&nbsp;More{icon arrow}</a>?
  </li>
</ul>
<!-- testimonial stele (F.3): no quote glyph -->
<figure class="review">
  <p class="stars" role="img" aria-label="{n} out of 5 stars">{icon star × n}</p>
  <blockquote class="review__text">{source <p>s}</blockquote>
  <figcaption class="review__by">- {name}</figcaption>
</figure>
<!-- CTA band (B.22) -->
<div class="cta-band">
  <span class="cta-band__frame" aria-hidden="true"></span>
  <p class="cta-band__actions"><a class="btn btn--invert" href="{href}"[ target="_blank" rel="noopener"]>{label, numbers in span.nobr}{icon arrow}</a>…</p>
</div>
<!-- doc cards, team card (F.4) -->
<ul class="doc-cards"><li class="doc-card"><a class="doc-card__link" href="{pdf}" type="application/pdf">{icon doc}<span class="doc-card__label">{label}</span></a>{after?}</li></ul>
<article class="team-card" aria-labelledby="team-1">
  <figure class="team-card__photo"><img src alt="{alt}" width="225" height="397" loading="lazy" decoding="async"></figure>?
  <h2 class="team-card__name" id="team-1">{name}</h2>
  <a class="more" href="{href}">{source link text}{icon arrow}</a>?
</article>
<!-- accordion (F.6), closed by default -->
<div class="accordion" data-accordion>
  <details class="qa__item"[ open]><summary class="qa__q"><span class="qa__text">{text}</span><span class="qa__icon" aria-hidden="true"></span></summary><div class="qa__a">{answer}</div></details>
</div>
<!-- payment row (B.21) -->
<ul class="pay-row"><li class="pay-row__item"><img src alt="{source alt}" width height loading="lazy" decoding="async"></li>…</ul>
```

### 3.6 Visit block on `/hours-location/` and `/location/*` (T.visit; NEO-SPEC 3.11 without column and medallion)

```html
<section class="visit visit--page">
  <div class="visit__grid" data-stagger>
    <div class="map-plate" data-reveal="up">?
      <div class="map"><iframe class="map__frame" src="{keyless}" title="Google map" loading="lazy"></iframe></div>
      <span class="map-plate__ledge" aria-hidden="true"></span>
    </div>
    <div class="nap nap--stele" data-reveal="up">
      <p class="nap__title"><a href>{title}</a></p>?  <p class="nap__sub">{sub}</p>?
      <p class="nap__addr">{icon pin}<span>{lines}</span></p>?  <p class="nap__phone">{icon phone}<span>{label} <a href="tel:…">{phone}</a></span></p>?
      {2.9 dl.hours}?
    </div>
  </div>
</section>
```

No `.wrap` inside (it sits in the content column); the grid lays out by its own width (container query on
`.visit`). The home block (5.9) is the same component plus `deco`, the section head, the column, the magnifier,
the medallion and the emergency tile.

### 3.7 Pagination (COMPONENTS F.5): reserved, not built. If approved, the markup is F.5's; `site.css` already styles
`nav.pagination`, `ol.pagination__list`, `a.pagination__link`, `span.pagination__current[aria-current]`.

### 3.8 404 (COMPONENTS F.7; the sheet is emitted by `src/build.mjs`)

```html
{3.1 band--plain, h1 "404", no crumbs on 404.html}
<div class="page-main">
  <section class="sheet sheet--404 glass glass--light is-flat">
    <img class="sheet__cut" src="{neo-cut-eye-relief}" alt="" width height loading="lazy" decoding="async" data-depth="-0.05" data-depth-max="16">?
    <div class="prose">{source copy, 404.png as figure.fig.fig--plate}</div>
  </section>
</div>
```

## 4. What the shared pipeline emits -> how the neo theme styles or wraps it

No pipeline change is needed. Everything below is styled by class in `src/themes/neo/styles/site.css`; the
`glass*` / `is-flat` / `is-solid` tokens are ignored.

| emitted by | markup | neo treatment |
|---|---|---|
| build.mjs `sheet()` | `section.sheet.glass.glass--light.is-flat[data-reveal=up] > div.prose` | paper plate, inset 7px hairline `marble-300`, `--n-e-plate`, square; 24px apart; reveal `up` = the slow rise |
| build.mjs | `h2.section-title`, `div.section-head > .section-title + .section-title--sub` | display 75% `--n-h2-prose` `slate-700` with a 48px double rule under it; `--sub` text 600 `--n-h3` |
| build.mjs | `span.nobr` (phone numbers, spaced capitals, dash + word) | `white-space: nowrap` (same rule as `.nw`) |
| content.mjs | prose `h2`-`h6` (ids only when targeted) | h2 display 75% `--n-h2-prose` `slate-700`, `scroll-margin-top`; h3 text 600; h4-h6 text 700 |
| content.mjs | `p`, `ul`, `ol[start]`, `li`, `dl/dt/dd`, `blockquote`, `hr`, `address`, `pre/code`, `strong/em/…` | measure 59ch; ul green-600 diamonds; ol decimal 600; blockquote 4px double rule + `marble-100`; hr centred double rule |
| content.mjs | prose `a` (external `target/rel`) | `green-700`, one hairline at rest, second on hover/focus |
| build.mjs `markProse` | `p.linkrow`, `p.linkrow.linkrow--toc` | a ruled row of links split by small diamonds; each link ≥ 24px tall |
| build.mjs `markProse` | `p.attribution` | `--n-sm` `ink-600` |
| content.mjs + build.mjs | `div.table-scroll[role=region][tabindex=0][aria-label] > table` | the region scrolls sideways inside the sheet; focus ring on the region; `th` on `marble-100`, double rule under `thead`, 1px row rules |
| build.mjs `markProse` | `div.embed.embed--video > iframe`, `div.embed.embed--map`, `div.embed` | 16:9 in a fine double frame; `--map` in the `poster-2` mat |
| content.mjs | `figure.fig.fig--photo.fig--start|--end > span.fig__media > img` (a link may wrap the img inside `fig__media`) | fine double frame, breaks out of the sheet padding on one side by `clamp(8px, 2.4vw, 36px)` |
| build.mjs | `figure.fig.fig--photo.fig--feature.fig--start` (the `svc-*` stand-ins) | same frame, full width of the prose column |
| content.mjs | `figure.fig.fig--plate` (+ `figcaption`) | paper plate, 12px padding, inset hairline; floats right at 44% from 900px |
| content.mjs | `figure.fig.fig--portrait` | arch mask, 225 CSS px max, never protrudes |
| content.mjs | `figure.fig.fig--diagram` | white plate, never filtered, tinted or arch-masked, no break-out |
| content.mjs | `figure.fig.fig--brand` | as-is, no break-out, no frame effects |
| content.mjs | `div.fig-grid[data-count]` | 2-4 columns by count; figures inside lose break-out and float |
| content.mjs | inline `img` inside `p/li/a/td` | `display: inline-block`, `max-width: 100%`, never upscaled |
| content.mjs / build.mjs `raw` | `ul.logo-grid[data-count] > li.logo-chip[.logo-chip--link > a.logo-chip__link] > img`, `span.logo-chip__name` | paper chips, inset hairline, min-height 104px; logos T0 at intrinsic size, `max-height: 70px`; only `--link` has states |
| content.mjs | `ul.pay-row > li.pay-row__item > img` | inline row of 51 x 32 icons |
| content.mjs | `figure.qr-plate > img` | paper plate at the QR's intrinsic 250px |
| forms.mjs via build.mjs | `section.sheet.sheet--form.glass.glass--light > form.form[data-form]` | paper plate; `form__grid` 2 columns from 768px |
| forms.mjs | `div.form__intro`, `div.form__grid`, `div.field(.field--wide)[data-show-if]`, `fieldset.field.field--group`, `fieldset.field.field--choice`, `legend/label.field__label`, `span.field__req`, `.field__control` (input/select/textarea), `div.field__row`, `div.field__sub`, `label.field__sublabel`, `p.field__help`, `p.field__error[data-field-error][hidden] > svg.ico + span.field__error-text`, `div.choice > input.choice__input + label.choice__label` | NEO-SPEC 3.19: square paper controls, 1px `ink-500`, 48px; drawn 22px radios on `choice__label::before`; invalid = `alert` boundary + `alert-50`; `[hidden]` fields stay hidden |
| forms.mjs | `div.form__foot > p.form__notice.glass.glass--leaf[role=status][tabindex=-1][data-form-notice][hidden] + button.btn.btn--primary` | the honest notice: `green-50` plate, 4px double `green-700` rule on the left, `ink-900` text |
| build.mjs `testimonials` | `ul.rev-grid[data-stagger] > li[data-reveal=up] > figure.review` / one `figure.review` in a `section.sheet` | light stelae (3.5) in a `minmax(300px, 1fr)` grid |
| build.mjs `hours` | `div.sheet.glass.glass--light.is-flat > dl.hours` | plate holding 2.9 |
| build.mjs | `div.page-main[data-stagger]`, `div.page-grid`, `main#main` | the interior grid; `main` passes its columns through (subgrid) as glass |
| build.mjs 404 | `section.sheet.sheet--404 > img.sheet__cut + div.prose` | the relief breaks the sheet's top-right frame by 48px |

## 5. Home

### 5.1 HOME CONTRACT (verbatim, unchanged from the glass theme)

```text
HOME CONTRACT (shared by the pipeline and design agents):
src/lib/home.mjs exports function buildHome(ctx) returning the HTML placed inside <main id="main"> of the homepage. ctx = { raw: string of audit/raw/index.html, depth: 0, esc(s), plain(html), localHref(href, depth) -> page-relative href | null (null = dead internal target: caller keeps the words, drops the link), src(pattern) -> { url, w, h, alt } for a SOURCE image whose original src matches the RegExp/string (throws if absent), gen(id) -> { url, w, h, alt } | null for a GENERATED image id of src/content/image-plan.json (null while not generated: render without it and call fail), chrome: parsed src/content/chrome.json (name, NAP, phone, hours, menus, social), icon(name) -> inline SVG string, fail(stage, target, reason), stats }. The pipeline builds ctx and imports home.mjs dynamically inside try/catch (a broken or missing home.mjs falls back to a stub that renders the home content through the generic content pipeline, and is listed as a build failure). $CEC_DIST overrides the output directory (default dist/).
```

For the neo theme the module is `src/themes/neo/home.mjs` (`TH.home`), `gen(id)` takes the `neo-*` ids of
`audit/generated-images.json`, and the output directory is `dist-neo/` (or `$CEC_DIST`). Additions binding on the
neo `buildHome` (as glass G.1): only the 7 sections below, in this order; every text run and image of the raw home
`<main>` lands in a slot or is reported through `ctx.fail('home:leftover', '/', …)`; `ctx.src` throwing is a build
failure. **Generated images only in the hero, on the Welcome/Services seam, in What's New and in Visit** (the
section-level exclusion of NEO-SPEC 6.1: none in #HappyPatients, #HeretoHelp or Designer).

### 5.2 Section order and sources

| # | section | raw rows (`data-node`) | numeral | N0 ground |
|---|---|---|---|---|
| 1 | `section.hero` | `5ded9754972ce` (3 heading lines, row background photo) + `5ded9754977e9` (4 badges) | I | `deco--dark` |
| 2 | `section.welcome` | `5ded975497569` (h1) + `5df6091f63e9d` (promo, What's New, practice copy) | II | `deco--light` |
| 3 | `section.services` | `5ded97549790b` (title, 4 gallery tiles) | III | flat `green-100` |
| 4 | `section.reviews` | `5ded975498007` (#HappyPatients, 3 smile PNGs, 3 testimonials, button) | IV | `deco--dark` |
| 5 | `section.help` | `5ded975497aee` (#HeretoHelp, Q&A; the empty team module drops) | V | `deco--light` |
| 6 | `section.designer` | `5ded9754987c6` ("Our Designer Optical", 4 callouts) | VI | flat `green-500` band |
| 7 | `section.visit` | `5ded975497d41` (map, NAP and hours, emergency) | VII | `deco--light` |

Heading outline (glass QA kept): the only `h1` is the Welcome heading; `h2`: promo title (RA-05), "What's New!",
"Our Most Popular Services", "#HappyPatients", "#HeretoHelp", "Ask Dr. Deana Clifton a Question...", "Our Designer
Optical"; `h3`: the news post title, the four service names (VH-03), "Our Product Offerings:", "Is it an Emergency?".

### 5.3 Hero (NEO-SPEC 3.3)

```html
<section class="hero">
  <div class="deco deco--dark" aria-hidden="true"></div>
  <div class="hero__frame" aria-hidden="true">{4 x svg.star.star--tl|tr|bl|br}</div>
  <div class="wrap hero__grid">
    <div class="pediment pediment--hero" aria-hidden="true">{svg polyline}<span class="numeral">I</span></div>
    <span class="cornice" aria-hidden="true"></span>
    <span class="pilaster pilaster--l" aria-hidden="true"></span><span class="pilaster pilaster--r" aria-hidden="true"></span>
    <p class="hero__statement">
      <span class="hero__line hero__line--1">{row 0 heading 1}</span>
      <span class="hero__line hero__line--2">{row 0 heading 2}</span>
      <span class="hero__line hero__line--accent">{row 0 heading 3}</span>
    </p>
    <figure class="hero__photo"><span class="hero__photo-in" data-reveal="settle"><img src="{row 0 background photo}" alt="" width height fetchpriority="high" decoding="async"></span></figure>
    <img class="hero__cut" src="{gen neo-cut-bust-glasses}" alt="" width height decoding="async">?
    <span class="hero__pedestal" aria-hidden="true"></span>
    <div class="hero__stylobate" aria-hidden="true"><span class="meander"></span></div>
    <nav class="dock dock--portico" aria-label="Quick actions">{4 x 2.6 tiles, no data-reveal}</nav>
  </div>
</section>
```

`p.hero__statement` is `display: contents` in CSS, so its three lines are items of the `hero__grid` grid (a
`<figure>` may not sit inside a `<p>`, so the photo and the bust are siblings of the statement, not children).
No section label; no parallax on the bust or the photo; no `data-reveal` except the non-hiding settle.

### 5.4 Welcome (NEO-SPEC 3.7)

```html
<section class="welcome" aria-labelledby="welcome-h">
  <div class="deco deco--light" aria-hidden="true"></div>
  <div class="wrap">
    <div class="sec-head sec-head--welcome" data-reveal="up">
      <div class="pediment" aria-hidden="true">{svg}<span class="numeral">II</span></div>
      <h1 class="section-title section-title--center welcome__h" id="welcome-h">Welcome to Clifton Eye Center <span class="welcome__place">in Bossier City, Louisiana</span></h1>
      <div class="divider" aria-hidden="true">…</div>
    </div>
    <div class="welcome__grid">
      <div class="welcome__side">
        <article class="promo plate" data-reveal="up">
          <figure class="promo__img arch"><span class="arch__photo" data-reveal="arch"><img src="{promo photo}" alt="" width height loading="lazy" decoding="async"></span></figure>
          <h2 class="promo__title">{source promo line}</h2>
          <p>{source paragraph with the Promotions link}</p>
        </article>
        <section class="news plate" data-reveal="up" aria-labelledby="news-h">
          <img class="news__cut" src="{gen neo-cut-hand-spectacles}" alt="" width height loading="lazy" decoding="async">?
          <h2 class="news__h" id="news-h">What's New!</h2>
          <article class="news__post">
            <h3 class="news__title"><a href="{post}">{title}</a></h3>
            <p class="news__date date-pill">{icon clock}<time datetime="2019-11-26">Nov 26, 2019</time></p>
            <p class="news__excerpt">{excerpt}</p>
            <a class="more" href="{post}" aria-label="{source aria-label}">Read&nbsp;More{icon arrow}</a>
          </article>
        </section>
      </div>
      <div class="welcome__main plate" data-reveal="up">
        <p class="lead">{p1}</p><p>{p2-p4 with links}</p>
        <ul class="feature-list" data-stagger><li data-reveal="up"><strong>{lead term}</strong>{dash + rest verbatim}</li>…</ul>
        <h3 class="offer-h">Our Product Offerings:</h3>
        <ul class="offer-list"><li>{item}</li>…</ul>
        <p class="closing"><a href="{contact}">Contact our eye care clinic</a> today to find out how we can help.</p>
      </div>
    </div>
  </div>
</section>
```

### 5.5 Services (NEO-SPEC 3.6)

```html
<section class="services" aria-labelledby="svc-h">
  <img class="services__relief" src="{gen neo-cut-eye-relief}" alt="" width height loading="lazy" decoding="async" data-depth="-0.04" data-depth-max="16">?
  <div class="wrap services__in">
    <div class="sec-head" data-reveal="up">
      <div class="pediment" aria-hidden="true">{svg}<span class="numeral">III</span></div>
      <h2 class="section-title section-title--center" id="svc-h"><a class="title-link" href="{source href}"[ target="_blank" rel="noopener"]>Our Most Popular Services{icon arrow}</a></h2>
      <div class="divider" aria-hidden="true">…</div>
    </div>
    <ul class="svc-grid" data-stagger>
      <li data-reveal="rise">
        <a class="svc" href="{tile href}">
          <span class="svc__frame arch"><span class="arch__photo" data-reveal="arch"><img src alt="" width height loading="lazy" decoding="async"></span></span>
          <div class="svc__foot"><h3 class="svc__name">{source caption}</h3><span class="svc__go">{icon arrow}</span></div>
        </a>
      </li> …
    </ul>
  </div>
</section>
```

Tiles in source order; per-photo `object-position` is CSS (`.svc-grid > li:nth-child(n)`), never an inline style.
No `data-tilt`.

### 5.6 Reviews (NEO-SPEC 3.8)

```html
<section class="reviews">
  <div class="deco deco--dark" aria-hidden="true"></div>
  <div class="smiles" aria-hidden="true">
    <span class="smile smile--a" data-depth="-0.04" data-depth-max="14"><img src alt="" width height loading="lazy" decoding="async"></span>
    <span class="smile smile--b" data-depth="-0.06" data-depth-max="18">…</span>
    <span class="smile smile--c" data-depth="-0.04" data-depth-max="14">…</span>
  </div>
  <div class="wrap">
    <div class="sec-head sec-head--tag" data-reveal="up">
      <span class="arch-mark" aria-hidden="true"><span class="numeral">IV</span></span>
      <div class="tag-row">
        <svg class="laurel-sprig" …><use href="#o-sprig"/></svg>
        <h2 class="tag-title" id="rev-h" data-settle><span class="hash">#</span>HappyPatients</h2>
        <svg class="laurel-sprig laurel-sprig--r" …><use href="#o-sprig"/></svg>
      </div>
    </div>
    <div class="reviews__stage">
      <section class="rev-carousel" aria-roledescription="carousel" aria-labelledby="rev-h" data-carousel>
        <div class="rev-track" role="group" aria-labelledby="rev-h" tabindex="0" data-carousel-track>
          <div class="rev-slide" role="group" aria-roledescription="slide" aria-label="1 of 3" data-reveal="up">{3.5 figure.review}</div> …
        </div>
        <div class="rev-nav">
          <button class="round-btn rev-nav__btn rev-nav__btn--prev" type="button" data-carousel-prev hidden>{icon chev}<span class="sr">Previous slide</span></button>
          <button class="round-btn rev-nav__btn rev-nav__btn--next" type="button" data-carousel-next hidden>{icon chev}<span class="sr">Next slide</span></button>
        </div>
      </section>
      <p class="reviews__more" data-reveal="up"><a class="btn btn--primary" href="{source}" target="_blank" rel="nofollow noopener">Read More Reviews{icon arrow}</a></p>
    </div>
  </div>
</section>
```

`div.smiles` is a **direct child of the section** (not in `.wrap`): it straddles the Services/reviews seam at
`z-index: 4`. The smiles are never paired with a quote (L04).

### 5.7 #HeretoHelp (NEO-SPEC 3.9)

```html
<section class="help" aria-labelledby="help-h">
  <div class="deco deco--light" aria-hidden="true"></div>
  <div class="wrap">
    <div class="sec-head sec-head--tag" data-reveal="up">
      <span class="arch-mark" aria-hidden="true"><span class="numeral">V</span></span>
      <h2 class="tag-title help__tag" id="help-h"><span class="hash">#</span>HeretoHelp</h2>
    </div>
    <div class="help__grid">
      <span class="help__niche" aria-hidden="true"><svg class="help__ring" focusable="false"><use href="#o-badge"/></svg><svg class="help__patera" focusable="false"><use href="#o-rosette"/></svg></span>
      <div class="qa plate" data-reveal="up">
        <h2 class="qa__h">{source question heading}</h2>
        <div class="qa__list" data-accordion>
          <details class="qa__item" open><summary class="qa__q"><span class="qa__text">{q}</span><span class="qa__icon" aria-hidden="true"></span></summary><div class="qa__a"><p>{answer}</p><p><a href="{dry eye}">More about Dry Eyes...</a></p></div></details>
          {items 2-3 without open}
        </div>
      </div>
    </div>
  </div>
</section>
```

No generated image in this section (its text names "Ask Dr." and "Dr. Deana Clifton").

### 5.8 Designer optical (NEO-SPEC 3.10)

```html
<section class="designer" aria-labelledby="des-h">
  <div class="wrap designer__grid">
    <div class="designer__head" data-reveal="up">
      <span class="numeral numeral--band" aria-hidden="true">VI</span>
      <span class="pilaster pilaster--l" aria-hidden="true"></span>
      <h2 class="designer__title" id="des-h">Our Designer Optical</h2>
      <span class="pilaster pilaster--r" aria-hidden="true"></span>
    </div>
    <ul class="brands" data-stagger>
      <li data-reveal="rise"><a class="brand" href="{href}"><span class="brand__img"><img src alt="{source alt}" width="250" height="300" loading="lazy" decoding="async"></span><span class="brand__name">KAENON</span></a></li> …
    </ul>
  </div>
</section>
```

The ads are T0: never cropped, masked, filtered or arch-framed. No generated image.

### 5.9 Visit (NEO-SPEC 3.11)

```html
<section class="visit">
  <div class="deco deco--light" aria-hidden="true"></div>
  <div class="wrap">
    <div class="sec-head sec-head--quiet" aria-hidden="true"><span class="numeral">VII</span><div class="divider">…</div></div>
    <div class="visit__grid" data-stagger>
      <div class="map-plate" data-reveal="up">
        <div class="map"><iframe class="map__frame" src="{keyless map url}" title="Google map" loading="lazy"></iframe></div>
        <span class="map-plate__ledge" aria-hidden="true"></span>
        <img class="visit__magnifier" src="{gen neo-cut-magnifier}" alt="" width height loading="lazy" decoding="async">?
      </div>
      <img class="visit__column" src="{gen neo-cut-column}" alt="" width height loading="lazy" decoding="async">?
      <div class="nap nap--stele" data-reveal="up">
        <span class="nap__medal" aria-hidden="true"><img class="nap__laurel" src="{gen neo-cut-laurel}" alt="" width height loading="lazy" decoding="async">?<svg class="nap__ring" focusable="false"><use href="#o-badge"/></svg><svg class="nap__rosette" focusable="false"><use href="#o-rosette"/></svg></span>
        <p class="nap__title"><a href="{location}">Clifton Eye Center</a></p>
        <p class="nap__addr">{icon pin}<span>{address lines}</span></p>
        <p class="nap__phone">{icon phone}<span><strong>Phone:</strong> <a href="tel:318-550-5815">318-550-5815</a></span></p>
        <dl class="hours" data-hours>{7 rows}</dl>
      </div>
      <div class="sos" data-reveal="up">
        <div class="sos__head"><span class="icon-tile">{icon case}</span><h3 class="sos__h">{source}</h3></div>
        <p>{source paragraph with its br and strong}</p>
        <a class="btn btn--alert" href="tel:318-550-5815">{icon phone}<span class="nobr">318-550-5815</span></a>
      </div>
    </div>
  </div>
</section>
```

The magnifier is inside `map-plate` (it lies on the ledge); the column is a grid item between the map plate and the
stele (1100+ only; hidden below). The medallion shows from 1100px.

## 6. Hooks, new classes, departures

### 6.1 site.js hook registry (COMPONENTS 1, with these changes)

| hook | on | site.js does | reduced motion / no JS |
|---|---|---|---|
| `data-reveal` = `up` \| `rise` \| `arch` \| `settle` | revealed blocks (never with `data-depth` on the same element) | IO `root: null, rootMargin: '0px', threshold: 0`; `is-in`; release after rise 1150 / arch 1500 / settle 1700 ms + i x 120 ms; fail-safe (3 s) only if no entry was ever delivered; releases pending reveals scrolled past (`bottom < 0`) on every scroll tick; releases all when `innerHeight > 2400`; `beforeprint` releases all; `focusin` reveals the focused block | `js-motion` never set: nothing hidden |
| `data-stagger` | list/grid container | `--i` = index mod 6 on its direct reveal members (a reveal nested inside another reveal inherits its host's `--i`) | none |
| `data-depth` + `data-depth-max` (required, ≤ 32) | relief, smiles, band and 404 cut-outs | one rAF passive scroll handler writes `--py` on the element (changed values only); k = .55 below 700px; skip layers > 1.5 viewports away; re-measure on load, fonts.ready, resize, `toggle` and body resize; rest at 0 above 2400px tall | not written |
| `data-settle` | the #HappyPatients title (one per page) | writes `--settle` (0..1) on that element, 1024px+ only | not written (CSS default 1) |
| `data-header` | `div.site-header` | `is-scrolled` above 40px | none |
| `.progress span` | the header rule | `--scroll` (0..1) on the span itself | still tracks (feedback, not motion) |
| `data-drawer`, `data-drawer-open`, `data-drawer-close` | drawer, menu button, close button, scrim | glass contract: `hidden` off, `is-open`, `aria-expanded`, `inert` on `div.page`, `html.is-locked` (scroll lock), focus trap, Esc, focus restore, desktop hand-off | drawer stays hidden |
| `data-accordion` | `details` groups | print opens all, afterprint restores | native |
| `data-rail` | `details.rail` | open from 1024px, closed below, live | closed |
| `data-sticky-fit` | `aside.page-aside` | `is-sticky` while it fits | static |
| `data-carousel`, `-track`, `-prev`, `-next` | home reviews | glass contract (buttons below 1024px, `aria-disabled` at the ends, track tabbable only below 1024px, height follows the card in view) | native scroll |
| `data-hours`, `data-day` | `dl.hours` | `is-today` on today's row | none |
| `data-form`, `data-form-notice`, `data-field-error`, `data-show-if` | forms | glass contract (never sends; validation; notice; conditional fields disabled while hidden) | native validation |
| `data-count` | logo grids, fig grids | not read (CSS only) | n/a |

Not defined in neo: `data-tilt`, `data-rot`, `data-hero`, the `.glass` pointer specular, `html.is-scrolling`.
`window.__siteReady = true` is site.js's first statement.

### 6.2 New classes (neo only) and non-visible labels

- Shell and chrome: `div.ground`; `span.nw`; `mainnav__list--l`, `mainnav__list--r`; `div.site-header__actions`,
  `a.site-header__call`, `a.site-header__appt`; `dock--portico`, `svg.dock__ring`, `span.dock__go`;
  `rail__summary-text`; `footer__frieze`, `footer__bays`, `footer__col--l`, `footer__col--r`.
- Ornaments: `div.pediment`, `pediment--hero`, `pediment--footer`; `span.cornice`; `span.numeral`, `numeral--band`;
  `div.divider`; `span.arch-mark`; `span.pilaster`, `pilaster--l`, `pilaster--r`; `svg.star`, `star--tl|tr|bl|br`;
  `span.meander`; `svg.laurel-sprig`, `laurel-sprig--r`; `svg.orn`; `.deco--light|--dark|--deep`.
- Home: `hero__frame`, `hero__grid`, `hero__line--1`, `hero__line--2`, `hero__pedestal`, `hero__stylobate`;
  `div.sec-head`, `sec-head--welcome`, `sec-head--tag`, `sec-head--quiet`; `div.tag-row`; `.plate`; `span.arch`,
  `span.arch__photo`; `news__cut`; `services__relief`; `help__niche`, `help__ring`, `help__patera`; `designer__head`;
  `map-plate`, `map-plate__ledge`; `visit__magnifier`, `visit__column`; `nap--stele`, `nap__medal`, `nap__laurel`,
  `nap__ring`, `nap__rosette`.
- Interior: `band__frame`, `band__divider`, `band__niche`, `band__arch`, `band--has-cut`, `band__cut--photo`;
  `cta-band__frame`; `visit--page`.
- Kept glass names restyled (no change in markup): everything else in sections 2-5.
- Non-visible labels: COMPONENTS H.2, with "Quick actions" (RA-07) for every quick-action nav; no new label.

### 6.3 Departures (with reasons)

1. **"Quick actions", not "Quick links"** on the hero and aside docks (NEO-SPEC 3.3, 3.4 say "Quick links"): the glass
   QA fix RA-07 (two landmarks named alike with the footer's "Quick Links" nav) applies to neo too.
2. **Promo title `h2`, service names `h3` in `div.svc__foot`, `rev-track[role=group]`** (glass RA-05, VH-03, RA-09):
   the post-contract glass fixes carry over; COMPONENTS G still shows the older markup.
3. **`--scroll` on `.progress span`, not `<html>`** (NEO-SPEC 5.3): an inherited property written per frame on
   `<html>` restyles the whole document (glass QA RA-02).
4. **`p.hero__statement` is `display: contents`** and the photo, bust, pedestal and dock are its siblings (NEO-SPEC
   3.3 already lists them as siblings): a `<figure>` cannot live inside a `<p>`.
5. **No parallax on figures that rest on something**: the bust (spec), the NAP medallion (spec), and also the What's
   New hand (it rests 12px into the frame), the column (it stands on the ground with a contact shadow) and the
   magnifier (it lies on the ledge and must never drift over the iframe). NEO-SPEC 5.3 lists the last three as
   parallax figures; its own rule "parallax may never erase a protrusion" (4) caps them at ≤ 40% of a 12px rest
   offset, i.e. ≤ 5px, which is not visible motion. Parallax stays on the relief, the smiles, the band cut-out and
   the 404 relief.
6. **`band__niche` only when there is something to stand in it**; `band--photo` places its cut-out beside the visual
   (`band__cut--photo`) instead of in a niche (the photo is the band's picture; a second arch beside it would compete).
7. **Phone numbers:** `span.nw` outside `<main>` (templates), `span.nobr` inside (the existing shared pass), never
   both (NEO-SPEC 3.0 asked for one `T.page` pass over the whole page; the shared pass already covers `<main>`).
8. **The footer carries no `data-reveal`** (glass revealed `footer__panel`, which neo does not render).

END OF CONTRACT
