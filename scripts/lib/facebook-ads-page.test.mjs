import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractFacebookAdsFaqs } from './faq.mjs';
import { routeByRo, isOwnedPage, roToEn } from '../i18n/routes.mjs';
import { roPageMeta } from '../i18n/meta-ro.mjs';
import { serviceMenuCopy } from './desktop-header.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const mirror = path.join(root, 'legacy-mirror');
const read = file => readFileSync(path.join(mirror, file), 'utf8');
const page = read('agentie-facebook-ads/index.html');
const main = page.slice(page.indexOf('<main id="content">'), page.indexOf('</main>'));

test('Facebook Ads route is owned in Romanian only, with its own meta and menu copy', () => {
  const route = routeByRo('/agentie-facebook-ads/');
  assert.equal(route.roFile, 'agentie-facebook-ads/index.html');
  assert.equal(route.en, undefined);
  assert.equal(roToEn[route.ro], undefined);
  assert.equal(isOwnedPage(route.ro), true);
  assert.ok(route.service.ro);
  assert.ok(roPageMeta[route.ro].title.length <= 60);
  assert.ok(roPageMeta[route.ro].description.length <= 160);
  assert.ok(serviceMenuCopy[route.ro].ro);
});

test('FAQ schema copy comes from the question element, not the comment decorations', () => {
  const html = `<details class="fb-faq" open><summary><span class="fb-av">Tu</span><span class="fb-qbub"><b>Tu</b>
    <span class="fb-faq-q">Cât buget &amp; ce onorariu?</span></span><span class="fb-more">Vezi răspunsul</span><span>1 răspuns</span></summary>
    <div class="fb-faq-a"><p>Depinde de ofertă. Vezi <a href="/agentie-google-ads/">Google Ads</a>.</p></div></details>`;
  assert.deepEqual(extractFacebookAdsFaqs(html), [{
    q: 'Cât buget & ce onorariu?',
    a: 'Depinde de ofertă. Vezi Google Ads.',
  }]);
});

test('the page shows nine visible FAQ answers that feed the schema', () => {
  const faqs = extractFacebookAdsFaqs(page);
  assert.equal(faqs.length, 9);
  for (const { q, a } of faqs) {
    assert.match(q, /\?$/);
    assert.ok(a.length > 40);
  }
});

test('page content has one h1, no inline styles and none of the banned characters', () => {
  assert.equal((page.match(/<h1\b/gi) || []).length, 1);
  assert.doesNotMatch(main, /\sstyle="/);
  assert.doesNotMatch(page, /[—↖-↙]/);
  assert.match(page, /id="formular_contact_bottom"/);
  assert.ok(page.indexOf('id="formular_contact_bottom"') < page.indexOf('<footer'));
});

test('every Romanian page header and the homepage card link to the Facebook Ads page', () => {
  for (const file of ['index.html', 'about-2/index.html', 'creare-site-web/index.html', 'creare-magazin-online/index.html',
    'dezvoltare-aplicatii/index.html', 'servicii-seo/index.html', 'agentie-google-ads/index.html', 'administrare-site/index.html',
    'contact/index.html', 'portofoliu/index.html', 'politica-de-confidentialitate/index.html', 'agentie-facebook-ads/index.html']) {
    const header = read(file).match(/<header\b[\s\S]*?<\/header>/i)[0];
    assert.equal((header.match(/href="\/agentie-facebook-ads\/" class="elementor-item/g) || []).length, 2, file);
  }
  assert.match(read('index.html'), /elementor-element-77240360 [^>]*href="\/agentie-facebook-ads\/"/);
});
