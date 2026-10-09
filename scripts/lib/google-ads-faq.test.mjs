import test from 'node:test';
import assert from 'node:assert/strict';
import { extractGoogleAdsFaqs } from './google-ads-faq.mjs';
import { extractHomeFaqs } from './faq.mjs';
import { faqPage } from './schema.mjs';

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

test('homepage schema contains all six visible answers in their display order', () => {
  const questions = [
    'Ce este marketingul online și de ce ar trebui să îl folosesc?',
    'Cât timp durează până când voi vedea rezultate din serviciile de marketing online?',
    'Trebuie să măresc bugetul ca să meargă marketingul online?',
    'Cum aleg ce să facem împreună?',
    'Cum știu dacă treaba merge?',
    'Cum pot să încep să lucrez cu agenția voastră de marketing digital?',
  ];
  const html = `<details class="gads-faq-item"><summary>Unrelated page question?</summary><div class="gads-faq-answer">Ignore this.</div></details>` +
    questions.map((question, index) => `<details class="ect-home-faq__item" name="ect-home-faq">
      <summary><span class="ect-home-faq__question">${question}</span><span aria-hidden="true"><svg><title>Open answer</title></svg>+</span></summary>
      <div class="ect-home-faq__answer"><p>Răspuns ${index + 1}.</p><p>Detalii &amp; condiții.<br>Vezi <a href="/contact/">formularul</a>.</p></div>
    </details>`).join('');
  const schema = faqPage(extractHomeFaqs(html));
  assert.equal(schema.mainEntity.length, 6);
  assert.deepEqual(schema.mainEntity.map(item => item.name), questions);
  assert.deepEqual(schema.mainEntity.map(item => item.acceptedAnswer.text),
    questions.map((_, index) => `Răspuns ${index + 1}. Detalii & condiții. Vezi formularul.`));
});

test('homepage extraction follows English HTML and preserves numeric question text', () => {
  const html = `<details open class='ect-home-faq__item extra' name='ect-home-faq'>
    <summary><span class='ect-home-faq__question'>30</span><span> minutes to get started?</span><span aria-hidden='true'>+</span></summary>
    <div class='ect-home-faq__answer'><p>Send us your question using the <a href='/en/contact/'>contact form</a>.</p></div>
  </details>`;
  assert.deepEqual(extractHomeFaqs(html), [{
    q: '30 minutes to get started?',
    a: 'Send us your question using the contact form.',
  }]);
});

test('homepage schema fails when its visible accordions or answer copy are missing', () => {
  assert.throws(() => extractHomeFaqs('<details data-class="ect-home-faq__item"></details>'), /Homepage page is missing its visible FAQ/);
  assert.throws(() => extractHomeFaqs('<details class="ect-home-faq__item"><summary>Question?</summary></details>'), /missing its visible question or answer/);
  assert.throws(() => extractHomeFaqs('<details class="ect-home-faq__item"><summary><span aria-hidden="true">+</span></summary><div class="ect-home-faq__answer"><p>Answer.</p></div></details>'), /missing its visible question or answer/);
});
