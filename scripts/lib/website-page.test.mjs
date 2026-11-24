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
const section = id => main.match(new RegExp(`<section\\b[^>]*\\sid="${id}"[\\s\\S]*?</section>`, 'i'))?.[0] ?? '';
const count = (source, pattern) => [...source.matchAll(pattern)].length;

test('the page has one H1 with the approved wording', () => {
  const h1 = [...page.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
  assert.equal(h1.length, 1);
  assert.equal(text(h1[0][1]), 'Creare site web pentru afacerea ta');
});

test('the hero keeps the Elementor columns, the VR image and the two calls to action', () => {
  for (const id of ['4249b16', 'cd52179', '0d756f3']) assert.ok(page.includes(`elementor-element-${id}`), id);
  assert.ok(page.includes('vr-768x905.webp'));
  const vrColumn = page.match(/elementor-element-cd52179[\s\S]*?elementor-element-0d756f3/)?.[0] ?? '';
  assert.match(vrColumn, /<a class="csw-hero-vr__idea" href="#formular_contact_bottom">Ai o idee\?<\/a>/);
  assert.match(main, /<p class="csw-pill">[^<]+<\/p>/);
  assert.match(main, /<a class="csw-btn csw-btn--primary" href="#formular_contact_bottom">Cere ofertă gratuită/);
  assert.match(main, /<a class="csw-btn csw-btn--ghost" href="#preturi">Vezi cele 4 pachete/);
});

test('four price cards carry the approved prices, labels and CTAs', () => {
  const tags = [...main.matchAll(/<article class="(csw-pcard\b[^"]*)">([\s\S]*?)<\/article>/gi)];
  assert.equal(tags.length, 4);
  const cards = tags.map(([, , inner]) => inner);
  const classes = tags.map(([, cls]) => cls);
  assert.deepEqual(cards.map(card => text(card.match(/<p class="csw-pcard__price\b[^"]*">([\s\S]*?)<\/p>/)?.[1] ?? '')), ['299 €', '590 €', '1.090 €', 'pe proiect']);
  assert.deepEqual(cards.map(card => text(card.match(/<p class="csw-pcard__from\b[^"]*">([\s\S]*?)<\/p>/)?.[1] ?? '')), ['de la', 'de la', 'de la', 'preț']);
  assert.ok(/\bcsw-pcard--on\b/.test(classes[2]) && !/--x\b/.test(classes[2]));
  assert.ok(/\bcsw-pcard--x\b/.test(classes[3]));
  assert.ok(!/--on\b|--x\b/.test(classes[0]) && !/--on\b|--x\b/.test(classes[1]));
  for (const card of cards) {
    assert.equal(count(card.match(/<ul class="csw-pcard__list">[\s\S]*?<\/ul>/)?.[0] ?? '', /<li\b/g), 6);
    assert.match(card, /<a class="csw-pcard__cta" href="#formular_contact_bottom"[^>]*data-prefill="[^"]+"/);
  }
  assert.deepEqual(cards.map(card => card.match(/data-package="([^"]+)"/)?.[1]), ['Landing', 'Prezentare', 'Business', 'Custom']);
});

test('the Romanian meta names the three entry prices and matches the page', () => {
  const { title, description } = roPageMeta['/creare-site-web/'];
  for (const price of ['299 €', '590 €', '1.090 €']) assert.ok(description.includes(price), price);
  assert.ok(title.length <= 60, `title length ${title.length}`);
  assert.ok(description.length <= 155, `description length ${description.length}`);
  assert.ok(page.includes(`<title>${title}</title>`));
  assert.ok(page.includes(`<meta name="description" content="${description}">`));
});

test('the comparison matrix has four tabs, one selected, and 17 data rows', () => {
  const tabs = [...main.matchAll(/<button\b[^>]*role="tab"[^>]*>([\s\S]*?)<\/button>/gi)];
  assert.deepEqual(tabs.map(([, label]) => text(label)), ['Landing', 'Prezentare', 'Business', 'Custom']);
  assert.equal(tabs.filter(([tag]) => /aria-selected="true"/.test(tag)).length, 1);
  for (const [tag] of tabs) {
    const target = tag.match(/aria-controls="([^"]+)"/)?.[1];
    assert.ok(target && count(main, new RegExp(`\\sid="${target}"`, 'g')) === 1, `panel ${target} exists`);
  }
  const body = main.match(/<table class="csw-cmp__table">[\s\S]*?<tbody>([\s\S]*?)<\/tbody>/)?.[1] ?? '';
  const rows = [...body.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)].filter(([tag]) => !/csw-cmp__grp/.test(tag));
  assert.equal(count(body, /<tr class="csw-cmp__grp"/g), 4);
  assert.equal(rows.length, 17);
  for (const [, inner] of rows) assert.deepEqual([...inner.matchAll(/<td data-p="([lpbc])"/g)].map(m => m[1]), ['l', 'p', 'b', 'c']);
});

test('the portfolio shows four live projects with sized lazy images', () => {
  const block = section('proiecte');
  for (const name of ['Torjai Productions', 'Funera', '2noi', 'Zuzel']) assert.ok(text(block).includes(name), name);
  const links = [...block.matchAll(/<a class="csw-proj__link" href="([^"]+)"/g)].map(m => m[1]);
  assert.deepEqual(links, ['https://torjaiproductions.com/', 'https://funera.ro/', 'https://zuzel.ro/', 'https://2noi.ro/']);
  assert.doesNotMatch(block, /vercel\.app/);
  assert.match(block, /<a class="csw-link csw-proj__all" href="\/portofoliu\/">/);
  const imgs = [...block.matchAll(/<img\b[^>]*>/g)].map(m => m[0]);
  assert.equal(imgs.length, 4);
  for (const img of imgs) {
    assert.match(img, /\swidth="\d+"/);
    assert.match(img, /\sheight="\d+"/);
    assert.match(img, /loading="lazy"/);
  }
});

test('the deliverables show six items and the AI readiness block', () => {
  const block = section('livrabile');
  assert.deepEqual([...block.matchAll(/<span class="csw-tile__n"[^>]*>(\d+)<\/span>/g)].map(m => m[1]), ['01', '02', '03', '04', '05', '06']);
  const ai = block.match(/<div class="csw-ai">[\s\S]*/)?.[0] ?? '';
  assert.ok(ai, 'the .csw-ai block exists');
  for (const bot of ['Googlebot', 'OAI-SearchBot', 'PerplexityBot', 'Claude-SearchBot']) assert.ok(ai.includes(bot), bot);
  assert.match(ai, /<a href="\/servicii-seo\/"/);
});

test('the process has five steps and the fit section links to the next services', () => {
  const proc = section('proces');
  assert.equal(count(proc, /<li class="csw-step">/g), 5);
  const fit = section('potrivit');
  for (const href of ['/administrare-site/', '/servicii-seo/', '/agentie-google-ads/', '/agentie-facebook-ads/']) {
    assert.ok(fit.includes(`href="${href}"`), href);
  }
});

test('the price section has the bridge links, the modules and the three instalments', () => {
  const prices = section('preturi');
  assert.match(prices, /<a href="\/creare-magazin-online\/">[\s\S]*?1\.490(&nbsp;| )€/);
  assert.match(prices, /<a href="\/dezvoltare-aplicatii\/">[\s\S]*?4\.900(&nbsp;| )€/);
  const extras = text(prices.match(/<div class="csw-extras">[\s\S]*?<\/ul>/)?.[0] ?? '');
  for (const price of ['79 €', '290 €', '190 €', '120 €', '69 €', '150 €']) assert.ok(extras.includes(price), price);
  const pay = [...(prices.match(/<ol class="csw-pay__bar">[\s\S]*?<\/ol>/)?.[0] ?? '').matchAll(/<b>([^<]+)<\/b>/g)].map(m => m[1]);
  assert.deepEqual(pay, ['50%', '25%', '25%']);
});

test('the sections come in the approved order and the old ids are gone', () => {
  const order = ['de-ce-cod', 'preturi', 'proiecte', 'livrabile', 'proces', 'potrivit', 'intrebari'];
  const positions = order.map(id => main.search(new RegExp(`\\sid="${id}"`)));
  assert.ok(positions.every(pos => pos > 0), 'all sections exist');
  assert.deepEqual([...positions].sort((a, b) => a - b), positions);
  for (const id of order) assert.equal(count(page, new RegExp(`\\sid="${id}"`, 'g')), 1, `#${id} once`);
  for (const id of ['pe-scurt', 'cum-lucram', 'tipuri', 'ce-include', 'pasi', 'alegere']) assert.equal(count(page, new RegExp(`\\sid="${id}"`, 'g')), 0, `#${id} removed`);
  assert.equal(count(main, /class="csw-band"/g), 1);
  const band = main.indexOf('class="csw-band"');
  assert.ok(main.indexOf('id="preturi"') < band && band < main.indexOf('id="proiecte"'), 'the band sits between prices and projects');
});

test('the FAQ has ten native accordion items, the first one open', () => {
  const items = [...main.matchAll(/<details class="ect-home-faq__item"([^>]*)>/gi)].map(([, attrs]) => attrs);
  assert.equal(items.length, 10);
  assert.equal(items.filter(attrs => /\sopen\b/.test(attrs)).length, 1);
  assert.match(items[0], /\sopen\b/);
  assert.equal(new Set(items.map(attrs => attrs.match(/name="([^"]+)"/)?.[1])).size, 1);
  assert.match(main, /<div class="ect-home-faq__conversation" data-faq-panel data-fqp-target="\.ect-home-faq__answer">/);
});

test('the contact form sits right above the footer, once', () => {
  assert.equal(count(page, /id="formular_contact_bottom"/g), 1);
  const mainEnd = page.indexOf('</main>');
  const form = page.indexOf('id="formular_contact_bottom"');
  const footer = page.search(/<footer\b/i);
  assert.ok(mainEnd > 0 && mainEnd < form && form < footer, 'main, then the contact, then the footer');
});

test('the page avoids forbidden characters, wording and leftovers', () => {
  assert.doesNotMatch(page, /—/);
  assert.doesNotMatch(page, /[↖-↙]/);
  assert.doesNotMatch(page.replace(/©/g, ''), /\p{Extended_Pictographic}/u);
  assert.doesNotMatch(page, /WooCommerce/);
  assert.doesNotMatch(page, /headless/i);
  assert.doesNotMatch(page, /[şţ]/);
  assert.doesNotMatch(main, /\{\{|mk-|\/_blob\//);
});
