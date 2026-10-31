import assert from 'node:assert/strict';
import test from 'node:test';
import { enhanceBackToTop } from './back-to-top.mjs';

const withTop = '<html><head><title>x</title></head><body><footer><a href="#top">Sus</a></footer></body></html>';
const withoutTop = '<html><head><title>x</title></head><body><footer><a href="#contact">Contact</a></footer></body></html>';

test('adds the style and the script once, even when applied twice', () => {
  const once = enhanceBackToTop(withTop);
  assert.equal(once.split('/* ect-back-to-top */').length - 1, 1);
  assert.equal(once.split('/wp-content/ect-pages/back-to-top.js').length - 1, 1);
  assert.equal(enhanceBackToTop(once), once);
});

test('leaves a page without href="#top" unchanged', () => {
  assert.equal(enhanceBackToTop(withoutTop), withoutTop);
});

test('the style only hides the arrow when scripting is enabled', () => {
  assert.match(enhanceBackToTop(withTop), /@media \(scripting:enabled\)/);
});
