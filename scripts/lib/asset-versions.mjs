/**
 * Cache busting for the stylesheets and scripts the pages load.
 *
 * Vercel caches /wp-content/ and /wp-includes/ URLs that carry `?v=` for a year
 * (see vercel.json). The query is the first 10 hex characters of the SHA-256 of
 * the built file, so the URL changes exactly when the file does.
 *
 * Only <link rel="stylesheet" href> and <script src> are versioned. Images,
 * srcset, url() in CSS, fonts and preload links are also referenced from CSS
 * files without a query and must keep one URL, or they would be downloaded twice.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const LOCAL_ASSET = /^\/wp-(?:content|includes)\/[^?#]*$/;
// Inline code and comments are not markup; leave them untouched.
const OPAQUE_BLOCKS = /(<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>|<!--[\s\S]*?-->)/gi;

function attrValue(attrs, name) {
  return attrs.match(new RegExp(`(?:^|\\s)${name}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, 'i'))?.[2];
}

/**
 * @param {string} html
 * @param {{ outDir: string, cache?: Map<string, string|null> }} opts
 *   `cache` maps a URL path to its hash (null when the file is not in outDir); share it across pages.
 */
export function versionAssets(html, { outDir, cache = new Map() }) {
  const hashOf = (urlPath) => {
    if (!cache.has(urlPath)) {
      let hash = null;
      try {
        const file = path.join(outDir, decodeURIComponent(urlPath));
        if (existsSync(file) && statSync(file).isFile()) {
          hash = createHash('sha256').update(readFileSync(file)).digest('hex').slice(0, 10);
        }
      } catch { /* malformed escape: leave the URL alone */ }
      cache.set(urlPath, hash);
    }
    return cache.get(urlPath);
  };

  const withVersion = (tag, name) =>
    tag.replace(new RegExp(`((?:^|\\s)${name}\\s*=\\s*)(["'])(.*?)\\2`, 'i'), (match, lead, quote, value) => {
      if (!LOCAL_ASSET.test(value)) return match;
      const hash = hashOf(value);
      return hash ? `${lead}${quote}${value}?v=${hash}${quote}` : match;
    });

  return html.split(OPAQUE_BLOCKS).map((part, index) => {
    if (index % 2 === 1) {
      // A script block: only its opening tag can carry src.
      return /^<script\b/i.test(part)
        ? part.replace(/^<script\b[^>]*>/i, (open) => withVersion(open, 'src'))
        : part;
    }
    return part.replace(/<link\b([^>]*)>/gi, (tag, attrs) =>
      /(?:^|\s)stylesheet(?:\s|$)/i.test(attrValue(attrs, 'rel') || '') ? withVersion(tag, 'href') : tag);
  }).join('');
}
