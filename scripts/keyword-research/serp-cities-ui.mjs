import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

function uule(canonicalName) {
  const b64 = Buffer.from(canonicalName).toString('base64');
  return 'w+CAIQICI' + b64;
}

const cities = [
  {
    id: 'new-york',
    query: 'digital marketing agency New York',
    google: 'https://www.google.com',
    hl: 'en',
    gl: 'us',
    locale: 'en-US',
    tz: 'America/New_York',
    geo: { latitude: 40.7128, longitude: -74.006 },
    uule: uule('New York,New York,United States'),
  },
  {
    id: 'los-angeles',
    query: 'digital marketing agency Los Angeles',
    google: 'https://www.google.com',
    hl: 'en',
    gl: 'us',
    locale: 'en-US',
    tz: 'America/Los_Angeles',
    geo: { latitude: 34.0522, longitude: -118.2437 },
    uule: uule('Los Angeles,California,United States'),
  },
  {
    id: 'sydney',
    query: 'digital marketing agency Sydney',
    google: 'https://www.google.com.au',
    hl: 'en',
    gl: 'au',
    locale: 'en-AU',
    tz: 'Australia/Sydney',
    geo: { latitude: -33.8688, longitude: 151.2093 },
    uule: uule('Sydney,New South Wales,Australia'),
  },
  {
    id: 'berlin',
    query: 'Online Marketing Agentur Berlin',
    google: 'https://www.google.de',
    hl: 'de',
    gl: 'de',
    locale: 'de-DE',
    tz: 'Europe/Berlin',
    geo: { latitude: 52.52, longitude: 13.405 },
    uule: uule('Berlin,Germany'),
  },
  {
    id: 'london',
    query: 'digital marketing agency London',
    google: 'https://www.google.co.uk',
    hl: 'en',
    gl: 'gb',
    locale: 'en-GB',
    tz: 'Europe/London',
    geo: { latitude: 51.5074, longitude: -0.1278 },
    uule: uule('London,England,United Kingdom'),
  },
];

const skipHosts = [
  'google.',
  'gstatic',
  'youtube.com',
  'wikipedia.org',
  'linkedin.com',
  'facebook.com',
  'instagram.com',
  'reddit.com',
  'yelp.',
  'clutch.co',
  'designrush.com',
  'sortlist.com',
  'trustpilot.com',
  'indeed.com',
  'agencies.semrush.com',
  'digitalagencynetwork.com',
  'themanifest.com',
  'upcity.com',
  'goodfirms.co',
  'expertise.com',
  'bark.com',
  'g2.com',
  'yell.com',
  'yellowpages',
  'werbeagentur.de',
];

const outFile = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../docs/keyword-research/serp-cities-ui-2026-08-28.json',
);

const browser = await chromium.launch({
  channel: 'chrome',
  headless: false,
  args: ['--disable-blink-features=AutomationControlled'],
});

async function acceptConsent(page) {
  const sels = [
    'button:has-text("Accept all")',
    'button:has-text("Acceptă tot")',
    'button:has-text("Alle akzeptieren")',
    'button:has-text("I agree")',
    '#L2AGLb',
    'button[aria-label="Accept all"]',
  ];
  for (const s of sels) {
    try {
      const b = page.locator(s).first();
      if (await b.isVisible({ timeout: 1200 })) {
        await b.click({ timeout: 2000 });
        await page.waitForTimeout(600);
        return;
      }
    } catch {
      /* ignore */
    }
  }
}

const all = {};

for (const city of cities) {
  const context = await browser.newContext({
    locale: city.locale,
    timezoneId: city.tz,
    geolocation: city.geo,
    permissions: ['geolocation'],
    viewport: { width: 1366, height: 900 },
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  await page.goto(`${city.google}/?hl=${city.hl}&gl=${city.gl}&pws=0`, {
    waitUntil: 'domcontentloaded',
    timeout: 45000,
  });
  await page.waitForTimeout(1200);
  await acceptConsent(page);

  const url =
    `${city.google}/search?q=` +
    encodeURIComponent(city.query) +
    `&hl=${city.hl}&gl=${city.gl}&pws=0&num=10&uule=${encodeURIComponent(city.uule)}`;

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(2800);
  await acceptConsent(page);

  const title = await page.title();
  const htmlLen = (await page.content()).length;
  const blocked = /captcha|unusual traffic|detected unusual/i.test(title) || htmlLen < 5000;

  const extracted = await page.evaluate((skip) => {
    const organic = [];
    const seen = new Set();
    const skipTitles =
      /^(map|maps|people also ask|more businesses|sponsored|anzeige|werbung)$/i;

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
      if (skip.some((s) => host.includes(s))) continue;
      if (seen.has(host)) continue;
      seen.add(host);

      const lines = (block?.innerText || '')
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const snippet = lines.filter((s) => s.length > 50 && s !== heading).slice(0, 1)[0] || '';

      organic.push({ title: heading, url: urlText, host, snippet: snippet.slice(0, 320) });
    }

    return { organic };
  }, skipHosts);

  all[city.id] = {
    query: city.query,
    title,
    blocked,
    htmlLen,
    organic: extracted.organic,
  };
  console.log(city.id, 'blocked=', blocked, 'organic=', extracted.organic.length);
  extracted.organic.slice(0, 8).forEach((r, i) => console.log(' ', i + 1, r.host, '|', r.title));

  await context.close();
}

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, JSON.stringify(all, null, 2));
await browser.close();
console.log('WROTE', outFile);
