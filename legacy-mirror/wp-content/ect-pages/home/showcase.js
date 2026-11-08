(() => {
  const roots = [...document.querySelectorAll('[data-ect-carousel]')];
  if (!roots.length) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const canModal = typeof HTMLDialogElement === 'function' && typeof HTMLDialogElement.prototype.showModal === 'function';
  const closeDelay = 350;
  // Only one modal dialog can be open at a time, so the page lock is shared.
  let active = null;

  function behavior() {
    return reduced.matches ? 'auto' : 'smooth';
  }

  function revealCard(card) {
    const scroller = card.closest('[data-ect-carousel-scroller]');
    const item = card.closest('[data-ect-carousel-item]');
    if (!scroller || !item) return;
    const itemRect = item.getBoundingClientRect();
    const scrollerRect = scroller.getBoundingClientRect();
    if (itemRect.left >= scrollerRect.left && itemRect.right <= scrollerRect.right) return;
    scroller.scrollTo({
      left: scroller.scrollLeft + (itemRect.left - scrollerRect.left) - 16,
      behavior: behavior(),
    });
  }

  function finish() {
    const state = active;
    if (!state) return;
    active = null;
    clearTimeout(state.timer);
    cancelAnimationFrame(state.frame);
    state.dialog.removeEventListener('transitionend', state.onEnd);
    if (state.dialog.open) state.dialog.close();
    document.body.style.cssText = state.bodyStyle;
    window.scrollTo({ top: state.scrollY, left: 0, behavior: 'instant' });
    const opts = state.opts || { card: true };
    if (opts.card) {
      state.card.focus({ preventScroll: true });
      revealCard(state.card);
    }
    if (opts.hash) {
      let target = null;
      try { target = document.querySelector(opts.hash); } catch (error) { target = null; }
      target?.scrollIntoView({ behavior: behavior(), block: 'start' });
      history.replaceState(null, '', opts.hash);
    }
  }

  function requestClose(opts) {
    const state = active;
    if (!state || state.closing) return;
    state.closing = true;
    state.opts = opts;
    cancelAnimationFrame(state.frame);
    state.dialog.classList.remove('is-open');
    if (reduced.matches) { finish(); return; }
    state.onEnd = event => {
      if (event.target === state.dialog && event.propertyName === 'opacity') finish();
    };
    state.dialog.addEventListener('transitionend', state.onEnd);
    state.timer = setTimeout(finish, closeDelay);
  }

  function openModal(dialog, card) {
    if (active || dialog.open) return;
    const state = {
      dialog, card, closing: false, opts: null, timer: 0, frame: 0, onEnd: null,
      scrollY: window.scrollY, bodyStyle: document.body.style.cssText,
    };
    active = state;
    Object.assign(document.body.style, { position: 'fixed', top: `${-state.scrollY}px`, width: '100%', overflow: 'hidden' });
    dialog.showModal();
    (dialog.querySelector('button[data-ect-modal-close]') || dialog).focus({ preventScroll: true });
    state.frame = requestAnimationFrame(() => {
      state.frame = requestAnimationFrame(() => dialog.classList.add('is-open'));
    });
  }

  function bindDialog(dialog) {
    if (dialog.dataset.ectModalBound) return;
    dialog.dataset.ectModalBound = '1';
    dialog.addEventListener('cancel', event => {
      event.preventDefault();
      requestClose({ card: true });
    });
    // A forced close (a second Escape without interaction) must still release the page.
    dialog.addEventListener('close', () => {
      if (active && active.dialog === dialog) finish();
    });
    dialog.addEventListener('click', event => {
      if (event.target === dialog) requestClose({ card: true });
    });
    dialog.querySelectorAll('[data-ect-modal-close]').forEach(control => {
      control.addEventListener('click', event => {
        const href = control.tagName === 'A' ? control.getAttribute('href') : null;
        if (href && href.startsWith('#') && href.length > 1) {
          // Elementor delegates anchor clicks on the document; keep it out of this one.
          event.preventDefault();
          event.stopPropagation();
          requestClose({ card: false, hash: href });
          return;
        }
        requestClose({ card: true });
      });
    });
  }

  function init(root) {
    const scroller = root.querySelector('[data-ect-carousel-scroller]');
    if (!scroller) return;
    const controls = root.querySelector('[data-ect-carousel-controls]');
    const prev = root.querySelector('[data-ect-carousel-prev]');
    const next = root.querySelector('[data-ect-carousel-next]');

    root.querySelectorAll('[data-ect-carousel-item]').forEach((item, index) => {
      item.style.setProperty('--i', index);
    });

    if (!reduced.matches && 'IntersectionObserver' in window) {
      root.classList.add('is-armed');
      const reveal = () => {
        root.classList.add('is-revealed');
        observer.disconnect();
        root.removeEventListener('focusin', reveal);
      };
      const observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) reveal();
      }, { threshold: 0.15 });
      observer.observe(root);
      root.addEventListener('focusin', reveal);
    }

    function update() {
      if (!prev || !next) return;
      const focused = document.activeElement;
      prev.disabled = scroller.scrollLeft <= 0;
      next.disabled = scroller.scrollLeft >= scroller.scrollWidth - scroller.clientWidth - 1;
      if (focused === prev && prev.disabled && !next.disabled) next.focus({ preventScroll: true });
      else if (focused === next && next.disabled && !prev.disabled) prev.focus({ preventScroll: true });
    }

    root.querySelectorAll('img.ect-carousel-card__img').forEach(img => {
      if (img.complete) return;
      img.classList.add('is-loading');
      const done = () => { img.classList.remove('is-loading'); update(); };
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
    });

    if (prev && next) {
      prev.addEventListener('click', () => scroller.scrollBy({ left: -300, behavior: behavior() }));
      next.addEventListener('click', () => scroller.scrollBy({ left: 300, behavior: behavior() }));
      scroller.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update);
      if (controls) controls.hidden = false;
      update();
    }

    if (!canModal) return;
    root.querySelectorAll('[data-ect-card]').forEach(card => {
      const dialog = document.getElementById(card.dataset.ectCard);
      if (!dialog) return;
      bindDialog(dialog);
      card.addEventListener('click', () => openModal(dialog, card));
    });
  }

  roots.forEach(init);
})();
