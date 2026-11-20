import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { roPageMeta } from '../i18n/meta-ro.mjs';

const read = file => readFileSync(new URL(`../../${file}`, import.meta.url), 'utf8');
const page = read('legacy-mirror/servicii-seo/index.html');
const main = page.match(/<main\b[\s\S]*<\/main>/i)?.[0] ?? '';
const text = markup => markup
  .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
  .replace(/<[^>]*>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();
const count = (haystack, pattern) => [...haystack.matchAll(pattern)].length;

test('the page has one H1 with the approved wording', () => {
  const h1 = [...page.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
  assert.equal(h1.length, 1);
  assert.equal(text(h1[0][1]), 'Servicii SEO pentru Google și pentru răspunsurile AI');
  assert.ok(h1[0][1].includes('<span class="seo-chip">AI</span>'));
});

test('three price cards carry the approved names and monthly sums', () => {
  const cards = [...main.matchAll(/<article class="seo-price\b[^"]*">([\s\S]*?)<\/article>/gi)].map(([, inner]) => inner);
  assert.equal(cards.length, 3);
  assert.deepEqual(cards.map(card => text(card.match(/<h3 class="seo-price__name">([\s\S]*?)<\/h3>/)?.[1] ?? '')), ['SEO Start', 'SEO Avansat', 'SEO Premium']);
  assert.deepEqual(cards.map(card => text(card.match(/<p class="seo-price__amt">([\s\S]*?)<\/p>/)?.[1] ?? '')), ['439 € / lună', '699 € / lună', '999 € / lună']);
  for (const card of cards) assert.match(card, /<p class="seo-price__amt">\d+ €<small>\/ lună<\/small><\/p>/);
  assert.equal(count(main, /<article class="seo-price seo-price--hot">/g), 1);
});

test('the Romanian title and description come from the page meta and name the entry price', () => {
  const { title, description } = roPageMeta['/servicii-seo/'];
  assert.ok(title.length <= 60, `title has ${title.length} characters`);
  assert.match(description, /439 €/);
  assert.ok(page.includes(`<title>${title}</title>`));
  assert.ok(page.includes(`<meta name="description" content="${description}">`));
  assert.ok(page.includes(`<meta property="og:title" content="${title}">`));
  assert.ok(page.includes(`<meta name="twitter:description" content="${description}">`));
});

test('the head loads the page assets and drops the old inline styles', () => {
  assert.ok(page.includes('<link rel="stylesheet" href="/wp-content/ect-pages/servicii-seo.css">'));
  assert.ok(page.includes('<script defer src="/wp-content/ect-pages/servicii-seo.js"></script>'));
  assert.ok(page.includes('id="elementor-post-3381-css"'));
  assert.ok(!page.includes('elementor-post-4105-css'));
  assert.ok(!page.includes('.ect-seo-ai'));
  assert.ok(!main.includes('data-elementor-type'));
});

test('the AI assistant tabs have four panels and only one is visible', () => {
  const tabs = [...main.matchAll(/<button\b[^>]*role="tab"[^>]*>/gi)].map(([tag]) => tag);
  assert.equal(tabs.length, 4);
  assert.equal(tabs.filter(tag => /aria-selected="true"/.test(tag)).length, 1);
  const panels = [...main.matchAll(/<div class="seo-panel"[^>]*role="tabpanel"[^>]*>/gi)].map(([tag]) => tag);
  assert.equal(panels.length, 4);
  assert.equal(panels.filter(tag => !/\shidden\b/.test(tag)).length, 1);
  assert.ok(!/\shidden\b/.test(panels[0]), 'the Google panel is the visible one');
  for (const id of ['google', 'chatgpt', 'gemini', 'perplexity']) {
    assert.ok(main.includes(`id="seo-tab-${id}"`) && main.includes(`id="seo-panel-${id}"`), `tab and panel ${id}`);
  }
});

test('the six monthly jobs are native accordion rows sharing one name, the first open', () => {
  const rows = [...main.matchAll(/<details class="seo-row"([^>]*)>/gi)].map(([, attrs]) => attrs);
  assert.equal(rows.length, 6);
  assert.equal(new Set(rows.map(attrs => attrs.match(/name="([^"]+)"/)?.[1])).size, 1);
  assert.equal(rows.filter(attrs => /\sopen\b/.test(attrs)).length, 1);
  assert.match(rows[0], /\sopen\b/);
});

test('the monthly report has five parts, one chosen, and one visible example', () => {
  const keys = [...main.matchAll(/<button class="seo-key[^"]*"[^>]*>/gi)].map(([tag]) => tag);
  assert.equal(keys.length, 5);
  assert.equal(keys.filter(tag => /aria-pressed="true"/.test(tag)).length, 1);
  assert.equal(count(main, /data-seo-key="\d"/g), 5);
  const parts = [...main.matchAll(/<div class="seo-dsec[^"]*">[\s\S]*?<\/p><\/div><\/div>/gi)].map(([part]) => part);
  assert.equal(parts.length, 5);
  assert.equal(parts.filter(part => !/<p hidden>/.test(part)).length, 1);
});

test('the GPTBot switch is a real switch and the other three are decorative', () => {
  const real = [...main.matchAll(/<button\b[^>]*role="switch"[^>]*>/gi)].map(([tag]) => tag);
  assert.equal(real.length, 1);
  assert.match(real[0], /data-seo-gpt/);
  assert.match(real[0], /data-on="permis, decizia ta"/);
  assert.match(real[0], /data-off="blocat, decizia ta"/);
  assert.equal(count(main, /<span class="seo-sw is-on" aria-hidden="true">/g), 3);
});

test('the FAQ has eight native accordion items sharing one name, the first open', () => {
  const items = [...main.matchAll(/<details class="ect-home-faq__item"([^>]*)>/gi)].map(([, attrs]) => attrs);
  assert.equal(items.length, 8);
  assert.equal(items.filter(attrs => /\sopen\b/.test(attrs)).length, 1);
  assert.match(items[0], /\sopen\b/);
  assert.equal(new Set(items.map(attrs => attrs.match(/name="([^"]+)"/)?.[1])).size, 1);
  assert.match(main, /<div class="ect-home-faq__conversation" data-faq-panel data-fqp-target="\.ect-home-faq__answer">/);
  assert.ok(!/<div\b/i.test(main.match(/<div class="ect-home-faq__answer">([\s\S]*?)<\/div>/)?.[1] ?? ''), 'answers hold no div');
});

test('twenty-two visible placeholders and no placeholder wording anywhere else', () => {
  assert.equal(count(main, /<span class="seo-todo">/g), 22);
  const outside = main.replace(/<span class="seo-todo">[\s\S]*?<\/span>/g, '');
  assert.doesNotMatch(outside, /De completat|De confirmat|de completat|de confirmat/);
});

test('the illustrative label appears nine times', () => {
  assert.equal(count(main, /<em class="seo-ex">Exemplu ilustrativ<\/em>/g), 9);
  assert.equal(count(main, /Exemplu ilustrativ/g), 9);
});

test('the content holds no images and no inline styles', () => {
  assert.doesNotMatch(main, /<img\b/i);
  assert.doesNotMatch(main, /\sstyle="/);
});

test('the contact form sits once between the content and the footer', () => {
  assert.equal(count(page, /id="formular_contact_bottom"/g), 1);
  assert.equal(count(page, /<form\b/g), 1);
  const mainEnd = page.indexOf('</main>');
  const form = page.indexOf('id="formular_contact_bottom"');
  const footer = page.search(/<footer\b/i);
  assert.ok(mainEnd > 0 && mainEnd < form && form < footer, 'main, then the contact, then the footer');
  assert.ok(page.includes('<div class="elementor elementor-3381 ect-shared-contact seo-contact">'));
  const labels = [...page.matchAll(/<label class="seo-flabel" for="(form-field-[^"]+)">/g)].map(([, id]) => id);
  assert.equal(labels.length, 5);
  for (const id of labels) assert.ok(page.includes(`id="${id}"`), `${id} is a field`);
  assert.doesNotMatch(page, /name="form_fields\[(?:site|url)/i);
});

test('the anchors used by the page exist exactly once', () => {
  for (const id of ['preturi', 'ai', 'intrebari', 'formular_contact_bottom']) {
    assert.equal(count(page, new RegExp(`\\sid="${id}"`, 'g')), 1, `#${id} exists once`);
  }
  const anchors = new Set([...main.matchAll(/href="#([^"]+)"/g)].map(([, id]) => id));
  for (const id of anchors) assert.equal(count(page, new RegExp(`\\sid="${id}"`, 'g')), 1, `#${id} target`);
});

test('the headings keep a clean order and the VAT sentence replaces the placeholder', () => {
  const levels = [...main.matchAll(/<h([1-6])\b/g)].map(([, level]) => Number(level));
  assert.equal(levels[0], 1);
  levels.forEach((level, i) => { if (i) assert.ok(level <= levels[i - 1] + 1, `heading ${i} jumps from h${levels[i - 1]} to h${level}`); });
  assert.equal(count(main, /<h4 class="seo-h4">(?:Garantăm|Nu garantăm)<\/h4>/g), 2);
  assert.ok(main.includes('Prețurile afișate sunt finale (Echipa de Tocilari SRL nu este plătitoare de TVA).'));
});

test('the page avoids em dashes and diagonal arrows', () => {
  assert.doesNotMatch(page, /—/);
  assert.doesNotMatch(page, /[↖-↙]/);
});
