/* Redwood Roots — nav, dropdowns, age gate, lazy hero video */
(function () {
  'use strict';

  /* mobile nav toggle */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.documentElement.style.overflow = open && window.innerWidth < 1100 ? 'hidden' : '';
    });
  }

  /* dropdowns (click on all devices, close on outside click / Esc) */
  var drops = [].slice.call(document.querySelectorAll('.has-drop'));
  function closeAll(except) {
    drops.forEach(function (d) {
      if (d === except) return;
      d.querySelector('.drop-btn').setAttribute('aria-expanded', 'false');
      d.querySelector('.dropdown').classList.remove('open');
    });
  }
  drops.forEach(function (d) {
    var btn = d.querySelector('.drop-btn');
    var menu = d.querySelector('.dropdown');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var willOpen = !menu.classList.contains('open');
      closeAll(d);
      menu.classList.toggle('open', willOpen);
      btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    });
  });
  document.addEventListener('click', function () { closeAll(null); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeAll(null);
      if (nav && nav.classList.contains('open')) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.documentElement.style.overflow = '';
      }
    }
  });

  /* age gate — 21+ attestation, remembered 30 days */
  var gate = document.getElementById('age-gate');
  if (gate) {
    var KEY = 'rr-age-ok';
    var ok = false;
    try { ok = Date.now() - (parseInt(localStorage.getItem(KEY), 10) || 0) < 2592000000; } catch (e) {}
    if (!ok) {
      gate.hidden = false;
      document.documentElement.style.overflow = 'hidden';
      var yes = document.getElementById('age-yes');
      var no = document.getElementById('age-no');
      yes.focus();
      yes.addEventListener('click', function () {
        try { localStorage.setItem(KEY, String(Date.now())); } catch (e) {}
        gate.hidden = true;
        document.documentElement.style.overflow = '';
      });
      no.addEventListener('click', function () {
        window.location.href = 'https://www.responsibility.org/';
      });
    }
  }

  /* hero video: lazy start after load (poster paints LCP first) */
  var vid = document.querySelector('.hero-media video[data-src]');
  if (vid && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var start = function () {
      vid.src = vid.getAttribute('data-src');
      vid.removeAttribute('data-src');
      vid.play().catch(function () {});
    };
    if (document.readyState === 'complete') setTimeout(start, 300);
    else window.addEventListener('load', function () { setTimeout(start, 300); });
  }
})();
