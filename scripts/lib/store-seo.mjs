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
  if (!text) throw new Error(`Online shop pricing is missing its visible ${className} field.`);
  return text;
}

/** Romanian price formatting is decoded, never copied as a decimal JSON-LD price. */
function euroPrice(text) {
  const match = text.match(/^(\d{1,3}(?:[.\s]\d{3})+|\d+)(?:,(\d{2}))?\s*(?:€|EUR)$/);
  const amount = match && Number(`${match[1].replace(/[.\s]/g, '')}.${match[2] || '00'}`);
  if (!amount || !Number.isFinite(amount)) {
    throw new Error(`Online shop pricing has an unsupported or ambiguous EUR price: ${text}`);
  }
  return amount;
}

/**
 * Describe the displayed packages without maintaining a second price list.
 * A "de la" card uses minPrice, because it does not promise a fixed project price.
 */
export function storeOfferCatalog({ html, site, url, serviceName }) {
  const visibleHtml = html.replace(/<!--[\s\S]*?-->|<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
  const section = [...visibleHtml.matchAll(/<section\b([^>]*)>([\s\S]*?)<\/section>/gi)]
    .find(([, attributes]) => hasClass(attributes, 'mg-prices'))?.[2];
  if (!section) throw new Error('Online shop page is missing its visible pricing section.');
  const catalogUrl = `${site}${url}#cost`;
  const names = new Set();
  const offers = [];
  for (const [, attributes, content] of section.matchAll(/<article\b([^>]*)>([\s\S]*?)<\/article>/gi)) {
    if (!hasClass(attributes, 'mg-pcard')) continue;
    const name = field(content, 'h3', 'mg-pcard__title');
    if (names.has(name)) throw new Error(`Online shop pricing has a duplicate package: ${name}`);
    names.add(name);
    const price = euroPrice(field(content, 'p', 'mg-pcard__price'));
    const qualifier = field(content, 'p', 'mg-pcard__from').toLocaleLowerCase('ro');
    if (qualifier !== 'preț pachet' && qualifier !== 'de la') {
      throw new Error(`Online shop pricing has an unsupported price qualifier: ${qualifier}`);
    }
    offers.push({
      '@type': 'Offer',
      name,
      url: catalogUrl,
      ...(qualifier === 'de la'
        ? { priceSpecification: { '@type': 'PriceSpecification', minPrice: price, priceCurrency: 'EUR' } }
        : { price, priceCurrency: 'EUR' }),
      itemOffered: {
        '@type': 'Service',
        name: `${serviceName}: ${name}`,
        description: `${field(content, 'p', 'mg-pcard__for')}. ${field(content, 'ul', 'mg-pcard__list')}`,
        provider: { '@id': orgId(site) },
      },
    });
  }
  if (!offers.length) throw new Error('Online shop page is missing its visible pricing cards.');
  return {
    '@type': 'OfferCatalog',
    name: field(section, 'p', 'mg-prices__sub'),
    url: catalogUrl,
    itemListElement: offers,
  };
}
