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
  assert.ok(html.includes('<section class="ect-showcase" id="proiecte" aria-labelledby="ect-showcase-title">'), 'the showcase section is visible');
  assert.ok(start > html.indexOf('Mentenanță site'), 'after the maintenance band');
  assert.ok(start < html.indexOf('<section class="ect-process">'), 'before the process section');
  assert.ok(end < html.indexOf('<section class="ect-process">'));
});

test('ten cards link straight to the live sites, with no popup', () => {
  const cards = [...section.matchAll(/<a class="ect-carousel-card [^"]+"[^>]*>([\s\S]*?)<\/a>/g)];
  assert.equal(cards.length, 10);
  assert.deepEqual(cards.map(([tag]) => tag.match(/ect-carousel-card--([a-z0-9]+)/)[1]), ['torjai', 'funera', '2noi', 'zuzel', 'lumo', 'fernly', 'norwen', 'mesa', 'tidora', 'grovely']);
  for (const [tag, inner] of cards) {
    assert.match(tag, /href="https:\/\/[^"]+"/);
    assert.match(tag, /target="_blank" rel="noopener noreferrer"/);
    assert.match(inner, /<span class="ect-carousel-card__desc">[^<]+<\/span>/);
    assert.match(inner, /<span class="ect-carousel-card__go" aria-hidden="true">/);
    assert.match(inner, /<span class="screen-reader-text"> \(se deschide într-o filă nouă\)<\/span>$/);
  }
  assert.doesNotMatch(section, /<dialog|<button[^>]*data-ect-card|ect-carousel-modal/);
});

test('every aria-labelledby points at an existing id', () => {
  const refs = [...section.matchAll(/aria-labelledby="([^"]+)"/g)].map(m => m[1]);
  assert.ok(refs.length >= 1);
  for (const id of refs) assert.ok(section.includes(`id="${id}"`), id);
});

test('images carry width, height and alt, and their files exist', () => {
  const imgs = [...section.matchAll(/<img\b[^>]*>/g)].map(m => m[0]);
  assert.equal(imgs.length, 10);
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

test('card videos are muted, inline and point at existing files', () => {
  const videos = [...section.matchAll(/<video\b[^>]*>[\s\S]*?<\/video>/g)].map(m => m[0]);
  assert.equal(videos.length, 9);
  for (const video of videos) {
    const open = video.match(/<video\b[^>]*>/)[0];
    assert.match(open, /\smuted(\s|>)/);
    assert.match(open, /\splaysinline(\s|>)/);
    assert.match(open, /preload="none"/);
    assert.doesNotMatch(open, /autoplay|poster=/);
    const sources = [...video.matchAll(/<source\b[^>]*\ssrc="([^"]+)"/g)].map(m => m[1]);
    assert.ok(sources.length > 0);
    for (const url of sources) assert.ok(existsSync(new URL(url.replace(/^\//, ''), root)), url);
  }
});

test('the section has no em dash, diagonal arrows or dead anchors', () => {
  assert.doesNotMatch(section, /[\u2014\u2196-\u2199]/);
  assert.doesNotMatch(section, /href="#"/);
});

test('the showcase scripts are loaded with defer and exist', () => {
  assert.match(html, /<script src="\/wp-content\/ect-pages\/home\/showcase\.js" defer><\/script>/);
  assert.match(html, /<script src="\/wp-content\/ect-pages\/home\/showcase-media\.js" defer><\/script>/);
  assert.ok(existsSync(new URL('wp-content/ect-pages/home/showcase-media.js', root)));
});

test('the showcase has no placeholders left and links open safely', () => {
  assert.doesNotMatch(section, /\[[^\]]*\]/);
  for (const [tag] of section.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) assert.match(tag, /rel="noopener noreferrer"/);
});
