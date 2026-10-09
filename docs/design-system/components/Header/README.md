# Header

The site header: logo on the left, the menu with a Services submenu, the language switch and the "Ai o idee?" button.

Markup: `header.ect-header` with `a.ect-header__logo` (the logo file), then `.ect-header__nav` holding a `nav` with `ul.ect-header__menu` of `li.ect-header__item` and `a.ect-header__link` (a `button` for the Servicii parent, with a caret and `ul.ect-submenu`), the `LanguageSwitch` and a `button.ect-header__burger` for mobile, and last `a.ect-btn ect-btn--header`.

- Menu: Servicii (Creare site web, SEO și vizibilitate în AI, Google Ads, Mentenanță site), Portofoliu, Contact. Items are Montserrat 16px/600 in `slate`, 52px apart, at least 44px tall; hover and the current page turn `orange-logo` with a 3px `orange` underline.
- Submenu: a `white` card, `line-menu` border, `radius-menu`, `shadow-menu`, at least 290px wide; items turn `orange-deep` on `peach-menu`. Focus draws a 2px `orange-deep` outline 3px out.
- Mobile (below 768px): the menu and the button hide; the language switch sits immediately left of the 44px burger. The dropdown lists the same items with `orange-logo` dividers.
- The header is transparent over the page, at least 90px tall; the logo box is 80px wide and 75px tall.

Hand-written from the Elementor header template (post 3359), `ect-pages/service-menu.css` and `scripts/i18n/lang-switcher.mjs`.
