(() => {
  const roots = [...document.querySelectorAll('[data-ect-carousel]')];
  if (!roots.length) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  function behavior() {
    return reduced.matches ? 'auto' : 'smooth';
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
      // Move by whole cards so the row always lands where the first card started.
      const items = [...root.querySelectorAll('[data-ect-carousel-item]')];
      const step = dir => {
        const pitch = items.length > 1 ? items[1].offsetLeft - items[0].offsetLeft : scroller.clientWidth;
        const index = Math.round(scroller.scrollLeft / pitch) + dir;
        scroller.scrollTo({ left: Math.max(0, index * pitch), behavior: behavior() });
      };
      prev.addEventListener('click', () => step(-1));
      next.addEventListener('click', () => step(1));
      scroller.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update);
      if (controls) controls.hidden = false;
      update();
    }
  }

  roots.forEach(init);
})();
