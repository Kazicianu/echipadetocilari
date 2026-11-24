/* Interactiunile prototipului /blog/: submeniu Servicii, meniu mobil, filtrare, cautare si validare formular. */
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
    servicesBtn.addEventListener('click', () => {
      const next = servicesBtn.getAttribute('aria-expanded') !== 'true';
      setServices(next);
    });
    document.addEventListener('click', (event) => {
      if (!servicesBtn.contains(event.target) && !servicesMenu.contains(event.target)) {
        setServices(false);
      }
    });
  }

  if (burgerBtn && mobileNav) {
    burgerBtn.addEventListener('click', () => {
      const next = burgerBtn.getAttribute('aria-expanded') !== 'true';
      setMobileNav(next);
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setServices(false);
      setMobileNav(false);
    }
  });

  // Filtrare pe categorii + cautare instant (articolele raman toate in HTML static).
  const filterBtns = [...document.querySelectorAll('[data-filter]')];
  const cards = [...document.querySelectorAll('[data-js="blog-grid"] .bl-card')];
  const searchInput = document.querySelector('[data-js="blog-search"]');
  const searchClear = document.querySelector('[data-js="search-clear"]');
  const statusEl = document.querySelector('[data-js="blog-status"]');
  const resetBtn = document.querySelector('[data-js="filter-reset"]');
  const emptyBox = document.querySelector('[data-js="blog-empty"]');
  const emptyReset = document.querySelector('[data-js="empty-reset"]');
  const paginationEl = document.querySelector('[data-js="blog-pagination"]');

  const LABELS = {
    toate: 'toate temele',
    'creare-site-web': 'Creare site web',
    'magazin-online': 'Magazin online',
    aplicatii: 'Aplicații',
    'seo-ai': 'SEO și AI',
    'google-ads': 'Google Ads',
    'facebook-ads': 'Facebook și Instagram Ads',
    mentenanta: 'Mentenanță',
    strategie: 'Strategie',
  };

  let activeFilter = 'toate';

  function fold(text) {
    return (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function updateCatalog() {
    const query = fold(searchInput?.value.trim() || '');
    let visible = 0;

    for (const card of cards) {
      const cat = card.getAttribute('data-category') || '';
      const haystack = fold(`${card.textContent} ${card.getAttribute('data-search') || ''}`);
      const matchesCat = activeFilter === 'toate' || cat === activeFilter;
      const matchesQuery = !query || haystack.includes(query);
      const show = matchesCat && matchesQuery;
      card.hidden = !show;
      if (show) visible += 1;
    }

    if (searchClear) searchClear.hidden = !query;
    if (emptyBox) emptyBox.hidden = visible > 0;
    if (paginationEl) paginationEl.hidden = activeFilter !== 'toate' || Boolean(query);

    const isFiltered = activeFilter !== 'toate' || Boolean(query);
    if (resetBtn) resetBtn.hidden = !isFiltered;

    if (statusEl) {
      const noun = visible === 1 ? 'articol' : 'articole';
      const scope = activeFilter === 'toate' ? 'toate temele' : `tema „${LABELS[activeFilter] || activeFilter}”`;
      const queryPart = query ? ` pentru „${searchInput.value.trim()}”` : '';
      statusEl.innerHTML = `Se afișează <strong>${visible} ${noun}</strong> din ${scope}${queryPart}.`;
    }
  }

  function resetAll() {
    activeFilter = 'toate';
    for (const btn of filterBtns) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-filter') === 'toate'));
    }
    if (searchInput) searchInput.value = '';
    updateCatalog();
  }

  for (const btn of filterBtns) {
    btn.addEventListener('click', () => {
      activeFilter = btn.getAttribute('data-filter') || 'toate';
      for (const b of filterBtns) {
        b.setAttribute('aria-pressed', String(b === btn));
      }
      updateCatalog();
    });
  }

  if (searchInput) searchInput.addEventListener('input', updateCatalog);
  if (searchClear) {
    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      searchInput.focus();
      updateCatalog();
    });
  }
  if (resetBtn) resetBtn.addEventListener('click', resetAll);
  if (emptyReset) emptyReset.addEventListener('click', resetAll);

  // Validare locala a formularului de contact (fara trimitere reala in prototip).
  const form = document.querySelector('[data-js="contact-form"]');
  const formStatus = document.querySelector('[data-js="form-status"]');

  if (form && formStatus) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.checkValidity()) {
        formStatus.hidden = false;
        formStatus.dataset.state = 'error';
        formStatus.textContent = 'Completează câmpurile obligatorii (nume, email valid, telefon și mesaj).';
        const firstInvalid = form.querySelector(':invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }
      formStatus.hidden = false;
      formStatus.dataset.state = 'success';
      formStatus.textContent = 'Validare trecută (prototip local, mesajul nu a fost trimis).';
      form.reset();
    });
  }
})();
