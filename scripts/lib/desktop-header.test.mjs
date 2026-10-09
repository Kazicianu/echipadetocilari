import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { dictionary, googleAdsDictionary } from '../i18n/dictionary.mjs';
import { injectLangSwitcher } from '../i18n/lang-switcher.mjs';
import { routes } from '../i18n/routes.mjs';
import { enhanceDesktopHeader, serviceMenuCopy } from './desktop-header.mjs';
import { enhanceMobileMenu } from './mobile-menu.mjs';
import { normalizePageLinks } from './navigation.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const source = path.join(root, 'legacy-mirror');
const stylesheet = '/wp-content/ect-pages/desktop-header.css';

function preparedPage(route, language) {
  let html = readFileSync(path.join(source, route.roFile), 'utf8');
  if (language === 'en') {
    html = html.replace(/<html\b([^>]*)\blang="[^"]*"/i, '<html$1lang="en"');
    const pairs = [...(route.ro === '/agentie-google-ads/' ? googleAdsDictionary : []), ...dictionary]
      .filter(([from, to]) => from && from !== to)
      .sort((a, b) => b[0].length - a[0].length);
    for (const [from, to] of pairs) html = html.split(from).join(to);
  }
  html = normalizePageLinks(html, { pageUrl: route.ro, language });
  return injectLangSwitcher(html, language, route.ro, route.en);
}

function nav(html, className) {
  const header = html.match(/<header\b[\s\S]*?<\/header>/i)[0];
  return [...header.matchAll(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi)]
    .map(match => match[0])
    .find(item => new RegExp(`class="[^"]*\\b${className}\\b`).test(item.slice(0, item.indexOf('>') + 1)));
}

function submenuLinks(html) {
  const list = nav(html, 'elementor-nav-menu--main').match(/<ul class="sub-menu\b[\s\S]*?<\/ul>/i)[0];
  return [...list.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].map(([, attrs, body]) => ({
    href: attrs.match(/\shref="([^"]*)"/)?.[1],
    current: attrs.match(/\saria-current="([^"]*)"/)?.[1],
    title: (body.match(/<span class="ect-svc-title">([\s\S]*?)<\/span>/)?.[1] ?? body).trim(),
    description: body.match(/<span class="ect-svc-desc">([\s\S]*?)<\/span>/)?.[1],
    enhanced: /\bect-svc-link\b/.test(attrs),
  }));
}

const copyByHref = new Map(routes.filter(route => serviceMenuCopy[route.ro])
  .flatMap(route => [[route.ro, serviceMenuCopy[route.ro].ro], [route.en, serviceMenuCopy[route.ro].en]]));

test('every RO and EN page gets the four described service links in its own language', () => {
  for (const route of routes) {
    for (const language of ['ro', 'en']) {
      const label = `${route[language]} (${language})`;
      const original = preparedPage(route, language);
      const enhanced = enhanceDesktopHeader(original);
      const before = submenuLinks(original);
      const after = submenuLinks(enhanced);

      assert.equal(after.length, 4, `${label}: four service links`);
      assert.ok(after.every(link => link.enhanced), `${label}: every service link is enhanced`);
      assert.deepEqual(after.map(({ href, current, title }) => ({ href, current, title })),
        before.map(({ href, current, title }) => ({ href, current, title })), `${label}: routes, labels and current page kept`);
      for (const link of after) {
        assert.equal(link.description, copyByHref.get(link.href), `${label}: ${link.href} uses the ${language} description`);
      }
      assert.equal(nav(enhanced, 'elementor-nav-menu--dropdown'), nav(original, 'elementor-nav-menu--dropdown'), `${label}: mobile fallback menu untouched`);
      assert.equal(enhanced.split(stylesheet).length - 1, 1, `${label}: stylesheet linked once`);
    }
  }
});

test('the transform is idempotent and composes with the mobile menu', () => {
  const page = preparedPage(routes[0], 'ro');
  const once = enhanceDesktopHeader(page);
  assert.equal(enhanceDesktopHeader(once), once);
  const both = enhanceMobileMenu(once);
  assert.equal(nav(both, 'elementor-nav-menu--main'), nav(once, 'elementor-nav-menu--main'));
  assert.ok(both.includes('id="ect-mobile-menu"'));
});

test('pages without the shared submenu are left alone', () => {
  const html = '<html lang="ro"><head></head><body><header><nav class="elementor-nav-menu--main"><ul></ul></nav></header></body></html>';
  assert.equal(enhanceDesktopHeader(html), html);
});

test('menu copy follows the content rules', () => {
  const text = JSON.stringify(serviceMenuCopy) + readFileSync(path.join(source, 'wp-content/ect-pages/desktop-header.css'), 'utf8');
  assert.doesNotMatch(text, /—/, 'no em dash');
  assert.doesNotMatch(text, /[↖-↙]/, 'no diagonal arrows');
  assert.doesNotMatch(text, /[ŞşŢţ]/, 'comma-below ș and ț only');
});
