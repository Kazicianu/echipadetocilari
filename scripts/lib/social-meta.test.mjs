import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
import { defaultOgImage, ogImagePath, ogPages } from './og-pages.mjs';
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
  const html = normalizeSocialMeta(rankMathHead, { site, pageUrl: '/articol-vechi/', locale: 'ro_RO' });
  assert.doesNotMatch(html, /og:updated_time|article:|twitter:label|twitter:data|Written by|Time to read/);
  assert.match(html, /<meta property="og:locale" content="ro_RO">/);
  assert.match(html, /<meta property="og:type" content="website">/);
  assert.match(html, /property="og:image" content="https:\/\/www\.echipadetocilari\.ro\/wp-content\/uploads\/2024\/03\/admin\.webp"/);
  assert.match(html, /property="og:image:secure_url" content="https:\/\/www\.echipadetocilari\.ro\/wp-content\/uploads\/2024\/03\/admin\.webp"/);
  assert.match(html, /name="twitter:image" content="https:\/\/www\.echipadetocilari\.ro\/wp-content\/uploads\/2024\/03\/admin\.webp"/);
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
  assert.equal(normalizeSocialMeta(html, { site, pageUrl: '/articol-vechi/', locale: 'ro_RO' }), html);
});

test('pages without an image and without an own entry share the default 1200x630 image', () => {
  const html = normalizeSocialMeta('<html><head><meta name="twitter:card" content="summary"></head><body></body></html>', {
    site: 'https://preview.example.test', pageUrl: '/en/unlisted-page/', locale: 'en_US',
  });
  const image = `https://preview.example.test${fallbackOgImage.path}`;
  assert.equal(fallbackOgImage, defaultOgImage);
  assert.match(html, /<meta property="og:locale" content="en_US">/);
  assert.equal((html.match(/property="og:image"/g) || []).length, 1);
  assert.ok(html.includes(`<meta property="og:image" content="${image}">`));
  assert.ok(html.includes(`<meta name="twitter:image" content="${image}">`));
  assert.match(html, /<meta property="og:image:width" content="1200">/);
  assert.match(html, /<meta property="og:image:height" content="630">/);
  assert.match(html, /<meta property="og:image:type" content="image\/jpeg">/);
  assert.match(html, /<meta property="og:image:alt" content="Echipa de Tocilari, agenție de marketing online în București">/);
  assert.equal((html.match(/name="twitter:card"/g) || []).length, 1);
  assert.match(html, /<meta name="twitter:card" content="summary_large_image">/);
});

function count(html, attr) {
  return (html.match(new RegExp(`<meta\\s+[^>]*${attr}[^>]*>`, 'gi')) || []).length;
}

test('a page from the table gets its own image, replacing the mirror image, once per tag', () => {
  const html = normalizeSocialMeta(rankMathHead, { site, pageUrl: '/administrare-site/', locale: 'ro_RO' });
  const entry = ogPages.find((page) => page.page === '/administrare-site/');
  const url = `${site}/wp-content/ect-pages/og/administrare-site.jpg`;
  assert.equal(`${site}${ogImagePath(entry.slug)}`, url);
  assert.doesNotMatch(html, /admin\.webp/);
  assert.ok(html.includes(`<meta property="og:image" content="${url}">`));
  assert.ok(html.includes(`<meta name="twitter:image" content="${url}">`));
  assert.ok(html.includes('<meta property="og:image:width" content="1200">'));
  assert.ok(html.includes('<meta property="og:image:height" content="630">'));
  assert.ok(html.includes('<meta property="og:image:type" content="image/jpeg">'));
  assert.ok(html.includes(`<meta property="og:image:alt" content="${entry.alt}">`));
  assert.ok(html.includes(`<meta name="twitter:image:alt" content="${entry.alt}">`));
  assert.ok(html.includes('<meta name="twitter:card" content="summary_large_image">'));
  for (const attr of ['property="og:image"', 'property="og:image:secure_url"', 'property="og:image:width"', 'property="og:image:height"', 'property="og:image:alt"', 'property="og:image:type"', 'name="twitter:image"', 'name="twitter:image:alt"']) {
    assert.equal(count(html, attr), attr.includes('secure_url') ? 0 : 1, attr);
  }
  assert.equal(count(html, 'name="twitter:card"'), 1);
  assert.equal(normalizeSocialMeta(html, { site, pageUrl: '/administrare-site/', locale: 'ro_RO' }), html);
});

test('an English page from the table gets its own image on the build site', () => {
  const html = normalizeSocialMeta('<html><head></head><body></body></html>', { site: 'https://preview.example.test', pageUrl: '/en/website-maintenance/', locale: 'en_US' });
  assert.ok(html.includes('<meta property="og:image" content="https://preview.example.test/wp-content/ect-pages/og/en-website-maintenance.jpg">'));
  assert.ok(html.includes('<meta property="og:image:alt" content="Website maintenance and WordPress management, Echipa de Tocilari">'));
  assert.ok(html.includes('<meta name="twitter:card" content="summary_large_image">'));
});

test('every table entry has a unique slug, a 1200x630 JPEG on disk and no forbidden characters', () => {
  assert.equal(ogPages.length, 21);
  assert.equal(new Set(ogPages.map((page) => page.slug)).size, ogPages.length);
  assert.equal(new Set(ogPages.map((page) => page.page)).size, ogPages.length);
  const forbidden = /[\u2014\u2196-\u2199\u015e\u015f\u0162\u0163]|\d+\s*(?:lei|RON|EUR|\u20ac)/i;
  for (const page of [...ogPages, { slug: 'default', title: defaultOgImage.alt, subtitle: '' }]) {
    const file = path.join(root, 'legacy-mirror', ogImagePath(page.slug));
    assert.ok(existsSync(file), `missing ${file}`);
    const bytes = readFileSync(file);
    assert.deepEqual([bytes[0], bytes[1]], [0xff, 0xd8], `${page.slug} is not a JPEG`);
    let offset = 2;
    while (offset < bytes.length) {
      const marker = bytes[offset + 1];
      if (marker >= 0xc0 && marker <= 0xc2) {
        assert.equal(bytes.readUInt16BE(offset + 5), 630, `${page.slug} height`);
        assert.equal(bytes.readUInt16BE(offset + 7), 1200, `${page.slug} width`);
        break;
      }
      offset += 2 + bytes.readUInt16BE(offset + 2);
    }
    assert.ok(bytes.length < 250 * 1024, `${page.slug} is ${bytes.length} bytes`);
    assert.doesNotMatch(`${page.title} ${page.subtitle}`, forbidden, page.slug);
  }
});

test('own absolute image URLs follow the build site; other hosts stay untouched', () => {
  const head = '<html><head><meta property="og:image" content="https://echipadetocilari.ro/wp-content/a.webp?v=2"><meta name="twitter:image" content="https://cdn.example.com/b.webp"></head></html>';
  const html = normalizeSocialMeta(head, { site: 'https://staging.example.test', pageUrl: '/articol-vechi/', locale: 'ro_RO' });
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
