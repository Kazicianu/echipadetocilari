import scrape from 'website-scraper';
import { existsSync, rmSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { junkRedirects } from './lib/junk-redirects.mjs';
import { routes, retiredPagePaths } from './i18n/routes.mjs';

const junkPaths = new Set(
  [...junkRedirects.map(({ from }) => from), ...retiredPagePaths].map(from => from.replace(/\/$/, '') || '/')
);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
// Scrape lands in a dedicated throwaway folder — never in a folder with
// project files. Review the result, then move what you need into legacy-mirror/.
const outDir = path.join(root, '.mirror-scrape');

const urls = routes.map(({ ro }) => `https://www.echipadetocilari.ro${ro}`);

if (existsSync(outDir)) {
  console.log('Removing existing .mirror-scrape/ ...');
  rmSync(outDir, { recursive: true, force: true });
}

console.log(`Mirroring ${urls.length} pages → ${outDir}`);

const result = await scrape({
  urls,
  directory: outDir,
  recursive: true,
  maxRecursiveDepth: 2,
  maxDepth: 3,
  requestConcurrency: 4,
  filenameGenerator: 'bySiteStructure',
  urlFilter: (url) => {
    try {
      const u = new URL(url);
      // same origin only
      if (!u.hostname.includes('echipadetocilari.ro')) return false;
      // skip admin, feeds, login, query-heavy
      if (u.pathname.includes('/wp-admin')) return false;
      if (u.pathname.includes('/wp-login')) return false;
      if (u.pathname.includes('/feed')) return false;
      if (u.pathname.includes('/xmlrpc')) return false;
      if (u.pathname.includes('/cdn-cgi')) return false;
      const clean = u.pathname.replace(/\/$/, '') || '/';
      if (junkPaths.has(clean)) return false;
      // allow assets + pages
      return true;
    } catch {
      return false;
    }
  },
  sources: [
    { selector: 'img', attr: 'src' },
    { selector: 'img', attr: 'srcset' },
    { selector: 'input', attr: 'src' },
    { selector: 'source', attr: 'src' },
    { selector: 'source', attr: 'srcset' },
    { selector: 'video', attr: 'src' },
    { selector: 'audio', attr: 'src' },
    { selector: 'embed', attr: 'src' },
    { selector: 'object', attr: 'data' },
    { selector: 'script', attr: 'src' },
    { selector: 'link[rel="stylesheet"]', attr: 'href' },
    { selector: 'link[rel*="icon"]', attr: 'href' },
    { selector: 'link[rel="preload"]', attr: 'href' },
    { selector: 'link[rel="apple-touch-icon"]', attr: 'href' },
    { selector: 'link[rel="manifest"]', attr: 'href' },
    { selector: 'meta[property="og:image"]', attr: 'content' },
    { selector: 'meta[name="twitter:image"]', attr: 'content' },
    { selector: 'a', attr: 'href' },
  ],
  request: {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    },
  },
});

console.log(`Saved ${result.length} resources`);
console.log('Done.');
