/**
 * Post-build checks on dist/.
 *
 * The build rewrites raw Elementor HTML with string replaces, so the failure
 * mode is silent: a dictionary entry lands inside inline JS, or a page quietly
 * loses its meta. These assertions turn that into a red build.
 */
import { readFileSync } from 'fs';
import path from 'path';
import vm from 'vm';
import { routes, isOwnedPage } from '../i18n/routes.mjs';

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
      if (!/data-ect-contact=["'](?:ro|en)["']/.test(html)) errors.push(`${rel(file)}: contact form missing`);
      const desc = html.match(/<meta\s+name=["']description["'][^>]*content=["']([^"']*)["']/i);
      if (!desc || desc[1].trim().length < 50) {
        errors.push(`${rel(file)}: missing or too-short description`);
      }
      if (!html.includes('id="ect-lang-switch"')) {
        errors.push(`${rel(file)}: language switcher missing`);
      }
      const alt = (html.match(/rel=["']alternate["'][^>]*hreflang/gi) || []).length;
      if (alt !== 3) errors.push(`${rel(file)}: expected 3 hreflang links, found ${alt}`);
    }
  }

  // Every declared route must have produced both language variants.
  const built = new Set(files.map((f) => urlPathOf(f)));
  for (const route of routes) {
    if (!built.has(route.ro)) errors.push(`missing RO page ${route.ro}`);
    if (!built.has(route.en)) errors.push(`missing EN page ${route.en}`);
  }

  return errors;
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
