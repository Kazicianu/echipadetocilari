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
    .replace(/<br\b[^>]*>|<\/(?:p|div|li|summary)>/gi, ' ')
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
  const tagNames = Array.isArray(tag) ? tag.join('|') : tag;
  const pattern = new RegExp(`<(${tagNames})\\b([^>]*)>([\\s\\S]*?)<\\/\\1>`, 'gi');
  const match = [...content.matchAll(pattern)].find(([, , attributes]) => hasClass(attributes, className));
  const text = match && plainText(match[3]);
  if (!text) throw new Error(`Applications pricing is missing its visible ${className} field.`);
  return text;
}

function euroPrice(text) {
  const match = text.match(/^(\d{1,3}(?:[.\s]\d{3})+|\d+)(?:,(\d{2}))?\s*(?:€|EUR)$/);
  const amount = match && Number(`${match[1].replace(/[.\s]/g, '')}.${match[2] || '00'}`);
  if (!amount || !Number.isFinite(amount)) {
    throw new Error(`Applications pricing has an unsupported or ambiguous EUR price: ${text}`);
  }
  return amount;
}

/** Use only the displayed packages and preserve every starting price as a minimum. */
export function appsOfferCatalog({ html, site, url, serviceName }) {
  const visibleHtml = html.replace(/<!--[\s\S]*?-->|<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
  const section = [...visibleHtml.matchAll(/<section\b([^>]*)>([\s\S]*?)<\/section>/gi)]
    .find(([, attributes]) => /(?:^|\s)id\s*=\s*(["'])cost\1/i.test(attributes))?.[2];
  if (!section) throw new Error('Applications page is missing its visible #cost pricing section.');
  const sectionText = plainText(section);
  if (/\[(?:PREȚ|PRET|N)\]/i.test(sectionText)) {
    throw new Error('Applications pricing still contains commercial placeholders.');
  }
  if (!/\bfără TVA\b/i.test(sectionText)) {
    throw new Error('Applications pricing is missing its visible tax-exclusive price condition.');
  }
  const catalogUrl = `${site}${url}#cost`;
  const names = new Set();
  const offers = [];
  for (const [, attributes, content] of section.matchAll(/<article\b([^>]*)>([\s\S]*?)<\/article>/gi)) {
    if (!hasClass(attributes, 'ap-pcard')) continue;
    const name = field(content, 'h3', 'ap-pcard__title');
    if (names.has(name)) throw new Error(`Applications pricing has a duplicate package: ${name}`);
    names.add(name);
    const qualifier = field(content, 'p', 'ap-pcard__from').toLocaleLowerCase('ro');
    if (qualifier !== 'de la') {
      throw new Error(`Applications pricing has an unsupported price qualifier: ${qualifier}`);
    }
    offers.push({
      '@type': 'Offer',
      name,
      url: catalogUrl,
      priceSpecification: {
        '@type': 'PriceSpecification',
        minPrice: euroPrice(field(content, 'p', 'ap-pcard__price')),
        priceCurrency: 'EUR',
        valueAddedTaxIncluded: false,
      },
      itemOffered: {
        '@type': 'Service',
        name: `${serviceName}: ${name}`,
        description: [
          field(content, 'p', 'ap-pcard__for'),
          field(content, 'ul', 'ap-pcard__list'),
          field(content, ['div', 'details'], 'ap-pcard__limits'),
        ].join(' '),
        provider: { '@id': orgId(site) },
      },
    });
  }
  if (offers.length !== 3) throw new Error('Applications page must display exactly three pricing cards.');
  return {
    '@type': 'OfferCatalog',
    name: field(section, 'p', 'ap-prices__sub'),
    url: catalogUrl,
    itemListElement: offers,
  };
}
