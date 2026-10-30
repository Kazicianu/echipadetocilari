(function () {
  'use strict';

  var root = document.querySelector('.fb');
  if (!root) { return; }
  root.classList.add('fb-js');

  /* ---- Budget slider ---- */
  function fmt(n) {
    var r = Math.round(n);
    var s;
    try { s = r.toLocaleString('ro-RO'); } catch (e) { s = String(r); }
    if (r >= 1000 && !/[.  ]/.test(s)) {
      s = String(r).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
    return s;
  }

  var range = document.getElementById('fb-buget');
  if (range) {
    var outDay = document.getElementById('fb-buget-zi');
    var outWeek = document.getElementById('fb-buget-sapt');
    var outMonth = document.getElementById('fb-buget-luna');
    var updateBudget = function () {
      var daily = Number(range.value) || 0;
      if (outDay) { outDay.textContent = fmt(daily); }
      if (outWeek) { outWeek.textContent = fmt(daily * 7); }
      if (outMonth) { outMonth.textContent = fmt(daily * 30.4); }
      range.setAttribute('aria-valuetext', fmt(daily) + ' lei pe zi');
    };
    range.addEventListener('input', updateBudget);
    range.addEventListener('change', updateBudget);
    updateBudget();
  }

  /* ---- Package picker (phones) ---- */
  var tablist = root.querySelector('.ect-picker');
  if (tablist) {
    var tabs = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));
    var select = function (index, focus) {
      var i;
      for (i = 0; i < tabs.length; i++) {
        var on = i === index;
        var panel = document.getElementById(tabs[i].getAttribute('aria-controls'));
        tabs[i].setAttribute('aria-selected', on ? 'true' : 'false');
        tabs[i].setAttribute('tabindex', on ? '0' : '-1');
        if (panel) { panel.hidden = !on; }
      }
      if (focus && tabs[index]) { tabs[index].focus(); }
    };
    var current = 0;
    tabs.forEach(function (tab, i) {
      if (tab.getAttribute('aria-selected') === 'true') { current = i; }
      tab.addEventListener('click', function () { select(i, false); });
      tab.addEventListener('keydown', function (e) {
        var next = -1;
        var n = tabs.length;
        switch (e.key) {
          case 'ArrowRight': case 'ArrowDown': case 'Right': case 'Down': next = (i + 1) % n; break;
          case 'ArrowLeft': case 'ArrowUp': case 'Left': case 'Up': next = (i - 1 + n) % n; break;
          case 'Home': next = 0; break;
          case 'End': next = n - 1; break;
        }
        if (next > -1) {
          e.preventDefault();
          select(next, true);
        }
      });
    });
    if (tabs.length) { select(current, false); }
  }

  /* ---- "Scrie-ne intrebarea ta" -> contact form ---- */
  var form = root.querySelector('.fb-ask-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = form.querySelector('input[name="intrebare"]');
      var text = input ? input.value.replace(/^\s+|\s+$/g, '') : '';
      if (!text) {
        if (input) { input.focus(); }
        return;
      }
      var target = document.getElementById('formular_contact_bottom');
      var area = document.querySelector('#formular_contact_bottom textarea');
      if (area) {
        area.value = text;
        var ev;
        try { ev = new Event('input', { bubbles: true }); } catch (err) {
          ev = document.createEvent('Event');
          ev.initEvent('input', true, true);
        }
        area.dispatchEvent(ev);
      }
      if (target) {
        var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        try {
          target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        } catch (err2) {
          target.scrollIntoView();
        }
      }
      if (area) {
        try { area.focus({ preventScroll: true }); } catch (err3) { area.focus(); }
      }
    });
  }

  /* ---- "Ce include": on phones the cards swipe and the pin of the card in view lights up ---- */
  var incCalls = root.querySelector('.fb-inc-calls');
  if (incCalls) {
    var incCards = Array.prototype.slice.call(incCalls.querySelectorAll('.fb-call'));
    var incPins = [1, 2, 3, 4, 5].map(function (n) { return root.querySelector('.fb-inc-pin--' + n); });
    incPins.push(root.querySelector('.fb-inc-pin6'));
    var incFrame = 0;
    var syncPins = function () {
      incFrame = 0;
      var active = -1;
      if (incCalls.scrollWidth > incCalls.clientWidth + 1) {
        var box = incCalls.getBoundingClientRect();
        var mid = box.left + box.width / 2;
        var best = Infinity;
        incCards.forEach(function (card, i) {
          var r = card.getBoundingClientRect();
          var d = Math.abs(r.left + r.width / 2 - mid);
          if (d < best) { best = d; active = i; }
        });
      }
      incPins.forEach(function (pin, i) {
        if (pin) { pin.classList.toggle('is-active', i === active); }
      });
    };
    var queueSync = function () {
      if (!incFrame) { incFrame = window.requestAnimationFrame(syncPins); }
    };
    incCalls.addEventListener('scroll', queueSync, { passive: true });
    window.addEventListener('resize', queueSync);
    syncPins();
  }
}());
