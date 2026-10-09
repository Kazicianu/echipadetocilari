/**
 * RO|EN switcher, injected into the Elementor header on both languages.
 *
 * It lives in the header's normal flow, never `position:fixed` — fixed overlays
 * fought the logo, the CTA and the mobile scroll-to-top button. On mobile the
 * chip must sit immediately left of the burger, which is why the nav widget's
 * container is forced to a flex row with explicit `order` (Elementor sets
 * `margin-left:auto` on the toggle, which would otherwise split the pair).
 */

const STYLES = `
<style id="ect-lang-css">
/* RO|EN chip — always immediately LEFT of the burger on mobile */
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
  /* Logo left — chip+burger tight group on the right */
  .elementor-location-header .e-con-inner > .elementor-widget-nav-menu{
    margin-left:auto !important;
    flex:0 0 auto !important;
    width:auto !important;
    max-width:none !important;
  }
  .elementor-location-header .elementor-widget-nav-menu .elementor-widget-container{
    justify-content:flex-end;
    gap:0;
  }
  .elementor-location-header .elementor-nav-menu--main{
    display:none !important;
  }
  .elementor-location-header .ect-lang-wrap{
    order:1 !important;
    margin:0 .3rem 0 0 !important;
  }
  .elementor-location-header .elementor-menu-toggle{
    order:2 !important;
    margin-left:0 !important;
    margin-right:0 !important;
  }
  #ect-lang-switch a{min-width:44px;min-height:44px;padding:0 .5rem;font-size:11px}
}
</style>
`;

/** Remove switchers (and stray menu entries) left by any earlier build shape. */
function stripPrevious(html) {
  return html
    .replace(/<!-- language switcher[\s\S]*?<\/nav>\s*/gi, '')
    .replace(/<style id="ect-lang-css">[\s\S]*?<\/style>\s*/gi, '')
    .replace(/<nav id="ect-lang-switch"[\s\S]*?<\/nav>\s*/gi, '')
    .replace(/<div id="ect-lang-switch"[\s\S]*?<\/div>\s*/gi, '')
    .replace(
      /<(?:div|span) class="(?:elementor-element )?ect-lang-wrap[^"]*"[\s\S]*?<\/nav>\s*<\/(?:div|span)>\s*/gi,
      ''
    )
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
 * @param {string} enHref
 */
export function injectLangSwitcher(html, currentLang, roHref, enHref) {
  const wrap = `
<span class="ect-lang-wrap">
<nav id="ect-lang-switch" aria-label="Language">
  <a href="${roHref}" hreflang="ro" lang="ro" ${currentLang === 'ro' ? 'aria-current="true"' : ''} title="RO">RO</a>
  <a href="${enHref}" hreflang="en" lang="en" ${currentLang === 'en' ? 'aria-current="true"' : ''} title="EN">EN</a>
</nav>
</span>
`;

  html = stripPrevious(html);

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
    html = html.replace(/<\/head>/i, `${STYLES}</head>`);
  }

  return html;
}
