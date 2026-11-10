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
