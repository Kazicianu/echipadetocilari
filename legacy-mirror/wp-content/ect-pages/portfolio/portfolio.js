(() => {
  'use strict';
  const portfolio = document.getElementById('ect-portfolio');
  if (!portfolio) return;
  const input = portfolio.querySelector('input[type="search"]');
  const buttons = [...portfolio.querySelectorAll('[data-category]')];
  const cards = [...portfolio.querySelectorAll('.ect-portfolio-card')];
  const status = portfolio.querySelector('[role="status"]');
  const empty = portfolio.querySelector('.ect-portfolio-empty');
  const normalize = (text) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
  const names = cards.map((card) => normalize(card.querySelector('h3').textContent));
  let category = 'all';

  function update() {
    const terms = normalize(input.value.trim()).split(/\s+/).filter(Boolean);
    let count = 0;
    cards.forEach((card, index) => {
      const matchesCategory = category === 'all' || card.dataset.categories.split(' ').includes(category);
      const matchesQuery = terms.every((term) => names[index].includes(term));
      card.hidden = !(matchesCategory && matchesQuery);
      if (!card.hidden) count++;
    });
    const countLabel = count === 1 ? portfolio.dataset.countLabelSingular : portfolio.dataset.countLabel;
    status.textContent = `${count} ${countLabel}`;
    empty.hidden = count !== 0;
    buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.category === category)));
  }

  buttons.forEach((button) => button.addEventListener('click', () => {
    category = button.dataset.category;
    update();
  }));
  input.addEventListener('input', update);
  portfolio.querySelector('.ect-portfolio-controls').hidden = false;
  update();
})();
