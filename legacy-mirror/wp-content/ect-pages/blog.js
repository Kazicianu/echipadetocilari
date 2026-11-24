/* Filtrare pe categorii si cautare instant pe /blog/ (toate cardurile raman in HTML static). */
(() => {
  const root = document.querySelector('.ect-page--blog');
  if (!root) return;

  const filterBtns = [...root.querySelectorAll('[data-filter]')];
  const cards = [...root.querySelectorAll('[data-js="blog-grid"] .bl-card')];
  const searchInput = root.querySelector('[data-js="blog-search"]');
  const searchClear = root.querySelector('[data-js="search-clear"]');
  const statusEl = root.querySelector('[data-js="blog-status"]');
  const resetBtn = root.querySelector('[data-js="filter-reset"]');
  const emptyBox = root.querySelector('[data-js="blog-empty"]');
  const emptyReset = root.querySelector('[data-js="empty-reset"]');

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
    const rawQuery = searchInput?.value.trim() || '';
    const query = fold(rawQuery);
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
    if (resetBtn) resetBtn.hidden = activeFilter === 'toate' && !query;

    if (statusEl) {
      const noun = visible === 1 ? 'ghid' : 'ghiduri';
      const scope = activeFilter === 'toate' ? 'toate temele' : `tema „${LABELS[activeFilter] || activeFilter}”`;
      statusEl.textContent = '';
      statusEl.append('Se afișează ');
      const strong = document.createElement('strong');
      strong.textContent = `${visible} ${noun}`;
      statusEl.append(strong, ` din ${scope}`);
      if (rawQuery) statusEl.append(` pentru „${rawQuery}”`);
      statusEl.append('.');
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
      for (const other of filterBtns) {
        other.setAttribute('aria-pressed', String(other === btn));
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
})();
