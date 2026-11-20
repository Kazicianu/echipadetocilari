import { orgId } from './schema.mjs';

const entities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', euro: '€' };

function hasClass(attributes, name) {
  const classes = attributes.match(/(?:^|\s)class\s*=\s*(["'])(.*?)\1/i)?.[2] || '';
  return classes.split(/\s+/).includes(name);
}

function plainText(markup) {
  return markup
    .replace(/<!--[\s\S]*?-->|<(script|style|svg)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<br\b[^>]*>|<\/(?:p|div|li)>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, name) => {
      if (name[0] !== '#') return entities[name.toLowerCase()] ?? entity;
      const point = name[1].toLowerCase() === 'x'
        ? parseInt(name.slice(2), 16)
        : parseInt(name.slice(1), 10);
      return point > 0 && point <= 0x10ffff && !(point >= 0xd800 && point <= 0xdfff)
        ? String.fromCodePoint(point)
        : '�';
    })
    .replace(/\s+/g, ' ')
    .trim();
}

/** The first element with the class, as { text, raw }, or null; its content must not repeat the same tag. */
function find(content, tag, className) {
  const pattern = new RegExp(`<(${tag})\\b([^>]*)>([\\s\\S]*?)<\\/\\1>`, 'gi');
  const match = [...content.matchAll(pattern)].find(([, , attributes]) => hasClass(attributes, className));
  return match ? { text: plainText(match[3]), raw: match[3] } : null;
}

function field(content, tag, className) {
  const found = find(content, tag, className);
  if (!found?.text) throw new Error(`SEO services pricing is missing its visible ${className} field.`);
  return found.text;
}

function monthlyEuro(text) {
  const match = text.match(/^(\d{1,3}(?:\.\d{3})+|\d+)\s*€\s*\/\s*lună$/);
  const amount = match && Number(match[1].replace(/\./g, ''));
  if (!amount || !Number.isFinite(amount)) {
    throw new Error(`SEO services pricing must be a monthly EUR price: ${text}`);
  }
  return amount;
}

/** Monthly plans exactly as the three visible price cards show them. */
export function seoServicesOfferCatalog({ html, site, url, serviceName }) {
  const visibleHtml = html.replace(/<!--[\s\S]*?-->|<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
  const section = [...visibleHtml.matchAll(/<section\b([^>]*)>([\s\S]*?)<\/section>/gi)]
    .find(([, attributes]) => /(?:^|\s)id\s*=\s*(["'])preturi\1/i.test(attributes))?.[2];
  if (!section) throw new Error('SEO services page is missing its visible #preturi pricing section.');
  const catalogUrl = `${site}${url}#preturi`;
  const names = new Set();
  const offers = [];
  for (const [, attributes, content] of section.matchAll(/<article\b([^>]*)>([\s\S]*?)<\/article>/gi)) {
    if (!hasClass(attributes, 'seo-price')) continue;
    const name = field(content, 'h3', 'seo-price__name');
    if (names.has(name)) throw new Error(`SEO services pricing has a duplicate plan: ${name}`);
    names.add(name);
    const price = monthlyEuro(field(content, 'p', 'seo-price__amt'));
    const audience = find(content, 'p', 'seo-price__for');
    const audienceText = audience && !/seo-todo/.test(audience.raw) ? audience.text : '';
    const items = [...(find(content, 'ul', 'seo-price__list')?.raw.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi) ?? [])]
      .map(([, item]) => plainText(item))
      .filter(Boolean);
    if (!items.length) throw new Error(`SEO services pricing has no list items for ${name}.`);
    offers.push({
      '@type': 'Offer',
      name,
      url: catalogUrl,
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price,
        priceCurrency: 'EUR',
        unitCode: 'MON',
        unitText: 'lună',
        valueAddedTaxIncluded: false,
      },
      itemOffered: {
        '@type': 'Service',
        name: `${serviceName}: ${name}`,
        description: [audienceText, items.join(', ')].filter(Boolean).join('. '),
        provider: { '@id': orgId(site) },
      },
    });
  }
  if (offers.length !== 3) throw new Error('SEO services page must display exactly three price cards.');
  return {
    '@type': 'OfferCatalog',
    name: field(section, 'h2', 'seo-prices__title'),
    url: catalogUrl,
    itemListElement: offers,
  };
}
