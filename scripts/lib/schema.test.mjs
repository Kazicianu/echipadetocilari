import assert from 'node:assert/strict';
import test from 'node:test';
import { blogPosting, breadcrumbList, webPage } from './schema.mjs';
import { normalizeSocialMeta } from './social-meta.mjs';

const site = 'https://www.echipadetocilari.ro';
const url = '/blog/ce-inseamna-seo/';

test('breadcrumb sits on the WebPage node, not on BlogPosting', () => {
  const post = blogPosting({ site, lang: 'ro', url, headline: 'H', description: 'D', datePublished: '2026-11-24' });
  assert.equal('breadcrumb' in post, false);
  const page = webPage({ site, lang: 'ro', url, name: 'N', description: 'D', breadcrumb: true });
  const crumbs = breadcrumbList({ site, url, items: [{ name: 'Acasă', url: '/' }, { name: 'Articol' }] });
  assert.equal(page.breadcrumb['@id'], crumbs['@id']);
  assert.equal('breadcrumb' in webPage({ site, lang: 'ro', url, name: 'N', description: 'D' }), false);
});

test('og:type is article with published and modified times only on pages with an article byline', () => {
  const byline = '<div class="art-byline">Publicat <time datetime="2026-11-20">20</time> Actualizat <time datetime="2026-11-24">24</time></div>';
  const html = normalizeSocialMeta(`<html><head></head><body>${byline}</body></html>`, { site, pageUrl: url, locale: 'ro_RO' });
  assert.match(html, /<meta property="og:type" content="article">/);
  assert.match(html, /<meta property="article:published_time" content="2026-11-20T09:00:00\+02:00">/);
  assert.match(html, /<meta property="article:modified_time" content="2026-11-24T09:00:00\+02:00">/);
  assert.equal(normalizeSocialMeta(html, { site, pageUrl: url, locale: 'ro_RO' }), html);
  const plain = normalizeSocialMeta('<html><head></head><body></body></html>', { site, pageUrl: '/contact/', locale: 'ro_RO' });
  assert.match(plain, /og:type" content="website"/);
  assert.doesNotMatch(plain, /article:/);
});
