/**
 * Open Graph / Twitter tags shared by the RO build and the EN generator.
 *
 * The mirror still carries Rank Math's WordPress output: 2024 article
 * timestamps, "Written by" / "Time to read" labels, `og:locale` en_US on
 * Romanian pages and image URLs relative to the page (which break on /en/).
 * Pages listed in `og-pages.mjs` get their own 1200x630 share image (see
 * `scripts/og/make-og-images.mjs`); any other page without an image gets the
 * default 1200x630 one, with a `summary_large_image` card.
 */
import { upsertMeta } from './html.mjs';
import { defaultOgImage, ogImagePath, ogImageSize, ogPages } from './og-pages.mjs';

export const fallbackOgImage = defaultOgImage;

const ogByPage = new Map(ogPages.map((entry) => [entry.page, entry]));

const ownHosts = new Set(['echipadetocilari.ro', 'www.echipadetocilari.ro']);
const staleMeta =
  /<meta\s+[^>]*(?:property=["'](?:og:updated_time|article:[\w:]+)["']|name=["']twitter:(?:label|data)\d+["'])[^>]*>\s*/gi;
const ownImageMeta =
  /[ \t]*<meta\s+[^>]*(?:property=["']og:image(?::\w+)?["']|name=["']twitter:image(?::alt)?["'])[^>]*>[ \t]*(?:\r?\n)?/gi;
const imageMeta =
  /(<meta\s+[^>]*(?:property=["']og:image(?::secure_url)?["']|name=["']twitter:image["'])[^>]*\scontent=["'])([^"']*)(["'])/gi;

function absoluteUrl(value, site, pageUrl) {
  const url = new URL(value, `${site}${pageUrl}`);
  return ownHosts.has(url.hostname) ? `${site}${url.pathname}${url.search}` : url.href;
}

function setImage(html, image) {
  html = upsertMeta(html, 'property="og:image"', image.url);
  html = upsertMeta(html, 'property="og:image:width"', String(image.width));
  html = upsertMeta(html, 'property="og:image:height"', String(image.height));
  html = upsertMeta(html, 'property="og:image:alt"', image.alt);
  html = upsertMeta(html, 'property="og:image:type"', image.type);
  html = upsertMeta(html, 'name="twitter:image"', image.url);
  html = upsertMeta(html, 'name="twitter:image:alt"', image.alt);
  return upsertMeta(html, 'name="twitter:card"', 'summary_large_image');
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

  const entry = ogByPage.get(pageUrl);
  if (entry) {
    html = html.replace(ownImageMeta, '');
    html = setImage(html, {
      url: `${site}${ogImagePath(entry.slug)}`,
      ...ogImageSize,
      type: 'image/jpeg',
      alt: entry.alt,
    });
  } else if (!/<meta\s+[^>]*property=["']og:image["']/i.test(html)) {
    html = setImage(html, { url: `${site}${defaultOgImage.path}`, ...defaultOgImage });
  }
  return html;
}
