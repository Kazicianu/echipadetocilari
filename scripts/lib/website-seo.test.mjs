import assert from 'node:assert/strict';
import test from 'node:test';
import { answeredFaqs, websiteOfferCatalog } from './website-seo.mjs';

const options = { site: 'https://www.echipadetocilari.ro', url: '/creare-site-web/', serviceName: 'Creare site web' };

const card = ({ title, from = 'de la', price, extra = '' }) => `
  <article class="csw-pcard${extra}">
    <p class="csw-pcard__badge">Badge</p>
    <h3 class="csw-pcard__title">${title}</h3>
    <p class="csw-pcard__for">Pentru ${title}.</p>
    <p class="csw-pcard__from">${from}</p>
    <p class="csw-pcard__price">${price}</p>
    <ul class="csw-pcard__list"><li>Unu</li><li>Doi</li></ul>
    <a href="#contact">Cere ofertă</a>
  </article>`;

const page = (cards = [
  card({ title: 'Landing page', price: '299&nbsp;€' }),
  card({ title: 'Site de prezentare', price: '499&nbsp;€', extra: ' csw-pcard--on' }),
  card({ title: 'Magazin online', price: '1.490&nbsp;€' }),
  card({ title: 'Proiect custom', from: 'preț', price: 'pe proiect', extra: ' csw-pcard--x' }),
].join('')) => `<section class="csw-prices x" id="preturi">
  <h2 class="csw-prices__title">Cât costă un site web în 2026?</h2>${cards}</section>`;

const catalog = html => websiteOfferCatalog({ ...options, html });

test('three "de la" cards become minPrice offers and the custom project has no price', () => {
  const result = catalog(page());
  assert.equal(result['@type'], 'OfferCatalog');
  assert.equal(result.name, 'Cât costă un site web în 2026?');
  assert.equal(result.url, 'https://www.echipadetocilari.ro/creare-site-web/#preturi');
  const offers = result.itemListElement;
  assert.deepEqual(offers.map(o => o.name), ['Landing page', 'Site de prezentare', 'Magazin online', 'Proiect custom']);
  assert.deepEqual(offers.slice(0, 3).map(o => o.priceSpecification.minPrice), [299, 499, 1490]);
  for (const offer of offers.slice(0, 3)) {
    assert.equal(offer.priceSpecification.priceCurrency, 'EUR');
    assert.ok(!Object.hasOwn(offer, 'price'));
  }
  const custom = offers[3];
  assert.ok(!Object.hasOwn(custom, 'price'));
  assert.ok(!Object.hasOwn(custom, 'priceSpecification'));
  assert.equal(custom.itemOffered['@type'], 'Service');
  assert.equal(custom.itemOffered.name, 'Creare site web: Proiect custom');
  assert.match(custom.itemOffered.description, /Proiect custom: Unu, Doi./);
  assert.deepEqual(custom.itemOffered.provider, { '@id': `${options.site}/#organization` });
});

test('unknown qualifiers and mismatched custom pricing throw', () => {
  assert.throws(() => catalog(page(card({ title: 'A', from: 'estimativ', price: '299 €' }))), /unsupported price qualifier/);
  assert.throws(() => catalog(page(card({ title: 'A', from: 'preț', price: '299 €' }))), /unsupported price qualifier/);
});

test('ambiguous prices and missing sections throw', () => {
  assert.throws(() => catalog(page(card({ title: 'A', price: '1.4 €' }))), /ambiguous EUR price/);
  assert.throws(() => catalog('<section class="other"></section>'), /missing its visible pricing section/);
  assert.throws(() => catalog(page('')), /missing its visible pricing cards/);
  const dup = card({ title: 'A', price: '299 €' });
  assert.throws(() => catalog(page(dup + dup)), /duplicate package/);
});

test('commented cards cannot inject offers', () => {
  const html = page(`<!-- ${card({ title: 'Hidden', price: '9 €' })} -->` + card({ title: 'A', price: '299 €' }));
  const result = catalog(html);
  assert.equal(result.itemListElement.length, 1);
  assert.doesNotMatch(JSON.stringify(result), /Hidden/);
});

test('answeredFaqs drops Romanian and English placeholder answers', () => {
  const faqs = [
    { q: 'Q1', a: 'Răspuns complet.' },
    { q: 'Q2', a: 'Durează De completat: durata.' },
    { q: 'Q3', a: 'Cine? De confirmat: proprietar.' },
    { q: 'Q4', a: 'Complete answer.' },
    { q: 'Q5', a: 'Takes To be completed: duration.' },
    { q: 'Q6', a: 'Owner: To be confirmed: owner.' },
  ];
  assert.deepEqual(answeredFaqs(faqs).map(f => f.q), ['Q1', 'Q4']);
});
