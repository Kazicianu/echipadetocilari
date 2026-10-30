// The hero mascot Lottie (widget 0d2945c) ships with a static still of frame 0, so the widget
// reserves its height and paints the mascot before the Lottie JS runs.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const read = (p) => readFileSync(new URL(`../../${p}`, import.meta.url));
const html = read('legacy-mirror/index.html').toString('utf8');
const css = read('legacy-mirror/wp-content/ect-pages/home.css').toString('utf8');
const DIR = '/wp-content/ect-pages/home/';

function widget() {
  const start = html.indexOf('data-id="0d2945c"');
  assert.ok(start > 0, 'hero Lottie widget present');
  const end = html.indexOf('elementor-element-', start + 20);
  return html.slice(start, end > 0 ? end : undefined);
}

test('the hero Lottie widget holds exactly one poster image', () => {
  const w = widget();
  const imgs = w.match(/<img\b[^>]*\bect-lottie-poster\b[^>]*>/g) ?? [];
  assert.equal(imgs.length, 1);
  const img = imgs[0];
  assert.match(img, /width="640" height="640" alt=""/);
  assert.ok(img.includes(`srcset="${DIR}ect-mascot-poster-640.webp 640w, ${DIR}ect-mascot-poster-1024.webp 1024w"`));
  assert.ok(img.includes('sizes="(max-width: 767px) 88vw, (max-width: 1024px) 45vw, 506px"'));
  assert.match(w, /<div class="e-lottie__animation"><img class="ect-lottie-poster"/);
});

test('the second Lottie has no poster', () => {
  assert.equal((html.match(/ect-lottie-poster/g) ?? []).length, 1);
});

test('both poster files exist and are WebP', () => {
  for (const n of ['640', '1024']) {
    const buf = read(`legacy-mirror/wp-content/ect-pages/home/ect-mascot-poster-${n}.webp`);
    assert.equal(buf.subarray(0, 4).toString('latin1'), 'RIFF');
    assert.equal(buf.subarray(8, 12).toString('latin1'), 'WEBP');
  }
});

test('home.css overlays the Lottie on the poster and hides the poster once it has images', () => {
  assert.ok(css.includes('.elementor-element-0d2945c .e-lottie__animation { position: relative; }'));
  assert.ok(css.includes('.elementor-element-0d2945c .ect-lottie-poster { display: block; width: 100%; height: auto; }'));
  assert.ok(css.includes('.elementor-element-0d2945c .e-lottie__animation > svg { position: absolute; inset: 0; }'));
  assert.ok(css.includes('.elementor-element-0d2945c .e-lottie__animation:has(svg image) > .ect-lottie-poster { visibility: hidden; }'));
  assert.ok(css.includes('@supports not selector(:has(*)) { .elementor-element-0d2945c .ect-lottie-poster { visibility: hidden; } }'));
});
