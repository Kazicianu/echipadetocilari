/* Page script for /creare-site-web/: the package comparison tabs, the contact message prefill and the FAQ accordion fallback.
   The shared shell owns navigation and the contact form. Without this script the full comparison table scrolls sideways (see the CSS). */
(() => {
  'use strict';

  const page = document.querySelector('.ect-page--creare-site-web');
  if (!page) return;

  const callBar = page.querySelector('.csw-sticky');
  if (callBar && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      callBar.toggleAttribute('data-offscreen', !entry.isIntersecting);
    });
    observer.observe(callBar);
  }

  /* Package comparison: WAI-ARIA tabs with automatic activation. The CSS shows one column per data-active value. */
  const cmp = page.querySelector('.csw-cmp');
  const tablist = cmp && cmp.querySelector('.csw-cmp__tabs[role="tablist"]');
  if (cmp && tablist) {
    const tabs = [...tablist.querySelectorAll('.csw-cmp__tab[role="tab"][data-p]')];
    const panel = cmp.querySelector('#csw-cmp-panel[role="tabpanel"]');

    const select = (tab, { focus = false } = {}) => {
      tabs.forEach((item) => {
        const on = item === tab;
        item.setAttribute('aria-selected', String(on));
        item.tabIndex = on ? 0 : -1;
      });
      cmp.setAttribute('data-active', tab.getAttribute('data-p'));
      if (panel && tab.id) panel.setAttribute('aria-labelledby', tab.id);
      if (focus) tab.focus();
    };

    if (tabs.length) {
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

      const current = tabs.find((tab) => tab.getAttribute('aria-selected') === 'true')
        || tabs.find((tab) => tab.getAttribute('data-p') === 'b')
        || tabs[0];
      select(current);
    }
  }

  /* Package buttons prefill the contact message, unless the visitor already wrote something of their own. */
  let lastPrefill = '';
  page.querySelectorAll('a.csw-pcard__cta[data-prefill]').forEach((link) => {
    link.addEventListener('click', () => {
      const field = document.getElementById('form-field-message1');
      const text = link.getAttribute('data-prefill');
      if (!field || !text) return;
      if (field.value.trim() !== '' && field.value !== lastPrefill) return;
      field.value = text;
      lastPrefill = text;
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
    });
  });

  /* Browsers without exclusive details groups (name attribute): keep one FAQ answer open at a time. */
  if (!('name' in HTMLDetailsElement.prototype)) {
    page.addEventListener('toggle', (event) => {
      const item = event.target;
      if (!(item instanceof HTMLDetailsElement) || !item.open || !item.name) return;
      page.querySelectorAll('details[name]').forEach((other) => {
        if (other !== item && other.open && other.name === item.name) other.open = false;
      });
    }, true);
  }
})();
