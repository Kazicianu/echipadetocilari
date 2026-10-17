/* Interactions for the static copy of /dezvoltare-aplicatii/ (Google Ads landing).
   The design canvas ran these through its own component state; this is the same behaviour in plain JS. */
(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  let reduceMotion = false;
  let motionPreference;
  try {
    motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    reduceMotion = motionPreference.matches;
  } catch (error) { /* older browsers */ }

  /* Ad groups: ?tip=mobil|web|portal|ai in the ad's final URL. The kicker and the H1 take the wording of the
     ad group, and the app types open on that type. Without the parameter, or with an unknown value,
     the page stays general. */
  const TIPS = { mobil: 0, web: 1, portal: 2, ai: 3 };
  let tip = '';
  try { tip = (new URLSearchParams(window.location.search).get('tip') || '').trim().toLowerCase(); } catch (error) { /* no URLSearchParams */ }
  const adType = Object.prototype.hasOwnProperty.call(TIPS, tip) ? TIPS[tip] : null;
  if (adType !== null) {
    const variant = $(`[data-js="hero-title-variant"][data-tip="${tip}"]`);
    const kicker = $('[data-js="hero-kicker"]');
    const heading = $('[data-js="hero-h1"]');
    if (variant && kicker && heading) {
      kicker.textContent = variant.dataset.kicker;
      heading.textContent = '';
      heading.appendChild(variant.content.cloneNode(true));
    }
  }

  /* Below 600px: looping seven-second stories, tap to navigate and hold to pause.
     Releasing a hold resumes the same progress. Swipes navigate once; vertical
     scrolling never changes the story. Desktop keeps its ordinary tabs. */
  const story = $('[data-js="story"]');
  const card = $('[data-js="story-card"]');
  const tabs = $$('[data-js="type-tab"]');
  const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls')));
  const fills = $$('[data-js="bar-fill"]');
  const preview = $('[data-js="type-preview"]');
  const audience = $('[data-js="type-audience"]');
  const modGroups = $$('[data-mods]');
  const storyNumber = $('[data-js="story-number"]');
  const mobilePreference = window.matchMedia('(max-width: 599.98px)');
  const last = tabs.length - 1;
  let current = adType === null ? 0 : adType;
  let mobile = mobilePreference.matches;
  let inView = false;
  let holding = false;
  let keyboardPaused = false;
  let paused = true;
  let gesture = null;

  const render = () => {
    paused = reduceMotion || !mobile || !inView || document.hidden || holding || keyboardPaused;
    tabs.forEach((tab, index) => {
      const active = index === current;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      tab.classList.toggle('is-on', active);
      tab.classList.toggle('is-done', index < current);
    });
    panels.forEach((panel, index) => { if (panel) panel.hidden = index !== current; });
    const panel = panels[current];
    story.className = `v2-builder lp-story lp-story--${current}${paused ? ' is-paused' : ''}${inView ? '' : ' is-waiting'}${keyboardPaused ? ' is-keyboard' : ''}`;
    if (preview && panel) preview.className = `v2-prev v2-prev--${panel.dataset.preview}`;
    if (audience && panel) audience.textContent = panel.dataset.audience;
    modGroups.forEach((group) => { group.hidden = Number(group.dataset.mods) !== current; });
    if (storyNumber) storyNumber.textContent = String(current + 1);
  };

  /* Opening a story always starts its bar from zero, also when it is the story already open. */
  const restartFill = (index) => {
    const fill = fills[index];
    if (!fill) return;
    fill.style.animation = 'none';
    void fill.offsetWidth;
    fill.style.animation = '';
  };
  const go = (index, { keyboard = false } = {}) => {
    current = Math.max(0, Math.min(last, index));
    keyboardPaused = keyboard;
    render();
    restartFill(current);
  };
  const next = (options) => go((current + 1) % tabs.length, options);
  const prev = (options) => go((current + tabs.length - 1) % tabs.length, options);

  if (story && tabs.length) {
    const cancelGesture = () => {
      gesture = null;
      holding = false;
      render();
    };
    motionPreference?.addEventListener('change', (event) => {
      reduceMotion = event.matches;
      render();
    });
    mobilePreference.addEventListener('change', (event) => {
      mobile = event.matches;
      cancelGesture();
    });
    document.addEventListener('visibilitychange', cancelGesture);
    window.addEventListener('blur', cancelGesture);
    card?.addEventListener('focusin', (event) => {
      if (gesture || !event.target.matches(':focus-visible')) return;
      keyboardPaused = true;
      render();
    });
    card?.addEventListener('focusout', () => {
      window.requestAnimationFrame(() => {
        if (!card.contains(document.activeElement)) {
          keyboardPaused = false;
          render();
        }
      });
    });
    fills.forEach((fill, index) => fill.addEventListener('animationend', (event) => {
      if (event.animationName === 'lp-fill' && index === current && !paused) next();
    }));
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', (event) => {
        if (!mobile) go(index, { keyboard: event.detail === 0 });
      });
      tab.addEventListener('keydown', (event) => {
        let target = null;
        if (event.key === 'ArrowDown' || event.key === 'ArrowRight') target = (current + 1) % tabs.length;
        else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') target = (current + tabs.length - 1) % tabs.length;
        else if (event.key === 'Home') target = 0;
        else if (event.key === 'End') target = last;
        if (target === null) return;
        event.preventDefault();
        go(target, { keyboard: true });
        tabs[target].focus();
      });
    });
    const isLinkOrField = (target) => target.closest('a, input, textarea, select');
    const navigate = (target, clientX, keyboard = false) => {
      const tab = target.closest('[data-js="type-tab"]');
      const control = target.closest('[data-js="story-next"], [data-js="story-prev"]');
      if (!tab && !control && keyboard) return;
      const options = { keyboard };
      if (tab) go(tabs.indexOf(tab), options);
      else if (control) {
        if (control.dataset.js === 'story-prev') prev(options); else next(options);
      } else {
        const bounds = card.getBoundingClientRect();
        if (clientX - bounds.left < bounds.width / 3) prev(options); else next(options);
      }
    };
    card?.addEventListener('pointerdown', (event) => {
      if (!mobile || gesture || !event.isPrimary || event.button !== 0 || isLinkOrField(event.target)) return;
      keyboardPaused = false;
      gesture = { id: event.pointerId, target: event.target, x: event.clientX, y: event.clientY, at: performance.now(), moved: false };
      holding = true;
      render();
    });
    window.addEventListener('pointermove', (event) => {
      if (!gesture || event.pointerId !== gesture.id) return;
      if (Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) > 10) gesture.moved = true;
    }, { passive: true });
    window.addEventListener('pointerup', (event) => {
      if (!gesture || event.pointerId !== gesture.id) return;
      const press = gesture;
      const dx = event.clientX - press.x;
      const dy = event.clientY - press.y;
      gesture = null;
      holding = false;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) next(); else prev();
      } else if (!press.moved && Math.hypot(dx, dy) <= 10 && performance.now() - press.at < 200) {
        navigate(press.target, event.clientX);
      } else {
        // A long press only reads/pauses, without resetting progress.
        render();
      }
    });
    window.addEventListener('pointercancel', (event) => {
      if (gesture && event.pointerId === gesture.id) cancelGesture();
    });
    card?.addEventListener('contextmenu', (event) => {
      if (mobile && !isLinkOrField(event.target)) event.preventDefault();
    });
    card?.addEventListener('click', (event) => {
      if (!mobile || isLinkOrField(event.target)) return;
      event.preventDefault();
      event.stopPropagation();
      // Pointer navigation already happened on release. A compatibility click
      // may be delayed or omitted entirely, so it cannot drive story state.
      if (event.detail === 0) navigate(event.target, event.clientX, true);
    }, true);

    if (card && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        inView = entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.5);
        render();
      }, { threshold: [0, 0.5] });
      observer.observe(card);
    } else {
      inView = true;
    }
    render();
  }

  /* Phone carousels ("Ce construim" and "Cum lucrăm"): the dots follow the swipe, and a dot scrolls to its card.
     From 768px (bento) and 1100px (steps) the dots are hidden and the cards stand in a grid. */
  $$('[data-js="rail"]').forEach((rail) => {
    const dots = $$(`[data-rail="${rail.id}"] .lp-dot`);
    if (!dots.length) return;
    let lockUntil = 0;
    const setCurrent = (index) => dots.forEach((dot, k) => dot.setAttribute('aria-current', String(k === index)));
    const railIndex = () => {
      const count = rail.children.length;
      const first = rail.firstElementChild;
      if (!first || count < 2) return 0;
      if (rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 4) return count - 1;
      const gap = parseFloat(window.getComputedStyle(rail).columnGap) || 0;
      const step = first.getBoundingClientRect().width + gap;
      if (!step) return 0;
      return Math.max(0, Math.min(count - 1, Math.round(rail.scrollLeft / step)));
    };
    rail.addEventListener('scroll', () => {
      if (Date.now() < lockUntil) return;
      setCurrent(railIndex());
    }, { passive: true });
    dots.forEach((dot, index) => dot.addEventListener('click', () => {
      const item = rail.children[index];
      if (!item) return;
      const padding = parseFloat(window.getComputedStyle(rail).paddingLeft) || 0;
      const left = rail.scrollLeft + item.getBoundingClientRect().left - rail.getBoundingClientRect().left - padding;
      lockUntil = Date.now() + 700;
      rail.scrollTo({ left, behavior: reduceMotion ? 'auto' : 'smooth' });
      setCurrent(index);
    }));
  });

})();
