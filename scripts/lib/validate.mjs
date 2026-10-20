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
import { routes, isOwnedPage, retiredPagePaths } from '../i18n/routes.mjs';

const retiredPaths = new Set(retiredPagePaths);
const ownHosts = new Set(['echipadetocilari.ro', 'www.echipadetocilari.ro']);

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

    checkInlineBlocks(html, rel(file), errors);

    const titles = html.match(/<title[^>]*>/gi) || [];
    if (titles.length > 1) errors.push(`${rel(file)}: ${titles.length} <title> tags`);

    const robots = html.match(/<meta\s+name=["']robots["'][^>]*content=["']([^"']*)["']/i);
    if (!robots) {
      errors.push(`${rel(file)}: no robots meta`);
    } else {
      const noindex = /noindex/i.test(robots[1]);
      if (!owned) {
        errors.push(`${rel(file)}: leftover HTML shipped — delete from the mirror; 301 is in vercel.json`);
        continue;
      }
      if (indexable && noindex) errors.push(`${rel(file)}: own page is noindex`);
      if (!indexable && !noindex) errors.push(`${rel(file)}: staging page is indexable`);
    }

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
