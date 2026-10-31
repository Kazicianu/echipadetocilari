import assert from 'node:assert/strict';
import test from 'node:test';
import { nameFooterIconLinks, unnamedFooterIconLinks } from './footer-a11y.mjs';

const footer = `<footer>
<a href="https://www.facebook.com/EchipadeTocilari/"><span class="elementor-icon-list-text"></span></a>
<a href="https://www.linkedin.com/company/echipa-de-tocilari/"><span></span></a>
<a class="elementor-button" href="#top"><svg aria-hidden="true"></svg></a>
</footer>`;
const page = (lang, body = footer) => `<html lang="${lang}"><body><script>var s = '<a href="#top">';</script>${body}</body></html>`;

test('names the icon-only footer links in Romanian', () => {
  const out = nameFooterIconLinks(page('ro'));
  assert.match(out, /<a aria-label="Facebook" href="https:\/\/www\.facebook\.com\/EchipadeTocilari\/">/);
  assert.match(out, /<a aria-label="LinkedIn" href="https:\/\/www\.linkedin\.com\/company\/echipa-de-tocilari\/">/);
  assert.match(out, /<a aria-label="Înapoi sus" class="elementor-button" href="#top">/);
  assert.deepEqual(unnamedFooterIconLinks(out), []);
});

test('names the back-to-top link in English and leaves script text alone', () => {
  const out = nameFooterIconLinks(page('en'));
  assert.match(out, /<a aria-label="Back to top" class="elementor-button" href="#top">/);
  assert.ok(out.includes(`var s = '<a href="#top">';`));
});

test('is idempotent and keeps an existing label', () => {
  const once = nameFooterIconLinks(page('ro'));
  assert.equal(nameFooterIconLinks(once), once);
  const custom = page('ro', footer.replace('<a href="https://www.facebook.com/EchipadeTocilari/">', '<a aria-label="Pagina noastră" href="https://www.facebook.com/EchipadeTocilari/">'));
  assert.match(nameFooterIconLinks(custom), /aria-label="Pagina noastră"/);
  assert.doesNotMatch(nameFooterIconLinks(custom), /aria-label="Facebook"/);
});

test('reports unnamed links and fails when a link is missing', () => {
  assert.equal(unnamedFooterIconLinks(page('ro')).length, 3);
  assert.throws(() => nameFooterIconLinks(page('ro', '<footer></footer>')), /not found/);
  assert.throws(() => nameFooterIconLinks(page('ro', footer.replace('#top', '#start'))), /#top/);
});
