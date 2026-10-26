import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { versionAssets } from './asset-versions.mjs';

const sha = (text) => createHash('sha256').update(text).digest('hex').slice(0, 10);

function dist(t, files) {
  const dir = mkdtempSync(path.join(tmpdir(), 'asset-versions-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  for (const [name, content] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(dir, name)), { recursive: true });
    writeFileSync(path.join(dir, name), content);
  }
  return dir;
}

test('local stylesheets and scripts get the first 10 hex characters of their SHA-256', (t) => {
  const outDir = dist(t, {
    'wp-content/ect-pages/home.css': 'body{}',
    'wp-content/ect-pages/consent.js': 'var a=1;',
    'wp-includes/js/jquery/jquery.min_ver=3.7.1.js': 'jq',
    'wp-includes/css/dashicons.min_ver=7.0.2.css': 'icons',
  });
  const html = versionAssets([
    '<link rel="stylesheet" id="x" href="/wp-content/ect-pages/home.css" media="all">',
    "<link rel='stylesheet' href='/wp-includes/css/dashicons.min_ver=7.0.2.css'>",
    '<script src="/wp-content/ect-pages/consent.js" defer data-ga-id="G-X"></script>',
    '<script async src="/wp-includes/js/jquery/jquery.min_ver=3.7.1.js"></script>',
  ].join('\n'), { outDir });
  assert.equal(html, [
    `<link rel="stylesheet" id="x" href="/wp-content/ect-pages/home.css?v=${sha('body{}')}" media="all">`,
    `<link rel='stylesheet' href='/wp-includes/css/dashicons.min_ver=7.0.2.css?v=${sha('icons')}'>`,
    `<script src="/wp-content/ect-pages/consent.js?v=${sha('var a=1;')}" defer data-ga-id="G-X"></script>`,
    `<script async src="/wp-includes/js/jquery/jquery.min_ver=3.7.1.js?v=${sha('jq')}"></script>`,
  ].join('\n'));
});

test('images, srcset, fonts, preloads, url() and non-stylesheet links keep a single URL', (t) => {
  const outDir = dist(t, {
    'wp-content/uploads/a.png': 'png',
    'wp-content/fonts/f.woff2': 'font',
    'wp-content/ect-pages/home.css': 'css',
  });
  const html = [
    '<img src="/wp-content/uploads/a.png" srcset="/wp-content/uploads/a.png 400w">',
    '<link rel="preload" href="/wp-content/fonts/f.woff2" as="font" type="font/woff2" crossorigin>',
    '<link rel="preload" href="/wp-content/ect-pages/home.css" as="style">',
    '<link rel="icon" href="/wp-content/uploads/a.png">',
    '<style>.a{background:url(/wp-content/uploads/a.png)}</style>',
    '<div style="background:url(/wp-content/uploads/a.png)"></div>',
    '<a href="/wp-content/ect-pages/home.css">css</a>',
  ].join('\n');
  assert.equal(versionAssets(html, { outDir }), html);
});

test('URLs with a query or fragment, missing files, directories and other hosts stay untouched', (t) => {
  const outDir = dist(t, { 'wp-content/ect-pages/a.css': 'a', 'wp-content/ect-pages/b.js': 'b' });
  const html = [
    '<link rel="stylesheet" href="/wp-content/ect-pages/a.css?ver=1">',
    '<script src="/wp-content/ect-pages/b.js#x"></script>',
    '<link rel="stylesheet" href="/wp-content/ect-pages/missing.css">',
    '<link rel="stylesheet" href="/wp-content/ect-pages/">',
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Montserrat">',
    '<script src="https://www.googletagmanager.com/gtag/js?id=G-X"></script>',
    '<script src="/other/app.js"></script>',
    '<script>var inline = 1;</script>',
  ].join('\n');
  assert.equal(versionAssets(html, { outDir }), html);
});

test('code inside scripts, styles and comments is never rewritten', (t) => {
  const outDir = dist(t, { 'wp-content/ect-pages/a.css': 'a', 'wp-content/ect-pages/b.js': 'b' });
  const html = [
    '<script>document.write(\'<link rel="stylesheet" href="/wp-content/ect-pages/a.css">\');</script>',
    '<script type="text/template"><script src="/wp-content/ect-pages/b.js"></script></script>',
    '<!-- <link rel="stylesheet" href="/wp-content/ect-pages/a.css"> -->',
    '<style>/* <link rel="stylesheet" href="/wp-content/ect-pages/a.css"> */</style>',
  ].join('\n');
  assert.equal(versionAssets(html, { outDir }), html);
});

test('the hash is computed once per file and shared through the cache', (t) => {
  const outDir = dist(t, { 'wp-content/ect-pages/a.css': 'first' });
  const cache = new Map();
  const tag = '<link rel="stylesheet" href="/wp-content/ect-pages/a.css">';
  const first = versionAssets(tag, { outDir, cache });
  writeFileSync(path.join(outDir, 'wp-content/ect-pages/a.css'), 'changed');
  assert.equal(versionAssets(tag, { outDir, cache }), first, 'cached hash is reused');
  assert.equal(cache.get('/wp-content/ect-pages/a.css'), sha('first'));
  assert.equal(versionAssets(tag, { outDir }).includes(sha('changed')), true, 'a fresh cache sees the new content');
});

test('different content gives a different URL and the same content the same URL', (t) => {
  const outDir = dist(t, {
    'wp-content/ect-pages/one.js': 'same',
    'wp-content/ect-pages/two.js': 'same',
    'wp-content/ect-pages/three.js': 'other',
  });
  const version = (name) => versionAssets(`<script src="/wp-content/ect-pages/${name}.js"></script>`, { outDir }).match(/\?v=(\w+)/)[1];
  assert.equal(version('one'), version('two'));
  assert.notEqual(version('one'), version('three'));
});
