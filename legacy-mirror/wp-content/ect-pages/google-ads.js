// The mobile picker enhances three complete, readable HTML plan cards.
const root = document.querySelector('.gads-page');
const picker = document.querySelector('.gads-plan-picker');
if (picker) {
  const tabs = [...picker.querySelectorAll('[role="tab"]')];
  const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
  let mobile = root.getBoundingClientRect().width <= 760;
  let selected = 0;
  const render = () => {
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
  new ResizeObserver(() => {
    const next = root.getBoundingClientRect().width <= 760;
    if (next === mobile) return;
    mobile = next;
    render();
  }).observe(root);
  render();
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
