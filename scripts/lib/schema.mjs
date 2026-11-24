/**
 * JSON-LD builders. Pure structure, with copy from i18n metadata or visible HTML,
 * so RO and EN stay in sync by construction instead of by copy-paste.
 */

const LOGO = '/wp-content/uploads/2024/02/Logo_Echipa_de_Tocilari-1024x1024.webp';

const SAME_AS = [
  'https://www.facebook.com/EchipadeTocilari/',
  'https://www.linkedin.com/company/echipa-de-tocilari/',
];

/** Stable @id so every page's schema references the same entity. */
export const orgId = (site) => `${site}/#organization`;
export const websiteId = (site, lang) => `${site}/#website${lang === 'en' ? '-en' : ''}`;

/**
 * @param {object} opts
 * @param {string} opts.site
 * @param {string} opts.lang
 * @param {string} opts.description
 * @param {string[]} opts.knowsAbout
 * @param {{ streetAddress: string, addressLocality: string, postalCode: string, addressCountry: string }} [opts.address]
 * @param {string} [opts.telephone] omit rather than invent
 * @param {{ dayOfWeek: string[], opens: string, closes: string }} [opts.openingHours] keep in step with the contact page
 */
export function organization({ site, lang, description, knowsAbout, address, telephone, openingHours }) {
  const org = {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'ProfessionalService', 'LocalBusiness'],
    '@id': orgId(site),
    name: 'Echipa de Tocilari',
    url: site,
    description,
    email: 'contact@echipadetocilari.ro',
    areaServed: lang === 'en' ? 'Romania' : 'România',
    logo: `${site}${LOGO}`,
    image: `${site}${LOGO}`,
    knowsAbout,
    sameAs: SAME_AS,
  };

  if (telephone) org.telephone = telephone;

  if (openingHours) {
    org.openingHoursSpecification = { '@type': 'OpeningHoursSpecification', ...openingHours };
  }

  if (address) {
    org.address = {
      '@type': 'PostalAddress',
      streetAddress: address.streetAddress,
      addressLocality: address.addressLocality,
      postalCode: address.postalCode,
      addressCountry: address.addressCountry,
    };
  }

  return org;
}

export function website({ site, lang }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': websiteId(site, lang),
    url: lang === 'en' ? `${site}/en/` : site,
    name: 'Echipa de Tocilari',
    inLanguage: lang === 'en' ? 'en-US' : 'ro-RO',
    publisher: { '@id': orgId(site) },
  };
}

export function webPage({ site, lang, url, name, description, dateModified }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${site}${url}#webpage`,
    url: `${site}${url}`,
    name,
    description,
    inLanguage: lang === 'en' ? 'en-US' : 'ro-RO',
    isPartOf: { '@id': websiteId(site, lang) },
    about: { '@id': orgId(site) },
    ...(dateModified ? { dateModified } : {}),
  };
}

/**
 * The date a page shows as last updated, so WebPage.dateModified matches what
 * visitors read: the <time datetime="YYYY-MM-DD"> inside `.ect-policy__updated`
 * (the privacy policy). Undefined for pages without that line.
 */
export function visibleDateModified(html) {
  return html.match(/<p\b[^>]*\bclass="[^"]*\bect-policy__updated\b[^"]*"[^>]*>(?:(?!<\/p>)[\s\S])*?<time\b[^>]*\bdatetime="(\d{4}-\d{2}-\d{2})"/i)?.[1];
}

export function service({ site, lang, name, description, url }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    provider: { '@id': orgId(site) },
    areaServed: lang === 'en' ? 'Romania' : 'România',
    url: `${site}${url}`,
  };
}

export function blog({ site, lang, url, name, description }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${site}${url}#blog`,
    url: `${site}${url}`,
    name,
    description,
    inLanguage: lang === 'en' ? 'en-US' : 'ro-RO',
    publisher: { '@id': orgId(site) },
    isPartOf: { '@id': websiteId(site, lang) },
  };
}

/**
 * Published and updated ISO dates visible inside the article byline
 * (`Publicat <time datetime="YYYY-MM-DD">` and `Actualizat <time datetime="YYYY-MM-DD">`).
 */
export function visibleArticleDates(html) {
  const byline = html.match(/<div\b[^>]*\bclass="[^"]*\bart-byline\b[^"]*"[^>]*>[\s\S]*?<\/div>/i)?.[0] || '';
  const datePublished = byline.match(/Publicat\s*<time\b[^>]*\bdatetime="(\d{4}-\d{2}-\d{2})"/i)?.[1];
  const dateModified = byline.match(/Actualizat\s*<time\b[^>]*\bdatetime="(\d{4}-\d{2}-\d{2})"/i)?.[1];
  return datePublished ? { datePublished, dateModified: dateModified || datePublished } : undefined;
}

/** Visible H1 text for BlogPosting.headline, stripped of tags and collapsed whitespace. */
export function visibleHeadline(html) {
  const match = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  return match ? match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : undefined;
}

export function blogPosting({ site, lang, url, headline, description, datePublished, dateModified, image }) {
  const toIso = (date) => (date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date}T09:00:00+02:00` : date);
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${site}${url}#article`,
    mainEntityOfPage: { '@id': `${site}${url}#webpage` },
    headline,
    description,
    ...(image ? { image: Array.isArray(image) ? image : [image] } : {}),
    ...(datePublished ? { datePublished: toIso(datePublished) } : {}),
    ...(dateModified || datePublished ? { dateModified: toIso(dateModified || datePublished) } : {}),
    inLanguage: lang === 'en' ? 'en-US' : 'ro-RO',
    author: { '@id': orgId(site) },
    publisher: { '@id': orgId(site) },
    isPartOf: { '@id': `${site}/blog/#blog` },
    breadcrumb: { '@id': `${site}${url}#breadcrumb` },
  };
}

export function breadcrumbList({ site, url, items }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${site}${url}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.url ? { item: `${site}${item.url}` } : {}),
    })),
  };
}

/** @param {Array<{q: string, a: string}>} faqs */
export function faqPage(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}
