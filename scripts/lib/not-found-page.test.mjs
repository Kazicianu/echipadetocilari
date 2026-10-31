import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { isOwnedPage, isSystemPage, routes, systemPagePaths } from '../i18n/routes.mjs';
import { NOT_FOUND_DESCRIPTION, NOT_FOUND_TITLE, buildNotFoundPage } from './not-found-page.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const template = readFileSync(path.join(root, 'legacy-mirror/politica-de-confidentialitate/index.html'), 'utf8');
const page = buildNotFoundPage(template);
const main = page.match(/<main\b[\s\S]*?<\/main>/i)?.[0] ?? '';

test('the 404 page is a system page, outside the routes', () => {
  assert.deepEqual(systemPagePaths, ['/404.html']);
  assert.equal(isSystemPage('/404.html'), true);
  assert.equal(isSystemPage('/'), false);
  assert.equal(isOwnedPage('/404.html'), false);
  assert.ok(!routes.some((route) => route.ro === '/404.html' || route.en === '/404.html'));
});

test('main holds the 404 content with one H1 and the English line', () => {
  assert.equal((page.match(/<main\b/gi) || []).length, 1);
  assert.match(main, /^<main id="content" class="ect-page ect-page--not-found">/);
  assert.equal((page.match(/<h1\b/gi) || []).length, 1);
  assert.match(main, /<h1>Pagina nu există<\/h1>/);
  assert.match(main, /Eroare 404/);
  assert.match(main, /href="\/">Prima pagină</);
  assert.match(main, /href="\/#servicii">Serviciile noastre</);
  assert.match(main, /href="#formular_contact_bottom">Scrie-ne</);
  assert.match(main, /<p class="ect-not-found__en" lang="en">Page not found\. <a href="\/en\/" hreflang="en">Go to the English homepage<\/a>\.<\/p>/);
  assert.doesNotMatch(page, /ect-policy/);
});

test('the shared header, contact section and footer survive around main', () => {
  assert.match(page, /<header\b[^>]*elementor-location-header/);
  assert.ok(page.indexOf('</main>') < page.indexOf('ect-shared-contact'));
  assert.ok(page.indexOf('id="formular_contact_bottom"') > page.indexOf('</main>'));
  assert.ok(page.indexOf('id="formular_contact_bottom"') < page.search(/<footer\b/i));
  assert.match(page, /<a class="skip-link[^>]*href="#content"/);
});

test('metadata is the 404 copy with no canonical and no share tags', () => {
  assert.match(page, new RegExp(`<title>${NOT_FOUND_TITLE}</title>`));
  assert.match(page, new RegExp(`<meta name="description" content="${NOT_FOUND_DESCRIPTION}">`));
  assert.doesNotMatch(page, /rel="canonical"/i);
  assert.doesNotMatch(page, /<meta\b[^>]*(?:property|name)="(?:og|twitter):/i);
});

test('the privacy stylesheet becomes the 404 stylesheet and no asset path is relative', () => {
  assert.match(page, /href="\/wp-content\/ect-pages\/not-found\.css"/);
  assert.doesNotMatch(page, /politica-de-confidentialitate\.css/);
  assert.doesNotMatch(page, /\s(?:src|href)="(?:\.\.?\/)*wp-(?:content|includes)\//);
  assert.doesNotMatch(page, /\s(?:src|href)="\.\.?\//);
});

test('the language switcher links the Romanian and English homepages', () => {
  const switcher = page.match(/<nav id="ect-lang-switch"[\s\S]*?<\/nav>/)?.[0] ?? '';
  assert.match(switcher, /<a href="\/" hreflang="ro"/);
  assert.match(switcher, /<a href="\/en\/" hreflang="en"[^>]*aria-label="EN: English homepage"/);
});

test('the page has no prohibited punctuation or diagonal arrows', () => {
  assert.doesNotMatch(main, /[—↖-↙]/);
});

test('a template without main or without the privacy stylesheet is rejected', () => {
  assert.throws(() => buildNotFoundPage(template.replace(/<main\b[^>]*>/i, '<div>').replace('</main>', '</div>')), /main/);
  assert.throws(() => buildNotFoundPage(template.split('politica-de-confidentialitate.css').join('x.css')), /politica-de-confidentialitate\.css/);
});
