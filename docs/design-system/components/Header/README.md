# Header

The shared header of every page, in three layouts: from 1025px the links sit in a white pill between the logo and the language switch and button; from 768 to 1024px they are plain links with an underline and the switch follows them; up to 767px only the logo and the burger stay.

Markup: `header.ect-header > .ect-header__inner` holding `.ect-header__logo` (the logo image, 72 × 75), `nav.ect-header__nav > ul.ect-header__menu` with one `li.ect-header__item > a.ect-header__link` per item, `.ect-header__end` with a `LanguageSwitch`, `span.ect-header__divider` and `a.ect-btn.ect-btn--header`, and `button.ect-menu-toggle.ect-header__toggle` for phones. "Servicii" opens the `ServicesMenu`: give it `aria-haspopup="true"`, `aria-controls`, `aria-expanded` and a `span.ect-header__chevron`, and put the card in `div.ect-header__submenu` inside its `li`.

The header switches layout on its own full width (container queries named `ect-header` at 1024 and 767px; keep `.ect-header` itself free of padding so the gutters do not shrink the container). On the site it spans the viewport, so these are the Elementor breakpoints.

From 1025px:
- Logo, the menu centred in the free space, then the switch, a 1 × 28 `line` hairline and the button, 20px apart. The row is 90% of the width (5% gutters), at most `header-max`, with vertical padding of 1.8% of the width (about 26px at 1440px), so about 127px tall.
- The menu is a `white` pill with `shadow-card`, 4px padding and 2px between links. Links are `nav` (16/16, 600), capitalised, 44px tall with 18px side padding; a 7px chevron follows "Servicii", 6px away.
- Colours: `slate` at rest, `orange` for the current page. Under the pointer, keyboard focus or the open "Servicii", an `orange` highlight (5px inside the pill, `radius-card` corners) sits behind the link and the label turns `white`. On the site one highlight slides from link to link (0.4s, cubic-bezier(0.32, 1.25, 0.5, 1)) and stays on "Servicii" while its card is open; add `data-pill` to the `li` to show it in a static state. Focus adds a 2px `orange-deep` ring 3px out.
- The chevron turns up while the card is open; the card hangs 12px below the pill, aligned with its left edge, with a transparent bridge so the pointer can cross the gap.

From 768 to 1024px:
- No pill: links are 14/14, 600, `slate`, 30px apart, with a solid 8 × 5 caret 10px after "Servicii". Hover, focus, the open submenu and the current page turn the label `orange-logo` and show a 2px `orange` underline at the bottom of the 44px row.
- The language switch sits 6px after "Contact" in its compact form (2px `orange` outline, `shadow-switch`); the hairline goes and the button keeps the right edge with a 14px label. The submenu drops straight under "Servicii" in its bordered form.

Up to 767px:
- The logo shrinks to 53 × 55 and the burger (`MobileMenu`) takes the right edge; the menu, the switch and the button move into the phone menu.

- The header sits on the hero's own background (it is transparent), so keep the hero light.
- Contrast: `slate` on `white` 5.9:1 passes. `white` on the `orange` highlight (2.4:1), the current page in `orange` (2.4:1) and `orange-logo` on tablet (2.8:1) fail AA for 16 and 14px text; the "Ai o idee?" label, `white` on `orange-logo` at 89% (2.55:1), fails too. All are kept as the site has them.

Hand-written from the Elementor header (post 3359), `desktop-header.css` and `desktop-header.js`, `service-menu.css` and the language switch styles injected by the build.
