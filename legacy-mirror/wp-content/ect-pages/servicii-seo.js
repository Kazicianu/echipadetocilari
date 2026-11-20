/* Page script for /servicii-seo/: the AI assistant tabs, the GPTBot switch and the monthly report parts.
   The markup already holds all the content: without this script the first tab and the first report part stay visible. */
(() => {
  const page = document.querySelector('.ect-page--servicii-seo');
  if (!page) return;

  /* Tabs, following the WAI-ARIA tabs pattern with automatic activation. */
  const tablist = page.querySelector('.seo-tabs[role="tablist"]');
  if (tablist) {
    const tabs = [...tablist.querySelectorAll('[role="tab"]')];
    const panelOf = (tab) => document.getElementById(tab.getAttribute('aria-controls'));

    const select = (tab, { focus = false, animate = true } = {}) => {
      tabs.forEach((item) => {
        const on = item === tab;
        item.setAttribute('aria-selected', String(on));
        item.tabIndex = on ? 0 : -1;
        const panel = panelOf(item);
        if (!panel) return;
        panel.hidden = !on;
        panel.classList.remove('is-in');
        if (on && animate) {
          panel.classList.add('is-in');
          panel.addEventListener('animationend', () => panel.classList.remove('is-in'), { once: true });
        }
      });
      if (focus) tab.focus();
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', (event) => {
        const last = tabs.length - 1;
        let next = null;
        if (event.key === 'ArrowRight') next = index === last ? 0 : index + 1;
        else if (event.key === 'ArrowLeft') next = index === 0 ? last : index - 1;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = last;
        if (next === null) return;
        event.preventDefault();
        select(tabs[next], { focus: true });
      });
    });

    const current = tabs.find((tab) => tab.getAttribute('aria-selected') === 'true') || tabs[0];
    if (current) select(current, { animate: false });
  }

  /* The only switch that is a real choice: GPTBot. The labels come from the markup, so they can be translated there. */
  const gpt = page.querySelector('[data-seo-gpt]');
  if (gpt) {
    const label = page.querySelector('[data-seo-gpt-label]');
    gpt.addEventListener('click', () => {
      const on = gpt.getAttribute('aria-checked') !== 'true';
      gpt.setAttribute('aria-checked', String(on));
      gpt.classList.toggle('is-on', on);
      if (label) label.textContent = gpt.getAttribute(on ? 'data-on' : 'data-off') || label.textContent;
    });
  }

  /* Monthly report: pick a part to see its example in the preview. */
  const keys = [...page.querySelectorAll('[data-seo-key]')];
  const parts = [...page.querySelectorAll('.seo-doc .seo-dsec')];
  if (keys.length && keys.length === parts.length) {
    const pick = (index) => {
      keys.forEach((key, i) => {
        const on = i === index;
        key.setAttribute('aria-pressed', String(on));
        key.classList.toggle('is-on', on);
        parts[i].classList.toggle('is-on', on);
        const example = parts[i].querySelector('p');
        if (example) example.hidden = !on;
      });
    };
    keys.forEach((key, i) => {
      const choose = () => pick(i);
      key.addEventListener('click', choose);
      key.addEventListener('focus', choose);
      key.addEventListener('mouseenter', choose);
    });
  }
})();
