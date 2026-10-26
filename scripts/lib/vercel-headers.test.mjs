import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { getTransformedRoutes } from '@vercel/routing-utils';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const config = JSON.parse(readFileSync(path.join(root, 'vercel.json'), 'utf8'));

const IMMUTABLE = 'public, max-age=31536000, immutable';
const IMAGE = 'public, max-age=86400, stale-while-revalidate=604800';
const REVALIDATE = 'public, max-age=0, must-revalidate';

// Vercel's own compiler turns each `headers` entry into a low-level route with a
// regex `src` and has/missing conditions; matching mirrors its router (the
// routes are case-insensitive unless `caseSensitive` is set).
const compiled = getTransformedRoutes(structuredClone(config));
assert.equal(compiled.error, null, JSON.stringify(compiled.error));
const headerRoutes = compiled.routes.filter((route) => route.headers && route.continue && !route.status);

function conditionHolds(condition, query) {
  assert.equal(condition.type, 'query', 'only query conditions are used for caching');
  return query.has(condition.key);
}

/** Every Cache-Control value Vercel would add for this request. */
function cacheControl(url) {
  const { pathname, searchParams } = new URL(url, 'https://example.test');
  return headerRoutes
    .filter((route) => new RegExp(route.src, 'i').test(pathname))
    .filter((route) => (route.has || []).every((c) => conditionHolds(c, searchParams)))
    .filter((route) => (route.missing || []).every((c) => !conditionHolds(c, searchParams)))
    .flatMap((route) => Object.entries(route.headers).filter(([key]) => key.toLowerCase() === 'cache-control'))
    .map(([, value]) => value);
}

test('versioned asset URLs are cached for a year', () => {
  assert.deepEqual(cacheControl('/wp-content/ect-pages/consent.js?v=abc'), [IMMUTABLE]);
  assert.deepEqual(cacheControl('/wp-includes/css/dashicons.min_ver=7.0.2.css?v=1'), [IMMUTABLE]);
});

test('fonts are cached for a year with or without a version', () => {
  assert.deepEqual(cacheControl('/wp-content/uploads/elementor/google-fonts/fonts/x.woff2'), [IMMUTABLE]);
  assert.deepEqual(cacheControl('/wp-content/ect-pages/fonts/Montserrat-Variable.woff2'), [IMMUTABLE]);
  assert.deepEqual(cacheControl('/wp-includes/fonts/dashicons.ttf'), [IMMUTABLE]);
});

test('unversioned images get one day plus stale-while-revalidate', () => {
  assert.deepEqual(cacheControl('/wp-content/uploads/2024/02/BG-HomePage-High.png'), [IMAGE]);
  assert.deepEqual(cacheControl('/wp-content/uploads/2024/02/photo.JPG'), [IMAGE]);
  assert.deepEqual(cacheControl('/wp-content/ect-pages/google-ads/hero-blobs-mobile.svg'), [IMAGE]);
});

test('unversioned CSS, JS and data keep revalidating', () => {
  assert.deepEqual(cacheControl('/wp-content/ect-pages/consent.js'), [REVALIDATE]);
  assert.deepEqual(cacheControl('/wp-includes/js/jquery/jquery.min_ver=3.7.1.js'), [REVALIDATE]);
  assert.deepEqual(cacheControl('/wp-content/ect-pages/home.css'), [REVALIDATE]);
  assert.deepEqual(cacheControl('/wp-content/uploads/data/animation.json'), [REVALIDATE]);
});

test('pages and the API get no Cache-Control from vercel.json', () => {
  for (const url of ['/', '/contact/', '/en/', '/llms.txt', '/api/contact']) {
    assert.deepEqual(cacheControl(url), [], url);
  }
});

test('the global security headers rule is kept', () => {
  const global = config.headers.find((rule) => rule.source === '/(.*)');
  assert.deepEqual(global.headers.map(({ key }) => key), ['X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy']);
});

test('every file under wp-content and wp-includes gets exactly one Cache-Control', () => {
  const files = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const full = path.join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else files.push('/' + path.relative(path.join(root, 'legacy-mirror'), full).replace(/\\/g, '/'));
    }
  };
  for (const dir of ['wp-content', 'wp-includes']) walk(path.join(root, 'legacy-mirror', dir));
  assert.ok(files.length > 100, 'the mirror has assets to check');
  for (const file of files) {
    for (const url of [file, `${file}?v=0123456789`]) {
      assert.equal(cacheControl(encodeURI(url)).length, 1, url);
    }
  }
});
