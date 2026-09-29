/* site.js - Clifton Eye Center, neoclassical theme "Temple". Vanilla, no dependencies, loaded with `defer`.
   Implements the hook registry of docs/NEO-COMPONENTS.md 6.1 (the glass contract of docs/COMPONENTS.md section 1 plus
   the neo motion); the page reads fully without it. Motion is progressive: `js-motion` is set in <head> before first
   paint (only when motion is allowed and IntersectionObserver exists) and rolled back after 4 s unless this file sets
   window.__siteReady. Every per-frame write goes to the element that uses it (never an inherited property on <html>:
   glass QA RA-02), only when its value changes. */
(function () {
  'use strict';
  window.__siteReady = true;

  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var desk = window.matchMedia('(min-width: 1024px)');
  var motionOK = !reduce.matches;
  var revealOK = motionOK && html.classList.contains('js-motion') && 'IntersectionObserver' in window;
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || d).querySelectorAll(sel)); };
  var on = function (el, ev, fn, opt) { if (el) el.addEventListener(ev, fn, opt || false); };
  var onMQ = function (mq, fn) { if (mq.addEventListener) mq.addEventListener('change', fn); else if (mq.addListener) mq.addListener(fn); };
  /* a custom property is written only when its value changes: an unchanged write still costs a style pass */
  function setVar(el, name, v) {
    var k = '_' + name;
    if (el[k] === v) return;
    el[k] = v;
    el.style.setProperty(name, v);
  }

  /* ---------- reveals: IO threshold 0 / rootMargin 0px, stagger, release after the entrance, fail-safe ---------- */
  var reveals = $$('[data-reveal]');
  var DUR = { arch: 1500, settle: 1700 };                           /* rise / up: 1150 ms */
  $$('[data-stagger]').forEach(function (group) {
    var n = 0;
    $$('[data-reveal]', group).forEach(function (el) {
      if (el.parentElement && el.parentElement.closest('[data-stagger]') !== group) return;   /* a nested group numbers its own */
      var host = el.parentElement && el.parentElement.closest('[data-reveal]');
      if (host && group.contains(host)) { el.style.setProperty('--i', host.style.getPropertyValue('--i') || '0'); return; }   /* nested reveal: its host's slot */
      el.style.setProperty('--i', String(n++ % 6));
    });
  });
  var pending = reveals.slice();
  var io = null;
  function release(el) { el.removeAttribute('data-reveal'); el.classList.remove('is-in'); el.style.removeProperty('--i'); }
  function reveal(el) {
    if (el.classList.contains('is-in') || !el.hasAttribute('data-reveal')) return;
    el.classList.add('is-in');
    if (io) io.unobserve(el);
    var i = parseFloat(el.style.getPropertyValue('--i')) || 0;
    var dur = DUR[el.getAttribute('data-reveal')] || 1150;
    /* once the entrance has played, data-reveal goes, so reveal rules never outrank hover transforms */
    setTimeout(function () { release(el); }, dur + i * 120);
  }
  function releaseAll() { reveals.forEach(function (el) { if (el.hasAttribute('data-reveal')) { if (io) io.unobserve(el); release(el); } }); pending = []; }
  /* a fast jump (End, a scrollbar drag, an anchor, find-in-page) can carry a block past the viewport between two frames,
     so the observer never sees it intersect: on every scroll tick a pending block wholly above the viewport is shown */
  function releasePassed() {
    if (!pending.length) return;
    var still = [];
    for (var i = 0; i < pending.length; i++) {
      var el = pending[i];
      if (!el.hasAttribute('data-reveal') || el.classList.contains('is-in')) continue;
      if (el.getBoundingClientRect().bottom < 0) reveal(el); else still.push(el);
    }
    pending = still;
  }
  if (revealOK) {
    var delivered = false;
    io = new IntersectionObserver(function (entries) {
      delivered = true;
      entries.forEach(function (en) { if (en.isIntersecting) reveal(en.target); });
    }, { root: null, rootMargin: '0px', threshold: 0 });
    reveals.forEach(function (el) { io.observe(el); });
    /* a viewport taller than 2400px (a full-page capture, a very tall screen) shows everything at rest at once */
    if (window.innerHeight > 2400) releaseAll();
    on(window, 'resize', function () { if (window.innerHeight > 2400) releaseAll(); }, { passive: true });
    /* fail-safe ONLY if the observer never delivered an entry (a working observer delivers one per target) */
    setTimeout(function () { if (!delivered) reveals.forEach(reveal); }, 3000);
    on(window, 'beforeprint', releaseAll);
    /* keyboard focus inside a block whose entrance has not played reveals it (and every revealing ancestor) now */
    on(d, 'focusin', function (e) {
      for (var el = e.target; el && el.closest; el = el.parentElement) {
        el = el.closest('[data-reveal]');
        if (!el) break;
        reveal(el);
      }
    });
  } else {
    html.classList.remove('js-motion');
    reveals.forEach(release);
    pending = [];
  }

  /* ---------- scroll-linked: progress, header state, statue parallax, letter-spacing settle (one rAF handler) ---------- */
  var header = d.querySelector('[data-header]');
  var bar = d.querySelector('.progress span');
  var settleEls = $$('[data-settle]');
  var layers = [];
  function measure() {
    layers = [];
    if (!motionOK) return;
    var y = window.scrollY || 0;
    var els = $$('[data-depth]');
    els.forEach(function (el) { setVar(el, '--py', '0'); });       /* rest pose while measuring (all writes, then all reads) */
    layers = els.map(function (el) {
      var r = el.getBoundingClientRect();
      var max = Math.min(32, parseFloat(el.getAttribute('data-depth-max')) || 0);   /* required, 32 at most (NEO-SPEC 3.25) */
      return { el: el, top: r.top + y, h: r.height, d: parseFloat(el.getAttribute('data-depth')) || 0, max: max };
    });
  }
  function parallax(y, vh) {
    var k = window.innerWidth < 700 ? 0.55 : 1;
    var rest = vh > 2400;
    for (var i = 0; i < layers.length; i++) {
      var L = layers[i];
      if (!rest && (L.top - y > vh * 1.5 || L.top + L.h - y < -vh * 0.5)) continue;   /* far away: skip */
      var centre = L.top + L.h / 2 - y - vh / 2;
      var py = rest ? 0 : Math.max(-L.max, Math.min(L.max, -centre * L.d * k));
      setVar(L.el, '--py', py.toFixed(1));
    }
  }
  function settle(vh) {
    var wide = desk.matches && vh <= 2400;
    for (var i = 0; i < settleEls.length; i++) {
      var el = settleEls[i];
      if (!wide) { setVar(el, '--settle', '1'); continue; }
      /* 0 when the title's top enters at the bottom of the viewport, 1 once it has risen 55% of the way up */
      var p = (vh - el.getBoundingClientRect().top) / (vh * 0.55);
      setVar(el, '--settle', Math.max(0, Math.min(1, p)).toFixed(3));
    }
  }
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY || 0, vh = window.innerHeight;
    var max = Math.max(1, html.scrollHeight - vh);
    if (bar) setVar(bar, '--scroll', Math.min(1, y / max).toFixed(4));   /* the progress rule is feedback: it tracks under reduce too */
    if (header) header.classList.toggle('is-scrolled', y > 40);
    if (motionOK) { parallax(y, vh); settle(vh); }
    if (revealOK) releasePassed();
  }
  function requestTick() { if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); } }
  function remeasure() { measure(); onScroll(); }
  on(window, 'scroll', requestTick, { passive: true });
  on(window, 'resize', function () { remeasure(); stickyFit(); }, { passive: true });
  on(window, 'load', remeasure);
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(remeasure);
  onMQ(reduce, function () {
    motionOK = !reduce.matches;
    if (!motionOK) {
      $$('[data-depth]').forEach(function (el) { el.style.removeProperty('--py'); el['_--py'] = undefined; });
      settleEls.forEach(function (el) { el.style.removeProperty('--settle'); el['_--settle'] = undefined; });
    }
    remeasure();
  });
  /* any change of the page's height (an accordion, the rail, a late image) re-measures the layers, once per frame */
  var relayout = 0;
  function remeasureSoon() { if (!relayout) relayout = window.requestAnimationFrame(function () { relayout = 0; remeasure(); }); }
  on(d, 'toggle', remeasureSoon, true);                              /* <details> toggle does not bubble: capture */
  if ('ResizeObserver' in window) new ResizeObserver(remeasureSoon).observe(d.body);
  remeasure();

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
    if (restore !== false) opener.focus({ preventScroll: true });   /* the opener is in the sticky header: never scroll to it (RA-1) */
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
  /* when the layout turns desktop with the drawer open, the drawer closes; focus inside it moves to the visible
     equivalent (the primary-nav link with the same href, else the first nav link, else the logo) */
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
    var barH = header ? header.offsetHeight : 92;
    var fits = desk.matches && aside.offsetHeight + barH + 44 <= window.innerHeight;
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
    /* the track is a Tab stop only while it scrolls (below 1024px); from 1024px it is a static row (RA-09) */
    function mode() {
      prev.hidden = next.hidden = desk.matches;
      if (desk.matches) track.removeAttribute('tabindex'); else track.setAttribute('tabindex', '0');
      ends();
      fit();
    }
    function go(dir) { track.scrollBy({ left: dir * step(), behavior: reduce.matches ? 'auto' : 'smooth' }); }
    on(prev, 'click', function () { if (prev.getAttribute('aria-disabled') !== 'true') go(-1); });
    on(next, 'click', function () { if (next.getAttribute('aria-disabled') !== 'true') go(1); });
    /* every stele has one height since the operator revision (2026-09-29): the track's own height (the tallest slide,
       align-items: stretch) is right at every width. It used to be set to the cards in view, which clipped a taller
       card waiting off-screen once the slides were stretched; fit() now only clears a stale inline height */
    function fit() { if (track.style.height) track.style.height = ''; }
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
    /* conditional fields (CS-04): data-show-if="{name}={value}"; hidden, a field's controls are disabled (never
       validated, never sent). Without JS every field stays visible. */
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
    /* a pointer press on Submit moves focus off the last field: its focusout check waits (the submit handler checks
       every field), so the button does not move under the pointer (glass QA VIB-R2-02) */
    var submitPress = 0;
    on(form, 'pointerdown', function (e) { if (e.target.closest && e.target.closest('button[type="submit"], input[type="submit"], button:not([type])')) submitPress = Date.now(); });
    on(form, 'click', function () { submitPress = 0; });
    fields.forEach(function (field) {
      var touched = false;
      on(field, 'focusout', function (e) {
        if (field.contains(e.relatedTarget)) return;
        if (submitPress && Date.now() - submitPress < 1500) return;
        if (touched || field.classList.contains('is-invalid')) check(field, true);
      });
      on(field, 'input', function () { touched = true; if (field.classList.contains('is-invalid')) check(field, true); });
      on(field, 'change', function () { touched = true; if (field.classList.contains('is-invalid')) check(field, true); });
    });
    on(form, 'submit', function (e) {
      e.preventDefault();                                            /* nothing is ever sent */
      var firstBad = null;
      fields.forEach(function (f) { if (!f.hidden && !check(f, true) && !firstBad) firstBad = f; });
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
