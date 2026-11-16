import assert from 'node:assert/strict';
import test from 'node:test';
import { enhanceFaqPanel } from './faq-panel.mjs';

const withFaq = '<html><head><title>x</title></head><body><div data-faq-panel><details><summary>q</summary><p>a</p></details></div></body></html>';
const withoutFaq = '<html><head><title>x</title></head><body><details><summary>q</summary><p>a</p></details></body></html>';

test('adds the script once, even when applied twice', () => {
  const once = enhanceFaqPanel(withFaq);
  assert.equal(once.split('/wp-content/ect-pages/faq-panel.js').length - 1, 1);
  assert.equal(enhanceFaqPanel(once), once);
});

test('leaves a page without data-faq-panel unchanged', () => {
  assert.equal(enhanceFaqPanel(withoutFaq), withoutFaq);
});

test('the script is deferred and placed in the body', () => {
  const out = enhanceFaqPanel(withFaq);
  assert.match(out, /<script src="\/wp-content\/ect-pages\/faq-panel\.js" defer><\/script>\s*<\/body>/);
});
