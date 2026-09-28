/* home.mjs - the homepage, composed from the RAW source homepage (audit/raw/index.html).

   HOME CONTRACT (docs/COMPONENTS.md G.1): buildHome(ctx) returns the HTML placed inside <main id="main">.
   The source home is 9 Beaver Builder rows, found here by their data-node ids (SITE-ARCHITECTURE 5,
   PORT-NOTES H-1). Each row is read from the raw markup BEFORE any sanitising, because 6 of the visual
   headings are div.ecp-heading (a sanitiser flattens them to <p>), the Q&A answers sit in [hidden] divs
   (real copy, X-1) and the hidden ratingValue "5" must not render (X-1, L14).

   Copy is never written here: every visible string comes out of the row it belongs to. The only
   non-source strings are the COMPONENTS H.2 accessibility labels (aria-label / aria-roledescription).
   At the end every text run and every image of the raw <main> is checked against the output; anything
   not rendered is reported through ctx.fail('home:leftover', '/', ...) (no silent drops). */
import { decodeEntities, findElements, elementEnd } from './util.mjs';

const ROWS = {
  hero: '5ded9754972ce', dock: '5ded9754977e9', welcomeH: '5ded975497569', welcome: '5df6091f63e9d',
  services: '5ded97549790b', reviews: '5ded975498007', help: '5ded975497aee', designer: '5ded9754987c6', visit: '5ded975497d41',
};
const DAY = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
const DOCK_ICON = { 'Email Us': 'mail', 'Schedule An Appointment': 'cal', 'Patient Forms': 'form', 'Order Contacts Online': 'cart' };
/* tmp/lab/canopy/index.html line 294 (the decorative quote glyph that replaces the platform's review-quote.png, L11) */
const QUOTE_PATH = 'M9.6 6C6.5 7 4.6 9.6 4.6 13v5h6v-6H7.7c.2-2 1.3-3.3 3-4zM19 6c-3.1 1-5 3.6-5 7v5h6v-6h-2.9c.2-2 1.3-3.3 3-4z';
const SWASH = '<svg class="swash" viewBox="0 0 300 24" aria-hidden="true" focusable="false" preserveAspectRatio="none"><path d="M4 16C62 6 130 4 190 9s84 7 106 3"/></svg>';

const norm = (s) => decodeEntities(String(s || '')).replace(/[\u00a0\s]+/g, ' ').trim();
const textOf = (html) => norm(String(html || '').replace(/<(script|style|svg)\b[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' '));
const attr = (tag, name) => { const m = new RegExp('\\s' + name + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\')', 'i').exec(tag); return m ? decodeEntities(m[1] !== undefined ? m[1] : m[2]) : null; };
const openTag = (html) => (/^<[^>]+>/.exec(html) || [''])[0];
const inner = (html) => html.replace(/^<[^>]+>/, '').replace(/<\/[a-z0-9]+>\s*$/i, '');
/* elements whose class list contains `cls` (outermost first) */
const byClass = (html, cls, tag = '[a-z][a-z0-9]*') => findElements(html, new RegExp('<(' + tag + ')\\b[^>]*\\sclass="[^"]*(?<![\\w-])' + cls.replace(/[-]/g, '\\-') + '(?![\\w-])[^"]*"', 'i'));
const firstByClass = (html, cls, tag) => byClass(html, cls, tag)[0] || null;
const byTag = (html, tag) => findElements(html, new RegExp('<(' + tag + ')\\b', 'i'));
/* a RegExp for ctx.src from a source URL: the file name's word runs, with a small gap allowed between
   them, so "Converse%20Ad.jpg" matches the harvested "Converse-20Ad.jpg" and the original URL alike */
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

  /* ---- helpers that keep source copy and its inline markup, never its platform attributes ---- */
  /* inline HTML of a source fragment: a/strong/em/b/i/br kept (links resolved page-relative, dead ones
     unwrapped to their words), every other tag unwrapped, attributes dropped */
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
  function img(im, alt, extra) {
    return '<img src="' + esc(im.url) + '" alt="' + esc(alt) + '" width="' + im.w + '" height="' + im.h + '"' + (extra || '') + '>';
  }
  function sourceImg(url) { usedImages.add(url); return src(srcPattern(url)); }   /* throws if absent: a build failure, never a placeholder */
  function generated(id, where) {
    const g = gen(id);
    if (!g) fail('home:gen', id, 'generated image not available; ' + where + ' renders without it');
    return g;
  }
  const headingText = (html) => textOf((firstByClass(html, 'ecp-heading-text') || { html }).html);

  /* ================= 1. hero + dock (rows 0, 1) ================= */
  const heroLines = byClass(row.hero, 'ecp-heading').map((e) => headingText(e.html)).filter(Boolean);
  if (heroLines.length !== 3) fail('home:hero', '/', 'expected 3 hero heading lines, found ' + heroLines.length);
  const bgUrl = attr(openTag(row.hero), 'data-background-image-src');
  if (!bgUrl) throw new Error('home: hero row has no data-background-image-src');
  const heroPhoto = sourceImg(bgUrl);
  const scene = generated('scene-greenery-window', 'the hero stage');
  const heroCut = generated('cut-eyeglasses', 'the hero cut-out');
  const tiles = byClass(row.dock, 'ecp-badge', 'a').map((e) => {
    const tag = openTag(e.html);
    const label = textOf((firstByClass(e.html, 'ecp-badge-title') || e).html);
    return { label, href: attr(tag, 'href'), blank: attr(tag, 'target') === '_blank' };
  });
  const dockHtml = tiles.map((t) => {
    const primary = /^Schedule An Appointment$/i.test(t.label);
    const href = H(t.href);
    return '<a class="dock__tile ' + (primary ? 'dock__tile--primary glass glass--leaf-deep' : 'glass glass--image') + '"' + (href ? ' href="' + esc(href) + '"' : '')
      + (t.blank ? ' target="_blank" rel="noopener"' : '') + ' data-reveal="up"><span class="dock__icon">' + icon(DOCK_ICON[t.label] || 'arrow') + '</span><span class="dock__label">' + esc(t.label) + '</span></a>';
  }).join('\n');
  const statement = heroLines.map((l, i) => i === heroLines.length - 1
    ? '<span class="hero__line hero__line--accent">' + esc(l) + SWASH + '</span>'
    : '<span class="hero__line">' + esc(l) + '</span>').join('\n');
  const hero = [
    '<section class="hero">',
    '<div class="wrap hero__grid" data-hero>',
    '<div class="hero__stage" aria-hidden="true">',
    scene ? img(scene, '', ' decoding="async"').replace('<img ', '<img class="hero__scene" ') : '',
    '<span class="hero__veil"></span>',
    '<span class="hero__sun"></span>',
    '<span class="hero__beams"></span>',
    '</div>',
    '<div class="hero__copy glass glass--image" data-reveal="left">',
    '<p class="hero__statement">', statement, '</p>',
    '</div>',
    '<figure class="hero__photo" data-depth="0.035" data-depth-max="24">',
    '<span class="hero__photo-in" data-reveal="settle">' + img(heroPhoto, '', ' fetchpriority="high" decoding="async"') + '</span>',
    '</figure>',
    heroCut ? img(heroCut, '', ' decoding="async" data-depth="-0.07" data-depth-max="32"').replace('<img ', '<img class="hero__cut" ') : '',
    '<nav class="dock" aria-label="Quick links" data-stagger>', dockHtml, '</nav>',
    '</div>',
    '</section>',
  ].filter(Boolean).join('\n');

  /* ================= 2. welcome (rows 2, 3) ================= */
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
      '<section class="news glass glass--light is-solid" data-reveal="up" aria-labelledby="news-h">',
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
          /* the lead term = the text before the first dash that is followed by a space ("Eye Exams &#8211; ...",
             "Eye Disease Treatment- ..."); hyphens inside words ("on-line") are not separators */
          const m = /^([^<]+?)(\s*(?:&#8211;|&ndash;|&#8212;|&mdash;|\u2013|\u2014|-)\s+)([\s\S]*)$/.exec(it);
          return '<li data-reveal="up">' + (m ? '<strong>' + m[1] + '</strong>' + m[2] + m[3] : it) + '</li>';
        }).join('\n') + '\n</ul>';
      }
      return '<ul class="offer-list">' + items.map((it) => '<li>' + it + '</li>').join('') + '</ul>';
    }
    return '<h3 class="offer-h">' + esc(textOf(b.html)) + '</h3>';
  }).filter(Boolean).join('\n');
  const sprig = generated('cut-olive-sprig', 'the Welcome/Services seam');
  const welcome = [
    '<section class="welcome" aria-labelledby="welcome-h">',
    '<div class="deco" aria-hidden="true">',
    '<span class="orb orb--lime welcome__orb-a" data-depth="0.05"></span><span class="orb orb--teal welcome__orb-b" data-depth="0.03"></span><span class="orb orb--sun welcome__orb-c" data-depth="0.06"></span>',
    '</div>',
    sprig ? img(sprig, '', ' loading="lazy" decoding="async" data-depth="-0.08" data-depth-max="24" data-rot="12"').replace('<img ', '<img class="sprig" ') : '',
    '<div class="wrap">',
    '<h1 class="section-title section-title--center welcome__h" id="welcome-h" data-reveal="up">' + welcomeH + '</h1>',
    '<div class="welcome__grid">',
    '<div class="welcome__side">',
    '<article class="promo glass glass--light is-solid" data-reveal="up">',
    promoImg ? '<figure class="promo__img pop" data-depth="-0.04" data-depth-max="20"><span class="promo__img-in" data-reveal="blur">' + img(promoImg, '', ' loading="lazy" decoding="async"') + '</span></figure>' : '',
    promoTitle ? '<h3 class="promo__title">' + esc(promoTitle) + '</h3>' : '',
    promoParas.join('\n'),
    '</article>',
    newsHtml,
    '</div>',
    '<div class="welcome__main glass glass--light is-solid" data-reveal="up">',
    copyHtml,
    '</div>',
    '</div>',
    '</div>',
    '</section>',
  ].filter(Boolean).join('\n');

  /* ================= 3. services (row 4) ================= */
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
    const body = '<span class="svc__frame">' + img(im, '', ' loading="lazy" decoding="async"') + '</span><span class="svc__foot"><span class="svc__name">' + esc(name) + '</span><span class="svc__go">' + icon('arrow') + '</span></span>';
    return '<li data-reveal="rise">\n' + (href ? '<a class="svc glass glass--light is-solid" href="' + esc(href) + '" data-tilt="7">' + body + '</a>' : '<span class="svc glass glass--light is-solid">' + body + '</span>') + '\n</li>';
  });
  const services = [
    '<section class="services" aria-labelledby="svc-h">',
    '<div class="services__band" aria-hidden="true"></div>',
    '<div class="wrap services__in">',
    '<h2 class="section-title section-title--center" id="svc-h" data-reveal="up">' + svcTitleHtml + '</h2>',
    '<ul class="svc-grid" data-stagger>', svcTiles.join('\n'), '</ul>',
    '</div>',
    '</section>',
  ].join('\n');

  /* ================= 4. reviews (row 5) ================= */
  const hashTitle = (t) => { const s = String(t); return s.startsWith('#') ? '<span class="hash">#</span>' + esc(s.slice(1)) : esc(s); };
  const revTag = headingText((firstByClass(row.reviews, 'ecp-heading', 'div') || { html: '' }).html);
  const smileClasses = [['smile--a', '-0.05'], ['smile--b', '-0.1'], ['smile--c', '-0.02']];
  const smiles = byClass(row.reviews, 'ecp-carousel-item', 'div').map((it, i) => {
    const imTag = (/<img\b[^>]*>/i.exec(it.html) || [''])[0];
    const im = sourceImg(attr(imTag, 'src'));
    const [cls, dep] = smileClasses[i] || ['smile--c', '-0.02'];
    return '<span class="smile ' + cls + ' is-solid" data-depth="' + dep + '" data-depth-max="24">' + img(im, '', ' loading="lazy" decoding="async"') + '</span>';
  });
  const cards = byClass(row.reviews, 'ecp-posttype-testimonial', 'div');
  const slides = cards.map((c, i) => {
    const stars = (c.html.match(/ecp-rating-star-full/g) || []).length;          /* X-1: the hidden ratingValue is never read or rendered */
    const text = textOf((firstByClass(c.html, 'ecp-post-content') || { html: '' }).html);
    const by = textOf((firstByClass(c.html, 'ecp-post-attribute') || { html: '' }).html);
    return '<div class="rev-slide" role="group" aria-roledescription="slide" aria-label="' + (i + 1) + ' of ' + cards.length + '" data-reveal="up">'
      + '<figure class="review glass glass--light is-solid">'
      + '<svg class="review__q" aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="' + QUOTE_PATH + '"/></svg>'
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
    if (target === '_blank' && !rel.includes('noopener')) rel.push('noopener');
    if (!target && !rel.includes('noopener')) rel.push('noopener');
    moreBtn = '<p class="reviews__more" data-reveal="up"><a class="btn btn--primary" href="' + esc(href || attr(bTag, 'href')) + '"' + (target ? ' target="' + esc(target) + '"' : '') + ' rel="' + esc(rel.join(' ')) + '">' + esc(textOf(btnA)) + icon('arrow') + '</a></p>';
  }
  const reviews = [
    '<section class="reviews">',
    '<div class="deco" aria-hidden="true">',
    '<span class="orb orb--lime reviews__orb-a" data-depth="0.05"></span><span class="orb orb--teal reviews__orb-b" data-depth="0.07"></span><span class="orb orb--mint reviews__orb-c" data-depth="0.03"></span>',
    '</div>',
    '<div class="wrap">',
    smiles.length ? '<div class="smiles" aria-hidden="true">\n' + smiles.join('\n') + '\n</div>' : '',
    '<h2 class="section-title section-title--center tag-title" id="rev-h" data-reveal="up">' + hashTitle(revTag) + '</h2>',
    '<div class="reviews__stage">',
    '<section class="rev-carousel" aria-roledescription="carousel" aria-labelledby="rev-h" data-carousel>',
    '<div class="rev-track" tabindex="0" data-carousel-track>', slides.join('\n'), '</div>',
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

  /* ================= 5. #HeretoHelp (row 6) ================= */
  const helpTag = headingText((firstByClass(row.help, 'ecp-heading', 'div') || { html: '' }).html);
  const qaH = headingText((byTag(row.help, 'h2')[0] || { html: '' }).html);
  const teamModule = firstByClass(row.help, 'ecp-posts-wrapper-team', 'div');
  if (teamModule && textOf(teamModule.html)) fail('home:leftover', '/', 'the #HeretoHelp team module is no longer empty: ' + textOf(teamModule.html).slice(0, 80));
  stats.homeEmptyTeamModuleDropped = teamModule && !textOf(teamModule.html) ? 1 : 0;
  const qaItems = byClass(row.help, 'ecp-accordion-item', 'div').map((it, i) => {
    const q = textOf((firstByClass(it.html, 'ecp-accordion-trigger-label') || { html: '' }).html);
    const content = firstByClass(it.html, 'ecp-accordion-content', 'div');
    let answer = inline(content ? inner(content.html).replace(/<\/p>\s*<p\b[^>]*>/gi, '<br><br>').replace(/^\s*<p\b[^>]*>|<\/p>\s*$/gi, '') : '');
    /* COMPONENTS G.7: a trailing "More about ..." link stands in its own paragraph; the words are unchanged */
    const tail = /^([\s\S]*?)\s*(<a\b[^>]*>[^<]*<\/a>)\s*$/.exec(answer);
    const body = tail && tail[1] ? '<p>' + tail[1] + '</p><p>' + tail[2] + '</p>' : '<p>' + answer + '</p>';
    return '<details class="qa__item glass glass--leaf is-solid"' + (i === 0 ? ' open' : '') + '>\n'
      + '<summary class="qa__q"><span class="qa__text">' + esc(q) + '</span><span class="qa__icon" aria-hidden="true"></span></summary>\n'
      + '<div class="qa__a">' + body.replace(/<br><br>/g, '</p><p>') + '</div>\n</details>';
  });
  const help = [
    '<section class="help" aria-labelledby="help-h">',
    '<div class="deco" aria-hidden="true"><span class="orb orb--lime help__orb-a" data-depth="0.05"></span><span class="orb orb--sun help__orb-b" data-depth="0.03"></span></div>',
    '<div class="wrap help__grid">',
    '<div class="help__side" data-reveal="left">',
    '<h2 class="section-title tag-title help__tag" id="help-h">' + hashTitle(helpTag) + '</h2>',
    '<div class="help__iris" data-depth="-0.05" data-depth-max="16" aria-hidden="true"><span class="iris iris--lg"></span></div>',
    '</div>',
    '<div class="qa glass glass--light" data-reveal="up">',
    '<h2 class="qa__h">' + esc(qaH) + '</h2>',
    '<div class="qa__list" data-accordion>', qaItems.join('\n'), '</div>',
    '</div>',
    '</div>',
    '</section>',
  ].join('\n');

  /* ================= 6. designer optical (row 7) ================= */
  const desTitle = textOf((byTag(row.designer, 'p')[0] || { html: '' }).html);
  const plates = byClass(row.designer, 'ecp-callout', 'div').map((c) => {
    const a = (/<a\b[^>]*>/i.exec(c.html) || [''])[0];
    const imTag = (/<img\b[^>]*>/i.exec(c.html) || [''])[0];
    const im = sourceImg(attr(imTag, 'src'));
    const name = textOf((firstByClass(c.html, 'ecp-callout-content') || { html: '' }).html);
    const href = H(attr(a, 'href'));
    const body = '<span class="brand__img">' + img(im, attr(imTag, 'alt') || '', ' loading="lazy" decoding="async"') + '</span><span class="brand__name">' + esc(name) + '</span>';
    return '<li data-reveal="rise">' + (href ? '<a class="brand is-solid" href="' + esc(href) + '">' + body + '</a>' : '<span class="brand is-solid">' + body + '</span>') + '</li>';
  });
  const designer = [
    '<section class="designer" aria-labelledby="des-h">',
    '<div class="designer__band">',
    '<div class="wrap designer__grid">',
    '<h2 class="designer__title" id="des-h" data-reveal="up">' + esc(desTitle) + '</h2>',
    '<ul class="brands" data-stagger>', plates.join('\n'), '</ul>',
    '</div>',
    '</div>',
    '</section>',
  ].join('\n');

  /* ================= 7. visit: map, NAP + hours, emergency (row 8) ================= */
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
    return '<div class="hours__row is-solid" data-day="' + (DAY[day] !== undefined ? DAY[day] : '') + '"><dt>' + esc(lab) + '</dt><dd>' + esc(val) + '</dd></div>';
  });
  const sosH = textOf((firstByClass(row.visit, 'ecp-callout-title-text') || { html: '' }).html);
  const sosRt = firstByClass(row.visit, 'ecp-richtext', 'div');
  const sosParas = sosRt ? byTag(sosRt.html, 'p').map((p) => '<p>' + inline(inner(p.html)) + '</p>') : [];
  const sosBtn = (/<a\b[^>]*class="[^"]*ecp-button[^"]*"[^>]*>[\s\S]*?<\/a>/i.exec(row.visit) || [''])[0];
  const sosHref = sosBtn ? H(attr(openTag(sosBtn), 'href')) : null;       /* L17: "tel: 318-..." loses its space */
  const visit = [
    '<section class="visit">',
    '<div class="deco" aria-hidden="true"><span class="orb orb--lime visit__orb-a" data-depth="0.04"></span><span class="orb orb--teal visit__orb-b" data-depth="0.06"></span></div>',
    '<div class="wrap visit__grid" data-stagger>',
    mapSrc ? '<div class="map" data-reveal="up"><iframe class="map__frame" src="' + esc(mapSrc) + '" title="Google map" loading="lazy"></iframe></div>' : '',
    '<div class="nap glass glass--image" data-reveal="up">',
    loc ? '<p class="nap__title">' + (locHref ? '<a href="' + esc(locHref) + '">' + esc(textOf(locA)) + '</a>' : esc(textOf(loc.html))) + '</p>' : '',
    addrLines.length ? '<p class="nap__addr">' + icon('pin') + '<span>' + addrLines.map(esc).join('<br>') + '</span></p>' : '',
    phone ? '<p class="nap__phone">' + icon('phone') + '<span>' + (phoneLabel ? '<strong>' + esc(phoneLabel) + '</strong> ' : '') + '<a href="' + esc(H(attr(openTag(phoneA), 'href')) || 'tel:' + phone) + '">' + esc(phone) + '</a></span></p>' : '',
    hoursRows.length ? '<dl class="hours" data-hours>' + hoursRows.join('') + '</dl>' : '',
    '</div>',
    '<div class="sos glass glass--dark is-solid" data-reveal="up">',
    '<div class="sos__head"><span class="icon-tile">' + icon('case') + '</span><h3 class="sos__h">' + esc(sosH) + '</h3></div>',
    sosParas.join('\n'),
    sosBtn && sosHref ? '<a class="btn btn--alert" href="' + esc(sosHref) + '">' + icon('phone') + esc(textOf(sosBtn)) + '</a>' : '',
    '</div>',
    '</div>',
    '</section>',
  ].filter(Boolean).join('\n');

  const out = [hero, welcome, services, reviews, help, designer, visit].join('\n');

  /* ================= no silent drops: every raw text run and image must be in the output ================= */
  const cleanMain = main
    .replace(/<(script|style|svg|noscript)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<span\b[^>]*itemprop="reviewRating"[^>]*>[\s\S]*?<\/span>\s*<\/span>/gi, ' ');   /* X-1 / L14: the hidden "5" */
  /* source runs: the text between ANY two tags (the atomic pieces); output text: inline tags removed
     without a gap (so "<span>#</span>HappyPatients" reads "#HappyPatients"), block tags as a space */
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
