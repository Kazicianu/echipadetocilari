import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { routes } from '../i18n/routes.mjs';
import { roOrg } from '../i18n/meta-ro.mjs';
import { enOrg } from '../i18n/dictionary.mjs';
import { setLang } from './html.mjs';
import { unnamedFooterIconLinks } from './footer-a11y.mjs';
import { PRIVACY_PATHS, consentCopy } from './privacy.mjs';
import { FOOTER_STYLESHEET, renderSiteFooter } from './site-footer.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const count = (html, pattern) => (html.match(pattern) || []).length;
const footerOf = (html) => html.match(/<footer\b[\s\S]*<\/footer>/i)[0];
const ORGS = { ro: roOrg, en: enOrg };

function sourcePages() {
  return routes.flatMap((route) => (route.en ? ['ro', 'en'] : ['ro']).map((language) => ({
    route, language, url: route[language],
    html: setLang(readFileSync(path.join(root, 'legacy-mirror', route.roFile), 'utf8'), language),
  })));
}

test('every RO and EN page keeps one footer tag, its Elementor class and the back-to-top widget', () => {
  for (const { language, url, html } of sourcePages()) {
    const label = `${url} (${language})`;
    const result = renderSiteFooter(html);
    assert.equal(count(result, /<footer\b/gi), 1, `${label}: one footer`);
    assert.equal(count(result, /data-ect-footer="2"/g), 1, label);
    const open = result.match(/<footer\b[^>]*>/i)[0];
    assert.match(open, /\bdata-elementor-type="footer"/, label);
    assert.match(open, /\bclass="elementor elementor-3355 elementor-location-footer ect-footer"/, label);
    const footer = footerOf(result);
    assert.equal(count(footer, /elementor-element-78c37fa2/g), 1, `${label}: back-to-top widget`);
    assert.match(footer, /<a aria-label="[^"]+" class="elementor-button[^"]*" href="#top">/, label);
    assert.deepEqual(unnamedFooterIconLinks(result), [], `${label}: icon links are named`);
    assert.doesNotMatch(footer, /<h[1-6]\b/i, `${label}: no headings in the footer`);
    assert.doesNotMatch(footer, /elementor-element-3cc1c00|ect-footer-links/, `${label}: old footer content is gone`);
    assert.doesNotMatch(footer, /—|[↗↖↘↙]/, `${label}: no em dash or diagonal arrows`);
  }
});

test('the privacy link and the hidden cookie-settings button follow the page language', () => {
  const copy = consentCopy();
  for (const { language, url, html } of sourcePages()) {
    const label = `${url} (${language})`;
    const footer = footerOf(renderSiteFooter(html));
    assert.equal(count(footer, /data-ect-footer-privacy/g), 1, label);
    assert.match(footer, new RegExp(`<a href="${PRIVACY_PATHS[language]}" data-ect-footer-privacy>${copy[language].footerPolicy}</a>`), label);
    assert.equal(count(footer, /data-ect-consent-open/g), 1, label);
    assert.match(footer, new RegExp(`<button type="button" class="ect-consent-open" data-ect-consent-open hidden>${copy[language].footerSettings}</button>`), label);
    // The policy page has its own "change cookie settings" button in #cookies.
    const ownControls = url === PRIVACY_PATHS[language] ? 1 : 0;
    assert.equal(count(renderSiteFooter(html), /data-ect-consent-open/g), 1 + ownControls, label);
  }
});

test('the links come from routes: all seven services in RO, only the translated ones in EN', () => {
  const ro = footerOf(renderSiteFooter(setLang(readFileSync(path.join(root, 'legacy-mirror/index.html'), 'utf8'), 'ro')));
  const en = footerOf(renderSiteFooter(setLang(readFileSync(path.join(root, 'legacy-mirror/index.html'), 'utf8'), 'en')));
  const services = routes.filter((route) => route.service);
  assert.equal(services.length, 7);
  const roNav = ro.match(/<nav class="ect-footer__col ect-footer__col--services"[\s\S]*?<\/nav>/)[0];
  assert.equal(count(roNav, /<li>/g), 7);
  for (const route of services) assert.ok(roNav.includes(`<a href="${route.ro}">${route.labelRo}</a>`), route.ro);
  const enNav = en.match(/<nav class="ect-footer__col ect-footer__col--services"[\s\S]*?<\/nav>/)[0];
  const translated = services.filter((route) => route.en);
  assert.equal(count(enNav, /<li>/g), translated.length);
  for (const route of translated) assert.ok(enNav.includes(`<a href="${route.en}">${route.labelEn}</a>`), route.en);
  for (const route of services.filter((item) => !item.en)) assert.ok(!en.includes(route.ro), `${route.ro} has no EN page`);
  for (const [footer, language] of [[ro, 'ro'], [en, 'en']]) {
    const company = footer.match(/<nav class="ect-footer__col ect-footer__col--company"[\s\S]*?<\/nav>/)[0];
    for (const ro of ['/despre-noi/', '/portofoliu/', '/contact/']) {
      assert.ok(company.includes(`href="${routes.find((route) => route.ro === ro)[language]}"`), `${language}: ${ro}`);
    }
  }
  assert.match(ro, /<a class="ect-footer__logo" href="\/">/);
  assert.match(en, /<a class="ect-footer__logo" href="\/en\/">/);
});

test('address, phone and hours match the organisation data; the English footer has no Romanian text', () => {
  for (const { language, url, html } of sourcePages()) {
    const label = `${url} (${language})`;
    const org = ORGS[language];
    const footer = footerOf(renderSiteFooter(html));
    assert.ok(footer.includes(`<a href="tel:${org.telephone}">`), `${label}: phone`);
    const { streetAddress, addressLocality, postalCode } = org.address;
    assert.ok(footer.includes(`<span>${streetAddress}, ${addressLocality}, ${postalCode}, ${language === 'en' ? 'Romania' : 'România'}</span>`), `${label}: address`);
    assert.ok(footer.includes(`<span class="ect-footer__hours">${org.openingHours.opens}-${org.openingHours.closes}</span></p>`), `${label}: hours`);
    assert.ok(footer.includes('contact@echipadetocilari.ro') && footer.includes('CUI 47591744 · J40/2298/2023'), `${label}: legal details`);
    assert.ok(footer.includes(`© ${new Date().getFullYear()} ECHIPA DE TOCILARI SRL`), `${label}: build year`);
    if (language === 'en') {
      assert.ok(footer.includes('Hours: Monday-Sunday, <span class="ect-footer__hours">09:00-20:00') && footer.includes('Bucharest, 021998, Romania'), label);
      assert.doesNotMatch(footer.replace(/<svg\b[\s\S]*?<\/svg>/g, ''), /[ăâîșțşţĂÂÎȘȚŞŢ]/, `${label}: no Romanian text`);
    } else {
      assert.ok(footer.includes('Program: luni-duminică, <span class="ect-footer__hours">09:00-20:00') && footer.includes('București, 021998, România'), label);
    }
  }
});

test('the balcony illustration is a decorative lazy image with its real size, and the stylesheet loads once', () => {
  for (const { language, url, html } of sourcePages()) {
    const label = `${url} (${language})`;
    const result = renderSiteFooter(html);
    const art = footerOf(result).match(/<div class="ect-footer__art" aria-hidden="true">(<img [^>]*>)<\/div>/)[1];
    assert.match(art, /\salt=""/, label);
    assert.match(art, /\swidth="1858" height="941"/, label);
    assert.match(art, /\sloading="lazy"/, label);
    assert.match(art, /\sdecoding="async"/, label);
    assert.match(art, /\ssrcset="[^"]*balconul-tocilarilor-768\.webp 768w, [^"]*-1152\.webp 1152w, [^"]*-1536\.webp 1536w, [^"]*-1858\.webp 1858w"/, label);
    assert.match(art, /\ssizes="\(max-width: 639px\) 580px, 100vw"/, label);
    assert.equal(count(result, new RegExp(`<link rel="stylesheet" href="${FOOTER_STYLESHEET}">`, 'g')), 1, label);
    const head = result.slice(0, result.search(/<\/head>/i));
    assert.ok(head.includes(FOOTER_STYLESHEET), `${label}: stylesheet is in <head>`);
    for (const file of art.match(/\/wp-content\/ect-pages\/footer\/[\w-]+\.webp/g)) {
      assert.doesNotThrow(() => readFileSync(path.join(root, 'legacy-mirror', file)), `${label}: ${file} exists`);
    }
  }
  assert.doesNotThrow(() => readFileSync(path.join(root, 'legacy-mirror', FOOTER_STYLESHEET)));
});

test('the illustration files are WebP with the sizes the srcset promises', () => {
  for (const [w, h] of [[768, 389], [1152, 583], [1536, 778], [1858, 941]]) {
    const file = `legacy-mirror/wp-content/ect-pages/footer/balconul-tocilarilor-${w}.webp`;
    const buf = readFileSync(path.join(root, file));
    assert.equal(buf.toString('latin1', 0, 4), 'RIFF', file);
    assert.equal(buf.toString('latin1', 8, 12), 'WEBP', file);
    const kind = buf.toString('latin1', 12, 16);
    let size;
    if (kind === 'VP8X') {
      size = [1 + buf.readUIntLE(24, 3), 1 + buf.readUIntLE(27, 3)];
    } else if (kind === 'VP8L') {
      const bits = buf.readUInt32LE(21);
      size = [(bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1];
    } else {
      size = [buf.readUInt16LE(26) & 0x3fff, buf.readUInt16LE(28) & 0x3fff];
    }
    assert.deepEqual(size, [w, h], file);
  }
});

test('rendering twice changes nothing, and a page without the footer fails loudly', () => {
  for (const { language, url, html } of sourcePages()) {
    const once = renderSiteFooter(html);
    assert.equal(renderSiteFooter(once), once, `${url} (${language}): idempotent`);
  }
  assert.throws(() => renderSiteFooter('<html lang="ro"><head></head><body><footer><p>x</p></footer></body></html>'), /elementor-location-footer/);
  assert.throws(() => renderSiteFooter('<html lang="ro"><head></head><body></body></html>'), /not found/);
});

test('the build renders the footer before the consent manager', () => {
  const build = readFileSync(path.join(root, 'scripts/build-static.mjs'), 'utf8');
  assert.match(build, /import \{ renderSiteFooter \} from '\.\/lib\/site-footer\.mjs';/);
  assert.ok(build.indexOf('renderSiteFooter(html)') < build.indexOf('addConsentManager(html'), 'footer first');
});

test('the coffee-cup signature closes the footer text, in the page language', () => {
  const buf = readFileSync(path.join(root, 'legacy-mirror/wp-content/ect-pages/footer/pahar-cafea.webp'));
  assert.equal(buf.toString('latin1', 0, 4), 'RIFF');
  assert.equal(buf.toString('latin1', 8, 16), 'WEBPVP8L', 'lossless');
  const bits = buf.readUInt32LE(21);
  const w = (bits & 0x3fff) + 1;
  const h = ((bits >> 14) & 0x3fff) + 1;
  assert.deepEqual([w, h], [117, 128]);
  const WORDS = { ro: ['Făcut cu', 'cafea', 'de', '/'], en: ['Made with', 'coffee', 'by', '/en/'] };
  for (const { language, url, html } of sourcePages()) {
    const label = `${url} (${language})`;
    const footer = footerOf(renderSiteFooter(html));
    const found = footer.match(/<p class="ect-footer__madewith">[\s\S]*?<\/p>/g) || [];
    assert.equal(found.length, 1, `${label}: one signature`);
    const [madeWith, alt, madeBy, home] = WORDS[language];
    const expected = `<p class="ect-footer__madewith">${madeWith} <img class="ect-footer__cup" src="/wp-content/ect-pages/footer/pahar-cafea.webp" width="${w}" height="${h}" alt="${alt}" loading="lazy" decoding="async"> ${madeBy} <a class="ect-footer__team" href="${home}">Echipa de Tocilari</a></p>`;
    assert.equal(found[0], expected, label);
    const at = footer.indexOf('class="ect-footer__madewith"');
    assert.ok(footer.indexOf('class="ect-footer__bottom"') < at && at < footer.indexOf('class="ect-footer__art"'), `${label}: order`);
    assert.doesNotMatch(found[0], /target=/, label);
  }
});
