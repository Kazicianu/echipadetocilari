import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { routes } from '../i18n/routes.mjs';
import { makeStandaloneAssets, validateStandaloneAssets } from './standalone-assets.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const source = path.join(root, 'legacy-mirror');

test('standalone presentation keeps its required translation runtime but removes editor and server dependencies', () => {
  const html = makeStandaloneAssets(readFileSync(path.join(source, 'index.html'), 'utf8'));
  assert.match(html, /src="\/wp-content\/ect-pages\/vendor\/wp-hooks\.min\.js"/);
  assert.match(html, /src="\/wp-content\/ect-pages\/vendor\/wp-i18n\.min\.js"/);
  assert.doesNotMatch(html, /(?:react-dom\.min|portfolio-front-block-script|starter-templates-zip-preview|wp-emoji-settings)/);
  assert.doesNotMatch(html, /(?:wp-json|admin-ajax\.php|xmlrpc\.php)/);
  const core = html.match(/var elementorFrontendConfig = (\{[^\n]*\});/)[1];
  const pro = html.match(/var ElementorProFrontendConfig = (\{[^\n]*\});/)[1];
  assert.equal(JSON.parse(core).is_static, false, 'widget initialization must stay enabled');
  assert.equal(JSON.parse(core).urls.ajaxurl, undefined);
  assert.equal(JSON.parse(pro).urls.rest, undefined);
});

test('asset URLs remain local in nested English pages, srcset, backgrounds, and Lottie settings', () => {
  const html = makeStandaloneAssets(`<img src="../../wp-content/photo.png" srcset="../wp-content/a.png 400w, https://www.echipadetocilari.ro/wp-content/b.png 800w"><style>.hero{background:url('../wp-content/bg.png')}</style><div data-settings="{&quot;source_json&quot;:{&quot;url&quot;:&quot;https:\\/\\/www.echipadetocilari.ro\\/wp-content\\/animation.json&quot;}}"></div>`);
  assert.match(html, /src="\/wp-content\/photo.png"/);
  assert.match(html, /srcset="\/wp-content\/a.png 400w, \/wp-content\/b.png 800w"/);
  assert.match(html, /url\('\/wp-content\/bg.png'\)/);
  assert.doesNotMatch(html, /echipadetocilari\.ro|\.\.\//);
});

test('vendored WordPress hooks and i18n work together without WordPress or React', () => {
  const context = vm.createContext({ console });
  context.window = context;
  for (const file of ['wp-hooks.min.js', 'wp-i18n.min.js']) {
    vm.runInContext(readFileSync(path.join(source, 'wp-content/ect-pages/vendor', file), 'utf8'), context);
  }
  assert.equal(vm.runInContext('wp.i18n.__("Next")', context), 'Next');
  vm.runInContext('wp.i18n.setLocaleData({Next:["Următorul"]})', context);
  assert.equal(vm.runInContext('wp.i18n.__("Next")', context), 'Următorul');
});

test('all owned page assets and lazy presentation assets exist after transformation', () => {
  const tempRoot = path.join(root, '.tmp');
  mkdirSync(tempRoot, { recursive: true });
  const scratch = mkdtempSync(path.join(tempRoot, 'asset-test-'));
  try {
    const pages = routes.map(({ ro, roFile }) => {
      const html = makeStandaloneAssets(readFileSync(path.join(source, roFile), 'utf8'));
      assert.equal(makeStandaloneAssets(html), html, `${ro}: transform is idempotent`);
      for (const [, attrs, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
        if (/\bsrc\s*=/.test(attrs) || !body.trim() || /type=["']text\//.test(attrs)) continue;
        if (/json|speculationrules/.test(attrs)) JSON.parse(body);
        else new vm.Script(body);
      }
      const file = path.join(scratch, roFile.replaceAll('/', '_'));
      writeFileSync(file, html);
      return { file, ro };
    });
    const errors = validateStandaloneAssets({
      outDir: source,
      files: pages.map(({ file }) => file),
      urlPathOf: file => pages.find(page => page.file === file).ro,
    });
    assert.deepEqual(errors, []);
  } finally {
    // The only recursive removal is the exact, bounded directory created above.
    assert.equal(path.dirname(scratch), tempRoot);
    assert.ok(path.basename(scratch).startsWith('asset-test-'));
    rmSync(scratch, { recursive: true, force: true });
  }
});
