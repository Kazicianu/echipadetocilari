import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { routes, routeByRo } from '../i18n/routes.mjs';
import { roPageMeta } from '../i18n/meta-ro.mjs';
import { dictionary, enPageMeta, pageDictionaries, privacyPolicyDictionary } from '../i18n/dictionary.mjs';
import { generateEnglishPages } from '../i18n/generate-en.mjs';
import { visibleDateModified, webPage } from './schema.mjs';
import { PRIVACY_PATHS } from './privacy.mjs';
import { setLang } from './html.mjs';
import { normalizePageLinks } from './navigation.mjs';
import { ensureSharedContact } from './shared-contact.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = file => readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n');
const route = routeByRo('/politica-de-confidentialitate/');
const page = read('legacy-mirror/politica-de-confidentialitate/index.html');
const css = read('legacy-mirror/wp-content/ect-pages/politica-de-confidentialitate.css');
const dictionarySource = read('scripts/i18n/privacy-policy.mjs');
const main = page.match(/<main\b[\s\S]*<\/main>/i)?.[0] ?? '';
const count = (html, needle) => html.split(needle).length - 1;
const withoutCode = html => html.replace(/<!--[\s\S]*?-->|<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
const metaContent = (html, attr) => html.match(new RegExp(`<meta\\s+${attr}\\s+content="([^"]*)"`, 'i'))?.[1];
const site = 'https://www.echipadetocilari.ro';
// Em dash, diagonal arrows, and cedilla S/T (Romanian uses comma-below letters).
const BANNED = /[\u2014\u2196-\u2199\u015E\u015F\u0162\u0163]|&mdash;|&#8212;|&#x2014;/i;
const ROMANIAN = /[ăâîșțĂÂÎȘȚ]/;

test('the policy is a paired route with RO and EN metadata and no Service schema', () => {
  assert.deepEqual(route, {
    ro: '/politica-de-confidentialitate/',
    en: '/en/privacy-policy/',
    roFile: 'politica-de-confidentialitate/index.html',
    enFile: 'en/privacy-policy/index.html',
    labelRo: 'Politica de confidențialitate',
    labelEn: 'Privacy policy',
    preloadFonts: true,
  });
  assert.deepEqual([route.ro, route.en], [PRIVACY_PATHS.ro, PRIVACY_PATHS.en], 'the footer, form and banner links point here');
  assert.equal(routes.at(-1), route);
  for (const meta of [roPageMeta[route.ro], enPageMeta[route.en]]) {
    assert.ok(meta.title.endsWith(' | Echipa de Tocilari'));
    assert.ok(meta.description.length >= 50 && meta.description.length <= 160, meta.description);
    assert.doesNotMatch(meta.title + meta.description, BANNED);
  }
  assert.doesNotMatch(enPageMeta[route.en].title + enPageMeta[route.en].description, ROMANIAN);
  assert.equal(pageDictionaries[route.ro], privacyPolicyDictionary);
});

test('the source page: one H1, its own metadata, plain header, form directly above the footer', () => {
  const copy = withoutCode(page);
  assert.equal(count(copy, '<h1'), 1);
  assert.equal(count(main, '<h1'), 1);
  assert.match(page, /<html lang="ro"/);
  const meta = roPageMeta[route.ro];
  assert.equal(page.match(/<title>([^<]*)<\/title>/)[1], meta.title);
  assert.equal(metaContent(page, 'name="description"'), meta.description, 'source description equals roPageMeta');
  for (const attr of ['property="og:description"', 'name="twitter:description"']) assert.equal(metaContent(page, attr), meta.description, attr);
  for (const attr of ['property="og:title"', 'name="twitter:title"']) assert.equal(metaContent(page, attr), meta.title, attr);
  assert.equal(metaContent(page, 'property="og:url"'), route.ro);
  assert.match(page, /<link rel="canonical" href="\/politica-de-confidentialitate\/">/);
  assert.doesNotMatch(page, /creare-magazin-online\.(?:css|js)|google_gtagjs|googletagmanager|\/\?p=3471|pages\/3471/);
  assert.match(page, /<link rel="stylesheet" href="\/wp-content\/ect-pages\/politica-de-confidentialitate\.css">/);
  assert.match(page, /<a class="skip-link screen-reader-text" href="#content">Sari la conținut<\/a>/);
  assert.match(page, /<main id="content" class="ect-page ect-page--politica-de-confidentialitate">/);
  assert.doesNotMatch(page, /aria-current|current-menu-item|elementor-item-active/, 'no other page is marked as current');
  assert.doesNotMatch(page, /<body\b[^>]*elementor-page-\d/);

  const mainEnd = page.indexOf('</main>');
  const form = page.search(/<form\b[^>]*class="elementor-form"/);
  const footer = page.search(/<footer\b/);
  assert.ok(mainEnd > 0 && mainEnd < form && form < footer, 'main, then the contact form, then the footer');
  assert.match(page.slice(mainEnd, footer), /^<\/main>\s*<div class="elementor elementor-3381 ect-shared-contact">/, 'the shared contact section follows the policy');
  assert.equal(count(page, '<form'), 1);
});

test('the policy content: neutral section ids, contents list, consent control and storage cards', () => {
  const ids = [...main.matchAll(/<section id="([^"]+)"/g)].map(([, id]) => id);
  assert.deepEqual(ids, ['summary', 'controller', 'data', 'purpose', 'retention', 'recipients', 'transfers', 'cookies', 'rights', 'complaints', 'children', 'security', 'changes']);
  const toc = [...main.match(/<nav class="ect-policy__toc"[\s\S]*?<\/nav>/)[0].matchAll(/<a href="#([^"]+)">([^<]+)<\/a>/g)];
  assert.deepEqual(toc.map(([, id]) => id), ids, 'the contents list links every section in order');
  for (const [, id, label] of toc) {
    assert.match(main, new RegExp(`<section id="${id}"[^>]*>\\n<h2>${label.replace(/[()]/g, '\\$&')}</h2>`), `contents label = H2 of #${id}`);
  }
  for (const [, href] of main.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(href), `#${href} exists`);
  assert.equal(count(main, 'data-ect-consent-open'), 1);
  assert.match(main, /<button type="button" class="ect-policy__consent-btn" data-ect-consent-open hidden>Schimbă setările cookie-urilor<\/button>/);
  assert.match(main, /<p class="ect-policy__consent-state" data-ect-consent-state aria-live="polite"><\/p>/);
  const cookies = main.slice(main.indexOf('<section id="cookies"'));
  assert.ok(cookies.indexOf('data-ect-consent-open') < cookies.indexOf('ect-policy__cookies'), 'the consent control comes before the cards');
  assert.deepEqual([...main.matchAll(/<h4 class="ect-policy__cookie-name"><code>([^<]+)<\/code><\/h4>/g)].map(([, name]) => name), ['ect-consent', '_ga', '_ga_PGM4B3VM9Z']);
  assert.equal(visibleDateModified(page), '2026-10-23');
  assert.match(main, /Ultima actualizare: <time datetime="2026-10-23">23 octombrie 2026<\/time>/);
  // Owner decisions that must stay visible.
  for (const fact of ['CUI', '47591744', 'J40/2298/2023', 'Alexandru Zagoritz nr. 12, sector 2, București 021998', '24 de luni', '14 luni', 'Gmail', 'Resend', 'Vercel', 'Hostico', 'ANSPDCP', '_ga_PGM4B3VM9Z']) {
    assert.ok(main.includes(fact), fact);
  }
  // What the policy reports from Google, Resend and Vercel links to their own pages.
  const sources = ['https://support.google.com/analytics/answer/12017362?hl=ro', 'https://support.google.com/analytics/answer/14077171?hl=ro',
    'https://support.google.com/analytics/answer/13802165?hl=ro', 'https://resend.com/security/gdpr', 'https://vercel.com/docs/logs/runtime'];
  for (const href of sources) assert.equal(count(main, `<a href="${href}">`), 1, `source linked: ${href}`);
  for (const claim of ['Google spune, în <a href="https://support.google.com/analytics/answer/12017362', 'Google spune, în <a href="https://support.google.com/analytics/answer/14077171',
    'Tot Google precizează, în <a href="https://support.google.com/analytics/answer/13802165']) assert.ok(main.includes(claim), claim);
  assert.doesNotMatch(main, /Google (?:spune|precizează) că/, 'every "Google says" names its source');
  assert.doesNotMatch(main, /Cloudflare|Turnstile/, 'production does not use Cloudflare Turnstile');
  assert.doesNotMatch(main, /@gmail\.com/, 'the personal Gmail address is never printed');
});

test('no em dash, diagonal arrows or cedilla in the page, its CSS and its dictionary', () => {
  for (const [name, text] of [['page', page], ['css', css], ['dictionary', dictionarySource]]) {
    assert.doesNotMatch(text, BANNED, name);
  }
  for (const [from, to] of privacyPolicyDictionary) {
    assert.doesNotMatch(to, ROMANIAN, `EN value keeps no Romanian letters: ${to.slice(0, 60)}`);
    assert.ok(!to.includes('de la'), `"de la" would be rewritten by the global dictionary: ${to.slice(0, 60)}`);
    assert.doesNotMatch(from + to, /\n/, 'one line per block');
  }
});

test('every dictionary key is a whole block of the page body, and only of the page body', () => {
  const keys = privacyPolicyDictionary.map(([from]) => from);
  assert.equal(new Set(keys).size, keys.length, 'no duplicate keys');
  const blocks = new Set([...main.matchAll(/<(h1|h2|h3|h4|p|li|dt|dd)\b[^>]*>([\s\S]*?)<\/\1>/g)].map(([, , inner]) => inner));
  // The <head> may repeat the H1 in the title tags; the build sets those from enPageMeta anyway.
  const body = page.slice(page.indexOf('</head>'));
  for (const key of keys) {
    assert.ok(blocks.has(key), `whole block in <main>: ${key.slice(0, 70)}`);
    assert.equal(count(body, key), count(main, key), `not in the header, form or footer: ${key.slice(0, 70)}`);
  }
  // Every other block is a contents link (translated through its H2 key) or reads the same in English.
  const contentsLink = /^<a href="#[a-z-]+">([^<]+)<\/a>$/;
  const rest = [...blocks].filter(inner => !keys.includes(inner) && !contentsLink.test(inner));
  assert.deepEqual(rest, [
    '',
    '<code>ect-consent</code>',
    '<code>_ga</code>',
    '<code>_ga_PGM4B3VM9Z</code>',
    '<strong>Email:</strong> <a href="mailto:anspdcp@dataprotection.ro">anspdcp@dataprotection.ro</a>',
  ]);
  for (const inner of blocks) {
    const link = inner.match(contentsLink);
    if (link) assert.ok(keys.includes(link[1]), `contents label has a key: ${link[1]}`);
  }
});

test('the generated English page carries every EN value verbatim and no Romanian in <main>', () => {
  // The build translates the RO pages after its own per-page steps, so run the
  // ones that touch the body (shared contact form, own-host links, lang) first.
  const build = read('scripts/build-static.mjs');
  const enStep = build.indexOf('generateEnglishPages({');
  for (const step of ['ensureSharedContact(html, ', 'normalizePageLinks(html, { pageUrl: urlPath })', "setLang(html, 'ro')"]) {
    const at = build.indexOf(step);
    assert.ok(at > 0 && at < enStep, `build-static.mjs runs ${step} before the English pages`);
  }
  const home = readFileSync(path.join(root, 'legacy-mirror', 'index.html'), 'utf8');
  const parent = path.join(root, '.tmp');
  mkdirSync(parent, { recursive: true });
  const directory = mkdtempSync(path.join(parent, 'privacy-page-'));
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
    for (const [from, to] of privacyPolicyDictionary) {
      assert.ok(englishMain.includes(to), `EN value verbatim: ${to.slice(0, 70)}`);
      assert.ok(!englishMain.includes(from), `RO key replaced: ${from.slice(0, 70)}`);
    }
    // Global entries ran after the page entries without touching the finished English.
    const stray = dictionary.filter(([from, to]) => from && from !== to && privacyPolicyDictionary.some(([, value]) => value.includes(from)));
    assert.deepEqual(stray.map(([from]) => from), [], 'no global key occurs inside the English policy text');
    assert.match(englishMain, /<h1>Privacy and cookie policy<\/h1>/);
    for (const id of [12017362, 14077171, 13802165]) {
      assert.equal(count(englishMain, `<a href="https://support.google.com/analytics/answer/${id}?hl=en">`), 1, `English Google source ${id}`);
    }
    assert.doesNotMatch(englishMain, /\?hl=ro/, 'English page links the English help pages');
    assert.match(englishMain, /<a href="#cookies">Cookies and Google Analytics<\/a>/);
    assert.match(englishMain, /<button type="button" class="ect-policy__consent-btn" data-ect-consent-open hidden>Change cookie settings<\/button>/);
    assert.equal(english.match(/<title>([^<]*)<\/title>/)[1], enPageMeta[route.en].title);
    assert.equal(metaContent(english, 'name="description"'), enPageMeta[route.en].description);
    assert.match(english, /<a class="skip-link screen-reader-text" href="#content">Skip to content<\/a>/);
    assert.equal((english.match(/<link\b[^>]*hreflang=/g) || []).length, 3);

    // WebPage.dateModified repeats the visible "last updated" date in both languages.
    const webPages = html => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
      .flatMap(([, json]) => [JSON.parse(json)].flat()).flatMap(item => item['@graph'] || [item])
      .filter(item => item['@type'] === 'WebPage');
    const [enPage] = webPages(english);
    assert.equal(enPage.dateModified, '2026-10-23');
    assert.equal(visibleDateModified(english), '2026-10-23');
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('WebPage.dateModified appears only when the page shows a last-updated date', () => {
  const base = { site, lang: 'ro', url: '/x/', name: 'X', description: 'Y' };
  assert.equal('dateModified' in webPage(base), false);
  assert.equal(webPage({ ...base, dateModified: '2026-10-20' }).dateModified, '2026-10-20');
  assert.equal(visibleDateModified('<p>Ultima actualizare: <time datetime="2026-10-20">20 octombrie 2026</time></p>'), undefined);
  assert.equal(visibleDateModified(read('legacy-mirror/contact/index.html')), undefined);
  const build = read('scripts/build-static.mjs');
  assert.match(build, /dateModified: visibleDateModified\(html\)/);
});

test('page CSS: mobile first, exact orange, visible focus, 44px targets, reduced motion, hidden stays hidden', () => {
  assert.match(css, /--orange: #fd8649;/);
  assert.doesNotMatch(css, /#(?:ad420f|ff6c2a|ff9762|ff5600|ff854e|a84515)\b|orange-deep/i, 'no other orange');
  assert.doesNotMatch(css, /--peach|#fff[01]e7\b|#f5ddce\b/i, 'no peach surfaces (owner decision, 20.10.2026)');
  assert.match(css, /\.ect-policy__summary \{[^}]*border: 2px solid var\(--orange\);[^}]*background: var\(--white\);/, 'summary: white with an orange outline');
  assert.doesNotMatch(css, /@media \(max-width:/, 'base styles are the phone styles');
  assert.match(css, /\.ect-policy \[hidden\] \{ display: none !important; \}/);
  assert.match(css, /:is\(a, button\):focus-visible \{ outline: 3px solid var\(--ink\); outline-offset: 5px; \}/);
  assert.match(css, /\.ect-policy__toc a \{[^}]*min-height: var\(--target-min\);/);
  assert.match(css, /--target-min: 44px;/);
  assert.match(css, /\.ect-policy__consent-btn \{[^}]*min-height: 52px;[^}]*white-space: normal;/);
  assert.match(css, /\.ect-policy__consent-btn:is\(:hover, :focus\) \{ background: var\(--white\); color: var\(--ink\); \}/, 'the Hello theme #c36 hover and focus are reset');
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{[^@]*\.ect-policy__consent-btn:active \{ transform: none; \}/);
  assert.match(css, /border-radius: var\(--radius-card\) var\(--radius-card\) var\(--radius-card\) var\(--radius-leaf-sm\);/);
  assert.match(css, /src: url\("fonts\/Montserrat-Variable-latin-ro\.woff2"\)/);
});
