/* Interactions for the static copy of /creare-magazin-online/.
   The design canvas ran these through its own component state; this is the same behaviour in plain JS. */
(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  let reduceMotion = false;
  try { reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (error) { /* older browsers */ }

  /* Header: the "Servicii" dropdown and the mobile menu close each other. */
  const servicesButton = $('[data-js="services-toggle"]');
  const servicesMenu = $('#submeniu-servicii');
  const menuButton = $('[data-js="menu-toggle"]');
  const mobileMenu = $('#meniu-mobil');
  const setOpen = (button, panel, open) => {
    if (!button || !panel) return;
    button.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
  };
  servicesButton?.addEventListener('click', () => {
    setOpen(servicesButton, servicesMenu, servicesMenu.hidden);
    setOpen(menuButton, mobileMenu, false);
  });
  menuButton?.addEventListener('click', () => {
    setOpen(menuButton, mobileMenu, mobileMenu.hidden);
    setOpen(servicesButton, servicesMenu, false);
  });

  /* Hero phone: four screens that change every 3.8 s. A dot shows one screen and stops the change;
     the round button stops or restarts it. Reduced motion starts it stopped. */
  const screens = $$('[data-screen]');
  const dots = $$('[data-js="dot"]');
  const pauseButton = $('[data-js="phone-pause"]');
  let current = 0;
  let phonePaused = reduceMotion;
  const renderPhone = () => {
    screens.forEach((screen, index) => { screen.hidden = index !== current; });
    dots.forEach((dot, index) => {
      const active = index === current;
      dot.setAttribute('aria-pressed', String(active));
      dot.firstElementChild.style.width = active ? '26px' : '10px';
      dot.firstElementChild.style.background = active ? 'var(--orange-deep)' : 'var(--line-step)';
    });
    if (pauseButton) {
      pauseButton.setAttribute('aria-label', phonePaused ? 'Pornește schimbarea ecranelor' : 'Oprește schimbarea ecranelor');
      $('[data-icon="play"]', pauseButton).hidden = !phonePaused;
      $('[data-icon="pause"]', pauseButton).hidden = phonePaused;
    }
  };
  dots.forEach((dot, index) => dot.addEventListener('click', () => {
    current = index;
    phonePaused = true;
    renderPhone();
  }));
  pauseButton?.addEventListener('click', () => {
    phonePaused = !phonePaused;
    renderPhone();
  });
  if (screens.length > 1) {
    setInterval(() => {
      if (phonePaused || document.hidden) return;
      current = (current + 1) % screens.length;
      renderPhone();
    }, 3800);
  }
  renderPhone();

  /* FAQ character: the floating question marks stop with the button, or from the start with reduced motion. */
  const mascot = $('[data-js="faq-mascot"]');
  const motionButton = $('[data-js="faq-motion"]');
  let faqPaused = reduceMotion;
  const renderFaq = () => {
    mascot?.classList.toggle('mg-paused', faqPaused);
    if (motionButton) {
      motionButton.setAttribute('aria-label', faqPaused ? 'Pornește animația' : 'Oprește animația');
      $('[data-icon="play"]', motionButton).hidden = !faqPaused;
      $('[data-icon="pause"]', motionButton).hidden = faqPaused;
    }
  };
  motionButton?.addEventListener('click', () => {
    faqPaused = !faqPaused;
    renderFaq();
  });
  renderFaq();

  /* Contact form: here it only shows the confirmation. On the site it goes through the existing form handler. */
  const form = $('[data-js="contact-form"]');
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const sent = $('[data-js="form-sent"]', form);
    if (sent) sent.hidden = false;
  });
})();
