/**
 * Accessible names for the footer links that hold only an icon: the Facebook
 * and LinkedIn squares and the back-to-top arrow. Elementor leaves them empty,
 * so a screen reader announces just "link".
 */
import { pageLanguage } from './privacy.mjs';

export const FACEBOOK_URL = 'https://www.facebook.com/EchipadeTocilari/';
export const LINKEDIN_URL = 'https://www.linkedin.com/company/echipa-de-tocilari/';
export const BACK_TO_TOP = { ro: 'Înapoi sus', en: 'Back to top' };

// Anchors are only read outside comments, scripts and styles.
const TOKENS = /<!--[\s\S]*?-->|<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>|<a\b[^>]*>/gi;

function hrefOf(tag) {
  return tag.match(/\shref\s*=\s*(["'])(.*?)\1/i)?.[2]?.toLowerCase();
}

export function hasAriaLabel(tag) {
  return /\saria-label\s*=\s*(["'])[^"']*\S[^"']*\1/i.test(tag);
}

/** Icon-only footer links that must carry an accessible name, with the name each one gets. */
export function footerIconLinks(html) {
  return [
    { href: FACEBOOK_URL, label: 'Facebook' },
    { href: LINKEDIN_URL, label: 'LinkedIn' },
    { href: '#top', label: BACK_TO_TOP[pageLanguage(html)] },
  ];
}

/** Add the aria-label, keep an existing one, and fail when a link is missing. */
export function nameFooterIconLinks(html) {
  const labels = new Map(footerIconLinks(html).map(({ href, label }) => [href.toLowerCase(), label]));
  const seen = new Set();
  const out = html.replace(TOKENS, (tag) => {
    if (!/^<a\b/i.test(tag)) return tag;
    const href = hrefOf(tag);
    if (!labels.has(href)) return tag;
    seen.add(href);
    return hasAriaLabel(tag) ? tag : tag.replace(/^<a\b/i, `<a aria-label="${labels.get(href)}"`);
  });
  for (const href of labels.keys()) {
    if (!seen.has(href)) throw new Error(`footer link ${href} not found; cannot give it an accessible name`);
  }
  return out;
}

/** Build-time check for validate.mjs: the hrefs of those icon links that still lack a name. */
export function unnamedFooterIconLinks(html) {
  const wanted = new Set(footerIconLinks(html).map(({ href }) => href.toLowerCase()));
  const unnamed = [];
  for (const [tag] of html.matchAll(TOKENS)) {
    if (!/^<a\b/i.test(tag)) continue;
    const href = hrefOf(tag);
    if (wanted.has(href) && !hasAriaLabel(tag)) unnamed.push(href);
  }
  return unnamed;
}
