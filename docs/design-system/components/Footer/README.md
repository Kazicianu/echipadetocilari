# Footer

The shared footer, in the Leedlime style: logo, tagline and social links, three link columns (Servicii, Companie, Contact), the opening hours with an orange dot, the legal line, and the painting of Bucharest (the Romanian Athenaeum) across the full width of the screen at the bottom.

Markup: `footer.ect-footer` (keeps the Elementor classes `elementor-3355 elementor-location-footer` so the fixed "back to top" widget keeps its position) with `.ect-footer__inner` (`.ect-footer__top` grid: `.ect-footer__brand`, two `nav.ect-footer__col` and `.ect-footer__col--contact` with an `address`; then `p.ect-footer__status` and `.ect-footer__bottom` with the company line and `ul.ect-footer__legal`) and `.ect-footer__art` (decorative `img`, `alt=""`, inside an `aria-hidden` container).

- Content is `contact-max` (1200px) wide with a 20px gutter; the white background and the painting run edge to edge. Fonts and colours: Montserrat, `ink`, `ink-muted` (#55555e), `orange` for hover and the status dot.
- Column labels are 12px uppercase paragraphs, not headings. Links are 15px on 44px rows; the legal links and the social icons are 44px targets too.
- Mobile first: brand on top, Servicii and Companie in two columns, Contact below, legal links above the company line, all centred. From 768px the columns sit in one row under the brand; from 1025px brand and the three columns share one row.
- The painting is 220px high on phones and `26vw` (max 720px) on larger screens, anchored to the bottom (`object-position: 53% 100%`), with a 35% white gradient over its top so it blends into the page.
- `button.ect-consent-open` ("Setări cookie-uri") is hidden until `consent.js` runs and then reopens the `CookieConsent` banner.

Source of truth: `legacy-mirror/wp-content/ect-pages/site-footer.css` and `scripts/lib/site-footer.mjs`; the approved previews and screenshots are in `docs/ui/footer/`. The preview here hides the fixed back-to-top widget (see `BackToTop`).
