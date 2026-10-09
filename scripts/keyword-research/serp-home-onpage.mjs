import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const pages = [
  { name: 'Echipa de Tocilari', url: 'https://www.echipadetocilari.ro/' },
  { name: 'The Markers', url: 'https://www.themarkers.ro/' },
  { name: 'Kooperativa', url: 'https://kooperativa.ro/' },
  { name: 'Web Ventures', url: 'https://webventures.ro/' },
  { name: 'Dare Digital', url: 'https://www.daredigital.ro/' },
  { name: 'Webdesk', url: 'https://www.webdesk.ro/' },
];

const outFile = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../docs/keyword-research/serp-home-onpage-2026-08-28.json',
);

const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
  args: ['--disable-blink-features=AutomationControlled'],
});
const context = await browser.newContext({
  locale: 'ro-RO',
  timezoneId: 'Europe/Bucharest',
  viewport: { width: 1440, height: 1100 },
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
});

const results = [];

for (const site of pages) {
  const page = await context.newPage();
  try {
    const resp = await page.goto(site.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(2200);
    const data = await page.evaluate(() => {
      const text = (el) => (el?.innerText || '').replace(/\s+/g, ' ').trim();
      const meta = (name) =>
        document.querySelector(`meta[name="${name}"]`)?.content ||
        document.querySelector(`meta[property="${name}"]`)?.content ||
        '';
      const robots =
        document.querySelector('meta[name="robots"]')?.content ||
        document.querySelector('meta[name="googlebot"]')?.content ||
        '';
      const h1 = [...document.querySelectorAll('h1')].map(text).filter(Boolean);
      const h2 = [...document.querySelectorAll('h2')].map(text).filter(Boolean).slice(0, 20);
      const body = document.querySelector('main') || document.body;
      const bodyText = (body?.innerText || '').replace(/\s+/g, ' ').trim();
      const words = bodyText.split(/\s+/).filter(Boolean).length;
      const schemas = [...document.querySelectorAll('script[type="application/ld+json"]')]
        .map((s) => {
          try {
            return JSON.parse(s.textContent);
          } catch {
            return null;
          }
        })
        .filter(Boolean);
      const schemaTypes = [];
      const walk = (n) => {
        if (!n || typeof n !== 'object') return;
        if (n['@type']) schemaTypes.push(n['@type']);
        if (Array.isArray(n)) n.forEach(walk);
        else Object.values(n).forEach(walk);
      };
      schemas.forEach(walk);

      const links = [...document.querySelectorAll('a[href]')]
        .map((a) => a.getAttribute('href'))
        .filter(Boolean);
      const host = location.hostname.replace(/^www\./, '');
      const internal = links.filter((h) => h.startsWith('/') || h.includes(host));
      const uniqueInternal = [...new Set(internal.map((h) => h.split('#')[0].split('?')[0]))].slice(0, 80);

      const kwHits = {};
      for (const kw of [
        'agentie marketing online',
        'agenție marketing online',
        'agenție de marketing online',
        'agentie de marketing online',
        'marketing digital',
        'agenție de marketing digital',
        'promovare online',
        'web design',
        'bucurești',
        'bucuresti',
        'seo',
        'google ads',
        'ppc',
      ]) {
        const re = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        kwHits[kw] = (bodyText.match(re) || []).length;
      }

      return {
        title: document.title,
        canonical: document.querySelector('link[rel="canonical"]')?.href || '',
        description: meta('description'),
        robots,
        h1,
        h2,
        words,
        schemaTypes: [...new Set(schemaTypes.flat().map(String))],
        uniqueInternalCount: uniqueInternal.length,
        uniqueInternal: uniqueInternal.slice(0, 40),
        kwHits,
        hasFaq: /întrebări frecvente|intrebari frecvente|faq/i.test(bodyText),
        hasPrices: /preț|preturi|tarife|de la \d|€|euro/i.test(bodyText),
        hasReviews: /testimonial|recenzie|google reviews|ce spun clien/i.test(bodyText),
        hasCases: /studiu de caz|case study|portofoliu|proiecte/i.test(bodyText),
        hasYears: (bodyText.match(/\b(20\d{2}|1[0-9]\+?\s*ani|\bpeste\s+\d+\s+ani)\b/gi) || []).slice(0, 8),
        ogTitle: meta('og:title'),
      };
    });
    results.push({
      name: site.name,
      url: site.url,
      status: resp?.status() || 0,
      finalUrl: page.url(),
      ...data,
    });
    console.log(site.name, 'status', resp?.status(), 'h1', data.h1, 'words', data.words, 'title', data.title);
  } catch (err) {
    console.error('FAIL', site.name, err.message);
    results.push({ name: site.name, url: site.url, error: err.message });
  } finally {
    await page.close();
  }
}

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, JSON.stringify(results, null, 2));
await browser.close();
console.log('WROTE', outFile);
