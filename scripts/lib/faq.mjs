/** Extract FAQ schema from visible native accordions in either language. */
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

function extractVisibleFaqs(html, { itemClass, answerClass, questionClass, label, numbered = false }) {
  const faqs = [];
  for (const [, attributes, content] of html.matchAll(/<details\b([^>]*)>([\s\S]*?)<\/details>/gi)) {
    if (!hasClass(attributes, itemClass)) continue;
    const summary = content.match(/<summary\b[^>]*>([\s\S]*?)<\/summary>/i)?.[1];
    // Opening tags only, so the answer may sit inside wrapper divs; it must not contain a div itself.
    const opening = [...content.matchAll(/<div\b([^>]*)>/gi)].find(([, attrs]) => hasClass(attrs, answerClass));
    const answer = opening && content.slice(opening.index + opening[0].length).match(/^([\s\S]*?)<\/div>/i)?.[1];
    // With questionClass the summary also carries decorations; only that element is the question.
    const questionTag = questionClass && summary &&
      [...summary.matchAll(/<(\w+)\b([^>]*)>/gi)].find(([, , attrs]) => hasClass(attrs, questionClass));
    const question = questionClass
      ? questionTag && summary.slice(questionTag.index + questionTag[0].length).split(new RegExp(`</${questionTag[1]}>`, 'i'))[0]
      : numbered && summary
        ? summary.replace(/^\s*<span\b[^>]*>\s*\d+\s*<\/span>\s*/i, '')
        : summary;
    const q = question && plainText(question);
    const a = answer && plainText(answer);
    if (!q || !a) throw new Error(`${label} FAQ item is missing its visible question or answer.`);
    faqs.push({ q, a });
  }
  if (!faqs.length) throw new Error(`${label} page is missing its visible FAQ accordions.`);
  return faqs;
}

/** @returns {Array<{q: string, a: string}>} */
export function extractGoogleAdsFaqs(html) {
  return extractVisibleFaqs(html, {
    itemClass: 'gads-faq-item', answerClass: 'gads-faq-answer', label: 'Google Ads', numbered: true,
  });
}

/** @returns {Array<{q: string, a: string}>} */
export function extractHomeFaqs(html) {
  return extractVisibleFaqs(html, {
    itemClass: 'ect-home-faq__item', answerClass: 'ect-home-faq__answer', label: 'Homepage',
  });
}

/** @returns {Array<{q: string, a: string}>} */
export function extractFacebookAdsFaqs(html) {
  return extractVisibleFaqs(html, {
    itemClass: 'fb-faq', answerClass: 'fb-faq-a', questionClass: 'fb-faq-q', label: 'Facebook Ads',
  });
}
