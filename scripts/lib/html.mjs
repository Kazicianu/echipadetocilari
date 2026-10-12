/**
 * HTML rewriting helpers shared by the RO enhancer (build-static.mjs)
 * and the EN generator (i18n/generate-en.mjs).
 *
 * Everything here is string-level on purpose: the mirror is byte-for-byte
 * Elementor output and a real DOM round-trip would reformat it.
 */

export const NOINDEX = 'noindex, nofollow, noarchive, nosnippet, noimageindex';

export function escapeAttr(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Insert markup immediately before </head>. */
export function appendToHead(html, snippet) {
  return html.replace(/<\/head>/i, `  ${snippet}\n</head>`);
}

/** Insert markup immediately before </body>. */
export function appendToBody(html, snippet) {
  return html.replace(/<\/body>/i, `  ${snippet}\n</body>`);
}

export function upsertTitle(html, title) {
  const tag = `<title>${escapeHtml(title)}</title>`;
  if (/<title[^>]*>[\s\S]*?<\/title>/i.test(html)) {
    return html.replace(/<title[^>]*>[\s\S]*?<\/title>/i, tag);
  }
  return appendToHead(html, tag);
}

/**
 * Replace (or add) a meta tag, then drop any later duplicates of it.
 * `attr` is a literal attribute pair, e.g. `name="description"`.
 */
export function upsertMeta(html, attr, value) {
  const re = new RegExp(`<meta\\s+[^>]*${escapeRe(attr)}[^>]*>`, 'gi');
  const tag = `<meta ${attr} content="${escapeAttr(value)}">`;
  let seen = false;
  if (re.test(html)) {
    re.lastIndex = 0;
    return html.replace(re, () => {
      if (seen) return '';
      seen = true;
      return tag;
    });
  }
  return appendToHead(html, tag);
}

export function setLang(html, lang) {
  return html.replace(/<html\b([^>]*)>/i, (_m, attrs) => {
    if (/\blang\s*=/i.test(attrs)) {
      return `<html${attrs.replace(/\blang\s*=\s*["'][^"']*["']/i, ` lang="${lang}"`)}>`;
    }
    return `<html lang="${lang}"${attrs}>`;
  });
}

/**
 * Drop every JSON-LD block already in the document.
 *
 * The mirror ships Rank Math's graph scraped from production — on the home page
 * that is a duplicated FAQPage plus an Article/Person left over from the theme
 * demo. Injecting our own schema on top produced conflicting entities, so we
 * always start from a clean slate and re-emit exactly what we mean.
 */
export function stripJsonLd(html) {
  return html.replace(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>\s*/gi,
    ''
  );
}

export function renderJsonLd(schemas) {
  return schemas
    .map(
      (s) =>
        `<script type="application/ld+json">${JSON.stringify(s).replace(/</g, '\\u003c')}</script>`
    )
    .join('\n');
}

/**
 * Single place where indexing is decided.
 *
 * The scraped pages carry Rank Math's `follow, index, max-snippet:-1…`, so a
 * page we do not explicitly want indexed has to have that meta removed, not
 * merely left alone.
 */
export function applyIndexPolicy(html, { indexable, canonical }) {
  html = html.replace(/<meta\s+[^>]*name=["'](?:robots|googlebot)["'][^>]*>\s*/gi, '');
  html = html.replace(/<link\s+rel=["']canonical["'][^>]*>\s*/gi, '');

  if (!indexable) {
    return appendToHead(
      html,
      `<meta name="robots" content="${NOINDEX}">\n  <meta name="googlebot" content="${NOINDEX}">`
    );
  }

  html = appendToHead(
    html,
    '<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">'
  );
  if (canonical) {
    html = appendToHead(html, `<link rel="canonical" href="${escapeAttr(canonical)}">`);
  }
  return html;
}

/** ro / en / x-default alternates; x-default points at Romanian (primary market). */
export function injectHreflang(html, { site, roPath, enPath }) {
  const ro = `${site}${roPath === '/' ? '/' : roPath}`;
  html = html.replace(/<link\s+rel=["']alternate["'][^>]*hreflang[^>]*>\s*/gi, '');
  if (!enPath) return html;
  const en = `${site}${enPath}`;
  return appendToHead(
    html,
    [
      `<link rel="alternate" hreflang="ro" href="${ro}">`,
      `  <link rel="alternate" hreflang="en" href="${en}">`,
      `  <link rel="alternate" hreflang="x-default" href="${ro}">`,
    ].join('\n')
  );
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
