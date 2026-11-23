/* Page script for /servicii-seo/: the GPTBot switch and the work plan tabs.
   The markup already holds all the content: without this script the switch keeps its default state
   and every phase of the plan shows (see the scripting: none rule in the CSS). */
(() => {
  const page = document.querySelector('.ect-page--servicii-seo');
  if (!page) return;

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

  /* The work plan shows one phase at a time: WAI-ARIA tabs with automatic activation.
     The tabs sit in a row on phones and tablets and in a column from 1025px, and the arrow keys follow that. */
  const tablist = page.querySelector('[data-seo-tabs] [role="tablist"]');
  if (tablist) {
    const tabs = [...tablist.querySelectorAll('[role="tab"]')];
    const panelOf = (tab) => document.getElementById(tab.getAttribute('aria-controls'));
    const column = typeof window.matchMedia === 'function' ? window.matchMedia('(min-width: 1025px)') : null;
    const orient = () => tablist.setAttribute('aria-orientation', column && column.matches ? 'vertical' : 'horizontal');

    const select = (tab, { focus = false } = {}) => {
      tabs.forEach((item) => {
        const on = item === tab;
        item.setAttribute('aria-selected', String(on));
        item.tabIndex = on ? 0 : -1;
        const panel = panelOf(item);
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', (event) => {
        const last = tabs.length - 1;
        const vertical = tablist.getAttribute('aria-orientation') === 'vertical';
        let next = null;
        if (event.key === 'ArrowRight' || (vertical && event.key === 'ArrowDown')) next = index === last ? 0 : index + 1;
        else if (event.key === 'ArrowLeft' || (vertical && event.key === 'ArrowUp')) next = index === 0 ? last : index - 1;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = last;
        if (next === null) return;
        event.preventDefault();
        select(tabs[next], { focus: true });
      });
    });

    orient();
    if (column && typeof column.addEventListener === 'function') column.addEventListener('change', orient);
    const current = tabs.find((tab) => tab.getAttribute('aria-selected') === 'true') || tabs[0];
    if (current) select(current);
  }
})();
