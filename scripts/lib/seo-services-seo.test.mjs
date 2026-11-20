import test from 'node:test';
import assert from 'node:assert/strict';
import { seoServicesOfferCatalog } from './seo-services-seo.mjs';

const card = (name, amt, forHtml, extra = '') => `
  <article class="seo-price${extra}">
    <h3 class="seo-price__name">${name}</h3>
    ${forHtml}
    <p class="seo-price__amt">${amt}</p>
    <ul class="seo-price__list"><li>1 pagină optimizată pe lună</li><li>Raport lunar</li></ul>
    <a class="seo-btn" href="#formular_contact_bottom">Cere oferta</a>
  </article>`;

const page = (cards) => `<html><body><section class="seo-sec seo-sec--prices" id="preturi">
  <h2 class="seo-h2 seo-prices__title" id="seo-preturi-t">Cât costă: abonamente de la 439 € pe lună</h2>
  <div class="seo-prices">${cards}</div></section></body></html>`;

const cards = [
  card('SEO Start', '439 €<small>/ lună</small>', '<p class="seo-price__for">Pentru o firmă locală <span class="seo-todo">De confirmat</span></p>'),
  card('SEO Avansat', '699 €<small>/ lună</small>', '<p class="seo-price__for">Pentru o firmă în creștere</p>', ' seo-price--hot'),
  card('SEO Premium', '999 €<small>/lună</small>', '<p class="seo-price__for">Pentru magazine</p>'),
];
const three = cards.join('');

const args = { site: 'https://example.ro', url: '/servicii-seo/', serviceName: 'Servicii SEO' };

test('builds a monthly OfferCatalog from the visible cards', () => {
  const catalog = seoServicesOfferCatalog({ html: page(three), ...args });
  assert.equal(catalog['@type'], 'OfferCatalog');
  assert.equal(catalog.name, 'Cât costă: abonamente de la 439 € pe lună');
  assert.equal(catalog.url, 'https://example.ro/servicii-seo/#preturi');
  const offers = catalog.itemListElement;
  assert.deepEqual(offers.map((o) => o.name), ['SEO Start', 'SEO Avansat', 'SEO Premium']);
  assert.deepEqual(offers.map((o) => o.priceSpecification.price), [439, 699, 999]);
  for (const o of offers) {
    assert.equal(o.priceSpecification.unitCode, 'MON');
    assert.equal(o.priceSpecification.priceCurrency, 'EUR');
    assert.equal(o.priceSpecification.valueAddedTaxIncluded, false);
  }
});

test('keeps the to-be-confirmed placeholder out of descriptions', () => {
  const [start, advanced] = seoServicesOfferCatalog({ html: page(three), ...args }).itemListElement;
  assert.ok(!/De confirmat/.test(start.itemOffered.description));
  assert.ok(start.itemOffered.description.includes('1 pagină optimizată pe lună, Raport lunar'));
  assert.ok(advanced.itemOffered.description.startsWith('Pentru o firmă în creștere. '));
});

test('rejects pages without exactly three cards', () => {
  assert.throws(() => seoServicesOfferCatalog({ html: page(cards.slice(0, 2).join('')), ...args }), /exactly three/);
});

test('rejects a price that is not monthly euro', () => {
  const bad = three.replace('999 €<small>/lună</small>', '999 €<small>/ an</small>');
  assert.throws(() => seoServicesOfferCatalog({ html: page(bad), ...args }), /monthly EUR/);
  const usd = three.replace('999 €', '999 $');
  assert.throws(() => seoServicesOfferCatalog({ html: page(usd), ...args }), /monthly EUR/);
});
