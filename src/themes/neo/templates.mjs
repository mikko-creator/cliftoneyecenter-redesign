/* templates.mjs (neo) - the neoclassical theme's page shell, chrome and interior components ("Temple"), markup exactly
   as docs/NEO-COMPONENTS.md (the binding neo markup contract) specifies: 1 (shell, sprite), 2 (top bar, header, drawer,
   base controls, ornaments, quick actions, aside, rail, hours, footer), 3 (title band, breadcrumbs, interior
   components, visit block). Started from a copy of the glass src/lib/templates.mjs (which stays untouched and still
   builds dist/); the exports and the T API are the same (createTemplates, icon, isoDate, ICON_NAMES, SPRITE; T = head
   topbar header drawer footer dock hours aside band rail indexCards postCards reviewCard ctaBand docCards teamCard
   visit accordion payRow page mapEmbed), so src/build.mjs drives both themes through one pipeline.
   Every visible string is the source's own (src/content/chrome.json, the page's content) or a non-visible
   accessibility label of COMPONENTS H.2. No .glass*, is-flat or is-solid class is emitted here (NEO-COMPONENTS 0). */
import { esc } from '../../lib/util.mjs';

/* Icon sprite (NEO-COMPONENTS 1.3): the glass SYMBOLS, unchanged (src/lib/templates.mjs) */
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
/* Ornament symbols (NEO-COMPONENTS 1.3): o-rosette, o-star, o-badge verbatim from tmp/lab-neo/temple/index.html lines
   22-39; o-sprig = the inner markup of the `laurel` <svg> in tmp/neo/brief/ornaments.json (NEO-BRIEF 4.2) */
const ORNAMENTS = {
  rosette: ['-12 -12 24 24', '<g fill="currentColor"><path d="M0-11Q3.2-6 0-2.6Q-3.2-6 0-11Z"/><path d="M0-11Q3.2-6 0-2.6Q-3.2-6 0-11Z" transform="rotate(45)"/><path d="M0-11Q3.2-6 0-2.6Q-3.2-6 0-11Z" transform="rotate(90)"/><path d="M0-11Q3.2-6 0-2.6Q-3.2-6 0-11Z" transform="rotate(135)"/><path d="M0-11Q3.2-6 0-2.6Q-3.2-6 0-11Z" transform="rotate(180)"/><path d="M0-11Q3.2-6 0-2.6Q-3.2-6 0-11Z" transform="rotate(225)"/><path d="M0-11Q3.2-6 0-2.6Q-3.2-6 0-11Z" transform="rotate(270)"/><path d="M0-11Q3.2-6 0-2.6Q-3.2-6 0-11Z" transform="rotate(315)"/><circle r="1.8"/></g>'],
  star: ['-10 -10 20 20', '<path fill="currentColor" d="M0-10Q.9-.9 10 0Q.9.9 0 10Q-.9.9-10 0Q-.9-.9 0-10Z"/>'],
  badge: ['0 0 120 120', '<g fill="none" stroke="currentColor"><circle cx="60" cy="60" r="58" stroke-width="1"/><circle cx="60" cy="60" r="53" stroke-width=".75" stroke-dasharray="1 3.2"/><circle cx="60" cy="60" r="47" stroke-width="1"/></g><g fill="currentColor"><path d="M60 0l2.4 2.4L60 4.8l-2.4-2.4z"/><path d="M120 60l-2.4 2.4-2.4-2.4 2.4-2.4z"/><path d="M60 120l-2.4-2.4 2.4-2.4 2.4 2.4z"/><path d="M0 60l2.4-2.4 2.4 2.4-2.4 2.4z"/></g>'],
  sprig: ['0 0 72 64', '<path d="M4,58Q18,18 58,6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><g fill="currentColor"><path transform="translate(7.06 50.28) rotate(-99.95)" d="M0 0Q8.5 -5.78 17 0Q8.5 5.78 0 0Z"/><path transform="translate(10.64 43.12) rotate(-26.83)" d="M0 0Q7.95 -5.41 15.9 0Q7.95 5.41 0 0Z"/><path transform="translate(14.74 36.52) rotate(-89.4)" d="M0 0Q7.4 -5.03 14.8 0Q7.4 5.03 0 0Z"/><path transform="translate(19.36 30.48) rotate(-15.73)" d="M0 0Q6.85 -4.66 13.7 0Q6.85 4.66 0 0Z"/><path transform="translate(24.5 25) rotate(-77.92)" d="M0 0Q6.3 -4.28 12.6 0Q6.3 4.28 0 0Z"/><path transform="translate(30.16 20.08) rotate(-4.09)" d="M0 0Q5.75 -3.91 11.5 0Q5.75 3.91 0 0Z"/><path transform="translate(36.34 15.72) rotate(-66.36)" d="M0 0Q5.2 -3.54 10.4 0Q5.2 3.54 0 0Z"/><path transform="translate(43.04 11.92) rotate(7.17)" d="M0 0Q4.65 -3.16 9.3 0Q4.65 3.16 0 0Z"/><path transform="translate(50.26 8.68) rotate(-55.59)" d="M0 0Q4.1 -2.79 8.2 0Q4.1 2.79 0 0Z"/><path transform="translate(58 6) rotate(-16.7)" d="M0 0Q5 -3 10 0Q5 3 0 0Z"/></g>'],
};
export const ICON_NAMES = Object.keys(SYMBOLS);
export const ORNAMENT_NAMES = Object.keys(ORNAMENTS);
export const SPRITE = '<svg class="sprite" aria-hidden="true" focusable="false" width="0" height="0"><defs>'
  + ICON_NAMES.map((n) => '<symbol id="i-' + n + '" viewBox="0 0 24 24">' + SYMBOLS[n] + '</symbol>').join('')
  + ORNAMENT_NAMES.map((n) => '<symbol id="o-' + n + '" viewBox="' + ORNAMENTS[n][0] + '">' + ORNAMENTS[n][1] + '</symbol>').join('')
  + '</defs></svg>';
export function icon(name) {
  if (!SYMBOLS[name]) throw new Error('icon not in the sprite: ' + name);
  return '<svg class="ico" aria-hidden="true" focusable="false"><use href="#i-' + name + '"/></svg>';
}
/* {orn x} (NEO-COMPONENTS 0) */
export function orn(name) {
  if (!ORNAMENTS[name]) throw new Error('ornament not in the sprite: ' + name);
  return '<svg class="orn orn--' + name + '" aria-hidden="true" focusable="false"><use href="#o-' + name + '"/></svg>';
}
const star = (pos) => '<svg class="star star--' + pos + '" aria-hidden="true" focusable="false"><use href="#o-star"/></svg>';
const divider = (cls) => '<div class="divider' + (cls ? ' ' + cls : '') + '" aria-hidden="true"><span></span>' + orn('rosette') + '<span></span></div>';
const PEDIMENT_SVG = (hidden) => '<svg viewBox="0 0 1000 106.3" preserveAspectRatio="none"' + (hidden ? ' aria-hidden="true"' : '') + ' focusable="false"><polyline points="0,105.8 500,.5 1000,105.8" vector-effect="non-scaling-stroke"/></svg>';
const PILASTERS = '<span class="pilaster pilaster--l" aria-hidden="true"></span><span class="pilaster pilaster--r" aria-hidden="true"></span>';
/* an unbreakable number OUTSIDE <main> (NEO-COMPONENTS 0, 6.3 #7): the text is escaped first, the characters are unchanged */
const nw = (escaped) => String(escaped).replace(/\d{3}-\d{3}-\d{4}/g, '<span class="nw">$&</span>');
/* "Suite 302" never breaks inside the address (QA round 1 VH9: "302" alone on a line); nw outside <main>, nobr inside */
const suite = (escaped, cls) => String(escaped).replace(/\bSuite \d+[A-Za-z]?\b/g, '<span class="' + cls + '">$&</span>');

/* QA r2 (content-seo F2): a new-tab link keeps the SOURCE link types (nofollow, noreferrer ...) plus noopener */
const REL_KEEP = new Set(['nofollow', 'noopener', 'noreferrer', 'sponsored', 'ugc']);
function relOf(src) {
  const rel = [...new Set(String(src || '').toLowerCase().split(/\s+/).filter((t) => REL_KEEP.has(t)))];
  if (!rel.includes('noopener')) rel.push('noopener');
  return rel.join(' ');
}

/* the head motion script: the glass HEAD_SCRIPT verbatim (NEO-COMPONENTS 1.1; NEO-SPEC 5.2 trap 1) */
const HEAD_SCRIPT = '<script>document.documentElement.classList.add(\'js\');/* set before first paint so nothing flashes; removed again if site.js never runs */(function(d){try{if(!matchMedia("(prefers-reduced-motion: reduce)").matches&&"IntersectionObserver" in window){d.classList.add("js-motion");setTimeout(function(){if(!window.__siteReady)d.classList.remove("js-motion")},4000)}}catch(e){}})(document.documentElement);</script>';

const DAY_INDEX = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
const MONTHS = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' };
export function isoDate(d) {
  const m = /^([A-Z][a-z]{2})\s+(\d{1,2}),\s*(\d{4})$/.exec(String(d || '').trim());
  return m && MONTHS[m[1]] ? m[3] + '-' + MONTHS[m[1]] + '-' + m[2].padStart(2, '0') : '';
}

export function createTemplates({ chrome, localHref, imgUrl, logo, logoFooter }) {
  const H = (href, depth) => localHref(href, depth);
  const upOf = (depth) => (depth ? '../'.repeat(depth) : '');
  const tel = 'tel:' + chrome.phone;

  /* 1.1: the glass head with the two neo font preloads; stylesheets = LINKED_STYLES (tokens, site, motion) */
  function head({ depth, title, description, robots, canonical, ogTitle, ogType, twitterCard, twitterTitle, ogImage, lang, jsonLd, lcp, favicon, styles }) {
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
      '<meta property="og:type" content="' + esc(ogType || 'website') + '">',
      '<meta property="og:site_name" content="' + esc(chrome.brandName) + '">',
      '<meta property="og:title" content="' + esc(ogTitle || title) + '">',
      description ? '<meta property="og:description" content="' + esc(description) + '">' : '',
      '<meta property="og:url" content="' + esc(canonical) + '">',
      ogImage ? '<meta property="og:image" content="' + esc(ogImage) + '">' : '',
      '<meta name="twitter:card" content="' + esc(twitterCard || 'summary') + '">',
      twitterTitle ? '<meta name="twitter:title" content="' + esc(twitterTitle) + '">' : '',
      ogImage ? '<meta name="twitter:image" content="' + esc(ogImage) + '">' : '',
      favicon ? '<link rel="icon" href="' + u(favicon.icon) + '" sizes="32x32" type="image/png">' : '',
      favicon && favicon.icon192 ? '<link rel="icon" href="' + u(favicon.icon192) + '" sizes="192x192" type="image/png">' : '',
      favicon && favicon.touch ? '<link rel="apple-touch-icon" href="' + u(favicon.touch) + '">' : '',
      '<link rel="preload" href="' + u('fonts/NotoSerifDisplay-normal-latin.woff2') + '" as="font" type="font/woff2" crossorigin>',
      '<link rel="preload" href="' + u('fonts/SourceSerif4-normal-latin.woff2') + '" as="font" type="font/woff2" crossorigin>',
      lcp ? '<link rel="preload" href="' + esc(lcp) + '" as="image" fetchpriority="high">' : '',
      HEAD_SCRIPT,
      '<link rel="stylesheet" href="' + u('fonts/fonts.css') + '">',
      ...(styles || ['tokens.css', 'site.css', 'motion.css']).map((f) => '<link rel="stylesheet" href="' + u('styles/' + f) + '">'),
      jsonLd || '',
      '</head>',
    ].filter(Boolean).join('\n');
  }

  /* the transparent logos exactly as the glass theme ships them: logo-clifton on the light header, the reversed
     logo-clifton-light in the dark footer (no plate, no recolouring) */
  function logoImg(depth, lazy, rec = logo) {
    return '<img src="' + esc(imgUrl(rec.rel, depth)) + '" alt="' + esc(chrome.logo.alt) + '" width="' + rec.w + '" height="' + rec.h + '"' + (lazy ? ' loading="lazy"' : '') + ' decoding="async">';
  }

  /* 2.1 */
  function topbar(depth) {
    const t = chrome.topbar;
    return [
      '<div class="topbar">',
      '<div class="wrap topbar__in">',
      '<a class="topbar__addr" href="' + esc(H(t.address.href, depth)) + '">' + icon('pin') + '<strong>' + esc(t.address.label) + '</strong></a>',
      '<div class="topbar__actions">',
      '<a class="band-pill band-pill--appt" href="' + esc(H(t.appointment.href, depth)) + '">' + icon('cal') + '<span>' + esc(t.appointment.label) + '</span></a>',
      '<a class="band-pill band-pill--call" href="' + esc(t.call.href) + '">' + icon('phone') + '<span>' + nw(esc(t.call.label)) + '</span></a>',
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
  const navItem = (it, depth, curPath, pre) => {
    const st = navState(it.href, curPath);
    return '<li class="' + pre + '__item"><a class="' + pre + '__link' + (st.section ? ' is-section' : '') + '" href="' + esc(H(it.href, depth)) + '"' + (st.cur ? ' aria-current="page"' : '') + '>' + esc(it.label) + '</a></li>';
  };

  /* 2.2: the list split 2 + 3 in source order around the logo axis; the scrolled actions; the progress rule as the
     bar's last child. A div: the banner landmark is the <header class="masthead"> around the top bar and this bar. */
  function header(depth, curPath) {
    const items = chrome.nav.map((it) => navItem(it, depth, curPath, 'mainnav'));
    const m = chrome.mobileHeader;
    return [
      '<div class="site-header" data-header>',
      '<div class="wrap">',
      '<div class="site-header__bar">',
      '<a class="site-logo" href="' + esc(H('/', depth)) + '" aria-label="' + esc(chrome.logo.homeLabel) + '">' + logoImg(depth, false) + '</a>',
      '<nav class="mainnav" aria-label="Primary">',
      '<ul class="mainnav__list mainnav__list--l">' + items.slice(0, 2).join('') + '</ul>',
      '<ul class="mainnav__list mainnav__list--r">' + items.slice(2).join('') + '</ul>',
      '</nav>',
      '<div class="site-header__actions">',
      '<a class="round-btn site-header__call" href="' + esc(m.call.href) + '" aria-label="' + esc(m.call.label) + '">' + icon('phone') + '</a>',
      '<a class="round-btn site-header__appt" href="' + esc(H(m.appointment.href, depth)) + '" aria-label="' + esc(m.appointment.label) + '">' + icon('cal') + '</a>',
      '</div>',
      '<div class="mobile-actions">',
      '<a class="round-btn" href="' + esc(H(m.appointment.href, depth)) + '" aria-label="' + esc(m.appointment.label) + '">' + icon('cal') + '</a>',
      '<a class="round-btn" href="' + esc(m.call.href) + '" aria-label="' + esc(m.call.label) + '">' + icon('phone') + '</a>',
      '<button class="round-btn round-btn--menu" type="button" aria-expanded="false" aria-controls="drawer" data-drawer-open>' + icon('menu') + '<span class="sr">' + esc(m.menuOpen) + '</span></button>',
      '</div>',
      '</div>',
      '</div>',
      '<div class="progress" aria-hidden="true"><span></span></div>',
      '</div>',
    ].join('\n');
  }

  /* 2.3 */
  function drawer(depth, curPath) {
    const t = chrome.topbar;
    return [
      '<nav class="drawer" id="drawer" aria-label="Primary" data-drawer hidden>',
      '<button class="round-btn drawer__close" type="button" data-drawer-close>' + icon('close') + '<span class="sr">' + esc(chrome.mobileHeader.menuClose) + '</span></button>',
      '<ul class="drawer__list">' + chrome.nav.map((it) => navItem(it, depth, curPath, 'drawer')).join('') + '</ul>',
      '<div class="drawer__actions">',
      '<a class="band-pill band-pill--appt" href="' + esc(H(t.appointment.href, depth)) + '">' + icon('cal') + '<span>' + esc(t.appointment.label) + '</span></a>',
      '<a class="band-pill band-pill--call" href="' + esc(t.call.href) + '">' + icon('phone') + '<span>' + nw(esc(t.call.label)) + '</span></a>',
      '</div>',
      '</nav>',
      '<div class="scrim" data-drawer-close hidden></div>',
    ].join('\n');
  }

  /* 2.10: the frieze (pediment with the reversed logo in its tympanum, the meander run), three bays in DOM order brand,
     Important, Quick (CSS places Important | brand | Quick from 900px), the legal row. No data-reveal. */
  function footer(depth) {
    const f = chrome.footer;
    const n = f.nap;
    const col = (c, id, side) => '<nav class="footer__col footer__col--' + side + '" aria-labelledby="' + id + '">\n<p class="footer__h" id="' + id + '">' + esc(c.title) + '</p>\n<ul class="footer__list">' + c.links.map((l) => '<li><a href="' + esc(H(l.href, depth)) + '">' + esc(l.label) + '</a></li>').join('') + '</ul>\n</nav>';
    const legal = f.util.map((l) => '<li><a href="' + esc(/\.xml$/.test(l.href) ? upOf(depth) + l.href.replace(/^\//, '') : H(l.href, depth)) + '">' + esc(l.label) + '</a></li>').join('');
    /* rel as the source (QA r2 F2: "nofollow noopener"), noopener at least */
    const social = f.social.map((s) => '<a class="social" href="' + esc(s.href) + '" aria-label="' + esc(s.label) + '" target="_blank" rel="' + esc(s.rel || 'noopener') + '">' + icon('fb') + '</a>').join('');
    return [
      '<footer class="site-footer">',
      '<div class="deco deco--deep" aria-hidden="true"></div>',
      '<div class="wrap footer__frieze">',
      '<div class="pediment pediment--footer">',
      PEDIMENT_SVG(true),
      '<a class="site-logo site-logo--footer" href="' + esc(H('/', depth)) + '" aria-label="' + esc(chrome.logo.homeLabel) + '">' + logoImg(depth, true, logoFooter || logo) + '</a>',
      '</div>',
      '<span class="meander" aria-hidden="true"></span>',
      '</div>',
      '<div class="wrap footer__bays">',
      '<div class="footer__brand">',
      '<p class="footer__nap"><strong>' + esc(n.name) + '</strong>' + esc(n.located) + esc(n.street) + esc(n.sep) + esc(n.locality) + ', ' + esc(n.region) + ' ' + esc(n.postalCode) + ' ' + esc(n.phoneLabel) + ' <a href="' + esc(tel) + '">' + nw(esc(chrome.phone)) + '</a></p>',
      social,
      '</div>',
      col(f.columns[0], 'f-imp', 'l'),
      col(f.columns[1], 'f-quick', 'r'),
      '</div>',
      '<div class="wrap footer__legal">',
      '<span>' + esc(f.copyright) + '</span>',
      '<ul class="footer__legal-list">' + legal + '</ul>',
      '</div>',
      '</footer>',
    ].join('\n');
  }

  /* 2.6: one tile markup, four looks. variant 'aside' | 'portico' (nav, "Quick actions") or 'row' (the in-main badge
     set of a builder page: div[data-stagger], tiles data-reveal="up"). Hero tiles never reveal. */
  const DOCK_ICONS = { 'Email Us': 'mail', 'Schedule An Appointment': 'cal', 'Patient Forms': 'form', 'Order Contacts Online': 'cart' };
  function dock(depth, variant, items) {
    const list = items || chrome.quickActions;
    const tiles = list.map((q) => {
      const primary = /Schedule An Appointment/i.test(q.label);
      const href = H(q.href, depth);
      const ic = DOCK_ICONS[q.label] || 'arrow';
      return '<a class="dock__tile' + (primary ? ' dock__tile--primary' : '') + '"' + (href ? ' href="' + esc(href) + '"' : '') + (q.newTab ? ' target="_blank" rel="' + esc(relOf(q.rel)) + '"' : '') + (variant === 'row' ? ' data-reveal="up"' : '') + '>'
        + '<span class="dock__icon"><svg class="dock__ring" aria-hidden="true" focusable="false"><use href="#o-badge"/></svg>' + icon(ic) + '</span>'
        + '<span class="dock__label">' + esc(q.label) + '</span>'
        + '<span class="dock__go" aria-hidden="true">' + icon('arrow') + '</span></a>';
    }).join('\n');
    if (variant === 'row') return '<div class="dock dock--row" data-stagger>\n' + tiles + '\n</div>';
    return '<nav class="dock dock--' + (variant === 'portico' ? 'portico' : 'aside') + '" aria-label="Quick actions">\n' + tiles + '\n</nav>';   /* not "Quick links": the footer nav is "Quick Links" (RA-07, NEO-COMPONENTS 6.3 #1) */
  }

  /* 2.9 dl.hours: rows in source order, data-day 1..6 then 0; is-solid dropped */
  function hours(rows) {
    return '<dl class="hours" data-hours>' + rows.map(([d, h]) => '<div class="hours__row" data-day="' + (DAY_INDEX[d] !== undefined ? DAY_INDEX[d] : '') + '"><dt>' + esc(d) + ':</dt><dd>' + esc(h) + '</dd></div>').join('') + '</dl>';
  }

  function mapEmbed(src, cls) {
    return '<div class="map' + (cls ? ' ' + cls : '') + '"><iframe class="map__frame" src="' + esc(src) + '" title="Google map" loading="lazy"></iframe></div>';
  }

  /* 2.7 (outside <main>: the number is wrapped here in span.nw) */
  function aside(depth, mapSrc) {
    const s = chrome.sidebar;
    return [
      '<aside class="page-aside" data-sticky-fit>',
      dock(depth, 'aside'),
      '<section class="aside-card aside-card--location" aria-labelledby="aside-loc">',
      '<h2 class="aside-card__h" id="aside-loc"><a href="' + esc(H(s.location.href, depth)) + '">' + esc(s.location.title) + '</a></h2>',
      '<p class="nap__addr">' + icon('pin') + '<span>' + chrome.addressLines.map((l) => suite(esc(l), 'nw')).join('<br>') + '</span></p>',
      '<p class="nap__phone">' + icon('phone') + '<span>' + esc(s.location.phoneLabel) + ' <a href="' + esc(tel) + '">' + nw(esc(chrome.phone)) + '</a></span></p>',
      mapEmbed(mapSrc, 'map--aside'),
      hours(chrome.hours),
      '</section>',
      '<section class="aside-card aside-card--insurance" aria-labelledby="aside-ins">',
      '<h3 class="aside-card__h" id="aside-ins">' + esc(s.insurance.title) + '</h3>',
      '<p>' + s.insurance.paras.map(esc).join('<br>') + '</p>',
      '</section>',
      '</aside>',
    ].join('\n');
  }

  /* 3.2 */
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

  /* 3.1 title band. band = { variant: 'scene'|'photo'|'plain', scene, photo, photoMobile, cut, focus, trail, h1, date, named }.
     band--scene only when the scene resolved; band__niche on a scene band, or on a plain band that has a cut-out (an
     empty arch: CSS paints the flat dark ground); never on band--photo, whose cut-out stands beside the visual
     (band__cut--photo). No data-reveal anywhere in the band (above the fold on 348 pages). */
  function band({ depth, variant, scene, photo, photoMobile, cut, trail, h1, date, focus, named }) {
    const v = variant === 'scene' && !scene ? 'plain' : variant === 'photo' && !photo ? 'plain' : variant;
    const wide = cut && (cut.wide || (cut.w && cut.h && cut.w / cut.h >= 2));
    const cutImg = (extra) => '<img class="band__cut' + (extra || '') + (wide ? ' band__cut--wide' : '') + '" src="' + esc(cut.url) + '" alt="" width="' + cut.w + '" height="' + cut.h + '" loading="lazy" decoding="async" data-depth="-0.05" data-depth-max="16">';
    const datePill = date ? '<p class="date-pill">' + icon('clock') + '<time' + (isoDate(date) ? ' datetime="' + isoDate(date) + '"' : '') + '>' + esc(date) + '</time></p>' : '';
    const niche = v === 'scene' || (v === 'plain' && cut)
      ? ['<div class="band__niche" aria-hidden="true">',
        '<span class="band__arch">' + (v === 'scene' ? '<img class="band__scene" src="' + esc(scene.url) + '" alt="" width="' + scene.w + '" height="' + scene.h + '" decoding="async">' : '') + '</span>',
        cut ? cutImg('') : '',
        '</div>'].filter(Boolean).join('\n')
      : '';
    const visual = v === 'photo'
      ? '<figure class="band__visual' + (focus ? ' band__visual--' + focus : '') + '"><picture>' + (photoMobile ? '<source media="(max-width: 767px)" srcset="' + esc(photoMobile.url) + '" width="' + photoMobile.w + '" height="' + photoMobile.h + '">' : '') + '<img src="' + esc(photo.url) + '" alt="" width="' + photo.w + '" height="' + photo.h + '" fetchpriority="high" decoding="async"></picture></figure>'
        + (cut ? '\n' + cutImg(' band__cut--photo') : '')
      : '';
    return [
      '<section class="band band--' + v + (cut ? ' band--has-cut' : '') + '"' + (named === false ? '' : ' aria-labelledby="page-title"') + '>',
      '<div class="band__stage" aria-hidden="true">',
      '<span class="band__frame">' + star('tl') + star('tr') + '</span>',
      '</div>',
      '<div class="wrap band__grid">',
      '<div class="band__title">',
      crumbs(trail, depth),
      '<h1 class="band__h" id="page-title">' + esc(h1) + '</h1>',
      datePill,
      divider('band__divider'),
      '</div>',
      PILASTERS,
      niche,
      visual,
      '</div>',
      '</section>',
    ].filter(Boolean).join('\n');
  }

  /* 2.8: the summary gains a chevron */
  function rail(depth, parent, siblings, curPath) {
    return [
      '<details class="rail" data-rail>',
      '<summary class="rail__summary"><span class="rail__summary-text">' + esc(parent.title) + '</span>' + icon('chev') + '</summary>',
      '<nav class="rail__nav" aria-label="' + esc(parent.title) + '">',
      '<p class="rail__h"><a href="' + esc(H(parent.path, depth)) + '">' + esc(parent.title) + '</a></p>',
      '<ul class="rail__list">' + siblings.map((s) => '<li class="rail__item"><a class="rail__link" href="' + esc(H(s.path, depth)) + '"' + (s.path === curPath ? ' aria-current="page"' : '') + '>' + esc(s.title) + '</a></li>').join('') + '</ul>',
      '</nav>',
      '</details>',
    ].join('\n');
  }

  /* 3.5 index cards. items: [{ title, href, summary, thumb: { url, w, h } | null }] */
  function indexCards(depth, items) {
    return '<ul class="index-cards" data-stagger>\n' + items.map((it, i) => {
      const href = H(it.href, depth);
      const title = href ? '<a class="index-card__link" href="' + esc(href) + '">' + esc(it.title) + '</a>' : esc(it.title);
      return '<li class="index-card"' + (i < 12 ? ' data-reveal="rise"' : '') + '>'
        + (it.thumb ? '<span class="index-card__thumb"><img src="' + esc(it.thumb.url) + '" alt="" width="' + it.thumb.w + '" height="' + it.thumb.h + '" loading="lazy" decoding="async"></span>' : '')
        + '<p class="index-card__title">' + title + '</p>'
        + (it.summary ? '<p class="index-card__summary">' + esc(it.summary) + '</p>' : '')
        + '<span class="index-card__go" aria-hidden="true">' + icon('arrow') + '</span></li>';
    }).join('\n') + '\n</ul>';
  }

  /* 3.5 blog post cards */
  function postCards(depth, items) {
    return '<ul class="post-cards">\n' + items.map((it, i) => {
      const href = H(it.href, depth);
      const iso = isoDate(it.date);
      return '<li class="post-card"' + (i < 12 ? ' data-reveal="up"' : '') + '>'
        + '<h2 class="post-card__title">' + (href ? '<a class="post-card__link" href="' + esc(href) + '">' + esc(it.title) + '</a>' : esc(it.title)) + '</h2>'
        + (it.date ? '<p class="date-pill">' + icon('clock') + '<time' + (iso ? ' datetime="' + iso + '"' : '') + '>' + esc(it.date) + '</time></p>' : '')
        + (it.excerpt ? '<p class="post-card__excerpt">' + esc(it.excerpt) + '</p>' : '')
        + (it.more && href ? '<a class="more" href="' + esc(href) + '"' + (it.moreLabel ? ' aria-label="' + esc(it.moreLabel) + '"' : '') + '>Read&nbsp;More' + icon('arrow') + '</a>' : '')
        + '</li>';
    }).join('\n') + '\n</ul>';
  }

  /* 3.5 testimonial stele (no quote glyph). card = { html (source <p>s), name, stars } */
  function reviewCard(card, textHtml) {
    return '<figure class="review">'
      + '<p class="stars" role="img" aria-label="' + card.stars + ' out of 5 stars">' + icon('star').repeat(card.stars) + '</p>'
      + '<blockquote class="review__text">' + textHtml + '</blockquote>'
      + '<figcaption class="review__by">- ' + esc(card.name) + '</figcaption>'
      + '</figure>';
  }

  /* 3.5 CTA band around a group of source buttons (inside <main>: numbers in span.nobr, as glass) */
  function ctaBand(depth, buttons) {
    const links = buttons.map((b) => {
      const href = H(b.href, depth);
      const ext = /^https?:/i.test(href || '');
      const label = esc(b.label).replace(/\d{3}-\d{3}-\d{4}/g, '<span class="nobr">$&</span>');
      return href ? '<a class="btn btn--invert" href="' + esc(href) + '"' + (ext || b.newTab ? ' target="_blank" rel="' + esc(relOf(b.rel)) + '"' : '') + '>' + label + icon('arrow') + '</a>' : '<span class="btn btn--invert">' + label + '</span>';
    }).join('\n');
    return '<div class="cta-band">\n<span class="cta-band__frame" aria-hidden="true"></span>\n<p class="cta-band__actions">\n' + links + '\n</p>\n</div>';
  }

  /* 3.5 doc cards */
  function docCards(items) {
    return '<ul class="doc-cards">\n' + items.map((d) => '<li class="doc-card"><a class="doc-card__link" href="' + esc(d.href) + '" type="application/pdf">' + icon('doc') + '<span class="doc-card__label">' + esc(d.label) + '</span></a>' + (d.after ? esc(d.after) : '') + '</li>').join('\n') + '\n</ul>';
  }

  /* 3.5 team card */
  function teamCard(depth, t) {
    const href = t.href ? H(t.href, depth) : null;
    return '<article class="team-card" aria-labelledby="team-1">'
      + (t.photo ? '<figure class="team-card__photo"><img src="' + esc(t.photo.url) + '" alt="' + esc(t.photo.alt) + '" width="' + t.photo.w + '" height="' + t.photo.h + '" loading="lazy" decoding="async"></figure>' : '')
      + '<h2 class="team-card__name" id="team-1">' + esc(t.name) + '</h2>'
      + (href && t.more ? '<a class="more" href="' + esc(href) + '">' + esc(t.more) + icon('arrow') + '</a>' : '')
      + '</article>';
  }

  /* 3.6 visit block for /hours-location/ and /location/* (no .wrap: it sits in the content column) */
  function visit(depth, v) {
    const nap = [
      v.title ? '<p class="nap__title">' + (H(v.title.href, depth) ? '<a href="' + esc(H(v.title.href, depth)) + '">' + esc(v.title.text) + '</a>' : esc(v.title.text)) + '</p>' : '',
      v.subs.contact ? '<p class="nap__sub">' + esc(v.subs.contact) + '</p>' : '',
      v.phone && v.subs.contact ? '<p class="nap__phone">' + icon('phone') + '<span>' + esc(v.phoneLabel) + ' <a href="tel:' + esc(v.phone) + '">' + esc(v.phone) + '</a></span></p>' : '',
      v.subs.address ? '<p class="nap__sub">' + esc(v.subs.address) + '</p>' : '',
      v.address && v.address.length ? '<p class="nap__addr">' + icon('pin') + '<span>' + v.address.map((l) => suite(esc(l), 'nobr')).join('<br>') + '</span></p>' : '',
      v.phone && !v.subs.contact ? '<p class="nap__phone">' + icon('phone') + '<span>' + esc(v.phoneLabel) + ' <a href="tel:' + esc(v.phone) + '">' + esc(v.phone) + '</a></span></p>' : '',
      v.subs.hours ? '<p class="nap__sub">' + esc(v.subs.hours) + '</p>' : '',
      v.hours && v.hours.length ? hours(v.hours) : '',
    ].filter(Boolean).join('\n');
    return [
      '<section class="visit visit--page">',
      '<div class="visit__grid" data-stagger>',
      v.mapSrc ? '<div class="map-plate" data-reveal="up">\n<div class="map"><iframe class="map__frame" src="' + esc(v.mapSrc) + '" title="Google map" loading="lazy"></iframe></div>\n<span class="map-plate__ledge" aria-hidden="true"></span>\n</div>' : '',
      '<div class="nap nap--stele" data-reveal="up">',
      nap,
      '</div>',
      '</div>',
      '</section>',
    ].filter(Boolean).join('\n');
  }

  /* 3.5 accordion (builder heading-accordion and the payment accordion: closed by default) */
  function accordion(summary, answerHtml, open) {
    return '<div class="accordion" data-accordion>\n<details class="qa__item"' + (open ? ' open' : '') + '>\n<summary class="qa__q"><span class="qa__text">' + esc(summary) + '</span><span class="qa__icon" aria-hidden="true"></span></summary>\n<div class="qa__a">' + answerHtml + '</div>\n</details>\n</div>';
  }

  function payRow(icons) {
    return '<ul class="pay-row">' + icons.map((i) => '<li class="pay-row__item"><img src="' + esc(i.url) + '" alt="' + esc(i.alt) + '" width="' + i.w + '" height="' + i.h + '" loading="lazy" decoding="async"></li>').join('') + '</ul>';
  }

  /* 1.2 shell: sprite, the fixed marble ground (interior pages only), skip link, page (masthead, main, footer),
     then the drawer and scrim after div.page (inert on div.page never disables them). No div.field, no top-level
     div.progress (it is inside the header bar). */
  function page({ depth, curPath, headHtml, bodyClass, mainHtml, asideHtml, isHome }) {
    const pageInner = isHome
      ? ['<main id="main" tabindex="-1">', mainHtml, '</main>'].join('\n')
      : ['<div class="page-grid">', '<main id="main" tabindex="-1">', mainHtml, '</main>', asideHtml || '', '</div>'].filter(Boolean).join('\n');
    return [
      headHtml,
      '<body class="' + esc(bodyClass) + '">',
      SPRITE,
      isHome ? '' : '<div class="ground" aria-hidden="true"></div>',
      '<a class="skip" href="#main">' + esc(chrome.skip) + '</a>',
      '<div class="page">',
      '<header class="masthead">',
      topbar(depth),
      header(depth, curPath),
      '</header>',
      pageInner,
      footer(depth),
      '</div>',
      drawer(depth, curPath),
      '<script src="' + esc(upOf(depth) + 'scripts/site.js') + '" defer></script>',
      '</body>',
      '</html>',
      '',
    ].filter((x, i, a) => x !== '' || i === a.length - 1).join('\n');
  }

  return { head, topbar, header, drawer, footer, dock, hours, aside, band, rail, indexCards, postCards, reviewCard, ctaBand, docCards, teamCard, visit, accordion, payRow, page, mapEmbed };
}
