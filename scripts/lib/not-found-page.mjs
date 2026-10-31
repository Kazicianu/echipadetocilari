/**
 * The 404 page, built from the privacy page so it inherits the shared header,
 * contact form and footer without a second copy of that markup in git.
 *
 * One file serves both languages (the host cannot pick by path): Romanian copy
 * plus a line in English. It is always noindex and sits outside the routes,
 * the sitemap and llms.txt.
 */
import { absolutizeAssets } from '../i18n/generate-en.mjs';
import { injectLangSwitcher } from '../i18n/lang-switcher.mjs';
import { upsertMeta, upsertTitle } from './html.mjs';
import { normalizePageLinks } from './navigation.mjs';

export const NOT_FOUND_TEMPLATE_URL = '/politica-de-confidentialitate/';
export const NOT_FOUND_TITLE = 'Pagina nu există | Echipa de Tocilari';
export const NOT_FOUND_DESCRIPTION =
  'Pagina căutată nu există sau a fost mutată. Întoarce-te la prima pagină sau scrie-ne.';

const TEMPLATE_STYLESHEET = '/wp-content/ect-pages/politica-de-confidentialitate.css';
const STYLESHEET = '/wp-content/ect-pages/not-found.css';

const MAIN = `<main id="content" class="ect-page ect-page--not-found">
<div class="ect-not-found">
<p class="ect-not-found__eyebrow">Eroare 404</p>
<h1>Pagina nu există</h1>
<p class="ect-not-found__text">Adresa poate fi greșită sau pagina a fost mutată.</p>
<div class="ect-not-found__actions">
<a class="ect-nf-btn ect-nf-btn--primary" href="/">Prima pagină</a>
<a class="ect-nf-btn ect-nf-btn--outline" href="/#servicii">Serviciile noastre</a>
<a class="ect-nf-btn ect-nf-btn--outline" href="#formular_contact_bottom">Scrie-ne</a>
</div>
<p class="ect-not-found__en" lang="en">Page not found. <a href="/en/" hreflang="en">Go to the English homepage</a>.</p>
</div>
</main>`;

/**
 * @param {string} templateHtml raw source of legacy-mirror/politica-de-confidentialitate/index.html
 * @returns {string} the page, before the per-page build steps every page shares
 */
export function buildNotFoundPage(templateHtml) {
  let html = normalizePageLinks(templateHtml, { pageUrl: NOT_FOUND_TEMPLATE_URL });
  html = absolutizeAssets(html);

  const main = /<main\b[^>]*\bid=["']content["'][^>]*>[\s\S]*?<\/main>/i;
  if (!main.test(html)) throw new Error('404 page: <main id="content"> not found in the privacy page template');
  html = html.replace(main, () => MAIN);

  if (!html.includes(TEMPLATE_STYLESHEET)) {
    throw new Error(`404 page: ${TEMPLATE_STYLESHEET} not found in the privacy page template`);
  }
  html = html.split(TEMPLATE_STYLESHEET).join(STYLESHEET);

  html = html.replace(/<link\b[^>]*\brel=["']canonical["'][^>]*>[ \t]*\r?\n?/gi, '');
  html = html.replace(/<meta\b[^>]*\b(?:property|name)=["'](?:og|twitter):[^"']*["'][^>]*>[ \t]*\r?\n?/gi, '');
  html = upsertTitle(html, NOT_FOUND_TITLE);
  html = upsertMeta(html, 'name="description"', NOT_FOUND_DESCRIPTION);

  return injectLangSwitcher(html, 'ro', '/');
}
