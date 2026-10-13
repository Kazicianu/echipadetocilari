import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { roPageMeta } from '../i18n/meta-ro.mjs';

const read = file => readFileSync(new URL(`../../${file}`, import.meta.url), 'utf8');
const page = read('legacy-mirror/creare-magazin-online/index.html');
const css = read('legacy-mirror/wp-content/ect-pages/creare-magazin-online.css');
const main = page.match(/<main\b[\s\S]*<\/main>/i)?.[0] ?? '';
const text = markup => markup
  .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
  .replace(/<[^>]*>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

/** The element that opens at `start`, up to its matching closing div. */
function divBlock(html, start) {
  const tag = /<(\/?)div\b[^>]*>/gi;
  tag.lastIndex = start;
  let depth = 0;
  for (let match; (match = tag.exec(html));) {
    depth += match[1] ? -1 : 1;
    if (depth === 0) return html.slice(start, tag.lastIndex);
  }
  return '';
}

test('store page keeps descriptive H2 headings, with the brand lines as paragraphs', () => {
  const headings = [...main.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)].map(([, inner]) => text(inner));
  assert.deepEqual(headings, [
    'Pentru cine e',
    'Ce include crearea unui magazin online',
    'Cum lucrăm',
    'Cât costă crearea unui magazin online?',
    'Ce intră în preț și ce nu',
    'Întrebări frecvente',
    'După lansare',
  ]);
  assert.equal([...main.matchAll(/<h1\b/gi)].length, 1);
});

test('every labelled section points at a heading that exists on the page', () => {
  const labels = [...main.matchAll(/<section\b[^>]*\baria-labelledby="([^"]+)"/gi)].map(([, id]) => id);
  assert.ok(labels.length >= 8);
  for (const id of labels) {
    assert.match(main, new RegExp(`<h[12]\\b[^>]*\\bid="${id}"`), `aria-labelledby="${id}" has no h1 or h2 target`);
  }
});

test('the FAQ brand line is styled by class, so the label heading cannot inherit title styles', () => {
  assert.match(main, /<p class="ect-home-faq__title">/);
  assert.match(css, /\.ect-home-faq \.ect-home-faq__title\s*\{/);
  assert.doesNotMatch(css, /\.ect-home-faq h2\b/);
});

test('the illustrative phone is excluded from snippets and holds all the invented shop text', () => {
  const opening = main.match(/<div\b(?=[^>]*\bclass="[^"]*\bmg-hero-visual\b)(?=[^>]*\bdata-nosnippet\b)[^>]*>/);
  assert.ok(opening, 'mg-hero-visual is missing data-nosnippet');
  const block = divBlock(main, opening.index);
  assert.match(block, /Atelier Lut/);
  const outside = main.replace(block, '');
  for (const invented of ['Atelier Lut', 'Cana Dimineață', '#1042']) {
    assert.equal(outside.includes(invented), false, `"${invented}" appears outside the excluded block`);
  }
});

test('share images use absolute URLs', () => {
  for (const name of ['property="og:image"', 'name="twitter:image"']) {
    const content = page.match(new RegExp(`<meta ${name} content="([^"]*)"`))?.[1];
    assert.match(content ?? '', /^https:\/\/www\.echipadetocilari\.ro\//, `${name} is not absolute`);
  }
});

test('Start and Business are Shopify packages; only Avansat offers Shopify or Medusa', () => {
  const cards = Object.fromEntries(
    [...main.matchAll(/<article\b[^>]*\bmg-pcard\b[^>]*>([\s\S]*?)<\/article>/gi)]
      .map(([, card]) => [text(card.match(/<h3\b[^>]*>([\s\S]*?)<\/h3>/i)?.[1] ?? ''), text(card)]),
  );
  assert.deepEqual(Object.keys(cards), ['Start', 'Business', 'Avansat']);
  for (const name of ['Start', 'Business']) {
    assert.match(cards[name], /Shopify/);
    assert.doesNotMatch(cards[name], /Medusa/);
  }
  assert.match(cards.Avansat, /Shopify sau Medusa/);
});

test('the platform rule is stated where packages are explained, and the hero price stays with Shopify', () => {
  const hero = text(main.slice(main.indexOf('<h1'), main.indexOf('class="mg-hero-actions"')));
  assert.match(hero, /1\.490 €/);
  assert.match(hero, /Shopify/);
  assert.doesNotMatch(hero, /Medusa/);
  const subtitle = text(main.match(/<p class="mg-prices__sub">([\s\S]*?)<\/p>/)?.[1] ?? '');
  assert.match(subtitle, /Start și Business pe Shopify/);
  assert.match(subtitle, /Avansat pe Shopify sau Medusa/);
  assert.match(text(main), /Start și Business se construiesc pe Shopify; Avansat, pe Shopify sau Medusa\./);
  // The integrations promise sits in the "În preț" panel, so its Medusa exception must sit there too.
  const included = text(main.match(/<div class="mg-scope__panel mg-scope__panel--in">([\s\S]*?)<div class="mg-scope__panel mg-scope__panel--out">/)?.[1] ?? '');
  assert.match(included, /conectori standard compatibili\. La Medusa, integrările se estimează separat\./);
  // The E-commerce card on the website page mirrors Start.
  assert.doesNotMatch(text(read('legacy-mirror/creare-site-web/index.html')), /Magazin construit pe [^.]*Medusa/);
});

test('the store copy and metadata never bring back WooCommerce or tie the entry price to Medusa', () => {
  const visible = text(main);
  const { description } = roPageMeta['/creare-magazin-online/'];
  assert.match(description, /Shopify/);
  // 1.490 € is the Start price, and Start is a Shopify package.
  assert.doesNotMatch(description, /Medusa/);
  assert.doesNotMatch(`${visible} ${description}`, /WooCommerce|WordPress/i);
  // The build overwrites the head copy with meta-ro.mjs; keep the mirror in step with it.
  assert.equal(page.match(/<meta name="description" content="([^"]*)"/)?.[1], description);
  assert.doesNotMatch(text(read('legacy-mirror/creare-site-web/index.html')), /WooCommerce/i);
  for (const file of ['scripts/i18n/dictionary.mjs', 'scripts/i18n/meta-ro.mjs', 'scripts/build-static.mjs']) {
    assert.doesNotMatch(read(file), /WooCommerce/i, `${file} still mentions WooCommerce`);
  }
});

test('the recommended badge follows the Business title inside its card', () => {
  assert.match(main, /<h3 class="mg-pcard__title">Business<\/h3>\s*<p class="mg-pcard__badge">Recomandat<\/p>/);
});
