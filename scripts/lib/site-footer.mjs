/**
 * The shared site footer (RO, EN and 404): contact details, links, the
 * Bucharest painting. Runs in the second build loop, after the EN pages exist,
 * so the footer never passes through the translation dictionary.
 *
 * The <footer> tag keeps its Elementor attributes (class elementor-3355) because
 * the fixed "back to top" widget is positioned by post-3355.css, and the widget
 * is carried over unchanged. Everything else is rebuilt here from `routes`,
 * `roOrg`/`enOrg`, consent.js and footer-a11y.mjs. Styles: site-footer.css.
 * The approved reference is docs/ui/footer/ (footer.ro.html, footer.en.html).
 */
import { routes } from '../i18n/routes.mjs';
import { roOrg } from '../i18n/meta-ro.mjs';
import { enOrg } from '../i18n/dictionary.mjs';
import { appendToHead, escapeAttr, escapeHtml } from './html.mjs';
import { BACK_TO_TOP, FACEBOOK_URL, LINKEDIN_URL } from './footer-a11y.mjs';
import { PRIVACY_PATHS, consentCopy, pageLanguage } from './privacy.mjs';

export const FOOTER_STYLESHEET = '/wp-content/ect-pages/site-footer.css';
export const FOOTER_MARK = 'data-ect-footer="2"';
const FOOTER = /<footer\b[^>]*\belementor-location-footer\b[^>]*>[\s\S]*?<\/footer>/i;

const LOGO_BASE = '/wp-content/uploads/2024/02/Logo_Echipa_de_Tocilari-e1708028624694';
const ART_BASE = '/wp-content/ect-pages/footer/bucuresti-ateneu';
const COMPANY_LEGAL = 'ECHIPA DE TOCILARI SRL · CUI 47591744 · J40/2298/2023';
const COMPANY_PATHS = ['/despre-noi/', '/portofoliu/', '/contact/'];

const COPY = {
  ro: {
    home: '/',
    logoAlt: 'Logo Echipa de Tocilari',
    tagline: 'Agenție de marketing digital din București: site-uri, magazine online, SEO și reclame, remote în toată România.',
    services: 'Servicii',
    company: 'Companie',
    contact: 'Contact',
    hours: 'Program: luni-duminică',
    country: 'România',
    org: roOrg,
  },
  en: {
    home: '/en/',
    logoAlt: 'Echipa de Tocilari logo',
    tagline: 'Digital marketing agency in Bucharest: websites, online stores, SEO and ads, working remotely across Romania.',
    services: 'Services',
    company: 'Company',
    contact: 'Contact',
    hours: 'Hours: Monday-Sunday',
    country: 'Romania',
    org: enOrg,
  },
};

const SOCIAL_ICONS = {
  facebook: 'M400 32H48A48 48 0 0 0 0 80v352a48 48 0 0 0 48 48h137.25V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.27c-30.81 0-40.42 19.12-40.42 38.73V256h68.78l-11 71.69h-57.78V480H400a48 48 0 0 0 48-48V80a48 48 0 0 0-48-48z',
  linkedin: 'M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z',
};

const ARROW_UP = 'M34.9 289.5l-22.2-22.2c-9.4-9.4-9.4-24.6 0-33.9L207 39c9.4-9.4 24.6-9.4 33.9 0l194.3 194.3c9.4 9.4 9.4 24.6 0 33.9L413 289.4c-9.5 9.5-25 9.3-34.3-.4L264 168.6V456c0 13.3-10.7 24-24 24h-32c-13.3 0-24-10.7-24-24V168.6L69.2 289.1c-9.3 9.8-24.8 10-34.3.4z';

const svg = (path) => `<svg aria-hidden="true" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg"><path d="${path}"></path></svg>`;

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

/** 0750 203 466 from +40750203466. */
function displayPhone(telephone) {
  const national = telephone.replace(/^\+40/, '0');
  return `${national.slice(0, 4)} ${national.slice(4, 7)} ${national.slice(7)}`;
}

/** The footer element for one language; `openTag` is the existing opening tag, already marked. */
export function footerMarkup(language, openTag, year = new Date().getFullYear()) {
  const copy = COPY[language];
  const { org } = copy;
  const consent = consentCopy()[language];
  const has = (route) => Boolean(route[language]);
  const serviceRoutes = routes.filter((route) => route.service && has(route));
  const companyRoutes = COMPANY_PATHS.map((ro) => {
    const route = routes.find((item) => item.ro === ro);
    if (!route) throw new Error(`site footer: route ${ro} not found`);
    return route;
  }).filter(has);
  const tel = org.telephone;
  const { streetAddress, addressLocality, postalCode } = org.address;
  const address = `${streetAddress}, ${addressLocality}, ${postalCode}, ${copy.country}`;
  const { opens, closes } = org.openingHours;
  const logo = escapeAttr(LOGO_BASE);
  return `${openTag}
 <div class="ect-footer__inner">
  <div class="ect-footer__top">
   <div class="ect-footer__brand">
    <a class="ect-footer__logo" href="${escapeAttr(copy.home)}"><img src="${logo}.webp" srcset="${logo}-288x300.webp 288w, ${logo}-768x799.webp 768w, ${logo}.webp 836w" sizes="(max-width: 767px) 140px, 115px" width="836" height="870" alt="${escapeAttr(copy.logoAlt)}" loading="lazy" decoding="async"></a>
    <p class="ect-footer__tagline">${escapeHtml(copy.tagline)}</p>
    <ul class="ect-footer__social">
     <li><a href="${FACEBOOK_URL}" aria-label="Facebook">${svg(SOCIAL_ICONS.facebook)}</a></li>
     <li><a href="${LINKEDIN_URL}" aria-label="LinkedIn">${svg(SOCIAL_ICONS.linkedin)}</a></li>
    </ul>
   </div>
   <nav class="ect-footer__col ect-footer__col--services" aria-label="${escapeAttr(copy.services)}"><p class="ect-footer__label">${escapeHtml(copy.services)}</p>${list(serviceRoutes, language)}</nav>
   <nav class="ect-footer__col ect-footer__col--company" aria-label="${escapeAttr(copy.company)}"><p class="ect-footer__label">${escapeHtml(copy.company)}</p>${list(companyRoutes, language)}</nav>
   <div class="ect-footer__col ect-footer__col--contact"><p class="ect-footer__label">${escapeHtml(copy.contact)}</p><address class="ect-footer__contact"><a href="tel:${escapeAttr(tel)}">${escapeHtml(displayPhone(tel))}</a><a href="mailto:contact@echipadetocilari.ro">contact@echipadetocilari.ro</a><span>${escapeHtml(address)}</span></address></div>
  </div>
  <p class="ect-footer__status"><span class="ect-footer__dot" aria-hidden="true"></span>${escapeHtml(`${copy.hours}, ${opens}-${closes}`)}</p>
  <div class="ect-footer__bottom">
   <p class="ect-footer__company">© ${year} ${escapeHtml(COMPANY_LEGAL)}</p>
   <ul class="ect-footer__legal"><li><a href="${escapeAttr(PRIVACY_PATHS[language])}" data-ect-footer-privacy>${escapeHtml(consent.footerPolicy)}</a></li><li><button type="button" class="ect-consent-open" data-ect-consent-open hidden>${escapeHtml(consent.footerSettings)}</button></li></ul>
  </div>
 </div>
 <div class="ect-footer__art" aria-hidden="true"><img src="${ART_BASE}-1280.webp" srcset="${ART_BASE}-640.webp 640w, ${ART_BASE}-1280.webp 1280w, ${ART_BASE}-2000.webp 2000w" sizes="(max-width: 692px) 540px, 100vw" width="2000" height="667" alt="" loading="lazy" decoding="async"></div>
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
export function renderSiteFooter(html, { year = new Date().getFullYear() } = {}) {
  if (html.includes(FOOTER_MARK)) return html;
  if (!FOOTER.test(html)) throw new Error('site footer: <footer class="elementor-location-footer"> not found');
  const language = pageLanguage(html);
  html = html.replace(FOOTER, (footer) => {
    const openTag = footer.match(/^<footer\b[^>]*>/i)[0];
    return footerMarkup(language, markOpenTag(openTag), year);
  });
  return html.includes(`href="${FOOTER_STYLESHEET}`)
    ? html
    : appendToHead(html, `<link rel="stylesheet" href="${FOOTER_STYLESHEET}">`);
}
