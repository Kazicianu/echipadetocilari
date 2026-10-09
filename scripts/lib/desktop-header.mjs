import { appendToHead } from './html.mjs';
import { routes } from '../i18n/routes.mjs';

const STYLESHEET = '<link rel="stylesheet" href="/wp-content/ect-pages/desktop-header.css">';

// Decorative 24px stroke icons; the visible service name carries the meaning.
const svg = paths => `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths}</svg>`;
const ICONS = {
  website: svg('<rect x="3" y="4.5" width="18" height="15" rx="2.5"/><path d="M3 9h18"/><path d="M6.5 6.75h.01M9 6.75h.01M11.5 6.75h.01"/><path d="M7 13h7M7 16h4.5"/>'),
  seo: svg('<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L20 20"/><path d="M10.5 7.5c.35 1.6 1.4 2.65 3 3-1.6.35-2.65 1.4-3 3-.35-1.6-1.4-2.65-3-3 1.6-.35 2.65-1.4 3-3z"/>'),
  ads: svg('<path d="M4 10v4a1 1 0 0 0 1 1h2l5 4V5L7 9H5a1 1 0 0 0-1 1z"/><path d="M15.5 9.5a3.5 3.5 0 0 1 0 5"/><path d="M18 7a7 7 0 0 1 0 10"/>'),
  maintenance: svg('<path d="M12 3.2l7 2.8v5.6c0 4.2-2.9 7.6-7 9.2-4.1-1.6-7-5-7-9.2V6l7-2.8z"/><path d="M9 12.2l2.1 2.1 4-4.1"/>'),
};

/** One line per service, taken from each page's own description. Keyed by RO route. */
export const serviceMenuCopy = {
  '/creare-site-web/': {
    icon: 'website',
    ro: 'Site de prezentare, landing page și bază de magazin online.',
    en: 'Business websites, landing pages and a solid base for online stores.',
  },
  '/servicii-seo/': {
    icon: 'seo',
    ro: 'Audit, optimizare tehnică și conținut clar pentru Google și răspunsurile AI.',
    en: 'Audits, technical improvements and clear content for Google and AI answers.',
  },
  '/agentie-google-ads/': {
    icon: 'ads',
    ro: 'Campanii Search, optimizare și raportare, pentru firme din România.',
    en: 'Search campaigns, optimisation and reporting for businesses in Romania.',
  },
  '/administrare-site/': {
    icon: 'maintenance',
    ro: 'Actualizări, backup, securitate și conținut, în abonament lunar.',
    en: 'Updates, backups, security and content on a monthly plan.',
  },
};

// The link target decides the language: RO routes get RO copy, EN routes EN copy.
const serviceByHref = new Map(routes
  .filter(route => serviceMenuCopy[route.ro])
  .flatMap(route => {
    const { icon, ro, en } = serviceMenuCopy[route.ro];
    return [[route.ro, { icon, text: ro }], [route.en, { icon, text: en }]];
  }));

function openingTag(html) {
  return html.slice(0, html.indexOf('>') + 1);
}

/**
 * Desktop header: give each Services submenu link an icon and a one-line
 * description, and load the desktop header stylesheet. Run after language
 * generation, so link targets and labels are already final. The mobile menu
 * (the dropdown nav) is left untouched.
 */
export function enhanceDesktopHeader(html) {
  if (html.includes('ect-svc-link')) return html;
  const header = html.match(/<header\b[\s\S]*?<\/header>/i)?.[0];
  if (!header) return html;
  const main = [...header.matchAll(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi)]
    .map(match => match[0])
    .find(nav => /\bclass="[^"]*\belementor-nav-menu--main\b/.test(openingTag(nav)));
  if (!main) return html;

  let enhancedLinks = 0;
  const enhancedMain = main.replace(/(<ul class="sub-menu\b[^"]*"[^>]*>)([\s\S]*?)(<\/ul>)/i, (list, open, items, close) =>
    open + items.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (link, attrs, label) => {
      const service = serviceByHref.get(attrs.match(/\shref="([^"]*)"/i)?.[1]);
      if (!service || /<[a-z]/i.test(label)) return link;
      enhancedLinks += 1;
      const classed = /\sclass="/i.test(attrs)
        ? attrs.replace(/\sclass="([^"]*)"/i, (match, value) => ` class="${value} ect-svc-link"`)
        : `${attrs} class="ect-svc-link"`;
      return `<a${classed}><span class="ect-svc-icon">${ICONS[service.icon]}</span>` +
        `<span class="ect-svc-text"><span class="ect-svc-title">${label.trim()}</span>` +
        `<span class="ect-svc-desc">${service.text}</span></span></a>`;
    }) + close);
  if (!enhancedLinks) return html;

  html = html.replace(header, header.replace(main, enhancedMain));
  return html.includes(STYLESHEET) ? html : appendToHead(html, STYLESHEET);
}
