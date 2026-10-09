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
 */
export function organization({ site, lang, description, knowsAbout, address, telephone }) {
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

export function webPage({ site, lang, url, name, description }) {
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
  };
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
