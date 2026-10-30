# Footer

The shared footer: the logo, the company details, the "PAGINI IMPORTANTE" list with the cookie settings, then a hairline and the social links with the copyright line.

Markup: `footer.ect-footer` with `.ect-footer__top` (three columns: `.ect-footer__logo`, `.ect-footer__info`, `.ect-footer__links`) and `.ect-footer__bottom` (`p.ect-footer__follow` with `ul.ect-footer__social`, and `p.ect-footer__copy`). The links column holds `p > strong` for the heading and `p.ect-footer__list` with the links and a `button.ect-consent-open` ("Setări cookie-uri") that reopens the `CookieConsent` banner.

- Columns sit in a row `contact-max` wide, 50px apart and centred vertically; the logo is 115px wide in the first column.
- Company details are 16px on 27.2px, `ink`, with the company name and the site and email values in 700. Links are `footer-link` (16/32) on 44px rows, `ink`, `orange` on hover.
- The bottom row starts 50px under a 1px `line` rule: "Urmărește-ne pe:" (16/19.2) with the Facebook and LinkedIn marks (22px, `orange`, `accent` on hover), and "© 2026 Drepturi rezervate" (14/16.8, capitalised).
- From 1024px down the text drops to 15px; up to 767px the columns stack and the bottom row centres.
- Every link and the cookie button keep a 44px row. Label the social links (`aria-label="Facebook"`) since they are icons only.

Hand-written from the Elementor footer (post 3355) and the footer rules in `consent.css`.
