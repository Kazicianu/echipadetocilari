/**
 * Open Graph / Twitter tags shared by the RO build and the EN generator.
 *
 * The mirror still carries Rank Math's WordPress output: 2024 article
 * timestamps, "Written by" / "Time to read" labels, `og:locale` en_US on
 * Romanian pages and image URLs relative to the page (which break on /en/).
 * Share previews need absolute image URLs, so pages without their own image
 * get the square logo with a `summary` card.
 */
import { upsertMeta } from './html.mjs';

export const fallbackOgImage = {
  path: '/wp-content/uploads/2024/02/Logo_Echipa_de_Tocilari-1024x1024.webp',
  width: 1024,
  height: 1024,
  type: 'image/webp',
  alt: 'Logo Echipa de Tocilari',
};

const ownHosts = new Set(['echipadetocilari.ro', 'www.echipadetocilari.ro']);
const staleMeta =
  /<meta\s+[^>]*(?:property=["'](?:og:updated_time|article:[\w:]+)["']|name=["']twitter:(?:label|data)\d+["'])[^>]*>\s*/gi;
const imageMeta =
  /(<meta\s+[^>]*(?:property=["']og:image(?::secure_url)?["']|name=["']twitter:image["'])[^>]*\scontent=["'])([^"']*)(["'])/gi;

function absoluteUrl(value, site, pageUrl) {
  const url = new URL(value, `${site}${pageUrl}`);
  return ownHosts.has(url.hostname) ? `${site}${url.pathname}${url.search}` : url.href;
}

/**
 * @param {string} html
 * @param {object} opts
 * @param {string} opts.site     origin without trailing slash
 * @param {string} opts.pageUrl  public path of the page, e.g. /contact/
 * @param {string} opts.locale   ro_RO or en_US
 */
export function normalizeSocialMeta(html, { site, pageUrl, locale }) {
  html = html.replace(staleMeta, '');
  html = upsertMeta(html, 'property="og:locale"', locale);
  html = upsertMeta(html, 'property="og:type"', 'website');
  html = html.replace(imageMeta, (_m, start, value, end) => `${start}${absoluteUrl(value, site, pageUrl)}${end}`);

  if (!/<meta\s+[^>]*property=["']og:image["']/i.test(html)) {
    const image = fallbackOgImage;
    const url = `${site}${image.path}`;
    html = upsertMeta(html, 'property="og:image"', url);
    html = upsertMeta(html, 'property="og:image:width"', String(image.width));
    html = upsertMeta(html, 'property="og:image:height"', String(image.height));
    html = upsertMeta(html, 'property="og:image:alt"', image.alt);
    html = upsertMeta(html, 'property="og:image:type"', image.type);
    html = upsertMeta(html, 'name="twitter:image"', url);
    html = upsertMeta(html, 'name="twitter:card"', 'summary');
  }
  return html;
}
