import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { routes, routeByRo } from '../i18n/routes.mjs';
import { roPageMeta } from '../i18n/meta-ro.mjs';
import { blog, blogPosting, breadcrumbList, visibleArticleDates, visibleHeadline, webPage } from './schema.mjs';
import { normalizeSocialMeta } from './social-meta.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (file) => readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n');
const route = routeByRo('/blog/');
const articleRoutes = routes.filter((r) => r.blogArticle);
const page = read('legacy-mirror/blog/index.html');
const css = read('legacy-mirror/wp-content/ect-pages/blog.css');
const artCss = read('legacy-mirror/wp-content/ect-pages/blog-article.css');
const artJs = read('legacy-mirror/wp-content/ect-pages/blog-article.js');
const main = page.match(/<main\b[\s\S]*<\/main>/i)?.[0] ?? '';
const withoutCode = (html) => html.replace(/<!--[\s\S]*?-->|<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
const count = (html, needle) => html.split(needle).length - 1;
const BANNED = /[\u2014\u2196-\u2199\u015E\u015F\u0162\u0163]|&mdash;|&#8212;|&#x2014;/i;
const AI_TIER1 = /\b(?:inovativ[ăe]?|inovator|inovatoare|transformator|transformatoare|esențial[ăei]?|crucial[ăei]?|holistic[ăei]?|durabil[ăei]?|sustenabil[ăei]?|semnificativ[ăei]?|valoros|valoroasă|valoroase|potențial[ăei]?)\b/i;

test('/blog/ is a Romanian-only route with metadata and no Service schema', () => {
  assert.deepEqual(route, {
    ro: '/blog/',
    roFile: 'blog/index.html',
    labelRo: 'Blog',
  });
  assert.equal('service' in route, false, 'not a service page');
  assert.equal('en' in route, false, 'Romanian-only until EN is approved');
  const meta = roPageMeta[route.ro];
  assert.ok(meta.title.endsWith(' | Echipa de Tocilari'));
  assert.ok(meta.description.length >= 50 && meta.description.length <= 160, meta.description);
  assert.doesNotMatch(meta.title + meta.description, BANNED);
  assert.ok(routes.indexOf(route) < routes.indexOf(routeByRo('/termeni-si-conditii/')));
});

test('source /blog/ page keeps one H1, shared header, shared contact form above footer and seamless header background', () => {
  const copy = withoutCode(page);
  assert.equal(count(copy, '<h1'), 1);
  assert.equal(count(main, '<h1'), 1);
  assert.match(page, /<body class="[^"]*\bect-blog-body\b/);
  assert.match(page, /<header[^>]*elementor-location-header/);
  assert.match(page, /<main id="content" class="ect-page ect-page--blog">/);
  assert.match(page, /<link rel="stylesheet" href="\/wp-content\/ect-pages\/blog\.css">/);
  assert.doesNotMatch(page, /ect-pages\/blog\.js/, 'no catalog script while filters and search are parked');
  const mainEnd = page.indexOf('</main>');
  const form = page.search(/<form\b[^>]*class="elementor-form"/);
  const footer = page.search(/<footer\b/);
  assert.ok(mainEnd > 0 && mainEnd < form && form < footer, 'main, then shared contact form, then shared footer');
  assert.match(page.slice(mainEnd, footer), /^<\/main>\s*<div class="elementor elementor-3381 ect-shared-contact">/);
  assert.equal(count(page, '<form'), 1);
  assert.doesNotMatch(page, /creare-magazin-online\.(?:css|js)|google_gtagjs|googletagmanager/);
});

test('/blog/ shows only published guides, features one without repeating it and links to all seven services', () => {
  assert.doesNotMatch(main, /data-filter=|data-js="blog-|class="bl-(?:search|filters-wrap|status-row|empty)\b/, 'filters, search and empty state stay parked until there are more guides');
  assert.doesNotMatch(main, /În pregătire/, 'unwritten guides stay hidden');
  assert.doesNotMatch(main, /bl-badge--orange|>Publicat</, 'no Publicat badge on cards');
  assert.doesNotMatch(main, /cele 7 servicii/, 'no claim of a catalog organised on all seven services');

  const published = articleRoutes.map((r) => r.ro);
  const featured = main.match(/<article class="bl-featured">[\s\S]*?<\/article>/)?.[0] ?? '';
  const featuredHref = featured.match(/href="(\/blog\/[^"]+)"/)?.[1];
  assert.ok(published.includes(featuredHref), `featured guide is published: ${featuredHref}`);

  const cards = [...main.matchAll(/<article class="bl-card[^"]*"[\s\S]*?<\/article>/g)].map(([c]) => c);
  assert.equal(cards.length, published.length - 1, 'every other published guide gets one card');
  for (const card of cards) {
    const hrefs = [...new Set([...card.matchAll(/href="(\/blog\/[^"]+)"/g)].map(([, h]) => h))];
    assert.equal(hrefs.length, 1, 'one guide per card');
    assert.ok(published.includes(hrefs[0]), `card links to a published guide: ${hrefs[0]}`);
    assert.notEqual(hrefs[0], featuredHref, 'featured guide is not repeated in the grid');
  }

  for (const art of articleRoutes) {
    assert.ok(main.includes(`href="${art.ro}"`), `/blog/ links to ${art.ro}`);
  }
  for (const svc of ['/creare-site-web/', '/creare-magazin-online/', '/dezvoltare-aplicatii/', '/servicii-seo/', '/agentie-google-ads/', '/agentie-facebook-ads/', '/administrare-site/']) {
    assert.ok(main.includes(`href="${svc}"`), `links to ${svc}`);
  }
  const headings = [...main.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi)].map(([, h]) => h.replace(/<[^>]+>/g, ''));
  for (const h of headings) assert.doesNotMatch(h, /\b2026\b/, `no 2026 in heading: ${h}`);
  assert.doesNotMatch(main, /WooCommerce/i, 'withdrawn platform never appears');
});

test('all eight published articles have valid routes, meta, 2027 annual titles, TOC anchors and shared layout', () => {
  assert.deepEqual(
    articleRoutes.map((r) => r.ro),
    [
      '/blog/optimizare-site-wordpress/',
      '/blog/viteza-de-incarcare-a-site-ului/',
      '/blog/cat-costa-un-magazin-online/',
      '/blog/cat-costa-un-site-web/',
      '/blog/cum-promovezi-o-afacere-online/',
      '/blog/ce-inseamna-seo/',
      '/blog/promovare-pe-instagram-reclame-sau-organic/',
      '/blog/cat-costa-mentenanta-unui-site/',
    ]
  );

  const termsIdx = routes.indexOf(routeByRo('/termeni-si-conditii/'));
  const conciseTitles = new Set([
    '/blog/cat-costa-un-site-web/',
    '/blog/cum-promovezi-o-afacere-online/',
    '/blog/ce-inseamna-seo/',
    '/blog/promovare-pe-instagram-reclame-sau-organic/',
    '/blog/cat-costa-mentenanta-unui-site/',
  ]);
  for (const art of articleRoutes) {
    assert.equal('service' in art, false, `${art.ro}: not a service route`);
    assert.equal('en' in art, false, `${art.ro}: Romanian-only`);
    assert.ok(routes.indexOf(art) < termsIdx, `${art.ro}: precedes legal routes`);

    const meta = roPageMeta[art.ro];
    assert.ok(meta, `${art.ro}: has RO metadata`);
    assert.ok(meta.title.endsWith(' | Echipa de Tocilari'), art.ro);
    if (conciseTitles.has(art.ro)) {
      assert.ok(meta.title.length <= 70, `${art.ro}: title <= 70 chars (${meta.title.length})`);
    }
    assert.ok(meta.description.length >= 50 && meta.description.length <= 160, `${art.ro}: ${meta.description.length}`);
    assert.doesNotMatch(meta.title, /\b2026\b/, `${art.ro}: no 2026 in title`);
    assert.doesNotMatch(meta.title + meta.description, BANNED, art.ro);

    const html = read(`legacy-mirror/${art.roFile}`);
    const copy = withoutCode(html);
    const artMain = html.match(/<main\b[\s\S]*<\/main>/i)?.[0] ?? '';
    assert.equal(count(copy, '<h1'), 1, `${art.ro}: single H1`);
    assert.match(html, /<body class="[^"]*\bect-article-body\b/, art.ro);
    assert.match(html, /<link rel="stylesheet" href="\/wp-content\/ect-pages\/blog-article\.css">/, art.ro);
    assert.match(html, /<script src="\/wp-content\/ect-pages\/blog-article\.js" defer><\/script>/, art.ro);
    assert.doesNotMatch(html, /(?:src|href)="\.\.\/wp-(?:content|includes)\//, `${art.ro}: root-relative asset paths`);
    assert.doesNotMatch(html, BANNED, `${art.ro}: no banned chars`);
    assert.doesNotMatch(artMain, /WooCommerce/i, `${art.ro}: no WooCommerce`);
    assert.doesNotMatch(artMain.replace(/<[^>]+>/g, ' '), AI_TIER1, `${art.ro}: no AI Tier-1 buzzwords`);

    const mainEnd = html.indexOf('</main>');
    const form = html.search(/<form\b[^>]*class="elementor-form"/);
    const footer = html.search(/<footer\b/);
    assert.ok(mainEnd > 0 && mainEnd < form && form < footer, `${art.ro}: contact form above footer`);
    assert.equal(count(html, '<form'), 1, `${art.ro}: single form`);

    const headings = [...artMain.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi)].map(([, h]) => h.replace(/<[^>]+>/g, ''));
    for (const h of headings) assert.doesNotMatch(h, /\b2026\b/, `${art.ro}: no 2026 in heading: ${h}`);

    const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(([, id]) => id));
    for (const [, target] of artMain.matchAll(/href="#([^"]+)"/g)) {
      assert.ok(ids.has(target), `${art.ro}: anchor #${target} exists`);
    }

    const dates = visibleArticleDates(html);
    assert.ok(dates?.datePublished && dates?.dateModified, `${art.ro}: visible dates parsed`);
    assert.ok(visibleHeadline(html)?.length > 20, `${art.ro}: visible headline parsed`);
  }

  assert.match(roPageMeta['/blog/cat-costa-un-magazin-online/'].title, /\b2027\b/);
  assert.match(roPageMeta['/blog/cat-costa-un-site-web/'].title, /\b2027\b/);
});

test('blog and article CSS are mobile first, keep exact #fd8649 orange and place the header inside the top background', () => {
  for (const [name, sheet, bodyCls] of [
    ['blog.css', css, 'ect-blog-body'],
    ['blog-article.css', artCss, 'ect-article-body'],
  ]) {
    assert.match(sheet, /#fd8649;/, name);
    assert.doesNotMatch(sheet, /#ad420f|orange-deep/i, `${name}: exact brand orange only`);
    assert.doesNotMatch(sheet, /@media \(max-width:/, `${name}: mobile first base styles`);
    assert.match(sheet, new RegExp(`body\\.${bodyCls}::before\\s*\\{[\\s\\S]*?(?:top:\\s*0|inset:\\s*0\\s+0\\s+auto\\s+0);`), name);
    assert.match(sheet, new RegExp(`body\\.${bodyCls}\\s*>\\s*header\\.elementor-location-header\\s*\\{[\\s\\S]*?background:\\s*transparent;`), name);
    assert.match(sheet, /prefers-reduced-motion:\s*reduce/, name);
    assert.doesNotMatch(sheet, BANNED, name);
  }
  assert.doesNotMatch(artJs, BANNED, 'blog-article.js');
});

test('Blog, BlogPosting and BreadcrumbList schema helpers emit valid linked entities', () => {
  const site = 'https://www.echipadetocilari.ro';
  const b = blog({ site, lang: 'ro', url: '/blog/', name: 'Blog', description: 'Ghiduri' });
  assert.equal(b['@type'], 'Blog');
  assert.equal(b['@id'], `${site}/blog/#blog`);
  assert.equal(b.publisher['@id'], `${site}/#organization`);

  const post = blogPosting({
    site,
    lang: 'ro',
    url: '/blog/cat-costa-un-magazin-online/',
    headline: 'Cât costă un magazin online în 2027 și ce plătești separat',
    description: 'Prețuri reale pe Shopify sau Medusa.',
    datePublished: '2026-11-24',
    dateModified: '2026-11-24',
    image: `${site}/wp-content/ect-pages/og/default.jpg`,
  });
  assert.equal(post['@type'], 'BlogPosting');
  assert.equal(post['@id'], `${site}/blog/cat-costa-un-magazin-online/#article`);
  assert.equal(post.author['@id'], `${site}/#organization`);
  assert.equal(post.publisher['@id'], `${site}/#organization`);
  assert.equal(post.isPartOf['@id'], `${site}/blog/#blog`);
  assert.equal('breadcrumb' in post, false, 'Schema.org puts breadcrumb on WebPage, not BlogPosting');
  assert.equal(post.datePublished, '2026-11-24T09:00:00+02:00');
  assert.equal(post.dateModified, '2026-11-24T09:00:00+02:00');

  const wp = webPage({
    site,
    lang: 'ro',
    url: '/blog/cat-costa-un-site-web/',
    name: 'Cât costă un site web în 2027',
    description: 'Prețuri reale.',
    breadcrumb: true,
  });
  assert.equal(wp.breadcrumb['@id'], `${site}/blog/cat-costa-un-site-web/#breadcrumb`);

  const articleOg = normalizeSocialMeta('<html><head></head><body></body></html>', {
    site,
    pageUrl: '/blog/cat-costa-un-site-web/',
    locale: 'ro_RO',
    ogType: 'article',
  });
  assert.match(articleOg, /<meta property="og:type" content="article">/);

  const bc = breadcrumbList({
    site,
    url: '/blog/cat-costa-un-magazin-online/',
    items: [
      { name: 'Acasă', url: '/' },
      { name: 'Blog', url: '/blog/' },
      { name: 'Cât costă un magazin online în 2027' },
    ],
  });
  assert.equal(bc['@type'], 'BreadcrumbList');
  assert.equal(bc.itemListElement.length, 3);
  assert.equal(bc.itemListElement[0].item, `${site}/`);
  assert.equal(bc.itemListElement[1].item, `${site}/blog/`);
  assert.equal('item' in bc.itemListElement[2], false);
});

test('/blog/ keeps peach out of the index styles (white with orange outlines instead)', () => {
  const lower = css.toLowerCase();
  for (const hex of ['#fff0e7', '#fff5ed', '#ffe6d7', '#fff6f0', '#ffe8db', '#f5ddce']) {
    assert.ok(!lower.includes(hex), `blog.css still uses ${hex}`);
  }
  assert.doesNotMatch(css, /--bg-peach|--bg-warm|--border-warm/);
});
