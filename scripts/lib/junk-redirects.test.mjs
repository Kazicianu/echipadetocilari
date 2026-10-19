import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { getTransformedRoutes } from '@vercel/routing-utils';
import { junkRedirects, vercelRedirects } from './junk-redirects.mjs';

const config = JSON.parse(readFileSync(new URL('../../vercel.json', import.meta.url), 'utf8'));

// Use Vercel's compiler, rather than reproducing the source-pattern generator.
// The returned low-level src regexes and Location templates are executable.
// https://vercel.com/docs/build-output-api/features#high-level-routing
function compileRouting(input) {
  const result = getTransformedRoutes(structuredClone(input));
  assert.equal(result.error, null, JSON.stringify(result.error));
  return result.routes.filter(route => route.status >= 300 && route.status < 400);
}

function nextRedirect(routes, pathname) {
  for (const route of routes) {
    const regex = new RegExp(route.src);
    if (regex.test(pathname)) {
      return {
        status: route.status,
        location: pathname.replace(regex, route.headers.Location),
      };
    }
  }
  return null;
}

function followRedirects(routes, pathname) {
  let location = pathname;
  const seen = new Set();
  const steps = [];
  for (let count = 0; count < 5; count += 1) {
    assert.ok(!seen.has(location), `Redirect loop at ${location}`);
    seen.add(location);
    const redirect = nextRedirect(routes, new URL(location, 'https://example.test').pathname);
    if (!redirect) return { location, steps };
    steps.push(redirect);
    location = redirect.location;
  }
  assert.fail(`Too many redirects from ${pathname}`);
}

test('regression: old sources miss slash paths after Vercel trailingSlash normalization', () => {
  for (const from of ['/pay-per-click/', '/en/ppc-advertising/', '/ex-servicii-seo/', '/home/', '/do-ppc-ninjas-really-exist/']) {
    const oldRoutes = compileRouting({
      trailingSlash: true,
      redirects: [{ source: from.slice(0, -1), destination: '/destination/', permanent: true }],
    });
    assert.equal(nextRedirect(oldRoutes, from), null, `${from}: old source must reproduce the miss`);
    const result = followRedirects(oldRoutes, from.slice(0, -1));
    assert.equal(result.location, from, `${from}: old routing stops at the removed path`);
    assert.deepEqual(result.steps, [{ status: 308, location: from }]);
  }
});

test('checked-in Vercel redirects exactly match the pipeline inventory', () => {
  assert.equal(config.trailingSlash, true);
  assert.deepEqual(config.redirects, vercelRedirects());
  assert.equal(new Set(junkRedirects.map(({ from }) => from)).size, junkRedirects.length);
});

test('Vercel matches every retired URL with and without one trailing slash', () => {
  const customRoutes = compileRouting({ redirects: config.redirects });
  const allRoutes = compileRouting(config);
  for (const { from, to } of junkRedirects) {
    for (const pathname of [from.slice(0, -1), from]) {
      assert.deepEqual(nextRedirect(customRoutes, pathname), { status: 308, location: to }, pathname);
      const result = followRedirects(allRoutes, pathname);
      assert.equal(result.location, to, `${pathname}: final destination`);
      assert.ok(result.steps.length <= 2, `${pathname}: at most one canonicalization plus the permanent redirect`);
      assert.ok(result.steps.every(({ status }) => status === 308), `${pathname}: all steps permanent`);
    }
  }
});

test('service directories go to the corresponding homepage service section', () => {
  const routes = compileRouting(config);
  for (const [from, to] of [
    ['/services/', '/#servicii'],
    ['/en/services/', '/en/#servicii'],
  ]) {
    assert.equal(followRedirects(routes, from).location, to);
  }
});

test('client and logo pages have no invented replacement redirect', () => {
  const routes = compileRouting({ redirects: config.redirects });
  for (const pathname of ['/clients', '/clients/', '/en/clients', '/en/clients/', '/logo-design', '/logo-design/', '/en/logo-design', '/en/logo-design/']) {
    assert.equal(nextRedirect(routes, pathname), null, pathname);
  }
});

test('redirect sources do not capture descendants, extra slashes or similar file names', () => {
  const routes = compileRouting({ redirects: config.redirects });
  for (const { from } of junkRedirects) {
    assert.equal(nextRedirect(routes, `${from}child/`), null);
    assert.equal(nextRedirect(routes, `${from}/`), null);
    assert.equal(nextRedirect(routes, `${from.slice(0, -1)}-extra/`), null);
    if (from.includes('.')) {
      assert.equal(nextRedirect(routes, from.replace('.', 'X')), null, 'file extension dots stay literal');
    }
  }
});
