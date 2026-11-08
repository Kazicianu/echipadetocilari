import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../../legacy-mirror/', import.meta.url);
const html = readFileSync(new URL('index.html', root), 'utf8');
const start = html.indexOf('<section class="ect-showcase"');
const end = html.indexOf('</section>', start) + '</section>'.length;
const section = html.slice(start, end);

test('the showcase is one section placed between the services and the process', () => {
  assert.equal(html.split('<section class="ect-showcase"').length, 2);
  assert.ok(start > html.indexOf('Mentenanță site'), 'after the maintenance band');
  assert.ok(start < html.indexOf('<section class="ect-process">'), 'before the process section');
  assert.ok(end < html.indexOf('<section class="ect-process">'));
});

test('six cards each point at a dialog with the same id', () => {
  const cards = [...section.matchAll(/<button[^>]*data-ect-card="([^"]+)"[^>]*>/g)];
  assert.equal(cards.length, 6);
  for (const [tag, id] of cards) {
    assert.match(tag, new RegExp(`aria-controls="${id}"`));
    assert.equal(section.split(`<dialog class="ect-carousel-modal" id="${id}"`).length, 2, `dialog ${id}`);
  }
  assert.equal([...section.matchAll(/<dialog /g)].length, 6);
});

test('every aria-labelledby points at an existing id', () => {
  const refs = [...section.matchAll(/aria-labelledby="([^"]+)"/g)].map(m => m[1]);
  assert.ok(refs.length >= 7);
  for (const id of refs) assert.ok(section.includes(`id="${id}"`), id);
});

test('images carry width, height and alt, and their files exist', () => {
  const imgs = [...section.matchAll(/<img\b[^>]*>/g)].map(m => m[0]);
  assert.equal(imgs.length, 12);
  for (const img of imgs) {
    assert.match(img, /\swidth="\d+"/);
    assert.match(img, /\sheight="\d+"/);
    assert.match(img, /\salt="[^"]*"/);
    const urls = [...img.matchAll(/\s(?:src|srcset)="([^"]+)"/g)]
      .flatMap(m => m[1].split(',').map(part => part.trim().split(/\s+/)[0]));
    assert.ok(urls.length > 0);
    for (const url of urls) assert.ok(existsSync(new URL(url.replace(/^\//, ''), root)), url);
  }
});

test('the section has no em dash, diagonal arrows or dead anchors', () => {
  assert.doesNotMatch(section, /[\u2014\u2196-\u2199]/);
  assert.doesNotMatch(section, /href="#"/);
});

test('the showcase script is loaded with defer', () => {
  assert.match(html, /<script src="\/wp-content\/ect-pages\/home\/showcase\.js" defer><\/script>/);
});
