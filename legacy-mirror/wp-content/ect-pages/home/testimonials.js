(() => {
  'use strict';
  const root = document.querySelector('[data-ect-quotes]');
  if (!root || root.dataset.ready) return;
  root.dataset.ready = '1';

  const viewport = root.querySelector('[data-ect-quotes-viewport]');
  const track = root.querySelector('[data-ect-quotes-track]');
  if (!viewport || !track ) return;

  const originals = [...track.children];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 1025px)');

  function active() {
    return root.classList.contains('is-marquee');
  }

  function enable() {
    if (active()) return;
    for (let round = 0; round < 3; round += 1) {
      for (const li of originals) {
        const clone = li.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        clone.inert = true;
        clone.setAttribute('data-ect-quotes-clone', '');
        clone.removeAttribute('id');
        clone.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
        track.append(clone);
      }
    }
    root.classList.add('is-marquee');
    viewport.removeAttribute('tabindex');
    update();
  }

  function disable() {
    track.querySelectorAll('[data-ect-quotes-clone]').forEach(node => node.remove());
    root.classList.remove('is-marquee');
    viewport.setAttribute('tabindex', '0');
    track.style.removeProperty('--ect-quotes-duration');
  }

  function update() {
    if (!active()) return;
    const speed = desktop.matches ? 60 : 40;
    const distance = track.scrollWidth / 2;
    if (distance > 0) {
      track.style.setProperty('--ect-quotes-duration', (distance / speed).toFixed(2) + 's');
    }
  }

  function sync() {
    if (reduce.matches) disable();
    else enable();
  }

  sync();
  reduce.addEventListener('change', sync);
  desktop.addEventListener('change', update);

  if (typeof ResizeObserver === 'function') {
    let frame = 0;
    new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    }).observe(viewport);
  }

})();
