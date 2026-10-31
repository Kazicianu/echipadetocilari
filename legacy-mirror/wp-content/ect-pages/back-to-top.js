/* Shows the fixed back-to-top arrow after one screen of scrolling; scripts/lib/back-to-top.mjs holds the rules. */
(() => {
  const root = document.documentElement;
  const update = () => root.classList.toggle('ect-scrolled', window.scrollY >= window.innerHeight);
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
