import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { isOwnedPage, retiredPagePaths, routes } from '../i18n/routes.mjs';
import { roPageMeta } from '../i18n/meta-ro.mjs';
import { enPageMeta } from '../i18n/dictionary.mjs';
import { injectHreflang } from './html.mjs';
import { injectLangSwitcher } from '../i18n/lang-switcher.mjs';
import { validateBuild } from './validate.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const formerPages = ['/services/', '/en/services/', '/clients/', '/en/clients/', '/logo-design/', '/en/logo-design/'];

test('withdrawn demo and logo pages have no route, metadata, or source HTML', () => {
  assert.deepEqual(new Set(retiredPagePaths), new Set(formerPages));
  for (const pathname of formerPages) {
    assert.equal(isOwnedPage(pathname), false, pathname);
    assert.equal(roPageMeta[pathname], undefined, pathname);
    assert.equal(enPageMeta[pathname], undefined, pathname);
    assert.equal(existsSync(path.join(root, 'legacy-mirror', pathname.slice(1), 'index.html')), false, pathname);
  }
  const home = readFileSync(path.join(root, 'legacy-mirror/index.html'), 'utf8');
  assert.equal((home.match(/\bid="servicii"/g) || []).length, 1);
  const facebookCard = home.match(/<a\b[^>]*data-id="77240360"[^>]*>/)?.[0];
  assert.match(facebookCard || '', /href="#formular_contact_bottom"/);
});

test('build validation rejects retired internal links, including scraped relative and index.html forms', () => {
  const parent = path.join(root, '.tmp');
  mkdirSync(parent, { recursive: true });
  const directory = mkdtempSync(path.join(parent, 'retired-page-validation-'));
  const files = [], publicPaths = new Map();
  try {
    for (const route of routes) {
      for (const language of route.en ? ['ro', 'en'] : ['ro']) {
        const file = path.join(directory, language === 'en' ? route.enFile : route.roFile);
        mkdirSync(path.dirname(file), { recursive: true });
        let html = `<html><head><title>Page</title><meta name="description" content="A sufficiently long description for the validation of this test page."><meta name="robots" content="noindex, nofollow"></head><body><header></header><h1>Page</h1><form data-ect-contact="${language}"></form><footer></footer></body></html>`;
        html = injectHreflang(html, { site: 'https://www.echipadetocilari.ro', roPath: route.ro, enPath: route.en });
        html = injectLangSwitcher(html, language, route.ro, route.en);
        writeFileSync(file, html);
        files.push(file); publicPaths.set(file, route[language]);
      }
    }
    const options = { outDir: directory, files, urlPathOf: file => publicPaths.get(file), indexable: false };
    assert.deepEqual(validateBuild(options), []);
    const file = path.join(directory, 'about-2/index.html');
    const html = readFileSync(file, 'utf8');
    for (const href of [...formerPages, '../clients/index.html', 'https://echipadetocilari.ro/logo-design?old=1#offer', '../services/']) {
      writeFileSync(file, html.replace('</body>', `<a href="${href}">Old page</a></body>`));
      assert.ok(validateBuild(options).some(error => error.includes('link to retired page')), href);
    }
    writeFileSync(file, html.replace('</body>', '<a href="https://example.com/services/">External</a><a href="/servicii-seo/">SEO</a><script>const sample=\'<a href="/clients/">Example</a>\';</script></body>'));
    assert.deepEqual(validateBuild(options), []);
  } finally {
    assert.equal(path.dirname(directory), parent);
    assert.ok(path.basename(directory).startsWith('retired-page-validation-'));
    rmSync(directory, { recursive: true, force: true });
  }
});
