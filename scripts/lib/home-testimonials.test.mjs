import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { dictionary } from '../i18n/dictionary.mjs';

const root = new URL('../../legacy-mirror/', import.meta.url);
const html = readFileSync(new URL('index.html', root), 'utf8');
const start = html.indexOf('<section class="ect-quotes"');
const end = html.indexOf('</section>', start) + '</section>'.length;
const section = html.slice(start, end);

test('the testimonials are one section between the contact band and the FAQ', () => {
  assert.equal(html.split('<section class="ect-quotes"').length, 2);
  assert.ok(start > html.indexOf('Vorbește cu Echipa de Tocilari'), 'after the contact band');
  assert.ok(end < html.indexOf('<section class="ect-home-faq"'), 'before the FAQ');
});

test('the old Elementor carousel is gone', () => {
  assert.doesNotMatch(html, /elementor-widget-testimonial-carousel/);
  assert.doesNotMatch(html, /elementor-element-56f8a085/);
  assert.doesNotMatch(html, /widget-testimonial-carousel-css/);
});

test('three quote cards with blockquote, caption and a hidden avatar', () => {
  const cards = [...section.matchAll(/<figure class="ect-quotes__card">[\s\S]*?<\/figure>/g)].map(m => m[0]);
  assert.equal(cards.length, 3);
  for (const card of cards) {
    assert.match(card, /<blockquote\b/);
    assert.match(card, /<figcaption\b/);
    assert.match(card, /class="ect-quotes__avatar" aria-hidden="true"/);
  }
  for (const name of ['VetGO', 'Restaurant Conacu', 'Hostel Victoria']) {
    assert.ok(section.includes(name), name);
  }
});

test('every quote and card title has an English dictionary entry', () => {
  const sources = new Set(dictionary.map(pair => pair[0]));
  const quotes = [...section.matchAll(/<blockquote[^>]*><p>([^<]+)<\/p><\/blockquote>/g)].map(m => m[1]);
  assert.equal(quotes.length, 3);
  for (const quote of quotes) assert.ok(sources.has(quote), quote.slice(0, 40));
  const titles = [...section.matchAll(/<h3 class="ect-quotes__card-title">([^<]+)<\/h3>/g)].map(m => m[1]);
  assert.equal(titles.length, 3);
  for (const title of titles) assert.ok(sources.has(`>${title}<`), title);
});

test('accessibility hooks are in place', () => {
  const svgs = [...section.matchAll(/<svg\b[^>]*>/g)].map(m => m[0]);
  assert.ok(svgs.length >= 5);
  for (const svg of svgs) assert.match(svg, /aria-hidden="true"/);
  const labelled = section.match(/aria-labelledby="([^"]+)"/);
  assert.ok(labelled);
  assert.ok(section.includes(`id="${labelled[1]}"`));
  const toggle = section.match(/<button[^>]*data-ect-quotes-toggle[^>]*>/)[0];
  assert.match(toggle, /aria-pressed="false"/);
  assert.match(toggle, /\shidden[\s>]/);
});

test('the section has no em dash, diagonal arrows or dead anchors', () => {
  assert.doesNotMatch(section, /[—↖-↙]/);
  assert.doesNotMatch(section, /href="#"/);
});

test('the testimonials script is loaded with defer', () => {
  assert.match(html, /<script src="\/wp-content\/ect-pages\/home\/testimonials\.js" defer><\/script>/);
});
