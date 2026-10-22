/**
 * Privacy plumbing added to every built page (RO and EN) after the EN pages
 * are generated, so none of it passes through the translation dictionary:
 *
 * - footer: a link to the privacy policy and a "cookie settings" button
 *   (hidden until consent.js runs; without JS nothing is loaded to configure);
 * - head: consent.css and consent.js. Google Analytics is never in the static
 *   HTML; consent.js loads it only after the visitor accepts analytics cookies.
 *
 * Visible labels live in the COPY object of consent.js (one place to edit).
 */
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { appendToHead, escapeAttr, escapeHtml } from './html.mjs';

export const PRIVACY_PATHS = { ro: '/politica-de-confidentialitate/', en: '/en/privacy-policy/' };
export const GA_HOSTS = ['echipadetocilari.ro', 'www.echipadetocilari.ro'];
export const CONSENT_SCRIPT = '/wp-content/ect-pages/consent.js';
export const CONSENT_STYLESHEET = '/wp-content/ect-pages/consent.css';

const consentSource = new URL('../../legacy-mirror/wp-content/ect-pages/consent.js', import.meta.url);
let copyCache;

/** The COPY object of consent.js, evaluated on its own (no DOM, no globals). */
export function consentCopy() {
  if (!copyCache) {
    const source = readFileSync(consentSource, 'utf8');
    const block = source.match(/\bconst COPY = (\{[\s\S]*?\r?\n {2}\});\r?\n {2}\/\* ===== end COPY ===== \*\//);
    if (!block) throw new Error('consent.js: COPY block not found');
    copyCache = vm.runInNewContext(`(${block[1]})`, {});
  }
  return copyCache;
}

export function pageLanguage(html) {
  return /<html\b[^>]*\blang=["']en(?:[-"'])/i.test(html) ? 'en' : 'ro';
}

// The "PAGINI IMPORTANTE" / "IMPORTANT PAGES" list of the shared footer.
const FOOTER_LIST = /(<footer\b[\s\S]*?\belementor-element-3cc1c00\b(?:(?!<\/div>)[\s\S])*?<\/strong><\/p>\s*)<p>((?:(?!<\/p>)[\s\S])*)(<\/p>)/i;
export const FOOTER_LIST_CLASS = 'ect-footer-links';

/**
 * Append the policy link and the hidden cookie-settings button to the footer list.
 * The list gets FOOTER_LIST_CLASS, which consent.css lays out as even 44px rows.
 */
export function addFooterPrivacyLinks(html) {
  if (html.includes('data-ect-footer-privacy')) return html;
  if (!FOOTER_LIST.test(html)) throw new Error('footer "PAGINI IMPORTANTE" list (elementor-element-3cc1c00) not found');
  const language = pageLanguage(html);
  const copy = consentCopy()[language];
  return html.replace(FOOTER_LIST, (_match, before, list, close) =>
    `${before}<p class="${FOOTER_LIST_CLASS}">${list}<br><a href="${PRIVACY_PATHS[language]}" data-ect-footer-privacy>${escapeHtml(copy.footerPolicy)}</a>` +
    `<button type="button" class="ect-consent-open" data-ect-consent-open hidden>${escapeHtml(copy.footerSettings)}</button>${close}`);
}

/** Load consent.css and consent.js (deferred) with the GA4 ID and allowed hosts. */
export function addConsentManager(html, { gaId, gaHosts = GA_HOSTS } = {}) {
  if (!/^G-[A-Z0-9]+$/.test(gaId || '')) throw new Error(`invalid GA4 measurement ID: ${gaId}`);
  if (html.includes(`src="${CONSENT_SCRIPT}"`)) return html;
  const language = pageLanguage(html);
  return appendToHead(html,
    `<link rel="stylesheet" href="${CONSENT_STYLESHEET}">\n` +
    `  <script src="${CONSENT_SCRIPT}" data-ga-id="${escapeAttr(gaId)}" data-ga-hosts="${escapeAttr(gaHosts.join(' '))}" data-policy="${PRIVACY_PATHS[language]}#cookies" defer></script>`);
}
