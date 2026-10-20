import { appendToBody, appendToHead } from './html.mjs';
import { routes } from '../i18n/routes.mjs';

const home = routes.find(route => route.ro === '/');

/** Lead the mobile list with the homepage; on desktop the logo links there. */
function withHomeLink(dropdown, english, pageUrl) {
  const href = english ? home.en : home.ro;
  if (dropdown.includes(`href="${href}"`)) return dropdown;
  const current = pageUrl === href;
  const item = `<li class="menu-item menu-item-type-post_type menu-item-object-page${current ? ' current-menu-item' : ''}">` +
    `<a href="${href}" class="elementor-item${current ? ' elementor-item-active' : ''}" tabindex="-1"${current ? ' aria-current="page"' : ''}>` +
    `${english ? home.labelEn : home.labelRo}</a></li>\n`;
  return dropdown.replace(/(<ul\b[^>]*>)/i, `$1${item}`);
}

/** Enhance the translated header once, after language and route generation. */
export function enhanceMobileMenu(html, { pageUrl } = {}) {
  if (html.includes('id="ect-mobile-menu"')) return html;
  const header = html.match(/<header\b[\s\S]*?<\/header>/i)?.[0];
  if (!header) return html;
  const dropdown = [...header.matchAll(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi)]
    .map(match => match[0])
    .find(nav => /class="elementor-nav-menu--dropdown elementor-nav-menu__container"/.test(nav));
  const toggle = header.match(/<div class="elementor-menu-toggle"[^>]*>[\s\S]*?<\/div>/i)?.[0];
  if (!dropdown || !toggle) return html;

  const english = /<html\b[^>]*\blang=["']en(?:-[^"']*)?["']/i.test(html);
  const label = english ? 'Main menu' : 'Meniu principal';
  const open = english ? 'Open menu' : 'Deschide meniul';
  const close = english ? 'Close menu' : 'Închide meniul';
  const menu = withHomeLink(dropdown, english, pageUrl);
  const links = [...menu.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/gi)].map(([link]) =>
    `<li class="ect-mobile-menu-link-wrap">${link
      .replace(/\sclass="[^"]*"/, ' class="ect-mobile-menu-link"')
      .replace(/\s(?:tabindex|id)="[^"]*"/g, '')}</li>`).join('\n');
  // The header switch already names a RO-only page's EN link as the English homepage.
  const language = header.match(/<nav\b[^>]*id="ect-lang-switch"[^>]*>([\s\S]*?)<\/nav>/i)?.[1] || '';
  const footer = language.replace(/<a\b/g, '<a class="ect-mobile-menu-footer-link"');
  const button = `<span class="ect-mobile-menu-slot"><button type="button" class="ect-mobile-menu-toggle" aria-expanded="false" aria-controls="ect-mobile-menu" aria-label="${open}" data-open-label="${open}" data-close-label="${close}"><span class="ect-mobile-menu-icon" aria-hidden="true"><span></span><span></span></span></button></span>`;
  // Keep the original links available even if JavaScript fails to load.
  const fallback = menu.replace('aria-hidden="true"', 'aria-hidden="false"')
    .replace(/\stabindex="-1"/g, '');
  html = html.replace(header, header.replace(toggle, button).replace(dropdown, fallback));
  html = appendToHead(html, '<link rel="stylesheet" href="/wp-content/ect-pages/mobile-menu.css">');
  html = appendToBody(html, `<dialog id="ect-mobile-menu" aria-label="${label}">
  <div class="ect-mobile-menu-panel">
    <nav class="ect-mobile-menu-nav" aria-label="${label}">
      <ul class="ect-mobile-menu-links">${links}</ul>
      <div class="ect-mobile-menu-footer">${footer}</div>
    </nav>
  </div>
</dialog>
<script src="/wp-content/ect-pages/mobile-menu.js" defer></script>`);
  return html;
}
