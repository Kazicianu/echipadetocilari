/**
 * RO|EN switcher, injected into the Elementor header on every page.
 *
 * The desktop chip lives in the header's normal flow. In the mobile layout,
 * language links are available inside the expanding menu instead of the chip.
 */

import { routes } from './routes.mjs';

const STYLES = `
<style id="ect-lang-css">
/* RO|EN chip in the desktop header */
.ect-lang-wrap{
  display:inline-flex !important;
  align-items:center;
  flex:0 0 auto;
  width:auto !important;
  max-width:none !important;
  margin:0;
  padding:0;
  z-index:6;
  line-height:1;
}
#ect-lang-switch{
  position:relative;
  font-family:Montserrat,system-ui,sans-serif;
  display:inline-flex;
  align-items:center;
  background:#fff;
  border:2px solid #fd8649;
  border-radius:999px;
  overflow:hidden;
  box-shadow:0 2px 10px rgba(0,0,0,.08);
  line-height:1;
}
#ect-lang-switch a{
  display:inline-flex;align-items:center;justify-content:center;
  min-width:44px;min-height:44px;padding:0 .65rem;
  font-size:12px;font-weight:700;letter-spacing:.04em;
  text-decoration:none;color:#fd8649;background:transparent;
  transition:background .15s,color .15s;
}
#ect-lang-switch a[aria-current="true"]{background:#fd8649;color:#fff}
#ect-lang-switch a:hover{background:#ff6c2a;color:#fff}
#ect-lang-switch a + a{border-left:1px solid rgba(253,134,73,.35)}

/* Shared: nav widget container is a flex row; chip order BEFORE burger */
.elementor-location-header .elementor-widget-nav-menu .elementor-widget-container{
  display:flex !important;
  flex-direction:row !important;
  flex-wrap:wrap;
  align-items:center;
}
.elementor-location-header .ect-lang-wrap{
  order:1 !important; /* left of burger */
  margin:0 .35rem 0 0 !important;
}
.elementor-location-header .elementor-menu-toggle{
  order:2 !important; /* right of chip */
  margin-left:0 !important; /* Elementor default is ml:auto — separates them */
}
.elementor-location-header .elementor-nav-menu--dropdown{
  order:3 !important;
  flex:1 0 100%;
  width:100%;
}

@media (min-width:768px){
  .elementor-location-header .elementor-widget-nav-menu .elementor-nav-menu--main{
    order:0 !important;
    flex:1 1 auto;
  }
  .elementor-location-header .ect-lang-wrap{
    margin:0 .5rem 0 .35rem !important;
  }
}

@media (max-width:767px){
  /* Shared mobile header alignment is owned by mobile-menu.css. */
  .elementor-location-header .ect-lang-wrap{
    display:none !important;
  }
  .elementor-location-header .elementor-menu-toggle{
    order:2 !important;
    margin-left:0 !important;
    margin-right:0 !important;
  }
}

/* Language switch motion (desktop chip): an orange drop drawn over the links.
   At rest it covers the current half; on a switch it stretches toward the chosen
   language (245ms, on the page you leave) and settles with a small wobble
   (475ms, on the new page). The classes on <html> come from #ect-lang-js. */
#ect-lang-switch .ect-lang-liquid{position:absolute;inset:0;z-index:1;display:flex;pointer-events:none;background:#fd8649;color:#fff;clip-path:inset(0 44px 0 0 round 22px)}
#ect-lang-switch .ect-lang-liquid[data-active="en"]{clip-path:inset(0 0 0 44px round 22px)}
#ect-lang-switch .ect-lang-liquid>span{display:flex;align-items:center;justify-content:center;flex:0 0 44px;width:44px;height:44px;font-size:12px;font-weight:700;letter-spacing:.04em;line-height:1}
html.ect-lang-anim #ect-lang-switch a{background:transparent!important;color:#5b6575!important;transition:none!important}
/* At rest a focused link sits above the drop, so its keyboard ring shows whole; while it moves, the drop's labels stay on top. */
html:not(.ect-lang-anim) #ect-lang-switch a:focus-visible{position:relative;z-index:2}
/* Hover (on devices that hover) or keyboard focus on the other language: the drop leans about 10px toward it. */
#ect-lang-switch:has(a[lang="en"]:not([aria-current="true"]):focus-visible) .ect-lang-liquid{clip-path:inset(2px 34px 2px 0 round 20px)}
#ect-lang-switch:has(a[lang="ro"]:not([aria-current="true"]):focus-visible) .ect-lang-liquid{clip-path:inset(2px 0 2px 34px round 20px)}
@media (hover:hover){
#ect-lang-switch:has(a[lang="en"]:not([aria-current="true"]):hover) .ect-lang-liquid{clip-path:inset(2px 34px 2px 0 round 20px)}
#ect-lang-switch:has(a[lang="ro"]:not([aria-current="true"]):hover) .ect-lang-liquid{clip-path:inset(2px 0 2px 34px round 20px)}
}
/* It leans out in .26s and springs back in .42s; with reduced motion it simply changes. */
@media (prefers-reduced-motion:no-preference){
#ect-lang-switch .ect-lang-liquid{transition:clip-path .42s cubic-bezier(.34,1.56,.64,1)}
#ect-lang-switch:has(a:not([aria-current="true"]):is(:hover,:focus-visible)) .ect-lang-liquid{transition-duration:.26s;transition-timing-function:cubic-bezier(.3,0,.3,1)}
}
/* While the switch runs nothing transitions, and the stretch has no fixed start: it leaves from wherever the drop is, at rest or leaning. */
html.ect-lang-anim #ect-lang-switch .ect-lang-liquid{transition:none!important}
html.ect-lang-anim.ect-lang-leave #ect-lang-switch .ect-lang-liquid{animation:ect-lang-stretch .245s cubic-bezier(.6,0,.4,1) both}
html.ect-lang-anim.ect-lang-arrive.ect-lang-to-en #ect-lang-switch .ect-lang-liquid{animation:ect-lang-settle-en .475s both}
html.ect-lang-anim.ect-lang-arrive.ect-lang-to-ro #ect-lang-switch .ect-lang-liquid{animation:ect-lang-settle-ro .475s both}
@keyframes ect-lang-stretch{to{clip-path:inset(3px 0 3px 0 round 19px)}}
@keyframes ect-lang-settle-en{
  0%{clip-path:inset(3px 0 3px 0 round 19px);animation-timing-function:cubic-bezier(.7,0,.3,1)}
  39.4%{clip-path:inset(0 0 0 49px round 22px);animation-timing-function:cubic-bezier(.3,0,.3,1)}
  63.6%{clip-path:inset(1px 0 1px 41px round 21px);animation-timing-function:ease-in-out}
  83.3%{clip-path:inset(0 0 0 45.5px round 22px);animation-timing-function:ease-out}
  100%{clip-path:inset(0 0 0 44px round 22px)}
}
@keyframes ect-lang-settle-ro{
  0%{clip-path:inset(3px 0 3px 0 round 19px);animation-timing-function:cubic-bezier(.7,0,.3,1)}
  39.4%{clip-path:inset(0 49px 0 0 round 22px);animation-timing-function:cubic-bezier(.3,0,.3,1)}
  63.6%{clip-path:inset(1px 41px 1px 0 round 21px);animation-timing-function:ease-in-out}
  83.3%{clip-path:inset(0 45.5px 0 0 round 22px);animation-timing-function:ease-out}
  100%{clip-path:inset(0 44px 0 0 round 22px)}
}
/* Page change: a short cross-fade, only for language switches (#ect-lang-js skips every other navigation). */
@media (prefers-reduced-motion:no-preference){@view-transition{navigation:auto}}
#ect-lang-switch{view-transition-name:ect-lang}
::view-transition-old(root),::view-transition-new(root){animation-duration:.32s}
::view-transition-group(ect-lang){animation-duration:.32s}
::view-transition-old(ect-lang){animation:none;opacity:0}
::view-transition-new(ect-lang){animation:none}
</style>
`;

/** Inline script (runs in <head>, before the body) that drives the classes the motion CSS keys on. */
export const LANG_SWITCH_SCRIPT = `(() => {
  const root = document.documentElement;
  const from = ((document.currentScript && document.currentScript.dataset.from) || '').split(' ').filter(Boolean);
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  const STATES = ['ect-lang-anim', 'ect-lang-leave', 'ect-lang-arrive', 'ect-lang-to-ro', 'ect-lang-to-en'];
  const reset = () => root.classList.remove(...STATES);
  const settled = () => { if (root.classList.contains('ect-lang-arrive')) reset(); };
  let leaving = false;

  // Arrival through the switch: the referrer is this page's counterpart in the other language.
  try {
    const entry = performance.getEntriesByType('navigation')[0];
    // Plain string handling on purpose: the build lowercases the URL constructor call in page scripts, which breaks it.
    const ref = document.referrer;
    const path = ref.startsWith(location.origin + '/') ? ref.slice(location.origin.length).split(/[?#]/)[0] : '';
    if (!still.matches && path && from.includes(path) && (!entry || entry.type === 'navigate')) {
      root.classList.add('ect-lang-anim', 'ect-lang-arrive', 'ect-lang-to-' + (/^en/i.test(root.lang) ? 'en' : 'ro'));
      document.addEventListener('animationend', event => { if (/^ect-lang-settle/.test(event.animationName)) settled(); });
      setTimeout(settled, 2000);
    }
  } catch (error) { reset(); }

  // Only a language switch gets a view transition; every other link stays instant.
  // A skipped transition rejects its ready promise; catch it so the console stays clean.
  const skip = transition => {
    if (transition.ready && transition.ready.catch) transition.ready.catch(() => {});
    transition.skipTransition();
  };
  addEventListener('pagereveal', event => {
    if (root.classList.contains('ect-lang-leave')) { reset(); leaving = false; }
    if (event.viewTransition && !root.classList.contains('ect-lang-arrive')) skip(event.viewTransition);
  });
  addEventListener('pageswap', event => {
    if (event.viewTransition && !root.classList.contains('ect-lang-leave')) skip(event.viewTransition);
  });
  addEventListener('pageshow', event => { if (event.persisted) { reset(); leaving = false; } });

  document.addEventListener('click', event => {
    const link = event.target.closest && event.target.closest('#ect-lang-switch a[href], a.ect-mobile-menu-footer-link[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if ((link.target && link.target !== '_self') || link.getAttribute('aria-current') === 'true' || still.matches) return;
    if (leaving) { event.preventDefault(); return; }
    reset();
    root.classList.add('ect-lang-leave', 'ect-lang-to-' + (link.lang === 'en' ? 'en' : 'ro'));
    const chip = link.closest('#ect-lang-switch');
    // In the phone menu, mobile-menu.js closes the menu and then navigates.
    if (!chip || !chip.offsetWidth || !chip.querySelector('.ect-lang-liquid')) return;
    event.preventDefault();
    leaving = true;
    root.classList.add('ect-lang-anim');
    const prefetch = document.createElement('link');
    prefetch.rel = 'prefetch';
    prefetch.href = link.href;
    document.head.append(prefetch);
    setTimeout(() => location.assign(link.href), 245);
  }, true);
})();`;

/** Remove switchers (and stray menu entries) left by any earlier build shape. */
function stripPrevious(html) {
  return html
    .replace(/<!-- language switcher[\s\S]*?<\/nav>\s*/gi, '')
    .replace(/<style id="ect-lang-css">[\s\S]*?<\/style>\s*/gi, '')
    .replace(/<script id="ect-lang-js"[\s\S]*?<\/script>\s*/gi, '')
    .replace(
      /<(?:div|span) class="(?:elementor-element )?ect-lang-wrap[^"]*"[\s\S]*?<\/nav>\s*<\/(?:div|span)>\s*/gi,
      ''
    )
    .replace(/<nav id="ect-lang-switch"[\s\S]*?<\/nav>\s*/gi, '')
    .replace(/<div id="ect-lang-switch"[\s\S]*?<\/div>\s*/gi, '')
    .replace(/<li class="menu-item[^"]*ect-lang-menu[^"]*"[\s\S]*?<\/li>\s*/gi, '')
    .replace(
      /<li class="menu-item[^"]*"[\s\S]*?<a[^>]*>\s*(Română|Romana|English)\s*<\/a>\s*<\/li>\s*/gi,
      ''
    );
}

/**
 * @param {string} html
 * @param {'ro'|'en'} currentLang
 * @param {string} roHref
 * @param {string} [enHref] Omitted for a Romanian-only page, whose EN link
 *   names the English homepage instead of implying a translation.
 */
export function injectLangSwitcher(html, currentLang, roHref, enHref) {
  const english = enHref
    ? `<a href="${enHref}" hreflang="en" lang="en" ${currentLang === 'en' ? 'aria-current="true"' : ''} title="EN">EN</a>`
    : '<a href="/en/" hreflang="en" lang="en" title="English homepage" aria-label="EN: English homepage">EN</a>';
  const wrap = `
<span class="ect-lang-wrap">
<nav id="ect-lang-switch" aria-label="Language">
  <a href="${roHref}" hreflang="ro" lang="ro" ${currentLang === 'ro' ? 'aria-current="true"' : ''} title="RO">RO</a>
  ${english}
  <span class="ect-lang-liquid" data-active="${currentLang}" aria-hidden="true"><span>RO</span><span>EN</span></span>
</nav>
</span>
`;

  html = stripPrevious(html);

  // Pathnames a visitor can come from through this switch: the counterpart(s) in the other language.
  const roOnly = routes.filter((route) => !route.en).map((route) => route.ro);
  const from = currentLang === 'en'
    ? (roHref === '/' ? ['/', ...roOnly] : [roHref])
    : (enHref ? [enHref] : []);

  // Anchor the chip immediately before the burger toggle so the two stay glued.
  // Fallbacks cover header variants that render the CTA button instead.
  const toggleRe = /(<div class="elementor-menu-toggle"[^>]*>)/i;
  const ctaRe = /(<div class="elementor-element elementor-element-682f9a60\b)/i;

  if (toggleRe.test(html)) {
    html = html.replace(toggleRe, `${wrap}$1`);
  } else if (ctaRe.test(html)) {
    html = html.replace(ctaRe, `${wrap}$1`);
  } else {
    html = html.replace(/<\/header>/i, `${wrap}</header>`);
  }

  if (!html.includes('id="ect-lang-css"')) {
    const script = `<script id="ect-lang-js" data-from="${from.join(' ')}">${LANG_SWITCH_SCRIPT}</script>\n`;
    html = html.replace(/<\/head>/i, `${STYLES}${script}</head>`);
  }

  return html;
}
