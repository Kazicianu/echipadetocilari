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
import { FOOTER_STYLESHEET, TERMS_PATHS, renderSiteFooter } from './site-footer.mjs';

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

test('the Legal column links the terms and the privacy policy and holds the hidden cookie-settings button, in the page language', () => {
  const copy = consentCopy();
  const TERMS = { ro: 'Termeni și condiții', en: 'Terms and conditions' };
  for (const { language, url, html } of sourcePages()) {
    const label = `${url} (${language})`;
    const footer = footerOf(renderSiteFooter(html));
    const legal = footer.match(/<nav class="ect-footer__col ect-footer__col--legal" aria-label="Legal"><p class="ect-footer__label">Legal<\/p><ul>[\s\S]*?<\/ul><\/nav>/);
    assert.ok(legal, `${label}: Legal column`);
    assert.equal(count(legal[0], /<li>/g), 3, label);
    assert.ok(legal[0].includes(`<li><a href="${TERMS_PATHS[language]}">${TERMS[language]}</a></li>`), `${label}: terms link`);
    assert.equal(count(footer, /data-ect-footer-privacy/g), 1, label);
    assert.match(legal[0], new RegExp(`<a href="${PRIVACY_PATHS[language]}" data-ect-footer-privacy>${copy[language].footerPolicy}</a>`), label);
    assert.equal(count(footer, /data-ect-consent-open/g), 1, label);
    assert.match(legal[0], new RegExp(`<button type="button" class="ect-consent-open" data-ect-consent-open hidden>${copy[language].footerSettings}</button>`), label);
    // The policy page has its own "change cookie settings" button in #cookies.
    const ownControls = url === PRIVACY_PATHS[language] ? 1 : 0;
    assert.equal(count(renderSiteFooter(html), /data-ect-consent-open/g), 1 + ownControls, label);
  }
  assert.deepEqual(TERMS_PATHS, { ro: '/termeni-si-conditii/', en: '/en/terms-and-conditions/' });
  const css = readFileSync(path.join(root, 'legacy-mirror', FOOTER_STYLESHEET), 'utf8');
  assert.match(css, /li:has\(> \[hidden\]\)\s*\{\s*display: none;/, 'the hidden button leaves no empty row');
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
    assert.equal(count(company, /<li>/g), 2, `${language}: only About and Portfolio`);
    for (const ro of ['/despre-noi/', '/portofoliu/']) {
      assert.ok(company.includes(`href="${routes.find((route) => route.ro === ro)[language]}"`), `${language}: ${ro}`);
    }
    assert.ok(!company.includes(`href="${routes.find((route) => route.ro === '/contact/')[language]}"`), `${language}: no Contact link`);
  }
  assert.match(ro, /<a class="ect-footer__logo" href="\/">/);
  assert.match(en, /<a class="ect-footer__logo" href="\/en\/">/);
});

test('Contact holds only the phone and the email; the English footer has no Romanian text', () => {
  const PHONE = { ro: '0750 203 466', en: '+40 750 203 466' };
  for (const { language, url, html } of sourcePages()) {
    const label = `${url} (${language})`;
    const org = ORGS[language];
    const footer = footerOf(renderSiteFooter(html));
    const contact = footer.match(/<address class="ect-footer__contact">([\s\S]*?)<\/address>/)[1];
    assert.equal(contact, `<a href="tel:${org.telephone}">${PHONE[language]}</a><a href="mailto:contact@echipadetocilari.ro">contact@echipadetocilari.ro</a>`, `${label}: contact`);
    if (language === 'en') {
      assert.doesNotMatch(footer.replace(/<svg\b[\s\S]*?<\/svg>/g, ''), /[ăâîșțşţĂÂÎȘȚŞŢ]/, `${label}: no Romanian text`);
    }
  }
});

test('the footer keeps only what it needs: no address, hours, copyright, company ids or tagline', () => {
  for (const { language, url, html } of sourcePages()) {
    const label = `${url} (${language})`;
    const org = ORGS[language];
    const footer = footerOf(renderSiteFooter(html));
    assert.ok(!footer.includes(org.address.streetAddress) && !footer.includes(org.address.postalCode), `${label}: no address`);
    assert.ok(!footer.includes(`${org.openingHours.opens}-${org.openingHours.closes}`), `${label}: no hours`);
    for (const gone of ['©', 'CUI', 'J40/', 'Agenție de marketing digital', 'Digital marketing agency', 'Program:', 'Hours:']) {
      assert.ok(!footer.includes(gone), `${label}: no ${gone}`);
    }
    assert.doesNotMatch(footer, /ect-footer__(bottom|status|dot|hours|tagline|company|legal)\b/, `${label}: old blocks are gone`);
    assert.doesNotMatch(footer, /viewBox="0 0 448 512"[^>]*><path d="M4(00|16) 32H/, `${label}: no Font Awesome squares`);
  }
});

test('the social links are named orange circles with solid official marks, in the Contact column', () => {
  for (const { language, url, html } of sourcePages()) {
    const label = `${url} (${language})`;
    const footer = footerOf(renderSiteFooter(html));
    const contact = footer.match(/<div class="ect-footer__col ect-footer__col--contact">[\s\S]*?<\/ul>\s*<\/div>/)[0];
    assert.match(contact, /<\/address>\s*<ul class="ect-footer__social">/, `${label}: the social list follows the email inside Contact`);
    const brand = footer.match(/<div class="ect-footer__brand">[\s\S]*?<\/div>/)[0];
    assert.doesNotMatch(brand, /ect-footer__social|<svg/, `${label}: the brand holds only the logo`);
    const social = footer.match(/<ul class="ect-footer__social">([\s\S]*?)<\/ul>/)[1];
    const links = social.match(/<a\b[^>]*>[\s\S]*?<\/a>/g);
    assert.equal(links.length, 2, label);
    assert.deepEqual(links.map((link) => link.match(/aria-label="([^"]+)"/)[1]), ['Facebook', 'LinkedIn'], label);
    assert.ok(links[0].includes('href="https://www.facebook.com/EchipadeTocilari/"') && links[1].includes('href="https://www.linkedin.com/company/echipa-de-tocilari/"'), label);
    for (const link of links) {
      const svg = link.match(/<svg\b[^>]*>/)[0];
      for (const attr of ['aria-hidden="true"', 'focusable="false"', 'fill="currentColor"']) {
        assert.ok(svg.includes(attr), `${label}: ${attr}`);
      }
      assert.doesNotMatch(svg, /\bstroke/, `${label}: solid marks, no stroke`);
    }
    assert.ok(links[0].includes('viewBox="0 0 320 512"') && links[1].includes('viewBox="0 0 448 512"'), `${label}: Font Awesome 5 brand boxes`);
  }
  const css = readFileSync(path.join(root, 'legacy-mirror', FOOTER_STYLESHEET), 'utf8');
  assert.match(css, /\.ect-footer__social a \{[^}]*width: 44px;[^}]*height: 44px;[^}]*border-radius: 50%;[^}]*background: #fd8649;[^}]*box-shadow: 0 0 20px rgba\(0, 0, 0, 0\.05\);[^}]*color: #ffffff;/, 'a solid orange 44px circle with a white mark');
  assert.match(css, /\.ect-footer__social a:hover,\s*\.ect-footer \.ect-footer__col \.ect-footer__social a:focus-visible \{[^}]*color: #ffffff;[^}]*box-shadow: 0 0 20px rgba\(253, 134, 73, 0\.69\);/, 'hover and focus glow orange');
  const motion = css.slice(css.indexOf('@media (prefers-reduced-motion: no-preference)'));
  assert.match(motion, /\.ect-footer__social a:focus-visible \{\s*transform: translateY\(-2px\);/, 'the lift only under no-preference');
  assert.equal(count(css.replace(motion, ''), /translateY\(-2px\)/g), 0, 'no lift outside the motion query');
  assert.match(css, /outline: 3px solid #27272d;\s*outline-offset: 2px;\s*border-radius: 50%;/, 'round focus ring');
});

test('the 1200px grid packs the brand and four columns to the left with the signature under it', () => {
  const css = readFileSync(path.join(root, 'legacy-mirror', FOOTER_STYLESHEET), 'utf8');
  const wide = css.slice(css.indexOf('@media (min-width: 1200px)'));
  assert.match(wide, /grid-template-columns: 84px repeat\(4, max-content\);/);
  assert.match(wide, /justify-content: start;/);
  assert.match(wide, /column-gap: clamp\(48px, 4\.2vw, 80px\);/);
  assert.match(wide, /\.ect-footer__madewith \{\s*margin-top: 30px;/);
  assert.doesNotMatch(css, /width: 79%|space-between/, 'no stretched row');
  for (const { language, url, html } of sourcePages().filter((page) => page.url === '/' || page.url === '/en/')) {
    const footer = footerOf(renderSiteFooter(html));
    const top = footer.match(/<div class="ect-footer__top">([\s\S]*?)<\/div>\s*<p class="ect-footer__madewith">/);
    assert.ok(top, `${url} (${language}): the signature follows the grid`);
    assert.match(top[1], /^\s*<div class="ect-footer__brand">\s*<a class="ect-footer__logo"[^>]*><img [^>]*><\/a>\s*<\/div>\s*<nav class="ect-footer__col ect-footer__col--services"/, `${url} (${language}): the logo stands alone before the columns`);
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
    assert.ok(footer.indexOf('class="ect-footer__top"') < at && footer.lastIndexOf('</nav>') < at && at < footer.indexOf('class="ect-footer__art"'), `${label}: order`);
    assert.doesNotMatch(found[0], /target=/, label);
  }
});
