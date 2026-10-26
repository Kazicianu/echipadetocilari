import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { routes } from '../i18n/routes.mjs';
import { fixSkipLink, skipTargetCount, validateSkipLink } from './skip-link.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const skip = (text) => `<a class="skip-link screen-reader-text" href="#content">${text}</a>`;
const wrapper = '<div data-elementor-type="wp-page" data-elementor-id="3381" class="elementor elementor-3381">';

test('the skip link text becomes Romanian whatever language the source used', () => {
  for (const text of ['Skip to content', 'Mergi la conținut', 'Sari la conținut']) {
    assert.match(fixSkipLink(`${skip(text)}<main id="content"></main>`), />Sari la conținut<\/a>/);
  }
});

test('a page without a target gets one on the Elementor page wrapper', () => {
  const html = fixSkipLink(`${skip('Skip to content')}<header></header>${wrapper}<p></p></div><footer data-elementor-type="footer"></footer>`);
  assert.match(html, /<div id="content" role="main" tabindex="-1" data-elementor-type="wp-page" data-elementor-id="3381"/);
  assert.equal(skipTargetCount(html), 1);
  assert.deepEqual(validateSkipLink(html, '/'), []);
});

test('an existing target is kept and never duplicated', () => {
  const withMain = `${skip('x')}${wrapper}<main id="content" class="gads-page"></main></div>`;
  assert.equal(fixSkipLink(withMain).match(/id="content"/g).length, 1);
  assert.doesNotMatch(fixSkipLink(withMain), /role="main"/);

  const once = fixSkipLink(`${skip('x')}${wrapper}</div>`);
  assert.equal(fixSkipLink(once), once, 'a second pass changes nothing');
});

test('markup inside scripts is not mistaken for the target', () => {
  const html = fixSkipLink(`${skip('x')}<script>var t = '<main id="content">';</script>${wrapper}</div>`);
  assert.equal(skipTargetCount(html), 1);
  assert.match(html, /<div id="content" role="main"/);
});

test('a wrapper that already has an id is left alone and reported', () => {
  const html = fixSkipLink(`${skip('x')}<div id="page" data-elementor-type="wp-page"></div>`);
  assert.doesNotMatch(html, /id="content"/);
  assert.match(validateSkipLink(html, '/x/')[0], /\/x\/: skip link needs exactly one id="content", found 0/);
});

test('validation counts duplicates and ignores pages without a skip link', () => {
  assert.equal(validateSkipLink('<main id="content"></main><div id="content"></div>' + skip('x'), '/p/').length, 1);
  assert.deepEqual(validateSkipLink('<p>no skip link</p>', '/p/'), []);
});

test('every source page ends up with exactly one #content target and the Romanian text', () => {
  for (const route of routes) {
    const html = fixSkipLink(readFileSync(path.join(root, 'legacy-mirror', route.roFile), 'utf8'));
    assert.equal(skipTargetCount(html), 1, route.ro);
    assert.match(html, /<a class="skip-link screen-reader-text" href="#content">Sari la conținut<\/a>/, route.ro);
  }
});
