/**
 * Read the Google Ads page's native details accordions so FAQ schema always
 * follows the visible copy, including the generated English translation.
 */
const entities = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', euro: '€',
  ndash: '–', hellip: '…', laquo: '«', raquo: '»',
  lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”',
};

function hasClass(attributes, name) {
  const classes = attributes.match(/(?:^|\s)class\s*=\s*(["'])(.*?)\1/i)?.[2] || '';
  return classes.split(/\s+/).includes(name);
}

function plainText(markup) {
  return markup
    .replace(/<!--[\s\S]*?-->|<(script|style|svg)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<span\b[^>]*\baria-hidden\s*=\s*(["'])true\1[^>]*>[\s\S]*?<\/span>/gi, '')
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

/** @returns {Array<{q: string, a: string}>} */
export function extractGoogleAdsFaqs(html) {
  const faqs = [];
  for (const [, attributes, content] of html.matchAll(/<details\b([^>]*)>([\s\S]*?)<\/details>/gi)) {
    if (!hasClass(attributes, 'gads-faq-item')) continue;
    const summary = content.match(/<summary\b[^>]*>([\s\S]*?)<\/summary>/i)?.[1];
    const answer = [...content.matchAll(/<div\b([^>]*)>([\s\S]*?)<\/div>/gi)]
      .find(([, attrs]) => hasClass(attrs, 'gads-faq-answer'))?.[2];
    const q = summary && plainText(summary.replace(/^\s*<span\b[^>]*>\s*\d+\s*<\/span>\s*/i, ''));
    const a = answer && plainText(answer);
    if (!q || !a) throw new Error('Google Ads FAQ item is missing its visible question or answer.');
    faqs.push({ q, a });
  }
  if (!faqs.length) throw new Error('Google Ads page is missing its visible FAQ accordions.');
  return faqs;
}
