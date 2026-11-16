/**
 * Share-preview (Open Graph) image per public page.
 *
 * Single source for `scripts/og/make-og-images.mjs` (renders the JPEGs) and
 * `scripts/lib/social-meta.mjs` (writes the meta tags). Titles and subtitles
 * come from each page's H1 and meta description; no prices, no claims that
 * cannot be checked on the page.
 *
 * `page` is the public path, `slug` the file name in
 * `legacy-mirror/wp-content/ect-pages/og/`, `illustration` the 3D character
 * (`ect-assets/illustrations-2026-11/<name>.webp`), `mirror` flips it.
 */

export const ogDirectory = '/wp-content/ect-pages/og';

const rows = [
  ['/', 'home', 'Agenție de marketing online în București', 'Web design, SEO, Google Ads și Facebook Ads', '09-contact-salut', false],
  ['/despre-noi/', 'despre-noi', 'Tocilari din fire. Parteneri de echipă.', 'Design, dezvoltare web și SEO', '10-raport-explicat', false],
  ['/creare-site-web/', 'creare-site-web', 'Creare site web pentru afacerea ta', 'Landing page, site de prezentare, magazin online', '02-web-responsive', false],
  ['/creare-magazin-online/', 'creare-magazin-online', 'Creare magazin online', 'Design personalizat, plăți, curier și facturare', '03-magazin-online', false],
  ['/dezvoltare-aplicatii/', 'dezvoltare-aplicatii', 'Dezvoltare aplicații mobile și web', 'Aplicații iOS, Android și web', '04-aplicatii', false],
  ['/servicii-seo/', 'servicii-seo', 'Servicii SEO pentru Google și căutările AI', 'Audit, optimizare tehnică și conținut clar', '01-seo-audit', false],
  ['/administrare-site/', 'administrare-site', 'Mentenanță site și administrare WordPress', 'Actualizări, backup, securitate și conținut', '07-mentenanta', false],
  ['/contact/', 'contact', 'Contactează agenția de marketing online', 'Consultație gratuită de 30 de minute', '08-ai-raspunsuri', false],
  ['/portofoliu/', 'portofoliu', 'Portofoliu', 'Site-uri de prezentare, magazine online și aplicații web', '02-web-responsive', true],
  ['/agentie-google-ads/', 'agentie-google-ads', 'Agenție Google Ads pentru firme', 'Campanii Search, conversii măsurate și rapoarte', '05-google-ads', false],
  ['/agentie-facebook-ads/', 'agentie-facebook-ads', 'Agenție Facebook Ads', 'Reclame pe Facebook și Instagram pentru firme', '06-social-ads', false],
  ['/politica-de-confidentialitate/', 'politica-de-confidentialitate', 'Politica de confidențialitate și cookie-uri', 'Ce date folosim și cum le protejăm', '10-raport-explicat', true],
  ['/en/', 'en-home', 'Digital marketing agency in Bucharest', 'Web design, SEO, Google Ads and Facebook Ads', '09-contact-salut', false],
  ['/en/about/', 'en-about', 'Nerds by nature. Teammates by choice.', 'Design, web development and SEO', '10-raport-explicat', false],
  ['/en/website-design/', 'en-website-design', 'Create a website for your business', 'Landing pages, business websites, online stores', '02-web-responsive', false],
  ['/en/seo-services/', 'en-seo-services', 'SEO services for Google and AI-assisted search', 'Audits, technical improvements and clear content', '01-seo-audit', false],
  ['/en/website-maintenance/', 'en-website-maintenance', 'Website maintenance and WordPress management', 'Updates, backups, security and content', '07-mentenanta', false],
  ['/en/contact/', 'en-contact', 'Contact the online marketing agency', 'Free 30-minute consultation', '08-ai-raspunsuri', false],
  ['/en/portfolio/', 'en-portfolio', 'Portfolio', 'Business websites, online stores and web apps', '02-web-responsive', true],
  ['/en/google-ads-agency/', 'en-google-ads-agency', 'Google Ads agency for businesses', 'Search campaigns, conversion tracking and reports', '05-google-ads', false],
  ['/en/privacy-policy/', 'en-privacy-policy', 'Privacy and cookie policy', 'What data we use and how we protect it', '10-raport-explicat', true],
];

export const ogPages = rows.map(([page, slug, title, subtitle, illustration, mirror]) => ({
  page,
  slug,
  title,
  subtitle,
  illustration,
  mirror,
  alt: `${title}, Echipa de Tocilari`,
}));

/** Used by every page that has no entry above (404, generic pages). Same design as the home image. */
export const defaultOgImage = {
  path: `${ogDirectory}/default.jpg`,
  width: 1200,
  height: 630,
  type: 'image/jpeg',
  alt: 'Echipa de Tocilari, agenție de marketing online în București',
};

export function ogImagePath(slug) {
  return `${ogDirectory}/${slug}.jpg`;
}

export const ogImageSize = { width: 1200, height: 630 };

/** Every share image a build can reference: the default plus one per page. */
export function allOgImagePaths() {
  return [defaultOgImage.path, ...ogPages.map((entry) => ogImagePath(entry.slug))];
}
