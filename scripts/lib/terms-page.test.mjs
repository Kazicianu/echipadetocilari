import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { routes, routeByRo } from '../i18n/routes.mjs';
import { roPageMeta } from '../i18n/meta-ro.mjs';
import { dictionary, enPageMeta, pageDictionaries, termsDictionary } from '../i18n/dictionary.mjs';
import { generateEnglishPages } from '../i18n/generate-en.mjs';
import { visibleDateModified } from './schema.mjs';
import { TERMS_PATHS } from './site-footer.mjs';
import { setLang } from './html.mjs';
import { normalizePageLinks } from './navigation.mjs';
import { ensureSharedContact } from './shared-contact.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = file => readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n');
const route = routeByRo('/termeni-si-conditii/');
const page = read('legacy-mirror/termeni-si-conditii/index.html');
const css = read('legacy-mirror/wp-content/ect-pages/termeni-si-conditii.css');
const dictionarySource = read('scripts/i18n/terms.mjs');
const main = page.match(/<main\b[\s\S]*<\/main>/i)?.[0] ?? '';
const count = (html, needle) => html.split(needle).length - 1;
const withoutCode = html => html.replace(/<!--[\s\S]*?-->|<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
const metaContent = (html, attr) => html.match(new RegExp(`<meta\\s+${attr}\\s+content="([^"]*)"`, 'i'))?.[1];
const site = 'https://www.echipadetocilari.ro';
// Em dash, diagonal arrows, and cedilla S/T (Romanian uses comma-below letters).
const BANNED = /[—↖-↙ŞşŢţ]|&mdash;|&#8212;|&#x2014;/i;
const ROMANIAN = /[ăâîșțĂÂÎȘȚ]/;

test('the terms page is a paired route, before the privacy policy, with RO and EN metadata', () => {
  assert.deepEqual(route, {
    ro: '/termeni-si-conditii/',
    en: '/en/terms-and-conditions/',
    roFile: 'termeni-si-conditii/index.html',
    enFile: 'en/terms-and-conditions/index.html',
    labelRo: 'Termeni și condiții',
    labelEn: 'Terms and conditions',
    preloadFonts: true,
  });
  assert.deepEqual([route.ro, route.en], [TERMS_PATHS.ro, TERMS_PATHS.en], 'the footer links point here');
  assert.equal(routes.indexOf(route), routes.length - 2, 'the privacy policy stays the last route');
  assert.equal('service' in route, false, 'not a service page');
  for (const meta of [roPageMeta[route.ro], enPageMeta[route.en]]) {
    assert.ok(meta.title.endsWith(' | Echipa de Tocilari'));
    assert.ok(meta.description.length >= 50 && meta.description.length <= 160, meta.description);
    assert.doesNotMatch(meta.title + meta.description, BANNED);
  }
  assert.doesNotMatch(enPageMeta[route.en].title + enPageMeta[route.en].description, ROMANIAN);
  assert.equal(pageDictionaries[route.ro], termsDictionary);
});

test('the source page: one H1, its own metadata, form directly above the footer', () => {
  const copy = withoutCode(page);
  assert.equal(count(copy, '<h1'), 1);
  assert.equal(count(main, '<h1'), 1);
  assert.match(page, /<html lang="ro"/);
  const meta = roPageMeta[route.ro];
  assert.equal(page.match(/<title>([^<]*)<\/title>/)[1], meta.title);
  for (const attr of ['name="description"', 'property="og:description"', 'name="twitter:description"']) assert.equal(metaContent(page, attr), meta.description, attr);
  for (const attr of ['property="og:title"', 'name="twitter:title"']) assert.equal(metaContent(page, attr), meta.title, attr);
  assert.equal(metaContent(page, 'property="og:url"'), route.ro);
  assert.match(page, /<link rel="canonical" href="\/termeni-si-conditii\/">/);
  assert.match(page, /<link rel="stylesheet" href="\/wp-content\/ect-pages\/termeni-si-conditii\.css">/);
  assert.match(page, /<main id="content" class="ect-page ect-page--termeni-si-conditii">/);
  assert.doesNotMatch(page, /aria-current|current-menu-item|elementor-item-active/, 'no other page is marked as current');
  const mainEnd = page.indexOf('</main>');
  const form = page.search(/<form\b[^>]*class="elementor-form"/);
  const footer = page.search(/<footer\b/);
  assert.ok(mainEnd > 0 && mainEnd < form && form < footer, 'main, then the contact form, then the footer');
  assert.match(page.slice(mainEnd, footer), /^<\/main>\s*<div class="elementor elementor-3381 ect-shared-contact">/);
  assert.equal(count(page, '<form'), 1);
});

test('the page states the company facts, contact, audience, VAT note and legal basis', () => {
  assert.deepEqual([...main.matchAll(/<section id="([^"]+)"/g)].map(([, id]) => id), ['firma', 'contact', 'clienti', 'preturi', 'date', 'temei']);
  for (const fact of [
    '<strong>Denumire:</strong> ECHIPA DE TOCILARI S.R.L.',
    '<strong>Formă juridică:</strong> societate cu răspundere limitată (SRL)',
    '<strong>Sediul social:</strong> Str. Arh. Alexandru Zagoritz nr. 12, sector 2, București, România',
    '<strong>Număr de ordine în Registrul Comerțului:</strong> J40/2298/2023',
    '<strong>Cod unic de înregistrare (CUI):</strong> 47591744',
    '<strong>Capital social:</strong> 200 lei',
    '<a href="tel:+40750203466">0750 203 466</a>',
    '<a href="mailto:contact@echipadetocilari.ro">contact@echipadetocilari.ro</a>',
    'nu este plătitoare de TVA',
    'art. 5 din Legea nr. 365/2002',
    'art. 74 din Legea societăților nr. 31/1990',
    '<a href="/politica-de-confidentialitate/">Politica de confidențialitate și cookie-uri</a>',
    'nu consumatorilor',
  ]) assert.ok(main.includes(fact), fact);
  assert.match(main, /Ultima actualizare: <time datetime="2026-11-23">23 noiembrie 2026<\/time>/);
  assert.equal(visibleDateModified(page), '2026-11-23');
  const english = termsDictionary.map(([, to]) => to).join('\n');
  for (const fact of ['<strong>Share capital:</strong> 200 lei (RON)', 'J40/2298/2023', '47591744', 'is not registered for VAT', 'not for consumers']) {
    assert.ok(english.includes(fact), fact);
  }
});

test('no em dash, diagonal arrows or cedilla in the page, its CSS and its dictionary', () => {
  for (const [name, text] of [['page', page], ['css', css], ['dictionary', dictionarySource]]) {
    assert.doesNotMatch(text, BANNED, name);
  }
  for (const [from, to] of termsDictionary) {
    assert.doesNotMatch(to, ROMANIAN, `EN value keeps no Romanian letters: ${to.slice(0, 60)}`);
    assert.ok(!to.includes('de la'), `"de la" would be rewritten by the global dictionary: ${to.slice(0, 60)}`);
    assert.doesNotMatch(from + to, /\n/, 'one line per block');
  }
});

test('every dictionary key is a whole block of the page body, and only of the page body', () => {
  const keys = termsDictionary.map(([from]) => from);
  assert.equal(new Set(keys).size, keys.length, 'no duplicate keys');
  const blocks = new Set([...main.matchAll(/<(h1|h2|h3|h4|p|li|dt|dd)\b[^>]*>([\s\S]*?)<\/\1>/g)].map(([, , inner]) => inner));
  const body = page.slice(page.indexOf('</head>'));
  for (const key of keys) {
    assert.ok(blocks.has(key), `whole block in <main>: ${key.slice(0, 70)}`);
    assert.equal(count(body, key), count(main, key), `not in the header, form or footer: ${key.slice(0, 70)}`);
  }
  assert.deepEqual([...blocks].filter(inner => !keys.includes(inner)), [], 'every block of the page has an English entry');
});

test('the generated English page carries every EN value verbatim and no Romanian in <main>', () => {
  const home = readFileSync(path.join(root, 'legacy-mirror', 'index.html'), 'utf8');
  const parent = path.join(root, '.tmp');
  mkdirSync(parent, { recursive: true });
  const directory = mkdtempSync(path.join(parent, 'terms-page-'));
  try {
    for (const item of routes) {
      const file = path.join(directory, item.roFile);
      mkdirSync(path.dirname(file), { recursive: true });
      let html = readFileSync(path.join(root, 'legacy-mirror', item.roFile), 'utf8');
      html = ensureSharedContact(html, home);
      html = normalizePageLinks(html, { pageUrl: item.ro });
      writeFileSync(file, setLang(html, 'ro'));
    }
    generateEnglishPages({ outDir: directory, site, indexable: false });
    const english = readFileSync(path.join(directory, route.enFile), 'utf8').replace(/\r\n/g, '\n');
    const englishMain = english.match(/<main\b[\s\S]*<\/main>/i)[0];
    assert.match(english, /<html\b[^>]*\blang="en"/);
    assert.doesNotMatch(englishMain, ROMANIAN, 'no Romanian letters left in <main>');
    for (const [from, to] of termsDictionary) {
      assert.ok(englishMain.includes(to), `EN value verbatim: ${to.slice(0, 70)}`);
      if (from !== to) assert.ok(!englishMain.includes(from), `RO key replaced: ${from.slice(0, 70)}`);
    }
    const stray = dictionary.filter(([from, to]) => from && from !== to && termsDictionary.some(([, value]) => value.includes(from)));
    assert.deepEqual(stray.map(([from]) => from), [], 'no global key occurs inside the English terms text');
    assert.match(englishMain, /<h1>Terms and conditions<\/h1>/);
    assert.equal(english.match(/<title>([^<]*)<\/title>/)[1], enPageMeta[route.en].title);
    assert.equal(metaContent(english, 'name="description"'), enPageMeta[route.en].description);
    assert.equal((english.match(/<link\b[^>]*hreflang=/g) || []).length, 3);
    assert.equal(visibleDateModified(english), '2026-11-23');
    assert.doesNotMatch(english, /"@type":\s*"(?:Service|FAQPage)"/, 'no Service or FAQPage schema');
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('page CSS: mobile first, exact orange, visible focus, no peach', () => {
  assert.match(css, /--orange: #fd8649;/);
  assert.doesNotMatch(css, /#(?:ad420f|ff6c2a|ff9762|ff5600|ff854e|a84515)\b|orange-deep/i, 'no other orange');
  assert.doesNotMatch(css, /--peach|#fff[01]e7\b|#f5ddce\b/i, 'no peach surfaces');
  assert.doesNotMatch(css, /@media \(max-width:/, 'base styles are the phone styles');
  assert.match(css, /:is\(a, button\):focus-visible \{ outline: 3px solid var\(--ink\); outline-offset: 5px; \}/);
  assert.match(css, /src: url\("fonts\/Montserrat-Variable-latin-ro\.woff2"\)/);
});
