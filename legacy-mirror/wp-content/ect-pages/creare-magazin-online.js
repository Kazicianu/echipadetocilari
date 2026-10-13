/* The shared shell owns navigation and the real contact form.
   This page script owns the illustrative phone, the FAQ character,
   the one-shot entrances and the pausing of loops that are off screen. */
(() => {
  const page = document.querySelector('.ect-page--creare-magazin-online');
  if (!page) return;

  const $ = (selector, root = page) => root.querySelector(selector);
  const $$ = (selector, root = page) => [...root.querySelectorAll(selector)];
  const english = document.documentElement.lang.toLowerCase().startsWith('en');
  const label = (ro, en) => english ? en : ro;
  const motionQuery = typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;
  let reduceMotion = motionQuery?.matches ?? false;
  const Observer = typeof window.IntersectionObserver === 'function'
    ? window.IntersectionObserver
    : null;
  /* Blocks whose loops are away from the viewport. Without
     IntersectionObserver it stays empty and every loop keeps running. */
  const offscreen = new Set();

  const visual = $('.mg-hero-visual');
  /* The story plays on the phone. Its wrapper has empty space above it,
     so the phone itself tells whether the hero is on screen. */
  const phone = $('.mg-phone') || visual;
  const screens = $$('[data-screen]');
  const dots = $$('[data-js="dot"]');
  let current = 0;
  let timer;
  let dueAt = 0;
  let held = 0;
  const now = () => window.performance?.now?.() ?? Date.now();

  const setIcons = (button, paused) => {
    if (!button) return;
    const play = $('[data-icon="play"]', button);
    const pause = $('[data-icon="pause"]', button);
    if (play) play.toggleAttribute('hidden', !paused);
    if (pause) pause.toggleAttribute('hidden', paused);
  };

  const renderPhone = () => {
    screens.forEach((screen, index) => { screen.hidden = index !== current; });
    dots.forEach((dot, index) => {
      const active = index === current;
      dot.setAttribute('aria-pressed', String(active));
      const marker = dot.firstElementChild;
      if (marker) {
        marker.style.width = active ? '26px' : '10px';
        marker.style.background = active ? 'var(--orange)' : 'var(--line-step)';
      }
    });
    visual?.classList.toggle('mg-phone-paused', reduceMotion || document.hidden);
  };

  /* A plain call starts a full interval and forgets any held remainder. */
  const schedulePhone = (delay = 3800) => {
    window.clearTimeout(timer);
    dueAt = 0;
    held = 0;
    if (reduceMotion || document.hidden || offscreen.has(visual) || screens.length < 2) return;
    dueAt = now() + delay;
    timer = window.setTimeout(() => {
      current = (current + 1) % screens.length;
      renderPhone();
      schedulePhone();
    }, delay);
  };

  /* Off screen the phone freezes mid-screen and keeps the time it had left,
     so the tap and the next screen stay in step when it comes back. */
  const holdPhone = () => {
    const away = offscreen.has(visual);
    const rest = away ? (dueAt ? Math.max(0, dueAt - now()) : 0) : held;
    visual.classList.toggle('mg-offscreen', away);
    schedulePhone(rest || 3800);
    if (away) held = rest;
  };

  dots.forEach((dot, index) => dot.addEventListener('click', () => {
    if (index >= screens.length) return;
    current = index;
    renderPhone();
    schedulePhone();
  }));

  const metro = $('.mg-metro');
  const renderMetro = () => {
    metro?.classList.toggle('mg-offscreen', offscreen.has(metro));
  };

  const mascot = $('[data-js="faq-mascot"]');
  const motionButton = $('[data-js="faq-motion"]');
  let faqPaused = reduceMotion;
  const renderFaq = () => {
    mascot?.classList.toggle('mg-paused', faqPaused || document.hidden || offscreen.has(mascot));
    if (motionButton) {
      motionButton.hidden = reduceMotion;
      motionButton.setAttribute('aria-label', faqPaused
        ? label('Pornește animația', 'Start the animation')
        : label('Oprește animația', 'Pause the animation'));
      motionButton.setAttribute('aria-pressed', String(faqPaused));
      setIcons(motionButton, faqPaused);
    }
  };
  motionButton?.addEventListener('click', () => {
    faqPaused = !faqPaused;
    renderFaq();
  });

  /* Loops run only while their block is near the viewport. */
  const loops = new Map([
    [visual, holdPhone],
    [metro, renderMetro],
    [mascot, renderFaq],
  ]);
  loops.delete(null);
  if (Observer && loops.size) {
    const watch = (entries) => {
      entries.forEach(({ target: seen, isIntersecting }) => {
        const target = seen === phone ? visual : seen;
        if (offscreen.has(target) === !isIntersecting) return;
        if (isIntersecting) offscreen.delete(target);
        else offscreen.add(target);
        loops.get(target)?.();
      });
    };
    /* The delivery line and the character start a little early. The phone
       tells a story, so it waits until it is really on screen. */
    const loopObserver = new Observer(watch, { rootMargin: '120px 0px' });
    const heroObserver = new Observer(watch);
    loops.forEach((render, node) => (node === visual ? heroObserver : loopObserver).observe(node === visual ? phone : node));
  }

  /* One-shot entrances. A block is hidden only after this script has run,
     while motion is allowed and the block is still below the viewport, so
     the content stays readable without JavaScript or with reduced motion. */
  const entrances = [
    '.mg-who__char', '.mg-who__head', '.mg-t3', '.mg-t3__cut',
    '.mg-metro__head', '.mg-metro__legend', '.mg-st__card',
    '.mg-proc__left > .ect-eyebrow', '.mg-proc__left > .ect-h2', '.mg-bento__tile',
    '.mg-receipt', '.mg-receipt__list > li', '.mg-receipt__total', '.mg-barcode', '.mg-barcode-code',
    '.mg-prices__title', '.mg-prices__sub', '.mg-prices__intro', '.mg-pcard',
    '.mg-scope__title', '.mg-scope__panel', '.mg-scope__notes',
    '.ect-home-faq__copy', '.ect-home-faq__mascot', '.ect-home-faq__item',
    '.ect-section-head', '.ect-card',
  ];
  /* The receipt and its lines print in a queue and a ticket's cut row
     follows its ticket, so neither joins the cascade of the other blocks. */
  const paper = $('.mg-receipt');
  const lines = new Set($$('.mg-receipt__list > li, .mg-receipt__total, .mg-barcode, .mg-barcode-code'));
  const cuts = new Set($$('.mg-t3__cut'));
  let printerFree = 0;
  let entranceObservers = [];

  const show = (target) => {
    target.classList.add('mg-in');
    entranceObservers.forEach(observer => observer.unobserve(target));
  };

  /* A released block is simply there, without an entrance. */
  const release = (target) => {
    target.classList.remove('mg-rv');
    entranceObservers.forEach(observer => observer.unobserve(target));
  };

  const enter = (entries) => {
    let step = 0;
    entries.forEach(({ target, isIntersecting, boundingClientRect }) => {
      if (!isIntersecting || !target.classList.contains('mg-rv') || target.classList.contains('mg-in')) return;
      const visible = boundingClientRect.bottom > 0;
      if (target === paper) {
        printerFree = now() + 250;
      } else if (lines.has(target)) {
        const wait = visible ? Math.max(0, Math.round(printerFree - now())) : 0;
        if (visible) printerFree = now() + wait + 160;
        target.style.setProperty('--mg-delay', `${wait}ms`);
      } else if (!cuts.has(target)) {
        target.style.setProperty('--mg-delay', `${visible ? Math.min(step, 7) * 80 : 0}ms`);
        if (visible) step += 1;
      }
      show(target);
    });
  };

  const armEntrances = () => {
    if (!Observer || reduceMotion) return;
    /* An address with a hash flies to its target. That is not a visitor
       reading down the page, so the blocks on the way are simply there. */
    let goal = null;
    try {
      goal = document.getElementById(decodeURIComponent(window.location?.hash.slice(1) ?? ''));
    } catch { /* A hash that is not valid percent-encoding names no block. */ }
    const fold = Math.max(window.innerHeight || 0, goal?.getBoundingClientRect().top ?? 0);
    /* A cut row waits only together with its ticket. A ticket that is
       already on screen stays cut, so its stub never jumps straight. */
    const below = node => node.getBoundingClientRect().top >= fold;
    const waiting = $$(entrances.join(', ')).filter(node => below(node)
      && (!cuts.has(node) || below(node.parentElement ?? node)));
    if (!waiting.length) return;
    /* A block enters once its top is 64px into the viewport, or as soon as
       all of it is on screen, so nothing readable rests invisible. The tall
       top margin also counts blocks the visitor jumped past. */
    entranceObservers = [
      new Observer(enter, { rootMargin: '100000px 0px -64px 0px' }),
      new Observer(entries => enter(entries.filter(entry => entry.intersectionRatio >= 0.99)), {
        rootMargin: '100000px 0px 0px 0px',
        threshold: 0.99,
      }),
    ];
    waiting.forEach((node) => {
      node.classList.add('mg-rv');
      entranceObservers.forEach(observer => observer.observe(node));
    });
    /* After a reload or a step through history the browser may still fly
       back to the old place. If the page moves before the visitor touches
       anything, the blocks on the way are simply there as well. */
    const arrival = window.performance?.getEntriesByType?.('navigation')[0]?.type;
    if ((arrival === 'reload' || arrival === 'back_forward') && !window.scrollY) {
      let touched = false;
      ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach((name) => {
        window.addEventListener(name, () => { touched = true; }, { capture: true, once: true, passive: true });
      });
      window.addEventListener('scroll', () => {
        if (!touched) $$('.mg-rv:not(.mg-in)').forEach(release);
      }, { once: true, passive: true });
    }
  };

  /* The browser flies to an in-page link and to the next Tab stop. It
     passes everything above that place, so those blocks are simply there
     instead of fading while they rush past. */
  const skipTo = (goal) => {
    const limit = goal.getBoundingClientRect().top;
    $$('.mg-rv:not(.mg-in)').forEach((node) => {
      if (node.getBoundingClientRect().top < limit) release(node);
    });
  };

  /* Keyboard focus can reach a block before it enters, and a focused
     control must never be invisible. */
  document.addEventListener('focusin', ({ target }) => {
    let node = target?.closest?.('.mg-rv:not(.mg-in)');
    while (node) {
      node.style.setProperty('--mg-delay', '0ms');
      show(node);
      node = node.parentElement?.closest('.mg-rv:not(.mg-in)');
    }
    if (target?.getBoundingClientRect) skipTo(target);
  });

  document.addEventListener('click', ({ target, button, ctrlKey, metaKey, shiftKey, altKey }) => {
    /* With a modifier key the link opens elsewhere and this tab stays put. */
    if (button || ctrlKey || metaKey || shiftKey || altKey) return;
    const link = target?.closest?.('a[href^="#"]');
    const goal = link && document.getElementById(link.getAttribute('href').slice(1));
    if (goal) skipTo(goal);
  });

  const dropEntrances = () => {
    entranceObservers.forEach(observer => observer.disconnect());
    entranceObservers = [];
    $$('.mg-rv').forEach(node => node.classList.remove('mg-rv', 'mg-in'));
  };

  const updateMotion = (event) => {
    reduceMotion = event.matches;
    /* The phone follows the system motion preference. The FAQ preserves
       its explicit pause until the visitor uses its own motion control. */
    if (reduceMotion) {
      faqPaused = true;
      dropEntrances();
    }
    renderPhone();
    renderFaq();
    schedulePhone();
  };
  if (motionQuery?.addEventListener) motionQuery.addEventListener('change', updateMotion);
  else motionQuery?.addListener?.(updateMotion);

  document.addEventListener('visibilitychange', () => {
    renderPhone();
    renderFaq();
    schedulePhone();
  });
  window.addEventListener('pagehide', () => window.clearTimeout(timer));
  window.addEventListener('pageshow', () => schedulePhone());
  renderPhone();
  renderFaq();
  schedulePhone();
  armEntrances();
})();
