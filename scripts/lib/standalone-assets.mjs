/** Keep the exported presentation assets; remove WordPress server/editor hooks. */
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const siteOrigin = 'https://www.echipadetocilari.ro';
const assetAliases = new Map([
  ['/wp-includes/js/dist/hooks.min_ver=7496969728ca0f95732d.js', '/wp-content/ect-pages/vendor/wp-hooks.min.js'],
  ['/wp-includes/js/dist/i18n.min_ver=781d11515ad3d91786ec.js', '/wp-content/ect-pages/vendor/wp-i18n.min.js'],
  ['/wp-includes/css/dist/block-library/style.min_ver=7.0.2.css', '/wp-content/ect-pages/vendor/wp-block-library.min.css'],
]);

const unusedScriptIds = new Set([
  'react-js', 'react-dom-js', 'wp-escape-html-js', 'wp-element-js', 'wp-dom-ready-js',
  'portfolio-front-block-script-js', 'portfolio-front-block-script-js-extra',
  'starter-templates-zip-preview-js', 'starter-templates-zip-preview-js-extra',
  'astra-portfolio-magnific-popup-js', 'wp-emoji-settings',
]);
const unusedScriptPaths = /(?:\/wp-includes\/js\/dist\/(?:vendor\/react(?:-dom)?|escape-html|element|dom-ready)\.min|\/astra-portfolio\/dist\/fscript|\/astra-pro-sites\/|\/astra-portfolio\/assets\/vendor\/js\/min\/magnific-popup)/;

function attr(attrs, name) {
  return attrs.match(new RegExp(`(?:^|\\s)${name}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, 'i'))?.[2];
}

/** Both languages must use root URLs, including srcset and inline backgrounds. */
function assetUrl(value) {
  const normalized = value
    .replace(/^https?:\/\/(?:www\.)?echipadetocilari\.ro(?=\/wp-(?:content|includes)\/)/i, '')
    .replace(/^(?:\.\.?\/)*(?=wp-(?:content|includes)\/)/i, '/')
    .replace(/_ver%3D/gi, '_ver=');
  return assetAliases.get(normalized) || normalized;
}

function cleanFrontendConfig(body, variable) {
  const match = body.match(new RegExp(`\\bvar\\s+${variable}\\s*=\\s*(\\{[\\s\\S]*?\\});`));
  if (!match) return body;
  const config = JSON.parse(match[1]);
  delete config.ajaxurl;
  delete config.nonce;
  delete config.nonces;
  if (config.urls) {
    delete config.urls.ajaxurl;
    delete config.urls.rest;
  }
  // is_static disables Elementor's display handlers; retain its original value.
  return body.replace(match[1], JSON.stringify(config).replace(/</g, '\\u003c'));
}

/**
 * Apply after portfolio/contact replacement (before or after language generation).
 * Pure transform: the source mirror remains untouched and assets ship in the build.
 */
export function makeStandaloneAssets(html) {
  html = html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>\s*/gi, (tag, attrs, body) => {
    const id = attr(attrs, 'id');
    const src = attr(attrs, 'src');
    if (unusedScriptIds.has(id) || (src && unusedScriptPaths.test(assetUrl(src))) ||
        (!src && /getElementById\(["']wp-emoji-settings["']\)/.test(body))) return '';
    if (id === 'elementor-frontend-js-before') {
      return tag.replace(body, cleanFrontendConfig(body, 'elementorFrontendConfig'));
    }
    if (id === 'elementor-pro-frontend-js-before') {
      return tag.replace(body, cleanFrontendConfig(body, 'ElementorProFrontendConfig'));
    }
    return tag;
  });

  html = html.replace(/<link\b([^>]*)>\s*/gi, (tag, attrs) => {
    const href = (attr(attrs, 'href') || '').replaceAll('&amp;', '&');
    if (/\/(?:wp-json(?:\/|\?)|xmlrpc\.php(?:\?|$))/.test(href) ||
        /\/astra-portfolio\/dist\/fscript/.test(href)) return '';
    return tag;
  });

  html = html.replace(/\b(src|href|poster|data-src|data-lazy-src)\s*=\s*(["'])(.*?)\2/gi,
    (_match, name, quote, value) => `${name}=${quote}${assetUrl(value)}${quote}`);
  html = html.replace(/\b(srcset|data-srcset)\s*=\s*(["'])(.*?)\2/gi,
    (_match, name, quote, value) => `${name}=${quote}${value.split(',').map(candidate =>
      candidate.replace(/^(\s*)(\S+)/, (_part, space, url) => space + assetUrl(url))).join(',')}${quote}`);
  html = html.replace(/url\(\s*(["']?)([^\s)'"<>]+)\1\s*\)/gi,
    (_match, quote, url) => `url(${quote}${assetUrl(url)}${quote})`);
  // Elementor stores the Lottie source in HTML-escaped JSON.
  html = html.replace(/https?:\\\/\\\/(?:www\.)?echipadetocilari\.ro(?=\\\/wp-(?:content|includes)\\\/)/gi, '');
  return html;
}

// Lazy-loaded assets aren't discoverable from <script src> alone. Keep this
// small list tied to the actual widgets in the eleven source pages.
export const standaloneRuntimeAssets = [
  '/wp-content/ect-pages/home/faq-mascot-3d-v2.js',
  '/wp-content/ect-pages/home/three.module.min.js',
  '/wp-content/ect-pages/vendor/wp-hooks.min.js',
  '/wp-content/ect-pages/vendor/wp-i18n.min.js',
  '/wp-content/plugins/elementor/assets/js/397f2d183c19202777d6.bundle.min.js',
  '/wp-content/plugins/elementor/assets/js/lightbox.570c05c5a283cfb6b223.bundle.min.js',
  '/wp-content/plugins/elementor/assets/js/progress.0ea083b809812c0e3aa1.bundle.min.js',
  '/wp-content/plugins/elementor/assets/js/toggle.2a177a3ef4785d3dfbc5.bundle.min.js',
  '/wp-content/plugins/elementor/assets/js/image-carousel.6167d20b95b33386757b.bundle.min.js',
  '/wp-content/plugins/elementor/assets/js/text-editor.45609661e409413f1cef.bundle.min.js',
  '/wp-content/plugins/elementor/assets/js/shared-frontend-handlers.03caa53373b56d3bab67.bundle.min.js',
  '/wp-content/plugins/elementor/assets/js/section-frontend-handlers.d85ab872da118940910d.bundle.min.js',
  '/wp-content/plugins/elementor-pro/assets/js/9b04c343e8243ec13400.bundle.min.js',
  '/wp-content/plugins/elementor-pro/assets/js/carousel.3620fca501cb18163600.bundle.min.js',
  '/wp-content/plugins/elementor-pro/assets/js/countdown.0e9e688751d29d07a8d3.bundle.min.js',
  '/wp-content/plugins/elementor-pro/assets/js/lottie.e74a53bfa4c0bd939250.bundle.min.js',
  '/wp-content/plugins/elementor-pro/assets/js/nav-menu.a23fbd67486c5bedf26c.bundle.min.js',
  '/wp-content/plugins/elementor/assets/lib/dialog/dialog.min.js',
  '/wp-content/plugins/elementor/assets/lib/share-link/share-link.min.js',
  '/wp-content/plugins/elementor/assets/lib/swiper/v8/swiper.min.js',
  '/wp-content/plugins/elementor/assets/lib/swiper/v8/css/swiper.min.css',
  '/wp-content/plugins/elementor/assets/css/conditionals/lightbox.min.css',
  '/wp-content/plugins/elementor/assets/css/conditionals/dialog.min.css',
  '/wp-content/plugins/elementor-pro/assets/lib/lottie/lottie.min.js',
];

/** Check the asset closure, including CSS, responsive images and widget JSON. */
export function validateStandaloneAssets({ outDir, files, urlPathOf }) {
  const errors = new Set();
  const cssSeen = new Set();
  const inspectUrl = (raw, base, label) => {
    if (!raw || /^(?:data:|#|mailto:|tel:|javascript:)/i.test(raw) || raw.includes('{{')) return;
    let url;
    try { url = new URL(raw.replaceAll('&amp;', '&'), siteOrigin + base); } catch { return; }
    if (!['http:', 'https:'].includes(url.protocol) ||
        !['www.echipadetocilari.ro', 'echipadetocilari.ro'].includes(url.hostname)) return;
    const local = path.join(outDir, decodeURIComponent(url.pathname));
    if (!existsSync(local) || !statSync(local).isFile()) {
      errors.add(`${label}: missing asset ${url.pathname}`);
      return;
    }
    if (url.pathname.endsWith('.css') && !cssSeen.has(local)) {
      cssSeen.add(local);
      inspectCss(readFileSync(local, 'utf8'), url.pathname, url.pathname);
    }
  };
  const inspectCss = (text, base, label) => {
    for (const [, value] of text.matchAll(/url\(\s*["']?([^\s)'"<>]+)/gi)) inspectUrl(value, base, label);
  };

  for (const file of files) {
    const html = readFileSync(file, 'utf8');
    const base = urlPathOf(file);
    // Script templates can contain image tags; these are data, not DOM nodes.
    const markup = html.replace(/<script\b(?![^>]*\bsrc\s*=)[^>]*>[\s\S]*?<\/script>/gi, '');
    for (const [, tag, attrs] of markup.matchAll(/<(script|link|img|source|video|audio|iframe)\b([^>]*)>/gi)) {
      const key = tag.toLowerCase() === 'link' ? 'href' : 'src';
      if (key === 'href' && !/^(?:stylesheet|icon|shortcut icon|apple-touch-icon|preload)$/i.test(attr(attrs, 'rel') || '')) continue;
      inspectUrl(attr(attrs, key), base, base);
      if (tag.toLowerCase() === 'video') inspectUrl(attr(attrs, 'poster'), base, base);
    }
    for (const [, value] of markup.matchAll(/\bsrcset=["']([^"']+)/gi)) {
      for (const candidate of value.split(',')) inspectUrl(candidate.trim().split(/\s+/)[0], base, base);
    }
    inspectCss(markup, base, base);
    for (const [, raw] of markup.matchAll(/data-settings="([^"]*)"/gi)) {
      let settings;
      try { settings = JSON.parse(raw.replaceAll('&quot;', '"').replaceAll('&#039;', "'").replaceAll('&amp;', '&')); }
      catch { continue; }
      const animation = settings.animation || settings._animation;
      if (animation && animation !== 'none') {
        inspectUrl(`/wp-content/plugins/elementor/assets/lib/animations/styles/${animation}.min.css`, base, base);
      }
      for (const key of ['source_json', 'custom_json_url']) {
        if (settings[key]?.url) inspectUrl(settings[key].url, base, base);
      }
    }
  }
  for (const asset of standaloneRuntimeAssets) inspectUrl(asset, '/', 'Elementor runtime');
  return [...errors];
}
