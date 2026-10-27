// Desktop menu: an orange-outlined pill slides under the hovered or focused
// top-level link and stays on "Servicii" while its submenu is open.
(() => {
  const list = document.querySelector('#top .elementor-nav-menu--main > .elementor-nav-menu');
  if (!list) return;
  const desktop = window.matchMedia('(min-width: 1025px)');
  let current = null;

  const hide = () => {
    current = null;
    list.removeAttribute('data-pill');
  };

  const place = item => {
    const link = item && item.querySelector(':scope > a');
    if (!link || !desktop.matches) return hide();
    const box = list.getBoundingClientRect();
    const rect = link.getBoundingClientRect();
    // Appearing from nothing jumps into place; moving between links slides.
    if (!current) list.setAttribute('data-pill', 'jump');
    list.style.setProperty('--ect-pill-x', `${rect.left - box.left - list.clientLeft}px`);
    list.style.setProperty('--ect-pill-w', `${rect.width}px`);
    if (!current) requestAnimationFrame(() => requestAnimationFrame(() => {
      if (list.hasAttribute('data-pill')) list.setAttribute('data-pill', 'on');
    }));
    current = item;
  };

  // Without a pointer on the menu, the pill rests on a keyboard-focused link
  // or on the link whose submenu SmartMenus still shows, else it fades out.
  const settle = () => {
    if (list.matches(':hover')) return;
    const link = list.querySelector(':scope > li > a:focus-visible, :scope > li > a.highlighted');
    link ? place(link.parentElement) : hide();
  };

  for (const item of list.children) {
    item.addEventListener('mouseenter', () => place(item));
    item.addEventListener('focusin', () => place(item));
  }
  list.addEventListener('mouseleave', settle);
  list.addEventListener('focusout', event => {
    if (!list.contains(event.relatedTarget)) settle();
  });
  new MutationObserver(settle).observe(list, { subtree: true, attributeFilter: ['class'] });
  window.addEventListener('resize', () => (current ? place(current) : hide()));
})();
