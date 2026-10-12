/* The shared shell owns navigation and the real contact form.
   This page script owns only the illustrative phone and FAQ character. */
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

  const visual = $('.mg-hero-visual');
  const screens = $$('[data-screen]');
  const dots = $$('[data-js="dot"]');
  let current = 0;
  let phonePaused = reduceMotion;
  let timer;

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
    visual?.classList.toggle('mg-phone-paused', phonePaused || document.hidden);
  };

  const schedulePhone = () => {
    window.clearTimeout(timer);
    if (phonePaused || document.hidden || screens.length < 2) return;
    timer = window.setTimeout(() => {
      current = (current + 1) % screens.length;
      renderPhone();
      schedulePhone();
    }, 3800);
  };

  dots.forEach((dot, index) => dot.addEventListener('click', () => {
    if (index >= screens.length) return;
    current = index;
    phonePaused = true;
    renderPhone();
    schedulePhone();
  }));

  const mascot = $('[data-js="faq-mascot"]');
  const motionButton = $('[data-js="faq-motion"]');
  let faqPaused = reduceMotion;
  const renderFaq = () => {
    mascot?.classList.toggle('mg-paused', faqPaused || document.hidden);
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

  const updateMotion = (event) => {
    reduceMotion = event.matches;
    /* A new request to reduce motion stops autoplay immediately. Removing
       that preference leaves it stopped; the screens remain manually selectable. */
    if (reduceMotion) {
      phonePaused = true;
      faqPaused = true;
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
  window.addEventListener('pageshow', schedulePhone);
  renderPhone();
  renderFaq();
  schedulePhone();
})();
