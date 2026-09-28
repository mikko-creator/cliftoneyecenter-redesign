/* templates.mjs - the redesign's page shell, chrome and interior components, markup exactly as
   docs/COMPONENTS.md (the binding markup contract) specifies: A (shell), B (chrome, dock, aside, rail,
   logo grids, CTA band), C (title band, content column), E (forms), F (cards, reviews, accordion, 404).
   Every visible string is the source's own (src/content/chrome.json, the page's content) or one of the
   non-visible accessibility labels COMPONENTS.md H.2 lists. Started from the friscoeyesource
   reference templates.mjs; the markup is new (the contract replaced it). */
import { esc } from './util.mjs';

/* Icon sprite (COMPONENTS 0): the first 14 paths copied from tmp/lab/canopy/index.html lines 33-46
   (i-fb = the lab's i-fb); alert and doc are new line icons in the same style. */
const SYMBOLS = {
  pin: '<path d="M12 21s-7-6.1-7-11.5a7 7 0 0 1 14 0C19 14.9 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  phone: '<path d="M5.2 4h3.3l1.7 4.4-2.2 1.4a11 11 0 0 0 6.2 6.2l1.4-2.2 4.4 1.7v3.3a1.6 1.6 0 0 1-1.7 1.6A16.4 16.4 0 0 1 3.6 5.7 1.6 1.6 0 0 1 5.2 4z"/>',
  mail: '<rect x="3" y="5.5" width="18" height="13" rx="2.6"/><path d="m4 7.5 8 5.8 8-5.8"/>',
  form: '<path d="M11 4.5H6.8A2.5 2.5 0 0 0 4.3 7v10.4a2.5 2.5 0 0 0 2.5 2.5h10.4a2.5 2.5 0 0 0 2.5-2.5V13"/><path d="M18.3 3.8a2 2 0 0 1 2.9 2.9l-8.6 8.6-3.6.8.8-3.6z"/>',
  cart: '<path d="M2.8 4h2.4l2.4 11h10.2l2.1-8H6.3"/><circle cx="9.6" cy="19.2" r="1.4"/><circle cx="17" cy="19.2" r="1.4"/>',
  star: '<path d="M12 2.8l2.85 5.78 6.37.93-4.61 4.49 1.09 6.35L12 17.35l-5.7 3 1.09-6.35-4.61-4.49 6.37-.93z"/>',
  chev: '<path d="m9 5.5 6.5 6.5L9 18.5"/>',
  arrow: '<path d="M4.5 12h15M13.5 6l6 6-6 6"/>',
  case: '<rect x="3" y="7" width="18" height="13" rx="2.6"/><path d="M9 7V5.6A1.6 1.6 0 0 1 10.6 4h2.8A1.6 1.6 0 0 1 15 5.6V7M12 10.2v6.4M8.8 13.4h6.4"/>',
  fb: '<path d="M13.6 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.6-1.5h1.6V4.3a21 21 0 0 0-2.4-.1c-2.4 0-4 1.4-4 4.1v2.1H7.8v3h2.6V21z"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h11"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  clock: '<circle cx="12" cy="12" r="8.6"/><path d="M12 7.4V12l3.1 2"/>',
  alert: '<path d="M12 3.6 21.2 19.6H2.8z"/><path d="M12 10v4.4M12 17.1v.2"/>',
  doc: '<path d="M7 3.5h7.2l4.3 4.3V20.5H7z"/><path d="M14 3.5v4.5h4.5M9.6 12.5h6.2M9.6 16h6.2"/>',
};
export const ICON_NAMES = Object.keys(SYMBOLS);
export const SPRITE = '<svg class="sprite" aria-hidden="true" focusable="false" width="0" height="0"><defs>'
  + ICON_NAMES.map((n) => '<symbol id="i-' + n + '" viewBox="0 0 24 24">' + SYMBOLS[n] + '</symbol>').join('') + '</defs></svg>';
export function icon(name) {
  if (!SYMBOLS[name]) throw new Error('icon not in the sprite: ' + name);
  return '<svg class="ico" aria-hidden="true" focusable="false"><use href="#i-' + name + '"/></svg>';
}
const QUOTE_PATH = 'M9.6 6C6.5 7 4.6 9.6 4.6 13v5h6v-6H7.7c.2-2 1.3-3.3 3-4zM19 6c-3.1 1-5 3.6-5 7v5h6v-6h-2.9c.2-2 1.3-3.3 3-4z';   /* tmp/lab/canopy/index.html line 294 */

/* the head motion script: tmp/lab/neighborhood/index.html line 9, __labReady renamed __siteReady (COMPONENTS A.1),
   preceded by the task's `js` class */
const HEAD_SCRIPT = '<script>document.documentElement.classList.add(\'js\');/* set before first paint so nothing flashes; removed again if site.js never runs */(function(d){try{if(!matchMedia("(prefers-reduced-motion: reduce)").matches&&"IntersectionObserver" in window){d.classList.add("js-motion");setTimeout(function(){if(!window.__siteReady)d.classList.remove("js-motion")},4000)}}catch(e){}})(document.documentElement);</script>';

const DAY_INDEX = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
const MONTHS = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' };
export function isoDate(d) {
  const m = /^([A-Z][a-z]{2})\s+(\d{1,2}),\s*(\d{4})$/.exec(String(d || '').trim());
  return m && MONTHS[m[1]] ? m[3] + '-' + MONTHS[m[1]] + '-' + m[2].padStart(2, '0') : '';
}

export function createTemplates({ chrome, localHref, imgUrl, logo }) {
  const H = (href, depth) => localHref(href, depth);
  const upOf = (depth) => (depth ? '../'.repeat(depth) : '');
  const tel = 'tel:' + chrome.phone;

  function head({ depth, title, description, robots, canonical, ogTitle, ogImage, lang, jsonLd, lcp, favicon, styles }) {
    const u = (p) => esc(upOf(depth) + p);
    return [
      '<!doctype html>',
      '<html lang="' + esc(lang || 'en-US') + '">',
      '<head>',
      '<meta charset="utf-8">',
      '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
      '<title>' + esc(title) + '</title>',
      description ? '<meta name="description" content="' + esc(description) + '">' : '',
      robots ? '<meta name="robots" content="' + esc(robots) + '">' : '',
      '<link rel="canonical" href="' + esc(canonical) + '">',
      '<meta name="theme-color" content="#759b2a">',
      '<meta property="og:type" content="website">',
      '<meta property="og:site_name" content="' + esc(chrome.brandName) + '">',
      '<meta property="og:title" content="' + esc(ogTitle || title) + '">',
      description ? '<meta property="og:description" content="' + esc(description) + '">' : '',
      '<meta property="og:url" content="' + esc(canonical) + '">',
      ogImage ? '<meta property="og:image" content="' + esc(ogImage) + '">' : '',
      '<meta name="twitter:card" content="' + (ogImage ? 'summary_large_image' : 'summary') + '">',
      ogImage ? '<meta name="twitter:image" content="' + esc(ogImage) + '">' : '',
      favicon ? '<link rel="icon" href="' + u(favicon.icon) + '" sizes="32x32" type="image/png">' : '',
      favicon && favicon.icon192 ? '<link rel="icon" href="' + u(favicon.icon192) + '" sizes="192x192" type="image/png">' : '',
      favicon && favicon.touch ? '<link rel="apple-touch-icon" href="' + u(favicon.touch) + '">' : '',
      '<link rel="preload" href="' + u('fonts/Fraunces-normal-latin.woff2') + '" as="font" type="font/woff2" crossorigin>',
      '<link rel="preload" href="' + u('fonts/NunitoSans-normal-latin.woff2') + '" as="font" type="font/woff2" crossorigin>',
      lcp ? '<link rel="preload" href="' + esc(lcp) + '" as="image" fetchpriority="high">' : '',
      HEAD_SCRIPT,
      '<link rel="stylesheet" href="' + u('fonts/fonts.css') + '">',
      ...(styles || ['brand.css', 'site.css']).map((f) => '<link rel="stylesheet" href="' + u('styles/' + f) + '">'),
      jsonLd || '',
      '</head>',
    ].filter(Boolean).join('\n');
  }

  function logoImg(depth, lazy) {
    return '<img src="' + esc(imgUrl(logo.rel, depth)) + '" alt="' + esc(chrome.logo.alt) + '" width="' + logo.w + '" height="' + logo.h + '"' + (lazy ? ' loading="lazy"' : '') + ' decoding="async">';
  }

  function topbar(depth) {
    const t = chrome.topbar;
    return [
      '<div class="topbar">',
      '<div class="wrap topbar__in">',
      '<a class="topbar__addr" href="' + esc(H(t.address.href, depth)) + '">' + icon('pin') + '<strong>' + esc(t.address.label) + '</strong></a>',
      '<div class="topbar__actions">',
      '<a class="band-pill band-pill--appt" href="' + esc(H(t.appointment.href, depth)) + '">' + icon('cal') + '<span>' + esc(t.appointment.label) + '</span></a>',
      '<a class="band-pill band-pill--call" href="' + esc(t.call.href) + '">' + icon('phone') + '<span>' + esc(t.call.label) + '</span></a>',
      '</div>',
      '</div>',
      '</div>',
    ].join('\n');
  }

  /* aria-current on the exact page; is-section on the top-level item whose path is a prefix of the current path */
  function navState(itemHref, curPath) {
    if (curPath === itemHref) return { cur: true, section: false };
    if (itemHref !== '/' && curPath.startsWith(itemHref)) return { cur: false, section: true };
    return { cur: false, section: false };
  }

  function header(depth, curPath) {
    const items = chrome.nav.map((it) => {
      const st = navState(it.href, curPath);
      return '<li class="mainnav__item"><a class="mainnav__link' + (st.section ? ' is-section' : '') + '" href="' + esc(H(it.href, depth)) + '"' + (st.cur ? ' aria-current="page"' : '') + '>' + esc(it.label) + '</a></li>';
    }).join('');
    const m = chrome.mobileHeader;
    return [
      '<header class="site-header" data-header>',
      '<div class="wrap">',
      '<div class="site-header__bar">',
      '<span class="site-header__glass glass glass--image" aria-hidden="true"></span>',
      '<a class="logo-plate" href="' + esc(H('/', depth)) + '" aria-label="' + esc(chrome.logo.homeLabel) + '">',
      '<span class="logo__box">' + logoImg(depth, false) + '</span>',
      '</a>',
      '<nav class="mainnav" aria-label="Primary">',
      '<ul class="mainnav__list">' + items + '</ul>',
      '</nav>',
      '<div class="mobile-actions">',
      '<a class="round-btn" href="' + esc(H(m.appointment.href, depth)) + '" aria-label="' + esc(m.appointment.label) + '">' + icon('cal') + '</a>',
      '<a class="round-btn" href="' + esc(m.call.href) + '" aria-label="' + esc(m.call.label) + '">' + icon('phone') + '</a>',
      '<button class="round-btn round-btn--menu" type="button" aria-expanded="false" aria-controls="drawer" data-drawer-open>' + icon('menu') + '<span class="sr">' + esc(m.menuOpen) + '</span></button>',
      '</div>',
      '</div>',
      '</div>',
      '</header>',
    ].join('\n');
  }

  function drawer(depth, curPath) {
    const t = chrome.topbar;
    const items = chrome.nav.map((it) => {
      const st = navState(it.href, curPath);
      return '<li class="drawer__item"><a class="drawer__link' + (st.section ? ' is-section' : '') + '" href="' + esc(H(it.href, depth)) + '"' + (st.cur ? ' aria-current="page"' : '') + '>' + esc(it.label) + '</a></li>';
    }).join('');
    return [
      '<nav class="drawer glass glass--image" id="drawer" aria-label="Primary" data-drawer hidden>',
      '<button class="round-btn drawer__close" type="button" data-drawer-close>' + icon('close') + '<span class="sr">' + esc(chrome.mobileHeader.menuClose) + '</span></button>',
      '<ul class="drawer__list">' + items + '</ul>',
      '<div class="drawer__actions">',
      '<a class="band-pill band-pill--appt" href="' + esc(H(t.appointment.href, depth)) + '">' + icon('cal') + '<span>' + esc(t.appointment.label) + '</span></a>',
      '<a class="band-pill band-pill--call" href="' + esc(t.call.href) + '">' + icon('phone') + '<span>' + esc(t.call.label) + '</span></a>',
      '</div>',
      '</nav>',
      '<div class="scrim" data-drawer-close hidden></div>',
    ].join('\n');
  }

  function footer(depth) {
    const f = chrome.footer;
    const n = f.nap;
    const col = (c, id) => '<nav class="footer__col" aria-labelledby="' + id + '">\n<p class="footer__h" id="' + id + '">' + esc(c.title) + '</p>\n<ul class="footer__list">' + c.links.map((l) => '<li><a href="' + esc(H(l.href, depth)) + '">' + esc(l.label) + '</a></li>').join('') + '</ul>\n</nav>';
    const legal = f.util.map((l) => '<li><a href="' + esc(/\.xml$/.test(l.href) ? upOf(depth) + l.href.replace(/^\//, '') : H(l.href, depth)) + '">' + esc(l.label) + '</a></li>').join('');
    const social = f.social.map((s) => '<a class="social" href="' + esc(s.href) + '" aria-label="' + esc(s.label) + '" target="_blank" rel="noopener">' + icon('fb') + '</a>').join('');
    return [
      '<footer class="site-footer">',
      '<div class="wrap">',
      '<div class="footer__panel glass glass--dark" data-reveal="up">',
      '<div class="footer__brand">',
      '<a class="logo-plate logo-plate--footer" href="' + esc(H('/', depth)) + '" aria-label="' + esc(chrome.logo.homeLabel) + '">',
      '<span class="logo__box">' + logoImg(depth, true) + '</span>',
      '</a>',
      '<p class="footer__nap"><strong>' + esc(n.name) + '</strong>' + esc(n.located) + esc(n.street) + esc(n.sep) + esc(n.locality) + ', ' + esc(n.region) + ' ' + esc(n.postalCode) + ' ' + esc(n.phoneLabel) + ' <a href="' + esc(tel) + '">' + esc(chrome.phone) + '</a></p>',
      social,
      '</div>',
      col(f.columns[0], 'f-imp'),
      col(f.columns[1], 'f-quick'),
      '<div class="footer__legal">',
      '<span>' + esc(f.copyright) + '</span>',
      '<ul class="footer__legal-list">' + legal + '</ul>',
      '</div>',
      '</div>',
      '</div>',
      '</footer>',
    ].join('\n');
  }

  /* B.4: the four quick actions; variant 'aside' (nav) or 'row' (the in-main badge set of a builder page) */
  const DOCK_ICONS = { 'Email Us': 'mail', 'Schedule An Appointment': 'cal', 'Patient Forms': 'form', 'Order Contacts Online': 'cart' };
  function dock(depth, variant, items) {
    const list = items || chrome.quickActions;
    const tiles = list.map((q) => {
      const primary = /Schedule An Appointment/i.test(q.label);
      const href = H(q.href, depth);
      const ic = DOCK_ICONS[q.label] || 'arrow';
      return '<a class="dock__tile' + (primary ? ' dock__tile--primary glass glass--leaf-deep' : ' glass glass--light') + '"' + (href ? ' href="' + esc(href) + '"' : '') + (q.newTab ? ' target="_blank" rel="noopener"' : '') + (variant === 'row' ? ' data-reveal="up"' : '') + '>'
        + '<span class="dock__icon">' + icon(ic) + '</span><span class="dock__label">' + esc(q.label) + '</span></a>';
    }).join('\n');
    if (variant === 'row') return '<div class="dock dock--row" data-stagger>\n' + tiles + '\n</div>';
    return '<nav class="dock dock--aside" aria-label="Quick links">\n' + tiles + '\n</nav>';
  }

  /* G.9 dl.hours: rows in source order, data-day 1..6 then 0 */
  function hours(rows) {
    return '<dl class="hours" data-hours>' + rows.map(([d, h]) => '<div class="hours__row is-solid" data-day="' + (DAY_INDEX[d] !== undefined ? DAY_INDEX[d] : '') + '"><dt>' + esc(d) + ':</dt><dd>' + esc(h) + '</dd></div>').join('') + '</dl>';
  }

  function mapEmbed(src, cls) {
    return '<div class="map' + (cls ? ' ' + cls : '') + '"><iframe class="map__frame" src="' + esc(src) + '" title="Google map" loading="lazy"></iframe></div>';
  }

  /* B.15 */
  function aside(depth, mapSrc) {
    const s = chrome.sidebar;
    return [
      '<aside class="page-aside" data-sticky-fit>',
      dock(depth, 'aside'),
      '<section class="aside-card aside-card--location glass glass--light" aria-labelledby="aside-loc">',
      '<h2 class="aside-card__h" id="aside-loc"><a href="' + esc(H(s.location.href, depth)) + '">' + esc(s.location.title) + '</a></h2>',
      '<p class="nap__addr">' + icon('pin') + '<span>' + chrome.addressLines.map(esc).join('<br>') + '</span></p>',
      '<p class="nap__phone">' + icon('phone') + '<span>' + esc(s.location.phoneLabel) + ' <a href="' + esc(tel) + '">' + esc(chrome.phone) + '</a></span></p>',
      mapEmbed(mapSrc, 'map--aside'),
      hours(chrome.hours),
      '</section>',
      '<section class="aside-card aside-card--insurance glass glass--light" aria-labelledby="aside-ins">',
      '<h3 class="aside-card__h" id="aside-ins">' + esc(s.insurance.title) + '</h3>',
      '<p>' + s.insurance.paras.map(esc).join('<br>') + '</p>',
      '</section>',
      '</aside>',
    ].join('\n');
  }

  /* C.2 title band. band = { variant: 'scene'|'photo'|'plain', scene, photo, photoMobile, cut } */
  function crumbs(trail, depth) {
    if (!trail || trail.length < 1) return '';
    const last = trail.length - 1;
    const sep = '<span class="crumbs__sep" aria-hidden="true">&raquo;</span>';
    return '<nav class="crumbs" aria-label="Breadcrumb">\n<ol class="crumbs__list">' + trail.map((seg, i) => {
      if (i === last) return '<li class="crumbs__item"><span class="crumbs__current" aria-current="page">' + esc(seg.text) + '</span></li>';
      const href = seg.href ? H(seg.href, depth) : null;
      return '<li class="crumbs__item">' + (href ? '<a class="crumbs__link" href="' + esc(href) + '">' + esc(seg.text) + '</a>' : '<span class="crumbs__link">' + esc(seg.text) + '</span>') + sep + '</li>';
    }).join('') + '</ol>\n</nav>';
  }

  function band({ depth, variant, scene, photo, photoMobile, cut, trail, h1, date }) {
    const v = variant === 'scene' && !scene ? 'plain' : variant;
    /* a "rise" cut-out (flat-cut edges) lives inside the clipped stage, flush on its bottom-right corner,
       with no parallax (a lifted cut edge would show); every other cut-out crosses the band edge from the grid */
    const cutImg = (cls, depth) => '<img class="' + cls + '" src="' + esc(cut.url) + '" alt="" width="' + cut.w + '" height="' + cut.h + '" loading="lazy" decoding="async"' + (depth ? ' data-depth="-0.06" data-depth-max="24"' : '') + '>';
    const rise = cut && cut.rise ? '\n' + cutImg('band__cut band__cut--rise', false) : '';
    const stage = v === 'scene'
      ? '<div class="band__stage" aria-hidden="true">\n<img class="band__scene" src="' + esc(scene.url) + '" alt="" width="' + scene.w + '" height="' + scene.h + '" decoding="async">\n<span class="band__veil"></span>' + rise + '\n</div>'
      : v === 'photo'
        ? '<div class="band__stage" aria-hidden="true"><span class="band__veil"></span>' + rise + '</div>'
        : '<div class="band__stage" aria-hidden="true"><span class="band__rings"></span>' + rise + '</div>';
    const visual = v === 'photo' && photo
      ? '<figure class="band__visual" data-reveal="blur"><picture>' + (photoMobile ? '<source media="(max-width: 767px)" srcset="' + esc(photoMobile.url) + '" width="' + photoMobile.w + '" height="' + photoMobile.h + '">' : '') + '<img src="' + esc(photo.url) + '" alt="" width="' + photo.w + '" height="' + photo.h + '" fetchpriority="high" decoding="async"></picture></figure>'
      : '';
    const datePill = date ? '<p class="date-pill">' + icon('clock') + '<time' + (isoDate(date) ? ' datetime="' + isoDate(date) + '"' : '') + '>' + esc(date) + '</time></p>' : '';
    return [
      '<section class="band band--' + v + '" aria-labelledby="page-title">',
      stage,
      '<div class="wrap band__grid">',
      '<div class="band__title glass glass--image" data-reveal="up">',
      crumbs(trail, depth),
      '<h1 class="band__h" id="page-title">' + esc(h1) + '</h1>',
      datePill,
      '</div>',
      visual,
      cut && !cut.rise ? cutImg('band__cut' + (cut.wide ? ' band__cut--wide' : ''), true) : '',
      '</div>',
      '</section>',
    ].filter(Boolean).join('\n');
  }

  /* B.17 */
  function rail(depth, parent, siblings, curPath) {
    return [
      '<details class="rail glass glass--light" data-rail>',
      '<summary class="rail__summary">' + esc(parent.title) + '</summary>',
      '<nav class="rail__nav" aria-label="' + esc(parent.title) + '">',
      '<p class="rail__h"><a href="' + esc(H(parent.path, depth)) + '">' + esc(parent.title) + '</a></p>',
      '<ul class="rail__list">' + siblings.map((s) => '<li class="rail__item"><a class="rail__link" href="' + esc(H(s.path, depth)) + '"' + (s.path === curPath ? ' aria-current="page"' : '') + '>' + esc(s.title) + '</a></li>').join('') + '</ul>',
      '</nav>',
      '</details>',
    ].join('\n');
  }

  /* F.1 index cards. items: [{ title, href, summary, thumb: { url, w, h } | null }] */
  function indexCards(depth, items) {
    return '<ul class="index-cards" data-stagger>\n' + items.map((it, i) => {
      const href = H(it.href, depth);
      const title = href ? '<a class="index-card__link" href="' + esc(href) + '">' + esc(it.title) + '</a>' : esc(it.title);
      return '<li class="index-card glass glass--light"' + (i < 12 ? ' data-reveal="rise"' : '') + '>'
        + (it.thumb ? '<span class="index-card__thumb"><img src="' + esc(it.thumb.url) + '" alt="" width="' + it.thumb.w + '" height="' + it.thumb.h + '" loading="lazy" decoding="async"></span>' : '')
        + '<p class="index-card__title">' + title + '</p>'
        + (it.summary ? '<p class="index-card__summary">' + esc(it.summary) + '</p>' : '')
        + '<span class="index-card__go" aria-hidden="true">' + icon('arrow') + '</span></li>';
    }).join('\n') + '\n</ul>';
  }

  /* F.2 blog post cards */
  function postCards(depth, items) {
    return '<ul class="post-cards">\n' + items.map((it, i) => {
      const href = H(it.href, depth);
      const iso = isoDate(it.date);
      return '<li class="post-card glass glass--light is-solid"' + (i < 12 ? ' data-reveal="up"' : '') + '>'
        + '<h2 class="post-card__title">' + (href ? '<a class="post-card__link" href="' + esc(href) + '">' + esc(it.title) + '</a>' : esc(it.title)) + '</h2>'
        + (it.date ? '<p class="date-pill">' + icon('clock') + '<time' + (iso ? ' datetime="' + iso + '"' : '') + '>' + esc(it.date) + '</time></p>' : '')
        + (it.excerpt ? '<p class="post-card__excerpt">' + esc(it.excerpt) + '</p>' : '')
        + (it.more && href ? '<a class="more" href="' + esc(href) + '"' + (it.moreLabel ? ' aria-label="' + esc(it.moreLabel) + '"' : '') + '>Read&nbsp;More' + icon('arrow') + '</a>' : '')
        + '</li>';
    }).join('\n') + '\n</ul>';
  }

  /* F.3 testimonial card. card = { html (source <p>s), name, stars } */
  function reviewCard(card, textHtml) {
    return '<figure class="review glass glass--light is-solid">'
      + '<svg class="review__q" aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="' + QUOTE_PATH + '"/></svg>'
      + '<p class="stars" role="img" aria-label="' + card.stars + ' out of 5 stars">' + icon('star').repeat(card.stars) + '</p>'
      + '<blockquote class="review__text">' + textHtml + '</blockquote>'
      + '<figcaption class="review__by">- ' + esc(card.name) + '</figcaption>'
      + '</figure>';
  }

  /* B.22 CTA band around a group of source buttons (no heading: see BUILD-NOTES) */
  function ctaBand(depth, buttons) {
    const links = buttons.map((b) => {
      const href = H(b.href, depth);
      const ext = /^https?:/i.test(href || '');
      return href ? '<a class="btn btn--invert" href="' + esc(href) + '"' + (ext || b.newTab ? ' target="_blank" rel="noopener"' : '') + '>' + esc(b.label) + icon('arrow') + '</a>' : '<span class="btn btn--invert">' + esc(b.label) + '</span>';
    }).join('\n');
    return '<div class="cta-band glass glass--leaf-deep">\n<span class="cta-band__rings" aria-hidden="true"></span>\n<p class="cta-band__actions">\n' + links + '\n</p>\n</div>';
  }

  /* F.4 doc cards */
  function docCards(items) {
    return '<ul class="doc-cards">\n' + items.map((d) => '<li class="doc-card glass glass--light"><a class="doc-card__link" href="' + esc(d.href) + '" type="application/pdf">' + icon('doc') + '<span class="doc-card__label">' + esc(d.label) + '</span></a>' + (d.after ? esc(d.after) : '') + '</li>').join('\n') + '\n</ul>';
  }

  /* F.4 team card */
  function teamCard(depth, t) {
    const href = t.href ? H(t.href, depth) : null;
    return '<article class="team-card glass glass--light" aria-labelledby="team-1">'
      + (t.photo ? '<figure class="team-card__photo"><img src="' + esc(t.photo.url) + '" alt="' + esc(t.photo.alt) + '" width="' + t.photo.w + '" height="' + t.photo.h + '" loading="lazy" decoding="async"></figure>' : '')
      + '<h2 class="team-card__name" id="team-1">' + esc(t.name) + '</h2>'
      + (href && t.more ? '<a class="more" href="' + esc(href) + '">' + esc(t.more) + icon('arrow') + '</a>' : '')
      + '</article>';
  }

  /* G.9 visit block (without div.deco) for /hours-location/ and /location/* */
  function visit(depth, v) {
    const nap = [
      v.title ? '<p class="nap__title">' + (H(v.title.href, depth) ? '<a href="' + esc(H(v.title.href, depth)) + '">' + esc(v.title.text) + '</a>' : esc(v.title.text)) + '</p>' : '',
      v.subs.contact ? '<p class="nap__sub">' + esc(v.subs.contact) + '</p>' : '',
      v.phone && v.subs.contact ? '<p class="nap__phone">' + icon('phone') + '<span>' + esc(v.phoneLabel) + ' <a href="tel:' + esc(v.phone) + '">' + esc(v.phone) + '</a></span></p>' : '',
      v.subs.address ? '<p class="nap__sub">' + esc(v.subs.address) + '</p>' : '',
      v.address && v.address.length ? '<p class="nap__addr">' + icon('pin') + '<span>' + v.address.map(esc).join('<br>') + '</span></p>' : '',
      v.phone && !v.subs.contact ? '<p class="nap__phone">' + icon('phone') + '<span>' + esc(v.phoneLabel) + ' <a href="tel:' + esc(v.phone) + '">' + esc(v.phone) + '</a></span></p>' : '',
      v.subs.hours ? '<p class="nap__sub">' + esc(v.subs.hours) + '</p>' : '',
      v.hours && v.hours.length ? hours(v.hours) : '',
    ].filter(Boolean).join('\n');
    return [
      '<section class="visit">',
      '<div class="wrap visit__grid" data-stagger>',
      v.mapSrc ? '<div class="map" data-reveal="up"><iframe class="map__frame" src="' + esc(v.mapSrc) + '" title="Google map" loading="lazy"></iframe></div>' : '',
      '<div class="nap glass glass--image" data-reveal="up">',
      nap,
      '</div>',
      '</div>',
      '</section>',
    ].filter(Boolean).join('\n');
  }

  /* F.6 accordion (builder heading-accordion: closed; the answer is the next module) */
  function accordion(summary, answerHtml, open) {
    return '<div class="accordion" data-accordion>\n<details class="qa__item glass glass--leaf is-solid"' + (open ? ' open' : '') + '>\n<summary class="qa__q"><span class="qa__text">' + esc(summary) + '</span><span class="qa__icon" aria-hidden="true"></span></summary>\n<div class="qa__a">' + answerHtml + '</div>\n</details>\n</div>';
  }

  function payRow(icons) {
    return '<ul class="pay-row">' + icons.map((i) => '<li class="pay-row__item"><img src="' + esc(i.url) + '" alt="' + esc(i.alt) + '" width="' + i.w + '" height="' + i.h + '" loading="lazy" decoding="async"></li>').join('') + '</ul>';
  }

  /* A.3 shell */
  function page({ depth, curPath, headHtml, bodyClass, mainHtml, asideHtml, isHome }) {
    const pageInner = isHome
      ? ['<main id="main" tabindex="-1">', mainHtml, '</main>'].join('\n')
      : ['<div class="page-grid">', '<main id="main" tabindex="-1">', mainHtml, '</main>', asideHtml || '', '</div>'].filter(Boolean).join('\n');
    return [
      headHtml,
      '<body class="' + esc(bodyClass) + '">',
      SPRITE,
      '<div class="field" aria-hidden="true">',
      '<span class="blob blob--sun"></span><span class="blob blob--lime"></span><span class="blob blob--teal"></span><span class="blob blob--leaf"></span>',
      '</div>',
      '<div class="progress" aria-hidden="true"><span></span></div>',
      '<a class="skip" href="#main">' + esc(chrome.skip) + '</a>',
      '<div class="page">',
      topbar(depth),
      header(depth, curPath),
      pageInner,
      footer(depth),
      '</div>',
      drawer(depth, curPath),
      '<script src="' + esc(upOf(depth) + 'scripts/site.js') + '" defer></script>',
      '</body>',
      '</html>',
      '',
    ].join('\n');
  }

  return { head, topbar, header, drawer, footer, dock, hours, aside, band, rail, indexCards, postCards, reviewCard, ctaBand, docCards, teamCard, visit, accordion, payRow, page, mapEmbed };
}
