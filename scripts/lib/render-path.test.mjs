import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { optimizeRenderPath, validateRenderPath } from './render-path.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const CORE = '<script id="jquery-core-js" src="/a/jquery.js"></script>';
const MIG = '<script id="jquery-migrate-js" src="/a/migrate.js"></script>';
const LOGO = (extra = '') =>
  `<img ${extra}width="836" height="870" src="/l.webp" class="wp-image-3541" alt="L" sizes="(max-width: 836px) 100vw, 836px">`;
const page = (body, head = '') =>
  `<html><head>${head}${CORE}\n${MIG}\n<script src="/d.js" defer></script></head><body>${body}</body></html>`;

test('removes the dashicons stylesheet', () => {
  const out = optimizeRenderPath(page('<p>x</p>', '<link rel="stylesheet" id="dashicons-css" href="/wp-includes/css/dashicons.min_ver=7.css">\n'));
  assert.doesNotMatch(out, /dashicons/);
  const byHref = optimizeRenderPath(page('', '<link rel="stylesheet" href="/wp-includes/css/dashicons.min.css">'));
  assert.doesNotMatch(byHref, /dashicons/);
});

test('moves jQuery to the body before the first executable script, core first', () => {
  const out = optimizeRenderPath(page('<div></div><script type="application/ld+json">{}</script><script type="speculationrules">{}</script><script>var a=1;</script>'));
  const head = out.slice(0, out.indexOf('</head>'));
  assert.doesNotMatch(head, /jquery/);
  const core = out.indexOf(CORE);
  const mig = out.indexOf(MIG);
  assert.ok(core > out.indexOf('<body'));
  assert.ok(core < mig);
  assert.ok(mig < out.indexOf('<script>var a=1;'));
  assert.ok(core > out.indexOf('speculationrules'));
});

test('puts jQuery before </body> when no executable script exists', () => {
  const out = optimizeRenderPath(page('<p>x</p><script type="application/ld+json">{}</script>'));
  assert.ok(out.indexOf(CORE) > out.indexOf('ld+json'));
  assert.ok(out.indexOf(MIG) < out.indexOf('</body>'));
});

test('is idempotent', () => {
  const once = optimizeRenderPath(page(`<header>${LOGO('fetchpriority="high" ')}</header><script>1</script><footer>${LOGO()}</footer>`));
  assert.equal(optimizeRenderPath(once), once);
});

test('sizes the header and footer logos', () => {
  const out = optimizeRenderPath(page(`<header>${LOGO('fetchpriority="high" ')}</header><footer>${LOGO('fetchpriority="high" ')}</footer>`));
  const header = out.match(/<header>([\s\S]*?)<\/header>/)[1];
  const footer = out.match(/<footer>([\s\S]*?)<\/footer>/)[1];
  assert.match(header, /sizes="\(max-width: 767px\) 53px, 72px"/);
  assert.match(header, /fetchpriority="high"/);
  assert.doesNotMatch(header, /loading=/);
  assert.match(footer, /sizes="\(max-width: 767px\) 140px, 115px"/);
  assert.match(footer, /loading="lazy"/);
  assert.match(footer, /decoding="async"/);
  assert.doesNotMatch(footer, /fetchpriority/);
});

test('validateRenderPath flags dashicons and blocking head scripts', () => {
  const bad = '<html><head><link rel="stylesheet" id="dashicons-css" href="/d.css"><script src="/a.js"></script><script src="/b.js" defer></script><script src="/c.js" async></script><script type="module" src="/m.js"></script></head><body></body></html>';
  const errors = validateRenderPath(bad, '/x/');
  assert.equal(errors.length, 2);
  assert.match(errors[0], /^\/x\/: /);
  assert.deepEqual(validateRenderPath(optimizeRenderPath(page('')), '/x/'), []);
});

test('the real homepage is optimized', () => {
  const out = optimizeRenderPath(readFileSync(path.join(root, 'legacy-mirror/index.html'), 'utf8'));
  assert.doesNotMatch(out, /dashicons/);
  const body = out.slice(out.search(/<body\b/i));
  assert.match(body, /id="jquery-core-js"/);
  assert.doesNotMatch(out.slice(0, out.indexOf('</head>')), /jquery-(core|migrate)-js/);
  const execRe = /<script\b(?![^>]*type="(?:application\/ld\+json|speculationrules)")[^>]*>/g;
  const first = [...body.matchAll(execRe)][0];
  assert.match(first[0], /jquery-core-js/);
  const header = out.match(/<header[\s\S]*?<\/header>/)[0];
  const footer = out.match(/<footer[\s\S]*?<\/footer>/)[0];
  assert.match(header, /sizes="\(max-width: 767px\) 53px, 72px"/);
  assert.match(footer, /sizes="\(max-width: 767px\) 140px, 115px"/);
  assert.match(footer, /loading="lazy"/);
});
