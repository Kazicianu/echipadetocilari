// The mobile picker enhances three complete, readable HTML plan cards.
const root = document.querySelector('.gads-page');
const picker = document.querySelector('.gads-plan-picker');
if (root && picker) {
  const tabs = [...picker.querySelectorAll('[role="tab"]')];
  const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
  if (tabs.length && panels.every(Boolean)) {
    let mobile = root.getBoundingClientRect().width <= 760;
    let selected = 0;
    const indicator = document.createElement('span');
    indicator.className = 'gads-plan-indicator';
    indicator.setAttribute('aria-hidden', 'true');
    picker.append(indicator);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    // Critical damping with a 0.3s response. Position and velocity survive a
    // new selection, so reversing direction never restarts from an endpoint.
    const frequency = 2 * Math.PI / 0.3;
    let position = 0;
    let velocity = 0;
    let target = 0;
    let frame = 0;
    let previousTime = 0;
    let rootWidth = root.getBoundingClientRect().width;
    let pickerWidth = 0;
    const paintIndicator = () => {
      indicator.style.transform = `translateX(${position}px)`;
    };
    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
      picker.dataset.moving = 'false';
    };
    const tick = time => {
      const elapsed = previousTime ? Math.min((time - previousTime) / 1000, 0.064) : 0;
      previousTime = time;
      const error = position - target;
      const decay = Math.exp(-frequency * elapsed);
      const adjustment = (velocity + frequency * error) * elapsed;
      position = target + (error + adjustment) * decay;
      velocity = (velocity - frequency * adjustment) * decay;
      if (Math.abs(position - target) < 0.1 && Math.abs(velocity) < 0.1) {
        position = target;
        velocity = 0;
        paintIndicator();
        frame = 0;
        previousTime = 0;
        picker.dataset.moving = 'false';
        return;
      }
      paintIndicator();
      frame = requestAnimationFrame(tick);
    };
    const moveIndicator = snap => {
      target = mobile ? tabs[selected].offsetLeft - tabs[0].offsetLeft : 0;
      if (snap || reducedMotion.matches || !mobile) {
        stop();
        position = target;
        velocity = 0;
        paintIndicator();
      } else if (!frame && Math.abs(position - target) >= 0.1) {
        picker.dataset.moving = 'true';
        frame = requestAnimationFrame(tick);
      }
    };
    const render = (snap = false) => {
      picker.hidden = !mobile;
      tabs.forEach((tab, index) => {
        const active = index === selected;
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
        panels[index].hidden = mobile && !active;
        if (mobile) {
          panels[index].setAttribute('role', 'tabpanel');
          panels[index].setAttribute('aria-labelledby', tab.id);
          panels[index].tabIndex = 0;
        } else {
          panels[index].removeAttribute('role');
          panels[index].removeAttribute('aria-labelledby');
          panels[index].removeAttribute('tabindex');
        }
      });
      moveIndicator(snap);
      picker.dataset.enhanced = 'true';
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => { selected = index; render(); });
      tab.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next === undefined) return;
        event.preventDefault();
        selected = next;
        render();
        tabs[next].focus();
      });
    });
    const resize = () => {
      const next = root.getBoundingClientRect().width <= 760;
      const nextRootWidth = root.getBoundingClientRect().width;
      const nextPickerWidth = picker.getBoundingClientRect().width;
      // Plan height changes must not cancel an in-progress indicator spring.
      if (next === mobile && nextRootWidth === rootWidth && nextPickerWidth === pickerWidth) return;
      const focusedTab = tabs.indexOf(document.activeElement);
      const focusedPanel = panels.findIndex(panel => panel.contains(document.activeElement));
      if (next && !mobile && focusedPanel >= 0) selected = focusedPanel;
      mobile = next;
      render(true);
      if (!mobile && focusedTab >= 0) {
        panels[focusedTab].querySelector('a,button,input,textarea,select')?.focus({ preventScroll: true });
      }
      rootWidth = nextRootWidth;
      pickerWidth = picker.getBoundingClientRect().width;
    };
    render(true);
    pickerWidth = picker.getBoundingClientRect().width;
    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(resize);
      observer.observe(root);
      observer.observe(picker);
    } else {
      window.addEventListener('resize', resize);
    }
    reducedMotion.addEventListener('change', () => moveIndicator(true));
  }
}

// The supplied hero background includes the header. Preserve the site's HTML
// landmarks and measure their combined surface, including font-load changes.
const header = document.querySelector('.elementor-location-header');
const heroSurface = root?.firstElementChild;
if (root && header && heroSurface) {
  const paintHero = () => {
    const height = header.getBoundingClientRect().height + heroSurface.getBoundingClientRect().height;
    document.body.style.setProperty('--gads-hero-surface-height', `${height}px`);
    document.body.dataset.gadsWide = String(root.getBoundingClientRect().width > 900);
    document.body.dataset.gadsHero = 'ready';
  };
  const observer = new ResizeObserver(paintHero);
  observer.observe(header);
  observer.observe(heroSurface);
  paintHero();
}
