/*
 * Worm dots, microinteractions.dev, MIT License.
 * Source: https://microinteractions.dev/worm-dots/
 * Permission is granted, free of charge, to use, copy, modify, merge, publish and distribute this
 * software, provided this notice is kept in all copies or substantial portions of it. The software is
 * provided "as is", without warranty of any kind.
 *
 * Adapted for echipadetocilari.ro as a plain script (no custom element, no modules, no counter).
 * Pair with worm-dots.css.
 *
 *   const controller = window.ectWormDots.attach(strip, { track, onSelect });
 *   controller.goTo(index, { animate: true });
 *   controller.destroy();
 *
 * Scroll mode (a `track` is given): the worm follows the track's scrollLeft and the strip drives it.
 * Virtual mode (no track): the module keeps its own position and reports user picks through onSelect.
 */
(function () {
  'use strict';

  if (window.ectWormDots) return;

  var TRAIL_START = 0.5;
  var SLOP = 4;
  var SNAP = 180;
  var TRAVEL = 280;
  var PER_DOT = 40;
  var CATCH_UP = 60;
  var ANNOUNCE_AFTER = 250;

  // cubic-bezier(0.23, 1, 0.32, 1), solved for x then evaluated for y.
  var easeOut = function (t) {
    var at = function (a, b, s2) {
      return 3 * a * s2 * Math.pow(1 - s2, 2) + 3 * b * s2 * s2 * (1 - s2) + Math.pow(s2, 3);
    };
    var lo = 0;
    var hi = 1;
    var s = t;
    for (var i = 0; i < 20; i++) {
      var x = at(0.23, 0.32, s);
      if (Math.abs(x - t) < 1e-5) break;
      if (x < t) lo = s;
      else hi = s;
      s = (lo + hi) / 2;
    }
    return at(1, 1, s);
  };
  var clamp = function (value, min, max) {
    if (min === undefined) min = 0;
    if (max === undefined) max = 1;
    return Math.min(Math.max(value, min), max);
  };
  var smoothstep = function (t) {
    return t * t * (3 - 2 * t);
  };

  function attach(strip, options) {
    if (!strip || strip.nodeType !== 1) return null;
    if (strip.wormDots) return strip.wormDots;

    var opts = options || {};
    var track = opts.track || null;
    var onSelect = typeof opts.onSelect === 'function' ? opts.onSelect : null;

    var dots = Array.prototype.slice.call(strip.querySelectorAll('.wd-dot'));
    if (dots.length < 2) return null;
    if (track && track.children.length !== dots.length) return null;

    var scrollMode = !!track;
    var slides = scrollMode ? Array.prototype.slice.call(track.children) : [];
    var count = dots.length;
    var last = count - 1;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

    var controller = new AbortController();
    var signal = controller.signal;
    var destroyed = false;

    var halo = document.createElement('span');
    halo.className = 'wd-ring';
    halo.setAttribute('aria-hidden', 'true');
    var worm = document.createElement('span');
    worm.className = 'wd-worm';
    worm.setAttribute('aria-hidden', 'true');
    strip.prepend(halo, worm);

    var status = null;
    if (scrollMode) {
      status = document.createElement('p');
      status.className = 'wd-vh';
      status.setAttribute('aria-live', 'polite');
      strip.insertAdjacentElement('afterend', status);
    }

    var origSnap = scrollMode ? track.style.scrollSnapType : '';
    var origBehavior = scrollMode ? track.style.scrollBehavior : '';
    var origTabindex = dots.map(function (dot) {
      return dot.getAttribute('tabindex');
    });

    // Sizes, in px, from the registered custom properties.
    var size = { dot: 0, pill: 0, gap: 0, ring: 0 };
    // Scroll mapping: knots are [position, scroll] pairs, strictly increasing in both.
    var targets = [];
    var knots = [];

    var measure = function () {
      var style = getComputedStyle(strip);
      var read = function (name) {
        return parseFloat(style.getPropertyValue(name)) || 0;
      };
      size = { dot: read('--wd-dot'), pill: read('--wd-pill'), gap: read('--wd-gap'), ring: read('--wd-ring') };
      if (!scrollMode) return;
      var first = slides[0].offsetLeft;
      var max = Math.max(0, track.scrollWidth - track.clientWidth);
      targets = slides.map(function (slide) {
        return clamp(slide.offsetLeft - first, 0, max);
      });
      knots = [];
      if (max > 0) {
        targets.forEach(function (t, i) {
          if (t < max - 0.5 && (!knots.length || t > knots[knots.length - 1][1])) knots.push([i, t]);
        });
        knots.push([last, max]);
      }
    };

    // Piecewise-linear map over the knots: fromKey/toKey are 0 (position) or 1 (scroll).
    var map = function (value, fromKey, toKey) {
      if (knots.length < 2) return 0;
      var lo = knots[0][fromKey];
      var hi = knots[knots.length - 1][fromKey];
      var v = clamp(value, lo, hi);
      var k = 0;
      while (k < knots.length - 2 && v > knots[k + 1][fromKey]) k++;
      var a = knots[k];
      var b = knots[k + 1];
      return a[toKey] + ((v - a[fromKey]) / (b[fromKey] - a[fromKey])) * (b[toKey] - a[toKey]);
    };
    var positionFor = function (scroll) {
      return map(scroll, 1, 0);
    };
    var scrollFor = function (position) {
      return map(position, 0, 1);
    };
    // Where "go to dot i" really lands.
    var indexPosition = function (index) {
      return scrollMode ? positionFor(targets[index]) : index;
    };

    // Position source: the track's scroll, or an internal value.
    var virtual = Math.max(
      0,
      dots.findIndex(function (dot) {
        return dot.getAttribute('aria-current') === 'true';
      })
    );
    var current = -1;
    var drawn = 0;
    var frame = 0;
    var driving = false;
    var pointer;
    var hovered = -1;
    var spoken = 0;
    var quiet = 0;
    var observer = null;

    var read = function () {
      return scrollMode ? clamp(positionFor(track.scrollLeft), 0, last) : virtual;
    };
    var write = function (p) {
      if (scrollMode) track.scrollLeft = scrollFor(clamp(p, 0, last));
      else {
        virtual = clamp(p, 0, last);
        render();
      }
    };
    var select = function (index) {
      if (!scrollMode && onSelect) onSelect(index);
    };

    var placeRing = function (index, instant) {
      hovered = index;
      var pad = size.ring - size.dot;
      var width = index === current ? Math.max(size.ring, size.pill + pad) : size.ring;
      if (instant) halo.style.transition = 'none';
      halo.style.transform = 'translateX(' + (index * size.gap + size.gap / 2 - width / 2) + 'px)';
      halo.style.width = width + 'px';
      if (instant) {
        void halo.offsetWidth;
        halo.style.transition = '';
      }
    };
    var hideRing = function () {
      hovered = -1;
      halo.removeAttribute('data-visible');
    };

    var announceLater = function () {
      if (!status) return;
      clearTimeout(quiet);
      quiet = window.setTimeout(function () {
        if (pointer !== undefined || current === spoken) return;
        spoken = current;
        if (strip.contains(document.activeElement)) dots[current].focus({ preventScroll: true });
        else status.textContent = dots[current].getAttribute('aria-label') || '';
      }, ANNOUNCE_AFTER);
    };

    function render() {
      var p = read();
      drawn = p;
      var i = Math.min(Math.floor(p), last);
      var f = p - i;
      var span = 1 - TRAIL_START;
      var lead = smoothstep(clamp(f / span));
      var trail = smoothstep(clamp((f - TRAIL_START) / span));
      var left = i * size.gap + size.gap / 2 - size.pill / 2 + size.gap * trail;
      var right = i * size.gap + size.gap / 2 + size.pill / 2 + size.gap * lead;
      worm.style.transform = 'translateX(' + left + 'px)';
      worm.style.width = right - left + 'px';
      var nearest = Math.round(p);
      if (nearest === current) return;
      current = nearest;
      dots.forEach(function (dot, index) {
        dot.setAttribute('tabindex', index === nearest ? '0' : '-1');
        dot.setAttribute('aria-current', index === nearest ? 'true' : 'false');
      });
      if (hovered >= 0) placeRing(hovered, false);
    }

    var takeOver = function () {
      cancelAnimationFrame(frame);
      driving = true;
      if (scrollMode) {
        track.style.scrollBehavior = 'auto';
        track.style.scrollSnapType = 'none';
      }
    };
    var release = function () {
      cancelAnimationFrame(frame);
      driving = false;
      if (scrollMode) {
        track.style.scrollSnapType = origSnap;
        track.style.scrollBehavior = origBehavior;
      }
    };
    var jump = function (index) {
      takeOver();
      write(indexPosition(index));
      release();
    };
    var travel = function (index, duration) {
      var from = read();
      var to = indexPosition(index);
      if (reduceMotion.matches || Math.abs(to - from) < 1e-3) return jump(index);
      takeOver();
      var start = performance.now();
      var tick = function (now) {
        var t = clamp((now - start) / duration);
        write(from + (to - from) * easeOut(t));
        if (t < 1) frame = requestAnimationFrame(tick);
        else release();
      };
      frame = requestAnimationFrame(tick);
    };
    var settle = function (index, duration) {
      if (strip.contains(document.activeElement)) {
        spoken = index;
        dots[index].focus({ preventScroll: true });
      }
      travel(index, duration);
    };
    var tapDuration = function (index) {
      return TRAVEL + PER_DOT * Math.max(Math.abs(indexPosition(index) - read()) - 1, 0);
    };

    var yieldToTrack = function () {
      if (driving && pointer === undefined) release();
    };
    if (scrollMode) {
      track.addEventListener(
        'scroll',
        function () {
          render();
          announceLater();
        },
        { passive: true, signal: signal }
      );
      track.addEventListener('pointerdown', yieldToTrack, { signal: signal });
      track.addEventListener('wheel', yieldToTrack, { passive: true, signal: signal });
    }

    var toPosition = function (clientX) {
      return clamp((clientX - dots[0].getBoundingClientRect().left - size.gap / 2) / size.gap, 0, last);
    };
    var downX = 0;
    var goal = 0;
    var scrubbing = false;
    var pressed;
    var lastRounded = 0;
    var unpress = function () {
      if (pressed) pressed.removeAttribute('data-pressed');
      pressed = undefined;
    };
    var follow = function () {
      var then = performance.now();
      lastRounded = Math.round(read());
      var tick = function (now) {
        var elapsed = Math.max(now - then, 0);
        then = now;
        var p = read();
        var blend = reduceMotion.matches ? 1 : 1 - Math.exp(-elapsed / CATCH_UP);
        write(p + (goal - p) * blend);
        if (!scrollMode) {
          var rounded = Math.round(read());
          if (rounded !== lastRounded) {
            lastRounded = rounded;
            select(rounded);
          }
        }
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    strip.addEventListener(
      'pointerdown',
      function (event) {
        if (pointer !== undefined || event.button !== 0) return;
        pointer = event.pointerId;
        downX = event.clientX;
        pressed = event.target.closest('.wd-dot') || undefined;
        if (pressed) pressed.setAttribute('data-pressed', '');
        try {
          strip.setPointerCapture(event.pointerId);
        } catch (error) {
          /* capture is an enhancement */
        }
      },
      { signal: signal }
    );
    strip.addEventListener(
      'pointermove',
      function (event) {
        if (event.pointerId === pointer) {
          if (!scrubbing) {
            if (Math.abs(event.clientX - downX) < SLOP) return;
            scrubbing = true;
            unpress();
            takeOver();
            strip.setAttribute('data-wd-scrubbing', '');
            follow();
          }
          goal = toPosition(event.clientX);
        }
        if (hovered >= 0 && event.pointerType === 'mouse') {
          var index = Math.round(toPosition(event.clientX));
          if (index !== hovered) placeRing(index, false);
        }
      },
      { signal: signal }
    );
    var end = function (event) {
      if (event.pointerId !== pointer) return;
      var committed = event.type === 'pointerup';
      pointer = undefined;
      unpress();
      strip.removeAttribute('data-wd-scrubbing');
      if (hovered >= 0 && !strip.matches(':hover')) hideRing();
      var wasScrubbing = scrubbing;
      scrubbing = false;
      cancelAnimationFrame(frame);
      if (!committed) {
        if (wasScrubbing) travel(Math.round(read()), SNAP);
        return;
      }
      if (!wasScrubbing) {
        var index = Math.round(toPosition(event.clientX));
        select(index);
        settle(index, tapDuration(index));
        return;
      }
      var target = Math.round(goal);
      select(target);
      settle(target, SNAP);
    };
    strip.addEventListener('pointerup', end, { signal: signal });
    strip.addEventListener('pointercancel', end, { signal: signal });
    strip.addEventListener('lostpointercapture', end, { signal: signal });
    strip.addEventListener(
      'click',
      function (event) {
        var dot = event.target.closest('.wd-dot');
        if (!dot || event.detail !== 0) return;
        var index = dots.indexOf(dot);
        spoken = index;
        select(index);
        jump(index);
        render();
      },
      { signal: signal }
    );
    strip.addEventListener(
      'keydown',
      function (event) {
        var next;
        if (event.key === 'ArrowRight') next = Math.min(current + 1, last);
        else if (event.key === 'ArrowLeft') next = Math.max(current - 1, 0);
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = last;
        if (next === undefined) return;
        event.preventDefault();
        spoken = next;
        select(next);
        jump(next);
        render();
        dots[next].focus({ preventScroll: true });
      },
      { signal: signal }
    );
    strip.addEventListener(
      'pointerenter',
      function (event) {
        if (event.pointerType !== 'mouse' || !finePointer.matches) return;
        placeRing(Math.round(toPosition(event.clientX)), true);
        halo.setAttribute('data-visible', '');
      },
      { signal: signal }
    );
    strip.addEventListener(
      'pointerleave',
      function () {
        if (pointer === undefined) hideRing();
      },
      { signal: signal }
    );

    observer = new ResizeObserver(function () {
      measure();
      if (scrollMode && !driving) track.scrollLeft = scrollFor(drawn);
      render();
      if (hovered >= 0) placeRing(hovered, true);
    });
    if (scrollMode) observer.observe(track);
    observer.observe(strip);

    signal.addEventListener('abort', function () {
      observer.disconnect();
      cancelAnimationFrame(frame);
      clearTimeout(quiet);
      if (scrollMode) {
        track.style.scrollSnapType = origSnap;
        track.style.scrollBehavior = origBehavior;
      }
      unpress();
      halo.remove();
      worm.remove();
      if (status) status.remove();
      strip.removeAttribute('data-wd-ready');
      strip.removeAttribute('data-wd-scrubbing');
      dots.forEach(function (dot, index) {
        if (origTabindex[index] === null) dot.removeAttribute('tabindex');
        else dot.setAttribute('tabindex', origTabindex[index]);
      });
      delete strip.wormDots;
    });

    var api = {
      goTo: function (index, goOptions) {
        if (destroyed || pointer !== undefined || !isFinite(index)) return;
        var animate = !goOptions || goOptions.animate !== false;
        var i = clamp(Math.round(index), 0, last);
        if (animate) travel(i, tapDuration(i));
        else jump(i);
      },
      destroy: function () {
        if (destroyed) return;
        destroyed = true;
        controller.abort();
      },
    };

    strip.wormDots = api;
    measure();
    render();
    spoken = current;
    strip.setAttribute('data-wd-ready', '');
    return api;
  }

  window.ectWormDots = { attach: attach };
})();
