// Desktop menu: an orange highlight slides under the hovered or focused
// top-level link and stays on "Servicii" while its submenu is open.
(() => {
  const list = document.querySelector('#top .elementor-nav-menu--main > .elementor-nav-menu');
  if (!list) return;
  const desktop = window.matchMedia('(min-width: 1025px)');
  let current = null;

  // The item under the highlight gets white text (see desktop-header.css).
  const mark = item => {
    for (const li of list.children) li.classList.toggle('ect-pill-at', li === item);
  };

  const hide = () => {
    current = null;
    list.removeAttribute('data-pill');
    mark(null);
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
    mark(item);
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
  // React to SmartMenus opening or closing a submenu, not to our own marks.
  new MutationObserver(records => {
    if (records.some(record => record.target.tagName === 'A')) settle();
  }).observe(list, { subtree: true, attributeFilter: ['class'] });
  window.addEventListener('resize', () => (current ? place(current) : hide()));

  // Speed up SmartMenus closing (defaults to 500ms delay + 200ms fadeOut,
  // which makes the dropdown linger for almost a second after unhovering).
  const tuneSmartMenus = () => {
    const $ = window.jQuery;
    if (!$ || !$.fn || !$.fn.smartmenus) return;
    $.fn.smartmenus.defaults.hideTimeout = 100;
    $.fn.smartmenus.defaults.hideFunction = function($ul, complete) {
      $ul.fadeOut(100, complete);
    };
    const sm = $(list).data('smartmenus');
    if (sm && sm.opts) {
      sm.opts.hideTimeout = 100;
      sm.opts.hideFunction = function($ul, complete) {
        $ul.fadeOut(100, complete);
      };
    }
  };
  tuneSmartMenus();
  document.addEventListener('DOMContentLoaded', tuneSmartMenus);
  window.addEventListener('elementor/frontend/init', tuneSmartMenus);
  if (window.elementorFrontend && window.elementorFrontend.hooks) {
    window.elementorFrontend.hooks.addAction('frontend/element_ready/nav-menu.default', tuneSmartMenus);
  }
})();
