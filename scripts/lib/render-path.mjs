/**
 * Render-path trims for the first paint, applied to every page after the other
 * transforms: drops the unused dashicons stylesheet, moves the two blocking
 * jQuery scripts from the head to the body (right before the first executable
 * script, so deferred and inline scripts still see jQuery) and sizes the logo
 * to the width it is actually shown at instead of the 836px source.
 */

const DASHICONS_LINK = /<link\b[^>]*(?:\bid\s*=\s*["']dashicons-css["']|\/wp-includes\/css\/dashicons\.min)[^>]*>\s*/gi;
const JQUERY_IDS = ['jquery-core-js', 'jquery-migrate-js'];
const SCRIPT_OPEN = /<script\b([^>]*)>/gi;
const EXECUTABLE_TYPES = new Set(['', 'text/javascript', 'application/javascript', 'module']);

function attr(attrs, name) {
  return attrs.match(new RegExp(`(?:^|\\s)${name}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, 'i'))?.[2];
}

function jqueryTag(id) {
  return new RegExp(`<script\\b[^>]*\\bid\\s*=\\s*["']${id}["'][^>]*>\\s*</script>\\s*`, 'i');
}

function isExecutable(attrs) {
  const type = (attr(attrs, 'type') || '').trim().toLowerCase();
  return EXECUTABLE_TYPES.has(type);
}

function moveJquery(html) {
  const headEnd = html.search(/<\/head>/i);
  if (headEnd < 0) return html;
  let head = html.slice(0, headEnd);
  const rest = html.slice(headEnd);
  const moved = [];
  for (const id of JQUERY_IDS) {
    const m = head.match(jqueryTag(id));
    if (!m) continue;
    moved.push(m[0].trim());
    head = head.replace(m[0], '');
  }
  if (!moved.length) return html;

  const bodyStart = rest.search(/<body\b/i);
  let insertAt = -1;
  for (const m of rest.matchAll(SCRIPT_OPEN)) {
    if (m.index > bodyStart && isExecutable(m[1])) {
      insertAt = m.index;
      break;
    }
  }
  if (insertAt < 0) insertAt = rest.search(/<\/body>/i);
  if (insertAt < 0) return html;
  return head + rest.slice(0, insertAt) + moved.join('\n') + '\n' + rest.slice(insertAt);
}

function setAttr(tag, name, value) {
  const re = new RegExp(`(\\s${name}\\s*=\\s*)(["'])[\\s\\S]*?\\2`, 'i');
  if (re.test(tag)) return tag.replace(re, `$1"${value}"`);
  return tag.replace(/\s*\/?>$/, (end) => ` ${name}="${value}"${end}`);
}

function sizeLogos(html, container, sizes, isFooter) {
  const re = new RegExp(`(<${container}\\b[^>]*>)([\\s\\S]*?)(</${container}>)`, 'gi');
  return html.replace(re, (all, open, inner, close) => {
    inner = inner.replace(/<img\b[^>]*\bwp-image-3541\b[^>]*>/gi, (img) => {
      img = setAttr(img, 'sizes', sizes);
      if (isFooter) {
        if (!/\sloading\s*=/i.test(img)) img = setAttr(img, 'loading', 'lazy');
        if (!/\sdecoding\s*=/i.test(img)) img = setAttr(img, 'decoding', 'async');
        img = img.replace(/\sfetchpriority\s*=\s*(["'])[\s\S]*?\1/i, '');
      }
      return img;
    });
    return open + inner + close;
  });
}

export function optimizeRenderPath(html) {
  html = html.replace(DASHICONS_LINK, '');
  html = moveJquery(html);
  html = sizeLogos(html, 'header', '(max-width: 767px) 53px, 72px', false);
  html = sizeLogos(html, 'footer', '(max-width: 767px) 140px, 115px', true);
  return html;
}

export function validateRenderPath(html, urlPath) {
  const errors = [];
  if (DASHICONS_LINK.test(html)) {
    errors.push(`${urlPath}: dashicons stylesheet is still linked`);
  }
  DASHICONS_LINK.lastIndex = 0;
  const head = html.match(/<head\b[\s\S]*?<\/head>/i)?.[0] || '';
  for (const m of head.matchAll(SCRIPT_OPEN)) {
    const attrs = m[1];
    if (!/\bsrc\s*=/i.test(attrs)) continue;
    const type = (attr(attrs, 'type') || '').trim().toLowerCase();
    if (/(?:^|\s)(?:defer|async)(?:\s|=|$)/i.test(attrs) || type === 'module') continue;
    errors.push(`${urlPath}: blocking <script src="${attr(attrs, 'src')}"> in <head>`);
  }
  return errors;
}
