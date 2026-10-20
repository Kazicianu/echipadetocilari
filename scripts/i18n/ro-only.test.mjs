import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { routes, pairedRoutes, roToEn, enToRo, isOwnedPage, routeByRo } from './routes.mjs';
import { generateEnglishPages, patchRomanianPages } from './generate-en.mjs';
import { injectLangSwitcher } from './lang-switcher.mjs';
import { injectHreflang } from '../lib/html.mjs';
import { extractHomeFaqs } from '../lib/faq.mjs';
import { validateBuild } from '../lib/validate.mjs';
import { fallbackOgImage, normalizeSocialMeta } from '../lib/social-meta.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const source = path.join(root, 'legacy-mirror');
const shop = routeByRo('/creare-magazin-online/');
const apps = routeByRo('/dezvoltare-aplicatii/');
const site = 'https://www.echipadetocilari.ro';

function scratchDirectory(prefix) {
  const parent = path.join(root, '.tmp');
  mkdirSync(parent, { recursive: true });
  const directory = mkdtempSync(path.join(parent, prefix));
  return {
    directory,
    cleanup() {
      assert.equal(path.dirname(directory), parent);
      assert.ok(path.basename(directory).startsWith(prefix));
      rmSync(directory, { recursive: true, force: true });
    },
  };
}

test('online-store route is owned in Romanian without an unapproved English twin', () => {
  assert.equal(shop.roFile, 'creare-magazin-online/index.html');
  assert.equal(shop.en, undefined);
  assert.equal(shop.enFile, undefined);
  assert.equal(shop.service.ro, 'Creare magazin online');
  assert.equal(isOwnedPage(shop.ro), true);
  assert.equal(isOwnedPage(undefined), false);
  assert.equal(isOwnedPage('/en/online-store-development/'), false);
  assert.equal(roToEn[shop.ro], undefined);
  assert.equal(enToRo.undefined, undefined);
  const romanianOnly = routes.filter(route => !route.en && !route.enFile);
  assert.equal(pairedRoutes.length + romanianOnly.length, routes.length);
});

test('applications landing is owned in Romanian without an unapproved English twin', () => {
  assert.equal(apps.roFile, 'dezvoltare-aplicatii/index.html');
  assert.equal(apps.service.ro, 'Dezvoltare aplicații mobile și web');
  assert.equal(apps.en, undefined);
  assert.equal(apps.enFile, undefined);
  assert.equal(isOwnedPage(apps.ro), true);
  assert.equal(isOwnedPage('/en/app-development/'), false);
  assert.equal(roToEn[apps.ro], undefined);
});

test('Romanian-only pages replace old translation links with the English homepage and drop hreflang', () => {
  const original = '<html><head></head><body><header><div class="elementor-menu-toggle"></div></header><main>Content</main></body></html>';
  const withPair = injectLangSwitcher(injectHreflang(original, { site, roPath: shop.ro, enPath: '/en/old-shop/' }), 'ro', shop.ro, '/en/old-shop/');
  const unpaired = injectLangSwitcher(injectHreflang(withPair, { site, roPath: shop.ro }), 'ro', shop.ro);
  assert.doesNotMatch(unpaired, /<link\b[^>]*hreflang|old-shop|undefined/);
  assert.equal((unpaired.match(/id="ect-lang-switch"/g) || []).length, 1, 'the homepage header chip appears once');
  assert.match(unpaired, new RegExp(`<a href="${shop.ro}" hreflang="ro" lang="ro" aria-current="true"`));
  assert.match(unpaired, /<a href="\/en\/" hreflang="en" lang="en" title="English homepage" aria-label="EN: English homepage">EN<\/a>/);
  assert.match(unpaired, /<\/span>\s*<div class="elementor-menu-toggle">/);
  assert.match(unpaired, /<main>Content<\/main>/);
});

test('English generation skips the store, preserves all existing pairs and omits its header links', () => {
  const scratch = scratchDirectory('ro-only-generation-');
  try {
    for (const route of routes) {
      const file = path.join(scratch.directory, route.roFile);
      mkdirSync(path.dirname(file), { recursive: true });
      writeFileSync(file, readFileSync(path.join(source, route.roFile), 'utf8'));
    }
    const generated = generateEnglishPages({ outDir: scratch.directory, site, indexable: false });
    patchRomanianPages({ outDir: scratch.directory, site });
    assert.deepEqual(generated, pairedRoutes.map(route => route.en));
    assert.equal(existsSync(path.join(scratch.directory, 'en/creare-magazin-online/index.html')), false);
    assert.equal(existsSync(path.join(scratch.directory, 'en/online-store-development/index.html')), false);
    assert.equal(existsSync(path.join(scratch.directory, 'en/app-development/index.html')), false);
    assert.equal(existsSync(path.join(scratch.directory, 'en/dezvoltare-aplicatii/index.html')), false);
    const applications = readFileSync(path.join(scratch.directory, apps.roFile), 'utf8');
    const romanian = readFileSync(path.join(scratch.directory, shop.roFile), 'utf8');
    for (const html of [applications, romanian]) {
      assert.doesNotMatch(html, /<link\b[^>]*hreflang=|href="[^"]*undefined/);
      const switcher = html.match(/<nav id="ect-lang-switch"[\s\S]*?<\/nav>/)?.[0] ?? '';
      assert.deepEqual([...switcher.matchAll(/href="([^"]*)"/g)].map(match => match[1]).slice(1), ['/en/'], 'EN opens the English homepage');
    }
    const shopHeader = romanian.match(/<header\b[\s\S]*?<\/header>/)[0];
    const activeLinks = [...shopHeader.matchAll(/<a\b[^>]*aria-current="page"[^>]*>/g)].map(match => match[0]);
    assert.equal(activeLinks.length, 2);
    assert.ok(activeLinks.every(link => link.includes(`href="${shop.ro}"`)));
    for (const route of pairedRoutes) {
      const english = readFileSync(path.join(scratch.directory, route.enFile), 'utf8');
      const header = english.match(/<header\b[\s\S]*?<\/header>/)[0];
      assert.doesNotMatch(header, /href="\/creare-magazin-online\/"|Creare magazin online/);
      assert.doesNotMatch(header, /href="\/dezvoltare-aplicatii\/"|Dezvoltare aplicații/);
      assert.equal((english.match(/<link\b[^>]*hreflang=/g) || []).length, 3, route.en);
      assert.match(english, /id="ect-lang-switch"/);
      assert.doesNotMatch(english, /(?:href|content)="[^"]*undefined/);
      assert.match(english, /<meta name="robots" content="noindex,/);
    }
  } finally { scratch.cleanup(); }
});

test('build validation requires only approved language variants and rejects stale shop alternates', () => {
  const scratch = scratchDirectory('ro-only-validation-');
  const files = [];
  const publicPaths = new Map();
  try {
    for (const route of routes) {
      for (const language of route.en ? ['ro', 'en'] : ['ro']) {
        const url = route[language];
        const file = path.join(scratch.directory, language === 'en' ? route.enFile : route.roFile);
        mkdirSync(path.dirname(file), { recursive: true });
        let html = `<html lang="${language}"><head><title>Page</title><meta name="description" content="A sufficiently long description for this page so metadata checks pass."><meta name="robots" content="noindex, nofollow"></head><body><header></header><main><h1>Page</h1></main><form data-ect-contact="${language}"></form><footer></footer></body></html>`;
        html = injectHreflang(html, { site, roPath: route.ro, enPath: route.en });
        html = injectLangSwitcher(html, language, route.ro, route.en);
        html = normalizeSocialMeta(html, { site, pageUrl: url, locale: language === 'en' ? 'en_US' : 'ro_RO' });
        writeFileSync(file, html);
        files.push(file);
        publicPaths.set(file, url);
      }
    }
    const logo = path.join(scratch.directory, fallbackOgImage.path);
    mkdirSync(path.dirname(logo), { recursive: true });
    writeFileSync(logo, '');
    const options = { outDir: scratch.directory, files, urlPathOf: file => publicPaths.get(file), indexable: false };
    assert.deepEqual(validateBuild(options), []);
    const shopFile = path.join(scratch.directory, shop.roFile);
    let html = readFileSync(shopFile, 'utf8');
    html = injectHreflang(html, { site, roPath: shop.ro, enPath: '/en/old-shop/' });
    html = injectLangSwitcher(html, 'ro', shop.ro, '/en/old-shop/');
    writeFileSync(shopFile, html);
    const errors = validateBuild(options);
    assert.ok(errors.some(error => error.includes('language switcher has no English page')));
    assert.ok(errors.some(error => error.includes('expected 0 hreflang links')));
  } finally { scratch.cleanup(); }
});

test('store FAQ schema can be extracted directly from all seven visible questions', () => {
  const html = readFileSync(path.join(source, shop.roFile), 'utf8');
  const questions = extractHomeFaqs(html);
  assert.equal(questions.length, 7);
  assert.equal(questions[0].q, 'Cât costă crearea unui magazin online?');
  assert.match(questions[0].a, /1\.490 €/);
  assert.ok(questions.every(({ q, a }) => q.length > 15 && a.length > 30));
});
