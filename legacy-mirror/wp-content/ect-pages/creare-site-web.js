/* Page script for /creare-site-web/: the site type tabs and keyboard access to the lists that scroll sideways on a phone.
   The shared shell owns navigation and the contact form. Without this script every panel shows (see the scripting: none rule in the CSS). */
(() => {
  const page = document.querySelector('.ect-page--creare-site-web');
  if (!page) return;

  const reduceMotion = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Tabs, following the WAI-ARIA tabs pattern with automatic activation. */
  const tablist = page.querySelector('.csw-tabs[role="tablist"]');
  if (tablist) {
    const tabs = [...tablist.querySelectorAll('[role="tab"]')];
    const panelOf = (tab) => document.getElementById(tab.getAttribute('aria-controls'));

    const reveal = (tab) => {
      if (tablist.scrollWidth <= tablist.clientWidth + 1) return;
      const bar = tablist.getBoundingClientRect();
      const box = tab.getBoundingClientRect();
      const left = box.left - bar.left + tablist.scrollLeft - (bar.width - box.width) / 2;
      tablist.scrollTo({ left: Math.max(0, left), behavior: reduceMotion ? 'auto' : 'smooth' });
    };

    const select = (tab, { focus = false } = {}) => {
      tabs.forEach((item) => {
        const on = item === tab;
        item.setAttribute('aria-selected', String(on));
        item.tabIndex = on ? 0 : -1;
        const panel = panelOf(item);
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
      reveal(tab);
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
    if (current) select(current);
  }

  /* A list that scrolls sideways needs a keyboard stop of its own, but only while it really overflows. */
  const scrollers = [...page.querySelectorAll('[data-csw-scroll]')];
  const syncScroller = (el) => {
    if (el.scrollWidth > el.clientWidth + 1) el.setAttribute('tabindex', '0');
    else el.removeAttribute('tabindex');
  };
  const syncAll = () => scrollers.forEach(syncScroller);
  if (typeof window.ResizeObserver === 'function') {
    const observer = new window.ResizeObserver((entries) => entries.forEach((entry) => syncScroller(entry.target)));
    scrollers.forEach((el) => observer.observe(el));
  } else {
    window.addEventListener('resize', syncAll);
  }
  syncAll();
})();
