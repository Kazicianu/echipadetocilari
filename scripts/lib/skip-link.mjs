/**
 * The skip link in the page shell points at #content. Keep its text in Romanian
 * (the EN pages translate it through the dictionary) and make sure the target
 * exists exactly once: Elementor-built pages have no <main id="content">, so the
 * page wrapper becomes the target.
 */
const SKIP_LINK = /(<a\b[^>]*\bclass\s*=\s*["'][^"']*\bskip-link\b[^"']*["'][^>]*>)[^<]*(<\/a>)/i;
const WP_PAGE_WRAPPER = /<div(\s[^>]*\bdata-elementor-type\s*=\s*["']wp-page["'][^>]*)>/i;

export const SKIP_LINK_TEXT = 'Sari la conținut';

/** Markup without inline scripts and comments, so strings inside them never count. */
function markupOf(html) {
  return html.replace(/<script\b[\s\S]*?<\/script>|<!--[\s\S]*?-->/gi, '');
}

export function skipTargetCount(html) {
  return (markupOf(html).match(/<[a-z][^>]*\sid\s*=\s*["']content["']/gi) || []).length;
}

export function fixSkipLink(html) {
  html = html.replace(SKIP_LINK, `$1${SKIP_LINK_TEXT}$2`);
  if (skipTargetCount(html) > 0) return html;
  return html.replace(WP_PAGE_WRAPPER, (tag, attrs) =>
    /\sid\s*=/i.test(attrs) ? tag : `<div id="content" role="main" tabindex="-1"${attrs}>`);
}

/** Build-time check: a page with a skip link needs exactly one #content target. */
export function validateSkipLink(html, label) {
  if (!SKIP_LINK.test(html)) return [];
  const count = skipTargetCount(html);
  return count === 1 ? [] : [`${label}: skip link needs exactly one id="content", found ${count}`];
}
