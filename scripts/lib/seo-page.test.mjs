import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import { dictionary } from '../i18n/dictionary.mjs';
import { seoServicesDictionary } from '../i18n/seo-services.mjs';
import { roPageMeta } from '../i18n/meta-ro.mjs';

const read = file => readFileSync(new URL(`../../${file}`, import.meta.url), 'utf8');
const page = read('legacy-mirror/servicii-seo/index.html');
const css = read('legacy-mirror/wp-content/ect-pages/servicii-seo.css');
const main = page.match(/<main\b[\s\S]*<\/main>/i)?.[0] ?? '';
const text = markup => markup
  .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
  .replace(/<[^>]*>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();
const count = (haystack, pattern) => [...haystack.matchAll(pattern)].length;
const section = (labelledby, classes = 'seo-sec') => main.match(new RegExp(`<section class="${classes}"[^>]*aria-labelledby="${labelledby}">([\\s\\S]*?)</section>`))?.[1] ?? '';
const cards = () => [...main.matchAll(/<article class="seo-price\b[^"]*">([\s\S]*?)<\/article>/gi)].map(([, inner]) => inner);
const textNodes = markup => [...markup.matchAll(/>([^<>]*[A-Za-zĂÂÎȘȚăâîșț][^<>]*)</g)].map(([, node]) => node);
const englishKeys = () => new Set([...seoServicesDictionary, ...dictionary].map(([ro]) => ro));
// Texts that read the same in both languages (product names, acronyms, schema types).
const sameInEnglish = new Set([
  'SEO', 'AEO', 'GEO', 'Search Engine Optimization', 'Answer Engine Optimization', 'Generative Engine Optimization',
  'Googlebot', 'OAI-SearchBot', 'PerplexityBot · Claude-SearchBot', 'GPTBot · ClaudeBot', 'Local', 'Scale',
  'LocalBusiness, Service, FAQPage', 'ChatGPT', 'Gemini', 'Perplexity', 'Claude', 'Search Console', 'Google Analytics (GA4)',
  'Bing Webmaster Tools', 'Merchant Center', 'Google Ads', 'Facebook Ads',
]);
/** Same replacement the English build runs: longest phrase first, whole document. */
const toEnglish = html => [...seoServicesDictionary, ...dictionary]
  .filter(([from, to]) => from && from !== to)
  .sort((a, b) => b[0].length - a[0].length)
  .reduce((out, [from, to]) => out.split(from).join(to), html);

test('the page has one H1 with the approved wording', () => {
  const h1 = [...page.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
  assert.equal(h1.length, 1);
  assert.equal(text(h1[0][1]), 'Servicii SEO pentru Google și pentru răspunsurile AI');
  assert.ok(h1[0][1].includes('<span class="seo-chip">AI</span>'));
});

test('four price cards carry the approved names and monthly sums, the recommended one flagged', () => {
  const list = cards();
  assert.equal(list.length, 4);
  assert.deepEqual(list.map(card => text(card.match(/<h3 class="seo-price__name">([\s\S]*?)<\/h3>/)?.[1] ?? '')), ['Local', 'Creștere', 'Scale', 'Dominare']);
  assert.deepEqual(list.map(card => text(card.match(/<p class="seo-price__amt">([\s\S]*?)<\/p>/)?.[1] ?? '')), ['299 € / lună', '549 € / lună', 'de la 1.090 € / lună', 'de la 1.990 € / lună']);
  for (const card of list.slice(0, 2)) assert.match(card, /<p class="seo-price__amt">\d{3}&nbsp;€<small>\/ lună<\/small><\/p>/);
  for (const card of list.slice(2)) assert.match(card, /<p class="seo-price__amt"><span class="seo-price__from">de la<\/span> \d\.\d{3}&nbsp;€<small>\/ lună<\/small><\/p>/);
  assert.equal(count(main, /<article class="seo-price seo-price--hot">/g), 1);
  const hot = main.match(/<article class="seo-price seo-price--hot">([\s\S]*?)<\/article>/)?.[1] ?? '';
  assert.match(hot, /<h3 class="seo-price__name">Creștere<\/h3>/);
  assert.ok(hot.includes('<span class="seo-price__badge">Recomandat</span>'));
  assert.equal(count(main, /<article class="seo-price seo-price--ent">/g), 1);
  assert.equal(list.map(card => count(card, /<li>/g)).join(','), '5,6,6,6');
  assert.equal(count(main, /seo-price__plus/g), 0);
});

test('the table header, hero and FAQ repeat the card prices', () => {
  const heads = [...main.matchAll(/<th scope="col" data-p="[lcsd]"[^>]*>[^<]*<span>([^<]*)<\/span>/g)].map(([, s]) => text(s));
  assert.deepEqual(heads, ['299 € / lună', '549 € / lună', 'de la 1.090 € / lună', 'de la 1.990 € / lună']);
  assert.ok(text(main).includes('Patru pachete complete de la 299 € pe lună'));
  assert.ok(text(main).includes('Prețuri SEO: patru pachete complete, de la 299 € pe lună'));
  assert.ok(text(main).includes('Prețurile sunt finale, deoarece firma nu este plătitoare de TVA.'));
});

test('the Romanian title and description come from the page meta and name the entry price', () => {
  const { title, description } = roPageMeta['/servicii-seo/'];
  assert.equal(title, 'Servicii SEO și AI: de la 299 € | Echipa de Tocilari');
  assert.equal(description, 'Servicii SEO în București și în toată România, pentru Google și răspunsurile AI. Abonamente de la 299 €: local, național, magazin online și internațional.');
  assert.ok(title.length <= 60, `title has ${title.length} characters`);
  assert.match(description, /299 €/);
  assert.ok(page.includes(`<title>${title}</title>`));
  assert.ok(page.includes(`<meta name="description" content="${description}">`));
  assert.ok(page.includes(`<meta property="og:title" content="${title}">`));
  assert.ok(page.includes(`<meta property="og:description" content="${description}">`));
  assert.ok(page.includes(`<meta name="twitter:title" content="${title}">`));
  assert.ok(page.includes(`<meta name="twitter:description" content="${description}">`));
});

test('the head loads the page assets and drops the old inline styles', () => {
  assert.ok(page.includes('<link rel="stylesheet" href="/wp-content/ect-pages/servicii-seo.css">'));
  assert.ok(page.includes('<script defer src="/wp-content/ect-pages/servicii-seo.js"></script>'));
  assert.ok(page.includes('id="elementor-post-3381-css"'));
  assert.ok(!page.includes('elementor-post-4105-css'));
  assert.ok(!page.includes('.ect-seo-ai'));
  assert.ok(!main.includes('data-elementor-type'));
});

test('the sections follow the approved order, with the single orange band after the prices', () => {
  const ids = [...main.matchAll(/<section\b[^>]*aria-labelledby="([^"]+)"/g)].map(([, id]) => id);
  assert.deepEqual(ids, ['seo-h1', 'seo-lucrari-t', 'seo-ai-t', 'seo-preturi-t', 'seo-3luni-t', 'seo-rezultate-t', 'seo-dece-t', 'seo-intrebari-t']);
  assert.equal(count(main, /class="seo-band"/g), 1);
  const at = marker => main.indexOf(marker);
  assert.ok(at('id="seo-preturi-t"') < at('class="seo-band"') && at('class="seo-band"') < at('id="seo-3luni-t"'), 'the band sits between the prices and the work plan');
  assert.match(main, /<section class="seo-sec seo-sec--prices" id="preturi"/);
  assert.match(main, /<section class="seo-sec" id="ai"/);
  assert.match(main, /<section class="seo-sec seo-sec--faq ect-home-faq" id="intrebari"/);
});

test('the base block and its links are gone from the page and the stylesheet', () => {
  assert.doesNotMatch(main, /seo-base|id="inclus"|href="#inclus"|seo-price__plus/);
  assert.doesNotMatch(css, /seo-base|seo-price__plus/);
});

test('the AI section keeps the definitions and the crawler list, without assistant tabs', () => {
  const ai = section('seo-ai-t');
  assert.ok(ai.includes('class="seo-bot"'), 'the AI section is found');
  assert.equal(count(ai, /role="tab(?:list|panel)?"/g), 0);
  assert.equal(count(ai, /<li class="seo-def">/g), 3);
  assert.equal(count(main, /<div class="seo-bot">/g), 4);
  assert.equal(count(ai, /<p class="seo-google">/g), 1);
  assert.doesNotMatch(main, /class="seo-limit"/);
});

test('the six SEO types are plain tiles with a badge, a heading and a description', () => {
  const jobs = [...section('seo-lucrari-t').matchAll(/<li class="seo-job">([\s\S]*?)<\/li>/g)].map(([, inner]) => inner);
  assert.equal(jobs.length, 6);
  assert.deepEqual(jobs.map(job => text(job.match(/<h3 class="seo-job__t">([\s\S]*?)<\/h3>/)?.[1] ?? '')), [
    'SEO local',
    'SEO tehnic, direct în cod',
    'Conținut on-page, AEO și GEO',
    'SEO pentru magazine online și AI Shopping',
    'Autoritate, Digital PR și Search Everywhere',
    'SEO internațional, multilingv și programmatic',
  ]);
  assert.deepEqual(jobs.map(job => text(job.match(/<span class="seo-job__tag">([\s\S]*?)<\/span>/)?.[1] ?? '')), [
    'din Local',
    'din Local',
    'din Local',
    'din Creștere · complet în Scale',
    'din Creștere · complet în Scale',
    'în Dominare sau modul separat',
  ]);
  for (const job of jobs) {
    assert.match(job, /<span class="seo-job__ic">/);
    assert.match(job, /<p class="seo-job__s">[^<]{40,}<\/p>/);
  }
  assert.doesNotMatch(main, /seo-job__v|seo-job__vis/);
  assert.doesNotMatch(css, /seo-job__v\b|seo-job__vis/);
  assert.match(section('seo-lucrari-t'), /<a class="seo-link seo-jobs__more" href="#preturi">/);
});

test('the results section separates what we guarantee from what we measure', () => {
  const results = section('seo-rezultate-t', 'seo-sec seo-sec--s5');
  assert.equal(text(results.match(/<h2 class="seo-h2" id="seo-rezultate-t">([\s\S]*?)<\/h2>/)?.[1] ?? ''), 'Cum știi dacă SEO și vizibilitatea în AI funcționează');
  assert.deepEqual([...results.matchAll(/<h3 class="seo-res__hd">[\s\S]*?<b>([^<]+)<\/b>/g)].map(([, b]) => b), ['Garantăm', 'Măsurăm']);
  assert.ok(results.includes('<h4 class="seo-res-card__t">Lucrările și orele din pachet</h4>'));
  assert.deepEqual([...results.matchAll(/<h4 class="seo-res-also__t">([\s\S]*?)<\/h4>/g)].map(([, h]) => text(h)), ['Raport în fiecare lună', 'Doar metode acceptate de Google']);
  const done = [...(results.match(/<ul class="seo-res-done">([\s\S]*?)<\/ul>/)?.[1] ?? '').matchAll(/<li>([\s\S]*?)<\/li>/g)].map(([, li]) => text(li));
  assert.deepEqual(done, ['Pagini și articole publicate, cu link', 'Corecturi tehnice implementate în cod', 'Apariții editoriale confirmate', 'Verificare lunară pe prompturi AI']);
  const chain = results.match(/<ol class="seo-res-chain">([\s\S]*?)<\/ol>/)?.[1] ?? '';
  assert.deepEqual([...chain.matchAll(/<h4 class="seo-res-card__t">([\s\S]*?)<\/h4>/g)].map(([, h]) => text(h)), ['Vizibilitate în Google și pe hartă', 'Trafic calificat pe site', 'Cereri și vânzări']);
  assert.equal(count(chain, /<dt>Ce măsurăm<\/dt>/g), 3);
  assert.equal(count(chain, /<dt>Unde vezi<\/dt>/g), 3);
  assert.equal(count(chain, /<span class="seo-res-badge">cel mai important<\/span>/g), 1);
  assert.ok(results.includes('<h4 class="seo-res-card__t">Prezența în răspunsurile AI</h4>'));
  const accounts = results.match(/<ul class="seo-res-accts">([\s\S]*?)<\/ul>/)?.[1] ?? '';
  assert.equal(count(accounts, /<li>/g), 5);
  assert.match(results, /<a class="seo-link" href="https:\/\/developers\.google\.com\/search\/docs\/fundamentals\/do-i-need-seo">O spune chiar Google<\/a>/);
});

test('the old interactive report is gone from the page, its stylesheet and its script', () => {
  assert.doesNotMatch(main, /data-seo-key|class="seo-key|class="seo-doc|class="seo-dsec|class="seo-gl"|class="seo-h4"/);
  assert.doesNotMatch(css, /\.seo-(?:rep|keys|key|doc|dsec|gl|gcol|h4)\b/);
  const js = read('legacy-mirror/wp-content/ect-pages/servicii-seo.js');
  assert.doesNotMatch(js, /seo-key|seo-doc|seo-dsec/);
  assert.match(js, /data-seo-gpt/);
});

test('every text of the page has an English pair', () => {
  const keys = englishKeys();
  const nodes = textNodes(main);
  assert.ok(nodes.length > 400, `found ${nodes.length} text nodes`);
  for (const node of nodes) {
    if (sameInEnglish.has(node.trim())) continue;
    assert.ok(keys.has(`>${node}<`), `no English pair for ">${node}<"`);
  }
  for (const [, label] of main.matchAll(/((?:aria-label|data-on|data-off)="[^"]+")/g)) assert.ok(keys.has(label), `no English pair for ${label}`);
});

test('every text of the results section has an English pair', () => {
  const results = section('seo-rezultate-t', 'seo-sec seo-sec--s5');
  const keys = englishKeys();
  const nodes = textNodes(results);
  assert.ok(nodes.length > 40, `found ${nodes.length} text nodes`);
  for (const node of nodes) {
    if (sameInEnglish.has(node.trim())) continue;
    assert.ok(keys.has(`>${node}<`), `no English pair for ">${node}<"`);
  }
});

test('the English page keeps no Romanian letters and the same prices as the Romanian one', () => {
  const english = toEnglish(main);
  assert.deepEqual(textNodes(english).filter(node => /[ăâîșțĂÂÎȘȚ]/.test(node)), []);
  assert.doesNotMatch(english.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ''), /[ăâîșțĂÂÎȘȚ]/);
  const sums = (markup, pattern) => [...markup.matchAll(pattern)].map(([, sum]) => sum.replace(/[.,]/g, ''));
  const ro = sums(main, /(\d{1,3}(?:\.\d{3})?)(?:&nbsp;| )€/g);
  const en = sums(english, /€(\d{1,3}(?:,\d{3})?)/g);
  assert.ok(ro.length > 20, `found ${ro.length} prices`);
  assert.deepEqual(en, ro);
  assert.doesNotMatch(english, /—|[↖-↙]/);
  for (const sum of ['1,090', '1,990']) assert.ok(english.includes(`€${sum}`), `${sum} is formatted the English way`);
});

test('the GPTBot switch is a real switch and the other three are decorative', () => {
  const real = [...main.matchAll(/<button\b[^>]*role="switch"[^>]*>/gi)].map(([tag]) => tag);
  assert.equal(real.length, 1);
  assert.match(real[0], /data-seo-gpt/);
  assert.match(real[0], /data-on="permis, decizia ta"/);
  assert.match(real[0], /data-off="blocat, decizia ta"/);
  assert.equal(count(main, /<span class="seo-sw is-on" aria-hidden="true">/g), 3);
});

test('the FAQ has ten native accordion items sharing one name, the first open', () => {
  const items = [...main.matchAll(/<details class="ect-home-faq__item"([^>]*)>/gi)].map(([, attrs]) => attrs);
  assert.equal(items.length, 10);
  assert.equal(items.filter(attrs => /\sopen\b/.test(attrs)).length, 1);
  assert.match(items[0], /\sopen\b/);
  assert.equal(new Set(items.map(attrs => attrs.match(/name="([^"]+)"/)?.[1])).size, 1);
  assert.equal(items[0].match(/name="([^"]+)"/)?.[1], 'seo-faq');
  assert.match(main, /<div class="ect-home-faq__conversation" data-faq-panel data-fqp-target="\.ect-home-faq__answer">/);
  const answers = [...main.matchAll(/<div class="ect-home-faq__answer">([\s\S]*?)<\/div>/g)].map(([, inner]) => inner);
  assert.equal(answers.length, 10);
  for (const answer of answers) assert.ok(!/<div\b/i.test(answer), 'answers hold no div');
  assert.equal(count(main, /<span class="ect-home-faq__question">/g), 10);
});

test('no visible placeholders remain in the content', () => {
  assert.equal(count(main, /<span class="seo-todo">/g), 0);
  assert.doesNotMatch(main, /De completat|De confirmat|de completat|de confirmat/);
});

test('the only illustrative example is labelled as such', () => {
  assert.equal(count(main, /<em class="seo-ex">Exemplu ilustrativ<\/em>/g), 1);
  assert.equal(count(main, /Exemplu ilustrativ/g), 1);
  assert.equal(count(main, /<span>exemplu<\/span>/g), 0);
});

test('the content holds no images and no inline styles', () => {
  assert.doesNotMatch(main, /<img\b/i);
  assert.doesNotMatch(main, /\sstyle="/);
});

test('the contact form sits once between the content and the footer', () => {
  assert.equal(count(page, /id="formular_contact_bottom"/g), 1);
  assert.equal(count(page, /<form\b/g), 1);
  const mainEnd = page.indexOf('</main>');
  const form = page.indexOf('id="formular_contact_bottom"');
  const footer = page.search(/<footer\b/i);
  assert.ok(mainEnd > 0 && mainEnd < form && form < footer, 'main, then the contact, then the footer');
  assert.ok(page.includes('<div class="elementor elementor-3381 ect-shared-contact seo-contact">'));
  const labels = [...page.matchAll(/<label class="seo-flabel" for="(form-field-[^"]+)">/g)].map(([, id]) => id);
  assert.equal(labels.length, 5);
  for (const id of labels) assert.ok(page.includes(`id="${id}"`), `${id} is a field`);
  assert.doesNotMatch(page, /name="form_fields\[(?:site|url)/i);
  assert.ok(page.includes('id="seo-analiza-t"'));
});

test('the anchors used by the page exist exactly once', () => {
  for (const id of ['preturi', 'ai', 'intrebari', 'formular_contact_bottom']) {
    assert.equal(count(page, new RegExp(`\\sid="${id}"`, 'g')), 1, `#${id} exists once`);
  }
  const anchors = new Set([...main.matchAll(/href="#([^"]+)"/g)].map(([, id]) => id));
  assert.ok(anchors.has('preturi') && anchors.has('formular_contact_bottom'));
  for (const id of anchors) assert.equal(count(page, new RegExp(`\\sid="${id}"`, 'g')), 1, `#${id} target`);
});

test('the headings keep a clean order and the VAT sentence replaces the placeholder', () => {
  const levels = [...main.matchAll(/<h([1-6])\b/g)].map(([, level]) => Number(level));
  assert.equal(levels[0], 1);
  assert.equal(levels.filter(level => level === 1).length, 1);
  levels.forEach((level, i) => { if (i) assert.ok(level <= levels[i - 1] + 1, `heading ${i} jumps from h${levels[i - 1]} to h${level}`); });
  assert.equal(count(main, /<h3 class="seo-res__hd">/g), 2);
  assert.ok(main.includes('Prețurile afișate sunt finale (Echipa de Tocilari SRL nu este plătitoare de TVA).'));
});

test('the page shows no case-study placeholders and no illustrative results chart', () => {
  assert.doesNotMatch(main, /seo-cazuri-t|class="seo-case"|class="seo-chart"|class="seo-periods"/);
});

test('the why-us section gives three reasons and the fit filter in one section', () => {
  const why = section('seo-dece-t');
  assert.equal(count(why, /<li class="seo-def">/g), 3);
  assert.deepEqual([...why.matchAll(/<li class="seo-def"><b>(\d+)<\/b>/g)].map(([, n]) => n), ['01', '02', '03']);
  assert.equal(count(why, /<div class="seo-who">/g), 1);
  assert.equal(count(why, /<div class="seo-wc\b/g), 2);
  assert.equal(count(why, /<div class="seo-wc seo-wc--no">/g), 1);
  assert.deepEqual([...why.matchAll(/<div class="seo-wc[^"]*"><h3>[\s\S]*?<\/i>([^<]+)<\/h3>/g)].map(([, h3]) => h3), ['Potrivit dacă', 'Nu e potrivit dacă']);
  assert.ok(why.indexOf('class="seo-defs"') < why.indexOf('class="seo-who"'), 'the reasons come before the filter');
  assert.equal(count(main, /class="seo-who"/g), 1);
  for (const href of ['/creare-site-web/', '/creare-magazin-online/', '/administrare-site/', '/agentie-google-ads/', '/agentie-facebook-ads/']) assert.ok(why.includes(`href="${href}"`), `${href} is linked`);
  assert.match(css, /\.seo-defs \+ \.seo-who \{ margin-top: 28px; \}/);
  assert.match(css, /\.seo-defs \+ \.seo-who \{ margin-top: 36px; \}/);
});

test('the comparison table has fifteen rows of four plan cells in four groups, with a CSS-only plan picker', () => {
  const table = main.match(/<table class="seo-cmp__table"[^>]*>([\s\S]*?)<\/table>/)?.[1] ?? '';
  const body = table.match(/<tbody>([\s\S]*?)<\/tbody>/)?.[1] ?? '';
  const groups = [...body.matchAll(/<tr class="seo-cmp__grp"><th scope="colgroup" colspan="5">([^<]+)<\/th><\/tr>/g)].map(([, name]) => name);
  assert.deepEqual(groups, ['Arie și bază tehnică', 'Conținut și tipuri de SEO', 'Autoritate și Search Everywhere', 'Monitorizare AI, CRO și colaborare']);
  assert.equal(count(body, /<tr class="seo-cmp__grp"/g), 4);
  const rows = [...body.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map(([, row]) => row);
  assert.equal(rows.length, 15);
  for (const row of rows) {
    assert.deepEqual([...row.matchAll(/<td data-p="([lcsd])"/g)].map(([, plan]) => plan), ['l', 'c', 's', 'd']);
    assert.equal(count(row, /<th scope="row">/g), 1);
    assert.equal(count(row, /<td data-p="c" class="is-hot">/g), 1);
  }
  const perGroup = body.split(/<tr class="seo-cmp__grp"[^>]*>[\s\S]*?<\/tr>/).slice(1).map(chunk => count(chunk, /<tr>/g));
  assert.deepEqual(perGroup, [4, 5, 3, 3]);
  assert.equal(count(table, /<th scope="col" data-p="[lcsd]"/g), 4);
  assert.equal(count(table, /<thead>/g), 1);
  const radios = [...main.matchAll(/<input class="seo-cmp__r"[^>]*>/g)].map(([tag]) => tag);
  assert.equal(radios.length, 4);
  assert.deepEqual(radios.map(tag => tag.match(/id="([^"]+)"/)?.[1]), ['seo-cmp-l', 'seo-cmp-c', 'seo-cmp-s', 'seo-cmp-d']);
  for (const tag of radios) assert.match(tag, /type="radio" name="seo-cmp"/);
  assert.equal(radios.filter(tag => /\schecked\b/.test(tag)).length, 1);
  assert.match(radios.find(tag => /\schecked\b/.test(tag)) ?? '', /id="seo-cmp-c"/);
  for (const tag of radios) {
    const id = tag.match(/id="([^"]+)"/)?.[1];
    assert.ok(main.includes(`<label for="${id}">`), `${id} has a label`);
    assert.match(css, new RegExp(`#${id}:checked`), `${id} drives the picker in CSS`);
  }
  const seg = main.match(/<div class="seo-cmp__seg">([\s\S]*?)<\/div>/)?.[1] ?? '';
  assert.deepEqual([...seg.matchAll(/<label for="[^"]+">([^<]+)<\/label>/g)].map(([, label]) => label), ['Local', 'Creștere', 'Scale', 'Dominare']);
});

test('the comparison table header stays visible on desktop and the group rows span the table', () => {
  assert.match(css, /@media \(min-width: 1025px\) \{[\s\S]*?\.seo-cmp__table thead th, [^{]*\.seo-cmp__table thead td \{ position: sticky; top: 0; z-index: 2; background: #fff; \}/);
  assert.match(css, /\.seo-cmp__table tbody tr\.seo-cmp__grp th \{[^}]*\}/);
});

test('the extras list holds eight items, each with a fixed price', () => {
  const extras = main.match(/<ul class="seo-extras">([\s\S]*?)<\/ul>/)?.[1] ?? '';
  const items = [...extras.matchAll(/<li>([\s\S]*?)<\/li>/g)].map(([, item]) => item);
  assert.equal(items.length, 8);
  assert.deepEqual(items.map(item => text(item.match(/<span class="seo-extras__n">([\s\S]*?)<\/span>/)?.[1] ?? '')), [
    'Migrare SEO fără pierdere de trafic',
    'Sprint AEO/GEO și Entity Setup',
    'Setup SEO internațional (piață nouă)',
    'Locație suplimentară',
    'Pagină comercială optimizată în plus',
    'Articol documentat în plus',
    'Apariție editorială în plus',
    'Oră suplimentară tehnică sau consultanță SEO',
  ]);
  assert.deepEqual(items.map(item => text(item.match(/<span class="seo-extras__p">([\s\S]*?)<\/span>/)?.[1] ?? '')), ['de la 490 €', 'de la 690 €', 'de la 590 €', '119 € / lună', '89 €', '69 €', '79 €', '45 €']);
  for (const item of items) assert.match(item, /<span class="seo-extras__p">(?:de la )?\d+&nbsp;€/);
});

test('the terms state the minimum contract and the audit shows its price', () => {
  assert.ok(main.includes('Contractul minim este de 3 luni pentru Local și Creștere, respectiv 3-6 luni pentru Scale și Dominare; ulterior continuă lunar, cu preaviz de 30 de zile.'));
  assert.match(main, /<span class="seo-strip__amt">de la 299&nbsp;€<\/span>/);
  const notes = main.match(/<div class="seo-notes">([\s\S]*?)<\/section>/)?.[1] ?? '';
  assert.equal(count(main, /<div class="seo-notes">/g), 1);
  assert.equal(count(notes, /<div><b>/g), 3);
});

test('the page avoids em dashes, diagonal arrows and emoji', () => {
  const dictionaryText = seoServicesDictionary.flat().join('\n');
  for (const [name, source] of [['page content', main], ['stylesheet', css], ['English dictionary', dictionaryText]]) {
    assert.doesNotMatch(source, /—/, `${name} has no em dash`);
    assert.doesNotMatch(source, /[↖-↙]/, `${name} has no diagonal arrow`);
    assert.doesNotMatch(source, /\p{Extended_Pictographic}/u, `${name} has no emoji`);
  }
});

test('the orange stays exactly #fd8649', () => {
  assert.match(css, /#fd8649/i);
  assert.doesNotMatch(css, /#ad420f/i);
});

const attrOf = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1] ?? null;
const planSection = () => section('seo-3luni-t', 'seo-sec seo-sec--s4');

test('the work plan shows one phase at a time in real tabs, with every phase in the markup', () => {
  const plan = planSection();
  assert.equal(text(plan.match(/<h2 class="seo-h2" id="seo-3luni-t">([\s\S]*?)<\/h2>/)?.[1] ?? ''), 'Ce se întâmplă după ce începem');
  assert.doesNotMatch(plan, /<input\b|seo-gantt|seo-steps|seo-c2/);
  const lists = [...plan.matchAll(/<div\b[^>]*role="tablist"[^>]*>/g)].map(([tag]) => tag);
  assert.equal(lists.length, 1);
  assert.equal(attrOf(lists[0], 'aria-label'), 'Etapele planului de lucru');
  const tabs = [...plan.matchAll(/(<button\b[^>]*role="tab"[^>]*>)([\s\S]*?)<\/button>/g)].map(([, tag, inner]) => ({ tag, inner }));
  assert.equal(tabs.length, 3);
  assert.deepEqual(tabs.map(({ tag }) => attrOf(tag, 'type')), ['button', 'button', 'button']);
  assert.deepEqual(tabs.map(({ tag }) => attrOf(tag, 'aria-selected')), ['true', 'false', 'false']);
  assert.deepEqual(tabs.map(({ tag }) => attrOf(tag, 'tabindex')), ['0', '-1', '-1']);
  assert.deepEqual(tabs.map(({ inner }) => text(inner.match(/<span class="seo-phase-when">([\s\S]*?)<\/span>/)?.[1] ?? '')), ['Luna 1', 'Lunile 2-3', 'De la luna 4']);
  assert.deepEqual(tabs.map(({ inner }) => text(inner.match(/<span class="seo-phase-t">([\s\S]*?)<\/span>/)?.[1] ?? '')), ['Audit și reparații', 'Implementare și semnale', 'Scalare după cifre']);
  // The months strip and the contract pill repeat the phase, so the tab hides them from screen readers.
  assert.equal(count(plan, /class="seo-phase-x"/g), 6);
  assert.equal(count(plan, /<span class="seo-phase-x" aria-hidden="true">/g), 6);
  const panels = [...plan.matchAll(/<div\b[^>]*role="tabpanel"[^>]*>/g)].map(([tag]) => tag);
  assert.equal(panels.length, 3);
  tabs.forEach(({ tag }, i) => {
    const panel = panels.find(candidate => attrOf(candidate, 'id') === attrOf(tag, 'aria-controls'));
    assert.ok(panel, `tab ${i + 1} controls a panel`);
    assert.equal(attrOf(panel, 'aria-labelledby'), attrOf(tag, 'id'));
    assert.equal(attrOf(panel, 'tabindex'), '0');
    assert.equal(/\shidden\b/.test(panel), i > 0, 'only the first phase starts visible');
  });
  assert.deepEqual([...plan.matchAll(/<h3 class="seo-phase-h3">([^<]+)<\/h3>/g)].map(([, h3]) => h3), ['Audit și reparații', 'Implementare și semnale', 'Scalare după cifre']);
  const bodies = plan.split(/<div\b[^>]*role="tabpanel"[^>]*>/).slice(1);
  assert.equal(bodies.length, 3);
  for (const body of bodies) {
    assert.deepEqual([...body.matchAll(/<h4 class="seo-phase-lt">[\s\S]*?<span>([^<]+)<\/span><\/h4>/g)].map(([, h4]) => h4), ['Ce facem noi', 'Ce faci tu', 'Ce vezi tu']);
  }
  // What the client does is plain text with a frequency chip, never a checkbox.
  const chips = [...plan.matchAll(/<span class="seo-phase-freq">[\s\S]*?<span class="seo-sr">Când: <\/span>([^<]+)<\/span>/g)].map(([, chip]) => chip);
  assert.deepEqual(chips, ['o dată', 'o discuție', 'în 5 zile lucrătoare', 'când ai ocazia', 'lunar', 'lunar']);
  assert.equal(count(plan, /<span class="seo-phase-pill">Pornire · Luna 1<\/span>/g), 2);
  assert.equal(count(plan, /<span class="seo-phase-pill">Consolidare · Lunile 2-3<\/span>/g), 2);
  assert.equal(count(plan, /<span class="seo-phase-pill seo-phase-pill--next">Apoi lunar · preaviz de 30 de zile<\/span>/g), 2);
  assert.ok(text(plan).includes('Ordinea etapelor este aceeași în toate cele 4 pachete.'));
  assert.ok(text(plan).includes('3 luni la Local și Creștere, 3-6 luni la Scale și Dominare'));
});

test('every text of the work plan has an English pair', () => {
  const plan = planSection();
  const keys = englishKeys();
  const nodes = textNodes(plan);
  assert.ok(nodes.length > 60, `found ${nodes.length} text nodes`);
  for (const node of nodes) assert.ok(keys.has(`>${node}<`), `no English pair for ">${node}<"`);
  for (const [, label] of plan.matchAll(/aria-label="([^"]+)"/g)) assert.ok(keys.has(`aria-label="${label}"`), `no English pair for aria-label="${label}"`);
});

test('the stylesheet drops the old roadmap and keeps every phase readable without scripting', () => {
  const css = read('legacy-mirror/wp-content/ect-pages/servicii-seo.css');
  assert.doesNotMatch(css, /\.seo-(?:gantt|track|bar|steps|step|two)(?![a-z])/);
  assert.doesNotMatch(css, /seo-c2/);
  assert.match(css, /\.seo-phase-panel\[hidden\] \{ display: none; \}/);
  assert.match(css, /\.seo-phase-tab\[aria-selected="true"\]/);
  // The frequency chips are small text on white: dark text, only the clock stays orange (#ff6c2a on white is 2.83:1).
  assert.match(css, /\.seo-phase-freq \{[^}]*color: var\(--k\); \}/);
  assert.match(css, /\.seo-phase-freq svg \{[^}]*color: var\(--o2\); \}/);
  const fallback = css.match(/@media \(scripting: none\) \{([\s\S]*?)\n\}/)?.[1] ?? '';
  assert.match(fallback, /\.seo-phase-tabs \{ display: none; \}/);
  assert.match(fallback, /\.seo-phase-panel\[hidden\] \{ display: flex;[^}]*visibility: visible;/);
});

test('the plan tabs switch phases on click and with the keyboard, like WAI-ARIA tabs', () => {
  const js = read('legacy-mirror/wp-content/ect-pages/servicii-seo.js');
  const doc = { activeElement: null };
  class Node {
    constructor(attributes = {}) {
      this.attributes = new Map(Object.entries(attributes));
      this.listeners = new Map();
      this.hidden = false;
      this.tabIndex = 0;
    }
    setAttribute(name, value) { this.attributes.set(name, String(value)); }
    getAttribute(name) { return this.attributes.has(name) ? this.attributes.get(name) : null; }
    addEventListener(type, callback) {
      if (!this.listeners.has(type)) this.listeners.set(type, []);
      this.listeners.get(type).push(callback);
    }
    emit(type, properties = {}) {
      const event = { defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, ...properties };
      for (const callback of this.listeners.get(type) || []) callback(event);
      return event;
    }
    focus() { doc.activeElement = this; }
  }
  const tabs = [1, 2, 3].map(n => new Node({ role: 'tab', 'aria-controls': `p${n}`, 'aria-selected': String(n === 1) }));
  const panels = new Map([1, 2, 3].map(n => [`p${n}`, Object.assign(new Node({ role: 'tabpanel' }), { hidden: n !== 1 })]));
  const tablist = new Node({ role: 'tablist' });
  tablist.querySelectorAll = selector => (selector === '[role="tab"]' ? tabs : []);
  const page = new Node();
  page.querySelector = selector => (selector === '[data-seo-tabs] [role="tablist"]' ? tablist : null);
  const column = { matches: false, listeners: [], addEventListener(type, callback) { if (type === 'change') this.listeners.push(callback); } };
  doc.querySelector = selector => (selector === '.ect-page--servicii-seo' ? page : null);
  doc.getElementById = id => panels.get(id) ?? null;
  vm.runInNewContext(js, { document: doc, window: { matchMedia: query => (query === '(min-width: 1025px)' ? column : { matches: false }) } }, { filename: 'servicii-seo.js' });

  const state = () => [
    tabs.map(tab => (tab.getAttribute('aria-selected') === 'true' ? 1 : 0)).join(''),
    [...panels.values()].map(panel => (panel.hidden ? 0 : 1)).join(''),
    tabs.map(tab => tab.tabIndex).join(','),
  ].join('|');
  const first = '100|100|0,-1,-1';
  const third = '001|001|-1,-1,0';
  assert.equal(tablist.getAttribute('aria-orientation'), 'horizontal');
  assert.equal(state(), first);
  tabs[2].emit('click');
  assert.equal(state(), third);
  assert.ok(tabs[2].emit('keydown', { key: 'ArrowRight' }).defaultPrevented);
  assert.equal(state(), first, 'the right arrow wraps to the first phase');
  assert.equal(doc.activeElement, tabs[0]);
  tabs[0].emit('keydown', { key: 'ArrowLeft' });
  assert.equal(state(), third, 'the left arrow wraps to the last phase');
  tabs[2].emit('keydown', { key: 'Home' });
  assert.equal(state(), first);
  tabs[0].emit('keydown', { key: 'End' });
  assert.equal(state(), third);
  assert.equal(tabs[2].emit('keydown', { key: 'ArrowDown' }).defaultPrevented, false, 'in a row of tabs the down arrow still scrolls the page');
  assert.equal(state(), third);
  column.matches = true;
  column.listeners.forEach(callback => callback());
  assert.equal(tablist.getAttribute('aria-orientation'), 'vertical');
  tabs[2].emit('keydown', { key: 'ArrowDown' });
  assert.equal(state(), first, 'in a column of tabs the down arrow moves on');
  tabs[0].emit('keydown', { key: 'ArrowUp' });
  assert.equal(state(), third);
  assert.equal(tabs[2].emit('keydown', { key: 'Enter' }).defaultPrevented, false);
});
