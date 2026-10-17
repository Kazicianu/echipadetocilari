/* Interactions for the static copy of /dezvoltare-aplicatii/ (Google Ads landing).
   The design canvas ran these through its own component state; this is the same behaviour in plain JS. */
(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  let reduceMotion = false;
  try { reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (error) { /* older browsers */ }

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

  /* App types. From 600px up they are ordinary tabs next to a preview. Under 600px the same markup is a story card:
     the bar of each story fills in 7 s (CSS animation lp-fill), then the next story opens; after the fourth one
     the stories stop. The right two thirds of the card go forward, the left third goes back, a horizontal swipe
     does the same and the round button pauses. Once the stories have stopped, the button starts them again from 1.
     They start only when half of the card is on screen. Visitors from an ad start paused, on their type;
     with reduced motion nothing fills, so the stories change only by tap or swipe and the button is hidden (CSS). */
  const story = $('[data-js="story"]');
  const card = $('[data-js="story-card"]');
  const tabs = $$('[data-js="type-tab"]');
  const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls')));
  const fills = $$('[data-js="bar-fill"]');
  const preview = $('[data-js="type-preview"]');
  const audience = $('[data-js="type-audience"]');
  const modGroups = $$('[data-mods]');
  const storyNumber = $('[data-js="story-number"]');
  const pauseButton = $('[data-js="story-pause"]');
  const last = tabs.length - 1;
  let current = adType === null ? 0 : adType;
  let paused = adType !== null || reduceMotion;
  let ended = false;
  let seen = false;

  const render = () => {
    tabs.forEach((tab, index) => {
      const active = index === current;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      tab.classList.toggle('is-on', active);
      tab.classList.toggle('is-done', index < current);
    });
    panels.forEach((panel, index) => { if (panel) panel.hidden = index !== current; });
    const panel = panels[current];
    story.className = `v2-builder lp-story lp-story--${current}${paused ? ' is-paused' : ''}${seen ? '' : ' is-waiting'}`;
    if (preview && panel) preview.className = `v2-prev v2-prev--${panel.dataset.preview}`;
    if (audience && panel) audience.textContent = panel.dataset.audience;
    modGroups.forEach((group) => { group.hidden = Number(group.dataset.mods) !== current; });
    if (storyNumber) storyNumber.textContent = String(current + 1);
    if (pauseButton) {
      pauseButton.setAttribute('aria-label', paused ? 'Pornește poveștile' : 'Oprește poveștile');
      $('[data-icon="pause"]', pauseButton)?.toggleAttribute('hidden', paused);
      $('[data-icon="play"]', pauseButton)?.toggleAttribute('hidden', !paused);
    }
  };

  /* Opening a story always starts its bar from zero, also when it is the story already open. */
  const restartFill = (index) => {
    const fill = fills[index];
    if (!fill) return;
    fill.style.animation = 'none';
    void fill.offsetWidth;
    fill.style.animation = '';
  };
  const go = (index) => {
    current = Math.max(0, Math.min(last, index));
    paused = reduceMotion;
    ended = false;
    render();
    restartFill(current);
  };
  const next = () => {
    if (current < last) { go(current + 1); return; }
    paused = true;
    ended = true;
    render();
  };
  const prev = () => go(current - 1);

  if (story && tabs.length) {
    fills.forEach((fill, index) => fill.addEventListener('animationend', (event) => {
      if (event.animationName === 'lp-fill' && index === current && !paused) next();
    }));
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => go(index));
      tab.addEventListener('keydown', (event) => {
        let target = null;
        if (event.key === 'ArrowDown' || event.key === 'ArrowRight') target = (current + 1) % tabs.length;
        else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') target = (current + tabs.length - 1) % tabs.length;
        else if (event.key === 'Home') target = 0;
        else if (event.key === 'End') target = last;
        if (target === null) return;
        event.preventDefault();
        go(target);
        tabs[target].focus();
      });
    });
    pauseButton?.addEventListener('click', () => {
      if (ended) { go(0); return; }
      paused = !paused;
      render();
    });
    $('[data-js="story-next"]')?.addEventListener('click', next);
    $('[data-js="story-prev"]')?.addEventListener('click', prev);

    let startX = null;
    let startY = null;
    card?.addEventListener('touchstart', (event) => {
      const touch = event.touches[0];
      startX = touch ? touch.clientX : null;
      startY = touch ? touch.clientY : null;
    }, { passive: true });
    card?.addEventListener('touchend', (event) => {
      if (startX === null) return;
      const touch = event.changedTouches[0];
      const dx = touch ? touch.clientX - startX : 0;
      const dy = touch ? touch.clientY - startY : 0;
      startX = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) next(); else prev();
      }
    });

    const start = () => { seen = true; render(); };
    if (card && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        start();
      }, { threshold: 0.5 });
      observer.observe(card);
    } else {
      start();
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

  /* Contact form: here it only shows the confirmation. On the site it goes through the existing form handler. */
  const form = $('[data-js="contact-form"]');
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const sent = $('[data-js="form-sent"]', form);
    if (sent) sent.hidden = false;
  });
})();
