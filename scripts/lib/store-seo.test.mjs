import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { storeOfferCatalog } from './store-seo.mjs';

const source = readFileSync(new URL('../../legacy-mirror/creare-magazin-online/index.html', import.meta.url), 'utf8');
const options = { site: 'https://www.echipadetocilari.ro', url: '/creare-magazin-online/', serviceName: 'Creare magazin online' };
const catalog = html => storeOfferCatalog({ ...options, html });

test('real packages use the displayed prices, with Avansat represented only as a minimum', () => {
  const result = catalog(source);
  assert.equal(result['@type'], 'OfferCatalog');
  assert.deepEqual(result.itemListElement.map(offer => offer.name), ['Start', 'Business', 'Avansat']);
  const [start, business, advanced] = result.itemListElement;
  assert.equal(start.price, 1490);
  assert.equal(business.price, 2490);
  assert.equal(start.priceCurrency, 'EUR');
  assert.equal(business.priceCurrency, 'EUR');
  assert.deepEqual(advanced.priceSpecification, { '@type': 'PriceSpecification', minPrice: 4490, priceCurrency: 'EUR' });
  assert.ok(!Object.hasOwn(advanced, 'price'));
  assert.ok(!Object.hasOwn(advanced.priceSpecification, 'price'));
  assert.ok(!Object.hasOwn(advanced.priceSpecification, 'maxPrice'));
  assert.match(start.itemOffered.description, /25 produse manual sau 100 din CSV pregătit/);
  assert.match(business.itemOffered.description, /50 produse manual sau 500 din CSV, în total/);
  assert.match(advanced.itemOffered.description, /Catalog stabilit în oferta scrisă/);
  assert.equal(start.itemOffered['@type'], 'Service');
  assert.deepEqual(start.itemOffered.provider, { '@id': `${options.site}/#organization` });
  assert.doesNotMatch(JSON.stringify(result), /availability|valueAddedTaxIncluded|aggregateRating|review|priceValidUntil/);
});

test('visible copy is the source of truth when prices, descriptions and package names change', () => {
  const html = source
    .replace('<p class="mg-pcard__price">1.490 €</p>', '<p class="mg-pcard__price">1.690 €</p>')
    .replace('<h3 class="mg-pcard__title">Start</h3>', '<h3 class="mg-pcard__title">Lansare</h3>')
    .replace('25 produse manual sau 100 din CSV pregătit', '30 produse manual sau 120 din CSV pregătit');
  const offer = catalog(html).itemListElement[0];
  assert.equal(offer.name, 'Lansare');
  assert.equal(offer.price, 1690);
  assert.equal(offer.itemOffered.name, 'Creare magazin online: Lansare');
  assert.match(offer.itemOffered.description, /30 produse manual sau 120 din CSV pregătit/);
});

test('Romanian grouping, decimal cents and HTML entities convert to numeric EUR prices', () => {
  const html = source.replace('<p class="mg-pcard__price">1.490 €</p>', '<p class="mg-pcard__price">1&nbsp;490,50 &#x20ac;</p>');
  assert.equal(catalog(html).itemListElement[0].price, 1490.5);
});

test('the visible price qualifier decides whether any package has a fixed or minimum price', () => {
  const html = source.replace('<p class="mg-pcard__from">preț pachet</p>', '<p class="mg-pcard__from">de la</p>');
  const offer = catalog(html).itemListElement[0];
  assert.ok(!Object.hasOwn(offer, 'price'));
  assert.equal(offer.priceSpecification.minPrice, 1490);
});

test('missing or ambiguous commercial data fails instead of emitting misleading schema', () => {
  assert.throws(() => catalog('<section data-class="mg-prices"></section>'), /missing its visible pricing section/);
  assert.throws(() => catalog(source.replace('<h3 class="mg-pcard__title">Start</h3>', '')), /missing its visible mg-pcard__title/);
  assert.throws(() => catalog(source.replace('<p class="mg-pcard__price">1.490 €</p>', '<p class="mg-pcard__price">1.4 €</p>')), /ambiguous EUR price/);
  assert.throws(() => catalog(source.replace('<p class="mg-pcard__from">preț pachet</p>', '<p class="mg-pcard__from">estimativ</p>')), /unsupported price qualifier/);
  assert.throws(() => catalog(source.replace('<h3 class="mg-pcard__title">Business</h3>', '<h3 class="mg-pcard__title">Start</h3>')), /duplicate package/);
});

test('decorative icons and commented cards cannot inject commercial data into the catalog', () => {
  const html = source.replace('<div class="mg-prices__row">', '<div class="mg-prices__row"><!-- <article class="mg-pcard"><h3 class="mg-pcard__title">Hidden</h3></article> -->');
  const result = catalog(html);
  assert.equal(result.itemListElement.length, 3);
  assert.doesNotMatch(JSON.stringify(result), /<svg|<path|<li|Hidden/);
});
