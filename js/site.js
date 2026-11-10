// Mobile menu for every page.
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.querySelector('.nav-mobile');
  if (!toggle || !menu) return;
  function isOpen() { return toggle.getAttribute('aria-expanded') === 'true'; }
  function set(open) {
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    menu.classList.toggle('open', open);
  }
  toggle.addEventListener('click', function () { set(!isOpen()); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { set(false); }); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen()) { set(false); toggle.focus(); }
  });
  document.addEventListener('click', function (e) {
    if (isOpen() && !e.target.closest('.nav')) set(false);
  });
})();

// "How it works": once the demo scrolls into view, play it in order. Without JS, without
// IntersectionObserver, or with reduced motion, it's simply shown.
(function () {
  var demo = document.querySelector('.read-demo');
  if (!demo || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  demo.dataset.play = 'pending';
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      demo.dataset.play = 'run';
      io.disconnect();
    });
  }, { threshold: 0.35 });
  io.observe(demo);
})();

// Scroll reveals: blocks marked data-reveal ease in as they enter the screen, once. Anything already
// in view when the page loads is left alone. Without JS, IntersectionObserver or with reduced motion,
// nothing is hidden.
(function () {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;
  document.documentElement.classList.add('reveal-on');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  items.forEach(function (el) { io.observe(el); });
})();

// Hero questions jump to their answers; the answer gets a brief blue ring as you land on it.
(function () {
  document.querySelectorAll('a.chip[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function () {
      var t = document.querySelector(a.getAttribute('href'));
      if (!t) return;
      t.classList.remove('landed');
      setTimeout(function () { t.classList.add('landed'); }, 350);
      setTimeout(function () { t.classList.remove('landed'); }, 1900);
    });
  });
})();

// Phones: copy the page's link so it can be opened on the Windows PC.
(function () {
  var btn = document.querySelector('[data-copy-link]');
  if (!btn) return;
  btn.addEventListener('click', function () {
    var url = location.origin + location.pathname;
    function done() { btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = 'Copy link'; }, 2000); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(done, function () { if (navigator.share) navigator.share({ url: url }); });
    } else if (navigator.share) {
      navigator.share({ url: url });
    }
  });
})();

// Guide tour: a scripted walk through real SolidWorks frames, zoomed to where the action is, with a
// cursor that clicks each step. Runs while on screen; with reduced motion it shows the last step.
(function () {
  var tour = document.querySelector('[data-tour]');
  if (!tour) return;
  var cam = tour.querySelector('.tour-cam');
  var imgs = { a: cam.querySelector('[data-f="a"]'), b: cam.querySelector('[data-f="b"]'), c: cam.querySelector('[data-f="c"]') };
  var cursor = tour.querySelector('.tour-cursor');
  var ripple = tour.querySelector('.tour-ripple');
  var capText = tour.querySelector('.tour-cap-text');
  var dots = tour.querySelectorAll('.tour-dots i');
  var stage = tour.querySelector('.tour-stage');
  var FW = 1920, FH = 1042;
  var CAPS = [
    'Ask in plain words. Caddie reads the part and starts a guide.',
    'The guide names the step: open Measure from the Tools menu.',
    'Caddie rings Tools in SolidWorks. You make the click.',
    'Next, Evaluate.',
    'Then Measure. You make every click yourself.'
  ];
  var rect = { x: 0, y: 0, w: FW };
  var pos = { x: 1500, y: 500 };
  var token = 0, loaded = false, running = false;

  function narrow() { return stage.clientWidth < 480; }
  function sw() { return stage.clientWidth; }
  function paint() {
    var s = sw() / rect.w;
    cam.style.transform = 'translate(' + (-rect.x * s) + 'px,' + (-rect.y * s) + 'px) scale(' + s + ')';
    var cx = (pos.x - rect.x) * s, cy = (pos.y - rect.y) * s;
    cursor.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
    ripple.style.left = cx + 'px'; ripple.style.top = cy + 'px';
  }
  function frame(name) { Object.keys(imgs).forEach(function (k) { imgs[k].classList.toggle('on', k === name); }); }
  function caption(i) {
    capText.textContent = CAPS[i];
    for (var d = 0; d < dots.length; d++) dots[d].classList.toggle('on', d === i);
  }
  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function wait(ms, my) { return new Promise(function (r) { setTimeout(function () { r(my === token); }, ms); }); }
  function tween(ms, my, step) {
    return new Promise(function (resolve) {
      var t0 = null;
      function tick(now) {
        if (my !== token) { resolve(false); return; }
        if (t0 === null) t0 = now;
        var p = Math.min(1, (now - t0) / ms);
        step(ease(p));
        if (p < 1) requestAnimationFrame(tick); else resolve(true);
      }
      requestAnimationFrame(tick);
    });
  }
  function view(r) { var f = narrow() ? 0.8 : 1; var cx = r.x + r.w / 2, w = r.w * f; return { x: Math.max(0, Math.min(FW - w, cx - w / 2)), y: r.y, w: w }; }
  function moveCam(target, ms, my) {
    var a = { x: rect.x, y: rect.y, w: rect.w }, b = view(target);
    return tween(ms, my, function (e) {
      rect = { x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e, w: a.w + (b.w - a.w) * e };
      paint();
    });
  }
  function moveCursor(x, y, ms, my) {
    var a = { x: pos.x, y: pos.y };
    return tween(ms, my, function (e) { pos = { x: a.x + (x - a.x) * e, y: a.y + (y - a.y) * e }; paint(); });
  }
  function click() {
    cursor.classList.add('press');
    ripple.classList.remove('go'); void ripple.offsetWidth; ripple.classList.add('go');
    setTimeout(function () { cursor.classList.remove('press'); }, 160);
  }
  function reset() {
    rect = { x: 0, y: 0, w: FW }; pos = { x: 1500, y: 500 };
    frame('a'); cursor.classList.remove('show'); caption(0); paint();
  }
  function showEnd() {
    frame('c'); rect = view({ x: 300, y: 440, w: 420 }); pos = { x: 500, y: 548 };
    cursor.classList.add('show'); caption(4); paint();
  }

  async function run() {
    var my = ++token; running = true;
    while (my === token) {
      reset();
      if (!(await wait(500, my))) return;
      caption(0);
      if (!(await moveCam({ x: 1650, y: 195, w: 270 }, 1000, my))) return;
      if (!(await wait(1900, my))) return;
      caption(1);
      if (!(await moveCam({ x: 1650, y: 850, w: 270 }, 900, my))) return;
      if (!(await wait(1700, my))) return;
      caption(2);
      pos = { x: 700, y: 260 }; cursor.classList.add('show');
      if (!(await moveCam({ x: 0, y: 0, w: 440 }, 1000, my))) return;
      if (!(await moveCursor(266, 16, 800, my))) return;
      click(); frame('b');
      if (!(await wait(900, my))) return;
      caption(3);
      var cp = moveCam({ x: 150, y: 420, w: 420 }, 900, my);
      if (!(await wait(250, my))) return;
      if (!(await moveCursor(300, 546, 800, my))) return;
      await cp;
      click(); frame('c');
      if (!(await wait(900, my))) return;
      caption(4);
      cp = moveCam({ x: 300, y: 440, w: 420 }, 800, my);
      if (!(await moveCursor(480, 547, 900, my))) return;
      await cp;
      click();
      if (!(await wait(2600, my))) return;
      cursor.classList.remove('show');
      if (!(await wait(500, my))) return;
    }
  }

  function load(cb) {
    if (loaded) { cb(); return; }
    var n = 0, names = ['a', 'b', 'c'];
    names.forEach(function (k) {
      var im = imgs[k];
      im.onload = im.onerror = function () { if (++n === 3) { loaded = true; cb(); } };
      im.src = im.getAttribute('data-src');
    });
  }

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  tour.classList.add('tour-on');
  reset();
  if ('ResizeObserver' in window) new ResizeObserver(function () { paint(); }).observe(stage);
  else window.addEventListener('resize', paint);

  if (!('IntersectionObserver' in window)) { load(showEnd); return; }
  new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        load(function () { if (reduce) { token++; showEnd(); } else run(); });
      } else { token++; running = false; }
    });
  }, { threshold: 0.45, rootMargin: '200px 0px 200px 0px' }).observe(tour);
})();
