/**
 * Preload hints for what the first paint depends on: the LCP background image
 * of each page (otherwise the browser finds it only after the CSS has loaded)
 * and, on the pages that opt in, the Montserrat font files (otherwise the late
 * font swap shifts the layout).
 *
 * Fonts are opt-in per route: measured on the live site (Slow 4G, CPU 4x), the
 * two files remove the font-swap CLS of 0.16-0.21 on the pages that have one,
 * but cost 0.3-0.4 s of LCP everywhere because they compete with the CSS. The
 * local variable font made LCP worse and removed no shift, so it is not preloaded.
 *
 * Every href must be the exact root-relative URL the CSS resolves to, with no
 * query string, or the browser downloads the file twice. The hints are injected
 * right after the charset/viewport tags, before the first stylesheet.
 */
import { escapeAttr } from './html.mjs';

const GOOGLE_FONTS_CSS = /\/google-fonts\/css\/montserrat_ver=/;
// Montserrat normal, latin-ext and latin: the two files every page downloads.
const GOOGLE_FONT_FILES = [
  '/wp-content/uploads/elementor/google-fonts/fonts/montserrat-jtusjig1_i6t8kchkm459wlhyw.woff2',
  '/wp-content/uploads/elementor/google-fonts/fonts/montserrat-jtusjig1_i6t8kchkm459wdhyzbi.woff2',
];

function attr(attrs, name) {
  return attrs.match(new RegExp(`(?:^|\\s)${name}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, 'i'))?.[2];
}

function stylesheetHrefs(html) {
  const hrefs = [];
  for (const [, attrs] of html.matchAll(/<link\b([^>]*)>/gi)) {
    if (!/(?:^|\s)stylesheet(?:\s|$)/i.test(attr(attrs, 'rel') || '')) continue;
    const href = attr(attrs, 'href');
    if (href) hrefs.push(href);
  }
  return hrefs;
}

function preloadedKeys(html) {
  const keys = new Set();
  for (const [, attrs] of html.matchAll(/<link\b([^>]*)>/gi)) {
    if (!/^preload$/i.test(attr(attrs, 'rel') || '')) continue;
    keys.add(`${attr(attrs, 'href')}|${attr(attrs, 'media') || ''}`);
  }
  return keys;
}

const fontTag = (href) => ({
  key: `${href}|`,
  tag: `<link rel="preload" href="${escapeAttr(href)}" as="font" type="font/woff2" crossorigin>`,
});

const imageTag = ({ href, media }) => ({
  key: `${href}|${media || ''}`,
  tag: `<link rel="preload" href="${escapeAttr(href)}" as="image" fetchpriority="high"${
    media ? ` media="${escapeAttr(media)}"` : ''}>`,
});

/** End of the last meta charset/viewport tag, or of <head>, as an insertion offset. */
function insertionPoint(html) {
  const head = html.match(/<head\b[^>]*>/i);
  if (!head) return -1;
  let point = head.index + head[0].length;
  for (const re of [/<meta\b[^>]*\bcharset\s*=[^>]*>/i, /<meta\b[^>]*\bname\s*=\s*["']viewport["'][^>]*>/i]) {
    const meta = html.match(re);
    if (meta && meta.index >= point) point = Math.max(point, meta.index + meta[0].length);
  }
  return point;
}

/**
 * Add the preload hints a page needs, skipping any it already has.
 *
 * @param {string} html
 * @param {{ lcpImages?: { href: string, media?: string }[], fonts?: boolean }} [opts]
 */
export function addPreloadHints(html, { lcpImages = [], fonts = false } = {}) {
  const wanted = lcpImages.map(imageTag);
  if (fonts && stylesheetHrefs(html).some((href) => GOOGLE_FONTS_CSS.test(href))) {
    wanted.push(...GOOGLE_FONT_FILES.map(fontTag));
  }

  const have = preloadedKeys(html);
  const tags = [];
  for (const { key, tag } of wanted) {
    if (have.has(key)) continue;
    have.add(key);
    tags.push(tag);
  }
  const point = insertionPoint(html);
  if (!tags.length || point < 0) return html;
  return html.slice(0, point) + tags.map((tag) => `\n\t${tag}`).join('') + html.slice(point);
}
