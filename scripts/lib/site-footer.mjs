/**
 * The shared site footer (RO, EN and 404) in the Metricra layout: the logo with the two social
 * discs stacked under it, then Services, Company, Contact and Legal, and the coffee-cup signature,
 * all on the cloudy sky of the balcony illustration. Runs in the second build loop, after the EN
 * pages exist, so the footer never passes through the translation dictionary.
 *
 * Only what the law and good practice need stays here (decided 23.11.2026): the company details
 * required by Law 365/2002 art. 5 and Law 31/1990 art. 74 live on the terms page linked under
 * Legal; the privacy policy link (GDPR art. 12-13) and the cookie-settings button (Law 506/2004
 * art. 4, GDPR art. 7(3)) stay on every page.
 *
 * The <footer> tag keeps its Elementor attributes (class elementor-3355) because
 * the fixed "back to top" widget is positioned by post-3355.css, and the widget
 * is carried over unchanged. Everything else is rebuilt here from `routes`,
 * `roOrg`/`enOrg`, consent.js and footer-a11y.mjs. Styles: site-footer.css.
 * Documented in docs/design-system/components/Footer/.
 */
import { routes } from '../i18n/routes.mjs';
import { roOrg } from '../i18n/meta-ro.mjs';
import { enOrg } from '../i18n/dictionary.mjs';
import { appendToHead, escapeAttr, escapeHtml } from './html.mjs';
import { BACK_TO_TOP, FACEBOOK_URL, LINKEDIN_URL } from './footer-a11y.mjs';
import { PRIVACY_PATHS, consentCopy, pageLanguage } from './privacy.mjs';

export const FOOTER_STYLESHEET = '/wp-content/ect-pages/site-footer.css';
export const FOOTER_MARK = 'data-ect-footer="2"';
export const TERMS_PATHS = { ro: '/termeni-si-conditii/', en: '/en/terms-and-conditions/' };
const FOOTER = /<footer\b[^>]*\belementor-location-footer\b[^>]*>[\s\S]*?<\/footer>/i;

const LOGO_BASE = '/wp-content/uploads/2024/02/Logo_Echipa_de_Tocilari-e1708028624694';
const ART_BASE = '/wp-content/ect-pages/footer/balconul-tocilarilor';
const CUP = '/wp-content/ect-pages/footer/pahar-cafea.webp';
const EMAIL = 'contact@echipadetocilari.ro';
const COMPANY_PATHS = ['/despre-noi/', '/portofoliu/'];

const COPY = {
  ro: {
    home: '/',
    logoAlt: 'Logo Echipa de Tocilari',
    services: 'Servicii',
    company: 'Companie',
    contact: 'Contact',
    legal: 'Legal',
    terms: 'Termeni și condiții',
    madeWith: 'Făcut cu',
    cupAlt: 'cafea',
    madeBy: 'de',
    org: roOrg,
  },
  en: {
    home: '/en/',
    logoAlt: 'Echipa de Tocilari logo',
    services: 'Services',
    company: 'Company',
    contact: 'Contact',
    legal: 'Legal',
    terms: 'Terms and conditions',
    madeWith: 'Made with',
    cupAlt: 'coffee',
    madeBy: 'by',
    org: enOrg,
  },
};

/** Monoline marks on a 24px grid, drawn inside the white disc (the disc is the frame, not the SVG). */
const SOCIAL_MARKS = {
  facebook: ['M15.5 5H14a3 3 0 0 0-3 3v11', 'M8.5 10.5h6.5'],
  linkedin: ['M7.25 7.5v.01', 'M7.25 11v6', 'M11.25 17v-6', 'M11.25 13.75a2.75 2.75 0 0 1 5.5 0V17'],
};

const ARROW_UP = 'M34.9 289.5l-22.2-22.2c-9.4-9.4-9.4-24.6 0-33.9L207 39c9.4-9.4 24.6-9.4 33.9 0l194.3 194.3c9.4 9.4 9.4 24.6 0 33.9L413 289.4c-9.5 9.5-25 9.3-34.3-.4L264 168.6V456c0 13.3-10.7 24-24 24h-32c-13.3 0-24-10.7-24-24V168.6L69.2 289.1c-9.3 9.8-24.8 10-34.3.4z';

const mark = (paths) => `<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">${paths.map((d) => `<path d="${d}"></path>`).join('')}</svg>`;

/** The "back to top" widget, identical to the Elementor one it replaces (the label comes from footer-a11y.mjs). */
function backToTop(label) {
  return ` <div class="elementor-element elementor-element-78c37fa2 elementor-widget__width-initial elementor-fixed elementor-widget elementor-widget-button" data-id="78c37fa2" data-element_type="widget" data-e-type="widget" data-settings="{&quot;_position&quot;:&quot;fixed&quot;}" data-widget_type="button.default">
  <div class="elementor-widget-container">
   <div class="elementor-button-wrapper">
    <a aria-label="${escapeAttr(label)}" class="elementor-button elementor-button-link elementor-size-md elementor-animation-grow" href="#top">
     <span class="elementor-button-content-wrapper">
      <span class="elementor-button-icon"><svg aria-hidden="true" class="e-font-icon-svg e-fas-arrow-up" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg"><path d="${ARROW_UP}"></path></svg></span>
     </span>
    </a>
   </div>
  </div>
 </div>`;
}

const list = (items, language) => `<ul>${items.map((route) => {
  const label = language === 'en' ? route.labelEn : route.labelRo;
  return `<li><a href="${escapeAttr(route[language])}">${escapeHtml(label)}</a></li>`;
}).join('')}</ul>`;

/** 0750 203 466 (RO) or +40 750 203 466 (EN) from +40750203466. */
function displayPhone(telephone, language) {
  const digits = telephone.replace(/^\+40/, '');
  const groups = `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  return language === 'en' ? `+40 ${groups}` : `0${groups}`;
}

/** The footer element for one language; `openTag` is the existing opening tag, already marked. */
export function footerMarkup(language, openTag) {
  const copy = COPY[language];
  const consent = consentCopy()[language];
  const has = (route) => Boolean(route[language]);
  const serviceRoutes = routes.filter((route) => route.service && has(route));
  const companyRoutes = COMPANY_PATHS.map((ro) => {
    const route = routes.find((item) => item.ro === ro);
    if (!route) throw new Error(`site footer: route ${ro} not found`);
    return route;
  }).filter(has);
  const tel = copy.org.telephone;
  const logo = escapeAttr(LOGO_BASE);
  return `${openTag}
 <div class="ect-footer__inner">
  <div class="ect-footer__top">
   <div class="ect-footer__brand">
    <a class="ect-footer__logo" href="${escapeAttr(copy.home)}"><img src="${logo}.webp" srcset="${logo}-288x300.webp 288w, ${logo}-768x799.webp 768w, ${logo}.webp 836w" sizes="(max-width: 919px) 80px, 100px" width="836" height="870" alt="${escapeAttr(copy.logoAlt)}" loading="lazy" decoding="async"></a>
    <ul class="ect-footer__social">
     <li><a href="${FACEBOOK_URL}" aria-label="Facebook">${mark(SOCIAL_MARKS.facebook)}</a></li>
     <li><a href="${LINKEDIN_URL}" aria-label="LinkedIn">${mark(SOCIAL_MARKS.linkedin)}</a></li>
    </ul>
   </div>
   <nav class="ect-footer__col ect-footer__col--services" aria-label="${escapeAttr(copy.services)}"><p class="ect-footer__label">${escapeHtml(copy.services)}</p>${list(serviceRoutes, language)}</nav>
   <nav class="ect-footer__col ect-footer__col--company" aria-label="${escapeAttr(copy.company)}"><p class="ect-footer__label">${escapeHtml(copy.company)}</p>${list(companyRoutes, language)}</nav>
   <div class="ect-footer__col ect-footer__col--contact">
    <p class="ect-footer__label">${escapeHtml(copy.contact)}</p>
    <address class="ect-footer__contact"><a href="tel:${escapeAttr(tel)}">${escapeHtml(displayPhone(tel, language))}</a><a href="mailto:${EMAIL}">${EMAIL}</a></address>
   </div>
   <nav class="ect-footer__col ect-footer__col--legal" aria-label="${escapeAttr(copy.legal)}"><p class="ect-footer__label">${escapeHtml(copy.legal)}</p><ul><li><a href="${escapeAttr(TERMS_PATHS[language])}">${escapeHtml(copy.terms)}</a></li><li><a href="${escapeAttr(PRIVACY_PATHS[language])}" data-ect-footer-privacy>${escapeHtml(consent.footerPolicy)}</a></li><li><button type="button" class="ect-consent-open" data-ect-consent-open hidden>${escapeHtml(consent.footerSettings)}</button></li></ul></nav>
  </div>
  <p class="ect-footer__madewith">${escapeHtml(copy.madeWith)} <img class="ect-footer__cup" src="${CUP}" width="117" height="128" alt="${escapeAttr(copy.cupAlt)}" loading="lazy" decoding="async"> ${escapeHtml(copy.madeBy)} <a class="ect-footer__team" href="${escapeAttr(copy.home)}">Echipa de Tocilari</a></p>
 </div>
 <div class="ect-footer__art" aria-hidden="true"><img src="${ART_BASE}-1152.webp" srcset="${ART_BASE}-768.webp 768w, ${ART_BASE}-1152.webp 1152w, ${ART_BASE}-1536.webp 1536w, ${ART_BASE}-1858.webp 1858w" sizes="(max-width: 639px) 580px, 100vw" width="1858" height="941" alt="" loading="lazy" decoding="async"></div>
${backToTop(BACK_TO_TOP[language])}
</footer>`;
}

/** Mark the Elementor opening tag: add ect-footer to class and data-ect-footer="2". */
function markOpenTag(tag) {
  const withClass = tag.replace(/\bclass=(["'])([^"']*)\1/i, (_m, quote, value) => `class=${quote}${value} ect-footer${quote}`);
  if (withClass === tag) throw new Error('site footer: <footer> has no class attribute');
  return withClass.replace(/>$/, ` ${FOOTER_MARK}>`);
}

/** Replace the Elementor footer with the site footer and load its stylesheet once. */
export function renderSiteFooter(html) {
  if (html.includes(FOOTER_MARK)) return html;
  if (!FOOTER.test(html)) throw new Error('site footer: <footer class="elementor-location-footer"> not found');
  const language = pageLanguage(html);
  html = html.replace(FOOTER, (footer) => {
    const openTag = footer.match(/^<footer\b[^>]*>/i)[0];
    return footerMarkup(language, markOpenTag(openTag));
  });
  return html.includes(`href="${FOOTER_STYLESHEET}`)
    ? html
    : appendToHead(html, `<link rel="stylesheet" href="${FOOTER_STYLESHEET}">`);
}
