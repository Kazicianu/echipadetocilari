import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { dictionary, googleAdsDictionary } from '../i18n/dictionary.mjs';
import { injectLangSwitcher } from '../i18n/lang-switcher.mjs';
import { routes } from '../i18n/routes.mjs';
import { enhanceMobileMenu } from './mobile-menu.mjs';
import { normalizePageLinks } from './navigation.mjs';

const source = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../legacy-mirror');

function attribute(tag, name) {
  return tag.match(new RegExp(`\\s${name}\\s*=\\s*(["'])(.*?)\\1`, 'i'))?.[2];
}

function hasClass(tag, name) {
  return (attribute(tag, 'class') || '').split(/\s+/).includes(name);
}

function header(html) {
  return html.match(/<header\b[\s\S]*?<\/header>/i)?.[0];
}

function menu(html, className) {
  return [...header(html).matchAll(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi)]
    .map(match => match[0])
    .find(nav => hasClass(nav.slice(0, nav.indexOf('>') + 1), className));
}

function links(html, className) {
  return [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)]
    .filter(([tag]) => !className || hasClass(tag.slice(0, tag.indexOf('>') + 1), className))
    .map(([, attrs, body]) => ({
      href: attribute(` ${attrs}`, 'href'),
      current: attribute(` ${attrs}`, 'aria-current'),
      label: body.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(),
    }));
}

function preparedPage(route, language) {
  let html = readFileSync(path.join(source, route.roFile), 'utf8');
  if (language === 'en') {
    const pairs = [...(route.ro === '/agentie-google-ads/' ? googleAdsDictionary : []), ...dictionary]
      .filter(([from, to]) => from && from !== to)
      .sort((a, b) => b[0].length - a[0].length);
    for (const [from, to] of pairs) html = html.split(from).join(to);
  }
  html = normalizePageLinks(html, { pageUrl: route.ro, language });
  return injectLangSwitcher(html, language, route.ro, route.en);
}

test('the expanding mobile menu preserves all six translated links on every RO and EN page', () => {
  let checkedCurrentLinks = 0;
  for (const route of routes) {
    for (const language of ['ro', 'en']) {
      const original = preparedPage(route, language);
      const expected = links(menu(original, 'elementor-nav-menu--dropdown'));
      const enhanced = enhanceMobileMenu(original);
      const actual = links(enhanced, 'ect-mobile-menu-link');
      const label = `${route[language]} (${language})`;

      assert.equal(expected.length, 6, `${label}: source has six mobile links`);
      assert.deepEqual(actual, expected, `${label}: copied links retain routes, labels and current page`);
      checkedCurrentLinks += actual.filter(link => link.current === 'page').length;
      assert.equal(menu(enhanced, 'elementor-nav-menu--main'), menu(original, 'elementor-nav-menu--main'), `${label}: desktop markup remains intact`);
      assert.deepEqual(links(menu(enhanced, 'elementor-nav-menu--dropdown')), expected, `${label}: original mobile fallback links remain intact`);
      assert.equal(enhanced.match(/<nav\b[^>]*id="ect-lang-switch"[\s\S]*?<\/nav>/i)?.[0], original.match(/<nav\b[^>]*id="ect-lang-switch"[\s\S]*?<\/nav>/i)?.[0], `${label}: language switch retains its routes and state`);
    }
  }
  assert.ok(checkedCurrentLinks >= 4, 'covers actual current-page mobile links in both languages');
});

test('the mobile control is a native button and shared assets are injected exactly once', () => {
  const original = preparedPage(routes[0], 'ro');
  const enhanced = enhanceMobileMenu(original);
  const toggle = [...header(enhanced).matchAll(/<button\b[^>]*>/gi)]
    .map(match => match[0])
    .find(tag => hasClass(tag, 'ect-mobile-menu-toggle'));

  assert.ok(toggle, 'native mobile toggle exists');
  assert.equal(attribute(toggle, 'type'), 'button');
  assert.equal(attribute(toggle, 'aria-expanded'), 'false');
  assert.equal(attribute(toggle, 'aria-controls'), 'ect-mobile-menu');
  assert.ok(!hasClass(toggle, 'elementor-menu-toggle'), 'Elementor cannot register its own toggle handler');
  assert.equal((enhanced.match(/\bid=["']ect-mobile-menu["']/g) || []).length, 1);
  assert.equal((enhanced.match(/\bhref=["']\/wp-content\/ect-pages\/mobile-menu\.css["']/g) || []).length, 1);
  assert.equal((enhanced.match(/\bsrc=["']\/wp-content\/ect-pages\/mobile-menu\.js["']/g) || []).length, 1);
  assert.equal(enhanceMobileMenu(enhanced), enhanced, 'repeated enhancement preserves the document byte for byte');
});

test('pages without a header are unchanged', () => {
  const html = '<!doctype html><html><head><title>Example</title></head><body><main><a href="/contact/">Contact</a></main></body></html>';
  assert.equal(enhanceMobileMenu(html), html);
});
