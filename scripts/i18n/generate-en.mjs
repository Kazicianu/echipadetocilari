/**
 * Generate the English pages from the Romanian Elementor HTML + dictionary.
 * Visual structure/CSS/JS is preserved byte-for-byte; only text and SEO change.
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { routes } from './routes.mjs';
import { normalizePageLinks } from '../lib/navigation.mjs';
import { dictionary, googleAdsDictionary, enPageMeta, enOrg } from './dictionary.mjs';
import { injectLangSwitcher } from './lang-switcher.mjs';
import {
  appendToHead,
  applyIndexPolicy,
  injectHreflang,
  renderJsonLd,
  setLang,
  stripJsonLd,
  upsertMeta,
  upsertTitle,
} from '../lib/html.mjs';
import { faqPage, organization, service, webPage, website } from '../lib/schema.mjs';
import { extractGoogleAdsFaqs, extractHomeFaqs } from '../lib/faq.mjs';

/**
 * Longest phrase first, so "Servicii SEO" wins over "Servicii".
 *
 * This is a whole-document replace, scripts and styles included. That is
 * intentional (Elementor keeps visible copy inside widget JSON), but it means a
 * careless short entry can corrupt inline JS — `npm run build` syntax-checks
 * every inline block afterwards to catch exactly that.
 */
function applyDictionary(html, pageDictionary = []) {
  const pairs = [...pageDictionary, ...dictionary]
    .filter(([from, to]) => from && from !== to)
    .sort((a, b) => b[0].length - a[0].length);

  let out = html;
  for (const [from, to] of pairs) out = out.split(from).join(to);
  return out;
}

/** EN pages live one level deeper, so every relative asset path has to go root-absolute. */
function absolutizeAssets(html) {
  let out = html
    .replace(/(src|href)="(\.\.\/)+wp-content\//gi, '$1="/wp-content/')
    .replace(/(src|href)="(\.\.\/)+wp-includes\//gi, '$1="/wp-includes/')
    .replace(/(src|href)="wp-content\//gi, '$1="/wp-content/')
    .replace(/(src|href)="wp-includes\//gi, '$1="/wp-includes/')
    .replace(/url\((['"]?)(\.\.\/)+wp-content\//gi, 'url($1/wp-content/')
    .replace(/url\((['"]?)wp-content\//gi, 'url($1/wp-content/')
    .replace(/url\((['"]?)(\.\.\/)+wp-includes\//gi, 'url($1/wp-includes/')
    .replace(/url\((['"]?)wp-includes\//gi, 'url($1/wp-includes/');

  // srcset holds several "url 836w" candidates — fix each one.
  out = out.replace(/srcset="([^"]+)"/gi, (_, value) => {
    const fixed = value
      .split(',')
      .map((part) => {
        const m = part.trim().match(/^(\S+)(\s+.+)?$/);
        if (!m) return part;
        const url = m[1]
          .replace(/^(\.\.\/)+wp-content\//, '/wp-content/')
          .replace(/^(\.\.\/)+wp-includes\//, '/wp-includes/')
          .replace(/^wp-content\//, '/wp-content/')
          .replace(/^wp-includes\//, '/wp-includes/');
        return url + (m[2] || '');
      })
      .join(', ');
    return `srcset="${fixed}"`;
  });

  return out;
}

function schemasFor(route, meta, site, html) {
  const list = [
    organization({ site, lang: 'en', ...enOrg }),
    website({ site, lang: 'en' }),
    webPage({
      site,
      lang: 'en',
      url: route.en,
      name: meta?.title,
      description: meta?.description,
    }),
  ];

  if (route.en === '/en/') list.push(faqPage(extractHomeFaqs(html)));
  if (route.en === '/en/google-ads-agency/') list.push(faqPage(extractGoogleAdsFaqs(html)));
  if (route.service) {
    list.push(
      service({
        site,
        lang: 'en',
        name: route.service.en,
        description: meta?.description,
        url: route.en,
      })
    );
  }
  return list;
}

/**
 * @param {object} opts
 * @param {string} opts.outDir
 * @param {string} opts.site
 * @param {boolean} opts.indexable
 */
export function generateEnglishPages({ outDir, site, indexable }) {
  const results = [];

  for (const route of routes) {
    const srcPath = path.join(outDir, route.roFile);
    if (!existsSync(srcPath)) {
      console.warn('  skip missing', route.roFile);
      continue;
    }

    let html = readFileSync(srcPath, 'utf8');
    const meta = enPageMeta[route.en];

    html = stripJsonLd(html);
    html = applyDictionary(html, route.ro === '/agentie-google-ads/' ? googleAdsDictionary : []);
    html = absolutizeAssets(html);
    html = normalizePageLinks(html, { pageUrl: route.ro, language: 'en' });
    html = setLang(html, 'en');

    if (meta) {
      html = upsertTitle(html, meta.title);
      html = upsertMeta(html, 'name="description"', meta.description);
      html = upsertMeta(html, 'property="og:title"', meta.title);
      html = upsertMeta(html, 'property="og:description"', meta.description);
      html = upsertMeta(html, 'property="og:locale"', 'en_US');
      html = upsertMeta(html, 'name="twitter:title"', meta.title);
      html = upsertMeta(html, 'name="twitter:description"', meta.description);
    }
    html = upsertMeta(html, 'property="og:url"', `${site}${route.en}`);

    html = injectHreflang(html, { site, roPath: route.ro, enPath: route.en });
    html = injectLangSwitcher(html, 'en', route.ro === '/' ? '/' : route.ro, route.en);
    html = applyIndexPolicy(html, { indexable, canonical: `${site}${route.en}` });
    html = appendToHead(html, renderJsonLd(schemasFor(route, meta, site, html)));

    const dest = path.join(outDir, route.enFile);
    mkdirSync(path.dirname(dest), { recursive: true });
    writeFileSync(dest, html, 'utf8');
    results.push(route.en);
  }

  return results;
}

/** Add hreflang + the switcher to the Romanian pages already written to dist. */
export function patchRomanianPages({ outDir, site }) {
  for (const route of routes) {
    const file = path.join(outDir, route.roFile);
    if (!existsSync(file)) continue;

    let html = readFileSync(file, 'utf8');
    html = injectHreflang(html, { site, roPath: route.ro, enPath: route.en });
    html = injectLangSwitcher(html, 'ro', route.ro === '/' ? '/' : route.ro, route.en);
    html = setLang(html, 'ro');
    writeFileSync(file, html, 'utf8');
  }
}
