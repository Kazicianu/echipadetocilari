import assert from 'node:assert/strict';
import test from 'node:test';
import { stripWordPressLinks } from './html.mjs';

const head = [
  '<link rel="stylesheet" href="/a.css">',
  '<link rel="alternate" type="application/rss+xml" title="Feed" href="https://www.echipadetocilari.ro/feed/">',
  '<link rel="alternate" type="application/rss+xml" title="Comments Feed" href="https://www.echipadetocilari.ro/comments/feed/">',
  '<link rel="alternate" hreflang="en" href="https://www.echipadetocilari.ro/en/">',
  '<link rel="shortlink" href="/">',
  '<link rel=\'shortlink\' href=\'/?p=2\'>',
  '<link rel="canonical" href="https://www.echipadetocilari.ro/">',
].join('\n');

test('stripWordPressLinks removes the RSS feed and shortlink links only', () => {
  const out = stripWordPressLinks(`<head>\n${head}\n</head>`);
  assert.doesNotMatch(out, /rss\+xml/);
  assert.doesNotMatch(out, /shortlink/);
  assert.match(out, /<link rel="stylesheet" href="\/a\.css">/);
  assert.match(out, /hreflang="en"/);
  assert.match(out, /rel="canonical"/);
});

test('stripWordPressLinks leaves no blank lines behind and is idempotent', () => {
  const once = stripWordPressLinks(`<head>\r\n${head.replace(/\n/g, '\r\n')}\r\n</head>`);
  assert.doesNotMatch(once, /\r\n\s*\r\n/);
  assert.equal(stripWordPressLinks(once), once);
});
