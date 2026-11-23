import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import { dictionary } from '../i18n/dictionary.mjs';
import { seoServicesDictionary } from '../i18n/seo-services.mjs';
import { roPageMeta } from '../i18n/meta-ro.mjs';

const read = file => readFileSync(new URL(`../../${file}`, import.meta.url), 'utf8');
const page = read('legacy-mirror/servicii-seo/index.html');
const main = page.match(/<main\b[\s\S]*<\/main>/i)?.[0] ?? '';
const text = markup => markup
  .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
  .replace(/<[^>]*>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();
const count = (haystack, pattern) => [...haystack.matchAll(pattern)].length;

test('the page has one H1 with the approved wording', () => {
  const h1 = [...page.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
  assert.equal(h1.length, 1);
  assert.equal(text(h1[0][1]), 'Servicii SEO pentru Google și pentru răspunsurile AI');
  assert.ok(h1[0][1].includes('<span class="seo-chip">AI</span>'));
});

test('four price cards carry the approved names and monthly sums, the recommended one flagged', () => {
  const cards = [...main.matchAll(/<article class="seo-price\b[^"]*">([\s\S]*?)<\/article>/gi)].map(([, inner]) => inner);
  assert.equal(cards.length, 4);
  assert.deepEqual(cards.map(card => text(card.match(/<h3 class="seo-price__name">([\s\S]*?)<\/h3>/)?.[1] ?? '')), ['Local', 'Creștere', 'Avansat', 'Premium']);
  assert.deepEqual(cards.map(card => text(card.match(/<p class="seo-price__amt">([\s\S]*?)<\/p>/)?.[1] ?? '')), ['299 € / lună', '499 € / lună', '749 € / lună', '1.190 € / lună']);
  for (const card of cards) assert.match(card, /<p class="seo-price__amt">\d{1,3}(?:\.\d{3})?&nbsp;€<small>\/ lună<\/small><\/p>/);
  assert.equal(count(main, /<article class="seo-price seo-price--hot">/g), 1);
  const hot = main.match(/<article class="seo-price seo-price--hot">([\s\S]*?)<\/article>/)?.[1] ?? '';
  assert.match(hot, /<h3 class="seo-price__name">Creștere<\/h3>/);
  assert.ok(hot.includes('<span class="seo-price__badge">Recomandat</span>'));
});

test('the table header, hero and FAQ repeat the card prices', () => {
  const heads = [...main.matchAll(/<th scope="col" data-p="[lcap]"[^>]*>[^<]*<span>([^<]*)<\/span>/g)].map(([, s]) => text(s));
  assert.deepEqual(heads, ['299 € / lună', '499 € / lună', '749 € / lună', '1.190 € / lună']);
  assert.ok(text(main).includes('Abonament lunar de la 299 €, cu raport în fiecare lună.'));
  assert.ok(text(main).includes('Abonamentele lunare costă 299 €, 499 €, 749 € sau 1.190 €, în funcție de pachet.'));
});

test('the Romanian title and description come from the page meta and name the entry price', () => {
  const { title, description } = roPageMeta['/servicii-seo/'];
  assert.ok(title.length <= 60, `title has ${title.length} characters`);
  assert.match(description, /299 €/);
  assert.ok(page.includes(`<title>${title}</title>`));
  assert.ok(page.includes(`<meta name="description" content="${description}">`));
  assert.ok(page.includes(`<meta property="og:title" content="${title}">`));
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

test('the AI section keeps the definitions and the crawler list, without assistant tabs', () => {
  const ai = main.match(/<section class="seo-sec" id="ai" aria-labelledby="seo-ai-t">([\s\S]*?)<\/section>/)?.[1] ?? '';
  assert.ok(ai.includes('class="seo-bot"'), 'the AI section is found');
  assert.equal(count(ai, /role="tab(?:list|panel)?"/g), 0);
  assert.equal(count(main, /<li class="seo-def">/g), 6);
  assert.equal(count(main, /<div class="seo-bot">/g), 4);
  assert.doesNotMatch(main, /class="seo-limit"/);
});

test('the six monthly jobs are tiles with a heading, a Growth quantity and a decorative example', () => {
  const section = main.match(/<section class="seo-sec" aria-labelledby="seo-lucrari-t">([\s\S]*?)<\/section>/)?.[1] ?? '';
  const jobs = [...section.matchAll(/<li class="seo-job">([\s\S]*?)<\/li>/g)].map(([, inner]) => inner);
  assert.equal(jobs.length, 6);
  assert.deepEqual(jobs.map(job => text(job.match(/<h3 class="seo-job__t">([\s\S]*?)<\/h3>/)?.[1] ?? '')), ['SEO tehnic', 'Conținut', 'SEO local', 'Autoritate', 'Vizibilitate în AI', 'Raport lunar']);
  assert.deepEqual(jobs.map(job => text(job.match(/<p class="seo-job__v">([\s\S]*?)<\/p>/)?.[1] ?? '')), ['4 verificări', '1 + 2 pagină + articole', '1 profil Google', '1 apariție', '3 asistenți', '1 raport']);
  for (const job of jobs) assert.match(job, /<div class="seo-job__vis" aria-hidden="true">/);
  assert.doesNotMatch(main, /<details class="seo-row"|class="seo-bento"/);
  assert.match(section, /<a class="seo-link seo-jobs__more" href="#preturi">/);
  const hot = main.match(/<article class="seo-price seo-price--hot">([\s\S]*?)<\/article>/)?.[1] ?? '';
  assert.ok(hot.includes('<li>3 texte noi pe lună: 1 pagină și 2 articole</li>'));
  assert.ok(hot.includes('<li>1 apariție pe lună pe un site din domeniul tău</li>'));
});

test('the results section separates what we guarantee from what we measure', () => {
  const section = main.match(/<section class="seo-sec seo-sec--s5" aria-labelledby="seo-rezultate-t">([\s\S]*?)<\/section>/)?.[1] ?? '';
  assert.equal(text(section.match(/<h2 class="seo-h2" id="seo-rezultate-t">([\s\S]*?)<\/h2>/)?.[1] ?? ''), 'Cum știi dacă SEO-ul funcționează');
  assert.deepEqual([...section.matchAll(/<h3 class="seo-res__hd">[\s\S]*?<b>([^<]+)<\/b>/g)].map(([, b]) => b), ['Garantăm', 'Măsurăm']);
  // The three guarantees are the ones the FAQ promises.
  assert.ok(section.includes('<h4 class="seo-res-card__t">Lucrările din pachet</h4>'));
  assert.deepEqual([...section.matchAll(/<h4 class="seo-res-also__t">([\s\S]*?)<\/h4>/g)].map(([, h]) => text(h)), ['Raport în fiecare lună', 'Doar metode acceptate de Google']);
  assert.ok(text(main).includes('Garantăm lucrările din pachet, raportul lunar și metode acceptate de Google.'));
  // The checklist repeats the Growth card.
  const done = [...(section.match(/<ul class="seo-res-done">([\s\S]*?)<\/ul>/)?.[1] ?? '').matchAll(/<li>([\s\S]*?)<\/li>/g)].map(([, li]) => text(li));
  assert.deepEqual(done, ['1 pagină publicată', '2 articole publicate', '1 apariție nouă', 'Corecturi: până la 2 ore']);
  const hot = main.match(/<article class="seo-price seo-price--hot">([\s\S]*?)<\/article>/)?.[1] ?? '';
  assert.ok(hot.includes('<li>3 texte noi pe lună: 1 pagină și 2 articole</li>'));
  assert.ok(hot.includes('<li>1 apariție pe lună pe un site din domeniul tău</li>'));
  assert.ok(hot.includes('<li>Corecturi tehnice până la 2 ore pe lună</li>'));
  // Three measured steps, each saying what we measure and where you see it.
  const chain = section.match(/<ol class="seo-res-chain">([\s\S]*?)<\/ol>/)?.[1] ?? '';
  assert.deepEqual([...chain.matchAll(/<h4 class="seo-res-card__t">([\s\S]*?)<\/h4>/g)].map(([, h]) => text(h)), ['Google te arată', 'Oamenii intră pe site', 'Te contactează']);
  assert.equal(count(chain, /<dt>Ce măsurăm<\/dt>/g), 3);
  assert.equal(count(chain, /<dt>Unde vezi<\/dt>/g), 3);
  assert.equal(count(chain, /<span class="seo-res-badge">cel mai important<\/span>/g), 1);
  // The AI card counts the questions of the four plans.
  assert.ok(section.includes('<h4 class="seo-res-card__t">Apari în răspunsurile AI</h4>'));
  assert.ok(section.includes('Verificăm noi 10, 20, 30 sau 50 de întrebări, după pachet.'));
  assert.match(section, /<a class="seo-link" href="https:\/\/developers\.google\.com\/search\/docs\/fundamentals\/do-i-need-seo">O spune chiar Google<\/a>/);
});

test('the old interactive report is gone from the page, its stylesheet and its script', () => {
  assert.doesNotMatch(main, /data-seo-key|class="seo-key|class="seo-doc|class="seo-dsec|class="seo-gl"|class="seo-h4"/);
  const css = read('legacy-mirror/wp-content/ect-pages/servicii-seo.css');
  assert.doesNotMatch(css, /\.seo-(?:rep|keys|key|doc|dsec|gl|gcol|h4)\b/);
  const js = read('legacy-mirror/wp-content/ect-pages/servicii-seo.js');
  assert.doesNotMatch(js, /seo-key|seo-doc|seo-dsec/);
  assert.match(js, /data-seo-gpt/);
});

test('every text of the results section has an English pair', () => {
  const section = main.match(/<section class="seo-sec seo-sec--s5" aria-labelledby="seo-rezultate-t">([\s\S]*?)<\/section>/)?.[1] ?? '';
  const keys = new Set([...seoServicesDictionary, ...dictionary].map(([ro]) => ro));
  const same = new Set(['Search Console', 'Google Analytics', 'ChatGPT', 'Gemini', 'Perplexity']);
  const nodes = [...section.matchAll(/>([^<>]*[A-Za-zĂÂÎȘȚăâîșț][^<>]*)</g)].map(([, node]) => node);
  assert.ok(nodes.length > 40, `found ${nodes.length} text nodes`);
  for (const node of nodes) {
    if (same.has(node.trim())) continue;
    assert.ok(keys.has(`>${node}<`), `no English pair for ">${node}<"`);
  }
});

test('the GPTBot switch is a real switch and the other three are decorative', () => {
  const real = [...main.matchAll(/<button\b[^>]*role="switch"[^>]*>/gi)].map(([tag]) => tag);
  assert.equal(real.length, 1);
  assert.match(real[0], /data-seo-gpt/);
  assert.match(real[0], /data-on="permis, decizia ta"/);
  assert.match(real[0], /data-off="blocat, decizia ta"/);
  assert.equal(count(main, /<span class="seo-sw is-on" aria-hidden="true">/g), 3);
});

test('the FAQ has eleven native accordion items sharing one name, the first open', () => {
  const items = [...main.matchAll(/<details class="ect-home-faq__item"([^>]*)>/gi)].map(([, attrs]) => attrs);
  assert.equal(items.length, 11);
  assert.equal(items.filter(attrs => /\sopen\b/.test(attrs)).length, 1);
  assert.match(items[0], /\sopen\b/);
  assert.equal(new Set(items.map(attrs => attrs.match(/name="([^"]+)"/)?.[1])).size, 1);
  assert.match(main, /<div class="ect-home-faq__conversation" data-faq-panel data-fqp-target="\.ect-home-faq__answer">/);
  assert.ok(!/<div\b/i.test(main.match(/<div class="ect-home-faq__answer">([\s\S]*?)<\/div>/)?.[1] ?? ''), 'answers hold no div');
});

test('no visible placeholders remain in the content', () => {
  assert.equal(count(main, /<span class="seo-todo">/g), 0);
  assert.doesNotMatch(main, /De completat|De confirmat|de completat|de confirmat/);
});

test('every illustrative example is labelled as such', () => {
  assert.equal(count(main, /<em class="seo-ex">Exemplu ilustrativ<\/em>/g), 1);
  assert.equal(count(main, /Exemplu ilustrativ/g), 1);
  assert.equal(count(main, /<span>exemplu<\/span>/g), 3);
  assert.ok(main.includes('Datele din grafice sunt exemple.'));
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
});

test('the anchors used by the page exist exactly once', () => {
  for (const id of ['preturi', 'ai', 'intrebari', 'formular_contact_bottom']) {
    assert.equal(count(page, new RegExp(`\\sid="${id}"`, 'g')), 1, `#${id} exists once`);
  }
  const anchors = new Set([...main.matchAll(/href="#([^"]+)"/g)].map(([, id]) => id));
  for (const id of anchors) assert.equal(count(page, new RegExp(`\\sid="${id}"`, 'g')), 1, `#${id} target`);
});

test('the headings keep a clean order and the VAT sentence replaces the placeholder', () => {
  const levels = [...main.matchAll(/<h([1-6])\b/g)].map(([, level]) => Number(level));
  assert.equal(levels[0], 1);
  levels.forEach((level, i) => { if (i) assert.ok(level <= levels[i - 1] + 1, `heading ${i} jumps from h${levels[i - 1]} to h${level}`); });
  assert.equal(count(main, /<h3 class="seo-res__hd">/g), 2);
  assert.ok(main.includes('Prețurile afișate sunt finale (Echipa de Tocilari SRL nu este plătitoare de TVA).'));
});

test('the sections follow the approved order', () => {
  const ids = [...main.matchAll(/<section\b[^>]*aria-labelledby="([^"]+)"/g)].map(([, id]) => id);
  assert.deepEqual(ids, ['seo-h1', 'seo-potrivit-t', 'seo-lucrari-t', 'seo-dece-t', 'seo-ai-t', 'seo-3luni-t', 'seo-rezultate-t', 'seo-preturi-t', 'seo-intrebari-t']);
});

test('the page shows no case-study placeholders and no illustrative results chart', () => {
  assert.doesNotMatch(main, /seo-cazuri-t|class="seo-case"|class="seo-chart"|class="seo-periods"/);
});

test('the why-us section gives three reasons and links the related services', () => {
  const why = main.match(/<section class="seo-sec" aria-labelledby="seo-dece-t">([\s\S]*?)<\/section>/)?.[1] ?? '';
  assert.equal(count(why, /<li class="seo-def">/g), 3);
  assert.ok(why.includes('href="/creare-site-web/"'));
  assert.ok(why.includes('href="/agentie-google-ads/"'));
});

test('every plan includes the shared groundwork promised in the monthly jobs', () => {
  const base = main.match(/<div class="seo-pblock" id="inclus">([\s\S]*?)<\/ul>/)?.[1] ?? '';
  assert.equal(count(base, /<li class="seo-base__it">/g), 6);
  assert.deepEqual([...base.matchAll(/<h4 class="seo-base__t">([\s\S]*?)<\/h4>/g)].map(([, h4]) => text(h4)), ['SEO tehnic, verificat lunar', 'Profilul Companiei pe Google', 'Recenzii de la clienți reali', 'Aceleași date în până la 10 directoare', 'Monitorizare în asistenții AI', 'Raport lunar, pe înțeles']);
  assert.equal(count(main, /href="#inclus"/g), 4);
});

test('the comparison table has nine rows of four plan cells and a CSS-only plan picker', () => {
  const table = main.match(/<table class="seo-cmp__table"[^>]*>([\s\S]*?)<\/table>/)?.[1] ?? '';
  const rows = [...(table.match(/<tbody>([\s\S]*?)<\/tbody>/)?.[1] ?? '').matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map(([, row]) => row);
  assert.equal(rows.length, 9);
  for (const row of rows) {
    assert.deepEqual([...row.matchAll(/<td data-p="([lcap])"/g)].map(([, plan]) => plan), ['l', 'c', 'a', 'p']);
  }
  const radios = [...main.matchAll(/<input class="seo-cmp__r"[^>]*>/g)].map(([tag]) => tag);
  assert.equal(radios.length, 4);
  for (const tag of radios) assert.match(tag, /type="radio" name="seo-cmp"/);
  assert.equal(radios.filter(tag => /\schecked\b/.test(tag)).length, 1);
  assert.match(radios.find(tag => /\schecked\b/.test(tag)) ?? '', /id="seo-cmp-c"/);
  for (const tag of radios) {
    const id = tag.match(/id="([^"]+)"/)?.[1];
    assert.ok(main.includes(`<label for="${id}">`), `${id} has a label`);
  }
});

test('the extras list holds seven items, each with a fixed price', () => {
  const extras = main.match(/<ul class="seo-extras">([\s\S]*?)<\/ul>/)?.[1] ?? '';
  const items = [...extras.matchAll(/<li>([\s\S]*?)<\/li>/g)].map(([, item]) => item);
  assert.equal(items.length, 7);
  assert.doesNotMatch(extras, /Setarea Profilului/, 'the Google profile setup is included in every plan, not sold as an extra');
  for (const item of items) assert.match(item, /<span class="seo-extras__p">\d+&nbsp;€/);
});

test('the terms state the minimum contract and the audit shows its price', () => {
  assert.ok(main.includes('Contractul e pe minimum 3 luni, apoi continuă lunar, cu preaviz de 30 de zile.'));
  assert.match(main, /<span class="seo-strip__amt">299 €<\/span>/);
});

test('the page avoids em dashes and diagonal arrows', () => {
  assert.doesNotMatch(page, /—/);
  assert.doesNotMatch(page, /[↖-↙]/);
});

const attrOf = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1] ?? null;
const planSection = () => main.match(/<section class="seo-sec seo-sec--s4" aria-labelledby="seo-3luni-t">([\s\S]*?)<\/section>/)?.[1] ?? '';

test('the work plan shows one phase at a time in real tabs, with every phase in the markup', () => {
  const section = planSection();
  assert.equal(text(section.match(/<h2 class="seo-h2" id="seo-3luni-t">([\s\S]*?)<\/h2>/)?.[1] ?? ''), 'Ce se întâmplă după ce începem');
  assert.doesNotMatch(section, /<input\b|seo-gantt|seo-steps|seo-c2/);
  const lists = [...section.matchAll(/<div\b[^>]*role="tablist"[^>]*>/g)].map(([tag]) => tag);
  assert.equal(lists.length, 1);
  assert.equal(attrOf(lists[0], 'aria-label'), 'Etapele planului de lucru');
  const tabs = [...section.matchAll(/(<button\b[^>]*role="tab"[^>]*>)([\s\S]*?)<\/button>/g)].map(([, tag, inner]) => ({ tag, inner }));
  assert.equal(tabs.length, 3);
  assert.deepEqual(tabs.map(({ tag }) => attrOf(tag, 'type')), ['button', 'button', 'button']);
  assert.deepEqual(tabs.map(({ tag }) => attrOf(tag, 'aria-selected')), ['true', 'false', 'false']);
  assert.deepEqual(tabs.map(({ tag }) => attrOf(tag, 'tabindex')), ['0', '-1', '-1']);
  assert.deepEqual(tabs.map(({ inner }) => text(inner.match(/<span class="seo-phase-when">([\s\S]*?)<\/span>/)?.[1] ?? '')), ['Luna 1', 'Lunile 2-3', 'De la luna 4']);
  assert.deepEqual(tabs.map(({ inner }) => text(inner.match(/<span class="seo-phase-t">([\s\S]*?)<\/span>/)?.[1] ?? '')), ['Audit și corecturi', 'Primele lucrări', 'Lună de lună']);
  // The months strip and the contract pill repeat the phase, so the tab hides them from screen readers.
  assert.equal(count(section, /class="seo-phase-x"/g), 6);
  assert.equal(count(section, /<span class="seo-phase-x" aria-hidden="true">/g), 6);
  const panels = [...section.matchAll(/<div\b[^>]*role="tabpanel"[^>]*>/g)].map(([tag]) => tag);
  assert.equal(panels.length, 3);
  tabs.forEach(({ tag }, i) => {
    const panel = panels.find(candidate => attrOf(candidate, 'id') === attrOf(tag, 'aria-controls'));
    assert.ok(panel, `tab ${i + 1} controls a panel`);
    assert.equal(attrOf(panel, 'aria-labelledby'), attrOf(tag, 'id'));
    assert.equal(attrOf(panel, 'tabindex'), '0');
    assert.equal(/\shidden\b/.test(panel), i > 0, 'only the first phase starts visible');
  });
  assert.deepEqual([...section.matchAll(/<h3 class="seo-phase-h3">([^<]+)<\/h3>/g)].map(([, h3]) => h3), ['Audit și corecturi', 'Primele lucrări', 'Lună de lună']);
  const bodies = section.split(/<div\b[^>]*role="tabpanel"[^>]*>/).slice(1);
  assert.equal(bodies.length, 3);
  for (const body of bodies) {
    assert.deepEqual([...body.matchAll(/<h4 class="seo-phase-lt">[\s\S]*?<span>([^<]+)<\/span><\/h4>/g)].map(([, h4]) => h4), ['Ce facem noi', 'Ce faci tu', 'Ce vezi tu']);
  }
  // What the client does is plain text with a frequency chip, never a checkbox.
  const chips = [...section.matchAll(/<span class="seo-phase-freq">[\s\S]*?<span class="seo-sr">Când: <\/span>([^<]+)<\/span>/g)].map(([, chip]) => chip);
  assert.deepEqual(chips, ['o dată', 'o discuție', 'în 5 zile lucrătoare', 'când ai ocazia', 'lunar', 'lunar']);
  assert.equal(count(section, /<span class="seo-phase-pill">Contract minim · 3 luni<\/span>/g), 2);
  assert.equal(count(section, /<span class="seo-phase-pill seo-phase-pill--next">Apoi lunar · preaviz de 30 de zile<\/span>/g), 2);
  assert.ok(text(section).includes('Etapele sunt aceleași în toate cele 4 pachete. Diferă cantitățile, nu ordinea.'));
});

test('every text of the work plan has an English pair', () => {
  const section = planSection();
  const keys = new Set([...seoServicesDictionary, ...dictionary].map(([ro]) => ro));
  const nodes = [...section.matchAll(/>([^<>]*[A-Za-zĂÂÎȘȚăâîșț][^<>]*)</g)].map(([, node]) => node);
  assert.ok(nodes.length > 60, `found ${nodes.length} text nodes`);
  for (const node of nodes) assert.ok(keys.has(`>${node}<`), `no English pair for ">${node}<"`);
  for (const [, label] of section.matchAll(/aria-label="([^"]+)"/g)) assert.ok(keys.has(`aria-label="${label}"`), `no English pair for aria-label="${label}"`);
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
