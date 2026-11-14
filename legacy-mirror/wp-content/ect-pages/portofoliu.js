/* Portfolio page: site clips on hover (desktop) or when a card is in view (phones), and the scrolling full-page preview. */
(function () {
  'use strict';
  var cards = Array.prototype.slice.call(document.querySelectorAll('#proiecte .mb-card'));
  if (!cards.length || !window.matchMedia) return;

  var desk = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1024px)');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var clamp = function (n, min, max) { return Math.min(max, Math.max(min, n)); };
  var saveData = function () { var c = navigator.connection; return !!(c && c.saveData); };

  /* Full-page previews: how far the image has to travel and how long it takes. */
  function measure(page) {
    var img = page.querySelector('img');
    var view = page.parentNode;
    if (!img || !view) return;
    var dist = Math.max(0, img.offsetHeight - view.clientHeight);
    page.style.setProperty('--pan', '-' + dist + 'px');
    page.style.setProperty('--dur', clamp(dist / 150, 4, 16).toFixed(1) + 's');
    page.style.setProperty('--dur-mob', clamp(dist / 120, 8, 24).toFixed(1) + 's');
  }
  cards.forEach(function (card) {
    var page = card.querySelector('.mb-page');
    if (!page) return;
    var img = page.querySelector('img');
    var update = function () { measure(page); };
    if (img) img.addEventListener('load', update);
    update();
    if ('ResizeObserver' in window) new ResizeObserver(update).observe(page.parentNode);
    else window.addEventListener('resize', update);
  });

  /* Clips. The class is added only once the video really plays, so the still never flashes. */
  cards.forEach(function (card) {
    var v = card.querySelector('.mb-vid');
    if (!v) return;
    v.addEventListener('playing', function () { if (!v.paused) card.classList.add('is-playing'); });
    v.addEventListener('ended', function () { card.classList.remove('is-playing'); });
  });

  function play(card) {
    if (reduce.matches) return;
    var v = card.querySelector('.mb-vid');
    if (v) {
      v.loop = desk.matches;
      if (v.ended) { try { v.currentTime = 0; } catch (e) { /* ignore */ } }
      var p = v.play();
      if (p && p.catch) p.catch(function () { /* autoplay refused: the still stays */ });
    }
    if (card.querySelector('.mb-page') && !desk.matches) {
      card.classList.remove('is-panning');
      void card.offsetWidth;
      card.classList.add('is-panning');
    }
  }

  function stop(card) {
    var v = card.querySelector('.mb-vid');
    if (v) {
      v.pause();
      try { v.currentTime = 0; } catch (e) { /* ignore */ }
    }
    card.classList.remove('is-playing', 'is-panning');
  }

  /* Desktop: mouse hover and keyboard focus. */
  cards.forEach(function (card) {
    card.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse' && desk.matches) play(card); });
    card.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse' && desk.matches) stop(card); });
    card.addEventListener('focusin', function (e) {
      if (!desk.matches) return;
      var t = e.target;
      if (t && t.matches && t.matches(':focus-visible')) play(card);
    });
    card.addEventListener('focusout', function () { if (desk.matches) stop(card); });
  });

  /* Phones and touch: play once each time a card comes into view. */
  var inView = new Set();
  var io = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (desk.matches) return;
        var card = entry.target;
        var visible = entry.isIntersecting && (entry.intersectionRatio >= 0.6 || entry.intersectionRect.height >= 0.6 * window.innerHeight);
        if (visible === inView.has(card)) return;
        if (visible) {
          inView.add(card);
          if (!saveData()) play(card);
        } else {
          inView.delete(card);
          stop(card);
        }
      });
    }, { threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] });
    cards.forEach(function (card) { io.observe(card); });
  }

  /* Switching between desktop and phone behaviour: reset everything and let the video pick its source again. */
  var onChange = function () {
    cards.forEach(function (card) {
      stop(card);
      var v = card.querySelector('.mb-vid');
      if (v) v.load();
    });
    inView.clear();
    if (io) cards.forEach(function (card) { io.unobserve(card); io.observe(card); });
  };
  if (desk.addEventListener) desk.addEventListener('change', onChange);
  else if (desk.addListener) desk.addListener(onChange);
})();
