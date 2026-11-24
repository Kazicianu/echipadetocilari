/* Interactiunile paginilor de articol (/blog/[slug]/): cuprins responsiv, sectiune activa si bara de progres. */
(() => {
  const toc = document.querySelector('[data-js="art-toc"]');
  const mqDesktop = window.matchMedia('(min-width: 1025px)');

  function syncToc() {
    if (!toc) return;
    toc.open = mqDesktop.matches;
  }

  syncToc();
  mqDesktop.addEventListener('change', syncToc);

  if (toc) {
    const summary = toc.querySelector('summary');
    summary?.addEventListener('click', (event) => {
      if (mqDesktop.matches) event.preventDefault();
    });
  }

  const tocLinks = [...document.querySelectorAll('.art-toc a[href^="#"]')];
  const sections = tocLinks
    .map((link) => document.getElementById(link.getAttribute('href').slice(1)))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const byId = new Map(tocLinks.map((link) => [link.getAttribute('href').slice(1), link]));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          for (const link of tocLinks) link.classList.remove('is-active');
          byId.get(entry.target.id)?.classList.add('is-active');
        }
      },
      { rootMargin: '-12% 0px -70% 0px', threshold: 0 }
    );
    for (const sec of sections) observer.observe(sec);
    tocLinks[0]?.classList.add('is-active');
  }

  const bar = document.querySelector('[data-js="read-progress"]');
  const article = document.querySelector('main article');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  function updateProgress() {
    if (!bar || !article || reduced.matches) return;
    const rect = article.getBoundingClientRect();
    const total = Math.max(1, article.offsetHeight - window.innerHeight * 0.65);
    const done = Math.min(1, Math.max(0, -rect.top / total));
    bar.style.transform = `scaleX(${done.toFixed(4)})`;
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });
  updateProgress();
})();
