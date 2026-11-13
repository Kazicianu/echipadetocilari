import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { minifyAssets, shouldMinify } from './minify-assets.mjs';

test('shouldMinify skips already minified files and non CSS/JS files', () => {
  assert.equal(shouldMinify('wp-content/plugins/x/frontend.min_ver=4.1.4.css'), false);
  assert.equal(shouldMinify('wp-content/plugins/x/x.bundle.min.js'), false);
  assert.equal(shouldMinify('wp-includes/js/dist/wp-hooks.min.js'), false);
  assert.equal(shouldMinify('wp-content/uploads/elementor/google-fonts/css/montserrat_ver=1743230266.css'), true);
  assert.equal(shouldMinify('wp-content/ect-contact.js'), true);
  assert.equal(shouldMinify('wp-content/ect-consent/consent.css'), true);
  assert.equal(shouldMinify('wp-content/uploads/logo.png'), false);
});

function withTempDir(run) {
  const dir = mkdtempSync(path.join(tmpdir(), 'minify-assets-'));
  return run(dir).finally(() => rmSync(dir, { recursive: true, force: true }));
}

function write(dir, rel, content) {
  const file = path.join(dir, rel);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, content, 'utf8');
  return file;
}

test('minifyAssets shortens CSS and keeps url() references', () =>
  withTempDir(async dir => {
    const css = '/* note */\n.a {\n  background: url("/wp-content/uploads/a.png");\n  color: #ffffff;\n}\n\n.b { margin: 0px; }\n';
    const file = write(dir, 'wp-content/ect-pages/x.css', css);
    const result = await minifyAssets(dir);
    const out = readFileSync(file, 'utf8');
    assert.equal(result.minified, 1);
    assert.deepEqual(result.failed, []);
    assert.ok(out.length < css.length);
    assert.match(out, /url\(\/wp-content\/uploads\/a\.png\)|url\("\/wp-content\/uploads\/a\.png"\)/);
    assert.ok(result.bytesAfter < result.bytesBefore);
  }));

test('minifyAssets keeps top-level JS names', () =>
  withTempDir(async dir => {
    const js = 'function ectGlobal() {\n  var localValue = 1;\n  return localValue;\n}\nvar ectVar = 2;\n';
    const file = write(dir, 'wp-content/ect-x.js', js);
    await minifyAssets(dir);
    const out = readFileSync(file, 'utf8');
    assert.ok(out.length < js.length);
    assert.match(out, /ectGlobal/);
    assert.match(out, /ectVar/);
  }));

test('minifyAssets reports invalid JS and leaves the file untouched', () =>
  withTempDir(async dir => {
    const broken = 'function (\n  var = ;\n';
    const file = write(dir, 'wp-content/ect-broken.js', broken);
    const skipped = write(dir, 'wp-content/plugins/a.min.js', 'var  a  =  1;\n');
    const result = await minifyAssets(dir);
    assert.equal(result.failed.length, 1);
    assert.equal(result.failed[0].file, 'wp-content/ect-broken.js');
    assert.equal(readFileSync(file, 'utf8'), broken);
    assert.equal(readFileSync(skipped, 'utf8'), 'var  a  =  1;\n');
  }));
