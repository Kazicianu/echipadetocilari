# MobileMenu

The phone menu: a round toggle in the header that opens a full-height white panel with every page and the language links.

Markup: the toggle is `button.ect-menu-toggle` with `aria-expanded`, `aria-controls` and an `aria-label` that names the action ("Deschide meniul" / "Închide meniul"); inside, `span.ect-menu-toggle__icon` with two empty spans (the bars). The panel is `.ect-mobile-menu` (a `<dialog>` on the site) holding the toggle again, `ul.ect-mobile-menu__links` of `a.ect-mobile-menu__link`, and `.ect-mobile-menu__footer` with `a.ect-mobile-menu__lang` for RO and EN.

- Closed, the toggle is a 48px `white` disc with two 23px `orange-logo` bars, 7px apart; open, the disc fills `orange-logo` and the bars turn `white` and cross into an X.
- The panel grows out of the toggle (a rounded clip that widens with the toggle, about 0.5s, links following 35ms apart) to min(460px, the screen minus 40px) wide, centred with 20px gutters, from the toggle's top to 16px above the bottom of the screen (at most 800px). It is `white` with `radius-panel` corners and 24px padding; the list starts 72px down, under the toggle, and scrolls if the screen is short. Links are `nav-mobile` (20/25, 500, -0.3px) in `ink`, 8px apart, each at least 44px tall.
- Mark the current page with `aria-current="page"`: `orange-hot`, 600, a 2px underline. The current language is `orange`, 600, underlined; the other is `ink-muted`.
- Hover and focus turn links `orange-deep`; the focus ring is 2px `orange-deep`, 4px inside the link (white on the open toggle).
- List the pages in this order: Acasă, the seven services in the order of the `ServicesMenu`, Portofoliu, Contact.
- Contrast: the current link is `orange-hot` on `white` (3.2:1), below AA for 20px text at 600; kept as the site has it, the underline carries the state too.

Hand-written from `mobile-menu.css` and the dialog markup `mobile-menu.js` builds.
