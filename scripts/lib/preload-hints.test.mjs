import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { pairedRoutes, routeByPath, routes } from '../i18n/routes.mjs';
import { addPreloadHints } from './preload-hints.mjs';
import { validateStandaloneAssets } from './standalone-assets.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const GOOGLE_FONTS = '/wp-content/uploads/elementor/google-fonts/fonts/';
const preloads = (html) => [...html.matchAll(/<link rel="preload"[^>]*>/g)].map((m) => m[0]);
const head = (...sheets) =>
  `<html><head>\n\t<meta charset="UTF-8">\n\t<meta name="viewport" content="width=device-width, initial-scale=1">\n` +
  `\t<link rel="profile" href="https://gmpg.org/xfn/11">\n` +
  sheets.map((href) => `<link rel="stylesheet" href="${href}">`).join('\n') + `\n</head><body></body></html>`;
const montserrat = '/wp-content/uploads/elementor/google-fonts/css/montserrat_ver=1743230266.css';

test('opted-in pages that load the Montserrat stylesheet preload its latin and latin-ext files', () => {
  const html = addPreloadHints(head('/wp-includes/css/dashicons.min_ver=7.0.2.css', montserrat), { fonts: true });
  assert.deepEqual(preloads(html), [
    `<link rel="preload" href="${GOOGLE_FONTS}montserrat-jtusjig1_i6t8kchkm459wlhyw.woff2" as="font" type="font/woff2" crossorigin>`,
    `<link rel="preload" href="${GOOGLE_FONTS}montserrat-latin-ext-ro.woff2" as="font" type="font/woff2" crossorigin>`,
  ]);
});

test('hints go right after the charset and viewport tags, before the first stylesheet', () => {
  const html = addPreloadHints(head(montserrat), { lcpImages: [{ href: '/wp-content/uploads/a.png' }] });
  const viewport = html.indexOf('name="viewport"');
  const firstPreload = html.indexOf('rel="preload"');
  assert.ok(viewport < firstPreload);
  assert.ok(firstPreload < html.indexOf('rel="profile"'));
  assert.ok(html.lastIndexOf('rel="preload"') < html.indexOf('rel="stylesheet"'));
});

test('fonts are opt-in, and only where the Montserrat stylesheet loads', () => {
  assert.deepEqual(preloads(addPreloadHints(head(montserrat))), [], 'no opt-in, no font hints');
  const local = head('/wp-content/ect-pages/home.css');
  assert.equal(addPreloadHints(local, { fonts: true }), local);
});

test('the local variable font is never preloaded (measured: slower LCP, no shift removed)', () => {
  for (const name of ['creare-magazin-online', 'dezvoltare-aplicatii', 'politica-de-confidentialitate']) {
    const html = addPreloadHints(head(`/wp-content/ect-pages/${name}.css`, montserrat), { fonts: true });
    assert.ok(!html.includes('Montserrat-Variable.woff2'), name);
  }
});

test('font preloads go only to the pages where the font swap shifted the layout', () => {
  const opted = routes.filter((route) => route.preloadFonts).map((route) => route.ro);
  assert.deepEqual(opted, ['/administrare-site/', '/contact/', '/portofoliu/', '/politica-de-confidentialitate/']);
});

test('LCP images are preloaded with high priority and an optional media condition', () => {
  const html = addPreloadHints(head(), {
    lcpImages: [
      { href: '/wp-content/uploads/2024/02/BG-HomePage-High.png' },
      { href: '/wp-content/uploads/2022/04/daycare-hero-bg.png', media: '(min-width: 1025px)' },
    ],
  });
  assert.deepEqual(preloads(html), [
    '<link rel="preload" href="/wp-content/uploads/2024/02/BG-HomePage-High.png" as="image" fetchpriority="high">',
    '<link rel="preload" href="/wp-content/uploads/2022/04/daycare-hero-bg.png" as="image" fetchpriority="high" media="(min-width: 1025px)">',
  ]);
});

test('each hint is added exactly once, even on a second pass or beside an existing preload', () => {
  const options = { lcpImages: [{ href: '/wp-content/uploads/a.png' }], fonts: true };
  const once = addPreloadHints(head(montserrat), options);
  assert.equal(addPreloadHints(once, options), once);
  assert.equal(preloads(once).length, 3);

  const existing = head(montserrat).replace(
    '<link rel="profile"',
    `<link rel="preload" href="${GOOGLE_FONTS}montserrat-jtusjig1_i6t8kchkm459wlhyw.woff2" as="font" type="font/woff2" crossorigin>\n<link rel="profile"`);
  assert.equal(preloads(addPreloadHints(existing, { fonts: true })).length, 2);
});

test('a document without a head is returned unchanged', () => {
  assert.equal(addPreloadHints('<p>fragment</p>', { lcpImages: [{ href: '/a.png' }] }), '<p>fragment</p>');
});

test('route LCP images are root-relative, have no query and exist in the mirror', () => {
  const configured = routes.filter((route) => route.lcpImages);
  assert.ok(configured.length >= 7);
  for (const route of configured) {
    for (const { href, media } of route.lcpImages) {
      assert.match(href, /^\/wp-content\/[^?#]+$/, route.ro);
      assert.ok(existsSync(path.join(root, 'legacy-mirror', href)), `${route.ro}: ${href}`);
      if (media) assert.match(media, /^\((?:min|max)-width: \d+px\)$/, route.ro);
    }
  }
});

test('an EN page uses the LCP images of its RO twin', () => {
  for (const route of pairedRoutes) {
    assert.equal(routeByPath(route.en), route);
    assert.equal(routeByPath(route.ro), route);
  }
  assert.equal(routeByPath('/nope/'), undefined);
});

test('hints add no em dash or diagonal arrows', () => {
  const html = addPreloadHints(head(montserrat), { lcpImages: routes.find((r) => r.ro === '/').lcpImages });
  const forbidden = [0x2014, 0x2196, 0x2197, 0x2198, 0x2199].map((code) => String.fromCodePoint(code));
  assert.ok(forbidden.every((char) => !preloads(html).join('').includes(char)));
});

test('the asset validation checks preload links, so a hint to a missing file fails the build', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'preload-hints-'));
  try {
    mkdirSync(path.join(dir, 'wp-content'), { recursive: true });
    writeFileSync(path.join(dir, 'wp-content', 'real.png'), 'x');
    writeFileSync(path.join(dir, 'index.html'),
      '<html><head><link rel="preload" href="/wp-content/real.png" as="image">' +
      '<link rel="preload" href="/wp-content/gone.woff2" as="font" type="font/woff2" crossorigin></head></html>');
    assert.deepEqual(
      validateStandaloneAssets({ outDir: dir, files: [path.join(dir, 'index.html')], urlPathOf: () => '/' })
        .filter((error) => !error.startsWith('Elementor runtime')),
      ['/: missing asset /wp-content/gone.woff2']);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
