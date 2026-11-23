/* Page script for /servicii-seo/: the GPTBot switch.
   The markup already holds all the content: without this script the switch keeps its default state. */
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
})();
