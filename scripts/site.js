/* site.js - Clifton Eye Center, "Daylight Canopy". Vanilla, no dependencies, loaded with `defer`.
   Implements exactly the hook registry of docs/COMPONENTS.md section 1; the page reads fully without it.
   Motion is progressive: `js-motion` is set in <head> before first paint (only when motion is allowed
   and IntersectionObserver exists) and rolled back after 4 s unless this file sets window.__siteReady. */
(function () {
  'use strict';
  window.__siteReady = true;

  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  var desk = window.matchMedia('(min-width: 1024px)');
  var motionOK = !reduce.matches;
  var revealOK = motionOK && html.classList.contains('js-motion') && 'IntersectionObserver' in window;
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || d).querySelectorAll(sel)); };
  var on = function (el, ev, fn, opt) { if (el) el.addEventListener(ev, fn, opt || false); };
  var onMQ = function (mq, fn) { if (mq.addEventListener) mq.addEventListener('change', fn); else if (mq.addListener) mq.addListener(fn); };

  /* ---------- reveals: IO, threshold 0, rootMargin 0px, stagger, release, fail-safe ---------- */
  var reveals = $$('[data-reveal]');
  $$('[data-stagger]').forEach(function (group) {
    var n = 0;
    $$('[data-reveal]', group).forEach(function (el) {
      if (el.parentElement && el.parentElement.closest('[data-stagger]') !== group) return;   /* a nested group numbers its own */
      el.style.setProperty('--i', String(n++ % 6));
    });
  });
  function release(el) { el.removeAttribute('data-reveal'); el.style.removeProperty('--i'); }
  function reveal(el) {
    if (el.classList.contains('is-in') || !el.hasAttribute('data-reveal')) return;
    el.classList.add('is-in');
    var i = parseFloat(el.style.getPropertyValue('--i')) || 0;
    /* once the entrance has played, data-reveal goes, so reveal rules never outrank hover transforms */
    setTimeout(function () { release(el); }, 1000 + i * 90);
  }
  if (revealOK) {
    var delivered = false;
    var io = new IntersectionObserver(function (entries) {
      delivered = true;
      entries.forEach(function (en) { if (en.isIntersecting) { reveal(en.target); io.unobserve(en.target); } });
    }, { root: null, rootMargin: '0px', threshold: 0 });
    reveals.forEach(function (el) { io.observe(el); });
    /* fail-safe ONLY if the observer never delivered an entry (a working observer always delivers one) */
    setTimeout(function () { if (!delivered) reveals.forEach(reveal); }, 3000);
    on(window, 'beforeprint', function () { reveals.forEach(reveal); });
    /* keyboard focus inside a block whose entrance has not played reveals it (and every revealing ancestor) now;
       motion.css shows a :focus-within host at once, this keeps it shown after focus moves on (RA-04) */
    on(d, 'focusin', function (e) {
      for (var el = e.target; el && el.closest; el = el.parentElement) {
        el = el.closest('[data-reveal]');
        if (!el) break;
        reveal(el); io.unobserve(el);
      }
    });
  } else {
    html.classList.remove('js-motion');
    reveals.forEach(release);
  }

  /* ---------- scroll-linked: progress, header condense, parallax, hero progress (one rAF handler) ---------- */
  var header = d.querySelector('[data-header]');
  var hero = d.querySelector('[data-hero]');
  var layers = [];
  /* QA r2 RA2-02 (G10): where CSS scroll-driven animations exist, motion.css moves the layers and the hero on the
     compositor; this file only hands each layer its factors once (--d, --max, --rot) and writes nothing per frame.
     Without them (no animation-timeline support) the rAF path below runs as before. */
  var sda = !!(window.CSS && CSS.supports && CSS.supports('animation-timeline: view()'));
  if (sda) $$('[data-depth]').forEach(function (el) {
    el.style.setProperty('--d', el.getAttribute('data-depth') || '0');
    el.style.setProperty('--max', el.getAttribute('data-depth-max') || '42');
    if (el.hasAttribute('data-rot')) el.style.setProperty('--rot', el.getAttribute('data-rot'));
  });
  function measure() {
    if (!motionOK || sda) { layers = []; return; }
    var y = window.scrollY || 0;
    var els = $$('[data-depth]');
    els.forEach(function (el) { setVar(el, '--py', '0'); });   /* translate reset while measuring (all writes, then all reads) */
    layers = els.map(function (el) {
      var r = el.getBoundingClientRect();
      return { el: el, top: r.top + y, h: r.height,
        d: parseFloat(el.getAttribute('data-depth')) || 0,
        max: parseFloat(el.getAttribute('data-depth-max')) || 42,
        rot: parseFloat(el.getAttribute('data-rot') || '0') || 0 };
    });
  }
  /* a custom property is written only when its value changes: an unchanged write still costs a style pass */
  function setVar(el, name, v) {
    var k = '_' + name;
    if (el[k] === v) return;
    el[k] = v;
    el.style.setProperty(name, v);
  }
  function parallax(y, vh) {
    var k = window.innerWidth < 700 ? 0.55 : 1;
    var rest = vh > 2400;                                          /* full-page captures show the designed rest pose */
    for (var i = 0; i < layers.length; i++) {
      var L = layers[i];
      if (L.top - y > vh * 1.6 || L.top + L.h - y < -vh * 1.6) continue;   /* skip layers far away */
      var centre = L.top + L.h / 2 - y - vh / 2;
      var py = rest ? 0 : Math.max(-L.max, Math.min(L.max, -centre * L.d * k));
      setVar(L.el, '--py', py.toFixed(1));
      if (L.rot) setVar(L.el, '--pr', (rest ? 0 : Math.max(-1, Math.min(1, centre / vh)) * -L.rot).toFixed(2));
    }
    if (hero) {
      var r = hero.getBoundingClientRect();
      var p = rest ? 0 : Math.min(1, Math.max(0, -r.top / Math.max(1, r.height)));
      setVar(hero, '--hp', p.toFixed(3));
    }
  }
  /* --scroll is written on the progress bar's own span, its only consumer (site.css .progress span). Written on
     <html>, the inherited property restyled the whole document every scroll frame: p95 183-267ms at 4x CPU on
     /privacy-policy/ against 16.8ms on the span (RA-02, gate G10). */
  var bar = d.querySelector('.progress span');
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY || 0, vh = window.innerHeight;
    var max = Math.max(1, html.scrollHeight - vh);
    if (bar) setVar(bar, '--scroll', Math.min(1, y / max).toFixed(4));
    if (header) header.classList.toggle('is-scrolled', y > 40);
    if (motionOK && !sda) parallax(y, vh);
  }
  /* QA r2 RA2-02 (G10): html.is-scrolling from the first scroll event until 200ms after the last; motion.css pauses
     the slow ambient drifts under the glass meanwhile. The class changes twice per scroll, never per frame. */
  var scrolling = false, scrollIdle = 0;
  function markScrolling() {
    if (!scrolling) { scrolling = true; html.classList.add('is-scrolling'); }
    clearTimeout(scrollIdle);
    scrollIdle = setTimeout(function () { scrolling = false; html.classList.remove('is-scrolling'); }, 200);
  }
  function requestTick() { markScrolling(); if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); } }
  function remeasure() { measure(); onScroll(); }
  on(window, 'scroll', requestTick, { passive: true });
  on(window, 'resize', function () { remeasure(); stickyFit(); }, { passive: true });
  on(window, 'load', remeasure);
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(remeasure);
  onMQ(reduce, function () { motionOK = !reduce.matches; if (!motionOK) $$('[data-depth]').forEach(function (el) { el.style.removeProperty('--py'); el.style.removeProperty('--pr'); el['_--py'] = el['_--pr'] = undefined; }); remeasure(); });
  remeasure();
  /* CG-03: the layers were measured on load, fonts.ready and resize only, so opening the Q&A answers (a taller help
     grid, its side column re-centred) left the iris's stored position stale and --py clamped at -16 while the
     "#HeretoHelp" heading was on screen: the ring touched the "p" descender. Any change of the page's height
     (an accordion, a rail, a late layout) re-measures, once per frame. */
  var relayout = 0;
  function remeasureSoon() { if (!relayout) relayout = window.requestAnimationFrame(function () { relayout = 0; remeasure(); }); }
  on(d, 'toggle', remeasureSoon, true);                              /* <details> toggle does not bubble: capture */
  if ('ResizeObserver' in window) new ResizeObserver(remeasureSoon).observe(d.body);

  /* ---------- pointer: glass specular follows fine pointers; card tilt after the reveal is released ---------- */
  if (fine.matches && motionOK) {
    on(d, 'pointermove', function (e) {
      var g = e.target && e.target.closest ? e.target.closest('.glass') : null;
      if (!g) return;
      var r = g.getBoundingClientRect();
      g.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      g.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    }, { passive: true });
    $$('[data-tilt]').forEach(function (el) {
      var max = parseFloat(el.getAttribute('data-tilt')) || 6;
      on(el, 'pointermove', function (e) {
        if (reduce.matches || el.closest('[data-reveal]')) return;   /* no tilt until the entrance is released */
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.classList.add('is-tilting');
        el.style.setProperty('--rx', (x * max).toFixed(2));
        el.style.setProperty('--ry', (-y * max).toFixed(2));
      });
      on(el, 'pointerleave', function () {
        el.classList.remove('is-tilting');
        el.style.setProperty('--rx', '0');
        el.style.setProperty('--ry', '0');
      });
    });
  }

  /* ---------- mobile drawer: focus trap, Esc, scrim, scroll lock, inert page, focus restore ---------- */
  var drawer = d.querySelector('[data-drawer]');
  var opener = d.querySelector('[data-drawer-open]');
  var scrim = d.querySelector('.scrim[data-drawer-close]');
  var page = d.querySelector('.page');
  var closeTimer = null;
  function focusables(root) {
    return $$('a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])', root)
      .filter(function (el) { return el.offsetWidth || el.offsetHeight || el.getClientRects().length; });
  }
  function openDrawer() {
    if (!drawer || !opener) return;
    clearTimeout(closeTimer);
    var sbw = window.innerWidth - html.clientWidth;
    drawer.hidden = false;
    if (scrim) scrim.hidden = false;
    void drawer.offsetWidth;                                        /* commit the closed pose so the slide runs */
    drawer.classList.add('is-open');
    if (scrim) scrim.classList.add('is-open');
    opener.setAttribute('aria-expanded', 'true');
    if (page) { page.inert = true; page.setAttribute('inert', ''); }
    if (sbw > 0) d.body.style.paddingRight = sbw + 'px';
    html.classList.add('is-locked');
    var first = drawer.querySelector('.drawer__link') || focusables(drawer)[0];
    if (first) first.focus();
  }
  function closeDrawer(restore) {
    if (!drawer || !opener || drawer.hidden) return;
    drawer.classList.remove('is-open');
    if (scrim) scrim.classList.remove('is-open');
    opener.setAttribute('aria-expanded', 'false');
    if (page) { page.inert = false; page.removeAttribute('inert'); }
    html.classList.remove('is-locked');
    d.body.style.paddingRight = '';
    var done = function () { drawer.hidden = true; if (scrim) scrim.hidden = true; };
    if (reduce.matches) done(); else closeTimer = setTimeout(done, 520);
    if (restore !== false) opener.focus();
  }
  on(opener, 'click', openDrawer);
  $$('[data-drawer-close]').forEach(function (b) { on(b, 'click', function () { closeDrawer(true); }); });
  on(d, 'keydown', function (e) {
    if (!drawer || drawer.hidden || !drawer.classList.contains('is-open')) return;
    if (e.key === 'Escape') { e.preventDefault(); closeDrawer(true); return; }
    if (e.key !== 'Tab') return;
    var f = focusables(drawer);
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && (d.activeElement === first || !drawer.contains(d.activeElement))) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (d.activeElement === last || !drawer.contains(d.activeElement))) { e.preventDefault(); first.focus(); }
  });
  /* QA r2 RA2-03: when the layout turns desktop with the drawer open, the drawer closes without focusing the menu
     button (now hidden). If focus was inside the drawer it moves to the visible equivalent: the primary-nav link with
     the same href, else the first primary-nav link, else the logo; never left on <body> at the end of the page. */
  onMQ(desk, function () {
    if (!desk.matches || !drawer || drawer.hidden) return;
    var from = drawer.contains(d.activeElement) ? d.activeElement : null;
    closeDrawer(false);
    if (!from) return;
    var href = from.getAttribute && from.getAttribute('href');
    var links = $$('.mainnav__link[href]');
    var to = (href && links.filter(function (a) { return a.getAttribute('href') === href; })[0]) || links[0] || d.querySelector('.site-header .site-logo');
    if (to) to.focus();
  });

  /* ---------- dormant nav disclosure (DESIGN-SPEC 3.2 pattern; the source menu is flat, so nothing binds today) ---------- */
  $$('.mainnav__item > button[aria-expanded][aria-controls]').forEach(function (btn) {
    var item = btn.parentElement, panel = d.getElementById(btn.getAttribute('aria-controls')), intent = null;
    if (!panel) return;
    function set(open) { btn.setAttribute('aria-expanded', open ? 'true' : 'false'); panel.hidden = !open; }
    set(false);
    on(btn, 'click', function () { set(btn.getAttribute('aria-expanded') !== 'true'); });
    on(item, 'keydown', function (e) { if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { set(false); btn.focus(); } });
    on(item, 'focusout', function (e) { if (!item.contains(e.relatedTarget)) set(false); });
    on(d, 'click', function (e) { if (!item.contains(e.target)) set(false); });
    if (fine.matches) {
      on(item, 'mouseenter', function () { clearTimeout(intent); intent = setTimeout(function () { set(true); }, 150); });
      on(item, 'mouseleave', function () { clearTimeout(intent); set(false); });
    }
  });

  /* ---------- accordions: print opens every item, then restores ---------- */
  var printOpened = [];
  on(window, 'beforeprint', function () {
    printOpened = $$('[data-accordion] details:not([open]), details[data-rail]:not([open])');
    printOpened.forEach(function (x) { x.open = true; });
  });
  on(window, 'afterprint', function () { printOpened.forEach(function (x) { x.open = false; }); printOpened = []; });

  /* ---------- section rail: open from 1024px (placed in the aside column), closed below ---------- */
  var rails = $$('details[data-rail]');
  function syncRails() { rails.forEach(function (r) { r.open = desk.matches; }); }
  if (rails.length) { syncRails(); onMQ(desk, syncRails); }

  /* ---------- aside: sticky only while its whole height fits below the header ---------- */
  var aside = d.querySelector('[data-sticky-fit]');
  function stickyFit() {
    if (!aside) return;
    var fits = desk.matches && aside.offsetHeight + 144 <= window.innerHeight;   // the aside sticks at 124px (below the 92px bar) + 20px air
    aside.classList.toggle('is-sticky', fits);
  }
  if (aside) {
    stickyFit();
    on(window, 'load', stickyFit);
    if ('ResizeObserver' in window) new ResizeObserver(stickyFit).observe(aside);
  }

  /* ---------- reviews carousel below 1024px (no autoplay: L04) ---------- */
  $$('[data-carousel]').forEach(function (car) {
    var track = car.querySelector('[data-carousel-track]');
    var prev = car.querySelector('[data-carousel-prev]'), next = car.querySelector('[data-carousel-next]');
    if (!track || !prev || !next) return;
    function step() {
      var s = track.children[0];
      if (!s) return track.clientWidth;
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return s.getBoundingClientRect().width + gap;
    }
    function ends() {
      var atStart = track.scrollLeft <= 2, atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
      prev.setAttribute('aria-disabled', atStart ? 'true' : 'false');
      next.setAttribute('aria-disabled', atEnd ? 'true' : 'false');
    }
    /* the track is a Tab stop only while it scrolls (below 1024px); from 1024px it is a static grid (RA-09) */
    function mode() {
      prev.hidden = next.hidden = desk.matches;
      if (desk.matches) track.removeAttribute('tabindex'); else track.setAttribute('tabindex', '0');
      ends();
      fit();
    }
    function go(dir) { track.scrollBy({ left: dir * step(), behavior: reduce.matches ? 'auto' : 'smooth' }); }
    on(prev, 'click', function () { if (prev.getAttribute('aria-disabled') !== 'true') go(-1); });
    on(next, 'click', function () { if (next.getAttribute('aria-disabled') !== 'true') go(1); });
    /* QA r2 VHR2-05: below 1024px the track is as tall as the cards in view (plus its own padding), not as its tallest
       card, so the buttons sit right under what is being read (site.css clips the track's overflow-y). A card counts
       when at least half of it is inside the track: the thin peek of the next card on a phone (~14%) does not, the
       second card beside the first on a tablet (~60%) does, so its text is never cut. From 1024px (a static grid) the
       height is auto again. */
    function fit() {
      if (desk.matches) { track.style.height = ''; return; }
      var tr = track.getBoundingClientRect(), h = 0;
      Array.prototype.forEach.call(track.children, function (s) {
        var r = s.getBoundingClientRect();
        var seen = Math.min(r.right, tr.right) - Math.max(r.left, tr.left);
        if (r.width && seen >= r.width / 2) h = Math.max(h, r.height);
      });
      if (!h) return;
      var cs = getComputedStyle(track);
      if (cs.boxSizing === 'border-box') h += parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
      var v = Math.ceil(h) + 'px';
      if (track.style.height !== v) track.style.height = v;
    }
    var raf = 0;
    on(track, 'scroll', function () { if (!raf) raf = window.requestAnimationFrame(function () { raf = 0; ends(); fit(); }); }, { passive: true });
    onMQ(desk, mode);
    on(window, 'resize', function () { ends(); fit(); }, { passive: true });
    on(window, 'load', fit);
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(fit);
    if ('ResizeObserver' in window) { var ro = new ResizeObserver(function () { fit(); }); Array.prototype.forEach.call(track.children, function (s) { ro.observe(s); }); }
    mode();
  });

  /* ---------- hours: tint today's row (background only, no added text: L16) ---------- */
  var today = String(new Date().getDay());
  $$('[data-hours]').forEach(function (dl) {
    var row = dl.querySelector('[data-day="' + today + '"]');
    if (row) row.classList.add('is-today');
  });

  /* ---------- forms: inert, field-for-field, honest notice on a valid submit (BUILD-DECISIONS #4) ---------- */
  $$('form[data-form]').forEach(function (form) {
    form.noValidate = true;
    var notice = form.querySelector('[data-form-notice]');
    function controlsOf(field) { return $$('input:not([type="hidden"]), select, textarea', field); }
    function check(field, show) {
      var ctrls = controlsOf(field), bad = null;
      ctrls.forEach(function (c) { if (!bad && !c.checkValidity()) bad = c; });
      var err = field.querySelector('[data-field-error]');
      var errId = err ? err.id : '';
      ctrls.forEach(function (c) {
        var ids = (c.getAttribute('aria-describedby') || '').split(/\s+/).filter(function (x) { return x && x !== errId; });
        if (bad && show) { c.setAttribute('aria-invalid', 'true'); if (errId) ids.push(errId); }
        else c.removeAttribute('aria-invalid');
        if (ids.length) c.setAttribute('aria-describedby', ids.join(' ')); else c.removeAttribute('aria-describedby');
      });
      field.classList.toggle('is-invalid', !!(bad && show));
      if (err) {
        var txt = err.querySelector('.field__error-text');
        if (bad && show) { if (txt) txt.textContent = bad.validationMessage; err.hidden = false; }
        else { if (txt) txt.textContent = ''; err.hidden = true; }
      }
      return !bad;
    }
    /* conditional fields (CS-04): the source's Gravity Forms show-if rules, carried as data-show-if="{name}={value}".
       A field shows only while that choice is made; hidden, its controls are disabled (never validated, never
       sent). Without JS every field stays visible. */
    $$('[data-show-if]', form).forEach(function (field) {
      var rule = field.getAttribute('data-show-if'), at = rule.indexOf('=');
      var name = rule.slice(0, at), value = rule.slice(at + 1);
      function sync() {
        var shown = $$('input, select, textarea', form).some(function (c) {
          if (c.name !== name) return false;
          return (c.type === 'radio' || c.type === 'checkbox') ? c.checked && c.value === value : c.value === value;
        });
        if (field.hidden === !shown) return;
        field.hidden = !shown;
        controlsOf(field).forEach(function (c) { c.disabled = !shown; });
        if (!shown) check(field, false);
      }
      on(form, 'change', sync);
      sync();
    });
    var fields = $$('.field', form);
    /* QA r2 VIB-R2-02: pressing Submit with a pointer moves focus off the last field; its focusout check inserted the
       error line above the button, the button moved down 68-95px before mouseup, and the click landed on the form:
       no submit, focus left on the button. While a pointer is down on a submit control (from pointerdown until its
       click, or 1.5s at most) the focusout check waits; the submit handler checks every field and focuses the first
       invalid one (spec 3.20). Keyboard Tab still checks the field it leaves. */
    var submitPress = 0;
    on(form, 'pointerdown', function (e) { if (e.target.closest && e.target.closest('button[type="submit"], input[type="submit"], button:not([type])')) submitPress = Date.now(); });
    on(form, 'click', function () { submitPress = 0; });
    fields.forEach(function (field) {
      var touched = false;
      on(field, 'focusout', function (e) {
        if (field.contains(e.relatedTarget)) return;               /* still inside a group: wait */
        if (submitPress && Date.now() - submitPress < 1500) return;   /* a Submit press: the submit handler checks */
        if (touched || field.classList.contains('is-invalid')) check(field, true);
      });
      on(field, 'input', function () { touched = true; if (field.classList.contains('is-invalid')) check(field, true); });
      on(field, 'change', function () { touched = true; if (field.classList.contains('is-invalid')) check(field, true); });
    });
    on(form, 'submit', function (e) {
      e.preventDefault();                                            /* nothing is ever sent */
      var firstBad = null;
      fields.forEach(function (f) { if (!check(f, true) && !firstBad) firstBad = f; });
      if (firstBad) {
        if (notice) notice.hidden = true;
        var c = controlsOf(firstBad).filter(function (x) { return !x.checkValidity(); })[0] || controlsOf(firstBad)[0];
        if (c) c.focus();
        return;
      }
      if (notice) { notice.hidden = false; notice.focus(); }
    });
  });
})();
