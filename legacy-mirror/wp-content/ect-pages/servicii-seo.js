/* Page script for /servicii-seo/: the GPTBot switch and the monthly report parts.
   The markup already holds all the content: without this script the first report part stays visible. */
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
