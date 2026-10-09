/**
 * The site's real pages: RO source file in legacy-mirror → EN public path
 * (natural search slugs).
 *
 * This list is the single source of truth for: which mirror pages we treat as
 * ours, which get EN twins, hreflang pairs, the sitemap, and llms.txt. Theme
 * demo posts and attachment HTML are deleted from the mirror and 301'd — see
 * `scripts/lib/junk-redirects.mjs`. `isOwnedPage` still gates schema/index.
 *
 * `service` marks pages that describe a purchasable service (Service JSON-LD).
 */
export const routes = [
  {
    ro: '/',
    en: '/en/',
    roFile: 'index.html',
    enFile: 'en/index.html',
    labelRo: 'Acasă',
    labelEn: 'Home',
  },
  {
    ro: '/about-2/',
    en: '/en/about/',
    roFile: 'about-2/index.html',
    enFile: 'en/about/index.html',
    labelRo: 'Despre noi',
    labelEn: 'About us',
  },
  {
    ro: '/creare-site-web/',
    en: '/en/website-design/',
    roFile: 'creare-site-web/index.html',
    enFile: 'en/website-design/index.html',
    labelRo: 'Creare site web',
    labelEn: 'Website design',
    service: { ro: 'Creare site web', en: 'Website design and development' },
  },
  {
    ro: '/servicii-seo/',
    en: '/en/seo-services/',
    roFile: 'servicii-seo/index.html',
    enFile: 'en/seo-services/index.html',
    labelRo: 'Servicii SEO',
    labelEn: 'SEO services',
    service: { ro: 'Servicii SEO', en: 'SEO services' },
  },
  {
    ro: '/administrare-site/',
    en: '/en/website-maintenance/',
    roFile: 'administrare-site/index.html',
    enFile: 'en/website-maintenance/index.html',
    labelRo: 'Administrare site',
    labelEn: 'Website maintenance',
    service: { ro: 'Administrare site', en: 'Website maintenance' },
  },
  {
    ro: '/contact/',
    en: '/en/contact/',
    roFile: 'contact/index.html',
    enFile: 'en/contact/index.html',
    labelRo: 'Contact',
    labelEn: 'Contact',
  },
  {
    ro: '/portofoliu/',
    en: '/en/portfolio/',
    roFile: 'portofoliu/index.html',
    enFile: 'en/portfolio/index.html',
    labelRo: 'Portofoliu',
    labelEn: 'Portfolio',
  },
  {
    ro: '/services/',
    en: '/en/services/',
    roFile: 'services/index.html',
    enFile: 'en/services/index.html',
    labelRo: 'Servicii',
    labelEn: 'Services',
  },
  {
    ro: '/clients/',
    en: '/en/clients/',
    roFile: 'clients/index.html',
    enFile: 'en/clients/index.html',
    labelRo: 'Clienți',
    labelEn: 'Clients',
  },
  {
    ro: '/logo-design/',
    en: '/en/logo-design/',
    roFile: 'logo-design/index.html',
    enFile: 'en/logo-design/index.html',
    labelRo: 'Logo design',
    labelEn: 'Logo design',
    service: { ro: 'Logo design', en: 'Logo design' },
  },
  {
    ro: '/agentie-google-ads/',
    en: '/en/google-ads-agency/',
    roFile: 'agentie-google-ads/index.html',
    enFile: 'en/google-ads-agency/index.html',
    labelRo: 'Agenție Google Ads',
    labelEn: 'Google Ads agency',
    service: { ro: 'Administrare campanii Google Ads', en: 'Google Ads campaign management' },
  },
];

export const roToEn = Object.fromEntries(routes.map((r) => [r.ro, r.en]));
export const enToRo = Object.fromEntries(routes.map((r) => [r.en, r.ro]));

const roPaths = new Set(routes.map((r) => r.ro));
const enPaths = new Set(routes.map((r) => r.en));

/**
 * Is this URL path one of our real pages?
 *
 * Theme-demo and attachment HTML is stripped from dist and redirected (301),
 * not published as noindex leftovers. Anything that still is not in `routes`
 * must never be indexed or carry our schema.
 */
export function isOwnedPage(urlPath) {
  return roPaths.has(urlPath) || enPaths.has(urlPath);
}

export function routeByRo(urlPath) {
  return routes.find((r) => r.ro === urlPath);
}
