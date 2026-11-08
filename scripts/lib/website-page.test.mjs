import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { roPageMeta } from '../i18n/meta-ro.mjs';

const read = file => readFileSync(new URL(`../../${file}`, import.meta.url), 'utf8');
const page = read('legacy-mirror/creare-site-web/index.html');
const main = page.match(/<main\b[\s\S]*<\/main>/i)?.[0] ?? '';
const text = markup => markup
  .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
  .replace(/<[^>]*>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

test('the page has one H1 with the approved wording', () => {
  const h1 = [...page.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
  assert.equal(h1.length, 1);
  assert.equal(text(h1[0][1]), 'Creare site web pentru afacerea ta');
});

test('four price cards carry the same prices as the tabs and the short answers', () => {
  const cards = [...main.matchAll(/<article class="csw-pcard\b[^"]*">([\s\S]*?)<\/article>/gi)].map(([, inner]) => inner);
  assert.equal(cards.length, 4);
  const prices = cards.map(card => text(card.match(/<p class="csw-pcard__price\b[^"]*">([\s\S]*?)<\/p>/)?.[1] ?? ''));
  assert.deepEqual(prices, ['299 €', '499 €', '1.490 €', 'pe proiect']);

  const tabs = [...main.matchAll(/<p class="csw-tag"><small>([\s\S]*?)<\/small><b>([\s\S]*?)<\/b><\/p>/gi)].map(([, , price]) => text(price));
  assert.deepEqual(tabs, ['299 €', '499 €', '1.490 €', 'pe proiect']);

  const short = text(main.match(/<section[^>]*id="pe-scurt"[\s\S]*?<\/section>/i)?.[0] ?? '');
  for (const price of ['299 €', '499 €', '1.490 €']) assert.ok(short.includes(price), `short answers mention ${price}`);
});

test('the Romanian description names the two entry prices', () => {
  const { title, description } = roPageMeta['/creare-site-web/'];
  assert.match(description, /299 €/);
  assert.match(description, /499 €/);
  assert.ok(title.length <= 60);
  assert.ok(page.includes(`<title>${title}</title>`));
  assert.ok(page.includes(`<meta name="description" content="${description}">`));
});

test('the site type tabs have four panels and only one is visible', () => {
  const panels = [...main.matchAll(/<div class="csw-type"[^>]*role="tabpanel"[^>]*>/gi)].map(([tag]) => tag);
  assert.equal(panels.length, 4);
  assert.equal(panels.filter(tag => !/\shidden\b/.test(tag)).length, 1);
  const tabs = [...main.matchAll(/<button\b[^>]*role="tab"[^>]*>/gi)].map(([tag]) => tag);
  assert.equal(tabs.length, 4);
  assert.equal(tabs.filter(tag => /aria-selected="true"/.test(tag)).length, 1);
  for (const id of ['lp', 'sp', 'mo', 'aw']) {
    assert.ok(main.includes(`id="csw-tab-${id}"`) && main.includes(`id="csw-panel-${id}"`), `tab and panel ${id}`);
  }
});

test('the FAQ has twelve native accordion items, the first one open', () => {
  const items = [...main.matchAll(/<details class="ect-home-faq__item"([^>]*)>/gi)].map(([, attrs]) => attrs);
  assert.equal(items.length, 12);
  assert.equal(items.filter(attrs => /\sopen\b/.test(attrs)).length, 1);
  assert.match(items[0], /\sopen\b/);
  assert.equal(new Set(items.map(attrs => attrs.match(/name="([^"]+)"/)?.[1])).size, 1);
});

test('missing information is marked with 13 visible notes and nowhere else', () => {
  const notes = [...main.matchAll(/<span class="csw-todo">([\s\S]*?)<\/span>/gi)].map(([, inner]) => text(inner));
  assert.equal(notes.length, 13);
  assert.equal([...main.matchAll(/class="csw-todo"/g)].length, 13);
  assert.ok(notes.every(note => /^De (completat|confirmat)/.test(note)));
  const outside = main.replace(/<span class="csw-todo">[\s\S]*?<\/span>/gi, '');
  assert.doesNotMatch(outside, /De completat|De confirmat/);
});

test('every link in the table of contents points at a section of the page', () => {
  const toc = main.match(/<nav class="csw-toc"[\s\S]*?<\/nav>/i)?.[0] ?? '';
  const anchors = [...toc.matchAll(/href="#([^"]+)"/g)].map(([, id]) => id);
  assert.deepEqual(anchors, ['tipuri', 'preturi', 'ce-include', 'pasi', 'alegere', 'intrebari']);
  for (const id of anchors) assert.equal([...page.matchAll(new RegExp(`\\sid="${id}"`, 'g'))].length, 1, `#${id} exists once`);
});

test('the update date is visible and machine readable', () => {
  assert.match(main, /<p class="csw-by ect-policy__updated">[\s\S]*?<time datetime="2026-11-08">8 noiembrie 2026<\/time>/);
});

test('the contact form sits right above the footer, once', () => {
  assert.equal([...page.matchAll(/id="formular_contact_bottom"/g)].length, 1);
  const mainEnd = page.indexOf('</main>');
  const form = page.indexOf('id="formular_contact_bottom"');
  const footer = page.search(/<footer\b/i);
  assert.ok(mainEnd > 0 && mainEnd < form && form < footer, 'main, then the contact, then the footer');
});

test('the page avoids em dashes, diagonal arrows and the removed platform wording', () => {
  assert.doesNotMatch(page, /\u2014/);
  assert.doesNotMatch(page, /[\u2196-\u2199]/);
  assert.doesNotMatch(page, /WooCommerce/);
});

test('the hero keeps the original Elementor image column', () => {
  assert.ok(page.includes('elementor-element-4249b16'));
  assert.ok(page.includes('elementor-element-cd52179'));
  assert.ok(page.includes('elementor-element-0d756f3'));
});
