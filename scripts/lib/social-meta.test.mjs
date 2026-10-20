import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { fallbackOgImage, normalizeSocialMeta } from './social-meta.mjs';
import { validateBuild } from './validate.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const site = 'https://www.echipadetocilari.ro';
const rankMathHead = `<html><head>
<meta property="og:locale" content="en_US">
<meta property="og:type" content="article">
<meta property="og:updated_time" content="2024-04-16T13:09:55+00:00">
<meta property="og:image" content="../wp-content/uploads/2024/03/admin.webp">
<meta property="og:image:secure_url" content="/wp-content/uploads/2024/03/admin.webp">
<meta property="article:published_time" content="2024-02-15T17:25:53+00:00">
<meta property="article:modified_time" content="2024-04-16T13:09:55+00:00">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="../wp-content/uploads/2024/03/admin.webp">
<meta name="twitter:label1" content="Written by">
<meta name="twitter:data1" content="EchipaDeTocilari">
<meta name="twitter:label2" content="Time to read">
<meta name="twitter:data2" content="5 minutes">
</head><body></body></html>`;

test('WordPress share leftovers are removed and the page image becomes absolute', () => {
  const html = normalizeSocialMeta(rankMathHead, { site, pageUrl: '/administrare-site/', locale: 'ro_RO' });
  assert.doesNotMatch(html, /og:updated_time|article:|twitter:label|twitter:data|Written by|Time to read/);
  assert.match(html, /<meta property="og:locale" content="ro_RO">/);
  assert.match(html, /<meta property="og:type" content="website">/);
  assert.match(html, /property="og:image" content="https:\/\/www\.echipadetocilari\.ro\/wp-content\/uploads\/2024\/03\/admin\.webp"/);
  assert.match(html, /property="og:image:secure_url" content="https:\/\/www\.echipadetocilari\.ro\/wp-content\/uploads\/2024\/03\/admin\.webp"/);
  assert.match(html, /name="twitter:image" content="https:\/\/www\.echipadetocilari\.ro\/wp-content\/uploads\/2024\/03\/admin\.webp"/);
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
  assert.equal(normalizeSocialMeta(html, { site, pageUrl: '/administrare-site/', locale: 'ro_RO' }), html);
});

test('pages without an image share the square logo with a summary card', () => {
  const html = normalizeSocialMeta('<html><head><meta name="twitter:card" content="summary_large_image"></head><body></body></html>', {
    site: 'https://preview.example.test', pageUrl: '/en/contact/', locale: 'en_US',
  });
  const logo = `https://preview.example.test${fallbackOgImage.path}`;
  assert.match(html, /<meta property="og:locale" content="en_US">/);
  assert.equal((html.match(/property="og:image"/g) || []).length, 1);
  assert.ok(html.includes(`<meta property="og:image" content="${logo}">`));
  assert.ok(html.includes(`<meta name="twitter:image" content="${logo}">`));
  assert.match(html, /<meta property="og:image:width" content="1024">/);
  assert.match(html, /<meta property="og:image:alt" content="Logo Echipa de Tocilari">/);
  assert.match(html, /<meta name="twitter:card" content="summary">/);
});

test('own absolute image URLs follow the build site; other hosts stay untouched', () => {
  const head = '<html><head><meta property="og:image" content="https://echipadetocilari.ro/wp-content/a.webp?v=2"><meta name="twitter:image" content="https://cdn.example.com/b.webp"></head></html>';
  const html = normalizeSocialMeta(head, { site: 'https://staging.example.test', pageUrl: '/', locale: 'ro_RO' });
  assert.ok(html.includes('content="https://staging.example.test/wp-content/a.webp?v=2"'));
  assert.ok(html.includes('content="https://cdn.example.com/b.webp"'));
});

test('build validation reports share, footer and image regressions on own pages', () => {
  const parent = path.join(root, '.tmp');
  mkdirSync(parent, { recursive: true });
  const directory = mkdtempSync(path.join(parent, 'social-meta-validation-'));
  try {
    const file = path.join(directory, 'index.html');
    writeFileSync(file, rankMathHead.replace('<body></body>', '<body><h1>Page</h1><img src="/x.webp"><form data-ect-contact="ro"></form><footer><h2>© 2026</h2></footer></body>'));
    const errors = validateBuild({ outDir: directory, files: [file], urlPathOf: () => '/', indexable: false }).join('\n');
    for (const expected of ['og:locale is en_US, expected ro_RO', 'stale WordPress share meta', 'share image is not an absolute URL', 'heading inside the footer', 'image without alt attribute']) {
      assert.ok(errors.includes(expected), expected);
    }
  } finally {
    assert.equal(path.dirname(directory), parent);
    rmSync(directory, { recursive: true, force: true });
  }
});
