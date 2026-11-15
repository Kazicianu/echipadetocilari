/* Shows the fixed back-to-top arrow after one screen of scrolling; scripts/lib/back-to-top.mjs holds the rules. */
(() => {
  const root = document.documentElement;
  const update = () => root.classList.toggle('ect-scrolled', window.scrollY >= window.innerHeight);
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();

  // The homepage portfolio carousel keeps its arrows in the corner the button covers.
  const muters = document.querySelectorAll('.ect-showcase');
  if (!muters.length || !('IntersectionObserver' in window)) return;
  const inside = new Set();
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => (entry.isIntersecting ? inside.add(entry.target) : inside.delete(entry.target)));
    root.classList.toggle('ect-top-muted', inside.size > 0);
  }, { rootMargin: '-80% 0px 0px 0px' });
  muters.forEach(el => observer.observe(el));
})();
