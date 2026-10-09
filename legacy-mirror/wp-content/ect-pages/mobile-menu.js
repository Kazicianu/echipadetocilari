(() => {
  const dialog = document.getElementById('ect-mobile-menu');
  const button = document.querySelector('.ect-mobile-menu-toggle');
  const slot = document.querySelector('.ect-mobile-menu-slot');
  if (!dialog || !button || !slot || typeof dialog.showModal !== 'function') return;
  const panel = dialog.querySelector('.ect-mobile-menu-panel');
  const nav = dialog.querySelector('.ect-mobile-menu-nav');
  const links = [...dialog.querySelectorAll('.ect-mobile-menu-link')];
  const footer = [...dialog.querySelectorAll('.ect-mobile-menu-footer-link')];
  const lines = [...button.querySelectorAll('.ect-mobile-menu-icon > span')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia(document.body.classList.contains('elementor-page-3410') ? '(max-width: 1024px)' : '(max-width: 767px)');
  let animations = [];
  let opened = false;
  let navigation = null;
  let scrollPosition = 0;
  let previousBodyStyle = '';

  // The reference uses GSAP's quartic and back curves. Sample those exact
  // polynomials into WAAPI tracks, keeping its shape with a faster reverse path.
  const power3InOut = t => t < .5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2;
  const backOut = t => { const q = t - 1; return 1 + 2.2 * q ** 3 + 1.2 * q ** 2; };
  const power2Out = t => 1 - (1 - t) ** 3;
  const duration = Math.max(500, 325 + Math.max(0, links.length - 1) * 35, 450 + Math.max(0, footer.length - 1) * 35);
  const closeDuration = 300;

  function keyframes(start, length, ease, values) {
    const frames = [];
    if (start > 0) frames.push({ ...values(0), offset: 0 });
    for (let step = 0; step <= 120; step++) {
      frames.push({ ...values(ease(step / 120)), offset: (start + length * step / 120) / duration });
    }
    if (start + length < duration) frames.push({ ...values(1), offset: 1 });
    return frames;
  }

  function track(element, start, length, ease, values) {
    const animation = element.animate(keyframes(start, length, ease, values), { duration, easing: 'linear', fill: 'both' });
    animation.pause();
    animation.currentTime = 0;
    animations.push(animation);
    return animation;
  }

  function layoutMenu() {
    const rect = slot.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    const top = Math.max(16, rect.top);
    const width = Math.max(buttonRect.width, Math.min(460, innerWidth - 40));
    const left = (innerWidth - width) / 2; // Equal space-20 design-system gutters on phones.
    const height = Math.max(buttonRect.height, Math.min(800, (window.visualViewport?.height || innerHeight) - top - 16));
    Object.assign(dialog.style, { top: `${top}px`, left: `${left}px`, width: `${width}px`, height: `${height}px` });
    return {
      width, height, buttonWidth: buttonRect.width, buttonHeight: buttonRect.height,
      buttonLeft: rect.left - left, buttonTop: rect.top - top, buttonRight: left + width - rect.right,
    };
  }

  function panelValues({ height, buttonHeight, buttonLeft, buttonTop, buttonRight }) {
    return progress => ({
      clipPath: `inset(${buttonTop * (1 - progress)}px ${buttonRight * (1 - progress)}px ${(height - buttonTop - buttonHeight) * (1 - progress)}px ${buttonLeft * (1 - progress)}px round ${200 - 176 * progress}px)`,
    });
  }

  function buttonValues({ width, buttonWidth, buttonLeft, buttonTop }) {
    const startX = buttonLeft - (width - buttonWidth);
    return progress => ({
      transform: `translate(${startX * (1 - progress) - 24 * progress}px, ${buttonTop * (1 - progress) + 24 * progress}px)`,
    });
  }

  function buildTimeline() {
    animations.forEach(animation => animation.cancel());
    animations = [];
    const geometry = layoutMenu();
    // Span the full clock so reversing never waits on an expanded-panel plateau.
    track(panel, 0, duration, power3InOut, panelValues(geometry));
    track(button, 0, duration, power3InOut, buttonValues(geometry));
    lines.forEach((line, index) => track(line, 0, 200, power3InOut, progress => ({
      transform: `translateY(${(index ? 3.45 : -3.45) * (1 - progress)}px) rotate(${(index ? -45 : 45) * progress}deg)`,
    })));
    track(nav, 40, 100, t => t, progress => ({ opacity: progress }));
    links.forEach((link, index) => track(link, 100 + index * 35, 225, backOut, progress => ({
      transform: `perspective(300px) translate(${-20 * (1 - progress)}px, ${80 * (1 - progress)}px)`,
      opacity: Math.max(0, Math.min(1, progress)),
    })));
    footer.forEach((link, index) => track(link, 250 + index * 35, 200, power2Out, progress => ({
      transform: `translateY(${20 * (1 - progress)}px)`, opacity: progress,
    })));
    animations[0].onfinish = () => { if (!opened) finishClose(); };
  }

  function resizeMenu() {
    if (!dialog.open) return;
    if (!mobile.matches) { setOpen(false, true); return; }
    // Update the reveal geometry without restarting its clock or moving focus.
    const geometry = layoutMenu();
    animations[0].effect.setKeyframes(keyframes(0, duration, power3InOut, panelValues(geometry)));
    animations[1].effect.setKeyframes(keyframes(0, duration, power3InOut, buttonValues(geometry)));
  }

  function finishClose() {
    if (!dialog.open) return;
    const destination = navigation;
    navigation = null;
    animations.forEach(animation => animation.cancel());
    animations = [];
    slot.append(button);
    dialog.close();
    document.body.style.cssText = previousBodyStyle;
    window.scrollTo(0, scrollPosition);
    button.focus({ preventScroll: true });
    if (destination) window.location.assign(destination);
  }

  function setOpen(next, instant = reduced.matches) {
    if (next && !mobile.matches) return;
    opened = next;
    button.setAttribute('aria-expanded', String(next));
    button.setAttribute('aria-label', next ? button.dataset.closeLabel : button.dataset.openLabel);
    if (next && !dialog.open) {
      scrollPosition = window.scrollY;
      previousBodyStyle = document.body.style.cssText;
      Object.assign(document.body.style, { position: 'fixed', top: `${-scrollPosition}px`, width: '100%', overflow: 'hidden' });
      buildTimeline();
      dialog.append(button);
      dialog.showModal();
      button.focus({ preventScroll: true });
    }
    if (!dialog.open) return;
    nav.inert = !next;
    if (next) {
      navigation = null;
      animations.forEach(animation => {
        animation.playbackRate = 1;
        if (instant) { animation.pause(); animation.currentTime = duration; }
        else animation.play();
      });
    } else if (instant) {
      finishClose();
    } else {
      // A negative-rate play at time zero would rewind to the end in WAAPI.
      if ((animations[0]?.currentTime || 0) <= 0) { finishClose(); return; }
      // All tracks share a clock, so interrupted toggles reverse the same frame.
      animations.forEach(animation => { animation.playbackRate = -duration / closeDuration; animation.play(); });
    }
  }

  button.addEventListener('click', () => setOpen(!opened));
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    // A keyboard user must never land on a link still hidden by the reveal.
    if (opened) animations.forEach(animation => { animation.pause(); animation.currentTime = duration; });
    const controls = opened ? [button, ...links, ...footer] : [button];
    const index = controls.indexOf(document.activeElement);
    const next = (index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length;
    event.preventDefault();
    controls[next].focus({ preventScroll: controls[next] === button });
  });
  dialog.addEventListener('cancel', event => { event.preventDefault(); setOpen(false); });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) setOpen(false);
  });
  nav.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === '_blank') return;
    event.preventDefault();
    navigation = link.href;
    setOpen(false);
  });
  mobile.addEventListener('change', resizeMenu);
  reduced.addEventListener('change', () => { if (dialog.open) setOpen(opened, true); });
  window.addEventListener('resize', resizeMenu);
  window.visualViewport?.addEventListener('resize', resizeMenu);
  document.querySelectorAll('.elementor-3359 nav.elementor-nav-menu--dropdown').forEach(fallback => {
    fallback.inert = true;
    fallback.setAttribute('aria-hidden', 'true');
  });
  document.body.classList.add('ect-mobile-menu-ready');
})();
