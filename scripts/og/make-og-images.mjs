/**
 * Renders the share-preview images (1200x630 JPEG) listed in scripts/lib/og-pages.mjs.
 *
 *   node scripts/og/make-og-images.mjs                 render all 22 (21 pages + default)
 *   node scripts/og/make-og-images.mjs home contact    only these slugs
 *   node scripts/og/make-og-images.mjs --sheet <dir>   also write contact sheets (PNG) into <dir>
 *
 * Needs, outside npm: Google Chrome (headless screenshot) and ffmpeg (PNG to JPEG).
 * Override with CHROME_PATH / FFMPEG_PATH. No npm dependency is used.
 *
 * Sources are read from disk and embedded as data URLs, so rendering needs no network:
 *   - fonts: legacy-mirror/wp-content/ect-pages/fonts/Montserrat-Variable.woff2
 *   - characters: legacy-mirror/wp-content/ect-assets/illustrations-2026-11/<name>-768.webp (untracked source folder)
 *   - logo: design-assets/logo-echipa-de-tocilari-transparent.png (also used as the shape of the blobs)
 * Output: legacy-mirror/wp-content/ect-pages/og/<slug>.jpg (tracked and published).
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { ogImageSize, ogPages } from '../lib/og-pages.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const outDir = path.join(root, 'legacy-mirror/wp-content/ect-pages/og');
const fontFile = path.join(root, 'legacy-mirror/wp-content/ect-pages/fonts/Montserrat-Variable.woff2');
// The name next to the logo is set in Varela Round, the site's rounded Elementor font (approved 16.11.2026); ASCII only, so the latin subset is enough.
const brandFontFile = path.join(root, 'legacy-mirror/wp-content/uploads/elementor/google-fonts/fonts/varelaround-w8gdh283tvk__lua32tysjifp8up.woff2');
const logoFile =path.join(root, 'design-assets/logo-echipa-de-tocilari-transparent.png');
const illustrationDir = path.join(root, 'legacy-mirror/wp-content/ect-assets/illustrations-2026-11');
const chrome = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ffmpeg = process.env.FFMPEG_PATH || 'ffmpeg';

const colors = { orange: '#fd8649', ink: '#27272d', inkMuted: '#55555e', turquoise: '#cef3f5', white: '#ffffff' };
const maxBytes = 250 * 1024;

const dataUrl = (file, mime) => `data:${mime};base64,${readFileSync(file).toString('base64')}`;
const escapeHtml = (value) => value.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/** Escapes and keeps hyphenated words (AI-assisted, cookie-uri, 30-minute) on one line. */
const text = (value) => escapeHtml(value).replace(/\S+-\S+/g, '<span class="nb">$&</span>');

/** The home image doubles as the default one (pages without their own entry). */
function jobs() {
  const home = ogPages.find((entry) => entry.slug === 'home');
  return [...ogPages, { ...home, slug: 'default' }];
}

function cardHtml(entry, assets) {
  const illustration = assets.illustration(entry.illustration);
  const mirror = entry.mirror ? 'transform: scaleX(-1);' : '';
  return `<!doctype html>
<html lang="ro"><head><meta charset="utf-8"><title>${escapeHtml(entry.slug)}</title>
<style>
@font-face { font-family: 'Montserrat'; src: url(${assets.font}) format('woff2'); font-weight: 100 900; }
@font-face { font-family: 'Varela Round'; src: url(${assets.brandFont}) format('woff2'); font-weight: 400; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: ${ogImageSize.width}px; height: ${ogImageSize.height}px; overflow: hidden; background: ${colors.white}; }
body { position: relative; font-family: 'Montserrat', sans-serif; color: ${colors.ink}; }
.blob { position: absolute; background: var(--fill); -webkit-mask: url(${assets.logo}) center / 100% 100% no-repeat; mask: url(${assets.logo}) center / 100% 100% no-repeat; }
.blob-orange { --fill: ${colors.orange}; width: 250px; height: 260px; left: 1000px; top: 16px; transform: rotate(38deg); }
.blob-main { --fill: ${colors.turquoise}; width: 610px; height: 635px; left: 600px; top: 78px; transform: rotate(-8deg); }
.character { position: absolute; right: 0; bottom: 0; height: 560px; width: 560px; object-fit: contain; object-position: center bottom; ${mirror} }
.copy { position: absolute; left: 64px; top: 0; bottom: 0; width: 570px; padding: 46px 0 44px; display: flex; flex-direction: column; }
.brand { display: flex; align-items: center; gap: 14px; font-family: 'Varela Round', sans-serif; font-weight: 400; font-size: 30px; line-height: 1; }
.brand img { width: 62px; height: 64px; display: block; }
.main { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 8px 0 4px; }
.bar { width: 56px; height: 6px; border-radius: 3px; background: ${colors.orange}; margin-bottom: 22px; }
h1 { font-weight: 800; font-size: 58px; line-height: 1.08; letter-spacing: -0.01em; text-wrap: balance; }
.subtitle { margin-top: 20px; font-weight: 500; font-size: 26px; line-height: 1.3; color: ${colors.inkMuted}; text-wrap: balance; }
.nb { white-space: nowrap; }
.url { font-weight: 600; font-size: 22px; line-height: 1; }
</style></head>
<body>
<div class="blob blob-orange"></div>
<div class="blob blob-main"></div>
<img class="character" src="${illustration}" alt="">
<div class="copy">
  <div class="brand"><img src="${assets.logo}" alt="">Echipa de Tocilari</div>
  <div class="main"><div class="bar"></div><h1>${text(entry.title)}</h1><p class="subtitle">${text(entry.subtitle)}</p></div>
  <div class="url">echipadetocilari.ro</div>
</div>
<script>
// Shrink the title from 58px to 46px until it fits in 3 lines and the block stays between brand and url.
(document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
  const h1 = document.querySelector('h1');
  const sub = document.querySelector('.subtitle');
  const lines = (el) => Math.round(el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight));
  const fits = () => {
    const main = document.querySelector('.main').getBoundingClientRect();
    const blockBottom = document.querySelector('.subtitle').getBoundingClientRect().bottom;
    const blockTop = document.querySelector('.bar').getBoundingClientRect().top;
    return lines(h1) <= 3 && h1.scrollWidth <= h1.clientWidth + 1 && blockTop >= main.top - 1 && blockBottom <= main.bottom + 1;
  };
  let size = 58;
  h1.style.fontSize = size + 'px';
  while (!fits() && size > 46) { size -= 2; h1.style.fontSize = size + 'px'; }
  document.documentElement.dataset.fit = JSON.stringify({ size, titleLines: lines(h1), subtitleLines: lines(sub), ok: fits() && lines(sub) <= 2, fontLoaded: document.fonts.check('800 20px Montserrat') && document.fonts.check('20px "Varela Round"') });
});
</script>
</body></html>`;
}

function chromeArgs(htmlFile, extra) {
  return ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    `--window-size=${ogImageSize.width},${ogImageSize.height}`, '--virtual-time-budget=4000', ...extra, pathToFileURL(htmlFile).href];
}

function renderPng(htmlFile, pngFile, width, height) {
  const args = chromeArgs(htmlFile, [`--screenshot=${pngFile}`]).map((arg) => (arg.startsWith('--window-size=') ? `--window-size=${width},${height}` : arg));
  execFileSync(chrome, args, { stdio: 'ignore' });
}

function probeFit(htmlFile) {
  const dom = execFileSync(chrome, chromeArgs(htmlFile, ['--dump-dom']), { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
  const match = dom.match(/data-fit="([^"]*)"/);
  if (!match) throw new Error(`no fit result for ${htmlFile}`);
  return JSON.parse(match[1].replace(/&quot;/g, '"'));
}

function toJpeg(pngFile, jpgFile) {
  execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-i', pngFile, '-vf', `scale=${ogImageSize.width}:${ogImageSize.height}:flags=lanczos,format=yuvj420p`, '-q:v', '3', '-frames:v', '1', jpgFile]);
}

function sheetHtml(entries, jpgDir) {
  const cells = entries.map((entry) => `<figure><img src="${pathToFileURL(path.join(jpgDir, `${entry.slug}.jpg`)).href}"><figcaption>${escapeHtml(entry.slug)}</figcaption></figure>`).join('');
  return `<!doctype html><meta charset="utf-8"><style>
body{margin:0;padding:16px;background:#ddd;font:14px sans-serif;display:grid;grid-template-columns:800px 800px;gap:16px;width:1632px}
figure{margin:0}img{width:800px;height:420px;display:block}figcaption{padding:2px 0}</style>${cells}`;
}

const args = process.argv.slice(2);
const sheetIndex = args.indexOf('--sheet');
const sheetDir = sheetIndex >= 0 ? path.resolve(args[sheetIndex + 1]) : null;
if (sheetIndex >= 0) args.splice(sheetIndex, 2);
const wanted = new Set(args);

for (const tool of [chrome]) if (!existsSync(tool)) throw new Error(`Chrome not found at ${tool}; set CHROME_PATH`);
const all = jobs();
const selected = wanted.size ? all.filter((entry) => wanted.has(entry.slug)) : all;
if (wanted.size && selected.length !== wanted.size) throw new Error(`unknown slug in: ${[...wanted].join(', ')}`);

const assets = {
  font: dataUrl(fontFile, 'font/woff2'),
  brandFont: dataUrl(brandFontFile, 'font/woff2'),
  logo: dataUrl(logoFile, 'image/png'),
  illustration: (() => {
    const cache = new Map();
    return (name) => {
      if (!cache.has(name)) cache.set(name, dataUrl(path.join(illustrationDir, `${name}-768.webp`), 'image/webp'));
      return cache.get(name);
    };
  })(),
};

const work = mkdtempSync(path.join(os.tmpdir(), 'ect-og-'));
mkdirSync(outDir, { recursive: true });
const problems = [];
try {
  for (const entry of selected) {
    const htmlFile = path.join(work, `${entry.slug}.html`);
    const pngFile = path.join(work, `${entry.slug}.png`);
    const jpgFile = path.join(outDir, `${entry.slug}.jpg`);
    writeFileSync(htmlFile, cardHtml(entry, assets));
    const fit = probeFit(htmlFile);
    if (!fit.ok || !fit.fontLoaded) problems.push(`${entry.slug}: title does not fit or font missing ${JSON.stringify(fit)}`);
    renderPng(htmlFile, pngFile, ogImageSize.width, ogImageSize.height);
    toJpeg(pngFile, jpgFile);
    const bytes = statSync(jpgFile).size;
    if (bytes > maxBytes) problems.push(`${entry.slug}: ${bytes} bytes exceeds ${maxBytes}`);
    console.log(`${entry.slug.padEnd(30)} title ${fit.size}px / ${fit.titleLines} lines, subtitle ${fit.subtitleLines} lines, ${(bytes / 1024).toFixed(0)} KB`);
  }

  if (sheetDir) {
    mkdirSync(sheetDir, { recursive: true });
    const perSheet = 6;
    for (let i = 0; i * perSheet < selected.length; i += 1) {
      const chunk = selected.slice(i * perSheet, (i + 1) * perSheet);
      const htmlFile = path.join(work, `sheet-${i + 1}.html`);
      writeFileSync(htmlFile, sheetHtml(chunk, outDir));
      const rows = Math.ceil(chunk.length / 2);
      renderPng(htmlFile, path.join(sheetDir, `og-sheet-${i + 1}.png`), 1632, 16 + rows * (420 + 16 + 24));
    }
    console.log(`sheets written to ${sheetDir}`);
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}
if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
