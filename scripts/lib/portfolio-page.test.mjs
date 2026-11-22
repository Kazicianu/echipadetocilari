import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { portfolioDictionary } from '../i18n/portfolio.mjs';

const root = new URL('../../legacy-mirror/', import.meta.url);
const page = readFileSync(new URL('portofoliu/index.html', root), 'utf8');
const grid = page.match(/<div class="mb-grid">([\s\S]*?)<\/section>/)?.[1] ?? '';
const cards = [...grid.matchAll(/<article class="mb-card ([^"]*)">([\s\S]*?)<\/article>/g)].map(([, cls, inner]) => ({ cls, inner }));
const fileFor = url => new URL(url.replace(/^\//, ''), root);

test('the portfolio shows nine real projects in the approved order and widths', () => {
  assert.equal((grid.match(/<article\b/g) ?? []).length, 9);
  assert.deepEqual(cards.map(c => c.cls), ['mb-c2', 'mb-c1', 'mb-c1', 'mb-c2', 'mb-c2', 'mb-c1', 'mb-c1', 'mb-c2', 'mb-c2']);
  const names = cards.map(c => c.inner.match(/<a class="mb-link"[^>]*>([^<]*)</)?.[1]);
  assert.deepEqual(names, ['Torjai Productions', 'Funera', 'Zuzel', '2noi', 'Norwen', 'Tidora', 'Grovely', 'Mesa', 'Fernly']);
});

test('no placeholder, marquee or old button copy is left', () => {
  for (const gone of ['[Nume proiect', 'mb-marquee', 'Vezi proiectul', 'mb-ph', 'mb-veil']) {
    assert.ok(!page.includes(gone), `${gone} must not appear`);
  }
});

test('each card has one link that covers it, opens in a new tab and names the project', () => {
  for (const { inner } of cards) {
    const links = [...inner.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)];
    assert.equal(links.length, 1);
    const [, attrs, label] = links[0];
    assert.match(attrs, /class="mb-link"/);
    assert.match(attrs, /target="_blank"/);
    assert.match(attrs, /rel="[^"]*noopener[^"]*"/);
    assert.match(attrs, /href="https:\/\/[^"]+"/);
    assert.ok(label.includes('(se deschide într-o filă nouă)'));
  }
});

test('clips are muted, inline, not preloaded, without autoplay, and their sources exist', () => {
  const videos = [...grid.matchAll(/<video\b([^>]*)>([\s\S]*?)<\/video>/g)];
  assert.equal(videos.length, 8);
  for (const [, attrs, inner] of videos) {
    for (const attr of ['muted', 'playsinline', 'loop']) assert.match(attrs, new RegExp(`\\b${attr}\\b`));
    assert.match(attrs, /preload="none"/);
    assert.doesNotMatch(attrs, /autoplay|poster/);
    const sources = [...inner.matchAll(/<source\b([^>]*)>/g)].map(m => m[1]);
    if (sources.length === 1) {
      // Narrow (phone) cards play the phone clip at every width.
      assert.match(sources[0], /-mobil\.mp4"/);
    } else {
      assert.equal(sources.length, 2);
      assert.match(sources[0], /media="\(max-width: 1023px\)"/);
      assert.doesNotMatch(sources[1], /media=/);
    }
    for (const attrsSource of sources) {
      const src = attrsSource.match(/src="([^"]+)"/)?.[1];
      assert.ok(src && existsSync(fileFor(src)), `${src} exists`);
    }
  }
});

test('every still and preview image exists', () => {
  const urls = [...grid.matchAll(/(?:src|srcset)="(\/wp-content\/[^"]+)"/g)].map(m => m[1]);
  assert.ok(urls.length >= 10);
  for (const url of urls) assert.ok(existsSync(fileFor(url)), `${url} exists`);
});

test('the page script is included with defer', () => {
  assert.match(page, /<script defer src="\/wp-content\/ect-pages\/portofoliu\.js"><\/script>/);
  assert.ok(existsSync(new URL('wp-content/ect-pages/portofoliu.js', root)));
});

test('every Romanian key in the English dictionary appears in the page', () => {
  for (const [ro] of portfolioDictionary) assert.ok(page.includes(ro), `unused key: ${ro.slice(0, 50)}`);
});

test('cards carry no hover hint or hover button', () => {
  for (const gone of ['mb-go', 'Treci cu mouse-ul', '>Vezi site-ul<']) assert.ok(!grid.includes(gone), `${gone} must not appear`);
});

test('narrow cards show the phone version of the site in a phone frame', () => {
  for (const card of cards.filter(c => c.cls === 'mb-c1')) {
    assert.match(card.inner, /<div class="mb-shot mb-shot--phone mb-shot--[a-z0-9]+">/);
    assert.doesNotMatch(card.inner, /<source media=/);
    for (const [, src] of card.inner.matchAll(/\ssrc="([^"]+\.(?:webp|mp4))"/g)) assert.match(src, /-mobil\.(webp|mp4)$/);
  }
});
