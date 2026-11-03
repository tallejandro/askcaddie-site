// Mobile menu for every page.
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.querySelector('.nav-mobile');
  if (!toggle || !menu) return;
  function set(open) {
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    menu.classList.toggle('open', open);
  }
  toggle.addEventListener('click', function () { set(toggle.getAttribute('aria-expanded') !== 'true'); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { set(false); }); });
})();
