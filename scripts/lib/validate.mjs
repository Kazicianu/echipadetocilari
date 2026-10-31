/**
 * Post-build checks on dist/.
 *
 * The build rewrites raw Elementor HTML with string replaces, so the failure
 * mode is silent: a dictionary entry lands inside inline JS, or a page quietly
 * loses its meta. These assertions turn that into a red build.
 */
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import vm from 'vm';
import { routes, isOwnedPage, isSystemPage, retiredPagePaths } from '../i18n/routes.mjs';
import { unnamedFooterIconLinks } from './footer-a11y.mjs';

const retiredPaths = new Set(retiredPagePaths);
const ownHosts = new Set(['echipadetocilari.ro', 'www.echipadetocilari.ro']);
// Letters that only Romanian uses here; the cedilla forms of ș/ț (U+015E, U+015F,
// U+0162, U+0163) are escaped so this file never contains them.
const ROMANIAN_LETTER = /[ăâîșțĂÂÎȘȚŞşŢţ]/;
// Romanian stems that must not survive in the alt, title or aria-label of an English page.
const ROMANIAN_ATTRIBUTE_WORD = /\b(?:servicii|creare|procesul|optimizare|ofera|creeaza|tocilar)\b/i;

/**
 * @param {object} opts
 * @param {string} opts.outDir
 * @param {string[]} opts.files absolute paths of every HTML page in dist
 * @param {(file: string) => string} opts.urlPathOf
 * @param {boolean} opts.indexable
 * @returns {string[]} errors (empty = pass)
 */
export function validateBuild({ outDir, files, urlPathOf, indexable }) {
  const errors = [];
  const rel = (f) => path.relative(outDir, f).replace(/\\/g, '/');

  for (const file of files) {
    const html = readFileSync(file, 'utf8');
    const urlPath = urlPathOf(file);
    const owned = isOwnedPage(urlPath);
    const system = isSystemPage(urlPath);

    checkInlineBlocks(html, rel(file), errors);

    // GA4 may load only through consent.js, after the visitor accepts analytics cookies.
    if (/googletagmanager\.com\/gtag\/js|gtag\(\s*['"]config['"]/i.test(html)) {
      errors.push(`${rel(file)}: Google tag in the static HTML; GA4 must load only through consent.js after consent`);
    }

    const titles = html.match(/<title[^>]*>/gi) || [];
    if (titles.length > 1) errors.push(`${rel(file)}: ${titles.length} <title> tags`);

    const robots = html.match(/<meta\s+name=["']robots["'][^>]*content=["']([^"']*)["']/i);
    if (!robots) {
      errors.push(`${rel(file)}: no robots meta`);
    } else {
      const noindex = /noindex/i.test(robots[1]);
      if (!owned && !system) {
        errors.push(`${rel(file)}: leftover HTML shipped — delete from the mirror; 301 is in vercel.json`);
        continue;
      }
      if (system && !noindex) errors.push(`${rel(file)}: system page must always be noindex`);
      if (owned && indexable && noindex) errors.push(`${rel(file)}: own page is noindex`);
      if (owned && !indexable && !noindex) errors.push(`${rel(file)}: staging page is indexable`);
    }

    checkWordPressLeftovers(html, rel(file), errors);
    if (owned || system) checkOwnPage(html, rel(file), urlPath, system, errors);

    if (html.includes('/en/en/')) errors.push(`${rel(file)}: doubled /en/en/ path`);

    if (owned) {
      const route = routes.find(route => route.ro === urlPath || route.en === urlPath);
      const pageCopy = html.replace(/<!--[\s\S]*?-->|<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
      const h1Count = (pageCopy.match(/<h1\b/gi) || []).length;
      if (h1Count !== 1) errors.push(`${rel(file)}: expected one H1, found ${h1Count}`);
      for (const [, href] of pageCopy.matchAll(/<a\b[^>]*\shref=["']([^"']*)["']/gi)) {
        let target;
        try { target = new URL(href, `https://www.echipadetocilari.ro${urlPath}`); }
        catch { continue; }
        if (!ownHosts.has(target.hostname) || !['http:', 'https:'].includes(target.protocol)) continue;
        const pathname = target.pathname.replace(/\/index\.html$/, '/').replace(/\/?$/, '/');
        if (retiredPaths.has(pathname)) errors.push(`${rel(file)}: link to retired page ${pathname}`);
      }
      const contact = pageCopy.search(/<form\b[^>]*data-ect-contact=["'](?:ro|en)["']/i);
      const footer = pageCopy.search(/<footer\b/i);
      if (contact < 0) errors.push(`${rel(file)}: contact form missing`);
      else if (footer < contact) errors.push(`${rel(file)}: contact form must precede the footer`);
      if (/[\u2014\u2196-\u2199]|&mdash;|&#8212;|&#x2014;|&#(?:8598|8599|8600|8601);|&#x219[6-9];/i.test(pageCopy)) {
        errors.push(`${rel(file)}: prohibited punctuation or diagonal arrow`);
      }
      // A Romanian block that missed its dictionary key (for example after a build
      // step rewrote it) would otherwise ship in Romanian on the English page.
      if (urlPath === '/en/' || urlPath.startsWith('/en/')) {
        const leftover = pageCopy.match(ROMANIAN_LETTER);
        if (leftover) {
          const at = leftover.index;
          const excerpt = pageCopy.slice(Math.max(0, at - 40), at + 40).replace(/\s+/g, ' ').trim();
          errors.push(`${rel(file)}: Romanian text left on an English page ("${excerpt}"); translate it in scripts/i18n/`);
        }
      }
      const desc = html.match(/<meta\s+name=["']description["'][^>]*content=["']([^"']*)["']/i);
      if (!desc || desc[1].trim().length < 50) {
        errors.push(`${rel(file)}: missing or too-short description`);
      }
      const switcher = html.match(/<nav id="ect-lang-switch"[\s\S]*?<\/nav>/i)?.[0];
      if (!switcher) {
        errors.push(`${rel(file)}: language switcher missing`);
      } else if (!route?.en && !/<a href="\/en\/" hreflang="en"[^>]*aria-label="EN: English homepage"/.test(switcher)) {
        errors.push(`${rel(file)}: language switcher has no English page`);
      }
      const alt = (html.match(/rel=["']alternate["'][^>]*hreflang/gi) || []).length;
      const expectedAlt = route?.en ? 3 : 0;
      if (alt !== expectedAlt) errors.push(`${rel(file)}: expected ${expectedAlt} hreflang links, found ${alt}`);
      checkSocialMeta(html, urlPath.startsWith('/en/') ? 'en_US' : 'ro_RO', outDir, rel(file), errors);
      const footerCopy = pageCopy.match(/<footer\b[\s\S]*?<\/footer>/i)?.[0] || '';
      if (/<h[1-6]\b/i.test(footerCopy)) errors.push(`${rel(file)}: heading inside the footer`);
      for (const [img] of pageCopy.matchAll(/<img\b[^>]*>/gi)) {
        if (!/\salt=["']/i.test(img)) errors.push(`${rel(file)}: image without alt attribute ${img.slice(0, 120)}`);
      }
    }
  }

  // Every declared route must produce RO, plus EN only when one is approved.
  const built = new Set(files.map((f) => urlPathOf(f)));
  for (const route of routes) {
    if (!built.has(route.ro)) errors.push(`missing RO page ${route.ro}`);
    if (route.en && !built.has(route.en)) errors.push(`missing EN page ${route.en}`);
  }

  return errors;
}

/**
 * Head links that point at nothing on this host. The build removes them; this
 * keeps them from coming back through a new scrape of the mirror.
 */
function checkWordPressLeftovers(html, name, errors) {
  if (/<link\b[^>]*\brel\s*=\s*["']shortlink["']/i.test(html)) {
    errors.push(`${name}: rel="shortlink" link left in the head; strip it in build-static.mjs`);
  }
  if (/<link\b[^>]*\btype\s*=\s*["']application\/rss\+xml["']/i.test(html)) {
    errors.push(`${name}: RSS feed link (application/rss+xml) left in the head; the site has no feeds`);
  }
}

/**
 * Checks shared by our pages and the generated system page: in-page anchors
 * resolve, icon-only footer links have a name, English attributes are English.
 * The system page also gets the rules a route page gets from the checks above.
 */
function checkOwnPage(html, name, urlPath, system, errors) {
  const pageCopy = html.replace(/<!--[\s\S]*?-->|<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>/gi, '');

  const ids = new Set([...pageCopy.matchAll(/\sid\s*=\s*["']([^"']+)["']/gi)].map(([, id]) => id));
  const missing = new Set();
  for (const [, href] of pageCopy.matchAll(/<a\b[^>]*\shref\s*=\s*["']#([^"']+)["']/gi)) {
    let id = href;
    try { id = decodeURIComponent(href); } catch { /* keep the raw value */ }
    if (!ids.has(href) && !ids.has(id)) missing.add(href);
  }
  for (const href of missing) errors.push(`${name}: link to #${href} but no element has id="${href}"`);

  for (const href of new Set(unnamedFooterIconLinks(html))) {
    errors.push(`${name}: link ${href} has no aria-label (icon-only footer link)`);
  }

  if (urlPath.startsWith('/en/')) {
    for (const [, attr, value] of pageCopy.matchAll(/(?<![\w-])(alt|title|aria-label)\s*=\s*"([^"]*)"/gi)) {
      const word = value.match(ROMANIAN_ATTRIBUTE_WORD)?.[0];
      if (word) errors.push(`${name}: Romanian "${word}" in ${attr}="${value.slice(0, 80)}" on an English page; translate it in scripts/i18n/`);
    }
  }

  if (!system) return;
  const h1Count = (pageCopy.match(/<h1\b/gi) || []).length;
  if (h1Count !== 1) errors.push(`${name}: system page needs one H1, found ${h1Count}`);
  if (/<link\b[^>]*\brel\s*=\s*["']canonical["']/i.test(html)) errors.push(`${name}: system page must not have a canonical link`);
  const contact = pageCopy.search(/<form\b[^>]*data-ect-contact=["'](?:ro|en)["']/i);
  const footer = pageCopy.search(/<footer\b/i);
  if (contact < 0) errors.push(`${name}: system page: contact form missing`);
  else if (footer < contact) errors.push(`${name}: system page: contact form must precede the footer`);
  if (/[—↖-↙]|&mdash;|&#8212;|&#x2014;|&#(?:8598|8599|8600|8601);|&#x219[6-9];/i.test(pageCopy)) {
    errors.push(`${name}: prohibited punctuation or diagonal arrow`);
  }
  for (const [, attr, value] of pageCopy.matchAll(/\s(src|href)\s*=\s*["']((?:\.{1,2}\/)*wp-(?:content|includes)\/[^"']*)["']/gi)) {
    errors.push(`${name}: relative ${attr}="${value.slice(0, 80)}" breaks at any depth; use a root-absolute path`);
  }
}

/** Share previews: page locale, an absolute image that exists, no WordPress leftovers. */
function checkSocialMeta(html, locale, outDir, name, errors) {
  const meta = (attr) =>
    [...html.matchAll(new RegExp(`<meta\\s+[^>]*${attr}[^>]*>`, 'gi'))].map(([tag]) => tag.match(/\scontent=["']([^"']*)["']/i)?.[1]);
  const [ogLocale] = meta('property=["\']og:locale["\']');
  if (ogLocale !== locale) errors.push(`${name}: og:locale is ${ogLocale}, expected ${locale}`);
  if (/<meta\s+[^>]*(?:property=["'](?:og:updated_time|article:[\w:]+)["']|name=["']twitter:(?:label|data)\d+["'])/i.test(html)) {
    errors.push(`${name}: stale WordPress share meta (og:updated_time, article:*, twitter:label)`);
  }
  for (const [label, attr] of [['og:image', 'property=["\']og:image["\']'], ['twitter:image', 'name=["\']twitter:image["\']']]) {
    const values = meta(attr);
    if (values.length !== 1) {
      errors.push(`${name}: expected one ${label} tag, found ${values.length}`);
      continue;
    }
    let url;
    try { url = new URL(values[0]); } catch { url = null; }
    if (!url || !['http:', 'https:'].includes(url.protocol)) {
      errors.push(`${name}: share image is not an absolute URL (${values[0]})`);
    } else if (!existsSync(path.join(outDir, decodeURIComponent(url.pathname)))) {
      errors.push(`${name}: share image missing from dist (${url.pathname})`);
    }
  }
}

/** Syntax-check every inline script: real JS with the parser, data blocks as JSON. */
function checkInlineBlocks(html, name, errors) {
  for (const [, attrs, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/\bsrc\s*=/i.test(attrs) || !body.trim()) continue;

    const type = (attrs.match(/\btype\s*=\s*["']([^"']+)["']/i) || [, ''])[1].toLowerCase();
    const isJson = !type ? false : type.includes('json') || type === 'speculationrules';
    const isJs = !type || /javascript|module|ecmascript/.test(type);

    try {
      if (isJson) JSON.parse(body);
      else if (isJs) new vm.Script(body);
    } catch (e) {
      const kind = isJson ? 'JSON' : 'JS';
      errors.push(`${name}: broken inline ${kind} (${e.message.split('\n')[0]})`);
    }
  }
}
