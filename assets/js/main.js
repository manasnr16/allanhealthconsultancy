/* ==========================================================================
   Allan Health Consultancy — behaviour layer
   Sections: 1 helpers · 2 theme · 3 language · 4 header/menu · 5 route map
             6 scroll engine · 7 UI widgets · 8 SPA router (preview only) · 9 boot
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- 1. Helpers ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b === undefined ? 1 : b, Math.max(a === undefined ? 0 : a, v)); };
  var root = document.documentElement;
  var SPA = document.body.getAttribute('data-mode') === 'spa';
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (RM) root.classList.add('rm');
  var PHONE = '918867607294';
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } }
  };

  /* ---------- 2. Theme ---------- */
  var savedTheme = store.get('ahc-theme');
  if (savedTheme) root.setAttribute('data-theme', savedTheme);
  function currentTheme() {
    return root.getAttribute('data-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }

  /* ---------- 3. Language (starter dictionary — have a native speaker review) ---------- */
  var I18N = {
    bn: {
      'nav.home': 'হোম', 'nav.about': 'আমাদের সম্পর্কে', 'nav.services': 'পরিষেবা', 'nav.packages': 'হেলথ প্যাকেজ',
      'nav.gift': 'গিফট অফ হেলথ কুপন', 'nav.hospitals': 'সহযোগী হাসপাতাল', 'nav.blog': 'ব্লগ', 'nav.faqs': 'সাধারণ প্রশ্ন', 'nav.contact': 'যোগাযোগ',
      'cta.book': 'বিনামূল্যে পরামর্শ বুক করুন', 'cta.wa': 'হোয়াটসঅ্যাপে রিপোর্ট পাঠান', 'cta.call': 'কল করুন',
      'hero.h1': 'চিকিৎসার যাত্রা, শুরু থেকে শেষ পর্যন্ত পরিকল্পিত',
      'hero.sub': 'আসাম, পশ্চিমবঙ্গ, মিজোরাম, বাংলাদেশ ও সার্ক দেশগুলি এবং যুক্তরাজ্য ও যুক্তরাষ্ট্রের প্রবাসী পরিবারদের বেঙ্গালুরু, চেন্নাই ও হায়দরাবাদের নামী হাসপাতালের সঙ্গে যুক্ত করি — প্রথম ফোন থেকে বাড়ি ফেরা পর্যন্ত পাশে থাকি।',
      'form.submit': 'জমা দিন — ২৪ ঘণ্টার মধ্যে আমরা ফোন করব'
    }
  };
  var EN = {};
  function applyLang(l) {
    var dict = I18N[l];
    root.setAttribute('lang', l === 'bn' ? 'bn' : 'en');
    $$('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (!(k in EN)) EN[k] = el.textContent;
      el.textContent = (dict && dict[k]) ? dict[k] : EN[k];
    });
    $$('[data-lang-btn]').forEach(function (b) { b.textContent = l === 'bn' ? 'EN' : 'বাং'; b.setAttribute('aria-label', l === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন'); });
    store.set('ahc-lang', l);
  }

  /* ---------- 4. Header, menu, tools ---------- */
  var hdr = $('.hdr');
  var bar = $('.progress');
  var lastY = 0;
  function setMenu(open) {
    root.classList.toggle('menu-open', open);
    var b = $('.burger');
    if (b) { b.setAttribute('aria-expanded', open ? 'true' : 'false'); b.querySelector('use').setAttribute('href', open ? '#i-x' : '#i-menu'); }
    if (hdr) hdr.classList.remove('hide');
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target : e.target.parentNode;
    var burger = t.closest('.burger');
    if (burger) { setMenu(!root.classList.contains('menu-open')); return; }
    if (t.closest('.menu a')) { setMenu(false); }
    if (t.closest('[data-theme-btn]')) {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next); store.set('ahc-theme', next);
    }
    var lb = t.closest('[data-lang-btn]');
    if (lb) { applyLang(root.getAttribute('lang') === 'bn' ? 'en' : 'bn'); }
    var q = t.closest('.acc-q');
    if (q) {
      var item = q.parentNode, open = !item.classList.contains('open');
      item.classList.toggle('open', open); q.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    var f = t.closest('[data-filter]');
    if (f) {
      var group = f.closest('[data-filters]'), val = f.getAttribute('data-filter'), scope = group.getAttribute('data-filters');
      $$('button', group).forEach(function (b) { b.setAttribute('aria-pressed', b === f ? 'true' : 'false'); });
      $$('[data-group="' + scope + '"]', activeRoot()).forEach(function (c) { c.hidden = !(val === 'all' || c.getAttribute('data-cat') === val); });
    }
    var dd = t.closest('.nav-item > button');
    if (dd) { dd.parentNode.classList.toggle('open'); }
    else if (!t.closest('.nav-item')) { $$('.nav-item.open').forEach(function (n) { n.classList.remove('open'); }); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { setMenu(false); $$('.nav-item.open').forEach(function (n) { n.classList.remove('open'); }); }
  });

  /* ---------- 5. Route map (hero) ---------- */
  var CITY = {
    guwahati: { n: 'Guwahati', lat: 26.14, lon: 91.74, dx: -13, dy: 5, a: 'end' },
    aizawl: { n: 'Aizawl', lat: 23.73, lon: 92.72, dx: 4, dy: -14, a: 'middle' },
    dhaka: { n: 'Dhaka', lat: 23.81, lon: 90.41, dx: -13, dy: 5, a: 'end' },
    kolkata: { n: 'Kolkata', lat: 22.57, lon: 88.36, dx: -13, dy: 5, a: 'end' },
    colombo: { n: 'Colombo', lat: 6.93, lon: 79.86, dx: 13, dy: 5, a: 'start' },
    blr: { n: 'Bangalore', lat: 12.97, lon: 77.59, dx: -16, dy: 6, a: 'end' },
    chennai: { n: 'Chennai', lat: 13.08, lon: 80.27, dx: 13, dy: 5, a: 'start' },
    hyd: { n: 'Hyderabad', lat: 17.38, lon: 78.48, dx: 13, dy: 5, a: 'start' }
  };
  function P(c) { return [40 + (c.lon - 74) / 20 * 520, 40 + (28 - c.lat) / 23 * 620]; }
  var ROUTES = [
    { k: 'guwahati', cap: 'Patients from Assam', curve: 0.2 },
    { k: 'aizawl', cap: 'Patients from Mizoram', curve: 0.05 },
    { k: 'dhaka', cap: 'Patients from Bangladesh', curve: -0.12 },
    { k: 'kolkata', cap: 'Patients from West Bengal', curve: 0.13 },
    { k: 'colombo', cap: 'Patients from Sri Lanka', curve: 0.25 },
    { k: 'uk', n: 'UK & USA', pt: [30, 42], cap: 'Families in the UK and USA', curve: -0.2, dx: 12, dy: 5, a: 'start' },
    { k: 'chennai', cap: 'Chennai on request', curve: 0.0, soft: true },
    { k: 'hyd', cap: 'Hyderabad on request', curve: 0.0, soft: true }
  ];
  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) { n.setAttribute(k, attrs[k]); }
    if (parent) parent.appendChild(n);
    return n;
  }
  function buildMap(svg) {
    if (svg.getAttribute('data-built')) return;
    svg.setAttribute('data-built', '1');
    var i, g = el('g', {}, svg);
    for (i = 0; i <= 5; i++) { el('line', { class: 'grat', x1: 40 + i * 104, y1: 20, x2: 40 + i * 104, y2: 680 }, g); }
    for (i = 0; i <= 6; i++) { el('line', { class: 'grat', x1: 20, y1: 40 + i * 103, x2: 580, y2: 40 + i * 103 }, g); }
    var B = P(CITY.blr);
    var rg = el('g', {}, svg), ng = el('g', {}, svg);
    var routes = ROUTES.map(function (r, idx) {
      var c = r.pt ? { n: r.n, dx: r.dx, dy: r.dy, a: r.a } : CITY[r.k];
      var O = r.pt || P(c);
      var dx = B[0] - O[0], dy = B[1] - O[1], len = Math.sqrt(dx * dx + dy * dy) || 1;
      var cx = (O[0] + B[0]) / 2 + (-dy / len) * r.curve * len, cy = (O[1] + B[1]) / 2 + (dx / len) * r.curve * len;
      var d = 'M' + (r.soft ? B[0] + ' ' + B[1] : O[0] + ' ' + O[1]) + ' Q' + cx + ' ' + cy + ' ' + (r.soft ? O[0] + ' ' + O[1] : B[0] + ' ' + B[1]);
      el('path', { class: 'rt-base', d: d }, rg);
      var live = el('path', { class: 'rt-live' + (r.soft ? ' soft' : ''), d: d }, rg);
      var L = live.getTotalLength();
      if (!r.soft) { live.style.strokeDasharray = L; live.style.strokeDashoffset = L; }
      else { live.style.strokeDashoffset = 0; live.style.opacity = 0; }
      var node = el('g', { class: 'node', transform: 'translate(' + O[0] + ' ' + O[1] + ')' }, ng);
      var pop = el('g', { class: 'pop' }, node);
      el('circle', { class: 'c', r: 5.5 }, pop);
      var tx = el('text', { x: c.dx, y: c.dy, 'text-anchor': c.a }, pop);
      tx.textContent = c.n;
      node.style.opacity = 0;
      return { r: r, path: live, L: L, node: node, pop: pop, w: r.soft ? [0.88, 1.0] : [0.03 + idx * 0.135, 0.03 + idx * 0.135 + 0.24] };
    });
    var bn = el('g', { class: 'node blr', transform: 'translate(' + B[0] + ' ' + B[1] + ')' }, ng);
    el('circle', { class: 'ring', r: 8, cx: 0, cy: 0 }, bn);
    el('circle', { class: 'c', r: 9 }, bn);
    var bt = el('text', { x: CITY.blr.dx, y: CITY.blr.dy - 12, 'text-anchor': 'end' }, bn); bt.textContent = 'Bangalore';
    var plane = el('path', { d: 'M0 -10 L7 9 L0 5 L-7 9 Z', fill: '#fff', stroke: '#0B3C49', 'stroke-width': 1.5, 'stroke-linejoin': 'round' }, svg);
    plane.style.opacity = 0;
    svg._map = { routes: routes, plane: plane };
  }
  function heroFrame(track, y, vh) {
    var svg = $('#routeMap', track), cap = $('[data-cap]', track), cap2 = $('[data-cap2]', track), copy = $('.hero-copy', track), cue = $('.scroll-cue', track);
    if (!svg || !svg._map) return;
    var rect = track.getBoundingClientRect();
    var p = RM ? 1 : clamp(-rect.top / Math.max(1, track.offsetHeight - vh));
    var m = svg._map, active = null, lastDone = null;
    m.routes.forEach(function (r) {
      var t = clamp((p - r.w[0]) / (r.w[1] - r.w[0]));
      r.t = t;
      if (r.r.soft) { r.path.style.opacity = t > 0 ? 1 : 0; r.path.style.strokeDasharray = '6 6'; r.node.style.opacity = t > 0.05 ? 1 : 0; r.path.style.clipPath = ''; r.path.style.strokeDashoffset = 0; r.path.style.opacity = clamp(t * 1.6); }
      else {
        r.path.style.strokeDashoffset = r.L * (1 - t);
        r.node.style.opacity = t > 0.005 ? 1 : 0;
        r.pop.style.transform = 'scale(' + (0.6 + 0.4 * clamp(t * 8)) + ')';
      }
      if (!r.r.soft && t > 0 && t < 1) active = r;
      if (!r.r.soft && t >= 1) lastDone = r;
    });
    var cur = active || lastDone;
    if (cur) {
      var pos = cur.t * cur.L, a = cur.path.getPointAtLength(clamp(pos, 0, cur.L)), b = cur.path.getPointAtLength(clamp(pos + 2, 0, cur.L));
      var ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI + 90;
      m.plane.setAttribute('transform', 'translate(' + a.x + ' ' + a.y + ') rotate(' + ang + ')');
      m.plane.style.opacity = (p > 0.93 || cur.t >= 1 && !active) ? 0 : 1;
      if (cap) { cap.textContent = 'From ' + (cur.r.n || CITY[cur.r.k].n) + ' to Bangalore'; cap2.textContent = cur.r.cap + ', with a coordinator from the first call.'; }
    } else if (cap) { cap.textContent = 'Where are you travelling from?'; cap2.textContent = 'Keep scrolling to follow the route.'; }
    if (p > 0.93 && cap) { cap.textContent = 'Arrive in Bangalore'; cap2.textContent = 'Pickup from the airport or station is already arranged. Chennai and Hyderabad on request.'; }
    if (copy && !RM) { copy.style.transform = 'translateY(' + (-p * 24) + 'px)'; }
    if (cue) cue.style.opacity = p > 0.04 ? 0 : 1;
  }

  /* ---------- 6. Scroll engine ---------- */
  var effects = [], viewRoot = document, io = null;
  function activeRoot() { return SPA ? ($('.view:not([hidden])') || document) : document; }

  function split(elm) {
    if (elm.getAttribute('data-split-done') || elm.hasAttribute('data-i18n')) return;
    elm.setAttribute('data-split-done', '1');
    var txt = elm.textContent.replace(/\s+/g, ' ').trim();
    elm.setAttribute('aria-label', txt);
    elm.innerHTML = txt.split(' ').map(function (w, i) { return '<span class="w" aria-hidden="true"><span style="--i:' + i + '">' + w + '</span></span>'; }).join(' ');
  }
  function observe(scope) {
    if (!('IntersectionObserver' in window)) { $$('[data-split],[data-rv],[data-clip]', scope).forEach(function (e) { e.classList.add('in'); }); return; }
    if (!io) io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    $$('[data-split]', scope).forEach(split);
    $$('[data-split],[data-rv],[data-clip]', scope).forEach(function (e) { if (!e.classList.contains('in')) io.observe(e); });
  }
  function words(elm) {
    if (elm.getAttribute('data-split-done')) return;
    elm.setAttribute('data-split-done', '1');
    var txt = elm.textContent.replace(/\s+/g, ' ').trim();
    elm.setAttribute('aria-label', txt);
    elm.innerHTML = txt.split(' ').map(function (w) { return '<span class="w" aria-hidden="true"><span>' + w + '</span></span>'; }).join(' ');
  }
  function setup() {
    var scope = activeRoot(); effects = [];
    var vh = window.innerHeight;
    observe(scope);

    $$('#routeMap', scope).forEach(buildMap);
    $$('[data-hero]', scope).forEach(function (track) {
      if (RM) { track.style.height = 'auto'; $('.hero-stage', track).style.position = 'relative'; }
      effects.push(function (y, h) { heroFrame(track, y, h); });
    });

    $$('[data-fill]', scope).forEach(function (p) {
      words(p);
      var ws = $$('.w', p);
      effects.push(function (y, h) {
        var r = p.getBoundingClientRect(), t = clamp((h * 0.85 - r.top) / (h * 0.5 + r.height * 0.6));
        var n = t * ws.length;
        ws.forEach(function (w, i) { w.style.opacity = (0.16 + 0.84 * clamp(n - i + 1)).toFixed(3); });
      });
    });

    $$('[data-mq]', scope).forEach(function (row) {
      var dir = row.getAttribute('data-mq') === 'l' ? -1 : 1;
      effects.push(function (y, h) {
        var r = row.parentNode.getBoundingClientRect(), c = (r.top + r.height / 2) / h;
        row.style.transform = 'translate3d(' + (dir * (0.5 - c) * 520 - (dir < 0 ? 0 : 400)) + 'px,0,0)';
      });
    });

    $$('[data-scrub]', scope).forEach(function (n) {
      effects.push(function (y, h) { var r = n.getBoundingClientRect(); n.style.setProperty('--p', clamp((h * 0.98 - r.top) / (h * 0.55)).toFixed(3)); });
    });

    $$('[data-parallax]', scope).forEach(function (n) {
      var s = parseFloat(n.getAttribute('data-parallax')) || 0.15;
      effects.push(function (y, h) { var r = n.parentNode.getBoundingClientRect(); n.style.transform = 'translate3d(0,' + ((r.top + r.height / 2 - h / 2) * -s).toFixed(1) + 'px,0)'; });
    });

    $$('.tl', scope).forEach(function (tl) {
      var list = $('.tl-list', tl), fill = $('.tl-line i', tl), steps = $$('.tl-step', tl);
      effects.push(function (y, h) {
        var r = list.getBoundingClientRect();
        fill.style.transform = 'scaleY(' + clamp((h * 0.55 - r.top) / r.height).toFixed(3) + ')';
        steps.forEach(function (s) { s.classList.toggle('on', s.getBoundingClientRect().top < h * 0.62 || RM); });
      });
    });

    $$('.hs', scope).forEach(function (hs) {
      var rail = $('.hs-rail', hs), stage = $('.hs-stage', hs), barI = $('.hs-bar i', hs);
      var dist = 0;
      function measure() {
        var narrow = window.innerWidth < 900 || window.innerHeight < 520 || RM;
        hs.classList.toggle('static', narrow);
        if (narrow) { hs.style.height = ''; rail.style.transform = ''; return; }
        dist = Math.max(0, rail.scrollWidth - window.innerWidth + 40);
        hs.style.height = (dist + window.innerHeight) + 'px';
      }
      measure(); hs._measure = measure;
      effects.push(function (y, h) {
        if (hs.classList.contains('static')) return;
        var r = hs.getBoundingClientRect(), t = clamp(-r.top / Math.max(1, hs.offsetHeight - h));
        rail.style.transform = 'translate3d(' + (-t * dist).toFixed(1) + 'px,0,0)';
        if (barI) barI.style.transform = 'scaleX(' + t.toFixed(3) + ')';
      });
    });

    var stks = $$('.stk', scope);
    if (stks.length) {
      stks.forEach(function (s, i) { s.style.setProperty('--k', i); });
      effects.push(function (y, h) {
        if (window.innerWidth < 860 || RM) { stks.forEach(function (s) { s.style.transform = ''; }); return; }
        stks.forEach(function (s, i) {
          var nx = stks[i + 1]; if (!nx) return;
          var top = nx.getBoundingClientRect().top, base = 96 + (i + 1) * 17.6, sh = s.offsetHeight;
          var t = clamp(1 - (top - base) / sh);
          s.style.transform = 'scale(' + (1 - t * 0.05).toFixed(3) + ')';
          s.style.opacity = (1 - t * 0.35).toFixed(2);
        });
      });
    }
    frame();
  }

  var ticking = false;
  function onScroll() { if (!ticking) { ticking = true; window.requestAnimationFrame(frame); } }
  function frame() {
    ticking = false;
    var y = window.pageYOffset, h = window.innerHeight;
    if (bar) { var max = document.documentElement.scrollHeight - h; bar.style.transform = 'scaleX(' + (max > 0 ? clamp(y / max) : 0).toFixed(4) + ')'; }
    if (hdr) {
      hdr.classList.toggle('solid', y > 40);
      if (!root.classList.contains('menu-open')) hdr.classList.toggle('hide', y > 320 && y > lastY + 4);
      if (y < lastY - 4) hdr.classList.remove('hide');
    }
    lastY = y;
    for (var i = 0; i < effects.length; i++) effects[i](y, h);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { $$('.hs', activeRoot()).forEach(function (h) { h._measure && h._measure(); }); onScroll(); });
  window.addEventListener('load', function () { $$('.hs', activeRoot()).forEach(function (h) { h._measure && h._measure(); }); onScroll(); });

  /* ---------- 7. Forms ---------- */
  document.addEventListener('submit', function (e) {
    var form = e.target.closest('[data-contact-form]');
    if (!form) return;
    e.preventDefault();
    var ok = true;
    $$('[data-req]', form).forEach(function (f) {
      var inp = $('input,select,textarea', f), bad = !inp.value.trim();
      if (inp.name === 'phone' && inp.value.replace(/\D/g, '').length < 8) bad = true;
      f.classList.toggle('bad', bad);
      var er = $('.err', f); if (er) er.textContent = bad ? (inp.name === 'phone' ? 'Enter a phone or WhatsApp number we can reach.' : 'This field is required.') : '';
      if (bad && ok) { inp.focus(); ok = false; }
    });
    if (!ok) return;
    var fd = new FormData(form), name = fd.get('name') || '';
    var lines = ['Hello Allan Health Consultancy,', 'Name: ' + name, 'Phone: ' + fd.get('phone'), 'From: ' + fd.get('region'), 'Enquiry: ' + fd.get('reason'), 'Language: ' + fd.get('language')];
    if (fd.get('message')) lines.push('Message: ' + fd.get('message'));
    var wa = 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(lines.join('\n'));
    var endpoint = form.getAttribute('data-endpoint');
    function done() {
      $('[data-ok-name]', form).textContent = name;
      var w = $('[data-ok-wa]', form); if (w) w.setAttribute('href', wa);
      form.classList.add('sent'); $('.form-ok', form).classList.add('show'); $('.form-ok', form).scrollIntoView({ block: 'center' });
    }
    if (endpoint && window.fetch) {
      fetch(endpoint, { method: 'POST', body: fd }).then(function (r) { if (!r.ok) throw 0; done(); }).catch(function () { done(); });
    } else { done(); }
  });
  document.addEventListener('input', function (e) { var f = e.target.closest && e.target.closest('.f.bad'); if (f) f.classList.remove('bad'); });

  /* ---------- 8. SPA router (preview build only) ---------- */
  var ROUTE_TITLES = {};
  function route() {
    if (!SPA) return;
    var parts = location.hash.replace(/^#\/?/, '').split('/');
    var name = parts[0] || 'index', anchor = parts[1];
    var views = $$('.view');
    if (!views.some(function (v) { return v.getAttribute('data-view') === name; })) name = 'index';
    views.forEach(function (v) { v.hidden = v.getAttribute('data-view') !== name; });
    var v = $('.view:not([hidden])');
    document.title = v.getAttribute('data-title') || document.title;
    $$('.nav a, .menu nav a').forEach(function (a) {
      var h = (a.getAttribute('href') || '').replace(/^#\/?/, '').split('/')[0] || 'index';
      if (a.getAttribute('data-nav') === name || (!a.getAttribute('data-nav') && h === name && a.getAttribute('href').indexOf('/') === a.getAttribute('href').lastIndexOf('/'))) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    var l = store.get('ahc-lang'); if (l === 'bn') applyLang('bn');
    window.scrollTo(0, 0);
    setup();
    if (anchor) { var t = document.getElementById(anchor); if (t) window.setTimeout(function () { t.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' }); }, 60); }
    setMenu(false);
  }
  if (SPA) { window.addEventListener('hashchange', route); }

  /* ---------- 9. Boot ---------- */
  function markNav() {
    if (SPA) return;
    var file = (location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, '') || 'index';
    $$('.nav a[data-nav], .menu nav a[data-nav]').forEach(function (a) { if (a.getAttribute('data-nav') === file) a.setAttribute('aria-current', 'page'); });
  }
  function boot() {
    if (store.get('ahc-lang') === 'bn') applyLang('bn'); else applyLang('en');
    markNav();
    $$('[data-year]').forEach(function (n) { n.textContent = new Date().getFullYear(); });
    if (SPA) route(); else setup();
    if (!SPA && 'serviceWorker' in navigator && /^https?:$/.test(location.protocol) && document.body.getAttribute('data-pwa') === 'on') {
      navigator.serviceWorker.register('sw.js').catch(function () { /* offline support optional */ });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
