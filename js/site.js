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

// Loop clips play only while on screen (and load only when near it). With reduced motion the poster stays.
(function () {
  var vids = document.querySelectorAll('video.loop-video');
  if (!vids.length || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var v = e.target;
      if (e.isIntersecting) { v.preload = 'auto'; var p = v.play(); if (p && p.catch) p.catch(function () {}); }
      else v.pause();
    });
  }, { threshold: 0.4 });
  vids.forEach(function (v) { io.observe(v); });
})();
