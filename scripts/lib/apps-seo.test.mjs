import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { appsOfferCatalog } from './apps-seo.mjs';
import { extractHomeFaqs } from './faq.mjs';

const options = { site: 'https://www.echipadetocilari.ro', url: '/dezvoltare-aplicatii/', serviceName: 'Dezvoltare aplicații mobile și web' };
const catalog = html => appsOfferCatalog({ ...options, html });
const source = readFileSync(new URL('../../legacy-mirror/dezvoltare-aplicatii/index.html', import.meta.url), 'utf8');

function card(name, price, screens) {
  return `<article class="ap-pcard">
    <h3 class="ap-pcard__title">${name}</h3>
    <p class="ap-pcard__for">Pentru echipe și clienți</p>
    <p class="ap-pcard__from">de la</p>
    <p class="ap-pcard__price">${price} €</p>
    <ul class="ap-pcard__list"><li>Maximum ${screens} ecrane</li><li>Backend și bază de date</li></ul>
    <details class="ap-pcard__limits"><summary>Limitele pachetului</summary><p>Integrările suplimentare se estimează separat.</p></details>
  </article>`;
}

const fixture = `<section id="cost" class="ap-prices">
  <p class="ap-prices__sub">Pachete pentru aplicația ta</p>
  <p>Prețuri de pornire, fără TVA.</p>
  ${card('Start', '4.900', 5)}${card('Business', '9.900', 12)}${card('Avansat', '19.900', 20)}
</section>`;

test('all three approved real packages use minimum EUR prices and exclude TVA explicitly', () => {
  const result = catalog(source);
  assert.equal(result['@type'], 'OfferCatalog');
  assert.equal(result.url, `${options.site}${options.url}#cost`);
  assert.deepEqual(result.itemListElement.map(offer => offer.name), ['Start', 'Business', 'Avansat']);
  for (const [index, offer] of result.itemListElement.entries()) {
    assert.deepEqual(offer.priceSpecification, {
      '@type': 'PriceSpecification', minPrice: [4900, 9900, 19900][index], priceCurrency: 'EUR', valueAddedTaxIncluded: false,
    });
    assert.ok(!Object.hasOwn(offer, 'price'));
    assert.ok(!Object.hasOwn(offer.priceSpecification, 'price'));
    assert.ok(!Object.hasOwn(offer.priceSpecification, 'maxPrice'));
    assert.equal(offer.itemOffered['@type'], 'Service');
    assert.deepEqual(offer.itemOffered.provider, { '@id': `${options.site}/#organization` });
    assert.ok(offer.itemOffered.description.length > 100);
  }
  assert.doesNotMatch(JSON.stringify(result), /\[(?:PREȚ|PRET|N)\]|aggregateRating|priceValidUntil|availability/);
});

test('package names, prices, services and limits come from visible markup, without a second commercial list', () => {
  const changed = fixture
    .replace('>Start</h3>', '>Lansare</h3>')
    .replace('4.900 €', '5.200 €')
    .replace('Maximum 5 ecrane', 'Maximum 6 ecrane')
    .replace('Integrările suplimentare se estimează separat.', 'Include un singur flux principal.');
  const offer = catalog(changed).itemListElement[0];
  assert.equal(offer.name, 'Lansare');
  assert.equal(offer.priceSpecification.minPrice, 5200);
  assert.equal(offer.itemOffered.name, `${options.serviceName}: Lansare`);
  assert.match(offer.itemOffered.description, /Maximum 6 ecrane/);
  assert.match(offer.itemOffered.description, /Include un singur flux principal\./);
});

test('Romanian price separators and encoded Euro currency become numeric minimum prices', () => {
  const changed = fixture.replace('4.900 €', '4&nbsp;900,50 &#x20ac;');
  assert.equal(catalog(changed).itemListElement[0].priceSpecification.minPrice, 4900.5);
});

test('permanently visible limits and native disclosure limits describe the same offer', () => {
  const expanded = fixture
    .replaceAll('<details class="ap-pcard__limits">', '<div class="ap-pcard__limits">')
    .replaceAll('<summary>Limitele pachetului</summary>', '<p>Limitele pachetului</p>')
    .replaceAll('</details>', '</div>');
  assert.deepEqual(catalog(expanded), catalog(fixture));
});

test('every package must keep the visible starting-price qualifier', () => {
  for (const index of [0, 1, 2]) {
    let count = -1;
    const changed = fixture.replace(/>de la<\/p>/g, value => ++count === index ? '>preț fix</p>' : value);
    assert.throws(() => catalog(changed), /unsupported price qualifier/);
  }
});

test('missing, ambiguous or duplicated commercial content fails instead of emitting a misleading offer', () => {
  assert.throws(() => catalog(fixture.replace('id="cost"', 'data-id="cost"')), /missing its visible #cost/);
  assert.throws(() => catalog(fixture.replace('4.900 €', '4.9 €')), /ambiguous EUR price/);
  assert.throws(() => catalog(fixture.replace('>Business</h3>', '>Start</h3>')), /duplicate package/);
  assert.throws(() => catalog(fixture.replace('fără TVA', 'TVA inclus')), /tax-exclusive price condition/);
  assert.throws(() => catalog(fixture.replace(/<details class="ap-pcard__limits">[\s\S]*?<\/details>/, '')), /missing its visible ap-pcard__limits/);
  assert.throws(() => catalog(fixture.replace(card('Business', '9.900', 12), '')), /exactly three pricing cards/);
});

test('placeholders in prices, services or contractual limits cannot reach JSON-LD', () => {
  for (const [find, placeholder] of [['4.900 €', '[PREȚ]'], ['Maximum 5 ecrane', 'Maximum [N] ecrane'], ['suplimentare', '[N]']]) {
    assert.throws(() => catalog(fixture.replace(find, placeholder)), /commercial placeholders/);
  }
});

test('comments, unrelated sections and decorative icons cannot add packages or pollute their descriptions', () => {
  const changed = `<section id="unrelated">${card('Unrelated', '50.000', 50)}</section>${fixture}`
    .replace('<p class="ap-pcard__for">', '<!-- ' + card('Commented', '1', 1) + ' --><p class="ap-pcard__for">')
    .replace('<li>Maximum 5 ecrane', '<li><span aria-hidden="true">✓</span><svg><path>icon</path></svg>Maximum 5 ecrane');
  const result = catalog(changed);
  assert.equal(result.itemListElement.length, 3);
  assert.doesNotMatch(JSON.stringify(result), /Unrelated|Commented|icon|✓|<svg|<path|<li/);
});

test('application FAQ schema takes all questions and approved prices from the visible FAQ', () => {
  const faqs = extractHomeFaqs(source);
  assert.ok(faqs.length >= 5);
  assert.ok(faqs.every(({ q, a }) => q.length > 10 && a.length > 30));
  assert.match(faqs.map(({ a }) => a).join(' '), /4\.900 €/);
  assert.match(faqs.map(({ a }) => a).join(' '), /9\.900 €/);
  assert.match(faqs.map(({ a }) => a).join(' '), /19\.900 €/);
  assert.doesNotMatch(JSON.stringify(faqs), /\[(?:PREȚ|PRET|N)\]/);
});
