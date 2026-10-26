import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { createPreviewServer } from '../scripts/preview.mjs';
import { junkRedirects } from '../scripts/lib/junk-redirects.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function preview(t) {
  const parent = path.join(root, '.tmp');
  mkdirSync(parent, { recursive: true });
  const directory = mkdtempSync(path.join(parent, 'preview-redirects-'));
  writeFileSync(path.join(directory, 'index.html'), '<main id="servicii">Servicii</main>');
  mkdirSync(path.join(directory, 'agentie-google-ads'));
  writeFileSync(path.join(directory, 'agentie-google-ads/index.html'), '<h1>Google Ads</h1>');
  mkdirSync(path.join(directory, 'wp-content'));
  writeFileSync(path.join(directory, 'wp-content/app.js'), 'window.ok = true;');
  const server = createPreviewServer({ outDir: directory, port: 0, env: {} });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  t.after(async () => {
    await new Promise(resolve => { server.close(resolve); server.closeAllConnections(); });
    assert.equal(path.dirname(directory), parent);
    assert.ok(path.basename(directory).startsWith('preview-redirects-'));
    rmSync(directory, { recursive: true, force: true });
  });
  return `http://127.0.0.1:${server.address().port}`;
}

test('preview serves every legacy redirect with either trailing-slash spelling and preserves queries', async t => {
  const origin = await preview(t);
  for (const { from, to } of junkRedirects) {
    for (const pathname of [from, from.replace(/\/$/, '')]) {
      const response = await fetch(origin + pathname + '?source=old&amp=one%20two', { redirect: 'manual' });
      assert.equal(response.status, 308, pathname);
      const expected = new URL(to, origin);
      expected.search = '?source=old&amp=one%20two';
      assert.equal(response.headers.get('location'), expected.pathname + expected.search + expected.hash, pathname);
    }
  }
});

test('preview redirects old Ads to a real page and does not revive withdrawn pages', async t => {
  const origin = await preview(t);
  const response = await fetch(origin + '/pay-per-click/');
  assert.equal(response.status, 200);
  assert.equal(response.url, origin + '/agentie-google-ads/');
  assert.match(await response.text(), /Google Ads/);
  for (const pathname of ['/clients', '/clients/', '/en/clients/', '/logo-design', '/logo-design/', '/en/logo-design/', '/services-extra/']) {
    const withdrawn = await fetch(origin + pathname, { redirect: 'manual' });
    assert.equal(withdrawn.status, 404, pathname);
    assert.equal(withdrawn.headers.get('location'), null, pathname);
  }
  const services = await fetch(origin + '/en/services/', { method: 'HEAD', redirect: 'manual' });
  assert.equal(services.status, 308);
  assert.equal(services.headers.get('location'), '/en/#servicii');
  assert.equal(await services.text(), '');
});

test('preview serves cache-busted asset URLs from the file path, ignoring the ?v= query', async t => {
  const origin = await preview(t);
  const versioned = await fetch(origin + '/wp-content/app.js?v=0123456789');
  assert.equal(versioned.status, 200);
  assert.match(versioned.headers.get('content-type'), /^text\/javascript/);
  assert.equal(await versioned.text(), 'window.ok = true;');
  assert.equal((await fetch(origin + '/wp-content/app.js')).status, 200);
});
