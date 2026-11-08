import { orgId } from './schema.mjs';

const entities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', euro: '€' };

function hasClass(attributes, name) {
  const classes = attributes.match(/(?:^|\s)class\s*=\s*(["'])(.*?)\1/i)?.[2] || '';
  return classes.split(/\s+/).includes(name);
}

function plainText(markup) {
  return markup
    .replace(/<!--[\s\S]*?-->|<(script|style|svg)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<span\b[^>]*\baria-hidden\s*=\s*(["'])true\1[^>]*>[\s\S]*?<\/span>/gi, '')
    .replace(/<br\b[^>]*>|<\/(?:p|li)>/gi, ' ')
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

function field(content, tag, className) {
  const pattern = new RegExp(`<${tag}\\b([^>]*)>([\\s\\S]*?)<\\/${tag}>`, 'gi');
  const match = [...content.matchAll(pattern)].find(([, attributes]) => hasClass(attributes, className));
  const text = match && plainText(match[2]);
  if (!text) throw new Error(`Website pricing is missing its visible ${className} field.`);
  return text;
}

/** The card's bullet points, joined as a readable list. */
function listItems(content) {
  const list = [...content.matchAll(/<ul\b([^>]*)>([\s\S]*?)<\/ul>/gi)]
    .find(([, attributes]) => hasClass(attributes, 'csw-pcard__list'))?.[2];
  const items = list ? [...list.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map(([, li]) => plainText(li)).filter(Boolean) : [];
  if (!items.length) throw new Error('Website pricing is missing its visible csw-pcard__list field.');
  return items.join(', ');
}

/** Romanian price formatting is decoded, never copied as a decimal JSON-LD price. */
function euroPrice(text) {
  const match = text.match(/^(\d{1,3}(?:[.\s]\d{3})+|\d+)(?:,(\d{2}))?\s*(?:€|EUR)$/);
  const amount = match && Number(`${match[1].replace(/[.\s]/g, '')}.${match[2] || '00'}`);
  if (!amount || !Number.isFinite(amount)) {
    throw new Error(`Website pricing has an unsupported or ambiguous EUR price: ${text}`);
  }
  return amount;
}

/**
 * Describe the displayed packages without maintaining a second price list.
 * "de la" + EUR price becomes a minPrice; "preț" + "pe proiect" is an offer without a price.
 */
export function websiteOfferCatalog({ html, site, url, serviceName }) {
  const visibleHtml = html.replace(/<!--[\s\S]*?-->|<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
  const section = [...visibleHtml.matchAll(/<section\b([^>]*)>([\s\S]*?)<\/section>/gi)]
    .find(([, attributes]) => hasClass(attributes, 'csw-prices'))?.[2];
  if (!section) throw new Error('Website page is missing its visible pricing section.');
  const catalogUrl = `${site}${url}#preturi`;
  const names = new Set();
  const offers = [];
  for (const [, attributes, content] of section.matchAll(/<article\b([^>]*)>([\s\S]*?)<\/article>/gi)) {
    if (!hasClass(attributes, 'csw-pcard')) continue;
    const name = field(content, 'h3', 'csw-pcard__title');
    if (names.has(name)) throw new Error(`Website pricing has a duplicate package: ${name}`);
    names.add(name);
    const qualifier = field(content, 'p', 'csw-pcard__from').toLocaleLowerCase('ro');
    const priceText = field(content, 'p', 'csw-pcard__price');
    let pricing;
    if (qualifier === 'de la') {
      pricing = { priceSpecification: { '@type': 'PriceSpecification', minPrice: euroPrice(priceText), priceCurrency: 'EUR' } };
    } else if (qualifier === 'preț' && priceText.toLocaleLowerCase('ro') === 'pe proiect') {
      pricing = {};
    } else {
      throw new Error(`Website pricing has an unsupported price qualifier: ${qualifier} / ${priceText}`);
    }
    offers.push({
      '@type': 'Offer',
      name,
      url: catalogUrl,
      ...pricing,
      itemOffered: {
        '@type': 'Service',
        name: `${serviceName}: ${name}`,
        description: `${field(content, 'p', 'csw-pcard__for').replace(/\.$/, '')}: ${listItems(content)}.`,
        provider: { '@id': orgId(site) },
      },
    });
  }
  if (!offers.length) throw new Error('Website page is missing its visible pricing cards.');
  return {
    '@type': 'OfferCatalog',
    name: field(section, 'h2', 'csw-prices__title'),
    url: catalogUrl,
    itemListElement: offers,
  };
}

const PLACEHOLDERS = /De completat|De confirmat|To be completed|To be confirmed/i;

/** FAQPage only gets answers that are complete: placeholders stay out of structured data. */
export function answeredFaqs(faqs) {
  return faqs.filter(({ a }) => !PLACEHOLDERS.test(a));
}
