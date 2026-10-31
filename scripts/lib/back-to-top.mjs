import { appendToBody, appendToHead } from './html.mjs';

const BUTTON = '.elementor-widget-button:has(a[href="#top"])';
// Inline, so the arrow is not painted before a stylesheet arrives. Without JS it stays visible.
const STYLE = `<style>/* ect-back-to-top */@media (scripting:enabled){${BUTTON}{opacity:0;visibility:hidden}html.ect-scrolled ${BUTTON}{opacity:1;visibility:visible}}@media (scripting:enabled) and (prefers-reduced-motion:no-preference){${BUTTON}{transition:opacity .2s,visibility .2s}}</style>`;
const SCRIPT = '<script src="/wp-content/ect-pages/back-to-top.js" defer></script>';

/** The arrow in the footer is fixed to the corner, so at the top of a page it only covers text. */
export function enhanceBackToTop(html) {
  if (!html.includes('href="#top"') || html.includes('/* ect-back-to-top */')) return html;
  return appendToBody(appendToHead(html, STYLE), SCRIPT);
}
