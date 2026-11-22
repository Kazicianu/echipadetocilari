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

test('the AI section keeps the definitions and the crawler list, without assistant tabs', () => {
  assert.equal(count(main, /role="tab(?:list|panel)?"/g), 0);
  assert.equal(count(main, /<li class="seo-def">/g), 6);
  assert.equal(count(main, /<div class="seo-bot">/g), 4);
  assert.doesNotMatch(main, /class="seo-limit"/);
});

test('the six monthly jobs are tiles with a heading, a Start quantity and a decorative example', () => {
  const section = main.match(/<section class="seo-sec" aria-labelledby="seo-lucrari-t">([\s\S]*?)<\/section>/)?.[1] ?? '';
  const jobs = [...section.matchAll(/<li class="seo-job">([\s\S]*?)<\/li>/g)].map(([, inner]) => inner);
  assert.equal(jobs.length, 6);
  assert.deepEqual(jobs.map(job => text(job.match(/<h3 class="seo-job__t">([\s\S]*?)<\/h3>/)?.[1] ?? '')), ['SEO tehnic', 'Conținut', 'SEO local', 'Autoritate', 'Vizibilitate în AI', 'Raport lunar']);
  assert.deepEqual(jobs.map(job => text(job.match(/<p class="seo-job__v">([\s\S]*?)<\/p>/)?.[1] ?? '')), ['4 verificări', '1 + 3 pagină + articole', '1 profil Google', '4 linkuri', '3 asistenți', '1 raport']);
  for (const job of jobs) assert.match(job, /<div class="seo-job__vis" aria-hidden="true">/);
  assert.doesNotMatch(main, /<details class="seo-row"|class="seo-bento"/);
  assert.match(section, /<a class="seo-link seo-jobs__more" href="#preturi">/);
  const start = main.match(/<article class="seo-price">([\s\S]*?)<\/article>/)?.[1] ?? '';
  assert.match(start, /<li>1 pagină optimizată și 3 articole pe lună<\/li>/);
  assert.match(start, /<li>4 linkuri externe relevante<\/li>/);
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

test('the FAQ has eleven native accordion items sharing one name, the first open', () => {
  const items = [...main.matchAll(/<details class="ect-home-faq__item"([^>]*)>/gi)].map(([, attrs]) => attrs);
  assert.equal(items.length, 11);
  assert.equal(items.filter(attrs => /\sopen\b/.test(attrs)).length, 1);
  assert.match(items[0], /\sopen\b/);
  assert.equal(new Set(items.map(attrs => attrs.match(/name="([^"]+)"/)?.[1])).size, 1);
  assert.match(main, /<div class="ect-home-faq__conversation" data-faq-panel data-fqp-target="\.ect-home-faq__answer">/);
  assert.ok(!/<div\b/i.test(main.match(/<div class="ect-home-faq__answer">([\s\S]*?)<\/div>/)?.[1] ?? ''), 'answers hold no div');
});

test('no visible placeholders remain in the content', () => {
  assert.equal(count(main, /<span class="seo-todo">/g), 0);
  assert.doesNotMatch(main, /De completat|De confirmat|de completat|de confirmat/);
});

test('every illustrative example is labelled as such', () => {
  assert.equal(count(main, /<em class="seo-ex">Exemplu ilustrativ<\/em>/g), 2);
  assert.equal(count(main, /Exemplu ilustrativ/g), 2);
  assert.equal(count(main, /<span>exemplu<\/span>/g), 3);
  assert.ok(main.includes('Datele din grafice sunt exemple.'));
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

test('the sections follow the approved order', () => {
  const ids = [...main.matchAll(/<section\b[^>]*aria-labelledby="([^"]+)"/g)].map(([, id]) => id);
  assert.deepEqual(ids, ['seo-h1', 'seo-potrivit-t', 'seo-lucrari-t', 'seo-dece-t', 'seo-ai-t', 'seo-3luni-t', 'seo-rezultate-t', 'seo-preturi-t', 'seo-intrebari-t']);
});

test('the page shows no case-study placeholders and no illustrative results chart', () => {
  assert.doesNotMatch(main, /seo-cazuri-t|class="seo-case"|class="seo-chart"|class="seo-periods"/);
});

test('the why-us section gives three reasons and links the related services', () => {
  const why = main.match(/<section class="seo-sec" aria-labelledby="seo-dece-t">([\s\S]*?)<\/section>/)?.[1] ?? '';
  assert.equal(count(why, /<li class="seo-def">/g), 3);
  assert.ok(why.includes('href="/creare-site-web/"'));
  assert.ok(why.includes('href="/agentie-google-ads/"'));
});

test('the entry plan includes the technical SEO and AI monitoring promised in the monthly jobs', () => {
  const start = main.match(/<article class="seo-price">([\s\S]*?)<\/article>/)?.[1] ?? '';
  assert.match(start, /<li>SEO tehnic: indexare, viteză, sitemap, date structurate<\/li>/);
  assert.match(start, /<li>Monitorizare lunară în asistenții AI<\/li>/);
});

test('the terms state the minimum contract and the audit shows its price', () => {
  assert.ok(main.includes('Contractul e pe minimum 3 luni, apoi continuă lunar, cu preaviz de 30 de zile.'));
  assert.match(main, /<span class="seo-strip__amt">299 €<\/span>/);
});

test('the page avoids em dashes and diagonal arrows', () => {
  assert.doesNotMatch(page, /—/);
  assert.doesNotMatch(page, /[↖-↙]/);
});
