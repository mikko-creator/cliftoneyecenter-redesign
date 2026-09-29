/* home.mjs (neo) - the neoclassical homepage, composed from the RAW source homepage (audit/raw/index.html).

   HOME CONTRACT (docs/NEO-COMPONENTS.md 5.1, verbatim from the glass theme): buildHome(ctx) returns the HTML placed
   inside <main id="main">. The source home is 9 Beaver Builder rows, found by their data-node ids. Each row is read
   from the raw markup BEFORE any sanitising (6 of the visual headings are div.ecp-heading, the Q&A answers sit in
   [hidden] divs, the hidden ratingValue "5" must not render: L14).

   Copy is never written here: every visible string comes out of the row it belongs to. The only non-source strings
   are the COMPONENTS H.2 accessibility labels and the aria-hidden roman numerals (ledger N01). Generated images only
   in the hero, on the Welcome/Services seam, in What's New and in Visit (NEO-SPEC 6.1, the section-level exclusion).
   At the end every text run and every image of the raw <main> is checked against the output; anything not rendered
   is reported through ctx.fail('home:leftover', '/', ...) (no silent drops). Markup: docs/NEO-COMPONENTS.md 5.3-5.9. */
import { decodeEntities, findElements, elementEnd } from '../../lib/util.mjs';

const ROWS = {
  hero: '5ded9754972ce', dock: '5ded9754977e9', welcomeH: '5ded975497569', welcome: '5df6091f63e9d',
  services: '5ded97549790b', reviews: '5ded975498007', help: '5ded975497aee', designer: '5ded9754987c6', visit: '5ded975497d41',
};
const DAY = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
const DOCK_ICON = { 'Email Us': 'mail', 'Schedule An Appointment': 'cal', 'Patient Forms': 'form', 'Order Contacts Online': 'cart' };

/* ornaments (docs/NEO-COMPONENTS.md 2.5): aria-hidden, never text */
const PEDIMENT_SVG = '<svg viewBox="0 0 1000 106.3" preserveAspectRatio="none" focusable="false"><polyline points="0,105.8 500,.5 1000,105.8" vector-effect="non-scaling-stroke"/></svg>';
const pediment = (numeral, mod) => '<div class="pediment' + (mod ? ' pediment--' + mod : '') + '" aria-hidden="true">' + PEDIMENT_SVG + (numeral ? '<span class="numeral">' + numeral + '</span>' : '') + '</div>';
const orn = (name, cls) => '<svg class="' + (cls || 'orn orn--' + name.replace(/^o-/, '')) + '" aria-hidden="true" focusable="false"><use href="#' + name + '"/></svg>';
const divider = (extra) => '<div class="divider' + (extra ? ' ' + extra : '') + '" aria-hidden="true"><span></span>' + orn('o-rosette') + '<span></span></div>';
const star = (pos) => '<svg class="star star--' + pos + '" aria-hidden="true" focusable="false"><use href="#o-star"/></svg>';
const pilasters = '<span class="pilaster pilaster--l" aria-hidden="true"></span><span class="pilaster pilaster--r" aria-hidden="true"></span>';
const sprig = (r) => '<svg class="laurel-sprig' + (r ? ' laurel-sprig--r' : '') + '" viewBox="0 0 72 64" aria-hidden="true" focusable="false"><use href="#o-sprig"/></svg>';

const norm = (s) => decodeEntities(String(s || '')).replace(/[\u00a0\s]+/g, ' ').trim();
const textOf = (html) => norm(String(html || '').replace(/<(script|style|svg)\b[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' '));
const attr = (tag, name) => { const m = new RegExp('\\s' + name + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\')', 'i').exec(tag); return m ? decodeEntities(m[1] !== undefined ? m[1] : m[2]) : null; };
const openTag = (html) => (/^<[^>]+>/.exec(html) || [''])[0];
const inner = (html) => html.replace(/^<[^>]+>/, '').replace(/<\/[a-z0-9]+>\s*$/i, '');
const byClass = (html, cls, tag = '[a-z][a-z0-9]*') => findElements(html, new RegExp('<(' + tag + ')\\b[^>]*\\sclass="[^"]*(?<![\\w-])' + cls.replace(/[-]/g, '\\-') + '(?![\\w-])[^"]*"', 'i'));
const firstByClass = (html, cls, tag) => byClass(html, cls, tag)[0] || null;
const byTag = (html, tag) => findElements(html, new RegExp('<(' + tag + ')\\b', 'i'));
/* a RegExp for ctx.src from a source URL: the file name's word runs with a small gap allowed between them */
function srcPattern(url) {
  const base = decodeURIComponent(String(url).split(/[?#]/)[0].split('/').pop()).replace(/\.[a-z0-9]+$/i, '');
  const words = base.split(/[^A-Za-z0-9]+/).filter(Boolean).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(words.join('.{0,6}'), 'i');
}

export function buildHome(ctx) {
  const { raw, esc, localHref, src, gen, icon, fail, chrome } = ctx;
  const stats = ctx.stats || {};
  const depth = ctx.depth || 0;
  const H = (href) => localHref(href, depth);
  const usedImages = new Set();

  /* ---- the raw <main> and its 9 rows ---- */
  const mi = raw.search(/<main\b/i);
  if (mi < 0) throw new Error('home: no <main> in audit/raw/index.html');
  const main = raw.slice(mi, elementEnd(raw, mi, 'main'));
  const row = {};
  for (const [k, id] of Object.entries(ROWS)) {
    const m = new RegExp('<div\\b[^>]*\\bdata-node="' + id + '"', 'i').exec(main);
    if (!m) throw new Error('home: source row ' + k + ' (data-node ' + id + ') not found - the source homepage changed; update home.mjs');
    row[k] = main.slice(m.index, elementEnd(main, m.index, 'div'));
  }

  /* inline HTML of a source fragment: a/strong/em/b/i/br kept (links page-relative, dead ones unwrapped), rest unwrapped */
  function inline(html) {
    let out = String(html).replace(/<(script|style|svg)\b[\s\S]*?<\/\1>/gi, '').replace(/<!--[\s\S]*?-->/g, '');
    out = out.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (m0, a, body) => {
      const href = attr('<a ' + a + '>', 'href');
      const to = href !== null ? H(href) : null;
      const t = attr('<a ' + a + '>', 'target');
      return to ? '<a href="' + esc(to) + '"' + (t === '_blank' ? ' target="_blank" rel="noopener"' : '') + '>' + inline(body) + '</a>' : inline(body);
    });
    out = out.replace(/<(\/?)(strong|b|em|i)\b[^>]*>/gi, '<$1$2>').replace(/<br\b[^>]*>/gi, '<br>');
    out = out.replace(/<(?!\/?(a|strong|b|em|i|br)\b)[^>]+>/gi, '');
    return out.replace(/[ \t\r\n]+/g, ' ').replace(/\s*<br>\s*/g, '<br>').trim();
  }
  const img = (im, alt, extra) => '<img src="' + esc(im.url) + '" alt="' + esc(alt) + '" width="' + im.w + '" height="' + im.h + '"' + (extra || '') + '>';
  function sourceImg(url) { usedImages.add(url); return src(srcPattern(url)); }   /* throws if absent: a build failure, never a placeholder */
  function generated(id, where) {
    const g = gen(id);
    if (!g) fail('home:gen', id, 'generated image not available; ' + where + ' renders without it');
    return g;
  }
  const genImg = (id, where, cls, extra) => { const g = generated(id, where); return g ? img(g, '', extra).replace('<img ', '<img class="' + cls + '" ') : ''; };
  const headingText = (html) => textOf((firstByClass(html, 'ecp-heading-text') || { html }).html);
  const hashTitle = (t) => { const s = String(t); return s.startsWith('#') ? '<span class="hash">#</span>' + esc(s.slice(1)) : esc(s); };

  /* ================= I. hero + dock (rows 0, 1): the temple front ================= */
  const heroLines = byClass(row.hero, 'ecp-heading').map((e) => headingText(e.html)).filter(Boolean);
  if (heroLines.length !== 3) fail('home:hero', '/', 'expected 3 hero heading lines, found ' + heroLines.length);
  const bgUrl = attr(openTag(row.hero), 'data-background-image-src');
  if (!bgUrl) throw new Error('home: hero row has no data-background-image-src');
  const heroPhoto = sourceImg(bgUrl);
  const tiles = byClass(row.dock, 'ecp-badge', 'a').map((e) => {
    const tag = openTag(e.html);
    const label = textOf((firstByClass(e.html, 'ecp-badge-title') || e).html);
    return { label, href: attr(tag, 'href'), blank: attr(tag, 'target') === '_blank' };
  });
  const dockHtml = tiles.map((t) => {
    const primary = /^Schedule An Appointment$/i.test(t.label);
    const href = H(t.href);
    return '<a class="dock__tile' + (primary ? ' dock__tile--primary' : '') + '"' + (href ? ' href="' + esc(href) + '"' : '') + (t.blank ? ' target="_blank" rel="noopener"' : '') + '>'
      + '<span class="dock__icon"><svg class="dock__ring" aria-hidden="true" focusable="false"><use href="#o-badge"/></svg>' + icon(DOCK_ICON[t.label] || 'arrow') + '</span>'
      + '<span class="dock__label">' + esc(t.label) + '</span>'
      + '<span class="dock__go" aria-hidden="true">' + icon('arrow') + '</span></a>';
  }).join('\n');
  const LINE_CLS = ['hero__line hero__line--1', 'hero__line hero__line--2', 'hero__line hero__line--accent'];
  const statement = heroLines.map((l, i) => '<span class="' + (LINE_CLS[i] || 'hero__line') + '">' + esc(l) + '</span>').join('\n');
  const hero = [
    '<section class="hero">',
    '<div class="deco deco--dark" aria-hidden="true"></div>',
    '<div class="hero__frame" aria-hidden="true">' + star('tl') + star('tr') + star('bl') + star('br') + '</div>',
    '<div class="wrap hero__grid">',
    pediment('I', 'hero'),
    '<span class="cornice" aria-hidden="true"></span>',
    pilasters,
    '<p class="hero__statement">', statement, '</p>',
    '<figure class="hero__photo"><span class="hero__photo-in" data-reveal="settle">' + img(heroPhoto, '', ' fetchpriority="high" decoding="async"') + '</span></figure>',
    /* no fetchpriority on the bust (it must not compete with the LCP photo) and no parallax (it stands on the pedestal) */
    genImg('neo-cut-bust-glasses', 'the hero statue', 'hero__cut', ' decoding="async"'),
    '<span class="hero__pedestal" aria-hidden="true"></span>',
    '<div class="hero__stylobate" aria-hidden="true"><span class="meander"></span></div>',
    /* "Quick actions", not "Quick links": the footer nav is "Quick Links" (glass QA RA-07) */
    '<nav class="dock dock--portico" aria-label="Quick actions">', dockHtml, '</nav>',
    '</div>',
    '</section>',
  ].filter(Boolean).join('\n');

  /* ================= II. welcome (rows 2, 3) ================= */
  const welcomeText = headingText((byTag(row.welcomeH, 'h1')[0] || { html: '' }).html);
  if (!welcomeText) throw new Error('home: welcome h1 not found in row ' + ROWS.welcomeH);
  const PLACE = 'in Bossier City, Louisiana';
  const welcomeH = welcomeText.includes(PLACE)
    ? esc(welcomeText.slice(0, welcomeText.indexOf(PLACE)).replace(/\s+$/, '')) + ' <span class="welcome__place">' + esc(PLACE) + '</span>' + esc(welcomeText.slice(welcomeText.indexOf(PLACE) + PLACE.length))
    : esc(welcomeText);
  const richtexts = byClass(row.welcome, 'ecp-richtext', 'div');
  if (richtexts.length < 2) throw new Error('home: row 3 richtext modules not found');
  const promoRt = richtexts[0].html, copyRt = richtexts[richtexts.length - 1].html;
  const promoImgTag = (/<img\b[^>]*>/i.exec(promoRt) || [''])[0];
  const promoImg = promoImgTag ? sourceImg(attr(promoImgTag, 'src')) : null;
  const promoTitle = textOf((byTag(promoRt, 'h4')[0] || { html: '' }).html);
  const promoParas = byTag(promoRt, 'p').filter((p) => textOf(p.html)).map((p) => '<p>' + inline(inner(p.html)) + '</p>');
  const newsHeading = byClass(row.welcome, 'ecp-heading', 'h1').map((e) => headingText(e.html))[0] || '';
  const post = firstByClass(row.welcome, 'ecp-posttype-post', 'div');
  let newsHtml = '';
  if (post) {
    const tA = (/<a\b[^>]*>[\s\S]*?<\/a>/i.exec((firstByClass(post.html, 'ecp-post-title') || { html: '' }).html) || [''])[0];
    const pHref = H(attr(tA, 'href'));
    const pTitle = textOf(tA);
    const pDate = textOf((firstByClass(post.html, 'ecp-post-date') || { html: '' }).html);
    const pExcerpt = textOf((firstByClass(post.html, 'ecp-post-content') || { html: '' }).html);
    const moreA = (/<a\b[^>]*>[\s\S]*?<\/a>/i.exec((firstByClass(post.html, 'ecp-post-meta-readmore') || { html: '' }).html) || [''])[0];
    const moreLabel = attr(moreA, 'aria-label');
    const iso = (() => { const m = /^([A-Z][a-z]{2})\s+(\d{1,2}),\s*(\d{4})$/.exec(pDate); const M = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' }; return m && M[m[1]] ? m[3] + '-' + M[m[1]] + '-' + m[2].padStart(2, '0') : ''; })();
    newsHtml = [
      '<section class="news plate" data-reveal="up" aria-labelledby="news-h">',
      /* the marble hand resting on the plate's top frame (N4; no parallax: it rests on something) */
      genImg('neo-cut-hand-spectacles', 'the What\'s New hand', 'news__cut', ' loading="lazy" decoding="async"'),
      '<h2 class="news__h" id="news-h">' + esc(newsHeading) + '</h2>',
      '<article class="news__post">',
      '<h3 class="news__title">' + (pHref ? '<a href="' + esc(pHref) + '">' + esc(pTitle) + '</a>' : esc(pTitle)) + '</h3>',
      pDate ? '<p class="news__date date-pill">' + icon('clock') + '<time' + (iso ? ' datetime="' + iso + '"' : '') + '>' + esc(pDate) + '</time></p>' : '',
      pExcerpt ? '<p class="news__excerpt">' + esc(pExcerpt) + '</p>' : '',
      pHref && moreA ? '<a class="more" href="' + esc(pHref) + '"' + (moreLabel ? ' aria-label="' + esc(moreLabel) + '"' : '') + '>' + inline(inner(moreA)).replace(/\u00a0/g, '&nbsp;') + icon('arrow') + '</a>' : '',
      '</article>',
      '</section>',
    ].filter(Boolean).join('\n');
  } else fail('home:leftover', '/', 'What\'s New post summary not found in row 3');
  /* the practice copy: top-level blocks of the right-hand richtext, in source order */
  const copyInner = inner(firstByClass(copyRt, 'ecp-richtext', 'div').html);
  const blocks = findElements(copyInner, /<(p|ul|ol|h[1-6])\b/i);
  let firstP = true, firstUl = true;
  const copyHtml = blocks.map((b) => {
    const tag = b.match[1].toLowerCase();
    if (tag === 'p') {
      const body = inline(inner(b.html));
      if (!body) return '';
      const isLast = b === blocks[blocks.length - 1];
      const cls = firstP ? ' class="lead"' : isLast ? ' class="closing"' : '';
      firstP = false;
      return '<p' + cls + '>' + body + '</p>';
    }
    if (tag === 'ul' || tag === 'ol') {
      const items = byTag(b.html, 'li').map((li) => inline(inner(li.html)));
      if (firstUl) {
        firstUl = false;
        /* L07: the lead term of each service in <strong>; text, dash characters and spacing unchanged */
        return '<ul class="feature-list" data-stagger>\n' + items.map((it) => {
          const m = /^([^<]+?)(\s*(?:&#8211;|&ndash;|&#8212;|&mdash;|\u2013|\u2014|-)\s+)([\s\S]*)$/.exec(it);
          return '<li data-reveal="up">' + (m ? '<strong>' + m[1] + '</strong>' + m[2] + m[3] : it) + '</li>';
        }).join('\n') + '\n</ul>';
      }
      return '<ul class="offer-list">' + items.map((it) => '<li>' + it + '</li>').join('') + '</ul>';
    }
    return '<h3 class="offer-h">' + esc(textOf(b.html)) + '</h3>';
  }).filter(Boolean).join('\n');
  const welcome = [
    '<section class="welcome" aria-labelledby="welcome-h">',
    '<div class="deco deco--light" aria-hidden="true"></div>',
    '<div class="wrap">',
    '<div class="sec-head sec-head--welcome" data-reveal="up">',
    pediment('II'),
    '<h1 class="section-title section-title--center welcome__h" id="welcome-h">' + welcomeH + '</h1>',
    divider(),
    '</div>',
    '<div class="welcome__grid">',
    '<div class="welcome__side">',
    '<article class="promo plate" data-reveal="up">',
    promoImg ? '<figure class="promo__img arch"><span class="arch__photo" data-reveal="arch">' + img(promoImg, '', ' loading="lazy" decoding="async"') + '</span></figure>' : '',
    /* h2 (source h4; glass QA RA-05: an h3 skipped a level after the h1) */
    promoTitle ? '<h2 class="promo__title">' + esc(promoTitle) + '</h2>' : '',
    promoParas.join('\n'),
    '</article>',
    newsHtml,
    '</div>',
    '<div class="welcome__main plate" data-reveal="up">',
    copyHtml,
    '</div>',
    '</div>',
    '</div>',
    '</section>',
  ].filter(Boolean).join('\n');

  /* ================= III. services (row 4): the arcade ================= */
  const svcHead = firstByClass(row.services, 'ecp-heading', 'div');
  const svcA = (/<a\b[^>]*>/i.exec(svcHead ? svcHead.html : '') || [''])[0];
  const svcTitle = headingText(svcHead ? svcHead.html : '');
  const svcHref = svcA ? H(attr(svcA, 'href')) : null;
  const svcTitleHtml = svcHref
    ? '<a class="title-link" href="' + esc(svcHref) + '"' + (attr(svcA, 'target') === '_blank' ? ' target="_blank" rel="noopener"' : '') + '>' + esc(svcTitle) + icon('arrow') + '</a>'
    : esc(svcTitle);
  const svcTiles = byClass(row.services, 'ecp-gallery-item', 'div').map((it) => {
    const a = (/<a\b[^>]*>/i.exec(it.html) || [''])[0];
    const imTag = (/<img\b[^>]*>/i.exec(it.html) || [''])[0];
    const im = sourceImg(attr(imTag, 'src'));
    const name = textOf((firstByClass(it.html, 'ecp-gallery-item-caption') || { html: '' }).html);
    const href = H(attr(a, 'href'));
    /* the source captions are h2s under the row's title: here h3 under the section h2 (glass VH-03), in div.svc__foot */
    const body = '<span class="svc__frame arch"><span class="arch__photo" data-reveal="arch">' + img(im, '', ' loading="lazy" decoding="async"') + '</span></span>'
      + '<div class="svc__foot"><h3 class="svc__name">' + esc(name) + '</h3><span class="svc__go">' + icon('arrow') + '</span></div>';
    return '<li data-reveal="rise">\n' + (href ? '<a class="svc" href="' + esc(href) + '">' + body + '</a>' : '<span class="svc">' + body + '</span>') + '\n</li>';
  });
  const services = [
    '<section class="services" aria-labelledby="svc-h">',
    /* the keystone relief on the Welcome/Services seam (N2; parallax capped at 16px) */
    genImg('neo-cut-eye-relief', 'the Welcome/Services seam', 'services__relief', ' loading="lazy" decoding="async" data-depth="-0.04" data-depth-max="16"'),
    '<div class="wrap services__in">',
    '<div class="sec-head" data-reveal="up">',
    pediment('III'),
    '<h2 class="section-title section-title--center" id="svc-h">' + svcTitleHtml + '</h2>',
    divider(),
    '</div>',
    '<ul class="svc-grid" data-stagger>', svcTiles.join('\n'), '</ul>',
    '</div>',
    '</section>',
  ].filter(Boolean).join('\n');

  /* ================= IV. reviews (row 5): #HappyPatients on the poster ground ================= */
  const revTag = headingText((firstByClass(row.reviews, 'ecp-heading', 'div') || { html: '' }).html);
  const smileMods = [['smile--a', '-0.04', '14'], ['smile--b', '-0.06', '18'], ['smile--c', '-0.04', '14']];
  const smiles = byClass(row.reviews, 'ecp-carousel-item', 'div').map((it, i) => {
    const imTag = (/<img\b[^>]*>/i.exec(it.html) || [''])[0];
    const im = sourceImg(attr(imTag, 'src'));
    const [cls, dep, max] = smileMods[i] || smileMods[2];
    return '<span class="smile ' + cls + '" data-depth="' + dep + '" data-depth-max="' + max + '">' + img(im, '', ' loading="lazy" decoding="async"') + '</span>';
  });
  const cards = byClass(row.reviews, 'ecp-posttype-testimonial', 'div');
  const slides = cards.map((c, i) => {
    const stars = (c.html.match(/ecp-rating-star-full/g) || []).length;          /* the hidden ratingValue is never read (L14) */
    const text = textOf((firstByClass(c.html, 'ecp-post-content') || { html: '' }).html);
    const by = textOf((firstByClass(c.html, 'ecp-post-attribute') || { html: '' }).html);
    return '<div class="rev-slide" role="group" aria-roledescription="slide" aria-label="' + (i + 1) + ' of ' + cards.length + '" data-reveal="up">'
      + '<figure class="review">'
      + (stars ? '<p class="stars" role="img" aria-label="' + stars + ' out of 5 stars">' + icon('star').repeat(stars) + '</p>' : '')
      + '<blockquote class="review__text"><p>' + esc(text) + '</p></blockquote>'
      + (by ? '<figcaption class="review__by">' + esc(by) + '</figcaption>' : '')
      + '</figure></div>';
  });
  const btnA = (/<a\b[^>]*class="[^"]*ecp-button[^"]*"[^>]*>[\s\S]*?<\/a>/i.exec(row.reviews) || [''])[0];
  let moreBtn = '';
  if (btnA) {
    const bTag = openTag(btnA);
    const href = H(attr(bTag, 'href'));
    const target = attr(bTag, 'target');
    const rel = (attr(bTag, 'rel') || '').split(/\s+/).filter(Boolean);
    if (!rel.includes('noopener')) rel.push('noopener');
    moreBtn = '<p class="reviews__more" data-reveal="up"><a class="btn btn--primary" href="' + esc(href || attr(bTag, 'href')) + '"' + (target ? ' target="' + esc(target) + '"' : '') + ' rel="' + esc(rel.join(' ')) + '">' + esc(textOf(btnA)) + icon('arrow') + '</a></p>';
  }
  const reviews = [
    '<section class="reviews">',
    '<div class="deco deco--dark" aria-hidden="true"></div>',
    /* the smile medallions straddle the Services/reviews seam (z 4); never paired with a quote (L04) */
    smiles.length ? '<div class="smiles" aria-hidden="true">\n' + smiles.join('\n') + '\n</div>' : '',
    '<div class="wrap">',
    '<div class="sec-head sec-head--tag" data-reveal="up">',
    '<span class="arch-mark" aria-hidden="true"><span class="numeral">IV</span></span>',
    '<div class="tag-row">' + sprig(false) + '<h2 class="tag-title" id="rev-h" data-settle>' + hashTitle(revTag) + '</h2>' + sprig(true) + '</div>',
    '</div>',
    '<div class="reviews__stage">',
    '<section class="rev-carousel" aria-roledescription="carousel" aria-labelledby="rev-h" data-carousel>',
    '<div class="rev-track" role="group" aria-labelledby="rev-h" tabindex="0" data-carousel-track>', slides.join('\n'), '</div>',
    '<div class="rev-nav">',
    '<button class="round-btn rev-nav__btn rev-nav__btn--prev" type="button" data-carousel-prev hidden>' + icon('chev') + '<span class="sr">Previous slide</span></button>',
    '<button class="round-btn rev-nav__btn rev-nav__btn--next" type="button" data-carousel-next hidden>' + icon('chev') + '<span class="sr">Next slide</span></button>',
    '</div>',
    '</section>',
    moreBtn,
    '</div>',
    '</div>',
    '</section>',
  ].filter(Boolean).join('\n');

  /* ================= V. #HeretoHelp (row 6): a blind niche, no generated image (its text names "Ask Dr.") ================= */
  const helpTag = headingText((firstByClass(row.help, 'ecp-heading', 'div') || { html: '' }).html);
  const qaH = headingText((byTag(row.help, 'h2')[0] || { html: '' }).html);
  const teamModule = firstByClass(row.help, 'ecp-posts-wrapper-team', 'div');
  if (teamModule && textOf(teamModule.html)) fail('home:leftover', '/', 'the #HeretoHelp team module is no longer empty: ' + textOf(teamModule.html).slice(0, 80));
  stats.homeEmptyTeamModuleDropped = teamModule && !textOf(teamModule.html) ? 1 : 0;
  const qaItems = byClass(row.help, 'ecp-accordion-item', 'div').map((it, i) => {
    const q = textOf((firstByClass(it.html, 'ecp-accordion-trigger-label') || { html: '' }).html);
    const content = firstByClass(it.html, 'ecp-accordion-content', 'div');
    const answer = inline(content ? inner(content.html).replace(/<\/p>\s*<p\b[^>]*>/gi, '<br><br>').replace(/^\s*<p\b[^>]*>|<\/p>\s*$/gi, '') : '');
    /* a trailing "More about ..." link stands in its own paragraph; the words are unchanged */
    const tail = /^([\s\S]*?)\s*(<a\b[^>]*>[^<]*<\/a>)\s*$/.exec(answer);
    const body = tail && tail[1] ? '<p>' + tail[1] + '</p><p>' + tail[2] + '</p>' : '<p>' + answer + '</p>';
    return '<details class="qa__item"' + (i === 0 ? ' open' : '') + '>\n'
      + '<summary class="qa__q"><span class="qa__text">' + esc(q) + '</span><span class="qa__icon" aria-hidden="true"></span></summary>\n'
      + '<div class="qa__a">' + body.replace(/<br><br>/g, '</p><p>') + '</div>\n</details>';
  });
  const help = [
    '<section class="help" aria-labelledby="help-h">',
    '<div class="deco deco--light" aria-hidden="true"></div>',
    '<div class="wrap">',
    '<div class="sec-head sec-head--tag" data-reveal="up">',
    '<span class="arch-mark" aria-hidden="true"><span class="numeral">V</span></span>',
    '<h2 class="tag-title help__tag" id="help-h">' + hashTitle(helpTag) + '</h2>',
    '</div>',
    '<div class="help__grid">',
    '<span class="help__niche" aria-hidden="true">' + orn('o-badge', 'help__ring') + orn('o-rosette', 'help__patera') + '</span>',
    '<div class="qa plate" data-reveal="up">',
    '<h2 class="qa__h">' + esc(qaH) + '</h2>',
    '<div class="qa__list" data-accordion>', qaItems.join('\n'), '</div>',
    '</div>',
    '</div>',
    '</div>',
    '</section>',
  ].join('\n');

  /* ================= VI. designer optical (row 7): the #759b2a band, plates hanging into Visit ================= */
  const desTitle = textOf((byTag(row.designer, 'p')[0] || { html: '' }).html);
  const plates = byClass(row.designer, 'ecp-callout', 'div').map((c) => {
    const a = (/<a\b[^>]*>/i.exec(c.html) || [''])[0];
    const imTag = (/<img\b[^>]*>/i.exec(c.html) || [''])[0];
    const im = sourceImg(attr(imTag, 'src'));
    const name = textOf((firstByClass(c.html, 'ecp-callout-content') || { html: '' }).html);
    const href = H(attr(a, 'href'));
    /* brand campaign images: T0, never cropped, masked, filtered or arch-framed; alts verbatim */
    const body = '<span class="brand__img">' + img(im, attr(imTag, 'alt') || '', ' loading="lazy" decoding="async"') + '</span><span class="brand__name">' + esc(name) + '</span>';
    return '<li data-reveal="rise">' + (href ? '<a class="brand" href="' + esc(href) + '">' + body + '</a>' : '<span class="brand">' + body + '</span>') + '</li>';
  });
  const designer = [
    '<section class="designer" aria-labelledby="des-h">',
    '<div class="wrap designer__grid">',
    '<div class="designer__head" data-reveal="up">',
    '<span class="numeral numeral--band" aria-hidden="true">VI</span>',
    '<span class="pilaster pilaster--l" aria-hidden="true"></span>',
    '<h2 class="designer__title" id="des-h">' + esc(desTitle) + '</h2>',
    '<span class="pilaster pilaster--r" aria-hidden="true"></span>',
    '</div>',
    '<ul class="brands" data-stagger>', plates.join('\n'), '</ul>',
    '</div>',
    '</section>',
  ].join('\n');

  /* ================= VII. visit (row 8): map plate, column, NAP stele, emergency ================= */
  const iframe = (/<iframe\b[^>]*>/i.exec(row.visit) || [''])[0];
  const mapQuery = (chrome && chrome.mapQuery) || '';
  /* L22: the agency-keyed embed becomes the keyless query embed (BUILD-DECISIONS #10) */
  const mapSrc = (chrome && chrome.mapSrc) || (mapQuery ? 'https://www.google.com/maps?q=' + encodeURIComponent(mapQuery) + '&output=embed' : '');
  if (iframe && !mapSrc) fail('home:map', '/', 'chrome.mapQuery missing: the map cannot be made keyless, so it is not rendered');
  const loc = firstByClass(row.visit, 'ecp-post-title', 'div');
  const locA = (/<a\b[^>]*>[\s\S]*?<\/a>/i.exec(loc ? loc.html : '') || [''])[0];
  const locHref = locA ? H(attr(locA, 'href')) : null;
  const addr = firstByClass(row.visit, 'ecp-post-address', 'div');
  const addrLines = addr ? inner(addr.html).split(/<br\b[^>]*>/i).map(textOf).filter(Boolean) : [];
  const phoneLi = firstByClass(row.visit, 'ecp-post-contactdetails-contacttype-Phone', 'li');
  const phoneLabel = phoneLi ? textOf((firstByClass(phoneLi.html, 'ecp-post-label') || { html: '' }).html) : '';
  const phoneA = phoneLi ? (/<a\b[^>]*>[\s\S]*?<\/a>/i.exec(phoneLi.html) || [''])[0] : '';
  const phone = textOf(phoneA);
  const hoursRows = byClass(row.visit, 'ecp-post-hours-item', 'li').map((li) => {
    const lab = textOf((firstByClass(li.html, 'ecp-post-label') || { html: '' }).html);
    const val = textOf((firstByClass(li.html, 'ecp-post-data') || { html: '' }).html);
    const day = lab.replace(/:\s*$/, '');
    return '<div class="hours__row" data-day="' + (DAY[day] !== undefined ? DAY[day] : '') + '"><dt>' + esc(lab) + '</dt><dd>' + esc(val) + '</dd></div>';
  });
  const sosH = textOf((firstByClass(row.visit, 'ecp-callout-title-text') || { html: '' }).html);
  const sosRt = firstByClass(row.visit, 'ecp-richtext', 'div');
  const sosParas = sosRt ? byTag(sosRt.html, 'p').map((p) => '<p>' + inline(inner(p.html)) + '</p>') : [];
  const sosBtn = (/<a\b[^>]*class="[^"]*ecp-button[^"]*"[^>]*>[\s\S]*?<\/a>/i.exec(row.visit) || [''])[0];
  const sosHref = sosBtn ? H(attr(openTag(sosBtn), 'href')) : null;       /* L17: "tel: 318-..." loses its space */
  const laurel = generated('neo-cut-laurel', 'the NAP medallion');
  const visit = [
    '<section class="visit">',
    '<div class="deco deco--light" aria-hidden="true"></div>',
    '<div class="wrap">',
    '<div class="sec-head sec-head--quiet" aria-hidden="true"><span class="numeral">VII</span>' + divider() + '</div>',
    '<div class="visit__grid" data-stagger>',
    mapSrc ? '<div class="map-plate" data-reveal="up">\n<div class="map"><iframe class="map__frame" src="' + esc(mapSrc) + '" title="Google map" loading="lazy"></iframe></div>\n<span class="map-plate__ledge" aria-hidden="true"></span>\n'
      /* the magnifier lies on the ledge (N4; no parallax: it must never drift over the iframe) */
      + genImg('neo-cut-magnifier', 'the Visit magnifier', 'visit__magnifier', ' loading="lazy" decoding="async"') + '\n</div>' : '',
    /* the column stands in the gap (N2, 1100+ only; no parallax: it stands on the ground) */
    genImg('neo-cut-column', 'the Visit column', 'visit__column', ' loading="lazy" decoding="async"'),
    '<div class="nap nap--stele" data-reveal="up">',
    '<span class="nap__medal" aria-hidden="true">' + (laurel ? img(laurel, '', ' loading="lazy" decoding="async"').replace('<img ', '<img class="nap__laurel" ') : '') + orn('o-badge', 'nap__ring') + orn('o-rosette', 'nap__rosette') + '</span>',
    loc ? '<p class="nap__title">' + (locHref ? '<a href="' + esc(locHref) + '">' + esc(textOf(locA)) + '</a>' : esc(textOf(loc.html))) + '</p>' : '',
    addrLines.length ? '<p class="nap__addr">' + icon('pin') + '<span>' + addrLines.map(esc).join('<br>') + '</span></p>' : '',
    phone ? '<p class="nap__phone">' + icon('phone') + '<span>' + (phoneLabel ? '<strong>' + esc(phoneLabel) + '</strong> ' : '') + '<a href="' + esc(H(attr(openTag(phoneA), 'href')) || 'tel:' + phone) + '">' + esc(phone) + '</a></span></p>' : '',
    hoursRows.length ? '<dl class="hours" data-hours>' + hoursRows.join('') + '</dl>' : '',
    '</div>',
    '<div class="sos" data-reveal="up">',
    '<div class="sos__head"><span class="icon-tile">' + icon('case') + '</span><h3 class="sos__h">' + esc(sosH) + '</h3></div>',
    sosParas.join('\n'),
    sosBtn && sosHref ? '<a class="btn btn--alert" href="' + esc(sosHref) + '">' + icon('phone') + esc(textOf(sosBtn)).replace(/\d{3}-\d{3}-\d{4}/g, '<span class="nobr">$&</span>') + '</a>' : '',
    '</div>',
    '</div>',
    '</div>',
    '</section>',
  ].filter(Boolean).join('\n');

  const out = [hero, welcome, services, reviews, help, designer, visit].join('\n');

  /* ================= no silent drops: every raw text run and image must be in the output ================= */
  const cleanMain = main
    .replace(/<(script|style|svg|noscript)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<span\b[^>]*itemprop="reviewRating"[^>]*>[\s\S]*?<\/span>\s*<\/span>/gi, ' ');   /* L14: the hidden "5" */
  const runs = cleanMain.replace(/<[^>]+>/g, '\n').split('\n').map(norm).filter((t) => t && /[A-Za-z0-9]/.test(t));
  const outText = norm(out.replace(/<(svg)\b[\s\S]*?<\/\1>/gi, '')
    .replace(/<\/?(span|a|strong|b|em|i|time)\b[^>]*>/gi, '').replace(/<[^>]+>/g, ' '));
  const leftovers = [...new Set(runs)].filter((t) => !outText.includes(t));
  leftovers.forEach((t) => fail('home:leftover', '/', 'source text not rendered: "' + t.slice(0, 120) + '"'));
  const rawImgs = [...cleanMain.matchAll(/<img\b[^>]*\ssrc="([^"]+)"/gi)].map((m) => decodeEntities(m[1]));
  if (bgUrl) rawImgs.push(bgUrl);
  const missingImgs = [...new Set(rawImgs)].filter((u) => !usedImages.has(u));
  missingImgs.forEach((u) => fail('home:leftover', '/', 'source image not rendered: ' + u));
  stats.homeSourceTextRuns = new Set(runs).size;
  stats.homeLeftoverTextRuns = leftovers.length;
  stats.homeSourceImages = new Set(rawImgs).size;
  stats.homeLeftoverImages = missingImgs.length;
  return out;
}
