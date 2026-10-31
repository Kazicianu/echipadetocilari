/**
 * The site's real pages: RO source file in legacy-mirror → EN public path
 * (natural search slugs).
 *
 * This list is the single source of truth for: which mirror pages we treat as
 * ours, which get EN twins when en/enFile are set, hreflang pairs, the sitemap,
 * and llms.txt. Romanian-only pages omit their English fields until approved. Theme
 * demo posts and attachment HTML are deleted from the mirror and 301'd — see
 * `scripts/lib/junk-redirects.mjs`. `isOwnedPage` still gates schema/index.
 *
 * `service` marks pages that describe a purchasable service (Service JSON-LD).
 * `lcpImages` lists the largest-contentful-paint images as root-relative URLs
 * exactly as the CSS resolves them, with an optional `media` condition; the
 * build preloads them on the RO page and its EN twin (scripts/lib/preload-hints.mjs).
 * `preloadFonts` also preloads the Montserrat files, only where the late font
 * swap shifted the layout (measured live; elsewhere the hint only costs LCP).
 */
export const routes = [
  {
    ro: '/',
    en: '/en/',
    roFile: 'index.html',
    enFile: 'en/index.html',
    labelRo: 'Acasă',
    labelEn: 'Home',
    lcpImages: [
      { href: '/wp-content/uploads/2024/02/BG-HomePage-High.png' },
      { href: '/wp-content/uploads/2022/04/daycare-hero-bg.png', media: '(min-width: 1025px)' },
    ],
  },
  {
    ro: '/about-2/',
    en: '/en/about/',
    roFile: 'about-2/index.html',
    enFile: 'en/about/index.html',
    labelRo: 'Despre noi',
    labelEn: 'About us',
    lcpImages: [{ href: '/wp-content/uploads/2022/04/daycare-hero-bg.png', media: '(max-width: 1024px)' }],
  },
  {
    ro: '/creare-site-web/',
    en: '/en/website-design/',
    roFile: 'creare-site-web/index.html',
    enFile: 'en/website-design/index.html',
    labelRo: 'Creare site web',
    labelEn: 'Website design',
    lcpImages: [{ href: '/wp-content/uploads/2022/04/day-care-about-hero-bg.png' }],
    service: { ro: 'Creare site web', en: 'Website design and development' },
  },
  {
    ro: '/creare-magazin-online/',
    roFile: 'creare-magazin-online/index.html',
    labelRo: 'Creare magazin online',
    service: { ro: 'Creare magazin online' },
  },
  {
    ro: '/dezvoltare-aplicatii/',
    roFile: 'dezvoltare-aplicatii/index.html',
    labelRo: 'Dezvoltare aplicații',
    service: { ro: 'Dezvoltare aplicații mobile și web' },
  },
  {
    ro: '/servicii-seo/',
    en: '/en/seo-services/',
    roFile: 'servicii-seo/index.html',
    enFile: 'en/seo-services/index.html',
    labelRo: 'Servicii SEO',
    labelEn: 'SEO services',
    lcpImages: [{ href: '/wp-content/uploads/2022/04/daycare-hero-bg.png' }],
    service: { ro: 'Servicii SEO', en: 'SEO services' },
  },
  {
    ro: '/administrare-site/',
    en: '/en/website-maintenance/',
    roFile: 'administrare-site/index.html',
    enFile: 'en/website-maintenance/index.html',
    labelRo: 'Administrare site',
    labelEn: 'Website maintenance',
    lcpImages: [{ href: '/wp-content/uploads/2022/04/daycare-hero-bg.png' }],
    preloadFonts: true,
    service: { ro: 'Administrare site', en: 'Website maintenance' },
  },
  {
    ro: '/contact/',
    en: '/en/contact/',
    roFile: 'contact/index.html',
    enFile: 'en/contact/index.html',
    labelRo: 'Contact',
    labelEn: 'Contact',
    preloadFonts: true,
  },
  {
    ro: '/portofoliu/',
    en: '/en/portfolio/',
    roFile: 'portofoliu/index.html',
    enFile: 'en/portfolio/index.html',
    labelRo: 'Portofoliu',
    labelEn: 'Portfolio',
    lcpImages: [{ href: '/wp-content/uploads/2024/02/Bg-Services.png' }],
    preloadFonts: true,
  },
  {
    ro: '/agentie-google-ads/',
    en: '/en/google-ads-agency/',
    roFile: 'agentie-google-ads/index.html',
    enFile: 'en/google-ads-agency/index.html',
    labelRo: 'Agenție Google Ads',
    labelEn: 'Google Ads agency',
    lcpImages: [{ href: '/wp-content/ect-pages/google-ads/hero-blobs-mobile.svg', media: '(max-width: 900px)' }],
    service: { ro: 'Administrare campanii Google Ads', en: 'Google Ads campaign management' },
  },
  {
    // Route approved 26.10.2026, design implemented 29.10.2026. Romanian only until an EN version is approved.
    ro: '/agentie-facebook-ads/',
    roFile: 'agentie-facebook-ads/index.html',
    labelRo: 'Agenție Facebook Ads',
    service: { ro: 'Administrare campanii Facebook Ads și Instagram' },
  },
  {
    // Privacy and cookie policy (decided 22.10.2026). Not a service: no Service schema.
    ro: '/politica-de-confidentialitate/',
    en: '/en/privacy-policy/',
    roFile: 'politica-de-confidentialitate/index.html',
    enFile: 'en/privacy-policy/index.html',
    labelRo: 'Politica de confidențialitate',
    labelEn: 'Privacy policy',
    preloadFonts: true,
  },
];

export const retiredPagePaths = [
  '/services/',
  '/en/services/',
  '/clients/',
  '/en/clients/',
  '/logo-design/',
  '/en/logo-design/',
];

export const pairedRoutes = routes.filter((route) => route.en && route.enFile);
export const roToEn = Object.fromEntries(pairedRoutes.map((r) => [r.ro, r.en]));
export const enToRo = Object.fromEntries(pairedRoutes.map((r) => [r.en, r.ro]));

const roPaths = new Set(routes.map((r) => r.ro));
const enPaths = new Set(pairedRoutes.map((r) => r.en));

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

/**
 * Pages the host serves for errors. They are generated at build time, never
 * listed in `routes`, the sitemap or llms.txt, and always noindex. One file
 * serves both languages.
 */
export const systemPagePaths = ['/404.html'];

export function isSystemPage(urlPath) {
  return systemPagePaths.includes(urlPath);
}

export function routeByRo(urlPath) {
  return routes.find((r) => r.ro === urlPath);
}

/** The route for an RO or EN public path (the EN twin shares its RO route). */
export function routeByPath(urlPath) {
  return routes.find((r) => r.ro === urlPath || r.en === urlPath);
}
