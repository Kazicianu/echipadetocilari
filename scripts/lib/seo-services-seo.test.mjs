import test from 'node:test';
import assert from 'node:assert/strict';
import { seoServicesOfferCatalog } from './seo-services-seo.mjs';

const plus = '<li class="seo-price__plus"><a href="#inclus">Plus tot ce intră în toate pachetele</a></li>';

const card = (name, amt, forHtml, extra = '') => `
  <article class="seo-price${extra}">
    <h3 class="seo-price__name">${name}</h3>
    ${forHtml}
    <p class="seo-price__amt">${amt}</p>
    <ul class="seo-price__list"><li>1 pagină optimizată pe lună</li><li>Raport lunar</li>${plus}</ul>
    <a class="seo-btn" href="#formular_contact_bottom">Cere oferta</a>
  </article>`;

const page = (cards) => `<html><body><section class="seo-sec seo-sec--prices" id="preturi">
  <h2 class="seo-h2 seo-prices__title" id="seo-preturi-t">Cât costă: abonamente de la 299&nbsp;€ pe lună</h2>
  <div class="seo-prices">${cards}</div></section></body></html>`;

const cards = [
  card('Local', '299&nbsp;€<small>/ lună</small>', '<p class="seo-price__for">Pentru o firmă locală <span class="seo-todo">De confirmat</span></p>'),
  card('Creștere', '499&nbsp;€<small>/ lună</small>', '<p class="seo-price__for">Pentru o firmă în creștere</p>', ' seo-price--hot'),
  card('Avansat', '749&nbsp;€<small>/lună</small>', '<p class="seo-price__for">Pentru o firmă din toată țara</p>'),
  card('Premium', '1.190&nbsp;€<small>/ lună</small>', '<p class="seo-price__for">Pentru concurență mare</p>'),
];
const four = cards.join('');

const args = { site: 'https://example.ro', url: '/servicii-seo/', serviceName: 'Servicii SEO' };

test('builds a monthly OfferCatalog from the visible cards', () => {
  const catalog = seoServicesOfferCatalog({ html: page(four), ...args });
  assert.equal(catalog['@type'], 'OfferCatalog');
  assert.equal(catalog.name, 'Cât costă: abonamente de la 299 € pe lună');
  assert.equal(catalog.url, 'https://example.ro/servicii-seo/#preturi');
  const offers = catalog.itemListElement;
  assert.deepEqual(offers.map((o) => o.name), ['Local', 'Creștere', 'Avansat', 'Premium']);
  assert.deepEqual(offers.map((o) => o.priceSpecification.price), [299, 499, 749, 1190]);
  for (const o of offers) {
    assert.equal(o.priceSpecification.unitCode, 'MON');
    assert.equal(o.priceSpecification.priceCurrency, 'EUR');
    assert.equal(o.priceSpecification.valueAddedTaxIncluded, false);
  }
});

test('keeps the to-be-confirmed placeholder and the shared-groundwork link out of descriptions', () => {
  const [local, growth] = seoServicesOfferCatalog({ html: page(four), ...args }).itemListElement;
  assert.ok(!/De confirmat/.test(local.itemOffered.description));
  assert.ok(!/Plus tot ce intră/.test(local.itemOffered.description));
  assert.ok(local.itemOffered.description.includes('1 pagină optimizată pe lună, Raport lunar'));
  assert.ok(growth.itemOffered.description.startsWith('Pentru o firmă în creștere. '));
});

test('rejects pages without exactly four cards', () => {
  assert.throws(() => seoServicesOfferCatalog({ html: page(cards.slice(0, 3).join('')), ...args }), /exactly four/);
});

test('rejects a price that is not monthly euro', () => {
  const bad = four.replace('1.190&nbsp;€<small>/ lună</small>', '1.190&nbsp;€<small>/ an</small>');
  assert.throws(() => seoServicesOfferCatalog({ html: page(bad), ...args }), /monthly EUR/);
  const usd = four.replace('1.190&nbsp;€', '1.190 $');
  assert.throws(() => seoServicesOfferCatalog({ html: page(usd), ...args }), /monthly EUR/);
});
