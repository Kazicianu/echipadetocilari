import { routes } from '../i18n/routes.mjs';

const productionOrigin = 'https://www.echipadetocilari.ro';
const pageRoutes = new Map(routes.flatMap(route => [[route.ro, route], [route.en, route]]));
const routeAliases = new Map([
  ['/pay-per-click/', '/agentie-google-ads/'],
  ['/en/ppc-advertising/', '/en/google-ads-agency/'],
]);
const ownHosts = new Set(['echipadetocilari.ro', 'www.echipadetocilari.ro']);

function attribute(tag, name) {
  return tag.match(new RegExp(`\\s${name}\\s*=\\s*(["'])(.*?)\\1`, 'i'))?.[2];
}

/**
 * Resolve scraped page links against the page they came from, before moving an
 * English copy to its new URL. `index.html` means the current page, whereas
 * `../index.html` means its parent. Declared routes and legacy Google Ads URLs
 * are rewritten to the current page URLs.
 *
 * Omit language to preserve a link's existing language. Set language to 'en'
 * when generating an English page; explicit hreflang links keep their target.
 */
export function normalizePageLinks(html, { pageUrl, language } = {}) {
  if (!pageUrl) throw new TypeError('normalizePageLinks requires the source pageUrl');
  if (language !== undefined && !['ro', 'en'].includes(language)) {
    throw new TypeError('normalizePageLinks language must be ro or en');
  }
  const base = new URL(pageUrl, productionOrigin);
  // Public page URLs can be passed with or without their trailing slash.
  if (pageRoutes.has(base.pathname + '/') || routeAliases.has(base.pathname + '/')) base.pathname += '/';

  // Script templates, comments and styles may contain quoted anchor markup;
  // they are not live links and must remain byte-for-byte intact.
  return html.replace(/<!--[\s\S]*?-->|<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>|<a\b[^>]*>/gi, tag => {
    if (!/^<a\b/i.test(tag) || /\sdownload(?:\s|=|>)/i.test(tag)) return tag;
    return tag.replace(/(\shref\s*=\s*)(["'])(.*?)\2/i, (match, prefix, quote, rawHref) => {
      const href = rawHref.trim();
      if (!href || href.startsWith('#')) return match;

      let url;
      try { url = new URL(href, base); } catch { return match; }
      if (!['http:', 'https:'].includes(url.protocol) || !ownHosts.has(url.hostname) ||
          url.port || url.username || url.password) return match;

      const pathname = url.pathname.replace(/\/index\.html$/, '/').replace(/\/?$/, '/');
      const canonicalPathname = routeAliases.get(pathname) || pathname;
      const route = pageRoutes.get(canonicalPathname);
      if (!route) return match;

      const hreflang = attribute(tag, 'hreflang')?.toLowerCase();
      const targetLanguage = ['ro', 'en'].includes(hreflang) ? hreflang : language;
      const target = targetLanguage ? route[targetLanguage] : canonicalPathname;
      // Preserve the source query/fragment exactly, including HTML entities.
      const suffix = href.match(/[?#][\s\S]*$/)?.[0] || '';
      return `${prefix}${quote}${target}${suffix}${quote}`;
    });
  });
}
