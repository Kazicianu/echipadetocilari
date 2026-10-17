import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { routes } from '../i18n/routes.mjs';
import { normalizePageLinks, removeUnavailableMenuLinks } from './navigation.mjs';

const source = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../legacy-mirror');
const link = href => `<a href="${href}">link</a>`;

test('index.html resolves to the current page, and parent/sibling links resolve from that page', () => {
  const opts = { pageUrl: '/portofoliu/' };
  assert.equal(normalizePageLinks(link('index.html'), opts), link('/portofoliu/'));
  assert.equal(normalizePageLinks(link('./index.html'), opts), link('/portofoliu/'));
  assert.equal(normalizePageLinks(link('../index.html'), opts), link('/'));
  assert.equal(normalizePageLinks(link('../contact/index.html'), opts), link('/contact/'));
  assert.equal(normalizePageLinks(link('index.html'), { pageUrl: '/' }), link('/'));
  assert.equal(normalizePageLinks(link('index.html'), { pageUrl: '/portofoliu' }), link('/portofoliu/'));
  assert.equal(normalizePageLinks(link('index.html'), { pageUrl: '/portofoliu/index.html' }), link('/portofoliu/'));
});

test('English copies translate resolved routes without confusing the current page and home', () => {
  const opts = { pageUrl: '/portofoliu/', language: 'en' };
  assert.equal(normalizePageLinks(link('index.html'), opts), link('/en/portfolio/'));
  assert.equal(normalizePageLinks(link('../index.html'), opts), link('/en/'));
  assert.equal(normalizePageLinks(link('../contact/index.html'), opts), link('/en/contact/'));
  assert.equal(normalizePageLinks(link('https://www.echipadetocilari.ro/servicii-seo/'), opts), link('/en/seo-services/'));
  assert.equal(normalizePageLinks(link('index.html'), { pageUrl: '/en/portfolio/' }), link('/en/portfolio/'));
  assert.equal(normalizePageLinks(link('../contact/index.html'), { pageUrl: '/en/portfolio/' }), link('/en/contact/'));
  assert.equal(normalizePageLinks(link('/en/portfolio/'), opts), link('/en/portfolio/'));
});

test('a cloned template keeps its footer destinations instead of retargeting them to the new page', () => {
  const template = readFileSync(path.join(source, 'creare-site-web/index.html'), 'utf8');
  const prepared = normalizePageLinks(template, { pageUrl: '/creare-site-web/' });
  const cloned = normalizePageLinks(prepared, { pageUrl: '/creare-magazin-online/' });
  const footer = cloned.match(/<footer\b[\s\S]*?<\/footer>/i)?.[0];
  assert.match(footer, /href="\/creare-site-web\/"[^>]*>\s*Creare Site Web\s*<\/a>/);
});

test('query strings and fragments survive without being double-escaped', () => {
  const opts = { pageUrl: '/portofoliu/', language: 'en' };
  assert.equal(normalizePageLinks(link('index.html?category=seo&amp;sort=name#results'), opts), link('/en/portfolio/?category=seo&amp;sort=name#results'));
  assert.equal(normalizePageLinks(link('?category=seo#results'), opts), link('/en/portfolio/?category=seo#results'));
  assert.equal(normalizePageLinks(link('#results'), opts), link('#results'));
  assert.equal(normalizePageLinks(link(''), opts), link(''));
});

test('language switches, external links, downloads, backend URLs and non-anchor markup are preserved', () => {
  const opts = { pageUrl: '/portofoliu/', language: 'en' };
  for (const href of ['https://example.com/contact/index.html', 'https://www.echipadetocilari.ro.evil.test/contact/', 'https://www.echipadetocilari.ro:8443/contact/', '/wp-admin/index.php', '/wp-json/wp/v2/pages/', '../wp-content/image.png', 'mailto:contact@echipadetocilari.ro', 'tel:+40123456789', '/unknown-page/index.html']) {
    assert.equal(normalizePageLinks(link(href), opts), link(href));
  }
  const special = `<a href="/portofoliu/" hreflang="ro">RO</a><a href="/en/portfolio/" hreflang="en">EN</a><a download href="index.html">Download</a><link rel="canonical" href="/portofoliu/"><script>const text='<a href="index.html">example</a>';</script><!-- <a href="index.html">comment</a> --><style>.example:after{content:'<a href="index.html">';}</style>`;
  assert.equal(normalizePageLinks(special, opts), special);
});

test('actual current-page menu links resolve correctly for every RO page and EN twin', () => {
  let checkedCurrentLinks = 0;
  for (const route of routes) {
    const original = readFileSync(path.join(source, route.roFile), 'utf8');
    const currentLinks = [...original.matchAll(/<a\b[^>]*\baria-current="page"[^>]*>/gi)].map(match => match[0]);
    for (const tag of currentLinks) {
      checkedCurrentLinks++;
      assert.match(normalizePageLinks(tag, { pageUrl: route.ro }), new RegExp(`href="${route.ro}"`));
      if (route.en) assert.match(normalizePageLinks(tag, { pageUrl: route.ro, language: 'en' }), new RegExp(`href="${route.en}"`));
    }
    const ro = normalizePageLinks(original, { pageUrl: route.ro });
    assert.equal(normalizePageLinks(ro, { pageUrl: route.ro }), ro);
    if (route.en) {
      const en = normalizePageLinks(ro, { pageUrl: route.ro, language: 'en' });
      assert.equal(normalizePageLinks(en, { pageUrl: route.en, language: 'en' }), en);
    }
  }
  assert.ok(checkedCurrentLinks >= 12, 'checks the actual desktop and mobile current-page menus');
});

test('legacy Google Ads routes migrate to canonical pages while preserving language and URL suffixes', () => {
  const opts = { pageUrl: '/portofoliu/' };
  assert.equal(normalizePageLinks(link('/pay-per-click/'), opts), link('/agentie-google-ads/'));
  assert.equal(normalizePageLinks(link('/en/ppc-advertising/'), opts), link('/en/google-ads-agency/'));
  assert.equal(normalizePageLinks(link('../pay-per-click/index.html?plan=start&amp;source=menu#costuri'), opts), link('/agentie-google-ads/?plan=start&amp;source=menu#costuri'));
  assert.equal(normalizePageLinks(link('https://www.echipadetocilari.ro/en/ppc-advertising/index.html#plans'), opts), link('/en/google-ads-agency/#plans'));

  for (const href of ['/pay-per-click/', '/en/ppc-advertising/']) {
    assert.equal(normalizePageLinks(link(href), { ...opts, language: 'en' }), link('/en/google-ads-agency/'));
    assert.equal(normalizePageLinks(link(href), { ...opts, language: 'ro' }), link('/agentie-google-ads/'));
  }
  assert.equal(normalizePageLinks('<a href="/pay-per-click/?source=switch#plans" hreflang="en">EN</a>', { ...opts, language: 'ro' }), '<a href="/en/google-ads-agency/?source=switch#plans" hreflang="en">EN</a>');
  assert.equal(normalizePageLinks('<a href="/en/ppc-advertising/" hreflang="ro">RO</a>', { ...opts, language: 'en' }), '<a href="/agentie-google-ads/" hreflang="ro">RO</a>');
  assert.equal(normalizePageLinks(link('index.html'), { pageUrl: '/pay-per-click' }), link('/agentie-google-ads/'));
  assert.equal(normalizePageLinks(link('index.html'), { pageUrl: '/en/ppc-advertising' }), link('/en/google-ads-agency/'));
  assert.equal(normalizePageLinks(link('https://example.com/pay-per-click/'), opts), link('https://example.com/pay-per-click/'));
});

test('desktop and mobile menus expose current service pages on every page', () => {
  const servicePaths = [
    '/creare-site-web/',
    '/creare-magazin-online/',
    '/dezvoltare-aplicatii/',
    '/servicii-seo/',
    '/agentie-google-ads/',
    '/administrare-site/',
  ];

  for (const route of routes) {
    const original = readFileSync(path.join(source, route.roFile), 'utf8');
    const header = original.match(/<header\b[\s\S]*?<\/header>/i)?.[0];
    assert.ok(header, `${route.ro}: header missing`);
    if (route.landing) {
      assert.match(header, /class="lp-header"/);
      assert.match(header, /href="#formular_contact_bottom"/);
      assert.doesNotMatch(header, /<nav\b|elementor-menu-toggle/);
      continue;
    }
    for (const menuClass of ['elementor-nav-menu--main', 'elementor-nav-menu--dropdown']) {
      const menu = [...header.matchAll(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi)]
        .map(match => match[0])
        .find(nav => nav.includes(menuClass));
      assert.ok(menu, `${route.ro}: ${menuClass} missing`);
      for (const servicePath of servicePaths) {
        assert.ok(menu.includes(`href="${servicePath}"`), `${route.ro}: ${menuClass} missing ${servicePath}`);
      }
    }
  }
});

test('Romanian-only service links never acquire an undefined English URL', () => {
  assert.equal(normalizePageLinks(link('/creare-magazin-online/'), { pageUrl: '/', language: 'en' }), link('/creare-magazin-online/'));
  assert.equal(normalizePageLinks(link('index.html'), { pageUrl: '/creare-magazin-online/', language: 'en' }), link('/creare-magazin-online/'));
  assert.equal(normalizePageLinks(link('/dezvoltare-aplicatii/?tip=web#lp-story'), { pageUrl: '/', language: 'en' }), link('/dezvoltare-aplicatii/?tip=web#lp-story'));
});

test('the homepage applications card opens the approved Romanian landing', () => {
  const html = readFileSync(path.join(source, 'index.html'), 'utf8');
  const card = html.match(/<a\b[^>]*data-id="7c0fd02d"[^>]*>/)?.[0];
  assert.match(card ?? '', /href="\/dezvoltare-aplicatii\/"/);
});

test('English menus omit untranslated pages while Romanian menus and contextual links remain intact', () => {
  const sourceHtml = '<header><nav><ul><li><a href="/services/">Servicii</a><ul><li><a href="/creare-site-web/">Creare site web</a></li><li class="menu-item"><a href="/creare-magazin-online/" aria-current="page">Creare magazin online</a></li></ul></li><li><a href="https://example.com/creare-magazin-online/">External</a></li></ul></nav></header><main><a href="/creare-magazin-online/">Contextual</a></main>';
  const english = removeUnavailableMenuLinks(sourceHtml, 'en');
  const englishHeader = english.match(/<header>[\s\S]*?<\/header>/)[0];
  assert.doesNotMatch(englishHeader, /href="\/creare-magazin-online\/"/);
  assert.match(englishHeader, /href="\/creare-site-web\/"/);
  assert.match(englishHeader, /https:\/\/example\.com\/creare-magazin-online\//);
  assert.match(english, /<main><a href="\/creare-magazin-online\/">Contextual<\/a><\/main>/);
  assert.equal(removeUnavailableMenuLinks(sourceHtml, 'ro'), sourceHtml);
  assert.equal(removeUnavailableMenuLinks(english, 'en'), english);
});
