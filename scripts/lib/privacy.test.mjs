import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { routes } from '../i18n/routes.mjs';
import { injectLangSwitcher } from '../i18n/lang-switcher.mjs';
import { injectHreflang, setLang } from './html.mjs';
import { makeStandaloneAssets } from './standalone-assets.mjs';
import { fallbackOgImage, normalizeSocialMeta } from './social-meta.mjs';
import { validateBuild } from './validate.mjs';
import {
  CONSENT_SCRIPT,
  CONSENT_STYLESHEET,
  GA_HOSTS,
  PRIVACY_PATHS,
  addConsentManager,
  addFooterPrivacyLinks,
  consentCopy,
  pageLanguage,
} from './privacy.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const GA_ID = 'G-PGM4B3VM9Z';
const count = (html, pattern) => (html.match(pattern) || []).length;

function sourcePages() {
  return routes.flatMap(route => (route.en ? ['ro', 'en'] : ['ro']).map(language => ({
    route, language, url: route[language],
    html: setLang(readFileSync(path.join(root, 'legacy-mirror', route.roFile), 'utf8'), language),
  })));
}

test('privacy routes and footer labels come from one place', () => {
  assert.deepEqual(PRIVACY_PATHS, { ro: '/politica-de-confidentialitate/', en: '/en/privacy-policy/' });
  const copy = consentCopy();
  assert.deepEqual(Object.keys(copy).sort(), ['en', 'ro']);
  assert.deepEqual(Object.keys(copy.en).sort(), Object.keys(copy.ro).sort());
  assert.equal(copy.ro.footerPolicy, 'Politica de confidențialitate');
  assert.equal(copy.ro.footerSettings, 'Setări cookie-uri');
  assert.equal(copy.en.footerPolicy, 'Privacy policy');
  assert.equal(copy.en.footerSettings, 'Cookie settings');
  assert.equal(pageLanguage('<html lang="en">'), 'en');
  assert.equal(pageLanguage('<html lang="en-US">'), 'en');
  assert.equal(pageLanguage('<html lang="ro">'), 'ro');
});

test('every RO and EN page gets one policy link and one hidden cookie-settings button in the footer list', () => {
  const copy = consentCopy();
  for (const { language, url, html } of sourcePages()) {
    const label = `${url} (${language})`;
    const result = addFooterPrivacyLinks(html);
    assert.equal(addFooterPrivacyLinks(result), result, `${label}: idempotent`);
    assert.equal(count(result, /data-ect-footer-privacy/g), 1, label);
    const footer = result.match(/<footer\b[\s\S]*<\/footer>/i)[0];
    assert.equal(count(footer, /data-ect-consent-open/g), 1, label);
    // The policy page has its own "change cookie settings" button in #cookies.
    const ownControls = url === PRIVACY_PATHS[language] ? 1 : 0;
    assert.equal(count(result, /data-ect-consent-open/g), 1 + ownControls, label);
    const list = footer.match(/elementor-element-3cc1c00[\s\S]*?<\/strong><\/p>\s*<p class="ect-footer-links">([\s\S]*?)<\/p>/)[1];
    assert.ok(list.endsWith(
      `<br><a href="${PRIVACY_PATHS[language]}" data-ect-footer-privacy>${copy[language].footerPolicy}</a>` +
      `<button type="button" class="ect-consent-open" data-ect-consent-open hidden>${copy[language].footerSettings}</button>`,
    ), `${label}: appended after the existing links, in the page language`);
    assert.equal(count(footer, /class="ect-footer-links"/g), 1, `${label}: the list is marked for its 44px rows`);
    assert.equal(
      result.replace(/<br><a href="[^"]*" data-ect-footer-privacy>[^<]*<\/a><button\b[^>]*>[^<]*<\/button>/, '').replace('<p class="ect-footer-links">', '<p>'),
      html, `${label}: nothing else changes`);
  }
});

test('the footer transform fails loudly when the footer list is missing', () => {
  assert.throws(() => addFooterPrivacyLinks('<html lang="ro"><body><footer><p>x</p></footer></body></html>'), /elementor-element-3cc1c00/);
});

test('every page loads consent.css and exactly one deferred consent.js with the GA ID, hosts and policy anchor', () => {
  for (const { language, url, html } of sourcePages()) {
    const label = `${url} (${language})`;
    const result = makeStandaloneAssets(addConsentManager(addFooterPrivacyLinks(html), { gaId: GA_ID }));
    assert.equal(addConsentManager(result, { gaId: GA_ID }), result, `${label}: idempotent`);
    assert.equal(count(result, /<script\b[^>]*\bsrc="\/wp-content\/ect-pages\/consent\.js"/g), 1, label);
    assert.equal(count(result, /<link rel="stylesheet" href="\/wp-content\/ect-pages\/consent\.css">/g), 1, label);
    const tag = result.match(/<script\b[^>]*consent\.js[^>]*>/)[0];
    assert.match(tag, /\sdefer\b/);
    assert.match(tag, new RegExp(`data-ga-id="${GA_ID}"`));
    assert.match(tag, new RegExp(`data-ga-hosts="${GA_HOSTS.join(' ')}"`));
    assert.match(tag, new RegExp(`data-policy="${PRIVACY_PATHS[language]}#cookies"`));
    const head = result.slice(0, result.search(/<\/head>/i));
    assert.ok(head.includes(CONSENT_SCRIPT) && head.includes(CONSENT_STYLESHEET), `${label}: assets are in <head>`);
  }
  assert.throws(() => addConsentManager('<html><head></head></html>', { gaId: 'UA-1' }), /GA4 measurement ID/);
  assert.throws(() => addConsentManager('<html><head></head></html>', {}), /GA4 measurement ID/);
});

test('the build adds no Google tag of its own and wires the footer and consent transforms', () => {
  const build = readFileSync(path.join(root, 'scripts/build-static.mjs'), 'utf8');
  assert.doesNotMatch(build, /googletagmanager\.com\/gtag\/js/);
  assert.doesNotMatch(build, /gtag\(\s*['"]config['"]/);
  assert.match(build, /google_gtagjs/, 'the inherited WordPress tag is still removed');
  assert.match(build, /addConsentManager\(addFooterPrivacyLinks\(html\), \{ gaId: GA4_MEASUREMENT_ID \}\)/);
  assert.match(build, /const GA4_MEASUREMENT_ID = 'G-PGM4B3VM9Z';/);
  const loop = build.slice(build.indexOf('addFooterPrivacyLinks(html)'));
  assert.ok(loop.indexOf('makeStandaloneAssets(html)') > 0, 'consent assets are added before asset normalisation');
});

test('validation rejects a page whose static HTML loads the Google tag', () => {
  const parent = path.join(root, '.tmp');
  mkdirSync(parent, { recursive: true });
  const directory = mkdtempSync(path.join(parent, 'consent-validation-'));
  const files = [];
  const publicPaths = new Map();
  try {
    for (const route of routes) {
      for (const language of route.en ? ['ro', 'en'] : ['ro']) {
        const file = path.join(directory, language === 'en' ? route.enFile : route.roFile);
        mkdirSync(path.dirname(file), { recursive: true });
        let html = `<html lang="${language}"><head><title>Page</title><meta name="description" content="A sufficiently long description for the validation of this test page."><meta name="robots" content="noindex, nofollow"></head><body><header></header><h1>Page</h1><form data-ect-contact="${language}"></form><footer></footer></body></html>`;
        html = injectHreflang(html, { site: 'https://www.echipadetocilari.ro', roPath: route.ro, enPath: route.en });
        html = injectLangSwitcher(html, language, route.ro, route.en);
        html = normalizeSocialMeta(html, { site: 'https://www.echipadetocilari.ro', pageUrl: route[language], locale: language === 'en' ? 'en_US' : 'ro_RO' });
        html = addConsentManager(html, { gaId: GA_ID });
        writeFileSync(file, html);
        files.push(file);
        publicPaths.set(file, route[language]);
      }
    }
    const logo = path.join(directory, fallbackOgImage.path);
    mkdirSync(path.dirname(logo), { recursive: true });
    writeFileSync(logo, '');
    const options = { outDir: directory, files, urlPathOf: file => publicPaths.get(file), indexable: false };
    assert.deepEqual(validateBuild(options), [], 'consent.js alone passes');
    const file = files[0];
    const html = readFileSync(file, 'utf8');
    for (const tag of [
      '<script async src="https://www.googletagmanager.com/gtag/js?id=G-PGM4B3VM9Z"></script>',
      "<script>window.dataLayer=[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-PGM4B3VM9Z');</script>",
      '<script>gtag("config", "G-PGM4B3VM9Z");</script>',
    ]) {
      writeFileSync(file, html.replace('</head>', `${tag}</head>`));
      assert.ok(validateBuild(options).some(error => error.includes('Google tag in the static HTML')), tag);
    }
    writeFileSync(file, html);

    // A Romanian block left untranslated on an English page fails the build.
    const english = files.find(item => publicPaths.get(item) === PRIVACY_PATHS.en);
    const englishHtml = readFileSync(english, 'utf8');
    writeFileSync(english, englishHtml.replace('<h1>Page</h1>', '<h1>Page</h1><p>Politica de confidențialitate</p>'));
    assert.deepEqual(validateBuild(options).map(error => error.replace(/ \(".*"\)/, '')),
      ['en/privacy-policy/index.html: Romanian text left on an English page; translate it in scripts/i18n/']);
    writeFileSync(english, englishHtml.replace('<h1>Page</h1>', '<h1>Page</h1><p title="Setări">Privacy policy</p>'));
    assert.equal(validateBuild(options).length, 1, 'attributes count too');
    // Romanian pages, and inline scripts on English pages, are not checked.
    writeFileSync(english, englishHtml.replace('<h1>Page</h1>', '<h1>Page</h1><script>var label = "Setări";</script>'));
    writeFileSync(file, html.replace('<h1>Page</h1>', '<h1>Page</h1><p>Politica de confidențialitate</p>'));
    assert.deepEqual(validateBuild(options), []);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
