/* Interactiunile mockup-ului de articol: header, cuprins desktop/mobil, bara de progres si validare formular. */
(() => {
  const servicesBtn = document.querySelector('[data-js="services-toggle"]');
  const servicesMenu = document.getElementById('submeniu-servicii');
  const burgerBtn = document.querySelector('[data-js="menu-toggle"]');
  const mobileNav = document.getElementById('meniu-mobil');

  function setServices(open) {
    if (!servicesBtn || !servicesMenu) return;
    servicesBtn.setAttribute('aria-expanded', String(open));
    servicesMenu.hidden = !open;
  }

  function setMobileNav(open) {
    if (!burgerBtn || !mobileNav) return;
    burgerBtn.setAttribute('aria-expanded', String(open));
    burgerBtn.setAttribute('aria-label', open ? 'Închide meniul' : 'Deschide meniul');
    mobileNav.hidden = !open;
  }

  if (servicesBtn && servicesMenu) {
    servicesBtn.addEventListener('click', () => setServices(servicesBtn.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('click', (event) => {
      if (!servicesBtn.contains(event.target) && !servicesMenu.contains(event.target)) setServices(false);
    });
  }

  if (burgerBtn && mobileNav) {
    burgerBtn.addEventListener('click', () => setMobileNav(burgerBtn.getAttribute('aria-expanded') !== 'true'));
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setServices(false);
      setMobileNav(false);
    }
  });

  // Cuprins: deschis implicit pe desktop (>= 1025 px), colapsat pe mobil/tableta.
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

  // Evidentiere sectiune activa in cuprins
  const tocLinks = [...document.querySelectorAll('.art-toc a[href^="#"]')];
  const sections = tocLinks
    .map((a) => document.getElementById(a.getAttribute('href').slice(1)))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const byId = new Map(tocLinks.map((a) => [a.getAttribute('href').slice(1), a]));
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

  // Bara de progres al citirii (dezactivata la prefers-reduced-motion)
  const bar = document.querySelector('[data-js="read-progress"]');
  const article = document.querySelector('article');
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

  // Validare locala a formularului de contact (fara trimitere reala)
  const form = document.querySelector('[data-js="contact-form"]');
  const status = document.querySelector('[data-js="form-status"]');
  if (form && status) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.checkValidity()) {
        status.hidden = false;
        status.dataset.state = 'error';
        status.textContent = 'Completează câmpurile obligatorii (nume, email valid, telefon și mesaj).';
        form.querySelector(':invalid')?.focus();
        return;
      }
      status.hidden = false;
      status.dataset.state = 'success';
      status.textContent = 'Validare trecută (prototip local, mesajul nu a fost trimis).';
      form.reset();
    });
  }
})();
