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

/** The first element with the class; its content must not repeat the same tag. */
function field(content, tag, className) {
  const pattern = new RegExp(`<(${tag})\\b([^>]*)>([\\s\\S]*?)<\\/\\1>`, 'gi');
  const match = [...content.matchAll(pattern)].find(([, , attributes]) => hasClass(attributes, className));
  const text = match && plainText(match[3]);
  if (!text) throw new Error(`Facebook Ads pricing is missing its visible ${className} field.`);
  return text;
}

function euroPrice(text) {
  const match = text.match(/^(\d{1,3}(?:\.\d{3})+|\d+)\s*€/);
  const amount = match && Number(match[1].replace(/\./g, ''));
  if (!amount || !Number.isFinite(amount)) {
    throw new Error(`Facebook Ads pricing has an unsupported or ambiguous EUR price: ${text}`);
  }
  return amount;
}

/** Monthly management fees exactly as the three visible package cards show them. */
export function facebookAdsOfferCatalog({ html, site, url, serviceName }) {
  const visibleHtml = html.replace(/<!--[\s\S]*?-->|<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
  const section = [...visibleHtml.matchAll(/<section\b([^>]*)>([\s\S]*?)<\/section>/gi)]
    .find(([, attributes]) => /(?:^|\s)id\s*=\s*(["'])costuri\1/i.test(attributes))?.[2];
  if (!section) throw new Error('Facebook Ads page is missing its visible #costuri pricing section.');
  if (/\[(?:PREȚ|PRET|N)\]|data-placeholder=/i.test(section)) {
    throw new Error('Facebook Ads pricing still contains commercial placeholders.');
  }
  const catalogUrl = `${site}${url}#pachete`;
  const names = new Set();
  const offers = [];
  for (const [, attributes, content] of section.matchAll(/<article\b([^>]*)>([\s\S]*?)<\/article>/gi)) {
    if (!hasClass(attributes, 'ect-price')) continue;
    const name = field(content, 'h4', 'ect-price__name');
    if (names.has(name)) throw new Error(`Facebook Ads pricing has a duplicate package: ${name}`);
    names.add(name);
    const amount = field(content, 'p', 'ect-price__amount');
    if (!/\/\s*lună$/.test(amount)) throw new Error(`Facebook Ads pricing is not monthly: ${amount}`);
    offers.push({
      '@type': 'Offer',
      name,
      url: catalogUrl,
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: euroPrice(amount),
        priceCurrency: 'EUR',
        unitCode: 'MON',
        unitText: 'lună',
        valueAddedTaxIncluded: false,
      },
      itemOffered: {
        '@type': 'Service',
        name: `${serviceName}: ${name}`,
        description: [
          field(content, 'p', 'ect-price__intro'),
          field(content, 'p', 'ect-price__limit'),
          field(content, 'ul', 'ect-price__list'),
        ].join(' '),
        provider: { '@id': orgId(site) },
      },
    });
  }
  if (offers.length !== 3) throw new Error('Facebook Ads page must display exactly three package cards.');
  return {
    '@type': 'OfferCatalog',
    name: field(section, 'h3', 'fb-pkg-title'),
    url: catalogUrl,
    itemListElement: offers,
  };
}
