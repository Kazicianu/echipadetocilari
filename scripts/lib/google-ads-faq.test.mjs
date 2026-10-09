import test from 'node:test';
import assert from 'node:assert/strict';
import { extractGoogleAdsFaqs } from './google-ads-faq.mjs';

test('FAQ copy excludes accordion numbering and icons while preserving link text and punctuation', () => {
  const html = `<details class="other"><summary>Ignore this</summary><p>Unrelated answer</p></details>
  <details open class="gads-faq-item highlighted" name="gads-faq">
    <summary><span>01</span><span>Cât costă <strong>serviciile Google Ads</strong>?</span>
      <span class="gads-faq-plus" aria-hidden="true"><svg><title>Open answer</title></svg>+</span>
    </summary>
    <div style="margin:0" class="gads-faq-answer"><p>Bugetul este separat. Vezi <a href="/servicii-seo/">serviciile SEO</a>.</p></div>
  </details>`;
  assert.deepEqual(extractGoogleAdsFaqs(html), [{
    q: 'Cât costă serviciile Google Ads?',
    a: 'Bugetul este separat. Vezi serviciile SEO.',
  }]);
});

test('answers decode entities once and keep paragraphs and line breaks readable', () => {
  const html = `<details class='gads-faq-item'><summary><span>02</span><span>Cost &amp; buget?</span></summary>
    <div class='gads-faq-answer'><p>99&nbsp;&euro; &#47; lună.</p><p>„Search” &amp; SEO.<br>Valoare &#x20ac; și &amp;lt;.</p></div></details>`;
  assert.deepEqual(extractGoogleAdsFaqs(html), [{
    q: 'Cost & buget?',
    a: '99 € / lună. „Search” & SEO. Valoare € și &lt;.',
  }]);
});

test('translated HTML supplies translated schema copy in the same FAQ order', () => {
  const html = `<details class="gads-faq-item"><summary><span>01</span><span>Does Google Ads replace SEO?</span><span aria-hidden="true">+</span></summary>
    <div class="gads-faq-answer"><p>No. See our <a href="/en/seo-services/">SEO services</a>.</p></div></details>
    <details class="gads-faq-item"><summary><span>02</span><span>Can you take over an existing account?</span></summary>
    <div class="gads-faq-answer"><p>Yes. We review access first.</p></div></details>`;
  assert.deepEqual(extractGoogleAdsFaqs(html), [
    { q: 'Does Google Ads replace SEO?', a: 'No. See our SEO services.' },
    { q: 'Can you take over an existing account?', a: 'Yes. We review access first.' },
  ]);
});

test('missing or incomplete visible FAQ copy fails instead of emitting misleading schema', () => {
  assert.throws(() => extractGoogleAdsFaqs('<details data-class="gads-faq-item"></details>'), /missing its visible FAQ/);
  assert.throws(() => extractGoogleAdsFaqs('<details class="gads-faq-item"><summary>Question?</summary></details>'), /missing its visible question or answer/);
  assert.throws(() => extractGoogleAdsFaqs('<details class="gads-faq-item"><summary><span>01</span><span aria-hidden="true">+</span></summary><div class="gads-faq-answer"><p>Answer.</p></div></details>'), /missing its visible question or answer/);
});
