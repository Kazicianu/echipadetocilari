import { chromium } from 'playwright';

const base = process.env.BASE_URL || 'http://localhost:54537';

const pages = [
  ['/', 'Agenție marketing online București', 'Agenție de marketing online în București'],
  ['/despre-noi/', 'Despre noi', 'Despre noi'],
  ['/creare-site-web/', 'Creare site web București', 'Creare site web de prezentare in Bucuresti'],
  ['/servicii-seo/', 'Servicii SEO București', 'Servicii de optimizare SEO pentru Google'],
  ['/administrare-site/', 'Administrare și mentenanță site', 'Administrare si mentenanta site web'],
  ['/contact/', 'Contact', 'Contacteaza agentia de marketing online'],
  ['/portofoliu/', 'Portofoliu web design', 'Portofoliu de web design'],
  ['/services/', 'Servicii marketing digital', 'Servicii de marketing digital'],
  ['/clients/', 'Clienți', 'Clientii nostri'],
  ['/logo-design/', 'Logo design', 'Logo design si identitate vizuala'],
  ['/pay-per-click/', 'Campanii Google Ads', 'Campanii Google Ads'],
  ['/en/', 'Digital Marketing Agency Bucharest', 'Digital marketing agency in Bucharest'],
  ['/en/website-design/', 'Website Design Bucharest', 'Business website design in Bucharest'],
  ['/en/ppc-advertising/', 'Google Ads Campaigns Bucharest', 'Google Ads campaigns'],
];

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage();
const fails = [];

for (const [path, titlePart, h1Part] of pages) {
  await page.goto(base + path, { waitUntil: 'domcontentloaded', timeout: 30000 });
  const title = await page.title();
  const h1s = (await page.locator('h1').allTextContents()).map((h) => h.replace(/\s+/g, ' ').trim());
  const desc = await page.locator('meta[name="description"]').getAttribute('content');
  const okTitle = title.includes(titlePart);
  const okH1 = h1s.some((h) => h.includes(h1Part));
  const okDesc = (desc || '').length >= 50;
  const okCount = h1s.length === 1;
  console.log(path.padEnd(28), `h1s=${h1s.length}`, `title=${okTitle ? 'OK' : 'FAIL'}`, `h1=${okH1 ? 'OK' : 'FAIL'}`, `desc=${okDesc ? 'OK' : 'FAIL'}`);
  console.log('  title:', title);
  console.log('  h1:', JSON.stringify(h1s));
  if (!okTitle || !okH1 || !okDesc || !okCount) fails.push(path);
}

await browser.close();
if (fails.length) {
  console.error('FAILURES', fails);
  process.exit(1);
}
console.log('ALL CHECKS PASSED');
