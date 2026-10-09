import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const keywords = [
  'agentie marketing online',
  'agentie marketing digital',
  'agentie marketing bucuresti',
  'agentie marketing online bucuresti',
  'agentie web design bucuresti',
  'promovare online',
];

const outFile = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../docs/keyword-research/serp-home-2026-08-28.json',
);

const browser = await chromium.launch({
  channel: 'chrome',
  headless: false,
  args: ['--disable-blink-features=AutomationControlled'],
});
const context = await browser.newContext({
  locale: 'ro-RO',
  timezoneId: 'Europe/Bucharest',
  geolocation: { latitude: 44.4268, longitude: 26.1025 },
  permissions: ['geolocation'],
  viewport: { width: 1366, height: 900 },
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
});
const page = await context.newPage();

async function acceptConsent() {
  const sels = [
    'button:has-text("Acceptă tot")',
    'button:has-text("Accept all")',
    'button:has-text("Sunt de acord")',
    '#L2AGLb',
    'button[aria-label="Accept all"]',
  ];
  for (const s of sels) {
    try {
      const b = page.locator(s).first();
      if (await b.isVisible({ timeout: 1500 })) {
        await b.click({ timeout: 2000 });
        await page.waitForTimeout(800);
        return;
      }
    } catch {
      /* ignore */
    }
  }
}

await page.goto('https://www.google.ro/?hl=ro&gl=ro&pws=0', {
  waitUntil: 'domcontentloaded',
  timeout: 45000,
});
await page.waitForTimeout(1500);
await acceptConsent();

const all = {};

for (const kw of keywords) {
  const url =
    'https://www.google.ro/search?q=' +
    encodeURIComponent(kw) +
    '&hl=ro&gl=ro&pws=0&num=10&sourceid=chrome&ie=UTF-8';
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(2800);
  await acceptConsent();

  const title = await page.title();
  const htmlLen = (await page.content()).length;
  const blocked = /captcha|unusual traffic|detected unusual/i.test(title) || htmlLen < 5000;

  const extracted = await page.evaluate(() => {
    const organic = [];
    const seen = new Set();
    const skipTitles =
      /^(hartă|mai multe companii|people also ask|întrebări frecvente|videouri|imagini|sponsored|sponsorizat)$/i;

    for (const h3 of document.querySelectorAll('h3')) {
      const heading = (h3.innerText || '').trim();
      if (!heading || skipTitles.test(heading)) continue;

      const block =
        h3.closest('div.wHYlTd') ||
        h3.closest('div[data-hveid]') ||
        h3.closest('div.g') ||
        h3.parentElement?.parentElement;
      const cite = [...(block?.querySelectorAll('cite') || [])]
        .map((c) => (c.innerText || '').trim())
        .find((t) => /^https?:\/\//i.test(t) || /\.[a-z]{2,}/i.test(t));
      if (!cite) continue;

      let urlText = cite.replace(/\s*[›>].*$/, '').trim();
      if (!/^https?:\/\//i.test(urlText)) urlText = 'https://' + urlText.replace(/^\/+/, '');
      let host = '';
      try {
        host = new URL(urlText).hostname.replace(/^www\./, '');
      } catch {
        continue;
      }
      if (host.includes('google.') || host.includes('gstatic')) continue;
      if (seen.has(host + heading)) continue;
      seen.add(host + heading);

      const lines = (block?.innerText || '')
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const snippet = lines.filter((s) => s.length > 50 && s !== heading).slice(0, 1)[0] || '';

      organic.push({ title: heading, url: urlText, host, snippet: snippet.slice(0, 320) });
    }

    return {
      organic,
      peopleAlsoAsk: [...document.querySelectorAll('[data-q]')]
        .slice(0, 8)
        .map((el) => el.getAttribute('data-q'))
        .filter(Boolean),
    };
  });

  all[kw] = { title, blocked, htmlLen, ...extracted };
  console.log('KW', kw, 'blocked=', blocked, 'organic=', extracted.organic.length);
  extracted.organic.slice(0, 6).forEach((r, i) => console.log(' ', i + 1, r.host, '|', r.title));
}

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, JSON.stringify(all, null, 2));
await browser.close();
console.log('WROTE', outFile);
